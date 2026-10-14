import React, { useState, useEffect } from 'react';
import { ProviderServiceType, Conversation, Pet } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PatientChartModal } from '../modals/PatientChartModal';
import {
  MessageSquare,
  Search,
  Send,
  CheckCheck,
  Calendar,
  Clock,
  Sparkles,
  User,
  Shield,
  Stethoscope,
  Scissors,
  Home,
  CheckCircle2,
  FileText,
  BadgeCheck,
} from 'lucide-react';

interface ProviderMessagesViewProps {
  providerType: ProviderServiceType;
  onShowToast: (msg: string) => void;
}

export const ProviderMessagesView: React.FC<ProviderMessagesViewProps> = ({
  providerType,
  onShowToast,
}) => {
  const { conversations, sendMessage, pets, appointments, clinics, formatPrice } = useApp();
  const { profile } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [selectedConvId, setSelectedConvId] = useState<string>('');

  // Patient chart modal state
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [chartPet, setChartPet] = useState<Pet | null>(null);

  // Automatically select the first available conversation if none selected
  useEffect(() => {
    if (!selectedConvId && conversations.length > 0) {
      setSelectedConvId(conversations[0].id);
    } else if (selectedConvId && !conversations.some((c) => c.id === selectedConvId) && conversations.length > 0) {
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations, selectedConvId]);

  const getConversationOwner = (conv: Conversation): string => {
    if (conv.ownerName && conv.ownerName !== 'Verified Pet Parent') return conv.ownerName;
    const petAppt = appointments.find(
      (a) => a.petId === conv.petId || a.petName?.toLowerCase() === conv.petName?.toLowerCase()
    );
    if (petAppt?.ownerName) return petAppt.ownerName;
    const pet = pets.find(
      (p) => p.id === conv.petId || p.name?.toLowerCase() === conv.petName?.toLowerCase()
    );
    if (pet?.ownerName) return pet.ownerName;
    if (profile?.role === 'pet_owner' && profile.fullName) return profile.fullName;
    return conv.ownerName || 'Sophia Rodriguez';
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const ownerName = getConversationOwner(c).toLowerCase();
    const petMatch = c.petName?.toLowerCase().includes(q);
    const clinicMatch = c.clinicName?.toLowerCase().includes(q);
    const msgMatch = c.lastMessage?.toLowerCase().includes(q);
    const ownerMatch = ownerName.includes(q);
    return !q || petMatch || clinicMatch || msgMatch || ownerMatch;
  });

  const activeConversation: Conversation | undefined =
    conversations.find((c) => c.id === selectedConvId) || filteredConversations[0] || conversations[0];

  // Find linked appointment for the active conversation
  const linkedAppointment = activeConversation
    ? appointments.find(
        (a) =>
          a.petId === activeConversation.petId ||
          (a.petName?.toLowerCase() === activeConversation.petName?.toLowerCase())
      )
    : undefined;

  const linkedPet = activeConversation
    ? pets.find((p) => p.id === activeConversation.petId || p.name.toLowerCase() === activeConversation.petName.toLowerCase())
    : undefined;

  const guardianName = activeConversation ? getConversationOwner(activeConversation) : 'Sophia Rodriguez';

  const handleOpenChartForPet = () => {
    if (!activeConversation) return;
    const petObj: Pet = linkedPet || {
      id: activeConversation.petId || 'pet-' + activeConversation.id,
      name: activeConversation.petName || 'Patient',
      species: 'Dog',
      breed: 'Companion Pet',
      ageYears: 3,
      birthDate: '2023-04-12',
      gender: 'Male',
      neutered: true,
      weightKg: 14,
      allergies: [],
      chronicConditions: [],
      temperament: 'Calm & cooperative',
      dietaryNotes: 'Standard maintenance diet',
      registeredDate: '2024-01-15',
      microchipId: '985141002341992',
      photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
      ownerName: guardianName,
      ownerPhone: '+63 917 882 1290',
    };
    setChartPet(petObj);
    setIsChartOpen(true);
    onShowToast(`Opened clinical EMR chart for ${petObj.name}`);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConversation) return;

    sendMessage(activeConversation.id, replyText.trim(), undefined, 'clinic');
    setReplyText('');
    onShowToast(`Reply transmitted to pet owner ${guardianName} (re: ${activeConversation.petName})`);
  };

  const senderRoleLabel =
    providerType === 'veterinary_clinic'
      ? (profile?.fullName || 'Attending Clinical Veterinarian')
      : providerType === 'grooming_salon'
      ? 'Lead Stylist & Grooming Team'
      : 'Shelter Sanctuary Coordinator';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title & Description */}
      <div className="border-b border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-400" />
            <span>
              {providerType === 'veterinary_clinic' && 'Clinical Patient Communications & Inquiries'}
              {providerType === 'grooming_salon' && 'Grooming Client Inquiries & Styling Updates'}
              {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && 'Adopter Inquiries & Rescue Support'}
            </span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Two-way real-time messaging between your care facility and registered pet guardians.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-xl text-xs text-stone-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Channel · Replying as <strong>{senderRoleLabel}</strong></span>
        </div>
      </div>

      {/* Main 2-column chat workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-stone-950 rounded-3xl border border-stone-800 overflow-hidden min-h-[620px] shadow-2xl">
        {/* Left: Conversations Thread List (Col 4) */}
        <div className="lg:col-span-4 border-r border-stone-800 p-4 flex flex-col space-y-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pet guardian, patient, or message..."
              className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1 pt-1">
            <span>Conversations ({filteredConversations.length})</span>
            <span className="text-teal-400 font-mono">Live Sync</span>
          </div>

          {/* Thread list */}
          <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[500px] pr-1">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-stone-600" />
                <p>No conversations found.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConversation?.id === conv.id;
                const petAppt = appointments.find((a) => a.petId === conv.petId || a.petName === conv.petName);
                const ownerName = getConversationOwner(conv);
                const initial = ownerName.charAt(0).toUpperCase() || 'O';
                const hasApt = conv.lastMessage?.includes('📅') || conv.lastMessage?.includes('Appointment');

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full text-left p-3 rounded-2xl transition cursor-pointer flex flex-col gap-1 border ${
                      isSelected
                        ? 'bg-teal-950/40 border-teal-500/70 shadow-lg'
                        : 'bg-stone-900/60 border-stone-850 hover:bg-stone-900 hover:border-stone-750'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white truncate block">
                            {ownerName}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono shrink-0">{conv.lastTimestamp || 'Recent'}</span>
                    </div>

                    <div className="text-[11px] text-stone-400 font-medium truncate flex items-center gap-1.5 mt-0.5">
                      <span className="text-teal-300 font-semibold">Pet: {conv.petName}</span>
                      <span className="text-stone-600">·</span>
                      <span className="truncate">{conv.clinicName}</span>
                      {(petAppt || hasApt) && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold shrink-0">
                          Booked
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-stone-400 truncate mt-0.5">
                      {conv.lastMessage || 'Channel established.'}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Window (Col 8) */}
        {activeConversation ? (
          <div className="lg:col-span-8 flex flex-col justify-between p-5 min-w-0 bg-stone-950/70">
            {/* Thread Header */}
            <div className="border-b border-stone-800 pb-3 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-black text-sm shrink-0">
                    {guardianName.charAt(0).toUpperCase() || 'O'}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>{guardianName}</span>
                      <span className="text-[10px] font-bold text-teal-300 bg-teal-950/80 border border-teal-800/80 px-2 py-0.5 rounded-full">
                        Pet Owner
                      </span>
                    </h3>
                    <div className="text-xs text-stone-400 flex items-center gap-1.5 flex-wrap">
                      <span>Patient:</span>
                      <strong className="text-stone-200">{activeConversation.petName}</strong>
                      {linkedPet?.breed && (
                        <span className="text-stone-400">({linkedPet.breed})</span>
                      )}
                      <span className="text-stone-600">·</span>
                      <span>Clinic:</span>
                      <span className="text-teal-300">{activeConversation.clinicName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {/* OPEN CHART CTA in Chat Header */}
                  <button
                    onClick={handleOpenChartForPet}
                    className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Open Patient Chart</span>
                  </button>

                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Pet Owner Direct
                  </span>
                </div>
              </div>

              {/* Linked Appointment Banner if present */}
              {linkedAppointment && (
                <div className="p-2.5 rounded-xl bg-teal-950/50 border border-teal-800/60 flex items-center justify-between text-xs text-teal-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>
                      <strong>Appointment Acquired:</strong> {linkedAppointment.date} at {linkedAppointment.time} · {linkedAppointment.serviceName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold capitalize px-2 py-0.5 rounded bg-teal-900 border border-teal-700 text-teal-200 shrink-0">
                      {linkedAppointment.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={handleOpenChartForPet}
                      className="text-[11px] font-bold text-teal-300 hover:underline cursor-pointer"
                    >
                      View Chart →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 max-h-[380px] min-h-[300px] pr-1">
              {activeConversation.messages.length === 0 ? (
                <div className="text-center py-12 text-stone-500 text-xs space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-stone-600" />
                  <p>Direct channel opened. Send a message to start communicating with the guardian.</p>
                </div>
              ) : (
                activeConversation.messages.map((m) => {
                  const isFromClinic = m.sender === 'clinic';
                  const isAppointment =
                    m.text.includes('Appointment Request') ||
                    m.text.includes('Appointment Confirmed') ||
                    m.text.includes('📅') ||
                    m.text.includes('✅ Appointment') ||
                    m.attachment?.type === 'record';

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isFromClinic ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-semibold text-stone-400">
                          {isFromClinic ? `${senderRoleLabel} (You)` : `${guardianName} (Pet Owner)`}
                        </span>
                        <span className="text-[9px] text-stone-500 font-mono">{m.timestamp}</span>
                      </div>

                      {/* Message Bubble (Interactive appointment card or standard message) */}
                      {isAppointment ? (
                        <div
                          className={`max-w-[90%] sm:max-w-[78%] rounded-2xl p-4 text-xs shadow-xl space-y-2.5 ${
                            isFromClinic
                              ? 'bg-teal-950/80 border-2 border-teal-500/60 text-white rounded-br-xs'
                              : 'bg-stone-900/90 border-2 border-amber-500/50 text-stone-100 rounded-bl-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
                            <div className="flex items-center gap-2 font-extrabold text-teal-300">
                              <Calendar className="w-4 h-4 text-teal-400" />
                              <span>Clinical Appointment Event</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                              {m.text.includes('Confirmed') ? 'Confirmed' : 'Requested'}
                            </span>
                          </div>

                          <p className="text-stone-200 leading-relaxed font-medium">{m.text}</p>

                          <div className="flex items-center justify-between pt-1 text-[11px]">
                            <span className="text-stone-400">
                              Patient: <strong className="text-white">{activeConversation.petName}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={handleOpenChartForPet}
                              className="px-2.5 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Open Chart</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-md ${
                            isFromClinic
                              ? 'bg-teal-600 text-white rounded-br-xs'
                              : 'bg-stone-900 text-stone-100 border border-stone-800 rounded-bl-xs'
                          }`}
                        >
                          {m.text}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Professional Quick Reply Suggestions */}
            <div className="pt-2 px-1 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-stone-400 shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-400" /> Quick Templates:
              </span>
              <button
                type="button"
                onClick={() =>
                  setReplyText(
                    `We have reviewed and confirmed your appointment for ${activeConversation.petName}. Please ensure ${activeConversation.petName} has fasted 2 hours prior to the visit if bloodwork or sedation is scheduled.`
                  )
                }
                className="px-2.5 py-1 bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 rounded-lg whitespace-nowrap transition cursor-pointer"
              >
                Confirm Appointment & Instructions
              </button>
              <button
                type="button"
                onClick={() =>
                  setReplyText(
                    `Good day! We received your request. The attending veterinary team is currently prepping the examination room. Please check in at reception 10 minutes prior.`
                  )
                }
                className="px-2.5 py-1 bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 rounded-lg whitespace-nowrap transition cursor-pointer"
              >
                Reception Check-in Notice
              </button>
              <button
                type="button"
                onClick={() =>
                  setReplyText(
                    `Thank you for reaching out! We have noted ${activeConversation.petName}'s recent symptoms and our attending practitioner will examine them thoroughly during the consultation.`
                  )
                }
                className="px-2.5 py-1 bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 rounded-lg whitespace-nowrap transition cursor-pointer"
              >
                Acknowledge Symptoms
              </button>
            </div>

            {/* Reply Composer Form */}
            <form onSubmit={handleSendReply} className="pt-3 border-t border-stone-800 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Write your professional reply to pet owner ${guardianName}...`}
                  className="flex-1 bg-stone-900 border border-stone-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-stone-950 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reply</span>
                </button>
              </div>
              <div className="text-[10px] text-stone-500 flex items-center justify-between px-1">
                <span>Direct response delivered to pet guardian's messages inbox.</span>
                <span className="text-teal-400">Press Enter or click Send Reply</span>
              </div>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-8 flex items-center justify-center p-12 text-stone-500 text-xs">
            Select a conversation to begin messaging.
          </div>
        )}
      </div>

      {/* PATIENT CHART MODAL */}
      <PatientChartModal
        isOpen={isChartOpen}
        onClose={() => {
          setIsChartOpen(false);
          setChartPet(null);
        }}
        pet={chartPet}
        appointment={linkedAppointment}
        onShowToast={onShowToast}
      />
    </div>
  );
};
