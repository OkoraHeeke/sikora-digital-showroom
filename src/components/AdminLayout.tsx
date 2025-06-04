import React, { useState } from 'react';
import {
  Settings,
  Database,
  Package,
  MapPin,
  Layers,
  Tags,
  Ruler,
  BarChart3,
  Upload,
  Users,
  Home,
  FileText,
  Box,
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onBackToApp: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeSection,
  onSectionChange,
  onBackToApp
}) => {
  const { t } = useLanguage();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const adminSections = [
    {
      id: 'dashboard',
      name: t('dashboard', 'Dashboard', 'Dashboard'),
      icon: BarChart3,
      description: t('dashboardDesc', 'Übersicht und Statistiken', 'Overview and Statistics')
    },
    {
      id: 'scenes',
      name: t('scenes', 'Szenen', 'Scenes'),
      icon: Layers,
      description: t('scenesDesc', 'Produktionslinien verwalten', 'Manage Production Lines')
    },
    {
      id: 'measurepoints',
      name: t('measurePoints', 'Messpunkte', 'Measure Points'),
      icon: MapPin,
      description: t('measurePointsDesc', 'Messpositionen bearbeiten', 'Edit Measurement Positions')
    },
    {
      id: 'products',
      name: t('products', 'Produkte', 'Products'),
      icon: Package,
      description: t('productsDesc', 'SIKORA Produktkatalog', 'SIKORA Product Catalog')
    },
    {
      id: 'categories',
      name: t('categories', 'Kategorien', 'Categories'),
      icon: Tags,
      description: t('categoriesDesc', 'Produktkategorien', 'Product Categories')
    },
    {
      id: 'parameters',
      name: t('parameters', 'Messparameter', 'Measure Parameters'),
      icon: Ruler,
      description: t('parametersDesc', 'Messparameter definieren', 'Define Measurement Parameters')
    },
    {
      id: 'mappings',
      name: t('mappings', 'Produkt-Zuordnung', 'Product Mapping'),
      icon: Settings,
      description: t('mappingsDesc', 'Produkte zu Messpunkten zuordnen', 'Assign Products to Measure Points')
    },
    {
      id: 'objects3d',
      name: t('objects3d', '3D-Objekte', '3D Objects'),
      icon: Box,
      description: t('objects3dDesc', 'GLB-Modelle verwalten', 'Manage GLB Models')
    },
    {
      id: 'uploads',
      name: t('uploads', 'Uploads', 'Uploads'),
      icon: Upload,
      description: t('uploadsDesc', 'Dateien hochladen', 'Upload Files')
    }
  ];

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-xs text-gray-500">SIKORA Management</p>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ArrowLeft className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Back to App Button */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={onBackToApp}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm text-sikora-blue hover:bg-blue-50 rounded-lg transition-colors duration-200 ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <Home className="w-4 h-4" />
            {!sidebarCollapsed && <span>Zurück zur Anwendung</span>}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {adminSections.map((section) => {
            const IconComponent = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 text-sm rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? section.name : ''}
              >
                <IconComponent className={`w-5 h-5 ${isActive ? 'text-red-600' : 'text-gray-500'}`} />
                {!sidebarCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="font-medium">{section.name}</div>
                    <div className="text-xs text-gray-500">{section.description}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Expand Button */}
        {sidebarCollapsed && (
          <div className="p-4">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-full p-2 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-5 h-5 text-gray-500 mx-auto" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {adminSections.find(s => s.id === activeSection)?.name || 'Admin'}
              </h1>
              <p className="text-sm text-gray-600">
                {adminSections.find(s => s.id === activeSection)?.description}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                SIKORA Digital Showroom Admin
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
