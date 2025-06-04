import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Package,
  MapPin,
  Layers,
  Tags,
  Ruler,
  TrendingUp,
  Activity,
  Database,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface DashboardStats {
  scenes: number;
  measurePoints: number;
  products: number;
  categories: number;
  parameters: number;
  configurations: number;
}

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    scenes: 0,
    measurePoints: 0,
    products: 0,
    categories: 0,
    parameters: 0,
    configurations: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Statistiken laden
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);

        // Parallel laden aller Statistiken
        const [scenesRes, measurePointsRes, productsRes, categoriesRes, parametersRes] = await Promise.all([
          fetch('/api/scenes'),
          fetch('/api/scenes/1/measurepoints'), // Für Demo Szene 1
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/measureparameters')
        ]);

        const scenes = await scenesRes.json();
        const measurePoints = await measurePointsRes.json();
        const products = await productsRes.json();
        const categories = await categoriesRes.json();
        const parameters = await parametersRes.json();

        setStats({
          scenes: scenes.success ? scenes.data.length : 0,
          measurePoints: measurePoints.success ? measurePoints.data.length : 0,
          products: products.success ? products.data.length : 0,
          categories: categories.success ? categories.data.length : 0,
          parameters: parameters.success ? parameters.data.length : 0,
          configurations: 0 // TODO: Implementiere Konfigurationsstatistik
        });

        // Mock recent activity für Demo
        setRecentActivity([
          { id: 1, type: 'product', action: 'created', name: 'LASER 2050 XY', time: '2 Stunden' },
          { id: 2, type: 'measurepoint', action: 'updated', name: 'Extrusion Zone', time: '4 Stunden' },
          { id: 3, type: 'scene', action: 'modified', name: 'Draht & Kabel CV Linie', time: '1 Tag' },
          { id: 4, type: 'product', action: 'updated', name: 'X-RAY 6000 PRO', time: '2 Tage' }
        ]);

      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    {
      title: t('scenes', 'Szenen', 'Scenes'),
      value: stats.scenes,
      icon: Layers,
      color: 'blue',
      change: '+2.3%'
    },
    {
      title: t('measurePoints', 'Messpunkte', 'Measure Points'),
      value: stats.measurePoints,
      icon: MapPin,
      color: 'green',
      change: '+5.1%'
    },
    {
      title: t('products', 'Produkte', 'Products'),
      value: stats.products,
      icon: Package,
      color: 'purple',
      change: '+12.5%'
    },
    {
      title: t('categories', 'Kategorien', 'Categories'),
      value: stats.categories,
      icon: Tags,
      color: 'orange',
      change: '+1.2%'
    },
    {
      title: t('parameters', 'Parameter', 'Parameters'),
      value: stats.parameters,
      icon: Ruler,
      color: 'red',
      change: '+3.7%'
    },
    {
      title: t('configurations', 'Konfigurationen', 'Configurations'),
      value: stats.configurations,
      icon: Activity,
      color: 'indigo',
      change: '+8.9%'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'product': return Package;
      case 'measurepoint': return MapPin;
      case 'scene': return Layers;
      default: return Activity;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'created': return 'text-green-600 bg-green-100';
      case 'updated': return 'text-blue-600 bg-blue-100';
      case 'deleted': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
        <span className="ml-3 text-gray-600">Lade Dashboard-Daten...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full space-y-8 p-8 overflow-y-auto">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-sikora-blue to-sikora-cyan rounded-xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-3">
          {t('welcomeAdmin', 'Willkommen im Admin-Bereich', 'Welcome to Admin Area')}
        </h2>
        <p className="text-blue-100 text-lg">
          {t('adminWelcomeText',
            'Verwalten Sie alle Inhalte und Funktionen des SIKORA Digital Showrooms',
            'Manage all content and functions of the SIKORA Digital Showroom'
          )}
        </p>
      </div>

      {/* Statistics Cards - Use full width on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-6">
        {statCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${card.color}-100`}>
                  <IconComponent className={`w-6 h-6 text-${card.color}-600`} />
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-600`}>
                  {card.change}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-600 font-medium">{card.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {t('recentActivity', 'Letzte Aktivitäten', 'Recent Activity')}
            </h3>
            <Activity className="w-6 h-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className={`p-3 rounded-xl ${getActivityColor(activity.action)}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.action === 'created' ? 'Erstellt' :
                       activity.action === 'updated' ? 'Aktualisiert' :
                       activity.action === 'deleted' ? 'Gelöscht' : activity.action} vor {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {t('quickActions', 'Schnellaktionen', 'Quick Actions')}
            </h3>
            <TrendingUp className="w-6 h-6 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="p-6 text-left hover:bg-blue-50 border border-gray-200 rounded-xl transition-all hover:border-blue-300 hover:shadow-sm">
              <Package className="w-8 h-8 text-blue-600 mb-3" />
              <p className="font-semibold text-gray-900 mb-1">Neues Produkt</p>
              <p className="text-sm text-gray-500">Produkt hinzufügen</p>
            </button>
            <button className="p-6 text-left hover:bg-green-50 border border-gray-200 rounded-xl transition-all hover:border-green-300 hover:shadow-sm">
              <MapPin className="w-8 h-8 text-green-600 mb-3" />
              <p className="font-semibold text-gray-900 mb-1">Messpunkt</p>
              <p className="text-sm text-gray-500">Position erstellen</p>
            </button>
            <button className="p-6 text-left hover:bg-purple-50 border border-gray-200 rounded-xl transition-all hover:border-purple-300 hover:shadow-sm">
              <Layers className="w-8 h-8 text-purple-600 mb-3" />
              <p className="font-semibold text-gray-900 mb-1">Neue Szene</p>
              <p className="text-sm text-gray-500">Linie hinzufügen</p>
            </button>
            <button className="p-6 text-left hover:bg-orange-50 border border-gray-200 rounded-xl transition-all hover:border-orange-300 hover:shadow-sm">
              <Database className="w-8 h-8 text-orange-600 mb-3" />
              <p className="font-semibold text-gray-900 mb-1">Backup</p>
              <p className="text-sm text-gray-500">Daten sichern</p>
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {t('systemStatus', 'Systemstatus', 'System Status')}
          </h3>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-sm text-green-600 font-semibold">Online</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
            <Database className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <p className="font-semibold text-green-700 text-lg">Datenbank</p>
            <p className="text-sm text-green-600">Verbunden</p>
          </div>
          <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
            <BarChart3 className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <p className="font-semibold text-blue-700 text-lg">API</p>
            <p className="text-sm text-blue-600">Läuft</p>
          </div>
          <div className="text-center p-6 bg-orange-50 rounded-xl border border-orange-100">
            <AlertCircle className="w-10 h-10 text-orange-600 mx-auto mb-3" />
            <p className="font-semibold text-orange-700 text-lg">Speicher</p>
            <p className="text-sm text-orange-600">75% belegt</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
