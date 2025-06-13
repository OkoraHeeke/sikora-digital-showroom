import React, { useState, useEffect, Suspense } from 'react';
import { Search, ArrowLeft, ExternalLink, Grid, List, X, Sparkles, Eye, Filter, ChevronDown, MapPin, RotateCcw, Globe, Package } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { databaseService, formatSikoraProductName } from '../services/database';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../api';
import ProductRecommendationWizard from './ProductRecommendationWizard';
import BoundingBoxVisualizer from './BoundingBoxVisualizer';
import type { Product, ProductCategory, MeasurePoint } from '../types';
import * as THREE from 'three';

interface ProductCatalogProps {
  onBackToLineSelection: () => void;
  onProductSelect?: (productName: string) => void;
  backButtonLabel?: string;
  selectedMeasurePoint?: MeasurePoint | null;
  showMeasurePointInfo?: boolean;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onBackToLineSelection,
  onProductSelect,
  backButtonLabel,
  selectedMeasurePoint,
  showMeasurePointInfo = false
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedMeasurement, setSelectedMeasurement] = useState<string>('');
  const [selectedDiameterRange, setSelectedDiameterRange] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showDimensionsModal, setShowDimensionsModal] = useState(false);
  const [selectedProductForDimensions, setSelectedProductForDimensions] = useState<Product | null>(null);
  const [loadedModel, setLoadedModel] = useState<THREE.Object3D | null>(null);
  const [measurePointProducts, setMeasurePointProducts] = useState<Product[]>([]);
  const [assignedProducts, setAssignedProducts] = useState<Product[]>([]);
  const [showOnlyAvailableProducts, setShowOnlyAvailableProducts] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  // Helper functions for language-specific content
  const getProductDescription = (product: Product) => {
    return language === 'de' ? product.HTMLDescription_DE : product.HTMLDescription_EN;
  };

  // SIKORA offizielle Bereiche
  const applicationAreas = [
    { id: 'datenkabel', name: t('app_datenkabel', 'Datenkabel und Automobil- & Installationsleitungen', 'Data cables and automotive & installation lines') },
    { id: 'aderlinien', name: t('app_aderlinien', 'Ader- und Mantellinien', 'Core and sheath lines') },
    { id: 'hochspannung', name: t('app_hochspannung', 'Hochspannungskabel', 'High voltage cables') },
    { id: 'kunststoff', name: t('app_kunststoff', 'Kunststoffextrusion', 'Plastic extrusion') },
    { id: 'gummi', name: t('app_gummi', 'Gummiextrusion', 'Rubber extrusion') },
    { id: 'platten', name: t('app_platten', 'Plattenextrusion', 'Sheet extrusion') },
    { id: 'glasfaser', name: t('app_glasfaser', 'Glasfasern', 'Optical fibers') },
    { id: 'glasfaserkabel', name: t('app_glasfaserkabel', 'Glasfaserkabel', 'Fiber optic cables') },
    { id: 'kabelproduktion', name: t('app_kabelproduktion', 'Kabelproduktion', 'Cable production') },
    { id: 'recycling', name: t('app_recycling', 'Recycling', 'Recycling') },
  ];

  // SIKORA offizielle Messtypen
  const measurementTypes = [
    { id: 'durchmesser', name: t('measure_durchmesser', 'Durchmesser', 'Diameter') },
    { id: 'plattendichte', name: t('measure_plattendichte', 'Plattendichte', 'Sheet density') },
    { id: 'plattendicke', name: t('measure_plattendicke', 'Plattendicke', 'Sheet thickness') },
    { id: 'wanddicke', name: t('measure_wanddicke', 'Wanddicke', 'Wall thickness') },
    { id: 'konzentrizitaet', name: t('measure_konzentrizitaet', 'Konzentrizität', 'Concentricity') },
    { id: 'ovalitaet', name: t('measure_ovalitaet', 'Ovalität', 'Ovality') },
    { id: 'temperatur', name: t('measure_temperatur', 'Temperatur', 'Temperature') },
    { id: 'kapazitaet', name: t('measure_kapazitaet', 'Kapazität', 'Capacitance') },
    { id: 'fehlerdetektion', name: t('measure_fehlerdetektion', 'Fehlerdetektion', 'Fault detection') },
    { id: 'materialanalyse', name: t('measure_materialanalyse', 'Analyse von Materialien', 'Material analysis') },
    { id: 'inspektion', name: t('measure_inspektion', 'Inspektion und Sortierung', 'Inspection and sorting') },
    { id: 'materialreinheit', name: t('measure_materialreinheit', 'Materialreinheit', 'Material purity') },
    { id: 'anzeige', name: t('measure_anzeige', 'Anzeige/Regelung', 'Display/Control') },
  ];

  // Durchmesserbereiche
  const diameterRanges = [
    { id: 'micro', name: '< 1 mm', min: 0, max: 1 },
    { id: 'small', name: '1-5 mm', min: 1, max: 5 },
    { id: 'medium', name: '5-20 mm', min: 5, max: 20 },
    { id: 'large', name: '20-100 mm', min: 20, max: 100 },
    { id: 'xlarge', name: '> 100 mm', min: 100, max: 9999 },
  ];

  // Model3D component for dimensions modal
  interface Model3DProps {
    url: string;
    productName: string;
    onObjectLoad?: (object: THREE.Object3D) => void;
  }

  // Error Boundary für 3D-Modelle
  class Model3DErrorBoundary extends React.Component<
    { children: React.ReactNode; productName: string },
    { hasError: boolean }
  > {
    constructor(props: { children: React.ReactNode; productName: string }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.warn(`3D Model Error for ${this.props.productName}:`, error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center text-gray-500">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-xs">3D-Modell nicht verfügbar</p>
            </div>
          </div>
        );
      }

      return this.props.children;
    }
  }

  const Model3D: React.FC<Model3DProps> = ({ url, productName, onObjectLoad }) => {
    const { scene } = useGLTF(url);

    useEffect(() => {
      if (scene && onObjectLoad) {
        onObjectLoad(scene);
      }
    }, [scene, onObjectLoad]);

    return (
      <primitive
        object={scene}
        scale={[1, 1, 1]}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
    );
  };

  // Helper functions
  const get3DModelUrl = (product: Product) => {
    if (product.Object3D_Url && !product.Object3D_Url.startsWith('http')) {
      let cleanPath = product.Object3D_Url.replace(/^public\//, '').replace(/^assets\//, '');
      
      // Korrigiere nur Verzeichnisnamen, nicht Dateinamen
      // Teile den Pfad in Verzeichnisse und Dateinamen auf
      const pathParts = cleanPath.split('/');
      if (pathParts.length > 1) {
        // Konvertiere nur das Verzeichnis (vorletztes Element), nicht den Dateinamen
        for (let i = 0; i < pathParts.length - 1; i++) {
          pathParts[i] = pathParts[i]
            .replace(/x-ray_6000_pro/g, 'x_ray_6000')
            .replace(/x-ray_6000/g, 'x_ray_6000')
            .replace(/x-ray_8000/g, 'x_ray_8000');
        }
        cleanPath = pathParts.join('/');
      }
      
      const finalUrl = `/api/assets/${cleanPath}`;
      console.log(`3D Model URL for ${product.Name}: ${product.Object3D_Url} -> ${finalUrl}`);
      return finalUrl;
    }
    return product.Object3D_Url || null;
  };

  const getImageUrl = (product: Product) => {
    if (product.ImageUrl && !product.ImageUrl.startsWith('http')) {
      let cleanPath = product.ImageUrl.replace(/^public\//, '').replace(/^assets\//, '');
      return `/api/assets/${cleanPath}`;
    }
    return product.ImageUrl || `/api/placeholder/400/300`;
  };

  const getTechnologyFromProductName = (productName: string): string => {
    if (productName.toLowerCase().includes('x-ray') || productName.toLowerCase().includes('x_ray')) return 'X-RAY';
    if (productName.toLowerCase().includes('laser')) return 'LASER';
    if (productName.toLowerCase().includes('centerview')) return 'CENTERVIEW';
    if (productName.toLowerCase().includes('spark')) return 'SPARK';
    if (productName.toLowerCase().includes('fiber')) return 'FIBER';
    if (productName.toLowerCase().includes('centerwave')) return 'CENTERWAVE';
    if (productName.toLowerCase().includes('preheater')) return 'PREHEATER';
    if (productName.toLowerCase().includes('ecocontrol')) return 'ECOCONTROL';
    if (productName.toLowerCase().includes('lump')) return 'LUMP';
    if (productName.toLowerCase().includes('capacitance')) return 'CAPACITANCE';
    if (productName.toLowerCase().includes('ultratemp')) return 'ULTRATEMP';
    return 'SIKORA';
  };

  // Funktion um Produkte nach Serien zu gruppieren
  const getProductSeries = (productName: string): string => {
    const name = productName.toLowerCase();
    
    // X-RAY Serie
    if (name.includes('x-ray') || name.includes('x_ray')) {
      if (name.includes('6000')) return 'X-RAY 6000';
      if (name.includes('8000')) return 'X-RAY 8000';
      return 'X-RAY';
    }
    
    // LASER Serie
    if (name.includes('laser')) {
      if (name.includes('2000')) return 'LASER 2000';
      if (name.includes('3000')) return 'LASER 3000';
      if (name.includes('5000')) return 'LASER 5000';
      return 'LASER';
    }
    
    // CENTERVIEW Serie
    if (name.includes('centerview')) return 'CENTERVIEW';
    
    // CENTERWAVE Serie
    if (name.includes('centerwave')) return 'CENTERWAVE';
    
    // SPARK Serie
    if (name.includes('spark')) return 'SPARK';
    
    // FIBER Serie
    if (name.includes('fiber')) return 'FIBER';
    
    // Andere Serien
    if (name.includes('preheater')) return 'PREHEATER';
    if (name.includes('ecocontrol')) return 'ECOCONTROL';
    if (name.includes('lump')) return 'LUMP';
    if (name.includes('capacitance')) return 'CAPACITANCE';
    if (name.includes('ultratemp')) return 'ULTRATEMP';
    
    return 'ANDERE';
  };

  // Funktion um Produkte nach Serien zu gruppieren
  const groupProductsBySeries = (products: Product[]) => {
    const grouped = products.reduce((acc, product) => {
      const series = getProductSeries(product.Name);
      if (!acc[series]) {
        acc[series] = [];
      }
      acc[series].push(product);
      return acc;
    }, {} as Record<string, Product[]>);

    // Sortiere die Serien in einer logischen Reihenfolge
    const seriesOrder = [
      'X-RAY 6000', 'X-RAY 8000', 'X-RAY',
      'LASER 2000', 'LASER 3000', 'LASER 5000', 'LASER',
      'CENTERVIEW', 'CENTERWAVE', 'SPARK', 'FIBER',
      'PREHEATER', 'ECOCONTROL', 'LUMP', 'CAPACITANCE', 'ULTRATEMP',
      'ANDERE'
    ];

    const orderedGroups: Record<string, Product[]> = {};
    
    // Erstelle "Empfehlung" Kategorie für verfügbare Produkte (nur wenn Messpunkt gewählt und Toggle AN)
    if (selectedMeasurePoint && showOnlyAvailableProducts && assignedProducts.length > 0) {
      const availableProducts = products.filter(product => isProductAvailableForMeasurePoint(product));
      if (availableProducts.length > 0) {
        orderedGroups['EMPFEHLUNG'] = availableProducts;
      }
    }
    
    // Füge dann die normalen Serien hinzu (aber nicht die verfügbaren Produkte nochmal)
    seriesOrder.forEach(series => {
      if (grouped[series]) {
        if (selectedMeasurePoint && showOnlyAvailableProducts && assignedProducts.length > 0) {
          // Filtere verfügbare Produkte aus normalen Serien raus, da sie bereits in "Empfehlung" sind
          const seriesProducts = grouped[series].filter(product => !isProductAvailableForMeasurePoint(product));
          if (seriesProducts.length > 0) {
            orderedGroups[series] = seriesProducts;
          }
        } else {
          orderedGroups[series] = grouped[series];
        }
      }
    });

    return orderedGroups;
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedArea('');
    setSelectedMeasurement('');
    setSelectedDiameterRange('');
  };

  const isProductAvailableForMeasurePoint = (product: Product): boolean => {
    if (!selectedMeasurePoint || assignedProducts.length === 0) return false;
    return assignedProducts.some(ap => ap.Name === product.Name);
  };

  // Korrigierte Styling-Logik für Produktkarten
  const getProductCardStyling = (product: Product): string => {
    if (!selectedMeasurePoint) {
      // Normale Darstellung wenn kein Messpunkt gewählt
      return 'bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-sikora-blue/30';
    }

    const isAvailable = isProductAvailableForMeasurePoint(product);

    if (showOnlyAvailableProducts) {
      // "Nur verfügbare" - verfügbare Produkte GRÜN, nicht verfügbare AUSGEGRAUT
      return isAvailable
        ? 'bg-white border-2 border-green-500 shadow-lg shadow-green-200/20 hover:shadow-xl'
        : 'bg-gray-50 border border-gray-300 opacity-60 cursor-not-allowed';
    } else {
      // "Alle anzeigen" - alle Produkte NORMAL anzeigen, keine Grün/Grau Färbung
      return 'bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-sikora-blue/30';
    }
  };

  const matchesAreaFilter = (product: Product, areaId: string): boolean => {
    const productName = product.Name.toLowerCase();
    const description = (getProductDescription(product) || '').toLowerCase();

    switch (areaId) {
      case 'glasfaser':
        return (productName.includes('fiber') || description.includes('glasfaser')) &&
               !productName.includes('cable') && !description.includes('kabel');
      case 'glasfaserkabel':
        return (productName.includes('fiber') || description.includes('glasfaser')) &&
               (productName.includes('cable') || description.includes('kabel'));
      case 'datenkabel':
        return description.includes('data') || description.includes('daten') || description.includes('auto');
      case 'hochspannung':
        return description.includes('hochspannung') || description.includes('high voltage');
      case 'aderlinien':
        return (productName.includes('cable') || description.includes('kabel')) &&
               !description.includes('data') && !description.includes('hochspannung');
      case 'kunststoff':
        return description.includes('kunststoff') || description.includes('plastic');
      case 'gummi':
        return description.includes('gummi') || description.includes('rubber');
      case 'platten':
        return description.includes('platte') || description.includes('plate');
      case 'recycling':
        return description.includes('recycling');
      case 'kabelproduktion':
        return description.includes('kabel') || description.includes('cable');
      default:
        return true;
    }
  };

  const matchesMeasurementFilter = (product: Product, measurementId: string): boolean => {
    const productName = product.Name.toLowerCase();

    switch (measurementId) {
      case 'durchmesser':
        return productName.includes('laser') || productName.includes('centerview');
      case 'wanddicke':
        return productName.includes('x-ray') || productName.includes('x_ray') || productName.includes('centerwave');
      case 'konzentrizitaet':
        return productName.includes('x-ray') || productName.includes('x_ray');
      case 'fehlerdetektion':
        return productName.includes('spark') || productName.includes('lump');
      case 'temperatur':
        return productName.includes('temp');
      case 'kapazitaet':
        return productName.includes('capacitance');
      case 'materialreinheit':
        return productName.includes('purity');
      case 'anzeige':
        return productName.includes('ecocontrol');
      default:
        return true;
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const productsData = await databaseService.getProducts();
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (err) {
        console.error('Failed to load catalog data:', err);
        setError(t('error_loading', 'Fehler beim Laden des Produktkatalogs', 'Error loading product catalog'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [t]);

  // Load measurepoint products when measurepoint is selected
  useEffect(() => {
    const loadMeasurePointProducts = async () => {
      if (selectedMeasurePoint) {
        setRecommendationsLoading(true);
        try {
          // Lade alle verfügbaren Produkte (für Konfiguration)
          const availableResult = await api.getMeasurePointProducts(selectedMeasurePoint.Id);
          if (availableResult.success) {
            setMeasurePointProducts(availableResult.data);
          } else {
            setMeasurePointProducts([]);
          }

          // Lade nur direkt zugeordnete Produkte (für Anzeige)
          const assignedResult = await api.getMeasurePointAssignedProducts(selectedMeasurePoint.Id);
          if (assignedResult.success) {
            setAssignedProducts(assignedResult.data);
          } else {
            setAssignedProducts([]);
          }
        } catch (error) {
          console.error('Failed to load measure point products:', error);
          setMeasurePointProducts([]);
          setAssignedProducts([]);
        } finally {
          setRecommendationsLoading(false);
        }
      } else {
        setMeasurePointProducts([]);
        setAssignedProducts([]);
        setRecommendationsLoading(false);
      }
    };

    loadMeasurePointProducts();
  }, [selectedMeasurePoint]);

  // Apply filters whenever dependencies change
  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.HTMLDescription_DE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.HTMLDescription_EN?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by area
    if (selectedArea) {
      filtered = filtered.filter(product => matchesAreaFilter(product, selectedArea));
    }

    // Filter by measurement type
    if (selectedMeasurement) {
      filtered = filtered.filter(product => matchesMeasurementFilter(product, selectedMeasurement));
    }

    // Filter by diameter range
    if (selectedDiameterRange) {
      const range = diameterRanges.find(r => r.id === selectedDiameterRange);
      if (range) {
        // Simple filter based on product name patterns
        filtered = filtered.filter(product => {
          const productName = product.Name.toLowerCase();
          if (range.id === 'micro') return productName.includes('2005') || productName.includes('2010');
          if (range.id === 'small') return productName.includes('2025') || productName.includes('2030');
          if (range.id === 'medium') return productName.includes('2050') || productName.includes('2100');
          if (range.id === 'large') return productName.includes('2200') || productName.includes('2300');
          if (range.id === 'xlarge') return productName.includes('6000') || productName.includes('8000');
          return true;
        });
      }
    }

    // KEIN Filter mehr - "Nur verfügbare" zeigt alle Produkte an (grün/grau)
    // Alle Produkte werden immer angezeigt, nur das Styling unterscheidet sich

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedArea, selectedMeasurement, selectedDiameterRange, selectedMeasurePoint, showOnlyAvailableProducts, measurePointProducts, assignedProducts]);

  // Combined loading state
  const isLoading = loading || recommendationsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-sikora-blue/5 via-white to-sikora-cyan/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-sikora-blue to-sikora-cyan rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-sikora-blue/40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-white"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {recommendationsLoading 
              ? t('loadingRecommendations', 'Empfehlungen werden geladen', 'Loading recommendations')
              : t('loadingCatalog', 'Produktkatalog wird geladen', 'Loading product catalog')
            }
          </h3>
          <p className="text-gray-600 text-lg mb-6">
            {recommendationsLoading
              ? t('preparingRecommendations', 'Passende Produkte werden ermittelt...', 'Finding suitable products...')
              : t('loadingProducts', 'Produkte werden vorbereitet...', 'Preparing products...')
            }
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-sikora-blue rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-sikora-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-sikora-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <X className="w-10 h-10 text-gray-500" />
          </div>
          <p className="text-xl font-semibold text-gray-600 mb-6">{error}</p>
          <button
            onClick={onBackToLineSelection}
            className="px-6 py-3 bg-gradient-to-r from-sikora-blue to-sikora-cyan text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-semibold"
          >
            {backButtonLabel || t('back', 'Zurück', 'Back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sikora-blue/5 via-white to-sikora-cyan/5 flex flex-col">
      {/* Kompakter Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToLineSelection}
                className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:text-sikora-blue bg-gray-100/80 hover:bg-sikora-blue/10 rounded-lg transition-all font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{backButtonLabel || t('back', 'Zurück', 'Back')}</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-sikora-blue to-sikora-cyan bg-clip-text text-transparent">
                  SIKORA
                </h1>
                <p className="text-xs text-gray-500 -mt-1">{t('catalog', 'Produktkatalog', 'Product Catalog')}</p>
              </div>
            </div>

            {/* Center: Kompakte Suche mit Filter */}
            <div className="flex-1 max-w-lg mx-4 flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('search_placeholder', 'Produktsuche...', 'Search products...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-sikora-blue/50 focus:border-sikora-blue transition-all placeholder-gray-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded transition-all"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              
              {/* Filter Button direkt neben Suche */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center space-x-1 px-3 py-2 text-sm border rounded-lg transition-all ${
                  showAdvancedFilters 
                    ? 'bg-sikora-blue text-white border-sikora-blue' 
                    : 'text-gray-600 hover:text-sikora-blue border-gray-200 hover:border-sikora-blue/50 bg-white'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>{t('filter', 'Filter', 'Filter')}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
              {/* Messpunkt Toggle - getauschte Texte und Farben */}
              {selectedMeasurePoint && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-sikora-blue/10 to-sikora-cyan/10 rounded-lg border border-sikora-blue/20">
                  <span className="text-xs text-sikora-blue font-medium">
                    {!showOnlyAvailableProducts
                      ? t('show_all', 'Alle anzeigen', 'Show all')
                      : t('only_available', 'Nur verfügbare', 'Available only')
                    }
                  </span>
                  <button
                    onClick={() => setShowOnlyAvailableProducts(!showOnlyAvailableProducts)}
                    className={`relative w-8 h-4 rounded-full transition-all duration-300 ${
                      showOnlyAvailableProducts ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                        showOnlyAvailableProducts ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              )}

              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-sikora-blue/10 to-sikora-cyan/10 rounded-lg border border-sikora-blue/20">
                <span className="text-sm font-semibold text-sikora-blue">
                  {filteredProducts.length} {t('products', 'Produkte', 'Products')}
                </span>
              </div>

              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
                className="flex items-center space-x-1 p-2 text-gray-600 hover:text-sikora-blue bg-gray-100/80 hover:bg-sikora-blue/10 rounded-lg transition-all"
                title={t('switch_language', 'Sprache wechseln', 'Switch language')}
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">{language}</span>
              </button>

              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-600 hover:text-sikora-blue bg-gray-100/80 hover:bg-sikora-blue/10 rounded-lg transition-all"
                title={viewMode === 'grid' ? t('list_view', 'Listenansicht', 'List view') : t('grid_view', 'Rasteransicht', 'Grid view')}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setShowWizard(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-sikora-blue to-sikora-cyan text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">{t('finder', 'Finder', 'Finder')}</span>
              </button>
            </div>
          </div>

          {/* Reset Button falls Filter aktiv */}
          {(searchTerm || selectedArea || selectedMeasurement || selectedDiameterRange) && (
            <div className="flex justify-end mt-3">
              <button
                onClick={clearAllFilters}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-sikora-blue bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('reset', 'Filter zurücksetzen', 'Reset filters')}</span>
              </button>
            </div>
          )}

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-3 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 space-y-3">
              {/* Bereiche */}
              <div>
                <h4 className="text-xs font-semibold text-sikora-blue mb-2">{t('application_area', 'Anwendungsbereich', 'Application Area')}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {applicationAreas.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => setSelectedArea(selectedArea === area.id ? '' : area.id)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all text-left ${
                        selectedArea === area.id
                          ? 'bg-sikora-blue text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {area.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messtypen */}
              <div>
                <h4 className="text-xs font-semibold text-sikora-blue mb-2">{t('measurement_type', 'Messtyp', 'Measurement Type')}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                  {measurementTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedMeasurement(selectedMeasurement === type.id ? '' : type.id)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        selectedMeasurement === type.id
                          ? 'bg-sikora-cyan text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Durchmesserbereiche - korrigiertes Styling */}
              <div>
                <h4 className="text-xs font-semibold text-sikora-blue mb-2">{t('diameter_range', 'Durchmesserbereich', 'Diameter Range')}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1">
                  {diameterRanges.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setSelectedDiameterRange(selectedDiameterRange === range.id ? '' : range.id)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        selectedDiameterRange === range.id
                          ? 'bg-sikora-blue text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {range.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Section - behobenes Scrolling */}
      <div className="flex-1 p-4 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="min-h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('no_products_found', 'Keine Produkte gefunden', 'No products found')}</h3>
              <p className="text-gray-600 mb-6">{t('try_different_filters', 'Versuchen Sie andere Suchbegriffe oder Filter.', 'Try different search terms or filters.')}</p>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-sikora-blue to-sikora-cyan text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {t('reset_filters', 'Filter zurücksetzen', 'Reset filters')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupProductsBySeries(filteredProducts)).map(([seriesName, seriesProducts]) => (
              <div key={seriesName} className="space-y-4">
                {/* Serie Header */}
                <div className="flex items-center space-x-4">
                  <div className={`px-4 py-2 rounded-xl shadow-lg ${
                    seriesName === 'EMPFEHLUNG' 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'bg-gradient-to-r from-sikora-blue to-sikora-cyan text-white'
                  }`}>
                    <h2 className="text-lg font-bold text-white">
                      {seriesName === 'EMPFEHLUNG' 
                        ? t('recommendation', 'Empfehlung', 'Recommendation')
                        : seriesName
                      }
                    </h2>
                  </div>
                  <div className={`flex-1 h-px bg-gradient-to-r ${
                    seriesName === 'EMPFEHLUNG'
                      ? 'from-green-500/20 to-transparent'
                      : 'from-sikora-blue/20 to-transparent'
                  }`}></div>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    seriesName === 'EMPFEHLUNG'
                      ? 'text-green-700 bg-green-100'
                      : 'text-gray-500 bg-gray-100'
                  }`}>
                    {seriesProducts.length} {t('products', 'Produkte', 'Products')}
                  </span>
                </div>

                {/* Serie Produkte */}
                <div className={
                  viewMode === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                    : "space-y-4"
                }>
                  {seriesProducts.map((product, index) => {
                    const isAvailable = isProductAvailableForMeasurePoint(product);
                    const techName = getTechnologyFromProductName(product.Name);
                    const cardStyling = getProductCardStyling(product);

                    return (
                      <div
                        key={product.Name}
                        className={`group ${cardStyling} rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-105 ${
                          viewMode === 'list' ? 'flex' : ''
                        } ${!isAvailable && selectedMeasurePoint && !showOnlyAvailableProducts ? '' : ''}`}
                        onClick={() => {
                          if (!selectedMeasurePoint || isAvailable || !showOnlyAvailableProducts) {
                            onProductSelect?.(product.Name);
                          }
                        }}
                      >
                        {/* Product Image */}
                        <div className={`relative overflow-hidden ${
                          viewMode === 'list' ? 'w-40 flex-shrink-0' : 'h-48'
                        }`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
                          <img
                            src={getImageUrl(product)}
                            alt={product.Name}
                            className="relative w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `/api/placeholder/400/300`;
                            }}
                          />

                          {/* Technology Badge */}
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-1 rounded-lg text-xs font-bold bg-sikora-blue text-white shadow-lg backdrop-blur-sm">
                              {techName}
                            </span>
                          </div>

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="absolute bottom-3 left-3 right-3">
                              <div className="flex items-center justify-between text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <span className="font-semibold bg-black/30 backdrop-blur-sm px-2 py-1 rounded text-sm">
                                  {t('details', 'Details', 'Details')}
                                </span>
                                <ExternalLink className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                          <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-sikora-blue transition-colors leading-tight">
                            {formatSikoraProductName(product.Name)}
                          </h3>

                          <div
                            className="text-gray-600 text-sm line-clamp-3 mb-3 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: getProductDescription(product) || ''
                            }}
                          />

                          {/* Action Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center space-x-2 text-gray-500">
                              <Eye className="w-4 h-4" />
                              <span className="text-sm font-medium">{t('details', 'Details', 'Details')}</span>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${
                              !selectedMeasurePoint ? 'bg-green-500'
                              : isAvailable ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reparierter Product Recommendation Wizard - ohne extra Modal */}
      {showWizard && (
        <ProductRecommendationWizard
          onClose={() => setShowWizard(false)}
          onProductSelect={(productName) => {
            setShowWizard(false);
            onProductSelect?.(productName);
          }}
        />
      )}

      {/* Dimensions Modal */}
      {showDimensionsModal && selectedProductForDimensions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sikora-blue to-sikora-cyan text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">{t('product_dimensions', 'Produktabmessungen', 'Product Dimensions')}</h3>
                  <p className="text-white/80">
                    {formatSikoraProductName(selectedProductForDimensions.Name)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDimensionsModal(false);
                    setSelectedProductForDimensions(null);
                    setLoadedModel(null);
                  }}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all transform hover:scale-105"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* 3D Model View */}
            <div className="p-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden" style={{ height: '500px' }}>
                {get3DModelUrl(selectedProductForDimensions) ? (
                  <Model3DErrorBoundary productName={selectedProductForDimensions.Name}>
                    <Suspense fallback={
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sikora-blue"></div>
                      </div>
                    }>
                      <Canvas camera={{ position: [2, 2, 2], fov: 45 }} className="w-full h-full">
                        <Environment preset="city" />
                        <ambientLight intensity={0.6} />
                        <directionalLight position={[10, 10, 5]} intensity={1.2} />
                        <Model3D
                          url={get3DModelUrl(selectedProductForDimensions) || ''}
                          productName={selectedProductForDimensions.Name}
                          onObjectLoad={(object) => setLoadedModel(object)}
                        />
                        <BoundingBoxVisualizer
                          targetObject={loadedModel}
                          visible={true}
                          color="#003A62"
                        />
                        <OrbitControls
                          enablePan={true}
                          enableZoom={true}
                          enableRotate={true}
                          autoRotate={false}
                          minDistance={1}
                          maxDistance={8}
                          maxPolarAngle={Math.PI / 1.8}
                        />
                      </Canvas>
                    </Suspense>
                  </Model3DErrorBoundary>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-4xl mb-4">📐</div>
                      <p className="text-lg font-semibold">{t('no_3d_model', '3D-Modell nicht verfügbar', '3D model not available')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
