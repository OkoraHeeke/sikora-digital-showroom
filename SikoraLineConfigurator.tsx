import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, Search, Settings, Plus, X, Check, 
  Info, Download, Share, Eye, ZoomIn, ZoomOut, RotateCw,
  Menu, ChevronDown, ChevronRight, Layers,  
  HelpCircle, Home, Filter, Maximize, PanelLeft, PanelRight,
  BarChart2
} from 'lucide-react';
import Scene3D from './Scene3D';

// Animationen CSS
const animationCSS = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideInLeft {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes fadeInBlue {
  0% { opacity: 0; background-color: rgba(0, 58, 98, 0.08); }
  30% { opacity: 0.7; background-color: rgba(0, 58, 98, 0.05); }
  100% { opacity: 1; background-color: transparent; }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

.animate-fadeInBlue {
  animation: fadeInBlue 0.4s ease-in-out;
}

.animate-slideInRight {
  animation: slideInRight 0.3s ease-in-out;
}

.animate-slideInLeft {
  animation: slideInLeft 0.3s ease-in-out;
}

.animate-slideUp {
  animation: slideUp 0.3s ease-in-out;
}

.animate-pulse {
  animation: pulse 0.3s ease-in-out;
}
`;

// Type definitions
type LineType = 'cable' | 'tube' | 'fiber';

type MeasurePoint = {
  id: string;
  name: string;
  position: number;
  description: string;
  requirements: string;
  environmentalFactors: string;
  important?: boolean;
};

type LineTypeInfo = {
  id: LineType;
  name: string;
  description: string;
  image: string;
};

type ProductCategory = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  shortName: string;
  category: string;
  categoryName: string;
  applications: LineType[];
  suitableFor: string[];
  description: string;
  features: string[];
  specifications: {
    range: string;
    accuracy?: string;
    rate?: string;
    temperature?: string;
    speed?: string;
  };
  advantages: string[];
  dimensions: string;
  placement: string;
  image: string;
  model3d: string;
  featured?: boolean;
  size: 'small' | 'medium' | 'large';
};

type Configuration = Record<string, string>;

const SikoraLineConfigurator = () => {
  // States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [selectedLineType, setSelectedLineType] = useState<LineType | null>(null);
  const [selectedMeasurePoint, setSelectedMeasurePoint] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [rightPanelMode, setRightPanelMode] = useState<'product' | 'measurePoint' | 'empty'>('empty');
  const [configuration, setConfiguration] = useState<Configuration>({});
  const [view3DMode, setView3DMode] = useState<'line' | 'product' | 'compare'>('line');
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'measurePoints' | 'comparison'>('overview');
  const [showComparisonPanel, setShowComparisonPanel] = useState(false);
  const [comparisonProducts, setComparisonProducts] = useState<string[]>([]);
  const [productFilterCategory, setProductFilterCategory] = useState('all');
  const [showHelpOverlay, setShowHelpOverlay] = useState(false);
  const [search, setSearch] = useState('');
  const [showProductSelectionModal, setShowProductSelectionModal] = useState(false);
  const [selectedMeasurePointForProductSelection, setSelectedMeasurePointForProductSelection] = useState<string | null>(null);
  const [productSelections, setProductSelections] = useState<Record<string, string[]>>({});
  
  // Basis-Übergangsdauer für Animationen
  const baseTransitionDuration = "300ms";
  
  // Basis-Animationsstile
  const transitionStyles = {
    panel: `transition-all duration-${baseTransitionDuration} ease-in-out`,
    item: `transition-all duration-${baseTransitionDuration} ease-in-out`,
    hover: `transition-colors duration-200 ease-in-out`,
    scale: `transition-transform duration-150 ease-in-out`,
    opacity: `transition-opacity duration-${baseTransitionDuration} ease-in-out`,
    background: `transition-colors duration-200 ease-in-out`,
    transform: `transition-transform duration-${baseTransitionDuration} ease-in-out`,
    shadow: `transition-shadow duration-200 ease-in-out`,
    all: `transition-all duration-${baseTransitionDuration} ease-in-out`,
  };
  
  // CSS zum Head-Element hinzufügen
  useEffect(() => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(animationCSS));
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Dummy-Daten für die Produktionslinientypen
  const lineTypes: LineTypeInfo[] = [
    {
      id: 'cable',
      name: 'Kabellinie',
      description: 'Für die Herstellung von Datenkabeln, Automobilleitungen und Installationskabeln',
      image: '/api/placeholder/300/200'
    },
    {
      id: 'tube',
      name: 'Rohr- & Schlauchlinie',
      description: 'Für die Herstellung von Kunststoffrohren und -schläuchen',
      image: '/api/placeholder/300/200'
    },
    {
      id: 'fiber',
      name: 'Glasfaserlinie',
      description: 'Für die Herstellung von Glasfasern und Glasfaserkabeln',
      image: '/api/placeholder/300/200'
    }
  ];
  
  // Messpunkte nach Linientyp
  const measurePoints: Record<LineType, MeasurePoint[]> = {
    cable: [
      { 
        id: 'mp1', 
        name: 'Leitervorheizung', 
        position: 1,
        description: 'Temperaturkontrolle des Leiters vor dem Extrusionsprozess',
        requirements: 'Für Durchmesser: 0,32-2,8 mm, Temperaturen: 50-150°C',
        environmentalFactors: 'Hohe Drahtgeschwindigkeit bis 2.500 m/min'
      },
      { 
        id: 'mp2', 
        name: 'Extruderschmelze', 
        position: 2,
        description: 'Messung der PE-Schmelzetemperatur direkt im Extruder',
        requirements: 'Temperaturbereich: 100-180°C',
        environmentalFactors: 'Hohe Viskosität und Druck der Schmelze'
      },
      { 
        id: 'mp3', 
        name: 'Nach Extruder', 
        position: 3, 
        important: true,
        description: 'Durchmessermessung des extrudierten Kabels',
        requirements: 'Durchmesserbereich: 0,5-50 mm, hohe Präzision erforderlich',
        environmentalFactors: 'Hohe Temperatur des Kabels (bis 200°C)'
      },
      { 
        id: 'mp4', 
        name: 'Wanddicke/Exzentrizität', 
        position: 4, 
        important: true,
        description: 'Messung der Wanddicke und Exzentrizität',
        requirements: 'Für Kabel: 0,65-110 mm, Wanddickenmessung: 0,1-15 mm',
        environmentalFactors: 'Zwischen Kühlwannen platziert, optimale Messwerte'
      },
      { 
        id: 'mp5', 
        name: 'Knotendetektion', 
        position: 5,
        description: 'Erkennung von Oberflächenfehlern und Einschnürungen',
        requirements: 'Für Durchmesser: 0,5-35 mm, Fehlerlänge ab 0,5 mm',
        environmentalFactors: 'Hohe Liniengeschwindigkeit, Staubfreiheit wichtig'
      },
      { 
        id: 'mp6', 
        name: 'Isolationsprüfung', 
        position: 6,
        description: 'Hochspannungsprüfung der Isolierung',
        requirements: 'Für Durchmesser: 0,5-30 mm, Prüfspannung bis 15 kV',
        environmentalFactors: 'Trockenes Produkt erforderlich'
      },
      { 
        id: 'mp7', 
        name: 'Kapazitätsmessung', 
        position: 7,
        description: 'Messung der elektrischen Kapazität und SRL-Vorhersage',
        requirements: 'Für Durchmesser: 0,5-60 mm, Messbereich: 0-300 pF/m',
        environmentalFactors: 'In der Kühlwanne installiert, Wassertemperatur beachten'
      },
      { 
        id: 'mp8', 
        name: 'Finaler Durchmesser', 
        position: 8,
        description: 'Kontrollmessung des Enddurchmessers',
        requirements: 'Durchmesserbereich: 0,5-50 mm, hohe Präzision',
        environmentalFactors: 'Kühles Produkt, finale Qualitätskontrolle'
      }
    ],
    tube: [
      { 
        id: 'mp1', 
        name: 'Extruderschmelze', 
        position: 1,
        description: 'Messung der PE-Schmelzetemperatur direkt im Extruder',
        requirements: 'Temperaturbereich: 100-180°C',
        environmentalFactors: 'Hohe Viskosität und Druck der Schmelze'
      },
      { 
        id: 'mp2', 
        name: 'Nach Extruder', 
        position: 2,
        description: 'Durchmessermessung des extrudierten Rohrs',
        requirements: 'Durchmesserbereich: 1-300 mm, hohe Präzision',
        environmentalFactors: 'Hohe Produkttemperatur'
      },
      { 
        id: 'mp3', 
        name: 'Wanddicke/Durchmesser', 
        position: 3, 
        important: true,
        description: 'Messung von Wanddicke, Innenprofil und Durchmesser',
        requirements: 'Für Rohre mit Ø 32-1600 mm, Wanddicke: ab 1,6 mm',
        environmentalFactors: 'Größere Materialstärken optimal für Millimeterwellen'
      },
      { 
        id: 'mp4', 
        name: 'Oberflächenprüfung', 
        position: 4,
        description: 'Detektion von Oberflächenfehlern',
        requirements: 'Für Durchmesser: 0,5-35 mm, Fehlerlänge ab 0,5 mm',
        environmentalFactors: 'Nach der Kühlung für optimale Ergebnisse'
      },
      { 
        id: 'mp5', 
        name: 'Finaler Durchmesser', 
        position: 5,
        description: 'Kontrollmessung des Enddurchmessers',
        requirements: 'Durchmesserbereich: 1-300 mm, hohe Präzision',
        environmentalFactors: 'Am Ende der Linie für finale Qualitätskontrolle'
      }
    ],
    fiber: [
      { 
        id: 'mp1', 
        name: 'Temperaturmessung', 
        position: 1,
        description: 'Messung der Glasfasertemperatur im Ziehprozess',
        requirements: 'Messbereich: 40-200°C (kalt) oder 500-1500°C (heiß)',
        environmentalFactors: 'Im Ziehturm, berührungslose Messung notwendig'
      },
      { 
        id: 'mp2', 
        name: 'Durchmesser (heiß)', 
        position: 2, 
        important: true,
        description: 'Durchmessermessung der heißen Glasfaser',
        requirements: 'Produktdurchmesser: 50-500 μm, Präzision: ±0,02 μm',
        environmentalFactors: 'Nach dem Ofen, hohe Temperatur'
      },
      { 
        id: 'mp3', 
        name: 'Zugkraftmessung', 
        position: 3,
        description: 'Messung der Zugkraft an der nackten Faser',
        requirements: 'Messbereich: 20-400 g, hohe Wiederholgenauigkeit',
        environmentalFactors: 'Unabhängig von Position und Vibration'
      },
      { 
        id: 'mp4', 
        name: 'Nach Beschichtung', 
        position: 4, 
        important: true,
        description: 'Durchmesser- und Konzentrizitätsmessung nach dem Coating',
        requirements: 'Produktdurchmesser: 50-500 μm, Präzision: ±0,02 μm',
        environmentalFactors: 'Nach UV-Trocknung der Beschichtung'
      },
      { 
        id: 'mp5', 
        name: 'Fehlerdetektion', 
        position: 5,
        description: 'Detektion von Knoten, Einschnürungen und Blasen',
        requirements: 'Minimale detektierbare Fehlerhöhe: 5 μm',
        environmentalFactors: 'Staubfreie Umgebung, nach dem Coating'
      }
    ]
  };
  
  // Kategorien für die Produktfilterung
  const productCategories: ProductCategory[] = [
    { id: 'all', name: 'Alle Kategorien' },
    { id: 'diameter', name: 'Durchmessermessung' },
    { id: 'wallThickness', name: 'Wanddickenmessung' },
    { id: 'concentricity', name: 'Exzentrizitätsmessung' },
    { id: 'temperature', name: 'Temperaturmessung' },
    { id: 'detection', name: 'Fehlerdetektion' },
    { id: 'testing', name: 'Prüfgeräte' }
  ];
  
  // SIKORA Produkte
  const products: Product[] = [
    {
      id: 'laser2005',
      name: 'LASER 2005 XY',
      shortName: 'LASER 2005',
      category: 'diameter',
      categoryName: 'Durchmessermessung',
      applications: ['cable'],
      suitableFor: ['mp3', 'mp8'],
      description: 'Präzises Durchmessermessgerät für kleinste Durchmesser',
      features: [
        'Durchmesserbereich: 0,05 - 5 mm',
        'Genauigkeit: ± 0,25 μm',
        'Messrate: 1.200/Sek/Achse',
        'Keine Kalibrierung erforderlich'
      ],
      specifications: {
        range: '0,05 - 5 mm',
        accuracy: '± 0,25 μm',
        rate: '1.200/Sek'
      },
      advantages: [
        'Höchste Genauigkeit für kleinste Kabel',
        'CCD-Sensortechnik mit Laserdioden',
        'Kurze Belichtungszeit: 0,2 μs',
        '2-Achs-Messprinzip'
      ],
      dimensions: '150 x 100 x 50 mm',
      placement: 'Nach dem Extruder oder am Ende der Linie',
      image: '/api/placeholder/300/200',
      model3d: '/api/placeholder/400/400',
      size: 'small'
    },
    {
      id: 'laser2010',
      name: 'LASER 2010 XY',
      shortName: 'LASER 2010',
      category: 'diameter',
      categoryName: 'Durchmessermessung',
      applications: ['cable', 'tube'],
      suitableFor: ['mp3', 'mp8', 'mp2'],
      description: 'Hochpräzises Laser-Durchmessermessgerät für kleine Durchmesser',
      features: [
        'Durchmesserbereich: 0,2 - 10 mm',
        'Genauigkeit: ± 0,5 μm',
        'Messrate: 500/Sek/Achse',
        'Keine Kalibrierung erforderlich'
      ],
      specifications: {
        range: '0,2 - 10 mm',
        accuracy: '± 0,5 μm',
        rate: '500/Sek'
      },
      advantages: [
        'Vielseitiger Einsatz für verschiedene Kabeltypen',
        'Keine beweglichen Teile',
        'Lebenslange Präzision',
        'Einfache Integration in bestehende Linien'
      ],
      dimensions: '180 x 120 x 65 mm',
      placement: 'Nach Extruder oder in Kühlstrecke',
      image: '/api/placeholder/300/200',
      model3d: '/api/placeholder/400/400',
      size: 'small'
    },
    {
      id: 'laser2050',
      name: 'LASER 2050 XY',
      shortName: 'LASER 2050',
      category: 'diameter',
      categoryName: 'Durchmessermessung',
      applications: ['cable', 'tube'],
      suitableFor: ['mp3', 'mp8', 'mp2', 'mp5'],
      description: 'Hochpräzises Laser-Durchmessermessgerät für mittlere Durchmesser',
      features: [
        'Durchmesserbereich: 0,5 - 50 mm',
        'Genauigkeit: ± 2,5 μm',
        'Messrate: 500/Sek/Achse',
        'Keine Kalibrierung erforderlich'
      ],
      specifications: {
        range: '0,5 - 50 mm',
        accuracy: '± 2,5 μm',
        rate: '500/Sek'
      },
      advantages: [
        'Große Messbereiche für verschiedene Anwendungen',
        'Verfügbarkeit: 99,8%',
        'Kurze Belichtungszeit: 0,2 μs',
        'Schwenkbares Messkopfkonzept'
      ],
      dimensions: '240 x 140 x 70 mm',
      placement: 'Flexibel in der Linie positionierbar',
      image: '/api/placeholder/300/200',
      model3d: '/api/placeholder/400/400',
      size: 'medium'
    },
    {
      id: 'xray6020',
      name: 'X-RAY 6020 PRO',
      shortName: 'X-RAY 6020',
      category: 'wallThickness',
      categoryName: 'Wanddickenmessung',
      applications: ['cable'],
      suitableFor: ['mp4'],
      description: 'Röntgenmesssystem für kleinste Kabel und medizinische Schläuche',
      features: [
        'Durchmesserbereich: 0,65 - 15 mm',
        'Genauigkeit: 5 μm',
        'Messung von Wanddicke und Exzentrizität',
        'Für bis zu drei Materialschichten'
      ],
      specifications: {
        range: '0,65 - 15 mm',
        accuracy: '5 μm',
        rate: '1-3 Hz (optional 10 Hz)'
      },
      advantages: [
        'Ultradünne Wanddickenmessung ab 100 μm',
        'Speziell für medizinische Schläuche und Mini-Koaxialkabel',
        'Berührungslose Messung',
        'Keine Kalibrierung erforderlich'
      ],
      dimensions: '560 x 350 x 200 mm',
      placement: 'Zwischen zwei Kühlwannen',
      image: '/api/placeholder/300/200',
      model3d: '/api/placeholder/400/400',
      size: 'medium'
    },
    {
      id: 'centerview8000',
      name: 'CENTERVIEW 8000',
      shortName: 'CENTERVIEW',
      category: 'concentricity',
      categoryName: 'Exzentrizitätsmessung',
      applications: ['cable'],
      suitableFor: ['mp4'],
      description: '8-Punkt-Messung der Exzentrizität mit 4-Achs-Durchmessermessung',
      features: [
        'Produktdurchmesser: 0,25 - 25 mm',
        'Automatische Messkopfpositionierung',
        'Punktwolken-Visualisierung',
        'Integrierter 7"-TFT-Monitor (e-Modell)'
      ],
      specifications: {
        range: '0,25 - 25 mm (optional ab 0,1 mm)',
        accuracy: 'besser ± 1 μm',
        rate: '500/Sek'
      },
      advantages: [
        'Speziell für Koaxial-, LAN- und Automobilkabel',
        'Visualisierung der Exzentrizitätsschwankungen',
        'Keine mechanische Führung der Ader notwendig',
        'Integrierte Knotenerkennung'
      ],
      dimensions: '280 x 170 x 120 mm',
      placement: 'Nach dem Extruder',
      image: '/api/placeholder/300/200',
      model3d: '/api/placeholder/400/400',
      size: 'medium'
    },
    {
      id: 'preheater6000',
      name: 'PREHEATER 6000 TC',
      shortName: 'PREHEATER',
      category: 'temperature',
      categoryName: 'Temperaturmessung',
      applications: ['cable'],
      suitableFor: ['mp1'],
      description: 'Leitervorheizung mit integrierter Temperaturmessung und -regelung',
      features: [
        'Für Leiter: 0,32 - 2,8 mm (0,08 - 6 mm²)',
        'Temperaturbereich: +50 bis +150 °C (optional +250 °C)',
        'Geschwindigkeiten bis 2.500 m/min',
        'Berührungslose Temperaturmessung'
      ],
      specifications: {
        range: '0,32 - 2,8 mm',
        temperature: '+50 bis +150 °C',
        speed: 'bis 2.500 m/min'
      },
      advantages: [
        'Innovative Stromvorsteuerung für schnelle Aufheizung',
        'Optimale Haftung des Isolationsmaterials',
        'Perfekte Regulierung der Schäumung',
        'Verfügbar in 10, 20, 30 und 35 kW'
      ],
      dimensions: '300 x 180 x 150 mm',
      placement: 'Vor dem Extruder',
      image: '/api/placeholder/300/200',
      model3d: '/api/placeholder/400/400',
      size: 'medium'
    },
    {
      id: 'fiber6003',
      name: 'FIBER LASER 6003',
      shortName: 'FIBER 6003',
      category: 'diameter',
      categoryName: 'Durchmessermessung',
      applications: ['fiber'],
      suitableFor: ['mp2'],
      description: 'Durchmessermessung für Glasfasern im Ziehturm',
      features: [
        'Produktdurchmesser: 50 - 500 μm',
        'Wiederholgenauigkeit: 0,02 μm',
        'Messrate: 2.500/Sek',
        'Messung vor und nach dem Coating'
      ],
      specifications: {
        range: '50 - 500 μm',
        accuracy: '0,02 μm',
        rate: '2.500/Sek'
      },
      advantages: [
        'Höchste Präzision für Glasfasern',
        'Messprinzip: Beugungsanalyse',
        'Messung der Ovalität und Position',
        'Zugkraftmessung über FFT-Analyse'
      ],
      dimensions: '150 x 65 x 225 mm',
      placement: 'Nach dem Ofen, vor und nach dem Coating',
      image: '/api/placeholder/300/200',
      model3d: '/api/placeholder/400/400',
      featured: true,
      size: 'small'
    }
  ];
  
  // Empfohlene Produkte für einen Messpunkt im ausgewählten Linientyp
  const getRecommendedProducts = (measurePointId: string) => {
    return products.filter(product => 
      product.suitableFor.includes(measurePointId) && 
      product.applications.includes(selectedLineType || 'cable')
    );
  };
  
  // Filtered products
  const filteredProducts = products.filter(product => {
    // Check if the product matches the search term
    const matchesSearch = search === '' || 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase());
    
    // Check if the product matches the selected category
    const matchesCategory = productFilterCategory === 'all' || product.category === productFilterCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Produkt zu einem Messpunkt hinzufügen
  const assignProduct = (measurePointId: string, productId: string) => {
    setConfiguration({
      ...configuration,
      [measurePointId]: productId
    });
  };
  
  // Produkt von einem Messpunkt entfernen
  const removeProduct = (measurePointId: string) => {
    const newConfig = { ...configuration };
    delete newConfig[measurePointId];
    setConfiguration(newConfig);
  };
  
  // Current measure point
  const currentMeasurePoint = selectedMeasurePoint && selectedLineType
    ? measurePoints[selectedLineType].find(p => p.id === selectedMeasurePoint)
    : null;
  
  // Current product
  const currentProduct = selectedProduct
    ? products.find(p => p.id === selectedProduct)
    : null;

  // Produkt zum Vergleich hinzufügen/entfernen
  const toggleComparisonProduct = (productId: string) => {
    if (comparisonProducts.includes(productId)) {
      setComparisonProducts(comparisonProducts.filter(id => id !== productId));
    } else if (comparisonProducts.length < 3) { // Maximal 3 Produkte vergleichen
      setComparisonProducts([...comparisonProducts, productId]);
    }
  };
  
  // Function to open product selection modal for a specific measure point
  const openProductSelectionModal = (measurePointId: string) => {
    setSelectedMeasurePointForProductSelection(measurePointId);
    setShowProductSelectionModal(true);
  };

  // Function to close product selection modal
  const closeProductSelectionModal = () => {
    setShowProductSelectionModal(false);
    setSelectedMeasurePointForProductSelection(null);
  };

  // Function to add a product to the selections for a measure point
  const selectProductForMeasurePoint = (productId: string) => {
    if (selectedMeasurePointForProductSelection) {
      const currentSelections = productSelections[selectedMeasurePointForProductSelection] || [];
      
      // Only add if not already selected
      if (!currentSelections.includes(productId)) {
        const newSelections = {
          ...productSelections,
          [selectedMeasurePointForProductSelection]: [...currentSelections, productId]
        };
        setProductSelections(newSelections);
      }
      
      closeProductSelectionModal();
    }
  };

  // Function to activate a product as the configured one for a measure point
  const activateProductForMeasurePoint = (measurePointId: string, productId: string) => {
    assignProduct(measurePointId, productId);
  };

  // Function to remove a product from the selections for a measure point
  const removeProductSelection = (measurePointId: string, productId: string) => {
    const currentSelections = productSelections[measurePointId] || [];
    const newSelections = currentSelections.filter(id => id !== productId);
    
    const updatedSelections = {
      ...productSelections,
      [measurePointId]: newSelections
    };
    
    setProductSelections(updatedSelections);
    
    // If the active product is removed, clear the configuration
    if (configuration[measurePointId] === productId) {
      removeProduct(measurePointId);
    }
  };
  
  // Funktion zum Aktivieren/Deaktivieren eines Produkts für einen Messpunkt
  const toggleActiveProduct = (measurePointId: string, productId: string) => {
    // Wenn das Produkt bereits aktiv ist, deaktivieren
    if (configuration[measurePointId] === productId) {
      removeProduct(measurePointId);
    } 
    // Sonst aktivieren
    else {
      assignProduct(measurePointId, productId);
    }
  };
  
  // This effect ensures that when a measure point is selected, the product selection is cleared and vice versa
  useEffect(() => {
    // We're removing the automatic clearing behavior to allow selections to be determined solely by user clicks
    // Previously, this would clear one selection when the other was active
    // Now selections will be driven purely by clicking in the sidebar
  }, [selectedProduct, selectedMeasurePoint]);
  
  // Function to directly switch between product and measure point views
  const switchToProductView = () => {
    // This function will not be used anymore since we've removed the toggle buttons
  };

  const switchToMeasurePointView = () => {
    // This function will not be used anymore since we've removed the toggle buttons
  };
  
  return (
    <div className="flex h-full">
      {/* Header / Navigation */}
      <div className="absolute top-0 left-0 right-0 z-50 shadow-sm border-b border-gray-200">
        <div className="bg-white py-3 px-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-8">
              <img src="/logo.svg" alt="SIKORA Logo" className="h-full" />
            </div>
            <div className="h-8 border-l border-gray-300 mx-4 hidden md:block"></div>
            <span className="text-xl font-medium text-sikora-blue hidden md:block">Digital Showroom</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowHelpOverlay(true)}
              className="text-gray-600 hover:text-sikora-blue transition-colors"
              aria-label="Hilfe"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            
            <button 
              className="text-gray-600 hover:text-sikora-blue transition-colors"
              aria-label="Menü"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main layout - adjusted to account for the header */}
      <div className="flex w-full h-full pt-14 relative z-10">
        {/* Linke Seitenleiste (Navigation) */}
        <div className={`bg-white shadow-md overflow-y-auto ${transitionStyles.panel} z-20 ${sidebarOpen ? 'w-80' : 'w-0'}`}>
          {sidebarOpen && (
            <div className={`p-4 ${transitionStyles.opacity} opacity-100`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-sikora-blue">Konfiguration</h2>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className={`text-gray-500 hover:text-gray-700 ${transitionStyles.all}`}
                >
                  <PanelLeft className="w-5 h-5" />
                </button>
              </div>
              
              {/* Linienauswahl oder Detailansicht */}
              {!selectedLineType ? (
                <div className={`${transitionStyles.opacity} animate-fadeIn`}>
                  <h3 className="font-medium mb-3 text-sikora-blue">Wählen Sie eine Produktionslinie</h3>
                  
                  <div className="space-y-3">
                    {lineTypes.map(line => (
                      <div 
                        key={line.id}
                        className={`bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-sikora-blue hover:shadow-md ${transitionStyles.all}`}
                        onClick={() => {
                          setSelectedLineType(line.id);
                          setRightPanelMode('empty');
                        }}
                      >
                        <div className="aspect-video bg-gray-100 rounded-md mb-3 overflow-hidden">
                          <img 
                            src={line.image} 
                            alt={line.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="font-medium mb-1 text-sikora-blue">{line.name}</h4>
                        <p className="text-sm text-gray-600">{line.description}</p>
                        </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={`${transitionStyles.opacity} animate-fadeIn`}>
                  <div className="mb-4 flex items-center">
                    <button 
                      onClick={() => {
                        setSelectedLineType(null);
                        setSelectedMeasurePoint(null);
                        setSelectedProduct(null);
                        setConfiguration({});
                        setRightPanelMode('empty');
                      }}
                      className={`text-sikora-blue hover:text-blue-800 flex items-center text-sm ${transitionStyles.all}`}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      <span>Zurück zur Linienauswahl</span>
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-medium mb-2 text-sikora-blue">
                      {lineTypes.find(l => l.id === selectedLineType)?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {lineTypes.find(l => l.id === selectedLineType)?.description}
                    </p>
                    
                    <div className={`bg-gray-50 p-3 rounded-lg border border-gray-200 ${transitionStyles.all}`}>
                      <div className="text-xs text-gray-600 mb-1">Konfigurationsstatus</div>
                      <div className="flex items-center">
                        <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-sikora-blue ${transitionStyles.all}`}
                            style={{ 
                              width: `${(Object.keys(configuration).length / measurePoints[selectedLineType].length) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="ml-3 text-sm font-medium">
                          {Object.keys(configuration).length}/{measurePoints[selectedLineType].length}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex border-b border-gray-200">
                    <button 
                        className={`px-3 py-2 text-sm font-medium ${transitionStyles.all} ${
                          activeTab === 'overview' 
                            ? 'text-sikora-blue border-b-2 border-sikora-blue' 
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      onClick={() => setActiveTab('overview')}
                    >
                      Übersicht
                    </button>
                    <button 
                        className={`px-3 py-2 text-sm font-medium ${transitionStyles.all} ${
                          activeTab === 'measurePoints' 
                            ? 'text-sikora-blue border-b-2 border-sikora-blue' 
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      onClick={() => setActiveTab('measurePoints')}
                    >
                      Messpunkte
                    </button>
                    <button 
                        className={`px-3 py-2 text-sm font-medium ${transitionStyles.all} ${
                          activeTab === 'products' 
                            ? 'text-sikora-blue border-b-2 border-sikora-blue' 
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      onClick={() => setActiveTab('products')}
                    >
                      Produkte
                    </button>
                    <button 
                        className={`px-3 py-2 text-sm font-medium ${transitionStyles.all} ${
                          activeTab === 'comparison' 
                            ? 'text-sikora-blue border-b-2 border-sikora-blue' 
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      onClick={() => setActiveTab('comparison')}
                    >
                      Vergleich
                    </button>
                    </div>
                  </div>
                  
                  {/* Tab Content */}
                  <div className="mt-4 animate-fadeIn">
                    {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div>
                        <p className="text-sm text-gray-600 mb-3">
                          Übersicht über die aktuell konfigurierten Messpunkte und Produkte.
                        </p>
                        <div className="space-y-3">
                          {measurePoints[selectedLineType].map(point => {
                            const hasProduct = configuration[point.id];
                            const product = products.find(p => p.id === configuration[point.id]);
                            
                            return (
                              <div 
                                key={point.id} 
                                className={`border rounded-lg p-3 ${
                                  hasProduct ? 'border-sikora-blue bg-blue-50' : 'border-gray-200 bg-gray-50'
                                } hover:border-sikora-blue hover:shadow-sm cursor-pointer ${transitionStyles.all}`}
                                onClick={() => {
                                  setSelectedMeasurePoint(point.id);
                                  setRightPanelMode('measurePoint');
                                }}
                              >
                                <div className="flex items-center mb-1">
                                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium mr-2">
                                    {point.position}
                          </div>
                                  <span className="font-medium">{point.name}</span>
                                  {point.important && (
                                    <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                      Wichtig
                                    </span>
                                  )}
                      </div>
                      
                                {hasProduct ? (
                                  <div className="ml-8 text-sm">
                                    <div className="flex items-center text-sikora-blue">
                                      <Check className="w-4 h-4 mr-1" />
                                      <span className="font-medium">{product?.name}</span>
                                </div>
                                    <p className="text-xs text-gray-600 mt-1">{product?.categoryName}</p>
                        </div>
                      ) : (
                                  <div className="ml-8 text-sm text-gray-600">
                                    Kein Produkt konfiguriert
                    </div>
                  )}
                        </div>
                            );
                          })}
                      </div>
                      </div>
                    )}
                    
                    {/* Measure Points Tab */}
                    {activeTab === 'measurePoints' && (
                      <div>
                        <p className="text-sm text-gray-600 mb-3">
                          Wählen Sie einen Messpunkt, um ihn zu konfigurieren.
                        </p>
                        <div className="space-y-3">
                        {measurePoints[selectedLineType].map(point => {
                            const hasProduct = configuration[point.id];
                            const selections = productSelections[point.id] || [];
                          
                          return (
                            <div 
                              key={point.id}
                                className={`border rounded-lg p-3 ${
                                  hasProduct ? 'border-sikora-blue bg-blue-50' : 'border-gray-200'
                                } hover:border-sikora-blue hover:shadow-sm cursor-pointer ${transitionStyles.all}`}
                                onClick={() => {
                                  setSelectedMeasurePoint(point.id);
                                  setRightPanelMode('measurePoint');
                                }}
                              >
                                <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium mr-2">
                                    {point.position}
                                  </div>
                                    <span className="font-medium">{point.name}</span>
                                  {point.important && (
                                      <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                      Wichtig
                                    </span>
                                  )}
                                </div>
                                  {selections.length > 0 && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                      {selections.length} Produkte
                                    </span>
                                )}
                              </div>
                                <p className="text-sm text-gray-600 mt-1 ml-8">{point.description}</p>
                                {hasProduct && (
                                  <div className="ml-8 mt-2 text-sm">
                                    <div className="flex items-center text-sikora-blue">
                                      <Check className="w-4 h-4 mr-1" />
                                      <span className="font-medium">{products.find(p => p.id === configuration[point.id])?.name}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                    {/* Products Tab */}
                  {activeTab === 'products' && (
                    <div>
                        <p className="text-sm text-gray-600 mb-3">
                          Verfügbare Produkte für {lineTypes.find(l => l.id === selectedLineType)?.name}.
                        </p>
                        
                        <div className="mb-3">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Produkte durchsuchen..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                              className={`w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-sikora-blue ${transitionStyles.all}`}
                          />
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          {search && (
                            <button 
                              onClick={() => setSearch('')}
                                className={`absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 ${transitionStyles.all}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                        <div className={`flex items-center overflow-x-auto pb-2 mb-3 gap-2 ${transitionStyles.all}`}>
                        {productCategories.map(category => (
                          <button
                            key={category.id}
                            className={`whitespace-nowrap px-3 py-1 rounded-full text-sm ${
                              productFilterCategory === category.id
                                  ? 'bg-sikora-blue bg-opacity-10 text-sikora-blue font-medium'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              } ${transitionStyles.all}`}
                            onClick={() => setProductFilterCategory(category.id)}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                      
                        <div className="space-y-3">
                          {filteredProducts
                            .filter(product => product.applications.includes(selectedLineType))
                            .map(product => {
                              // Find if this product is used in any measurement point
                              const usedInPoints = Object.entries(configuration)
                                .filter(([_, productId]) => productId === product.id)
                                .map(([pointId]) => measurePoints[selectedLineType].find(p => p.id === pointId));
                              
                              return (
                            <div 
                              key={product.id} 
                                  className={`border rounded-lg overflow-hidden ${
                                    usedInPoints.length > 0 ? 'border-sikora-blue' : 'border-gray-200'
                                  } hover:shadow-sm cursor-pointer ${transitionStyles.all}`}
                                  onClick={() => {
                                    setSelectedProduct(product.id);
                                    setRightPanelMode('product');
                                  }}
                            >
                              <div className="flex p-3">
                                    <div className="w-14 h-14 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="ml-3 flex-grow">
                                  <div className="flex justify-between">
                                    <div>
                                      <div className="font-medium">{product.name}</div>
                                      <div className="text-xs text-gray-600">{product.categoryName}</div>
                                    </div>
                                        <div className="flex items-center">
                                          {product.featured && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mr-1">
                                              Empfohlen
                                            </span>
                                          )}
                                      <button 
                                            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-sikora-blue hover:text-white transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                              if (!comparisonProducts.includes(product.id) && comparisonProducts.length < 3) {
                                          toggleComparisonProduct(product.id);
                                              }
                                        }}
                                      >
                                            <BarChart2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                                </div>
                              </div>
                              
                                  {usedInPoints.length > 0 && (
                                    <div className="bg-blue-50 py-1 px-3 border-t border-blue-100">
                                      <div className="text-xs text-sikora-blue">
                                        Verwendet in: {usedInPoints.filter(Boolean).map(p => p?.name).join(', ')}
                                      </div>
                                </div>
                              )}
                            </div>
                              );
                            })
                          }
                        </div>
                        
                        {filteredProducts.filter(p => p.applications.includes(selectedLineType)).length === 0 && (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-2">
                            <Search className="w-8 h-8 mx-auto" />
                          </div>
                          <p className="text-gray-600">Keine Produkte gefunden.</p>
                          <button 
                            onClick={() => {
                              setSearch('');
                              setProductFilterCategory('all');
                            }}
                              className={`mt-2 text-sikora-blue hover:text-sikora-blue hover:underline text-sm ${transitionStyles.all}`}
                          >
                            Filter zurücksetzen
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                    {/* Comparison Tab */}
                  {activeTab === 'comparison' && (
                    <div>
                        <p className="text-sm text-gray-600 mb-3">
                          Vergleichen Sie bis zu 3 Produkte miteinander.
                        </p>
                        
                        {comparisonProducts.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-gray-400 mb-2">
                              <BarChart2 className="w-8 h-8 mx-auto" />
                            </div>
                            <p className="text-gray-600">Keine Produkte zum Vergleich ausgewählt.</p>
                            <button 
                              onClick={() => setActiveTab('products')}
                              className={`mt-2 text-sikora-blue hover:text-sikora-blue hover:underline text-sm ${transitionStyles.all}`}
                            >
                              Zu Produkten wechseln
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex gap-2">
                            {comparisonProducts.map(productId => {
                              const product = products.find(p => p.id === productId);
                                return product && (
                                  <div 
                                    key={product.id}
                                    className="flex-1 border border-gray-200 rounded-lg p-2 text-center"
                                  >
                                    <div className="w-12 h-12 mx-auto bg-gray-100 rounded overflow-hidden mb-2">
                                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="font-medium text-sm truncate">{product.name}</div>
                                  <button 
                                      className="text-xs text-red-600 hover:underline mt-1"
                                      onClick={() => toggleComparisonProduct(product.id)}
                                  >
                                      Entfernen
                                  </button>
                                </div>
                              );
                            })}
                              
                              {comparisonProducts.length < 3 && (
                                <div 
                                  className="flex-1 border border-dashed border-gray-300 rounded-lg p-2 flex items-center justify-center cursor-pointer hover:bg-gray-50"
                                  onClick={() => setActiveTab('products')}
                                >
                                  <div className="text-gray-500 text-center">
                                    <Plus className="w-5 h-5 mx-auto mb-1" />
                                    <span className="text-xs">Produkt hinzufügen</span>
                            </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="border-t border-gray-200 pt-3">
                              <div className="font-medium mb-2">Spezifikationen</div>
                              
                              <div className="space-y-2">
                                <div className="grid grid-cols-4 gap-2">
                                  <div className="text-xs text-gray-500">Bereich</div>
                                    {comparisonProducts.map(productId => {
                                      const product = products.find(p => p.id === productId);
                                      return (
                                      <div key={productId} className="text-xs">
                                          {product?.specifications.range}
                                      </div>
                                      );
                                    })}
                                </div>
                                
                                <div className="grid grid-cols-4 gap-2">
                                  <div className="text-xs text-gray-500">Genauigkeit</div>
                                    {comparisonProducts.map(productId => {
                                      const product = products.find(p => p.id === productId);
                                      return (
                                      <div key={productId} className="text-xs">
                                        {product?.specifications.accuracy || "-"}
                                      </div>
                                      );
                                    })}
                                </div>
                                
                                <div className="grid grid-cols-4 gap-2">
                                  <div className="text-xs text-gray-500">Messrate</div>
                                    {comparisonProducts.map(productId => {
                                      const product = products.find(p => p.id === productId);
                                      return (
                                      <div key={productId} className="text-xs">
                                        {product?.specifications.rate || "-"}
                                      </div>
                                      );
                                    })}
                            </div>
                          </div>
                            </div>
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Main section - Flex-grow sorgt dafür, dass der Inhalt den verfügbaren Platz ausfüllt */}
        <div className="flex-grow flex flex-col relative">
          {/* Controls */}
          <div className="absolute top-4 left-4 z-20 flex space-x-2">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className={`bg-white rounded-lg p-2 shadow hover:bg-gray-50 ${transitionStyles.all}`}
              >
                <PanelRight className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <button 
              className={`bg-white rounded-lg p-2 shadow hover:bg-gray-50 ${transitionStyles.all}`}
              onClick={() => setView3DMode('line')}
            >
              <Home className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="absolute top-4 right-4 z-20 flex space-x-2">
            <button 
              className={`bg-white rounded-lg p-2 shadow hover:bg-gray-50 ${transitionStyles.all}`}
            >
              <Maximize className="w-5 h-5 text-gray-600" />
            </button>
            {!rightPanelOpen && (
              <button 
                onClick={() => setRightPanelOpen(true)}
                className={`bg-white rounded-lg p-2 shadow hover:bg-gray-50 ${transitionStyles.all}`}
              >
                <PanelLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
          
          {/* 3D-Visualisierung - Nimmt den gesamten verfügbaren Raum ein */}
          <div className="absolute inset-0 z-10 w-full h-full">
            {selectedLineType ? (
              <div className="w-full h-full">
                <Scene3D className="w-full h-full" />
                
                {/* Controls at the bottom - überlappend über der 3D-Szene */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className={`bg-white rounded-full shadow flex space-x-1 p-1 ${transitionStyles.all}`}>
                    <button className={`p-2 rounded-full hover:bg-gray-100 ${transitionStyles.all}`}>
                      <ZoomOut className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className={`p-2 rounded-full hover:bg-gray-100 ${transitionStyles.all}`}>
                      <ZoomIn className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className={`p-2 rounded-full hover:bg-gray-100 ${transitionStyles.all}`}>
                      <RotateCw className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className={`text-center p-8 max-w-md mx-auto ${transitionStyles.opacity} animate-fadeIn`}>
                  <div className="text-sikora-blue mb-4">
                    <ArrowLeft className="w-10 h-10 mx-auto" />
                  </div>
                  <p className="text-sikora-blue font-medium text-xl mb-2">Wählen Sie zuerst eine Produktionslinie</p>
                  <p className="text-gray-600">
                    In der linken Seitenleiste können Sie aus verschiedenen Produktionslinien auswählen, um mit der Konfiguration zu beginnen.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Rechte Seitenleiste (Detail-Informationen) */}
        <div className={`bg-white shadow-md overflow-y-auto ${transitionStyles.panel} z-20 ${rightPanelOpen ? 'w-96' : 'w-0'}`}>
          {rightPanelOpen && (
            <div className={`p-4 ${transitionStyles.opacity} opacity-100`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-sikora-blue">Details</h2>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setRightPanelOpen(false)}
                    className={`text-gray-500 hover:text-gray-700 ${transitionStyles.all}`}
                  >
                    <PanelRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Key is used to force re-render and trigger animation when content type changes */}
              <div 
                key={`details-${rightPanelMode}-${selectedProduct ? 'product-' + selectedProduct : ''}${selectedMeasurePoint ? 'point-' + selectedMeasurePoint : ''}`} 
                className="animate-fadeInBlue rounded-lg overflow-hidden"
              >
                {rightPanelMode === 'product' && selectedProduct ? (
                  <div>
                    {/* Product Details */}
                    {(() => {
                      const product = products.find(p => p.id === selectedProduct);
                      if (!product) return null;
                      
                      // Find measure points where this product is used
                      const usedInPoints = Object.entries(configuration)
                        .filter(([_, productId]) => productId === product.id)
                        .map(([pointId]) => selectedLineType ? measurePoints[selectedLineType].find(p => p.id === pointId) : null)
                        .filter(Boolean);
                      
                      return (
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium text-xl">{product.name}</h3>
                              <p className="text-gray-600 text-sm">{product.categoryName}</p>
                            </div>
                          </div>
                          
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4 relative group">
                            <img 
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                              <button className="bg-white rounded-full p-2 shadow-md hover:bg-sikora-blue hover:text-white transition-colors">
                                <ZoomIn className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="mb-5">
                            <div className="text-gray-700">{product.description}</div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mb-5">
                            <button className="bg-sikora-blue text-white rounded-lg py-2.5 px-4 flex items-center justify-center hover:bg-opacity-90 transition-colors shadow-sm">
                              <Download className="w-4 h-4 mr-2" />
                              Datenblatt
                            </button>
                            <button className="bg-white border border-sikora-blue text-sikora-blue rounded-lg py-2.5 px-4 flex items-center justify-center hover:bg-blue-50 transition-colors shadow-sm">
                              <Eye className="w-4 h-4 mr-2" />
                              AR-Ansicht
                            </button>
                          </div>
                          
                          {/* All Measure Points Section */}
                          {selectedLineType && (
                            <div className="mb-5">
                              <h4 className="font-medium text-sikora-blue mb-3 flex items-center justify-between">
                                <span className="flex items-center">
                                  <Layers className="w-4 h-4 mr-1.5" />
                                  Messpunkte
                                </span>
                              </h4>
                              <div className="bg-blue-50 border border-blue-100 rounded-lg overflow-hidden divide-y divide-blue-100 max-h-[250px] overflow-y-auto">
                                {measurePoints[selectedLineType].map(point => {
                                  const isUsed = configuration[point.id] === product.id;
                                  const isSelected = productSelections[point.id]?.includes(product.id) || false;
                                  
                                  return (
                                    <div key={point.id} className="p-3 hover:bg-blue-100/50 transition-colors">
                                      <div className="flex items-center justify-between">
                                        <div 
                                          className="flex items-center cursor-pointer" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedMeasurePoint(point.id);
                                            setRightPanelMode('measurePoint');
                                          }}
                                          data-measure-point-item
                                        >
                                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium mr-2">
                                            {point.position}
                                          </div>
                                          <span className="font-medium mr-1">{point.name}</span>
                                          {point.important && (
                                            <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                                              Wichtig
                                            </span>
                                          )}
                                        </div>
                                        <div>
                                          {isUsed ? (
                                            <button 
                                              className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center"
                                              onClick={() => removeProduct(point.id)}
                                            >
                                              <Check className="w-3 h-3 mr-1" />
                                              Aktiv
                                            </button>
                                          ) : isSelected ? (
                                            <button 
                                              className="text-xs bg-sikora-blue text-white px-2 py-1 rounded-full"
                                              onClick={() => assignProduct(point.id, product.id)}
                                            >
                                              Aktivieren
                                            </button>
                                          ) : (
                                            <button 
                                              className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full hover:bg-sikora-blue hover:text-white transition-colors"
                                              onClick={() => {
                                                // Add to selections first
                                                const currentSelections = productSelections[point.id] || [];
                                                if (!currentSelections.includes(product.id)) {
                                                  const newSelections = {
                                                    ...productSelections,
                                                    [point.id]: [...currentSelections, product.id]
                                                  };
                                                  setProductSelections(newSelections);
                                                }
                                                // Then activate
                                                assignProduct(point.id, product.id);
                                              }}
                                            >
                                              Hinzufügen
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <p 
                                        className="text-xs text-gray-600 mt-1 ml-8 line-clamp-1 cursor-pointer" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedMeasurePoint(point.id);
                                          setRightPanelMode('measurePoint');
                                        }}
                                        data-measure-point-item
                                      >
                                        {point.description}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* Currently Used In Section */}
                          {usedInPoints.length > 0 && (
                            <div className="mb-5">
                              <h4 className="font-medium text-sikora-blue mb-2">Aktuell verwendet in:</h4>
                              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                <div className="space-y-2">
                                  {usedInPoints.map(point => point && (
                                    <div key={point.id} className="flex items-center">
                                      <div 
                                        className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium mr-2 cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedMeasurePoint(point.id);
                                          setRightPanelMode('measurePoint');
                                        }}
                                        data-measure-point-item
                                      >
                                        {point.position}
                                      </div>
                                      <span 
                                        className="flex-grow cursor-pointer" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedMeasurePoint(point.id);
                                          setRightPanelMode('measurePoint');
                                        }}
                                        data-measure-point-item
                                      >
                                        {point.name}
                                      </span>
                                      <button 
                                        className="text-xs text-red-600 hover:underline flex items-center"
                                        onClick={() => removeProduct(point.id)}
                                      >
                                        <X className="w-3 h-3 mr-1" />
                                        Entfernen
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-5">
                            <div>
                              <h4 className="font-medium text-sikora-blue mb-3 flex items-center">
                                <Settings className="w-4 h-4 mr-1.5" />
                                Spezifikationen
                              </h4>
                              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                  <tbody>
                                    <tr className="border-b border-gray-200">
                                      <td className="py-2 px-3 font-medium text-gray-600 bg-gray-50 w-1/3">Messbereich</td>
                                      <td className="py-2 px-3">{product.specifications.range}</td>
                                    </tr>
                                    {product.specifications.accuracy && (
                                      <tr className="border-b border-gray-200">
                                        <td className="py-2 px-3 font-medium text-gray-600 bg-gray-50">Genauigkeit</td>
                                        <td className="py-2 px-3">{product.specifications.accuracy}</td>
                                      </tr>
                                    )}
                                    {product.specifications.rate && (
                                      <tr className="border-b border-gray-200">
                                        <td className="py-2 px-3 font-medium text-gray-600 bg-gray-50">Messrate</td>
                                        <td className="py-2 px-3">{product.specifications.rate}</td>
                                      </tr>
                                    )}
                                    {product.specifications.temperature && (
                                      <tr className="border-b border-gray-200">
                                        <td className="py-2 px-3 font-medium text-gray-600 bg-gray-50">Temperatur</td>
                                        <td className="py-2 px-3">{product.specifications.temperature}</td>
                                      </tr>
                                    )}
                                    {product.specifications.speed && (
                                      <tr>
                                        <td className="py-2 px-3 font-medium text-gray-600 bg-gray-50">Geschwindigkeit</td>
                                        <td className="py-2 px-3">{product.specifications.speed}</td>
                                </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sikora-blue mb-3 flex items-center">
                                <Check className="w-4 h-4 mr-1.5" />
                                Merkmale
                              </h4>
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                  {product.features.map((feature, idx) => (
                                    <li key={idx}>{feature}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sikora-blue mb-3 flex items-center">
                                <ArrowRight className="w-4 h-4 mr-1.5" />
                                Vorteile
                              </h4>
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                  {product.advantages.map((advantage, idx) => (
                                    <li key={idx}>{advantage}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sikora-blue mb-3 flex items-center">
                                <Layers className="w-4 h-4 mr-1.5" />
                                Installation
                              </h4>
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <p className="text-sm text-gray-700">{product.placement}</p>
                              </div>
                            </div>
                            
                            <div className="pt-2 grid grid-cols-2 gap-3">
                              <button 
                                className="py-2.5 bg-sikora-blue text-white rounded hover:bg-opacity-90 flex items-center justify-center"
                                onClick={() => {
                                  if (!comparisonProducts.includes(product.id) && comparisonProducts.length < 3) {
                                    toggleComparisonProduct(product.id);
                                    setActiveTab('comparison');
                                    setSidebarOpen(true);
                                  }
                                }}
                              >
                                <BarChart2 className="w-4 h-4 mr-2" />
                                Zum Vergleich
                          </button>
                              <button 
                                className="py-2.5 border border-sikora-blue text-sikora-blue rounded hover:bg-blue-50 flex items-center justify-center"
                                onClick={() => {
                                  // Open 3D view of product
                                  setView3DMode('product');
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                3D-Ansicht
                          </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : rightPanelMode === 'measurePoint' && selectedMeasurePoint && selectedLineType ? (
                  <div>
                    {/* Measure Point Details */}
                    {(() => {
                      const measurePoint = measurePoints[selectedLineType].find(p => p.id === selectedMeasurePoint);
                      if (!measurePoint) return null;
                      
                      const hasSelectedProduct = Boolean(configuration[measurePoint.id]);
                      const selectedProductId = configuration[measurePoint.id];
                      const selectedProductObj = products.find(p => p.id === selectedProductId);
                      const selections = productSelections[measurePoint.id] || [];
                      
                      // Get compatible products for this measure point
                      const compatibleProducts = products.filter(product => 
                        product.applications.includes(selectedLineType)
                      );
                      
                      return (
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium mr-2">
                                {measurePoint.position}
                              </div>
                              <h3 className="font-medium text-xl">{measurePoint.name}</h3>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <div className="text-gray-700">{measurePoint.description}</div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <h4 className="font-medium text-sikora-blue mb-1">Anforderungen</h4>
                              <p className="text-sm text-gray-700">{measurePoint.requirements}</p>
                            </div>
                            
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <h4 className="font-medium text-sikora-blue mb-1">Umgebungsfaktoren</h4>
                              <p className="text-sm text-gray-700">{measurePoint.environmentalFactors}</p>
                            </div>
                          </div>
                          
                          <div className="mt-6">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-sikora-blue">Konfiguration</h4>
                              <button 
                                className="text-xs text-sikora-blue hover:underline flex items-center"
                                onClick={() => openProductSelectionModal(measurePoint.id)}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Produkte hinzufügen
                              </button>
                            </div>
                            
                            {selections.length > 0 ? (
                              <div className="space-y-3">
                                {selections.map(productId => {
                                  const product = products.find(p => p.id === productId);
                                  const isActive = configuration[measurePoint.id] === productId;
                                  
                                  return product && (
                                    <div 
                                      key={product.id}
                                      className={`border rounded-lg overflow-hidden ${
                                        isActive ? 'border-green-200 bg-green-50' : 'border-gray-200'
                                      } ${transitionStyles.all}`}
                                    >
                                      <div className="flex p-3">
                                        <div 
                                          className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedProduct(product.id);
                                            setRightPanelMode('product');
                                          }}
                                          data-product-item
                                        >
                                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="ml-3 flex-grow">
                                          <div className="flex justify-between">
                                            <div>
                                              <div 
                                                className="font-medium cursor-pointer" 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedProduct(product.id);
                                                  setRightPanelMode('product');
                                                }}
                                                data-product-item
                                              >
                                                {product.name}
                                              </div>
                                              <div className="text-xs text-gray-600">{product.categoryName}</div>
                                            </div>
                                            <div>
                                              <button
                                                className={`px-2 py-1 rounded text-xs font-medium ${
                                                  isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-sikora-blue hover:text-white'
                                                } ${transitionStyles.all}`}
                                                onClick={() => toggleActiveProduct(measurePoint.id, product.id)}
                                              >
                                                {isActive ? (
                                                  <span className="flex items-center">
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Aktiv
                                                  </span>
                                                ) : 'Aktivieren'}
                                              </button>
                                            </div>
                                          </div>
                                          <p className="text-xs text-gray-600 mt-1">{product.description}</p>
                                          
                                          <div className="flex justify-between items-center mt-2">
                                            <div className="flex flex-wrap gap-1">
                                              <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs">
                                                {product.specifications.range}
                                              </span>
                                            </div>
                                            <button 
                                              className="text-xs text-sikora-blue hover:underline"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProduct(product.id);
                                                setRightPanelMode('product');
                                              }}
                                              data-product-item
                                            >
                                              Details
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-gray-600 mb-2">Keine Produkte ausgewählt</p>
                                <button 
                                  className="px-3 py-1.5 bg-sikora-blue text-white text-sm rounded hover:bg-opacity-90"
                                  onClick={() => openProductSelectionModal(measurePoint.id)}
                                >
                                  Produkt hinzufügen
                                </button>
                              </div>
                            )}
                            
                            {compatibleProducts.length > 0 && selections.length === 0 && (
                              <div className="mt-4">
                                <h5 className="text-sm text-gray-700 mb-2">Empfohlene Produkte:</h5>
                                <div className="grid grid-cols-2 gap-2">
                                  {compatibleProducts
                                    .filter(p => p.featured)
                                    .slice(0, 4)
                                    .map(product => (
                                      <div 
                                        key={product.id}
                                        className="border border-gray-200 rounded p-2 cursor-pointer hover:border-sikora-blue"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedProduct(product.id);
                                          setRightPanelMode('product');
                                        }}
                                        data-product-item
                                      >
                                        <div className="flex items-center space-x-2">
                                          <div className="w-8 h-8 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                          </div>
                                          <div className="overflow-hidden">
                                            <div className="text-xs font-medium truncate">{product.name}</div>
                                            <div className="text-xs text-gray-600 truncate">{product.categoryName}</div>
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  }
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div>
                    {/* Empty state when no product or measure point is selected */}
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <Info className="w-10 h-10 mx-auto" />
                      </div>
                      <p className="text-gray-700 mb-2 font-medium">Detailansicht</p>
                      <p className="text-sm text-gray-600 mb-4">
                        Wählen Sie einen Messpunkt oder ein Produkt aus, um hier die Details zu sehen.
                      </p>
                      
                      {selectedLineType && (
                        <div className="space-y-2">
                          <button 
                            className="w-full px-4 py-2 bg-sikora-blue text-white rounded hover:bg-opacity-90 flex items-center justify-center"
                            onClick={() => setActiveTab('measurePoints')}
                          >
                            <Layers className="w-4 h-4 mr-2" />
                            Messpunkte anzeigen
                          </button>
                          <button 
                            className="w-full px-4 py-2 bg-white border border-sikora-blue text-sikora-blue rounded hover:bg-blue-50 flex items-center justify-center"
                            onClick={() => setActiveTab('products')}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Produkte durchsuchen
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Help overlay */}
      {showHelpOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-slideUp">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-sikora-blue">Hilfe & Anleitung</h2>
              <button 
                onClick={() => setShowHelpOverlay(false)}
                  className={`text-gray-500 hover:text-gray-700 ${transitionStyles.all}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
              
              <div className="space-y-4">
                <div className="animate-slideInLeft" style={{ animationDelay: '100ms' }}>
                  <h3 className="font-medium mb-2 text-sikora-blue">Willkommen zum SIKORA Digital Showroom</h3>
                  <p className="text-gray-600">
                    Dieser digitale Showroom ermöglicht es Ihnen, SIKORA-Produkte in virtuellen Produktionslinien zu konfigurieren.
                  </p>
                </div>
                
                <div className="animate-slideInLeft" style={{ animationDelay: '200ms' }}>
                  <h4 className="font-medium mb-1 text-sikora-blue">So starten Sie:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>Wählen Sie zunächst eine Produktionslinie aus (Kabel, Rohr oder Glasfaser).</li>
                    <li>Navigieren Sie zu den Messpunkten, um spezifische Positionen in der Linie zu konfigurieren.</li>
                    <li>Wählen Sie für jeden Messpunkt passende SIKORA-Produkte aus oder nutzen Sie unsere Empfehlungen.</li>
                    <li>Nutzen Sie die 3D-Ansicht, um Ihre konfigurierte Linie zu visualisieren.</li>
                  </ol>
                </div>
                
                <div className="animate-slideInLeft" style={{ animationDelay: '300ms' }}>
                  <h4 className="font-medium mb-1 text-sikora-blue">Funktionen:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Produktvergleich für bis zu 3 Produkte</li>
                    <li>Detaillierte Produktinformationen mit technischen Spezifikationen</li>
                    <li>Automatische Empfehlungen basierend auf Ihren Anforderungen</li>
                    <li>3D-Visualisierung der konfigurierten Produktionslinie</li>
                  </ul>
                </div>
                
                <div className="pt-2 animate-slideInLeft" style={{ animationDelay: '400ms' }}>
                  <p className="text-gray-600">
                    Für weitere Unterstützung kontaktieren Sie bitte unseren technischen Support unter <span className="text-sikora-blue">support@sikora.net</span>.
                  </p>
              </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 flex justify-end rounded-b-lg border-t border-gray-200">
                <button 
                  onClick={() => setShowHelpOverlay(false)}
                className={`px-4 py-2 bg-sikora-blue text-white rounded hover:bg-opacity-90 transition-colors ${transitionStyles.all}`}
                >
                  Verstanden
                </button>
              </div>
            </div>
          </div>
      )}

      {/* Product Selection Modal */}
      {showProductSelectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className={`bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col ${transitionStyles.all} animate-slideUp`}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-medium text-sikora-blue">Produkte für Messpunkt auswählen</h2>
              <button 
                onClick={closeProductSelectionModal}
                className={`text-gray-500 hover:text-gray-700 ${transitionStyles.all}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 flex-grow overflow-y-auto">
              <div className="mb-3">
                {selectedMeasurePointForProductSelection && selectedLineType && (
                  <div className="flex items-center mb-3 animate-fadeIn">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium mr-2">
                      {measurePoints[selectedLineType].find(p => p.id === selectedMeasurePointForProductSelection)?.position}
                    </div>
                    <span className="font-medium">{measurePoints[selectedLineType].find(p => p.id === selectedMeasurePointForProductSelection)?.name}</span>
        </div>
      )}
                <p className="text-sm text-gray-600 mb-4">
                  Wählen Sie mehrere Produkte aus, die für diesen Messpunkt in Frage kommen. 
                  Sie können später ein aktives Produkt festlegen.
                </p>
              </div>
              
              <div className="mb-4 animate-fadeIn">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Produkte durchsuchen..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-sikora-blue ${transitionStyles.all}`}
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  {search && (
                    <button 
                      onClick={() => setSearch('')}
                      className={`absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 ${transitionStyles.all}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className={`flex items-center overflow-x-auto pb-2 mb-3 gap-2 animate-fadeIn ${transitionStyles.all}`}>
                {productCategories.map(category => (
                  <button
                    key={category.id}
                    className={`whitespace-nowrap px-3 py-1 rounded-full text-sm ${
                      productFilterCategory === category.id
                        ? 'bg-sikora-blue bg-opacity-10 text-sikora-blue font-medium'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${transitionStyles.all}`}
                    onClick={() => setProductFilterCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              
              {/* First show recommended products */}
              {selectedMeasurePointForProductSelection && (
                <div className="mb-6 animate-slideInLeft">
                  <div className="flex items-center mb-2">
                    <div className="h-5 w-5 flex items-center justify-center rounded-full bg-amber-100 mr-2">
                      <Check className="w-3 h-3 text-amber-800" />
                    </div>
                    <h3 className="text-md font-medium text-amber-800">Empfohlene Produkte</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getRecommendedProducts(selectedMeasurePointForProductSelection)
                      .filter(product => 
                        filteredProducts.some(p => p.id === product.id)
                      )
                      .map((product, index) => {
                        // Verwende eine stabile Referenz auf die Messpunkt-ID
                        const measurePointId = selectedMeasurePointForProductSelection;
                        const isSelected = productSelections[measurePointId]?.includes(product.id);
                        const isActive = configuration[measurePointId] === product.id;
                        
                        return (
                          <div 
                            key={product.id} 
                            className={`bg-white rounded-lg border ${
                              isActive
                                ? 'border-green-200 bg-green-50 shadow'
                                : isSelected
                                  ? 'border-blue-200 bg-blue-50'
                                  : 'border-amber-200 bg-amber-50'
                            } overflow-hidden hover:border-sikora-blue hover:shadow-md cursor-pointer ${transitionStyles.all} animate-fadeIn`}
                            style={{ animationDelay: `${index * 50}ms` }}
                            onClick={() => {
                              if (measurePointId) {
                                // Toggle selection
                                if (isSelected) {
                                  // If it's the active product, first remove it from configuration
                                  if (isActive) {
                                    removeProduct(measurePointId);
                                  }
                                  
                                  // Remove from selections
                                  removeProductSelection(measurePointId, product.id);
                                } else {
                                  // Add to selections
                                  const currentSelections = productSelections[measurePointId] || [];
                                  const newSelections = {
                                    ...productSelections,
                                    [measurePointId]: [...currentSelections, product.id]
                                  };
                                  setProductSelections(newSelections);
                                }
                              }
                            }}
                          >
                            <div className="relative">
                              <div className="absolute top-0 right-0 z-10">
                                <div className="bg-amber-100 text-amber-800 py-1 px-2 text-xs font-medium rounded-bl">
                                  Empfohlen
                                </div>
                              </div>
                              <div className="flex p-3">
                                <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="ml-3 flex-grow">
                                  <div className="flex justify-between">
                                    <div>
                                      <div className="font-medium">{product.name}</div>
                                      <div className="text-xs text-gray-600">{product.categoryName}</div>
                                    </div>
                                    <div>
                                      {isActive && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          <Check className="w-3 h-3 mr-1" />
                                          Aktiv
                                        </span>
                                      )}
                                      {isSelected && !isActive && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          Ausgewählt
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                                  
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {product.features.slice(0, 1).map((feature, idx) => (
                                      <span key={idx} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs">
                                        {feature.length > 30 ? feature.substring(0, 30) + '...' : feature}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
    </div>
  );
                      })
                    }
                  </div>
                </div>
              )}
              
              <div className="animate-slideInRight">
                <div className="flex items-center mb-2">
                  <div className="h-5 w-5 flex items-center justify-center rounded-full bg-gray-100 mr-2">
                    <Plus className="w-3 h-3 text-gray-700" />
                  </div>
                  <h3 className="text-md font-medium text-gray-700">Weitere Produkte</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredProducts
                    .filter(product => 
                      selectedLineType && 
                      product.applications.includes(selectedLineType) && 
                      !(selectedMeasurePointForProductSelection && 
                        getRecommendedProducts(selectedMeasurePointForProductSelection).some(p => p.id === product.id))
                    )
                    .map((product, index) => {
                      if (!selectedMeasurePointForProductSelection) return null;
                      
                      const measurePointId = selectedMeasurePointForProductSelection;
                      const isSelected = productSelections[measurePointId]?.includes(product.id);
                      const isActive = configuration[measurePointId] === product.id;
                      
                      return (
                        <div 
                          key={product.id} 
                          className={`bg-white rounded-lg border ${
                            isActive
                              ? 'border-green-200 bg-green-50 shadow'
                              : isSelected
                                ? 'border-blue-200 bg-blue-50'
                                : 'border-gray-200'
                          } overflow-hidden hover:border-sikora-blue hover:shadow-md cursor-pointer ${transitionStyles.all} animate-fadeIn`}
                          style={{ animationDelay: `${index * 30}ms` }}
                          onClick={() => {
                            // Toggle selection
                            if (isSelected) {
                              // If it's the active product, first remove it from configuration
                              if (isActive) {
                                removeProduct(measurePointId);
                              }
                              
                              // Remove from selections
                              removeProductSelection(measurePointId, product.id);
                            } else {
                              // Add to selections
                              const currentSelections = productSelections[measurePointId] || [];
                              const newSelections = {
                                ...productSelections,
                                [measurePointId]: [...currentSelections, product.id]
                              };
                              setProductSelections(newSelections);
                            }
                          }}
                        >
                          <div className="flex p-3">
                            <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="ml-3 flex-grow">
                              <div className="flex justify-between">
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-xs text-gray-600">{product.categoryName}</div>
                                </div>
                                <div>
                                  {isActive && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <Check className="w-3 h-3 mr-1" />
                                      Aktiv
                                    </span>
                                  )}
                                  {isSelected && !isActive && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Ausgewählt
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                              
                              <div className="mt-2 flex flex-wrap gap-1">
                                {product.features.slice(0, 1).map((feature, idx) => (
                                  <span key={idx} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs">
                                    {feature.length > 30 ? feature.substring(0, 30) + '...' : feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {product.featured && (
                            <div className="bg-amber-50 text-amber-800 py-1 px-3 text-xs font-medium">
                              Empfohlenes Produkt
                            </div>
                          )}
                        </div>
                      );
                    })
                  }
                </div>
              </div>
              
              {filteredProducts.filter(p => selectedLineType && p.applications.includes(selectedLineType)).length === 0 && (
                <div className="text-center py-8 animate-fadeIn">
                  <div className="text-gray-400 mb-2">
                    <Search className="w-8 h-8 mx-auto" />
                  </div>
                  <p className="text-gray-600">Keine Produkte gefunden.</p>
                  <button 
                    onClick={() => {
                      setSearch('');
                      setProductFilterCategory('all');
                    }}
                    className={`mt-2 text-sikora-blue hover:text-sikora-blue hover:underline text-sm ${transitionStyles.all}`}
                  >
                    Filter zurücksetzen
                  </button>
                </div>
              )}
            </div>
            
            <div className={`p-4 border-t border-gray-200 bg-gray-50 flex justify-between ${transitionStyles.all}`}>
              <div className="text-sm text-gray-600">
                {selectedMeasurePointForProductSelection && productSelections[selectedMeasurePointForProductSelection]?.length > 0 ? (
                  <span>{productSelections[selectedMeasurePointForProductSelection].length} Produkte ausgewählt</span>
                ) : (
                  <span>Keine Produkte ausgewählt</span>
                )}
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    if (selectedMeasurePointForProductSelection) {
                      // Get a reference to the measure point ID
                      const measurePointId = selectedMeasurePointForProductSelection;
                      
                      // Clear selections for this measure point
                      setProductSelections({
                        ...productSelections,
                        [measurePointId]: []
                      });
                      
                      // Remove any active product configuration
                      removeProduct(measurePointId);
                    }
                  }}
                  className={`px-4 py-2 text-gray-700 hover:text-red-600 ${transitionStyles.all}`}
                >
                  Zurücksetzen
                </button>
                <button 
                  onClick={closeProductSelectionModal}
                  className={`px-4 py-2 bg-sikora-blue text-white rounded-md hover:bg-opacity-90 ${transitionStyles.all}`}
                >
                  Fertig
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SikoraLineConfigurator;