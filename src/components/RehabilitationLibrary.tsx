import React, { useState, useEffect, useRef } from 'react';
import { useNeuro } from '../context/NeuroContext';
import {
  Play,
  CheckCircle2,
  Clock,
  Award,
  Video,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Sparkles,
  BookOpen,
  Pause,
  Flame,
  Camera,
  Activity,
  Smile,
  Hand,
  Volume2,
  Shield,
  Eye,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnimatedExerciseViewer } from './AnimatedExerciseViewer';

export interface ExerciseModule {
  id: string;
  title: string;
  category: 'Upper Limb' | 'Facial Palsy' | 'Speech & Aphasia' | 'Balance & Gait' | 'Fine Motor' | 'Swallowing & Breathing';
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  videoPoster: string;
  description: string;
  steps: string[];
  targetMuscleOrNerve: string;
  completedCount: number;
  clinicalNote: string;
}

export const RehabilitationLibrary: React.FC = () => {
  const {
    startMedia,
    cameraActive,
    videoRef,
    facialSymmetry,
    armStability,
    recordExerciseCompletion,
    exerciseStreak,
    todayExercisesCompleted,
    dailyExerciseGoal,
    language,
    t
  } = useNeuro();

  // Comprehensive 12+ stroke rehabilitation exercises
  const [modules, setModules] = useState<ExerciseModule[]>([
    {
      id: 'ex-1',
      title: 'Upper Limb Reach & Grasp (Bobath Approach)',
      category: 'Upper Limb',
      duration: '8 mins',
      difficulty: 'Beginner',
      videoPoster: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
      description: 'Active-assisted reaching to overcome flexor spasticity and rebuild shoulder girdle stability after MCA stroke.',
      steps: [
        'Interlace fingers with the unaffected hand gently supporting the paretic hand.',
        'Slowly elevate both arms straight ahead towards eye level over 4 seconds.',
        'Gently reach forward as if touching a point 30cm away, holding for 3 seconds.',
        'Lower hands down with controlled breath expiration. Repeat 10 times.'
      ],
      targetMuscleOrNerve: 'Corticospinal tract & Anterior Deltoid',
      completedCount: 14,
      clinicalNote: 'Prevents internal shoulder rotation and flexor synergy post-stroke.'
    },
    {
      id: 'ex-2',
      title: 'Bilateral Facial Motor Mirror Re-education',
      category: 'Facial Palsy',
      duration: '6 mins',
      difficulty: 'Beginner',
      videoPoster: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
      description: 'Mirror feedback protocol activating cranial nerve VII branches to reduce unilateral hemifacial droop.',
      steps: [
        'Center face in front of the live camera HUD and look straight ahead.',
        'Slowly raise both eyebrows together, observing forehead furrow symmetry.',
        'Smile showing teeth, focusing on elevating the affected mouth corner.',
        'Pucker lips as if blowing a gentle candle whistle. Hold 5 seconds and relax.'
      ],
      targetMuscleOrNerve: 'Cranial Nerve VII (Facial Nerve)',
      completedCount: 22,
      clinicalNote: 'Re-establishes cortical sensory-motor loops through visual mirror feedback.'
    },
    {
      id: 'ex-3',
      title: 'Finger Tapping Rhythm & Precision Grip',
      category: 'Fine Motor',
      duration: '10 mins',
      difficulty: 'Intermediate',
      videoPoster: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      description: 'Dissociated finger movements to combat synergistic flexion patterns and regain daily buttoning/holding.',
      steps: [
        'Rest palm flat on a firm table or lap.',
        'Tap index finger 10 times independently without moving other fingers.',
        'Perform thumb-to-fingertip opposition sequence: index, middle, ring, little.',
        'Pick up a light small object (e.g. coin or dice) using pincer grasp and release.'
      ],
      targetMuscleOrNerve: 'Opponens Pollicis & Flexor Digitorum Superficialis',
      completedCount: 9,
      clinicalNote: 'Critical for regaining independent Activities of Daily Living (ADLs).'
    },
    {
      id: 'ex-4',
      title: 'Sit-to-Stand Weight Shift & Postural Stability',
      category: 'Balance & Gait',
      duration: '12 mins',
      difficulty: 'Intermediate',
      videoPoster: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      description: 'Promotes symmetrical weight bearing through the hemiparetic lower extremity to prevent falls.',
      steps: [
        'Sit on a firm chair with feet shoulder-width apart and equal weight under both heels.',
        'Lean upper trunk forward at the hips ("nose over toes").',
        'Push evenly through both legs to stand upright without pulling on furniture.',
        'Pause for 3 seconds in standing balance, then slowly sit back down with control.'
      ],
      targetMuscleOrNerve: 'Quadriceps Femoris & Gluteus Maximus',
      completedCount: 7,
      clinicalNote: 'Enhances quadriceps extensor tone and decreases asymmetric reliance on unaffected limb.'
    },
    {
      id: 'ex-5',
      title: 'Aphasia Melodic Intonation & Tongue Articulation',
      category: 'Speech & Aphasia',
      duration: '7 mins',
      difficulty: 'Beginner',
      videoPoster: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&w=800&q=80',
      description: 'Leverages right-hemisphere musical cadence to bypass left frontal Broca injury and restore functional communication.',
      steps: [
        'Tap hand rhythmically to a 2-beat cadence on table.',
        'Sing-hum vowel sounds: "Ahhh", "Ooooh", "Eeeee".',
        'Chant high-frequency functional words: "Water please", "Thank you".',
        'Practice tongue tip sweeps from left to right corner of mouth.'
      ],
      targetMuscleOrNerve: 'Hypoglossal Nerve (CN XII) & Perisylvian Language Loop',
      completedCount: 18,
      clinicalNote: 'Melodic Intonation Therapy (MIT) recruits contralateral homologue cortex.'
    },
    {
      id: 'ex-6',
      title: 'Scapular Mobilization & Paretic Towel Slide',
      category: 'Upper Limb',
      duration: '9 mins',
      difficulty: 'Beginner',
      videoPoster: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
      description: 'Towel-assisted active-assistive glenohumeral sliding to prevent painful post-stroke shoulder subluxation.',
      steps: [
        'Place folded hand towel on a smooth table with both hands resting on top.',
        'Lean trunk forward, gently sliding the towel forward as far as comfortable.',
        'Perform gentle circular clockwise circles using core trunk movement.',
        'Slide towel diagonally towards the affected side, stretching latissimus dorsi.'
      ],
      targetMuscleOrNerve: 'Serratus Anterior & Rhomboid Major',
      completedCount: 11,
      clinicalNote: 'Reduces risk of complex regional pain syndrome (CRPS) in paretic shoulder.'
    },
    {
      id: 'ex-7',
      title: 'Diadochokinetic Pa-Ta-Ka Syllable Velocity',
      category: 'Speech & Aphasia',
      duration: '6 mins',
      difficulty: 'Intermediate',
      videoPoster: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=800&q=80',
      description: 'Diadochokinetic (DDK) syllable alternating training to rebuild cranial nerves VII, IX, X, and XII articulation.',
      steps: [
        'Inhale deeply and produce "Pa-Pa-Pa-Pa" as rapidly and clearly as possible (Bilabial).',
        'Switch to "Ta-Ta-Ta-Ta" focusing on tongue tip to alveolar ridge contact (Lingual).',
        'Produce "Ka-Ka-Ka-Ka" engaging posterior soft palate and velopharynx (Velar).',
        'Combine into smooth sequence: "Pa - Ta - Ka, Pa - Ta - Ka". Repeat 8 cycles.'
      ],
      targetMuscleOrNerve: 'Cranial Nerves VII, IX, X, XII',
      completedCount: 15,
      clinicalNote: 'Essential test and rehabilitation metric for post-stroke dysarthria clarity.'
    },
    {
      id: 'ex-8',
      title: 'Ankle Dorsiflexion & Foot Drop Prevention',
      category: 'Balance & Gait',
      duration: '8 mins',
      difficulty: 'Intermediate',
      videoPoster: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      description: 'Active peroneal nerve stimulation to elevate toes and prevent tripping during swing phase of hemiplegic gait.',
      steps: [
        'Sit with feet resting flat on the floor in front of you.',
        'Keep heels firmly anchored while lifting toes and forefoot up towards shins.',
        'Hold dorsiflexed position for 3 seconds, observing anterior tibialis contraction.',
        'Perform passive towel stretch around ball of foot if spasticity resists lift.'
      ],
      targetMuscleOrNerve: 'Deep Fibular (Peroneal) Nerve & Tibialis Anterior',
      completedCount: 8,
      clinicalNote: 'Decreases circumduction gait and toe drag risk.'
    },
    {
      id: 'ex-9',
      title: 'Mendelsohn Swallowing & Laryngeal Elevation',
      category: 'Swallowing & Breathing',
      duration: '5 mins',
      difficulty: 'Beginner',
      videoPoster: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      description: 'Dysphagia therapy to prolong upper esophageal sphincter opening and prevent silent aspiration in stroke patients.',
      steps: [
        'Place fingertips lightly on the Adam’s apple (thyroid notch) to feel motion.',
        'Initiate a swallow and feel the voice box rise to its peak elevation.',
        'Squeeze throat muscles to hold the voice box at peak elevation for 2 seconds.',
        'Release and exhale gently. Rest 5 seconds between each repetition. Repeat 6 times.'
      ],
      targetMuscleOrNerve: 'Suprahyoid Muscles & Vagus Nerve (CN X)',
      completedCount: 12,
      clinicalNote: 'Clinically proven to reduce post-stroke aspiration pneumonia.'
    },
    {
      id: 'ex-10',
      title: 'PNF Bilateral Upper Extremity Diagonal Chop',
      category: 'Upper Limb',
      duration: '10 mins',
      difficulty: 'Advanced',
      videoPoster: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=800&q=80',
      description: 'Proprioceptive Neuromuscular Facilitation (PNF) diagonal patterns crossing the midline to enhance motor recovery.',
      steps: [
        'Clasp hands together above unaffected shoulder (Diagonal 1 start position).',
        'Rotate trunk while moving clasped arms diagonally downward towards opposite hip.',
        'Open fingers and extend wrists at the bottom of the movement.',
        'Reverse the movement diagonally upward, tracking hands with eyes.'
      ],
      targetMuscleOrNerve: 'Spinal Accessory Nerve & Oblique Abdominals',
      completedCount: 6,
      clinicalNote: 'Recruits trunk rotation and inter-hemispheric sensorimotor synchronization.'
    },
    {
      id: 'ex-11',
      title: 'Cheek Puff & Lip Sphincter Pressure Seal',
      category: 'Facial Palsy',
      duration: '5 mins',
      difficulty: 'Beginner',
      videoPoster: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      description: 'Buccinator and orbicularis oris muscle conditioning to prevent food pocketing and oral drooling.',
      steps: [
        'Take a moderate breath through nose and close lips firmly together.',
        'Puff air into both cheeks, holding positive pressure without air escaping corners.',
        'Gently tap the affected cheek with fingers while maintaining air seal.',
        'Transfer air from left cheek to right cheek 5 times. Relax and repeat.'
      ],
      targetMuscleOrNerve: 'Buccinator & Orbicularis Oris (CN VII)',
      completedCount: 16,
      clinicalNote: 'Prevents sulcus food stasis and enhances facial symmetry.'
    },
    {
      id: 'ex-12',
      title: 'Diaphragmatic Deep Breathing with Sustained Phonation',
      category: 'Swallowing & Breathing',
      duration: '6 mins',
      difficulty: 'Beginner',
      videoPoster: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
      description: 'Rebuilds vital lung capacity, autonomic vagal tone, and subglottic pressure for sustained speech volume.',
      steps: [
        'Place one hand on upper chest and one hand over the abdomen.',
        'Inhale slowly through nose over 4 seconds, feeling abdomen expand outward.',
        'Sustain steady vocal hum "Mmmmm" on expiration over 6 to 8 seconds.',
        'Observe rhythmic heart rate stabilization. Perform 10 breath cycles.'
      ],
      targetMuscleOrNerve: 'Phrenic Nerve (C3-C5) & Vagus Nerve (CN X)',
      completedCount: 19,
      clinicalNote: 'Boosts parasympathetic recovery and strengthens subglottal pressure.'
    }
  ]);

  // Selected Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const categories = [
    { id: 'ALL', label: 'All Modules' },
    { id: 'Upper Limb', label: 'Upper Limb' },
    { id: 'Facial Palsy', label: 'Facial Palsy' },
    { id: 'Speech & Aphasia', label: 'Speech & Aphasia' },
    { id: 'Balance & Gait', label: 'Balance & Gait' },
    { id: 'Fine Motor', label: 'Fine Motor' },
    { id: 'Swallowing & Breathing', label: 'Swallowing & Breathing' }
  ];

  const filteredModules = selectedCategory === 'ALL'
    ? modules
    : modules.filter((m) => m.category === selectedCategory);

  const [activeModule, setActiveModule] = useState<ExerciseModule>(modules[0]);
  const [isPlayingFlow, setIsPlayingFlow] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [stepTimer, setStepTimer] = useState<number>(30);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showCameraGuide, setShowCameraGuide] = useState<boolean>(true);

  // AUTO-ENGAGE CAMERA ON EXERCISE START
  // Crucial User Requirement: "when exercise feature was started it automaticaly on camera"
  const handleStartFlow = (module: ExerciseModule) => {
    setActiveModule(module);
    setCurrentStepIdx(0);
    setStepTimer(30);
    setIsPlayingFlow(true);
    setIsPaused(false);

    // Automatically activate camera and microphone
    startMedia();
  };

  // Step countdown timer
  useEffect(() => {
    let interval: any;
    if (isPlayingFlow && !isPaused && stepTimer > 0) {
      interval = setInterval(() => {
        setStepTimer((t) => t - 1);
      }, 1000);
    } else if (stepTimer === 0 && isPlayingFlow) {
      if (currentStepIdx < activeModule.steps.length - 1) {
        setCurrentStepIdx((idx) => idx + 1);
        setStepTimer(30);
      } else {
        // Exercise completed!
        handleCompleteExerciseSession();
      }
    }
    return () => clearInterval(interval);
  }, [isPlayingFlow, isPaused, stepTimer, currentStepIdx, activeModule]);

  // Handle completion and MAINTAIN DAILY STREAK
  const handleCompleteExerciseSession = (score: number = 94) => {
    setIsPlayingFlow(false);

    // Update local completed count
    setModules((prev) =>
      prev.map((m) =>
        m.id === activeModule.id ? { ...m, completedCount: m.completedCount + 1 } : m
      )
    );

    // Map category to ExerciseLogItem category
    const catMap: Record<string, 'Facial' | 'Upper Limb' | 'Speech' | 'Balance'> = {
      'Upper Limb': 'Upper Limb',
      'Facial Palsy': 'Facial',
      'Speech & Aphasia': 'Speech',
      'Balance & Gait': 'Balance',
      'Fine Motor': 'Upper Limb',
      'Swallowing & Breathing': 'Speech'
    };

    const targetCategory = catMap[activeModule.category] || 'Upper Limb';

    // Maintain daily streak!
    recordExerciseCompletion(activeModule.title, targetCategory, score);

    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
      });
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Streak Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sky-500/30 bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-xl shadow-sky-500/25">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Stroke Rehabilitation Video &amp; Exercise Suite</h2>
              <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                CAMERA AUTO-ON ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              12+ evidence-based neuromuscular, speech, facial, and balance exercises with auto-activated camera guidance and daily recovery streaks.
            </p>
          </div>
        </div>

        {/* Daily Recovery Streak Tracker */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-amber-500/40 bg-amber-950/60 px-4 py-2 text-center shadow">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Flame className="h-4 w-4 animate-bounce text-amber-400" />
              <span>Daily Streak</span>
            </div>
            <p className="text-xl font-black text-white font-mono">{exerciseStreak} Days</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Today's Goal</div>
            <p className="text-base font-bold text-emerald-400 font-mono">
              {todayExercisesCompleted} / {dailyExerciseGoal} Completed
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              selectedCategory === cat.id
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Dynamic Content: Animated Interactive Exercise Sentinel vs Catalog Browser */}
      {isPlayingFlow ? (
        <AnimatedExerciseViewer
          module={activeModule}
          currentStepIdx={currentStepIdx}
          videoRef={videoRef}
          cameraActive={cameraActive}
          facialSymmetry={facialSymmetry}
          armStability={armStability}
          language={language}
          exerciseStreak={exerciseStreak}
          onCompleteExercise={(score) => handleCompleteExerciseSession(score)}
          onExit={() => setIsPlayingFlow(false)}
          onNextStep={() => {
            if (currentStepIdx < activeModule.steps.length - 1) {
              setCurrentStepIdx((idx) => idx + 1);
              setStepTimer(30);
            } else {
              handleCompleteExerciseSession(95);
            }
          }}
          onPrevStep={() => {
            if (currentStepIdx > 0) {
              setCurrentStepIdx((idx) => idx - 1);
              setStepTimer(30);
            }
          }}
        />
      ) : (
        /* Main Split: Interactive Workout Player & Module Catalog */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Exercise Arena (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/95 shadow-2xl">
              {/* Visual Header / Poster with Big Start Button */}
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                <img
                  src={activeModule.videoPoster}
                  alt={activeModule.title}
                  className="h-full w-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="rounded-full bg-sky-950/90 px-3 py-1 text-xs font-semibold text-sky-400 border border-sky-800 backdrop-blur">
                    {activeModule.category}
                  </span>
                  <span className="rounded-full bg-slate-900/90 px-2.5 py-1 text-xs font-mono text-slate-300 border border-slate-800">
                    {activeModule.duration}
                  </span>
                  <span className="rounded-full bg-emerald-950/90 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-800 flex items-center gap-1">
                    <Camera className="h-3 w-3" /> Auto-Camera Ready
                  </span>
                </div>

                {/* Overlay Title */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-black text-white">{activeModule.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{activeModule.description}</p>
                </div>

                {/* Big Play Button Overlay */}
                <button
                  onClick={() => handleStartFlow(activeModule)}
                  className="absolute inset-0 flex items-center justify-center bg-slate-950/40 hover:bg-slate-950/20 transition group"
                  title="Click to Start Exercise & Auto-Engage Camera"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-600 text-white shadow-2xl shadow-sky-500/50 group-hover:scale-110 transition-transform">
                    <Play className="h-7 w-7 ml-1" />
                  </div>
                </button>
              </div>

              {/* Idle Module Preview Instructions */}
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Clinical Instructions &amp; Action Plan</h4>
                  <p className="text-xs text-slate-400 mt-1">{activeModule.clinicalNote}</p>
                </div>

                <div className="space-y-2">
                  {activeModule.steps.map((st, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 font-mono text-[10px] font-bold text-sky-400">
                        {idx + 1}
                      </span>
                      <span>{st}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                  <div className="text-xs text-slate-400">
                    Muscle / Pathway:{' '}
                    <strong className="text-emerald-400">{activeModule.targetMuscleOrNerve}</strong>
                  </div>

                  <button
                    onClick={() => handleStartFlow(activeModule)}
                    className="rounded-xl bg-sky-600 hover:bg-sky-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-600/30 flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" /> Start Exercise (Auto-Camera On)
                  </button>
                </div>
              </div>
            </div>
          </div>

        {/* Right Column: Exercise Catalog Browser (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Exercise Library ({filteredModules.length} Modules)
            </h3>
            <span className="text-[10px] text-sky-400 font-mono">Streak +1 Per Completion</span>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredModules.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setActiveModule(m);
                  setIsPlayingFlow(false);
                }}
                className={`group cursor-pointer rounded-2xl border p-3.5 transition-all ${
                  activeModule.id === m.id
                    ? 'border-sky-500 bg-slate-900 shadow-lg shadow-sky-950/40'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                        {m.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{m.duration}</span>
                      <span className="text-[10px] font-mono text-slate-400">({m.difficulty})</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1 group-hover:text-sky-300 transition-colors">
                      {m.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{m.description}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                      <CheckCircle2 className="h-3 w-3" /> {m.completedCount} done
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);
};
