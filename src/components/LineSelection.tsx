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
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Hauptinhalt - Vollbreite mit responsive Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 sm:py-12">
        {/* Titel - Responsive Textgrößen */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-sikora-blue mb-3 sm:mb-4">
            SIKORA Digital Showroom
          </h2>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed px-4">
            Entdecken Sie die umfassende SIKORA Produktpalette für die Kabel-, Rohr- und Glasfaserproduktion.
            Wählen Sie eine Produktionslinie aus, um mit der interaktiven Konfiguration zu beginnen.
          </p>
        </div>

        {/* Linienkarten - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-none">
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
                {/* Bild - Responsive Höhe */}
                <div className="relative h-40 sm:h-48 lg:h-52 xl:h-56 bg-gray-200 overflow-hidden">
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

                  {/* Verfügbarkeits-Badge - Responsive */}
                  <div className={`absolute top-3 sm:top-4 right-3 sm:right-4 px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                    isAvailable
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}>
                    {isAvailable ? 'Verfügbar' : 'Demnächst'}
                  </div>
                </div>

                {/* Inhalt - CP Design konform */}
                <div className="p-4 sm:p-6">
                  <h3 className={`text-lg sm:text-xl lg:text-2xl font-futura font-medium mb-2 sm:mb-3 transition-colors duration-200 ${
                    isAvailable
                      ? 'text-sikora-blue group-hover:text-sikora-cyan'
                      : 'text-gray-500'
                  }`}>
                    {lineType.name}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm lg:text-base leading-relaxed font-futura font-light">
                    {lineType.description}
                  </p>

                  {/* Produktanzahl für verfügbare Linie */}
                  {isAvailable && (
                    <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-sikora-blue bg-blue-50 px-2 sm:px-3 py-2 rounded-lg font-futura">
                      <strong className="sikora-product-name">60+ SIKORA Produkte</strong> • 4 Messpunkte • Vollständige 3D-Visualisierung
                    </div>
                  )}

                  {/* Aktions-Bereich */}
                  <div className="mt-4 sm:mt-6 flex justify-end">
                    <button
                      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-futura font-medium rounded-md transition-all duration-200 ${
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

        {/* Technologie-Übersicht - Responsive Layout */}
        <div className="mt-12 sm:mt-16">
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 w-full">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-sikora-blue mb-4 sm:mb-6 text-center">
              Verfügbare SIKORA Technologien
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 text-center">
              <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-sikora-blue mb-1 sm:mb-2">X-RAY</div>
                <div className="text-xs sm:text-sm text-gray-600">Röntgenmesssysteme</div>
              </div>
              <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-sikora-blue mb-1 sm:mb-2">LASER</div>
                <div className="text-xs sm:text-sm text-gray-600">Lasermesssysteme</div>
              </div>
              <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-sikora-blue mb-1 sm:mb-2">SPARK</div>
                <div className="text-xs sm:text-sm text-gray-600">Hochspannungstester</div>
              </div>
              <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-sikora-blue mb-1 sm:mb-2">CONTROL</div>
                <div className="text-xs sm:text-sm text-gray-600">Steuerungssysteme</div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base lg:text-lg px-4">
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
