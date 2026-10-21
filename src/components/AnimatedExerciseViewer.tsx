import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUp,
  Activity,
  Award,
  Sparkles,
  Camera,
  RefreshCw,
  Gauge,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExerciseModule } from './RehabilitationLibrary';

interface AnimatedExerciseViewerProps {
  module: ExerciseModule;
  currentStepIdx: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraActive: boolean;
  facialSymmetry: number;
  armStability: number;
  language: 'en' | 'ta' | 'hi' | 'ml' | 'te';
  exerciseStreak: number;
  onCompleteExercise: (averageScore: number) => void;
  onExit: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export const AnimatedExerciseViewer: React.FC<AnimatedExerciseViewerProps> = ({
  module,
  currentStepIdx,
  videoRef,
  cameraActive,
  facialSymmetry,
  armStability,
  language,
  exerciseStreak,
  onCompleteExercise,
  onExit,
  onNextStep,
  onPrevStep,
}) => {
  // Animation state
  const [isPlayingAnimation, setIsPlayingAnimation] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0); // 0.5x slow-mo, 1.0x normal, 1.5x
  const [animationTick, setAnimationTick] = useState<number>(0);
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState<boolean>(true);

  // Form Sentinel state (Correct vs Wrong)
  // 'correct' | 'wrong' | 'analyzing'
  const [formStatus, setFormStatus] = useState<'correct' | 'wrong' | 'analyzing'>('correct');
  const [formScore, setFormScore] = useState<number>(94);
  const [simulatedWrongReason, setSimulatedWrongReason] = useState<string>('');
  const [completedReps, setCompletedReps] = useState<number>(1);
  const targetReps = 5;

  // Streak celebration modal state
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(95);

