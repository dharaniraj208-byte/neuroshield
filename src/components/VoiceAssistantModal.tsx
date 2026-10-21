import React, { useState } from 'react';
import { useNeuro } from '../context/NeuroContext';
import {
  Mic,
  MicOff,
  Volume2,
  X,
  Sparkles,
  Send,
  AlertOctagon,
  Smile,
  Activity,
  PhoneCall
} from 'lucide-react';
import { LANGUAGES } from '../i18n/translations';

export const VoiceAssistantModal: React.FC = () => {
  const {
    isAssistantOpen,
    setIsAssistantOpen,
    assistantStatus,
    assistantTranscript,
    assistantReply,
    sendAssistantQuery,
    speakText,
    language,
    triggerEmergency,
    t
  } = useNeuro();

  const [inputVal, setInputVal] = useState('');

  if (!isAssistantOpen) return null;

  const handleSend = () => {
    if (inputVal.trim()) {
      sendAssistantQuery(inputVal.trim());
      setInputVal('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const quickPromptsByLang: Record<string, string[]> = {
    en: [
      'Check my stroke recovery progress',
      'Start facial smile symmetry exercise',
      'What are the FAST stroke warning signs?',
      'Emergency: Call my medical admin',
    ],
    ta: [
      'என் பக்கவாத மீட்பு நிலையை கூறு',
      'முக புன்னகை பயிற்சியை தொடங்கு',
      'பக்கவாதத்தின் FAST அறிகுறிகள் என்ன?',
      'அவசரம்: நிர்வாகிக்கு உடனே அழை',
    ],
    hi: [
      'मेरी स्ट्रोक रिकवरी प्रगति बताएं',
      'चेहरे की मुस्कान व्यायाम शुरू करें',
      'स्ट्रोक के FAST लक्षण क्या हैं?',
      'आपातकाल: तुरंत एडमिन को कॉल करें',
    ],
    ml: [
      'എന്റെ വീണ്ടെടുക്കൽ പുരോഗതി പറയുക',
      'മുഖ വ്യായാമം ആരംഭിക്കുക',
      'സ്ട്രോക്കിന്റെ പ്രധാന ലക്ഷണങ്ങൾ എന്തൊക്കെ?',
      'അടിയന്തരാവസ്ഥ: അഡ്മിനെ വിളിക്കുക',
    ],
    te: [
      'నా స్ట్రోక్ రికవరీ పురోగతి చెప్పండి',
      'ముఖ చిరునవ్వు వ్యాయామం ప్రారంభించండి',
      'స్ట్రోక్ యొక్క FAST లక్షణాలు ఏమిటి?',
      'అత్యవసరం: అడ్మిన్‌కు ఫోన్ చేయండి',
    ],
  };

  const currentQuickPrompts = quickPromptsByLang[language] || quickPromptsByLang.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-sky-500/40 bg-slate-900 shadow-2xl">
        {/* Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Hey Neuro Voice AI</h3>
                <span className="rounded-full bg-sky-950 px-2 py-0.5 text-[10px] font-semibold text-sky-400 border border-sky-800">
                  {currentLangObj.nativeName} ({currentLangObj.speechLocale})
                </span>
              </div>
              <p className="text-xs text-slate-400">Stroke Assistant &amp; Emergency Escalation</p>
            </div>
          </div>

          <button
            onClick={() => setIsAssistantOpen(false)}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Waveform / Voice Activity Center */}
        <div className="flex flex-col items-center justify-center py-6 px-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
          <div className="relative flex items-center justify-center">
            {/* Pulsing concentric rings */}
            <div
              className={`absolute h-28 w-28 rounded-full bg-sky-500/20 transition-all duration-300 ${
                assistantStatus === 'listening' ? 'scale-125 animate-ping' : 'scale-100'
              }`}
            />
            <div
              className={`absolute h-24 w-24 rounded-full bg-indigo-500/30 transition-all duration-300 ${
                assistantStatus === 'speaking' ? 'scale-110 animate-pulse' : 'scale-100'
              }`}
            />

            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-xl shadow-sky-500/30">
              {assistantStatus === 'listening' ? (
                <Mic className="h-9 w-9 animate-bounce" />
              ) : assistantStatus === 'speaking' ? (
                <Volume2 className="h-9 w-9 animate-pulse" />
              ) : (
                <Sparkles className="h-9 w-9" />
              )}
            </div>
          </div>

          <p className="mt-4 text-xs font-semibold tracking-wider text-sky-400 uppercase">
            {assistantStatus === 'listening'
              ? t('listening')
              : assistantStatus === 'thinking'
              ? t('processing')
              : assistantStatus === 'speaking'
              ? 'Speaking response...'
              : 'Say "Hey Neuro" or select a prompt'}
          </p>

          {/* Transcript / Spoken Text Display */}
          <div className="mt-4 w-full rounded-2xl bg-slate-950/70 p-4 border border-slate-800 min-h-[90px] flex flex-col justify-center text-center">
            {assistantReply ? (
              <p className="text-sm font-medium leading-relaxed text-slate-100">{assistantReply}</p>
            ) : assistantTranscript ? (
              <p className="text-sm italic text-sky-300">"{assistantTranscript}"</p>
            ) : (
              <p className="text-xs text-slate-400">
                "{t('voicePromptHelp')}"
              </p>
            )}
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-2">
          <p className="text-[11px] font-semibold text-slate-400 mb-2">Quick Neuro Commands:</p>
          <div className="flex flex-wrap gap-2">
            {currentQuickPrompts.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (promptText.toLowerCase().includes('emergency') || promptText.includes('அவசரம்')) {
                    triggerEmergency('SOS_MANUAL', 'Voice emergency command initiated by patient.');
                  } else {
                    sendAssistantQuery(promptText);
                  }
                }}
                className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300 hover:border-sky-500/60 hover:bg-sky-500/10 hover:text-sky-300 transition-all text-left"
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Row */}
        <div className="border-t border-slate-800 p-4 bg-slate-950/60 flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Type question in ${currentLangObj.name}...`}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <button
            onClick={handleSend}
            disabled={!inputVal.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-40 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
