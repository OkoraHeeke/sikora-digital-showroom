import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { 
  Package, 
  FileText, 
  Download, 
  Settings, 
  Info, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Check,
  Target,
  ArrowLeft,
  Ruler,
  Smartphone,
  QrCode,
  X
} from 'lucide-react';
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
  // New props for header integration
  showDimensions?: boolean;
  onToggleDimensions?: () => void;
}

interface Model3DProps {
  url: string;
  productName: string;
  onObjectLoad?: (object: THREE.Object3D) => void;
}

// Error Boundary für 3D-Modelle
class Model3DErrorBoundary extends React.Component<
  { children: React.ReactNode; productName: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; productName: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn(`3D Model Error for ${this.props.productName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-xs">3D-Modell nicht verfügbar</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
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
  backButtonLabel,
  showDimensions: externalShowDimensions,
  onToggleDimensions
}) => {
  const { t, language } = useLanguage();
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [model3DError, setModel3DError] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [selectedMeasurePoint, setSelectedMeasurePoint] = useState<string>('');
  const [localShowDimensions, setLocalShowDimensions] = useState(false);
  const [loadedModel, setLoadedModel] = useState<THREE.Object3D | null>(null);
  const [showAR, setShowAR] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [dimensionsLoading, setDimensionsLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<{
    overview: boolean;
    specifications: boolean;
    features: boolean;
    installation: boolean;
  }>({
    overview: true, // Start with overview expanded
    specifications: false,
    features: false,
    installation: false
  });

  // Combined loading state - true if any loading is happening
  const isLoading = loading || dimensionsLoading || modelLoading;

  // Use external dimensions state if provided, otherwise use local state
  const showDimensions = externalShowDimensions !== undefined ? externalShowDimensions : localShowDimensions;
  const toggleDimensions = onToggleDimensions || (() => {
    if (!showDimensions) {
      // Show loading when enabling dimensions
      setDimensionsLoading(true);
      setTimeout(() => {
        setLocalShowDimensions(true);
        setDimensionsLoading(false);
      }, 1500); // 1.5 second loading simulation
    } else {
      setLocalShowDimensions(false);
    }
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
      
      // Korrigiere nur Verzeichnisnamen, nicht Dateinamen
      // Teile den Pfad in Verzeichnisse und Dateinamen auf
      const pathParts = cleanPath.split('/');
      if (pathParts.length > 1) {
        // Konvertiere nur das Verzeichnis (vorletztes Element), nicht den Dateinamen
        for (let i = 0; i < pathParts.length - 1; i++) {
          pathParts[i] = pathParts[i]
            .replace(/x-ray_6000_pro/g, 'x_ray_6000')
            .replace(/x-ray_6000/g, 'x_ray_6000')
            .replace(/x-ray_8000/g, 'x_ray_8000');
        }
        cleanPath = pathParts.join('/');
      }
      
      const finalUrl = `/api/assets/${cleanPath}`;
      console.log(`3D Model URL for ${product.Name}: ${product.Object3D_Url} -> ${finalUrl}`);
      return finalUrl;
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
    setModelLoading(false); // Model finished loading
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

  // AR functionality
  const handleARToggle = () => {
    if (product) {
      const modelUrl = get3DModelUrl(product);
      if (modelUrl) {
        setShowQRModal(true);
      } else {
        alert(t('noARModel', 'Kein 3D-Modell für AR verfügbar', 'No 3D model available for AR'));
      }
    }
  };

  // Generate AR URL for QR code
  const getARUrl = () => {
    if (!product) return '';
    const modelUrl = get3DModelUrl(product);
    const baseUrl = window.location.origin;
    return `${baseUrl}/ar?model=${encodeURIComponent(modelUrl || '')}&name=${encodeURIComponent(product.Name)}`;
  };

  // Start model loading when component mounts and product is available
  useEffect(() => {
    if (product && get3DModelUrl(product) && !model3DError) {
      setModelLoading(true);
    }
  }, [product, model3DError]);

  // Get appropriate loading message based on what's loading
  const getLoadingMessage = () => {
    if (loading) {
      return {
        title: t('loadingProductDetails', 'Lade Produktdetails...', 'Loading product details...'),
        subtitle: t('pleaseWaitProduct', 'Produktinformationen werden geladen', 'Loading product information')
      };
    }
    if (modelLoading) {
      return {
        title: t('loading3DModel', '3D-Modell wird geladen...', 'Loading 3D model...'),
        subtitle: t('pleaseWaitModel', 'Das 3D-Modell wird vorbereitet', 'Preparing 3D model')
      };
    }
    if (dimensionsLoading) {
      return {
        title: t('calculatingDimensions', 'Abmessungen werden berechnet', 'Calculating dimensions'),
        subtitle: t('pleaseWait', 'Bitte warten Sie einen Moment...', 'Please wait a moment...')
      };
    }
    return {
      title: t('loading', 'Laden...', 'Loading...'),
      subtitle: t('pleaseWait', 'Bitte warten Sie einen Moment...', 'Please wait a moment...')
    };
  };

  if (error || (!product && !loading)) {
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

  const modelUrl = product ? get3DModelUrl(product) : null;
  const technology = product ? getTechnologyType(product.Name) : '';
  const techGradient = getTechnologyColor(technology);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Universal Full Screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/98 backdrop-blur-md flex items-center justify-center z-[60]">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-sikora-blue to-sikora-cyan rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-sikora-blue/40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-white"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {getLoadingMessage().title}
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              {getLoadingMessage().subtitle}
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-sikora-blue rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-sikora-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-sikora-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Controls - Top Left Overlay */}
      <div className="fixed top-6 left-6 z-20 flex items-center space-x-3">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:text-sikora-blue bg-gray-100/80 hover:bg-sikora-blue/10 rounded-lg transition-all font-medium backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backButtonLabel || t('back', 'Zurück', 'Back')}</span>
        </button>

        {/* Dimensions Toggle */}
        <button
          onClick={toggleDimensions}
          disabled={dimensionsLoading}
          className={`flex items-center space-x-2 px-3 py-2 text-sm border rounded-lg transition-all backdrop-blur-sm ${
            showDimensions 
              ? 'bg-sikora-blue text-white border-sikora-blue shadow-md' 
              : dimensionsLoading
              ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:text-sikora-blue border-gray-200 hover:border-sikora-blue/50 bg-white/90'
          }`}
        >
          {dimensionsLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
          ) : (
            <Ruler className="w-4 h-4" />
          )}
          <span className="font-medium">
            {dimensionsLoading 
              ? t('loading', 'Laden...', 'Loading...') 
              : t('dimensions', 'Abmessungen', 'Dimensions')
            }
          </span>
        </button>

        {/* Load to Measure Point Button */}
        {onLoadToMeasurePoint && availableMeasurePoints.length > 0 && (
          <button
            onClick={() => setShowLoadDialog(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-sikora-blue to-sikora-cyan text-white rounded-lg hover:shadow-lg transition-all font-medium backdrop-blur-sm"
          >
            <Target className="w-4 h-4" />
            <span>{t('loadToMeasurePoint', 'Auf Messpunkt laden', 'Load to Measure Point')}</span>
          </button>
        )}

        {/* AR QR Code Button */}
        <button
          onClick={handleARToggle}
          className="flex items-center space-x-2 px-3 py-2 text-sm border rounded-lg transition-all backdrop-blur-sm text-gray-600 hover:text-sikora-blue border-gray-200 hover:border-sikora-blue/50 bg-white/90"
        >
          <QrCode className="w-4 h-4" />
          <span className="font-medium">{t('ar', 'AR', 'AR')}</span>
        </button>
      </div>

      {/* 3D Model - Full Screen */}
      <div className="fixed inset-0">
        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100">
          {modelUrl && !model3DError && product ? (
            <Model3DErrorBoundary productName={product.Name}>
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sikora-blue"></div>
                </div>
              }>
                <Canvas
                  camera={{ position: [2, 2, 2], fov: 45 }}
                  className="w-full h-full"
                >
                  <Environment preset="city" />
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[10, 10, 5]} intensity={1.2} />
                  <pointLight position={[-10, -10, -5]} intensity={0.5} />
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
                </Canvas>
              </Suspense>
            </Model3DErrorBoundary>
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

      {/* Product Information Panel - Right Overlay (wider) */}
      {product && (
        <div className="fixed top-0 right-0 w-[480px] h-full bg-white shadow-2xl z-10 overflow-hidden border-l border-gray-200">
          {/* Product Header */}
          <div className="p-6 bg-gradient-to-r from-sikora-blue to-sikora-cyan text-white">
            <h2 className="text-2xl font-bold mb-2 text-white">
              {formatSikoraProductName(product.Name)}
            </h2>
            <div className="text-white/80 text-sm">
              {getTechnologyType(product.Name)} {t('technology', 'Technologie', 'Technology')}
            </div>
          </div>

          {/* Collapsible Sections */}
          <div className="overflow-y-auto h-full pb-32">
            {/* Overview Section */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleSection('overview')}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-sikora-blue" />
                  <span className="font-semibold text-gray-900">{t('overview', 'Überblick', 'Overview')}</span>
                </div>
                {expandedSections.overview ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSections.overview && (
                <div className="p-6 space-y-6 bg-gray-50">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('productDescription', 'Produktbeschreibung', 'Product Description')}</h3>
                    <div
                      className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: getDescription(product) || t('noDescriptionAvailable', 'Keine Beschreibung verfügbar', 'No description available')
                      }}
                    />
                  </div>

                  {product.advantages.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-4">{t('yourAdvantages', 'Ihre Vorteile', 'Your Advantages')}</h4>
                      <div className="space-y-3">
                        {product.advantages.map((advantage) => (
                          <div key={advantage.Id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{getAdvantage(advantage)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Technical Data Section */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleSection('specifications')}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-sikora-blue" />
                  <span className="font-semibold text-gray-900">{t('technicalData', 'Technische Daten', 'Technical Data')}</span>
                </div>
                {expandedSections.specifications ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSections.specifications && (
                <div className="p-6 bg-gray-50">
                  {product.specifications.length > 0 ? (
                    <div className="space-y-4">
                      {product.specifications.map((spec) => (
                        <div key={spec.Id} className="border border-gray-200 rounded-lg p-4 bg-white">
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
                    <div className="text-center py-8 text-gray-500">
                      <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{t('noTechnicalDataAvailable', 'Keine technischen Daten verfügbar', 'No technical data available')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Features Section */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleSection('features')}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-sikora-blue" />
                  <span className="font-semibold text-gray-900">{t('features', 'Features', 'Features')}</span>
                </div>
                {expandedSections.features ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSections.features && (
                <div className="p-6 bg-gray-50">
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
                    <div className="text-center py-8 text-gray-500">
                      <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{t('noFeaturesAvailable', 'Keine Features verfügbar', 'No features available')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Installation Section */}
            <div>
              <button
                onClick={() => toggleSection('installation')}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-sikora-blue" />
                  <span className="font-semibold text-gray-900">{t('installation', 'Installation', 'Installation')}</span>
                </div>
                {expandedSections.installation ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSections.installation && (
                <div className="p-6 bg-gray-50">
                  {product.installation ? (
                    <div
                      className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: getInstallationInfo(product.installation)
                      }}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{t('noSetupInfoAvailable', 'Keine Setup-Informationen verfügbar', 'No setup information available')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal for AR */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{t('arViewer', 'AR Viewer', 'AR Viewer')}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('scanWithPhone', 'Mit dem Handy scannen', 'Scan with your phone')}
                  </p>
                </div>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* QR Code Placeholder */}
              <div className="bg-gray-50 rounded-xl p-8 text-center mb-6">
                <div className="w-48 h-48 mx-auto bg-white rounded-lg shadow-sm flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-500 font-medium">QR Code</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {t('qrCodePlaceholder', 'Wird später implementiert', 'To be implemented')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-sikora-blue text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="text-sm text-gray-700">
                    {t('arStep1', 'Öffnen Sie die Kamera-App auf Ihrem Smartphone', 'Open the camera app on your smartphone')}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-sikora-blue text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="text-sm text-gray-700">
                    {t('arStep2', 'Scannen Sie den QR-Code', 'Scan the QR code')}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-sikora-blue text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <p className="text-sm text-gray-700">
                    {t('arStep3', 'Erleben Sie das Produkt in Augmented Reality', 'Experience the product in Augmented Reality')}
                  </p>
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-gradient-to-r from-sikora-blue/10 to-sikora-cyan/10 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-sikora-blue rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {formatSikoraProductName(product.Name)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getTechnologyType(product.Name)} {t('technology', 'Technologie', 'Technology')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-6">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  {t('close', 'Schließen', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
