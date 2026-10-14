import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  Pet,
  Clinic,
  Appointment,
  HealthRecord,
  Conversation,
  ChatMessage,
  NotificationItem,
  LostPetReport,
  AdoptablePet,
  OfflineSyncQueueItem,
  AppointmentStatus,
  CountryConfig,
  LocationSettings,
  UserRole,
  VetUserSession,
  ProviderReview,
  AdoptionInquiry,
  ShelterAnimalRecord,
  LostPetContactRequest,
  ProviderServiceType,
} from '../types';

import {
  INITIAL_PETS,
  INITIAL_CLINICS,
  INITIAL_APPOINTMENTS,
  INITIAL_HEALTH_RECORDS,
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_LOST_PETS,
  INITIAL_ADOPTABLE_PETS,
  INITIAL_VETS,
} from '../data/initialData';
import {
  DEFAULT_COUNTRY,
  getCountryByCode,
  formatCurrencyAmount,
} from '../data/countries';

interface AppContextType {
  // Role & Session
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeVet: VetUserSession | null;
  loginAsVet: (vetIdOrEmail: string) => boolean;
  loginCustomVet: (customProfile: VetUserSession) => void;
  logoutVet: () => void;
  availableVets: VetUserSession[];
  updateVetProfile: (updates: Partial<VetUserSession>) => void;
  vetTab: string;
  setVetTab: (tab: string) => void;

  // Pets
  pets: Pet[];
  selectedPetId: string;
  selectedPet: Pet | undefined;
  setSelectedPetId: (id: string) => void;
  addPet: (pet: Omit<Pet, 'id' | 'registeredDate'>) => void;
  updatePet: (id: string, updates: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  getAuthorizedPatientsForVet: () => Pet[];

  // Clinics & Appointments
  clinics: Clinic[];
  appointments: Appointment[];
  getVetAppointments: () => Appointment[];
  bookAppointment: (apt: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'syncStatus'>) => { appointment?: Appointment; error?: string };
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  acceptAppointment: (id: string) => void;
  declineAppointment: (id: string, reason: string) => void;
  rescheduleAppointment: (id: string, newDate: string, newTime: string) => { success: boolean; error?: string };
  completeAppointment: (id: string, summary?: string) => void;
  cancelAppointment: (id: string) => void;

  // Health Records & EMR
  healthRecords: HealthRecord[];
  getPublicHealthRecordsForPet: (petId: string) => HealthRecord[];
  getAllHealthRecordsForVet: (petId: string) => HealthRecord[];
  addHealthRecord: (rec: Omit<HealthRecord, 'id' | 'syncStatus'>) => void;
  addClinicalConsultationNote: (data: {
    petId: string;
    appointmentId?: string;
    title: string;
    diagnosis: string;
    notes: string;
    vitals?: { weightKg?: number; tempC?: number; heartRateBpm?: number; respiratoryRateBpm?: number };
    prescriptions?: { medicineName: string; dosage: string; frequency: string; durationDays: number; instructions: string }[];
    vaccineAdministered?: { name: string; batchNumber: string; nextDueDate?: string };
    isPrivateVetNote?: boolean;
    privateVetNotes?: string;
    ownerDischargeInstructions?: string;
    markAppointmentComplete?: boolean;
  }) => void;

  // Conversations
  conversations: Conversation[];
  sendMessage: (
    conversationId: string,
    text: string,
    attachment?: { type: 'image' | 'record'; name: string },
    senderOverride?: 'user' | 'clinic'
  ) => void;
  startOrGetConversationWithClinic: (clinicId: string, petId?: string) => string;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  sendSimulatedPushNotification: (title: string, body: string, actionTab?: string) => void;

  // Lost Pets & Shelters
  lostPets: LostPetReport[];
  reportLostPet: (report: Omit<LostPetReport, 'id' | 'dateReported'>) => void;
  adoptablePets: AdoptablePet[];

  // Country, Location & Currency Localization
  locationSettings: LocationSettings;
  currentCountry: CountryConfig;
  formatPrice: (amountUSD: number) => string;
  updateLocationSettings: (updates: Partial<LocationSettings>) => void;
  resetToDetectedLocation: () => void;
  setCountryByCode: (code: string) => void;

  // Offline & Synchronization
  isOnline: boolean;
  isSimulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
  syncQueue: OfflineSyncQueueItem[];
  isSyncing: boolean;
  syncOfflineQueue: () => void;
  clearOfflineCache: () => void;
  exportOfflineBackup: () => void;

  // Reviews & Ratings
  reviews: ProviderReview[];
  addReview: (review: Omit<ProviderReview, 'id' | 'date'>) => void;
  replyToReview: (reviewId: string, replyText: string) => void;

  // Favorites
  favoriteProviderIds: string[];
  toggleFavoriteProvider: (providerId: string) => void;

  // Adoption Inquiries
  adoptionInquiries: AdoptionInquiry[];
  submitAdoptionInquiry: (inquiry: Omit<AdoptionInquiry, 'id' | 'submittedAt' | 'status'>) => void;
  updateAdoptionInquiryStatus: (id: string, status: 'approved' | 'declined') => void;

  // Shelter Animal Records
  shelterAnimals: ShelterAnimalRecord[];
  addShelterAnimal: (animal: Omit<ShelterAnimalRecord, 'id'>) => void;
  updateShelterAnimalStatus: (id: string, status: ShelterAnimalRecord['status']) => void;

  // Lost & Found Contact Requests
  contactRequests: LostPetContactRequest[];
  sendLostPetContactRequest: (req: Omit<LostPetContactRequest, 'id' | 'sentAt' | 'posterApproved'>) => void;
  markPetAsReunited: (reportId: string) => void;

  // Provider Verification & Payouts
  providerVerificationStatus: 'pending' | 'approved' | 'rejected';
  submitProviderVerification: (idDoc: string, licenseDoc: string) => void;
  simulateVerifyProvider: (status: 'approved' | 'rejected') => void;
  payoutStatus: 'available' | 'requested' | 'transferred';
  requestPayout: () => void;
  payForAppointment: (appointmentId: string, paymentMethod: string) => void;

  // Navigation
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  preselectedClinicId: string | null;
  setPreselectedClinicId: (id: string | null) => void;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const generateId = (_prefix: string = 'id'): string => {
  return generateUUID();
};

export const deduplicateById = <T extends { id: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (!item || !item.id) continue;
    if (seen.has(item.id)) {
      const uniqueItem = {
        ...item,
        id: generateId(item.id.split('-')[0] || 'item'),
      };
      seen.add(uniqueItem.id);
      result.push(uniqueItem);
    } else {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
};

const STORAGE_KEYS = {
  ROLE: 'safepaw_role_v5_live',
  ACTIVE_VET: 'safepaw_active_vet_v5_live',
  PETS: 'safepaw_pets_v5_live',
  SELECTED_PET_ID: 'safepaw_selected_pet_v5_live',
  APPOINTMENTS: 'safepaw_appointments_v5_live',
  HEALTH_RECORDS: 'safepaw_records_v5_live',
  CONVERSATIONS: 'safepaw_conversations_v5_live',
  NOTIFICATIONS: 'safepaw_notifications_v5_live',
  LOST_PETS: 'safepaw_lost_pets_v5_live',
  OFFLINE_QUEUE: 'safepaw_offline_queue_v5_live',
  LOCATION_SETTINGS: 'safepaw_location_settings_v5_live',
};

// One-time purge of legacy demo cache
if (typeof window !== 'undefined') {
  try {
    const legacyKeys = [
      'safepaw_pets_v3',
      'safepaw_selected_pet_v3',
      'safepaw_appointments_v3',
      'safepaw_records_v3',
      'safepaw_conversations_v3',
      'safepaw_notifications_v3',
      'safepaw_lost_pets_v3',
      'safepaw_active_vet_v3',
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

const DEFAULT_LOCATION_SETTINGS: LocationSettings = {
  detectedCountryCode: 'PH',
  detectedCity: 'Metro Manila',
  isManualOverride: false,
  selectedCountryCode: 'PH',
  customCity: 'Metro Manila',
  customRegion: 'NCR',
  distanceUnit: 'km',
  weightUnit: 'kg',
  autoSyncEnabled: true,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User Role & Authentication
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      // Check if URL starts with /vet
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/vet')) {
        return 'veterinarian';
      }
      const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
      return (saved as UserRole) || 'pet_owner';
    } catch {
      return 'pet_owner';
    }
  });

  const [availableVets] = useState<VetUserSession[]>(INITIAL_VETS);

  const [activeVet, setActiveVet] = useState<VetUserSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_VET);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name?.includes('Elena Ramos') || parsed?.id === 'vet-1' || parsed?.id === 'vet-2') {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_VET);
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Navigation tabs
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [vetTab, setVetTab] = useState<string>('dashboard');
  const [preselectedClinicId, setPreselectedClinicId] = useState<string | null>(null);

