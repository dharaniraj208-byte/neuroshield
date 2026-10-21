import React, { useState } from 'react';
import { useNeuro } from '../context/NeuroContext';
import {
  Hospital as HospitalIcon,
  UserCheck,
  Phone,
  Mail,
  Send,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Activity,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { Hospital, DoctorSpecialist } from '../context/NeuroContext';
import confetti from 'canvas-confetti';

export const HospitalCollaborationHub: React.FC = () => {
  const {
    hospitals,
    doctors,
    assignDoctorToPatient,
    requestHospitalTransfer,
    t
  } = useNeuro();

  const [selectedHospital, setSelectedHospital] = useState<Hospital>(hospitals[0]);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferHospitalId, setTransferHospitalId] = useState(hospitals[1].id);
  const [transferReason, setTransferReason] = useState('Comprehensive Endovascular Thrombectomy Evaluation');
  const [transferSuccessNotice, setTransferSuccessNotice] = useState(false);

  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [selectedDoctorForConsult, setSelectedDoctorForConsult] = useState<DoctorSpecialist | null>(null);
  const [consultNotes, setConsultNotes] = useState('Patient exhibiting mild facial asymmetry fluctuation; requesting stroke physician review.');
  const [consultSuccessNotice, setConsultSuccessNotice] = useState(false);

  const handleAssignDoctor = (doctor: DoctorSpecialist) => {
    assignDoctorToPatient(doctor.id);
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    } catch {}
  };

  const handleDispatchTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    requestHospitalTransfer(transferHospitalId, transferReason);
    setTransferSuccessNotice(true);
    setTransferModalOpen(false);
    setTimeout(() => setTransferSuccessNotice(false), 4000);
  };

  const handleDispatchConsult = (e: React.FormEvent) => {
    e.preventDefault();
    setConsultSuccessNotice(true);
    setConsultModalOpen(false);
    setTimeout(() => setConsultSuccessNotice(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Collaboration Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-400" /> Multi-Hospital Stroke Network &amp; Doctor Roster
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Inter-hospital referral coordination, specialist physician assignments, and tele-stroke consultations.
          </p>
        </div>

        <button
          onClick={() => setTransferModalOpen(true)}
          className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition flex items-center gap-1.5"
        >
          <Building2 className="h-4 w-4" /> Inter-Hospital Patient Transfer
        </button>
      </div>

      {transferSuccessNotice && (
        <div className="rounded-2xl bg-emerald-950/80 p-4 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>Inter-hospital stroke referral dispatched to destination stroke center. Emergency receiving team notified.</span>
        </div>
      )}

      {consultSuccessNotice && (
        <div className="rounded-2xl bg-sky-950/80 p-4 border border-sky-800 text-xs text-sky-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-sky-400 shrink-0" />
          <span>Tele-stroke case review dispatched to specialist physician. Patient EHR &amp; live CCTV stream link forwarded.</span>
        </div>
      )}

      {/* Section 1: Doctor Specialist Roster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-emerald-400" /> Attending Specialists &amp; On-Call Neurologists ({doctors.length})
          </h3>
          <span className="text-[11px] text-slate-400">Click to assign or request immediate consult</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className={`rounded-3xl border p-5 transition-all space-y-4 ${
                doc.currentPatientAssigned
                  ? 'border-emerald-500/80 bg-slate-900 shadow-xl shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{doc.name}</h4>
                      {doc.currentPatientAssigned && (
                        <span className="rounded-full bg-emerald-500 text-slate-950 px-2 py-0.2 text-[9px] font-black uppercase tracking-wider">
                          Assigned to Patient
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-400 font-semibold">{doc.role}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{doc.qualification}</p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    doc.availability === 'AVAILABLE'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : doc.availability === 'ON_CALL'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {doc.availability.replace('_', ' ')}
                </span>
              </div>

              {/* Affiliation & Contact */}
              <div className="rounded-2xl bg-slate-950/60 p-3 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Hospital:</span>
                  <span className="font-semibold text-white">{doc.hospitalName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Helpline / Mobile:</span>
                  <span className="font-mono text-emerald-400 font-semibold">{doc.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Active Patient Caseload:</span>
                  <span className="font-mono text-white">{doc.assignedPatientsCount} patients</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleAssignDoctor(doc)}
                  disabled={doc.currentPatientAssigned}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    doc.currentPatientAssigned
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  {doc.currentPatientAssigned ? 'Attending Physician' : 'Assign to Patient'}
                </button>

                <button
                  onClick={() => {
                    setSelectedDoctorForConsult(doc);
                    setConsultModalOpen(true);
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-2.5 text-xs font-semibold text-slate-200 transition flex items-center gap-1"
                >
                  <Calendar className="h-3.5 w-3.5 text-sky-400" /> Consult
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Affiliated Stroke Hospital Network */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <HospitalIcon className="h-4 w-4 text-sky-400" /> Affiliated Stroke Centers &amp; Hospital Network ({hospitals.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hospitals.map((hosp) => (
            <div
              key={hosp.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-xl hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-950 text-sky-400 font-bold border border-sky-800">
                    <HospitalIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{hosp.name}</h4>
                    <p className="text-xs text-slate-400">{hosp.city}</p>
                    <span className="inline-block mt-1 rounded bg-sky-950 px-2 py-0.5 text-[10px] font-semibold text-sky-400 border border-sky-800">
                      {hosp.tier}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-950/70 p-3 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">General Beds</span>
                  <p className="text-sm font-mono font-bold text-white mt-0.5">{hosp.availableBeds} Available</p>
                </div>
                <div className="rounded-xl bg-slate-950/70 p-3 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Stroke ICU Beds</span>
                  <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">{hosp.icuStrokeBeds} Ready</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-400" />
                  <strong className="font-mono text-emerald-400">{hosp.emergencyHelpline}</strong>
                </span>
                <button
                  onClick={() => {
                    setTransferHospitalId(hosp.id);
                    setTransferModalOpen(true);
                  }}
                  className="rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 px-3 py-1.5 text-xs font-semibold transition"
                >
                  Refer Patient
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Inter-Hospital Patient Transfer */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-400" /> Inter-Hospital Patient Transfer Dispatch
            </h3>
            <p className="text-xs text-slate-400">
              Coordinate patient transfer from Rehab Bay 104 to an affiliated Comprehensive Stroke Center.
            </p>

            <form onSubmit={handleDispatchTransfer} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Destination Stroke Center
                </label>
                <select
                  value={transferHospitalId}
                  onChange={(e) => setTransferHospitalId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.city}) — {h.icuStrokeBeds} ICU Beds
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Clinical Transfer Justification &amp; Notes
                </label>
                <textarea
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white shadow"
                >
                  Dispatch Transfer Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tele-Stroke Specialist Consult */}
      {consultModalOpen && selectedDoctorForConsult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-sky-400" /> Request Tele-Stroke Case Consult
            </h3>
            <p className="text-xs text-slate-400">
              Forward patient telemetry &amp; live CCTV link to {selectedDoctorForConsult.name} ({selectedDoctorForConsult.role}).
            </p>

            <form onSubmit={handleDispatchConsult} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Consultation Request Notes
                </label>
                <textarea
                  value={consultNotes}
                  onChange={(e) => setConsultNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white focus:border-sky-500 focus:outline-none"
                  required
                />
              </div>

              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-xs text-slate-300 space-y-1">
                <p>Physician Email: <strong className="text-white">{selectedDoctorForConsult.email}</strong></p>
                <p>Direct Mobile: <strong className="font-mono text-emerald-400">{selectedDoctorForConsult.phone}</strong></p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConsultModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-sky-600 hover:bg-sky-500 py-2.5 text-xs font-bold text-white shadow"
                >
                  Send Consult Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
