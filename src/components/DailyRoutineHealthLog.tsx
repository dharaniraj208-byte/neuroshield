import React, { useState } from 'react';
import { useNeuro } from '../context/NeuroContext';
import {
  Calendar,
  Clock,
  Pill,
  Droplets,
  Utensils,
  Activity,
  CheckCircle2,
  AlertCircle,
  Plus,
  Heart,
  Save,
  Bell,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  category: 'MEDICATION' | 'HYDRATION' | 'MEAL' | 'THERAPY' | 'PHYSIOLOGICAL';
  details: string;
  completed: boolean;
}

export const DailyRoutineHealthLog: React.FC = () => {
  const { t, recordExerciseCompletion } = useNeuro();

  // Schedule list
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    {
      id: 'sch-1',
      time: '08:00 AM',
      title: 'Morning Secondary Stroke Prophylaxis',
      category: 'MEDICATION',
      details: 'Aspirin 75mg + Clopidogrel 75mg (DAPT) with glass of water after food.',
      completed: true,
    },
    {
      id: 'sch-2',
      time: '09:30 AM',
      title: 'Hydration Target Check #1',
      category: 'HYDRATION',
      details: 'Drink 250ml thickened fluid with upright chin tuck posture.',
      completed: true,
    },
    {
      id: 'sch-3',
      time: '10:30 AM',
      title: 'Facial Mirror & Hand Dexterity Session',
      category: 'THERAPY',
      details: '15 mins guided mirror retraining in front of Camera HUD.',
      completed: false,
    },
    {
      id: 'sch-4',
      time: '01:00 PM',
      title: 'Neuroprotective Dysphagia Lunch',
      category: 'MEAL',
      details: 'IDDSI Level 5 Minced salmon, soft mashed vegetables & avocado puree.',
      completed: false,
    },
    {
      id: 'sch-5',
      time: '03:30 PM',
      title: 'Afternoon Hydration & Blood Pressure Check',
      category: 'PHYSIOLOGICAL',
      details: 'Record sitting BP (Target < 130/80 mmHg) and drink 250ml water.',
      completed: false,
    },
    {
      id: 'sch-6',
      time: '08:30 PM',
      title: 'Bedtime Lipid & Neuro Protection',
      category: 'MEDICATION',
      details: 'Atorvastatin 40mg + Amlodipine 5mg for nocturnal BP dip control.',
      completed: false,
    },
  ]);

  // Hydration state
  const [hydrationCurrent, setHydrationCurrent] = useState<number>(1250);
  const hydrationTarget = 2000; // 2000 ml

  // Physiological logging states
  const [systolic, setSystolic] = useState<number>(124);
  const [diastolic, setDiastolic] = useState<number>(78);
  const [glucose, setGlucose] = useState<number>(112);
  const [heartRate, setHeartRate] = useState<number>(74);
  const [fatigueLevel, setFatigueLevel] = useState<number>(4);
  const [bowelBladderComfort, setBowelBladderComfort] = useState<string>('Normal / Comfortable');
  const [vitalsSavedNotice, setVitalsSavedNotice] = useState<boolean>(false);

  const toggleScheduleItem = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.completed;
          if (nextState) {
            try {
              confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
            } catch {}
            if (item.category === 'THERAPY') {
              recordExerciseCompletion(item.title, 'Facial', 92);
            }
          }
          return { ...item, completed: nextState };
        }
        return item;
      })
    );
  };

  const addHydration = (amount: number) => {
    setHydrationCurrent((prev) => {
      const next = Math.min(3000, prev + amount);
      if (next >= hydrationTarget && prev < hydrationTarget) {
        try {
          confetti({ particleCount: 60, spread: 60 });
        } catch {}
      }
      return next;
    });
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    setVitalsSavedNotice(true);
    setTimeout(() => setVitalsSavedNotice(false), 3000);
  };

  const hydrationPct = Math.min(100, Math.round((hydrationCurrent / hydrationTarget) * 100));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-400" /> Daily Routine, Medications &amp; Health Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Timed reminders for antiplatelets, blood pressure control, hydration targets, and physiological tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 border border-slate-800 flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5 text-sky-400" /> Reminders: Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Timed Schedule Management (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="h-4 w-4 text-sky-400" /> Today's Scheduled Regimen
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {schedule.filter((s) => s.completed).length} / {schedule.length} Completed
              </span>
            </div>

            <div className="space-y-3">
              {schedule.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleScheduleItem(item.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all flex items-start justify-between gap-3 ${
                    item.completed
                      ? 'border-emerald-500/40 bg-emerald-950/20 opacity-80'
                      : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                        item.completed
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-600 bg-slate-900 text-transparent hover:border-slate-400'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-400">{item.time}</span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                            item.category === 'MEDICATION'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : item.category === 'HYDRATION'
                              ? 'bg-sky-950 text-sky-300 border border-sky-800'
                              : item.category === 'MEAL'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <h4
                        className={`text-sm font-bold mt-1 ${
                          item.completed ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.details}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meal Planning & Swallowing Safety Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-amber-400" /> Dysphagia Swallowing Safety &amp; Neuro Nutrition
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">
                  Prescribed Diet Level
                </span>
                <p className="font-semibold text-white">IDDSI Level 5: Minced &amp; Moist</p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Soft, tender, easily chewed food requiring minimal oral preparation. Avoid stringy, dry, or hard textures to prevent aspiration.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <span className="font-bold text-sky-400 uppercase text-[10px] tracking-wider">
                  Swallowing Precautions
                </span>
                <p className="font-semibold text-white">Chin-Tuck Posture</p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Remain upright 90° during and for 30 minutes following meals. Tuck chin downward toward chest before swallowing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hydration Tracker & Physiological Needs Logging (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Hydration Tracker */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Droplets className="h-4 w-4 text-sky-400" /> Hydration Sentinel
              </h3>
              <span className="font-mono text-xs font-bold text-sky-400">
                {hydrationCurrent} / {hydrationTarget} ml ({hydrationPct}%)
              </span>
            </div>

            {/* Visual Fluid Bar */}
            <div className="h-4 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-400 transition-all duration-500"
                style={{ width: `${hydrationPct}%` }}
              />
            </div>

            {/* Quick Log Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => addHydration(200)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 py-2 text-xs font-semibold text-slate-200 transition"
              >
                +200 ml
              </button>
              <button
                onClick={() => addHydration(250)}
                className="flex-1 rounded-xl bg-sky-600 hover:bg-sky-500 py-2 text-xs font-bold text-white transition shadow"
              >
                +250 ml
              </button>
              <button
                onClick={() => addHydration(500)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 py-2 text-xs font-semibold text-slate-200 transition"
              >
                +500 ml
              </button>
            </div>
          </div>

          {/* Physiological Vitals & Comfort Log Form */}
          <form
            onSubmit={handleSaveVitals}
            className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" /> Physiological Vitals Log
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Today's Check</span>
            </div>

            {/* Blood Pressure Input */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-semibold text-slate-300">Blood Pressure (mmHg)</label>
                <span
                  className={`font-mono font-bold text-xs ${
                    systolic < 130 && diastolic < 80 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {systolic}/{diastolic} (Target &lt;130/80)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(Number(e.target.value))}
                  placeholder="Systolic (e.g. 120)"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                />
                <input
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(Number(e.target.value))}
                  placeholder="Diastolic (e.g. 80)"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Blood Glucose & Heart Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Blood Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  value={glucose}
                  onChange={(e) => setGlucose(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Heart Rate (BPM)
                </label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Fatigue Slider (1 to 10) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-semibold text-slate-300">Fatigue / Energy Level</label>
                <span className="font-mono text-xs text-sky-400 font-bold">{fatigueLevel} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={fatigueLevel}
                onChange={(e) => setFatigueLevel(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            {/* Bowel / Bladder Comfort */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Elimination &amp; Physiological Comfort
              </label>
              <select
                value={bowelBladderComfort}
                onChange={(e) => setBowelBladderComfort(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
              >
                <option value="Normal / Comfortable">Normal / Comfortable</option>
                <option value="Mild Constipation (Post-stroke immobility)">Mild Constipation</option>
                <option value="Urinary Urgency / Frequency">Urinary Urgency</option>
                <option value="Abdominal Discomfort">Abdominal Discomfort</option>
              </select>
            </div>

            {vitalsSavedNotice && (
              <div className="rounded-xl bg-emerald-950/80 p-3 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Vitals successfully logged to Clinical Sentinel!
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-1.5"
            >
              <Save className="h-4 w-4" /> Save Physiological Entry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
