import React, { useState, useEffect } from 'react';
import { useNeuro } from '../context/NeuroContext';
import { HospitalCollaborationHub } from './HospitalCollaborationHub';
import {
  Shield,
  Phone,
  PhoneCall,
  Video,
  Plus,
  AlertTriangle,
  CheckCircle,
  Activity,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  Eye,
  Lock,
  MessageSquare,
  Radio,
  SlidersHorizontal,
  Mail,
  User,
  Building2,
  MicOff,
  CameraOff,
  LogOut,
  Sparkles,
  ArrowRight,
  MapPin,
  ExternalLink,
  FileText,
  Settings,
  AlertOctagon,
  Clock,
  UserCheck,
  Volume2,
  Bell,
  BellRing,
  X,
  PhoneForwarded,
  CheckCircle2,
  Send
} from 'lucide-react';
import { CCTVCamera, EmergencyRecord } from '../context/NeuroContext';

export const AdminPortal: React.FC = () => {
  const {
    adminUser,
    adminPhone,
    setAdminPhone,
    isAdminLoggedIn,
    verifyAdminOtp,
    sendOtpSms,
    logoutAdmin,
    setCurrentScreen,
    cctvList,
    addCctvCamera,
    activeEmergency,
    slideDownProgress,
    emergencyHistory,
    facialSymmetry,
    armStability,
    earValue,
    doctors,
    triggerEmergency,
    acknowledgeEmergency,
    resolveEmergency,
    callPatientBack,
    adminConfig,
    updateAdminConfig,
    setIsEmergencyCallActive,
    t
  } = useNeuro();

  // Admin login states (Name, Email, Phone, OTP)
  const [nameInput, setNameInput] = useState('Dr. Priya Varma');
  const [emailInput, setEmailInput] = useState('priya.varma@apollo-neuro.org');
  const [phoneInput, setPhoneInput] = useState(adminPhone);
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [dispatchedOtp, setDispatchedOtp] = useState<string>('');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [loginError, setLoginError] = useState('');

  // CCTV & View states
  const [activeTab, setActiveTab] = useState<'patientCam' | 'collaboration' | 'cctvGrid' | 'alerts'>('patientCam');
  const [isAddCctvOpen, setIsAddCctvOpen] = useState(false);
  const [newCamName, setNewCamName] = useState('');
  const [newCamLocation, setNewCamLocation] = useState('');
  const [newCamIp, setNewCamIp] = useState('192.168.1.');
  const [nightVision, setNightVision] = useState(false);

  // Emergency Management States
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('Patient attended bedside by clinical nurse team. Vitals stable; motor response restored.');
  const [viewingLogsAlert, setViewingLogsAlert] = useState<EmergencyRecord | null>(null);
  const [callingPatientStatus, setCallingPatientStatus] = useState<string | null>(null);
  const [testAlertSending, setTestAlertSending] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Admin Telephony Settings Form
  const [cfgPrimaryName, setCfgPrimaryName] = useState(adminConfig?.primaryAdmin?.name || 'Dr. Priya Varma');
  const [cfgPrimaryPhone, setCfgPrimaryPhone] = useState(adminConfig?.primaryAdmin?.phone || adminPhone);
  const [cfgPrimaryEmail, setCfgPrimaryEmail] = useState(adminConfig?.primaryAdmin?.email || 'priya.varma@apollo-neuro.org');
  const [cfgBackupName, setCfgBackupName] = useState(adminConfig?.backupAdmin?.name || 'Dr. Arvind Swaminathan (On-Call)');
  const [cfgBackupPhone, setCfgBackupPhone] = useState(adminConfig?.backupAdmin?.phone || '+91 98402 77112');
  const [cfgBackupEmail, setCfgBackupEmail] = useState(adminConfig?.backupAdmin?.email || 'a.swaminathan@apollohospitals.com');
  const [cfgTimeout, setCfgTimeout] = useState(adminConfig?.callTimeoutSeconds || 25);
  const [cfgMaxRetries, setCfgMaxRetries] = useState(adminConfig?.maxRetries || 2);
  const [cfgAutoEscalate, setCfgAutoEscalate] = useState(adminConfig?.autoEscalateToBackup ?? true);
  const [cfgProvider, setCfgProvider] = useState<'TWILIO_VOICE' | 'TELEPHONY_GATEWAY_SERVICE'>(adminConfig?.telephonyProvider || 'TELEPHONY_GATEWAY_SERVICE');
  const [configSaving, setConfigSaving] = useState(false);
  const [configSaveMsg, setConfigSaveMsg] = useState('');

  // Keep settings form synced when adminConfig updates from server
  useEffect(() => {
    if (adminConfig) {
      if (adminConfig.primaryAdmin?.name) setCfgPrimaryName(adminConfig.primaryAdmin.name);
      if (adminConfig.primaryAdmin?.phone) setCfgPrimaryPhone(adminConfig.primaryAdmin.phone);
      if (adminConfig.primaryAdmin?.email) setCfgPrimaryEmail(adminConfig.primaryAdmin.email);
      if (adminConfig.backupAdmin?.name) setCfgBackupName(adminConfig.backupAdmin.name);
      if (adminConfig.backupAdmin?.phone) setCfgBackupPhone(adminConfig.backupAdmin.phone);
      if (adminConfig.backupAdmin?.email) setCfgBackupEmail(adminConfig.backupAdmin.email);
      if (adminConfig.callTimeoutSeconds) setCfgTimeout(adminConfig.callTimeoutSeconds);
      if (adminConfig.maxRetries) setCfgMaxRetries(adminConfig.maxRetries);
      if (typeof adminConfig.autoEscalateToBackup === 'boolean') setCfgAutoEscalate(adminConfig.autoEscalateToBackup);
      if (adminConfig.telephonyProvider) setCfgProvider(adminConfig.telephonyProvider);
    }
  }, [adminConfig]);

  // OTP Countdown timer
  useEffect(() => {
    let timer: any;
    if (otpSent && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, otpCountdown]);

  const handleSendOtp = async () => {
    if (!phoneInput || phoneInput.length < 8) {
      setLoginError('Please enter a valid mobile number with country code (e.g. +91 98401 23456)');
      return;
    }
    if (!emailInput || !emailInput.includes('@')) {
      setLoginError('Please enter a valid hospital email address.');
      return;
    }
    setLoginError('');
    try {
      const res = await sendOtpSms(phoneInput, 'doctor');
      if (res.success) {
        setOtpSent(true);
        setOtpCountdown(res.cooldownRemaining || 60);
        if (res.otpCode) setDispatchedOtp(res.otpCode);
      } else {
        setLoginError(res.message || 'Failed to dispatch OTP code.');
        if (res.cooldownRemaining) setOtpCountdown(res.cooldownRemaining);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Error communicating with SMS Gateway.');
    }
  };

  const handleAutoFillOtp = () => {
    if (dispatchedOtp) {
      setOtpInput(dispatchedOtp);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      handleSendOtp();
      return;
    }
    if (!otpInput || otpInput.trim().length !== 6) {
      setLoginError('Please enter the 6-digit OTP code sent via SMS.');
      return;
    }
    const result = await verifyAdminOtp(nameInput, emailInput, phoneInput, otpInput.trim());
    if (!result.success) {
      setLoginError(result.message || 'Invalid or expired OTP code.');
    } else {
      setLoginError('');
    }
  };

  // If not logged in, render the 4-field OTP Login Gate
  if (!isAdminLoggedIn) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Clinical Admin &amp; Hospital Gate</h2>
                <p className="text-xs text-slate-400">Doctor Authentication &amp; Multi-Hospital Sentinel</p>
              </div>
            </div>

            <button
              onClick={() => setCurrentScreen('gateway')}
              className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              Back to Portals
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Field 1: Admin Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Official Doctor / Admin Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400" />
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Dr. Priya Varma"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Field 2: Hospital Email ID */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Official Hospital Email ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. priya.varma@apollo-neuro.org"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Field 3: Mobile Phone Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Mobile Phone (Emergency SMS &amp; Call Alert Destination)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400" />
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+91 98401 23456"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow whitespace-nowrap"
                  >
                    Send OTP
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpCountdown > 0}
                    className="rounded-xl border border-slate-700 bg-slate-800 disabled:opacity-50 px-3 py-2.5 text-xs text-slate-300 whitespace-nowrap"
                  >
                    Resend {otpCountdown > 0 ? `(${otpCountdown}s)` : ''}
                  </button>
                )}
              </div>
            </div>

            {/* Field 4: OTP Verification Code */}
            {otpSent && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Enter 6-Digit OTP Code
                  </label>
                  {dispatchedOtp ? (
                    <button
                      type="button"
                      onClick={handleAutoFillOtp}
                      className="text-[11px] text-emerald-400 underline font-semibold"
                    >
                      Paste Received OTP ({dispatchedOtp})
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Check SMS inbox
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-base font-mono font-bold tracking-widest text-emerald-400 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {dispatchedOtp ? (
                    <>Security code <strong className="text-white font-mono">{dispatchedOtp}</strong> dispatched to {phoneInput} via SMS.</>
                  ) : (
                    <>SMS verification code sent to {phoneInput}.</>
                  )}
                </p>
              </div>
            )}

            {loginError && <p className="text-xs text-rose-400 font-semibold">{loginError}</p>}

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-3.5 text-xs font-bold text-white shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              <span>{otpSent ? 'Verify OTP & Enter Command Center' : 'Generate Security OTP'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  const assignedDoctor = doctors.find((d) => d.currentPatientAssigned) || doctors[0];

  const handleAddCctvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCamName && newCamIp) {
      addCctvCamera({
        name: newCamName,
        location: newCamLocation || 'Ward Surveillance',
        ipAddress: newCamIp,
        type: 'NEARBY_CCTV',
      });
      setIsAddCctvOpen(false);
      setNewCamName('');
      setNewCamLocation('');
      setNewCamIp('192.168.1.');
    }
  };

  const [alertSubTab, setAlertSubTab] = useState<'queue' | 'settings'>('queue');
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'>('ALL');

  const handleSaveAdminConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaving(true);
    setConfigSaveMsg('');
    const ok = await updateAdminConfig({
      primaryAdmin: {
        name: cfgPrimaryName,
        phone: cfgPrimaryPhone,
        email: cfgPrimaryEmail,
        role: 'Attending Neurologist & Clinical Administrator'
      },
      backupAdmin: {
        name: cfgBackupName,
        phone: cfgBackupPhone,
        email: cfgBackupEmail,
        role: 'On-Call Vascular Neurosurgeon & Backup Admin'
      },
      callTimeoutSeconds: Number(cfgTimeout),
      maxRetries: Number(cfgMaxRetries),
      autoEscalateToBackup: cfgAutoEscalate,
      telephonyProvider: cfgProvider
    });
    setConfigSaving(false);
    if (ok) {
      setConfigSaveMsg('Emergency Telephony & Backup Admin configurations saved successfully.');
      setTimeout(() => setConfigSaveMsg(''), 4000);
    } else {
      setConfigSaveMsg('Failed to update configurations. Please check network.');
    }
  };

  const handleCallPatient = async (alert: EmergencyRecord) => {
    const targetPhone = alert.patientPhone || '+91 98401 54321';
    setCallingPatientStatus(`Initiating telephony call to ${alert.patientName || 'Patient'} at ${targetPhone}...`);
    try {
      const res = await callPatientBack(alert.id, targetPhone);
      if (res && res.success) {
        setCallingPatientStatus(`Call dispatched! Provider Call SID: ${res.callSid || 'VOICE-OUTBOUND'}`);
      } else {
        setCallingPatientStatus(res?.message || 'Call initiated. Connecting via device dialer...');
      }
      try {
        window.location.href = `tel:${targetPhone.replace(/[\s()-]/g, '')}`;
      } catch {}
    } catch (err: any) {
      setCallingPatientStatus(`Calling error: ${err.message}`);
    }
    setTimeout(() => setCallingPatientStatus(null), 5000);
  };

  const handleConfirmResolve = async () => {
    if (!resolvingAlertId) return;
    await resolveEmergency(resolvingAlertId, resolutionNotes);
    setResolvingAlertId(null);
  };

  const handleTriggerTestEmergency = async () => {
    setTestAlertSending(true);
    await triggerEmergency('FACIAL_DROOP', 'Manual clinical test alert: acute asymmetric motor weakness (admin simulated).');
    setTestAlertSending(false);
  };

  return (
    <div className="space-y-6">
      {/* High-Priority Active Emergency Sentinel Banner for Admin */}
      {activeEmergency && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border-2 border-rose-500 bg-gradient-to-r from-rose-950/95 via-red-950 to-slate-950 p-5 shadow-2xl shadow-rose-950/80 animate-pulse backdrop-blur-xl">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-xl shadow-rose-600/40 animate-bounce">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-rose-900 px-2.5 py-0.5 text-[10px] font-mono font-black text-rose-200 border border-rose-500 uppercase tracking-widest">
                  URGENT PATIENT ALERT
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  BAY 104 • {activeEmergency.type.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                {activeEmergency.type === 'SLIDE_DOWN'
                  ? 'PATIENT HAS SLID DOWN IN BED! Immediate Attention Needed'
                  : activeEmergency.type === 'ABNORMAL_ACTION'
                  ? 'ABNORMAL MOTOR ACTION / INVOLUNTARY CONVULSION DETECTED'
                  : activeEmergency.details}
              </h3>
              <p className="text-xs text-rose-200/90 font-mono">
                {activeEmergency.details} • Dispatched to {adminPhone}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEmergencyCallActive(true)}
              className="rounded-2xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-rose-600/30 flex items-center gap-2 transition"
            >
              <PhoneCall className="h-4 w-4 animate-pulse" />
              <span>Open Patient Intercom</span>
            </button>
            <button
              onClick={() => acknowledgeEmergency()}
              className="rounded-2xl border border-rose-400/60 bg-rose-900/60 hover:bg-rose-800 px-3.5 py-2.5 text-xs font-bold text-white transition"
            >
              Acknowledge &amp; Dispatch Nurse
            </button>
          </div>
        </div>
      )}

      {/* Admin Top Dashboard Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                {adminUser?.name || 'Dr. Priya Varma'}
              </h2>
              <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                OTP VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {adminUser?.email || 'priya.varma@apollo-neuro.org'} • Alert Phone: <span className="font-mono font-bold text-emerald-400">{adminPhone}</span>
            </p>
          </div>
        </div>

        {/* Tab Switcher & Logout */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('patientCam')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === 'patientCam'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Video className="h-4 w-4" /> Live Patient CCTV
          </button>

          <button
            onClick={() => setActiveTab('collaboration')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === 'collaboration'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Building2 className="h-4 w-4" /> Hospitals &amp; Doctors
          </button>

          <button
            onClick={() => setActiveTab('cctvGrid')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === 'cctvGrid'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Radio className="h-4 w-4" /> CCTV Grid ({cctvList.length})
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === 'alerts'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="h-4 w-4" /> Emergency Log ({emergencyHistory.length})
          </button>

          <button
            onClick={logoutAdmin}
            className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs text-slate-300 flex items-center gap-1 transition"
            title="Sign out of Admin Portal"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-400" /> Exit
          </button>
        </div>
      </div>

      {/* Hardware Privacy Notice: Camera and Mic are strictly OFF for Admin */}
      <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-2.5 text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <CameraOff className="h-4 w-4 text-emerald-400" />
          <MicOff className="h-4 w-4 text-emerald-400" />
          <span>
            <strong>Clinician Privacy Enforced:</strong> Admin local camera and microphone are strictly <strong>DISABLED</strong>. You are observing the remote Patient Room 104 stream without broadcasting your own hardware.
          </span>
        </div>
        <span className="font-mono text-[10px] bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700">
          RECEIVER ONLY
        </span>
      </div>

      {/* Tab 1: Live Patient Camera Observation & Telemetry */}
      {activeTab === 'patientCam' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-bold text-white tracking-wider uppercase">
                    Remote Patient Vision Stream • Room 104
                  </span>
                </div>
                <button
                  onClick={() => setIsEmergencyCallActive(true)}
                  className="rounded-xl bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 shadow"
                >
                  <PhoneCall className="h-3.5 w-3.5" /> Start Emergency Audio Intercom
                </button>
              </div>

              {/* Remote Patient Stream HUD (Simulated remote camera observer) */}
              <div className="relative aspect-video w-full rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
                {/* Visual scanlines & CCTV telemetry overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

                <div className="text-center space-y-2 p-6">
                  <Radio className="h-12 w-12 text-emerald-400 mx-auto animate-pulse" />
                  <h4 className="text-base font-bold text-white">Patient Bed 104 • Live Ambient Stream</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Continuous remote ambient CCTV receiving feed from patient bed. Local admin camera/mic remains strictly off.
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <span className="rounded bg-slate-900 px-2.5 py-1 text-[11px] font-mono text-sky-400 border border-slate-800">
                      EAR: {earValue.toFixed(2)} (Blink Sentinel Armed)
                    </span>
                    <span className="rounded bg-slate-900 px-2.5 py-1 text-[11px] font-mono text-emerald-400 border border-slate-800">
                      Face Symmetry: {facialSymmetry}%
                    </span>
                  </div>
                </div>

                {/* Top Video OSD */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded bg-slate-900/90 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-400 border border-slate-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>REMOTE RTSP 1080p @ 30 FPS</span>
                </div>

                <div className="absolute top-3 right-3 rounded bg-slate-900/90 px-2.5 py-1 text-[10px] font-mono text-slate-300 border border-slate-800">
                  IP: 192.168.1.142:554
                </div>
              </div>
            </div>
          </div>

          {/* Patient Quick Vitals & Specialist In-Charge */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Patient Status &amp; Assigned Neurologist
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 border border-slate-800 text-xs">
                  <span className="text-slate-400">Patient:</span>
                  <span className="font-bold text-white">{t('patientName')}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 border border-slate-800 text-xs">
                  <span className="text-slate-400">Attending Doctor:</span>
                  <span className="font-bold text-emerald-400">{assignedDoctor.name}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 border border-slate-800 text-xs">
                  <span className="text-slate-400">Eye Aspect Ratio:</span>
                  <span className="font-mono font-bold text-sky-400">{earValue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 border border-slate-800 text-xs">
                  <span className="text-slate-400">Facial Symmetry:</span>
                  <span
                    className={`font-mono font-bold ${
                      facialSymmetry > 75 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {facialSymmetry}%
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-3 border border-slate-800 text-xs">
                  <span className="text-slate-400">Motor Tone:</span>
                  <span className="font-mono font-bold text-indigo-400">{armStability}%</span>
                </div>
              </div>

              {/* Manual Dispatch Call Button */}
              <div className="pt-2">
                <button
                  onClick={() => triggerEmergency('SOS_MANUAL', 'Admin manually initiated clinical emergency alert.')}
                  className="w-full rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 py-3 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:from-rose-500 hover:to-red-600 transition flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" /> Trigger Urgent Call &amp; SMS Dispatch
                </button>
              </div>
            </div>

            {/* Admin Alert Configuration */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-emerald-400" /> Emergency Alert Recipient
              </h4>
              <p className="text-xs text-slate-400">
                Patient emergencies auto-dispatch calls and SMS to verified admin mobile:
              </p>
              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Verified Phone:</span>
                <span className="font-mono font-bold text-emerald-400">{adminPhone}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Hospital & Doctor Collaboration Hub */}
      {activeTab === 'collaboration' && <HospitalCollaborationHub />}

      {/* Tab 3: CCTV & Nearby IP Camera Monitor */}
      {activeTab === 'cctvGrid' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">{t('nearbyCameras')}</h3>
              <p className="text-xs text-slate-400">
                Live surveillance via hospital network IP addresses, RTSP, and patient room streams
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setNightVision(!nightVision)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border transition ${
                  nightVision
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Eye className="h-3.5 w-3.5" /> Night Vision IR
              </button>

              <button
                onClick={() => setIsAddCctvOpen(true)}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white flex items-center gap-1.5 shadow"
              >
                <Plus className="h-4 w-4" /> {t('addIpCamera')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cctvList.map((cam) => (
              <div
                key={cam.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl"
              >
                <div
                  className={`relative aspect-video w-full flex items-center justify-center overflow-hidden ${
                    nightVision ? 'bg-emerald-950/80 grayscale contrast-125' : 'bg-slate-950'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <Radio className="h-10 w-10 text-emerald-400 mb-2 animate-pulse" />
                    <p className="text-xs font-semibold text-white">{cam.name}</p>
                    <p className="text-[10px] font-mono text-emerald-400 mt-1">IP: {cam.ipAddress}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">RTSP H.264 • 1080p @ {cam.fps} FPS</p>
                  </div>

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded bg-slate-950/80 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-slate-800 backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>REC {cam.resolution}</span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 rounded bg-slate-950/80 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-800 backdrop-blur">
                    {cam.ipAddress}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-900 border-t border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-white">{cam.name}</h4>
                    <p className="text-[11px] text-slate-400">{cam.location}</p>
                  </div>
                  <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-800">
                    {cam.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {isAddCctvOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
              <div className="relative w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
                <h3 className="text-base font-bold text-white">{t('addIpCamera')}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Connect nearby IP cameras or CCTV through local network IP address.
                </p>

                <form onSubmit={handleAddCctvSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {t('cameraName')}
                    </label>
                    <input
                      type="text"
                      value={newCamName}
                      onChange={(e) => setNewCamName(e.target.value)}
                      placeholder="e.g. Rehab Bay 2 / Hallway East"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Physical Location / Ward
                    </label>
                    <input
                      type="text"
                      value={newCamLocation}
                      onChange={(e) => setNewCamLocation(e.target.value)}
                      placeholder="e.g. Neurology Ward 3"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {t('ipAddressLabel')}
                    </label>
                    <input
                      type="text"
                      value={newCamIp}
                      onChange={(e) => setNewCamIp(e.target.value)}
                      placeholder="192.168.1.185:554 or rtsp://..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddCctvOpen(false)}
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white shadow"
                    >
                      Connect Stream
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Emergency Alert Management Center */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Status Toast when calling patient back */}
          {callingPatientStatus && (
            <div className="flex items-center justify-between rounded-2xl border border-sky-500/50 bg-sky-950/90 px-5 py-3.5 text-xs text-sky-200 shadow-xl backdrop-blur animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <PhoneCall className="h-4 w-4 text-sky-400 animate-bounce" />
                <span>{callingPatientStatus}</span>
              </div>
              <button
                onClick={() => setCallingPatientStatus(null)}
                className="text-sky-400 hover:text-white p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Sub Navigation Bar for Alerts */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
                <AlertOctagon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Emergency Operations &amp; Admin Telephony
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time automated incident dispatch, telephony calling, and backup administrator failover
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  onClick={() => setAlertSubTab('queue')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
                    alertSubTab === 'queue'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Incident Queue ({emergencyHistory.length})</span>
                </button>
                <button
                  onClick={() => setAlertSubTab('settings')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
                    alertSubTab === 'settings'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Admin Telephony Settings</span>
                </button>
              </div>

              <button
                onClick={handleTriggerTestEmergency}
                disabled={testAlertSending}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-3.5 py-2 text-xs font-bold text-white flex items-center gap-1.5 shadow transition disabled:opacity-50"
                title="Dispatch simulated test emergency to test automated call & SMS"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{testAlertSending ? 'Dispatching...' : 'Trigger Test Alert'}</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Alerts</span>
              <p className="text-2xl font-black text-white mt-1 font-mono">{emergencyHistory.length}</p>
              <span className="text-[10px] text-slate-500">Recorded in session database</span>
            </div>

            <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                Pending Action
              </span>
              <p className="text-2xl font-black text-rose-400 mt-1 font-mono">
                {emergencyHistory.filter((a) => !a.acknowledged && a.status !== 'RESOLVED').length}
              </p>
              <span className="text-[10px] text-rose-400/70">Awaiting clinical acknowledgment</span>
            </div>

            <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">Resolved Alerts</span>
              <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                {emergencyHistory.filter((a) => a.status === 'RESOLVED').length}
              </p>
              <span className="text-[10px] text-emerald-400/70">Clinical assessments closed</span>
            </div>

            <div className="rounded-2xl border border-sky-900/40 bg-sky-950/20 p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-300">Active Admin Mobile</span>
              <p className="text-sm font-bold text-white mt-2 font-mono truncate">{adminPhone}</p>
              <span className="text-[10px] text-sky-400">
                {adminConfig?.telephonyProvider === 'TWILIO_VOICE' ? 'Twilio Voice API' : 'Telephony Voice Gateway'}
              </span>
            </div>
          </div>

          {/* SubTab 1: Incident Queue */}
          {alertSubTab === 'queue' && (
            <div className="space-y-4">
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <span className="text-xs text-slate-400 mr-2">Filter By:</span>
                {(['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'] as const).map((flt) => (
                  <button
                    key={flt}
                    onClick={() => setAlertFilter(flt)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      alertFilter === flt
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {flt === 'ALL' && `All Alerts (${emergencyHistory.length})`}
                    {flt === 'ACTIVE' && `Needs Action (${emergencyHistory.filter((a) => !a.acknowledged && a.status !== 'RESOLVED').length})`}
                    {flt === 'ACKNOWLEDGED' && `Acknowledged (${emergencyHistory.filter((a) => a.acknowledged && a.status !== 'RESOLVED').length})`}
                    {flt === 'RESOLVED' && `Resolved (${emergencyHistory.filter((a) => a.status === 'RESOLVED').length})`}
                  </button>
                ))}
              </div>

              {/* Alerts List */}
              <div className="space-y-4">
                {emergencyHistory
                  .filter((a) => {
                    if (alertFilter === 'ACTIVE') return !a.acknowledged && a.status !== 'RESOLVED';
                    if (alertFilter === 'ACKNOWLEDGED') return a.acknowledged && a.status !== 'RESOLVED';
                    if (alertFilter === 'RESOLVED') return a.status === 'RESOLVED';
                    return true;
                  })
                  .map((rec) => {
                    const isPending = !rec.acknowledged && rec.status !== 'RESOLVED';
                    const isResolved = rec.status === 'RESOLVED';

                    return (
                      <div
                        key={rec.id}
                        className={`overflow-hidden rounded-3xl border p-5 transition shadow-xl ${
                          isPending
                            ? 'border-rose-500/80 bg-rose-950/20'
                            : isResolved
                            ? 'border-slate-800 bg-slate-900/60 opacity-90'
                            : 'border-emerald-500/50 bg-slate-900/90'
                        }`}
                      >
                        {/* Top Alert Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="rounded-xl bg-rose-600/30 p-2 text-rose-400 border border-rose-500/40">
                              <AlertTriangle className="h-5 w-5" />
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white tracking-wide">
                                  {rec.type.replace(/_/g, ' ')}
                                </span>
                                <span className="rounded bg-rose-950 px-2 py-0.5 text-[10px] font-black text-rose-400 border border-rose-800">
                                  {rec.severity}
                                </span>
                                <span
                                  className={`rounded px-2.5 py-0.5 text-[10px] font-mono font-bold border ${
                                    rec.status === 'NEW'
                                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                                      : rec.status === 'CALLING_ADMIN'
                                      ? 'bg-sky-950 text-sky-300 border-sky-800 animate-pulse'
                                      : rec.status === 'ADMIN_NOTIFIED'
                                      ? 'bg-blue-950 text-blue-300 border-blue-800'
                                      : rec.status === 'ACKNOWLEDGED'
                                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                      : rec.status === 'RESOLVED'
                                      ? 'bg-slate-950 text-slate-400 border-slate-800'
                                      : rec.status === 'FAILED'
                                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                                      : 'bg-purple-950 text-purple-300 border-purple-800'
                                  }`}
                                >
                                  STATUS: {rec.status || 'NEW'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-0.5">{rec.details}</p>
                            </div>
                          </div>

                          <div className="text-right text-xs text-slate-400 font-mono">
                            <div className="flex items-center gap-1.5 justify-end">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span>{new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            </div>
                            <span className="text-[10px] text-slate-500">ID: {rec.id}</span>
                          </div>
                        </div>

                        {/* Patient & Location Card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3.5 border-b border-slate-800/60 text-xs">
                          {/* Patient info */}
                          <div className="space-y-1 rounded-2xl bg-slate-950/70 p-3 border border-slate-800">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-sky-400" /> Patient Details:
                              </span>
                              <span className="rounded bg-sky-950 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-400 border border-sky-800 flex items-center gap-1">
                                <UserCheck className="h-3 w-3" />
                                {rec.verifiedPhone ? '✓ Verified Phone (OTP Authenticated)' : 'Unverified Phone'}
                              </span>
                            </div>
                            <div className="text-sm font-bold text-white">
                              {rec.patientName || 'Ramesh Sundaram (Age 64)'} • {rec.room || 'Rehab Bay 104'}
                            </div>
                            <div className="text-xs text-slate-300 flex items-center gap-2">
                              <span>Patient Phone:</span>
                              <strong className="font-mono text-emerald-400">{rec.patientPhone || '+91 98401 54321'}</strong>
                            </div>
                          </div>

                          {/* Location & GPS */}
                          <div className="space-y-1 rounded-2xl bg-slate-950/70 p-3 border border-slate-800">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-rose-400" /> Incident Location:
                              </span>
                              {rec.location?.latitude && (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${rec.location.latitude},${rec.location.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 underline"
                                >
                                  <span>View on Maps</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                            <div className="text-xs font-semibold text-white">
                              {rec.location?.label || 'Rehab Bay 104, Floor 3 Neurology Ward'}
                            </div>
                            {rec.location?.latitude != null && rec.location?.longitude != null && (
                              <div className="text-[11px] font-mono text-slate-400">
                                Coords: {rec.location.latitude.toFixed(4)}° N, {rec.location.longitude.toFixed(4)}° E (±{rec.location.accuracy || 10}m)
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Telephony and Delivery Audit Box */}
                        <div className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex flex-wrap items-center gap-3 text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Admin Phone Call:</span>
                              <strong
                                className={`font-mono px-2 py-0.5 rounded text-[11px] border ${
                                  rec.callStatus === 'RINGING' || rec.callStatus === 'INITIATING'
                                    ? 'bg-sky-950 text-sky-300 border-sky-800 animate-pulse'
                                    : rec.callStatus === 'ANSWERED' || rec.callStatus === 'CONNECTED'
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                    : rec.callStatus === 'COMPLETED'
                                    ? 'bg-slate-900 text-slate-300 border-slate-700'
                                    : 'bg-rose-950 text-rose-300 border-rose-800'
                                }`}
                              >
                                {rec.callStatus || 'INITIATING'}
                              </strong>
                              <span className="text-[10px] text-slate-500 font-mono">({rec.adminPhone || adminPhone})</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5 text-sky-400" />
                              <span>SMS Dispatch:</span>
                              <strong className="text-emerald-400 font-mono text-[11px]">{rec.smsStatus || 'SMS DELIVERED'}</strong>
                            </div>

                            {rec.callProvider && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                Provider: {rec.callProvider === 'TWILIO_VOICE' ? 'Twilio Voice' : 'Telephony Gateway'}
                              </span>
                            )}
                          </div>

                          {rec.resolutionNotes && (
                            <div className="w-full rounded-xl bg-slate-950 p-2.5 text-xs text-slate-300 border border-slate-800">
                              <span className="text-emerald-400 font-bold">Clinical Resolution: </span>
                              <span>{rec.resolutionNotes}</span>
                              {rec.resolvedAt && (
                                <span className="text-[10px] text-slate-500 ml-2 font-mono">
                                  ({new Date(rec.resolvedAt).toLocaleTimeString()})
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons Row */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                          <div className="flex items-center gap-2">
                            {/* Call Patient Back Button */}
                            <button
                              onClick={() => handleCallPatient(rec)}
                              className="rounded-xl bg-sky-600 hover:bg-sky-500 px-3.5 py-2 text-xs font-bold text-white shadow transition flex items-center gap-1.5"
                              title={`Initiate immediate phone call back to ${rec.patientPhone || 'patient'}`}
                            >
                              <PhoneCall className="h-3.5 w-3.5" />
                              <span>Call Patient ({rec.patientPhone || '+91 98401 54321'})</span>
                            </button>

                            {/* View Call Logs */}
                            <button
                              onClick={() => setViewingLogsAlert(rec)}
                              className="rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition flex items-center gap-1.5"
                            >
                              <FileText className="h-3.5 w-3.5 text-slate-400" />
                              <span>Call Logs</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Acknowledge Button */}
                            {!rec.acknowledged ? (
                              <button
                                onClick={() => acknowledgeEmergency(rec.id)}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow transition flex items-center gap-1.5"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>Acknowledge Alert</span>
                              </button>
                            ) : (
                              <span className="rounded-xl bg-emerald-950/60 border border-emerald-800 px-3 py-2 text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Acknowledged</span>
                              </span>
                            )}

                            {/* Mark Resolved Button */}
                            {!isResolved ? (
                              <button
                                onClick={() => setResolvingAlertId(rec.id)}
                                className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-200 transition flex items-center gap-1.5"
                              >
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Mark Resolved</span>
                              </button>
                            ) : (
                              <span className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-500">
                                Resolved
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* SubTab 2: Telephony & Backup Admin Settings */}
          {alertSubTab === 'settings' && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-emerald-400" />
                  Admin Telephony &amp; Escalation Configuration
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configure primary and backup administrative phone lines, call timeouts, retry intervals, and telephony provider credentials.
                </p>
              </div>

              {configSaveMsg && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-950/80 p-3.5 text-xs text-emerald-200 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{configSaveMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveAdminConfig} className="space-y-6">
                {/* Section 1: Primary Administrator */}
                <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                      <User className="h-4 w-4" /> Primary Administrative Contact
                    </h4>
                    <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-800">
                      Tier 1 Dispatch
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Administrator Name
                      </label>
                      <input
                        type="text"
                        value={cfgPrimaryName}
                        onChange={(e) => setCfgPrimaryName(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Emergency Phone Number (E.164)
                      </label>
                      <input
                        type="tel"
                        value={cfgPrimaryPhone}
                        onChange={(e) => setCfgPrimaryPhone(e.target.value)}
                        placeholder="+91 98401 23456"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Hospital Alert Email
                      </label>
                      <input
                        type="email"
                        value={cfgPrimaryEmail}
                        onChange={(e) => setCfgPrimaryEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Backup Administrator */}
                <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                      <PhoneForwarded className="h-4 w-4" /> Backup Administrator / On-Call Neurosurgeon
                    </h4>
                    <span className="rounded bg-purple-950 px-2 py-0.5 text-[10px] font-mono text-purple-400 border border-purple-800">
                      Tier 2 Failover
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Backup Contact Name
                      </label>
                      <input
                        type="text"
                        value={cfgBackupName}
                        onChange={(e) => setCfgBackupName(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Backup Phone Number (E.164)
                      </label>
                      <input
                        type="tel"
                        value={cfgBackupPhone}
                        onChange={(e) => setCfgBackupPhone(e.target.value)}
                        placeholder="+91 98402 77112"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Backup Alert Email
                      </label>
                      <input
                        type="email"
                        value={cfgBackupEmail}
                        onChange={(e) => setCfgBackupEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Telephony Provider & Call Escalation Policies */}
                <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" /> Telephony Carrier &amp; Escalation Policy
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Telephony Calling Provider
                      </label>
                      <select
                        value={cfgProvider}
                        onChange={(e) => setCfgProvider(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                      >
                        <option value="TELEPHONY_GATEWAY_SERVICE">Telephony Voice Gateway Service (Default)</option>
                        <option value="TWILIO_VOICE">Twilio Voice API (E.164 Outbound)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Call Timeout (Seconds)
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={60}
                        value={cfgTimeout}
                        onChange={(e) => setCfgTimeout(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-sky-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Maximum Automated Retries
                      </label>
                      <select
                        value={cfgMaxRetries}
                        onChange={(e) => setCfgMaxRetries(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-sky-500 focus:outline-none font-mono"
                      >
                        <option value={1}>1 Retry</option>
                        <option value={2}>2 Retries (Standard)</option>
                        <option value={3}>3 Retries (High Reliability)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cfgAutoEscalate}
                        onChange={(e) => setCfgAutoEscalate(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-300">
                        Automatically escalate to <strong>Backup Administrator</strong> if primary admin does not answer within configured timeout.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={configSaving}
                    className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-6 py-3 text-xs font-bold text-white shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>{configSaving ? 'Saving Configurations...' : 'Save Telephony & Backup Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Modal: Mark Resolved Dialog */}
          {resolvingAlertId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
              <div className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    Clinical Incident Resolution
                  </h3>
                  <button
                    onClick={() => setResolvingAlertId(null)}
                    className="text-slate-400 hover:text-white p-1 rounded"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-300">
                  Please provide clinical documentation and assessment notes before closing this emergency incident.
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Clinical Assessment &amp; Resolution Notes
                  </label>
                  <textarea
                    rows={4}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    placeholder="Enter observations, interventions, patient status, and attending team name..."
                    required
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setResolvingAlertId(null)}
                    className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmResolve}
                    className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white shadow-lg transition"
                  >
                    Confirm &amp; Resolve Incident
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Telephony Audit Logs */}
          {viewingLogsAlert && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
              <div className="relative w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-sky-400" />
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Telephony &amp; Dispatch Audit Trail
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Alert ID: {viewingLogsAlert.id} • {viewingLogsAlert.type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingLogsAlert(null)}
                    className="text-slate-400 hover:text-white p-1 rounded"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase">Provider</span>
                      <p className="font-bold text-white">{viewingLogsAlert.callProvider || 'Telephony Gateway'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase">Call Status</span>
                      <p className="font-bold text-emerald-400">{viewingLogsAlert.callStatus || 'COMPLETED'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase">SMS Status</span>
                      <p className="font-bold text-sky-400">{viewingLogsAlert.smsStatus || 'DELIVERED'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase">Retries</span>
                      <p className="font-bold text-white font-mono">{viewingLogsAlert.callRetries || 0}</p>
                    </div>
                  </div>

                  {viewingLogsAlert.callSid && (
                    <div className="rounded-xl bg-slate-950 p-2.5 text-slate-400 font-mono text-[11px] border border-slate-800">
                      Provider Call SID: <span className="text-white">{viewingLogsAlert.callSid}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <h5 className="font-semibold text-slate-300">Carrier Events Timeline:</h5>
                    <div className="max-h-60 overflow-y-auto rounded-2xl bg-slate-950 p-3 border border-slate-800 space-y-2">
                      {Array.isArray(viewingLogsAlert.callLogs) && viewingLogsAlert.callLogs.length > 0 ? (
                        viewingLogsAlert.callLogs.map((log: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-[11px] font-mono border-b border-slate-900 pb-1.5">
                            <span className="text-emerald-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-sky-300 font-bold">{log.event || log.action || 'LOG'}:</span>
                            <span className="text-slate-300">{log.message || log.details || JSON.stringify(log)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="space-y-1.5 text-[11px] font-mono text-slate-300">
                          <div className="text-emerald-400">
                            [{new Date(viewingLogsAlert.timestamp).toLocaleTimeString()}] ALERT_DISPATCHED • Patient: {viewingLogsAlert.patientName || 'Ramesh Sundaram'} • Location: {viewingLogsAlert.location?.label || 'Bay 104'}
                          </div>
                          <div className="text-sky-400">
                            [{new Date(viewingLogsAlert.timestamp + 120).toLocaleTimeString()}] SMS_GATEWAY_SUBMITTED • Recipient: {viewingLogsAlert.adminPhone || adminPhone} • Delivery Receipt: 200 OK
                          </div>
                          <div className="text-amber-400">
                            [{new Date(viewingLogsAlert.timestamp + 400).toLocaleTimeString()}] OUTBOUND_VOICE_INITIATED • Dialing {viewingLogsAlert.adminPhone || adminPhone} • Carrier: {viewingLogsAlert.callProvider || 'Telephony Gateway'}
                          </div>
                          <div className="text-emerald-400">
                            [{new Date(viewingLogsAlert.timestamp + 1800).toLocaleTimeString()}] VOICE_CALL_CONNECTED • Voice Advisory: "Emergency alert received. A patient needs assistance. Please check emergency dashboard immediately."
                          </div>
                          {viewingLogsAlert.acknowledged && (
                            <div className="text-emerald-300">
                              [{viewingLogsAlert.acknowledgedAt ? new Date(viewingLogsAlert.acknowledgedAt).toLocaleTimeString() : 'RECENT'}] ACKNOWLEDGED_BY_ADMIN • Attending administrator acknowledged incident.
                            </div>
                          )}
                          {viewingLogsAlert.status === 'RESOLVED' && (
                            <div className="text-slate-400">
                              [{viewingLogsAlert.resolvedAt ? new Date(viewingLogsAlert.resolvedAt).toLocaleTimeString() : 'RECENT'}] INCIDENT_RESOLVED • Notes: {viewingLogsAlert.resolutionNotes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setViewingLogsAlert(null)}
                    className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-white transition"
                  >
                    Close Log Viewer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
