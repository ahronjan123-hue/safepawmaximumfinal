import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_COUNTRIES } from '../data/countries';
import {
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  ChevronDown,
  Menu,
  PhoneCall,
  Search,
  Calendar,
  Clock,
  Heart,
  FileText,
  MessageSquare,
  Radio,
  Shield,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenNotifications: () => void;
  onOpenNewPetModal: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenNotifications,
  onOpenNewPetModal,
  onOpenSettings,
}) => {
  const {
    currentTab,
    selectedPet,
    isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    syncQueue,
    isSyncing,
    notifications,
    currentCountry,
    locationSettings,
    setCountryByCode,
  } = useApp();

  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Title and icon based on current tab
  const tabMetadata: Record<string, { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }> = {
    dashboard: {
      title: 'Health Dashboard',
      subtitle: `Welcome back${selectedPet ? `, ${selectedPet.name}'s parent` : ''}!`,
      icon: Heart,
    },
    clinics: {
      title: 'Clinics & Care Directory',
      subtitle: 'Verified 24/7 veterinary hospitals, groomers & clinics',
      icon: Search,
    },
    book: {
      title: 'Book a Visit',
      subtitle: 'Schedule checkups, vaccines & grooming sessions',
      icon: Calendar,
    },
    tracker: {
      title: 'Live Appointment Tracker',
      subtitle: 'Real-time queue & consultation progress updates',
      icon: Clock,
    },
    records: {
      title: 'Pet Health Records',
      subtitle: 'Digital medical passports, vaccinations & clinical notes',
      icon: FileText,
    },
    messages: {
      title: 'Direct Messages',
      subtitle: 'Chat directly with attending veterinarians and staff',
      icon: MessageSquare,
    },
    shelters: {
      title: 'Shelters & Lost Pet Radar',
      subtitle: 'Community rescues, adoptions & lost pet alerts',
      icon: Radio,
    },
    pets: {
      title: 'My Pets Management',
      subtitle: 'Manage pet profiles, microchips & passports',
      icon: Shield,
    },
  };

  const currentMeta = tabMetadata[currentTab] || {
    title: 'SafePaw Connect',
    subtitle: 'Veterinary care & health records',
    icon: Shield,
  };

  const TabIcon = currentMeta.icon;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Mobile Sidebar Toggle + Current Page Title / Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger toggle to open left sidebar */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition border border-stone-200 shrink-0"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Current Active Page Title & Subtitle */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 hidden sm:flex items-center justify-center shrink-0">
                <TabIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight truncate flex items-center gap-2">
                  <span>{currentMeta.title}</span>
                </h1>
                <p className="text-[11px] text-stone-500 truncate hidden md:block">
                  {currentMeta.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quick Controls (Emergency Hotline, Online Status, Notifications, Settings, Pet Avatar) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Country & Currency Switcher Pill */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition font-medium text-xs"
                title="Change Country & Currency"
              >
                <span>{currentCountry.flag}</span>
                <span className="font-mono text-teal-800 font-bold">{currentCountry.currencyCode}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {countryDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white text-stone-800 rounded-2xl shadow-xl border border-stone-200 py-1.5 z-50 animate-fadeIn">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-stone-400 border-b border-stone-100 flex items-center justify-between">
                    <span>Switch Country</span>
                    <button
                      onClick={() => {
                        setCountryDropdownOpen(false);
                        onOpenSettings();
                      }}
                      className="text-teal-700 hover:underline capitalize"
                    >
                      Settings
                    </button>
                  </div>
                  <div className="max-h-52 overflow-y-auto py-1">
                    {SUPPORTED_COUNTRIES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCountryByCode(c.code);
                          setCountryDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-stone-50 transition ${
                          c.code === currentCountry.code ? 'bg-teal-50 font-bold text-teal-900' : 'text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{c.flag}</span>
                          <span className="truncate">{c.name}</span>
                        </div>
                        <span className="font-mono text-[11px] text-teal-800">{c.currencyCode}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Hotline Pill */}
            <a
              href={`tel:${currentCountry.emergencyHotline}`}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 transition text-xs font-semibold"
              title="Click to dial 24/7 Animal Emergency Hotline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span className="hidden xl:inline">Emergency:</span>
              <span className="font-mono">{currentCountry.emergencyHotline}</span>
            </a>

            {/* Online / Offline Sync Indicator & Toggle */}
            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-xl p-1">
              <button
                onClick={toggleSimulatedOffline}
                title={isSimulatedOffline ? 'Switch to Online Mode' : 'Test Offline Mode'}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold transition"
              >
                {isOnline ? (
                  <span className="flex items-center gap-1 text-emerald-700 text-[11px]">
                    <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Online</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-700 text-[11px]">
                    <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                    <span>Offline</span>
                    {syncQueue.length > 0 && (
                      <span className="bg-amber-200 text-amber-900 text-[9px] px-1 py-0.1 rounded font-mono font-bold">
                        {syncQueue.length}
                      </span>
                    )}
                  </span>
                )}
                {isSyncing && <RefreshCw className="w-3 h-3 animate-spin text-teal-600 ml-0.5" />}
              </button>
            </div>


            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Settings Gear Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition relative cursor-pointer"
              aria-label="Open Settings"
              title="Location, currency & sync settings"
            >
              <Settings className="w-4 h-4" />
              {locationSettings.isManualOverride && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-600" />
              )}
            </button>


          </div>
        </div>
      </div>
    </header>
  );
};
