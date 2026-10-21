import React, { useState } from 'react';
import { useNeuro } from '../context/NeuroContext';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Pill,
  Activity,
  Heart,
  Shield,
  FileCheck,
  ChevronRight,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';

export const MedicalDocumentAnalyzer: React.FC = () => {
  const { language, t } = useNeuro();

  const [docFile, setDocFile] = useState<File | null>(null);
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [manualText, setManualText] = useState<string>('');

  const sampleDischargeText = `DISCHARGE SUMMARY & NEUROLOGY CONSULTATION
Patient: Ramesh Sundaram | Age: 64 | Gender: Male
Admitted: 2026-09-18 | Discharged: 2026-09-25
Primary Diagnosis: Acute Ischemic Stroke, Left Middle Cerebral Artery (MCA) Territory.
NIHSS on Admission: 9 (Facial palsy 2, Left arm drift 2, Dysarthria 1, Sensory 1, Language 3).
Neuroimaging (Brain MRI DWI/FLAIR): Acute cortical/subcortical ischemic infarction involving left frontoparietal operculum. MRA demonstrates moderate left proximal M1 segment stenosis.
Past Medical History: Essential Hypertension (12 years), Type 2 Diabetes Mellitus, Hyperlipidemia.
Medications on Discharge:
1. Aspirin 75mg PO Daily
2. Clopidogrel 75mg PO Daily (Dual Antiplatelet Therapy for 90 days)
3. Atorvastatin 40mg PO QHS
4. Amlodipine 5mg + Telmisartan 40mg PO Daily (Target BP < 130/80 mmHg)
5. Metformin 500mg PO BID
Rehabilitation Orders: Bilateral upper limb mirror therapy, dysphagia safe swallow precautions (IDDSI Level 5), and 24/7 continuous ambient camera sentinel monitoring for recurrence.`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setDocPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadSample = () => {
    setManualText(sampleDischargeText);
    setDocPreview(null);
    setDocFile(null);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/medical-doc/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docBase64: docPreview,
          mimeType: docFile?.type || 'application/pdf',
          filename: docFile?.name || 'discharge-summary.pdf',
          manualText: manualText || sampleDischargeText,
        }),
      });

      const data = await response.json();
      setAnalysisResult(data.analysis);
    } catch (err) {
      console.warn('Doc analysis notice:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" /> Medical Document AI Analyzer &amp; Clinical OCR
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload Brain MRI, CT scans, Hospital Discharge Summaries, or Prescriptions for automatic extraction of stroke history &amp; care plans.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          className="rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 transition flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Load Sample Discharge &amp; MRI Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Input UI (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Upload Document (PDF / Image)
            </h3>

            {/* Drag & Drop Upload Zone */}
            <label className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/70 p-6 text-center cursor-pointer transition group">
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform mb-2">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-white">Click or drag &amp; drop medical file</p>
              <p className="text-[11px] text-slate-400 mt-0.5">PDF, Brain CT/MRI JPEG, or PNG (Max 25MB)</p>
            </label>

            {docFile && (
              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-200">
                  <FileCheck className="h-4 w-4 text-emerald-400" />
                  <span className="font-medium truncate max-w-[200px]">{docFile.name}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {(docFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            )}

            {/* Optional Manual OCR Text Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Or Paste Clinical Notes / Summary Text
              </label>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Paste discharge summary or MRI impression here..."
                rows={6}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs font-mono text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || (!docFile && !manualText)}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Extracting Clinical History with Gemini OCR...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze Medical Document</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Extracted Actionable Clinical Patient Care (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {analysisResult ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 shadow-2xl animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="rounded-full bg-indigo-950 px-2.5 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-800">
                    {analysisResult.documentType}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">
                    {analysisResult.patientName} (Age {analysisResult.age})
                  </h3>
                  <p className="text-xs text-sky-400 font-semibold mt-0.5">
                    {analysisResult.strokeClassification}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">NIHSS Score</span>
                  <p className="text-xl font-black font-mono text-amber-400">
                    {analysisResult.nihssScoreOnAdmission || 8} / 42
                  </p>
                </div>
              </div>

              {/* Imaging Findings */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-sky-400" /> Neuroimaging &amp; Vascular Territorials
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {analysisResult.imagingSummary}
                </p>
              </div>

              {/* Risk Factors & Vital Targets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5" /> Identified Risk Factors
                  </span>
                  <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
                    {analysisResult.riskFactors?.map((rf: string, idx: number) => (
                      <li key={idx}>{rf}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" /> Target Vital Thresholds
                  </span>
                  <div className="space-y-1 text-xs text-slate-300">
                    <p>BP: <strong className="text-white">{analysisResult.vitalTargets?.bloodPressure}</strong></p>
                    <p>Pulse: <strong className="text-white">{analysisResult.vitalTargets?.targetHeartRate}</strong></p>
                    <p>Glucose: <strong className="text-white">{analysisResult.vitalTargets?.bloodGlucose}</strong></p>
                  </div>
                </div>
              </div>

              {/* Prescribed Medications */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Pill className="h-3.5 w-3.5" /> Extracted Medications &amp; Schedule
                </span>
                <div className="divide-y divide-slate-800 text-xs">
                  {analysisResult.prescribedMedications?.map((med: any, idx: number) => (
                    <div key={idx} className="py-2 flex items-start justify-between gap-3">
                      <div>
                        <strong className="text-white">{med.name}</strong> ({med.dosage})
                        <p className="text-[11px] text-slate-400">{med.indication}</p>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 text-right shrink-0">
                        {med.frequency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Care Plan */}
              <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/20 p-4 space-y-2">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Actionable Patient Rehabilitation Plan
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
                  <div>
                    <strong className="text-white">Physical Therapy:</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5">{analysisResult.actionableCarePlan?.physicalTherapy}</p>
                  </div>
                  <div>
                    <strong className="text-white">Diet &amp; Swallow:</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5">{analysisResult.actionableCarePlan?.dietSwallowSafety}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Flags */}
              <div className="rounded-2xl border border-rose-800/80 bg-rose-950/30 p-4 space-y-2">
                <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400" /> Sentinel Emergency Flags
                </span>
                <ul className="list-disc pl-4 text-xs text-rose-200 space-y-1">
                  {analysisResult.emergencyFlags?.map((flag: string, idx: number) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
              <FileText className="h-12 w-12 text-slate-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-300">No Document Analyzed Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Upload a stroke discharge summary, brain MRI report, or click "Load Sample Discharge" to extract clinical patient care recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
