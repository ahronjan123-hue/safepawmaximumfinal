import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RateProviderModal } from '../modals/RateProviderModal';
import {
  Send,
  Paperclip,
  Image,
  Shield,
  Phone,
  FileText,
  Sparkles,
  MessageSquare,
  Building,
  Plus,
  X,
  CheckCircle,
  Star,
  Calendar,
  Clock,
} from 'lucide-react';

export const MessagingView: React.FC = () => {
  const {
    conversations,
    sendMessage,
    selectedPet,
    pets,
    clinics,
    startOrGetConversationWithClinic,
    currentCountry,
  } = useApp();

  const [activeConvId, setActiveConvId] = useState<string>(
    conversations[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ type: 'image' | 'record'; name: string } | null>(null);
  const [clinicPickerOpen, setClinicPickerOpen] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [selectedPetForChat, setSelectedPetForChat] = useState<string>(selectedPet?.id || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keep active conversation synced
  useEffect(() => {
    if (!activeConvId && conversations.length > 0) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    if (activeConv) {
      sendMessage(activeConv.id, inputText.trim() || 'Attached document', attachedFile || undefined);
      setInputText('');
      setAttachedFile(null);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputText(promptText);
  };

  const handleStartConversation = (clinicId: string) => {
    const targetPetId = selectedPetForChat || selectedPet?.id || (pets[0]?.id || 'general');
    const newId = startOrGetConversationWithClinic(clinicId, targetPetId);
    setActiveConvId(newId);
    setClinicPickerOpen(false);
  };

  const activePetName = activeConv?.petName || selectedPet?.name || 'Buddy';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Direct Veterinary Messaging Portal
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time direct communication with attending veterinarians and clinic desks across {currentCountry.name}.
          </p>
        </div>
        <button
          onClick={() => setClinicPickerOpen(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Message a Clinic</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden h-[680px] grid grid-cols-1 md:grid-cols-3">
        {/* Left Column: Conversations List */}
        <div className="border-r border-stone-200 flex flex-col h-full bg-stone-50/50">
          <div className="p-4 border-b border-stone-200 bg-white flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase text-stone-500">Clinic Inboxes</h2>
              <div className="text-[11px] text-stone-400 mt-0.5">Encrypted Direct Channels</div>
            </div>
            <span className="text-[10px] bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded-full">
              {conversations.length} Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {conversations.length > 0 ? (
              conversations.map((conv) => {
                const isSelected = conv.id === activeConv?.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-4 cursor-pointer transition flex items-start gap-3 ${
                      isSelected ? 'bg-white border-l-4 border-l-teal-600 shadow-xs' : 'hover:bg-white/80'
                    }`}
                  >
                    <img
                      src={conv.clinicAvatar}
                      alt={conv.clinicName}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-stone-900 truncate">{conv.clinicName}</h4>
                        <span className="text-[10px] text-stone-400 whitespace-nowrap">{conv.lastTimestamp}</span>
                      </div>
                      <div className="text-[10px] text-teal-700 font-medium mt-0.5">Patient: {conv.petName}</div>
                      <p className="text-xs text-stone-500 truncate mt-1">
                        {conv.lastMessage || 'Channel active'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-stone-400 space-y-2">
                <Building className="w-8 h-8 mx-auto text-stone-300" />
                <p className="font-semibold text-stone-600">No Clinic Chats Yet</p>
                <p className="text-[11px]">Click below to open a direct channel with any accredited hospital.</p>
              </div>
            )}
          </div>

          {/* Start New Thread button */}
          <div className="p-3 border-t border-stone-200 bg-white">
            <button
              onClick={() => setClinicPickerOpen(true)}
              className="w-full py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-teal-700" />
              <span>Message Another Clinic</span>
            </button>
          </div>
        </div>

        {/* Right Column: Chat Window (2 cols) */}
        <div className="md:col-span-2 flex flex-col h-full bg-white">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={activeConv.clinicAvatar}
                    alt={activeConv.clinicName}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs sm:text-sm font-bold text-stone-900 truncate">{activeConv.clinicName}</h3>
                      <Shield className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    </div>
                    <p className="text-[11px] text-stone-500 truncate">
                      Attending Desk · Patient: <strong>{activeConv.petName}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Rate Clinic CTA button */}
                  <button
                    onClick={() => setRateModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition cursor-pointer shadow-xs"
                    title="Rate and review this service provider"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>Rate Provider</span>
                  </button>

                  <a
                    href={`tel:${currentCountry.emergencyHotline.replace(/\D/g, '')}`}
                    className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition"
                    title="Direct Phone Line"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/30">
                <div className="text-center my-2">
                  <span className="text-[10px] uppercase font-semibold text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
                    End-to-End Real-Time Veterinary Channel
                  </span>
                </div>

                {activeConv.messages.length > 0 ? (
                  activeConv.messages.map((msg) => {
                    const isMe = msg.sender === 'user';
                    const isAppointment =
                      msg.text.includes('Appointment Request') ||
                      msg.text.includes('Appointment Confirmed') ||
                      msg.text.includes('📅') ||
                      msg.text.includes('✅ Appointment') ||
                      msg.attachment?.type === 'record';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        {isAppointment ? (
                          <div
                            className={`max-w-[90%] sm:max-w-[78%] p-4 rounded-2xl text-xs space-y-2.5 shadow-md border ${
                              isMe
                                ? 'bg-teal-700 text-white border-teal-600 rounded-br-xs'
                                : 'bg-white border-teal-200 text-stone-800 rounded-bl-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between border-b pb-2 border-stone-200/40">
                              <div className="flex items-center gap-1.5 font-bold">
                                <Calendar className="w-4 h-4 text-amber-400" />
                                <span>Appointment Event</span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isMe ? 'bg-teal-800 text-teal-200' : 'bg-teal-50 text-teal-800 border border-teal-200'
                              }`}>
                                {msg.text.includes('Confirmed') ? 'Confirmed' : 'Requested'}
                              </span>
                            </div>

                            <p className="leading-relaxed font-medium">{msg.text}</p>

                            <div className="flex items-center justify-between pt-1 text-[11px] opacity-90">
                              <span>Patient: <strong>{activeConv.petName}</strong></span>
                              <span>Live Status Synced</span>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-teal-600 text-white rounded-br-xs shadow-xs'
                                : 'bg-white border border-stone-200 text-stone-800 rounded-bl-xs shadow-xs'
                            }`}
                          >
                            {msg.attachment && (
                              <div
                                className={`mb-2 p-2 rounded-lg flex items-center gap-2 text-[11px] ${
                                  isMe ? 'bg-teal-700 text-teal-100' : 'bg-stone-100 text-stone-700'
                                }`}
                              >
                                <FileText className="w-4 h-4" />
                                <span className="font-medium truncate">{msg.attachment.name}</span>
                              </div>
                            )}
                            <p>{msg.text}</p>
                          </div>
                        )}
                        <span className="text-[10px] text-stone-400 mt-1 px-1">
                          {msg.timestamp}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-stone-400 text-xs space-y-1">
                    <p className="font-semibold text-stone-600">Start of conversation with {activeConv.clinicName}</p>
                    <p className="text-[11px]">Type your inquiry below to connect with veterinary staff in real time.</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Clinical Prompts */}
              <div className="px-4 py-2 border-t border-stone-100 bg-white flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-stone-400 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Quick Ask:
                </span>
                <button
                  onClick={() => handleQuickPrompt(`📅 Appointment Request: Wellness Physical Exam for ${activePetName} on ${new Date(Date.now() + 86400000).toISOString().split('T')[0]} at 10:00 AM. Total: $14.00.`)}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-semibold rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1"
                >
                  <Calendar className="w-3 h-3 text-amber-600" />
                  <span>Send Appointment Request</span>
                </button>
                <button
                  onClick={() => handleQuickPrompt(`Checking on ${activePetName}'s post-vaccine hydration and recovery status.`)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg whitespace-nowrap transition cursor-pointer"
                >
                  Post-vaccine status
                </button>
                <button
                  onClick={() => handleQuickPrompt(`Could we request an authorized prescription refill for ${activePetName}?`)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg whitespace-nowrap transition cursor-pointer"
                >
                  Prescription refill
                </button>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-stone-200 bg-white">
                {attachedFile && (
                  <div className="mb-2 p-2 bg-stone-100 border border-stone-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-stone-700">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span className="font-medium">{attachedFile.name}</span>
                    </div>
                    <button
                      onClick={() => setAttachedFile(null)}
                      className="text-stone-400 hover:text-stone-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAttachedFile({ type: 'record', name: `${activePetName}-Vaccination-Certificate.pdf` })}
                    className="p-2.5 text-stone-400 hover:text-teal-700 hover:bg-stone-100 rounded-xl transition cursor-pointer shrink-0"
                    title="Attach Health Record"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${activeConv.clinicName} re: ${activePetName}...`}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-teal-600 focus:bg-white"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() && !attachedFile}
                    className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl transition cursor-pointer shadow-xs shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-stone-400 text-xs">
              Select or open a clinic conversation from the left to begin messaging.
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: PICK CLINIC TO START CHAT */}
      {clinicPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-stone-900">Message a Verified Clinic</h3>
              </div>
              <button
                onClick={() => setClinicPickerOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {pets.length > 0 && (
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1.5">
                  Select Patient Pet for Inquiry:
                </label>
                <select
                  value={selectedPetForChat}
                  onChange={(e) => setSelectedPetForChat(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-semibold focus:outline-hidden focus:border-teal-500"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species} · {p.breed})
                    </option>
                  ))}
                  <option value="general">General Inquiries / No specific pet</option>
                </select>
              </div>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {clinics.map((clinic) => (
                <div
                  key={clinic.id}
                  onClick={() => handleStartConversation(clinic.id)}
                  className="p-3 rounded-2xl border border-stone-200 hover:border-teal-500 hover:bg-teal-50/40 transition cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={clinic.image}
                      alt={clinic.name}
                      className="w-11 h-11 rounded-xl object-cover shrink-0 border border-stone-200"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 group-hover:text-teal-900 truncate">
                        {clinic.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 truncate">{clinic.address}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-400">
                        <span>★ {clinic.rating}</span>
                        <span>·</span>
                        <span className="text-teal-700 font-medium">
                          {clinic.emergencyAvailable ? '24/7 Emergency Active' : 'Regular Clinical Hours'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold shrink-0 group-hover:bg-teal-700">
                    Open Chat
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setClinicPickerOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RATE PROVIDER MODAL */}
      {activeConv && (
        <RateProviderModal
          isOpen={rateModalOpen}
          onClose={() => setRateModalOpen(false)}
          providerId={activeConv.clinicId}
          providerName={activeConv.clinicName}
          petName={activeConv.petName}
        />
      )}
    </div>
  );
};
