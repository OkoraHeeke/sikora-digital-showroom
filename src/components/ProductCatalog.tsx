import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowLeft, ExternalLink } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Filter products based on search and category
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

    // Filter by category
    if (selectedCategory !== null) {
      // Note: This would need the Join_Product_Category data to work properly
      // For now, we'll filter by product name patterns
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
  }, [products, searchTerm, selectedCategory]);

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
      // Remove 'public/' prefix and 'assets/' if it exists, since our asset server serves from 'assets/'
      let cleanPath = product.ImageUrl.replace(/^public\//, '').replace(/^assets\//, '');
      
      // Fix folder name mappings between database and actual folder structure
      cleanPath = cleanPath.replace(/x-ray_6000_pro/g, 'x_ray_6000');
      cleanPath = cleanPath.replace(/x-ray_8000/g, 'x_ray_8000');
      cleanPath = cleanPath.replace(/\/spark\//g, '/spark_2000_6000/');
      cleanPath = cleanPath.replace(/\/remote\//g, '/remote_6000/');
      
      const finalUrl = `/api/assets/${cleanPath}`;
      console.log(`Image mapping: ${product.ImageUrl} -> ${finalUrl}`);
      return finalUrl;
    }
    return product.ImageUrl || `/api/placeholder/300/200`;
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
      <div className="bg-white border-b border-gray-200 flex-shrink-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToLineSelection}
                className="flex items-center text-sikora-blue hover:text-sikora-cyan transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Zurück
              </button>
              <h1 className="text-2xl font-bold text-sikora-blue">
                SIKORA Produktkatalog
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              {filteredProducts.length} von {products.length} Produkten
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Produkte durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sikora-blue focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sikora-blue focus:border-transparent"
              >
                <option value="">Alle Kategorien</option>
                <option value="1">X-RAY Systeme</option>
                <option value="2">LASER Systeme</option>
                <option value="3">CENTERVIEW Systeme</option>
                <option value="4">SPARK Tester</option>
                <option value="5">FIBER Systeme</option>
                <option value="6">CENTERWAVE Systeme</option>
                <option value="7">PREHEATER Systeme</option>
                <option value="8">ECOCONTROL Systeme</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid - Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {Object.keys(groupedProducts).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Keine Produkte gefunden.</p>
              <p className="text-gray-400 mt-2">Versuchen Sie andere Suchbegriffe oder Filter.</p>
            </div>
          ) : (
            Object.entries(groupedProducts).map(([series, seriesProducts]) => (
              <div key={series} className="mb-12">
                <h2 className="text-2xl font-bold text-sikora-blue mb-6 border-b border-gray-200 pb-2">
                  {formatSikoraProductName(series)} Serie
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {seriesProducts.map((product) => (
                    <div
                      key={product.Name}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                      onClick={() => onProductSelect?.(product.Name)}
                    >
                      {/* Product Image */}
                      <div className="relative h-48 bg-gray-100">
                        <img
                          src={getImageUrl(product)}
                          alt={product.Name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const originalSrc = target.src;
                            console.log(`Failed to load image: ${originalSrc} for product: ${product.Name}`);
                            target.src = `/api/placeholder/300/200`;
                          }}
                          onLoad={(e) => {
                            const target = e.target as HTMLImageElement;
                            console.log(`Successfully loaded image: ${target.src} for product: ${product.Name}`);
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <span className="bg-sikora-blue text-white px-2 py-1 rounded text-xs font-medium">
                            {series}
                          </span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-sikora-blue mb-2 sikora-product-name">
                          {formatSikoraProductName(product.Name)}
                        </h3>
                        
                        <div 
                          className="text-sm text-gray-600 line-clamp-3 mb-4"
                          dangerouslySetInnerHTML={{ 
                            __html: product.HTMLDescription_DE || product.HTMLDescription_EN || ''
                          }}
                        />

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            SIKORA Messtechnik
                          </div>
                          <ExternalLink className="w-4 h-4 text-sikora-blue group-hover:text-sikora-cyan" />
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