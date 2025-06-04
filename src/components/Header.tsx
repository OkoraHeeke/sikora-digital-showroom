import React from 'react';
import { Package, Globe, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  onShowProductCatalog: () => void;
  onShowAdmin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowProductCatalog, onShowAdmin }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-sikora-blue to-sikora-cyan rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-base sm:text-lg">S</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-sikora-blue">
              {t('appTitle', 'SIKORA Digital Showroom', 'SIKORA Digital Showroom')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              {t('appSubtitle', 'Linienkonfigurator', 'Line Configurator')}
            </p>
          </div>
          {/* Mobile Title */}
          <div className="sm:hidden">
            <h1 className="text-base font-bold text-sikora-blue">SIKORA</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
          {/* Sprachauswahl - Hidden on very small screens */}
          <div className="hidden md:flex items-center space-x-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setLanguage('de')}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                  language === 'de'
                    ? 'bg-white text-sikora-blue shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="text-sm">🇩🇪</span>
                <span className="hidden sm:inline">DE</span>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                  language === 'en'
                    ? 'bg-white text-sikora-blue shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="text-sm">🇬🇧</span>
                <span className="hidden sm:inline">EN</span>
              </button>
            </div>
          </div>

          {/* Admin Button - Icon only on small screens */}
          <button
            onClick={onShowAdmin}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title={t('adminAccess', 'Admin-Bereich', 'Admin Area')}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline text-xs sm:text-sm font-medium">Admin</span>
          </button>

          {/* Product Catalog Button - Responsive */}
          <button
            onClick={onShowProductCatalog}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-2 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors duration-200 font-medium"
          >
            <Package className="w-4 h-4" />
            <span className="text-xs sm:text-sm lg:text-base">
              <span className="sm:hidden">Katalog</span>
              <span className="hidden sm:inline">{t('productCatalog', 'Produktkatalog', 'Product Catalog')}</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 