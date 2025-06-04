import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { ArrowLeft, Download, FileText, Target, Check, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { databaseService, formatSikoraProductName } from '../services/database';
import type { ProductWithDetails } from '../types';

interface ProductDetailProps {
  productName: string;
  onBack: () => void;
  onLoadToMeasurePoint?: (productName: string, measurePointId?: string) => void;
  availableMeasurePoints?: Array<{ id: string; name: string }>;
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
  availableMeasurePoints = []
}) => {
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'features' | 'installation'>('overview');
  const [model3DError, setModel3DError] = useState(false);
  const [fullscreen3D, setFullscreen3D] = useState(false);
  const [showLoadToMeasurePoint, setShowLoadToMeasurePoint] = useState(false);
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
      setShowLoadToMeasurePoint(false);
      setSelectedMeasurePoint('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Produktdetails...</p>
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
            className="px-4 py-2 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan"
          >
            Zurück
          </button>
        </div>
      </div>
    );
  }

  const modelUrl = get3DModelUrl(product);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={onBack}
                className="flex items-center text-sikora-blue hover:text-sikora-cyan transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Zurück
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sikora-blue sikora-product-name">
                  {formatSikoraProductName(product.Name)}
                </h1>
                <p className="text-sm text-gray-600">SIKORA Messtechnik</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Load to Measure Point */}
              {onLoadToMeasurePoint && availableMeasurePoints.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowLoadToMeasurePoint(!showLoadToMeasurePoint)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Target className="w-4 h-4" />
                    <span className="hidden sm:inline">Auf Messpunkt laden</span>
                    <span className="sm:hidden">Laden</span>
                  </button>
                  
                  {/* Dropdown */}
                  {showLoadToMeasurePoint && (
                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-64 z-50">
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-700">Messpunkt auswählen:</p>
                      </div>
                      <div className="p-2">
                        {availableMeasurePoints.map((mp) => (
                          <label key={mp.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="radio"
                              name="measurePoint"
                              value={mp.id}
                              checked={selectedMeasurePoint === mp.id}
                              onChange={(e) => setSelectedMeasurePoint(e.target.value)}
                              className="mr-3 text-sikora-blue"
                            />
                            <span className="text-sm">{mp.name}</span>
                          </label>
                        ))}
                      </div>
                      <div className="p-3 border-t border-gray-100 flex gap-2">
                        <button
                          onClick={() => setShowLoadToMeasurePoint(false)}
                          className="flex-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          Abbrechen
                        </button>
                        <button
                          onClick={handleLoadToMeasurePoint}
                          disabled={!selectedMeasurePoint}
                          className="flex-1 px-3 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          Laden
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Datasheet Download */}
              {product.datasheet && (
                <button
                  onClick={handleDatasheetDownload}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Datenblatt</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 3D Model Viewer - Large and Prominent */}
        <div className={`${fullscreen3D ? 'fixed inset-0 z-50' : 'flex-1 lg:flex-2'} bg-gradient-to-br from-gray-900 to-gray-800 relative`}>
          <div className="w-full h-full">
            {modelUrl && !model3DError ? (
              <Canvas 
                camera={{ position: [3, 3, 3], fov: 45 }}
                className="w-full h-full"
              >
                <Suspense fallback={null}>
                  <Environment preset="studio" />
                  <ambientLight intensity={0.4} />
                  <directionalLight position={[10, 10, 5]} intensity={1} />
                  <ContactShadows position={[0, -1, 0]} opacity={0.3} scale={15} blur={2} />
                  <Model3D url={modelUrl} productName={product.Name} />
                  <OrbitControls 
                    enablePan={true} 
                    enableZoom={true} 
                    enableRotate={true}
                    autoRotate={true}
                    autoRotateSpeed={0.5}
                    minDistance={1}
                    maxDistance={10}
                  />
                </Suspense>
              </Canvas>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Maximize2 className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg">3D-Modell nicht verfügbar</p>
                  {modelUrl && (
                    <p className="text-sm mt-2 opacity-70">Fehler beim Laden</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* 3D Controls Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/70 backdrop-blur-sm text-white rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs sm:text-sm space-y-1">
                  <p>🖱️ <span className="hidden sm:inline">Linke Maustaste: </span>Rotieren</p>
                  <p>🔄 <span className="hidden sm:inline">Rechte Maustaste: </span>Verschieben</p>
                  <p>⚙️ <span className="hidden sm:inline">Mausrad: </span>Zoomen</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.location.reload()}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded transition-colors"
                    title="3D-Ansicht zurücksetzen"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setFullscreen3D(!fullscreen3D)}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded transition-colors"
                    title={fullscreen3D ? "Vollbild verlassen" : "Vollbild"}
                  >
                    {fullscreen3D ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Panel */}
        {!fullscreen3D && (
          <div className="w-full lg:w-96 xl:w-[28rem] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex overflow-x-auto">
                {[
                  { id: 'overview', label: 'Überblick', icon: FileText },
                  { id: 'specifications', label: 'Daten', icon: FileText },
                  { id: 'features', label: 'Features', icon: FileText },
                  { id: 'installation', label: 'Installation', icon: FileText }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-3 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-sikora-blue text-sikora-blue bg-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-sikora-blue mb-3">Produktbeschreibung</h3>
                    <div 
                      className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: product.HTMLDescription_DE || product.HTMLDescription_EN 
                      }}
                    />
                  </div>
                  
                  {product.advantages.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Vorteile</h4>
                      <ul className="space-y-2">
                        {product.advantages.map((advantage) => (
                          <li key={advantage.Id} className="flex items-start">
                            <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{advantage.Advantage_DE || advantage.Advantage_EN}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specifications' && (
                <div>
                  <h3 className="text-lg font-semibold text-sikora-blue mb-4">Technische Spezifikationen</h3>
                  {product.specifications.length > 0 ? (
                    <div className="space-y-3">
                      {product.specifications.map((spec) => (
                        <div key={spec.Id} className="bg-gray-50 rounded-lg p-3">
                          <div className="font-medium text-gray-900 text-sm mb-1">
                            {spec.Title_DE || spec.Title_EN}
                          </div>
                          <div className="text-sikora-blue font-mono text-sm">
                            {spec.Value_DE || spec.Value_EN}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Keine technischen Daten verfügbar</p>
                  )}
                </div>
              )}

              {activeTab === 'features' && (
                <div>
                  <h3 className="text-lg font-semibold text-sikora-blue mb-4">Features</h3>
                  {product.features.length > 0 ? (
                    <ul className="space-y-3">
                      {product.features.map((feature) => (
                        <li key={feature.Id} className="flex items-start bg-blue-50 rounded-lg p-3">
                          <span className="text-sikora-blue mr-2 mt-1 text-lg">•</span>
                          <span className="text-sm text-gray-700">{feature.Feature_DE || feature.Feature_EN}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">Keine Features verfügbar</p>
                  )}
                </div>
              )}

              {activeTab === 'installation' && (
                <div>
                  <h3 className="text-lg font-semibold text-sikora-blue mb-4">Installation</h3>
                  {product.installation ? (
                    <div 
                      className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: product.installation.InstallationInfo_DE || product.installation.InstallationInfo_EN 
                      }}
                    />
                  ) : (
                    <p className="text-gray-500 italic">Keine Installationsinformationen verfügbar</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showLoadToMeasurePoint && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowLoadToMeasurePoint(false)}
        />
      )}
    </div>
  );
};

export default ProductDetail; 