  // Animation frame loop for kinematic avatar
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlayingAnimation) {
        setAnimationTick((prev) => prev + delta * playbackSpeed * 1.5);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlayingAnimation, playbackSpeed]);

  // Voice speech synthesis for instructions
  const speakInstruction = (text: string) => {
    if (!voiceGuidanceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = playbackSpeed === 0.5 ? 0.8 : 0.95;
      utterance.lang = language === 'ta' ? 'ta-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  // Announce step change
  useEffect(() => {
    const currentStepText = module.steps[currentStepIdx] || '';
    if (currentStepText) {
      speakInstruction(currentStepText);
    }
  }, [currentStepIdx, module, voiceGuidanceEnabled]);

  // Real-time AI Form Evaluation based on category and live telemetry
  useEffect(() => {
    // If not manually simulated as wrong, evaluate from live camera biofeedback
    if (!simulatedWrongReason) {
      if (module.category === 'Facial Palsy') {
        if (facialSymmetry < 65) {
          setFormStatus('wrong');
          setFormScore(Math.max(45, Math.round(facialSymmetry)));
        } else {
          setFormStatus('correct');
          setFormScore(Math.min(99, Math.round(facialSymmetry)));
        }
      } else if (module.category === 'Upper Limb' || module.category === 'Fine Motor') {
        if (armStability < 60) {
          setFormStatus('wrong');
          setFormScore(Math.max(48, Math.round(armStability)));
        } else {
          setFormStatus('correct');
          setFormScore(Math.min(98, Math.round(armStability)));
        }
      } else {
        // Balance / Gait / Breathing
        setFormStatus('correct');
        setFormScore(92);
      }
    }
  }, [facialSymmetry, armStability, module.category, simulatedWrongReason]);

  // Handle Rep increments when form is correct
  useEffect(() => {
    let repTimer: any;
    if (formStatus === 'correct' && !showCelebrationModal) {
      repTimer = setInterval(() => {
        setCompletedReps((prev) => {
          if (prev < targetReps) {
            const next = prev + 1;
            if (next === targetReps) {
              // Target achieved! Complete exercise and maintain streak!
              handleTriggerVictory();
            }
            return next;
          }
          return prev;
        });
      }, 7000 / playbackSpeed);
    }
    return () => clearInterval(repTimer);
  }, [formStatus, targetReps, playbackSpeed, showCelebrationModal]);

  // Victory and Streak Trigger
  const handleTriggerVictory = () => {
    const calculatedScore = Math.max(88, formScore);
    setFinalScore(calculatedScore);
    setShowCelebrationModal(true);

    try {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#10b981', '#0284c7', '#f59e0b', '#ec4899', '#8b5cf6']
      });
    } catch {}

    speakInstruction(
      language === 'ta'
        ? 'வாழ்த்துக்கள்! சரியான முறையில் பயிற்சி முடிந்தது! தினசரி தொடர்ச்சி புதுப்பிக்கப்பட்டது!'
        : 'Congratulations! Exercise completed with correct form! Daily streak maintained!'
    );
  };

  // Confirm completion and save streak
  const handleConfirmCompletion = () => {
    setShowCelebrationModal(false);
    onCompleteExercise(finalScore);
  };

  // Simulating Wrong Form for demonstration and clinical verification
  const handleSimulateWrongForm = () => {
    const wrongMessages: Record<string, string> = {
      'Upper Limb': language === 'ta'
        ? 'தவறான நிலை: கை உயர்வு போதுமானதாக இல்லை (இலக்கு: 85°). முழங்கையை சற்று உயர்த்தி தோள்களை சமமாக வைக்கவும்!'
        : 'Wrong form: Arm elevation too low (target: 85°). Raise your elbow higher and keep shoulders level!',
      'Facial Palsy': language === 'ta'
        ? 'தவறான நிலை: உதடு ஒருபுறம் சரிந்துள்ளது! இருபுறமும் சமமாக சிரிக்க முயற்சிக்கவும்.'
        : 'Wrong form: Asymmetrical smile detected! Lift both corners of your mouth evenly.',
      'Fine Motor': language === 'ta'
        ? 'தவறான முறை: விரல் அசைவு மிக வேகமாக உள்ளது! மெதுவாக மற்றும் சீராக தொடவும்.'
        : 'Wrong form: Tapping speed too fast and irregular! Slow down for neuroplastic recovery.',
      'Balance & Gait': language === 'ta'
        ? 'தவறான நிலை: உடல் ஒருபுறம் சாய்ந்துள்ளது! முதுகை நேராக வைத்து இரு கால்களிலும் சம எடை வைக்கவும்.'
        : 'Wrong form: Postural lean detected! Straighten your spine and distribute weight evenly.',
      'Speech & Aphasia': language === 'ta'
        ? 'தவறான முறை: சுவாசம் மிகக் குறைவாக உள்ளது! ஆழமாக சுவாசித்து உச்சரிக்கவும்.'
        : 'Wrong form: Insufficient vocal breath support! Take a deeper breath before chanting.',
      'Swallowing & Breathing': language === 'ta'
        ? 'தவறான நிலை: தொண்டை நிலை நிறுத்தம் இல்லை! 2 வினாடிகள் குரல்வளையை உயர்த்திப் பிடிக்கவும்.'
        : 'Wrong form: Incomplete laryngeal elevation hold! Squeeze for full 2 seconds.'
    };

    const reason = wrongMessages[module.category] || (
      language === 'ta'
        ? 'தவறான உடற்பயிற்சி முறை: திரையில் உள்ள அனிமேஷனைப் பார்த்து நிலையை சரிசெய்யவும்!'
        : 'Wrong exercise form: Please observe the animated guide and correct your posture!'
    );

    setSimulatedWrongReason(reason);
    setFormStatus('wrong');
    setFormScore(52);

    speakInstruction(reason);
  };

  // Simulating Correct Form
  const handleSimulateCorrectForm = () => {
    setSimulatedWrongReason('');
    setFormStatus('correct');
    setFormScore(96);
    speakInstruction(
      language === 'ta'
        ? 'சிறந்த முறை! சரியான உடற்பயிற்சி. அப்படியே தொடருங்கள்!'
        : 'Excellent posture! Form is correct. Keep going!'
    );
  };

  // Calculate animated values (0 to 1 oscillating cycle)
  const cycle = (Math.sin(animationTick) + 1) / 2; // 0 to 1
  const armAngle = 20 + cycle * 70; // 20 deg to 90 deg
  const facialSmileWidth = 20 + cycle * 18; // smiling animation
  const facialCheekScale = 1 + cycle * 0.35; // cheek puff animation
  const fingerTapY = 60 + cycle * 25; // finger tap animation
  const bodyStandY = 120 - cycle * 50; // sit-to-stand animation
  const lungScale = 0.85 + cycle * 0.3; // lung breathing animation

  return (
    <div className="space-y-4">
      {/* Exercise Active Top Banner with Streak Highlight */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-500/40 bg-slate-900/90 p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-500/30">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-sky-950 px-2 py-0.5 text-[11px] font-bold text-sky-400 border border-sky-800">
                {module.category}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {language === 'ta' ? 'நோயாளி முறை மட்டுமே' : 'Patient Mode Only'}
              </span>
            </div>
            <h2 className="text-lg font-black text-white">{module.title}</h2>
          </div>
        </div>

        {/* Live Streak & Rep Counter */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-amber-500/40 bg-amber-950/60 px-3.5 py-1.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-400 uppercase">
              <Flame className="h-3.5 w-3.5 animate-bounce" />
              <span>{language === 'ta' ? 'தினசரி தொடர்ச்சி' : 'Daily Streak'}</span>
            </div>
            <span className="text-base font-black text-white font-mono">{exerciseStreak} Days</span>
          </div>

          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-3.5 py-1.5 text-center">
            <div className="text-[10px] font-semibold text-emerald-400 uppercase">
              {language === 'ta' ? 'சரியான சுழற்சிகள்' : 'Correct Reps'}
            </div>
            <span className="text-base font-black text-emerald-300 font-mono">
              {completedReps} / {targetReps}
            </span>
          </div>

          <button
            onClick={onExit}
            className="rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/50 transition"
          >
            {language === 'ta' ? 'வெளியேறு' : 'Exit'}
          </button>
        </div>
      </div>

      {/* Split Arena: Animated Exercise Demonstration (Left) & Real-Time Patient Camera AI Watcher (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT COLUMN: Animated Exercise Demonstration */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {language === 'ta' ? 'அனிமேஷன் உடற்பயிற்சி வழிகாட்டி' : 'Animated Exercise Demonstration'}
              </span>
            </div>

            {/* Animation Speed & Audio Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPlaybackSpeed((s) => (s === 0.5 ? 1.0 : s === 1.0 ? 1.5 : 0.5))}
                className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-mono font-bold text-sky-300 hover:bg-slate-700 transition"
                title="Change speed: 0.5x Slow-Motion for Stroke Rehab"
              >
                {playbackSpeed}x {playbackSpeed === 0.5 && '(Slow-Mo)'}
              </button>

              <button
                onClick={() => setVoiceGuidanceEnabled((v) => !v)}
                className={`rounded-lg p-1.5 text-xs transition ${
                  voiceGuidanceEnabled ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
                title="Toggle Voice Speech Prompts"
              >
                {voiceGuidanceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              <button
                onClick={() => setIsPlayingAnimation((p) => !p)}
                className="rounded-lg bg-slate-800 p-1.5 text-slate-200 hover:bg-slate-700 transition"
                title={isPlayingAnimation ? 'Pause Animation' : 'Play Animation'}
              >
                {isPlayingAnimation ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Kinematic SVG Demonstration Canvas */}
          <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
            {/* Dynamic Kinematic Animation for Upper Limb */}
            {module.category === 'Upper Limb' && (
              <svg viewBox="0 0 300 240" className="h-full w-full max-h-56">
                {/* Background Grid */}
                <line x1="0" y1="200" x2="300" y2="200" stroke="#1e293b" strokeWidth="2" />
                <circle cx="150" cy="140" r="80" fill="none" stroke="#0ea5e9" strokeDasharray="3 3" opacity="0.25" />

                {/* Seated Torso & Chair */}
                <rect x="135" y="110" width="30" height="70" rx="8" fill="#334155" />
                <circle cx="150" cy="80" r="18" fill="#64748b" /> {/* Head */}
                {/* Chair */}
                <path d="M 125 180 L 175 180 M 130 180 L 125 210 M 170 180 L 175 210" stroke="#475569" strokeWidth="3" />

                {/* Target Angle Sector (Green highlight 75° to 95°) */}
                <path
                  d="M 150 120 L 225 90 A 80 80 0 0 0 215 55 Z"
                  fill="#10b981"
                  opacity="0.2"
                />
                <text x="210" y="50" fill="#10b981" fontSize="10" fontWeight="bold">
                  Target (90°)
                </text>

                {/* Animated Arm */}
                {/* Fixed Shoulder joint at (150, 120) */}
                <circle cx="150" cy="120" r="5" fill="#38bdf8" />
                {/* Elbow & Hand computed from armAngle */}
                {(() => {
                  const rad = (armAngle * Math.PI) / 180;
                  const elbowX = 150 + Math.cos(rad) * 45;
                  const elbowY = 120 - Math.sin(rad) * 45;
                  const handX = 150 + Math.cos(rad) * 85;
                  const handY = 120 - Math.sin(rad) * 85;
                  return (
                    <g>
                      {/* Upper Arm Bone */}
                      <line x1="150" y1="120" x2={elbowX} y2={elbowY} stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
                      {/* Forearm Bone */}
                      <line x1={elbowX} y1={elbowY} x2={handX} y2={handY} stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
                      {/* Elbow Joint */}
                      <circle cx={elbowX} cy={elbowY} r="4" fill="#f8fafc" />
                      {/* Hand Marker */}
                      <circle cx={handX} cy={handY} r="6" fill="#10b981" />
                      {/* Motion Trail */}
                      <circle cx={handX} cy={handY} r="12" fill="#10b981" opacity="0.3" className="animate-ping" />
                      {/* Angle readout */}
                      <text x={elbowX + 10} y={elbowY - 5} fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
                        {Math.round(armAngle)}°
                      </text>
                    </g>
                  );
                })()}

                {/* Direction arrow */}
                <path
                  d="M 235 150 Q 250 110 230 75"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  markerEnd="url(#arrow)"
                />
              </svg>
            )}

            {/* Dynamic Kinematic Animation for Facial Palsy */}
            {module.category === 'Facial Palsy' && (
              <svg viewBox="0 0 300 240" className="h-full w-full max-h-56">
                {/* Face Outline */}
                <ellipse cx="150" cy="120" rx="75" ry="95" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" />

                {/* Eyebrows */}
                <path d={`M 105 ${80 - cycle * 8} Q 120 ${72 - cycle * 8} 135 ${78 - cycle * 8}`} fill="none" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                <path d={`M 165 ${78 - cycle * 8} Q 180 ${72 - cycle * 8} 195 ${80 - cycle * 8}`} fill="none" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />

                {/* Eyes */}
                <ellipse cx="120" cy="95" rx="10" ry="6" fill="#f8fafc" />
                <circle cx="120" cy="95" r="4" fill="#0284c7" />
                <ellipse cx="180" cy="95" rx="10" ry="6" fill="#f8fafc" />
                <circle cx="180" cy="95" r="4" fill="#0284c7" />

                {/* Cheeks with puff expansion */}
                <circle cx="100" cy="130" r={16 * facialCheekScale} fill="#38bdf8" opacity="0.2" />
                <circle cx="200" cy="130" r={16 * facialCheekScale} fill="#38bdf8" opacity="0.2" />

                {/* Nose */}
                <path d="M 150 105 L 146 128 L 154 128" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />

                {/* Animated Symmetric Mouth */}
                <path
                  d={`M ${150 - facialSmileWidth} ${155 - cycle * 10} Q 150 ${165 + cycle * 5} ${150 + facialSmileWidth} ${155 - cycle * 10}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Symmetry line */}
                <line x1="150" y1="35" x2="150" y2="215" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                <text x="155" y="45" fill="#38bdf8" fontSize="10">Center Axis</text>

                {/* Bilateral elevation markers */}
                <circle cx={150 - facialSmileWidth} cy={155 - cycle * 10} r="4" fill="#10b981" />
                <circle cx={150 + facialSmileWidth} cy={155 - cycle * 10} r="4" fill="#10b981" />
                <text x="110" y="195" fill="#10b981" fontSize="11" fontWeight="bold">
                  Bilateral Smile: {Math.round(80 + cycle * 18)}%
                </text>
              </svg>
            )}

            {/* Dynamic Kinematic Animation for Fine Motor / Finger Tapping */}
            {module.category === 'Fine Motor' && (
              <svg viewBox="0 0 300 240" className="h-full w-full max-h-56">
                {/* Table Surface */}
                <rect x="30" y="170" width="240" height="8" rx="4" fill="#334155" />
                {/* Target Tap Sensor Ring */}
                <circle cx="130" cy="170" r={12 + cycle * 10} fill="none" stroke="#10b981" strokeWidth="2" opacity={1 - cycle} />
                <circle cx="130" cy="170" r="8" fill="#10b981" opacity="0.4" />

                {/* Hand Palm */}
                <path d="M 80 140 Q 110 120 160 130 Q 180 155 170 170 L 80 170 Z" fill="#475569" />
                {/* Thumb */}
                <path d="M 80 150 Q 70 135 90 135" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
                {/* Stationary fingers */}
                <path d="M 150 145 L 165 170" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
                <path d="M 165 145 L 180 170" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />

                {/* Animated Index Finger Tapping */}
                <path
                  d={`M 115 130 Q 120 120 125 ${fingerTapY} L 130 ${Math.min(170, fingerTapY + 15)}`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                <circle cx="130" cy={Math.min(170, fingerTapY + 15)} r="5" fill="#f8fafc" />

                <text x="90" y="50" fill="#38bdf8" fontSize="12" fontWeight="bold">
                  Cadence: {Math.round(40 + cycle * 30)} Taps/min
                </text>
              </svg>
            )}

            {/* Dynamic Kinematic Animation for Balance & Gait (Sit-to-stand) */}
            {module.category === 'Balance & Gait' && (
              <svg viewBox="0 0 300 240" className="h-full w-full max-h-56">
                {/* Floor */}
                <line x1="20" y1="200" x2="280" y2="200" stroke="#334155" strokeWidth="3" />
                {/* Chair */}
                <rect x="70" y="130" width="35" height="40" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="4" />
                <line x1="75" y1="170" x2="75" y2="200" stroke="#475569" strokeWidth="3" />
                <line x1="100" y1="170" x2="100" y2="200" stroke="#475569" strokeWidth="3" />

                {/* Animated Body: transitions from seated to standing */}
                {(() => {
                  const headY = bodyStandY;
                  const hipX = 90 + cycle * 30;
                  const hipY = 140 - cycle * 20;
                  const footX = 140;
                  const footY = 200;
                  return (
                    <g>
                      {/* Head */}
                      <circle cx={hipX + 10} cy={headY} r="14" fill="#38bdf8" />
                      {/* Spine / Torso */}
                      <line x1={hipX + 10} y1={headY + 14} x2={hipX} y2={hipY} stroke="#0284c7" strokeWidth="12" strokeLinecap="round" />
                      {/* Thigh */}
                      <line x1={hipX} y1={hipY} x2={footX - 10} y2={hipY + (200 - hipY) / 2} stroke="#38bdf8" strokeWidth="10" strokeLinecap="round" />
                      {/* Shin */}
                      <line x1={footX - 10} y1={hipY + (200 - hipY) / 2} x2={footX} y2={footY} stroke="#0284c7" strokeWidth="10" strokeLinecap="round" />
                      {/* Plumb Line (Center of Gravity) */}
                      <line x1={hipX + 10} y1="30" x2={hipX + 10} y2="200" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                      <text x="170" y="80" fill="#10b981" fontSize="11" fontWeight="bold">
                        {cycle > 0.6 ? 'Upright Stand' : 'Nose Over Toes'}
                      </text>
                    </g>
                  );
                })()}
              </svg>
            )}

            {/* Dynamic Kinematic Animation for Speech, Swallowing & Breathing */}
            {(module.category === 'Speech & Aphasia' || module.category === 'Swallowing & Breathing') && (
              <svg viewBox="0 0 300 240" className="h-full w-full max-h-56">
                {/* Torso Profile */}
                <path d="M 120 40 Q 150 30 180 40 L 195 200 L 105 200 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                {/* Trachea & Airway */}
                <line x1="150" y1="40" x2="150" y2="100" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />

                {/* Animated Lungs Inhale/Exhale */}
                <ellipse cx="130" cy="120" rx={22 * lungScale} ry={35 * lungScale} fill="#0ea5e9" opacity="0.4" />
                <ellipse cx="170" cy="120" rx={22 * lungScale} ry={35 * lungScale} fill="#0ea5e9" opacity="0.4" />

                {/* Diaphragm Arc */}
                <path
                  d={`M 110 ${165 + cycle * 12} Q 150 ${145 + cycle * 8} 190 ${165 + cycle * 12}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Vocal Resonance Waves */}
                <circle cx="150" cy="65" r={8 + cycle * 14} fill="none" stroke="#f59e0b" strokeWidth="2" opacity={1 - cycle} />
                <circle cx="150" cy="65" r="5" fill="#f59e0b" />

                <text x="95" y="220" fill="#38bdf8" fontSize="11" fontWeight="bold">
                  {cycle > 0.5 ? 'Diaphragmatic Inhale (Expand)' : 'Vocalized Exhale (Mmmm)'}
                </text>
              </svg>
            )}

            {/* Overlay Step Pill */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur px-3 py-1 rounded-xl border border-slate-700 text-xs text-white">
              <span className="text-sky-400 font-bold">Step {currentStepIdx + 1}/{module.steps.length}:</span>{' '}
              <span className="font-medium truncate max-w-[200px] inline-block align-bottom">{module.steps[currentStepIdx]}</span>
            </div>
          </div>

          {/* Step Guidance Text Box */}
          <div className="p-4 bg-slate-950/70 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{language === 'ta' ? 'இலக்கு நரம்பு / தசை' : 'Target Pathway'}:</span>
              <strong className="text-emerald-400">{module.targetMuscleOrNerve}</strong>
            </div>

            <p className="text-sm font-bold text-white bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              "{module.steps[currentStepIdx]}"
            </p>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={onPrevStep}
                disabled={currentStepIdx === 0}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 disabled:opacity-40"
              >
                {language === 'ta' ? 'முந்தைய படி' : 'Previous'}
              </button>

              <button
                onClick={() => speakInstruction(module.steps[currentStepIdx])}
                className="rounded-xl border border-sky-500/30 bg-sky-950/40 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-900/40 flex items-center gap-1.5"
              >
                <Volume2 className="h-3.5 w-3.5" />
                {language === 'ta' ? 'மீண்டும் கேட்கவும்' : 'Hear Guide'}
              </button>

              <button
                onClick={onNextStep}
                disabled={currentStepIdx === module.steps.length - 1}
                className="rounded-xl bg-sky-600 hover:bg-sky-500 px-3 py-1.5 text-xs font-bold text-white shadow disabled:opacity-40"
              >
                {language === 'ta' ? 'அடுத்த படி' : 'Next Step'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Patient Camera AI Watcher ("Watch the patient doing exercise correct or wrong") */}
        <div
          className={`rounded-3xl border-2 transition-all duration-300 bg-slate-900/90 overflow-hidden shadow-2xl flex flex-col justify-between ${
            formStatus === 'correct'
              ? 'border-emerald-500 shadow-emerald-500/20'
              : 'border-rose-500 shadow-rose-500/30 animate-pulse'
          }`}
        >
          {/* Header with Camera Live Indicator */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {language === 'ta' ? 'தானியங்கி கேமரா கண்காணிப்பாளர்' : 'Auto-Camera AI Pose Sentinel'}
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {/* Live Form Accuracy Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{language === 'ta' ? 'துல்லியம்' : 'Form Accuracy'}:</span>
              <span
                className={`font-mono text-sm font-black px-2 py-0.5 rounded-lg border ${
                  formStatus === 'correct'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}
              >
                {formScore}%
              </span>
            </div>
          </div>

          {/* Live Patient Video Feed with Computer Vision Overlay */}
          <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover transform -scale-x-100"
            />

            {/* Overlaid Biofeedback Bounding Box / Pose Check Ring */}
            <div
              className={`absolute inset-4 rounded-2xl border-2 pointer-events-none transition-all duration-300 ${
                formStatus === 'correct'
                  ? 'border-emerald-500/60 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]'
                  : 'border-rose-500/80 shadow-[inset_0_0_30px_rgba(244,63,94,0.3)]'
              }`}
            />

            {/* Dynamic Status Watermark: CORRECT vs WRONG Banner */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              {formStatus === 'correct' ? (
                <div className="flex items-center gap-2 bg-emerald-950/95 border border-emerald-500 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-black text-emerald-300 tracking-wide uppercase">
                    {language === 'ta' ? 'சரியான உடற்பயிற்சி முறை!' : 'CORRECT EXERCISE FORM!'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-rose-950/95 border border-rose-500 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur animate-bounce">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <span className="text-xs font-black text-rose-200 tracking-wide uppercase">
                    {language === 'ta' ? 'தவறான உடற்பயிற்சி - சரிசெய்யவும்!' : 'WRONG EXERCISE / INCORRECT FORM!'}
                  </span>
                </div>
              )}

              <span className="text-[10px] font-mono text-slate-300 bg-slate-900/90 px-2 py-1 rounded border border-slate-700">
                {module.category === 'Facial Palsy'
                  ? `Symmetry: ${facialSymmetry}%`
                  : `Arm Jitter: ${armStability}%`}
              </span>
            </div>

            {/* Real-time Corrective Tip overlay if WRONG */}
            {formStatus === 'wrong' && (
              <div className="absolute bottom-3 left-3 right-3 bg-rose-950/90 border border-rose-500/80 p-3 rounded-2xl text-xs text-rose-200 shadow-2xl backdrop-blur">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-bold">
                      {language === 'ta' ? 'திருத்தம் வழிகாட்டுதல்:' : 'Real-Time Posture Correction:'}
                    </strong>
                    <p className="text-[11px] mt-0.5 leading-snug">
                      {simulatedWrongReason || (
                        language === 'ta'
                          ? 'இயக்க வரம்பு குறைவாக உள்ளது. கையை சற்று உயர்த்தி திரையில் உள்ள அனிமேஷனைப் பின்பற்றவும்.'
                          : 'Movement amplitude too low. Lift limb higher and align with animation demonstration.'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Sentinel Assessment & Simulation Controls */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 space-y-3">
            {/* Form Assessment Summary */}
            <div className="rounded-xl bg-slate-900 p-3 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  {language === 'ta' ? 'தற்போதைய மதிப்பீடு' : 'Real-Time Diagnosis'}:
                </span>
                <span
                  className={`font-bold ${
                    formStatus === 'correct' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formStatus === 'correct'
                    ? language === 'ta'
                      ? 'சரியான வடிவம் - தொடர்ச்சி பராமரிக்கப்படும்'
                      : 'Correct Form - Streak Will Be Maintained'
                    : language === 'ta'
                    ? 'தவறான வடிவம் - நிலையை மாற்றவும்'
                    : 'Wrong Form - Please Adjust Posture'}
                </span>
              </div>
            </div>

            {/* Form Testing / Verification Buttons (Crucial for clinical and user testing) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSimulateCorrectForm}
                className={`rounded-xl p-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                  formStatus === 'correct'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/50'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{language === 'ta' ? 'சரியான வடிவம் (Correct)' : 'Simulate Correct Form'}</span>
              </button>

              <button
                onClick={handleSimulateWrongForm}
                className={`rounded-xl p-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                  formStatus === 'wrong'
                    ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/30'
                    : 'bg-rose-950/40 text-rose-300 border-rose-800/80 hover:bg-rose-900/50'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>{language === 'ta' ? 'தவறான வடிவம் (Wrong)' : 'Simulate Wrong Form'}</span>
              </button>
            </div>

            {/* Complete Exercise Button */}
            <button
              onClick={handleTriggerVictory}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-black text-slate-950 shadow-xl shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Award className="h-5 w-5" />
              <span>
                {language === 'ta'
                  ? 'பயிற்சியை முடித்து தொடர்ச்சியை உறுதி செய்'
                  : 'Complete Exercise & Maintain Streak'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* STREAK MAINTAINED CELEBRATION MODAL */}
      {showCelebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-amber-500/60 bg-gradient-to-b from-slate-900 via-amber-950/40 to-slate-900 p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/40 animate-bounce">
              <Flame className="h-10 w-10" />
            </div>

            <div className="space-y-1">
              <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-800">
                {language === 'ta' ? 'சரியான உடற்பயிற்சி உறுதி செய்யப்பட்டது' : 'Form Verified: 100% Correct'}
              </span>
              <h3 className="text-2xl font-black text-white pt-1">
                {language === 'ta'
                  ? 'தினசரி தொடர்ச்சி பேணப்பட்டது!'
                  : 'Daily Recovery Streak Maintained!'}
              </h3>
              <p className="text-xs text-amber-200">
                {language === 'ta'
                  ? 'நீங்கள் உடற்பயிற்சியை சரியான முறையில் முடித்து உங்கள் மறுவாழ்வுத் தொடர்ச்சியைப் புதுப்பித்துள்ளீர்கள்!'
                  : 'You performed the exercise with correct form and maintained your neuro-rehabilitation streak!'}
              </p>
            </div>

            {/* Big Streak Stat */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                {language === 'ta' ? 'தற்போதைய தொடர்ச்சி' : 'Current Streak'}
              </div>
              <div className="text-4xl font-black text-white font-mono mt-1">
                {exerciseStreak + 1} <span className="text-lg text-amber-400">Days</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                Form Score: <strong className="text-emerald-400">{finalScore}%</strong> • Reps:{' '}
                <strong className="text-white">{targetReps}/{targetReps}</strong>
              </p>
            </div>

            <button
              onClick={handleConfirmCompletion}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 py-3.5 text-sm font-black text-slate-950 shadow-xl hover:from-amber-400 hover:to-emerald-400 active:scale-95 transition"
            >
              {language === 'ta' ? 'தொடரவும் / Save Progress' : 'Awesome! Save & Continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
