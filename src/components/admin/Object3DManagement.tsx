import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Box,
  AlertCircle,
  Search,
  Upload,
  Eye,
  Download,
  FileText
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Object3D {
  Id: number;
  Url: string;
  Name?: string;
  Description?: string;
  FileSize?: number;
  CreatedAt?: string;
}

const Object3DManagement: React.FC = () => {
  const { t } = useLanguage();
  const [objects, setObjects] = useState<Object3D[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [newObject, setNewObject] = useState({
    Name: '',
    Description: '',
    file: null as File | null
  });

  // Load 3D objects from database
  const loadObjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/objects3d');
      if (response.ok) {
        const data = await response.json();
        setObjects(data);
      } else {
        throw new Error('Failed to load 3D objects');
      }
    } catch (err) {
      console.error('Error loading 3D objects:', err);
      setError('Fehler beim Laden der 3D-Objekte');
      // Fallback data - some example models
      setObjects([
        { Id: 1, Url: 'public/assets/models/x-ray_6000_pro/x-ray_6120_pro.glb', Name: 'X-RAY 6120 PRO' },
        { Id: 2, Url: 'public/assets/models/laser_series_2000/laser_2050_xy.glb', Name: 'LASER 2050 XY' },
        { Id: 3, Url: 'public/assets/models/centerwave_6000/centerwave_6000_400.glb', Name: 'CENTERWAVE 6000/400' },
        { Id: 4, Url: 'neuelinie.glb', Name: 'Production Line' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadObjects();
  }, []);

  // Filter objects based on search term
  const filteredObjects = objects.filter(obj =>
    (obj.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    obj.Url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.glb')) {
        setError('Nur GLB-Dateien sind erlaubt');
        return;
      }
      setNewObject(prev => ({ ...prev, file }));
      setError(null);
    }
  };

  // Handle add 3D object
  const handleAddObject = async () => {
    if (!newObject.file || !newObject.Name.trim()) {
      setError('Bitte wählen Sie eine GLB-Datei und geben Sie einen Namen ein');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', newObject.file);
      formData.append('name', newObject.Name);
      formData.append('description', newObject.Description || '');

      const response = await fetch('/api/objects3d/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setNewObject({ Name: '', Description: '', file: null });
        setShowAddForm(false);
        loadObjects();
      } else {
        throw new Error('Failed to upload 3D object');
      }
    } catch (err) {
      console.error('Error uploading 3D object:', err);
      setError('Fehler beim Hochladen des 3D-Objekts');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle delete object
  const handleDeleteObject = async (id: number, url: string) => {
    if (!confirm('Möchten Sie dieses 3D-Objekt wirklich löschen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/objects3d/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadObjects();
      } else {
        throw new Error('Failed to delete 3D object');
      }
    } catch (err) {
      console.error('Error deleting 3D object:', err);
      setError('Fehler beim Löschen des 3D-Objekts');
    }
  };

  // Get file name from URL
  const getFileName = (url: string) => {
    return url.split('/').pop() || url;
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Box className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">3D-Objekte</h1>
              <p className="text-gray-600">Verwalten Sie GLB-Modelle für die 3D-Visualisierung</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>3D-Objekt hinzufügen</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="3D-Objekte suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">3D-Objekt hinzufügen</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GLB-Datei auswählen
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    accept=".glb"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />
                  {newObject.file && (
                    <span className="text-sm text-green-600">
                      {newObject.file.name} ({formatFileSize(newObject.file.size)})
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newObject.Name}
                    onChange={(e) => setNewObject(prev => ({ ...prev, Name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="z.B. X-RAY 6120 PRO"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beschreibung
                  </label>
                  <input
                    type="text"
                    value={newObject.Description}
                    onChange={(e) => setNewObject(prev => ({ ...prev, Description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Optionale Beschreibung"
                  />
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                disabled={isUploading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAddObject}
                disabled={isUploading || !newObject.file || !newObject.Name.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Hochladen...' : 'Hochladen'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Objects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <div className="loading-spinner w-5 h-5"></div>
                <span className="text-gray-500">Lade 3D-Objekte...</span>
              </div>
            </div>
          ) : filteredObjects.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              {searchTerm ? 'Keine 3D-Objekte gefunden' : 'Keine 3D-Objekte verfügbar'}
            </div>
          ) : (
            filteredObjects.map((object) => (
              <div key={object.Id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* Preview Area */}
                <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Box className="w-12 h-12 text-gray-400" />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {object.Name || getFileName(object.Url)}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {getFileName(object.Url)}
                  </p>
                  {object.Description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {object.Description}
                    </p>
                  )}

                  {/* File Info */}
                  <div className="text-xs text-gray-500 space-y-1">
                    {object.FileSize && (
                      <div>Größe: {formatFileSize(object.FileSize)}</div>
                    )}
                    {object.CreatedAt && (
                      <div>Erstellt: {new Date(object.CreatedAt).toLocaleDateString('de-DE')}</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(object.Url, '_blank')}
                        className="text-indigo-600 hover:text-indigo-800 p-1"
                        title="Vorschau"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(object.Id)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Bearbeiten"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteObject(object.Id, object.Url)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 text-sm text-gray-500">
          Gesamt: {objects.length} 3D-Objekte
          {searchTerm && ` | Gefiltert: ${filteredObjects.length}`}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Hinweise zu 3D-Objekten:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Nur GLB-Dateien werden unterstützt</li>
                <li>Empfohlene maximale Dateigröße: 10 MB</li>
                <li>Modelle sollten optimiert und für Web-Darstellung geeignet sein</li>
                <li>Verwenden Sie beschreibende Namen für bessere Organisation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Object3DManagement;
