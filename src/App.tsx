import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import LineSelection from './components/LineSelection';
import ConfigurationSidebar from './components/ConfigurationSidebar';
import Scene3D from './components/Scene3D';
import DetailsPanel from './components/DetailsPanel';
import ProductCatalog from './components/ProductCatalog';
import ProductDetail from './components/ProductDetail';
import ProductRecommendationWizard from './components/ProductRecommendationWizard';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import ProductManagement from './components/admin/ProductManagement';
import SceneManagement from './components/admin/SceneManagement';
import MeasurePointManagement from './components/admin/MeasurePointManagement';
import CategoryManagement from './components/admin/CategoryManagement';
import ParameterManagement from './components/admin/ParameterManagement';
import ProductMeasurePointMapping from './components/admin/ProductMeasurePointMapping';
import Object3DManagement from './components/admin/Object3DManagement';
import UploadManagement from './components/admin/UploadManagement';
import DevHelper from './components/DevHelper';
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
  const [previousView, setPreviousView] = useState<'lineSelection' | 'configuration' | 'productCatalog' | 'productDetail' | 'admin'>('lineSelection');
  const [sceneData, setSceneData] = useState<SceneData | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<ProductWithDetails | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [databaseConnected, setDatabaseConnected] = useState<boolean>(false);
  const [adminSection, setAdminSection] = useState<string>('dashboard');
  const [showDimensions, setShowDimensions] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showMeasurePointDialog, setShowMeasurePointDialog] = useState(false);

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
    setPreviousView(currentView);
    setCurrentView('productCatalog');
  }, [currentView]);

  const handleProductCatalogSelect = useCallback((productName: string) => {
    setSelectedProductName(productName);
    setPreviousView('productCatalog');
    setCurrentView('productDetail');
  }, []);

  const handleLoadToMeasurePoint = useCallback((productName: string, measurePointId?: string) => {
    // If measurePointId is provided, use it, otherwise use current selected measure point
    const targetMeasurePoint = measurePointId || state.selectedMeasurePoint;

    if (targetMeasurePoint) {
      setState(prev => ({
        ...prev,
        configuration: {
          ...prev.configuration,
          [targetMeasurePoint]: productName
        },
        selectedProduct: productName,
        selectedMeasurePoint: targetMeasurePoint
      }));

      // Load product details
      loadProductDetails(productName);

      // Always go back to configuration view after loading to measure point
      setCurrentView('configuration');
      setPreviousView('configuration');
    }
  }, [state.selectedMeasurePoint, loadProductDetails]);

  const handleMeasurePointSelect = useCallback((measurePointId: string) => {
    // Show measure point details in sidebar AND trigger camera movement
    // The Scene3D component will automatically move the camera when selectedMeasurePoint changes
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
    // Check if this measure point has an assigned product
    const assignedProduct = state.configuration[measurePointId];

    if (assignedProduct) {
      // If product is assigned, show product details in sidebar
      updateState({ selectedMeasurePoint: measurePointId });
      handleProductSelect(assignedProduct);
    } else {
      // If no product assigned, show measure point details in sidebar
      handleMeasurePointSelect(measurePointId);
    }
  }, [state.configuration, handleMeasurePointSelect, updateState, handleProductSelect]);

  const handleConfigureProduct = useCallback((measurePointId: string, productName: string) => {
    setState(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [measurePointId]: productName
      }
    }));
  }, []);

  const handleBackFromProductCatalog = useCallback(() => {
    // Go back to the previous view (lineSelection or configuration)
    setCurrentView(previousView);
  }, [previousView]);

  const handleBackFromProductDetail = useCallback(() => {
    // Go back to product catalog
    setCurrentView('productCatalog');
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

  // Handlers for ProductDetail header actions
  const handleToggleDimensions = useCallback(() => {
    setShowDimensions(prev => !prev);
  }, []);

  const handleLoadToMeasurePointDialog = useCallback(() => {
    // Open the measure point selection dialog
    setShowMeasurePointDialog(true);
  }, []);

  // New handler for catalog from sidebar
  const handleGoToCatalogFromSidebar = useCallback(() => {
    setPreviousView('configuration');
    setCurrentView('productCatalog');
  }, []);

  // Handler for showing wizard from header
  const handleShowWizard = useCallback(() => {
    setShowWizard(true);
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

  // Build available measure points for ProductCatalog
  const availableMeasurePoints = state.measurePoints.map(mp => ({
    id: mp.Id.toString(),
    name: mp.Name_DE || mp.Name_EN || `Messpunkt ${mp.Id}`
  }));

  // Debug: Log current view
  console.log('Current view:', currentView, 'Admin section:', adminSection);

  // Main render
  return (
    <LanguageProvider>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        {currentView !== 'admin' && currentView !== 'productCatalog' && (
          <Header
            currentView={currentView}
            onShowProductCatalog={handleShowProductCatalog}
            onShowAdmin={handleShowAdmin}
            onBack={currentView === 'productCatalog' ? handleBackFromProductCatalog :
                   currentView === 'productDetail' ? handleBackFromProductDetail : undefined}
            backButtonLabel={currentView === 'productCatalog' ? (previousView === 'configuration' ? 'Zurück zur Szene' : 'Zurück') :
                            currentView === 'productDetail' ? 'Zurück zum Katalog' : undefined}
            selectedMeasurePoint={currentView === 'productCatalog' ? selectedMeasurePointData : undefined}
            showMeasurePointInfo={currentView === 'productCatalog' && !!selectedMeasurePointData}
            filteredProductsCount={currentView === 'productCatalog' ? state.products.length : undefined}
            totalProductsCount={currentView === 'productCatalog' ? state.products.length : undefined}
            onShowWizard={currentView === 'productCatalog' ? handleShowWizard : undefined}
            productName={currentView === 'productDetail' ? selectedProductName : undefined}
            productTechnology={currentView === 'productDetail' && selectedProductDetails ?
              selectedProductDetails.Name.split(' ')[0] : undefined}
            onDatasheetDownload={currentView === 'productDetail' && selectedProductDetails?.datasheet ?
              () => {
                const url = selectedProductDetails.datasheet?.FileUrl?.replace(/^public\//, '/api/assets/') ||
                           `/api/assets/datasheets/${selectedProductDetails.datasheet}`;
                window.open(url, '_blank');
              } : undefined}
            onLoadToMeasurePoint={currentView === 'productDetail' && availableMeasurePoints.length > 0 ?
              handleLoadToMeasurePointDialog : undefined}
            onToggleDimensions={currentView === 'productDetail' ? handleToggleDimensions : undefined}
            showDimensions={currentView === 'productDetail' ? showDimensions : undefined}
            hasDatasheet={currentView === 'productDetail' && !!selectedProductDetails?.datasheet}
            canLoadToMeasurePoint={currentView === 'productDetail' && availableMeasurePoints.length > 0}
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
              {adminSection === 'parameters' && <ParameterManagement />}
              {adminSection === 'mappings' && <ProductMeasurePointMapping />}
              {adminSection === 'objects3d' && <Object3DManagement />}
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
              onBackToLineSelection={handleBackFromProductCatalog}
              onProductSelect={handleProductCatalogSelect}
              backButtonLabel={
                previousView === 'configuration'
                  ? "Zurück zur Szene"
                  : "Zurück zur Startseite"
              }
              selectedMeasurePoint={previousView === 'configuration' ? selectedMeasurePointData : null}
              showMeasurePointInfo={previousView === 'configuration'}
            />
          )}

          {/* Product Recommendation Wizard Modal */}
          {showWizard && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                <ProductRecommendationWizard
                  onClose={() => setShowWizard(false)}
                  onProductSelect={(productName) => {
                    setShowWizard(false);
                    handleProductCatalogSelect(productName);
                  }}
                />
              </div>
            </div>
          )}

          {currentView === 'productDetail' && (
            /* Product Detail View */
            <ProductDetail
              productName={selectedProductName}
              onBack={handleBackFromProductDetail}
              onLoadToMeasurePoint={handleLoadToMeasurePoint}
              availableMeasurePoints={availableMeasurePoints}
              backButtonLabel="Zurück zum Katalog"
              showDimensions={showDimensions}
              onToggleDimensions={handleToggleDimensions}
            />
          )}

          {/* Measure Point Dialog for Product Detail */}
          {showMeasurePointDialog && selectedProductName && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Produkt auf Messpunkt laden</h3>
                  <p className="text-gray-600 mb-6">
                    Wählen Sie einen Messpunkt aus, um <strong>{selectedProductName}</strong> zu konfigurieren:
                  </p>

                  <div className="space-y-3 mb-6">
                    {availableMeasurePoints.map((mp) => (
                      <label key={mp.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="measurePointDialog"
                          value={mp.id}
                          onChange={() => {
                            handleLoadToMeasurePoint(selectedProductName, mp.id);
                            setShowMeasurePointDialog(false);
                          }}
                          className="mr-3 w-4 h-4 text-sikora-blue"
                        />
                        <span className="font-medium text-gray-900">{mp.name}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowMeasurePointDialog(false)}
                      className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'configuration' && (
            /* Configuration View - Same layout on all screen sizes */
            <div className="flex w-full h-full">
              {/* Left Sidebar - Always 20% */}
              <div className="w-1/5 min-w-0 flex-shrink-0 border-r border-gray-200 bg-white">
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
              </div>

              {/* 3D Scene - Always 60% */}
              <div className="w-3/5 min-w-0 flex-shrink-0 p-1 sm:p-2 lg:p-4">
                <Scene3D
                  sceneData={sceneData || undefined}
                  configuration={state.configuration}
                  selectedMeasurePoint={state.selectedMeasurePoint}
                  onMeasurePointClick={handleMeasurePointClick}
                  products={productsLookup}
                />
              </div>

              {/* Right Panel - Always 20% */}
              <div className="w-1/5 min-w-0 flex-shrink-0 border-l border-gray-200 bg-white">
                <DetailsPanel
                  selectedProduct={selectedProductDetails}
                  selectedMeasurePoint={selectedMeasurePointData}
                  availableProducts={state.products}
                  configuration={state.configuration}
                  onShowMeasurePoints={handleShowMeasurePoints}
                  onShowProducts={handleShowProducts}
                  onProductSelect={handleProductSelect}
                  onConfigureProduct={handleConfigureProduct}
                  onGoToCatalog={handleGoToCatalogFromSidebar}
                  loading={state.loading}
                />
              </div>
            </div>
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

        {/* Development Helper */}
        <DevHelper />
      </div>
    </LanguageProvider>
  );
}

export default App;
