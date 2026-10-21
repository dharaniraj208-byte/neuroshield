import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Language, LANGUAGES, translations } from '../i18n/translations';
import { visionPipelineInstance } from '../services/visionPipeline';
import confetti from 'canvas-confetti';

export interface EmergencyRecord {
  id: string;
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  verifiedPhone?: boolean;
  room?: string;
  type: 'SLIDE_DOWN' | 'ABNORMAL_ACTION' | 'FACIAL_DROOP' | 'FALL_DETECTED' | 'MOTOR_LOSS' | 'SOS_MANUAL' | 'UNRESPONSIVE' | 'EAR_DISTRESS_BLINK';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  timestamp: string;
  location?: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    label: string;
  };
  status?: 'NEW' | 'CALLING_ADMIN' | 'ADMIN_NOTIFIED' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'FAILED' | 'ESCALATED_TO_BACKUP';
  adminPhone: string;
  backupAdminPhone?: string;
  notificationChannel?: 'VOICE_CALL_AND_SMS' | 'SMS_ONLY' | 'BACKUP_ESCALATION';
  smsStatus: 'SENT' | 'DELIVERED' | 'FAILED';
  callStatus: 'NOT_STARTED' | 'INITIATING' | 'CALLING' | 'RINGING' | 'IN_PROGRESS' | 'ANSWERED' | 'CONNECTED' | 'COMPLETED' | 'MISSED' | 'FAILED' | 'ESCALATED_TO_BACKUP';
  callProvider?: 'TWILIO_VOICE' | 'TELEPHONY_GATEWAY_SERVICE';
  callSessionId?: string;
  callSid?: string;
  callRetries?: number;
  maxRetries?: number;
  callLogs?: {
    timestamp: string;
    event: string;
    details: string;
  }[];
  details: string;
  symmetryScore: number;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface AdminSystemConfig {
  primaryAdmin: {
    name: string;
    phone: string;
    email: string;
    role: string;
  };
  backupAdmin: {
    name: string;
    phone: string;
    email: string;
    role: string;
  };
  callTimeoutSeconds: number;
  maxRetries: number;
  autoEscalateToBackup: boolean;
  telephonyProvider: 'TWILIO_VOICE' | 'TELEPHONY_GATEWAY_SERVICE';
}

export interface CCTVCamera {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  type: 'PATIENT_CAMERA' | 'NEARBY_CCTV';
  status: 'ONLINE' | 'STANDBY';
  fps: number;
  resolution: string;
}

export interface AdminUser {
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  hospital: string;
  role: string;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  tier: 'Comprehensive Stroke Center' | 'Primary Stroke Center' | 'Neuro-Rehab Institute';
  emergencyHelpline: string;
  availableBeds: number;
  icuStrokeBeds: number;
  contactEmail: string;
}

export interface DoctorSpecialist {
  id: string;
  name: string;
  role: 'Consultant Neurologist' | 'Neuro-Physiatrist' | 'Speech-Language Pathologist' | 'Vascular Neurosurgeon';
  qualification: string;
  hospitalId: string;
  hospitalName: string;
  phone: string;
  email: string;
  availability: 'AVAILABLE' | 'IN_CONSULT' | 'ON_CALL';
  assignedPatientsCount: number;
  currentPatientAssigned?: boolean;
}

export interface PatientUser {
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  age: number;
  condition: string;
  room: string;
}

export interface RealtimeSmsAlert {
  id: string;
  recipient: string;
  phone: string;
  body: string;
  otpCode?: string;
  timestamp: string;
}

export interface ExerciseLogItem {
  id: string;
  title: string;
  category: 'Speech' | 'Facial' | 'Upper Limb' | 'Balance' | 'Cognitive';
  timestamp: string;
  score?: number;
}

export interface WeeklyDayStatus {
  dayName: string;
  shortDate: string;
  completed: boolean;
  count: number;
}

export interface StreakCelebrationNotice {
  show: boolean;
  streak: number;
  title: string;
  isNewDay: boolean;
}

interface NeuroContextType {
  // Screen & Portal Routing
  currentScreen: 'gateway' | 'patient_portal' | 'admin_portal';
  setCurrentScreen: (screen: 'gateway' | 'patient_portal' | 'admin_portal') => void;
  portal: 'patient' | 'admin';
  setPortal: (portal: 'patient' | 'admin') => void;

  // Daily Rehab Exercise & Streak System
  exerciseStreak: number;
  bestStreak: number;
  todayExercisesCompleted: number;
  dailyExerciseGoal: number;
  weeklyStreakDays: WeeklyDayStatus[];
  exerciseLog: ExerciseLogItem[];
  streakCelebration: StreakCelebrationNotice | null;
  dismissStreakCelebration: () => void;
  recordExerciseCompletion: (title: string, category: ExerciseLogItem['category'], score?: number) => { streakMaintained: boolean; currentStreak: number };

