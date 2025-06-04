import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { ArrowLeft, Download, FileText, Target, Check, RotateCcw, Maximize2, Info, Zap, Settings, Package } from 'lucide-react';
import { databaseService, formatSikoraProductName } from '../services/database';
import type { ProductWithDetails } from '../types';

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
}

const Model3D: React.FC<Model3DProps> = ({ url, productName }) => {
  const { scene } = useGLTF(url);
  
  return (
    <primitive 
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
  backButtonLabel = "Zurück zum Katalog"
}) => {
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'features' | 'installation'>('overview');
  const [model3DError, setModel3DError] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [selectedMeasurePoint, setSelectedMeasurePoint] = useState<string>('');

  useEffect(() => {
    const loadProductDetails = async () => {
      try {
        setLoading(true);
        const productDetails = await databaseService.getProductWithDetails(productName);
        if (productDetails) {
          setProduct(productDetails);
        } else {
          setError('Produkt nicht gefunden');
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
        setError('Fehler beim Laden der Produktdetails');
      } finally {
        setLoading(false);
      }
    };

    loadProductDetails();
  }, [productName]);

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
          <p className="text-lg text-gray-600">Lade Produktdetails...</p>
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
            {backButtonLabel}
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
      {/* Hero Header */}
      <div className={`bg-gradient-to-r ${techGradient} text-white`}>
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={onBack}
                className="flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {backButtonLabel}
              </button>
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    {technology}
                  </span>
                  <span className="text-white/80">SIKORA Messtechnik</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                  {formatSikoraProductName(product.Name)}
                </h1>
                <p className="text-white/90 text-lg max-w-2xl">
                  Professionelle Messtechnik für industrielle Anwendungen
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              {product.datasheet && (
                <button
                  onClick={handleDatasheetDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Datenblatt
                </button>
              )}
              
              {onLoadToMeasurePoint && availableMeasurePoints.length > 0 && (
                <button
                  onClick={() => setShowLoadDialog(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                >
                  <Target className="w-5 h-5" />
                  Auf Messpunkt laden
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* 3D Model - Large Center Panel */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="h-[500px] lg:h-[600px] relative bg-gradient-to-br from-gray-50 to-gray-100">
                {modelUrl && !model3DError ? (
                  <Canvas 
                    camera={{ position: [4, 4, 4], fov: 45 }}
                    className="w-full h-full"
                  >
                    <Suspense fallback={null}>
                      <Environment preset="city" />
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[10, 10, 5]} intensity={1.2} />
                      <pointLight position={[-10, -10, -5]} intensity={0.5} />
                      <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={20} blur={2} />
                      <Model3D url={modelUrl} productName={product.Name} />
                      <OrbitControls 
                        enablePan={true} 
                        enableZoom={true} 
                        enableRotate={true}
                        autoRotate={true}
                        autoRotateSpeed={0.8}
                        minDistance={2}
                        maxDistance={12}
                        maxPolarAngle={Math.PI / 1.8}
                      />
                    </Suspense>
                  </Canvas>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <Package className="w-20 h-20 mx-auto mb-4" />
                      <p className="text-xl font-semibold">3D-Modell nicht verfügbar</p>
                      <p className="text-sm mt-2">Dieses Produkt hat kein 3D-Modell hinterlegt</p>
                    </div>
                  </div>
                )}
                
                {/* 3D Controls */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-black/80 backdrop-blur-md text-white rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">🖱️</span>
                          <span>Rotieren</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">⚙️</span>
                          <span>Zoomen</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">🔄</span>
                          <span>Verschieben</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => window.location.reload()}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        title="3D-Ansicht zurücksetzen"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="lg:hidden mt-6 flex gap-4">
              {product.datasheet && (
                <button
                  onClick={handleDatasheetDownload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Datenblatt
                </button>
              )}
              
              {onLoadToMeasurePoint && availableMeasurePoints.length > 0 && (
                <button
                  onClick={() => setShowLoadDialog(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Target className="w-5 h-5" />
                  Auf Messpunkt laden
                </button>
              )}
            </div>
          </div>

          {/* Product Information Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-8">
              
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {[
                    { id: 'overview', label: 'Überblick', icon: Info },
                    { id: 'specifications', label: 'Daten', icon: Settings },
                    { id: 'features', label: 'Features', icon: Zap },
                    { id: 'installation', label: 'Setup', icon: FileText }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex flex-col items-center gap-1 py-4 px-2 text-xs font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'text-sikora-blue border-b-2 border-sikora-blue bg-blue-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6 max-h-[600px] overflow-y-auto">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Produktbeschreibung</h3>
                      <div 
                        className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: product.HTMLDescription_DE || product.HTMLDescription_EN || 'Keine Beschreibung verfügbar'
                        }}
                      />
                    </div>
                    
                    {product.advantages.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Ihre Vorteile</h4>
                        <div className="space-y-3">
                          {product.advantages.map((advantage) => (
                            <div key={advantage.Id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{advantage.Advantage_DE || advantage.Advantage_EN}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Technische Spezifikationen</h3>
                    {product.specifications.length > 0 ? (
                      <div className="space-y-3">
                        {product.specifications.map((spec) => (
                          <div key={spec.Id} className="border border-gray-200 rounded-lg p-4">
                            <div className="font-medium text-gray-900 text-sm mb-2">
                              {spec.Title_DE || spec.Title_EN}
                            </div>
                            <div className="text-sikora-blue font-semibold">
                              {spec.Value_DE || spec.Value_EN}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Keine technischen Daten verfügbar</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'features' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Produktfeatures</h3>
                    {product.features.length > 0 ? (
                      <div className="space-y-3">
                        {product.features.map((feature) => (
                          <div key={feature.Id} className="flex items-start gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50">
                            <Zap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature.Feature_DE || feature.Feature_EN}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Keine Features verfügbar</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'installation' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Installation & Setup</h3>
                    {product.installation ? (
                      <div 
                        className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: product.installation.InstallationInfo_DE || product.installation.InstallationInfo_EN 
                        }}
                      />
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Keine Installationsinformationen verfügbar</p>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Produkt auf Messpunkt laden</h3>
              <p className="text-gray-600 mb-6">
                Wählen Sie einen Messpunkt aus, um <strong>{formatSikoraProductName(product.Name)}</strong> zu konfigurieren:
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
                  Abbrechen
                </button>
                <button
                  onClick={handleLoadToMeasurePoint}
                  disabled={!selectedMeasurePoint}
                  className="flex-1 px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Laden
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