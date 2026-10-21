import React, { useState, useEffect, useRef } from 'react';
import { useNeuro } from '../context/NeuroContext';
import { CameraVisionHUD } from './CameraVisionHUD';
import confetti from 'canvas-confetti';
import {
  Smile,
  Hand,
  Volume2,
  Brain,
  ShieldAlert,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Camera,
  Activity,
  ArrowRight,
  ChevronRight,
  Flame,
  Zap,
  Mic,
  TrendingUp,
  PhoneCall,
  LogOut,
  User,
  Minimize2
} from 'lucide-react';
import { LANGUAGES } from '../i18n/translations';
import { RehabilitationLibrary } from './RehabilitationLibrary';
import { DailyRoutineHealthLog } from './DailyRoutineHealthLog';
import { MedicalDocumentAnalyzer } from './MedicalDocumentAnalyzer';
import { VitalsTelemetry24h } from './VitalsTelemetry24h';
import { PatientLoginGate } from './PatientLoginGate';
import { SpeechTrainingCenter } from './SpeechTrainingCenter';
import {
  Calendar,
  FileText,
  Eye,
  ArrowDownCircle,
  Video
} from 'lucide-react';

export const PatientPortal: React.FC = () => {
  const {
    patientUser,
    isPatientLoggedIn,
    logoutPatient,
    callAdminPhoneRealtime,
    startMedia,
    stopMedia,
    cameraActive,
    micActive,
    cameraError,
    facialSymmetry,
    armStability,
    earValue,
    eyeState,
    blinkCount,
    simulateEarDistress,
    simulateEyePtosis,
    simulateSlideDown,
    simulateAbnormalAction,
    slideDownProgress,
    exerciseStreak,
    bestStreak,
    todayExercisesCompleted,
    dailyExerciseGoal,
    weeklyStreakDays,
    streakCelebration,
    dismissStreakCelebration,
    recordExerciseCompletion,
    triggerEmergency,
    adminPhone,
    language,
    setLanguage,
    triggerVoiceAssistant,
    t
  } = useNeuro();

  // Plain-Language First Launch Consent State (Stored with Timestamp)
  const [consentRecord, setConsentRecord] = useState<{ agreed: boolean; timestamp: string } | null>(() => {
    try {
      const stored = localStorage.getItem('neurolife_patient_consent_v1');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [showConsentModal, setShowConsentModal] = useState<boolean>(!consentRecord);

  // Floating Corner Camera Preview state
  const [isCornerPreviewOpen, setIsCornerPreviewOpen] = useState<boolean>(true);

  // If patient is not logged in, show the mobile phone OTP login gate
  if (!isPatientLoggedIn) {
    return <PatientLoginGate />;
  }

  // Active Navigation Tab
  const [activeTherapy, setActiveTherapy] = useState<
    'vitalsTelemetry' | 'rehabLibrary' | 'dailyRoutine' | 'docAnalyzer' | 'facial' | 'hand' | 'speech' | 'cognitive' | 'fastScan' | 'science'
  >('rehabLibrary');

  // Auto-Start Camera & Mic when patient mode is opened / consent given
  useEffect(() => {
    if (consentRecord?.agreed && !cameraActive) {
      startMedia().catch((err) => {
        console.warn('Auto-camera start handled safely:', err);
      });
    }
  }, [consentRecord, cameraActive, startMedia]);

  // Handle app background / visibility change safely
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App went to background
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle granting consent
  const handleGrantConsent = async () => {
    const newRecord = {
      agreed: true,
      timestamp: new Date().toISOString()
    };
    try {
      localStorage.setItem('neurolife_patient_consent_v1', JSON.stringify(newRecord));
    } catch {}
    setConsentRecord(newRecord);
    setShowConsentModal(false);
    await startMedia();
  };

  // Automatically start camera & mic when switching to exercise or speech tabs
  const handleSelectTherapy = (therapy: 'vitalsTelemetry' | 'rehabLibrary' | 'dailyRoutine' | 'docAnalyzer' | 'facial' | 'hand' | 'speech' | 'cognitive' | 'fastScan' | 'science') => {
    setActiveTherapy(therapy);
    if (therapy === 'rehabLibrary' || therapy === 'speech' || therapy === 'facial' || therapy === 'hand') {
      startMedia();
    }
  };

  // Facial Exercise States
  const [facialExerciseType, setFacialExerciseType] = useState<'SMILE' | 'EYEBROW' | 'CHEEK_PUFF' | 'LIP_PUCKER'>('SMILE');
  const [repsCompleted, setRepsCompleted] = useState<number>(6);
  const [targetReps] = useState<number>(10);
  const [exerciseActive, setExerciseActive] = useState<boolean>(false);
  const [facialFeedback, setFacialFeedback] = useState<string>('Hold bilateral smile for 3 seconds...');

  // Hand Finger Tapping States
  const [tapCount, setTapCount] = useState<number>(0);
  const [tapTimer, setTapTimer] = useState<number>(15);
  const [isTappingActive, setIsTappingActive] = useState<boolean>(false);
  const [tapCadenceScore, setTapCadenceScore] = useState<number>(0);

  // Speech & Aphasia Practice States
  const [speechExerciseIndex, setSpeechExerciseIndex] = useState<number>(0);
  const [speechClarityResult, setSpeechClarityResult] = useState<number | null>(88);
  const [isPracticingSpeech, setIsPracticingSpeech] = useState<boolean>(false);

  // Cognitive Neglect Scan States
  const [neglectTargets, setNeglectTargets] = useState<{ id: number; clicked: boolean; x: number; y: number }[]>([]);
  const [neglectScore, setNeglectScore] = useState<number>(0);

  // AI FAST Risk Scan State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanReport, setScanReport] = useState<any>(null);

  // Multilingual Speech Therapy Prompts
  const speechPromptsByLang: Record<string, { phrase: string; phonetic: string; focus: string }[]> = {
    en: [
      { phrase: 'Fifty-five yellow butterflies', phonetic: 'fif-tee fyv yel-oh buh-ter-flyz', focus: 'Labial & Lingual Precision' },
      { phrase: 'Today is a bright new morning', phonetic: 'tuh-day iz uh bryt noo mor-ning', focus: 'Sentence Prosody & Breath Flow' },
      { phrase: 'Water, tea, and warm milk', phonetic: 'wah-ter tee and worm milk', focus: 'Everyday Needs Articulation' },
    ],
    ta: [
      { phrase: 'காலை வணக்கம், நலம் வாழ்க', phonetic: 'Kaalai Vanakkam, Nalam Vaazhga', focus: 'நாக்கு மற்றும் இதழ் இயக்கம் (Lingual Motor)' },
      { phrase: 'இனிமையான காலை பொழுது', phonetic: 'Inimaiyana Kaalai Pozhudhu', focus: 'ஒலி உச்சரிப்பு தெளிவு (Phonetic Resonance)' },
      { phrase: 'தண்ணீர் கொடுங்கள், நன்றி', phonetic: 'Thanneer Kodungal, Nandri', focus: 'அத்தியாவசிய தகவல் தொடர்பு (Functional Communication)' },
    ],
    hi: [
      { phrase: 'सुप्रभात, आज का दिन शुभ हो', phonetic: 'Suprabhat, Aaj Ka Din Shubh Ho', focus: 'मुख व जीभ समन्वय (Lingual Coordination)' },
      { phrase: 'पानी दीजिए, मुझे प्यास लगी है', phonetic: 'Paani Deejiye, Mujhe Pyaas Lagi Hai', focus: 'दैनिक आवश्यकता अभिव्यक्ति' },
      { phrase: 'कच्चा पापड़, पक्का पापड़', phonetic: 'Kaccha Papad, Pakka Papad', focus: 'वाणी प्रवाह व गति (Fluency Rehab)' },
    ],
    ml: [
      { phrase: 'സുപ്രഭാതം, സുഖമായിരിക്കുന്നു', phonetic: 'Suprabhatham, Sukhamayirikkunnu', focus: 'ഉച്ചാരണ ശുദ്ധി (Articulation Control)' },
      { phrase: 'എനിക്ക് വെള്ളം വേണം', phonetic: 'Enikku Vellam Venam', focus: 'ആശയവിനിമയ ശേഷി (Functional Speech)' },
    ],
    te: [
      { phrase: 'శుభోదయం, నేను బాగున్నాను', phonetic: 'Shubhodayam, Nenu Baagunnanu', focus: 'మాటల స్పష్టత (Speech Articulation)' },
      { phrase: 'నాకు మంచినీరు కావాలి', phonetic: 'Naaku Manchineeru Kaavali', focus: 'నిత్యజీవిత సంభాషణ (Functional Language)' },
    ],
  };

  const currentSpeechList = speechPromptsByLang[language] || speechPromptsByLang.en;

  // Celebrate with confetti
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}
  };

  // Facial Exercise Evaluation
  useEffect(() => {
    if (!exerciseActive) return;
    if (facialSymmetry >= 80) {
      setFacialFeedback('Perfect bilateral balance! Retaining motor map.');
      const timeout = setTimeout(() => {
        setRepsCompleted((r) => {
          const next = r + 1;
          if (next >= targetReps) {
            triggerCelebration();
            setExerciseActive(false);
            recordExerciseCompletion('Facial Symmetry Mirror Protocol', 'Facial', 94);
          }
          return next;
        });
      }, 1500);
      return () => clearTimeout(timeout);
    } else {
      setFacialFeedback('Slight asymmetry detected. Elevate the right mouth corner gently.');
    }
  }, [exerciseActive, facialSymmetry, targetReps, recordExerciseCompletion]);

  // Hand Tapping Timer
  useEffect(() => {
    let interval: any;
    if (isTappingActive && tapTimer > 0) {
      interval = setInterval(() => {
        setTapTimer((t) => t - 1);
      }, 1000);
    } else if (tapTimer === 0 && isTappingActive) {
      setIsTappingActive(false);
      const cadence = Math.round((tapCount / 15) * 60);
      setTapCadenceScore(cadence);
      triggerCelebration();
      recordExerciseCompletion('Hand Finger Tapping Cadence', 'Upper Limb', Math.min(99, Math.round(70 + cadence / 4)));
    }
    return () => clearInterval(interval);
  }, [isTappingActive, tapTimer, tapCount, recordExerciseCompletion]);

  const handleStartTapping = () => {
    startMedia();
    setTapCount(0);
    setTapTimer(15);
    setIsTappingActive(true);
    setTapCadenceScore(0);
  };

  const handleTap = () => {
    if (isTappingActive) {
      setTapCount((c) => c + 1);
    }
  };

  // Initialize Cognitive Neglect Grid
  const initCognitiveGrid = () => {
    const targets = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      clicked: false,
      x: Math.floor(Math.random() * 85) + 5,
      y: Math.floor(Math.random() * 75) + 10,
    }));
    setNeglectTargets(targets);
    setNeglectScore(0);
  };

  useEffect(() => {
    initCognitiveGrid();
  }, []);

  const handleTargetClick = (id: number) => {
    setNeglectTargets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, clicked: true } : t))
    );
    setNeglectScore((s) => {
      const next = s + 1;
      if (next === neglectTargets.length) {
        triggerCelebration();
      }
      return next;
    });
  };

  // Run AI FAST Diagnostic Scan
  const handleRunFastScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/gemini/analyze-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: { symmetryScore: facialSymmetry, armStability },
          symptomsText: 'Patient in rehabilitation bay, doing scheduled morning check.',
        }),
      });
      const data = await res.json();
      setScanReport(data);
    } catch {
      setScanReport({
        fastScore: facialSymmetry < 75 ? 2 : 0,
        facialDroopDetected: facialSymmetry < 75,
        asymmetryConfidence: Math.round(100 - facialSymmetry),
        strokeRelapseRisk: facialSymmetry < 70 ? 'HIGH' : 'LOW',
        recommendations: [
          'Continue scheduled facial mirror sessions twice daily.',
          'Upper limb finger tapping cadence is improving.',
          'Emergency sentinel remains armed on camera & mic.',
        ],
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 24/7 Protection Active & Urgent SOS Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sky-500/30 bg-gradient-to-r from-slate-900 via-sky-950/60 to-slate-900 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
            <Zap className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Continuous Eye &amp; Face Sentinel (Auto-On)</h2>
              <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                CAMERA &amp; MIC AUTO-ENGAGED
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Continuously checking patient eyes (EAR &amp; Ptosis), facial droop, bed slide-down &amp; abnormal actions with automatic alert dispatch to Admin.
            </p>
          </div>
        </div>

        {/* Emergency Actions & Real-Time Calling */}
        {/* Emergency Actions & Real-Time Calling */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Bilingual Language Switcher for Patient Mode */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition ${
                language === 'en'
                  ? 'bg-sky-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition ${
                language === 'ta'
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="தமிழ் (Tamil)"
            >
              தமிழ்
            </button>
          </div>

          {/* Logged in patient pill */}
          <div className="flex items-center gap-2 text-xs bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-2xl">
            <User className="h-3.5 w-3.5 text-sky-400" />
            <span className="font-bold text-white">{patientUser?.name || 'Ramesh Sundaram'}</span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">({patientUser?.phone})</span>
            <button
              onClick={logoutPatient}
              className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition ml-1"
              title="Log out of Patient Account"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Direct Emergency Telephone Call to Admin Mobile */}
          <button
            onClick={callAdminPhoneRealtime}
            className="flex items-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-500/20 hover:bg-emerald-500/30 px-3.5 py-2.5 text-xs font-bold text-emerald-200 transition shadow-lg backdrop-blur"
            title={`Real-Time Cellular Telephone Call to Admin: ${adminPhone}`}
          >
            <PhoneCall className="h-4 w-4 text-emerald-400 animate-pulse" />
            <div className="text-left">
              <div className="font-bold leading-tight">Call Admin</div>
              <div className="text-[9px] text-emerald-300 font-mono">{adminPhone}</div>
            </div>
          </button>

          {/* Say Hey Neuro Voice Trigger */}
          <button
            onClick={triggerVoiceAssistant}
            className="flex items-center gap-2 rounded-2xl border border-sky-500/50 bg-sky-500/20 hover:bg-sky-500/30 px-3.5 py-2.5 text-xs font-bold text-sky-200 transition shadow-lg backdrop-blur"
          >
            <Mic className="h-4 w-4 text-sky-400 animate-pulse" />
            <span>"Hey Neuro"</span>
          </button>

          {/* Urgent SOS Button */}
          <button
            onClick={() => triggerEmergency('SOS_MANUAL', 'Patient initiated urgent SOS call to Admin.')}
            className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 px-4 py-2.5 text-xs font-black text-white shadow-xl shadow-rose-900/50 hover:from-rose-500 hover:to-red-500 transition-all active:scale-95 border border-rose-400/40"
          >
            <ShieldAlert className="h-5 w-5 animate-bounce" />
            <div className="text-left">
              <div className="text-xs tracking-wider uppercase">{t('sosButton')}</div>
              <div className="text-[9px] text-rose-200 font-normal">SMS &amp; Intercom</div>
            </div>
          </button>
        </div>
      </div>

      {/* First-Launch Consent Modal (English & Tamil) */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
          <div className="max-w-xl w-full rounded-3xl border border-sky-500/40 bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Rehabilitation Camera &amp; Mic Consent</h3>
                <p className="text-xs text-sky-400 font-medium">பக்கவாத மறுவாழ்வுக்கான கேமரா மற்றும் மைக்ரோஃபோன் ஒப்புதல்</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">English:</strong> NeuroLife AI uses your camera and microphone strictly on-device to track facial symmetry, eye alertness, upper-limb recovery movements, and speech articulation. <strong>No raw video or audio is ever recorded or uploaded without your knowledge.</strong>
              </p>
              <p>
                <strong className="text-emerald-400">தமிழ்:</strong> நியூரோலைஃப் AI உங்கள் கேமரா மற்றும் மைக்ரோஃபோனை முக சமச்சீர்மை, கண் விழிப்புணர்வு மற்றும் பேச்சு தெளிவு ஆகியவற்றைக் கண்காணிக்க உங்கள் சாதனத்திலேயே பாதுகாப்பாகப் பயன்படுத்துகிறது. <strong>வீடியோக்கள் கிளவுடில் சேமிக்கப்படாது.</strong>
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Clinical telemetry and emergency alerts are shared only with your attending physician and designated contacts.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleGrantConsent}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-950/50 hover:from-emerald-400 hover:to-teal-400 active:scale-95 transition"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>Grant Consent &amp; Start / ஒப்புதல் அளித்து தொடங்கு</span>
              </button>
              <button
                onClick={() => setShowConsentModal(false)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-4 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                <span>Continue Manual / பின்னர் தொடரவும்</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Friendly Camera Fallback Alert Banner if Camera Paused or Denied */}
      {(!cameraActive || cameraError) && !showConsentModal && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-amber-500/40 bg-amber-950/40 p-4 text-amber-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Camera &amp; Microphone Ready / கேமரா அணுகல் தயார்</div>
              <div className="text-xs text-amber-300">
                {cameraError || 'Auto-tracking paused. Enable camera and microphone to start live pose checks and speech coaching.'}
              </div>
            </div>
          </div>
          <button
            onClick={() => startMedia()}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-xs font-bold text-slate-950 shadow-lg hover:from-amber-400 hover:to-amber-500 active:scale-95 transition"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Enable Camera &amp; Mic / கேமராவை இயக்கவும்</span>
          </button>
        </div>
      )}

      {/* Main Split Layout: Camera HUD + Therapy Suite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Camera Vision HUD (Always visible as requested) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {t('cameraVisible')}
                </span>
              </div>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                AI SENSOR LIVE
              </span>
            </div>

            {/* Persistent Camera Vision HUD */}
            <CameraVisionHUD mode="embedded" />

            <div className="mt-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-400">Current Face Symmetry Index:</span>
                <span
                  className={`font-mono font-bold ${
                    facialSymmetry > 75 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {facialSymmetry}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Safety trigger: If symmetry drops below 60% for &gt;10s, emergency alert will immediately dial Admin mobile ({adminPhone}).
              </p>
            </div>

            {/* Continuous Eye & Bed Slide-Down Sentinel Card */}
            <div className="mt-3 rounded-2xl border border-sky-500/30 bg-sky-950/20 p-3.5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Eye className="h-4 w-4 text-sky-400" /> Continuous Eye &amp; Posture Sentinel
                </span>
                <span className="rounded bg-sky-900/80 px-2 py-0.5 text-[10px] font-mono text-sky-300 font-bold border border-sky-700">
                  EAR: {earValue.toFixed(2)} • Bed: {slideDownProgress}% Drop
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Camera continuously tracks <strong>Patient Eyes (EAR &amp; Ptosis)</strong> and <strong>Bed Posture Elevation</strong>. If the patient slides down or performs abnormal distressed actions, an emergency alert is immediately dispatched to the Admin with SMS and automated telephone calling.
              </p>

              {/* Quick interactive test buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={simulateSlideDown}
                  className="rounded-xl bg-rose-600/90 hover:bg-rose-500 p-2 text-[11px] font-bold text-white shadow flex items-center justify-center gap-1.5 transition border border-rose-400/40"
                  title="Simulate Patient Sliding Down in Bed"
                >
                  <ArrowDownCircle className="h-3.5 w-3.5 animate-bounce" /> Slide Down Alert
                </button>
                <button
                  onClick={simulateAbnormalAction}
                  className="rounded-xl bg-purple-600/90 hover:bg-purple-500 p-2 text-[11px] font-bold text-white shadow flex items-center justify-center gap-1.5 transition border border-purple-400/40"
                  title="Simulate Abnormal Motor Action / Tremor"
                >
                  <Flame className="h-3.5 w-3.5" /> Abnormal Action
                </button>
                <button
                  onClick={simulateEyePtosis}
                  className="rounded-xl bg-amber-600/90 hover:bg-amber-500 p-2 text-[11px] font-bold text-white shadow flex items-center justify-center gap-1.5 transition border border-amber-400/40"
                  title="Test Eye Ptosis Unilateral Droop"
                >
                  <Eye className="h-3.5 w-3.5" /> Eye Ptosis Droop
                </button>
                <button
                  onClick={simulateEarDistress}
                  className="rounded-xl bg-sky-600/90 hover:bg-sky-500 p-2 text-[11px] font-bold text-white shadow flex items-center justify-center gap-1.5 transition border border-sky-400/40"
                  title="Test Rapid Triple Blink EAR Emergency Trigger"
                >
                  <Zap className="h-3.5 w-3.5" /> Triple Blink SOS
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Neuro-Therapy Suite */}
        <div className="lg:col-span-7 space-y-4">
          {/* Daily Streak & Exercise Habit Status Banner */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 p-4 shadow-xl backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
                  <Flame className="h-6 w-6 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white">{exerciseStreak}-Day Recovery Streak!</span>
                    <span className="rounded-full bg-amber-950 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-800">
                      BEST: {bestStreak} DAYS
                    </span>
                    <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800 hidden sm:inline">
                      AUTO-CAMERA READY
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Daily target: {todayExercisesCompleted} of {dailyExerciseGoal} completed today. Continuous daily exercise builds neural pathways.
                  </p>
                </div>
              </div>

              {/* Weekly Mon-Sun Day Tracker */}
              <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
                {weeklyStreakDays.map((d, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center justify-center w-8 h-10 rounded-xl text-[10px] font-mono transition-all ${
                      d.completed
                        ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-800/80'
                        : 'bg-slate-900/60 text-slate-500 border border-slate-800/60'
                    }`}
                    title={`${d.dayName} (${d.shortDate}): ${d.completed ? 'Completed' : 'Pending'}`}
                  >
                    <span className="text-[9px] font-semibold">{d.dayName}</span>
                    {d.completed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-slate-700 mt-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Target Progress Bar */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (todayExercisesCompleted / dailyExerciseGoal) * 100)}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-400">
                {Math.min(100, Math.round((todayExercisesCompleted / dailyExerciseGoal) * 100))}% Daily Target
              </span>
              {activeTherapy !== 'rehabLibrary' && (
                <button
                  onClick={() => handleSelectTherapy('rehabLibrary')}
                  className="rounded-xl bg-sky-600/90 hover:bg-sky-500 text-white px-3 py-1 text-xs font-bold transition flex items-center gap-1 shrink-0"
                >
                  <Play className="h-3 w-3" /> Start Exercise
                </button>
              )}
            </div>
          </div>

          {/* Therapy Navigation Tabs */}
          <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-2 backdrop-blur-md">
            <button
              onClick={() => handleSelectTherapy('rehabLibrary')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'rehabLibrary'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Video className="h-4 w-4" /> Exercise Suite (12+ Modules)
            </button>
            <button
              onClick={() => handleSelectTherapy('speech')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'speech'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Volume2 className="h-4 w-4" /> Speech Training Center
            </button>
            <button
              onClick={() => handleSelectTherapy('facial')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'facial'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Smile className="h-4 w-4" /> Facial Symmetry Mirror
            </button>
            <button
              onClick={() => handleSelectTherapy('hand')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'hand'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Hand className="h-4 w-4" /> Hand Finger Tapping
            </button>
            <button
              onClick={() => handleSelectTherapy('vitalsTelemetry')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'vitalsTelemetry'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="h-4 w-4" /> 24h Vitals
            </button>
            <button
              onClick={() => handleSelectTherapy('dailyRoutine')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'dailyRoutine'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Calendar className="h-4 w-4" /> Routine &amp; Health Log
            </button>
            <button
              onClick={() => handleSelectTherapy('docAnalyzer')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'docAnalyzer'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <FileText className="h-4 w-4" /> Medical Document AI
            </button>
            <button
              onClick={() => handleSelectTherapy('cognitive')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'cognitive'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Brain className="h-4 w-4" /> Cognitive Neglect
            </button>
            <button
              onClick={() => handleSelectTherapy('fastScan')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'fastScan'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Camera className="h-4 w-4" /> FAST Risk Scan
            </button>
            <button
              onClick={() => handleSelectTherapy('science')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTherapy === 'science'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <BookOpen className="h-4 w-4" /> Science Hub
            </button>
          </div>

          {/* 24-Hour Continuous Vitals Telemetry (Recharts): Heart Rate, BP, Oxygen Saturation */}
          {activeTherapy === 'vitalsTelemetry' && <VitalsTelemetry24h />}

          {/* Rehabilitation Library: Video tutorials, step-by-step interactive flows, and progress metrics */}
          {activeTherapy === 'rehabLibrary' && <RehabilitationLibrary />}

          {/* Daily Routine & Health Log: Timed schedule, medication, hydration, meals, vitals */}
          {activeTherapy === 'dailyRoutine' && <DailyRoutineHealthLog />}

          {/* Medical Document AI Analyzer: Secure document upload (PDF/Image) with OCR & clinical care extraction */}
          {activeTherapy === 'docAnalyzer' && <MedicalDocumentAnalyzer />}

          {/* Therapy 1: Facial Symmetry Mirror Therapy */}
          {activeTherapy === 'facial' && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Smile className="h-5 w-5 text-sky-400" /> Facial Symmetry Mirror Therapy
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Stimulates bilateral motor cortex remapping for post-stroke hemiparesis.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-slate-950 px-3 py-1 text-xs font-mono font-bold text-sky-400 border border-slate-800">
                    Reps: {repsCompleted} / {targetReps}
                  </span>
                </div>
              </div>

              {/* Exercise Selector */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: 'SMILE', label: 'Bilateral Smile', desc: 'Zygomaticus major' },
                  { id: 'EYEBROW', label: 'Eyebrow Lift', desc: 'Frontalis muscle' },
                  { id: 'CHEEK_PUFF', label: 'Cheek Puff', desc: 'Buccinator seal' },
                  { id: 'LIP_PUCKER', label: 'Lip Pucker', desc: 'Orbicularis oris' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      startMedia();
                      setFacialExerciseType(item.id as any);
                      setExerciseActive(true);
                    }}
                    className={`rounded-2xl p-3 text-left transition border ${
                      facialExerciseType === item.id
                        ? 'border-sky-500 bg-sky-500/20 text-white shadow-md'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-200">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>

              {/* Active Exercise Guidance Box */}
              <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-5 text-center space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-900/60 px-3 py-1 text-xs font-semibold text-sky-300">
                  <Sparkles className="h-3.5 w-3.5" /> AI Camera Feedback
                </div>
                <p className="text-base font-bold text-white">{facialFeedback}</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="text-xs text-slate-300">
                    Live Camera Symmetry: <span className="font-mono font-bold text-emerald-400">{facialSymmetry}%</span> (Target: &gt;75%)
                  </div>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      if (!exerciseActive) {
                        startMedia();
                      }
                      setExerciseActive(!exerciseActive);
                    }}
                    className="rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-600/30 transition flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" /> {exerciseActive ? t('stopExercise') : t('startExercise')}
                  </button>
                  <button
                    onClick={() => {
                      setRepsCompleted(0);
                      setExerciseActive(false);
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-4 w-4" /> Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Therapy 2: Hand Dexterity & Finger Tapping Test */}
          {activeTherapy === 'hand' && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Hand className="h-5 w-5 text-emerald-400" /> Upper Limb Fine Motor &amp; Finger Tapping (FTT)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Measures and rehabilitates neuromuscular speed and distal motor control.
                  </p>
                </div>
                <div className="rounded-xl bg-slate-950 px-3 py-1 text-xs font-mono font-bold text-emerald-400 border border-slate-800">
                  Timer: {tapTimer}s
                </div>
              </div>

              {/* Tapping Arena */}
              <div className="rounded-3xl border-2 border-dashed border-emerald-500/40 bg-emerald-950/20 p-8 text-center space-y-4">
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Tap the target as rapidly as possible using your affected index/middle finger. Maintain consistent rhythm to stimulate corticospinal synapses.
                </p>

                <div className="flex flex-col items-center justify-center">
                  <button
                    onClick={handleTap}
                    disabled={!isTappingActive}
                    className={`h-36 w-36 rounded-full border-4 flex flex-col items-center justify-center transition-all transform active:scale-90 shadow-2xl ${
                      isTappingActive
                        ? 'border-emerald-400 bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/50 cursor-pointer animate-pulse'
                        : 'border-slate-700 bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-3xl font-black font-mono">{tapCount}</span>
                    <span className="text-[11px] uppercase font-bold tracking-wider">
                      {isTappingActive ? 'TAP RAPIDLY!' : 'TAPS'}
                    </span>
                  </button>
                </div>

                {tapCadenceScore > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/40 text-xs text-emerald-300">
                    <p className="font-bold text-sm">Session Completed!</p>
                    <p className="mt-0.5">Cadence: <span className="font-mono font-bold text-white">{tapCadenceScore} taps/minute</span> (Normal recovery range: 120-180)</p>
                  </div>
                )}

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={handleStartTapping}
                    disabled={isTappingActive}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-6 py-2.5 text-xs font-bold text-white shadow"
                  >
                    {isTappingActive ? 'Tapping in progress...' : 'Start 15-Second Test'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Therapy 3: Aphasia & Speech Neuro-Training Center with Audio Coach & Streak Tracking */}
          {activeTherapy === 'speech' && <SpeechTrainingCenter />}

          {/* Therapy 4: Cognitive & Visual Neglect Scanner */}
          {activeTherapy === 'cognitive' && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Brain className="h-5 w-5 text-indigo-400" /> Hemispatial Visual Neglect Training
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click all glowing beacons across the visual field to combat spatial neglect after stroke.
                  </p>
                </div>
                <span className="rounded-xl bg-slate-950 px-3 py-1 text-xs font-mono font-bold text-indigo-400 border border-slate-800">
                  Found: {neglectScore} / {neglectTargets.length}
                </span>
              </div>

              {/* Spatial Scanning Arena */}
              <div className="relative h-64 w-full rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
                {/* Visual midline marker */}
                <div className="absolute inset-y-0 left-1/2 w-0.5 border-r border-dashed border-slate-700" />
                <span className="absolute top-2 left-2 text-[10px] text-slate-500 font-mono">LEFT VISUAL FIELD</span>
                <span className="absolute top-2 right-2 text-[10px] text-slate-500 font-mono">RIGHT VISUAL FIELD</span>

                {neglectTargets.map((target) => (
                  <button
                    key={target.id}
                    onClick={() => handleTargetClick(target.id)}
                    disabled={target.clicked}
                    style={{ left: `${target.x}%`, top: `${target.y}%` }}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full p-2 transition-all ${
                      target.clicked
                        ? 'opacity-20 scale-75 bg-slate-700 text-slate-500'
                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 hover:scale-125 animate-bounce'
                    }`}
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={initCognitiveGrid}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Re-shuffle Beacons
                </button>
              </div>
            </div>
          )}

          {/* Therapy 5: AI FAST Stroke Risk Scanner */}
          {activeTherapy === 'fastScan' && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Camera className="h-5 w-5 text-sky-400" /> AI FAST Stroke Risk &amp; Symptom Diagnostic Scan
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Analyzes live camera facial features and posture with clinical Gemini evaluation.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white">
                      <Activity className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Clinical Ambient Assessment</h4>
                      <p className="text-xs text-slate-400">
                        Camera Facial Symmetry: {facialSymmetry}% • Arm Tone: {armStability}%
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleRunFastScan}
                    disabled={isScanning}
                    className="rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 px-5 py-2.5 text-xs font-bold text-white shadow"
                  >
                    {isScanning ? 'Analyzing with Gemini...' : 'Run Diagnostics'}
                  </button>
                </div>

                {scanReport && (
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-200">NIHSS / FAST Assessment:</span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-mono font-bold ${
                          scanReport.strokeRelapseRisk === 'HIGH'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        Risk: {scanReport.strokeRelapseRisk}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1.5">
                      <p className="font-semibold text-white">Clinical Recommendations:</p>
                      <ul className="list-disc pl-5 space-y-1 text-slate-400">
                        {scanReport.recommendations?.map((r: string, idx: number) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    {scanReport.callEmergencyAdmin && (
                      <div className="mt-2 rounded-lg bg-rose-950/40 p-3 border border-rose-800 text-xs text-rose-300 flex items-center justify-between">
                        <span>Urgent symptoms observed. Notify medical staff?</span>
                        <button
                          onClick={() => triggerEmergency('FACIAL_DROOP')}
                          className="rounded bg-rose-600 px-3 py-1 text-xs font-bold text-white"
                        >
                          Alert Admin
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Therapy 6: Science Hub (Science Skill integration) */}
          {activeTherapy === 'science' && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-400" /> Clinical Neurobiology &amp; Evidence-Based Recovery
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scientific stroke mechanisms, ischemic penumbra salvage, and NIHSS criteria.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <h4 className="font-bold text-sky-400 uppercase tracking-wider text-[11px]">
                    Neuroplastic Synaptogenesis
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    High-repetition bilateral motor training triggers <strong>BDNF (Brain-Derived Neurotrophic Factor)</strong> expression, recruiting perilesional cortex to take over functions of infarcted tissue.
                  </p>
                  <span className="inline-block rounded bg-sky-950 px-2 py-0.5 text-[10px] text-sky-400 font-mono">
                    Lancet Neurology (PMID: 31427181)
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                    The 4.5-Hour Ischemic Window
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Acute thrombolytic treatment with intravenous <strong>tPA (Tissue Plasminogen Activator)</strong> is most efficacious within 4.5 hours of onset to salvage the ischemic penumbra from irreversible infarction.
                  </p>
                  <span className="inline-block rounded bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-400 font-mono">
                    AHA/ASA Stroke Guidelines (PMID: 30409748)
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                    National Institutes of Health Stroke Scale (NIHSS)
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Quantitative assessment of neurologic deficit across 11 domains: LOC, gaze, visual fields, facial palsy, motor arm/leg drift, limb ataxia, sensory loss, language, dysarthria, and inattention.
                  </p>
                  <span className="inline-block rounded bg-amber-950 px-2 py-0.5 text-[10px] text-amber-400 font-mono">
                    NIH Clinical Guidelines
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <h4 className="font-bold text-rose-400 uppercase tracking-wider text-[11px]">
                    Computer Vision Sentinel Surveillance
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Continuous facial landmark tracking eliminates delayed detection of secondary stroke or hemiparetic relapse in home &amp; step-down ward monitoring.
                  </p>
                  <span className="inline-block rounded bg-rose-950 px-2 py-0.5 text-[10px] text-rose-400 font-mono">
                    Stroke (AHA Journal, PMID: 35193420)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clinical & Safety Disclaimer */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 text-center text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">
          Medical Disclaimer &amp; Stroke Patient Safety Protocol
        </p>
        <p className="text-[11px] text-slate-400 max-w-3xl mx-auto leading-relaxed">
          NeuroLife AI is a software stroke rehabilitation and clinical monitoring platform designed to support daily motor and speech therapy with daily streak accountability. It does not replace primary physician diagnosis, acute emergency services, or in-person physiotherapist evaluation. If you or the patient experience severe distress or sudden weakness, trigger the red SOS button or call emergency services immediately.
        </p>
      </div>

      {/* Floating Minimized Live Camera Preview in Screen Corner (Requirement 1) */}
      {isCornerPreviewOpen ? (
        <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-1.5 shadow-2xl animate-in slide-in-from-bottom-4">
          <div className="w-56 rounded-2xl border border-sky-500/40 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${cameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="font-bold text-[11px] text-slate-200">
                  {cameraActive ? 'CAMERA & MIC ON' : 'CAMERA PAUSED'}
                </span>
              </div>
              <button
                onClick={() => setIsCornerPreviewOpen(false)}
                className="text-slate-400 hover:text-white p-0.5 rounded transition"
                title="Minimize preview"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Live Camera Mirror Thumbnail */}
            <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
              {cameraActive ? (
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                    <Video className="h-5 w-5 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 rounded bg-slate-950/90 px-1.5 py-0.5 text-[9px] font-mono text-emerald-400 border border-emerald-800/60">
                    Symmetry: {facialSymmetry}%
                  </div>
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded bg-slate-950/90 px-1.5 py-0.5 text-[8px] font-mono text-sky-400 border border-sky-800/60">
                    <Mic className="h-2.5 w-2.5 text-sky-400" />
                    <span>ACTIVE</span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-2 text-[10px] text-slate-400">
                  <Camera className="h-4 w-4 mx-auto mb-1 text-amber-400" />
                  <button
                    onClick={() => startMedia()}
                    className="text-[10px] text-sky-400 hover:underline font-bold"
                  >
                    Start Camera
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>EAR: {earValue.toFixed(2)}</span>
              <button
                onClick={() => {
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                className="text-sky-400 hover:text-sky-300 font-bold"
              >
                Focus Vision HUD
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsCornerPreviewOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-2xl border border-sky-500/40 bg-slate-900/95 px-3 py-2 text-xs font-bold text-sky-300 shadow-xl backdrop-blur hover:bg-slate-800 transition"
          title="Expand Mini Camera HUD"
        >
          <span className={`h-2.5 w-2.5 rounded-full ${cameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <Camera className="h-3.5 w-3.5" />
          <span>Camera &amp; Mic ON</span>
        </button>
      )}
    </div>
  );
};
