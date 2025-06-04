import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Tags,
  Save,
  X
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { ProductCategory } from '../../types';

interface CategoryFormData {
  Name_EN: string;
  Name_DE: string;
}

const CategoryManagement: React.FC = () => {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    Name_EN: '',
    Name_DE: ''
  });

  // Kategorien laden
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gefilterte Kategorien
  const filteredCategories = categories.filter(category => {
    const searchLower = searchTerm.toLowerCase();
    return category.Name_DE.toLowerCase().includes(searchLower) ||
           category.Name_EN.toLowerCase().includes(searchLower);
  });

  // Formular zurücksetzen
  const resetForm = () => {
    setFormData({
      Name_EN: '',
      Name_DE: ''
    });
    setEditingCategory(null);
    setShowAddForm(false);
  };

  // Kategorie bearbeiten
  const handleEdit = (category: ProductCategory) => {
    setFormData({
      Name_EN: category.Name_EN,
      Name_DE: category.Name_DE
    });
    setEditingCategory(category);
    setShowAddForm(true);
  };

  // Formular absenden
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCategory 
        ? `/api/categories/${editingCategory.Id}`
        : '/api/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadCategories();
        resetForm();
      } else {
        console.error('Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  // Kategorie löschen
  const handleDelete = async (categoryId: number, categoryName: string) => {
    if (!confirm(`Möchten Sie die Kategorie "${categoryName}" wirklich löschen?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadCategories();
      } else {
        console.error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
        <span className="ml-3 text-gray-600">Lade Kategorien...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('categoryManagement', 'Kategorie-Verwaltung', 'Category Management')}
          </h2>
          <p className="text-gray-600">
            {categories.length} {t('categoriesTotal', 'Kategorien insgesamt', 'categories total')}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addCategory', 'Kategorie hinzufügen', 'Add Category')}</span>
        </button>
      </div>

      {/* Suche */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchCategories', 'Kategorien suchen...', 'Search categories...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Kategorien-Liste */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('categoryName', 'Kategoriename', 'Category Name')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions', 'Aktionen', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category.Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.Id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Tags className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {language === 'de' ? category.Name_DE : category.Name_EN}
                        </div>
                        <div className="text-sm text-gray-500">
                          {language === 'de' ? category.Name_EN : category.Name_DE}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Bearbeiten"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.Id, language === 'de' ? category.Name_DE : category.Name_EN)}
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

      {/* Kategorie hinzufügen/bearbeiten Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory 
                  ? t('editCategory', 'Kategorie bearbeiten', 'Edit Category')
                  : t('addNewCategory', 'Neue Kategorie', 'Add New Category')
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
              {/* Name Deutsch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('categoryNameDE', 'Kategoriename (Deutsch)', 'Category Name (German)')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.Name_DE}
                  onChange={(e) => setFormData({...formData, Name_DE: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="z.B. Röntgengeräte"
                />
              </div>

              {/* Name Englisch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('categoryNameEN', 'Kategoriename (Englisch)', 'Category Name (English)')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.Name_EN}
                  onChange={(e) => setFormData({...formData, Name_EN: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g. X-Ray Devices"
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

export default CategoryManagement; 