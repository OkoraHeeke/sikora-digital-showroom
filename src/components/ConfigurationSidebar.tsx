import React from 'react';
import { ArrowLeft, Home, CheckCircle, AlertCircle, MapPin, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { MeasurePoint, LineType, Scene, Product } from '../types';

interface ConfigurationSidebarProps {
  scene: Scene | null;
  lineType: LineType | null;
  measurePoints: MeasurePoint[];
  products: Product[];
  configuration: Record<string, string>;
  selectedMeasurePoint: string | null;
  onBackToLineSelection: () => void;
  onMeasurePointSelect: (measurePointId: string) => void;
  onProductSelect?: (productName: string) => void;
  onConfigureProduct?: (measurePointId: string, productName: string) => void;
}

const ConfigurationSidebar: React.FC<ConfigurationSidebarProps> = ({
  scene,
  lineType,
  measurePoints,
  products,
  configuration,
  selectedMeasurePoint,
  onBackToLineSelection,
  onMeasurePointSelect,
  onProductSelect,
  onConfigureProduct,
}) => {
  const { language, t } = useLanguage();

  // Berechne den Konfigurationsstatus
  const configuredCount = Object.keys(configuration).length;
  const totalCount = measurePoints.length;
  const progressPercentage = totalCount > 0 ? (configuredCount / totalCount) * 100 : 0;

  // Linientyp-Informationen
  const getLineTypeInfo = (type: LineType | null, sceneName?: string) => {
    if (sceneName) {
      return {
        name: language === 'de' ? scene?.Name_DE || sceneName : scene?.Name_EN || sceneName,
        description: t(
          'lineDescription', 
          'SIKORA Produktionslinie mit vollständiger Messtechnik-Integration',
          'SIKORA production line with complete measurement technology integration'
        ),
      };
    }
    
    switch (type) {
      case 'cable':
        return {
          name: t('cableLineName', 'Draht & Kabel CV Linie', 'Wire & Cable CV Line'),
          description: t(
            'cableLineDescription',
            'Für die Herstellung von Datenkabeln, Automobilleitungen und Installationskabeln',
            'For manufacturing data cables, automotive cables and installation cables'
          ),
        };
      case 'tube':
        return {
          name: t('tubeLineName', 'Rohr- & Schlauchlinie', 'Pipe & Tube Line'),
          description: t(
            'tubeLineDescription',
            'Für die Herstellung von Kunststoffrohren und -schläuchen',
            'For manufacturing plastic pipes and tubes'
          ),
        };
      case 'fiber':
        return {
          name: t('fiberLineName', 'Glasfaserlinie', 'Fiber Line'),
          description: t(
            'fiberLineDescription',
            'Für die Herstellung von Glasfasern',
            'For manufacturing optical fibers'
          ),
        };
      default:
        return {
          name: t('productionLine', 'Produktionslinie', 'Production Line'),
          description: t('selectProductionLine', 'Wählen Sie eine Produktionslinie aus', 'Select a production line'),
        };
    }
  };

  const lineInfo = getLineTypeInfo(lineType, scene?.Name_DE);

  // Ermittle wichtige Messpunkte basierend auf Position
  const getImportantMeasurePoints = (points: MeasurePoint[]): Set<number> => {
    // Definiere wichtige Messpunkte basierend auf typischen SIKORA Positionen
    const important = new Set<number>();
    points.forEach(point => {
      // Extrusion Zone und Cooling Zone sind typischerweise wichtig
      if (point.Name_EN.toLowerCase().includes('extrusion') || 
          point.Name_EN.toLowerCase().includes('cooling') ||
          point.Name_DE.toLowerCase().includes('extrusion') ||
          point.Name_DE.toLowerCase().includes('kühl') ||
          point.Name_EN.toLowerCase().includes('inlet')) {
        important.add(point.Id);
      }
    });
    return important;
  };

  const importantPoints = getImportantMeasurePoints(measurePoints);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header - Zurück-Link */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onBackToLineSelection}
          className="flex items-center text-sikora-blue hover:text-sikora-cyan transition-colors duration-200 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('backToLineSelection', 'Zurück zur Linienauswahl', 'Back to Line Selection')}
        </button>
      </div>

      {/* Linieninfo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-sikora-blue to-sikora-cyan rounded-lg flex items-center justify-center">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-sikora-blue mb-1">
              {lineInfo.name}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {lineInfo.description}
            </p>
          </div>
        </div>
      </div>

      {/* Konfigurationsstatus */}
      <div className="p-4 border-b border-gray-200">
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">
              {t('configurationStatus', 'Konfigurationsstatus', 'Configuration Status')}
            </span>
            <span className="text-sikora-blue font-semibold">
              {configuredCount}/{totalCount}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-sikora-blue to-sikora-cyan h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        {/* Status-Indikatoren */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            {configuredCount} {t('configured', 'konfiguriert', 'configured')}
          </div>
          <div className="flex items-center text-orange-600">
            <AlertCircle className="w-3 h-3 mr-1" />
            {totalCount - configuredCount} {t('pending', 'ausstehend', 'pending')}
          </div>
        </div>
      </div>

      {/* Messpunkte Liste */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-200">
          {measurePoints.map((measurePoint, index) => {
            const isConfigured = !!configuration[measurePoint.Id.toString()];
            const isSelected = selectedMeasurePoint === measurePoint.Id.toString();
            const isImportant = importantPoints.has(measurePoint.Id);
            
            const measurePointName = language === 'de' ? measurePoint.Name_DE : measurePoint.Name_EN;

            return (
              <div
                key={measurePoint.Id}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'bg-blue-50 border-l-4 border-sikora-blue' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onMeasurePointSelect(measurePoint.Id.toString())}
              >
                <div className="flex items-start space-x-3">
                  {/* Nummer & Status */}
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                      isConfigured
                        ? 'bg-sikora-blue text-white border-sikora-blue'
                        : isImportant
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        : 'bg-gray-100 text-gray-600 border-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    
                    {/* Status-Indikator */}
                    <div className={`w-3 h-3 rounded-full mt-2 mx-auto ${
                      isConfigured ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {measurePointName}
                      </h4>
                      {isImportant && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          {t('important', 'Wichtig', 'Important')}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-2">
                      {language === 'de' ? measurePoint.Name_EN : measurePoint.Name_DE}
                    </div>
                    
                    {/* Positionsinformationen */}
                    <div className="grid grid-cols-3 gap-1 text-xs text-gray-400 mb-2">
                      <div>X: {measurePoint.SpacePosX.toFixed(1)}</div>
                      <div>Y: {measurePoint.SpacePosY.toFixed(1)}</div>
                      <div>Z: {measurePoint.SpacePosZ.toFixed(1)}</div>
                    </div>
                    
                    {/* Konfigurationsstatus */}
                    <div className="mt-2">
                      {isConfigured ? (
                        <div className="text-xs text-sikora-blue font-medium bg-blue-100 px-2 py-1 rounded flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {configuration[measurePoint.Id.toString()]}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {t('noProductAssigned', 'Kein Produkt zugewiesen', 'No product assigned')}
                        </div>
                      )}
                    </div>

                    {/* Zusätzliche Informationen */}
                    <div className="mt-2 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Info className="w-3 h-3 mr-1" />
                        {t('scene', 'Szene', 'Scene')}: {measurePoint.Scene_Id}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {measurePoints.length === 0 && (
            <div className="p-6 text-center text-gray-500 text-sm">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <div>{t('noMeasurePoints', 'Keine Messpunkte geladen.', 'No measurement points loaded.')}</div>
              <div className="text-xs mt-1">
                {t('checkDatabase', 'Prüfen Sie die Datenbankverbindung.', 'Check the database connection.')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigurationSidebar; 