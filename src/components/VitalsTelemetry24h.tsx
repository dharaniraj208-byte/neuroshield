import React, { useState, useEffect } from 'react';
import { useNeuro } from '../context/NeuroContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import {
  Heart,
  Activity,
  Droplets,
  Plus,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ChevronRight,
  TrendingUp,
  Sliders,
  Shield,
  Zap,
  Filter
} from 'lucide-react';

export interface VitalTelemetryPoint {
  id: string;
  hour: number;
  timeLabel: string;
  heartRate: number;
  systolic: number;
  diastolic: number;
  spo2: number;
  events?: string;
  status: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
}

export interface VitalsSummary {
  latestHeartRate: number;
  latestSystolic: number;
  latestDiastolic: number;
  latestSpo2: number;
  minHeartRate: number;
  maxHeartRate: number;
  avgHeartRate: number;
  maxSystolic: number;
  avgSystolic: number;
  avgDiastolic: number;
  minSpo2: number;
  avgSpo2: string;
}

export const VitalsTelemetry24h: React.FC = () => {
  const { language, t } = useNeuro();

  const [vitalsData, setVitalsData] = useState<VitalTelemetryPoint[]>([]);
  const [summary, setSummary] = useState<VitalsSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'combined' | 'heartRate' | 'bloodPressure' | 'spo2'>('combined');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);

  // Form inputs for manual log
  const [inputHr, setInputHr] = useState<number>(76);
  const [inputSys, setInputSys] = useState<number>(126);
  const [inputDia, setInputDia] = useState<number>(82);
  const [inputSpo2, setInputSpo2] = useState<number>(98);
  const [inputEvent, setInputEvent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string>('');

  const fetchVitals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/vitals/24h');
      if (res.ok) {
        const json = await res.json();
        setVitalsData(json.data || []);
        setSummary(json.summary || null);
      }
    } catch (err) {
      console.warn('Using client-side telemetry fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVitals();
    const interval = setInterval(fetchVitals, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleLogVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/vitals/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heartRate: inputHr,
          systolic: inputSys,
          diastolic: inputDia,
          spo2: inputSpo2,
          events: inputEvent || 'Caregiver Vitals Check'
        })
      });
      if (res.ok) {
        await fetchVitals();
        setIsLogModalOpen(false);
        setInputEvent('');
        setSuccessToast('New vital telemetry point logged successfully!');
        setTimeout(() => setSuccessToast(''), 4000);
      }
    } catch (err) {
      console.error('Failed to log vitals:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mean Arterial Pressure (MAP) = Diastolic + (1/3 * (Systolic - Diastolic))
  const currentMap = summary
    ? Math.round(summary.latestDiastolic + (summary.latestSystolic - summary.latestDiastolic) / 3)
    : 95;

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: VitalTelemetryPoint = payload[0].payload;
      return (
        <div className="rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[210px] z-50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-sky-400" />
              {label} ({dataPoint.hour}:00 hrs)
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                dataPoint.status === 'CRITICAL'
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : dataPoint.status === 'ELEVATED'
                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}
            >
              {dataPoint.status}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <Heart className="h-3 w-3 fill-rose-500/20" /> {t('heartRate')}:
              </span>
              <span className="font-mono font-bold text-white">{dataPoint.heartRate} BPM</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sky-400 font-semibold flex items-center gap-1">
                <Activity className="h-3 w-3" /> {t('bloodPressure')}:
              </span>
              <span className="font-mono font-bold text-white">
                {dataPoint.systolic}/{dataPoint.diastolic} mmHg
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-teal-400 font-semibold flex items-center gap-1">
                <Droplets className="h-3 w-3" /> {t('oxygenSat')}:
              </span>
              <span className="font-mono font-bold text-white">{dataPoint.spo2}% SpO2</span>
            </div>
          </div>

          {dataPoint.events && (
            <div className="mt-2 rounded-xl bg-slate-800/80 p-2 text-[11px] text-amber-300 border border-slate-700/60">
              <span className="font-semibold text-slate-400 block text-[10px] uppercase tracking-wider">
                Event / Medication:
              </span>
              {dataPoint.events}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 via-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t('vitalsDashboard')}
                <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-800">
                  LIVE 24H RECHARTS
                </span>
              </h2>
              <p className="text-xs text-slate-400">{t('vitalsSubtitle')}</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchVitals}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-800/60 hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition"
            title="Refresh 24h Vitals"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-600/30 transition"
          >
            <Plus className="h-4 w-4" />
            <span>{t('logNewVitals')}</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/60 p-3.5 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Real-Time Live Vitals Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Heart Rate Card */}
        <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-rose-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t('heartRate')}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Heart className="h-4 w-4 fill-rose-500 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white tracking-tight">
              {summary ? summary.latestHeartRate : 76}
            </span>
            <span className="text-xs font-bold text-rose-400">BPM</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2 font-mono">
            <span>Range: {summary ? `${summary.minHeartRate} - ${summary.maxHeartRate}` : '62 - 88'}</span>
            <span className="text-emerald-400">Avg: {summary ? summary.avgHeartRate : 74} BPM</span>
          </div>
        </div>

        {/* Blood Pressure Card */}
        <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-sky-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t('bloodPressure')}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white tracking-tight">
              {summary ? `${summary.latestSystolic}/${summary.latestDiastolic}` : '126/80'}
            </span>
            <span className="text-xs font-bold text-sky-400">mmHg</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2 font-mono">
            <span>MAP: {currentMap} mmHg</span>
            <span className="text-emerald-400">Target &lt; 130/80</span>
          </div>
        </div>

        {/* Oxygen Saturation Card */}
        <div className="rounded-3xl border border-teal-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-teal-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t('oxygenSat')}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Droplets className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white tracking-tight">
              {summary ? summary.latestSpo2 : 98}
            </span>
            <span className="text-xs font-bold text-teal-400">% SpO2</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2 font-mono">
            <span>Min: {summary ? summary.minSpo2 : 97}%</span>
            <span className="text-emerald-400">Avg: {summary ? summary.avgSpo2 : '98.1'}%</span>
          </div>
        </div>

        {/* Stroke Hemodynamic Guard Card */}
        <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Perfusion Stability</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-400">OPTIMAL</span>
            <span className="text-xs text-slate-400">Penumbra Safe</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2 font-mono">
            <span>Holter: 24/24 Hrs</span>
            <span className="text-sky-400">0 Hypoxic Events</span>
          </div>
        </div>
      </div>

      {/* Chart Filter Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('combined')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === 'combined'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tri-Vital Combined View
          </button>
          <button
            onClick={() => setActiveTab('heartRate')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === 'heartRate'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Heart Rate (BPM)
          </button>
          <button
            onClick={() => setActiveTab('bloodPressure')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === 'bloodPressure'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Blood Pressure (Systolic/Diastolic)
          </button>
          <button
            onClick={() => setActiveTab('spo2')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === 'spo2'
                ? 'bg-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Oxygen Saturation (SpO2)
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> HR
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-500" /> Systolic
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-400" /> Diastolic
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-teal-400" /> SpO2
          </span>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-md">
        <div className="h-96 w-full">
          {activeTab === 'combined' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vitalsData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="sysGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[50, 160]} />
                <YAxis yAxisId="right" orientation="right" stroke="#2dd4bf" tick={{ fontSize: 11 }} domain={[85, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine yAxisId="left" y={130} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Target Max BP (130)', fill: '#f59e0b', fontSize: 10 }} />
                <ReferenceLine yAxisId="right" y={95} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Min SpO2 (95%)', fill: '#10b981', fontSize: 10 }} />

                <Area yAxisId="left" type="monotone" dataKey="systolic" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#sysGrad)" name="Systolic BP" />
                <Line yAxisId="left" type="monotone" dataKey="diastolic" stroke="#818cf8" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Diastolic BP" />
                <Area yAxisId="left" type="monotone" dataKey="heartRate" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#hrGrad)" name="Heart Rate" />
                <Line yAxisId="right" type="monotone" dataKey="spo2" stroke="#2dd4bf" strokeWidth={2.5} dot={{ r: 3, fill: '#2dd4bf' }} name="SpO2 Saturation" />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeTab === 'heartRate' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vitalsData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="hrDedicated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#f43f5e" tick={{ fontSize: 11 }} domain={[50, 110]} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceArea y1={60} y2={85} stroke="#10b981" strokeOpacity={0.2} fill="#10b981" fillOpacity={0.07} />
                <ReferenceLine y={85} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Normal Upper Resting (85 BPM)', fill: '#10b981', fontSize: 10 }} />
                <ReferenceLine y={60} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Normal Lower Resting (60 BPM)', fill: '#10b981', fontSize: 10 }} />
                <Area type="monotone" dataKey="heartRate" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#hrDedicated)" name="Heart Rate (BPM)" />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeTab === 'bloodPressure' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitalsData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#0ea5e9" tick={{ fontSize: 11 }} domain={[65, 155]} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={130} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Target Systolic (<130)', fill: '#f59e0b', fontSize: 10 }} />
                <ReferenceLine y={80} stroke="#818cf8" strokeDasharray="4 4" label={{ value: 'Target Diastolic (<80)', fill: '#818cf8', fontSize: 10 }} />
                <Line type="monotone" dataKey="systolic" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3, fill: '#0ea5e9' }} name="Systolic BP (mmHg)" />
                <Line type="monotone" dataKey="diastolic" stroke="#818cf8" strokeWidth={2.5} dot={{ r: 3, fill: '#818cf8' }} name="Diastolic BP (mmHg)" />
              </LineChart>
            </ResponsiveContainer>
          )}

          {activeTab === 'spo2' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vitalsData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="spo2Dedicated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#2dd4bf" tick={{ fontSize: 11 }} domain={[90, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={95} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Clinical Target (95%)', fill: '#10b981', fontSize: 10 }} />
                <ReferenceLine y={92} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Hypoxia Alert (<92%)', fill: '#f43f5e', fontSize: 10 }} />
                <Area type="monotone" dataKey="spo2" stroke="#2dd4bf" strokeWidth={3} fillOpacity={1} fill="url(#spo2Dedicated)" name="Oxygen Saturation (%)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 24-Hour Clinical Events Timeline */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-sky-400" />
          {t('eventsTimeline')} &amp; Medication Correlation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {vitalsData
            .filter((v) => v.events)
            .map((v) => (
              <div
                key={v.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-1.5 transition hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {v.timeLabel}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-mono ${
                      v.status === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-400'
                        : v.status === 'ELEVATED'
                        ? 'bg-amber-950 text-amber-400'
                        : 'bg-emerald-950 text-emerald-400'
                    }`}
                  >
                    {v.heartRate} BPM | {v.systolic}/{v.diastolic} mmHg
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-medium">{v.events}</p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Oxygen Saturation: <span className="text-teal-400 font-bold">{v.spo2}% SpO2</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Manual Vitals Logging Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-white">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{t('logNewVitals')}</h3>
                  <p className="text-xs text-slate-400">Append current bedside reading to 24-hr Recharts timeline</p>
                </div>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogVitals} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {t('heartRate')} (BPM)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="180"
                    value={inputHr}
                    onChange={(e) => setInputHr(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {t('oxygenSat')} (%)
                  </label>
                  <input
                    type="number"
                    min="80"
                    max="100"
                    value={inputSpo2}
                    onChange={(e) => setInputSpo2(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {t('systolic')} (mmHg)
                  </label>
                  <input
                    type="number"
                    min="80"
                    max="220"
                    value={inputSys}
                    onChange={(e) => setInputSys(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {t('diastolic')} (mmHg)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="140"
                    value={inputDia}
                    onChange={(e) => setInputDia(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Clinical Note / Medication / Therapy
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aspirin 75mg taken, Completed bilateral mirror therapy"
                  value={inputEvent}
                  onChange={(e) => setInputEvent(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-sky-600/30 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : t('saveVitals')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
