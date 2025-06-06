import React, { useState } from 'react';
import { Search, Settings, Globe, Download, Share, X, ArrowLeft, Target, FileText, Lightbulb, Grid, List, MapPin, Info, Ruler } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { formatSikoraProductName } from '../services/database';

interface HeaderProps {
  onShowProductCatalog: () => void;
  onShowAdmin: () => void;
  // Additional props for different views
  currentView?: 'lineSelection' | 'configuration' | 'productCatalog' | 'productDetail' | 'admin';
  // For back navigation
  onBack?: () => void;
  backButtonLabel?: string;
  // For product catalog
  selectedMeasurePoint?: any;
  showMeasurePointInfo?: boolean;
  filteredProductsCount?: number;
  totalProductsCount?: number;
  onShowWizard?: () => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  // For product detail
  productName?: string;
  productTechnology?: string;
  onDatasheetDownload?: () => void;
  onLoadToMeasurePoint?: () => void;
  onToggleDimensions?: () => void;
  showDimensions?: boolean;
  hasDatasheet?: boolean;
  canLoadToMeasurePoint?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onShowProductCatalog,
  onShowAdmin,
  currentView = 'lineSelection',
  onBack,
  backButtonLabel,
  selectedMeasurePoint,
  showMeasurePointInfo,
  filteredProductsCount,
  totalProductsCount,
  onShowWizard,
  viewMode,
  onViewModeChange,
  productName,
  productTechnology,
  onDatasheetDownload,
  onLoadToMeasurePoint,
  onToggleDimensions,
  showDimensions = false,
  hasDatasheet = false,
  canLoadToMeasurePoint = false
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { isInstallable, isInstalled, installPWA, isIOSSafari } = usePWAInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const handleInstallClick = async () => {
    if (isIOSSafari) {
      setShowIOSInstructions(true);
    } else {
      await installPWA();
    }
  };

  const showInstallButton = !isInstalled && isInstallable;

  // Get technology gradient for product detail
  const getTechnologyGradient = (tech: string) => {
    const gradients: Record<string, string> = {
      'X-RAY': 'from-red-600 to-red-800',
      'LASER': 'from-blue-600 to-blue-800',
      'CENTERVIEW': 'from-green-600 to-green-800',
      'CENTERWAVE': 'from-indigo-600 to-indigo-800',
      'FIBER': 'from-purple-600 to-purple-800',
      'SPARK': 'from-yellow-600 to-yellow-800',
      'PREHEATER': 'from-orange-600 to-orange-800',
      'ECOCONTROL': 'from-teal-600 to-teal-800',
    };
    return gradients[tech] || 'from-sikora-blue to-sikora-cyan';
  };

  // Determine header background based on view
  const getHeaderBackground = () => {
    if (currentView === 'productDetail' && productTechnology) {
      return `bg-gradient-to-r ${getTechnologyGradient(productTechnology)} text-white`;
    }
    if (currentView === 'productCatalog' && showMeasurePointInfo) {
      return 'bg-gradient-to-r from-sikora-blue to-sikora-cyan text-white';
    }
    return 'bg-white border-b border-gray-200 text-gray-900';
  };

