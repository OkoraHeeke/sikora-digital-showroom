import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  Save,
  X,
  Upload,
  Package
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../api';
import type { Product, ProductCategory } from '../../types';

interface ProductFormData {
  Name: string;
  HTMLDescription_EN: string;
  HTMLDescription_DE: string;
  ImageUrl: string;
  Object3D_Url: string;
}

const ProductManagement: React.FC = () => {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    Name: '',
    HTMLDescription_EN: '',
    HTMLDescription_DE: '',
    ImageUrl: '',
    Object3D_Url: ''
  });

  // Produkte und Kategorien laden
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);

      if (productsData.success) setProducts(productsData.data);
      if (categoriesData.success) setCategories(categoriesData.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gefilterte Produkte
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.HTMLDescription_DE.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.HTMLDescription_EN.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Formular zurücksetzen
  const resetForm = () => {
    setFormData({
      Name: '',
      HTMLDescription_EN: '',
      HTMLDescription_DE: '',
      ImageUrl: '',
      Object3D_Url: ''
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  // Produkt bearbeiten
  const handleEdit = (product: Product) => {
    setFormData({
      Name: product.Name,
      HTMLDescription_EN: product.HTMLDescription_EN,
      HTMLDescription_DE: product.HTMLDescription_DE,
      ImageUrl: product.ImageUrl,
      Object3D_Url: product.Object3D_Url
    });
    setEditingProduct(product);
    setShowAddForm(true);
  };

  // Formular absenden
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let result;
      if (editingProduct) {
        result = await api.updateProduct(editingProduct.Name, formData);
      } else {
        result = await api.createProduct(formData);
      }

      if (result.success) {
        await loadData();
        resetForm();
      } else {
        console.error('Failed to save product:', result.error);
        alert('Fehler beim Speichern des Produkts: ' + (result.error || 'Unbekannter Fehler'));
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Fehler beim Speichern des Produkts: ' + error);
    }
  };

  // Produkt löschen
  const handleDelete = async (productName: string) => {
    if (!confirm(`Möchten Sie das Produkt "${productName}" wirklich löschen?`)) {
      return;
    }

    try {
      const result = await api.deleteProduct(productName);

      if (result.success) {
        await loadData();
        alert('Produkt erfolgreich gelöscht!');
      } else {
        console.error('Failed to delete product:', result.error);
        alert('Fehler beim Löschen des Produkts: ' + (result.error || 'Unbekannter Fehler'));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Fehler beim Löschen des Produkts: ' + error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
        <span className="ml-3 text-gray-600">Lade Produkte...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('productManagement', 'Produktverwaltung', 'Product Management')}
          </h2>
          <p className="text-gray-600">
            {products.length} {t('productsTotal', 'Produkte insgesamt', 'products total')}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addProduct', 'Produkt hinzufügen', 'Add Product')}</span>
        </button>
      </div>

      {/* Suche und Filter */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchProducts', 'Produkte suchen...', 'Search products...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="">{t('allCategories', 'Alle Kategorien', 'All Categories')}</option>
              {categories.map(category => (
                <option key={category.Id} value={category.Id.toString()}>
                  {language === 'de' ? category.Name_DE : category.Name_EN}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Produktliste */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('product', 'Produkt', 'Product')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('description', 'Beschreibung', 'Description')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  3D Model
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions', 'Aktionen', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.Name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={product.ImageUrl.replace('public/', '/api/')}
                        alt={product.Name}
                        className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                        onError={(e) => {
                          e.currentTarget.src = '/api/placeholder/48/48';
                        }}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 sikora-product-name">
                          {product.Name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 max-w-md truncate">
                      {language === 'de' 
                        ? product.HTMLDescription_DE.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                        : product.HTMLDescription_EN.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {product.Object3D_Url ? 'GLB verfügbar' : 'Kein 3D-Modell'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Bearbeiten"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.Name)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Produkt hinzufügen/bearbeiten Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProduct 
                  ? t('editProduct', 'Produkt bearbeiten', 'Edit Product')
                  : t('addNewProduct', 'Neues Produkt', 'Add New Product')
                }
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Produktname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('productName', 'Produktname', 'Product Name')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.Name}
                  onChange={(e) => setFormData({...formData, Name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="z.B. LASER 2050 XY"
                />
              </div>

              {/* Beschreibung Deutsch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('descriptionDE', 'Beschreibung (Deutsch)', 'Description (German)')} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.HTMLDescription_DE}
                  onChange={(e) => setFormData({...formData, HTMLDescription_DE: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="HTML-Beschreibung auf Deutsch..."
                />
              </div>

              {/* Beschreibung Englisch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('descriptionEN', 'Beschreibung (Englisch)', 'Description (English)')} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.HTMLDescription_EN}
                  onChange={(e) => setFormData({...formData, HTMLDescription_EN: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="HTML description in English..."
                />
              </div>

              {/* Bild URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('imageUrl', 'Bild-URL', 'Image URL')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ImageUrl}
                  onChange={(e) => setFormData({...formData, ImageUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="public/assets/images/..."
                />
              </div>

              {/* 3D-Modell URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('object3dUrl', '3D-Modell-URL', '3D Model URL')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.Object3D_Url}
                  onChange={(e) => setFormData({...formData, Object3D_Url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="public/assets/models/..."
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('cancel', 'Abbrechen', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{t('save', 'Speichern', 'Save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement; 