  // Connectivity
  const [browserOnline, setBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isOnline = browserOnline && !isSimulatedOffline;

  // Location & Country Settings
  const [locationSettings, setLocationSettings] = useState<LocationSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOCATION_SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION_SETTINGS;
    } catch {
      return DEFAULT_LOCATION_SETTINGS;
    }
  });

  // Derived current country config
  const currentCountry = useMemo(() => {
    const code = locationSettings.isManualOverride
      ? locationSettings.selectedCountryCode
      : locationSettings.detectedCountryCode;
    return getCountryByCode(code);
  }, [locationSettings]);

  // Price formatting helper
  const formatPrice = (amountUSD: number): string => {
    return formatCurrencyAmount(
      amountUSD,
      currentCountry,
      locationSettings.currencyOverrideCode
    );
  };

  // Pets state
  const [pets, setPets] = useState<Pet[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PETS);
      return saved ? deduplicateById(JSON.parse(saved)) : INITIAL_PETS;
    } catch {
      return INITIAL_PETS;
    }
  });

  const [selectedPetId, setSelectedPetId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_PET_ID);
      return saved || (INITIAL_PETS[0]?.id || '');
    } catch {
      return INITIAL_PETS[0]?.id || '';
    }
  });

  // Clinics
  const clinics = INITIAL_CLINICS;

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      return saved ? deduplicateById(JSON.parse(saved)) : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  });

  // Health Records
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HEALTH_RECORDS);
      return saved ? deduplicateById(JSON.parse(saved)) : INITIAL_HEALTH_RECORDS;
    } catch {
      return INITIAL_HEALTH_RECORDS;
    }
  });

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return saved ? deduplicateById(JSON.parse(saved)) : INITIAL_CONVERSATIONS;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });

  const { profile } = useAuth();

  // Notifications Store
  const [rawNotifications, setRawNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? deduplicateById(JSON.parse(saved)) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Filtered Notifications based on authenticated profile & provider type
  const notifications = useMemo(() => {
    if (!profile) return rawNotifications;

    if (profile.role === 'service_provider') {
      const myProviderType = profile.providerType || 'veterinary_clinic';
      const myClinicId = profile.clinicId;

      return rawNotifications.filter((n) => {
        // Exclude notifications meant for other roles
        if (n.targetRole === 'pet_owner') return false;
        if (n.targetRole === 'veterinarian') return false;
        if (n.targetRole === 'shelter_rescuer' && myProviderType !== 'rescue_shelter') return false;

        // If targeted to a specific provider type (e.g. 'grooming_salon')
        if (n.targetProviderType && n.targetProviderType !== myProviderType) {
          return false;
        }

        // If targeted to a specific clinic
        if (n.targetClinicId && myClinicId && n.targetClinicId !== myClinicId) {
          if (n.targetProviderType && n.targetProviderType === myProviderType) {
            return true;
          }
          return false;
        }

        if (n.targetRole === 'service_provider') return true;
        if (n.targetRole === 'all') return true;

        return false;
      });
    }

    if (profile.role === 'pet_owner') {
      return rawNotifications.filter((n) => {
        if (
          n.targetRole === 'service_provider' ||
          n.targetRole === 'veterinarian' ||
          n.targetRole === 'shelter_rescuer'
        ) {
          return false;
        }
        return true;
      });
    }

    if (profile.role === 'veterinarian') {
      return rawNotifications.filter((n) => {
        if (n.targetRole === 'pet_owner') return false;
        if (n.targetProviderType === 'grooming_salon') return false;
        if (n.targetRole === 'shelter_rescuer') return false;
        return true;
      });
    }

    if (profile.role === 'shelter_rescuer') {
      return rawNotifications.filter((n) => {
        if (n.targetRole === 'pet_owner') return false;
        if (n.targetProviderType === 'grooming_salon') return false;
        return (
          n.targetRole === 'shelter_rescuer' ||
          n.targetProviderType === 'rescue_shelter' ||
          n.targetRole === 'all'
        );
      });
    }

    return rawNotifications;
  }, [rawNotifications, profile?.role, profile?.providerType, profile?.clinicId]);

  // Lost Pets
  const [lostPets, setLostPets] = useState<LostPetReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOST_PETS);
      return saved ? deduplicateById(JSON.parse(saved)) : INITIAL_LOST_PETS;
    } catch {
      return INITIAL_LOST_PETS;
    }
  });

  const adoptablePets = INITIAL_ADOPTABLE_PETS;

  // Reviews & Ratings
  const [reviews, setReviews] = useState<ProviderReview[]>(() => {
    try {
      const saved = localStorage.getItem('safepaw_reviews_v6');
      return saved ? JSON.parse(saved) : [
        {
          id: 'rev-1',
          providerId: 'provider-grooming-01',
          authorName: 'Sophia Rodriguez',
          petName: 'Buddy',
          rating: 5,
          comment: 'Stylist Carlo did an extraordinary job with Buddy! His coat is super soft, trimmed perfectly, and smelling great. Gentle and stress-free.',
          date: '2026-10-06',
          serviceName: 'Full Luxury Spa Grooming (Cut, Bath & Nails)',
          reply: {
            text: 'Thank you so much Sophia! Buddy was such a sweet boy during his bath. Looking forward to seeing you both again!',
            date: '2026-10-06',
          },
        },
        {
          id: 'rev-2',
          providerId: '00000000-0000-0000-0000-000000000001',
          authorName: 'Sophia Rodriguez',
          petName: 'Buddy',
          rating: 5,
          comment: 'Dr. Christian David and the VIP hospital team are thorough, compassionate, and transparent with care. Outstanding facility.',
          date: '2026-09-28',
          serviceName: 'Comprehensive Physical Examination',
          reply: {
            text: 'Thank you Sophia! Glad Buddy is doing great and staying active.',
            date: '2026-09-29',
          },
        },
        {
          id: 'rev-3',
          providerId: 'provider-walking-01',
          authorName: 'Elena Santos',
          petName: 'Milo',
          rating: 5,
          comment: 'Urban Paws dog walkers are always punctual, send GPS route tracking, and gave Milo great exercise and plenty of water.',
          date: '2026-10-10',
          serviceName: 'Solo Neighborhood Dog Walk (45 mins)',
        },
      ];
    } catch {
      return [];
    }
  });

  // Favorite Providers
  const [favoriteProviderIds, setFavoriteProviderIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('safepaw_favorites_v6');
      return saved ? JSON.parse(saved) : ['00000000-0000-0000-0000-000000000001', 'provider-grooming-01'];
    } catch {
      return ['00000000-0000-0000-0000-000000000001'];
    }
  });

  // Adoption Inquiries
  const [adoptionInquiries, setAdoptionInquiries] = useState<AdoptionInquiry[]>(() => {
    try {
      const saved = localStorage.getItem('safepaw_inquiries_v6');
      return saved ? JSON.parse(saved) : [
        {
          id: 'inq-1',
          petId: 'sa-1',
          petName: 'Bramble',
          petSpecies: 'Dog',
          petPhotoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80',
          applicantName: 'Joshua Ramos',
          applicantEmail: 'joshua.ramos@example.ph',
          applicantPhone: '+63 917 882 1290',
          householdInfo: 'Single family house with 6ft perimeter fence in Marikina Heights. 1 friendly neutered senior Labrador.',
          notes: 'Looking for an energetic companion for family weekend park runs.',
          submittedAt: '2026-10-12T14:30:00.000Z',
          status: 'pending',
        },
        {
          id: 'inq-2',
          petId: 'sa-2',
          petName: 'Cleo',
          petSpecies: 'Cat',
          petPhotoUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80',
          applicantName: 'Danica Tan',
          applicantEmail: 'danica.tan@gmail.com',
          applicantPhone: '+63 920 441 8932',
          householdInfo: 'Pet-friendly 2-bedroom condo in BGC with meshed safety windows and cat scratching gyms.',
          notes: 'Remote designer looking for a calm cuddly indoor cat companion.',
          submittedAt: '2026-10-11T10:15:00.000Z',
          status: 'approved',
        },
      ];
    } catch {
      return [];
    }
  });

  // Shelter Animal Records
  const [shelterAnimals, setShelterAnimals] = useState<ShelterAnimalRecord[]>(() => {
    try {
      const saved = localStorage.getItem('safepaw_shelter_animals_v6');
      return saved ? JSON.parse(saved) : [
        {
          id: 'sa-1',
          name: 'Bramble',
          species: 'Dog',
          breed: 'Aspin / Labrador Mix',
          photoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80',
          intakeDate: '2026-08-14',
          intakeReason: 'Rescued from flooded construction lot in Katipunan Valley',
          status: 'Available',
          healthNotes: 'Fully treated for mange, heartworm negative, clear stool, full strength restored.',
          vaccinations: ['Rabies (Valid)', 'DHPPi Core 6-in-1', 'Bordetella'],
          gender: 'Male',
          age: '1.5 years',
          spayedNeutered: true,
        },
        {
          id: 'sa-2',
          name: 'Cleo',
          species: 'Cat',
          breed: 'Calico Puspin Shorthair',
          photoUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80',
          intakeDate: '2026-09-02',
          intakeReason: 'Orphaned stray kitten surrendered to sanctuary clinic',
          status: 'Available',
          healthNotes: 'Healthy, playful, dewormed 3x, clear fecal test, excellent appetite.',
          vaccinations: ['Feline 4-Way Core (Valid)', 'Rabies (Valid)'],
          gender: 'Female',
          age: '8 months',
          spayedNeutered: true,
        },
        {
          id: 'sa-3',
          name: 'Toby',
          species: 'Dog',
          breed: 'Beagle / Terrier Mix',
          photoUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80',
          intakeDate: '2026-09-20',
          intakeReason: 'Abandoned roadside; rescued by volunteer dispatch van',
          status: 'Pending Adoption',
          healthNotes: 'Mild ear mites treated successfully with topical medication, healthy weight.',
          vaccinations: ['Rabies (Valid)', 'DHPPi Core 6-in-1'],
          gender: 'Male',
          age: '2 years',
          spayedNeutered: true,
        },
      ];
    } catch {
      return [];
    }
  });

  // Lost Pet Contact Requests
  const [contactRequests, setContactRequests] = useState<LostPetContactRequest[]>(() => {
    try {
      const saved = localStorage.getItem('safepaw_contact_requests_v6');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Provider Verification Status
  const [providerVerificationStatus, setProviderVerificationStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');
  // Provider Payout Status
  const [payoutStatus, setPayoutStatus] = useState<'available' | 'requested' | 'transferred'>('available');

  const addReview = (review: Omit<ProviderReview, 'id' | 'date'>) => {
    const newRev: ProviderReview = {
      ...review,
      id: 'rev-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
    };
    const nextReviews = [newRev, ...reviews];
    setReviews(nextReviews);
    try {
      localStorage.setItem('safepaw_reviews_v6', JSON.stringify(nextReviews));
    } catch {}

    // Link review back to appointment if bookingId exists
    if (review.bookingId) {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === review.bookingId
            ? { ...a, reviewRating: review.rating, reviewComment: review.comment, reviewedAt: new Date().toISOString() }
            : a
        )
      );
    }
  };

  const replyToReview = (reviewId: string, replyText: string) => {
    const updated = reviews.map((r) =>
      r.id === reviewId
        ? { ...r, reply: { text: replyText, date: new Date().toISOString().split('T')[0] } }
        : r
    );
    setReviews(updated);
    try {
      localStorage.setItem('safepaw_reviews_v6', JSON.stringify(updated));
    } catch {}
  };

  const toggleFavoriteProvider = (providerId: string) => {
    setFavoriteProviderIds((prev) => {
      const updated = prev.includes(providerId)
        ? prev.filter((id) => id !== providerId)
        : [...prev, providerId];
      try {
        localStorage.setItem('safepaw_favorites_v6', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const submitAdoptionInquiry = (inquiry: Omit<AdoptionInquiry, 'id' | 'submittedAt' | 'status'>) => {
    const newInq: AdoptionInquiry = {
      ...inquiry,
      id: 'inq-' + Date.now(),
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    const updated = [newInq, ...adoptionInquiries];
    setAdoptionInquiries(updated);
    try {
      localStorage.setItem('safepaw_inquiries_v6', JSON.stringify(updated));
    } catch {}
    sendSimulatedPushNotification(
      'Adoption Application Received',
      `Application for ${inquiry.petName} submitted to PawHaven Animal Sanctuary. Review within 24-48 hours.`,
      'shelters'
    );
  };

  const updateAdoptionInquiryStatus = (id: string, status: 'approved' | 'declined') => {
    const updated = adoptionInquiries.map((inq) =>
      inq.id === id ? { ...inq, status } : inq
    );
    setAdoptionInquiries(updated);
    try {
      localStorage.setItem('safepaw_inquiries_v6', JSON.stringify(updated));
    } catch {}
  };

  const addShelterAnimal = (animal: Omit<ShelterAnimalRecord, 'id'>) => {
    const newAnimal: ShelterAnimalRecord = {
      ...animal,
      id: 'sa-' + Date.now(),
    };
    const updated = [newAnimal, ...shelterAnimals];
    setShelterAnimals(updated);
    try {
      localStorage.setItem('safepaw_shelter_animals_v6', JSON.stringify(updated));
    } catch {}
  };

  const updateShelterAnimalStatus = (id: string, status: ShelterAnimalRecord['status']) => {
    const updated = shelterAnimals.map((a) => (a.id === id ? { ...a, status } : a));
    setShelterAnimals(updated);
    try {
      localStorage.setItem('safepaw_shelter_animals_v6', JSON.stringify(updated));
    } catch {}
  };

  const sendLostPetContactRequest = (req: Omit<LostPetContactRequest, 'id' | 'sentAt' | 'posterApproved'>) => {
    const newReq: LostPetContactRequest = {
      ...req,
      id: 'req-' + Date.now(),
      sentAt: new Date().toISOString(),
      posterApproved: false,
    };
    const updated = [newReq, ...contactRequests];
    setContactRequests(updated);
    try {
      localStorage.setItem('safepaw_contact_requests_v6', JSON.stringify(updated));
    } catch {}
    sendSimulatedPushNotification(
      'Secure Sighting Inquiry Sent',
      `Your message regarding "${req.petName}" was securely forwarded to the poster without exposing personal contact details until they consent.`,
      'shelters'
    );
  };

  const markPetAsReunited = (reportId: string) => {
    setLostPets((prev) => {
      const updated = prev.map((p) =>
        p.id === reportId ? { ...p, status: 'reunited' as const } : p
      );
      try {
        localStorage.setItem(STORAGE_KEYS.LOST_PETS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    sendSimulatedPushNotification(
      'Celebration: Pet Reunited!',
      'Wonderful news! The pet was safely marked as reunited with their family.',
      'shelters'
    );
  };

  const submitProviderVerification = (_idDoc: string, _licenseDoc: string) => {
    setProviderVerificationStatus('pending');
  };

  const simulateVerifyProvider = (status: 'approved' | 'rejected') => {
    setProviderVerificationStatus(status);
  };

  const requestPayout = () => {
    setPayoutStatus('requested');
    setTimeout(() => {
      setPayoutStatus('transferred');
    }, 2500);
  };

  const payForAppointment = (appointmentId: string, _paymentMethod: string) => {
    setAppointments((prev) => {
      const updated = prev.map((a) =>
        a.id === appointmentId ? { ...a, paymentStatus: 'paid' as const } : a
      );
      try {
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Offline queue
  const [syncQueue, setSyncQueue] = useState<OfflineSyncQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return saved ? deduplicateById(JSON.parse(saved)) : [];
    } catch {
      return [];
    }
  });

  // Local storage persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
    } catch {}
  }, [currentRole]);

  useEffect(() => {
    try {
      if (activeVet) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_VET, JSON.stringify(activeVet));
      }
    } catch {}
  }, [activeVet]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCATION_SETTINGS, JSON.stringify(locationSettings));
    } catch {}
  }, [locationSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));
    } catch {}
  }, [pets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_PET_ID, selectedPetId);
    } catch {}
  }, [selectedPetId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    } catch {}
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HEALTH_RECORDS, JSON.stringify(healthRecords));
    } catch {}
  }, [healthRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(rawNotifications));
    } catch {}
  }, [rawNotifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOST_PETS, JSON.stringify(lostPets));
    } catch {}
  }, [lostPets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(syncQueue));
    } catch {}
  }, [syncQueue]);

  // Network listeners
  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto sync when coming back online
  useEffect(() => {
    if (isOnline && syncQueue.length > 0 && !isSyncing && locationSettings.autoSyncEnabled) {
      syncOfflineQueue();
    }
  }, [isOnline, syncQueue.length, locationSettings.autoSyncEnabled]);

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => !prev);
  };

  const syncOfflineQueue = () => {
    if (syncQueue.length === 0) return;
    setIsSyncing(true);

    setTimeout(() => {
      setAppointments((prev) =>
        prev.map((a) => (a.syncStatus === 'pending_sync' ? { ...a, syncStatus: 'synced' } : a))
      );
      setHealthRecords((prev) =>
        prev.map((r) => (r.syncStatus === 'pending_sync' ? { ...r, syncStatus: 'synced' } : r))
      );

      const itemsSyncedCount = syncQueue.length;
      setSyncQueue([]);
      setIsSyncing(false);

      const newNotif: NotificationItem = {
        id: `notif-sync-${Date.now()}`,
        type: 'sync',
        title: 'Offline Sync Completed',
        description: `Successfully synchronized ${itemsSyncedCount} offline record${itemsSyncedCount > 1 ? 's' : ''} with SafePaw Cloud.`,
        timestamp: 'Just now',
        read: false,
        badge: 'Sync',
      };
      setRawNotifications((prev) => [newNotif, ...prev]);
    }, 1200);
  };

  // Veterinarian Authentication & Role Handling
  const loginAsVet = (vetIdOrEmail: string): boolean => {
    const found = availableVets.find(
      (v) => v.id === vetIdOrEmail || v.email.toLowerCase() === vetIdOrEmail.toLowerCase()
    );
    if (found) {
      if (activeVet?.id === found.id && currentRole === 'veterinarian') {
        return true;
      }
      setActiveVet(found);
      setCurrentRole('veterinarian');
      setVetTab('dashboard');
      return true;
    }
    return false;
  };

  const loginCustomVet = (customProfile: VetUserSession) => {
    if (activeVet?.id === customProfile.id && currentRole === 'veterinarian') {
      return;
    }
    setActiveVet(customProfile);
    setCurrentRole('veterinarian');
    setVetTab('dashboard');
  };

  const logoutVet = () => {
    setCurrentRole('pet_owner');
    setCurrentTab('dashboard');
  };

  const updateVetProfile = (updates: Partial<VetUserSession>) => {
    if (!activeVet) return;
    const updated = { ...activeVet, ...updates };
    setActiveVet(updated);
  };

  // Scoped Data Access for Veterinarians
  const getVetAppointments = (): Appointment[] => {
    if (!activeVet) return appointments;
    // Returns appointments assigned to this vet OR to their clinic
    return appointments.filter(
      (a) => a.vetId === activeVet.id || a.clinicId === activeVet.clinicId
    );
  };

  const getAuthorizedPatientsForVet = (): Pet[] => {
    if (!activeVet) return pets;
    // Authorized patients are pets associated with this clinic or assigned appointments
    const relevantPetIds = new Set<string>();
    pets.forEach((p) => {
      if (p.primaryClinicId === activeVet.clinicId) {
        relevantPetIds.add(p.id);
      }
    });
    appointments.forEach((a) => {
      if (a.clinicId === activeVet.clinicId || a.vetId === activeVet.id) {
        relevantPetIds.add(a.petId);
      }
    });
    return pets.filter((p) => relevantPetIds.has(p.id));
  };

  // Security Scoped Records: Pet owners cannot see internal private vet notes
  const getPublicHealthRecordsForPet = (petId: string): HealthRecord[] => {
    return healthRecords
      .filter((r) => r.petId === petId && !r.isPrivateVetNote)
      .map((r) => {
        // Strip out private internal notes before delivering to pet owner
        const copy = { ...r };
        delete copy.privateVetNotes;
        return copy;
      });
  };

  const getAllHealthRecordsForVet = (petId: string): HealthRecord[] => {
    return healthRecords.filter((r) => r.petId === petId);
  };

  // Pet management
  const selectedPet = pets.find((p) => p.id === selectedPetId) || pets[0] || undefined;

  const addPet = (petData: Omit<Pet, 'id' | 'registeredDate'>) => {
    const newPet: Pet = {
      ...petData,
      id: generateId('pet'),
      registeredDate: new Date().toISOString().split('T')[0],
      ownerName: petData.ownerName || 'Verified Pet Parent',
      ownerPhone: petData.ownerPhone || '(02) 8812-9901',
    };
    setPets((prev) => deduplicateById([newPet, ...prev]));
    setSelectedPetId(newPet.id);
  };

  const updatePet = (id: string, updates: Partial<Pet>) => {
    setPets((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePet = (id: string) => {
    setPets((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (selectedPetId === id) {
        setSelectedPetId(remaining.length > 0 ? remaining[0].id : '');
      }
      return remaining;
    });
    setHealthRecords((prev) => prev.filter((r) => r.petId !== id));
    setAppointments((prev) => prev.filter((a) => a.petId !== id));
    setConversations((prev) => prev.filter((c) => c.petId !== id));
  };

  // Appointment Double Booking / Conflict Check
  const checkDoubleBooking = (
    vetId: string,
    clinicId: string,
    date: string,
    time: string,
    excludeAppointmentId?: string
  ): boolean => {
    return appointments.some((a) => {
      if (excludeAppointmentId && a.id === excludeAppointmentId) return false;
      if (a.status === 'cancelled') return false;
      const sameVet = a.vetId === vetId;
      const sameClinic = a.clinicId === clinicId;
      const sameTimeSlot = a.date === date && a.time === time;
      return (sameVet || sameClinic) && sameTimeSlot;
    });
  };

  // Booking appointments (Owner Initiated)
  const bookAppointment = (
    aptData: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'syncStatus'>
  ): { appointment?: Appointment; error?: string } => {
    // Conflict check
    if (aptData.vetId) {
      const hasConflict = checkDoubleBooking(
        aptData.vetId,
        aptData.clinicId,
        aptData.date,
        aptData.time
      );
      if (hasConflict) {
        return {
          error: `Dr. ${aptData.vetName} already has a scheduled consultation at ${aptData.time} on ${aptData.date}. Please select another slot.`,
        };
      }
    }

    const targetClinic = clinics.find((c) => c.id === aptData.clinicId);
    const targetProviderType: ProviderServiceType =
      targetClinic?.type === 'groomer'
        ? 'grooming_salon'
        : targetClinic?.type === 'shelter'
        ? 'rescue_shelter'
        : targetClinic?.type === 'salon'
        ? 'grooming_salon'
        : 'veterinary_clinic';

    const newApt: Appointment = {
      ...aptData,
      id: generateId('apt'),
      status: 'requested',
      queuePosition: 2,
      estimatedWaitMins: 15,
      createdAt: new Date().toISOString(),
      syncStatus: isOnline ? 'synced' : 'pending_sync',
      ownerName: aptData.ownerName || 'Verified Pet Parent',
      ownerPhone: aptData.ownerPhone || '(02) 8812-9901',
    };
    setAppointments((prev) => deduplicateById([newApt, ...prev]));

    // Notification of request appears on the selected service provider ONLY!
    const notif: NotificationItem = {
      id: generateId('notif'),
      type: 'appointment',
      title: `New Appointment Request: ${newApt.petName}`,
      description: `${newApt.ownerName || 'Pet parent'} requested a ${newApt.serviceName} session on ${newApt.date} at ${newApt.time}. Total: ${formatPrice(newApt.baseCostUSD)}.`,
      timestamp: 'Just now',
      read: false,
      actionTab: 'bookings',
      badge: 'New Request',
      targetRole: 'service_provider',
      targetClinicId: newApt.clinicId,
      targetProviderType: targetProviderType,
      appointmentId: newApt.id,
    };
    setRawNotifications((prev) => deduplicateById([notif, ...prev]));
    return { appointment: newApt };
  };

  // Veterinarian Appointment Actions
  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          return {
            ...apt,
            status,
            estimatedWaitMins:
              status === 'in_consultation' ? 5 : status === 'checked_in' ? 10 : 0,
            queuePosition: status === 'in_consultation' ? 1 : apt.queuePosition,
            completedAt: status === 'completed' ? new Date().toISOString() : apt.completedAt,
          };
        }
        return apt;
      })
    );
  };

  const acceptAppointment = (id: string) => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return;

    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'scheduled' } : a))
    );

    // Mark the provider's request notification as read
    setRawNotifications((prev) =>
      prev.map((n) => (n.appointmentId === id ? { ...n, read: true } : n))
    );

    // Send confirmation to the pet owner only
    const notif: NotificationItem = {
      id: generateId('notif'),
      type: 'appointment',
      title: `Visit Confirmed: ${apt.petName}`,
      description: `${apt.clinicName} has officially approved your visit slot for ${apt.date} at ${apt.time}.`,
      timestamp: 'Just now',
      read: false,
      actionTab: 'tracker',
      badge: 'Approved',
      targetRole: 'pet_owner',
      appointmentId: apt.id,
    };
    setRawNotifications((prev) => deduplicateById([notif, ...prev]));
  };

  const declineAppointment = (id: string, reason: string) => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return;

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: 'declined', rejectionReason: reason } : a
      )
    );

    // Mark provider's request notification as read
    setRawNotifications((prev) =>
      prev.map((n) => (n.appointmentId === id ? { ...n, read: true } : n))
    );

    // Send notification to pet owner only
    const notif: NotificationItem = {
      id: generateId('notif'),
      type: 'appointment',
      title: `Appointment Update: ${apt.petName}`,
      description: `${apt.clinicName} was unable to accommodate your requested slot: "${reason}". Please choose another date or contact reception.`,
      timestamp: 'Just now',
      read: false,
      actionTab: 'book',
      badge: 'Declined',
      targetRole: 'pet_owner',
      appointmentId: apt.id,
    };
    setRawNotifications((prev) => deduplicateById([notif, ...prev]));
  };

  const rescheduleAppointment = (
    id: string,
    newDate: string,
    newTime: string
  ): { success: boolean; error?: string } => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return { success: false, error: 'Appointment not found' };

    // Prevent double booking
    if (apt.vetId) {
      const hasConflict = checkDoubleBooking(apt.vetId, apt.clinicId, newDate, newTime, id);
      if (hasConflict) {
        return {
          success: false,
          error: `Time conflict: A consultation is already booked at ${newTime} on ${newDate}.`,
        };
      }
    }

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, date: newDate, time: newTime, status: 'scheduled' } : a
      )
    );

    const notif: NotificationItem = {
      id: generateId('notif'),
      type: 'appointment',
      title: `Appointment Rescheduled: ${apt.petName}`,
      description: `Your visit with ${apt.vetName} has been rescheduled to ${newDate} at ${newTime}.`,
      timestamp: 'Just now',
      read: false,
      actionTab: 'tracker',
      targetRole: 'pet_owner',
    };
    setRawNotifications((prev) => deduplicateById([notif, ...prev]));
    return { success: true };
  };

  const completeAppointment = (id: string, summary?: string) => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return;

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'completed',
              completedAt: new Date().toISOString(),
              clinicalSummary: summary || a.clinicalSummary,
            }
          : a
      )
    );

    const notif: NotificationItem = {
      id: generateId('notif'),
      type: 'appointment',
      title: `Consultation Completed: ${apt.petName}`,
      description: `Dr. ${apt.vetName} has updated ${apt.petName}'s digital health passport and prescriptions.`,
      timestamp: 'Just now',
      read: false,
      actionTab: 'records',
      badge: 'Completed',
      targetRole: 'pet_owner',
    };
    setRawNotifications((prev) => deduplicateById([notif, ...prev]));
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'cancelled' } : apt))
    );
  };

  // Health Records & EMR Charting
  const addHealthRecord = (recData: Omit<HealthRecord, 'id' | 'syncStatus'>) => {
    const newRecord: HealthRecord = {
      ...recData,
      id: generateId('rec'),
      syncStatus: isOnline ? 'synced' : 'pending_sync',
    };
    setHealthRecords((prev) => deduplicateById([newRecord, ...prev]));

    if (newRecord.type === 'vaccine' && newRecord.nextDueDate) {
      const notif: NotificationItem = {
        id: generateId('notif'),
        type: 'vaccine',
        title: `Vaccine Logged: ${newRecord.title}`,
        description: `Next booster scheduled for ${newRecord.nextDueDate}.`,
        timestamp: 'Just now',
        read: false,
        actionTab: 'records',
        badge: 'Vaccine',
        targetRole: 'pet_owner',
      };
      setRawNotifications((prev) => deduplicateById([notif, ...prev]));
    }
  };

  const addClinicalConsultationNote = (data: {
    petId: string;
    appointmentId?: string;
    title: string;
    diagnosis: string;
    notes: string;
    vitals?: { weightKg?: number; tempC?: number; heartRateBpm?: number; respiratoryRateBpm?: number };
    prescriptions?: { medicineName: string; dosage: string; frequency: string; durationDays: number; instructions: string }[];
    vaccineAdministered?: { name: string; batchNumber: string; nextDueDate?: string };
    isPrivateVetNote?: boolean;
    privateVetNotes?: string;
    ownerDischargeInstructions?: string;
    markAppointmentComplete?: boolean;
  }) => {
    const vetName = activeVet?.name || 'Dr. Christian David, DVM';
    const vetLicense = activeVet?.licenseNumber || 'PRC-VET-0049182';
    const clinicName = activeVet?.clinicName || 'Greenwood Animal Hospital & Wellness Center';
    const today = new Date().toISOString().split('T')[0];

    // Create primary clinical record
    const newRecord: HealthRecord = {
      id: generateId('rec'),
      petId: data.petId,
      type: 'checkup',
      title: data.title || 'Clinical Examination & Medical Note',
      date: today,
      veterinarian: vetName,
      vetLicenseNumber: vetLicense,
      clinicName: clinicName,
      notes: data.notes,
      status: 'completed',
      createdByVetId: activeVet?.id,
      vitals: data.vitals,
      diagnosis: data.diagnosis,
      prescriptions: data.prescriptions,
      isPrivateVetNote: data.isPrivateVetNote || false,
      privateVetNotes: data.privateVetNotes,
      ownerDischargeInstructions: data.ownerDischargeInstructions,
      syncStatus: 'synced',
    };

    const newRecordsToAdd = [newRecord];

    // If vaccine was administered, also create separate vaccine ledger item
    if (data.vaccineAdministered && data.vaccineAdministered.name) {
      const vaccineRec: HealthRecord = {
        id: generateId('rec-vax'),
        petId: data.petId,
        type: 'vaccine',
        title: data.vaccineAdministered.name,
        date: today,
        nextDueDate: data.vaccineAdministered.nextDueDate || undefined,
        veterinarian: vetName,
        vetLicenseNumber: vetLicense,
        clinicName: clinicName,
        notes: `Administered during consultation. Batch: ${data.vaccineAdministered.batchNumber || 'N/A'}`,
        status: 'valid',
        batchNumber: data.vaccineAdministered.batchNumber,
        syncStatus: 'synced',
      };
      newRecordsToAdd.push(vaccineRec);
    }

    setHealthRecords((prev) => deduplicateById([...newRecordsToAdd, ...prev]));

    // Update pet's weight in their profile if vitals provided
    if (data.vitals?.weightKg) {
      updatePet(data.petId, { weightKg: data.vitals.weightKg });
    }

    // Mark appointment complete if requested
    if (data.appointmentId && data.markAppointmentComplete) {
      completeAppointment(data.appointmentId, data.diagnosis || data.title);
    }

    // Notify pet owner if there are public discharge instructions or prescriptions
    const pet = pets.find((p) => p.id === data.petId);
    if (pet && !data.isPrivateVetNote) {
      const notif: NotificationItem = {
        id: generateId('notif'),
        type: 'vaccine',
        title: `Medical Records Updated: ${pet.name}`,
        description: `Attending vet ${vetName} has logged consultation results and aftercare instructions.`,
        timestamp: 'Just now',
        read: false,
        actionTab: 'records',
        badge: 'Medical',
        targetRole: 'pet_owner',
      };
      setRawNotifications((prev) => deduplicateById([notif, ...prev]));
    }
  };

  // Messages
  const sendMessage = (
    conversationId: string,
    text: string,
    attachment?: { type: 'image' | 'record'; name: string },
    senderOverride?: 'clinic' | 'user'
  ) => {
    const senderType: 'clinic' | 'user' = senderOverride || (currentRole === 'veterinarian' ? 'clinic' : 'user');
    const msgId = generateUUID();
    const newMsg: ChatMessage = {
      id: msgId,
      sender: senderType,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: text,
            lastTimestamp: 'Just now',
            unreadCount: senderType === 'user' ? (c.unreadCount || 0) + 1 : 0,
            messages: deduplicateById([...c.messages, newMsg]),
          };
        }
        return c;
      })
    );
  };

  const startOrGetConversationWithClinic = (clinicId: string, petId?: string): string => {
    const clinic = clinics.find((cl) => cl.id === clinicId) || clinics[0];
    const pet = pets.find((p) => p.id === petId) || pets[0] || null;
    const targetPetId = pet?.id || generateUUID();
    const targetPetName = pet ? pet.name : 'General Care Inquiry';

    const existingIndex = conversations.findIndex((c) => c.clinicId === clinic.id);
    if (existingIndex >= 0) {
      if (pet && conversations[existingIndex].petId !== pet.id) {
        setConversations((prev) =>
          prev.map((c, i) =>
            i === existingIndex
              ? {
                  ...c,
                  petId: pet.id,
                  petName: pet.name,
                }
              : c
          )
        );
      }
      return conversations[existingIndex].id;
    }

    const ownerName = pet?.ownerName || (profile?.fullName ? profile.fullName : 'Sophia Rodriguez');

    const newConvId = generateUUID();
    const newConv: Conversation = {
      id: newConvId,
      clinicId: clinic.id,
      clinicName: clinic.name,
      clinicAvatar: clinic.image,
      petId: targetPetId,
      petName: targetPetName,
      ownerName,
      lastMessage: 'Direct communication channel opened.',
      lastTimestamp: 'Just now',
      unreadCount: 0,
      messages: [],
    };
    setConversations((prev) => deduplicateById([newConv, ...prev]));
    return newConv.id;
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setRawNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setRawNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setRawNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const sendSimulatedPushNotification = (title: string, body: string, actionTab?: string) => {
    const newNotif: NotificationItem = {
      id: generateId('notif'),
      type: 'appointment',
      title,
      description: body,
      timestamp: 'Just now',
      read: false,
      actionTab: actionTab || 'tracker',
      badge: 'Alert',
      targetRole: 'pet_owner',
    };
    setRawNotifications((prev) => deduplicateById([newNotif, ...prev]));

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, { body });
      } catch {}
    }
  };

  // Lost pet report
  const reportLostPet = (reportData: Omit<LostPetReport, 'id' | 'dateReported'>) => {
    const newReport: LostPetReport = {
      ...reportData,
      id: generateId('lost'),
      countryCode: currentCountry.code,
      dateReported: new Date().toISOString().split('T')[0],
    };
    setLostPets((prev) => deduplicateById([newReport, ...prev]));

    if (!isOnline) {
      setSyncQueue((prev) => [
        ...prev,
        {
          id: generateId('queue'),
          type: 'report_lost_pet',
          payload: newReport,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    const notif: NotificationItem = {
      id: generateId('notif'),
      type: 'emergency',
      title: `Lost Pet Alert Broadcasted: ${newReport.petName}`,
      description: `Alert broadcasted to registered veterinary clinics and volunteers in ${newReport.city}, ${currentCountry.name}.`,
      timestamp: 'Just now',
      read: false,
      actionTab: 'shelters',
      badge: 'Radar',
      targetRole: 'pet_owner',
    };
    setRawNotifications((prev) => deduplicateById([notif, ...prev]));
  };

  const clearOfflineCache = () => {
    setSyncQueue([]);
    setPets(INITIAL_PETS);
    setAppointments(INITIAL_APPOINTMENTS);
    setHealthRecords(INITIAL_HEALTH_RECORDS);
    setConversations(INITIAL_CONVERSATIONS);
    setLostPets(INITIAL_LOST_PETS);
    localStorage.clear();
  };

  const exportOfflineBackup = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      country: currentCountry.name,
      currency: currentCountry.currencyCode,
      pets,
      healthRecords,
      appointments,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safepaw_offline_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Location setting updates
  const updateLocationSettings = (updates: Partial<LocationSettings>) => {
    setLocationSettings((prev) => {
      const next = { ...prev, ...updates };
      if (updates.selectedCountryCode && updates.selectedCountryCode !== prev.selectedCountryCode) {
        const country = getCountryByCode(updates.selectedCountryCode);
        next.distanceUnit = country.distanceUnit;
        next.weightUnit = country.weightUnit;
        if (!updates.customCity) {
          next.customCity = country.defaultCity;
          next.customRegion = country.defaultRegion;
        }
      }
      return next;
    });

    const targetCode = updates.selectedCountryCode || locationSettings.selectedCountryCode;
    const country = getCountryByCode(targetCode);
    const notif: NotificationItem = {
      id: generateId('notif-loc'),
      type: 'location',
      title: `Region Updated: ${country.name}`,
      description: `Currency updated to ${country.currencyCode} (${country.currencySymbol}). Emergency hotlines and units adapted for ${country.name}.`,
      timestamp: 'Just now',
      read: false,
      badge: 'Location',
      targetRole: 'all',
    };
    setRawNotifications((prev) => deduplicateById([notif, ...prev]));
  };

  const setCountryByCode = (code: string) => {
    updateLocationSettings({
      isManualOverride: true,
      selectedCountryCode: code,
    });
  };

  const resetToDetectedLocation = () => {
    updateLocationSettings({
      isManualOverride: false,
      selectedCountryCode: locationSettings.detectedCountryCode,
      customCity: locationSettings.detectedCity,
    });
  };

  return (
    <AppContext.Provider
      value={{
        // Role & Auth
        currentRole,
        setCurrentRole,
        activeVet,
        loginAsVet,
        loginCustomVet,
        logoutVet,
        availableVets,
        updateVetProfile,
        vetTab,
        setVetTab,

        // Pets
        pets,
        selectedPetId,
        selectedPet,
        setSelectedPetId,
        addPet,
        updatePet,
        deletePet,
        getAuthorizedPatientsForVet,

        // Clinics & Appointments
        clinics,
        appointments,
        getVetAppointments,
        bookAppointment,
        updateAppointmentStatus,
        acceptAppointment,
        declineAppointment,
        rescheduleAppointment,
        completeAppointment,
        cancelAppointment,

        // Health records & EMR
        healthRecords,
        getPublicHealthRecordsForPet,
        getAllHealthRecordsForVet,
        addHealthRecord,
        addClinicalConsultationNote,

        // Messages & Notifications
        conversations,
        sendMessage,
        startOrGetConversationWithClinic,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        sendSimulatedPushNotification,

        // Lost Pets
        lostPets,
        reportLostPet,
        adoptablePets,

        // Location & Currency
        locationSettings,
        currentCountry,
        formatPrice,
        updateLocationSettings,
        resetToDetectedLocation,
        setCountryByCode,

        // Offline
        isOnline,
        isSimulatedOffline,
        toggleSimulatedOffline,
        syncQueue,
        isSyncing,
        syncOfflineQueue,
        clearOfflineCache,
        exportOfflineBackup,

        // Reviews & Ratings
        reviews,
        addReview,
        replyToReview,

        // Favorites
        favoriteProviderIds,
        toggleFavoriteProvider,

        // Adoption Inquiries
        adoptionInquiries,
        submitAdoptionInquiry,
        updateAdoptionInquiryStatus,

        // Shelter Animal Records
        shelterAnimals,
        addShelterAnimal,
        updateShelterAnimalStatus,

        // Lost & Found Contact Requests
        contactRequests,
        sendLostPetContactRequest,
        markPetAsReunited,

        // Provider Verification & Payouts
        providerVerificationStatus,
        submitProviderVerification,
        simulateVerifyProvider,
        payoutStatus,
        requestPayout,
        payForAppointment,

        // Navigation
        currentTab,
        setCurrentTab,
        preselectedClinicId,
        setPreselectedClinicId,
      }}

    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
