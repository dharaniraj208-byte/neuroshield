import React from 'react';
import { useNeuro } from '../context/NeuroContext';
import {
  User,
  Shield,
  Activity,
  Heart,
  Globe,
  ArrowRight,
  Sparkles,
  Camera,
  Mic,
  Video,
  Hospital,
  Lock,
  PhoneCall,
  Eye
} from 'lucide-react';
import { LANGUAGES } from '../i18n/translations';

export const PortalGateway: React.FC = () => {
  const {
    setCurrentScreen,
    setPortal,
    startMedia,
    language,
    setLanguage,
    isAdminLoggedIn,
    t
  } = useNeuro();

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const handleChoosePatient = () => {
    setPortal('patient');
    setCurrentScreen('patient_portal');
    startMedia();
  };

  const handleChooseAdmin = () => {
    setPortal('admin');
    setCurrentScreen('admin_portal');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 selection:bg-sky-500 selection:text-white">
      {/* Top Bar with Language Selector */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 text-white shadow-xl shadow-sky-500/25">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">
                Neuro<span className="text-sky-400">Shield</span>
              </span>
              <span className="rounded-full bg-sky-950/90 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-400 border border-sky-800">
                CLINICAL PORTAL GATE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        {/* Language Picker Dropdown */}
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-sky-400" />
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition ${
                  language === lang.code
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang.flag} {lang.nativeName}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Dual-Portal Selection Gate */}
      <main className="max-w-5xl w-full mx-auto my-auto py-10 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Select Your Clinical Gateway
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            NeuroShield provides two partitioned environments with role-based hardware isolation. Patients receive continuous camera vision and speech therapy, while medical administrators oversee CCTV feeds, hospital networks, and doctor collaboration.
          </p>
        </div>

        {/* Dual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Patient Recovery Portal */}
          <div
            onClick={handleChoosePatient}
            className="group cursor-pointer rounded-3xl border border-sky-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-8 shadow-2xl transition-all duration-300 hover:border-sky-400 hover:scale-[1.02] active:scale-[0.99] flex flex-col justify-between"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-xl shadow-sky-500/30 group-hover:scale-110 transition-transform">
                  <User className="h-7 w-7" />
                </div>
                <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-800">
                  CAMERA &amp; MIC AUTO-ON
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-sky-300 transition-colors">
                  {t('patientPortal')}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  For Stroke Survivors, Bedside Caregivers &amp; At-Home Recovery
                </p>
              </div>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-emerald-400" />
                  <span>Auto-On Camera &amp; Mic (Hands-Free Sentinel)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-sky-400" />
                  <span>Continuous Eye Check (EAR, Ptosis &amp; Prolonged Closure)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-400" />
                  <span>Bed Slide-Down &amp; Posture Displacement Alert to Admin</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-rose-400" />
                  <span>Instant Admin Alert: Real-Time SMS &amp; Phone Call Dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-amber-400" />
                  <span>"Hey Neuro" Multilingual Voice AI (5 Languages)</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/80 mt-6">
              <button
                type="button"
                className="w-full rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-sky-600/30 group-hover:from-sky-500 group-hover:to-indigo-500 transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Patient Portal</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Clinical Admin & Hospital Network */}
          <div
            onClick={handleChooseAdmin}
            className="group cursor-pointer rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-8 shadow-2xl transition-all duration-300 hover:border-emerald-400 hover:scale-[1.02] active:scale-[0.99] flex flex-col justify-between"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7" />
                </div>
                <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-800">
                  SECURE OTP VERIFICATION
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {t('adminPortal')}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  For Hospital Directors, Attending Neurologists &amp; Staff Nurses
                </p>
              </div>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Hospital className="h-4 w-4 text-emerald-400" />
                  <span>Hospital &amp; Doctor Collaboration Network (Apollo, CMC, AIIMS, Fortis)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-sky-400" />
                  <span>Remote Patient Bed CCTV &amp; Facility IP Camera Monitor</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-indigo-400" />
                  <span>Admin Local Camera/Mic Strictly Disabled for Clinician Privacy</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-rose-400" />
                  <span>Automated Emergency SMS &amp; Phone Call Alert Dispatch</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/80 mt-6">
              <button
                type="button"
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 group-hover:from-emerald-500 group-hover:to-teal-500 transition-all flex items-center justify-center gap-2"
              >
                <span>{isAdminLoggedIn ? 'Enter Admin Command Center' : 'Admin Login (OTP Verification)'}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="max-w-6xl w-full mx-auto py-4 text-center text-xs text-slate-500 border-t border-slate-800/80">
        NeuroShield Medical Architecture • Hardware-Isolated Sensor Governance • HIPAA &amp; Stroke Guidelines Compliant
      </footer>
    </div>
  );
};
