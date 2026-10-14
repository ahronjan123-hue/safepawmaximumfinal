import React, { useState, useEffect } from 'react';
import { ProviderServiceType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building,
  Clock,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Save,
  CheckCircle,
  Shield,
  Activity,
  Scissors,
  Home,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface ProviderSettingsViewProps {
  providerType: ProviderServiceType;
  businessName: string;
  onShowToast: (msg: string) => void;
  formatPrice: (amountUSD: number) => string;
}

export const ProviderSettingsView: React.FC<ProviderSettingsViewProps> = ({
  providerType,
  businessName: initialBusinessName,
  onShowToast,
  formatPrice,
}) => {
  const { profile, updateProfileDetails } = useAuth();
  const { clinics, updateClinic } = useApp();

  const localSavedKey = `safepaw_provider_settings_${providerType}`;

  // Read any previously cached settings
  const getCachedSettings = () => {
    try {
      const saved = localStorage.getItem(localSavedKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  };
  const cached = getCachedSettings();

  const defaultFacilityName =
    profile?.businessName ||
    profile?.clinicName ||
    cached?.businessName ||
    cached?.facilityName ||
    initialBusinessName;

  const defaultPhone =
    profile?.phone ||
    cached?.phone ||
    (providerType === 'veterinary_clinic'
      ? '(02) 8531-1581'
      : providerType === 'grooming_salon'
      ? '+63 917 889 0012'
      : '+63 918 223 9011');

  const defaultAddress =
    profile?.address ||
    cached?.address ||
    (providerType === 'veterinary_clinic'
      ? '63 Maysilo Circle, Plainview, Mandaluyong City, Metro Manila'
      : providerType === 'grooming_salon'
      ? 'Level 2, Bonifacio High Street, BGC, Taguig City'
      : 'Barangay Loyola Heights, Quezon City, Metro Manila');

  const defaultHours =
    profile?.hours ||
    cached?.hours ||
    'Mon - Sun: 08:00 AM - 08:00 PM (24/7 Trauma Service)';

  const defaultEmergency =
    profile?.emergencyAvailable ?? cached?.emergencyAvailable ?? true;

  const initialServices =
    profile?.services ||
    cached?.services ||
    (providerType === 'veterinary_clinic'
      ? [
          { name: 'Comprehensive Health & Wellness Examination', priceUSD: 25, active: true },
          { name: 'Core DHPPi + Rabies Vaccination & Passport Seal', priceUSD: 30, active: true },
          { name: 'Emergency Trauma Triage & Resuscitation', priceUSD: 65, active: true },
          { name: 'Routine Spay / Neuter Surgical Procedure', priceUSD: 90, active: true },
          { name: 'Digital Radiography (2-View X-Ray Series)', priceUSD: 45, active: true },
        ]
      : providerType === 'grooming_salon'
      ? [
          { name: 'Full Luxury Spa Grooming (Haircut, Bath, Nails)', priceUSD: 45, active: true },
          { name: 'Medicated Flea, Tick & Oatmeal Skin Treatment Bath', priceUSD: 35, active: true },
          { name: 'Furminator De-shedding & Undercoat Blast', priceUSD: 38, active: true },
          { name: 'Hygienic Sanitary Trim & Paw Pad Shave', priceUSD: 20, active: true },
          { name: 'Teeth Brushing & Refreshing Breath Foam', priceUSD: 12, active: true },
        ]
      : [
          { name: 'Adoption Processing, Microchipping & Health Certificate', priceUSD: 35, active: true },
          { name: 'Emergency Stray Rescue & Ambulance Dispatch', priceUSD: 0, active: true },
          { name: 'Post-Adoption Rabies Booster & Wellness Review', priceUSD: 15, active: true },
          { name: 'Foster Starter Kit (Formula, Carrier & Blankets)', priceUSD: 0, active: true },
        ]);

  // Controlled form state
  const [facilityName, setFacilityName] = useState(defaultFacilityName);
  const [phone, setPhone] = useState(defaultPhone);
  const [address, setAddress] = useState(defaultAddress);
  const [hours, setHours] = useState(defaultHours);
  const [emergencyAvailable, setEmergencyAvailable] = useState(defaultEmergency);
  const [services, setServices] = useState<{ name: string; priceUSD: number; active: boolean }[]>(initialServices);

  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('20');
  const [showAddService, setShowAddService] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if profile changes externally
  useEffect(() => {
    if (profile?.businessName && profile.businessName !== facilityName) {
      setFacilityName(profile.businessName);
    }
  }, [profile?.businessName]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const cleanFacilityName = facilityName.trim() || initialBusinessName;
    const cleanPhone = phone.trim() || defaultPhone;
    const cleanAddress = address.trim() || defaultAddress;
    const cleanHours = hours.trim() || defaultHours;

    const payload = {
      businessName: cleanFacilityName,
      clinicName: cleanFacilityName,
      phone: cleanPhone,
      address: cleanAddress,
      hours: cleanHours,
      emergencyAvailable,
      services,
      fullName: `${cleanFacilityName.split(' ')[0]} Management`,
    };

    // 1. Update Auth profile (synchronously updates user profile across dashboard and UI)
    await updateProfileDetails(payload);

    // 2. Synchronize AppContext matching clinic
    const matchingClinic = clinics.find(
      (c) =>
        c.id === profile?.clinicId ||
        (providerType === 'veterinary_clinic' && c.id === '00000000-0000-0000-0000-000000000001') ||
        (providerType === 'grooming_salon' && c.id === 'provider-grooming-01') ||
        (providerType === 'rescue_shelter' && c.id === 'provider-shelter-01')
    );
    if (matchingClinic) {
      updateClinic(matchingClinic.id, {
        name: cleanFacilityName,
        phone: cleanPhone,
        address: cleanAddress,
        hours: cleanHours,
        emergencyAvailable,
      });
    }

    // 3. Save backup payload to local storage
    try {
      localStorage.setItem(localSavedKey, JSON.stringify(payload));
    } catch (err) {
      console.warn('Could not save provider settings cache', err);
    }

    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 5000);

    onShowToast(`"${cleanFacilityName}" profile and service rates saved successfully!`);
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const price = Math.max(0, parseFloat(newServicePrice) || 0);
    setServices((prev) => [
      ...prev,
      { name: newServiceName.trim(), priceUSD: price, active: true },
    ]);
    setNewServiceName('');
    setNewServicePrice('20');
    setShowAddService(false);
    onShowToast(`Added new service: "${newServiceName.trim()}"`);
  };

  const handleRemoveService = (index: number) => {
    const target = services[index];
    setServices((prev) => prev.filter((_, i) => i !== index));
    onShowToast(`Removed service: "${target?.name}"`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="border-b border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-400" />
            <span>
              {providerType === 'veterinary_clinic' && 'Veterinary Clinic Facility Profile & Service Catalog'}
              {providerType === 'grooming_salon' && 'Spa & Grooming Salon Settings & Operating Hours'}
              {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && 'Rescue Organization Profile & Adoption Fee Structure'}
            </span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Configure public directory listing, operating schedule, emergency hotline, and bookable service prices.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Changes Saved Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Basic Facility Information */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-400" />
              <span>Facility Information</span>
            </h3>
            <span className="text-[11px] text-teal-400 font-mono">Real-time sync active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-stone-300 mb-1 font-semibold">
                Business / Facility Name: <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                placeholder="e.g. Greenwood Animal Hospital & Wellness Center"
                className="w-full bg-stone-900 border border-stone-700 hover:border-stone-600 rounded-xl px-3.5 py-2.5 text-white placeholder-stone-500 focus:outline-hidden focus:border-teal-400 transition"
              />
              <span className="text-[10px] text-stone-500 mt-1 block">
                Displayed on your public profile, client bookings, and top portal navigation.
              </span>
            </div>

            <div>
              <label className="block text-stone-300 mb-1 font-semibold">Contact Phone / Hotline:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. (02) 8531-1581"
                className="w-full bg-stone-900 border border-stone-700 hover:border-stone-600 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-stone-500 focus:outline-hidden focus:border-teal-400 transition"
              />
              <span className="text-[10px] text-stone-500 mt-1 block">
                Direct phone number for appointment confirmations & emergency dispatch.
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone-300 mb-1 font-semibold">Physical Location / Address:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 63 Maysilo Circle, Plainview, Mandaluyong City, Metro Manila"
                className="w-full bg-stone-900 border border-stone-700 hover:border-stone-600 rounded-xl px-3.5 py-2.5 text-white placeholder-stone-500 focus:outline-hidden focus:border-teal-400 transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone-300 mb-1 font-semibold">Operating Hours & Coverage:</label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g. Mon - Sun: 08:00 AM - 08:00 PM (24/7 Trauma Service)"
                className="w-full bg-stone-900 border border-stone-700 hover:border-stone-600 rounded-xl px-3.5 py-2.5 text-white placeholder-stone-500 focus:outline-hidden focus:border-teal-400 transition"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-stone-900">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>24/7 Emergency Triage & Hotline Available</span>
                {emergencyAvailable && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                    Active
                  </span>
                )}
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">
                Accept urgent trauma calls and emergency patient arrivals after regular hours
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEmergencyAvailable(!emergencyAvailable)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shadow-sm ${
                emergencyAvailable ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950' : 'bg-stone-800 hover:bg-stone-700 text-stone-400'
              }`}
            >
              {emergencyAvailable ? 'Active' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Services & Pricing Catalog */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-teal-400" />
                <span>Service Catalog & Base Pricing</span>
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Toggle availability, edit service prices, or add new procedure offerings.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddService(!showAddService)}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-teal-300 border border-teal-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Service</span>
            </button>
          </div>

          {/* Add service inline sub-form */}
          {showAddService && (
            <div className="p-4 rounded-2xl bg-stone-900/90 border border-teal-500/30 space-y-3 animate-fadeIn">
              <div className="text-xs font-bold text-teal-300">Add New Service Offering</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-stone-400 mb-1">Service / Procedure Name:</label>
                  <input
                    type="text"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="e.g. Pediatric Kitten Health Package"
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Base Price (USD):</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-teal-400"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddService(false)}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold hover:bg-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddService}
                  className="px-4 py-1.5 rounded-xl bg-teal-500 text-stone-950 text-xs font-bold hover:bg-teal-400 cursor-pointer shadow-sm"
                >
                  Confirm Service
                </button>
              </div>
            </div>
          )}

          {/* Service items list */}
          <div className="space-y-3">
            {services.map((svc, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800/80 hover:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      svc.active ? 'bg-teal-400' : 'bg-stone-600'
                    }`}
                  />
                  <input
                    type="text"
                    value={svc.name}
                    onChange={(e) => {
                      const updated = [...services];
                      updated[idx].name = e.target.value;
                      setServices(updated);
                    }}
                    className="bg-transparent font-medium text-white truncate focus:outline-hidden focus:bg-stone-950 px-1 py-0.5 rounded w-full"
                    title="Click to rename service"
                  />
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  {/* Price input field */}
                  <div className="flex items-center gap-1 bg-stone-950 px-2.5 py-1.5 rounded-xl border border-stone-800">
                    <span className="text-stone-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={svc.priceUSD}
                      onChange={(e) => {
                        const val = Math.max(0, parseFloat(e.target.value) || 0);
                        const updated = [...services];
                        updated[idx].priceUSD = val;
                        setServices(updated);
                      }}
                      className="w-14 bg-transparent text-white font-mono font-bold text-xs focus:outline-hidden text-right"
                      title="Edit base price in USD"
                    />
                    <span className="text-[10px] text-stone-500 font-mono">
                      ≈ {formatPrice(svc.priceUSD)}
                    </span>
                  </div>

                  {/* Toggle Active Status */}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...services];
                      updated[idx].active = !updated[idx].active;
                      setServices(updated);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition ${
                      svc.active
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30'
                        : 'bg-stone-800 text-stone-400 border border-stone-700 hover:bg-stone-700'
                    }`}
                  >
                    {svc.active ? 'Offered' : 'Paused'}
                  </button>

                  {/* Delete custom service */}
                  <button
                    type="button"
                    onClick={() => handleRemoveService(idx)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                    title="Remove service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save button bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-stone-400">
            {isSaved ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                All provider details saved and updated across the portal!
              </span>
            ) : (
              <span>Remember to save your changes to update all client bookings & headers.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-stone-950 text-xs font-black transition flex items-center gap-2 shadow-xl hover:shadow-teal-500/20 cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                <span>Saving Configuration...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Provider Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
