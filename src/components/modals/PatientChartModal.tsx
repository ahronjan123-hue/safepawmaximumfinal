import React, { useState } from 'react';
import { Pet, Appointment, HealthRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { ExportPassportModal } from './ExportPassportModal';
import {
  X,
  Activity,
  AlertTriangle,
  FileText,
  Syringe,
  Heart,
  Calendar,
  CheckCircle2,
  Stethoscope,
  Plus,
  Shield,
  User,
  Phone,
  Printer,
  ChevronRight,
  Pill,
} from 'lucide-react';

interface PatientChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: (Partial<Pet> & { id: string; name: string; species: any; breed: string }) | null | undefined;
  appointment?: Appointment | null;
  onShowToast?: (msg: string) => void;
}

export const PatientChartModal: React.FC<PatientChartModalProps> = ({
  isOpen,
  onClose,
  pet,
  appointment,
  onShowToast,
}) => {
  const { healthRecords, addHealthRecord } = useApp();

  const [activeTab, setActiveTab] = useState<'history' | 'add_note' | 'vaccines' | 'vitals'>('history');
  const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);

  // Form state for adding a new clinical SOAP note
  const [noteTitle, setNoteTitle] = useState('Clinical Consultation & Physical Examination');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescriptionsText, setPrescriptionsText] = useState('');
  const [vetName, setVetName] = useState('Dr. Christian David, DVM');
  const [weightKg, setWeightKg] = useState(pet?.weightKg ? pet.weightKg.toString() : '12');
  const [tempC, setTempC] = useState('38.5');
  const [heartRate, setHeartRate] = useState('110');
  const [respRate, setRespRate] = useState('24');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !pet) return null;

  // Filter health records for this pet
  const petRecords = healthRecords.filter(
    (r) => r.petId === pet.id || (appointment?.petName && r.notes?.includes(pet.name))
  );

  const vaccineRecords = petRecords.filter((r) => r.type === 'vaccine');

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    setIsSubmitting(true);
    const today = new Date().toISOString().split('T')[0];

    const newRecord: Omit<HealthRecord, 'id' | 'syncStatus'> = {
      petId: pet.id,
      type: 'checkup',
      title: noteTitle.trim(),
      date: today,
      veterinarian: vetName.trim() || 'Attending Veterinarian',
      clinicName: appointment?.clinicName || 'Vets in Practice Animal Hospital (VIP)',
      notes: `${clinicalNotes.trim()}${prescriptionsText ? ` | Rx: ${prescriptionsText.trim()}` : ''}`,
      status: 'completed',
      diagnosis: diagnosis.trim() || undefined,
      vitals: {
        weightKg: parseFloat(weightKg) || pet.weightKg,
        tempC: parseFloat(tempC) || 38.5,
        heartRateBpm: parseInt(heartRate) || 110,
        respiratoryRateBpm: parseInt(respRate) || 24,
      },
    };

    addHealthRecord(newRecord);
    setIsSubmitting(false);
    onShowToast?.(`Clinical consultation note saved to ${pet.name}'s medical chart!`);
    setActiveTab('history');
    setClinicalNotes('');
    setDiagnosis('');
    setPrescriptionsText('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER: Patient Identity & Quick Controls */}
        <div className="p-5 sm:p-6 bg-stone-950 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <img
                src={pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'}
                alt={pet.name}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-teal-500/60 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-teal-500 text-stone-950 uppercase tracking-wider">
                {pet.species}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {pet.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-800 text-teal-300 border border-teal-500/30">
                  {pet.breed}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active Patient
                </span>
              </div>

              <div className="text-xs text-stone-400 mt-1 flex flex-wrap items-center gap-3">
                <span>Gender: <strong className="text-stone-200 capitalize">{pet.gender}</strong></span>
                <span>·</span>
                <span>Age: <strong className="text-stone-200">{pet.ageYears} yrs</strong></span>
                <span>·</span>
                <span>Weight: <strong className="text-stone-200">{pet.weightKg || weightKg} kg</strong></span>
                <span>·</span>
                <span>Microchip: <strong className="text-teal-400 font-mono">{pet.microchipId || '985141002341992'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => setIsPassportModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="View Official Medical Passport"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Medical Passport</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
              title="Print EMR Chart"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
              title="Close Chart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* GUARDIAN & MEDICAL ALERTS STRIP */}
        <div className="px-5 py-3 bg-stone-950/80 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-300">
            <User className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              Guardian: <strong className="text-white">{pet.ownerName || appointment?.ownerName || 'Sophia Rodriguez'}</strong>
            </span>
            <span className="text-stone-600">·</span>
            <Phone className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-400">{pet.ownerPhone || appointment?.ownerPhone || '+63 917 882 1290'}</span>
          </div>

          {/* Allergies / Medical alert */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Allergies: {pet.allergies?.length ? pet.allergies.join(', ') : 'None Reported'}</span>
            </span>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-5 pt-3 bg-stone-900 border-b border-stone-800 flex items-center gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>EMR Clinical History ({petRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add_note')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'add_note'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Add SOAP Chart Note</span>
          </button>

          <button
            onClick={() => setActiveTab('vaccines')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'vaccines'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Syringe className="w-4 h-4" />
            <span>Immunizations ({vaccineRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vitals')}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'vitals'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Vitals & Biomarkers</span>
          </button>
        </div>

        {/* TAB CONTENTS (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 max-h-[60vh]">
          {/* TAB 1: EMR CLINICAL HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Medical Record Chronology
                </h3>
                <button
                  onClick={() => setActiveTab('add_note')}
                  className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log New Visit Entry</span>
                </button>
              </div>

              {petRecords.length === 0 ? (
                <div className="p-8 text-center bg-stone-950/60 rounded-2xl border border-stone-800 text-stone-400 text-xs space-y-2">
                  <Stethoscope className="w-8 h-8 text-stone-600 mx-auto" />
                  <p>No prior clinical chart entries logged for {pet.name}.</p>
                  <p className="text-[11px] text-stone-500">
                    Click "Log New Visit Entry" above to add diagnoses, exam observations, or prescribed treatments.
                  </p>
                </div>
              ) : (
                petRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-2xl bg-stone-950 border border-stone-800 hover:border-teal-500/40 transition space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white">
                          {rec.title}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 capitalize font-medium">
                          {rec.type}
                        </span>
                      </div>
                      <span className="text-xs text-stone-400 font-mono">
                        {rec.date}
                      </span>
                    </div>

                    <div className="text-xs text-stone-400 flex flex-wrap items-center gap-2">
                      <span>Attending: <strong className="text-stone-200">{rec.veterinarian}</strong></span>
                      <span>·</span>
                      <span>Clinic: <span className="text-stone-300">{rec.clinicName}</span></span>
                    </div>

                    {rec.diagnosis && (
                      <div className="text-xs p-2.5 rounded-xl bg-teal-950/40 border border-teal-500/20 text-teal-200">
                        <strong className="text-teal-400">Diagnosis:</strong> {rec.diagnosis}
                      </div>
                    )}

                    <div className="text-xs text-stone-300 leading-relaxed bg-stone-900/60 p-3 rounded-xl border border-stone-850">
                      {rec.notes}
                    </div>

                    {rec.vitals && (
                      <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                        {rec.vitals.weightKg && (
                          <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                            Weight: {rec.vitals.weightKg} kg
                          </span>
                        )}
                        {rec.vitals.tempC && (
                          <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                            Temp: {rec.vitals.tempC} °C
                          </span>
                        )}
                        {rec.vitals.heartRateBpm && (
                          <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                            Heart: {rec.vitals.heartRateBpm} BPM
                          </span>
                        )}
                        {rec.vitals.respiratoryRateBpm && (
                          <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                            Resp: {rec.vitals.respiratoryRateBpm} /min
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: ADD SOAP CHART NOTE */}
          {activeTab === 'add_note' && (
            <form onSubmit={handleSaveNote} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-400" />
                  <span>Log Clinical Examination (SOAP / EMR)</span>
                </h3>
                <span className="text-xs text-stone-400">
                  Patient: <strong className="text-white">{pet.name}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">
                    Visit / Chart Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-teal-500"
                    placeholder="e.g. Annual Clinical Exam & Routine Vaccination"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">
                    Attending Clinician / Doctor *
                  </label>
                  <input
                    type="text"
                    required
                    value={vetName}
                    onChange={(e) => setVetName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-teal-500"
                    placeholder="e.g. Dr. Christian David, DVM"
                  />
                </div>
              </div>

              {/* Vitals Input Row */}
              <div className="bg-stone-950/70 p-3.5 rounded-2xl border border-stone-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  Patient Vitals Recorded Today
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">Body Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tempC}
                      onChange={(e) => setTempC(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">Heart Rate (BPM)</label>
                    <input
                      type="number"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">Resp. Rate (/min)</label>
                    <input
                      type="number"
                      value={respRate}
                      onChange={(e) => setRespRate(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1 text-xs">
                  Clinical Diagnosis / Assessment
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden focus:border-teal-500"
                  placeholder="e.g. Mild bilateral otitis externa; healthy cardiovascular status"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1 text-xs">
                  Clinical Notes & Physical Exam Findings *
                </label>
                <textarea
                  rows={4}
                  required
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white text-xs focus:outline-hidden focus:border-teal-500"
                  placeholder="Subjective observation, objective exam findings, skin/coat condition, dental hygiene assessment..."
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1 text-xs">
                  Prescribed Medications & Treatment Plan (Optional)
                </label>
                <input
                  type="text"
                  value={prescriptionsText}
                  onChange={(e) => setPrescriptionsText(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden focus:border-teal-500"
                  placeholder="e.g. Amoxicillin Clavulanate 250mg 1 tab BID for 7 days; Ear cleanser drop BID"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Append to EMR Chart</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: IMMUNIZATIONS */}
          {activeTab === 'vaccines' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Vaccination Record & Prophylaxis Ledger
                </h3>
              </div>

              {vaccineRecords.length === 0 ? (
                <div className="p-8 text-center bg-stone-950/60 rounded-2xl border border-stone-800 text-stone-400 text-xs space-y-2">
                  <Syringe className="w-8 h-8 text-stone-600 mx-auto" />
                  <p>No vaccination history logged on file for {pet.name}.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vaccineRecords.map((vax) => (
                    <div
                      key={vax.id}
                      className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{vax.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {vax.status === 'valid' ? 'Current' : vax.status}
                        </span>
                      </div>
                      <div className="text-xs text-stone-400">
                        Administered: <strong className="text-stone-200">{vax.date}</strong>
                      </div>
                      {vax.nextDueDate && (
                        <div className="text-xs text-amber-300 font-medium">
                          Next Booster Due: {vax.nextDueDate}
                        </div>
                      )}
                      {vax.batchNumber && (
                        <div className="text-[10px] text-stone-500 font-mono">
                          Batch: {vax.batchNumber}
                        </div>
                      )}
                      <div className="text-xs text-stone-400 pt-1 border-t border-stone-900">
                        {vax.veterinarian} · {vax.clinicName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: VITALS & BIOMARKERS */}
          {activeTab === 'vitals' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Baseline Physiological Parameters
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                  <span className="text-[11px] text-stone-400 uppercase font-semibold">Weight</span>
                  <div className="text-2xl font-black text-white">{pet.weightKg || weightKg} kg</div>
                  <span className="text-[10px] text-emerald-400">Within breed healthy range</span>
                </div>
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                  <span className="text-[11px] text-stone-400 uppercase font-semibold">Body Temp</span>
                  <div className="text-2xl font-black text-white">38.5 °C</div>
                  <span className="text-[10px] text-emerald-400">Normal (38.0 - 39.2 °C)</span>
                </div>
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                  <span className="text-[11px] text-stone-400 uppercase font-semibold">Heart Rate</span>
                  <div className="text-2xl font-black text-white">110 BPM</div>
                  <span className="text-[10px] text-emerald-400">Regular rhythm</span>
                </div>
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                  <span className="text-[11px] text-stone-400 uppercase font-semibold">Resp. Rate</span>
                  <div className="text-2xl font-black text-white">24 /min</div>
                  <span className="text-[10px] text-emerald-400">Eupneic, clear lungs</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1.5 text-teal-400">
            <Shield className="w-4 h-4" />
            <span>Encrypted SafePaw EMR Ledger · Clinical Audit Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Close Chart
          </button>
        </div>

        {/* Official Digital Medical Passport Modal */}
        <ExportPassportModal
          isOpen={isPassportModalOpen}
          onClose={() => setIsPassportModalOpen(false)}
          pet={pet as any}
        />
      </div>
    </div>
  );
};