  return (
    <>
      <header className={`${getHeaderBackground()} px-3 sm:px-4 lg:px-6 py-2 shadow-sm`}>
        <div className="flex items-center justify-between h-12">
          {/* Left Side - Logo, Back, Title */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Back Button (for catalog and detail views) */}
            {(currentView === 'productCatalog' || currentView === 'productDetail') && onBack && (
              <button
                onClick={onBack}
                className="flex items-center px-2 py-1 rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{backButtonLabel || t('back', 'Zurück', 'Back')}</span>
              </button>
            )}

            {/* Logo and Title */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex items-center flex-shrink-0">
                <div className="h-10 flex items-center">
                  <img
                    src="/assets/logo.svg"
                    alt="SIKORA"
                    className="h-8 w-auto"
                    style={{
                      filter: (currentView === 'productDetail' || currentView === 'productCatalog') &&
                              (productTechnology || showMeasurePointInfo)
                        ? 'brightness(0) invert(1)'
                        : 'none'
                    }}
                  />
                </div>
              </div>

              {/* Dynamic Title based on current view */}
              <div className="min-w-0 flex-1">
                {currentView === 'productDetail' && productName ? (
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      {productTechnology && (
                        <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                          {productTechnology}
                        </span>
                      )}
                      <span className="text-white/80 text-xs">SIKORA</span>
                    </div>
                    <h1 className="text-lg sm:text-xl font-bold truncate">
                      {formatSikoraProductName(productName)}
                    </h1>
                  </div>
                ) : currentView === 'productCatalog' ? (
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold">
                      {t('sikoraProductCatalog', 'SIKORA Produktkatalog', 'SIKORA Product Catalog')}
                    </h1>
                    {showMeasurePointInfo && selectedMeasurePoint && (
                      <p className="text-sm opacity-90 truncate">
                        {selectedMeasurePoint.Name_DE || selectedMeasurePoint.Name_EN || `${t('measurePoint', 'Messpunkt', 'Measure Point')} ${selectedMeasurePoint.Id}`}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-sikora-blue">
                      SIKORA Digital Showroom
                    </h1>
                    <p className="text-xs text-gray-500">
                      {t('interactiveConfiguration', 'Interaktive 3D-Konfiguration', 'Interactive 3D Configuration')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Product Catalog Features */}
            {currentView === 'productCatalog' && (
              <>
                {/* Produktempfehlungs-Button */}
                {onShowWizard && (
                  <button
                    onClick={onShowWizard}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-sikora-blue to-sikora-cyan text-white rounded-lg hover:from-sikora-cyan hover:to-sikora-blue transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span className="hidden sm:inline">Produktempfehlung</span>
                    <span className="sm:hidden">Empfehlung</span>
                  </button>
                )}

                {/* Product Count */}
                {filteredProductsCount !== undefined && totalProductsCount !== undefined && (
                  <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {filteredProductsCount} {t('of', 'von', 'of')} {totalProductsCount}
                  </div>
                )}

                {/* View Mode Toggle */}
                {viewMode && onViewModeChange && (
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => onViewModeChange('grid')}
                      className={`p-1.5 rounded-md transition-colors ${
                        viewMode === 'grid' ? 'bg-white text-sikora-blue shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onViewModeChange('list')}
                      className={`p-1.5 rounded-md transition-colors ${
                        viewMode === 'list' ? 'bg-white text-sikora-blue shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Product Detail Actions */}
            {currentView === 'productDetail' && (
              <div className="flex items-center gap-2">
                {onToggleDimensions && (
                  <button
                    onClick={onToggleDimensions}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium border-2 ${
                      showDimensions
                        ? 'bg-sikora-cyan text-white border-sikora-cyan shadow-lg'
                        : 'bg-white text-sikora-blue hover:bg-sikora-cyan hover:text-white border-white hover:border-sikora-cyan'
                    }`}
                  >
                    <Ruler className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('dimensions', 'Abmessungen', 'Dimensions')}</span>
                  </button>
                )}

                {hasDatasheet && onDatasheetDownload && (
                  <button
                    onClick={onDatasheetDownload}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors text-white text-sm font-medium border border-white/30"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('datasheet', 'Datenblatt', 'Datasheet')}</span>
                  </button>
                )}

                {canLoadToMeasurePoint && onLoadToMeasurePoint && (
                  <button
                    onClick={onLoadToMeasurePoint}
                    className="flex items-center gap-1 px-3 py-1.5 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors text-sm font-medium shadow-md"
                  >
                    <Target className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('loadToMeasurePoint', 'Auf Messpunkt laden', 'Load to Measure Point')}</span>
                  </button>
                )}
              </div>
            )}

            {/* PWA Install Button */}
            {showInstallButton && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1 px-2 py-1.5 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                <span className="hidden lg:inline">{t('installApp', 'App installieren', 'Install App')}</span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="hidden md:flex items-center">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('de')}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    language === 'de'
                      ? 'bg-white text-sikora-blue shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  🇩🇪
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    language === 'en'
                      ? 'bg-white text-sikora-blue shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  🇬🇧
                </button>
              </div>
            </div>

            {/* Admin Button */}
            <button
              onClick={onShowAdmin}
              className="p-1.5 text-gray-600 hover:text-sikora-blue hover:bg-gray-50 rounded-lg transition-colors"
              title="Admin"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Catalog Button (if not already in catalog) */}
            {currentView !== 'productCatalog' && (
              <button
                onClick={onShowProductCatalog}
                className="flex items-center gap-1 px-3 py-1.5 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors text-sm font-medium"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">{t('productCatalog', 'Produktkatalog', 'Product Catalog')}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* iOS Safari Installation Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {t('installOnIOS', 'App auf iOS installieren', 'Install App on iOS')}
                </h3>
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-xs">1</span>
                  </div>
                  <div>
                    <p className="font-medium mb-1">
                      {t('tapShareButton', 'Teilen-Button antippen', 'Tap the Share button')}
                    </p>
                    <p className="text-gray-600">
                      {t('findShareInSafari', 'Finden Sie das Teilen-Symbol in der Safari-Leiste', 'Find the Share icon in the Safari toolbar')}
                    </p>
                    <div className="mt-2 flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Share className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium">
                        {t('shareIcon', 'Teilen', 'Share')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-xs">2</span>
                  </div>
                  <div>
                    <p className="font-medium mb-1">
                      {t('addToHomeScreen', '"Zum Home-Bildschirm" wählen', 'Select "Add to Home Screen"')}
                    </p>
                    <p className="text-gray-600">
                      {t('scrollAndTap', 'Scrollen Sie nach unten und tippen Sie auf diese Option', 'Scroll down and tap this option')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-xs">3</span>
                  </div>
                  <div>
                    <p className="font-medium mb-1">
                      {t('confirmInstallation', 'Installation bestätigen', 'Confirm installation')}
                    </p>
                    <p className="text-gray-600">
                      {t('tapAddButton', 'Tippen Sie auf "Hinzufügen" um die App zu installieren', 'Tap "Add" to install the app')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="w-full px-4 py-3 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors font-medium"
                >
                  {t('understood', 'Verstanden', 'Got it')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
