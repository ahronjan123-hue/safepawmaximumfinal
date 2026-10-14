import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ProviderServiceType } from '../../types';
import {
  Building,
  Calendar,
  Users,
  Heart,
  DollarSign,
  Star,
  Bell,
  MessageSquare,
  User,
  Shield,
  Activity,
  CheckCircle,
  Clock,
  Scissors,
  MapPin,
  AlertTriangle,
  FileText,
  Camera,
  Home,
  Check,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Phone,
  Settings,
  BarChart3,
  Search,
  Filter,
  LogOut,
  PlusCircle,
  Eye,
  BadgeCheck,
  Share2,
} from 'lucide-react';
import { ProviderBookingsView } from './ProviderBookingsView';
import { ProviderClientsView } from './ProviderClientsView';
import { ProviderPetsView } from './ProviderPetsView';
import { ProviderMessagesView } from './ProviderMessagesView';
import { ProviderReportsView } from './ProviderReportsView';
import { ProviderSettingsView } from './ProviderSettingsView';

import { PatientChartModal } from '../modals/PatientChartModal';
import { Pet, Appointment } from '../../types';

interface ProviderPortalDashboardProps {
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
}

export const ProviderPortalDashboard: React.FC<ProviderPortalDashboardProps> = ({
  onOpenNotifications,
  onOpenSettings,
}) => {
  const { profile, user, signOut } = useAuth();
  const { appointments, pets, clinics, formatPrice, notifications, reviews } = useApp();

  // Active provider type (strictly bound to authenticated profile)
  const providerType: ProviderServiceType = profile?.providerType || 'veterinary_clinic';

  // Sidebar navigation tab
  const [activeSidebarTab, setActiveSidebarTab] = useState<
    'dashboard' | 'bookings' | 'clients' | 'pets' | 'messages' | 'reports' | 'settings'
  >('dashboard');

  // Profile menu dropdown state
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Local persistence cache key
  const localSavedKey = `safepaw_provider_settings_${providerType}`;
  const getCachedSettings = () => {
    try {
      const saved = localStorage.getItem(localSavedKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  };
  const cachedSettings = getCachedSettings();

  // Business Name & Info (dynamically updated when saved in settings)
  const businessName =
    profile?.businessName ||
    profile?.clinicName ||
    cachedSettings?.businessName ||
    cachedSettings?.facilityName ||
    (providerType === 'veterinary_clinic'
      ? 'Greenwood Animal Hospital & Wellness Center'
      : providerType === 'grooming_salon'
      ? 'Paws & Bubbles Pet Grooming Salon'
      : providerType === 'rescue_shelter'
      ? 'PawHaven Animal Rescue Alliance'
      : 'Metro Manila Municipal Animal Care Shelter');

  const facilityPhone =
    profile?.phone ||
    cachedSettings?.phone ||
    (providerType === 'veterinary_clinic'
      ? '(02) 8531-1581'
      : providerType === 'grooming_salon'
      ? '+63 917 889 0012'
      : '+63 918 223 9011');

  const facilityAddress =
    profile?.address ||
    cachedSettings?.address ||
    (providerType === 'veterinary_clinic'
      ? '63 Maysilo Circle, Plainview, Mandaluyong City, Metro Manila'
      : providerType === 'grooming_salon'
      ? 'Level 2, Bonifacio High Street, BGC, Taguig City'
      : 'Barangay Loyola Heights, Quezon City, Metro Manila');

  const facilityHours =
    profile?.hours ||
    cachedSettings?.hours ||
    'Mon - Sun: 08:00 AM - 08:00 PM (24/7 Trauma Service)';

  const isEmergencyAvailable =
    profile?.emergencyAvailable ?? cachedSettings?.emergencyAvailable ?? true;

  // Provider Type Display Label
  const providerTypeLabel = {
    veterinary_clinic: 'Veterinary Clinic',
    grooming_salon: 'Pet Grooming Salon',
    rescue_shelter: 'Rescue Organization',
    animal_shelter: 'Animal Shelter',
  }[providerType];

  const providerTypeIcon = {
    veterinary_clinic: Activity,
    grooming_salon: Scissors,
    rescue_shelter: Shield,
    animal_shelter: Home,
  }[providerType];

  const ProviderIcon = providerTypeIcon;

  // Unread notifications count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // =========================================
  // DYNAMIC ACCURATE PROVIDER METRICS (Live sync with high ratings)
  // =========================================
  const isGrooming = providerType === 'grooming_salon';
  const isShelter = providerType === 'rescue_shelter' || providerType === 'animal_shelter';

  const relevantAppointments = appointments.filter((a) => {
    if (isGrooming) {
      return (
        a.clinicId === 'provider-grooming-01' ||
        a.serviceName.toLowerCase().includes('groom') ||
        a.serviceName.toLowerCase().includes('spa') ||
        a.clinicName.toLowerCase().includes('groom') ||
        a.clinicName.toLowerCase().includes('spa')
      );
    }
    if (isShelter) {
      return (
        a.clinicId === 'provider-shelter-01' ||
        a.serviceName.toLowerCase().includes('rescue') ||
        a.serviceName.toLowerCase().includes('shelter') ||
        a.serviceName.toLowerCase().includes('adopt')
      );
    }
    return !a.clinicId.includes('grooming');
  });

  // 1. Total Clients: Unique pet owners from bookings & pets + base accredited roster
  const realOwnersSet = new Set<string>();
  relevantAppointments.forEach((a) => {
    if (a.ownerName && a.ownerName !== 'Verified Pet Parent') {
      realOwnersSet.add(a.ownerName);
    }
  });
  pets.forEach((p) => {
    if (p.ownerName) realOwnersSet.add(p.ownerName);
  });
  const baseClientsRoster = isGrooming ? 185 : isShelter ? 95 : 142;
  const totalClients = baseClientsRoster + realOwnersSet.size;

  // 2. Active Bookings: Accurate live count from active/confirmed/in-consultation appointments
  const liveActiveBookings = relevantAppointments.filter(
    (a) =>
      a.status === 'scheduled' ||
      a.status === 'checked_in' ||
      a.status === 'in_consultation' ||
      a.status === 'prescriptions_ready' ||
      a.status === 'requested'
  ).length;

  // 3. Monthly Revenue: Accurate sum of billable appointments + base clinic operations
  const liveBookedRevenueUSD = relevantAppointments
    .filter((a) => a.status !== 'declined' && a.status !== 'cancelled')
    .reduce((sum, a) => sum + (a.baseCostUSD || (isGrooming ? 45 : 50)), 0);
  const baseMonthlyRevenue = isGrooming ? 5800 : isShelter ? 3900 : 8100;
  const monthlyRevenueUSD = baseMonthlyRevenue + liveBookedRevenueUSD;

  // 4. Rating Score & Review Count: Keep ratings higher while dynamically incorporating user ratings
  const providerReviews = reviews.filter((r) => {
    if (isGrooming) {
      return r.providerId === 'provider-grooming-01' || r.serviceName?.toLowerCase().includes('groom');
    }
    if (isShelter) {
      return r.providerId === 'provider-shelter-01';
    }
    return r.providerId === '00000000-0000-0000-0000-000000000001' || !r.providerId?.includes('grooming');
  });

  const baseRatingsCount = isGrooming ? 198 : isShelter ? 310 : 320;
  const baseRatingAverage = isGrooming ? 4.90 : isShelter ? 4.96 : 4.93; // Keep ratings high as requested!
  const userReviewsSum = providerReviews.reduce((sum, r) => sum + r.rating, 0);
  const totalReviewsCount = baseRatingsCount + providerReviews.length;
  const ratingScore = Number(
    ((baseRatingAverage * baseRatingsCount + userReviewsSum) / totalReviewsCount).toFixed(2)
  );

  const metrics = {
    totalClients,
    activeBookings: Math.max(liveActiveBookings, isGrooming ? 8 : isShelter ? 6 : 14),
    monthlyRevenueUSD,
    ratingScore,
    reviewsCount: totalReviewsCount,
  };

  // Dashboard chart modal state
  const [dashboardChartPet, setDashboardChartPet] = useState<Pet | null>(null);
  const [dashboardChartApt, setDashboardChartApt] = useState<Appointment | null>(null);
  const [isDashboardChartOpen, setIsDashboardChartOpen] = useState(false);

  // Dynamic simulated provider records state
  const [emergencyQueue, setEmergencyQueue] = useState([
    { id: 'em-1', pet: 'Rocky (Golden Retriever)', triage: 'Red - Acute Gastric Torsion', arrival: '10 mins ago', room: 'ER Trauma 1' },
    { id: 'em-2', pet: 'Mimi (Persian Cat)', triage: 'Yellow - Respiratory Distress', arrival: '24 mins ago', room: 'Oxygen Unit' },
    { id: 'em-3', pet: 'Bantay (Aspin)', triage: 'Green - Superficial Laceration', arrival: '40 mins ago', room: 'Triage Room 2' },
  ]);

  const [groomingSessions, setGroomingSessions] = useState([
    { id: 'gs-1', pet: 'Bella (Shih Tzu)', service: 'Full Spa & Teddy Cut', stylist: 'Maricel', status: 'In Bath', progress: 40, timeRemaining: '30 mins' },
    { id: 'gs-2', pet: 'Milo (Poodle)', service: 'De-shedding & Nail Grinding', stylist: 'Carlo', status: 'Blow Drying', progress: 70, timeRemaining: '15 mins' },
    { id: 'gs-3', pet: 'Kobe (Pomeranian)', service: 'Show Coat Styling & Ear Cleaning', stylist: 'Arlene', status: 'Finishing Touches', progress: 90, timeRemaining: '5 mins' },
  ]);

  const [rescueCases, setRescueCases] = useState([
    { id: 'rc-101', title: 'Injured stray dog beside EDSA Cubao flyover', reporter: 'Jeepney Driver Rodolfo', phone: '+63 917 223 9011', urgency: 'Critical', status: 'En Route', eta: '12 mins' },
    { id: 'rc-102', title: 'Abandoned litter of 4 kittens in rain', reporter: 'Barangay Kagawad Elena', phone: '+63 928 889 4412', urgency: 'High', status: 'Assigned to Volunteer', eta: '25 mins' },
    { id: 'rc-103', title: 'Trapped puppy under residential drainage', reporter: 'Maria Santos', phone: '+63 908 123 4567', urgency: 'Medium', status: 'Awaiting Rescue Van', eta: '45 mins' },
  ]);

  const [adoptionRequests, setAdoptionRequests] = useState([
    { id: 'ad-1', petName: 'Bramble', applicant: 'Joshua Ramos', household: 'Fenced single house, 1 dog', status: 'Home Inspection Approved', date: 'Today, 9:30 AM' },
    { id: 'ad-2', petName: 'Cleo', applicant: 'Danica Tan', household: 'Condo unit (pet friendly)', status: 'Interview Scheduled', date: 'Today, 2:00 PM' },
    { id: 'ad-3', petName: 'Lucky (Aspin)', applicant: 'Sgt. Mateo Cruz', household: 'Farmstead in Laguna', status: 'Background Verification', date: 'Yesterday' },
  ]);

  // Gallery items for Grooming Salon
  const [groomingGallery] = useState([
    {
      id: 'g-1',
      petName: 'Barnaby (Golden Retriever)',
      style: 'Summer Blowout & Hydration Bath',
      before: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
      after: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
      likes: 64,
    },
    {
      id: 'g-2',
      petName: 'Mochi (Shih Tzu)',
      style: 'Asian Fusion Teddy Bear Trim',
      before: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
      after: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80',
      likes: 89,
    },
  ]);

  // Compute pending appointment requests tailored to this provider
  const myPendingRequests = appointments.filter((a) => {
    if (a.status !== 'requested') return false;
    if (isGrooming) {
      return (
        a.clinicId === 'provider-grooming-01' ||
        a.serviceName.toLowerCase().includes('groom') ||
        a.serviceName.toLowerCase().includes('spa') ||
        a.clinicName.toLowerCase().includes('groom') ||
        a.clinicName.toLowerCase().includes('spa')
      );
    }
    return a.clinicId === '00000000-0000-0000-0000-000000000001' || !a.clinicId.includes('grooming');
  });

  // Sidebar navigation items
  const sidebarNavItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Activity },
    {
      id: 'bookings' as const,
      label: 'Bookings',
      icon: Calendar,
      badge: myPendingRequests.length > 0 ? `${myPendingRequests.length} New` : metrics.activeBookings,
    },
    { id: 'clients' as const, label: 'Clients', icon: Users },
    { id: 'pets' as const, label: 'Pets', icon: Heart },
    { id: 'messages' as const, label: 'Messages', icon: MessageSquare, badge: 3 },
    { id: 'reports' as const, label: 'Reports', icon: BarChart3 },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans selection:bg-teal-500 selection:text-stone-950">
      {/* ========================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-stone-950 border-b border-stone-800 backdrop-blur-md">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Left: Business Logo, Business Name, Verification Badge, Provider Type */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Business Logo */}
            <div className="w-11 h-11 rounded-2xl bg-teal-500 text-stone-950 flex items-center justify-center font-extrabold shadow-lg shrink-0 border border-teal-400/40">
              <ProviderIcon className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {/* Business Name */}
                <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight truncate max-w-[220px] sm:max-w-md">
                  {businessName}
                </h1>

                {/* Verification Badge */}
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 text-[10px] font-bold tracking-wider shrink-0"
                  title="Accredited & Verified SafePaw Pet Care Provider"
                >
                  <BadgeCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden sm:inline">Verified</span>
                </span>
              </div>

              {/* Provider Type Pill */}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-medium text-stone-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  {providerTypeLabel}
                </span>

                {/* Provider Type Display Pill */}
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-stone-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  {providerTypeLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Center Header: Provider Facility Status & Verification */}
          <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 bg-stone-900/90 rounded-2xl border border-stone-800">
            <div className="w-6 h-6 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center">
              <ProviderIcon className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[260px]">
              {businessName}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-teal-300">
              {providerTypeLabel}
            </span>
          </div>

          {/* Right Header: Profile Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 transition text-left cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                  {businessName.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-stone-100 truncate max-w-[130px]">
                    {profile?.fullName && !profile.fullName.includes('Greenwood')
                      ? profile.fullName
                      : `${businessName.split(' ')[0]} Care`}
                  </div>
                  <div className="text-[10px] text-teal-400 leading-none">Online</div>
                </div>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-stone-950 border border-stone-800 shadow-2xl p-2 z-50 animate-fadeIn text-xs space-y-1">
                  <div className="p-2 border-b border-stone-800">
                    <div className="font-bold text-white">{profile?.fullName || 'Pet Care Provider'}</div>
                    <div className="text-[11px] text-stone-400 font-mono truncate">{user?.email || profile?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setActiveSidebarTab('settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-stone-300 hover:bg-stone-900 hover:text-white transition cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-stone-400" />
                    <span>Provider Settings</span>
                  </button>
                  <div className="border-t border-stone-800 pt-1">
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/40 transition cursor-pointer font-semibold"
                      title="Sign out of account"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Strip for Service Provider */}
      <div className="md:hidden bg-stone-900 border-b border-stone-800 sticky top-16 z-30 px-4 py-2.5 shadow-md">
        <div className="flex items-center overflow-x-auto gap-1.5 scrollbar-none">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSidebarTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSidebarTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-teal-500 text-stone-950 font-bold shadow-md'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-stone-950 text-teal-400' : 'bg-stone-800 text-teal-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN CONTAINER: SIDEBAR + CONTENT LAYOUT */}
      {/* ========================================================= */}
      <div className="max-w-[1700px] w-full mx-auto flex-1 flex flex-col md:flex-row min-w-0">
        {/* Left Provider Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 bg-stone-950/80 border-r border-stone-800 p-4 space-y-5 sticky top-18 h-[calc(100vh-4.5rem)] overflow-y-auto">
          {/* Facility Type Badge */}
          <div className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-800">
            <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
              Facility Console
            </div>
            <div className="text-xs font-extrabold text-teal-300 mt-0.5 flex items-center gap-1.5">
              <ProviderIcon className="w-3.5 h-3.5 text-teal-400" />
              <span>{providerTypeLabel}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1 flex-1">
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Management
            </div>
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSidebarTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSidebarTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-teal-500 text-stone-950 font-bold shadow-md shadow-teal-500/20'
                      : 'text-stone-300 hover:text-white hover:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-stone-950 text-teal-400' : 'bg-stone-800 text-teal-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sign Out button */}
          <div className="pt-3 border-t border-stone-800">
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-xs font-bold text-rose-400 hover:text-rose-300 transition cursor-pointer"
              title="Sign out of account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 min-w-0">
          <main className="space-y-6 min-w-0">
          {/* Pending Appointment Requests Alert Banner */}
          {myPendingRequests.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-950 to-stone-900 border-2 border-amber-500/50 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-extrabold text-white">
                      {myPendingRequests.length} New Appointment Request{myPendingRequests.length > 1 ? 's' : ''} Received!
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      Action Required
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 mt-0.5">
                    Pet owner{myPendingRequests.length > 1 ? 's have' : ' has'} requested booking with <strong className="text-amber-200">{businessName}</strong>. Review dates, services, and confirm slots.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveSidebarTab('bookings')}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer shrink-0"
              >
                <span>Review & Confirm Requests</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Facility Operations Control Banner */}
          <div className="bg-stone-950 p-5 rounded-3xl border border-stone-800 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <ProviderIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-black text-white tracking-tight">
                      {businessName}
                    </h1>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                      <CheckCircle className="w-2.5 h-2.5 text-teal-400" />
                      Verified {providerTypeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-500" />
                      {facilityAddress}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                      {isEmergencyAvailable ? 'Accepting Bookings & 24/7 Emergency Triage' : 'Accepting Standard Consultations'}
                    </span>
                    <span className="text-stone-600">·</span>
                    <span className="text-stone-400">
                      Emergency Hotline: <strong className="text-stone-300 font-semibold">{facilityPhone}</strong>
                    </span>
                  </p>
                </div>
              </div>

              {/* Quick Facility Action Buttons (strictly tailored to this provider type) */}
              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                {providerType === 'veterinary_clinic' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSidebarTab('bookings');
                      showToast('Viewing clinical consultations schedule');
                    }}
                    className="py-2 px-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Clinical Schedule</span>
                  </button>
                )}

                {providerType === 'grooming_salon' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSidebarTab('bookings');
                      showToast('Viewing grooming salon bookings');
                    }}
                    className="py-2 px-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Styling Calendar</span>
                  </button>
                )}

                {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSidebarTab('pets');
                      showToast('Viewing shelter intake records');
                    }}
                    className="py-2 px-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Animal Intakes</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* TAB 1: DASHBOARD (Key Performance Metrics + Dynamic Provider Operations) */}
          {activeSidebarTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              {/* ========================================================= */}
              {/* COMMON PROVIDER METRICS (Top Statistics Cards) */}
              {/* ========================================================= */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Key Performance Metrics ({providerTypeLabel})
                  </h2>
                  <span className="text-[11px] text-teal-400 font-medium">Real-Time Live Sync · Active</span>
                </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Card 1: Total Clients */}
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl hover:border-stone-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    Total Clients
                  </span>
                  <div className="w-9 h-9 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {metrics.totalClients}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +12% this mo.
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 mt-1">
                  Registered pet guardians in your portfolio
                </div>
              </div>

              {/* Card 2: Active Bookings */}
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl hover:border-stone-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    Active Bookings
                  </span>
                  <div className="w-9 h-9 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {metrics.activeBookings}
                  </span>
                  <span className="text-[11px] font-semibold text-teal-400">
                    Confirmed
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 mt-1">
                  Scheduled appointments & service visits
                </div>
              </div>

              {/* Card 3: Monthly Revenue */}
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl hover:border-stone-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    Monthly Revenue
                  </span>
                  <div className="w-9 h-9 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {formatPrice(metrics.monthlyRevenueUSD)}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +8.4%
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 mt-1">
                  Gross billed services & consultation fees
                </div>
              </div>

              {/* Card 4: Rating Score */}
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl hover:border-stone-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    Rating Score
                  </span>
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {metrics.ratingScore}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    / 5.0 ({metrics.reviewsCount} reviews)
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> 98% positive parent feedback
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* DYNAMIC DASHBOARD BY PROVIDER TYPE */}
          {/* ========================================================= */}

          {/* ========================================================= */}
          {/* MODE 1: VETERINARY CLINIC */}
          {/* Today's Appointments, Active Patients, Medical Records, Health Certificates, Emergency Queue */}
          {/* ========================================================= */}
          {providerType === 'veterinary_clinic' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-400" />
                    <span>Veterinary Clinic Clinical Operations</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Appointments, digital medical records, and live emergency trauma triage queue.
                  </p>
                </div>
                <button
                  onClick={() => showToast('New clinical appointment intake opened')}
                  className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Patient Entry</span>
                </button>
              </div>

              {/* Grid: Appointments & Emergency Queue */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Today's Appointments (Col 7) */}
                <div className="lg:col-span-7 bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-400" />
                      <h4 className="text-sm font-bold text-white">Today's Appointments</h4>
                    </div>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {appointments.slice(0, 4).map((apt) => {
                      const matchedPet = pets.find(
                        (p) => p.id === apt.petId || p.name.toLowerCase() === apt.petName.toLowerCase()
                      );
                      const petPhoto =
                        matchedPet?.photoUrl ||
                        (apt.petName.toLowerCase().includes('milo')
                          ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'
                          : apt.petName.toLowerCase().includes('bella')
                          ? 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80'
                          : 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80');
                      const petBreed = matchedPet?.breed || 'Companion Pet';
                      const petSpecies = matchedPet?.species || 'Dog';

                      const handleOpenAptChart = () => {
                        const petToChart: Pet = matchedPet || {
                          id: apt.petId || 'pet-' + apt.id,
                          name: apt.petName,
                          species: petSpecies as any,
                          breed: petBreed,
                          ageYears: 3,
                          birthDate: '2023-04-12',
                          gender: 'Male',
                          neutered: true,
                          weightKg: 14,
                          allergies: [],
                          chronicConditions: [],
                          temperament: 'Calm & friendly',
                          dietaryNotes: 'Standard maintenance diet',
                          registeredDate: '2024-01-15',
                          photoUrl: petPhoto,
                          microchipId: '985141002341992',
                          ownerName: apt.ownerName || 'Verified Guardian',
                          ownerPhone: apt.ownerPhone || '+63 917 882 1290',
                        };
                        setDashboardChartPet(petToChart);
                        setDashboardChartApt(apt);
                        setIsDashboardChartOpen(true);
                      };

                      return (
                        <div
                          key={apt.id}
                          className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800/80 flex items-center justify-between gap-3 hover:border-teal-500/50 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* PET PROFILE AVATAR (NOT TIME/DATE) */}
                            <div
                              onClick={handleOpenAptChart}
                              className="relative shrink-0 cursor-pointer group"
                              title={`Click to open ${apt.petName}'s medical chart`}
                            >
                              <img
                                src={petPhoto}
                                alt={apt.petName}
                                className="w-11 h-11 rounded-xl object-cover border border-teal-500/40 group-hover:border-teal-400 group-hover:scale-105 transition shadow-sm"
                              />
                              <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded text-[8px] font-black bg-teal-500 text-stone-950 uppercase">
                                {petSpecies}
                              </span>
                            </div>

                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                <span>{apt.petName}</span>
                                <span className="text-[10px] text-stone-400">({petBreed})</span>
                                <span className="text-stone-600">·</span>
                                <span className="text-teal-300 font-medium">{apt.serviceName}</span>
                              </div>
                              <div className="text-[11px] text-stone-400 truncate mt-0.5">
                                Schedule: <strong className="text-white">{apt.time}</strong> · Guardian: {apt.ownerName || 'Verified Parent'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              apt.status === 'in_consultation'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            }`}>
                              {apt.status.replace('_', ' ')}
                            </span>

                            <button
                              onClick={handleOpenAptChart}
                              className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500 hover:text-stone-950 text-teal-400 text-xs font-bold transition border border-teal-500/20 cursor-pointer"
                            >
                              Open Chart
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {appointments.length === 0 && (
                      <div className="p-8 text-center text-stone-500 text-xs border border-dashed border-stone-800 rounded-2xl">
                        No appointments currently queued for today.
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency Queue (Col 5) */}
                <div className="lg:col-span-5 bg-stone-950 border border-rose-900/40 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      <h4>Emergency Queue (ER Triage)</h4>
                    </div>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                      3 Active
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {emergencyQueue.map((em) => (
                      <div
                        key={em.id}
                        className="p-3 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <strong className="text-stone-100">{em.pet}</strong>
                          <span className="text-[10px] text-stone-400 font-mono">{em.arrival}</span>
                        </div>
                        <div className="text-[11px] text-rose-300 font-medium">
                          {em.triage}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-800/60">
                          <span>Location: <strong className="text-teal-400">{em.room}</strong></span>
                          <button
                            onClick={() => showToast(`Assigned attending veterinarian to ${em.pet}`)}
                            className="text-teal-400 hover:underline font-bold"
                          >
                            Assign Doctor →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Active Patients, Medical Records, Health Certificates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Active Patients */}
                <div className="bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Users className="w-4 h-4 text-teal-400" />
                      <span>Active Patients</span>
                    </div>
                    <span className="text-xs font-mono text-stone-400">{pets.length} on file</span>
                  </div>
                  <div className="space-y-2">
                    {pets.slice(0, 3).map((p) => (
                      <div key={p.id} className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">{p.name} ({p.species})</div>
                          <div className="text-[10px] text-stone-400">{p.breed} · {p.weightKg}kg</div>
                        </div>
                        <span className="text-[10px] text-teal-400 font-mono">{p.microchipId || 'ISO-Microchipped'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medical Records */}
                <div className="bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <FileText className="w-4 h-4 text-teal-400" />
                      <span>EMR Medical Records</span>
                    </div>
                    <span className="text-xs font-mono text-teal-400">Encrypted</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                      <div className="font-bold text-stone-200">Rabies 3-Year Booster Vaccination</div>
                      <div className="text-[10px] text-stone-400">Batch #VET-PH-9921 · Validated by Board</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                      <div className="font-bold text-stone-200">Annual Comprehensive Blood Panel</div>
                      <div className="text-[10px] text-stone-400">Biochemistry, CBC & Urinalysis</div>
                    </div>
                  </div>
                </div>

                {/* Health Certificates */}
                <div className="bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Shield className="w-4 h-4 text-teal-400" />
                      <span>Health Certificates</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">BAI / Shipping</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                      <div className="font-bold text-stone-200">Domestic Air Travel Health Pass</div>
                      <div className="text-[10px] text-stone-400">Certificate #HC-2026-9081 (Manila to Cebu)</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                      <div className="font-bold text-stone-200">International Fit-to-Fly Certification</div>
                      <div className="text-[10px] text-stone-400">USDA / BAI Export Titer Test verified</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 2: GROOMING SALON */}
          {/* Today's Grooming Bookings, Ongoing Grooming Sessions, Popular Services, Before & After Gallery */}
          {/* ========================================================= */}
          {providerType === 'grooming_salon' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-teal-400" />
                    <span>Pet Grooming Salon Operations</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Styling schedules, bath progress tracker, popular packages, and photo portfolio.
                  </p>
                </div>
                <button
                  onClick={() => showToast('New salon grooming appointment form opened')}
                  className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Book Grooming Session</span>
                </button>
              </div>

              {/* Top Row: Today's Grooming Bookings & Ongoing Sessions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Today's Grooming Bookings (Col 6) */}
                <div className="lg:col-span-6 bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Calendar className="w-4 h-4 text-teal-400" />
                      <h4>Today's Grooming Bookings</h4>
                    </div>
                    <span className="text-xs font-mono text-stone-400">14 Booked Today</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Oreo (French Bulldog)</div>
                        <div className="text-[11px] text-stone-400">Hydration Medicated Bath + Ear Flush · 10:00 AM</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        Confirmed
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Chuchu (Maltese)</div>
                        <div className="text-[11px] text-stone-400">Teddy Bear Full Styling & Paw Balm · 11:30 AM</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Checked-In
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Cooper (Golden Retriever)</div>
                        <div className="text-[11px] text-stone-400">De-Shedding Blast + Teeth Brushing · 2:00 PM</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-800 text-stone-300">
                        Upcoming
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ongoing Grooming Sessions Tracker (Col 6) */}
                <div className="lg:col-span-6 bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Clock className="w-4 h-4 text-teal-400" />
                      <h4>Ongoing Grooming Sessions (Live Tracker)</h4>
                    </div>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-bold">
                      Live Studio
                    </span>
                  </div>

                  <div className="space-y-3">
                    {groomingSessions.map((session) => (
                      <div key={session.id} className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <strong className="text-white">{session.pet}</strong>
                          <span className="text-stone-400 font-mono text-[11px]">Stylist: {session.stylist}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-stone-400">
                          <span>{session.service}</span>
                          <span className="text-teal-400 font-bold">{session.status} · {session.timeRemaining}</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${session.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Popular Services & Before/After Gallery */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Popular Services (Col 4) */}
                <div className="lg:col-span-4 bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-3">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>Popular Salon Services</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Full Spa & Japanese Scissor Cut</div>
                        <div className="text-[10px] text-stone-400">Bath, blowdry, scissor coat contouring</div>
                      </div>
                      <span className="font-bold text-teal-400">$38</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">De-shedding Furminator Bath</div>
                        <div className="text-[10px] text-stone-400">Undercoat release & conditioning</div>
                      </div>
                      <span className="font-bold text-teal-400">$28</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Hygiene Trim & Paws Package</div>
                        <div className="text-[10px] text-stone-400">Nail dremel, ear plucking, sanitary cut</div>
                      </div>
                      <span className="font-bold text-teal-400">$18</span>
                    </div>
                  </div>
                </div>

                {/* Before & After Gallery (Col 8) */}
                <div className="lg:col-span-8 bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Camera className="w-4 h-4 text-teal-400" />
                      <span>Before & After Client Gallery</span>
                    </div>
                    <button
                      onClick={() => showToast('Transformation photo uploaded and saved to gallery')}
                      className="text-xs text-teal-400 hover:underline font-bold"
                    >
                      + Upload Transformation
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {groomingGallery.map((item) => (
                      <div key={item.id} className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span>{item.petName}</span>
                          <span className="text-[10px] text-teal-400 font-mono">♥ {item.likes} loves</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative rounded-xl overflow-hidden aspect-square border border-stone-800">
                            <img src={item.before} alt="Before" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-stone-950/80 text-[10px] font-bold text-stone-300">
                              Before
                            </span>
                          </div>
                          <div className="relative rounded-xl overflow-hidden aspect-square border border-teal-500/40">
                            <img src={item.after} alt="After" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-teal-500 text-[10px] font-bold text-stone-950">
                              After ✨
                            </span>
                          </div>
                        </div>
                        <div className="text-[11px] text-stone-400">{item.style}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 3: RESCUE ORGANIZATION */}
          {/* Active Rescue Cases, Emergency Reports, Volunteer Management, Rescue Map */}
          {/* ========================================================= */}
          {providerType === 'rescue_shelter' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-teal-400" />
                    <span>Animal Rescue Organization Operations</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Field dispatch hotline, active stray rescue cases, volunteer network & geographic incident map.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Emergency rescue ambulance dispatched with real-time GPS')}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Dispatch Rescue Unit</span>
                </button>
              </div>

              {/* Active Rescue Cases & Emergency Reports */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Active Rescue Cases (Col 7) */}
                <div className="lg:col-span-7 bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-rose-400" />
                      <h4>Active Rescue Cases & Field Dispatches</h4>
                    </div>
                    <span className="text-xs font-mono text-rose-400 font-bold">3 Cases Active</span>
                  </div>

                  <div className="space-y-3">
                    {rescueCases.map((rc) => (
                      <div key={rc.id} className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            rc.urgency === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {rc.urgency} Priority
                          </span>
                          <span className="text-xs text-teal-400 font-semibold font-mono">ETA {rc.eta}</span>
                        </div>
                        <div className="text-xs font-bold text-white">{rc.title}</div>
                        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-800/80">
                          <span>Caller: {rc.reporter} ({rc.phone})</span>
                          <span className="text-stone-300 font-medium">Status: {rc.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Volunteer Management (Col 5) */}
                <div className="lg:col-span-5 bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-teal-400" />
                      <h4>Volunteer Team & Responders</h4>
                    </div>
                    <span className="text-xs font-mono text-stone-400">28 Active in NCR</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs">
                          MR
                        </div>
                        <div>
                          <div className="font-bold text-white">Marc Raymond (Lead EMT)</div>
                          <div className="text-[10px] text-stone-400">Van #1 · Quezon City & Marikina</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">On Call</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs">
                          JA
                        </div>
                        <div>
                          <div className="font-bold text-white">Janice Aquino (Rescue Dog Handler)</div>
                          <div className="text-[10px] text-stone-400">Van #2 · Mandaluyong & Pasig</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">In Field</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-700 text-stone-300 font-bold flex items-center justify-center text-xs">
                          CV
                        </div>
                        <div>
                          <div className="font-bold text-white">Carlo Valdez (Foster Coordinator)</div>
                          <div className="text-[10px] text-stone-400">Intake Desk & Triage Center</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-stone-400">Base</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rescue Map View */}
              <div className="bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-400" />
                    <h4>Metropolitan Incident & Rescue Dispatch Map</h4>
                  </div>
                  <span className="text-[11px] text-teal-400 font-medium">GPS Live Fleet Tracking</span>
                </div>

                <div className="relative h-64 sm:h-72 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                  {/* Stylized Map Grid Background */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Simulated Pins */}
                  <div className="absolute top-1/4 left-1/3 flex flex-col items-center animate-bounce">
                    <div className="p-2 rounded-full bg-rose-500 text-white shadow-lg">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded bg-stone-950 text-[10px] font-bold text-rose-300 border border-rose-800">
                      Cubao Case #101
                    </span>
                  </div>

                  <div className="absolute bottom-1/3 right-1/3 flex flex-col items-center">
                    <div className="p-2 rounded-full bg-teal-500 text-stone-950 shadow-lg">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded bg-stone-950 text-[10px] font-bold text-teal-300 border border-teal-800">
                      Rescue Unit #2 (En Route)
                    </span>
                  </div>

                  <div className="relative z-10 max-w-md bg-stone-950/80 backdrop-blur-md p-4 rounded-2xl border border-stone-800">
                    <div className="text-xs font-bold text-stone-200">Metro Manila Emergency Dispatch Fleet</div>
                    <p className="text-[11px] text-stone-400 mt-1">
                      2 rescue ambulances active. Average response time across NCR: 18.4 minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 4: ANIMAL SHELTER */}
          {/* Shelter Occupancy, Adoption Requests, Available Pets, Foster Program */}
          {/* ========================================================= */}
          {providerType === 'animal_shelter' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Home className="w-5 h-5 text-teal-400" />
                    <span>Animal Shelter & Sanctuary Operations</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Kennel and cattery occupancy, adoption screening, foster placements, and permanent rehoming.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Pet intake registration modal ready for intake examination')}
                  className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Pet Intake / Registration</span>
                </button>
              </div>

              {/* Top Row: Shelter Occupancy & Adoption Requests */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Shelter Occupancy (Col 5) */}
                <div className="lg:col-span-5 bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Home className="w-4 h-4 text-teal-400" />
                      <h4>Shelter Occupancy & Capacity</h4>
                    </div>
                    <span className="text-xs font-mono text-teal-400 font-bold">78% Full</span>
                  </div>

                  <div className="space-y-4 pt-1">
                    {/* Canine Kennels */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-300 font-medium">Dog Kennels (Aspins & Rescues)</span>
                        <strong className="text-white">42 / 50 beds</strong>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: '84%' }} />
                      </div>
                    </div>

                    {/* Feline Sanctuaries */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-300 font-medium">Cat Cattery & Nurseries (Puspins)</span>
                        <strong className="text-white">28 / 40 beds</strong>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                        <div className="h-full bg-teal-400 rounded-full" style={{ width: '70%' }} />
                      </div>
                    </div>

                    {/* Medical Isolation & Quarantine */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-300 font-medium">Medical Quarantine & Trauma Suites</span>
                        <strong className="text-white">8 / 10 beds</strong>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                        <div className="h-full bg-rose-400 rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 text-[11px] text-stone-400">
                      <strong>Target:</strong> Maintain capacity under 85% through active foster placement and adoption drives.
                    </div>
                  </div>
                </div>

                {/* Adoption Requests (Col 7) */}
                <div className="lg:col-span-7 bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Heart className="w-4 h-4 text-teal-400" />
                      <h4>Adoption Requests & Interviews</h4>
                    </div>
                    <span className="text-xs font-mono text-stone-400">8 In Review</span>
                  </div>

                  <div className="space-y-2.5">
                    {adoptionRequests.map((req) => (
                      <div key={req.id} className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs text-white">Pet: {req.petName}</strong>
                          <span className="text-[10px] text-stone-400 font-mono">{req.date}</span>
                        </div>
                        <div className="text-[11px] text-teal-300 font-medium">
                          Applicant: {req.applicant} · {req.household}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-800/80">
                          <span className="text-emerald-400 font-semibold">{req.status}</span>
                          <button
                            onClick={() => showToast(`Reviewing adoption screening application for ${req.applicant}`)}
                            className="text-teal-400 hover:underline font-bold"
                          >
                            Review Form →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Available Pets & Foster Program */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Available Pets (Col 7) */}
                <div className="lg:col-span-7 bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-400" />
                      <h4>Available Pets for Forever Adoption</h4>
                    </div>
                    <span className="text-xs text-teal-400 font-bold">24 Ready</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=200&q=80"
                        alt="Bramble"
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">Bramble (Aspin Mix)</div>
                        <div className="text-[10px] text-stone-400">1.5 yrs · Fully Vaccinated</div>
                        <span className="mt-1 inline-block text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          Ready for Home
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=200&q=80"
                        alt="Cleo"
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">Cleo (Calico Puspin)</div>
                        <div className="text-[10px] text-stone-400">8 mos · Spayed & Litter-Trained</div>
                        <span className="mt-1 inline-block text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          Ready for Home
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Foster Program (Col 5) */}
                <div className="lg:col-span-5 bg-stone-950 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Home className="w-4 h-4 text-teal-400" />
                      <h4>Foster Care Network</h4>
                    </div>
                    <span className="text-xs font-mono text-stone-400">18 Active Fosters</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>Foster Parent: Bea & Mark Gomez</span>
                        <span className="text-teal-400 text-[10px]">3 wks left</span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Hosting: 3 Newborn Puspins (Bottle Feeding Phase)
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>Foster Parent: Dr. Sofia Alcantara</span>
                        <span className="text-teal-400 text-[10px]">2 wks left</span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Hosting: Cooper (Post-Orthopedic Recovery)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

        {/* TAB 2: BOOKINGS */}
        {activeSidebarTab === 'bookings' && (
          <ProviderBookingsView
            providerType={providerType}
            appointments={appointments}
            onShowToast={showToast}
            formatPrice={formatPrice}
          />
        )}

        {/* TAB 3: CLIENTS */}
        {activeSidebarTab === 'clients' && (
          <ProviderClientsView
            providerType={providerType}
            onShowToast={showToast}
            formatPrice={formatPrice}
          />
        )}

        {/* TAB 4: PETS */}
        {activeSidebarTab === 'pets' && (
          <ProviderPetsView
            providerType={providerType}
            pets={pets}
            onShowToast={showToast}
          />
        )}

        {/* TAB 5: MESSAGES */}
        {activeSidebarTab === 'messages' && (
          <ProviderMessagesView
            providerType={providerType}
            onShowToast={showToast}
          />
        )}

        {/* TAB 6: REPORTS */}
        {activeSidebarTab === 'reports' && (
          <ProviderReportsView
            providerType={providerType}
            onShowToast={showToast}
            formatPrice={formatPrice}
          />
        )}

        {/* TAB 7: SETTINGS */}
        {activeSidebarTab === 'settings' && (
          <ProviderSettingsView
            providerType={providerType}
            businessName={businessName}
            onShowToast={showToast}
            formatPrice={formatPrice}
          />
        )}
      </main>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PROVIDER PORTAL FOOTER */}
      {/* ========================================================= */}
      <footer className="border-t border-stone-800 bg-stone-950 text-stone-500 text-xs py-6 px-4 mt-12">
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-500 text-stone-950 flex items-center justify-center font-black text-xs">
              <ProviderIcon className="w-3.5 h-3.5" />
            </div>
            <span className="text-stone-300 font-bold">SafePaw Provider Portal (Suite v3.0)</span>
            <span className="text-stone-600">|</span>
            <span className="text-stone-400">{businessName}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-teal-400 font-mono">Database: Local Secure Storage</span>
            <button
              onClick={() => signOut()}
              className="text-rose-400 hover:text-rose-300 font-semibold underline cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-teal-500 text-stone-950 px-4 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2.5 border border-teal-300">
            <CheckCircle className="w-4 h-4 text-stone-950" />
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-stone-950/70 hover:text-stone-950 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Patient Clinical Chart Modal */}
      <PatientChartModal
        isOpen={isDashboardChartOpen}
        onClose={() => {
          setIsDashboardChartOpen(false);
          setDashboardChartPet(null);
          setDashboardChartApt(null);
        }}
        pet={dashboardChartPet}
        appointment={dashboardChartApt}
        onShowToast={showToast}
      />
    </div>
  );
};
