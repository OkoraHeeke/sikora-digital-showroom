import React from 'react';
import { ShoppingCart, MapPin, Move3D, Info, Target, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { MeasurePoint } from '../types';

interface MeasurePointDetailProps {
  measurePoint: MeasurePoint;
  onGoToCatalog: () => void;
  assignedProduct?: string | null;
  onBack?: () => void;
}

const MeasurePointDetail: React.FC<MeasurePointDetailProps> = ({ 
  measurePoint, 
  onGoToCatalog,
  assignedProduct = null,
  onBack
}) => {
  const { t } = useLanguage();
  const measurePointName = measurePoint.Name_DE || measurePoint.Name_EN || `${t('measurePoint', 'Messpunkt', 'Measure Point')} ${measurePoint.Id}`;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-sikora-blue to-sikora-cyan text-white p-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <MapPin className="w-5 h-5" />
          <span className="text-sm font-medium">{t('measurePointDetails', 'Messpunkt Details', 'Measure Point Details')}</span>
        </div>
        <h2 className="text-lg font-bold leading-tight">
          {measurePointName}
        </h2>
        <p className="text-xs text-white/80 mt-1">ID: {measurePoint.Id}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Current Assignment Status */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">{t('currentConfiguration', 'Aktuelle Konfiguration', 'Current Configuration')}</h3>
          
          {assignedProduct ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <Target className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-green-900">{t('productAssigned', 'Produkt zugewiesen', 'Product Assigned')}</span>
              </div>
              <div className="bg-white rounded p-2 border">
                <p className="text-sm font-medium text-gray-900">{assignedProduct}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {t('clickMeasurePointFor3DDetails', 'Klicken Sie auf den Messpunkt in der 3D-Szene für Details', 'Click on the measure point in the 3D scene for details')}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center">
                  <Target className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-yellow-900">{t('noProductAssigned', 'Kein Produkt zugewiesen', 'No Product Assigned')}</span>
              </div>
              <p className="text-xs text-yellow-700">
                {t('measurePointNotConfigured', 'Dieser Messpunkt ist noch nicht konfiguriert', 'This measure point is not yet configured')}
              </p>
            </div>
          )}
        </div>

        {/* Go to Catalog Section */}
        <div className="p-4 bg-gradient-to-br from-sikora-blue/10 to-sikora-cyan/10 rounded-lg text-center">
          <ShoppingCart className="w-8 h-8 text-sikora-blue mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('selectProduct', 'Produkt auswählen', 'Select Product')}</h3>
          <p className="text-xs text-gray-600 mb-3">
            {t('visitCatalogForDevices', 'Besuchen Sie den Produktkatalog für passende Messgeräte', 'Visit the product catalog for suitable measuring devices')}
          </p>
          <button
            onClick={onGoToCatalog}
            className="w-full px-3 py-2 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors text-sm font-medium"
          >
            {t('openProductCatalog', 'Produktkatalog öffnen', 'Open Product Catalog')}
          </button>
        </div>

        {/* Technical Details */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">{t('technicalDetails', 'Technische Details', 'Technical Details')}</h3>
          
          {/* Names */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">{t('designations', 'Bezeichnungen', 'Designations')}</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('german', 'Deutsch', 'German')}:</span>
                <span className="font-medium">{measurePoint.Name_DE || t('notAvailable', 'Nicht verfügbar', 'Not available')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('english', 'English', 'English')}:</span>
                <span className="font-medium">{measurePoint.Name_EN || t('notAvailable', 'Not available', 'Not available')}</span>
              </div>
            </div>
          </div>

          {/* Position */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
              <Move3D className="w-4 h-4" />
              {t('3dPosition', '3D Position', '3D Position')}
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-sm font-bold text-red-600">{measurePoint.SpacePosX.toFixed(1)}</div>
                <div className="text-xs text-gray-600">X</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-green-600">{measurePoint.SpacePosY.toFixed(1)}</div>
                <div className="text-xs text-gray-600">Y</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-blue-600">{measurePoint.SpacePosZ.toFixed(1)}</div>
                <div className="text-xs text-gray-600">Z</div>
              </div>
            </div>
          </div>

          {/* Scene Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">{t('sceneId', 'Szene ID', 'Scene ID')}: {measurePoint.Scene_Id}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 {t('instructions', 'Anweisungen', 'Instructions')}</h4>
          <div className="space-y-2 text-xs text-blue-800">
            <p>
              <strong>🎯 {t('loadProduct', 'Produkt laden', 'Load Product')}:</strong> {t('clickOpenCatalog', 'Klicken Sie auf "Produktkatalog öffnen" um Messgeräte zu durchsuchen', 'Click "Open Product Catalog" to browse measuring devices')}.
            </p>
            <p>
              <strong>👁️ {t('showDetails', 'Details anzeigen', 'Show Details')}:</strong> {t('afterLoadingClick3D', 'Nach dem Laden klicken Sie in der 3D-Szene auf den Messpunkt für Produktdetails', 'After loading, click on the measure point in the 3D scene for product details')}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasurePointDetail; 