import React, { useState, useEffect, Suspense } from 'react';
import { Search, Filter, ArrowLeft, ExternalLink, Grid, List, MapPin, Info, Lightbulb, Ruler, X } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { databaseService, formatSikoraProductName } from '../services/database';
import { useLanguage } from '../contexts/LanguageContext';
import ProductRecommendationWizard from './ProductRecommendationWizard';
import BoundingBoxVisualizer from './BoundingBoxVisualizer';
import type { Product, ProductCategory, MeasurePoint } from '../types';
import * as THREE from 'three';

interface ProductCatalogProps {
  onBackToLineSelection: () => void;
  onProductSelect?: (productName: string) => void;
  backButtonLabel?: string;
  selectedMeasurePoint?: MeasurePoint | null;
  showMeasurePointInfo?: boolean;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onBackToLineSelection,
  onProductSelect,
  backButtonLabel,
  selectedMeasurePoint,
  showMeasurePointInfo = false
}) => {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTechnology, setSelectedTechnology] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showDimensionsModal, setShowDimensionsModal] = useState(false);
  const [selectedProductForDimensions, setSelectedProductForDimensions] = useState<Product | null>(null);
  const [loadedModel, setLoadedModel] = useState<THREE.Object3D | null>(null);

  // Helper functions for language-specific content
  const getProductDescription = (product: Product) => {
    return language === 'de' ? product.HTMLDescription_DE : product.HTMLDescription_EN;
  };

  // Technology categories for better filtering
  const technologies = [
    { id: 'X-RAY', name: 'X-RAY Systeme', color: 'bg-red-100 text-red-800' },
    { id: 'LASER', name: 'LASER Systeme', color: 'bg-blue-100 text-blue-800' },
    { id: 'CENTERVIEW', name: 'CENTERVIEW', color: 'bg-green-100 text-green-800' },
    { id: 'SPARK', name: 'SPARK Tester', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'FIBER', name: 'FIBER Systeme', color: 'bg-purple-100 text-purple-800' },
    { id: 'CENTERWAVE', name: 'CENTERWAVE', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'PREHEATER', name: 'PREHEATER', color: 'bg-orange-100 text-orange-800' },
    { id: 'ECOCONTROL', name: 'ECOCONTROL', color: 'bg-teal-100 text-teal-800' },
  ];

  // Model3D component for dimensions modal
  interface Model3DProps {
    url: string;
    productName: string;
    onObjectLoad?: (object: THREE.Object3D) => void;
  }

  const Model3D: React.FC<Model3DProps> = ({ url, productName, onObjectLoad }) => {
    const { scene } = useGLTF(url);

    useEffect(() => {
      if (scene && onObjectLoad) {
        onObjectLoad(scene);
      }
    }, [scene, onObjectLoad]);

    return (
      <primitive
        object={scene}
        scale={[1, 1, 1]}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
    );
  };

  // Helper functions
  const get3DModelUrl = (product: Product) => {
    if (product.Object3D_Url && !product.Object3D_Url.startsWith('http')) {
      let cleanPath = product.Object3D_Url.replace(/^public\//, '').replace(/^assets\//, '');
      cleanPath = cleanPath.replace(/x-ray_6000_pro/g, 'x_ray_6000');
      cleanPath = cleanPath.replace(/x-ray_8000/g, 'x_ray_8000');
      return `/api/assets/${cleanPath}`;
    }
    return product.Object3D_Url || null;
  };

  const handleShowDimensions = (product: Product) => {
    setSelectedProductForDimensions(product);
    setShowDimensionsModal(true);
    setLoadedModel(null);
  };

  const handleModelLoad = (object: THREE.Object3D) => {
    setLoadedModel(object);
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          databaseService.getProducts(),
          databaseService.getProductCategories()
        ]);

        setProducts(productsData);
        setCategories(categoriesData);
        setFilteredProducts(productsData);
      } catch (err) {
        console.error('Failed to load catalog data:', err);
        setError(t('errorLoadingCatalog', 'Fehler beim Laden des Produktkatalogs', 'Error loading product catalog'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [t]);

  // Filter products based on search, category and technology
  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.HTMLDescription_DE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.HTMLDescription_EN?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by technology
    if (selectedTechnology) {
      filtered = filtered.filter(product =>
        product.Name.includes(selectedTechnology)
      );
    }

    // Filter by category
    if (selectedCategory !== null) {
      const categoryFilters: Record<number, (name: string) => boolean> = {
        1: (name) => name.includes('X-RAY'),
        2: (name) => name.includes('LASER'),
        3: (name) => name.includes('CENTERVIEW'),
        4: (name) => name.includes('SPARK'),
        5: (name) => name.includes('FIBER'),
        6: (name) => name.includes('CENTERWAVE'),
        7: (name) => name.includes('PREHEATER'),
        8: (name) => name.includes('ECOCONTROL'),
      };

      const filter = categoryFilters[selectedCategory];
      if (filter) {
        filtered = filtered.filter(product => filter(product.Name));
      }
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedTechnology]);

  // Group products by technology series
  const groupedProducts = filteredProducts.reduce((groups, product) => {
    const series = product.Name.split(' ')[0]; // First word is usually the series
    if (!groups[series]) {
      groups[series] = [];
    }
    groups[series].push(product);
    return groups;
  }, {} as Record<string, Product[]>);

  const getImageUrl = (product: Product) => {
    if (product.ImageUrl && !product.ImageUrl.startsWith('http')) {
      let cleanPath = product.ImageUrl.replace(/^public\//, '').replace(/^assets\//, '');
      cleanPath = cleanPath.replace(/x-ray_6000_pro/g, 'x_ray_6000');
      cleanPath = cleanPath.replace(/x-ray_8000/g, 'x_ray_8000');
      cleanPath = cleanPath.replace(/\/spark\//g, '/spark_2000_6000/');
      cleanPath = cleanPath.replace(/\/remote\//g, '/remote_6000/');

      const finalUrl = `/api/assets/${cleanPath}`;
      return finalUrl;
    }
    return product.ImageUrl || `/api/placeholder/300/200`;
  };

  const getTechnologyFromProductName = (productName: string): string => {
    const tech = technologies.find(t => productName.includes(t.id));
    return tech?.id || '';
  };

  const getTechnologyColor = (productName: string): string => {
    const tech = technologies.find(t => productName.includes(t.id));
    return tech?.color || 'bg-gray-100 text-gray-800';
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedTechnology('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loadingCatalog', 'Lade Produktkatalog...', 'Loading product catalog...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl mb-4">⚠️ {error}</p>
          <button
            onClick={onBackToLineSelection}
            className="px-4 py-2 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan"
          >
            {backButtonLabel || t('back', 'Zurück', 'Back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">

      {/* Enhanced Search and Filter Bar */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="space-y-3 sm:space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder={showMeasurePointInfo && selectedMeasurePoint
                  ? `${t('searchProductsFor', 'Produkte für', 'Search products for')} ${selectedMeasurePoint.Name_DE || selectedMeasurePoint.Name_EN || t('measurePoint', 'Messpunkt', 'Measure Point')} ${t('search', 'durchsuchen...', 'search...')}`
                  : t('searchProducts', 'Produkte durchsuchen...', 'Search products...')
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sikora-blue focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Technology Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={clearAllFilters}
                className="px-3 py-1.5 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {t('showAll', 'Alle anzeigen', 'Show all')}
              </button>
              {technologies.map((tech) => (
                <button
                  key={tech.id}
                  onClick={() => setSelectedTechnology(selectedTechnology === tech.id ? '' : tech.id)}
                  className={`px-3 py-1.5 text-xs sm:text-sm rounded-full transition-colors ${
                    selectedTechnology === tech.id
                      ? tech.color + ' ring-2 ring-offset-1 ring-sikora-blue'
                      : tech.color + ' hover:ring-1 hover:ring-sikora-blue'
                  }`}
                >
                  {tech.name}
                </button>
              ))}
            </div>

            {/* Active Filters */}
            {(searchTerm || selectedCategory || selectedTechnology) && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <Filter className="w-4 h-4" />
                <span>{t('activeFilters', 'Aktive Filter', 'Active filters')}:</span>
                {searchTerm && (
                  <span className="bg-sikora-blue text-white px-2 py-1 rounded">
                    "{searchTerm}"
                  </span>
                )}
                {selectedTechnology && (
                  <span className="bg-sikora-blue text-white px-2 py-1 rounded">
                    {technologies.find(t => t.id === selectedTechnology)?.name}
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-sikora-blue hover:text-sikora-cyan underline"
                >
                  {t('clearAll', 'Alle löschen', 'Clear all')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid/List - Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {Object.keys(groupedProducts).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t('noProductsFound', 'Keine Produkte gefunden.', 'No products found.')}</p>
              {showMeasurePointInfo && selectedMeasurePoint ? (
                <p className="text-gray-400 mt-2">
                  {t('noProductsForMeasurePoint', 'Keine Produkte für Messpunkt', 'No products found for measure point')} "{selectedMeasurePoint.Name_DE || selectedMeasurePoint.Name_EN}" {t('found', 'gefunden', 'found')}.
                </p>
              ) : (
                <p className="text-gray-400 mt-2">{t('tryOtherFilters', 'Versuchen Sie andere Suchbegriffe oder Filter.', 'Try other search terms or filters.')}</p>
              )}
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan"
              >
                {t('resetFilters', 'Filter zurücksetzen', 'Reset filters')}
              </button>
            </div>
          ) : (
            Object.entries(groupedProducts).map(([series, seriesProducts]) => (
              <div key={series} className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sikora-blue mb-4 sm:mb-6 border-b border-gray-200 pb-2">
                  {formatSikoraProductName(series)} {t('series', 'Serie', 'Series')}
                  <span className="ml-3 text-sm sm:text-base font-normal text-gray-500">
                    ({seriesProducts.length} {t('products', 'Produkte', 'Products')})
                  </span>
                </h2>

                <div className={
                  viewMode === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6"
                    : "space-y-4"
                }>
                  {seriesProducts.map((product) => (
                    <div
                      key={product.Name}
                      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}
                    >
                      {/* Product Image */}
                      <div className={`relative bg-gray-100 ${
                        viewMode === 'list' ? 'w-32 sm:w-48 flex-shrink-0' : 'h-40 sm:h-48'
                      }`}>
                        <img
                          src={getImageUrl(product)}
                          alt={product.Name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `/api/placeholder/300/200`;
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTechnologyColor(product.Name)}`}>
                            {getTechnologyFromProductName(product.Name) || series}
                          </span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className={`p-3 sm:p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col' : ''}`}>
                        <h3 className="font-bold text-sm sm:text-lg text-sikora-blue mb-2 sikora-product-name">
                          {formatSikoraProductName(product.Name)}
                        </h3>

                        <div
                          className="text-xs sm:text-sm text-gray-600 line-clamp-3 mb-3 sm:mb-4 flex-1"
                          dangerouslySetInnerHTML={{
                            __html: getProductDescription(product) || ''
                          }}
                        />

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          {/* Removed SIKORA Messtechnik text to give more space for product names */}

                          {/* Action Buttons */}
                          <div className="flex gap-2 w-full sm:w-auto">
                            {/* Details Button */}
                            <button
                              onClick={() => onProductSelect?.(product.Name)}
                              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm text-white bg-sikora-blue rounded-lg hover:bg-sikora-cyan transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex-1 sm:flex-none justify-center"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {t('viewDetails', 'Details ansehen', 'View details')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Produktempfehlungs-Wizard */}
      {showWizard && (
        <ProductRecommendationWizard
          onClose={() => setShowWizard(false)}
          onProductSelect={(productName) => {
            setShowWizard(false);
            onProductSelect?.(productName);
          }}
        />
      )}

      {/* Dimensions Modal */}
      {showDimensionsModal && selectedProductForDimensions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sikora-blue to-sikora-cyan text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    {t('productDimensions', 'Produktabmessungen', 'Product Dimensions')}
                  </h3>
                  <p className="text-sm text-white/80">
                    {formatSikoraProductName(selectedProductForDimensions.Name)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDimensionsModal(false);
                    setSelectedProductForDimensions(null);
                    setLoadedModel(null);
                  }}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 3D Model View */}
            <div className="p-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden" style={{ height: '500px' }}>
                {get3DModelUrl(selectedProductForDimensions) ? (
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
                        url={get3DModelUrl(selectedProductForDimensions) || ''}
                        productName={selectedProductForDimensions.Name}
                        onObjectLoad={handleModelLoad}
                      />
                      <BoundingBoxVisualizer
                        targetObject={loadedModel}
                        visible={true}
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
                      <Ruler className="w-20 h-20 mx-auto mb-4" />
                      <p className="text-xl font-semibold">
                        {t('3dModelNotAvailable', '3D-Modell nicht verfügbar', '3D model not available')}
                      </p>
                      <p className="text-sm mt-2">
                        {t('dimensionsNotAvailable', 'Abmessungen für dieses Produkt nicht verfügbar', 'Dimensions not available for this product')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-4 p-4 bg-sikora-blue/5 border border-sikora-blue/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-sikora-blue mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium text-sikora-blue mb-1">
                      {t('interactionHint', 'Interaktion', 'Interaction')}:
                    </p>
                    <p>
                      {t('dimensionsInstructions',
                        'Nutzen Sie die Maus, um das 3D-Modell zu drehen, zoomen und schwenken. Die Abmessungen werden automatisch angezeigt.',
                        'Use the mouse to rotate, zoom and pan the 3D model. Dimensions are displayed automatically.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
