import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import LineSelection from './components/LineSelection';
import ConfigurationSidebar from './components/ConfigurationSidebar';
import Scene3D from './components/Scene3D';
import DetailsPanel from './components/DetailsPanel';
import ProductCatalog from './components/ProductCatalog';
import ProductDetail from './components/ProductDetail';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import ProductManagement from './components/admin/ProductManagement';
import SceneManagement from './components/admin/SceneManagement';
import MeasurePointManagement from './components/admin/MeasurePointManagement';
import CategoryManagement from './components/admin/CategoryManagement';
import UploadManagement from './components/admin/UploadManagement';
import { LanguageProvider } from './contexts/LanguageContext';
import { 
  databaseService, 
  testConnection, 
  getSceneIdForLineType,
  createFallbackData 
} from './services/database';
import type { 
  Scene, 
  MeasurePoint, 
  Product, 
  ProductWithDetails,
  LineType, 
  ConfiguratorState,
  SceneData 
} from './types';

function App() {
  // State Management
  const [state, setState] = useState<ConfiguratorState>({
    selectedScene: null,
    selectedLineType: null,
    selectedMeasurePoint: null,
    selectedProduct: null,
    configuration: {},
    sidebarOpen: true,
    rightPanelOpen: true,
    view3DMode: 'line',
    measurePoints: [],
    products: [],
    loading: false,
  });

  // New state for views
  const [currentView, setCurrentView] = useState<'lineSelection' | 'configuration' | 'productCatalog' | 'productDetail' | 'admin'>('lineSelection');
  const [sceneData, setSceneData] = useState<SceneData | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<ProductWithDetails | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [databaseConnected, setDatabaseConnected] = useState<boolean>(false);
  const [adminSection, setAdminSection] = useState<string>('dashboard');

  // Helper function to update state
  const updateState = useCallback((updates: Partial<ConfiguratorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Test database connection on app start
  useEffect(() => {
    const checkDatabase = async () => {
      updateState({ loading: true });
      
      try {
        const connected = await testConnection();
        setDatabaseConnected(connected);
        
        if (!connected) {
          console.warn('Database not connected, using fallback data');
          setError('Datenbank nicht verbunden - verwende Fallback-Daten');
        }
        
        updateState({ loading: false });
      } catch (err) {
        console.error('Database connection check failed:', err);
        setDatabaseConnected(false);
        setError('Datenbankverbindung fehlgeschlagen');
        updateState({ loading: false });
      }
    };

    checkDatabase();
  }, [updateState]);

  // Load scene data when line type is selected
  const loadSceneData = useCallback(async (lineType: LineType) => {
    try {
      updateState({ loading: true });
      
      if (!databaseConnected) {
        // Use fallback data if database is not connected
        const fallbackData = createFallbackData();
        const scene = fallbackData.scenes[0];
        const measurePoints = fallbackData.measurePoints;
        
        const sceneData: SceneData = {
          scene,
          staticObjects: [{
            id: 'neuelinie',
            url: 'neuelinie.glb',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
          }],
          measurePoints,
        };

        setSceneData(sceneData);
        updateState({ 
          selectedScene: scene,
          measurePoints: measurePoints,
          loading: false 
        });
        return;
      }

      // Use real database
      const sceneId = getSceneIdForLineType(lineType);
      const sceneData = await databaseService.getSceneData(sceneId);
      
      setSceneData(sceneData);
      updateState({ 
        selectedScene: sceneData.scene,
        measurePoints: sceneData.measurePoints,
        loading: false 
      });

    } catch (err) {
      console.error('Failed to load scene data:', err);
      setError('Fehler beim Laden der Szene');
      updateState({ loading: false });
    }
  }, [updateState, databaseConnected]);

  // Load product details when product is selected
  const loadProductDetails = useCallback(async (productName: string) => {
    try {
      updateState({ loading: true });
      
      if (!databaseConnected) {
        updateState({ loading: false });
        return;
      }
      
      const productDetails = await databaseService.getProductWithDetails(productName);
      setSelectedProductDetails(productDetails);
      updateState({ loading: false });
    } catch (err) {
      console.error('Failed to load product details:', err);
      setError('Fehler beim Laden der Produktdetails');
      updateState({ loading: false });
    }
  }, [updateState, databaseConnected]);

  // Load products for a measure point
  const loadProductsForMeasurePoint = useCallback(async (measurePointId: string) => {
    try {
      if (!databaseConnected) return;
      
      const products = await databaseService.getProductsForMeasurePoint(parseInt(measurePointId));
      updateState({ products });
    } catch (err) {
      console.error('Failed to load products for measure point:', err);
    }
  }, [updateState, databaseConnected]);

  // Event Handlers
  const handleLineSelect = useCallback((lineType: LineType) => {
    updateState({ selectedLineType: lineType });
    setCurrentView('configuration');
    loadSceneData(lineType);
  }, [updateState, loadSceneData]);

  const handleBackToLineSelection = useCallback(() => {
    updateState({
      selectedLineType: null,
      selectedScene: null,
      selectedMeasurePoint: null,
      selectedProduct: null,
      configuration: {},
      measurePoints: [],
      products: [],
    });
    setCurrentView('lineSelection');
    setSceneData(null);
    setSelectedProductDetails(null);
  }, [updateState]);

  const handleShowProductCatalog = useCallback(() => {
    setCurrentView('productCatalog');
  }, []);

  const handleProductCatalogSelect = useCallback((productName: string) => {
    setSelectedProductName(productName);
    setCurrentView('productDetail');
  }, []);

  const handleMeasurePointSelect = useCallback((measurePointId: string) => {
    updateState({ 
      selectedMeasurePoint: measurePointId,
      selectedProduct: null 
    });
    setSelectedProductDetails(null);
    loadProductsForMeasurePoint(measurePointId);
  }, [updateState, loadProductsForMeasurePoint]);

  const handleProductSelect = useCallback((productName: string) => {
    updateState({ selectedProduct: productName });
    loadProductDetails(productName);
  }, [updateState, loadProductDetails]);

  const handleTabChange = useCallback((tab: 'overview' | 'measurePoints' | 'products') => {
    // Tab functionality removed - no longer needed
  }, []);

  const handleShowMeasurePoints = useCallback(() => {
    // Simply select a measurement point if available
    if (state.measurePoints.length > 0 && !state.selectedMeasurePoint) {
      handleMeasurePointSelect(state.measurePoints[0].Id.toString());
    }
  }, [state.measurePoints, state.selectedMeasurePoint]);

  const handleShowProducts = useCallback(() => {
    setCurrentView('productCatalog');
  }, []);

  const handleMeasurePointClick = useCallback((measurePointId: string) => {
    handleMeasurePointSelect(measurePointId);
  }, [handleMeasurePointSelect]);

  const handleConfigureProduct = useCallback((measurePointId: string, productName: string) => {
    setState(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [measurePointId]: productName
      }
    }));
  }, []);

  const handleBackFromProductDetail = useCallback(() => {
    setCurrentView('productCatalog');
    setSelectedProductName('');
  }, []);

  const handleShowAdmin = useCallback(() => {
    console.log('Admin button clicked - switching to admin view');
    setCurrentView('admin');
  }, []);

  const handleBackFromAdmin = useCallback(() => {
    console.log('Back from admin - switching to line selection');
    setCurrentView('lineSelection');
  }, []);

  const handleAdminSectionChange = useCallback((section: string) => {
    console.log('Admin section changed to:', section);
    setAdminSection(section);
  }, []);

  // Get selected measure point data
  const selectedMeasurePointData = state.selectedMeasurePoint 
    ? state.measurePoints.find(mp => mp.Id.toString() === state.selectedMeasurePoint) || null
    : null;

  // Build products lookup map for 3D scene
  const productsLookup = state.products.reduce((acc, product) => {
    acc[product.Name] = {
      Object3D_Url: product.Object3D_Url.replace('public/', '/api/'),
      Name: product.Name
    };
    return acc;
  }, {} as Record<string, { Object3D_Url: string; Name: string }>);

  // Debug: Log current view
  console.log('Current view:', currentView, 'Admin section:', adminSection);

  // Main render
  return (
    <LanguageProvider>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        {currentView !== 'admin' && (
          <Header 
            onShowProductCatalog={handleShowProductCatalog}
            onShowAdmin={handleShowAdmin}
          />
        )}

        {/* Database Connection Status */}
        {!databaseConnected && currentView !== 'admin' && (
          <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2 text-yellow-800 text-sm">
            ⚠️ Datenbank nicht verbunden - verwende Fallback-Daten. 
            Starten Sie den API-Server mit: <code className="bg-yellow-200 px-1 rounded">npm run db:server</code>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {currentView === 'admin' && (
            /* Admin View */
            <AdminLayout
              activeSection={adminSection}
              onSectionChange={handleAdminSectionChange}
              onBackToApp={handleBackFromAdmin}
            >
              {adminSection === 'dashboard' && <AdminDashboard />}
              {adminSection === 'products' && <ProductManagement />}
              {adminSection === 'scenes' && <SceneManagement />}
              {adminSection === 'measurepoints' && <MeasurePointManagement />}
              {adminSection === 'categories' && <CategoryManagement />}
              {adminSection === 'parameters' && <div className="p-6">Parameter-Verwaltung (Coming Soon)</div>}
              {adminSection === 'objects3d' && <div className="p-6">3D-Objekt-Verwaltung (Coming Soon)</div>}
              {adminSection === 'uploads' && <UploadManagement />}
            </AdminLayout>
          )}

          {currentView === 'lineSelection' && (
            /* Line Selection View */
            <LineSelection onLineSelect={handleLineSelect} />
          )}

          {currentView === 'productCatalog' && (
            /* Product Catalog View */
            <ProductCatalog 
              onBackToLineSelection={handleBackToLineSelection}
              onProductSelect={handleProductCatalogSelect}
            />
          )}

          {currentView === 'productDetail' && (
            /* Product Detail View */
            <ProductDetail 
              productName={selectedProductName}
              onBack={handleBackFromProductDetail}
            />
          )}

          {currentView === 'configuration' && (
            /* Configuration View */
            <>
              {/* Left Sidebar */}
              <ConfigurationSidebar
                scene={state.selectedScene}
                lineType={state.selectedLineType}
                measurePoints={state.measurePoints}
                products={state.products}
                configuration={state.configuration}
                selectedMeasurePoint={state.selectedMeasurePoint}
                onBackToLineSelection={handleBackToLineSelection}
                onMeasurePointSelect={handleMeasurePointSelect}
                onProductSelect={handleProductSelect}
                onConfigureProduct={handleConfigureProduct}
              />

              {/* 3D Scene */}
              <div className="flex-1 p-4">
                <Scene3D
                  sceneData={sceneData || undefined}
                  configuration={state.configuration}
                  selectedMeasurePoint={state.selectedMeasurePoint}
                  onMeasurePointClick={handleMeasurePointClick}
                  products={productsLookup}
                />
              </div>

              {/* Right Panel */}
              <DetailsPanel
                selectedProduct={selectedProductDetails}
                selectedMeasurePoint={selectedMeasurePointData}
                availableProducts={state.products}
                configuration={state.configuration}
                onShowMeasurePoints={handleShowMeasurePoints}
                onShowProducts={handleShowProducts}
                onProductSelect={handleProductSelect}
                onConfigureProduct={handleConfigureProduct}
                loading={state.loading}
              />
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-sm">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {state.loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="loading-spinner w-6 h-6"></div>
              <span className="text-gray-700">Laden...</span>
            </div>
          </div>
        )}
      </div>
    </LanguageProvider>
  );
}

export default App; 