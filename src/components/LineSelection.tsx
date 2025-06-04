import React from 'react';
import type { LineType, LineTypeInfo } from '../types';

interface LineSelectionProps {
  onLineSelect: (lineType: LineType) => void;
}

const LineSelection: React.FC<LineSelectionProps> = ({ onLineSelect }) => {
  const lineTypes: LineTypeInfo[] = [
    {
      id: 'cable',
      name: 'Draht & Kabel CV Linie',
      description: 'Komplette SIKORA Produktionslinie für die Draht- und Kabelherstellung mit Röntgen-, Laser- und Spark-Technologie',
      image: '/api/assets/images/x_ray_6000/x-ray_6070_pro.jpeg',
      color: 'sikora-gray',
    },
    // Die anderen Linien sind in der Datenbank nicht verfügbar
    {
      id: 'tube',
      name: 'Rohr- & Schlauchlinie',
      description: 'Verfügbar in der vollständigen Version mit CENTERWAVE Technologie (derzeit nicht geladen)',
      image: '/api/placeholder/400/250',
      color: 'sikora-pipe-blue',
    },
    {
      id: 'fiber',
      name: 'Glasfaserlinie', 
      description: 'Verfügbar in der vollständigen Version mit FIBER Technologie (derzeit nicht geladen)',
      image: '/api/placeholder/400/250',
      color: 'sikora-plastic-green',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hauptinhalt */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Titel */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-sikora-blue mb-4">
            SIKORA Digital Showroom
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Entdecken Sie die umfassende SIKORA Produktpalette für die Kabel-, Rohr- und Glasfaserproduktion. 
            Wählen Sie eine Produktionslinie aus, um mit der interaktiven Konfiguration zu beginnen.
          </p>
        </div>

        {/* Linienkarten */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lineTypes.map((lineType) => {
            const isAvailable = lineType.id === 'cable';
            
            return (
              <div
                key={lineType.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform ${
                  isAvailable 
                    ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer group' 
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => isAvailable && onLineSelect(lineType.id)}
              >
                {/* Bild */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={lineType.image}
                    alt={lineType.name}
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      isAvailable ? 'group-hover:scale-105' : ''
                    }`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `/api/placeholder/400/250`;
                    }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-300 ${
                    isAvailable ? 'opacity-0 group-hover:opacity-100' : 'opacity-30'
                  }`} />
                  
                  {/* Verfügbarkeits-Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                    isAvailable
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}>
                    {isAvailable ? 'Verfügbar' : 'Demnächst'}
                  </div>
                </div>

                {/* Inhalt */}
                <div className="p-6">
                  <h3 className={`text-xl font-bold mb-3 transition-colors duration-200 ${
                    isAvailable 
                      ? 'text-sikora-blue group-hover:text-sikora-cyan' 
                      : 'text-gray-500'
                  }`}>
                    {lineType.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {lineType.description}
                  </p>

                  {/* Produktanzahl für verfügbare Linie */}
                  {isAvailable && (
                    <div className="mt-4 text-xs text-sikora-blue bg-blue-50 px-3 py-2 rounded-lg">
                      <strong>60+ SIKORA Produkte</strong> • 4 Messpunkte • Vollständige 3D-Visualisierung
                    </div>
                  )}

                  {/* Aktions-Bereich */}
                  <div className="mt-6 flex justify-end">
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        isAvailable
                          ? 'bg-sikora-blue text-white hover:bg-sikora-cyan group-hover:scale-105 transform'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAvailable) {
                          onLineSelect(lineType.id);
                        }
                      }}
                      disabled={!isAvailable}
                    >
                      {isAvailable ? 'Linie erkunden' : 'Nicht verfügbar'}
                    </button>
                  </div>
                </div>

                {/* Hover-Indikator */}
                {isAvailable && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sikora-blue to-sikora-cyan transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                )}
              </div>
            );
          })}
        </div>

        {/* Technologie-Übersicht für verfügbare Linie */}
        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-6xl mx-auto">
            <h3 className="text-2xl font-semibold text-sikora-blue mb-6 text-center">
              Verfügbare SIKORA Technologien
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-sikora-blue mb-2">X-RAY</div>
                <div className="text-sm text-gray-600">Röntgenmesssysteme</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-sikora-blue mb-2">LASER</div>
                <div className="text-sm text-gray-600">Lasermesssysteme</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-sikora-blue mb-2">SPARK</div>
                <div className="text-sm text-gray-600">Hochspannungstester</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-sikora-blue mb-2">CONTROL</div>
                <div className="text-sm text-gray-600">Steuerungssysteme</div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600 leading-relaxed">
                Entdecken Sie über 60 präzise SIKORA Messtechnologien für die professionelle Kabel- und Drahtproduktion.
                Von der Durchmessermessung bis zur Qualitätskontrolle - alles aus einer Hand.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineSelection; 