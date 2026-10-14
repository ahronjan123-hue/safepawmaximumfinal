import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Pet } from '../../types';
import {
  Plus,
  Shield,
  Edit2,
  Trash2,
  Phone,
  AlertTriangle,
  X,
  CheckCircle,
  FileText,
} from 'lucide-react';

interface PetsManagementViewProps {
  onOpenNewPetModal: () => void;
  onOpenExportPassportModal: () => void;
}

export const PetsManagementView: React.FC<PetsManagementViewProps> = ({
  onOpenNewPetModal,
  onOpenExportPassportModal,
}) => {
  const {
    pets,
    selectedPetId,
    setSelectedPetId,
    updatePet,
    deletePet,
    clinics,
    setCurrentTab,
    locationSettings,
    currentCountry,
  } = useApp();

  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleStartEdit = (pet: Pet) => {
    setEditingPetId(pet.id);
    setEditWeight(pet.weightKg.toString());
    setEditNotes(pet.dietaryNotes);
  };

  const handleSaveEdit = (petId: string) => {
    updatePet(petId, {
      weightKg: parseFloat(editWeight) || 1,
      dietaryNotes: editNotes,
    });
    setEditingPetId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            My Pets Management Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Manage comprehensive digital profiles, microchips, dietary requirements, and assigned veterinary clinics for each pet.
          </p>
        </div>
        <button
          onClick={onOpenNewPetModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Pet Profile</span>
        </button>
      </div>

      {/* Deletion Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-emerald-600 hover:text-emerald-900 rounded-lg cursor-pointer"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Pets Grid or Empty State */}
      {pets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-100 shadow-sm">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">No Pets Registered Yet</h2>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
            Create your companion's official digital health record to store vaccination passports, clinical notes, and access hospital booking.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenNewPetModal}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Your First Pet</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => {
          const isSelected = pet.id === selectedPetId;
          const isEditing = editingPetId === pet.id;
          const assignedClinic = clinics.find((c) => c.id === pet.primaryClinicId) || clinics[0];

          return (
            <div
              key={pet.id}
              className={`bg-white rounded-2xl border transition overflow-hidden shadow-xs flex flex-col justify-between ${
                isSelected ? 'border-teal-600 ring-2 ring-teal-100' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div>
                {/* Photo Header */}
                <div className="relative h-44 w-full bg-stone-100">
                  <img
                    src={pet.photoUrl}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-stone-900/60 to-transparent"></div>
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-900/80 text-white text-[10px] font-semibold backdrop-blur-xs">
                      {pet.species}
                    </span>
                    {pet.neutered && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-semibold backdrop-blur-xs">
                        Neutered
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <button
                      onClick={() => handleStartEdit(pet)}
                      className="p-1.5 rounded-lg bg-stone-900/70 hover:bg-stone-900 text-white text-xs backdrop-blur-xs transition cursor-pointer"
                      title="Edit Profile"
                      aria-label={`Edit ${pet.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPetToDelete(pet)}
                      className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs backdrop-blur-xs transition cursor-pointer shadow-xs"
                      title="Delete Pet Profile"
                      aria-label={`Delete ${pet.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black leading-tight">{pet.name}</h3>
                      <span className="text-xs font-semibold">{pet.gender}</span>
                    </div>
                    <div className="text-xs text-stone-200 mt-0.5">
                      {pet.breed} · {pet.ageYears} Years Old
                    </div>
                  </div>
                </div>

                {/* Content details */}
                <div className="p-5 space-y-4">
                  {/* Microchip */}
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <Shield className="w-3.5 h-3.5 text-teal-600" />
                      <span className="text-[10px] uppercase font-bold text-stone-400">Microchip:</span>
                    </div>
                    <span className="font-mono text-stone-900 font-semibold">{pet.microchipId}</span>
                  </div>

                  {/* Weight & Vitals */}
                  {isEditing ? (
                    <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200 space-y-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 uppercase mb-0.5">
                          Update Weight ({locationSettings.weightUnit})
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={editWeight}
                          onChange={(e) => setEditWeight(e.target.value)}
                          className="w-full text-xs px-2 py-1.5 border border-stone-200 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 uppercase mb-0.5">Dietary Notes</label>
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full text-xs px-2 py-1.5 border border-stone-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleSaveEdit(pet.id)}
                          className="flex-1 py-1 bg-teal-600 text-white rounded-lg text-xs font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingPetId(null)}
                          className="px-2 py-1 text-stone-500 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                        <span className="text-stone-400 block text-[10px] uppercase font-semibold">Weight</span>
                        <strong className="text-stone-900">{pet.weightKg} {locationSettings.weightUnit}</strong>
                      </div>
                      <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                        <span className="text-stone-400 block text-[10px] uppercase font-semibold">Birth Date</span>
                        <strong className="text-stone-900">{pet.birthDate}</strong>
                      </div>
                    </div>
                  )}

                  {/* Allergies & Temperament */}
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-stone-400 text-[10px] uppercase font-bold block">Allergies:</span>
                      <span className="text-rose-700 font-medium">
                        {pet.allergies.join(', ') || 'None reported'}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] uppercase font-bold block">Temperament:</span>
                      <span className="text-stone-700">{pet.temperament}</span>
                    </div>
                  </div>

                  {/* Primary Clinic */}
                  <div className="pt-2 border-t border-stone-100 text-xs">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Primary Provider</span>
                    <strong className="text-stone-800">{assignedClinic.name} ({currentCountry.name})</strong>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSelectedPetId(pet.id);
                    onOpenExportPassportModal();
                  }}
                  className="py-2 px-3 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  title="View Official Medical Passport"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  <span>Medical Passport</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedPetId(pet.id);
                    setCurrentTab('dashboard');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition text-center ${
                    isSelected
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                  }`}
                >
                  {isSelected ? 'Active Pet ✓' : 'Select Pet'}
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {petToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setPetToDelete(null)}
        >
          <div
            className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-5 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-pet-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 id="delete-pet-title" className="text-base font-black text-stone-900">
                    Delete Pet Profile Permanently?
                  </h3>
                  <p className="text-xs text-stone-500">
                    Please confirm before we delete this record
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPetToDelete(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Pet Preview Card */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3.5">
              <img
                src={petToDelete.photoUrl}
                alt={petToDelete.name}
                className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-stone-900 truncate">
                    {petToDelete.name}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                    {petToDelete.species}
                  </span>
                </div>
                <p className="text-xs text-stone-500 truncate">
                  {petToDelete.breed} · {petToDelete.gender} · {petToDelete.ageYears} yrs
                </p>
                <p className="text-[10px] text-stone-400 font-mono mt-0.5 truncate">
                  Microchip: {petToDelete.microchipId}
                </p>
              </div>
            </div>

            {/* Permanent Warning Box */}
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-rose-700">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Permanent Deletion Warning</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Are you sure you want to delete <strong>{petToDelete.name}</strong> permanently? All digital health records, vaccination history, clinical appointments, and inquiry messages for this pet will be removed. <strong>This action cannot be undone.</strong>
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPetToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const deletedName = petToDelete.name;
                  deletePet(petToDelete.id);
                  setPetToDelete(null);
                  setToastMessage(`"${deletedName}" has been permanently deleted.`);
                  setTimeout(() => setToastMessage(null), 4000);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
