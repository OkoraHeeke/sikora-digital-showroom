import React from 'react';
import { Eye, Search, Info, MapPin, Package, Plus, CheckCircle, Settings, Cpu } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import MeasurePointDetail from './MeasurePointDetail';
import type { ProductWithDetails, MeasurePoint, Product } from '../types';

interface DetailsPanelProps {
  selectedProduct: ProductWithDetails | null;
  selectedMeasurePoint: MeasurePoint | null;
  availableProducts: Product[];
  configuration: Record<string, string>;
  onShowMeasurePoints: () => void;
  onShowProducts: () => void;
  onProductSelect?: (productName: string) => void;
  onConfigureProduct?: (measurePointId: string, productName: string) => void;
  onGoToCatalog?: () => void;
  loading?: boolean;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({
  selectedProduct,
  selectedMeasurePoint,
  availableProducts,
  configuration,
  onShowMeasurePoints,
  onShowProducts,
  onProductSelect,
  onConfigureProduct,
  onGoToCatalog,
  loading = false,
}) => {
  const { t, language } = useLanguage();
  const isProductConfigured = selectedMeasurePoint && configuration[selectedMeasurePoint.Id.toString()];

  // Helper functions for language-specific content
  const getDescription = (product: ProductWithDetails) => {
    return language === 'de' ? product.HTMLDescription_DE : product.HTMLDescription_EN;
  };

  const getSpecificationTitle = (spec: any) => {
    return language === 'de' ? spec.Title_DE : spec.Title_EN;
  };

  const getSpecificationValue = (spec: any) => {
    return language === 'de' ? spec.Value_DE : spec.Value_EN;
  };

  const getFeature = (feature: any) => {
    return language === 'de' ? feature.Feature_DE : feature.Feature_EN;
  };

  const getAdvantage = (advantage: any) => {
    return language === 'de' ? advantage.Advantage_DE : advantage.Advantage_EN;
  };

  const getInstallationInfo = (installation: any) => {
    return language === 'de' ? installation.InstallationInfo_DE : installation.InstallationInfo_EN;
  };

  const getDatasheetName = (datasheet: any) => {
    return language === 'de' ? datasheet.DatasheetName_DE : datasheet.DatasheetName_EN;
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-sikora-blue flex items-center">
          <Info className="w-5 h-5 mr-2" />
          {t('details', 'Details', 'Details')}
        </h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {loading && (
          <div className="p-6 text-center">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">{t('loadingDetails', 'Details werden geladen...', 'Loading details...')}</p>
          </div>
        )}

        {/* Messpunkt Details - Use MeasurePointDetail Component */}
        {selectedMeasurePoint && !selectedProduct && onGoToCatalog && (
          <MeasurePointDetail
            measurePoint={selectedMeasurePoint}
            onGoToCatalog={onGoToCatalog}
            assignedProduct={configuration[selectedMeasurePoint.Id.toString()] || null}
          />
        )}

        {/* Produktdetails */}
        {selectedProduct && (
          <div className="p-6 overflow-y-auto h-full">
            {/* Produktheader */}
            <div className="border-b border-gray-200 pb-4 mb-6">
              <div className="flex items-start space-x-4">
                <img
                  src={selectedProduct.ImageUrl.replace('public/', '/api/')}
                  alt={selectedProduct.Name}
                  className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/80/80';
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Cpu className="w-5 h-5 text-sikora-blue mr-2" />
                    <span className="text-sm font-medium text-sikora-blue">{t('sikoraProduct', 'SIKORA Produkt', 'SIKORA Product')}</span>
                  </div>
                  <h3 className="sikora-product-name text-lg font-bold text-sikora-blue mb-2">
                    {selectedProduct.Name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Zurück-Button */}
            {selectedMeasurePoint && (
              <div className="mb-4">
                <button
                  onClick={() => onProductSelect?.('')}
                  className="text-sm text-sikora-blue hover:text-sikora-cyan transition-colors duration-200 flex items-center"
                >
                  ← {t('backToMeasurePoint', 'Zurück zu Messpunkt', 'Back to Measure Point')} {selectedMeasurePoint.Id}
                </button>
              </div>
            )}

            {/* Produktbeschreibung */}
            <div className="mb-6">
              <div 
                className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: getDescription(selectedProduct) }}
              />
            </div>

            {/* Spezifikationen */}
            {selectedProduct.specifications.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">{t('technicalSpecifications', 'Technische Spezifikationen', 'Technical Specifications')}</h4>
                <div className="space-y-2">
                  {selectedProduct.specifications
                    .sort((a, b) => a.SortOrder - b.SortOrder)
                    .map((spec) => (
                    <div key={spec.Id} className="flex justify-between text-sm py-1 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">{getSpecificationTitle(spec)}:</span>
                      <span className="font-semibold text-gray-900">{getSpecificationValue(spec)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {selectedProduct.features.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">{t('specialFeatures', 'Besondere Merkmale', 'Special Features')}</h4>
                <ul className="space-y-2">
                  {selectedProduct.features
                    .sort((a, b) => a.SortOrder - b.SortOrder)
                    .map((feature) => (
                    <li key={feature.Id} className="flex items-start">
                      <div className="w-2 h-2 bg-sikora-blue rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{getFeature(feature)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Vorteile */}
            {selectedProduct.advantages.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">{t('advantages', 'Vorteile', 'Advantages')}</h4>
                <ul className="space-y-2">
                  {selectedProduct.advantages
                    .sort((a, b) => a.SortOrder - b.SortOrder)
                    .map((advantage) => (
                    <li key={advantage.Id} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{getAdvantage(advantage)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Installation */}
            {selectedProduct.installation && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">{t('installation', 'Installation', 'Installation')}</h4>
                <div 
                  className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: getInstallationInfo(selectedProduct.installation) }}
                />
              </div>
            )}

            {/* Datenblatt */}
            {selectedProduct.datasheet && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">{t('documentation', 'Dokumentation', 'Documentation')}</h4>
                <a
                  href={selectedProduct.datasheet.FileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors duration-200"
                >
                  📄 {getDatasheetName(selectedProduct.datasheet)}
                </a>
              </div>
            )}

            {/* Konfiguration Button */}
            {selectedMeasurePoint && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                {configuration[selectedMeasurePoint.Id.toString()] === selectedProduct.Name ? (
                  <div className="text-center py-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <div className="text-sm font-medium text-green-700">
                      {t('alreadyConfiguredFor', 'Bereits konfiguriert für Messpunkt', 'Already configured for measure point')} {selectedMeasurePoint.Id}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onConfigureProduct?.(selectedMeasurePoint.Id.toString(), selectedProduct.Name)}
                    className="w-full flex items-center justify-center px-4 py-3 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors duration-200 font-medium"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {t('configureForMeasurePoint', 'Für Messpunkt', 'Configure for measure point')} {selectedMeasurePoint.Id} {t('configure', 'konfigurieren', 'configure')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Default State */}
        {!selectedProduct && !selectedMeasurePoint && (
          <div className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('detailView', 'Detailansicht', 'Detail View')}
              </h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                {t('selectMeasurePointForDetails', 'Wählen Sie einen Messpunkt aus, um Details und verfügbare SIKORA-Produkte zu sehen.', 'Select a measure point to see details and available SIKORA products.')}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onShowMeasurePoints}
                className="w-full flex items-center justify-center px-4 py-3 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors duration-200 font-medium"
              >
                <MapPin className="w-5 h-5 mr-2" />
                {t('showMeasurePoints', 'Messpunkte anzeigen', 'Show Measure Points')}
              </button>
              
              <button
                onClick={onShowProducts}
                className="w-full flex items-center justify-center px-4 py-3 border border-sikora-blue text-sikora-blue rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
              >
                <Search className="w-5 h-5 mr-2" />
                {t('browseProductCatalog', 'Produktkatalog durchsuchen', 'Browse Product Catalog')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsPanel; 