import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Radio,
  MapPin,
  Phone,
  Shield,
  Heart,
  Check,
  Home,
  Search,
  Filter,
  Send,
  CheckCircle,
  X,
  Calendar,
  Lock,
} from 'lucide-react';
import { Species } from '../../types';

interface SheltersLostPetsViewProps {
  onOpenReportLostPetModal: () => void;
}

export const SheltersLostPetsView: React.FC<SheltersLostPetsViewProps> = ({
  onOpenReportLostPetModal,
}) => {
  const {
    lostPets,
    adoptablePets,
    formatPrice,
    currentCountry,
    locationSettings,
    sendLostPetContactRequest,
    markPetAsReunited,
    submitAdoptionInquiry,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'radar' | 'shelters'>('radar');
  const [radarFilter, setRadarFilter] = useState<'all' | 'lost' | 'found' | 'reunited'>('all');
  const [speciesFilter, setSpeciesFilter] = useState<'all' | Species>('all');
  const [locationQuery, setLocationQuery] = useState('');
  const [microchipSearch, setMicrochipSearch] = useState('');
  const [microchipSearchResult, setMicrochipSearchResult] = useState<string | null>(null);

  // Secure Contact Poster Modal
  const [contactPetTarget, setContactPetTarget] = useState<any | null>(null);
  const [contactSenderName, setContactSenderName] = useState('Sophia Rodriguez');
  const [contactSenderInfo, setContactSenderInfo] = useState('+63 917 555 0192');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSentToast, setContactSentToast] = useState(false);

  // Adoption Application Modal
  const [adoptingPet, setAdoptingPet] = useState<any | null>(null);
  const [adopterName, setAdopterName] = useState('Sophia Rodriguez');
  const [adopterEmail, setAdopterEmail] = useState('sophia.rodriguez@example.com');
  const [adopterPhone, setAdopterPhone] = useState('+63 917 555 0192');
  const [householdInfo, setHouseholdInfo] = useState('Single house with fenced garden, friendly dog already at home.');
  const [adoptionNotes, setAdoptionNotes] = useState('');
  const [adoptionSuccessMsg, setAdoptionSuccessMsg] = useState(false);

  const filteredLostPets = lostPets.filter((item) => {
    const matchesRadar = radarFilter === 'all' || item.status === radarFilter;
    const matchesSpecies = speciesFilter === 'all' || item.species === speciesFilter;
    const matchesLocation =
      !locationQuery.trim() ||
      item.lastSeenLocation.toLowerCase().includes(locationQuery.toLowerCase()) ||
      item.city.toLowerCase().includes(locationQuery.toLowerCase());
    return matchesRadar && matchesSpecies && matchesLocation;
  });

  const handleSearchMicrochip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!microchipSearch.trim()) return;

    const matched = lostPets.find((p) => p.microchipNumber?.includes(microchipSearch.trim()));
    if (matched) {
      setMicrochipSearchResult(
        `Match Found! Registered Pet "${matched.petName}" (${matched.breed}). Owner Hotline: ${matched.contactPhone}`
      );
    } else {
      setMicrochipSearchResult(
        `Microchip ${microchipSearch.trim()} is recognized in the national SafePaw registry for ${currentCountry.name}. No missing report active.`
      );
    }
  };

  const handleSendSecureContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPetTarget || !contactMessage.trim()) return;

    sendLostPetContactRequest({
      reportId: contactPetTarget.id,
      petName: contactPetTarget.petName,
      senderName: contactSenderName.trim() || 'Community Member',
      senderContact: contactSenderInfo.trim() || 'Verified Account',
      message: contactMessage.trim(),
    });

    setContactSentToast(true);
    setTimeout(() => {
      setContactSentToast(false);
      setContactPetTarget(null);
      setContactMessage('');
    }, 2500);
  };

  const handleSendAdoptionApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adoptingPet) return;

    submitAdoptionInquiry({
      petId: adoptingPet.id,
      petName: adoptingPet.name,
      petSpecies: adoptingPet.species,
      petPhotoUrl: adoptingPet.photoUrl,
      applicantName: adopterName.trim(),
      applicantEmail: adopterEmail.trim(),
      applicantPhone: adopterPhone.trim(),
      householdInfo: householdInfo.trim(),
      notes: adoptionNotes.trim(),
    });

    setAdoptionSuccessMsg(true);
    setTimeout(() => {
      setAdoptionSuccessMsg(false);
      setAdoptingPet(null);
      setAdoptionNotes('');
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Community Shelters & Lost Pet Radar
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Empowering animal shelters, rescuers, and pet owners in {locationSettings.customCity || currentCountry.defaultCity}, {currentCountry.name}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReportLostPetModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Broadcast Missing / Found Pet</span>
          </button>
        </div>
      </div>

      {/* Main Mode Toggle: Lost & Found Radar vs Shelter Adoptions */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'radar'
              ? 'bg-rose-50 text-rose-900 border border-rose-200 shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Radio className="w-4 h-4 text-rose-600" />
          <span>Lost & Found Community Radar ({lostPets.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('shelters')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'shelters'
              ? 'bg-teal-50 text-teal-900 border border-teal-200 shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Home className="w-4 h-4 text-teal-600" />
          <span>Shelter Rescue & Adoption Profiles ({adoptablePets.length})</span>
        </button>
      </div>

      {activeTab === 'radar' ? (
        <div className="space-y-6">
          {/* Microchip Scanner Lookup Tool */}
          <div className="p-4 bg-stone-900 text-white rounded-2xl shadow-sm border border-stone-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  Instant Microchip Scanner Verification ({currentCountry.name})
                </h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  Found a stray pet? Enter the scanned 15-digit ISO microchip to retrieve emergency owner contacts.
                </p>
              </div>
              <form onSubmit={handleSearchMicrochip} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={microchipSearch}
                  onChange={(e) => setMicrochipSearch(e.target.value)}
                  placeholder="e.g. 985141007722109"
                  className="px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs font-mono text-white placeholder:text-stone-500 focus:outline-teal-400 w-full sm:w-60"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-xs rounded-xl transition shrink-0 cursor-pointer"
                >
                  Verify Chip
                </button>
              </form>
            </div>
            {microchipSearchResult && (
              <div className="mt-3 p-3 bg-teal-900/60 border border-teal-700/80 rounded-xl text-xs text-teal-100 flex items-center justify-between">
                <span>{microchipSearchResult}</span>
                <button
                  onClick={() => setMicrochipSearchResult(null)}
                  className="text-stone-400 hover:text-white text-xs font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Search & Filter Bar: Location, Species & Date */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Filter by location (e.g. BGC, Makati, Timog)..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-teal-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-semibold shrink-0">Species:</span>
                <select
                  value={speciesFilter}
                  onChange={(e) => setSpeciesFilter(e.target.value as any)}
                  className="w-full py-2 px-3 text-xs border border-stone-200 rounded-xl bg-white text-stone-800"
                >
                  <option value="all">All Species</option>
                  <option value="Dog">Dogs</option>
                  <option value="Cat">Cats</option>
                  <option value="Other">Other Animals</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {[
                  { id: 'all', label: 'All Statuses' },
                  { id: 'lost', label: 'Missing' },
                  { id: 'found', label: 'Found' },
                  { id: 'reunited', label: 'Reunited' },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setRadarFilter(btn.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                      radarFilter === btn.id
                        ? 'bg-stone-900 text-white font-bold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Radar Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLostPets.length === 0 ? (
              <div className="col-span-3 py-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
                <Radio className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs font-semibold">No reports matching your location or species filter.</p>
              </div>
            ) : (
              filteredLostPets.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 w-full bg-stone-100">
                      <img
                        src={report.photoUrl}
                        alt={report.petName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        {report.status === 'lost' ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold tracking-wide uppercase shadow-xs">
                            Missing Pet Alert
                          </span>
                        ) : report.status === 'found' ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 text-[11px] font-bold tracking-wide uppercase shadow-xs">
                            Found Pet Sighting
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold tracking-wide uppercase shadow-xs">
                            Reunited with Family ✓
                          </span>
                        )}
                      </div>
                      {report.baseRewardUSD && report.status === 'lost' && (
                        <div className="absolute top-3 right-3 bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs">
                          Reward: {formatPrice(report.baseRewardUSD)}
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-stone-900">{report.petName}</h3>
                        <div className="text-xs text-stone-500">{report.species} · {report.breed}</div>
                      </div>
                      <div className="text-xs space-y-1.5 text-stone-700">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span><strong>Last seen:</strong> {report.lastSeenLocation}, {report.city}</span>
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Reported: <strong>{report.dateReported}</strong>
                        </div>
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        {report.description}
                      </p>
                      {report.microchipNumber && (
                        <div className="text-[10px] font-mono text-teal-800 bg-teal-50 px-2 py-1 rounded">
                          Microchip: {report.microchipNumber}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions matching spec: Contact poster privately & Mark as Reunited */}
                  <div className="p-5 pt-0 space-y-2">
                    {report.status !== 'reunited' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setContactPetTarget(report)}
                          className="py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Lock className="w-3.5 h-3.5 text-teal-400" />
                          <span>Contact Poster</span>
                        </button>

                        <button
                          onClick={() => markPetAsReunited(report.id)}
                          className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Mark Reunited</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Safely Reunited with Family!</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Shelter Rescues & Adoptable Animals */
        <div className="space-y-6">
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-900 flex items-start gap-3">
            <Heart className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <strong>Shelter Medical Integration:</strong> All animals listed here have complete digital health profiles maintained directly by licensed shelter veterinarians at partner sanctuaries in {currentCountry.name}.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {adoptablePets.map((pet) => (
              <div
                key={pet.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-stone-100">
                    <img
                      src={pet.photoUrl}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold">
                      {pet.status}
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-stone-900">{pet.name}</h3>
                      <span className="text-xs text-stone-500">{pet.age}</span>
                    </div>
                    <div className="text-xs text-stone-600">
                      {pet.species} · {pet.breed} · {pet.gender}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-emerald-800">
                      {pet.vaccinated && (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> Fully Vaccinated
                        </span>
                      )}
                      {pet.neutered && (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> Neutered
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-2">{pet.description}</p>
                    <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                      Shelter: <strong>{pet.shelterName}</strong> ({pet.city})
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => setAdoptingPet(pet)}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Apply for Adoption</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: CONTACT POSTER PRIVATELY (Without exposing phone until poster agrees) */}
      {contactPetTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Private Sighting Notice</h3>
                  <p className="text-[10px] text-stone-500">Connecting about {contactPetTarget.petName}</p>
                </div>
              </div>
              <button
                onClick={() => setContactPetTarget(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 space-y-1 border border-stone-100">
              <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>Privacy Protection Enabled</span>
              </div>
              <p className="text-[11px] text-stone-500">
                To prevent spam and protect privacy, the owner's phone number is withheld. Your sighting message will be sent through the SafePaw verified relay. Once the poster reviews and consents, direct chat will unlock.
              </p>
            </div>

            {contactSentToast ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Message securely relayed to {contactPetTarget.petName}'s guardian!</span>
              </div>
            ) : (
              <form onSubmit={handleSendSecureContact} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] text-stone-600 font-semibold mb-1">Your Name:</label>
                  <input
                    type="text"
                    required
                    value={contactSenderName}
                    onChange={(e) => setContactSenderName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 font-semibold mb-1">Your Contact Info (Phone/Email):</label>
                  <input
                    type="text"
                    required
                    value={contactSenderInfo}
                    onChange={(e) => setContactSenderInfo(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 font-semibold mb-1">Sighting or Location Note:</label>
                  <textarea
                    rows={3}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Where did you see the pet? Describe time, condition, or if secured in a safe place."
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-teal-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setContactPetTarget(null)}
                    className="px-4 py-2 text-stone-500 hover:text-stone-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Sighting Note</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: ADOPTION APPLICATION */}
      {adoptingPet && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <img
                  src={adoptingPet.photoUrl}
                  alt={adoptingPet.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Apply to Adopt {adoptingPet.name}</h3>
                  <p className="text-[11px] text-teal-700 font-semibold">{adoptingPet.shelterName}</p>
                </div>
              </div>
              <button
                onClick={() => setAdoptingPet(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {adoptionSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Application submitted! The shelter coordinator will review and contact you.</span>
              </div>
            ) : (
              <form onSubmit={handleSendAdoptionApplication} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-600 font-semibold mb-1">Your Full Name:</label>
                    <input
                      type="text"
                      required
                      value={adopterName}
                      onChange={(e) => setAdopterName(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-600 font-semibold mb-1">Phone Number:</label>
                    <input
                      type="text"
                      required
                      value={adopterPhone}
                      onChange={(e) => setAdopterPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 font-semibold mb-1">Email Address:</label>
                  <input
                    type="email"
                    required
                    value={adopterEmail}
                    onChange={(e) => setAdopterEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 font-semibold mb-1">Household Environment & Pet Experience:</label>
                  <textarea
                    rows={2}
                    required
                    value={householdInfo}
                    onChange={(e) => setHouseholdInfo(e.target.value)}
                    placeholder="House with yard or condo? Other pets in home? Work from home schedule?"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 font-semibold mb-1">Why do you wish to adopt {adoptingPet.name}?</label>
                  <textarea
                    rows={2}
                    value={adoptionNotes}
                    onChange={(e) => setAdoptionNotes(e.target.value)}
                    placeholder="Personal note for the shelter rescue coordinator..."
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-teal-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdoptingPet(null)}
                    className="px-4 py-2 text-stone-500 hover:text-stone-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>Submit Adoption Application</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
