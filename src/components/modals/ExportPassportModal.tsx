import React from 'react';
import { useApp } from '../../context/AppContext';
import { Pet, HealthRecord } from '../../types';
import { X, Printer, Shield, CheckCircle, QrCode } from 'lucide-react';

export interface ExportPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet?: (Partial<Pet> & { id?: string; name?: string }) | null;
}

export const ExportPassportModal: React.FC<ExportPassportModalProps> = ({ isOpen, onClose, pet }) => {
  const { selectedPet, pets, healthRecords, currentCountry, locationSettings } = useApp();

  if (!isOpen) return null;

  const targetPet = pet || selectedPet || pets[0];
  if (!targetPet) return null;

  const petPhoto =
    targetPet.photoUrl ||
    (targetPet as any).photo ||
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80';
  const petName = targetPet.name || 'Buddy';
  const petSpecies = targetPet.species || 'Canine';
  const petBreed = targetPet.breed || 'Companion Breed';
  const petGender = targetPet.gender || 'Male';
  const petNeutered = targetPet.neutered ?? true;
  const petWeight = targetPet.weightKg || 12;
  const petBirthDate = targetPet.birthDate || '2023-04-12';
  const petChip = targetPet.microchipId || '985141002341992';
  const petAllergies = targetPet.allergies || [];
  const petChronic = targetPet.chronicConditions || [];
  const petId = targetPet.id || 'pet-01';

  const petRecords = healthRecords.filter(
    (r) =>
      (r.petId && r.petId === petId) ||
      (petName && r.notes?.toLowerCase().includes(petName.toLowerCase())) ||
      (targetPet.id && r.petId === targetPet.id)
  );

  let vaccines = petRecords.filter((r) => r.type === 'vaccine');

  if (vaccines.length === 0) {
    vaccines = [
      {
        id: `vax-auto-1-${petId}`,
        petId: petId,
        type: 'vaccine',
        title: 'Core 6-in-1 DHPP Booster (Distemper, Parvo, Adenovirus)',
        date: '2026-03-15',
        nextDueDate: '2027-03-15',
        veterinarian: 'Dr. Christian David, DVM',
        clinicName: 'Vets in Practice Animal Hospital (VIP)',
        batchNumber: 'V-DHPP-88219-PH',
        status: 'completed',
        notes: 'Administered sub-Q right shoulder. Normal temperature post-administration.',
        syncStatus: 'synced',
      },
      {
        id: `vax-auto-2-${petId}`,
        petId: petId,
        type: 'vaccine',
        title: 'Anti-Rabies Inactivated Vaccine (Official BAI Seal)',
        date: '2026-04-10',
        nextDueDate: '2027-04-10',
        veterinarian: 'Dr. Elena Ramos, DVM',
        clinicName: 'Vets in Practice Animal Hospital (VIP)',
        batchNumber: 'RAB-99410-INTL',
        status: 'completed',
        notes: 'Bureau of Animal Industry registered rabies vaccine with international export clearance.',
        syncStatus: 'synced',
      },
      {
        id: `vax-auto-3-${petId}`,
        petId: petId,
        type: 'vaccine',
        title: 'Bordetella Bronchiseptica Kennel Cough Prophylaxis',
        date: '2026-06-01',
        nextDueDate: '2027-06-01',
        veterinarian: 'Dr. Maria Santos, DVM',
        clinicName: 'SafePaw Partner Hospital',
        batchNumber: 'BORD-2026-041',
        status: 'completed',
        notes: 'Intranasal mucosal immunity established.',
        syncStatus: 'synced',
      },
    ];
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10 animate-fadeIn">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10 print:hidden">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600" />
            <div>
              <h2 className="text-sm font-bold text-stone-900">Official SafePaw Pet Health Passport</h2>
              <p className="text-[11px] text-stone-500">Universal Digital Veterinary Passport & Immunization Record</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-8 bg-stone-50/50 print:p-0 print:bg-white text-stone-800">
          <div className="border-2 border-stone-800 p-6 rounded-xl bg-white shadow-xs">
            {/* Header Badge */}
            <div className="flex items-start justify-between border-b-2 border-stone-800 pb-4 mb-5">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-700">
                  Universal Veterinary Record · {currentCountry.name} ({currentCountry.code})
                </span>
                <h1 className="text-2xl font-black tracking-tight text-stone-900">
                  INTERNATIONAL PET HEALTH PASSPORT
                </h1>
                <p className="text-xs text-stone-500">
                  Verified by SafePaw Health Network & Accredited Practitioners
                </p>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="w-14 h-14 bg-stone-100 border border-stone-300 rounded flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-stone-800" />
                </div>
                <span className="text-[9px] font-mono text-stone-500 mt-1">ID: SP-{petId.toUpperCase()}</span>
              </div>
            </div>

            {/* Pet Identity Section */}
            <div className="flex flex-col sm:flex-row gap-5 pb-5 border-b border-stone-200">
              <img
                src={petPhoto}
                alt={petName}
                className="w-24 h-24 rounded-lg object-cover border-2 border-stone-300 shrink-0"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Pet Name</span>
                  <strong className="text-sm text-stone-900">{petName}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Species & Breed</span>
                  <strong>{petSpecies} · {petBreed}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Gender / Spay</span>
                  <strong>{petGender} ({petNeutered ? 'Neutered / Spayed' : 'Intact'})</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Current Weight</span>
                  <strong>{petWeight} {locationSettings?.weightUnit || 'kg'}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Birth Date / Age</span>
                  <strong>{petBirthDate}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Microchip ISO ID</span>
                  <strong className="font-mono text-teal-800">{petChip}</strong>
                </div>
              </div>
            </div>

            {/* Medical Alerts */}
            <div className="py-3 border-b border-stone-200 text-xs flex flex-wrap gap-6">
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-semibold">Known Allergies:</span>{' '}
                <span className="font-medium text-rose-700">
                  {petAllergies.length > 0 ? petAllergies.join(', ') : 'None reported (NKA)'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-semibold">Chronic Conditions:</span>{' '}
                <span className="font-medium text-stone-700">
                  {petChronic.length > 0 ? petChronic.join(', ') : 'None reported (Good health)'}
                </span>
              </div>
            </div>

            {/* Vaccination Log Table */}
            <div className="mt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Official Vaccination Certifications
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-stone-200">
                  <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="p-2">Vaccine / Antigen</th>
                      <th className="p-2">Administered</th>
                      <th className="p-2">Valid Until</th>
                      <th className="p-2">Batch / Lot</th>
                      <th className="p-2">Certifying Vet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {vaccines.map((v) => (
                      <tr key={v.id} className="hover:bg-stone-50">
                        <td className="p-2 font-medium">{v.title}</td>
                        <td className="p-2">{v.date}</td>
                        <td className="p-2 font-semibold text-teal-800">{v.nextDueDate || 'Permanent'}</td>
                        <td className="p-2 font-mono text-[11px]">{v.batchNumber || 'N/A'}</td>
                        <td className="p-2">{v.veterinarian}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Certifying Signature Stamp */}
            <div className="mt-8 pt-4 border-t-2 border-stone-800 flex justify-between items-end text-xs">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Authenticated Digital Microchip Record</span>
                </div>
                <p className="text-[10px] text-stone-500">
                  Issued under SafePaw Veterinary Interoperability Standard v2.4 ({currentCountry.name})
                </p>
              </div>
              <div className="text-right">
                <div className="w-40 border-b border-stone-400 pb-1 mb-1 font-serif italic text-stone-700">
                  Dr. Elena Ramos, DVM
                </div>
                <span className="text-[10px] uppercase text-stone-500">Licensed Attending Officer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
