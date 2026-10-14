import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope,
  Heart,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Shield,
  Calendar,
  Activity,
  Scissors,
  Building,
  Home,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Phone,
  Mail,
  User,
  Radio,
} from 'lucide-react';
import { INITIAL_CLINICS } from '../../data/initialData';
import { ProviderServiceType, UserRole } from '../../types';

interface AuthPageProps {
  initialRole?: UserRole;
  onBackToHome?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialRole = 'pet_owner',
  onBackToHome,
}) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    loginAsDemoUser,
    updateProfileDetails,
    authError,
    setAuthError,
  } = useAuth();

  // Role: Pet owner, provider, or shelter/rescuer (plus clinical vet)
  const [portalMode, setPortalMode] = useState<UserRole>(initialRole);
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('email');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email or Phone form state
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Provider specific fields
  const [providerType, setProviderType] = useState<ProviderServiceType>('veterinary_clinic');
  const [businessName, setBusinessName] = useState('Greenwood Animal Hospital & Wellness Center');
  const [vetLicense, setVetLicense] = useState('');
  const [selectedClinicId, setSelectedClinicId] = useState(INITIAL_CLINICS[0].id);
  const [vetSpecialization, setVetSpecialization] = useState('Clinical Veterinary Medicine');

  const handleQuickDemoEnter = (
    roleToEnter: UserRole | 'veterinarian',
    provType: ProviderServiceType = 'veterinary_clinic'
  ) => {
    loginAsDemoUser(roleToEnter, undefined, provType);
  };

  // Handle Continue with Google
  const handleGoogleAuth = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    const clinic = INITIAL_CLINICS.find((c) => c.id === selectedClinicId) || INITIAL_CLINICS[0];

    try {
      const result = await signInWithGoogle(portalMode, {
        fullName: fullName.trim() || undefined,
        licenseNumber: portalMode === 'veterinarian' ? (vetLicense.trim() || 'PRC-VET-0049182') : undefined,
        clinicId: clinic.id,
        clinicName: clinic.name,
        specialization: vetSpecialization.trim() || undefined,
        providerType,
        businessName,
      });

      if (!result.success && result.error) {
        setAuthError(result.error);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Email or Phone Auth
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!emailOrPhone.trim()) {
      setAuthError('Please enter your email address or mobile phone number.');
      return;
    }
    if (!password) {
      setAuthError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const clinic = INITIAL_CLINICS.find((c) => c.id === selectedClinicId) || INITIAL_CLINICS[0];

    try {
      const res = isSigningUp
        ? await signUpWithEmail(emailOrPhone.trim(), password, portalMode, {
            fullName: fullName.trim() || undefined,
            licenseNumber: portalMode === 'veterinarian' ? (vetLicense.trim() || 'PRC-VET-0049182') : undefined,
            clinicId: clinic.id,
            clinicName: clinic.name,
            specialization: vetSpecialization.trim() || undefined,
            providerType,
            businessName,
          })
        : await signInWithEmail(emailOrPhone.trim(), password, portalMode, {
            fullName: fullName.trim() || undefined,
            providerType,
            businessName,
          });

      if (!res.success && res.error) {
        setAuthError(res.error);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between font-sans selection:bg-teal-300 selection:text-stone-950">
      {/* Top Navbar */}
      <header className="border-b border-stone-800 bg-stone-900/60 backdrop-blur-md px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500 text-stone-950 flex items-center justify-center font-black shadow-md border border-teal-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight">SafePaw</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-teal-400 uppercase tracking-widest font-mono font-bold bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/80">
                Verified Pet Care & Health
              </span>
            </div>
          </div>

          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Home</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Pitch Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sign In or Create Your Account</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              One platform for pet parents, care providers & rescues
            </h1>

            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
              Book certified veterinary care, grooming, and walking. Manage animal shelter intakes and search missing pets across the community radar.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs text-stone-300">
                <div className="w-7 h-7 rounded-xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Pet Owner Tools</div>
                  <div className="text-[11px] text-stone-400">Vaccine passports, live booking, reminders & lost pet radar.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-stone-300">
                <div className="w-7 h-7 rounded-xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Pet Care Service Providers</div>
                  <div className="text-[11px] text-stone-400">Calendar slots, client bookings, earnings & verified reputation.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-stone-300">
                <div className="w-7 h-7 rounded-xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Shelters & Rescuers</div>
                  <div className="text-[11px] text-stone-400">Animal intake records, adoption matching & radar search.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Auth Form Card */}
          <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Step 1: Choose Role as requested in spec */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400">
                1. Choose your account role:
              </label>

              <div className="grid grid-cols-3 p-1.5 bg-stone-950 rounded-2xl border border-stone-800 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setPortalMode('pet_owner');
                    setAuthError(null);
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs transition cursor-pointer text-center ${
                    portalMode === 'pet_owner'
                      ? 'bg-teal-500 text-stone-950 shadow-md font-black'
                      : 'text-stone-400 hover:text-white hover:bg-stone-900 font-semibold'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span>Pet Owner</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPortalMode('service_provider');
                    setAuthError(null);
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs transition cursor-pointer text-center ${
                    portalMode === 'service_provider'
                      ? 'bg-teal-500 text-stone-950 shadow-md font-black'
                      : 'text-stone-400 hover:text-white hover:bg-stone-900 font-semibold'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Provider</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPortalMode('shelter_rescuer');
                    setAuthError(null);
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs transition cursor-pointer text-center ${
                    portalMode === 'shelter_rescuer'
                      ? 'bg-teal-500 text-stone-950 shadow-md font-black'
                      : 'text-stone-400 hover:text-white hover:bg-stone-900 font-semibold'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Shelter/Rescuer</span>
                </button>
              </div>

              {/* Sub-selector for Veterinarians */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setPortalMode(portalMode === 'veterinarian' ? 'service_provider' : 'veterinarian')}
                  className="text-[11px] text-teal-400 hover:underline cursor-pointer"
                >
                  {portalMode === 'veterinarian'
                    ? 'Switch back to standard provider'
                    : 'Are you a licensed clinical veterinarian? Access clinical suite →'}
                </button>
              </div>

              {/* Provider Category Selection for Service Providers */}
              {portalMode === 'service_provider' && (
                <div className="pt-2 space-y-1.5 animate-fadeIn">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-teal-400">
                    Select Your Service Provider Type:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProviderType('veterinary_clinic');
                        setBusinessName('Greenwood Animal Hospital & Wellness Center');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                        providerType === 'veterinary_clinic'
                          ? 'bg-teal-500/15 border-teal-500 text-teal-300 ring-1 ring-teal-500/50'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700'
                      }`}
                    >
                      <Activity className="w-4 h-4 text-teal-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">Veterinary Clinic</div>
                        <div className="text-[10px] text-stone-400">Clinical practice & treatments</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProviderType('grooming_salon');
                        setBusinessName('Paws & Bubbles Pet Luxury Spa & Grooming');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                        providerType === 'grooming_salon'
                          ? 'bg-teal-500/15 border-teal-500 text-teal-300 ring-1 ring-teal-500/50'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700'
                      }`}
                    >
                      <Scissors className="w-4 h-4 text-teal-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">Spa & Grooming Salon</div>
                        <div className="text-[10px] text-stone-400">Styling, bath & hygiene</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error Banner */}
            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold">Authentication Notice</div>
                  <div className="text-[11px] text-rose-300/90">{authError}</div>
                </div>
              </div>
            )}

            {/* Step 2: Email or Phone Auth Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400">
                2. Enter your credentials:
              </label>

              {isSigningUp && (
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Full Legal Name:</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={
                        portalMode === 'pet_owner'
                          ? 'Sophia Rodriguez'
                          : portalMode === 'shelter_rescuer'
                          ? 'Elena Gomez (PawHaven Rescue)'
                          : 'Greenwood Care Management'
                      }
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              )}

              {/* Email or Phone field */}
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">
                  Email Address or Mobile Phone Number:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="sophia@example.com or +63 917 555 0192"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Password:</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-400 text-stone-950 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSigningUp ? (
                  `Create ${portalMode === 'pet_owner' ? 'Pet Owner' : portalMode === 'shelter_rescuer' ? 'Shelter' : 'Provider'} Account`
                ) : (
                  `Sign In as ${portalMode === 'pet_owner' ? 'Pet Owner' : portalMode === 'shelter_rescuer' ? 'Shelter/Rescuer' : 'Provider'}`
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSigningUp(!isSigningUp)}
                  className="text-teal-400 hover:underline cursor-pointer"
                >
                  {isSigningUp ? 'Already have an account? Sign In' : "Don't have an account? Register here"}
                </button>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="text-stone-400 hover:text-white transition cursor-pointer"
                >
                  Or continue with Google →
                </button>
              </div>
            </form>

            {/* Quick 1-Click Instant Demo Login for Testing */}
            <div className="pt-4 border-t border-stone-800 space-y-2.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Quick 1-Click Demo Logins:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoEnter('pet_owner')}
                  className="py-2.5 px-3 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-teal-300 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Heart className="w-3.5 h-3.5 text-teal-400" />
                  <span>Pet Owner (Sophia)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoEnter('service_provider', 'veterinary_clinic')}
                  className="py-2.5 px-3 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-teal-300 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                  <span>Veterinary Clinic (Greenwood)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoEnter('service_provider', 'grooming_salon')}
                  className="py-2.5 px-3 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-teal-300 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Scissors className="w-3.5 h-3.5 text-teal-400" />
                  <span>Grooming Salon (Paws & Bubbles)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoEnter('shelter_rescuer', 'rescue_shelter')}
                  className="py-2.5 px-3 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-teal-300 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Home className="w-3.5 h-3.5 text-teal-400" />
                  <span>Shelter & Rescue (PawHaven)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoEnter('veterinarian')}
                  className="py-2.5 px-3 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-teal-300 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs sm:col-span-2"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                  <span>Clinical Vet Doctor (Dr. David)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-900 bg-stone-950 px-4 py-6 text-center text-stone-500 text-xs">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} SafePaw Connect Platform</div>
          <div className="text-stone-500 text-[11px]">
            National Pet Healthcare, Grooming & Rescue Network
          </div>
        </div>
      </footer>
    </div>
  );
};
