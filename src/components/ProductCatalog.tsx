import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowLeft, ExternalLink, Grid, List } from 'lucide-react';
import { databaseService, formatSikoraProductName } from '../services/database';
import type { Product, ProductCategory } from '../types';

interface ProductCatalogProps {
  onBackToLineSelection: () => void;
  onProductSelect?: (productName: string) => void;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ 
  onBackToLineSelection, 
  onProductSelect
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTechnology, setSelectedTechnology] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError('Fehler beim Laden des Produktkatalogs');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
          <p className="text-gray-600">Lade Produktkatalog...</p>
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
            Zurück zur Startseite
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0 z-10 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={onBackToLineSelection}
                className="flex items-center text-sikora-blue hover:text-sikora-cyan transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Zurück
              </button>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sikora-blue">
                SIKORA Produktkatalog
              </h1>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                {filteredProducts.length} von {products.length} Produkten
              </div>
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-sikora-blue shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white text-sikora-blue shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter Bar */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="space-y-3 sm:space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Produkte durchsuchen..."
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
                Alle anzeigen
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
                <span>Aktive Filter:</span>
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
                  Alle löschen
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
              <p className="text-gray-500 text-lg">Keine Produkte gefunden.</p>
              <p className="text-gray-400 mt-2">Versuchen Sie andere Suchbegriffe oder Filter.</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan"
              >
                Filter zurücksetzen
              </button>
            </div>
          ) : (
            Object.entries(groupedProducts).map(([series, seriesProducts]) => (
              <div key={series} className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sikora-blue mb-4 sm:mb-6 border-b border-gray-200 pb-2">
                  {formatSikoraProductName(series)} Serie
                  <span className="ml-3 text-sm sm:text-base font-normal text-gray-500">
                    ({seriesProducts.length} Produkte)
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
                            __html: product.HTMLDescription_DE || product.HTMLDescription_EN || ''
                          }}
                        />

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="text-xs text-gray-500">
                            SIKORA Messtechnik
                          </div>
                          
                          {/* Single Details Button */}
                          <button
                            onClick={() => onProductSelect?.(product.Name)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm text-white bg-sikora-blue rounded-md hover:bg-sikora-cyan transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                            Details ansehen
                          </button>
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
    </div>
  );
};

export default ProductCatalog; 