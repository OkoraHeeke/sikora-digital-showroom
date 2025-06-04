import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { ArrowLeft, Download, FileText, Maximize2, RotateCcw } from 'lucide-react';
import { databaseService, formatSikoraProductName } from '../services/database';
import type { ProductWithDetails } from '../types';

interface ProductDetailProps {
  productName: string;
  onBack: () => void;
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

const ProductDetail: React.FC<ProductDetailProps> = ({ productName, onBack }) => {
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'features' | 'installation'>('overview');
  const [model3DError, setModel3DError] = useState(false);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center text-sikora-blue hover:text-sikora-cyan transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Zurück
              </button>
              <h1 className="text-2xl font-bold text-sikora-blue sikora-product-name">
                {formatSikoraProductName(product.Name)}
              </h1>
            </div>
            
            {/* Datasheet Download */}
            {product.datasheet && (
              <button
                onClick={handleDatasheetDownload}
                className="flex items-center px-4 py-2 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Datenblatt herunterladen
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 3D Model Viewer */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-96 relative">
              {modelUrl && !model3DError ? (
                <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
                  <Suspense fallback={null}>
                    <Environment preset="studio" />
                    <ContactShadows position={[0, -0.8, 0]} opacity={0.4} scale={10} />
                    <Model3D url={modelUrl} productName={product.Name} />
                    <OrbitControls 
                      enablePan={true} 
                      enableZoom={true} 
                      enableRotate={true}
                      autoRotate={true}
                      autoRotateSpeed={1}
                    />
                  </Suspense>
                </Canvas>
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Maximize2 className="w-12 h-12 mx-auto mb-2" />
                    <p>3D-Modell nicht verfügbar</p>
                    {modelUrl && (
                      <p className="text-sm mt-1">Fehler beim Laden: {modelUrl}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>🖱️ Linke Maustaste: Rotieren</p>
                  <p>🔄 Rechte Maustaste: Verschieben</p>
                  <p>⚙️ Mausrad: Zoomen</p>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="p-2 text-gray-400 hover:text-sikora-blue"
                  title="3D-Ansicht zurücksetzen"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-lg shadow-lg">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Überblick', icon: FileText },
                  { id: 'specifications', label: 'Technische Daten', icon: FileText },
                  { id: 'features', label: 'Features', icon: FileText },
                  { id: 'installation', label: 'Installation', icon: FileText }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-sikora-blue text-sikora-blue'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 inline mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-lg font-semibold text-sikora-blue mb-4">Produktbeschreibung</h3>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: product.HTMLDescription_DE || product.HTMLDescription_EN 
                    }}
                  />
                  
                  {product.advantages.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Vorteile</h4>
                      <ul className="space-y-2">
                        {product.advantages.map((advantage) => (
                          <li key={advantage.Id} className="flex items-start">
                            <span className="text-sikora-blue mr-2">✓</span>
                            <span className="text-sm">{advantage.Advantage_DE || advantage.Advantage_EN}</span>
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
                        <div key={spec.Id} className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-900">
                            {spec.Title_DE || spec.Title_EN}
                          </span>
                          <span className="text-gray-600">
                            {spec.Value_DE || spec.Value_EN}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Keine technischen Daten verfügbar</p>
                  )}
                </div>
              )}

              {activeTab === 'features' && (
                <div>
                  <h3 className="text-lg font-semibold text-sikora-blue mb-4">Features</h3>
                  {product.features.length > 0 ? (
                    <ul className="space-y-3">
                      {product.features.map((feature) => (
                        <li key={feature.Id} className="flex items-start">
                          <span className="text-sikora-blue mr-2 mt-1">•</span>
                          <span>{feature.Feature_DE || feature.Feature_EN}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">Keine Features verfügbar</p>
                  )}
                </div>
              )}

              {activeTab === 'installation' && (
                <div>
                  <h3 className="text-lg font-semibold text-sikora-blue mb-4">Installation</h3>
                  {product.installation ? (
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: product.installation.InstallationInfo_DE || product.installation.InstallationInfo_EN 
                      }}
                    />
                  ) : (
                    <p className="text-gray-500">Keine Installationsinformationen verfügbar</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 