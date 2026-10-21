import React from 'react';
import { useNeuro } from '../context/NeuroContext';
import { MessageSquare, X, CheckCircle, Smartphone, ArrowRight } from 'lucide-react';

export const RealtimeSmsToast: React.FC = () => {
  const { lastSmsNotification, dismissSmsNotification } = useNeuro();

  if (!lastSmsNotification) return null;

  return (
    <div className="fixed top-20 right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
      <div className="overflow-hidden rounded-2xl border-2 border-emerald-500/80 bg-slate-900/95 p-4 shadow-2xl shadow-emerald-950/60 backdrop-blur-xl">
        {/* Incoming SMS Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Smartphone className="h-4 w-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Real-Time SMS Alert
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                To: {lastSmsNotification.phone}
              </p>
            </div>
          </div>

          <button
            onClick={dismissSmsNotification}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* SMS Message Body */}
        <div className="mt-2.5 space-y-2">
          <p className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
            {lastSmsNotification.body}
          </p>

          {lastSmsNotification.otpCode && (
            <div className="flex items-center justify-between rounded-xl bg-emerald-950/40 border border-emerald-700/50 p-2 text-xs">
              <span className="text-emerald-300 font-medium">Verification Code:</span>
              <span className="font-mono font-black text-white text-base tracking-widest bg-emerald-900/80 px-2.5 py-0.5 rounded border border-emerald-500">
                {lastSmsNotification.otpCode}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>Delivered via NeuroShield Telco SMS Gateway</span>
            <span className="font-mono text-emerald-400 font-bold">JUST NOW</span>
          </div>
        </div>
      </div>
    </div>
  );
};
