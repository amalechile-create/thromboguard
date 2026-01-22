import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Shield,
  AlertTriangle,
  Syringe,
  Calculator,
  CheckCircle,
  AlertOctagon,
  Info,
  ChevronDown,
  ChevronUp,
  User,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  X,
  Moon,
  Sun,
  Scale,
  Baby,
  Sparkles,
  MessageSquare,
  FileText,
  Pill,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

/**
 * Main component implementing the thromboprophylaxis calculator.
 *
 * This component encapsulates all of the state, UI elements and calculations
 * needed to assess VTE risk and recommend pharmacological or mechanical
 * prophylaxis. It uses Tailwind CSS classes extensively for styling.
 */
const TromboprofilaxisPro = () => {
  const [activeTab, setActiveTab] = useState('medical'); // 'medical' | 'surgical'
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [expandedSection, setExpandedSection] = useState({
    contra: true,
    padua: true,
    improve: false,
    caprini: true,
    ortho: false,
  });

  // --- AI STATES ---
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiError, setAiError] = useState('');

  // --- VALORES INICIALES ---
  const initialPatientData = {
    age: 50,
    weight: 70,
    creatinine: 0.9,
    sex: 'male',
    height: 170,
  };

  const initialContraindications = {
    // Absolutas
    activeBleeding: false,
    severePlatelets: false, // < 50k (IMPROVE link)
    recentCNSBleed: false,
    neuroOcularSurgery: false,
    spinalAnesthesia: false, // Catéter epidural presente o retiro < 4-12h
    hypertensiveCrisis: false, // > 180/110
    heparinAllergy: false, // HIT
    intracranialMass: false, // Tumor/Mass causing shift
    // Relativas / Alto Riesgo Sangrado
    mildPlatelets: false, // 50k - 100k
    recentGIBleed: false, // < 1 month
    liverFailure: false, // INR > 1.5 (IMPROVE link)
    endocarditis: false,
    aorticDissection: false,
    activePepticUlcer: false, // (IMPROVE link)
  };

  const initialPadua = {
    activeCancer: false,
    historyVTE: false,
    reducedMobility: false,
    thrombophilia: false,
    recentTraumaSurgery: false,
    heartRespFailure: false,
    amiStroke: false,
    infectionRheuma: false,
    hormonalTx: false,
  };

  const initialImprove = {
    // Items manuales
    bleeding3Months: false, // 4.0
    icuAdmission: false, // 2.5
    cvc: false, // 2.0
    rheumaticDisease: false, // 2.0
  };

  const initialCaprini = {
    // 5 Puntos
    stroke: false,
    fractureHipLeg: false,
    polytrauma: false,
    acuteSpinalCord: false,
    // 3 Puntos
    historyVTE: false,
    familyHistoryVTE: false,
    factorVLeiden: false,
    prothrombinGene: false,
    lupusAnticoagulant: false,
    anticardiolipin: false,
    elevatedHomocysteine: false,
    hitHistory: false,
    otherThrombophilia: false,
    // 2 Puntos
    majorOpenSurgery: false, // > 45 min
    laparoscopicSurgery: false, // > 45 min
    arthroscopicSurgery: false,
    malignancy: false,
    confinedBed: false, // > 72h
    immobilizingCast: false,
    centralAccess: false,
    // 1 Punto
    minorSurgery: false,
    swollenLegs: false,
    varicoseVeins: false,
    pregnancyPostpartum: false,
    historyAbortions: false,
    oralContraceptives: false,
    sepsis: false,
    lungDisease: false,
    abnormalPulmonaryFunction: false,
    acuteMI: false,
    chf: false,
    ibd: false,
    bedRestMedical: false,
  };

  // --- ESTADOS ---
  const [patientData, setPatientData] = useState(initialPatientData);
  const [contraindications, setContraindications] = useState(initialContraindications);
  const [padua, setPadua] = useState(initialPadua);
  const [improve, setImprove] = useState(initialImprove);
  const [caprini, setCaprini] = useState(initialCaprini);
  const [showBio, setShowBio] = useState(true);

  // --- THEME ---
  const theme = darkMode
    ? {
        bg: 'bg-slate-950',
        text: 'text-slate-200',
        cardBg: 'bg-slate-900',
        cardBorder: 'border-slate-800',
        inputBg: 'bg-slate-800 border-slate-700 text-white',
        subText: 'text-slate-400',
        divider: 'divide-slate-800',
        border: 'border-slate-800',
        tabActive: 'bg-slate-800 text-indigo-400 border-indigo-500',
        tabInactive: 'text-slate-500 hover:text-slate-300',
        success: 'bg-emerald-950 text-emerald-200 border-emerald-900',
        warning: 'bg-amber-950 text-amber-200 border-amber-900',
        danger: 'bg-rose-950 text-rose-200 border-rose-900',
        info: 'bg-indigo-950 text-indigo-200 border-indigo-900',
        itemHover: 'hover:bg-slate-800',
      }
    : {
        bg: 'bg-gray-50',
        text: 'text-gray-900',
        cardBg: 'bg-white',
        cardBorder: 'border-gray-200',
        inputBg: 'bg-gray-50 border-gray-300',
        subText: 'text-gray-500',
        divider: 'divide-gray-100',
        border: 'border-gray-200',
        tabActive: 'bg-white text-indigo-700 border-indigo-600 shadow-sm',
        tabInactive: 'text-gray-500 hover:text-gray-700 bg-gray-100',
        success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        warning: 'bg-amber-50 text-amber-900 border-amber-200',
        danger: 'bg-rose-50 text-rose-900 border-rose-200',
        info: 'bg-indigo-50 text-indigo-900 border-indigo-200',
        itemHover: 'hover:bg-gray-50',
      };

  // --- CÁLCULOS AUTOMÁTICOS ---
  const calculatedMetrics = useMemo(() => {
    const { age, weight, creatinine, sex, height } = patientData;
    let calculatedBmi = 24;
    if (height && weight) {
      const hM = height / 100;
      calculatedBmi = Math.round(weight / (hM * hM));
    }
    let ibw = 50;
    if (sex === 'female') ibw = 45.5;
    if (height > 152) {
      const inchesOver = (height - 152) / 2.54;
      ibw += 2.3 * inchesOver;
    }
    const abw = ibw + 0.4 * (weight - ibw);
    let weightForCalc = weight;
    let weightLabel = 'Real';
    if (calculatedBmi >= 30) {
      weightForCalc = abw;
      weightLabel = 'Ajustado';
    }
    if (!creatinine || creatinine <= 0)
      return { gfr: 90, bmi: calculatedBmi, weightLabel, weightUsed: weightForCalc };
    let score = ((140 - age) * weightForCalc) / (72 * creatinine);
    if (sex === 'female') score *= 0.85;
    return {
      gfr: Math.round(score),
      bmi: calculatedBmi,
      weightLabel,
      weightUsed: Math.round(weightForCalc),
    };
  }, [patientData]);

  const { gfr, bmi, weightLabel } = calculatedMetrics;

  // --- SINCRONIZACIÓN AUTOMÁTICA ---
  useEffect(() => {
    if (caprini.hitHistory !== contraindications.heparinAllergy) {
      if (activeTab === 'surgical')
        setContraindications((p) => ({ ...p, heparinAllergy: caprini.hitHistory }));
    }
  }, [caprini.hitHistory, activeTab]);

  // --- SCORE LOGIC ---
  const getPaduaScore = () => {
    let s = 0;
    if (padua.activeCancer) s += 3;
    if (padua.historyVTE) s += 3;
    if (padua.reducedMobility) s += 3;
    if (padua.thrombophilia) s += 3;
    if (padua.recentTraumaSurgery) s += 2;
    if (padua.heartRespFailure) s += 1;
    if (padua.amiStroke) s += 1;
    if (padua.infectionRheuma) s += 1;
    if (padua.hormonalTx) s += 1;
    if (patientData.age >= 70) s += 1;
    if (bmi >= 30) s += 1;
    return s;
  };

  const getImproveScore = () => {
    let s = 0;
    if (improve.bleeding3Months) s += 4.0;
    if (improve.icuAdmission) s += 2.5;
    if (improve.cvc) s += 2.0;
    if (improve.rheumaticDisease) s += 2.0;
    if (contraindications.activePepticUlcer) s += 4.5;
    if (contraindications.liverFailure) s += 2.5;
    if (contraindications.severePlatelets) s += 4.0;
    if (padua.activeCancer || caprini.malignancy) s += 2.0;
    if (patientData.age >= 85) s += 3.5;
    else if (patientData.age >= 40) s += 1.5;
    if (gfr < 30) s += 2.5;
    if (patientData.sex === 'male') s += 1.0;
    return s;
  };

  const getCapriniScore = () => {
    let s = 0;
    if (patientData.age >= 41 && patientData.age <= 60) s += 1;
    if (patientData.age >= 61 && patientData.age <= 74) s += 2;
    if (patientData.age >= 75) s += 3;
    if (bmi > 25) s += 1;
    if (caprini.stroke) s += 5;
    if (caprini.fractureHipLeg) s += 5;
    if (caprini.polytrauma) s += 5;
    if (caprini.acuteSpinalCord) s += 5;
    if (caprini.historyVTE) s += 3;
    if (caprini.familyHistoryVTE) s += 3;
    if (caprini.factorVLeiden) s += 3;
    if (caprini.prothrombinGene) s += 3;
    if (caprini.lupusAnticoagulant) s += 3;
    if (caprini.anticardiolipin) s += 3;
    if (caprini.elevatedHomocysteine) s += 3;
    if (caprini.hitHistory) s += 3;
    if (caprini.otherThrombophilia) s += 3;
    if (caprini.majorOpenSurgery) s += 2;
    if (caprini.laparoscopicSurgery) s += 2;
    if (caprini.arthroscopicSurgery) s += 2;
    if (caprini.malignancy) s += 2;
    if (caprini.confinedBed) s += 2;
    if (caprini.immobilizingCast) s += 2;
    if (caprini.centralAccess) s += 2;
    const onePointers = [
      caprini.minorSurgery,
      caprini.swollenLegs,
      caprini.varicoseVeins,
      caprini.pregnancyPostpartum,
      caprini.historyAbortions,
      caprini.oralContraceptives,
      caprini.sepsis,
      caprini.lungDisease,
      caprini.abnormalPulmonaryFunction,
      caprini.acuteMI,
      caprini.chf,
      caprini.ibd,
      caprini.bedRestMedical,
    ];
    onePointers.forEach((item) => {
      if (item) s += 1;
    });
    return s;
  };

  const paduaScore = getPaduaScore();
  const improveScore = getImproveScore();
  const capriniScore = getCapriniScore();

  const score = activeTab === 'medical' ? paduaScore : capriniScore;
  const hasAbsContra = Object.entries(contraindications).some(([k, v]) => {
    const relatives = [
      'mildPlatelets',
      'recentGIBleed',
      'liverFailure',
      'endocarditis',
      'aorticDissection',
      'activePepticUlcer',
    ];
    return v && !relatives.includes(k);
  });
  const isHIT = contraindications.heparinAllergy;
  const epiduralRisk = contraindications.spinalAnesthesia;

  // --- ENGINE DE FÁRMACOS ROBUSTO ---
  const getDrugOptions = () => {
    let options = [];
    const isSevereRenal = gfr < 30;
    const isMorbidObesity = bmi >= 40;

    // 1. ESCENARIO HIT (Trombocitopenia Inducida por Heparina)
    if (isHIT) {
      if (isSevereRenal) {
        options.push({
          name: 'Argatroban / Bivalirudina',
          dose: 'Monitorizar aTTP',
          note: 'Requiere manejo especialista (HIT + VFG<30). Fondaparinux contraindicado.',
        });
      } else {
        options.push({
          name: 'Fondaparinux',
          dose: '2.5 mg SC c/24h',
          note: 'Elección en HIT con función renal conservada.',
        });
      }
      return options;
    }

    // 2. ESCENARIO FALLA RENAL (VFG < 30) - Prioridad Alta
    if (isSevereRenal) {
      options.push({
        name: 'Heparina No Fraccionada (HNF)',
        dose: '5000 UI SC c/8h - c/12h',
        note: '★ ELECCIÓN. No requiere ajuste renal (Metabolismo hepático).',
      });
      options.push({
        name: 'Enoxaparina (Ajustada)',
        dose: '20 mg SC c/24h',
        note: 'PRECAUCIÓN. Dosis reducida al 50% por riesgo de acumulación.',
      });
      options.push({
        name: 'Dalteparina',
        dose: '5000 UI SC c/24h',
        note: 'Menor bioacumulación que Enoxa, pero se sugiere monitorizar Anti-Xa.',
      });
      return options;
    }

    // 3. ESCENARIO OBESIDAD MÓRBIDA (IMC > 40)
    if (isMorbidObesity) {
      options.push({
        name: 'Enoxaparina (Dosis Alta)',
        dose: '40 mg SC c/12h  o  0.5 mg/kg c/24h',
        note: 'Ajuste por alto volumen de distribución.',
      });
      options.push({
        name: 'HNF (Dosis Alta)',
        dose: '7500 UI SC c/8h',
        note: 'Dosis aumentada para alcanzar niveles profilácticos.',
      });
      return options;
    }

    // 4. ESCENARIO ESTÁNDAR (Alto Riesgo)
    options.push({
      name: 'Enoxaparina',
      dose: '40 mg SC c/24h',
      note: 'Estándar de elección.',
    });
    options.push({
      name: 'Dalteparina',
      dose: '5000 UI SC c/24h',
      note: 'Alternativa HBPM.',
    });
    options.push({
      name: 'Heparina No Fraccionada',
      dose: '5000 UI SC c/8h',
      note: 'Opción válida.',
    });

    return options;
  };

  // --- RECOMMENDATION ENGINE ---
  const getRecommendation = () => {
    const drugsList = getDrugOptions();

    if (hasAbsContra) {
      return {
        level: 'CONTRAINDICADO',
        color: theme.danger,
        text: 'NO ANTICOAGULAR. Riesgo vital. Usar solo medidas mecánicas (IPC/GCS).',
        note: 'Contraindicación absoluta presente.',
        drugs: null,
      };
    }

    if (epiduralRisk) {
      return {
        level: 'PRECAUCIÓN ANESTESIA',
        color: theme.warning,
        text: 'Riesgo hematoma espinal. Esperar tiempos de seguridad.',
        note: 'Catéter Epidural: Esperar 4h (HNF) o 12h (HBPM) tras retiro para dosificar.',
        drugs: drugsList, // Still show drugs but warn
      };
    }

    const highBleedingRisk = activeTab === 'medical' && improveScore >= 7;

    // Medical Logic
    if (activeTab === 'medical') {
      if (paduaScore < 4)
        return {
          level: 'RIESGO BAJO',
          color: theme.success,
          text: 'Deambulación precoz. No requiere farmacología.',
          note: `Padua ${paduaScore} (Bajo). Medidas generales.`,
          drugs: null,
        };

      if (highBleedingRisk)
        return {
          level: 'RIESGO MIXTO',
          color: theme.warning,
          text: 'Riesgo Trombosis vs. Sangrado ELEVADO.',
          note: `Padua ${paduaScore} (Alto) vs IMPROVE ${improveScore} (Alto). Se prefieren medidas mecánicas. Valorar fármaco caso a caso.`,
          drugs: drugsList, // Show options in case MD decides to treat
        };

      return {
        level: 'ALTO RIESGO TROMBÓTICO',
        color: theme.danger,
        text: 'Iniciar Profilaxis Farmacológica.',
        note: `Padua ${paduaScore} (Alto). Iniciar esquema según función renal.`,
        drugs: drugsList,
      };
    }

    // Surgical Logic
    else {
      if (capriniScore === 0)
        return {
          level: 'RIESGO MUY BAJO',
          color: theme.success,
          text: 'Deambulación precoz.',
          note: 'Caprini 0. Deambulación.',
          drugs: null,
        };
      if (capriniScore <= 2)
        return {
          level: 'RIESGO BAJO/MOD',
          color: theme.info,
          text: 'Medidas Mecánicas. Fármacos opcionales.',
          note: `Caprini ${capriniScore}. Sugerencia: IPC/GCS.`,
          drugs: null,
        };
      return {
        level: 'ALTO RIESGO QUIRÚRGICO',
        color: theme.danger,
        text: 'Profilaxis Combinada (Fármaco + Mecánica).',
        note: `Caprini ${capriniScore} (Alto).`,
        drugs: drugsList,
      };
    }
  };

  const rec = getRecommendation();

  // --- GEMINI API INTEGRATION ---
  const callGemini = async () => {
    setAiLoading(true);
    setAiError('');
    setAiResponse('');

    const context = {
      patient: {
        ...patientData,
        bmi,
        gfr,
        gfr_method: 'Cockcroft-Gault',
        weight_used: weightLabel,
      },
      scores: {
        padua: activeTab === 'medical' ? paduaScore : 'N/A',
        improve: activeTab === 'medical' ? improveScore : 'N/A',
        caprini: activeTab === 'surgical' ? capriniScore : 'N/A',
      },
      clinical_status: {
        contraindications: Object.keys(contraindications).filter((k) => contraindications[k]),
        is_hit: isHIT,
        is_renal_failure: gfr < 30,
        is_obesity: bmi >= 30,
      },
    };

    const promptText = `
      Actúa como hematólogo experto. Analiza:
      ${JSON.stringify(context, null, 2)}
      
      Dame una recomendación concisa de tromboprofilaxis (Fármaco, dosis, duración) considerando ESPECÍFICAMENTE la función renal (${gfr} ml/min) y el peso.
      Si VFG < 30, justifica el cambio de dosis/fármaco.
    `;

    try {
      const apiKey = '';
      let resultText = '';

      const makeRequest = async () => {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
          },
        );
        if (!response.ok) throw new Error(`HTTP error!`);
        const data = await response.json();
        return (
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          'Error.'
        );
      };

      const delays = [1000, 2000, 4000];
      for (let i = 0; i < 3; i++) {
        try {
          resultText = await makeRequest();
          break;
        } catch (e) {
          if (i === 2) throw e;
          await new Promise((r) => setTimeout(r, delays[i]));
        }
      }
      setAiResponse(resultText);
    } catch (error) {
      setAiError('Error de conexión IA.');
    } finally {
      setAiLoading(false);
    }
  };

  // --- ACTIONS ---
  const copyToClipboard = () => {
    let text = `--- TROMBOPROFILAXIS ---\n`;
    text += `Paciente: ${patientData.age}a | IMC ${bmi} | VFG ${gfr} (${weightLabel})\n`;
    text += `Riesgo: ${rec.level}\nPlan: ${rec.note}\n`;
    if (rec.drugs) text += `Sugerencia: ${rec.drugs[0].name} ${rec.drugs[0].dose}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    if (window.confirm('¿Reiniciar formulario?')) {
      setPatientData(initialPatientData);
      setContraindications(initialContraindications);
      setPadua(initialPadua);
      setImprove(initialImprove);
      setCaprini(initialCaprini);
    }
  };

  // Reusable switch component for toggling individual items
  const Switch = ({ checked, onChange, label, sub, points, danger, warning }) => (
    <div
      onClick={onChange}
      className={`flex justify-between items-center p-3 border-b cursor-pointer transition-all ${theme.border} ${theme.itemHover} ${
        checked
          ? danger
            ? 'bg-red-500 bg-opacity-10 border-red-500'
            : warning
            ? 'bg-orange-500 bg-opacity-10 border-orange-500'
            : 'bg-indigo-500 bg-opacity-10 border-indigo-500'
          : theme.cardBg
      }`}
    >
      <div className="flex-1 pr-2">
        <div
          className={`text-sm font-medium ${
            danger && checked
              ? 'text-red-500 font-bold'
              : warning && checked
              ? 'text-orange-500 font-bold'
              : theme.text
          }`}
        >
          {label}
        </div>
        {sub && <div className={`text-xs mt-0.5 ${theme.subText}`}>{sub}</div>}
      </div>
      <div className="flex items-center gap-2">
        {points && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${
              darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {points} pts
          </span>
        )}
        <div
          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
            checked
              ? danger
                ? 'bg-red-500 border-red-500'
                : warning
                ? 'bg-orange-500 border-orange-500'
                : 'bg-indigo-600 border-indigo-600'
              : 'border-gray-400'
          }`}
        >
          {checked && <CheckCircle size={14} className="text-white" />}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`max-w-xl mx-auto min-h-screen pb-64 shadow-2xl font-sans relative transition-colors duration-300 ${theme.bg}`}
    >
      {/* HEADER */}
      <header
        className={`${
          darkMode ? 'bg-slate-950' : 'bg-indigo-700'
        } text-white p-4 sticky top-0 z-50 shadow-lg`}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <div className="leading-tight">
              <h1 className="text-xl font-bold tracking-tight">ThromboGuard</h1>
              <span className="text-[10px] opacity-75 font-normal uppercase tracking-widest">
                v5.2 Pharma
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowAiModal(true);
                if (!aiResponse) callGemini();
              }}
              className={`flex items-center gap-1 p-2 px-3 rounded-full shadow-lg font-bold transition-all animate-pulse ${
                darkMode ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-700'
              }`}
            >
              <Sparkles size={16} /> <span className="text-xs">IA</span>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full shadow-sm ${
                darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-indigo-600'
              }`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={resetForm}
              className={`p-2 rounded-full shadow-sm hover:bg-red-500 transition-colors ${
                darkMode ? 'bg-slate-800' : 'bg-indigo-600'
              }`}
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
        <div
          className={`bg-opacity-30 rounded-lg p-2 flex justify-around text-xs backdrop-blur-sm ${
            darkMode ? 'bg-slate-700' : 'bg-indigo-900'
          }`}
        >
          <div className="text-center flex flex-col items-center">
            <div className="opacity-70">VFG ({weightLabel === 'Ajustado' ? 'Aj.' : 'Real'})</div>
            <div
              className={`font-bold text-sm ${
                gfr < 30 ? 'text-red-300 animate-pulse' : 'text-white'
              }`}
            >
              {gfr}
            </div>
          </div>
          <div className="w-px bg-white opacity-20"></div>
          <div className="text-center">
            <div className="opacity-70">IMC</div>
            <div
              className={`font-bold text-sm ${
                bmi > 30 ? 'text-yellow-300' : 'text-white'
              }`}
            >
              {bmi}
            </div>
          </div>
          <div className="w-px bg-white opacity-20"></div>
          <div className="text-center">
            <div className="opacity-70">Riesgos</div>
            <div className="font-bold text-sm">
              {activeTab === 'medical'
                ? `P:${paduaScore} | I:${improveScore}`
                : `C:${capriniScore}`}
            </div>
          </div>
        </div>
      </header>

      {/* AI MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[70] flex items-center justify-center p-4 animate-in fade-in">
          <div
            className={`${theme.cardBg} ${theme.text} rounded-lg shadow-2xl max-w-lg w-full p-0 overflow-hidden border ${theme.cardBorder} flex flex-col max-h-[85vh]`}
          >
            {/* Modal Header */}
            <div
              className={`p-4 border-b flex justify-between items-center ${
                darkMode ? 'bg-indigo-900' : 'bg-indigo-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-500" />
                <h3
                  className={`font-bold ${
                    darkMode ? 'text-white' : 'text-indigo-800'
                  }`}
                >
                  Análisis Clínico Gemini
                </h3>
              </div>
              <button onClick={() => setShowAiModal(false)}>
                <X size={24} className="opacity-50 hover:opacity-100" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                  <p className="text-sm opacity-70 animate-pulse">
                    Analizando VFG {gfr} ml/min y opciones farmacéuticas...
                  </p>
                </div>
              ) : aiError ? (
                <div className="text-center text-red-500 py-10">
                  <AlertTriangle className="mx-auto mb-2" size={32} />
                  <p>{aiError}</p>
                  <button
                    onClick={callGemini}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm"
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <div
                  className={`prose prose-sm max-w-none ${darkMode ? 'prose-invert' : ''}`}
                >
                  <ReactMarkdown>{aiResponse}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!aiLoading && !aiError && (
              <div
                className={`p-4 border-t flex justify-between items-center ${
                  darkMode ? 'border-slate-700' : 'border-gray-100'
                }`}
              >
                <span className="text-xs opacity-50 flex items-center gap-1">
                  <Info size={12} /> Revisar siempre con criterio médico.
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiResponse);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${
                    darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}{' '}
                  {copied ? 'Copiado' : 'Copiar Nota'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BIODATA */}
      {showBio && (
        <div className={`${theme.cardBg} p-4 border-b ${theme.border} relative`}>
          <button
            onClick={() => setShowBio(false)}
            className={`absolute top-2 right-2 ${theme.subText}`}
          >
            <ChevronUp size={20} />
          </button>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`text-xs font-bold mb-1 block ${theme.subText}`}
              >
                EDAD
              </label>
              <input
                type="number"
                className={`w-full p-2 rounded text-sm outline-none ${theme.inputBg}`}
                value={patientData.age}
                onChange={(e) =>
                  setPatientData({ ...patientData, age: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label
                className={`text-xs font-bold mb-1 block ${theme.subText}`}
              >
                PESO (Kg)
              </label>
              <input
                type="number"
                className={`w-full p-2 rounded text-sm outline-none ${theme.inputBg}`}
                value={patientData.weight}
                onChange={(e) =>
                  setPatientData({ ...patientData, weight: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label
                className={`text-xs font-bold mb-1 block ${theme.subText}`}
              >
                CREATININA
              </label>
              <input
                type="number"
                step="0.1"
                className={`w-full p-2 rounded text-sm outline-none ${theme.inputBg}`}
                value={patientData.creatinine}
                onChange={(e) =>
                  setPatientData({ ...patientData, creatinine: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label
                className={`text-xs font-bold mb-1 block ${theme.subText}`}
              >
                ALTURA (cm)
              </label>
              <input
                type="number"
                className={`w-full p-2 rounded text-sm outline-none ${theme.inputBg}`}
                value={patientData.height}
                onChange={(e) =>
                  setPatientData({ ...patientData, height: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setPatientData({ ...patientData, sex: 'male' })}
              className={`flex-1 py-1 text-xs rounded border ${
                patientData.sex === 'male' ? 'bg-blue-600 text-white' : theme.cardBg
              }`}
            >
              Masculino
            </button>
            <button
              onClick={() => setPatientData({ ...patientData, sex: 'female' })}
              className={`flex-1 py-1 text-xs rounded border ${
                patientData.sex === 'female' ? 'bg-pink-600 text-white' : theme.cardBg
              }`}
            >
              Femenino
            </button>
          </div>
        </div>
      )}
      {!showBio && (
        <div
          className={`${theme.cardBg} border-b ${theme.border} p-2 flex justify-center`}
        >
          <button
            onClick={() => setShowBio(true)}
            className="text-xs text-indigo-500 font-bold flex items-center gap-1"
          >
            <User size={14} /> Datos Paciente
          </button>
        </div>
      )}

      {/* TABS */}
      <div
        className={`flex sticky top-[110px] z-40 border-b ${theme.cardBg} ${theme.border}`}
      >
        <button
          onClick={() => setActiveTab('medical')}
          className={`flex-1 py-3 text-sm font-bold uppercase border-b-2 transition-colors ${
            activeTab === 'medical'
              ? theme.tabActive
              : `border-transparent ${theme.tabInactive}`
          }`}
        >
          Médico
        </button>
        <button
          onClick={() => setActiveTab('surgical')}
          className={`flex-1 py-3 text-sm font-bold uppercase border-b-2 transition-colors ${
            activeTab === 'surgical'
              ? theme.tabActive
              : `border-transparent ${theme.tabInactive}`
          }`}
        >
          Quirúrgico
        </button>
      </div>

      <div className="p-2 space-y-3">
        {/* CONTRAINDICACIONES */}
        <div className={`rounded-lg shadow-sm overflow-hidden border ${theme.danger}`}>
          <div
            className={`p-2 px-4 border-b flex justify-between items-center cursor-pointer ${
              darkMode
                ? 'bg-red-900 bg-opacity-40 border-red-800'
                : 'bg-red-50 border-red-100'
            }`}
            onClick={() =>
              setExpandedSection({ ...expandedSection, contra: !expandedSection.contra })
            }
          >
            <div className="flex items-center gap-2">
              <AlertOctagon className="text-red-500 w-4 h-4" />
              <h3 className={`text-sm font-bold ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
                Contraindicaciones
              </h3>
            </div>
            {expandedSection.contra ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {expandedSection.contra && (
            <div className={`divide-y ${theme.divider}`}>
              <div className={`px-3 py-1 text-[10px] font-bold uppercase ${theme.cardBg} ${theme.subText}`}>
                Absolutas
              </div>
              <Switch
                danger
                label="Sangrado Activo Mayor"
                checked={contraindications.activeBleeding}
                onChange={() =>
                  setContraindications({
                    ...contraindications,
                    activeBleeding: !contraindications.activeBleeding,
                  })
                }
              />
              <Switch
                danger
                label="Hemorragia Intracraneal Aguda"
                checked={contraindications.recentCNSBleed}
                onChange={() =>
                  setContraindications({
                    ...contraindications,
                    recentCNSBleed: !contraindications.recentCNSBleed,
                  })
                }
              />
              <Switch
                danger
                label="Trombocitopenia Severa (<50k)"
                sub="Suma 4 pts a IMPROVE"
                checked={contraindications.severePlatelets}
                onChange={() =>
                  setContraindications({
                    ...contraindications,
                    severePlatelets: !contraindications.severePlatelets,
                  })
                }
              />
              <Switch
                danger
                label="Alergia Heparina / HIT"
                sub="Prohíbe Heparinas"
                checked={contraindications.heparinAllergy}
                onChange={() =>
                  setContraindications({
                    ...contraindications,
                    heparinAllergy: !contraindications.heparinAllergy,
                  })
                }
              />
              <Switch
                danger
                label="Catéter Epidural / Raquídea"
                sub="Presente o retirado < 4h"
                checked={contraindications.spinalAnesthesia}
                onChange={() =>
                  setContraindications({
                    ...contraindications,
                    spinalAnesthesia: !contraindications.spinalAnesthesia,
                  })
                }
              />
              <Switch
                danger
                label="Crisis HTA (>180/110)"
                checked={contraindications.hypertensiveCrisis}
                onChange={() =>
                  setContraindications({
                    ...contraindications,
                    hypertensiveCrisis: !contraindications.hypertensiveCrisis,
                  })
                }
              />

              <div className={`px-3 py-1 text-[10px] font-bold uppercase ${theme.cardBg} ${theme.subText}`}>
                Relativas / Alto Riesgo Sangrado
              </div>
              <Switch
                warning
                label="Úlcera Péptica Activa"
                sub="Suma 4.5 pts a IMPROVE"
                checked={contraindications.activePepticUlcer}
                onChange={() =>
                  setContraindications({
                    ...contraindications,
                    activePepticUlcer: !contraindications.activePepticUlcer,
                  })
                }
              />
              <Switch
                warning
                label="Falla Hepática (INR > 1.5)"
                sub="Suma 2.5 pts a IMPROVE"
                checked={contraindications.liverFailure}
                onChange={() =>
                  setContraindications({
                    ...contraindications,
                    liverFailure: !contraindications.liverFailure,
                  })
                }
              />
              <Switch
                warning
                label="Endocarditis Infecciosa"
                checked={contraindications.endocarditis}
                onChange={() =>
                  setContraindications({
                    ...contraindications,
                    endocarditis: !contraindications.endocarditis,
                  })
                }
              />
              <Switch
                warning
                label="Disección Aórtica"
                checked={contraindications.aorticDissection}
                onChange={() =>
                  setContraindications({
                    ...contraindications,
                    aorticDissection: !contraindications.aorticDissection,
                  })
                }
              />
            </div>
          )}
        </div>

        {/* MEDICAL TAB CONTENT */}
        {activeTab === 'medical' && (
          <>
            {/* PADUA */}
            <div className={`rounded-lg shadow-sm border overflow-hidden ${theme.cardBg} ${theme.cardBorder}`}>
              <div
                className={`p-2 px-4 border-b flex justify-between items-center cursor-pointer ${theme.border} ${
                  darkMode ? 'bg-indigo-900 bg-opacity-30' : 'bg-indigo-50'
                }`}
                onClick={() =>
                  setExpandedSection({ ...expandedSection, padua: !expandedSection.padua })
                }
              >
                <div className="flex items-center gap-2 font-bold text-sm text-indigo-500">
                  <Activity size={16} /> Riesgo Trombosis (PADUA)
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-indigo-500 text-white px-2 rounded-full">
                    {paduaScore} pts
                  </span>
                  {expandedSection.padua ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {expandedSection.padua && (
                <div className={`divide-y ${theme.divider}`}>
                  <Switch
                    label="Cáncer Activo"
                    points={3}
                    checked={padua.activeCancer}
                    onChange={() => setPadua({ ...padua, activeCancer: !padua.activeCancer })}
                  />
                  <Switch
                    label="Antecedente TVP/TEP"
                    points={3}
                    checked={padua.historyVTE}
                    onChange={() => setPadua({ ...padua, historyVTE: !padua.historyVTE })}
                  />
                  <Switch
                    label="Movilidad Reducida"
                    points={3}
                    checked={padua.reducedMobility}
                    onChange={() => setPadua({ ...padua, reducedMobility: !padua.reducedMobility })}
                  />
                  <Switch
                    label="Trombofilia Conocida"
                    points={3}
                    checked={padua.thrombophilia}
                    onChange={() => setPadua({ ...padua, thrombophilia: !padua.thrombophilia })}
                  />
                  <Switch
                    label="Trauma/Cirugía Reciente (≤1 mes)"
                    points={2}
                    checked={padua.recentTraumaSurgery}
                    onChange={() => setPadua({ ...padua, recentTraumaSurgery: !padua.recentTraumaSurgery })}
                  />
                  <Switch
                    label="Edad ≥ 70 años"
                    points={1}
                    checked={patientData.age >= 70}
                    onChange={() => {}}
                  />
                  <Switch
                    label="Falla Cardiaca / Respiratoria"
                    points={1}
                    checked={padua.heartRespFailure}
                    onChange={() => setPadua({ ...padua, heartRespFailure: !padua.heartRespFailure })}
                  />
                  <Switch
                    label="IAM o ACV Isquémico Agudo"
                    points={1}
                    checked={padua.amiStroke}
                    onChange={() => setPadua({ ...padua, amiStroke: !padua.amiStroke })}
                  />
                  <Switch
                    label="Infección Aguda / Enf. Reuma"
                    points={1}
                    checked={padua.infectionRheuma}
                    onChange={() => setPadua({ ...padua, infectionRheuma: !padua.infectionRheuma })}
                  />
                  <Switch
                    label="Obesidad (IMC ≥ 30)"
                    points={1}
                    checked={bmi >= 30}
                    onChange={() => {}}
                  />
                  <Switch
                    label="Tratamiento Hormonal"
                    points={1}
                    checked={padua.hormonalTx}
                    onChange={() => setPadua({ ...padua, hormonalTx: !padua.hormonalTx })}
                  />
                </div>
              )}
            </div>

            {/* IMPROVE BLEEDING */}
            <div className={`rounded-lg shadow-sm border overflow-hidden ${theme.cardBg} ${theme.cardBorder}`}>
              <div
                className={`p-2 px-4 border-b flex justify-between items-center cursor-pointer ${theme.border} ${
                  darkMode ? 'bg-orange-900 bg-opacity-30' : 'bg-orange-50'
                }`}
                onClick={() =>
                  setExpandedSection({ ...expandedSection, improve: !expandedSection.improve })
                }
              >
                <div className="flex items-center gap-2 font-bold text-sm text-orange-500">
                  <Scale size={16} /> Riesgo Sangrado (IMPROVE)
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 rounded-full text-white ${
                      improveScore >= 7 ? 'bg-red-500 animate-pulse' : 'bg-orange-400'
                    }`}
                  >
                    {improveScore} pts
                  </span>
                  {expandedSection.improve ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {expandedSection.improve && (
                <div className={`divide-y ${theme.divider}`}>
                  <div
                    className={`p-2 text-[10px] text-center ${theme.subText}`}
                  >
                    Score ≥ 7 indica ALTO riesgo. Algunos items se marcan
                    automáticamente desde Contraindicaciones o Datos Paciente.
                  </div>

                  {/* Auto items (Display Only) */}
                  <div
                    className={`p-2 px-3 flex justify-between items-center text-xs opacity-70 bg-opacity-10 ${theme.bg}`}
                  >
                    <span>Úlcera Activa (Ver Contraindicaciones)</span>
                    <span>4.5 pts</span>
                  </div>
                  <div
                    className={`p-2 px-3 flex justify-between items-center text-xs opacity-70 bg-opacity-10 ${theme.bg}`}
                  >
                    <span>Plaquetas &lt; 50k (Ver Contraindicaciones)</span>
                    <span>4.0 pts</span>
                  </div>

                  <Switch
                    warning
                    label="Sangrado previo < 3 meses"
                    points={4.0}
                    checked={improve.bleeding3Months}
                    onChange={() =>
                      setImprove({ ...improve, bleeding3Months: !improve.bleeding3Months })
                    }
                  />
                  <Switch
                    warning
                    label="Admisión UCI / CCU"
                    points={2.5}
                    checked={improve.icuAdmission}
                    onChange={() =>
                      setImprove({ ...improve, icuAdmission: !improve.icuAdmission })
                    }
                  />
                  <Switch
                    warning
                    label="Catéter Venoso Central"
                    points={2.0}
                    checked={improve.cvc}
                    onChange={() => setImprove({ ...improve, cvc: !improve.cvc })}
                  />
                  <Switch
                    warning
                    label="Enf. Reumática"
                    points={2.0}
                    checked={improve.rheumaticDisease}
                    onChange={() =>
                      setImprove({ ...improve, rheumaticDisease: !improve.rheumaticDisease })
                    }
                  />
                  <div
                    className={`p-2 px-3 flex justify-between items-center text-xs opacity-70 bg-opacity-10 ${theme.bg}`}
                  >
                    <span>Cáncer Activo (Sincronizado)</span>
                    <span>2.0 pts</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* SURGICAL TAB */}
        {activeTab === 'surgical' && (
          <div
            className={`rounded-lg shadow-sm border overflow-hidden ${theme.cardBg} ${theme.cardBorder}`}
          >
            <div className="p-2 px-4 border-b font-bold text-sm text-indigo-500 bg-opacity-10 bg-indigo-500">
              Escala CAPRINI (Completa 2013)
            </div>
            <div className={`divide-y ${theme.divider}`}>
              {/* 5 Points */}
              <div
                className={`px-3 py-1 text-[10px] font-bold uppercase ${theme.cardBg} ${theme.subText}`}
              >
                5 Puntos (Riesgo Muy Alto)
              </div>
              <Switch
                label="ACV (<1 mes)"
                points={5}
                checked={caprini.stroke}
                onChange={() => setCaprini({ ...caprini, stroke: !caprini.stroke })}
              />
              <Switch
                label="Fractura Cadera/Pelvis/Pierna"
                points={5}
                checked={caprini.fractureHipLeg}
                onChange={() =>
                  setCaprini({ ...caprini, fractureHipLeg: !caprini.fractureHipLeg })
                }
              />
              <Switch
                label="Politrauma"
                points={5}
                checked={caprini.polytrauma}
                onChange={() => setCaprini({ ...caprini, polytrauma: !caprini.polytrauma })}
              />
              <Switch
                label="Lesión Medular Aguda (<1 mes)"
                points={5}
                checked={caprini.acuteSpinalCord}
                onChange={() =>
                  setCaprini({ ...caprini, acuteSpinalCord: !caprini.acuteSpinalCord })
                }
              />

              {/* 3 Points */}
              <div
                className={`px-3 py-1 text-[10px] font-bold uppercase ${theme.cardBg} ${theme.subText}`}
              >
                3 Puntos
              </div>
              <Switch
                label="Edad ≥ 75 años"
                points={3}
                checked={patientData.age >= 75}
                onChange={() => {}}
              />
              <Switch
                label="Historia Previa TVP/TEP"
                points={3}
                checked={caprini.historyVTE}
                onChange={() => setCaprini({ ...caprini, historyVTE: !caprini.historyVTE })}
              />
              <Switch
                label="Historia Familiar Trombosis"
                points={3}
                checked={caprini.familyHistoryVTE}
                onChange={() =>
                  setCaprini({ ...caprini, familyHistoryVTE: !caprini.familyHistoryVTE })
                }
              />
              <Switch
                label="Historia HIT (Alergia Heparina)"
                points={3}
                checked={caprini.hitHistory}
                onChange={() => setCaprini({ ...caprini, hitHistory: !caprini.hitHistory })}
              />

              <div
                className={`px-3 py-1 text-[10px] font-bold ${theme.subText} bg-opacity-20 bg-indigo-500`}
              >
                Trombofilias (3 pts c/u)
              </div>
              <Switch
                label="Factor V Leiden"
                points={3}
                checked={caprini.factorVLeiden}
                onChange={() =>
                  setCaprini({ ...caprini, factorVLeiden: !caprini.factorVLeiden })
                }
              />
              <Switch
                label="Gen Protrombina 20210A"
                points={3}
                checked={caprini.prothrombinGene}
                onChange={() =>
                  setCaprini({ ...caprini, prothrombinGene: !caprini.prothrombinGene })
                }
              />
              <Switch
                label="Anticoagulante Lúpico"
                points={3}
                checked={caprini.lupusAnticoagulant}
                onChange={() =>
                  setCaprini({ ...caprini, lupusAnticoagulant: !caprini.lupusAnticoagulant })
                }
              />
              <Switch
                label="Anticuerpos Anticardiolipina"
                points={3}
                checked={caprini.anticardiolipin}
                onChange={() =>
                  setCaprini({ ...caprini, anticardiolipin: !caprini.anticardiolipin })
                }
              />
              <Switch
                label="Homocisteína Elevada"
                points={3}
                checked={caprini.elevatedHomocysteine}
                onChange={() =>
                  setCaprini({ ...caprini, elevatedHomocysteine: !caprini.elevatedHomocysteine })
                }
              />

              {/* 2 Points */}
              <div
                className={`px-3 py-1 text-[10px] font-bold uppercase ${theme.cardBg} ${theme.subText}`}
              >
                2 Puntos
              </div>
              <Switch
                label="Edad 61-74 años"
                points={2}
                checked={patientData.age >= 61 && patientData.age <= 74}
                onChange={() => {}}
              />
              <Switch
                label="Cirugía Abierta Mayor (>45min)"
                points={2}
                checked={caprini.majorOpenSurgery}
                onChange={() =>
                  setCaprini({ ...caprini, majorOpenSurgery: !caprini.majorOpenSurgery })
                }
              />
              <Switch
                label="Cirugía Laparoscópica (>45min)"
                points={2}
                checked={caprini.laparoscopicSurgery}
                onChange={() =>
                  setCaprini({ ...caprini, laparoscopicSurgery: !caprini.laparoscopicSurgery })
                }
              />
              <Switch
                label="Artroscopía"
                points={2}
                checked={caprini.arthroscopicSurgery}
                onChange={() =>
                  setCaprini({ ...caprini, arthroscopicSurgery: !caprini.arthroscopicSurgery })
                }
              />
              <Switch
                label="Malignidad (Pasada o Presente)"
                points={2}
                checked={caprini.malignancy}
                onChange={() => setCaprini({ ...caprini, malignancy: !caprini.malignancy })}
              />
              <Switch
                label="Confinado en Cama (>72h)"
                points={2}
                checked={caprini.confinedBed}
                onChange={() => setCaprini({ ...caprini, confinedBed: !caprini.confinedBed })}
              />
              <Switch
                label="Yeso Inmovilizador"
                points={2}
                checked={caprini.immobilizingCast}
                onChange={() =>
                  setCaprini({ ...caprini, immobilizingCast: !caprini.immobilizingCast })
                }
              />
              <Switch
                label="Acceso Venoso Central"
                points={2}
                checked={caprini.centralAccess}
                onChange={() =>
                  setCaprini({ ...caprini, centralAccess: !caprini.centralAccess })
                }
              />

              {/* 1 Point */}
              <div
                className={`px-3 py-1 text-[10px] font-bold uppercase ${theme.cardBg} ${theme.subText}`}
              >
                1 Punto
              </div>
              <Switch
                label="Edad 41-60 años"
                points={1}
                checked={patientData.age >= 41 && patientData.age <= 60}
                onChange={() => {}}
              />
              <Switch
                label="IMC > 25"
                points={1}
                checked={bmi > 25}
                onChange={() => {}}
              />
              <Switch
                label="Cirugía Menor"
                points={1}
                checked={caprini.minorSurgery}
                onChange={() => setCaprini({ ...caprini, minorSurgery: !caprini.minorSurgery })}
              />
              <Switch
                label="Edema de piernas"
                points={1}
                checked={caprini.swollenLegs}
                onChange={() => setCaprini({ ...caprini, swollenLegs: !caprini.swollenLegs })}
              />
              <Switch
                label="Várices"
                points={1}
                checked={caprini.varicoseVeins}
                onChange={() => setCaprini({ ...caprini, varicoseVeins: !caprini.varicoseVeins })}
              />
              <Switch
                label="Embarazo o Puerperio"
                points={1}
                checked={caprini.pregnancyPostpartum}
                onChange={() =>
                  setCaprini({ ...caprini, pregnancyPostpartum: !caprini.pregnancyPostpartum })
                }
              />
              <Switch
                label="Historia de Abortos (3+)"
                points={1}
                checked={caprini.historyAbortions}
                onChange={() =>
                  setCaprini({ ...caprini, historyAbortions: !caprini.historyAbortions })
                }
              />
              <Switch
                label="Anticonceptivos Orales / TRH"
                points={1}
                checked={caprini.oralContraceptives}
                onChange={() =>
                  setCaprini({ ...caprini, oralContraceptives: !caprini.oralContraceptives })
                }
              />
              <Switch
                label="Sepsis (<1 mes)"
                points={1}
                checked={caprini.sepsis}
                onChange={() => setCaprini({ ...caprini, sepsis: !caprini.sepsis })}
              />
              <Switch
                label="Enfermedad Pulmonar (EPOC/Neumonía)"
                points={1}
                checked={caprini.lungDisease}
                onChange={() => setCaprini({ ...caprini, lungDisease: !caprini.lungDisease })}
              />
              <Switch
                label="IAM Agudo"
                points={1}
                checked={caprini.acuteMI}
                onChange={() => setCaprini({ ...caprini, acuteMI: !caprini.acuteMI })}
              />
              <Switch
                label="ICC (<1 mes)"
                points={1}
                checked={caprini.chf}
                onChange={() => setCaprini({ ...caprini, chf: !caprini.chf })}
              />
              <Switch
                label="Enf. Inflamatoria Intestinal"
                points={1}
                checked={caprini.ibd}
                onChange={() => setCaprini({ ...caprini, ibd: !caprini.ibd })}
              />
              <Switch
                label="Paciente Médico en Cama"
                points={1}
                checked={caprini.bedRestMedical}
                onChange={() => setCaprini({ ...caprini, bedRestMedical: !caprini.bedRestMedical })}
              />
            </div>
          </div>
        )}
      </div>

      {/* RECOMMENDATION FOOTER */}
      <div
        className={`fixed bottom-0 w-full max-w-xl border-t-2 shadow-2xl z-50 ${theme.cardBg} ${theme.border}`}
      >
        {/* Copy Button */}
        <button
          onClick={copyToClipboard}
          className={`absolute -top-12 right-4 text-white p-2 rounded-full shadow-lg flex items-center gap-2 px-4 transition-all ${
            darkMode ? 'bg-indigo-600' : 'bg-gray-800'
          }`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}{' '}
          <span className="text-xs font-bold">
            {copied ? '¡Listo!' : 'Copiar'}
          </span>
        </button>

        <div className={`p-4 ${rec.color}`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-black text-sm uppercase mb-1">
                {rec.level}
              </h2>
              <p className="text-xs font-medium leading-relaxed max-w-[85%]">
                {rec.text}
              </p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              {activeTab === 'medical' && improveScore >= 7 && (
                <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse">
                  IMPROVE ALTO
                </div>
              )}
              {gfr < 30 && (
                <div className="bg-red-700 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                  VFG &lt; 30 (Ajuste)
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {rec.drugs &&
              rec.drugs.map((d, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center text-xs p-2 rounded ${
                    darkMode ? 'bg-white bg-opacity-10' : 'bg-white bg-opacity-40'
                  }`}
                >
                  <div>
                    <div className="font-bold flex items-center gap-1">
                      <Pill size={12} /> {d.name}
                    </div>
                    <div className="text-[10px] opacity-80">{d.note}</div>
                  </div>
                  <div className="font-mono font-bold text-right ml-2">{d.dose}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TromboprofilaxisPro;
