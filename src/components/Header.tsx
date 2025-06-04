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
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* SIKORA Logo - CP Design konform */}
          <div className="flex items-center space-x-3">
            <img
              src="/assets/logo.svg"
              alt="SIKORA Logo"
              className="h-8 sm:h-10 lg:h-12 w-auto"
              style={{ minWidth: '2.5cm' }} // CP Design Mindestbreite
            />
          </div>

          {/* Titel - nur auf größeren Bildschirmen, CP Design konform */}
          <div className="hidden lg:block">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-sikora-display font-medium text-sikora-blue tracking-wide">
              {/* SIKORA CP Design: Produktnamen in VERSALSATZ */}
              <span className="uppercase">SIKORA</span> Digital Showroom
            </h1>
            <p className="text-xs sm:text-sm font-sikora text-gray-600 mt-1">
              {t('appSubtitle', 'Technology to Perfection – Linienkonfigurator', 'Technology to Perfection – Line Configurator')}
            </p>
          </div>

          {/* Mobile: Nur SIKORA Text */}
          <div className="lg:hidden">
            <h1 className="text-base sm:text-lg font-sikora-display font-medium text-sikora-blue uppercase tracking-wide">
              SIKORA
            </h1>
            <p className="text-xs font-sikora text-gray-600 hidden sm:block">
              Digital Showroom
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
          {/* Sprachauswahl - CP Design konform */}
          <div className="hidden md:flex items-center space-x-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setLanguage('de')}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-sikora font-medium transition-colors duration-200 flex items-center space-x-1 ${
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
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-sikora font-medium transition-colors duration-200 flex items-center space-x-1 ${
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

          {/* Admin Button - CP Design konform */}
          <button
            onClick={onShowAdmin}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-sikora-blue hover:bg-gray-50 rounded-lg transition-colors duration-200 font-sikora"
            title={t('adminAccess', 'Admin-Bereich', 'Admin Area')}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline text-xs sm:text-sm font-medium">Admin</span>
          </button>

          {/* Product Catalog Button - CP Design konform */}
          <button
            onClick={onShowProductCatalog}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 lg:px-6 py-2 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors duration-200 font-sikora font-medium shadow-sm"
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
