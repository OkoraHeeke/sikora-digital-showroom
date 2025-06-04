import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Lightbulb, Target, CheckCircle, AlertCircle } from 'lucide-react';

interface WizardAnswer {
  questionId: string;
  value: string | string[];
  label?: string;
}

interface ProductRecommendation {
  productName: string;
  confidence: number;
  reasons: string[];
}

interface RecommendationResult {
  productName: string;
  confidence: number;
  reasons: string[];
  alternatives: string[];
}

interface ProductRecommendationWizardProps {
  onClose: () => void;
  onProductSelect: (productName: string) => void;
}

const ProductRecommendationWizard: React.FC<ProductRecommendationWizardProps> = ({
  onClose,
  onProductSelect
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswer[]>([]);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);

  const questions = [
    {
      id: 'industry',
      title: 'In welcher Industrie arbeiten Sie?',
      subtitle: 'Wählen Sie Ihren Hauptanwendungsbereich',
      type: 'single' as const,
      options: [
        { value: 'cable', label: 'Kabel & Leitungen', description: 'Datenkabel, Stromleitungen, Automobilleitungen' },
        { value: 'fiber', label: 'Glasfaser', description: 'Glasfaserherstellung und -verarbeitung' },
        { value: 'pipe', label: 'Rohre & Schläuche', description: 'Kunststoffrohre, Schläuche, Profile' },
        { value: 'hv-cable', label: 'Hochspannungskabel', description: 'Mittel-, Hoch- und Höchstspannungskabel' }
      ]
    },
    {
      id: 'production-stage',
      title: 'In welcher Produktionsphase möchten Sie messen?',
      subtitle: 'Bestimmen Sie den idealen Messpunkt',
      type: 'single' as const,
      options: [
        { value: 'preheating', label: 'Vorheizung', description: 'Leitervorheizung vor Extrusion' },
        { value: 'extrusion', label: 'Extrusion', description: 'Direkt nach dem Extruder' },
        { value: 'cooling', label: 'Kühlung', description: 'In der Kühlstrecke' },
        { value: 'final', label: 'Endprodukt', description: 'Finale Qualitätskontrolle' },
        { value: 'drawing', label: 'Ziehturm', description: 'Glasfaserziehprozess' }
      ]
    },
    {
      id: 'measurement-goal',
      title: 'Was möchten Sie messen?',
      subtitle: 'Mehrfachauswahl möglich',
      type: 'multiple' as const,
      options: [
        { value: 'diameter', label: 'Durchmesser', description: 'Außendurchmesser des Produkts' },
        { value: 'wall-thickness', label: 'Wanddicke', description: 'Materialwandstärke' },
        { value: 'concentricity', label: 'Konzentrizität', description: 'Exzentrizität der Isolierung' },
        { value: 'ovality', label: 'Ovalität', description: 'Rundheitsabweichung' },
        { value: 'temperature', label: 'Temperatur', description: 'Material- oder Prozesstemperatur' },
        { value: 'defects', label: 'Oberflächenfehler', description: 'Knoten, Einschnürungen, Blasen' },
        { value: 'tension', label: 'Zugkraft', description: 'Mechanische Spannung' },
        { value: 'capacitance', label: 'Kapazität', description: 'Elektrische Eigenschaften' },
        { value: 'high-voltage', label: 'Isolationsprüfung', description: 'Hochspannungstests' }
      ]
    },
    {
      id: 'diameter-range',
      title: 'Welcher Durchmesserbereich?',
      subtitle: 'Wählen Sie den passenden Bereich für Ihr Produkt',
      type: 'single' as const,
      options: [
        { value: 'micro', label: '0,05 - 1 mm', description: 'Mikro-Anwendungen, feine Drähte' },
        { value: 'small', label: '1 - 10 mm', description: 'Dünne Kabel, Datenleitungen' },
        { value: 'medium', label: '10 - 50 mm', description: 'Standard-Kabel und -Rohre' },
        { value: 'large', label: '50 - 200 mm', description: 'Große Rohre und Kabel' },
        { value: 'xlarge', label: '200+ mm', description: 'Sehr große Rohre' }
      ]
    },
    {
      id: 'special-requirements',
      title: 'Besondere Anforderungen?',
      subtitle: 'Mehrfachauswahl möglich',
      type: 'multiple' as const,
      options: [
        { value: 'high-precision', label: 'Höchste Präzision', description: 'Sub-Mikrometer Genauigkeit' },
        { value: 'high-speed', label: 'Hohe Geschwindigkeit', description: 'Schnelle Produktionslinien' },
        { value: 'multi-layer', label: 'Mehrschichtig', description: 'Komplexe Schichtstrukturen' },
        { value: 'foam', label: 'Geschäumte Materialien', description: 'PE-Schaum, aufgeschäumte Isolation' },
        { value: 'transparent', label: 'Transparente Materialien', description: 'Klare oder durchsichtige Produkte' },
        { value: 'sector', label: 'Sektorleiter', description: 'Nicht-runde Leiterformen' },
        { value: 'automation', label: 'Vollautomatisierung', description: 'Automatische Regelung und Kontrolle' }
      ]
    }
  ];

  const getAnswer = (questionId: string): WizardAnswer | undefined => {
    return answers.find(a => a.questionId === questionId);
  };

  const updateAnswer = (questionId: string, value: string | string[], label?: string) => {
    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== questionId);
      return [...filtered, { questionId, value, label }];
    });
  };

  const calculateRecommendation = (): RecommendationResult => {
    const industry = getAnswer('industry')?.value as string;
    const stage = getAnswer('production-stage')?.value as string;
    const goals = getAnswer('measurement-goal')?.value as string[];
    const diameter = getAnswer('diameter-range')?.value as string;
    const special = getAnswer('special-requirements')?.value as string[];

    console.log('Debug - Answers:', { industry, stage, goals, diameter, special });

    let productName = '';
    let confidence = 0;
    const reasons: string[] = [];
    const alternatives: string[] = [];

    // Glasfaser-Spezifische Logik
    if (industry === 'fiber') {
      console.log('Processing fiber industry...');
      if (stage === 'drawing') {
        if (goals?.includes('diameter')) {
          productName = 'FIBER LASER 6003';
          confidence = 95;
          reasons.push('Speziell für Glasfaser-Durchmessermessung im Ziehturm entwickelt');

          if (goals.includes('defects')) {
            alternatives.push('FIBER LUMP 6003 MICRO');
          }
          if (goals.includes('temperature')) {
            alternatives.push('FIBER TEMP 6003');
          }
          if (goals.includes('tension')) {
            alternatives.push('FIBER TENSION 6003');
          }
        }

        if (goals?.includes('defects') && diameter === 'micro') {
          productName = 'FIBER LUMP 6003 MICRO';
          confidence = 90;
          reasons.push('6-Achs-Knotendetektion mit höchster Präzision für kleinste Fehler');
        }

        if (goals?.includes('temperature')) {
          productName = 'FIBER TEMP 6003';
          confidence = 85;
          reasons.push('Berührungslose Temperaturmessung für Glasfaser-Ziehprozess');
        }
      }

      // If no specific match for fiber, provide general fiber recommendation
      if (!productName) {
        productName = 'FIBER LASER 6003';
        confidence = 70;
        reasons.push('Standard-Lösung für Glasfaserfertigung');
        alternatives.push('FIBER ECOCONTROL');
      }

      return { productName, confidence, reasons, alternatives };
    }

    // Hochspannungskabel-Logik
    if (industry === 'hv-cable') {
      console.log('Processing high voltage cable industry...');
      if (goals?.includes('wall-thickness') || goals?.includes('concentricity')) {
        if (diameter === 'medium' || diameter === 'large') {
          productName = 'X-RAY 8000 ADVANCED';
          confidence = 95;
          reasons.push('Highspeed-Technologie für CV-Linien');
          reasons.push('Bis zu 10x schnellere Messungen');
          alternatives.push('X-RAY 8000 NXT');
        } else {
          productName = 'X-RAY 8000 NXT';
          confidence = 85;
          reasons.push('Bewährtes System für Hochspannungskabel');
          alternatives.push('X-RAY 8000 ADVANCED');
        }
      }

      if (goals?.includes('temperature') && stage === 'extrusion') {
        productName = 'ULTRATEMP 6000';
        confidence = 90;
        reasons.push('Berührungslose Ultraschall-Temperaturmessung für PE-Schmelzen');
        alternatives.push('X-RAY 8000 NXT');
      }

      if (!productName) {
        productName = 'X-RAY 8000 NXT';
        confidence = 75;
        reasons.push('Vielseitiges System für Hochspannungskabel');
      }

      return { productName, confidence, reasons, alternatives };
    }

    // Kabel & Leitungen Logik
    if (industry === 'cable') {
      console.log('Processing cable industry...');

      // Vorheizung
      if (stage === 'preheating' && goals?.includes('temperature')) {
        productName = 'PREHEATER 6000 TC';
        confidence = 95;
        reasons.push('Integrierte Temperaturmessung und -regelung');
        reasons.push('Optimale Haftung der Isolation auf dem Leiter');
      }

      // Konzentrizitätsmessung
      else if (goals?.includes('concentricity')) {
        if (diameter === 'micro') {
          productName = 'CENTERVIEW 8010';
          confidence = 95;
          reasons.push('8-Punkt-Exzentrizitätsmessung für kleinste Durchmesser');
          reasons.push('Automatische Positionierung zur Kabellage');
          alternatives.push('CENTERVIEW 8010e');
        } else if (diameter === 'small') {
          productName = 'CENTERVIEW 8010';
          confidence = 90;
          reasons.push('8-Punkt-Exzentrizitätsmessung mit automatischer Positionierung');
          alternatives.push('CENTERVIEW 8025');
        } else if (diameter === 'medium') {
          productName = 'CENTERVIEW 8025';
          confidence = 90;
          reasons.push('Optimiert für mittlere Durchmesserbereiche');
          alternatives.push('CENTERVIEW 8025e');
        }
      }

      // Wanddickenmessung
      else if (goals?.includes('wall-thickness')) {
        if (special?.includes('multi-layer')) {
          productName = 'X-RAY 6000 PRO';
          confidence = 95;
          reasons.push('Messung von bis zu drei Materialschichten');
          reasons.push('Röntgentechnologie unabhängig von Material und Temperatur');
        } else {
          productName = 'X-RAY 6000 PRO';
          confidence = 85;
          reasons.push('Präzise Wanddickenmessung mit Röntgentechnologie');
        }
      }

      // Durchmessermessung
      else if (goals?.includes('diameter')) {
        if (diameter === 'micro') {
          productName = 'LASER 2005 XY';
          confidence = 90;
          reasons.push('Höchste Präzision für kleinste Durchmesser (0,05-5 mm)');
          reasons.push('Genauigkeit ±0,25 μm');
        } else if (diameter === 'small') {
          productName = 'LASER 2010 XY';
          confidence = 85;
          reasons.push('Zuverlässige 2-Achs-Durchmessermessung (0,2-10 mm)');
          alternatives.push('LASER 2010 T');
        } else if (diameter === 'medium') {
          productName = 'LASER 2050 XY';
          confidence = 85;
          reasons.push('Standard-Durchmessermessung (0,5-50 mm)');
          alternatives.push('LASER 2050 T');
        } else if (diameter === 'large') {
          productName = 'LASER 2100 XY';
          confidence = 85;
          reasons.push('Durchmessermessung für große Bereiche (1-100 mm)');
        }
      }

      // Kapazitätsmessung
      else if (goals?.includes('capacitance')) {
        if (diameter === 'small') {
          productName = 'CAPACITANCE 2010';
          confidence = 90;
          reasons.push('Multi-Zonen-Elektrode für präzise Kapazitätsmessung');
          reasons.push('Integrierte FFT-Analyse und SRL-Vorhersage');
        } else if (diameter === 'medium') {
          productName = 'CAPACITANCE 2025';
          confidence = 90;
          reasons.push('Optimiert für LAN-, Koaxial- und HF-Kabel');
        } else if (diameter === 'large') {
          productName = 'CAPACITANCE 2060';
          confidence = 85;
          reasons.push('Kapazitätsmessung für große Durchmesser');
        }
      }

      // Hochspannungsprüfung
      else if (goals?.includes('high-voltage')) {
        productName = 'SPARK 6030 HF';
        confidence = 85;
        reasons.push('Hochfrequenz-Hochspannungsprüfung');
        reasons.push('Integriertes Selbsttest- und Kalibriersystem');
        alternatives.push('SPARK 2000 BS');
      }

      // Oberflächenfehler
      else if (goals?.includes('defects')) {
        if (diameter === 'small') {
          productName = 'LUMP 2010 XY';
          confidence = 85;
          reasons.push('2-Achs-Knotendetektion mit Doppelsensor-Technologie');
          alternatives.push('LUMP 2010 T');
        } else if (diameter === 'medium') {
          productName = 'LUMP 2025 XY';
          confidence = 85;
          reasons.push('Zuverlässige Detektion von Knoten und Einschnürungen');
        }
      }

      // Fallback für cable industry
      if (!productName) {
        productName = 'LASER 2050 XY';
        confidence = 60;
        reasons.push('Vielseitige Durchmessermessung für Kabelanwendungen');
        alternatives.push('ECOCONTROL 6000');
      }
    }

    // Rohr & Schlauch Logik
    if (industry === 'pipe') {
      console.log('Processing pipe industry...');
      if (goals?.includes('wall-thickness')) {
        if (diameter === 'large' || diameter === 'xlarge') {
          if (diameter === 'xlarge') {
            productName = 'CENTERWAVE 6000/1600';
            confidence = 95;
            reasons.push('Millimeterwellen-Technologie für sehr große Rohre (250-1600 mm)');
          } else {
            productName = 'CENTERWAVE 6000/800';
            confidence = 95;
            reasons.push('Millimeterwellen-Technologie für große Rohre (160-800 mm)');
            alternatives.push('CENTERWAVE 6000/1200');
          }
          reasons.push('360° Wanddickenmessung ohne Koppelmedium');
        } else if (diameter === 'medium') {
          productName = 'X-RAY 6000 PRO';
          confidence = 90;
          reasons.push('Präzise Röntgenmessung für mittlere Durchmesser');
          alternatives.push('CENTERWAVE 6000/400');
        } else {
          productName = 'X-RAY 6000 PRO';
          confidence = 80;
          reasons.push('Vielseitige Wanddickenmessung');
        }
      }

      else if (goals?.includes('diameter')) {
        if (diameter === 'small') {
          productName = 'LASER 2010 XY';
          confidence = 80;
          reasons.push('Berührungslose Laser-Durchmessermessung');
        } else if (diameter === 'medium') {
          productName = 'LASER 2050 XY';
          confidence = 80;
          reasons.push('Standard-Durchmessermessung für Rohre');
        } else if (diameter === 'large') {
          productName = 'LASER 2200 XY';
          confidence = 80;
          reasons.push('Durchmessermessung für große Rohre');
        }
      }

      if (!productName) {
        productName = 'X-RAY 6000 PRO';
        confidence = 65;
        reasons.push('Vielseitiges System für Rohr- und Schlauchproduktion');
      }
    }

    // Fallback-Logik wenn nichts gefunden wurde
    if (!productName) {
      console.log('Using fallback logic...');
      if (goals?.includes('diameter')) {
        productName = 'LASER 2050 XY';
        confidence = 50;
        reasons.push('Universelle Durchmessermessung');
      } else if (goals?.includes('wall-thickness')) {
        productName = 'X-RAY 6000 PRO';
        confidence = 50;
        reasons.push('Vielseitige Wanddickenmessung');
      } else if (goals?.includes('concentricity')) {
        productName = 'CENTERVIEW 8010';
        confidence = 50;
        reasons.push('Exzentrizitätsmessung');
      } else {
        productName = 'ECOCONTROL 6000';
        confidence = 30;
        reasons.push('Universelles Prozessorsystem');
      }
    }

    // Automatisierung
    if (special?.includes('automation') && !alternatives.includes('ECOCONTROL 6000')) {
      alternatives.push('ECOCONTROL 6000');
      reasons.push('Automatische Regelung und Prozessoptimierung möglich');
    }

    console.log('Final recommendation:', { productName, confidence, reasons, alternatives });
    return { productName, confidence, reasons, alternatives };
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const result = calculateRecommendation();
      setRecommendation(result);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers([]);
    setRecommendation(null);
  };

  const currentQuestion = questions[currentStep];
  const currentAnswer = currentQuestion ? getAnswer(currentQuestion.id) : undefined;
  const canProceed = currentAnswer && (
    (currentQuestion.type === 'single' && currentAnswer.value) ||
    (currentQuestion.type === 'multiple' && Array.isArray(currentAnswer.value) && currentAnswer.value.length > 0)
  );

  // Ergebnisanzeige
  if (recommendation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                Basierend auf Ihren Angaben haben wir das optimale SIKORA-Produkt gefunden
              </p>
            </div>

            {/* Hauptempfehlung */}
            <div className="bg-gradient-to-r from-sikora-blue to-sikora-cyan rounded-lg p-6 text-white mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{recommendation.productName}</h3>
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

            {/* Alternative Empfehlungen */}
            {recommendation.alternatives && recommendation.alternatives.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Ergänzende Produkte
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendation.alternatives.map((alt, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <span className="text-sm font-medium text-sikora-blue">{alt}</span>
                    </div>
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
                onClick={handleRestart}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
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
        </div>
      </div>
    );
  }

  // Wizard-Interface
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-sikora-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-sikora-blue mb-2">
              Produktempfehlungs-Assistent
            </h2>
            <p className="text-gray-600">
              Beantworten Sie einige Fragen und wir finden das perfekte SIKORA-Produkt für Sie
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Frage {currentStep + 1} von {questions.length}</span>
              <span>{Math.round((currentStep + 1) / questions.length * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-sikora-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep + 1) / questions.length * 100}%` }}
              />
            </div>
          </div>

          {/* Aktuelle Frage */}
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
                            updateAnswer(currentQuestion.id, option.value, option.label);
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
                        <div className="text-sm text-gray-600">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={currentStep === 0 ? onClose : handleBack}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 0 ? 'Abbrechen' : 'Zurück'}
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
              {currentStep === questions.length - 1 ? 'Empfehlung erhalten' : 'Weiter'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductRecommendationWizard;
