import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MapPin,
  Save,
  X,
  Layers,
  Move3D
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { MeasurePoint, Scene } from '../../types';

interface MeasurePointFormData {
  Name_EN: string;
  Name_DE: string;
  SpacePosX: number;
  SpacePosY: number;
  SpacePosZ: number;
  Scene_Id: number;
}

const MeasurePointManagement: React.FC = () => {
  const { t, language } = useLanguage();
  const [measurePoints, setMeasurePoints] = useState<MeasurePoint[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSceneFilter, setSelectedSceneFilter] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMeasurePoint, setEditingMeasurePoint] = useState<MeasurePoint | null>(null);
  const [formData, setFormData] = useState<MeasurePointFormData>({
    Name_EN: '',
    Name_DE: '',
    SpacePosX: 0,
    SpacePosY: 0,
    SpacePosZ: 0,
    Scene_Id: 1
  });

  // Daten laden
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Szenen laden
      const scenesResponse = await fetch('/api/scenes');
      const scenesData = await scenesResponse.json();
      if (scenesData.success) {
        setScenes(scenesData.data);
        if (scenesData.data.length > 0) {
          setFormData(prev => ({ ...prev, Scene_Id: scenesData.data[0].Id }));
        }
      }

      // Messpunkte laden
      await loadMeasurePoints();
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMeasurePoints = async () => {
    try {
      const response = await fetch('/api/measurepoints');
      const data = await response.json();

      if (data.success) {
        setMeasurePoints(data.data);
      }
    } catch (error) {
      console.error('Failed to load measure points:', error);
    }
  };

  // Gefilterte Messpunkte
  const filteredMeasurePoints = measurePoints.filter(mp => {
    const matchesSearch = mp.Name_DE.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mp.Name_EN.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesScene = selectedSceneFilter === '' || 
                        mp.Scene_Id.toString() === selectedSceneFilter;
    
    return matchesSearch && matchesScene;
  });

  // Formular zurücksetzen
  const resetForm = () => {
    setFormData({
      Name_EN: '',
      Name_DE: '',
      SpacePosX: 0,
      SpacePosY: 0,
      SpacePosZ: 0,
      Scene_Id: scenes.length > 0 ? scenes[0].Id : 1
    });
    setEditingMeasurePoint(null);
    setShowAddForm(false);
  };

  // Messpunkt bearbeiten
  const handleEdit = (measurePoint: MeasurePoint) => {
    setFormData({
      Name_EN: measurePoint.Name_EN,
      Name_DE: measurePoint.Name_DE,
      SpacePosX: measurePoint.SpacePosX,
      SpacePosY: measurePoint.SpacePosY,
      SpacePosZ: measurePoint.SpacePosZ,
      Scene_Id: measurePoint.Scene_Id
    });
    setEditingMeasurePoint(measurePoint);
    setShowAddForm(true);
  };

  // Formular absenden
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingMeasurePoint 
        ? `/api/measurepoints/${editingMeasurePoint.Id}`
        : '/api/measurepoints';
      
      const method = editingMeasurePoint ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadMeasurePoints();
        resetForm();
      } else {
        console.error('Failed to save measure point');
      }
    } catch (error) {
      console.error('Error saving measure point:', error);
    }
  };

  // Messpunkt löschen
  const handleDelete = async (measurePointId: number, measurePointName: string) => {
    if (!confirm(`Möchten Sie den Messpunkt "${measurePointName}" wirklich löschen?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/measurepoints/${measurePointId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadMeasurePoints();
      } else {
        console.error('Failed to delete measure point');
      }
    } catch (error) {
      console.error('Error deleting measure point:', error);
    }
  };

  // Scene Name bekommen
  const getSceneName = (sceneId: number) => {
    const scene = scenes.find(s => s.Id === sceneId);
    if (!scene) return `Scene ${sceneId}`;
    return language === 'de' ? scene.Name_DE : scene.Name_EN;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
        <span className="ml-3 text-gray-600">Lade Messpunkte...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('measurePointManagement', 'Messpunkt-Verwaltung', 'Measure Point Management')}
          </h2>
          <p className="text-gray-600">
            {measurePoints.length} {t('measurePointsTotal', 'Messpunkte insgesamt', 'measure points total')}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addMeasurePoint', 'Messpunkt hinzufügen', 'Add Measure Point')}</span>
        </button>
      </div>

      {/* Suche und Filter */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchMeasurePoints', 'Messpunkte suchen...', 'Search measure points...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-gray-400" />
            <select
              value={selectedSceneFilter}
              onChange={(e) => setSelectedSceneFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="">{t('allScenes', 'Alle Szenen', 'All Scenes')}</option>
              {scenes.map(scene => (
                <option key={scene.Id} value={scene.Id.toString()}>
                  {language === 'de' ? scene.Name_DE : scene.Name_EN}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messpunkte-Liste */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('measurePointName', 'Messpunkt', 'Measure Point')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('scene', 'Szene', 'Scene')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('position', 'Position', 'Position')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions', 'Aktionen', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMeasurePoints.map((measurePoint) => (
                <tr key={measurePoint.Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {measurePoint.Id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {language === 'de' ? measurePoint.Name_DE : measurePoint.Name_EN}
                        </div>
                        <div className="text-sm text-gray-500">
                          {language === 'de' ? measurePoint.Name_EN : measurePoint.Name_DE}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Layers className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {getSceneName(measurePoint.Scene_Id)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Move3D className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        X: {measurePoint.SpacePosX.toFixed(1)}, Y: {measurePoint.SpacePosY.toFixed(1)}, Z: {measurePoint.SpacePosZ.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(measurePoint)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Bearbeiten"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(measurePoint.Id, language === 'de' ? measurePoint.Name_DE : measurePoint.Name_EN)}
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

      {/* Messpunkt hinzufügen/bearbeiten Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMeasurePoint 
                  ? t('editMeasurePoint', 'Messpunkt bearbeiten', 'Edit Measure Point')
                  : t('addNewMeasurePoint', 'Neuer Messpunkt', 'Add New Measure Point')
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
              {/* Szene auswählen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('scene', 'Szene', 'Scene')} *
                </label>
                <select
                  required
                  value={formData.Scene_Id}
                  onChange={(e) => setFormData({...formData, Scene_Id: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {scenes.map(scene => (
                    <option key={scene.Id} value={scene.Id}>
                      {language === 'de' ? scene.Name_DE : scene.Name_EN}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name Deutsch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('measurePointNameDE', 'Messpunkt (Deutsch)', 'Measure Point (German)')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.Name_DE}
                  onChange={(e) => setFormData({...formData, Name_DE: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="z.B. Extrusionszone"
                />
              </div>

              {/* Name Englisch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('measurePointNameEN', 'Messpunkt (Englisch)', 'Measure Point (English)')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.Name_EN}
                  onChange={(e) => setFormData({...formData, Name_EN: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g. Extrusion Zone"
                />
              </div>

              {/* 3D Position */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position X
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.SpacePosX}
                    onChange={(e) => setFormData({...formData, SpacePosX: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position Y
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.SpacePosY}
                    onChange={(e) => setFormData({...formData, SpacePosY: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position Z
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.SpacePosZ}
                    onChange={(e) => setFormData({...formData, SpacePosZ: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
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

export default MeasurePointManagement; 