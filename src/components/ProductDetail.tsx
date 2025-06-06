import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { ArrowLeft, Download, FileText, Target, Check, RotateCcw, Maximize2, Info, Zap, Settings, Package, Ruler } from 'lucide-react';
import { databaseService, formatSikoraProductName } from '../services/database';
import { useLanguage } from '../contexts/LanguageContext';
import BoundingBoxVisualizer from './BoundingBoxVisualizer';
import type { ProductWithDetails } from '../types';
import * as THREE from 'three';

interface ProductDetailProps {
  productName: string;
  onBack: () => void;
  onLoadToMeasurePoint?: (productName: string, measurePointId?: string) => void;
  availableMeasurePoints?: Array<{ id: string; name: string }>;
  backButtonLabel?: string;
}

interface Model3DProps {
  url: string;
  productName: string;
  onObjectLoad?: (object: THREE.Object3D) => void;
}

const Model3D: React.FC<Model3DProps> = ({ url, productName, onObjectLoad }) => {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Object3D>(null);

  useEffect(() => {
    if (scene && onObjectLoad) {
      onObjectLoad(scene);
    }
  }, [scene, onObjectLoad]);

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={[1, 1, 1]}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
};

const ProductDetail: React.FC<ProductDetailProps> = ({
  productName,
  onBack,
  onLoadToMeasurePoint,
  availableMeasurePoints = [],
  backButtonLabel
}) => {
  const { t, language } = useLanguage();
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'features' | 'installation'>('overview');
  const [model3DError, setModel3DError] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [selectedMeasurePoint, setSelectedMeasurePoint] = useState<string>('');
  const [showDimensions, setShowDimensions] = useState(false);
  const [loadedModel, setLoadedModel] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    const loadProductDetails = async () => {
      try {
        setLoading(true);
        const productDetails = await databaseService.getProductWithDetails(productName);
        if (productDetails) {
          setProduct(productDetails);
        } else {
          setError(t('productNotFound', 'Produkt nicht gefunden', 'Product not found'));
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
        setError(t('errorLoadingProductDetails', 'Fehler beim Laden der Produktdetails', 'Error loading product details'));
      } finally {
        setLoading(false);
      }
    };

    loadProductDetails();
  }, [productName, t]);

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

  const get3DModelUrl = (product: ProductWithDetails) => {
    if (product.Object3D_Url && !product.Object3D_Url.startsWith('http')) {
      let cleanPath = product.Object3D_Url.replace(/^public\//, '').replace(/^assets\//, '');
      cleanPath = cleanPath.replace(/x-ray_6000_pro/g, 'x_ray_6000');
      return `/api/assets/${cleanPath}`;
    }
    return product.Object3D_Url || null;
  };

  const getDatasheetUrl = (datasheet: any) => {
    if (datasheet?.FileUrl && !datasheet.FileUrl.startsWith('http')) {
      let cleanPath = datasheet.FileUrl.replace(/^public\//, '').replace(/^assets\//, '');
      return `/api/assets/${cleanPath}`;
    }
    return datasheet?.FileUrl || null;
  };

  const handleDatasheetDownload = () => {
    if (product?.datasheet) {
      const url = getDatasheetUrl(product.datasheet);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${product.Name}_Datasheet.pdf`;
        link.click();
      }
    }
  };

  const handleLoadToMeasurePoint = () => {
    if (selectedMeasurePoint && onLoadToMeasurePoint && product) {
      onLoadToMeasurePoint(product.Name, selectedMeasurePoint);
      setShowLoadDialog(false);
      setSelectedMeasurePoint('');
    }
  };

  const handleModelLoad = (object: THREE.Object3D) => {
    setLoadedModel(object);
  };

  const getTechnologyType = (productName: string): string => {
    if (productName.includes('X-RAY')) return 'X-RAY';
    if (productName.includes('LASER')) return 'LASER';
    if (productName.includes('SPARK')) return 'SPARK';
    if (productName.includes('CENTERVIEW')) return 'CENTERVIEW';
    if (productName.includes('CENTERWAVE')) return 'CENTERWAVE';
    if (productName.includes('PREHEATER')) return 'PREHEATER';
    if (productName.includes('ECOCONTROL')) return 'ECOCONTROL';
    return 'SIKORA';
  };

  const getTechnologyColor = (tech: string): string => {
    const colors = {
      'X-RAY': 'from-red-500 to-red-600',
      'LASER': 'from-blue-500 to-blue-600',
      'SPARK': 'from-yellow-500 to-yellow-600',
      'CENTERVIEW': 'from-green-500 to-green-600',
      'CENTERWAVE': 'from-indigo-500 to-indigo-600',
      'PREHEATER': 'from-orange-500 to-orange-600',
      'ECOCONTROL': 'from-teal-500 to-teal-600',
      'SIKORA': 'from-sikora-blue to-sikora-cyan'
    };
    return colors[tech as keyof typeof colors] || colors.SIKORA;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">{t('loadingProductDetails', 'Lade Produktdetails...', 'Loading product details...')}</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl mb-4">⚠️ {error}</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors"
          >
            {backButtonLabel || t('back', 'Zurück', 'Back')}
          </button>
        </div>
      </div>
    );
  }

  const modelUrl = get3DModelUrl(product);
  const technology = getTechnologyType(product.Name);
  const techGradient = getTechnologyColor(technology);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Kompakter Header */}
      <div className={`bg-gradient-to-r ${techGradient} text-white`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {backButtonLabel || t('backToCatalog', 'Zurück zum Katalog', 'Back to Catalog')}
              </button>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                    {technology}
                  </span>
                  <span className="text-white/80 text-sm">SIKORA Messtechnik</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold">
                  {formatSikoraProductName(product.Name)}
                </h1>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* DEBUG: Super auffälliger Button */}
              <button
                onClick={() => {
                  console.log('Abmessungen Button geklickt!');
                  setShowDimensions(!showDimensions);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg border-4 border-yellow-400 shadow-2xl transform hover:scale-110 transition-all"
                style={{
                  backgroundColor: '#ff0000',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  zIndex: 9999
                }}
              >
                📏 ABMESSUNGEN TEST
              </button>

              {product.datasheet && (
                <button
                  onClick={handleDatasheetDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {t('datasheet', 'Datenblatt', 'Datasheet')}
                </button>
              )}

              {onLoadToMeasurePoint && availableMeasurePoints.length > 0 && (
                <button
                  onClick={() => setShowLoadDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                >
                  <Target className="w-4 h-4" />
                  {t('loadToMeasurePoint', 'Auf Messpunkt laden', 'Load to Measure Point')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6 max-w-none">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: 'calc(100vh - 120px)' }}>

          {/* 3D Model - Takes 2/3 of the screen */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100" style={{ height: 'calc(100vh - 160px)' }}>
                {modelUrl && !model3DError ? (
                  <Canvas
                    camera={{ position: [2, 2, 2], fov: 45 }}
                    className="w-full h-full"
                  >
                    <Suspense fallback={null}>
                      <Environment preset="city" />
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[10, 10, 5]} intensity={1.2} />
                      <pointLight position={[-10, -10, -5]} intensity={0.5} />
                      <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={[30, 15]} blur={2} />
                      <Model3D
                        url={modelUrl}
                        productName={product.Name}
                        onObjectLoad={handleModelLoad}
                      />
                      <BoundingBoxVisualizer
                        targetObject={loadedModel}
                        visible={showDimensions}
                        color="#003A62"
                      />
                      <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        autoRotate={false}
                        minDistance={1}
                        maxDistance={8}
                        maxPolarAngle={Math.PI / 1.8}
                      />
                    </Suspense>
                  </Canvas>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <Package className="w-20 h-20 mx-auto mb-4" />
                      <p className="text-xl font-semibold">{t('3dModelNotAvailable', '3D-Modell nicht verfügbar', '3D model not available')}</p>
                      <p className="text-sm mt-2">{t('noModelAvailable', 'Dieses Produkt hat kein 3D-Modell hinterlegt', 'This product has no 3D model available')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="lg:hidden mt-4 flex gap-3">
              {/* Abmessungen Button - Debug: Immer anzeigen */}
              <button
                onClick={() => setShowDimensions(!showDimensions)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  showDimensions
                    ? 'bg-sikora-cyan text-sikora-blue'
                    : 'bg-sikora-blue text-white hover:bg-sikora-cyan'
                }`}
              >
                <Ruler className="w-4 h-4" />
                {t('dimensions', 'Abmessungen', 'Dimensions')}
              </button>

              {product.datasheet && (
                <button
                  onClick={handleDatasheetDownload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {t('datasheet', 'Datenblatt', 'Datasheet')}
                </button>
              )}

              {onLoadToMeasurePoint && availableMeasurePoints.length > 0 && (
                <button
                  onClick={() => setShowLoadDialog(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Target className="w-4 h-4" />
                  {t('loadToMeasurePoint', 'Auf Messpunkt laden', 'Load to Measure Point')}
                </button>
              )}
            </div>
          </div>

          {/* Product Information Panel - Now bigger (1/3 of screen) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">

              {/* Section Navigation - Horizontal Pills */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'overview', label: t('overview', 'Überblick', 'Overview'), icon: Info },
                    { id: 'specifications', label: t('technicalData', 'Technische Daten', 'Technical Data'), icon: Settings },
                    { id: 'features', label: t('features', 'Features', 'Features'), icon: Zap },
                    { id: 'installation', label: t('installation', 'Installation', 'Installation'), icon: FileText }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-sikora-blue text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content - More space now */}
              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('productDescription', 'Produktbeschreibung', 'Product Description')}</h3>
                      <div
                        className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: getDescription(product) || t('noDescriptionAvailable', 'Keine Beschreibung verfügbar', 'No description available')
                        }}
                      />
                    </div>

                    {product.advantages.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('yourAdvantages', 'Ihre Vorteile', 'Your Advantages')}</h4>
                        <div className="space-y-3">
                          {product.advantages.map((advantage) => (
                            <div key={advantage.Id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{getAdvantage(advantage)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">{t('technicalSpecifications', 'Technische Spezifikationen', 'Technical Specifications')}</h3>
                    {product.specifications.length > 0 ? (
                      <div className="space-y-4">
                        {product.specifications.map((spec) => (
                          <div key={spec.Id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="font-medium text-gray-900 mb-2">
                              {getSpecificationTitle(spec)}
                            </div>
                            <div className="text-sikora-blue font-semibold">
                              {getSpecificationValue(spec)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">{t('noTechnicalDataAvailable', 'Keine technischen Daten verfügbar', 'No technical data available')}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'features' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">{t('productFeatures', 'Produktfeatures', 'Product Features')}</h3>
                    {product.features.length > 0 ? (
                      <div className="space-y-3">
                        {product.features.map((feature) => (
                          <div key={feature.Id} className="flex items-start gap-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
                            <Zap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{getFeature(feature)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">{t('noFeaturesAvailable', 'Keine Features verfügbar', 'No features available')}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'installation' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">{t('installationAndSetup', 'Installation & Setup', 'Installation & Setup')}</h3>
                    {product.installation ? (
                      <div
                        className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: getInstallationInfo(product.installation)
                        }}
                      />
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">{t('noSetupInfoAvailable', 'Keine Setup-Informationen verfügbar', 'No setup information available')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Load to Measure Point Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('loadProductToMeasurePoint', 'Produkt auf Messpunkt laden', 'Load Product to Measure Point')}</h3>
              <p className="text-gray-600 mb-6">
                {t('selectMeasurePointToConfig', 'Wählen Sie einen Messpunkt aus, um', 'Select a measure point to configure')} <strong>{formatSikoraProductName(product.Name)}</strong> {t('toConfigure', 'zu konfigurieren', '')}:
              </p>

              <div className="space-y-3 mb-6">
                {availableMeasurePoints.map((mp) => (
                  <label key={mp.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="measurePoint"
                      value={mp.id}
                      checked={selectedMeasurePoint === mp.id}
                      onChange={(e) => setSelectedMeasurePoint(e.target.value)}
                      className="mr-3 w-4 h-4 text-sikora-blue"
                    />
                    <span className="font-medium text-gray-900">{mp.name}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowLoadDialog(false);
                    setSelectedMeasurePoint('');
                  }}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('cancel', 'Abbrechen', 'Cancel')}
                </button>
                <button
                  onClick={handleLoadToMeasurePoint}
                  disabled={!selectedMeasurePoint}
                  className="flex-1 px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {t('load', 'Laden', 'Load')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
