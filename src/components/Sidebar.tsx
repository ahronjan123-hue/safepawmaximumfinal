import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  Search,
  Shield,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  LogOut,
  Radio,
  X,
  Sparkles,
  PhoneCall,
  Check,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenNewPetModal: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  onOpenNewPetModal,
  onOpenSettings,
  onOpenNotifications,
}) => {
  const {
    currentTab,
    setCurrentTab,
    pets,
    selectedPetId,
    setSelectedPetId,
    selectedPet,
    appointments,
    notifications,
  } = useApp();

  const { user, profile, signOut } = useAuth();
  const [petDropdownOpen, setPetDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Check if there are active tracker appointments (status requested, scheduled, checked_in, in_consultation)
  const activeTrackerCount = appointments.filter(
    (a) =>
      a.status === 'requested' ||
      a.status === 'scheduled' ||
      a.status === 'checked_in' ||
      a.status === 'in_consultation'
  ).length;

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Primary Navigation Items grouped
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Heart, description: 'Overview & Pet Stats' },
    { id: 'clinics', label: 'Clinics & Care', icon: Search, description: 'Find Verified Providers' },
    { id: 'book', label: 'Book Visit', icon: Calendar, description: 'Schedule Appointments' },
    {
      id: 'tracker',
      label: 'Live Tracker',
      icon: Clock,
      description: 'Real-time Appointment Queue',
      badge: activeTrackerCount > 0 ? `${activeTrackerCount} Active` : undefined,
      badgeColor: 'bg-emerald-500 text-white',
      hasPulse: activeTrackerCount > 0,
    },
  ];

  const careNavItems = [
    { id: 'records', label: 'Health Records', icon: FileText, description: 'Vaccines, EMR & Passports' },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      description: 'Chat with Clinics',
      badge: '3',
      badgeColor: 'bg-teal-600 text-white',
    },
    { id: 'shelters', label: 'Shelters & Lost Radar', icon: Radio, description: 'Community Rescues & Alerts' },
    {
      id: 'pets',
      label: 'My Pets',
      icon: Shield,
      description: 'Manage Pet Profiles',
      badge: pets.length > 0 ? `${pets.length}` : undefined,
      badgeColor: 'bg-stone-200 text-stone-800',
    },
  ];

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-stone-200/90 shadow-xl lg:shadow-none transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:w-20' : 'lg:w-68'
        } w-72 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } select-none`}
      >
        {/* 1. BRAND HEADER */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-stone-100 shrink-0 bg-stone-50/50">
          <button
            onClick={() => handleSelectTab('dashboard')}
            className="flex items-center gap-3 text-left group overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black shadow-md shadow-teal-600/20 group-hover:bg-teal-700 transition shrink-0">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 10.5c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5zm-5-2c1.38 0 2.5-1.12 2.5-2.5S8.38 3.5 7 3.5 4.5 4.62 4.5 6s1.12 2.5 2.5 2.5zm10 0c1.38 0 2.5-1.12 2.5-2.5S18.38 3.5 17 3.5 14.5 4.62 14.5 6s1.12 2.5 2.5 2.5zm-1.8 4.2c-.7-.5-1.6-.7-2.7-.7s-2 .2-2.7.7c-2.4 1.7-4.8 5-2.8 7.3 1.2 1.4 3.4 1.5 5.5 1.5s4.3-.1 5.5-1.5c2-2.3-.4-5.6-2.8-7.3z" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-extrabold tracking-tight text-stone-900 group-hover:text-teal-700 transition">
                    SafePaw<span className="text-teal-600">.</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                    Care
                  </span>
                </div>
                <p className="text-[10px] font-medium text-stone-400 truncate">
                  Veterinary & Pet Health
                </p>
              </div>
            )}
          </button>

          {/* Close button on mobile / Collapse toggle button on desktop */}
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* 2. PET SWITCHER WIDGET */}
        <div className="p-3 border-b border-stone-100 relative">
          <button
            onClick={() => setPetDropdownOpen(!petDropdownOpen)}
            className={`w-full flex items-center justify-between p-2 rounded-xl bg-stone-50 hover:bg-teal-50/60 border border-stone-200/80 transition group ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={selectedPet?.name ? `Active pet: ${selectedPet.name}` : 'Select Pet Profile'}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                {selectedPet?.photoUrl ? (
                  <img
                    src={selectedPet.photoUrl}
                    alt={selectedPet.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-xs group-hover:border-teal-500 transition"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    P
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              {!isCollapsed && (
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold text-stone-900 group-hover:text-teal-900 truncate">
                    {selectedPet?.name || 'Select Pet'}
                  </div>
                  <div className="text-[10px] text-stone-500 truncate">
                    {selectedPet?.breed || selectedPet?.species || 'All Pets'}
                  </div>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronDown className="w-4 h-4 text-stone-400 group-hover:text-teal-600 transition shrink-0" />
            )}
          </button>

          {/* Pet Selection Dropdown Popup */}
          {petDropdownOpen && (
            <div className="absolute left-3 right-3 top-16 bg-white rounded-2xl shadow-2xl border border-stone-200 py-2 z-50 animate-fadeIn">
              <div className="px-3 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 flex items-center justify-between">
                <span>Select Pet Profile</span>
                <span className="font-mono text-teal-700">{pets.length} registered</span>
              </div>
              <div className="max-h-52 overflow-y-auto py-1">
                {pets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => {
                      setSelectedPetId(pet.id);
                      setPetDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-teal-50/50 transition ${
                      pet.id === selectedPetId ? 'bg-teal-50 font-bold text-teal-900' : 'text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={pet.photoUrl}
                        alt={pet.name}
                        className="w-7 h-7 rounded-full object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs truncate">{pet.name}</div>
                        <div className="text-[10px] text-stone-400 font-normal truncate">
                          {pet.breed} · {pet.ageYears}y
                        </div>
                      </div>
                    </div>
                    {pet.id === selectedPetId && (
                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              <div className="p-1.5 border-t border-stone-100 mt-1">
                <button
                  onClick={() => {
                    setPetDropdownOpen(false);
                    onOpenNewPetModal();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register New Pet</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. SCROLLABLE NAVIGATION LINKS */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-6">
          {/* Main Group */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Main Menu
              </div>
            )}
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="relative shrink-0 flex items-center justify-center">
                      <Icon
                        className={`w-4 h-4 transition ${
                          isActive ? 'text-white' : 'text-stone-500 group-hover:text-stone-800'
                        }`}
                      />
                      {item.hasPulse && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive ? 'bg-white/20 text-white' : item.badgeColor
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Care & Records Group */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Care & Records
              </div>
            )}
            <nav className="space-y-1">
              {careNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="relative shrink-0 flex items-center justify-center">
                      <Icon
                        className={`w-4 h-4 transition ${
                          isActive ? 'text-white' : 'text-stone-500 group-hover:text-stone-800'
                        }`}
                      />
                    </div>
                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive ? 'bg-white/20 text-white' : item.badgeColor
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* 5. FOOTER & USER PROFILE */}
        <div className="p-3 border-t border-stone-200/90 bg-stone-50/70 space-y-2 shrink-0">


          {/* User Profile Card & Role Switcher Popup */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className={`w-full flex items-center justify-between p-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200/80 transition group ${
                isCollapsed ? 'justify-center p-1.5' : ''
              }`}
              title="Account & Profile"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-stone-200 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stone-900 text-teal-300 flex items-center justify-center text-xs font-bold shrink-0">
                    {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                {!isCollapsed && (
                  <div className="text-left min-w-0">
                    <div className="text-xs font-bold text-stone-900 truncate">
                      {profile?.fullName || user?.email?.split('@')[0] || 'User Profile'}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Pet Owner</span>
                    </div>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition shrink-0" />
              )}
            </button>

            {/* Account Dropdown */}
            {userDropdownOpen && (
              <div
                className={`absolute bottom-12 ${
                  isCollapsed ? 'left-16 w-64' : 'left-0 right-0'
                } bg-white rounded-2xl shadow-2xl border border-stone-200 p-2 z-50 animate-fadeIn text-xs`}
              >
                <div className="px-3 py-2 border-b border-stone-100">
                  <div className="font-bold text-stone-900 truncate">{profile?.fullName}</div>
                  <div className="text-[10px] text-stone-400 truncate">{user?.email}</div>
                </div>

                <div className="py-2 px-1">
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        Current Role
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                        <Heart className="w-2.5 h-2.5 text-teal-600" />
                        Pet Owner
                      </span>
                    </div>
                    <p className="text-[10.5px] text-stone-500 leading-relaxed">
                      To access Service Provider or Shelter tools, please sign out first.
                    </p>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-stone-400" />
                    <span>Settings & Preferences</span>
                  </button>

                  <button
                    onClick={async () => {
                      setUserDropdownOpen(false);
                      await signOut();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition font-bold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
