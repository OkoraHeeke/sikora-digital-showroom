import React, { useState } from 'react';
import { Search, Settings, Globe, Download, Share, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  onShowProductCatalog: () => void;
  onShowAdmin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowProductCatalog, onShowAdmin }) => {
  const { language, setLanguage, t } = useLanguage();
  const { isInstallable, isInstalled, installPWA, isIOSSafari } = usePWAInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const handleInstallClick = async () => {
    console.log('Install button clicked, isIOSSafari:', isIOSSafari);
    if (isIOSSafari) {
      setShowIOSInstructions(true);
    } else {
      const result = await installPWA();
      console.log('Install result:', result);
    }
  };

  // Debug function to check PWA status
  const handleDebug = () => {
    console.log('PWA Debug Info:', {
      isInstallable,
      isInstalled,
      isIOSSafari,
      serviceWorkerSupported: 'serviceWorker' in navigator,
      hasBeforeInstallPrompt: 'onbeforeinstallprompt' in window,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      userAgent: navigator.userAgent
    });
    setDebugMode(!debugMode);
  };

  // Force show install button for debugging
  const showInstallButton = !isInstalled && (isInstallable || debugMode);

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo und Titel */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-sikora-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">S</span>
              </div>
              <div className="ml-3">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-sikora-blue leading-tight">
                  SIKORA Digital Showroom
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 leading-none">
                  {t('interactiveConfiguration', 'Interaktive 3D-Konfiguration', 'Interactive 3D Configuration')}
                </p>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            {/* Debug Button (temporary) */}
            <button
              onClick={handleDebug}
              className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
              title="PWA Debug"
            >
              PWA
            </button>

            {/* PWA Install Button */}
            {showInstallButton && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                title={t('installApp', 'App installieren', 'Install App')}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {debugMode ? 'PWA (Debug)' : t('installApp', 'App installieren', 'Install App')}
                </span>
                <span className="sm:hidden">
                  {t('install', 'Install', 'Install')}
                </span>
              </button>
            )}

            {/* App Installed Indicator */}
            {isInstalled && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {t('appInstalled', 'App installiert', 'App installed')}
                </span>
                <span className="sm:hidden">✓</span>
              </div>
            )}

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
              className="p-2 sm:px-3 sm:py-2 text-gray-600 hover:text-sikora-blue hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              title="Admin"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden lg:inline text-sm font-medium">Admin</span>
            </button>

            {/* Produktkatalog Button */}
            <button
              onClick={onShowProductCatalog}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-sikora-blue text-white rounded-lg hover:bg-sikora-cyan transition-colors duration-200 flex items-center space-x-2 text-sm font-medium"
            >
              <Search className="w-4 h-4" />
              <span className="sm:hidden">{t('catalog', 'Katalog', 'Catalog')}</span>
              <span className="hidden sm:inline">{t('productCatalog', 'Produktkatalog', 'Product Catalog')}</span>
            </button>
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
