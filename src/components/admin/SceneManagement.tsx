import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Save,
  X,
  Layers,
  Camera,
  Map
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Scene } from '../../types';

interface SceneFormData {
  Name_EN: string;
  Name_DE: string;
  CameraStartX: number;
  CameraStartY: number;
  CameraStartZ: number;
}

const SceneManagement: React.FC = () => {
  const { t, language } = useLanguage();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [formData, setFormData] = useState<SceneFormData>({
    Name_EN: '',
    Name_DE: '',
    CameraStartX: 0,
    CameraStartY: 5,
    CameraStartZ: 10
  });

  // Szenen laden
  useEffect(() => {
    loadScenes();
  }, []);

  const loadScenes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scenes');
      const data = await response.json();

      if (data.success) {
        setScenes(data.data);
      }
    } catch (error) {
      console.error('Failed to load scenes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gefilterte Szenen
  const filteredScenes = scenes.filter(scene => {
    const searchLower = searchTerm.toLowerCase();
    return scene.Name_DE.toLowerCase().includes(searchLower) ||
           scene.Name_EN.toLowerCase().includes(searchLower);
  });

  // Formular zurücksetzen
  const resetForm = () => {
    setFormData({
      Name_EN: '',
      Name_DE: '',
      CameraStartX: 0,
      CameraStartY: 5,
      CameraStartZ: 10
    });
    setEditingScene(null);
    setShowAddForm(false);
  };

  // Szene bearbeiten
  const handleEdit = (scene: Scene) => {
    setFormData({
      Name_EN: scene.Name_EN,
      Name_DE: scene.Name_DE,
      CameraStartX: scene.CameraStartX,
      CameraStartY: scene.CameraStartY,
      CameraStartZ: scene.CameraStartZ
    });
    setEditingScene(scene);
    setShowAddForm(true);
  };

  // Formular absenden
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingScene 
        ? `/api/scenes/${editingScene.Id}`
        : '/api/scenes';
      
      const method = editingScene ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadScenes();
        resetForm();
      } else {
        console.error('Failed to save scene');
      }
    } catch (error) {
      console.error('Error saving scene:', error);
    }
  };

  // Szene löschen
  const handleDelete = async (sceneId: number, sceneName: string) => {
    if (!confirm(`Möchten Sie die Szene "${sceneName}" wirklich löschen?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/scenes/${sceneId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadScenes();
      } else {
        console.error('Failed to delete scene');
      }
    } catch (error) {
      console.error('Error deleting scene:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
        <span className="ml-3 text-gray-600">Lade Szenen...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('sceneManagement', 'Szenen-Verwaltung', 'Scene Management')}
          </h2>
          <p className="text-gray-600">
            {scenes.length} {t('scenesTotal', 'Szenen insgesamt', 'scenes total')}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addScene', 'Szene hinzufügen', 'Add Scene')}</span>
        </button>
      </div>

      {/* Suche */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchScenes', 'Szenen suchen...', 'Search scenes...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Szenen-Liste */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sceneName', 'Szenenname', 'Scene Name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('cameraPosition', 'Kameraposition', 'Camera Position')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions', 'Aktionen', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredScenes.map((scene) => (
                <tr key={scene.Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {scene.Id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Layers className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {language === 'de' ? scene.Name_DE : scene.Name_EN}
                        </div>
                        <div className="text-sm text-gray-500">
                          {language === 'de' ? scene.Name_EN : scene.Name_DE}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Camera className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        X: {scene.CameraStartX}, Y: {scene.CameraStartY}, Z: {scene.CameraStartZ}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(scene)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Bearbeiten"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(scene.Id, language === 'de' ? scene.Name_DE : scene.Name_EN)}
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

      {/* Szene hinzufügen/bearbeiten Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingScene 
                  ? t('editScene', 'Szene bearbeiten', 'Edit Scene')
                  : t('addNewScene', 'Neue Szene', 'Add New Scene')
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
                  {t('sceneNameDE', 'Szenenname (Deutsch)', 'Scene Name (German)')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.Name_DE}
                  onChange={(e) => setFormData({...formData, Name_DE: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="z.B. Draht & Kabel CV Linie"
                />
              </div>

              {/* Name Englisch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sceneNameEN', 'Szenenname (Englisch)', 'Scene Name (English)')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.Name_EN}
                  onChange={(e) => setFormData({...formData, Name_EN: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g. Wire & Cable CV Line"
                />
              </div>

              {/* Kameraposition */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Camera X
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.CameraStartX}
                    onChange={(e) => setFormData({...formData, CameraStartX: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Camera Y
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.CameraStartY}
                    onChange={(e) => setFormData({...formData, CameraStartY: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Camera Z
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.CameraStartZ}
                    onChange={(e) => setFormData({...formData, CameraStartZ: parseFloat(e.target.value) || 0})}
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

export default SceneManagement; 