import React, { useState, useEffect } from 'react';
import { useNeuro } from '../context/NeuroContext';
import {
  AlertTriangle,
  PhoneCall,
  PhoneOff,
  MessageSquare,
  ShieldAlert,
  CheckCircle,
  Activity,
  Mic,
  Volume2
} from 'lucide-react';

export const EmergencyAlertModal: React.FC = () => {
  const {
    activeEmergency,
    adminPhone,
    acknowledgeEmergency,
    facialSymmetry,
    patientUser,
    t
  } = useNeuro();

  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const callStatus = activeEmergency?.callStatus || 'INITIATING';

  useEffect(() => {
    if (!activeEmergency) {
      setCallDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [activeEmergency]);

  if (!activeEmergency) return null;

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getCallStatusBadge = () => {
    switch (callStatus) {
      case 'INITIATING':
        return { label: 'INITIATING CALL...', color: 'bg-amber-950 text-amber-400 border-amber-800' };
      case 'RINGING':
        return { label: 'RINGING ADMIN MOBILE...', color: 'bg-sky-950 text-sky-400 border-sky-800 animate-pulse' };
      case 'ANSWERED':
      case 'CONNECTED':
        return { label: 'CALL ANSWERED • PLAYING ADVISORY', color: 'bg-emerald-950 text-emerald-400 border-emerald-800' };
      case 'COMPLETED':
        return { label: 'CALL DISPATCH COMPLETE', color: 'bg-slate-900 text-slate-300 border-slate-700' };
      case 'ESCALATED_TO_BACKUP':
        return { label: 'ESCALATED TO BACKUP ADMIN', color: 'bg-purple-950 text-purple-400 border-purple-800' };
      case 'FAILED':
        return { label: 'CALL FAILED (FALLBACK SMS DELIVERED)', color: 'bg-rose-950 text-rose-400 border-rose-800' };
      default:
        return { label: callStatus, color: 'bg-slate-900 text-slate-400 border-slate-800' };
    }
  };

  const statusBadge = getCallStatusBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/80 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-rose-500 bg-slate-950 shadow-2xl shadow-rose-950/60">
        {/* Pulsing emergency strobe */}
        <div className="bg-rose-600 px-6 py-4 text-white flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-7 w-7 text-white" />
            <div>
              <h2 className="text-lg font-black tracking-wider uppercase">
                {t('emergencyDetected')}
              </h2>
              <p className="text-xs font-semibold text-rose-100">
                {activeEmergency.type.replace(/_/g, ' ')}: {activeEmergency.details}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-rose-700">
            {activeEmergency.severity}
          </span>
        </div>

        {/* Live Admin Mobile Dispatch Box */}
        <div className="p-6 space-y-4">
          {/* Patient Details & Location Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>{activeEmergency.patientName || patientUser?.name || 'Ramesh Sundaram'}</span>
                <span className="rounded bg-sky-950 px-1.5 py-0.5 text-[10px] font-mono text-sky-400 border border-sky-800">
                  {activeEmergency.verifiedPhone ? '✓ Verified Phone' : 'Phone'}
                </span>
              </span>
              <span className="font-mono text-slate-400">{activeEmergency.patientPhone || patientUser?.phone || '+91 98401 54321'}</span>
            </div>
            {activeEmergency.location && (
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="text-rose-400 font-semibold">Location:</span>
                <span>{activeEmergency.location.label}</span>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-rose-800/80 bg-rose-950/40 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-rose-600/30 p-2 text-rose-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                    {t('emergencySmsSent')}
                  </h4>
                  <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-800">
                    {activeEmergency.smsStatus || 'SMS DELIVERED'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  Target Admin Mobile: <span className="font-mono font-bold text-white">{activeEmergency.adminPhone || adminPhone}</span>
                </p>
                <div className="mt-2 rounded-lg bg-slate-900/90 p-2.5 text-[11px] font-mono text-slate-300 border border-slate-800">
                  [EMERGENCY ALERT] NeuroShield: Patient {activeEmergency.patientName || 'Ramesh Sundaram'} in {activeEmergency.room || 'Bay 104'} triggered {activeEmergency.type.replace(/_/g, ' ')}. Location: {activeEmergency.location?.label || 'Bay 104'}. Auto-calling admin now.
                </div>
              </div>
            </div>
          </div>

          {/* Active Intercom Call with Admin */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 text-center">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/40">
              <PhoneCall className={`h-8 w-8 ${callStatus === 'RINGING' || callStatus === 'INITIATING' ? 'animate-bounce' : 'animate-pulse'}`} />
              {(callStatus === 'ANSWERED' || callStatus === 'CONNECTED') && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500"></span>
                </span>
              )}
            </div>

            <div className="mt-3">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-mono font-bold border ${statusBadge.color}`}>
                {statusBadge.label}
              </span>
            </div>

            <h3 className="mt-2 text-base font-bold text-white">
              {callStatus === 'RINGING' || callStatus === 'INITIATING' ? t('emergencyCallAdmin') : 'Emergency Voice Call Active'}
            </h3>
            <p className="text-xs text-slate-400">
              Admin Mobile: <span className="font-mono text-slate-200">{activeEmergency.adminPhone || adminPhone}</span>
              <span className="text-[10px] text-slate-500 ml-2">({activeEmergency.callProvider === 'TWILIO_VOICE' ? 'Twilio Voice' : 'Telephony Voice Gateway'})</span>
            </p>

            <div className="mt-2 rounded-xl bg-slate-950 p-2.5 text-[11px] text-slate-300 font-mono border border-slate-800 text-left">
              <div className="text-[10px] text-emerald-400 font-bold mb-0.5">Spoken Voice Notice to Admin:</div>
              "Emergency alert received. A patient needs assistance. Please check the emergency dashboard immediately."
            </div>

            {callDuration > 0 && (
              <p className="mt-2 text-sm font-mono font-bold text-emerald-400">
                Call Duration: {formatSecs(callDuration)}
              </p>
            )}

            {/* Audio waveform simulation */}
            {(callStatus === 'ANSWERED' || callStatus === 'CONNECTED' || callStatus === 'RINGING') && (
              <div className="mt-3 flex items-center justify-center gap-1.5 h-6">
                {[12, 24, 16, 28, 20, 32, 18, 26, 14, 22].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-emerald-400 animate-pulse"
                    style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Patient Vitals at Incident */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Face Symmetry</span>
              <p className="text-base font-black text-rose-400 font-mono">{facialSymmetry}%</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Heart Rate</span>
              <p className="text-base font-black text-emerald-400 font-mono">94 BPM</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Risk Level</span>
              <p className="text-base font-black text-amber-400 font-mono">CRITICAL</p>
            </div>
          </div>

          {/* Direct Cellular Telephone Dial Button to Admin Phone */}
          <a
            href={`tel:${adminPhone.replace(/[\s()-]/g, '')}`}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 py-3.5 px-4 text-xs font-black text-white shadow-xl shadow-emerald-600/40 transition flex items-center justify-center gap-2 border border-emerald-400/40 text-center"
          >
            <PhoneCall className="h-4 w-4 animate-bounce" />
            <span>{t('callAdminNow')} ({adminPhone})</span>
          </a>

          {/* Actions: Acknowledge & End Call */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`flex-1 rounded-xl py-3 px-4 text-xs font-bold transition flex items-center justify-center gap-2 border ${
                isMuted
                  ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                  : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
              }`}
            >
              {isMuted ? <Mic className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {isMuted ? 'Unmute Mic' : 'Mute Audio'}
            </button>

            <button
              onClick={() => acknowledgeEmergency()}
              className="flex-[2] rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 px-4 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {t('acknowledge')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
