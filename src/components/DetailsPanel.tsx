import React from 'react';
import { Eye, Search, Info, MapPin, Package, Plus, CheckCircle, Settings, Cpu } from 'lucide-react';
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
  loading = false,
}) => {
  const isProductConfigured = selectedMeasurePoint && configuration[selectedMeasurePoint.Id.toString()];

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-sikora-blue flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Details
        </h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-6 text-center">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Details werden geladen...</p>
          </div>
        )}

        {/* Messpunkt Details */}
        {selectedMeasurePoint && !selectedProduct && (
          <div className="p-6">
            {/* Messpunkt Header */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 text-sikora-blue mr-2" />
                <h3 className="font-semibold text-sikora-blue">
                  Messpunkt #{selectedMeasurePoint.Id}
                </h3>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                {selectedMeasurePoint.Name_DE}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {selectedMeasurePoint.Name_EN}
              </p>
              
              {/* Positionsdaten */}
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <div className="font-medium text-gray-900">X-Position</div>
                  <div className="text-sikora-blue font-semibold">
                    {selectedMeasurePoint.SpacePosX.toFixed(2)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">Y-Position</div>
                  <div className="text-sikora-blue font-semibold">
                    {selectedMeasurePoint.SpacePosY.toFixed(2)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">Z-Position</div>
                  <div className="text-sikora-blue font-semibold">
                    {selectedMeasurePoint.SpacePosZ.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Konfigurationsstatus */}
              <div className="mt-4 pt-3 border-t border-blue-200">
                {isProductConfigured ? (
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="font-medium">Konfiguriert: {configuration[selectedMeasurePoint.Id.toString()]}</span>
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600">
                    <Settings className="w-4 h-4 mr-2" />
                    <span className="font-medium">Bereit zur Konfiguration</span>
                  </div>
                )}
              </div>
            </div>

            {/* Verfügbare Produkte */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Package className="w-5 h-5 text-sikora-blue mr-2" />
                <h4 className="font-semibold text-gray-900">Verfügbare SIKORA Produkte</h4>
              </div>
              
              {availableProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <div className="font-medium mb-1">Keine Produkte verfügbar</div>
                  <div className="text-sm">Prüfen Sie die Datenbankverbindung oder Messparameter-Zuordnungen.</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableProducts.map((product) => {
                    const isConfigured = configuration[selectedMeasurePoint.Id.toString()] === product.Name;
                    
                    return (
                      <div
                        key={product.Name}
                        className={`border rounded-lg p-3 transition-all duration-200 cursor-pointer ${
                          isConfigured 
                            ? 'border-sikora-blue bg-blue-50' 
                            : 'border-gray-200 hover:border-sikora-cyan hover:bg-gray-50'
                        }`}
                        onClick={() => onProductSelect?.(product.Name)}
                      >
                        <div className="flex items-start space-x-3">
                          <img
                            src={product.ImageUrl.replace('public/', '/api/')}
                            alt={product.Name}
                            className="w-16 h-16 object-cover rounded bg-gray-100 flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = '/api/placeholder/64/64';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="sikora-product-name text-sm font-bold text-sikora-blue mb-1 leading-tight">
                              {product.Name}
                            </h5>
                            <div 
                              className="text-xs text-gray-600 line-clamp-3 mb-3"
                              dangerouslySetInnerHTML={{ 
                                __html: product.HTMLDescription_DE.replace(/<[^>]*>/g, '').substring(0, 120) + '...' 
                              }}
                            />
                            <div className="flex items-center justify-between">
                              {isConfigured ? (
                                <span className="text-xs text-green-700 font-medium bg-green-100 px-2 py-1 rounded flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Konfiguriert
                                </span>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onConfigureProduct?.(selectedMeasurePoint.Id.toString(), product.Name);
                                  }}
                                  className="text-xs bg-sikora-blue text-white px-3 py-1 rounded hover:bg-sikora-cyan transition-colors duration-200 flex items-center"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Konfigurieren
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onProductSelect?.(product.Name);
                                }}
                                className="text-xs text-sikora-blue hover:text-sikora-cyan transition-colors duration-200"
                              >
                                Details →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Produktdetails */}
        {selectedProduct && (
          <div className="p-6">
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
                    <span className="text-sm font-medium text-sikora-blue">SIKORA Produkt</span>
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
                  ← Zurück zu Messpunkt {selectedMeasurePoint.Id}
                </button>
              </div>
            )}

            {/* Produktbeschreibung */}
            <div className="mb-6">
              <div 
                className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedProduct.HTMLDescription_DE }}
              />
            </div>

            {/* Spezifikationen */}
            {selectedProduct.specifications.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Technische Spezifikationen</h4>
                <div className="space-y-2">
                  {selectedProduct.specifications
                    .sort((a, b) => a.SortOrder - b.SortOrder)
                    .map((spec) => (
                    <div key={spec.Id} className="flex justify-between text-sm py-1 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">{spec.Title_DE}:</span>
                      <span className="font-semibold text-gray-900">{spec.Value_DE}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {selectedProduct.features.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Besondere Merkmale</h4>
                <ul className="space-y-2">
                  {selectedProduct.features
                    .sort((a, b) => a.SortOrder - b.SortOrder)
                    .map((feature) => (
                    <li key={feature.Id} className="flex items-start">
                      <div className="w-2 h-2 bg-sikora-blue rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature.Feature_DE}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Vorteile */}
            {selectedProduct.advantages.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Vorteile</h4>
                <ul className="space-y-2">
                  {selectedProduct.advantages
                    .sort((a, b) => a.SortOrder - b.SortOrder)
                    .map((advantage) => (
                    <li key={advantage.Id} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{advantage.Advantage_DE}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Installation */}
            {selectedProduct.installation && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Installation</h4>
                <div 
                  className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedProduct.installation.InstallationInfo_DE }}
                />
              </div>
            )}

            {/* Datenblatt */}
            {selectedProduct.datasheet && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Dokumentation</h4>
                <a
                  href={selectedProduct.datasheet.FileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors duration-200"
                >
                  📄 {selectedProduct.datasheet.DatasheetName_DE}
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
                      Bereits konfiguriert für Messpunkt {selectedMeasurePoint.Id}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onConfigureProduct?.(selectedMeasurePoint.Id.toString(), selectedProduct.Name)}
                    className="w-full flex items-center justify-center px-4 py-3 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors duration-200 font-medium"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Für Messpunkt {selectedMeasurePoint.Id} konfigurieren
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
                Detailansicht
              </h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Wählen Sie einen Messpunkt aus, um Details und verfügbare SIKORA-Produkte zu sehen.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onShowMeasurePoints}
                className="w-full flex items-center justify-center px-4 py-3 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors duration-200 font-medium"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Messpunkte anzeigen
              </button>
              
              <button
                onClick={onShowProducts}
                className="w-full flex items-center justify-center px-4 py-3 border border-sikora-blue text-sikora-blue rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
              >
                <Search className="w-5 h-5 mr-2" />
                Produktkatalog durchsuchen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsPanel; 