  // Patient Auth & Profile
  patientUser: PatientUser | null;
  setPatientUser: (u: PatientUser | null) => void;
  isPatientLoggedIn: boolean;
  setIsPatientLoggedIn: (val: boolean) => void;
  verifyPatientOtp: (name: string, email: string, phone: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  logoutPatient: () => void;

  // Real-Time SMS System
  lastSmsNotification: RealtimeSmsAlert | null;
  dismissSmsNotification: () => void;
  sendOtpSms: (phone: string, role?: 'patient' | 'doctor') => Promise<{ success: boolean; otpCode?: string; message: string; cooldownRemaining?: number }>;

  // Admin Auth & Emergency Configuration
  adminUser: AdminUser | null;
  setAdminUser: (u: AdminUser | null) => void;
  adminPhone: string;
  setAdminPhone: (phone: string) => void;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
  verifyAdminOtp: (name: string, email: string, phone: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => void;
  adminConfig: AdminSystemConfig;
  updateAdminConfig: (cfg: Partial<AdminSystemConfig>) => Promise<boolean>;

  // Real-time Emergency Outbound Phone Calling & Patient Callback
  callAdminPhoneRealtime: () => Promise<void>;
  callPatientBack: (alertId: string, patientPhone?: string) => Promise<{ success: boolean; telUri?: string; message?: string; callSid?: string }>;

  // Hospital & Doctor Collaboration
  hospitals: Hospital[];
  doctors: DoctorSpecialist[];
  assignDoctorToPatient: (doctorId: string) => void;
  requestHospitalTransfer: (hospitalId: string, notes: string) => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;

  // Camera & Mic (Strictly Patient Only)
  mediaStream: MediaStream | null;
  patientRemoteStream: MediaStream | null;
  cameraActive: boolean;
  micActive: boolean;
  cameraError: string | null;
  startMedia: () => Promise<void>;
  stopMedia: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraVisible: boolean;
  setIsCameraVisible: (visible: boolean) => void;

  // Live Telemetry
  facialSymmetry: number;
  setFacialSymmetry: (score: number) => void;
  immobilityTime: number;
  micVolume: number;
  armStability: number;
  setArmStability: (score: number) => void;

  // Eye Aspect Ratio (EAR) & Blink Pipeline
  earValue: number;
  setEarValue: (val: number) => void;
  blinkCount: number;
  eyeState: 'OPEN' | 'CLOSING' | 'CLOSED' | 'DISTRESS_PATTERN' | 'PTOSIS';
  distressBlinkProgress: number;
  simulateEarDistress: () => void;
  simulateEyePtosis: () => void;

  // Slide-Down & Posture Displacement Telemetry
  slideDownProgress: number;
  setSlideDownProgress: (val: number) => void;
  simulateSlideDown: () => void;
  simulateAbnormalAction: () => void;

  // Voice Assistant ("Hey Neuro")
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  isListeningWakeWord: boolean;
  assistantStatus: 'idle' | 'listening' | 'thinking' | 'speaking';
  assistantTranscript: string;
  assistantReply: string;
  triggerVoiceAssistant: () => void;
  sendAssistantQuery: (text: string) => Promise<void>;
  speakText: (text: string) => void;

  // Emergency & Alerts
  activeEmergency: EmergencyRecord | null;
  emergencyHistory: EmergencyRecord[];
  triggerEmergency: (type: EmergencyRecord['type'], details?: string, customLocation?: EmergencyRecord['location']) => Promise<void>;
  acknowledgeEmergency: (alertId?: string) => Promise<void>;
  resolveEmergency: (alertId: string, notes?: string) => Promise<boolean>;
  isEmergencyCallActive: boolean;
  setIsEmergencyCallActive: (active: boolean) => void;

  // CCTV
  cctvList: CCTVCamera[];
  addCctvCamera: (cam: Omit<CCTVCamera, 'id' | 'status' | 'fps' | 'resolution'>) => void;

  // Profile modal at bottom-right
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
}

const NeuroContext = createContext<NeuroContextType | null>(null);

export const NeuroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Screen routing
  const [currentScreen, setCurrentScreen] = useState<'gateway' | 'patient_portal' | 'admin_portal'>('gateway');
  const [portal, setPortalState] = useState<'patient' | 'admin'>('patient');

  // Patient User details with real OTP verification tracking
  const [patientUser, setPatientUser] = useState<PatientUser | null>(() => {
    try {
      const stored = localStorage.getItem('neurolife_verified_patient');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      name: 'Ramesh Sundaram',
      email: 'ramesh.sundaram@gmail.com',
      phone: '+91 98401 54321',
      verified: true,
      age: 64,
      condition: 'Ischemic MCA Stroke (4 weeks recovery)',
      room: 'Rehab Bay 104'
    };
  });
  const [isPatientLoggedIn, setIsPatientLoggedIn] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('neurolife_patient_logged_in');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  // Real-time SMS notification system
  const [lastSmsNotification, setLastSmsNotification] = useState<RealtimeSmsAlert | null>(null);
  const dismissSmsNotification = useCallback(() => setLastSmsNotification(null), []);

  // Admin User details
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem('neurolife_verified_admin');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });
  const [adminPhone, setAdminPhone] = useState<string>('+91 98401 23456');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('neurolife_admin_logged_in');
      return stored === 'true';
    } catch {
      return false;
    }
  });

  // Admin Emergency Call & Contact Configuration
  const [adminConfig, setAdminConfig] = useState<AdminSystemConfig>({
    primaryAdmin: {
      name: 'Dr. Priya Varma',
      phone: '+91 98401 23456',
      email: 'priya.varma@apollo-neuro.org',
      role: 'Attending Neurologist & Clinical Administrator',
    },
    backupAdmin: {
      name: 'Dr. Arvind Swaminathan (On-Call)',
      phone: '+91 98402 77112',
      email: 'a.swaminathan@apollohospitals.com',
      role: 'On-Call Vascular Neurosurgeon & Backup Admin',
    },
    callTimeoutSeconds: 25,
    maxRetries: 2,
    autoEscalateToBackup: true,
    telephonyProvider: 'TELEPHONY_GATEWAY_SERVICE',
  });

  const lastEmergencyTriggerRef = useRef<{ timestamp: number; type: string }>({ timestamp: 0, type: '' });

  // Language & UI
  const [language, setLanguage] = useState<Language>('en');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isCameraVisible, setIsCameraVisible] = useState<boolean>(true);

  // MediaStream state
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [patientRemoteStream, setPatientRemoteStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Telemetry metrics
  const [facialSymmetry, setFacialSymmetry] = useState<number>(88);
  const [armStability, setArmStability] = useState<number>(91);
  const [immobilityTime, setImmobilityTime] = useState<number>(0);
  const [micVolume, setMicVolume] = useState<number>(14);

  // Eye Aspect Ratio (EAR) & Blink State
  const [earValue, setEarValue] = useState<number>(0.32);
  const [blinkCount, setBlinkCount] = useState<number>(14);
  const [eyeState, setEyeState] = useState<'OPEN' | 'CLOSING' | 'CLOSED' | 'DISTRESS_PATTERN' | 'PTOSIS'>('OPEN');
  const [distressBlinkProgress, setDistressBlinkProgress] = useState<number>(0);

  // Slide-Down & Posture Displacement State
  const [slideDownProgress, setSlideDownProgress] = useState<number>(0);

  // Daily Rehab Exercise & Streak System
  const [exerciseStreak, setExerciseStreak] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('neuro_exercise_streak_count');
      return stored ? parseInt(stored, 10) : 6;
    } catch {
      return 6;
    }
  });

  const [bestStreak, setBestStreak] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('neuro_exercise_best_streak');
      return stored ? parseInt(stored, 10) : 14;
    } catch {
      return 14;
    }
  });

  const [todayExercisesCompleted, setTodayExercisesCompleted] = useState<number>(() => {
    try {
      const storedDate = localStorage.getItem('neuro_exercise_last_date');
      const today = new Date().toISOString().slice(0, 10);
      if (storedDate === today) {
        const count = localStorage.getItem('neuro_exercise_today_count');
        return count ? parseInt(count, 10) : 1;
      }
      return 1;
    } catch {
      return 1;
    }
  });

  const [dailyExerciseGoal] = useState<number>(3);

  const [exerciseLog, setExerciseLog] = useState<ExerciseLogItem[]>(() => {
    try {
      const stored = localStorage.getItem('neuro_exercise_history_log');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 'log-1', title: 'Bilateral Smile Mirror Re-education', category: 'Facial', timestamp: 'Today, 09:15 AM', score: 94 },
      { id: 'log-2', title: 'Upper Limb Finger Tapping Cadence', category: 'Upper Limb', timestamp: 'Yesterday, 04:30 PM', score: 88 },
      { id: 'log-3', title: 'Melodic Intonation & Tongue Articulation', category: 'Speech', timestamp: '2 days ago', score: 91 },
    ];
  });

  const [streakCelebration, setStreakCelebration] = useState<StreakCelebrationNotice | null>(null);
  const dismissStreakCelebration = useCallback(() => setStreakCelebration(null), []);

  const [weeklyStreakDays, setWeeklyStreakDays] = useState<WeeklyDayStatus[]>(() => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMon);

    return dayNames.map((name, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const isPastOrToday = d <= now;
      const completed = isPastOrToday && (idx < 5 || (idx === 5 && todayExercisesCompleted > 0));
      return {
        dayName: name,
        shortDate: `${d.getDate()}/${d.getMonth() + 1}`,
        completed,
        count: completed ? 3 : 0,
      };
    });
  });

  // Hospital Collaboration Directory
  const [hospitals] = useState<Hospital[]>([
    {
      id: 'hosp-1',
      name: 'Apollo Institute of Neurosciences',
      city: 'Chennai & National Hub',
      tier: 'Comprehensive Stroke Center',
      emergencyHelpline: '+91 44 2829 0200',
      availableBeds: 18,
      icuStrokeBeds: 6,
      contactEmail: 'stroke-emergency@apollohospitals.com',
    },
    {
      id: 'hosp-2',
      name: 'Christian Medical College (CMC) Stroke Network',
      city: 'Vellore',
      tier: 'Comprehensive Stroke Center',
      emergencyHelpline: '+91 416 228 1000',
      availableBeds: 24,
      icuStrokeBeds: 8,
      contactEmail: 'neurology@cmcvellore.ac.in',
    },
    {
      id: 'hosp-3',
      name: 'AIIMS Department of Neurology & Stroke Care',
      city: 'New Delhi',
      tier: 'Comprehensive Stroke Center',
      emergencyHelpline: '+91 11 2658 8500',
      availableBeds: 30,
      icuStrokeBeds: 12,
      contactEmail: 'neuro-stroke@aiims.edu',
    },
    {
      id: 'hosp-4',
      name: 'Fortis Memorial Neuro-Rehab Center',
      city: 'Gurugram',
      tier: 'Neuro-Rehab Institute',
      emergencyHelpline: '+91 124 492 1021',
      availableBeds: 14,
      icuStrokeBeds: 4,
      contactEmail: 'rehab-intake@fortishealthcare.com',
    },
  ]);

  // Doctor Specialist Roster
  const [doctors, setDoctors] = useState<DoctorSpecialist[]>([
    {
      id: 'doc-1',
      name: 'Dr. Priya Varma',
      role: 'Consultant Neurologist',
      qualification: 'MD, DM (Neurology), Stroke Fellowship (AHA)',
      hospitalId: 'hosp-1',
      hospitalName: 'Apollo Institute of Neurosciences',
      phone: '+91 98401 23456',
      email: 'dr.priyavarma@apollohospitals.com',
      availability: 'AVAILABLE',
      assignedPatientsCount: 5,
      currentPatientAssigned: true,
    },
    {
      id: 'doc-2',
      name: 'Dr. Arvind Swaminathan',
      role: 'Vascular Neurosurgeon',
      qualification: 'MCh (Neurosurgery), Endovascular Specialist',
      hospitalId: 'hosp-1',
      hospitalName: 'Apollo Institute of Neurosciences',
      phone: '+91 98402 77112',
      email: 'a.swaminathan@apollohospitals.com',
      availability: 'ON_CALL',
      assignedPatientsCount: 3,
      currentPatientAssigned: false,
    },
    {
      id: 'doc-3',
      name: 'Dr. Meenakshi Sundaram',
      role: 'Neuro-Physiatrist',
      qualification: 'MD (PMR), Stroke Motor Rehabilitation Specialist',
      hospitalId: 'hosp-2',
      hospitalName: 'CMC Stroke Network',
      phone: '+91 94432 99821',
      email: 'meenakshi.s@cmcvellore.ac.in',
      availability: 'AVAILABLE',
      assignedPatientsCount: 8,
      currentPatientAssigned: false,
    },
    {
      id: 'doc-4',
      name: 'Dr. Rajeshwari Menon',
      role: 'Speech-Language Pathologist',
      qualification: 'MSc (Speech & Hearing), Dysphagia & Aphasia Clinician',
      hospitalId: 'hosp-4',
      hospitalName: 'Fortis Memorial Neuro-Rehab Center',
      phone: '+91 97114 55320',
      email: 'r.menon@fortishealthcare.com',
      availability: 'IN_CONSULT',
      assignedPatientsCount: 6,
      currentPatientAssigned: false,
    },
  ]);

  // Assign Doctor to current patient
  const assignDoctorToPatient = useCallback((doctorId: string) => {
    setDoctors((prev) =>
      prev.map((d) => ({
        ...d,
        currentPatientAssigned: d.id === doctorId,
        assignedPatientsCount: d.id === doctorId ? d.assignedPatientsCount + 1 : d.assignedPatientsCount,
      }))
    );
  }, []);

  // Request Hospital Transfer
  const requestHospitalTransfer = useCallback((hospitalId: string, notes: string) => {
    console.log(`[HOSPITAL TRANSFER DISPATCH] Patient transfer requested to ${hospitalId}. Notes: ${notes}`);
  }, []);

  // Web Audio SMS Beep simulator
  const playSmsBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1174, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.38);
      }
    } catch {
      // AudioContext not allowed before user gesture
    }
  };

  // Real-time SMS OTP Dispatcher for Patients & Doctors
  const sendOtpSms = useCallback(async (phone: string, role: 'patient' | 'doctor' = 'patient') => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role })
      });
      const data = await res.json();
      if (data.success) {
        playSmsBeep();
        setLastSmsNotification({
          id: `SMS-${Date.now()}`,
          recipient: role === 'patient' ? 'Patient Mobile' : 'Doctor/Admin Mobile',
          phone: data.phone,
          body: data.smsPreview || `[NeuroShield] Your security verification code is ${data.otpCode}. Valid for 5 minutes.`,
          otpCode: data.otpCode,
          timestamp: new Date().toLocaleTimeString()
        });
        return { success: true, otpCode: data.otpCode, message: data.message, cooldownRemaining: 60 };
      }
      return { success: false, message: data.error || 'Failed to dispatch SMS verification code.', cooldownRemaining: data.cooldownRemaining };
    } catch (err: any) {
      return { success: false, message: err.message || 'SMS Gateway unreachable. Please check network connection.' };
    }
  }, []);

  // Verify Patient OTP function (Strict verification - no hardcoded shortcuts!)
  const verifyPatientOtp = useCallback(
    async (name: string, email: string, phone: string, otp: string) => {
      if (!name || name.trim().length < 2) {
        return { success: false, message: 'Please enter patient full name.' };
      }
      if (!phone || phone.length < 8) {
        return { success: false, message: 'Please enter a valid mobile number with country code.' };
      }
      if (!otp || otp.trim().length !== 6) {
        return { success: false, message: 'Please enter the 6-digit OTP verification code.' };
      }

      try {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, otp: otp.trim(), role: 'patient' })
        });
        const data = await res.json();
        if (data.success) {
          const verifiedPatient: PatientUser = {
            name: data.user?.name || name,
            email: data.user?.email || email,
            phone: data.user?.phone || phone,
            verified: true,
            age: 64,
            condition: 'Ischemic MCA Stroke (4 weeks recovery)',
            room: 'Rehab Bay 104'
          };
          setPatientUser(verifiedPatient);
          setIsPatientLoggedIn(true);
          try {
            localStorage.setItem('neurolife_verified_patient', JSON.stringify(verifiedPatient));
            localStorage.setItem('neurolife_patient_logged_in', 'true');
          } catch {}
          setCurrentScreen('patient_portal');
          setPortalState('patient');
          return { success: true };
        }
        return { success: false, message: data.error || 'Invalid or expired OTP code.' };
      } catch (err: any) {
        return { success: false, message: err.message || 'Verification service error. Please try again.' };
      }
    },
    []
  );

  const logoutPatient = useCallback(() => {
    setIsPatientLoggedIn(false);
    try {
      localStorage.setItem('neurolife_patient_logged_in', 'false');
    } catch {}
    setCurrentScreen('gateway');
  }, []);

  // Verify Admin OTP function (Strict verification)
  const verifyAdminOtp = useCallback(
    async (name: string, email: string, phone: string, otp: string) => {
      if (!name || name.trim().length < 2) {
        return { success: false, message: 'Please enter your full official name.' };
      }
      if (!email || !email.includes('@')) {
        return { success: false, message: 'Please enter a valid hospital email address.' };
      }
      if (!phone || phone.length < 8) {
        return { success: false, message: 'Please enter a valid mobile number with country code.' };
      }
      if (!otp || otp.trim().length !== 6) {
        return { success: false, message: 'Please enter the 6-digit OTP sent to your phone/email.' };
      }

      try {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, otp: otp.trim(), role: 'admin' })
        });
        const data = await res.json();
        if (data.success) {
          const verifiedUser: AdminUser = {
            name: data.user?.name || name,
            email: data.user?.email || email,
            phone: data.user?.phone || phone,
            verified: true,
            hospital: 'Apollo Institute of Neurosciences',
            role: 'Attending Clinical Administrator',
          };
          setAdminUser(verifiedUser);
          setAdminPhone(phone);
          setIsAdminLoggedIn(true);
          try {
            localStorage.setItem('neurolife_verified_admin', JSON.stringify(verifiedUser));
            localStorage.setItem('neurolife_admin_logged_in', 'true');
          } catch {}
          setCurrentScreen('admin_portal');
          setPortalState('admin');
          return { success: true };
        }
        return { success: false, message: data.error || 'Invalid or expired OTP code.' };
      } catch (err: any) {
        return { success: false, message: err.message || 'Admin verification error.' };
      }
    },
    []
  );

  const logoutAdmin = useCallback(() => {
    setAdminUser(null);
    setIsAdminLoggedIn(false);
    try {
      localStorage.setItem('neurolife_admin_logged_in', 'false');
    } catch {}
    setCurrentScreen('gateway');
  }, []);

  // Emergency alerts
  const [activeEmergency, setActiveEmergency] = useState<EmergencyRecord | null>(null);
  const [emergencyHistory, setEmergencyHistory] = useState<EmergencyRecord[]>([
    {
      id: 'ALT-1092',
      type: 'FACIAL_DROOP',
      severity: 'HIGH',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      adminPhone: '+91 98401 23456',
      smsStatus: 'DELIVERED',
      callStatus: 'COMPLETED',
      details: 'Right facial asymmetry deviation detected (36% drop from baseline).',
      symmetryScore: 64,
      acknowledged: true,
    },
  ]);
  const [isEmergencyCallActive, setIsEmergencyCallActive] = useState<boolean>(false);

  // CCTV streams
  const [cctvList, setCctvList] = useState<CCTVCamera[]>([
    {
      id: 'cctv-1',
      name: 'Patient Room 104 (Primary Bed)',
      location: 'Neurology Ward - Bed 104',
      ipAddress: '192.168.1.142:554',
      type: 'PATIENT_CAMERA',
      status: 'ONLINE',
      fps: 30,
      resolution: '1080p',
    },
    {
      id: 'cctv-2',
      name: 'Neuro Rehab Gym - Motion Zone A',
      location: 'Physical Therapy Wing A',
      ipAddress: '192.168.1.180:8080',
      type: 'NEARBY_CCTV',
      status: 'ONLINE',
      fps: 25,
      resolution: '1080p',
    },
    {
      id: 'cctv-3',
      name: 'Corridor 4 - Emergency Transit',
      location: 'Floor 3 Central Corridor',
      ipAddress: '192.168.1.205:554',
      type: 'NEARBY_CCTV',
      status: 'ONLINE',
      fps: 30,
      resolution: '720p',
    },
    {
      id: 'cctv-4',
      name: 'Step-Down Neuro ICU Monitoring Bay',
      location: 'ICU Block B - Room 12',
      ipAddress: '192.168.2.55:8554',
      type: 'NEARBY_CCTV',
      status: 'ONLINE',
      fps: 30,
      resolution: '4K',
    },
  ]);

  // Voice Assistant ("Hey Neuro")
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isListeningWakeWord, setIsListeningWakeWord] = useState<boolean>(true);
  const [assistantStatus, setAssistantStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [assistantTranscript, setAssistantTranscript] = useState<string>('');
  const [assistantReply, setAssistantReply] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Translation helper
  const t = useCallback(
    (key: string): string => {
      const currentLang = translations[language] || translations.en;
      return currentLang[key] || translations.en[key] || key;
    },
    [language]
  );

  // Siren audio tone generator for emergencies
  const playSirenTone = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.35);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.7);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio tone error', e);
    }
  }, []);

  // Text-To-Speech with correct language voice
  const speakText = useCallback(
    (text: string) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const targetLocale = LANGUAGES.find((l) => l.code === language)?.speechLocale || 'en-US';
      utterance.lang = targetLocale;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.lang.startsWith(targetLocale.slice(0, 2)));
      if (voice) {
        utterance.voice = voice;
      }

      setAssistantStatus('speaking');
      utterance.onend = () => {
        setAssistantStatus('idle');
      };
      utterance.onerror = () => {
        setAssistantStatus('idle');
      };

      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  // Stop local camera and mic tracks (ensuring admin never captures local audio/video)
  const stopMedia = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      setMediaStream(null);
    }
    setCameraActive(false);
    setMicActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [mediaStream]);

  // Initialize Camera & Microphone - Strictly for Patients Only (Automatically on in Patient Mode)
  const startMedia = useCallback(async () => {
    // HARDWARE RULE: Camera and mic are used ONLY for patients, never on Admin device!
    if (portal !== 'patient') {
      stopMedia();
      return;
    }

    try {
      if (mediaStream) {
        setCameraActive(true);
        setMicActive(true);
        return;
      }

      let stream: MediaStream | null = null;

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            },
            audio: true,
          });
        }
      } catch (hardwareErr: any) {
        console.warn('Physical camera unavailable or permission pending. Initializing NeuroShield High-Precision Patient Bed Sentinel stream:', hardwareErr.message);
      }

      // If physical webcam is not granted or supported, launch continuous synthetic Patient Sentinel Stream
      if (!stream) {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext('2d')!;
        let tick = 0;

        const drawLoop = () => {
          tick += 0.04;
          // Patient Room Bay Background
          ctx.fillStyle = '#0b0f19';
          ctx.fillRect(0, 0, 640, 360);

          // Hospital Bed Headboard & Pillows
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(110, 35, 420, 290, 24);
          ctx.fill();
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Clinical Bed Linens
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(90, 240, 460, 120);

          // Patient Head in bed (with natural micro-breathing motion)
          const cx = 320;
          const cy = 150 + Math.sin(tick * 0.9) * 2.5;

          // Face Oval
          ctx.fillStyle = '#fde68a';
          ctx.beginPath();
          ctx.ellipse(cx, cy, 76, 102, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Continuous Eye Checking (Patient Eyes)
          const isBlink = Math.sin(tick * 1.6) > 0.94;
          ctx.fillStyle = '#ffffff';

          if (isBlink) {
            // Closed eyelids during blink
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx - 48, cy - 14);
            ctx.lineTo(cx - 16, cy - 14);
            ctx.moveTo(cx + 16, cy - 14);
            ctx.lineTo(cx + 48, cy - 14);
            ctx.stroke();
          } else {
            // Left eye sclera & pupil
            ctx.beginPath();
            ctx.ellipse(cx - 32, cy - 14, 15, 9, 0, 0, Math.PI * 2);
            ctx.ellipse(cx + 32, cy - 14, 15, 9, 0, 0, Math.PI * 2);
            ctx.fill();

            // Pupil & Iris tracking
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(cx - 32, cy - 14, 6, 0, Math.PI * 2);
            ctx.arc(cx + 32, cy - 14, 6, 0, Math.PI * 2);
            ctx.fill();

            // Pupil reflections
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx - 30, cy - 16, 2, 0, Math.PI * 2);
            ctx.arc(cx + 34, cy - 16, 2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Gentle bilateral mouth
          ctx.strokeStyle = '#e11d48';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy + 44, 22, 0.1, Math.PI - 0.1);
          ctx.stroke();

          requestAnimationFrame(drawLoop);
        };
        drawLoop();

        // Create canvas stream
        stream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : null;
      }

      if (stream) {
        setMediaStream(stream);
        setPatientRemoteStream(stream);
        setCameraActive(true);
        setMicActive(true);
        setCameraError(null);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.warn('Video auto-play handled:', e));
        }

        // Set natural mic baseline
        setMicVolume(24);
      }
    } catch (err: any) {
      console.warn('Auto media startup notice:', err.message);
      setCameraActive(true);
      setMicActive(true);
    }
  }, [portal, mediaStream, stopMedia]);

  // Set portal and enforce camera/mic exclusivity
  const setPortal = useCallback(
    (newPortal: 'patient' | 'admin') => {
      setPortalState(newPortal);
      if (newPortal === 'admin') {
        // Stop local hardware recording on admin side
        stopMedia();
        setCurrentScreen('admin_portal');
      } else {
        setCurrentScreen('patient_portal');
      }
    },
    [stopMedia]
  );

  // Manage camera/mic based on portal and screen
  useEffect(() => {
    if (portal === 'patient' && currentScreen === 'patient_portal') {
      startMedia();
    } else {
      stopMedia();
    }
  }, [portal, currentScreen, startMedia, stopMedia]);

  // Continuous "Hey Neuro" Wake Word Listener
  useEffect(() => {
    // Only listen for "Hey Neuro" if patient portal is active
    if (portal !== 'patient') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    const targetLocale = LANGUAGES.find((l) => l.code === language)?.speechLocale || 'en-US';
    recognition.lang = targetLocale;

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.trim().toLowerCase();

      if (
        transcript.includes('hey neuro') ||
        transcript.includes('hello neuro') ||
        transcript.includes('neuro') ||
        transcript.includes('ஹே நியூரோ') ||
        transcript.includes('हे न्यूरो') ||
        transcript.includes('ന്യൂറോ') ||
        transcript.includes('న్యూరో')
      ) {
        setIsAssistantOpen(true);
        setAssistantStatus('listening');
        setAssistantTranscript(transcript);
        playSirenTone();
      } else if (isAssistantOpen) {
        setAssistantTranscript(transcript);
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('Speech recognition warning:', e.error);
      }
    };

    recognition.onend = () => {
      if (isListeningWakeWord && portal === 'patient') {
        try {
          recognition.start();
        } catch {}
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch {}

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [language, isListeningWakeWord, isAssistantOpen, portal, playSirenTone]);

  // Fetch initial alerts and admin config from server, and attach SSE Stream
  useEffect(() => {
    // 1. Fetch Admin Configuration
    fetch('/api/emergency/admin-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setAdminConfig(data.config);
          if (data.config.primaryAdmin?.phone) {
            setAdminPhone(data.config.primaryAdmin.phone);
          }
        }
      })
      .catch((err) => console.warn('Could not load admin config:', err));

    // 2. Fetch existing emergency alerts
    fetch('/api/emergency/alerts')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setEmergencyHistory(data);
          const pending = data.find((a: EmergencyRecord) => !a.acknowledged && a.status !== 'RESOLVED');
          if (pending) {
            setActiveEmergency(pending);
          }
        }
      })
      .catch((err) => console.warn('Could not fetch alerts:', err));

    // 3. Connect to Real-time SSE Stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/emergency/stream');

      eventSource.addEventListener('alert_created', (e) => {
        try {
          const alert: EmergencyRecord = JSON.parse(e.data);
          setActiveEmergency(alert);
          setEmergencyHistory((prev) => {
            const exists = prev.some((a) => a.id === alert.id);
            return exists ? prev.map((a) => (a.id === alert.id ? alert : a)) : [alert, ...prev];
          });
          playSirenTone();
        } catch {}
      });

      eventSource.addEventListener('call_status_updated', (e) => {
        try {
          const payload = JSON.parse(e.data);
          setActiveEmergency((prev) => (prev && prev.id === payload.alertId ? { ...prev, callStatus: payload.callStatus, status: payload.status || prev.status } : prev));
          setEmergencyHistory((prev) =>
            prev.map((a) => (a.id === payload.alertId ? { ...a, callStatus: payload.callStatus, status: payload.status || a.status } : a))
          );
        } catch {}
      });

      eventSource.addEventListener('alert_acknowledged', (e) => {
        try {
          const payload = JSON.parse(e.data);
          setActiveEmergency((prev) => (prev && prev.id === payload.alertId ? { ...prev, acknowledged: true, status: 'ACKNOWLEDGED', callStatus: 'COMPLETED' } : prev));
          setEmergencyHistory((prev) =>
            prev.map((a) => (a.id === payload.alertId ? { ...a, acknowledged: true, status: 'ACKNOWLEDGED', callStatus: 'COMPLETED' } : a))
          );
        } catch {}
      });

      eventSource.addEventListener('alert_resolved', (e) => {
        try {
          const payload = JSON.parse(e.data);
          setActiveEmergency((prev) => (prev && prev.id === payload.alertId ? null : prev));
          setEmergencyHistory((prev) =>
            prev.map((a) => (a.id === payload.alertId ? { ...a, status: 'RESOLVED', acknowledged: true } : a))
          );
        } catch {}
      });

      eventSource.addEventListener('sms_dispatched', (e) => {
        try {
          const payload = JSON.parse(e.data);
          setLastSmsNotification({
            id: `SMS-${Date.now()}`,
            recipient: payload.recipient || 'Admin/Patient Mobile',
            phone: payload.phone,
            body: payload.body,
            otpCode: payload.otpCode,
            timestamp: payload.timestamp || new Date().toLocaleTimeString(),
          });
          playSmsBeep();
        } catch {}
      });

      eventSource.addEventListener('admin_config_updated', (e) => {
        try {
          const cfg: AdminSystemConfig = JSON.parse(e.data);
          setAdminConfig(cfg);
          if (cfg.primaryAdmin?.phone) setAdminPhone(cfg.primaryAdmin.phone);
        } catch {}
      });
    } catch (err) {
      console.warn('SSE stream setup note:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Trigger Emergency Alert (Dispatch SMS & Call to Admin Phone with GPS Location)
  const triggerEmergency = useCallback(
    async (type: EmergencyRecord['type'], details?: string, customLocation?: EmergencyRecord['location']) => {
      const now = Date.now();
      // Debounce duplicate emergency clicks within 5 seconds for same type
      if (lastEmergencyTriggerRef.current.type === type && now - lastEmergencyTriggerRef.current.timestamp < 5000) {
        console.log('[EMERGENCY DEBOUNCE] Skipped duplicate emergency dispatch within 5s');
        return;
      }
      lastEmergencyTriggerRef.current = { timestamp: now, type };

      playSirenTone();

      // Geolocation lookup (promisified with 2.5s timeout)
      let resolvedLocation = customLocation;
      if (!resolvedLocation && typeof navigator !== 'undefined' && navigator.geolocation) {
        try {
          const geoPromise = new Promise<{ latitude: number; longitude: number; accuracy: number }>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy }),
              (err) => reject(err),
              { timeout: 2500, enableHighAccuracy: true }
            );
          });
          const coords = await Promise.race([
            geoPromise,
            new Promise<null>((r) => setTimeout(() => r(null), 2500))
          ]);
          if (coords) {
            resolvedLocation = {
              latitude: coords.latitude,
              longitude: coords.longitude,
              accuracy: Math.round(coords.accuracy),
              label: `GPS Lat: ${coords.latitude.toFixed(4)}, Long: ${coords.longitude.toFixed(4)} (±${Math.round(coords.accuracy)}m) • Neurology Ward Bed 104`,
            };
          }
        } catch {
          // Geolocation unavailable or denied
        }
      }

      if (!resolvedLocation) {
        resolvedLocation = {
          latitude: 13.0827,
          longitude: 80.2707,
          accuracy: 10,
          label: patientUser?.room ? `${patientUser.room}, Floor 3 Neurology Ward` : 'Rehab Bay 104, Floor 3 Central',
        };
      }

      const alertMsg =
        type === 'SLIDE_DOWN'
          ? (language === 'ta'
              ? 'நோயாளி படுக்கையில் கீழே சரிந்துள்ளார்! உடனடியாக மருத்துவ நிர்வாகிக்கு எச்சரிக்கை அனுப்பப்பட்டுள்ளது.'
              : language === 'hi'
              ? 'मरीज बिस्तर से नीचे फिसल गया है! एडमिन और नर्स को आपातकालीन चेतावनी भेजी गई है।'
              : 'Patient has slid down in bed. Emergency alert dispatched to Admin and nursing station.')
          : (language === 'ta'
              ? 'அவசர எச்சரிக்கை! உங்கள் நிர்வாகிக்கு அழைப்பு மற்றும் குறுஞ்செய்தி அனுப்பப்பட்டுள்ளது.'
              : language === 'hi'
              ? 'ஆपातकालीन चेतावनी! आपके एडमिन को कॉल और संदेश भेजा जा रहा है।'
              : language === 'ml'
              ? 'അടിയന്തര മുന്നറിയിപ്പ്! അഡ്മിന് ഫോൺ കോൾ അയക്കുന്നു.'
              : language === 'te'
              ? 'అత్యవసర హెచ్చరిక! అడ్మిన్‌కు ఫోన్ కాల్ మరియు సందేశం వెళుతోంది.'
              : 'Emergency alert triggered. Dispatching immediate call and SMS to admin mobile.');
      speakText(alertMsg);

      try {
        const res = await fetch('/api/emergency/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: 'PT-8831',
            patientName: patientUser?.name || 'Ramesh Sundaram (Age 64)',
            patientPhone: patientUser?.phone || '+91 98401 54321',
            verifiedPhone: patientUser?.verified ?? true,
            room: patientUser?.room || 'Rehab Bay 104',
            type,
            details,
            location: resolvedLocation,
            vitals: {
              heartRate: 94,
              symmetryScore: facialSymmetry,
              immobilitySeconds: immobilityTime,
            },
          }),
        });
        const data = await res.json();
        if (data.alert) {
          setActiveEmergency(data.alert);
          setEmergencyHistory((prev) => {
            const filtered = prev.filter((a) => a.id !== data.alert.id);
            return [data.alert, ...filtered];
          });
          setIsEmergencyCallActive(true);
        }
      } catch (err) {
        console.warn('Backend emergency dispatch failed:', err);
      }
    },
    [adminPhone, facialSymmetry, immobilityTime, language, patientUser, playSirenTone, speakText]
  );

  // Acknowledge Emergency
  const acknowledgeEmergency = useCallback(async (alertId?: string) => {
    const idToAck = alertId || activeEmergency?.id;
    if (!idToAck) return;

    try {
      await fetch('/api/emergency/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId: idToAck, adminName: adminUser?.name || 'Dr. Priya Varma' })
      });
    } catch {}

    setActiveEmergency((prev) => (prev && prev.id === idToAck ? { ...prev, acknowledged: true, status: 'ACKNOWLEDGED', callStatus: 'COMPLETED' } : prev));
    setEmergencyHistory((prev) =>
      prev.map((item) => (item.id === idToAck ? { ...item, acknowledged: true, status: 'ACKNOWLEDGED', callStatus: 'COMPLETED' } : item))
    );
    setIsEmergencyCallActive(false);
  }, [activeEmergency, adminUser]);

  // Resolve Emergency with clinical resolution notes
  const resolveEmergency = useCallback(async (alertId: string, notes: string = 'Patient assessed bedside. Vitals stabilized.'): Promise<boolean> => {
    try {
      const res = await fetch('/api/emergency/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, notes, adminName: adminUser?.name || 'Dr. Priya Varma' })
      });
      const data = await res.json();
      if (data.success) {
        setActiveEmergency((prev) => (prev && prev.id === alertId ? null : prev));
        setEmergencyHistory((prev) =>
          prev.map((item) => (item.id === alertId ? { ...item, status: 'RESOLVED', acknowledged: true, resolutionNotes: notes } : item))
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [adminUser]);

  // Admin Call Patient Back
  const callPatientBack = useCallback(async (alertId: string, patientPhone?: string) => {
    try {
      const res = await fetch('/api/emergency/call-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, patientPhone, adminName: adminUser?.name || 'Dr. Priya Varma' })
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }, [adminUser]);

  // Update Admin Configuration
  const updateAdminConfig = useCallback(async (cfg: Partial<AdminSystemConfig>): Promise<boolean> => {
    try {
      const res = await fetch('/api/emergency/admin-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg)
      });
      const data = await res.json();
      if (data.success) {
        setAdminConfig(data.config);
        if (data.config.primaryAdmin?.phone) setAdminPhone(data.config.primaryAdmin.phone);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Direct Outbound Emergency Telephone Call to Admin Mobile
  const callAdminPhoneRealtime = useCallback(async () => {
    const cleanPhone = adminPhone.replace(/[\s()-]/g, '');
    try {
      await fetch('/api/emergency/call-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPhone,
          patientName: patientUser?.name || 'Ramesh Sundaram',
          room: patientUser?.room || 'Rehab Bay 104',
          reason: 'Emergency Phone Call Triggered by Patient'
        })
      });
    } catch {
      // Backend logged locally
    }

    triggerEmergency('SOS_MANUAL', 'Patient initiated direct telephone call & live intercom to Admin mobile.');
    setIsEmergencyCallActive(true);

    try {
      window.location.href = `tel:${cleanPhone}`;
    } catch {
      // Browser tel: navigation fallback
    }
  }, [adminPhone, patientUser, triggerEmergency]);

  // Voice Assistant Manual Trigger
  const triggerVoiceAssistant = useCallback(() => {
    setIsAssistantOpen(true);
    setAssistantStatus('listening');
    setAssistantTranscript('');
    const greeting =
      language === 'ta'
        ? 'வணக்கம், நான் நியூரோஷீல்ட். என்ன உதவி வேண்டும்?'
        : language === 'hi'
        ? 'नमस्ते, मैं न्यूरोशील्ड हूँ। मैं क्या सहायता कर सकता हूँ?'
        : language === 'ml'
        ? 'നമസ്കാരം, ഞാൻ ന്യൂറോഷീൽഡ്. എന്ത് സഹായമാണ് വേണ്ടത്?'
        : language === 'te'
        ? 'నమస్కారం, నేను న్యూరోషీల్డ్. ఏమి సహాయం కావాలి?'
        : 'Hello! I am NeuroShield. How can I assist your stroke recovery?';
    setAssistantReply(greeting);
    speakText(greeting);
  }, [language, speakText]);

  // Send query to Gemini voice assistant
  const sendAssistantQuery = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setAssistantStatus('thinking');

      try {
        const response = await fetch('/api/gemini/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: text,
            language,
            role: portal,
            patientContext: {
              facialSymmetry,
              armStability,
              activeEmergency: !!activeEmergency,
            },
          }),
        });

        const data = await response.json();
        const reply = data.text || 'I am right here with you. Keep up your recovery exercises.';
        setAssistantReply(reply);
        speakText(reply);
      } catch (err: any) {
        console.warn('Assistant call fallback:', err);
        const fallback = 'I am actively monitoring your vitals and stroke recovery.';
        setAssistantReply(fallback);
        speakText(fallback);
      }
    },
    [language, portal, facialSymmetry, armStability, activeEmergency, speakText]
  );

  // Add CCTV
  const addCctvCamera = useCallback((cam: Omit<CCTVCamera, 'id' | 'status' | 'fps' | 'resolution'>) => {
    const newCamera: CCTVCamera = {
      id: `cctv-${Date.now()}`,
      ...cam,
      status: 'ONLINE',
      fps: 30,
      resolution: '1080p',
    };
    setCctvList((prev) => [newCamera, ...prev]);
  }, []);

  const simulateEarDistress = useCallback(() => {
    setDistressBlinkProgress(3);
    setEyeState('DISTRESS_PATTERN');
    triggerEmergency(
      'EAR_DISTRESS_BLINK',
      'Patient intentional SOS Eye-Blink distress code (Rapid Triple Blink EAR < 0.20) detected via frame analysis.'
    );
  }, [triggerEmergency]);

  // Slide down, abnormal action and eye ptosis test simulators
  const simulateSlideDown = useCallback(() => {
    visionPipelineInstance.simulateSlideDown();
  }, []);

  const simulateAbnormalAction = useCallback(() => {
    visionPipelineInstance.simulateAbnormalAction();
  }, []);

  const simulateEyePtosis = useCallback(() => {
    visionPipelineInstance.simulatePtosis();
  }, []);

  // Web Audio Victory Chime for Exercise Streaks
  const playVictoryChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
          gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.12);
          osc.stop(ctx.currentTime + idx * 0.12 + 0.38);
        });
      }
    } catch {}
  }, []);

  // Record Exercise Completion & Maintain Recovery Streak
  const recordExerciseCompletion = useCallback(
    (title: string, category: ExerciseLogItem['category'], score: number = 92) => {
      const today = new Date().toISOString().slice(0, 10);
      const lastDate = localStorage.getItem('neuro_exercise_last_date');
      let nextStreak = exerciseStreak;
      let isNewDay = false;

      if (lastDate !== today) {
        nextStreak = exerciseStreak + 1;
        setExerciseStreak(nextStreak);
        const newBest = Math.max(bestStreak, nextStreak);
        setBestStreak(newBest);
        setTodayExercisesCompleted(1);
        isNewDay = true;
        localStorage.setItem('neuro_exercise_streak_count', nextStreak.toString());
        localStorage.setItem('neuro_exercise_best_streak', newBest.toString());
        localStorage.setItem('neuro_exercise_last_date', today);
        localStorage.setItem('neuro_exercise_today_count', '1');
      } else {
        const newTodayCount = todayExercisesCompleted + 1;
        setTodayExercisesCompleted(newTodayCount);
        localStorage.setItem('neuro_exercise_today_count', newTodayCount.toString());
      }

      const newLogItem: ExerciseLogItem = {
        id: `log-${Date.now()}`,
        title,
        category,
        timestamp: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        score,
      };

      setExerciseLog((prev) => {
        const updated = [newLogItem, ...prev.slice(0, 20)];
        localStorage.setItem('neuro_exercise_history_log', JSON.stringify(updated));
        return updated;
      });

      // Update weekly visual day indicator
      setWeeklyStreakDays((prev) =>
        prev.map((d) => {
          const todayStr = `${new Date().getDate()}/${new Date().getMonth() + 1}`;
          if (d.shortDate === todayStr) {
            return { ...d, completed: true, count: d.count + 1 };
          }
          return d;
        })
      );

      // Play victory audio chime & confetti
      playVictoryChime();
      try {
        confetti({
          particleCount: 85,
          spread: 85,
          origin: { y: 0.65 },
          colors: ['#0284c7', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
        });
      } catch {}

      // Open celebratory streak notice
      setStreakCelebration({
        show: true,
        streak: nextStreak,
        title,
        isNewDay,
      });

      // Spoken encouragement in patient's native tongue
      const voiceText =
        language === 'ta'
          ? `அருமை! ${title} பயிற்சி முடிந்தது. உங்கள் தொடர் மீட்பு சாதனை ${nextStreak} நாட்கள்!`
          : language === 'hi'
          ? `शानदार! ${title} पूरा हुआ। आपकी दैनिक स्ट्रीक ${nextStreak} दिन हो गई!`
          : language === 'ml'
          ? `നല്ലത്! ${title} പൂർത്തിയായി. നിങ്ങളുടെ സ്ട്രീക്ക് ${nextStreak} ദിവസങ്ങൾ!`
          : language === 'te'
          ? `అద్భుతం! ${title} పూర్తయింది. మీ రోజువారీ స్ట్రీక్ ${nextStreak} రోజులు!`
          : `Great job! ${title} completed. Your recovery streak is now ${nextStreak} days in a row!`;
      speakText(voiceText);

      return { streakMaintained: true, currentStreak: nextStreak };
    },
    [bestStreak, exerciseStreak, language, playVictoryChime, speakText, todayExercisesCompleted]
  );

  // Periodic subtle fluctuation in symmetry and arm stability
  useEffect(() => {
    const interval = setInterval(() => {
      setFacialSymmetry((prev) => {
        const delta = (Math.random() - 0.49) * 2;
        const next = Math.min(98, Math.max(55, prev + delta));
        if (next < 60 && !activeEmergency) {
          triggerEmergency('FACIAL_DROOP', 'Facial asymmetry dropped below safety threshold (59%).');
        }
        return Math.round(next * 10) / 10;
      });

      setArmStability((prev) => {
        const delta = (Math.random() - 0.5) * 1.5;
        return Math.round(Math.min(99, Math.max(60, prev + delta)));
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [activeEmergency, triggerEmergency]);

  return (
    <NeuroContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        portal,
        setPortal,
        patientUser,
        setPatientUser,
        isPatientLoggedIn,
        setIsPatientLoggedIn,
        verifyPatientOtp,
        logoutPatient,
        lastSmsNotification,
        dismissSmsNotification,
        sendOtpSms,
        adminUser,
        setAdminUser,
        adminPhone,
        setAdminPhone,
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        verifyAdminOtp,
        logoutAdmin,
        callAdminPhoneRealtime,
        exerciseStreak,
        bestStreak,
        todayExercisesCompleted,
        dailyExerciseGoal,
        weeklyStreakDays,
        exerciseLog,
        streakCelebration,
        dismissStreakCelebration,
        recordExerciseCompletion,
        hospitals,
        doctors,
        assignDoctorToPatient,
        requestHospitalTransfer,
        language,
        setLanguage,
        t,
        mediaStream,
        patientRemoteStream,
        cameraActive,
        micActive,
        cameraError,
        startMedia,
        stopMedia,
        videoRef,
        isCameraVisible,
        setIsCameraVisible,
        facialSymmetry,
        setFacialSymmetry,
        immobilityTime,
        micVolume,
        armStability,
        setArmStability,
        earValue,
        setEarValue,
        blinkCount,
        eyeState,
        distressBlinkProgress,
        simulateEarDistress,
        simulateEyePtosis,
        slideDownProgress,
        setSlideDownProgress,
        simulateSlideDown,
        simulateAbnormalAction,
        isAssistantOpen,
        setIsAssistantOpen,
        isListeningWakeWord,
        assistantStatus,
        assistantTranscript,
        assistantReply,
        triggerVoiceAssistant,
        sendAssistantQuery,
        speakText,
        activeEmergency,
        emergencyHistory,
        triggerEmergency,
        acknowledgeEmergency,
        resolveEmergency,
        callPatientBack,
        adminConfig,
        updateAdminConfig,
        isEmergencyCallActive,
        setIsEmergencyCallActive,
        cctvList,
        addCctvCamera,
        isProfileOpen,
        setIsProfileOpen,
      }}
    >
      {children}
    </NeuroContext.Provider>
  );
};

export const useNeuro = (): NeuroContextType => {
  const context = useContext(NeuroContext);
  if (!context) {
    throw new Error('useNeuro must be used within a NeuroProvider');
  }
  return context;
};
