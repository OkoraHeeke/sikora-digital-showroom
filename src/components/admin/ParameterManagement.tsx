import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Ruler,
  AlertCircle,
  Search
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface MeasureParameter {
  Id: number;
  Name_EN: string;
  Name_DE: string;
}

const ParameterManagement: React.FC = () => {
  const { t } = useLanguage();
  const [parameters, setParameters] = useState<MeasureParameter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newParameter, setNewParameter] = useState({
    Name_EN: '',
    Name_DE: ''
  });

  // Load parameters from database
  const loadParameters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/measureparameters');
      if (response.ok) {
        const data = await response.json();
        setParameters(data);
      } else {
        throw new Error('Failed to load parameters');
      }
    } catch (err) {
      console.error('Error loading parameters:', err);
      setError('Fehler beim Laden der Messparameter');
      // Fallback data
      setParameters([
        { Id: 1, Name_EN: 'Diameter', Name_DE: 'Durchmesser' },
        { Id: 2, Name_EN: 'Wall Thickness', Name_DE: 'Wanddicke' },
        { Id: 3, Name_EN: 'Concentricity', Name_DE: 'Konzentrizität' },
        { Id: 4, Name_EN: 'Ovality', Name_DE: 'Ovalität' },
        { Id: 5, Name_EN: 'Temperature', Name_DE: 'Temperatur' },
        { Id: 6, Name_EN: 'Capacity', Name_DE: 'Kapazität' },
        { Id: 7, Name_EN: 'Fault Detection', Name_DE: 'Fehlerdetektion' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParameters();
  }, []);

  // Filter parameters based on search term
  const filteredParameters = parameters.filter(param =>
    param.Name_EN.toLowerCase().includes(searchTerm.toLowerCase()) ||
    param.Name_DE.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle add parameter
  const handleAddParameter = async () => {
    if (!newParameter.Name_EN.trim() || !newParameter.Name_DE.trim()) {
      setError('Bitte füllen Sie alle Felder aus');
      return;
    }

    try {
      const response = await fetch('/api/measureparameters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newParameter)
      });

      if (response.ok) {
        setNewParameter({ Name_EN: '', Name_DE: '' });
        setShowAddForm(false);
        loadParameters();
      } else {
        throw new Error('Failed to create parameter');
      }
    } catch (err) {
      console.error('Error creating parameter:', err);
      setError('Fehler beim Erstellen des Messparameters');
    }
  };

  // Handle delete parameter
  const handleDeleteParameter = async (id: number) => {
    if (!confirm('Möchten Sie diesen Messparameter wirklich löschen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/measureparameters/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadParameters();
      } else {
        throw new Error('Failed to delete parameter');
      }
    } catch (err) {
      console.error('Error deleting parameter:', err);
      setError('Fehler beim Löschen des Messparameters');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Ruler className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messparameter</h1>
              <p className="text-gray-600">Verwalten Sie die verfügbaren Messparameter</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Neuer Parameter</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Parameter suchen..."
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Neuen Messparameter hinzufügen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Englisch)
                </label>
                <input
                  type="text"
                  value={newParameter.Name_EN}
                  onChange={(e) => setNewParameter(prev => ({ ...prev, Name_EN: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="z.B. Diameter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Deutsch)
                </label>
                <input
                  type="text"
                  value={newParameter.Name_DE}
                  onChange={(e) => setNewParameter(prev => ({ ...prev, Name_DE: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="z.B. Durchmesser"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAddParameter}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Save className="w-4 h-4" />
                <span>Speichern</span>
              </button>
            </div>
          </div>
        )}

        {/* Parameters Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name (EN)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name (DE)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="loading-spinner w-5 h-5"></div>
                        <span>Lade Messparameter...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredParameters.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'Keine Messparameter gefunden' : 'Keine Messparameter verfügbar'}
                    </td>
                  </tr>
                ) : (
                  filteredParameters.map((parameter) => (
                    <tr key={parameter.Id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {parameter.Id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parameter.Name_EN}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parameter.Name_DE}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setEditingId(parameter.Id)}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Bearbeiten"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteParameter(parameter.Id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 text-sm text-gray-500">
          Gesamt: {parameters.length} Messparameter
          {searchTerm && ` | Gefiltert: ${filteredParameters.length}`}
        </div>
      </div>
    </div>
  );
};

export default ParameterManagement;
