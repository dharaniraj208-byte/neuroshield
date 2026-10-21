import React from 'react';
import { useNeuro } from '../context/NeuroContext';
import {
  User,
  Shield,
  Phone,
  Globe,
  Camera,
  Mic,
  Activity,
  Heart,
  Calendar,
  X,
  LogOut,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { LANGUAGES, Language } from '../i18n/translations';

export const ProfileViewWidget: React.FC = () => {
  const {
    portal,
    setPortal,
    patientUser,
    callAdminPhoneRealtime,
    adminPhone,
    setAdminPhone,
    language,
    setLanguage,
    facialSymmetry,
    armStability,
    cameraActive,
    micActive,
    isProfileOpen,
    setIsProfileOpen,
    t
  } = useNeuro();

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <>
      {/* Right-Bottom Fixed Profile Trigger as requested */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsProfileOpen(true)}
          className="group flex items-center gap-3 rounded-full border border-sky-500/40 bg-slate-900/95 p-2 pr-4 shadow-2xl shadow-sky-950/60 backdrop-blur-md transition-all hover:border-sky-400 hover:scale-105 active:scale-95"
        >
          {/* Avatar with Role Badge */}
          <div className="relative">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md font-bold text-sm ${
                portal === 'patient'
                  ? 'bg-gradient-to-tr from-sky-600 to-indigo-600'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-700'
              }`}
            >
              {portal === 'patient' ? 'RS' : 'AD'}
            </div>
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-emerald-500" />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                {portal === 'patient' ? t('patientName') : 'Clinical Admin'}
              </span>
              <span
                className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                  portal === 'patient'
                    ? 'bg-sky-950 text-sky-400 border border-sky-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {portal === 'patient' ? 'Patient' : 'Admin'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Globe className="h-2.5 w-2.5 text-sky-400" /> {currentLangObj.nativeName}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">Vision 24/7</span>
            </div>
          </div>
        </button>
      </div>

      {/* Profile Modal / Drawer */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white font-bold text-lg shadow-lg ${
                    portal === 'patient'
                      ? 'bg-gradient-to-tr from-sky-500 to-indigo-600'
                      : 'bg-gradient-to-tr from-emerald-500 to-teal-600'
                  }`}
                >
                  {portal === 'patient' ? <User className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {portal === 'patient' ? t('patientName') : 'Clinical Admin Sentinel'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {portal === 'patient' ? t('patientAge') + ' • ' + t('roomNumber') : 'Emergency Dispatch & CCTV Center'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsProfileOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Language Settings Section */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2.5">
                  <Globe className="h-3.5 w-3.5 text-sky-400" /> {t('languageSetting')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`flex items-center justify-between rounded-xl p-2.5 text-xs font-semibold transition border ${
                        language === lang.code
                          ? 'border-sky-500 bg-sky-500/20 text-white shadow'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </div>
                      {language === lang.code && <CheckCircle2 className="h-4 w-4 text-sky-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Phone Setting */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
                  <Phone className="h-3.5 w-3.5 text-rose-400" /> {t('adminPhoneLabel')}
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Emergency voice calls and automated SMS alerts will be dispatched directly to this mobile phone number:
                </p>
                <input
                  type="text"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="+91 98401 23456"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm font-mono text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    callAdminPhoneRealtime();
                    setIsProfileOpen(false);
                  }}
                  className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-900/30 transition"
                >
                  <Phone className="h-4 w-4 animate-pulse" />
                  <span>Call Admin Emergency ({adminPhone})</span>
                </button>
              </div>

              {/* Clinical Telemetry Status */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2.5">
                  <Activity className="h-3.5 w-3.5 text-emerald-400" /> Sensory Telemetry Matrix
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <span className="text-slate-400 text-[10px]">Camera Vision Feed</span>
                    <p className={`font-semibold mt-0.5 ${cameraActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {cameraActive ? 'CONTINUOUS ON' : 'CONNECTING'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <span className="text-slate-400 text-[10px]">Ambient Mic Sentinel</span>
                    <p className={`font-semibold mt-0.5 ${micActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {micActive ? 'ACTIVE (Hey Neuro)' : 'INITIALIZING'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <span className="text-slate-400 text-[10px]">Facial Symmetry</span>
                    <p className="font-mono font-bold text-sky-400 mt-0.5">{facialSymmetry}% Index</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <span className="text-slate-400 text-[10px]">Motor Arm Stability</span>
                    <p className="font-mono font-bold text-indigo-400 mt-0.5">{armStability}% Tone</p>
                  </div>
                </div>
              </div>

              {/* Portal Switcher Button */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setPortal(portal === 'patient' ? 'admin' : 'patient');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 p-3.5 text-xs font-bold text-white shadow-lg hover:from-sky-500 hover:to-indigo-500 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span>{portal === 'patient' ? 'Switch to Admin Portal' : 'Switch to Patient Portal'}</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
