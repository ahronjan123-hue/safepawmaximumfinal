import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  MapPin,
  Shield,
  Star,
  CheckCircle,
  Radio,
  Heart,
  Calendar,
  Sparkles,
  Phone,
  ArrowRight,
  ChevronRight,
  Scissors,
  Activity,
  Home,
  User,
  Clock,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Clinic } from '../../types';

interface PublicHomePageProps {
  onOpenAuth: (role?: 'pet_owner' | 'service_provider' | 'shelter_rescuer', prefillProviderId?: string) => void;
  onExploreAsGuest?: () => void;
}

export const PublicHomePage: React.FC<PublicHomePageProps> = ({
  onOpenAuth,
  onExploreAsGuest,
}) => {
  const { clinics, lostPets, formatPrice, currentCountry } = useApp();

  // Search Bar State
  const [selectedService, setSelectedService] = useState<string>('all');
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>(clinics);
  const [hasSearched, setHasSearched] = useState(false);

  // Available service categories as requested: sitting, grooming, walking, boarding, training, veterinary
  const serviceOptions = [
    { id: 'all', label: 'All Services', icon: Sparkles },
    { id: 'sitting', label: 'Pet Sitting', icon: Home },
    { id: 'grooming', label: 'Grooming & Spa', icon: Scissors },
    { id: 'walking', label: 'Dog Walking', icon: Activity },
    { id: 'boarding', label: 'Boarding & Hotel', icon: Home },
    { id: 'training', label: 'Pet Training', icon: Shield },
    { id: 'veterinary', label: 'Veterinary Clinics', icon: Activity },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);

    const filtered = clinics.filter((c) => {
      // Filter by service
      let matchesService = true;
      if (selectedService === 'sitting') {
        matchesService = c.services.some((s) => s.name.toLowerCase().includes('sit') || s.name.toLowerCase().includes('daycare')) || c.type === 'salon';
      } else if (selectedService === 'grooming') {
        matchesService = c.services.some((s) => s.category === 'Grooming' || s.name.toLowerCase().includes('groom') || s.name.toLowerCase().includes('bath')) || c.type === 'groomer';
      } else if (selectedService === 'walking') {
        matchesService = c.services.some((s) => s.name.toLowerCase().includes('walk'));
      } else if (selectedService === 'boarding') {
        matchesService = c.services.some((s) => s.name.toLowerCase().includes('board') || s.name.toLowerCase().includes('hotel') || s.name.toLowerCase().includes('condo')) || c.type === 'boarding';
      } else if (selectedService === 'training') {
        matchesService = c.services.some((s) => s.name.toLowerCase().includes('train') || s.name.toLowerCase().includes('obedience'));
      } else if (selectedService === 'veterinary') {
        matchesService = c.type === 'clinic' || c.type === 'hospital_247';
      }

      // Filter by location
      let matchesLocation = true;
      if (locationQuery.trim()) {
        const query = locationQuery.toLowerCase();
        matchesLocation =
          c.city.toLowerCase().includes(query) ||
          c.address.toLowerCase().includes(query) ||
          c.stateOrProvince.toLowerCase().includes(query);
      }

      return matchesService && matchesLocation;
    });

    setFilteredClinics(filtered);
  };

  const handleClearFilter = () => {
    setSelectedService('all');
    setLocationQuery('');
    setFilteredClinics(clinics);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-teal-500 selection:text-stone-950">
      {/* Top Public Navigation Bar */}
      <header className="sticky top-0 z-50 bg-stone-950/90 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500 text-stone-950 flex items-center justify-center font-black shadow-lg shadow-teal-500/20 border border-teal-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                SafePaw
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Verified Pet Care
                </span>
              </span>
              <p className="text-[11px] text-stone-400 font-medium hidden sm:block">
                Veterinary Clinics, Professional Sitters, Groomers & Rescues
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth('pet_owner')}
              className="px-4 py-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-stone-900 text-xs font-bold transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('pet_owner')}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-extrabold shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-stone-800 bg-linear-to-b from-stone-900 via-stone-950 to-stone-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(20,184,166,0.18),rgba(255,255,255,0))] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/90 border border-stone-700/80 text-teal-300 text-xs font-semibold mb-6 shadow-xs">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Trusted by over 12,000+ pet parents across {currentCountry.name}</span>
          </div>

          {/* Tagline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Find pet care you can trust
          </h1>

          <p className="mt-5 text-base sm:text-lg md:text-xl text-stone-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Connect with board-certified veterinarians, certified groomers, trusted in-home sitters, dog walkers, and verified community rescue shelters.
          </p>

          {/* One Main Action Button */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#search-bar-section"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-teal-500 hover:bg-teal-400 text-stone-950 font-black text-sm sm:text-base shadow-xl shadow-teal-500/20 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Search className="w-5 h-5 text-stone-950" />
              <span>Find pet care you can trust</span>
            </a>

            <button
              onClick={() => onOpenAuth('service_provider')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Join as Service Provider</span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">100% Verified</div>
                <div className="text-[11px] text-stone-400">PRC & ID verified providers</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Live Booking</div>
                <div className="text-[11px] text-stone-400">Instant slot confirmation</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Lost Pet Radar</div>
                <div className="text-[11px] text-stone-400">Community alert system</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Medical Passports</div>
                <div className="text-[11px] text-stone-400">Vaccine & health tracking</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH BAR SECTION (Service Type & Location) */}
      <section id="search-bar-section" className="py-10 bg-stone-900/40 border-b border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-stone-300 uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4 text-teal-400" />
                <span>Search by Service & Location</span>
              </h2>
              {hasSearched && (
                <button
                  onClick={handleClearFilter}
                  className="text-xs text-teal-400 hover:underline cursor-pointer"
                >
                  Reset Search
                </button>
              )}
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              {/* Service Type Selection Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {serviceOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = selectedService === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedService(opt.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-teal-500 text-stone-950 shadow-md font-bold'
                          : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-700/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Location Input and Submit Button */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Enter city or district (e.g., Makati, Taguig, BGC, Quezon City)"
                    className="w-full pl-10 pr-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-teal-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-teal-500 hover:bg-teal-400 text-stone-950 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Pet Care</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 3. FEATURED VERIFIED PROVIDERS */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-teal-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Accredited Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Featured Verified Providers
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm mt-1">
              Top-rated clinics, certified grooming salons, sitters, and animal shelters in your area.
            </p>
          </div>

          <div className="text-xs text-stone-400">
            Showing <strong className="text-white">{filteredClinics.length}</strong> verified facilities
          </div>
        </div>

        {filteredClinics.length === 0 ? (
          <div className="p-12 text-center bg-stone-900 border border-stone-800 rounded-3xl space-y-3">
            <Search className="w-8 h-8 text-stone-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No providers matched your search</h3>
            <p className="text-xs text-stone-400 max-w-md mx-auto">
              Try choosing "All Services" or search for a broader city like Metro Manila, Makati, or Quezon City.
            </p>
            <button
              onClick={handleClearFilter}
              className="px-4 py-2 bg-stone-800 text-stone-200 rounded-xl text-xs font-semibold hover:bg-stone-700 transition cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClinics.slice(0, 6).map((provider) => (
              <div
                key={provider.id}
                className="group bg-stone-900 border border-stone-800 hover:border-teal-500/50 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-lg"
              >
                <div>
                  {/* Photo & Badges */}
                  <div className="relative h-44 w-full overflow-hidden bg-stone-800">
                    <img
                      src={provider.image}
                      alt={provider.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-stone-950 via-transparent to-black/30" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {provider.verified && (
                        <span className="px-2.5 py-1 rounded-full bg-teal-500/90 text-stone-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 backdrop-blur-xs shadow-xs">
                          <CheckCircle className="w-3 h-3 text-stone-950" />
                          Verified
                        </span>
                      )}
                      {provider.emergencyAvailable && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs shadow-xs">
                          24/7 ER
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-stone-950/80 backdrop-blur-xs text-amber-300 font-bold text-xs flex items-center gap-1 border border-stone-800">
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                      <span>{provider.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-stone-400">({provider.reviewsCount})</span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-stone-300">
                      <span className="flex items-center gap-1 text-[11px] text-teal-300 bg-stone-950/80 px-2 py-0.5 rounded-md border border-stone-800">
                        <MapPin className="w-3 h-3 text-teal-400" />
                        {provider.city} · {provider.distanceKm} km away
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition">
                      {provider.name}
                    </h3>

                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                      {provider.about}
                    </p>

                    {/* Services preview */}
                    <div className="space-y-1.5 pt-2 border-t border-stone-800/80">
                      <div className="text-[10px] uppercase font-bold text-stone-400">Available Services:</div>
                      <div className="flex flex-wrap gap-1">
                        {provider.services.slice(0, 3).map((srv) => (
                          <span
                            key={srv.id}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700"
                          >
                            {srv.name.split('(')[0]} · {formatPrice(srv.basePriceUSD)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => onOpenAuth('pet_owner', provider.id)}
                    className="w-full py-2.5 px-4 bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-stone-950 border border-teal-500/30 hover:border-teal-500 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Book Care or Consultation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. LOST & FOUND PREVIEW (Recent Listings) */}
      <section className="py-16 bg-stone-900/50 border-t border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Community Lost & Found Radar</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Missing & Found Pets Nearby
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm mt-1">
                Recent community sightings and urgent search broadcasts. Every second counts.
              </p>
            </div>

            <button
              onClick={() => onOpenAuth('pet_owner')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Report a Lost or Found Pet</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {lostPets.map((pet) => {
              const isLost = pet.status === 'lost';
              const isReunited = pet.status === 'reunited';
              return (
                <div
                  key={pet.id}
                  className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-md"
                >
                  <div>
                    <div className="relative h-40 w-full bg-stone-800 overflow-hidden">
                      <img
                        src={pet.photoUrl}
                        alt={pet.petName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
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
                      {pet.baseRewardUSD && pet.baseRewardUSD > 0 && isLost && (
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-stone-950/80 backdrop-blur-xs text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                          Reward: {formatPrice(pet.baseRewardUSD)}
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-white">{pet.petName}</h4>
                        <span className="text-[11px] text-teal-300 font-medium">
                          {pet.breed}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                        {pet.description}
                      </p>

                      <div className="text-[10px] text-stone-400 space-y-1 pt-1 border-t border-stone-800">
                        <div className="flex items-center gap-1 text-stone-300">
                          <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                          <span className="truncate">{pet.lastSeenLocation}</span>
                        </div>
                        <div className="flex items-center gap-1 text-stone-400">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>Reported {pet.dateReported}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      onClick={() => onOpenAuth('pet_owner')}
                      className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold transition cursor-pointer text-center"
                    >
                      {isReunited ? 'View Reunion Details' : 'Contact Poster Privately'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="mt-auto bg-stone-950 border-t border-stone-800 text-stone-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-800">
            {/* Col 1: SafePaw Mission */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500 text-stone-950 flex items-center justify-center font-black text-xs">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-white font-extrabold text-base">SafePaw</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                The nation's unified pet healthcare network. Connecting loving pet guardians with accredited veterinarians, trusted sitters, grooming stylists, and rescue shelters.
              </p>
              <div className="text-[11px] text-teal-400 font-medium">
                Country: {currentCountry.name} ({currentCountry.currencySymbol} {currentCountry.currencyCode})
              </div>
            </div>

            {/* Col 2: Services */}
            <div className="space-y-2.5">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Pet Services</h4>
              <ul className="space-y-1.5 text-stone-400 text-xs">
                <li><button onClick={() => onOpenAuth('pet_owner')} className="hover:text-teal-300 transition cursor-pointer">Veterinary Clinical Consultations</button></li>
                <li><button onClick={() => onOpenAuth('pet_owner')} className="hover:text-teal-300 transition cursor-pointer">Pet Grooming & Spa Treatments</button></li>
                <li><button onClick={() => onOpenAuth('pet_owner')} className="hover:text-teal-300 transition cursor-pointer">In-Home Pet Sitting & Daycare</button></li>
                <li><button onClick={() => onOpenAuth('pet_owner')} className="hover:text-teal-300 transition cursor-pointer">Dog Walking & Leash Manners</button></li>
                <li><button onClick={() => onOpenAuth('pet_owner')} className="hover:text-teal-300 transition cursor-pointer">Luxury Hotel & Boarding</button></li>
              </ul>
            </div>

            {/* Col 3: Community & Roles */}
            <div className="space-y-2.5">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Join SafePaw</h4>
              <ul className="space-y-1.5 text-stone-400 text-xs">
                <li><button onClick={() => onOpenAuth('pet_owner')} className="hover:text-teal-300 transition cursor-pointer">Pet Owner Portal</button></li>
                <li><button onClick={() => onOpenAuth('service_provider')} className="hover:text-teal-300 transition cursor-pointer">Pet Care Provider Dashboard</button></li>
                <li><button onClick={() => onOpenAuth('shelter_rescuer')} className="hover:text-teal-300 transition cursor-pointer">Shelter & Rescuer Portal</button></li>
                <li><button onClick={() => onOpenAuth('pet_owner')} className="hover:text-teal-300 transition cursor-pointer">Lost & Found Community Radar</button></li>
              </ul>
            </div>

            {/* Col 4: Safety & Emergency Hotline */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">24/7 Emergency Triage</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                If your pet has suffered trauma, acute toxin ingestion, or severe distress, reach the nearest trauma clinic immediately.
              </p>
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 text-xs flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">{currentCountry.emergencyHotlineLabel}</div>
                  <strong className="text-white font-mono text-xs">{currentCountry.emergencyHotline}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <div>
              © 2026 SafePaw Platform. All clinical and service provider credentials strictly accredited.
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-teal-400/80">Privacy Policy</span>
              <span>·</span>
              <span className="text-teal-400/80">Terms of Service</span>
              <span>·</span>
              <span className="text-teal-400/80">Veterinary Ethics Code</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
