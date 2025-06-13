import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Target, Lightbulb, X, RotateCcw } from 'lucide-react';

interface ProductRecommendationWizardProps {
  onClose: () => void;
  onProductSelect: (productName: string) => void;
}

interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

interface Question {
  id: string;
  title: string;
  subtitle: string;
  type: 'single' | 'multiple';
  options: QuestionOption[];
}

interface ProductSeries {
  id: string;
  name: string;
  description: string;
  questions: Question[];
}

interface ConfigurationAnswer {
  questionId: string;
  value: string | string[];
}

interface RecommendationResult {
  productName: string;
  confidence: number;
  reasons: string[];
  alternatives: string[];
  specifications?: Record<string, string>;
}

const ProductRecommendationWizard: React.FC<ProductRecommendationWizardProps> = ({
  onClose,
  onProductSelect
}) => {
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<ConfigurationAnswer[]>([]);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);

  // Definition der Produktserien mit spezifischen Fragenkatalogen
  const productSeries: ProductSeries[] = [
    {
      id: 'laser-2000',
      name: 'LASER Series 2000',
      description: 'Berührungslose Durchmessermessung mit Lasertechnologie',
      questions: [
        {
          id: 'diameter-range',
          title: 'Durchmesserbereich',
          subtitle: 'Welchen Produktdurchmesser möchten Sie messen?',
          type: 'single',
          options: [
            { value: 'micro', label: '0,05 - 5 mm', description: 'LASER 2005 XY (Höchste Präzision ±0,25 μm)' },
            { value: 'small', label: '0,2 - 10 mm', description: 'LASER 2010 XY/T (Standard kleine Durchmesser)' },
            { value: 'medium', label: '0,5 - 50 mm', description: 'LASER 2050 XY/T (Universell einsetzbar)' },
            { value: 'large', label: '1 - 100 mm', description: 'LASER 2100 XY/T (Große Durchmesser)' },
            { value: 'xlarge', label: '2 - 200 mm', description: 'LASER 2200 XY (Sehr große Durchmesser)' }
          ]
        },
        {
          id: 'measurement-axes',
          title: 'Messachsen',
          subtitle: 'Wie viele Messrichtungen benötigen Sie?',
          type: 'single',
          options: [
            { value: 'xy', label: '2-Achsen (X/Y)', description: 'Durchmesser in zwei Richtungen, Ovalität' },
            { value: 'single', label: '1-Achse (T)', description: 'Einfache Durchmessermessung, kostengünstig' }
          ]
        }
      ]
    },
    {
      id: 'x-ray-6000',
      name: 'X-RAY 6000 Series',
      description: 'Röntgen-Wanddickenmessung für alle Materialien',
      questions: [
        {
          id: 'application',
          title: 'Anwendungsbereich',
          subtitle: 'In welchem Bereich möchten Sie das X-RAY System einsetzen?',
          type: 'single',
          options: [
            { value: 'cable-insulation', label: 'Kabelisolierung', description: 'PE, PVC, PTFE Isolierungen' },
            { value: 'medical-tubing', label: 'Medizinische Schläuche', description: 'Katheter, medizinische Anwendungen' },
            { value: 'automotive-cables', label: 'Automobilkabel', description: 'Fahrzeugleitungen' },
            { value: 'multi-layer', label: 'Mehrschichtig', description: 'Komplexe Schichtstrukturen' },
            { value: 'pipes-tubes', label: 'Rohre & Schläuche', description: 'Industrie-Rohrleitungen' }
          ]
        },
        {
          id: 'diameter-range',
          title: 'Produktdurchmesser',
          subtitle: 'Welchen Durchmesserbereich müssen Sie abdecken?',
          type: 'single',
          options: [
            { value: 'small', label: '0,2 - 20 mm', description: 'X-RAY 6020 PRO (Kompakt)' },
            { value: 'medium', label: '1,5 - 35 mm', description: 'X-RAY 6035 PRO (Standard)' },
            { value: 'large', label: '5 - 70 mm', description: 'X-RAY 6070 PRO/PURE (Große Durchmesser)' },
            { value: 'xlarge', label: '10 - 120 mm', description: 'X-RAY 6120 PRO/PURE (Sehr große Durchmesser)' },
            { value: 'xxlarge', label: '20 - 200 mm', description: 'X-RAY 6200 PRO (Rohre und große Kabel)' }
          ]
        },
        {
          id: 'material-type',
          title: 'Materialtyp',
          subtitle: 'Welche Materialien werden verarbeitet?',
          type: 'multiple',
          options: [
            { value: 'pe', label: 'PE (Polyethylen)', description: 'Standard Isoliermaterial' },
            { value: 'pvc', label: 'PVC', description: 'Flexible Isolierung' },
            { value: 'ptfe', label: 'PTFE', description: 'Hochtemperatur-Isolierung' },
            { value: 'foam', label: 'Geschäumte Materialien', description: 'PE-Schaum, Zellschaum' },
            { value: 'rubber', label: 'Gummi/Elastomere', description: 'Flexible Materialien' },
            { value: 'multiple-layers', label: 'Mehrschichtig', description: 'Bis zu 3 Schichten messbar' }
          ]
        },
        {
          id: 'measurement-precision',
          title: 'Messgenauigkeit',
          subtitle: 'Welche Präzisionsanforderungen haben Sie?',
          type: 'single',
          options: [
            { value: 'standard', label: 'Standard (±1 μm)', description: 'Für die meisten Anwendungen ausreichend' },
            { value: 'high', label: 'Hoch (±0,5 μm)', description: 'Präzisionsanwendungen' },
            { value: 'ultra', label: 'Ultra-präzise (±0,25 μm)', description: 'PURE-Serie für höchste Ansprüche' }
          ]
        }
      ]
    },
    {
      id: 'x-ray-8000',
      name: 'X-RAY 8000 Series',
      description: 'Hochgeschwindigkeits-Röntgenmessung für CV-Linien',
      questions: [
        {
          id: 'cable-type',
          title: 'Kabeltyp',
          subtitle: 'Welche Art von Kabeln produzieren Sie?',
          type: 'single',
          options: [
            { value: 'hv-cables', label: 'Hochspannungskabel', description: 'Mittel-, Hoch- und Höchstspannung' },
            { value: 'power-cables', label: 'Energiekabel', description: 'Niederspannungs-Energiekabel' },
            { value: 'submarine-cables', label: 'Seekabel', description: 'Unterwasser-Stromkabel' },
            { value: 'industrial-cables', label: 'Industriekabel', description: 'Schwere Industrieanwendungen' }
          ]
        },
        {
          id: 'production-speed',
          title: 'Produktionsgeschwindigkeit',
          subtitle: 'Wie schnell läuft Ihre Produktionslinie?',
          type: 'single',
          options: [
            { value: 'standard', label: 'Bis 300 m/min', description: 'X-RAY 8000 NXT (Standard)' },
            { value: 'high-speed', label: 'Bis 2000 m/min', description: 'X-RAY 8000 ADVANCED (Highspeed)' },
            { value: 'ultra-speed', label: 'Über 2000 m/min', description: 'X-RAY 8700 NXT (Ultra-Highspeed)' }
          ]
        },
        {
          id: 'measurement-type',
          title: 'Messaufgabe',
          subtitle: 'Was soll gemessen werden?',
          type: 'multiple',
          options: [
            { value: 'wall-thickness', label: 'Wanddicke', description: 'Isolationsdicke messen' },
            { value: 'concentricity', label: 'Konzentrizität', description: 'Exzentrizität der Isolierung' },
            { value: 'diameter', label: 'Durchmesser', description: 'Außendurchmesser' },
            { value: 'multi-layer', label: 'Mehrschichtig', description: 'Verschiedene Isolationsschichten' },
            { value: 'conductor-position', label: 'Leiterposition', description: 'Position des Innenleiters' }
          ]
        },
        {
          id: 'cable-construction',
          title: 'Kabelaufbau',
          subtitle: 'Wie ist Ihr Kabel konstruiert?',
          type: 'single',
          options: [
            { value: 'single-core', label: 'Einadrig', description: 'Ein Leiter, eine Isolierung' },
            { value: 'sector-conductor', label: 'Sektorleiter', description: 'Nicht-runder Leiterquerschnitt' },
            { value: 'multi-core', label: 'Mehradrig', description: 'Mehrere isolierte Adern' },
            { value: 'concentric', label: 'Konzentrisch', description: 'Koaxial oder konzentrische Aufbau' }
          ]
        }
      ]
    },
    {
      id: 'centerview',
      name: 'CENTERVIEW Series',
      description: 'Präzise Exzentrizitätsmessung und automatische Positionierung',
      questions: [
        {
          id: 'diameter-range',
          title: 'Produktdurchmesser',
          subtitle: 'Welchen Durchmesserbereich müssen Sie verarbeiten?',
          type: 'single',
          options: [
            { value: 'micro', label: '0,1 - 3 mm', description: 'CENTERVIEW 8010 (Mikroanwendungen)' },
            { value: 'small', label: '0,3 - 10 mm', description: 'CENTERVIEW 8010e oder PRO 10/10e' },
            { value: 'medium', label: '1 - 25 mm', description: 'CENTERVIEW 8025/8025e oder PRO 25/25e' }
          ]
        },
        {
          id: 'positioning-required',
          title: 'Positionierung',
          subtitle: 'Benötigen Sie automatische Kabelpositionierung?',
          type: 'single',
          options: [
            { value: 'measurement-only', label: 'Nur Messung', description: 'Reine Exzentrizitätsmessung' },
            { value: 'positioning', label: 'Mit Positionierung', description: 'Automatische Korrektur der Kabelposition' }
          ]
        }
      ]
    },
    {
      id: 'capacitance',
      name: 'CAPACITANCE 2000 Series',
      description: 'Kapazitätsmessung für Kabel und Leitungen',
      questions: [
        {
          id: 'application-focus',
          title: 'Anwendungsschwerpunkt',
          subtitle: 'Wofür möchten Sie die Kapazitätsmessung hauptsächlich einsetzen?',
          type: 'single',
          options: [
            { value: 'data-cables', label: 'Datenkabel-Qualität', description: 'LAN, Cat5/6/7, Strukturrückflussdämpfung' },
            { value: 'production-control', label: 'Produktionskontrolle', description: 'Kontinuierliche Überwachung in der Fertigung' },
            { value: 'coaxial-hf', label: 'Koaxial/HF-Kabel', description: 'Impedanzkontrolle und HF-Eigenschaften' },
            { value: 'general-purpose', label: 'Allgemeine Anwendung', description: 'Vielseitige Kapazitätsmessung' }
          ]
        }
      ]
    },
    {
      id: 'lump',
      name: 'LUMP 2000 Series',
      description: 'Knotendetektion und Oberflächenfehlererkennning',
      questions: [
        {
          id: 'application',
          title: 'Anwendungsbereich',
          subtitle: 'Wofür möchten Sie das LUMP-System einsetzen?',
          type: 'single',
          options: [
            { value: 'cable-production', label: 'Kabelproduktion', description: 'Isolationsfehler in der Extrusion' },
            { value: 'wire-production', label: 'Drahtproduktion', description: 'Oberflächenfehler am Draht' },
            { value: 'quality-control', label: 'Qualitätskontrolle', description: 'Endprodukt-Prüfung' },
            { value: 'process-control', label: 'Prozesskontrolle', description: 'Online-Überwachung' }
          ]
        },
        {
          id: 'diameter-range',
          title: 'Produktdurchmesser',
          subtitle: 'Welchen Durchmesserbereich müssen Sie überwachen?',
          type: 'single',
          options: [
            { value: 'small', label: '0,2 - 10 mm', description: 'LUMP 2010 XY/T (kleine Durchmesser)' },
            { value: 'medium', label: '1 - 25 mm', description: 'LUMP 2025 XY (mittlere Durchmesser)' },
            { value: 'large', label: '2 - 35 mm', description: 'LUMP 2035 T (große Durchmesser)' }
          ]
        },
        {
          id: 'detection-type',
          title: 'Fehlerarten',
          subtitle: 'Welche Arten von Fehlern möchten Sie detektieren?',
          type: 'multiple',
          options: [
            { value: 'lumps', label: 'Knoten', description: 'Verdickungen im Material' },
            { value: 'neckdowns', label: 'Einschnürungen', description: 'Dünne Stellen' },
            { value: 'surface-defects', label: 'Oberflächenfehler', description: 'Kratzer, Riefen' },
            { value: 'inclusions', label: 'Einschlüsse', description: 'Fremdkörper im Material' }
          ]
        },
        {
          id: 'measurement-axes',
          title: 'Messrichtungen',
          subtitle: 'In wie vielen Richtungen soll gemessen werden?',
          type: 'single',
          options: [
            { value: 'single', label: '1-Achse (T)', description: 'Einfache Messung, kostengünstig' },
            { value: 'dual', label: '2-Achsen (XY)', description: 'Messung in zwei Richtungen' },
            { value: 'multi', label: '6-Achsen', description: 'Rundum-Überwachung (spezielle Anwendungen)' }
          ]
        }
      ]
    },
    {
      id: 'fiber',
      name: 'FIBER Series 6000',
      description: 'Spezialisierte Messsysteme für Glasfaserherstellung',
      questions: [
        {
          id: 'application',
          title: 'Glasfaser-Anwendung',
          subtitle: 'Für welchen Bereich der Glasfaserproduktion benötigen Sie Messtechnik?',
          type: 'single',
          options: [
            { value: 'drawing-tower', label: 'Ziehturm', description: 'Glasfaserziehprozess im Ziehturm' },
            { value: 'coating', label: 'Beschichtung', description: 'Aufbringen der Primär-/Sekundärbeschichtung' },
            { value: 'quality-control', label: 'Qualitätskontrolle', description: 'Endkontrolle der Glasfaser' },
            { value: 'process-optimization', label: 'Prozessoptimierung', description: 'Optimierung der Ziehparameter' }
          ]
        },
        {
          id: 'fiber-diameter',
          title: 'Faserdurchmesser',
          subtitle: 'Welchen Glasfaser-Durchmesser messen Sie?',
          type: 'single',
          options: [
            { value: 'standard', label: '125 μm (Standard)', description: 'Standard Single-Mode Glasfaser' },
            { value: 'multimode', label: '50/62,5 μm', description: 'Multimode Glasfaser' },
            { value: 'specialty', label: 'Spezialfaser', description: 'Andere Durchmesser oder Spezialfasern' },
            { value: 'coated', label: 'Mit Beschichtung', description: 'Primär-/Sekundärbeschichtung (250-900 μm)' }
          ]
        },
        {
          id: 'measurement-parameters',
          title: 'Messparameter',
          subtitle: 'Was möchten Sie an der Glasfaser messen?',
          type: 'multiple',
          options: [
            { value: 'diameter', label: 'Durchmesser', description: 'Kernglasedurchmesser' },
            { value: 'concentricity', label: 'Konzentrizität', description: 'Kern-Mantel-Konzentrizität' },
            { value: 'coating-diameter', label: 'Beschichtungsdurchmesser', description: 'Primär-/Sekundärbeschichtung' },
            { value: 'defects', label: 'Oberflächenfehler', description: 'Knoten, Blasen, Unreinheiten' },
            { value: 'tension', label: 'Zugkraft', description: 'Mechanische Spannung' },
            { value: 'temperature', label: 'Temperatur', description: 'Prozesstemperatur' }
          ]
        },
        {
          id: 'precision-requirements',
          title: 'Präzisionsanforderungen',
          subtitle: 'Welche Messgenauigkeit benötigen Sie?',
          type: 'single',
          options: [
            { value: 'standard', label: 'Standard (±0,1 μm)', description: 'Für die meisten Anwendungen' },
            { value: 'high', label: 'Hoch (±0,05 μm)', description: 'Präzisionsanwendungen' },
            { value: 'ultra', label: 'Ultra-präzise (±0,02 μm)', description: 'Höchste Ansprüche' }
          ]
        }
      ]
    },
    {
      id: 'centerwave',
      name: 'CENTERWAVE 6000 Series',
      description: 'Millimeterwellen-Wanddickenmessung für große Rohre',
      questions: [
        {
          id: 'application',
          title: 'Anwendungsbereich',
          subtitle: 'Für welche Anwendung benötigen Sie CENTERWAVE?',
          type: 'single',
          options: [
            { value: 'pipe-production', label: 'Rohrproduktion', description: 'Extrudierte Kunststoffrohre' },
            { value: 'profile-extrusion', label: 'Profilextrusion', description: 'Komplexe Querschnitte' },
            { value: 'large-cables', label: 'Große Kabel', description: 'Energiekabel mit großen Durchmessern' },
            { value: 'quality-control', label: 'Qualitätskontrolle', description: 'Endprodukt-Prüfung' }
          ]
        },
        {
          id: 'diameter-range',
          title: 'Rohrdurchmesser',
          subtitle: 'Welchen Durchmesserbereich müssen Sie messen?',
          type: 'single',
          options: [
            { value: 'medium', label: '50 - 250 mm', description: 'CENTERWAVE 6000/250 (mittlere Rohre)' },
            { value: 'large', label: '100 - 400 mm', description: 'CENTERWAVE 6000/400 (große Rohre)' },
            { value: 'xlarge', label: '160 - 800 mm', description: 'CENTERWAVE 6000/800 (sehr große Rohre)' },
            { value: 'xxlarge', label: '250 - 1600 mm', description: 'CENTERWAVE 6000/1600 (Großrohre)' }
          ]
        },
        {
          id: 'wall-thickness-range',
          title: 'Wanddickenbereich',
          subtitle: 'Welche Wanddicken müssen Sie messen?',
          type: 'single',
          options: [
            { value: 'thin', label: '1 - 20 mm', description: 'Dünne Wände' },
            { value: 'medium', label: '5 - 50 mm', description: 'Standard Wanddicken' },
            { value: 'thick', label: '10 - 100 mm', description: 'Dicke Wände' },
            { value: 'very-thick', label: '20 - 200 mm', description: 'Sehr dicke Wände' }
          ]
        },
        {
          id: 'material-type',
          title: 'Materialtyp',
          subtitle: 'Welche Materialien werden verarbeitet?',
          type: 'multiple',
          options: [
            { value: 'pe', label: 'PE (Polyethylen)', description: 'Standard Rohrmaterial' },
            { value: 'pp', label: 'PP (Polypropylen)', description: 'Chemiebeständige Rohre' },
            { value: 'pvc', label: 'PVC', description: 'Druckrohre' },
            { value: 'multilayer', label: 'Mehrschichtig', description: 'Verbundrohre' },
            { value: 'foam', label: 'Geschäumt', description: 'Schaumkern-Rohre' }
          ]
        }
      ]
    }
  ];

  const getCurrentSeries = (): ProductSeries | null => {
    return selectedSeries ? productSeries.find(s => s.id === selectedSeries) || null : null;
  };

  const getCurrentQuestion = (): Question | null => {
    const series = getCurrentSeries();
    return series && currentStep < series.questions.length ? series.questions[currentStep] : null;
  };

  const getAnswer = (questionId: string): ConfigurationAnswer | undefined => {
    return answers.find(a => a.questionId === questionId);
  };

  const updateAnswer = (questionId: string, value: string | string[]) => {
    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== questionId);
      return [...filtered, { questionId, value }];
    });
  };

  // Produktempfehlungslogik basierend auf den Antworten
  const calculateRecommendation = (): RecommendationResult => {
    const series = getCurrentSeries();
    if (!series) {
      return {
        productName: 'ECOCONTROL 6000',
        confidence: 30,
        reasons: ['Universelles Prozessorsystem'],
        alternatives: []
      };
    }

    switch (series.id) {
      case 'laser-2000':
        return calculateLaserRecommendation();
      case 'x-ray-6000':
        return calculateXRay6000Recommendation();
      case 'x-ray-8000':
        return calculateXRay8000Recommendation();
      case 'centerview':
        return calculateCenterviewRecommendation();
      case 'capacitance':
        return calculateCapacitanceRecommendation();
      case 'lump':
        return calculateLumpRecommendation();
      case 'fiber':
        return calculateFiberRecommendation();
      case 'centerwave':
        return calculateCenterwaveRecommendation();
      default:
        return {
          productName: 'ECOCONTROL 6000',
          confidence: 30,
          reasons: ['Universelles Prozessorsystem'],
          alternatives: []
        };
    }
  };

  const calculateLaserRecommendation = (): RecommendationResult => {
    const diameterRange = getAnswer('diameter-range')?.value as string;
    const axes = getAnswer('measurement-axes')?.value as string;

    let productName = '';
    let confidence = 0;
    const reasons: string[] = [];
    const alternatives: string[] = [];

    if (diameterRange === 'micro') {
      productName = 'LASER 2005 XY';
      confidence = 95;
      reasons.push('Höchste Präzision für kleinste Durchmesser (0,05-5 mm)');
      reasons.push('Genauigkeit ±0,25 μm');
    } else if (diameterRange === 'small') {
      productName = axes === 'xy' ? 'LASER 2010 XY' : 'LASER 2010 T';
      confidence = 90;
      reasons.push('Optimal für kleine Durchmesser (0,2-10 mm)');
      if (axes === 'xy') {
        reasons.push('2-Achsen-Messung für Ovalitätskontrolle');
      } else {
        alternatives.push('LASER 2010 XY');
      }
    } else if (diameterRange === 'medium') {
      productName = axes === 'xy' ? 'LASER 2050 XY' : 'LASER 2050 T';
      confidence = 85;
      reasons.push('Universell einsetzbar (0,5-50 mm)');
      if (axes === 'xy') {
        alternatives.push('LASER 2050 T');
      } else {
        alternatives.push('LASER 2050 XY');
      }
    } else if (diameterRange === 'large') {
      productName = axes === 'xy' ? 'LASER 2100 XY' : 'LASER 2100 T';
      confidence = 85;
      reasons.push('Für große Durchmesser (1-100 mm)');
    } else if (diameterRange === 'xlarge') {
      productName = 'LASER 2200 XY';
      confidence = 90;
      reasons.push('Speziell für sehr große Durchmesser (2-200 mm)');
    }

    return { productName, confidence, reasons, alternatives };
  };

  const calculateXRay6000Recommendation = (): RecommendationResult => {
    const diameterRange = getAnswer('diameter-range')?.value as string;
    const precision = getAnswer('measurement-precision')?.value as string;
    const materials = getAnswer('material-type')?.value as string[];

    let productName = '';
    let confidence = 0;
    const reasons: string[] = [];
    const alternatives: string[] = [];

    if (diameterRange === 'small') {
      productName = 'X-RAY 6020 PRO';
      confidence = 90;
      reasons.push('Kompakte Lösung für kleine Durchmesser (0,2-20 mm)');
    } else if (diameterRange === 'medium') {
      productName = 'X-RAY 6035 PRO';
      confidence = 90;
      reasons.push('Standard-Lösung für mittlere Durchmesser (1,5-35 mm)');
    } else if (diameterRange === 'large') {
      productName = precision === 'ultra' ? 'X-RAY 6070 PURE' : 'X-RAY 6070 PRO';
      confidence = 90;
      reasons.push('Für große Durchmesser (5-70 mm)');
      if (precision === 'ultra') reasons.push('PURE-Serie für höchste Präzision');
    } else if (diameterRange === 'xlarge') {
      productName = precision === 'ultra' ? 'X-RAY 6120 PURE' : 'X-RAY 6120 PRO';
      confidence = 90;
      reasons.push('Sehr große Durchmesser (10-120 mm)');
    } else if (diameterRange === 'xxlarge') {
      productName = 'X-RAY 6200 PRO';
      confidence = 95;
      reasons.push('Für Rohre und sehr große Kabel (20-200 mm)');
    }

    if (materials?.includes('multiple-layers')) {
      reasons.push('Messung von bis zu drei Materialschichten');
      confidence = Math.min(confidence + 5, 95);
    }

    if (materials?.includes('foam')) {
      reasons.push('Optimiert für geschäumte Materialien');
    }

    return { productName, confidence, reasons, alternatives };
  };

  const calculateXRay8000Recommendation = (): RecommendationResult => {
    const speed = getAnswer('production-speed')?.value as string;
    const cableType = getAnswer('cable-type')?.value as string;
    const construction = getAnswer('cable-construction')?.value as string;

    let productName = '';
    let confidence = 0;
    const reasons: string[] = [];
    const alternatives: string[] = [];

    if (speed === 'ultra-speed') {
      productName = 'X-RAY 8700 NXT';
      confidence = 95;
      reasons.push('Ultra-Highspeed für über 2000 m/min');
      reasons.push('Modernste Röntgentechnologie');
    } else if (speed === 'high-speed') {
      productName = 'X-RAY 8000 ADVANCED';
      confidence = 95;
      reasons.push('Bis zu 10x schnellere Messungen als Standard');
      reasons.push('Ideal für CV-Linien bis 2000 m/min');
      alternatives.push('X-RAY 8000 NXT');
    } else {
      productName = 'X-RAY 8000 NXT';
      confidence = 85;
      reasons.push('Bewährtes System für Hochspannungskabel');
      reasons.push('Bis 300 m/min Produktionsgeschwindigkeit');
    }

    if (cableType === 'hv-cables') {
      reasons.push('Speziell für Hochspannungskabel entwickelt');
      confidence = Math.min(confidence + 5, 95);
    }

    if (construction === 'sector-conductor') {
      reasons.push('Optimiert für Sektorleiter-Konfigurationen');
    }

    return { productName, confidence, reasons, alternatives };
  };

  const calculateCenterviewRecommendation = (): RecommendationResult => {
    const diameterRange = getAnswer('diameter-range')?.value as string;
    const positioning = getAnswer('positioning-required')?.value as string;

    let productName = '';
    let confidence = 0;
    const reasons: string[] = [];
    const alternatives: string[] = [];

    if (diameterRange === 'micro') {
      productName = 'CENTERVIEW 8010';
      confidence = 95;
      reasons.push('8-Punkt-Exzentrizitätsmessung für kleinste Durchmesser (0,1-3 mm)');
      alternatives.push('CENTERVIEW 8010e');
    } else if (diameterRange === 'small') {
      if (positioning === 'positioning') {
        productName = 'CENTERVIEW PRO 10';
        confidence = 95;
        reasons.push('Professionelle Lösung mit automatischer Positionierung (0,3-10 mm)');
        alternatives.push('CENTERVIEW PRO 10e', 'CENTERVIEW 8010e');
      } else {
        productName = 'CENTERVIEW 8010e';
        confidence = 90;
        reasons.push('Erweiterte Version für kleine Durchmesser (0,3-10 mm)');
        alternatives.push('CENTERVIEW PRO 10', 'CENTERVIEW 8010');
      }
    } else if (diameterRange === 'medium') {
      if (positioning === 'positioning') {
        productName = 'CENTERVIEW PRO 25';
        confidence = 95;
        reasons.push('Professionelle Lösung mit automatischer Positionierung (1-25 mm)');
        alternatives.push('CENTERVIEW PRO 25e', 'CENTERVIEW 8025');
      } else {
        productName = 'CENTERVIEW 8025';
        confidence = 90;
        reasons.push('Standard-Lösung für mittlere Durchmesser (1-25 mm)');
        alternatives.push('CENTERVIEW PRO 25', 'CENTERVIEW 8025e');
      }
    }

    if (positioning === 'positioning') {
      reasons.push('Automatische Positionierung zur optimalen Kabellage');
    } else {
      reasons.push('Präzise Exzentrizitätsmessung ohne Positionierung');
    }

    return { productName, confidence, reasons, alternatives };
  };

  const calculateCapacitanceRecommendation = (): RecommendationResult => {
    const applicationFocus = getAnswer('application-focus')?.value as string;

    let productName = '';
    let confidence = 0;
    const reasons: string[] = [];
    const alternatives: string[] = [];

    if (applicationFocus === 'data-cables') {
      productName = 'CAPACITANCE 2025';
      confidence = 95;
      reasons.push('Optimiert für Datenkabel und LAN-Anwendungen');
      reasons.push('Integrierte FFT-Analyse und SRL-Vorhersage');
      reasons.push('Multi-Zonen-Elektrode für präzise Messungen');
      alternatives.push('CAPACITANCE 2010');
    } else if (applicationFocus === 'production-control') {
      productName = 'CAPACITANCE 2025';
      confidence = 90;
      reasons.push('Robuste Lösung für kontinuierliche Produktionsüberwachung');
      reasons.push('Zuverlässige Messungen bei hoher Taktzahl');
      alternatives.push('CAPACITANCE 2060', 'CAPACITANCE 2010');
    } else if (applicationFocus === 'coaxial-hf') {
      productName = 'CAPACITANCE 2025';
      confidence = 90;
      reasons.push('Speziell für Koaxial- und HF-Kabel entwickelt');
      reasons.push('Präzise Impedanzkontrolle');
      alternatives.push('CAPACITANCE 2060');
    } else if (applicationFocus === 'general-purpose') {
      productName = 'CAPACITANCE 2025';
      confidence = 85;
      reasons.push('Vielseitige Standard-Lösung für verschiedene Anwendungen');
      reasons.push('Gutes Preis-Leistungs-Verhältnis');
      alternatives.push('CAPACITANCE 2010', 'CAPACITANCE 2060');
    }

    // Zusätzliche Informationen über die Modellvarianten
    reasons.push('Verfügbar in verschiedenen Durchmesserbereichen (2010: 1-10mm, 2025: 3-25mm, 2060: 5-60mm)');

    return { productName, confidence, reasons, alternatives };
  };

  const calculateLumpRecommendation = (): RecommendationResult => {
    const diameterRange = getAnswer('diameter-range')?.value as string;
    const axes = getAnswer('measurement-axes')?.value as string;
    const detection = getAnswer('detection-type')?.value as string[];

    let productName = '';
    let confidence = 0;
    const reasons: string[] = [];
    const alternatives: string[] = [];

    if (diameterRange === 'small') {
      productName = axes === 'dual' ? 'LUMP 2010 XY' : 'LUMP 2010 T';
      confidence = 85;
      reasons.push('Knotendetektion für kleine Durchmesser (0,2-10 mm)');
      if (axes === 'dual') reasons.push('2-Achsen-Detektion mit Doppelsensor');
      if (axes === 'single') alternatives.push('LUMP 2010 XY');
    } else if (diameterRange === 'medium') {
      productName = 'LUMP 2025 XY';
      confidence = 85;
      reasons.push('Zuverlässige Detektion für mittlere Durchmesser (1-25 mm)');
    } else if (diameterRange === 'large') {
      productName = 'LUMP 2035 T';
      confidence = 80;
      reasons.push('Für große Durchmesser (2-35 mm)');
    }

    if (detection?.includes('lumps')) {
      reasons.push('Präzise Knotendetektion');
    }

    if (detection?.includes('neckdowns')) {
      reasons.push('Erkennung von Einschnürungen');
    }

    if (axes === 'multi') {
      alternatives.unshift('LUMP 6003 MICRO');
      reasons.push('6-Achsen-Detektion für Rundum-Überwachung verfügbar');
    }

    return { productName, confidence, reasons, alternatives };
  };

  const calculateFiberRecommendation = (): RecommendationResult => {
    const application = getAnswer('application')?.value as string;
    const fiberDiameter = getAnswer('fiber-diameter')?.value as string;
    const parameters = getAnswer('measurement-parameters')?.value as string[];
    const precision = getAnswer('precision-requirements')?.value as string;

    let productName = '';
    let confidence = 0;
    const reasons: string[] = [];
    const alternatives: string[] = [];

    // Anwendungsbasierte Empfehlungen
    if (application === 'drawing-tower') {
      if (parameters?.includes('diameter')) {
        productName = 'FIBER LASER 6003';
        confidence = 95;
        reasons.push('Speziell für Glasfaser-Durchmessermessung im Ziehturm entwickelt');
        reasons.push('Präzise Messung des Kernglases während des Ziehprozesses');

        if (precision === 'ultra') {
          confidence = 98;
          reasons.push('Ultra-präzise Messung für höchste Qualitätsansprüche');
        }
      }

      if (parameters?.includes('defects')) {
        if (!productName) {
          productName = 'FIBER LUMP 6003 MICRO';
          confidence = 90;
          reasons.push('6-Achs-Knotendetektion mit höchster Präzision für kleinste Fehler');
        } else {
          alternatives.push('FIBER LUMP 6003 MICRO');
        }
      }

      if (parameters?.includes('temperature')) {
        if (!productName) {
          productName = 'FIBER TEMP 6003';
          confidence = 85;
          reasons.push('Berührungslose Temperaturmessung für Glasfaser-Ziehprozess');
        } else {
          alternatives.push('FIBER TEMP 6003');
        }
      }

      if (parameters?.includes('tension')) {
        alternatives.push('FIBER TENSION 6003');
      }
    }

    // Durchmesserbasierte Empfehlungen
    if (fiberDiameter === 'standard' || fiberDiameter === 'multimode') {
      if (!productName && parameters?.includes('diameter')) {
        productName = 'FIBER LASER 6003';
        confidence = 90;
        reasons.push('Optimiert für Standard-Glasfaser-Durchmessermessung');
      }

      if (parameters?.includes('concentricity')) {
        if (!productName) {
          productName = 'FIBER CORE 6003';
          confidence = 85;
          reasons.push('Kern-Mantel-Konzentrizitätsmessung für Glasfaser');
        } else {
          alternatives.push('FIBER CORE 6003');
        }
      }
    }

    if (fiberDiameter === 'coated') {
      if (parameters?.includes('coating-diameter')) {
        productName = 'FIBER COATING 6003';
        confidence = 95;
        reasons.push('Speziell für Beschichtungsdurchmessermessung');
        reasons.push('Messung von Primär- und Sekundärbeschichtung');
      }
    }

    // Qualitätskontrolle
    if (application === 'quality-control') {
      if (parameters?.includes('diameter') && parameters?.includes('concentricity')) {
        productName = 'FIBER QC 6003';
        confidence = 90;
        reasons.push('Vollständige Qualitätskontrolle für Glasfaser');
        reasons.push('Kombinierte Durchmesser- und Konzentrizitätsmessung');
      }
    }

    // Fallback
    if (!productName) {
      if (parameters?.includes('diameter')) {
        productName = 'FIBER LASER 6003';
        confidence = 70;
        reasons.push('Standard-Lösung für Glasfasermessung');
        alternatives.push('FIBER ECOCONTROL');
      } else {
        productName = 'FIBER ECOCONTROL';
        confidence = 60;
        reasons.push('Universelles Glasfaser-Prozessorsystem');
      }
    }

    // Prozessoptimierung
    if (application === 'process-optimization') {
      alternatives.push('FIBER ECOCONTROL');
      reasons.push('Automatische Prozessoptimierung verfügbar');
    }

    return { productName, confidence, reasons, alternatives };
  };

  const calculateCenterwaveRecommendation = (): RecommendationResult => {
    const diameterRange = getAnswer('diameter-range')?.value as string;
    const wallThickness = getAnswer('wall-thickness-range')?.value as string;
    const materials = getAnswer('material-type')?.value as string[];

    let productName = '';
    let confidence = 0;
    const reasons: string[] = [];
    const alternatives: string[] = [];

    if (diameterRange === 'medium') {
      productName = 'CENTERWAVE 6000/250';
      confidence = 90;
      reasons.push('Für mittlere Rohrdurchmesser (50-250 mm)');
    } else if (diameterRange === 'large') {
      productName = 'CENTERWAVE 6000/400';
      confidence = 90;
      reasons.push('Für große Rohrdurchmesser (100-400 mm)');
      alternatives.push('CENTERWAVE 6000/630');
    } else if (diameterRange === 'xlarge') {
      productName = 'CENTERWAVE 6000/800';
      confidence = 95;
      reasons.push('Für sehr große Rohrdurchmesser (160-800 mm)');
      alternatives.push('CENTERWAVE 6000/1200');
    } else if (diameterRange === 'xxlarge') {
      productName = 'CENTERWAVE 6000/1600';
      confidence = 95;
      reasons.push('Für Großrohre (250-1600 mm)');
    }

    reasons.push('360° Wanddickenmessung ohne Koppelmedium');
    reasons.push('Millimeterwellen-Technologie');

    if (materials?.includes('multilayer')) {
      reasons.push('Messung mehrschichtiger Rohrwände');
    }

    if (materials?.includes('foam')) {
      reasons.push('Optimiert für Schaumkern-Rohre');
    }

    return { productName, confidence, reasons, alternatives };
  };

  const handleNext = () => {
    const series = getCurrentSeries();
    if (!series) return;

    if (currentStep < series.questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Berechne Empfehlung
      const result = calculateRecommendation();
      setRecommendation(result);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setSelectedSeries(null);
    setCurrentStep(0);
    setAnswers([]);
    setRecommendation(null);
  };

  const handleSeriesSelect = (seriesId: string) => {
    setSelectedSeries(seriesId);
    setCurrentStep(0);
    setAnswers([]);
  };

  const currentQuestion = getCurrentQuestion();
  const currentAnswer = currentQuestion ? getAnswer(currentQuestion.id) : undefined;
  const canProceed = currentAnswer && (
    (currentQuestion?.type === 'single' && currentAnswer.value) ||
    (currentQuestion?.type === 'multiple' && Array.isArray(currentAnswer.value) && currentAnswer.value.length > 0)
  );

  // Ergebnisanzeige
  if (recommendation) {
    return (
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-sikora-blue mb-2">
            Ihre Produktempfehlung
          </h2>
          <p className="text-gray-600">
            Basierend auf Ihren Anforderungen für {getCurrentSeries()?.name}
          </p>
        </div>

        {/* Hauptempfehlung */}
        <div className="bg-gradient-to-r from-sikora-blue to-sikora-cyan rounded-lg p-6 text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">{recommendation.productName}</h3>
            <div className="flex items-center">
              <span className="text-sm opacity-90 mr-2">Übereinstimmung:</span>
              <span className="text-lg font-bold">{recommendation.confidence}%</span>
            </div>
          </div>

          <div className="space-y-2">
            {recommendation.reasons.map((reason, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spezifikationen */}
        {recommendation.specifications && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Technische Daten</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(recommendation.specifications).map(([key, value]) => (
                <div key={key} className="border border-gray-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-600">{key}</div>
                  <div className="text-sm text-gray-900">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alternative Empfehlungen */}
        {recommendation.alternatives && recommendation.alternatives.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Lightbulb className="w-4 h-4 mr-2" />
              Alternative Produkte
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendation.alternatives.map((alt, index) => (
                <button
                  key={index}
                  onClick={() => onProductSelect(alt)}
                  className="border border-gray-200 rounded-lg p-3 text-left hover:border-sikora-blue hover:bg-sikora-blue hover:bg-opacity-5 transition-colors"
                >
                  <span className="text-sm font-medium text-sikora-blue">{alt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Warnung bei niedriger Übereinstimmung */}
        {recommendation.confidence < 70 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
              <div>
                <h5 className="font-medium text-amber-800">Niedrige Übereinstimmung</h5>
                <p className="text-sm text-amber-700 mt-1">
                  Die Empfehlung basiert auf begrenzten Informationen.
                  Kontaktieren Sie unsere Experten für eine detaillierte Beratung.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Aktionen */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onProductSelect(recommendation.productName)}
            className="flex-1 bg-sikora-blue text-white px-6 py-3 rounded-lg hover:bg-sikora-cyan transition-colors font-medium"
          >
            Produktdetails ansehen
          </button>
          <button
            onClick={handleReset}
            className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Neue Empfehlung
          </button>
          <button
            onClick={onClose}
            className="sm:w-auto px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    );
  }

  // Produktserien-Auswahl
  if (!selectedSeries) {
    return (
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-sikora-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-sikora-blue mb-2">
            SIKORA Produktempfehlung
          </h2>
          <p className="text-gray-600">
            Wählen Sie eine Produktserie aus, um eine maßgeschneiderte Empfehlung zu erhalten
          </p>
        </div>

        {/* Produktserien Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {productSeries.map((series) => (
            <button
              key={series.id}
              onClick={() => handleSeriesSelect(series.id)}
              className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-sikora-blue hover:bg-sikora-blue hover:bg-opacity-5 transition-all group"
            >
              <h3 className="font-semibold text-gray-800 group-hover:text-sikora-blue mb-2">
                {series.name}
              </h3>
              <p className="text-sm text-gray-600">
                {series.description}
              </p>
            </button>
          ))}
        </div>

        {/* Schließen Button */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    );
  }

  // Fragen-Interface
  const series = getCurrentSeries()!;
  return (
    <div className="p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-sikora-blue rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-sikora-blue mb-2">
          {series.name} Konfiguration
        </h2>
        <p className="text-gray-600">
          {series.description}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Schritt {currentStep + 1} von {series.questions.length}</span>
          <span>{Math.round((currentStep + 1) / series.questions.length * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-sikora-blue h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep + 1) / series.questions.length * 100}%` }}
          />
        </div>
      </div>

      {/* Aktuelle Frage */}
      {currentQuestion && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {currentQuestion.title}
          </h3>
          <p className="text-gray-600 mb-6">
            {currentQuestion.subtitle}
          </p>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = currentQuestion.type === 'single'
                ? currentAnswer?.value === option.value
                : Array.isArray(currentAnswer?.value) && currentAnswer.value.includes(option.value);

              return (
                <label
                  key={option.value}
                  className={`block cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    isSelected
                      ? 'border-sikora-blue bg-sikora-blue bg-opacity-5'
                      : 'border-gray-200 hover:border-sikora-blue hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type={currentQuestion.type === 'single' ? 'radio' : 'checkbox'}
                      name={currentQuestion.id}
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => {
                        if (currentQuestion.type === 'single') {
                          updateAnswer(currentQuestion.id, option.value);
                        } else {
                          const currentValues = (currentAnswer?.value as string[]) || [];
                          const newValues = e.target.checked
                            ? [...currentValues, option.value]
                            : currentValues.filter(v => v !== option.value);
                          updateAnswer(currentQuestion.id, newValues);
                        }
                      }}
                      className="mt-1 text-sikora-blue focus:ring-sikora-blue"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-800">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-sm text-gray-600">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={currentStep === 0 ? () => setSelectedSeries(null) : handleBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentStep === 0 ? 'Zurück zur Auswahl' : 'Zurück'}
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
            canProceed
              ? 'bg-sikora-blue text-white hover:bg-sikora-cyan'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {currentStep === series.questions.length - 1 ? 'Empfehlung erhalten' : 'Weiter'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default ProductRecommendationWizard;
