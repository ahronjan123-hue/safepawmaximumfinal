import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Heart,
  Home,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Plus,
  Search,
  Filter,
  Radio,
  FileText,
  BadgeCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Camera,
  Check,
  X,
  Send,
  LogOut,
  Settings,
  Bell,
} from 'lucide-react';
import { Species, ShelterAnimalRecord } from '../../types';

interface ShelterDashboardViewProps {
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
  onSwitchRole?: () => void;
}

export const ShelterDashboardView: React.FC<ShelterDashboardViewProps> = ({
  onOpenNotifications,
  onOpenSettings,
  onSwitchRole,
}) => {
  const { profile, signOut } = useAuth();
  const {
    shelterAnimals,
    addShelterAnimal,
    updateShelterAnimalStatus,
    adoptionInquiries,
    updateAdoptionInquiryStatus,
    lostPets,
    reportLostPet,
    markPetAsReunited,
    notifications,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'records' | 'adoptions' | 'lost_found' | 'profile'>('records');

  // Intake Modal
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [newAnimalName, setNewAnimalName] = useState('');
  const [newAnimalSpecies, setNewAnimalSpecies] = useState<Species>('Dog');
  const [newAnimalBreed, setNewAnimalBreed] = useState('');
  const [newAnimalAge, setNewAnimalAge] = useState('');
  const [newAnimalGender, setNewAnimalGender] = useState<'Male' | 'Female'>('Male');
  const [newAnimalIntakeReason, setNewAnimalIntakeReason] = useState('');
  const [newAnimalHealthNotes, setNewAnimalHealthNotes] = useState('');
  const [newAnimalPhoto, setNewAnimalPhoto] = useState('');
  const [newAnimalVaccines, setNewAnimalVaccines] = useState('Rabies, 6-in-1 DHPPi');

  // Found Pet Modal
  const [showPostFoundModal, setShowPostFoundModal] = useState(false);
  const [foundPetName, setFoundPetName] = useState('Found Animal');
  const [foundPetSpecies, setFoundPetSpecies] = useState<Species>('Dog');
  const [foundPetBreed, setFoundPetBreed] = useState('Aspin / Mixed');
  const [foundLocation, setFoundLocation] = useState('');
  const [foundDescription, setFoundDescription] = useState('');
  const [foundPhone, setFoundPhone] = useState('+63 928 889 4412');
  const [foundPhoto, setFoundPhoto] = useState('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80');

  // Lost & Found Match modal
  const [selectedLostPetToMatch, setSelectedLostPetToMatch] = useState<string | null>(null);
  const [matchMessage, setMatchMessage] = useState('');
  const [matchSuccessMsg, setMatchSuccessMsg] = useState<string | null>(null);

  // Search & Filter state for records
  const [searchAnimalQuery, setSearchAnimalQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Available' | 'Pending Adoption' | 'Adopted'>('all');

  // Organization Profile state
  const [orgName, setOrgName] = useState(profile?.businessName || 'PawHaven Animal Rescue Alliance & Sanctuary');
  const [orgLocation, setOrgLocation] = useState('Katipunan Valley, Quezon City, Metro Manila');
  const [orgPhone, setOrgPhone] = useState(profile?.phone || '+63 928 889 4412');
  const [orgEmail, setOrgEmail] = useState(profile?.email || 'director@pawhavenrescue.org');
  const [orgRegNumber] = useState('SEC-CN2021-99812 · BAI-ACCREDITED');
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  const handleCreateIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnimalName.trim()) return;

    addShelterAnimal({
      name: newAnimalName.trim(),
      species: newAnimalSpecies,
      breed: newAnimalBreed.trim() || 'Aspin / Local Shorthair',
      photoUrl:
        newAnimalPhoto.trim() ||
        (newAnimalSpecies === 'Cat'
          ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'),
      intakeDate: new Date().toISOString().split('T')[0],
      intakeReason: newAnimalIntakeReason.trim() || 'Community rescue dispatch',
      status: 'Available',
      healthNotes: newAnimalHealthNotes.trim() || 'Triage completed; healthy and stable.',
      vaccinations: newAnimalVaccines.split(',').map((v) => v.trim()).filter(Boolean),
      gender: newAnimalGender,
      age: newAnimalAge.trim() || '1 year',
      spayedNeutered: true,
    });

    setNewAnimalName('');
    setNewAnimalBreed('');
    setNewAnimalAge('');
    setNewAnimalIntakeReason('');
    setNewAnimalHealthNotes('');
    setNewAnimalPhoto('');
    setShowIntakeModal(false);
  };

  const handlePostFound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundLocation.trim()) return;

    reportLostPet({
      petName: foundPetName.trim() || 'Found Pet',
      species: foundPetSpecies,
      breed: foundPetBreed.trim(),
      lastSeenLocation: foundLocation.trim(),
      city: 'Quezon City',
      countryCode: 'PH',
      status: 'found',
      contactPhone: foundPhone,
      description: foundDescription.trim() || 'Found and safely sheltered at PawHaven Sanctuary.',
      photoUrl: foundPhoto,
    });

    setShowPostFoundModal(false);
    setFoundLocation('');
    setFoundDescription('');
  };

  const handleSendMatchMessage = (petName: string) => {
    setMatchSuccessMsg(`Secure notice dispatched to owner of "${petName}". Shelter contact was forwarded safely.`);
    setTimeout(() => {
      setSelectedLostPetToMatch(null);
      setMatchSuccessMsg(null);
      setMatchMessage('');
    }, 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSavedMsg(true);
    setTimeout(() => setProfileSavedMsg(false), 2500);
  };

  const filteredAnimals = shelterAnimals.filter((animal) => {
    const matchesSearch =
      animal.name.toLowerCase().includes(searchAnimalQuery.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchAnimalQuery.toLowerCase()) ||
      animal.healthNotes.toLowerCase().includes(searchAnimalQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || animal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-teal-500 selection:text-stone-950">
      {/* 1. ORGANIZATION HEADER & TOP BAR */}
      <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-teal-500 text-stone-950 flex items-center justify-center font-black shadow-lg shadow-teal-500/20 shrink-0 border border-teal-400">
              <Home className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                  {orgName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 text-[10px] font-bold tracking-wider shrink-0">
                  <BadgeCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Verified Rescue</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                <span className="flex items-center gap-1 text-[11px] text-stone-400">
                  <MapPin className="w-3 h-3 text-teal-400" />
                  {orgLocation}
                </span>
                <span>·</span>
                <span className="text-[11px] text-teal-300 font-mono hidden sm:inline">
                  Reg #{orgRegNumber}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onSwitchRole && (
              <button
                onClick={onSwitchRole}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-semibold text-stone-300 transition cursor-pointer"
              >
                <span>Switch View</span>
              </button>
            )}

            <button
              onClick={() => signOut()}
              className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-stone-800"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-850 flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          <button
            onClick={() => setActiveTab('records')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === 'records'
                ? 'bg-teal-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Animal Records ({shelterAnimals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('adoptions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === 'adoptions'
                ? 'bg-teal-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Adoptions & Inquiries</span>
            {adoptionInquiries.filter((i) => i.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {adoptionInquiries.filter((i) => i.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('lost_found')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === 'lost_found'
                ? 'bg-teal-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Lost & Found Management</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === 'profile'
                ? 'bg-teal-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Organization Profile</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Metric Overview Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Shelter Population</span>
            <div className="text-2xl font-black text-white">{shelterAnimals.length}</div>
            <div className="text-[11px] text-teal-400">Vaccinated & intake-profiled</div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Available For Adoption</span>
            <div className="text-2xl font-black text-emerald-400">
              {shelterAnimals.filter((a) => a.status === 'Available').length}
            </div>
            <div className="text-[11px] text-stone-400">Live on public SafePaw registry</div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Pending Inquiries</span>
            <div className="text-2xl font-black text-amber-400">
              {adoptionInquiries.filter((i) => i.status === 'pending').length}
            </div>
            <div className="text-[11px] text-stone-400">Adoption applicant screenings</div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Reunited Through Radar</span>
            <div className="text-2xl font-black text-teal-400">
              {lostPets.filter((p) => p.status === 'reunited').length}
            </div>
            <div className="text-[11px] text-stone-400">Community missing pet cases solved</div>
          </div>
        </div>

        {/* TAB 1: ANIMAL RECORDS */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-400" />
                  <span>Shelter Animal Records & Intake</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Complete animal profiles with intake date, medical history, vaccination notes, and status tracking.
                </p>
              </div>

              <button
                onClick={() => setShowIntakeModal(true)}
                className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-stone-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>New Animal Intake</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchAnimalQuery}
                  onChange={(e) => setSearchAnimalQuery(e.target.value)}
                  placeholder="Search animal by name, breed, notes..."
                  className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'Available', 'Pending Adoption', 'Adopted'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      statusFilter === st
                        ? 'bg-teal-500 text-stone-950 font-bold'
                        : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
                    }`}
                  >
                    {st === 'all' ? 'All Statuses' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Animal Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAnimals.map((animal) => (
                <div
                  key={animal.id}
                  className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="relative h-48 w-full bg-stone-800 overflow-hidden">
                      <img
                        src={animal.photoUrl}
                        alt={animal.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-xs text-teal-300 text-[10px] font-bold border border-teal-500/30">
                          {animal.species} · {animal.gender}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs ${
                            animal.status === 'Available'
                              ? 'bg-emerald-500 text-stone-950'
                              : animal.status === 'Pending Adoption'
                              ? 'bg-amber-400 text-stone-950'
                              : animal.status === 'Adopted'
                              ? 'bg-teal-500 text-stone-950'
                              : 'bg-rose-500 text-white'
                          }`}
                        >
                          {animal.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-white">{animal.name}</h3>
                        <span className="text-xs text-stone-400 font-medium">{animal.age}</span>
                      </div>

                      <div className="text-xs text-teal-300 font-semibold">{animal.breed}</div>

                      <div className="p-3 rounded-xl bg-stone-950 border border-stone-850 space-y-1.5 text-xs">
                        <div className="text-[11px] text-stone-400">
                          <strong className="text-stone-300">Intake:</strong> {animal.intakeDate} · {animal.intakeReason}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          <strong className="text-stone-300">Health & Vitals:</strong> {animal.healthNotes}
                        </div>
                      </div>

                      {/* Vaccinations tags */}
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-bold text-stone-400">Vaccinations:</div>
                        <div className="flex flex-wrap gap-1">
                          {animal.vaccinations.map((vac, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800 text-teal-300 border border-teal-500/20"
                            >
                              ✓ {vac}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Toggle Bar */}
                  <div className="p-5 pt-0 border-t border-stone-800/80 mt-2">
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1.5 pt-3">
                      Update Animal Status:
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => updateShelterAnimalStatus(animal.id, 'Available')}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          animal.status === 'Available'
                            ? 'bg-emerald-500 text-stone-950'
                            : 'bg-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        Available
                      </button>
                      <button
                        onClick={() => updateShelterAnimalStatus(animal.id, 'Pending Adoption')}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          animal.status === 'Pending Adoption'
                            ? 'bg-amber-400 text-stone-950'
                            : 'bg-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => updateShelterAnimalStatus(animal.id, 'Adopted')}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          animal.status === 'Adopted'
                            ? 'bg-teal-500 text-stone-950'
                            : 'bg-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        Adopted!
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ADOPTION LISTINGS & INQUIRIES */}
        {activeTab === 'adoptions' && (
          <div className="space-y-8">
            {/* Section A: Adoption Inquiries */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-400" />
                  <span>Adoption Applications & Inquiries</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Review applicant details, household environment, and approve or decline adoption inquiries.
                </p>
              </div>

              {adoptionInquiries.length === 0 ? (
                <div className="p-8 text-center bg-stone-900 border border-stone-800 rounded-3xl text-xs text-stone-400">
                  No pending adoption applications at this time.
                </div>
              ) : (
                <div className="space-y-3">
                  {adoptionInquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-5 bg-stone-900 border border-stone-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={inq.petPhotoUrl}
                          alt={inq.petName}
                          className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-stone-700"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-white">{inq.applicantName}</span>
                            <span className="text-xs text-teal-300 font-semibold">
                              applied for {inq.petName} ({inq.petSpecies})
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                inq.status === 'approved'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : inq.status === 'declined'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              }`}
                            >
                              {inq.status}
                            </span>
                          </div>

                          <div className="text-xs text-stone-300 flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1 text-stone-400">
                              <Mail className="w-3.5 h-3.5 text-teal-400" />
                              {inq.applicantEmail}
                            </span>
                            <span className="flex items-center gap-1 text-stone-400">
                              <Phone className="w-3.5 h-3.5 text-teal-400" />
                              {inq.applicantPhone}
                            </span>
                          </div>

                          <div className="text-xs text-stone-300 bg-stone-950 p-2.5 rounded-xl border border-stone-850 mt-2">
                            <strong className="text-stone-400 text-[11px] block">Household Details:</strong>
                            {inq.householdInfo}
                            {inq.notes && (
                              <div className="mt-1 text-stone-400 text-[11px]">
                                <em>"{inq.notes}"</em>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex sm:flex-col items-center gap-2 shrink-0">
                        {inq.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => updateAdoptionInquiryStatus(inq.id, 'approved')}
                              className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve Application</span>
                            </button>

                            <button
                              onClick={() => updateAdoptionInquiryStatus(inq.id, 'declined')}
                              className="w-full px-4 py-2 bg-stone-800 hover:bg-rose-900/60 hover:text-rose-200 text-stone-300 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border border-stone-700"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                          </>
                        ) : (
                          <div className="text-xs text-stone-400 font-semibold px-3 py-1.5 bg-stone-950 rounded-xl border border-stone-800">
                            Status finalized: {inq.status.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section B: Adoption Listings Manager */}
            <div className="space-y-4 pt-6 border-t border-stone-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Live Adoption Listings</h3>
                  <p className="text-xs text-stone-400">Animals currently marked as "Available" or "Pending".</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shelterAnimals
                  .filter((a) => a.status === 'Available' || a.status === 'Pending Adoption')
                  .map((animal) => (
                    <div
                      key={animal.id}
                      className="p-4 bg-stone-900 border border-stone-800 rounded-2xl flex items-center gap-3"
                    >
                      <img
                        src={animal.photoUrl}
                        alt={animal.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{animal.name}</h4>
                        <div className="text-xs text-teal-300 truncate">{animal.breed}</div>
                        <div className="text-[11px] text-stone-400 mt-0.5">Status: {animal.status}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LOST & FOUND MANAGEMENT */}
        {activeTab === 'lost_found' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Radio className="w-5 h-5 text-rose-400 animate-pulse" />
                  <span>Lost & Found Community Radar Management</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Post found animals into the community radar, match sightings with lost reports, and contact owners safely.
                </p>
              </div>

              <button
                onClick={() => setShowPostFoundModal(true)}
                className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-stone-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Post Found Animal</span>
              </button>
            </div>

            {matchSuccessMsg && (
              <div className="p-4 rounded-2xl bg-teal-950 border border-teal-800 text-teal-200 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>{matchSuccessMsg}</span>
              </div>
            )}

            {/* Lost Reports Feed */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {lostPets.map((pet) => {
                const isLost = pet.status === 'lost';
                const isReunited = pet.status === 'reunited';
                return (
                  <div
                    key={pet.id}
                    className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-md"
                  >
                    <div>
                      <div className="relative h-44 w-full bg-stone-800 overflow-hidden">
                        <img
                          src={pet.photoUrl}
                          alt={pet.petName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isLost
                                ? 'bg-rose-600 text-white'
                                : isReunited
                                ? 'bg-emerald-500 text-stone-950 font-bold'
                                : 'bg-amber-400 text-stone-950 font-bold'
                            }`}
                          >
                            {pet.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-white">{pet.petName}</h3>
                          <span className="text-xs text-teal-300">{pet.breed}</span>
                        </div>

                        <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                          {pet.description}
                        </p>

                        <div className="text-xs text-stone-400 space-y-1 pt-1 border-t border-stone-800">
                          <div className="flex items-center gap-1.5 text-stone-300">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>{pet.lastSeenLocation}</span>
                          </div>
                          {pet.microchipNumber && (
                            <div className="text-[11px] font-mono text-teal-400">
                              Microchip: {pet.microchipNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 space-y-2">
                      {isLost && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setSelectedLostPetToMatch(pet.id)}
                            className="py-2 px-3 bg-teal-500 hover:bg-teal-400 text-stone-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Match & Contact</span>
                          </button>

                          <button
                            onClick={() => markPetAsReunited(pet.id)}
                            className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Mark Reunited</span>
                          </button>
                        </div>
                      )}

                      {isReunited && (
                        <div className="text-center py-2 px-3 rounded-xl bg-emerald-950/60 text-emerald-300 text-xs font-semibold border border-emerald-800/60">
                          ✓ Reunited safely with family
                        </div>
                      )}

                      {!isLost && !isReunited && (
                        <button
                          onClick={() => markPetAsReunited(pet.id)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Mark Reunited</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: ORGANIZATION PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b border-stone-800 pb-4">
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-400" />
                <span>Rescue Sanctuary Profile & Verification</span>
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Maintain public verification credentials, contact details, and rescue intake policies.
              </p>
            </div>

            {profileSavedMsg && (
              <div className="p-4 rounded-2xl bg-teal-950 border border-teal-800 text-teal-200 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>Organization profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                  Organization / Sanctuary Legal Name:
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                  Sanctuary Facility Location & Physical Intake Address:
                </label>
                <input
                  type="text"
                  value={orgLocation}
                  onChange={(e) => setOrgLocation(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                    Official Emergency Phone:
                  </label>
                  <input
                    type="text"
                    value={orgPhone}
                    onChange={(e) => setOrgPhone(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                    Adoption Director Email:
                  </label>
                  <input
                    type="email"
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-teal-400 text-xs font-bold">
                  <BadgeCheck className="w-4 h-4" />
                  <span>Accreditation Verification Status: ACTIVE & VERIFIED</span>
                </div>
                <div className="text-[11px] text-stone-400">
                  Registered with Securities and Exchange Commission (SEC) and accredited under the Bureau of Animal Industry (BAI) Animal Welfare Division.
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-stone-950 rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
              >
                Save Organization Profile
              </button>
            </form>
          </div>
        )}
      </main>

      {/* MODAL: NEW ANIMAL INTAKE */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-400" />
                <span>New Animal Intake Profile</span>
              </h3>
              <button
                onClick={() => setShowIntakeModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIntake} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Animal Name:</label>
                  <input
                    type="text"
                    required
                    value={newAnimalName}
                    onChange={(e) => setNewAnimalName(e.target.value)}
                    placeholder="e.g., Milo"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Species:</label>
                  <select
                    value={newAnimalSpecies}
                    onChange={(e) => setNewAnimalSpecies(e.target.value as Species)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Bird">Bird</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Breed:</label>
                  <input
                    type="text"
                    value={newAnimalBreed}
                    onChange={(e) => setNewAnimalBreed(e.target.value)}
                    placeholder="e.g., Aspin"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Estimated Age:</label>
                  <input
                    type="text"
                    value={newAnimalAge}
                    onChange={(e) => setNewAnimalAge(e.target.value)}
                    placeholder="e.g., 2 years"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Gender:</label>
                  <select
                    value={newAnimalGender}
                    onChange={(e) => setNewAnimalGender(e.target.value as 'Male' | 'Female')}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Intake Reason & Circumstance:</label>
                <input
                  type="text"
                  value={newAnimalIntakeReason}
                  onChange={(e) => setNewAnimalIntakeReason(e.target.value)}
                  placeholder="e.g., Surrendered by owner / rescued from highway flood"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Health & Medical Notes:</label>
                <textarea
                  rows={2}
                  value={newAnimalHealthNotes}
                  onChange={(e) => setNewAnimalHealthNotes(e.target.value)}
                  placeholder="e.g., Dewormed, treated for fleas, clear lungs, good appetite."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Vaccinations Administered (comma separated):</label>
                <input
                  type="text"
                  value={newAnimalVaccines}
                  onChange={(e) => setNewAnimalVaccines(e.target.value)}
                  placeholder="Rabies, DHPPi Core"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Photo URL (optional):</label>
                <input
                  type="url"
                  value={newAnimalPhoto}
                  onChange={(e) => setNewAnimalPhoto(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIntakeModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition shadow-md cursor-pointer"
                >
                  Save Animal Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: POST FOUND ANIMAL */}
      {showPostFoundModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-teal-400" />
                <span>Post Found Animal to Community Radar</span>
              </h3>
              <button
                onClick={() => setShowPostFoundModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostFound} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Temporary Pet Name / Identifier:</label>
                  <input
                    type="text"
                    required
                    value={foundPetName}
                    onChange={(e) => setFoundPetName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Species:</label>
                  <select
                    value={foundPetSpecies}
                    onChange={(e) => setFoundPetSpecies(e.target.value as Species)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Location Found:</label>
                <input
                  type="text"
                  required
                  value={foundLocation}
                  onChange={(e) => setFoundLocation(e.target.value)}
                  placeholder="e.g., Near Katipunan Avenue Flyover, Quezon City"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Description & Distinguishing Marks:</label>
                <textarea
                  rows={2}
                  value={foundDescription}
                  onChange={(e) => setFoundDescription(e.target.value)}
                  placeholder="Coat colors, collar color, friendly demeanor, safe at sanctuary."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostFoundModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition shadow-md cursor-pointer"
                >
                  Broadcast Found Pet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MATCH & CONTACT OWNER */}
      {selectedLostPetToMatch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-teal-400" />
                <span>Match & Notify Pet Parent</span>
              </h3>
              <button
                onClick={() => setSelectedLostPetToMatch(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              Dispatch a verified rescue sighting notification to the registered owner. Your sanctuary hotline ({orgPhone}) will be securely provided for immediate coordination.
            </p>

            <div>
              <label className="block text-[11px] text-stone-400 mb-1">Sanctuary Coordinator Message:</label>
              <textarea
                rows={3}
                value={matchMessage}
                onChange={(e) => setMatchMessage(e.target.value)}
                placeholder="We have an animal in our care matching this description. Please contact our front desk at your earliest convenience."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLostPetToMatch(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = lostPets.find((p) => p.id === selectedLostPetToMatch);
                  handleSendMatchMessage(target?.petName || 'Missing Pet');
                }}
                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-md"
              >
                Dispatch Sighting Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
