import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  MapPin,
  Package,
  Link,
  Unlink,
  RefreshCw,
  Settings,
  Target
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { MeasurePoint, Product, Scene } from '../../types';

interface ProductMeasurePointMapping {
  measurePointId: number;
  measurePointName: string;
  sceneId: number;
  sceneName: string;
  assignedProducts: Product[];
  availableProducts: Product[];
}

const ProductMeasurePointMapping: React.FC = () => {
  const { t, language } = useLanguage();
  const [mappings, setMappings] = useState<ProductMeasurePointMapping[]>([]);
  const [measurePoints, setMeasurePoints] = useState<MeasurePoint[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeasurePoint, setSelectedMeasurePoint] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Daten laden
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Parallel laden aller Daten
      const [scenesRes, measurePointsRes, productsRes] = await Promise.all([
        fetch('/api/scenes'),
        fetch('/api/measurepoints'),
        fetch('/api/products')
      ]);

      const scenesData = await scenesRes.json();
      const measurePointsData = await measurePointsRes.json();
      const productsData = await productsRes.json();

      if (scenesData.success) setScenes(scenesData.data);
      if (measurePointsData.success) setMeasurePoints(measurePointsData.data);
      if (productsData.success) setProducts(productsData.data);

      // Zuordnungen für jeden Messpunkt laden
      if (measurePointsData.success) {
        await loadMappings(measurePointsData.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMappings = async (measurePoints: MeasurePoint[]) => {
    const mappings: ProductMeasurePointMapping[] = [];

    for (const mp of measurePoints) {
      try {
        const productsRes = await fetch(`/api/measurepoints/${mp.Id}/products`);
        const productsData = await productsRes.json();

        const scene = scenes.find(s => s.Id === mp.Scene_Id);

        mappings.push({
          measurePointId: mp.Id,
          measurePointName: language === 'de' ? mp.Name_DE : mp.Name_EN,
          sceneId: mp.Scene_Id,
          sceneName: scene ? (language === 'de' ? scene.Name_DE : scene.Name_EN) : `Scene ${mp.Scene_Id}`,
          assignedProducts: productsData.success ? productsData.data : [],
          availableProducts: products
        });
      } catch (error) {
        console.error(`Failed to load products for measure point ${mp.Id}:`, error);
      }
    }

    setMappings(mappings);
  };

  // Gefilterte Zuordnungen
  const filteredMappings = mappings.filter(mapping =>
    mapping.measurePointName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.sceneName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Scene Name bekommen
  const getSceneName = (sceneId: number) => {
    const scene = scenes.find(s => s.Id === sceneId);
    if (!scene) return `Scene ${sceneId}`;
    return language === 'de' ? scene.Name_DE : scene.Name_EN;
  };

  // Produkt zu Messpunkt zuordnen
  const handleAssignProducts = async () => {
    if (!selectedMeasurePoint || selectedProducts.length === 0) return;

    try {
      // Hier würden wir API-Calls machen, um die Zuordnungen zu speichern
      // Da die API noch nicht existiert, simulieren wir es
      console.log('Assigning products to measure point:', {
        measurePointId: selectedMeasurePoint,
        products: selectedProducts
      });

      // Reload mappings
      await loadMappings(measurePoints);

      setShowAssignDialog(false);
      setSelectedProducts([]);
      setSelectedMeasurePoint(null);
    } catch (error) {
      console.error('Failed to assign products:', error);
    }
  };

  // Produkt von Messpunkt entfernen
  const handleUnassignProduct = async (measurePointId: number, productName: string) => {
    if (!confirm(`Möchten Sie das Produkt "${productName}" vom Messpunkt entfernen?`)) {
      return;
    }

    try {
      // Hier würde API-Call für das Entfernen gemacht
      console.log('Unassigning product from measure point:', {
        measurePointId,
        productName
      });

      // Reload mappings
      await loadMappings(measurePoints);
    } catch (error) {
      console.error('Failed to unassign product:', error);
    }
  };

  // Dialog für Produktzuordnung öffnen
  const openAssignDialog = (measurePointId: number) => {
    setSelectedMeasurePoint(measurePointId);
    setSelectedProducts([]);
    setShowAssignDialog(true);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
        <span className="ml-3 text-gray-600">Lade Zuordnungen...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('productMeasurePointMapping', 'Produkt-Messpunkt-Zuordnung', 'Product-MeasurePoint Mapping')}
          </h2>
          <p className="text-gray-600">
            Definieren Sie, welche Produkte an welchen Messpunkten verfügbar sind
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Aktualisieren</span>
        </button>
      </div>

      {/* Suche */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Messpunkte oder Szenen suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Zuordnungen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMappings.map((mapping) => (
          <div key={mapping.measurePointId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {mapping.measurePointName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {mapping.sceneName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => openAssignDialog(mapping.measurePointId)}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Zuordnen</span>
                </button>
              </div>
            </div>

            {/* Zugeordnete Produkte */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Zugeordnete Produkte ({mapping.assignedProducts.length})
                </h4>
                <div className="flex items-center space-x-1">
                  <Link className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-500">Aktiv</span>
                </div>
              </div>

              {mapping.assignedProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Keine Produkte zugeordnet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {mapping.assignedProducts.map((product) => (
                    <div key={product.Name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {product.Name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleUnassignProduct(mapping.measurePointId, product.Name)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Entfernen"
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Produktzuordnung Dialog */}
      {showAssignDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Produkte zu Messpunkt zuordnen
              </h3>
              <button
                onClick={() => setShowAssignDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Produktauswahl */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Verfügbare Produkte auswählen:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto p-4 border border-gray-200 rounded-lg">
                  {products.map((product) => (
                    <label key={product.Name} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.Name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product.Name]);
                          } else {
                            setSelectedProducts(selectedProducts.filter(p => p !== product.Name));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 truncate">
                        {product.Name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ausgewählte Produkte */}
              {selectedProducts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Ausgewählte Produkte ({selectedProducts.length}):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProducts.map((productName) => (
                      <span key={productName} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {productName}
                        <button
                          onClick={() => setSelectedProducts(selectedProducts.filter(p => p !== productName))}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => setShowAssignDialog(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAssignProducts}
                disabled={selectedProducts.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>Zuordnungen speichern</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductMeasurePointMapping;
