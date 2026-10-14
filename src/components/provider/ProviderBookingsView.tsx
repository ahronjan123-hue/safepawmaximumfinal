import React, { useState } from 'react';
import { ProviderServiceType, Appointment, Pet } from '../../types';
import { useApp } from '../../context/AppContext';
import { PatientChartModal } from '../modals/PatientChartModal';
import {
  Calendar,
  Clock,
  CheckCircle,
  PlusCircle,
  Search,
  Filter,
  Activity,
  Scissors,
  Shield,
  Home,
  Check,
  ChevronRight,
  AlertTriangle,
  User,
  Phone,
  XCircle,
  FileText,
  Heart,
  Sparkles,
} from 'lucide-react';

interface ProviderBookingsViewProps {
  providerType: ProviderServiceType;
  appointments: Appointment[];
  onShowToast: (msg: string) => void;
  formatPrice: (amountUSD: number) => string;
}

export const ProviderBookingsView: React.FC<ProviderBookingsViewProps> = ({
  providerType,
  appointments,
  onShowToast,
  formatPrice,
}) => {
  const { acceptAppointment, declineAppointment, pets } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'active' | 'completed'>('all');

  // Chart modal state
  const [selectedChartPet, setSelectedChartPet] = useState<Pet | null>(null);
  const [selectedChartApt, setSelectedChartApt] = useState<Appointment | null>(null);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  // Simulated Spa & Grooming Bookings state
  const [groomingBookings, setGroomingBookings] = useState([
    {
      id: 'gb-1',
      petName: 'Bella',
      breed: 'Shih Tzu',
      species: 'Dog',
      ownerName: 'Danica Tan',
      phone: '+63 917 882 1290',
      time: '09:30 AM',
      date: 'Today',
      package: 'Full Spa & Asian Fusion Cut',
      stylist: 'Stylist Carlo',
      coatCondition: 'Moderate Matting / Sensitive Skin',
      priceUSD: 45,
      stage: 'In Bath',
      photoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'gb-2',
      petName: 'Milo',
      breed: 'Toy Poodle',
      species: 'Dog',
      ownerName: 'Paolo Reyes',
      phone: '+63 920 441 8932',
      time: '11:00 AM',
      date: 'Today',
      package: 'De-shedding & Blueberry Facial Soak',
      stylist: 'Stylist Maricel',
      coatCondition: 'Dense Undercoat',
      priceUSD: 38,
      stage: 'Blow Drying',
      photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'gb-3',
      petName: 'Kobe',
      breed: 'Pomeranian',
      species: 'Dog',
      ownerName: 'Erika Santos',
      phone: '+63 918 332 9901',
      time: '01:30 PM',
      date: 'Today',
      package: 'Show Coat Styling & Nail Grinding',
      stylist: 'Master Stylist Arlene',
      coatCondition: 'Double Coat Grooming',
      priceUSD: 52,
      stage: 'Ready for Pickup',
      photoUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'gb-4',
      petName: 'Chico',
      breed: 'Corgi',
      species: 'Dog',
      ownerName: 'Miguel Ramos',
      phone: '+63 922 771 4452',
      time: '03:00 PM',
      date: 'Today',
      package: 'Bath & Tidy + Sanitary Trim',
      stylist: 'Stylist Carlo',
      coatCondition: 'Normal / Healthy',
      priceUSD: 32,
      stage: 'Scheduled',
      photoUrl: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'gb-5',
      petName: 'Princess',
      breed: 'Persian Cat',
      species: 'Cat',
      ownerName: 'Valerie Lim',
      phone: '+63 919 555 1289',
      time: '04:30 PM',
      date: 'Today',
      package: 'Cat Lion Cut & Degreasing Spa',
      stylist: 'Specialist Arlene',
      coatCondition: 'High Matted Belly',
      priceUSD: 55,
      stage: 'Scheduled',
      photoUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=400&q=80',
    },
  ]);

  // Simulated Shelter & Rescue Visit Bookings
  const [shelterVisits, setShelterVisits] = useState([
    {
      id: 'sv-1',
      type: 'Adoption Meet & Greet',
      applicant: 'Joshua Ramos',
      petName: 'Bramble',
      breed: 'Aspin mix (1.5 yrs)',
      species: 'Dog',
      photoUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80',
      time: '10:00 AM',
      date: 'Today',
      coordinator: 'Shelter Lead Bea',
      status: 'Confirmed',
      notes: 'Family with 1 existing golden retriever coming to test compatibility in open yard.',
    },
    {
      id: 'sv-2',
      type: 'Foster Handover',
      applicant: 'Dr. Sofia Alcantara',
      petName: 'Cooper',
      breed: 'Post-Op Trauma Puspin',
      species: 'Cat',
      photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
      time: '11:30 AM',
      date: 'Today',
      coordinator: 'Vet Nurse Mark',
      status: 'Paperwork Ready',
      notes: 'Handover of oral pain management medications & 2-week follow-up appointment.',
    },
    {
      id: 'sv-3',
      type: 'Rescue Intake Inspection',
      applicant: 'Barangay Kagawad Elena',
      petName: 'Cubao Kittens',
      breed: '4 Abandoned Kittens',
      species: 'Cat',
      photoUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=400&q=80',
      time: '01:00 PM',
      date: 'Today',
      coordinator: 'Dr. Santos',
      status: 'Awaiting Arrival',
      notes: 'Initial deworming, maternal formula weaning check & isolation nursery bed assignment.',
    },
    {
      id: 'sv-4',
      type: 'Volunteer Orientation',
      applicant: 'UST Animal Welfare Guild',
      petName: 'Sanctuary Pack',
      breed: 'Rescue Socialization Run',
      species: 'Dog',
      photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
      time: '02:30 PM',
      date: 'Today',
      coordinator: 'Volunteer Head Carlo',
      status: 'Scheduled',
      notes: 'Weekend dog-walking protocols and cattery sanitation briefing.',
    },
  ]);

  // Advance grooming stage
  const handleAdvanceGroomingStage = (id: string) => {
    const stageOrder = ['Scheduled', 'In Bath', 'Blow Drying', 'Scissors Styling', 'Ready for Pickup', 'Completed'];
    setGroomingBookings((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const currentIdx = stageOrder.indexOf(g.stage);
        const nextStage = currentIdx < stageOrder.length - 1 ? stageOrder[currentIdx + 1] : 'Completed';
        onShowToast(`${g.petName}'s styling advanced to: ${nextStage}`);
        return { ...g, stage: nextStage };
      })
    );
  };

  // Helper to extract pet profile for any appointment
  const getPetInfo = (petId?: string, petName?: string): { pet: Pet; photoUrl: string; breed: string; species: string } => {
    const matched = pets.find(
      (p) => (petId && p.id === petId) || (petName && p.name.toLowerCase() === petName.toLowerCase())
    );

    const fallbackPhotos: Record<string, { photo: string; breed: string; species: string }> = {
      buddy: {
        photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
        breed: 'Golden Retriever',
        species: 'Dog',
      },
      bella: {
        photo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
        breed: 'Shih Tzu',
        species: 'Dog',
      },
      milo: {
        photo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
        breed: 'Toy Poodle',
        species: 'Dog',
      },
      kobe: {
        photo: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80',
        breed: 'Pomeranian',
        species: 'Dog',
      },
      chico: {
        photo: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=400&q=80',
        breed: 'Corgi',
        species: 'Dog',
      },
      princess: {
        photo: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=400&q=80',
        breed: 'Persian Cat',
        species: 'Cat',
      },
      luna: {
        photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
        breed: 'Calico Puspin',
        species: 'Cat',
      },
      bramble: {
        photo: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80',
        breed: 'Aspin mix',
        species: 'Dog',
      },
      cooper: {
        photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
        breed: 'Puspin Cat',
        species: 'Cat',
      },
    };

    const cleanName = (petName || '').toLowerCase().trim();
    const fallback = fallbackPhotos[cleanName] || {
      photo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
      breed: 'Companion Pet',
      species: 'Dog',
    };

    if (matched) {
      return {
        pet: matched,
        photoUrl: matched.photoUrl || fallback.photo,
        breed: matched.breed || fallback.breed,
        species: matched.species || fallback.species,
      };
    }

    const syntheticPet: Pet = {
      id: petId || 'pet-' + (petName || 'general'),
      name: petName || 'Patient',
      species: fallback.species as any,
      breed: fallback.breed,
      ageYears: 3,
      birthDate: '2023-04-12',
      gender: 'Male',
      neutered: true,
      weightKg: 12,
      allergies: cleanName === 'bella' ? ['Sensitive skin', 'Beef protein'] : [],
      chronicConditions: [],
      temperament: 'Friendly & cooperative',
      dietaryNotes: 'Standard balanced diet',
      registeredDate: '2024-01-15',
      photoUrl: fallback.photo,
      microchipId: '98514100' + Math.floor(1000000 + Math.random() * 9000000),
      ownerName: 'Verified Pet Guardian',
      ownerPhone: '+63 917 882 1290',
    };

    return {
      pet: syntheticPet,
      photoUrl: fallback.photo,
      breed: fallback.breed,
      species: fallback.species,
    };
  };

  const handleOpenChart = (pet: Pet, apt?: Appointment) => {
    setSelectedChartPet(pet);
    setSelectedChartApt(apt || null);
    setIsChartModalOpen(true);
    onShowToast(`Opened comprehensive EMR chart for ${pet.name}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls: Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-400" />
            <span>
              {providerType === 'veterinary_clinic' && 'Clinical Appointment Schedule & EMR Charts'}
              {providerType === 'grooming_salon' && 'Spa & Grooming Appointments & Styling Bays'}
              {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && 'Adopter Meet & Greets, Foster Handovers & Rescue Intakes'}
            </span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            View patient profiles, open digital medical charts, and manage client bookings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pet profile, client, or service..."
              className="bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-teal-500 w-52 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. VETERINARY CLINIC BOOKINGS LIST */}
      {/* ========================================================= */}
      {providerType === 'veterinary_clinic' && (
        <div className="space-y-5">
          {/* A. PENDING APPOINTMENT REQUESTS FROM PET OWNERS */}
          {appointments.filter((a) => a.status === 'requested' && !a.clinicId.includes('grooming')).length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border-2 border-amber-500/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>
                  Pending Clinical Appointment Requests ({appointments.filter((a) => a.status === 'requested' && !a.clinicId.includes('grooming')).length})
                </span>
                <span className="text-[10px] text-stone-400 font-normal">— Awaiting clinic review</span>
              </div>

              {appointments
                .filter((a) => a.status === 'requested' && !a.clinicId.includes('grooming'))
                .map((req) => {
                  const petInfo = getPetInfo(req.petId, req.petName);
                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl bg-stone-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-400 transition"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        {/* PET PROFILE AVATAR (NOT TIME/DATE) */}
                        <div
                          onClick={() => handleOpenChart(petInfo.pet, req)}
                          className="relative shrink-0 cursor-pointer group"
                          title={`Click to inspect ${petInfo.pet.name}'s profile & open chart`}
                        >
                          <img
                            src={petInfo.photoUrl}
                            alt={petInfo.pet.name}
                            className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl object-cover border-2 border-amber-500/50 group-hover:border-amber-400 transition shadow-md"
                          />
                          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md text-[9px] font-black bg-amber-500 text-stone-950 uppercase tracking-wider">
                            {petInfo.species}
                          </span>
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-extrabold text-white">{req.petName}</span>
                            <span className="text-xs text-stone-400">({petInfo.breed})</span>
                            <span className="text-stone-500">·</span>
                            <span className="text-xs text-amber-300 font-semibold">{req.serviceName}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 uppercase">
                              Requested
                            </span>
                          </div>

                          <div className="text-[11px] text-stone-400 flex flex-wrap gap-2">
                            <span>Guardian: <strong className="text-stone-200">{req.ownerName}</strong> ({req.ownerPhone})</span>
                            <span>·</span>
                            <span>Schedule: <strong className="text-white">{req.date} at {req.time}</strong></span>
                            <span>·</span>
                            <span>Fee: <strong className="text-teal-400">{formatPrice(req.baseCostUSD)}</strong></span>
                          </div>

                          {req.symptoms && (
                            <div className="text-[11px] text-stone-300 bg-stone-900/60 p-2 rounded-lg border border-stone-850">
                              <span className="text-amber-400 font-semibold">Chief Complaint:</span> {req.symptoms}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleOpenChart(petInfo.pet, req)}
                          className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-teal-300 hover:text-teal-200 border border-teal-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Open Chart</span>
                        </button>
                        <button
                          onClick={() => {
                            acceptAppointment(req.id);
                            onShowToast(`Clinical appointment for ${req.petName} confirmed!`);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept & Confirm</span>
                        </button>
                        <button
                          onClick={() => {
                            declineAppointment(req.id, 'Schedule unavailable at requested time');
                            onShowToast(`Appointment request for ${req.petName} declined.`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-rose-950 text-stone-300 hover:text-rose-300 text-xs font-semibold transition border border-stone-700 cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Scheduled Appointments */}
          {appointments.filter((a) => a.status !== 'requested' && a.status !== 'declined' && !a.clinicId.includes('grooming')).length === 0 ? (
            <div className="p-8 text-center bg-stone-950 rounded-3xl border border-stone-800 text-stone-400 text-xs">
              No active appointments scheduled for this filter.
            </div>
          ) : (
            appointments
              .filter((a) => a.status !== 'requested' && a.status !== 'declined' && !a.clinicId.includes('grooming'))
              .map((apt) => {
                const petInfo = getPetInfo(apt.petId, apt.petName);
                return (
                  <div
                    key={apt.id}
                    className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-teal-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      {/* PET PROFILE AVATAR (NOT TIME/DATE) */}
                      <div
                        onClick={() => handleOpenChart(petInfo.pet, apt)}
                        className="relative shrink-0 cursor-pointer group"
                        title={`Click to view ${petInfo.pet.name}'s medical chart`}
                      >
                        <img
                          src={petInfo.photoUrl}
                          alt={petInfo.pet.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-teal-500/50 group-hover:border-teal-400 group-hover:scale-105 transition shadow-md"
                        />
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md text-[9px] font-black bg-teal-500 text-stone-950 uppercase tracking-wider shadow-xs">
                          {petInfo.species}
                        </span>
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-extrabold text-white truncate">
                            {apt.petName}
                          </span>
                          <span className="text-xs text-stone-400 font-medium">({petInfo.breed})</span>
                          <span className="text-stone-500">·</span>
                          <span className="text-xs text-teal-300 font-bold truncate">
                            {apt.serviceName}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-400">
                          <span>Guardian: <strong className="text-stone-200">{apt.ownerName || 'Verified Guardian'}</strong></span>
                          <span>·</span>
                          <span>Schedule: <strong className="text-white">{apt.date} at {apt.time}</strong></span>
                          <span>·</span>
                          <span>Attending: <strong className="text-teal-400">{apt.vetName || 'Dr. Attending'}</strong></span>
                          <span>·</span>
                          <span>Fee: <strong className="text-stone-200">{formatPrice(apt.baseCostUSD)}</strong></span>
                        </div>

                        {apt.symptoms && (
                          <div className="text-[11px] text-amber-300/90 font-medium">
                            Chief Complaint: {apt.symptoms}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        apt.status === 'checked_in' || apt.status === 'in_consultation'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : apt.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-stone-800 text-stone-300'
                      }`}>
                        {apt.status.replace('_', ' ')}
                      </span>

                      {/* OPEN CHART BUTTON: NOW INTERACTIVE */}
                      <button
                        onClick={() => handleOpenChart(petInfo.pet, apt)}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition border border-teal-500/20 flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Open Chart</span>
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SPA & GROOMING SALON BOOKINGS LIST */}
      {/* ========================================================= */}
      {providerType === 'grooming_salon' && (
        <div className="space-y-5">
          {/* A. PENDING APPOINTMENT REQUESTS FROM PET OWNERS (SPA & GROOMING ONLY) */}
          {appointments.filter((a) => a.status === 'requested' && (a.clinicId === 'provider-grooming-01' || a.serviceName.toLowerCase().includes('groom') || a.serviceName.toLowerCase().includes('spa'))).length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border-2 border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>
                    Pending Client Appointment Requests ({appointments.filter((a) => a.status === 'requested' && (a.clinicId === 'provider-grooming-01' || a.serviceName.toLowerCase().includes('groom') || a.serviceName.toLowerCase().includes('spa'))).length})
                  </span>
                </div>
                <span className="text-[10px] text-amber-400/90 uppercase tracking-wider font-semibold">
                  Awaiting Spa & Grooming Approval
                </span>
              </div>

              {appointments
                .filter((a) => a.status === 'requested' && (a.clinicId === 'provider-grooming-01' || a.serviceName.toLowerCase().includes('groom') || a.serviceName.toLowerCase().includes('spa')))
                .map((req) => {
                  const petInfo = getPetInfo(req.petId, req.petName);
                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl bg-stone-950 border border-amber-500/30 hover:border-amber-400 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        {/* PET PROFILE AVATAR (NOT TIME/DATE) */}
                        <div
                          onClick={() => handleOpenChart(petInfo.pet, req)}
                          className="relative shrink-0 cursor-pointer group"
                          title={`Click to open ${petInfo.pet.name}'s chart`}
                        >
                          <img
                            src={petInfo.photoUrl}
                            alt={petInfo.pet.name}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-amber-500/50 group-hover:border-amber-400 transition shadow-md"
                          />
                          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md text-[9px] font-black bg-amber-500 text-stone-950 uppercase tracking-wider">
                            {petInfo.species}
                          </span>
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-extrabold text-white">
                              {req.petName}
                            </span>
                            <span className="text-stone-400 text-xs">({petInfo.breed})</span>
                            <span className="text-stone-600">·</span>
                            <span className="text-xs text-amber-300 font-bold">
                              {req.serviceName}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                              New Request
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-400">
                            <span>Guardian: <strong className="text-stone-200">{req.ownerName || 'Pet Parent'}</strong> ({req.ownerPhone})</span>
                            <span>·</span>
                            <span>Schedule: <strong className="text-white">{req.date} at {req.time}</strong></span>
                            <span>·</span>
                            <span>Fee: <strong className="text-teal-300">{formatPrice(req.baseCostUSD)}</strong></span>
                          </div>

                          {req.symptoms && (
                            <div className="text-[11px] text-stone-300 bg-stone-900/80 p-2 rounded-xl border border-stone-800">
                              <span className="text-amber-400 font-medium">Special Care / Grooming Notes:</span> {req.symptoms}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                        <button
                          onClick={() => handleOpenChart(petInfo.pet, req)}
                          className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-teal-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-teal-500/30"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Open Chart</span>
                        </button>
                        <button
                          onClick={() => {
                            acceptAppointment(req.id);
                            onShowToast(`Appointment for ${req.petName} accepted and confirmed! Pet owner has been notified.`);
                          }}
                          className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept & Confirm</span>
                        </button>
                        <button
                          onClick={() => {
                            declineAppointment(req.id, 'Stylist bay fully booked at requested time slot');
                            onShowToast(`Appointment request for ${req.petName} declined.`);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-rose-950 text-stone-400 hover:text-rose-300 text-xs font-semibold transition border border-stone-800 hover:border-rose-900 cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Real Confirmed Appointments for Spa & Grooming */}
          {appointments
            .filter((a) => a.status !== 'requested' && a.status !== 'declined' && (a.clinicId === 'provider-grooming-01' || a.serviceName.toLowerCase().includes('groom') || a.serviceName.toLowerCase().includes('spa')))
            .map((apt) => {
              const petInfo = getPetInfo(apt.petId, apt.petName);
              return (
                <div
                  key={apt.id}
                  className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-teal-500/30 hover:border-teal-500/50 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {/* PET PROFILE AVATAR (NOT TIME/DATE) */}
                    <div
                      onClick={() => handleOpenChart(petInfo.pet, apt)}
                      className="relative shrink-0 cursor-pointer group"
                      title={`Click to open ${petInfo.pet.name}'s chart`}
                    >
                      <img
                        src={petInfo.photoUrl}
                        alt={petInfo.pet.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-teal-500/50 group-hover:border-teal-400 transition shadow-md"
                      />
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md text-[9px] font-black bg-teal-500 text-stone-950 uppercase tracking-wider">
                        {petInfo.species}
                      </span>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-extrabold text-white">
                          {apt.petName}
                        </span>
                        <span className="text-xs text-stone-400">({petInfo.breed})</span>
                        <span className="text-stone-600">·</span>
                        <span className="text-xs text-teal-300 font-bold">
                          {apt.serviceName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                          Confirmed Booking
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-400">
                        <span>Parent: <strong className="text-stone-200">{apt.ownerName || 'Verified Guardian'}</strong> ({apt.ownerPhone})</span>
                        <span>·</span>
                        <span>Schedule: <strong className="text-white">{apt.date} at {apt.time}</strong></span>
                        <span>·</span>
                        <span>Fee: <strong className="text-stone-200">{formatPrice(apt.baseCostUSD)}</strong></span>
                      </div>

                      {apt.symptoms && (
                        <div className="text-[11px] text-stone-400">
                          Care Notes: <span className="text-stone-300 font-medium">{apt.symptoms}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {apt.status === 'scheduled' ? 'Scheduled in Bay' : apt.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => handleOpenChart(petInfo.pet, apt)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open Chart</span>
                    </button>
                  </div>
                </div>
              );
            })}

          {/* Active Demo Grooming Sessions */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Active Grooming Bays & Floor Progress
            </div>
            {groomingBookings.map((b) => {
              const petInfo = getPetInfo(undefined, b.petName);
              return (
                <div
                  key={b.id}
                  className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-teal-500/40 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {/* PET PROFILE AVATAR (NOT TIME/DATE) */}
                    <div
                      onClick={() => handleOpenChart(petInfo.pet)}
                      className="relative shrink-0 cursor-pointer group"
                      title={`Open ${b.petName}'s grooming care card`}
                    >
                      <img
                        src={b.photoUrl || petInfo.photoUrl}
                        alt={b.petName}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-teal-500/50 group-hover:border-teal-400 transition shadow-md"
                      />
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md text-[9px] font-black bg-teal-500 text-stone-950 uppercase tracking-wider">
                        {b.species}
                      </span>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-extrabold text-white">
                          {b.petName}
                        </span>
                        <span className="text-xs text-stone-400">({b.breed})</span>
                        <span className="text-stone-600">·</span>
                        <span className="text-xs text-teal-300 font-bold">
                          {b.package}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-400">
                        <span>Parent: <strong className="text-stone-200">{b.ownerName}</strong> ({b.phone})</span>
                        <span>·</span>
                        <span>Schedule: <strong className="text-white">{b.date} at {b.time}</strong></span>
                        <span>·</span>
                        <span>Stylist: <strong className="text-amber-300">{b.stylist}</strong></span>
                        <span>·</span>
                        <span>Fee: <strong className="text-stone-200">{formatPrice(b.priceUSD)}</strong></span>
                      </div>

                      <div className="text-[11px] text-stone-400">
                        Coat Alert: <span className="text-stone-300 font-medium">{b.coatCondition}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Stage & Controls */}
                  <div className="flex flex-wrap items-center gap-3 self-end lg:self-center shrink-0">
                    <button
                      onClick={() => handleOpenChart(petInfo.pet)}
                      className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-teal-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-teal-500/30"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open Chart</span>
                    </button>

                    <div className="text-right">
                      <div className="text-[10px] text-stone-400 uppercase font-mono tracking-wider">Current Stage</div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mt-0.5 ${
                        b.stage === 'Ready for Pickup'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                          : b.stage === 'Completed'
                          ? 'bg-stone-800 text-stone-400'
                          : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      }`}>
                        {b.stage}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAdvanceGroomingStage(b.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition cursor-pointer shadow-sm"
                    >
                      Advance Stage →
                    </button>

                    {b.stage === 'Ready for Pickup' && (
                      <button
                        onClick={() => onShowToast(`Ready for pickup SMS notification sent to ${b.ownerName}`)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                      >
                        Send Pickup SMS
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SHELTER & RESCUE VISITS & INTAKE LIST */}
      {/* ========================================================= */}
      {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && (
        <div className="space-y-3">
          {shelterVisits.map((v) => {
            const petInfo = getPetInfo(undefined, v.petName);
            return (
              <div
                key={v.id}
                className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-teal-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  {/* PET PROFILE AVATAR (NOT TIME/DATE) */}
                  <div
                    onClick={() => handleOpenChart(petInfo.pet)}
                    className="relative shrink-0 cursor-pointer group"
                    title={`Click to view rescue chart for ${v.petName}`}
                  >
                    <img
                      src={v.photoUrl || petInfo.photoUrl}
                      alt={v.petName}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-rose-500/50 group-hover:border-rose-400 transition shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md text-[9px] font-black bg-rose-500 text-white uppercase tracking-wider">
                      {v.species}
                    </span>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-teal-400 font-bold">
                        {v.type}
                      </span>
                      <span className="text-base font-extrabold text-white truncate">
                        {v.petName}
                      </span>
                      <span className="text-xs text-stone-400">({v.breed})</span>
                    </div>

                    <div className="text-xs text-stone-300 font-medium flex flex-wrap gap-2">
                      <span>Applicant: <strong className="text-white">{v.applicant}</strong></span>
                      <span>·</span>
                      <span>Schedule: <strong className="text-white">{v.date} at {v.time}</strong></span>
                      <span>·</span>
                      <span>Coordinator: <span className="text-stone-400">{v.coordinator}</span></span>
                    </div>

                    <div className="text-[11px] text-stone-400">
                      {v.notes}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-800 text-stone-300">
                    {v.status}
                  </span>

                  <button
                    onClick={() => handleOpenChart(petInfo.pet)}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Open Chart</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PATIENT CHART MODAL (EMR) */}
      <PatientChartModal
        isOpen={isChartModalOpen}
        onClose={() => {
          setIsChartModalOpen(false);
          setSelectedChartPet(null);
          setSelectedChartApt(null);
        }}
        pet={selectedChartPet}
        appointment={selectedChartApt}
        onShowToast={onShowToast}
      />
    </div>
  );
};
