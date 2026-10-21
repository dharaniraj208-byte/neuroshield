import React, { useState, useEffect } from 'react';
import { useNeuro } from '../context/NeuroContext';
import {
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Lock,
  Heart,
  Activity,
  Globe,
  ShieldAlert
} from 'lucide-react';
import { LANGUAGES } from '../i18n/translations';

interface PatientLoginGateProps {
  onSuccess?: () => void;
}

export const PatientLoginGate: React.FC<PatientLoginGateProps> = ({ onSuccess }) => {
  const {
    verifyPatientOtp,
    sendOtpSms,
    triggerEmergency,
    setCurrentScreen,
    language,
    setLanguage,
    t
  } = useNeuro();

  const [nameInput, setNameInput] = useState('Ramesh Sundaram');
  const [emailInput, setEmailInput] = useState('ramesh.sundaram@gmail.com');
  const [phoneInput, setPhoneInput] = useState('+91 98401 54321');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState('');

  const [dispatchedOtp, setDispatchedOtp] = useState<string>('');

  // Countdown timer for OTP expiry and resend cooldown
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
    if (!nameInput.trim()) {
      setErrorMessage(t('enterName') + ' is required.');
      return;
    }
    if (!emailInput.includes('@')) {
      setErrorMessage(t('enterEmail') + ' is invalid.');
      return;
    }
    if (!phoneInput || phoneInput.length < 8) {
      setErrorMessage(t('enterPhone') + ' is invalid. Include country code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await sendOtpSms(phoneInput, 'patient');
      if (res.success) {
        setOtpSent(true);
        setOtpCountdown(res.cooldownRemaining || 60);
        if (res.otpCode) {
          setDispatchedOtp(res.otpCode);
        }
        setSuccessInfo(`Security code sent to ${phoneInput} via SMS.`);
      } else {
        setErrorMessage(res.message || 'Failed to send OTP.');
        if (res.cooldownRemaining) {
          setOtpCountdown(res.cooldownRemaining);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'SMS Gateway error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      handleSendOtp();
      return;
    }

    if (!otpInput || otpInput.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await verifyPatientOtp(nameInput, emailInput, phoneInput, otpInput.trim());
      if (res.success) {
        setSuccessInfo('Phone verified successfully! Redirecting...');
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.message || t('otpInvalid'));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP verification error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoFillOtp = () => {
    if (dispatchedOtp) {
      setOtpInput(dispatchedOtp);
    }
  };

  const handleQuickDemoAccess = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      // Execute true backend OTP dispatch & verification
      const sendRes = await sendOtpSms('+91 98401 54321', 'patient');
      if (sendRes.success && sendRes.otpCode) {
        setNameInput('Ramesh Sundaram');
        setEmailInput('ramesh.sundaram@gmail.com');
        setPhoneInput('+91 98401 54321');
        setOtpInput(sendRes.otpCode);
        setDispatchedOtp(sendRes.otpCode);
        setOtpSent(true);

        const verifyRes = await verifyPatientOtp('Ramesh Sundaram', 'ramesh.sundaram@gmail.com', '+91 98401 54321', sendRes.otpCode);
        if (verifyRes.success) {
          if (onSuccess) onSuccess();
        } else {
          setErrorMessage(verifyRes.message || 'Verification failed.');
        }
      } else {
        setErrorMessage(sendRes.message || 'Failed to dispatch verification code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to authenticate demo user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl border border-sky-500/30 bg-slate-900/95 p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Top Header & Language Picker */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-xl shadow-sky-500/30">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {t('patientLogin')}
              </h2>
              <p className="text-xs text-slate-400">
                Stroke Survivor Recovery &amp; Continuous Telemetry
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentScreen('gateway')}
            className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1"
          >
            Switch Portal
          </button>
        </div>

        {/* Description */}
        <div className="rounded-2xl border border-sky-900/50 bg-sky-950/30 p-3.5 text-xs text-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-sky-300">
            <Shield className="h-4 w-4" />
            <span>Secure Biometric &amp; Emergency Access</span>
          </div>
          <p>{t('patientLoginDesc')}</p>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs text-rose-300 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successInfo && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successInfo}</span>
          </div>
        )}

        {/* Instant Emergency Bypass - Patient in distress can trigger SOS without completing login */}
        <div className="rounded-2xl border border-rose-500/50 bg-rose-950/40 p-3.5 flex items-center justify-between gap-3">
          <div className="text-left">
            <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-rose-400 animate-pulse" /> Emergency Assistance Required?
            </span>
            <p className="text-[11px] text-slate-400">
              Trigger immediate call &amp; SMS to attending admin without completing login.
            </p>
          </div>
          <button
            type="button"
            onClick={() => triggerEmergency('SOS_MANUAL', 'Emergency SOS triggered from Patient Login screen by bedside/caregiver.')}
            className="rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 px-3.5 py-2 text-xs font-black text-white shadow-lg shadow-rose-900/40 shrink-0 flex items-center gap-1.5"
          >
            <span>SOS NOW</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          {/* Patient Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-sky-400" />
              <span>{t('enterName')}</span>
            </label>
            <input
              type="text"
              required
              disabled={otpSent}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Ramesh Sundaram"
              className="w-full rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none disabled:opacity-60"
            />
          </div>

          {/* Patient Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-sky-400" />
              <span>{t('enterEmail')}</span>
            </label>
            <input
              type="email"
              required
              disabled={otpSent}
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="e.g. ramesh.sundaram@gmail.com"
              className="w-full rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none disabled:opacity-60"
            />
          </div>

          {/* Patient Mobile Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-sky-400" />
              <span>{t('enterPhone')}</span>
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                required
                disabled={otpSent}
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+91 98401 54321"
                className="w-full rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:border-sky-500 focus:outline-none disabled:opacity-60"
              />
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSubmitting}
                  className="rounded-2xl bg-sky-600 hover:bg-sky-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition shrink-0 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : t('sendOtp')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="rounded-2xl border border-slate-700 px-3 py-2.5 text-xs text-slate-400 hover:text-white transition shrink-0"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* OTP Code Input (when sent) */}
          {otpSent && (
            <div className="space-y-2.5 rounded-2xl border border-sky-500/40 bg-sky-950/20 p-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>{t('enterOtp')}</span>
                </label>
                <span className="font-mono text-xs text-slate-400">
                  {t('otpCountdownText')}: <strong className="text-sky-400">{otpCountdown}s</strong>
                </span>
              </div>

              <input
                type="text"
                maxLength={6}
                autoFocus
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-full rounded-xl border border-sky-500/60 bg-slate-900 px-4 py-3 text-center text-xl font-mono font-bold tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              <div className="flex items-center justify-between pt-1">
                {dispatchedOtp ? (
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="rounded-lg bg-sky-500/20 hover:bg-sky-500/30 px-2.5 py-1 text-[11px] font-bold text-sky-300 transition"
                  >
                    Paste Received OTP ({dispatchedOtp})
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Check your phone for the 6-digit code
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpCountdown > 0}
                  className="text-[11px] text-slate-400 hover:text-white disabled:opacity-40 transition font-medium"
                >
                  {otpCountdown > 0 ? `Resend code in ${otpCountdown}s` : t('resendOtp')}
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 py-3.5 text-xs font-bold text-white shadow-xl shadow-sky-600/30 hover:from-sky-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{otpSent ? t('verifyLogin') : t('sendOtp')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleQuickDemoAccess}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
            >
              Quick Test Sign In (Ramesh Sundaram — Demo)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
