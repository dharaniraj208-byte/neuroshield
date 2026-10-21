import React from 'react';
import { NeuroProvider, useNeuro } from './context/NeuroContext';
import { PortalGateway } from './components/PortalGateway';
import { PatientPortal } from './components/PatientPortal';
import { AdminPortal } from './components/AdminPortal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { EmergencyAlertModal } from './components/EmergencyAlertModal';
import { ProfileViewWidget } from './components/ProfileViewWidget';
import { RealtimeSmsToast } from './components/RealtimeSmsToast';
import { LANGUAGES } from './i18n/translations';
import {
  Shield,
  Activity,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Globe,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  User,
  Building2,
  LogOut,
  Radio
} from 'lucide-react';

const MainApp: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    portal,
    setPortal,
    adminUser,
    language,
    setLanguage,
    cameraActive,
    micActive,
    triggerVoiceAssistant,
    triggerEmergency,
    adminPhone,
    t
  } = useNeuro();

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  // If on initial landing gateway, show the distinct dual-portal selection
  if (currentScreen === 'gateway') {
    return (
      <>
        <RealtimeSmsToast />
        <PortalGateway />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Universal Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & Clinical Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentScreen('gateway')}
              className="flex items-center gap-3 text-left group"
              title="Return to Portal Gateway"
            >
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 text-white shadow-xl shadow-sky-500/25 group-hover:scale-105 transition-transform">
                <Activity className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black tracking-tight text-white">
                    Neuro<span className="text-sky-400">Shield</span>
                  </h1>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold border ${
                      portal === 'patient'
                        ? 'bg-sky-950/90 text-sky-400 border-sky-800'
                        : 'bg-emerald-950/90 text-emerald-400 border-emerald-800'
                    }`}
                  >
                    {portal === 'patient' ? 'PATIENT SENTINEL' : 'ADMIN COMMAND'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  {portal === 'patient' ? t('appSubtitle') : 'Multi-Hospital Doctor Network & CCTV Central'}
                </p>
              </div>
            </button>
          </div>

          {/* Portal Switcher & Top Actions */}
          <div className="flex items-center gap-2.5">
            {/* Direct Switch to Other Portal or Gateway */}
            <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800">
              <button
                onClick={() => setPortal('patient')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  portal === 'patient'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('patientPortal')}</span>
              </button>
              <button
                onClick={() => setPortal('admin')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  portal === 'admin'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('adminPortal')}</span>
              </button>
            </div>

            {/* "Hey Neuro" Voice Assistant Trigger (Patient Only) */}
            {portal === 'patient' && (
              <button
                onClick={triggerVoiceAssistant}
                className="flex items-center gap-2 rounded-2xl border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 px-3.5 py-2 text-xs font-bold text-sky-300 transition shadow-sm"
                title="Activate Hey Neuro Voice AI"
              >
                <Sparkles className="h-4 w-4 text-sky-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span className="hidden md:inline">Hey Neuro</span>
              </button>
            )}

            {/* Language Selector Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-slate-700">
                <span className="text-sm">{currentLangObj.flag}</span>
                <span className="hidden sm:inline">{currentLangObj.nativeName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <div className="absolute right-0 mt-1 hidden group-hover:block w-44 rounded-2xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl z-50 animate-in fade-in">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs text-left transition ${
                      language === lang.code
                        ? 'bg-sky-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{lang.flag} {lang.nativeName}</span>
                    <span className="text-[10px] opacity-75 font-mono">{lang.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Emergency Button */}
            <button
              onClick={() => triggerEmergency('SOS_MANUAL', 'Urgent Emergency SOS button activated.')}
              className="rounded-2xl bg-rose-600 hover:bg-rose-500 px-3 py-2 text-xs font-black text-white shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5"
              title="Emergency SOS"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden lg:inline">SOS</span>
            </button>

            {/* Return to Gateway */}
            <button
              onClick={() => setCurrentScreen('gateway')}
              className="rounded-2xl border border-slate-800 bg-slate-900 hover:bg-slate-800 p-2 text-slate-400 hover:text-white transition"
              title="Change Portal Gateway"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Live Hardware Status Ticker */}
        <div className="border-t border-slate-800/60 bg-slate-950/90 px-4 py-1.5 text-[11px] text-slate-400">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              {portal === 'patient' ? (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${cameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span className="text-slate-300 font-mono">Patient Cam: {cameraActive ? 'ACTIVE (Vision HUD)' : 'CONNECTING'}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${micActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span className="text-slate-300 font-mono">Mic: {micActive ? 'ALWAYS ON (Hey Neuro)' : 'CONNECTING'}</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CameraOff className="h-3.5 w-3.5" />
                    <span className="font-mono">Admin Cam: DISABLED (Privacy Enforced)</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <MicOff className="h-3.5 w-3.5" />
                    <span className="font-mono">Admin Mic: DISABLED (Privacy Enforced)</span>
                  </span>
                  <span className="text-slate-500 font-mono hidden md:inline">
                    Remote CCTV Receiver: ARMED
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Emergency Admin Phone:</span>
              <span className="font-mono font-bold text-white">{adminPhone}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {portal === 'patient' ? <PatientPortal /> : <AdminPortal />}
      </main>

      {/* Persistent Profile View fixed at right bottom */}
      <ProfileViewWidget />

      {/* Hey Neuro Voice Assistant Modal (Active for Patient) */}
      <VoiceAssistantModal />

      {/* Automated Emergency Alert & Admin Calling Modal */}
      <EmergencyAlertModal />

      {/* Real-Time SMS Alert Banner */}
      <RealtimeSmsToast />
    </div>
  );
};

export default function App() {
  return (
    <NeuroProvider>
      <MainApp />
    </NeuroProvider>
  );
}
