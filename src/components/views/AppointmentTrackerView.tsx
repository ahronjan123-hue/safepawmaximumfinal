import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppointmentStatus, Appointment } from '../../types';
import {
  Clock,
  CheckCircle,
  MapPin,
  Phone,
  Video,
  Sparkles,
  MessageSquare,
  Calendar,
  Star,
  CreditCard,
  AlertTriangle,
  X,
  FileText,
  DollarSign,
  ArrowRight,
  Shield,
  RotateCcw,
} from 'lucide-react';

export const AppointmentTrackerView: React.FC = () => {
  const {
    appointments,
    updateAppointmentStatus,
    rescheduleAppointment,
    cancelAppointment,
    selectedPet,
    setCurrentTab,
    startOrGetConversationWithClinic,
    formatPrice,
    currentCountry,
    addReview,
    payForAppointment,
  } = useApp();

  const [mainView, setMainView] = useState<'tracker' | 'bookings'>('tracker');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [videoConnected, setVideoConnected] = useState(false);

  // Online Payment Modal State
  const [payingAppointment, setPayingAppointment] = useState<Appointment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'gcash' | 'paypal'>('card');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8812');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState(false);

  // Review & Rating Modal State
  const [reviewingAppointment, setReviewingAppointment] = useState<Appointment | null>(null);
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSuccessToast, setReviewSuccessToast] = useState(false);

  // Reschedule Modal State
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('Next Monday');
  const [newTime, setNewTime] = useState('11:00 AM');

  // Filter pet appointments
  const currentPetAppointments = appointments.filter((a) => !selectedPet || a.petId === selectedPet.id);

  const activeAppointment =
    currentPetAppointments.find(
      (a) => a.status === 'in_consultation' || a.status === 'checked_in' || a.status === 'prescriptions_ready'
    ) ||
    currentPetAppointments.find((a) => a.status === 'scheduled') ||
    appointments.find((a) => a.status === 'scheduled') ||
    appointments[0];

  const getStatusStepIndex = (status: AppointmentStatus): number => {
    switch (status) {
      case 'scheduled':
        return 1;
      case 'checked_in':
        return 2;
      case 'in_consultation':
        return 3;
      case 'prescriptions_ready':
        return 4;
      case 'completed':
        return 5;
      default:
        return 1;
    }
  };

  const currentStep = activeAppointment ? getStatusStepIndex(activeAppointment.status) : 1;

  const STEPS = [
    {
      num: 1,
      id: 'scheduled',
      title: 'Appointment Scheduled',
      desc: 'Booking verified by clinic system',
    },
    {
      num: 2,
      id: 'checked_in',
      title: 'Checked-In at Reception',
      desc: 'Patient arrival confirmed; vitals taken',
    },
    {
      num: 3,
      id: 'in_consultation',
      title: 'In Consultation Room',
      desc: 'Veterinarian exam & diagnostics active',
    },
    {
      num: 4,
      id: 'prescriptions_ready',
      title: 'Prescriptions & Aftercare Ready',
      desc: 'Medications filled at clinic pharmacy',
    },
    {
      num: 5,
      id: 'completed',
      title: 'Visit Completed',
      desc: 'Records updated in Pet Health Passport',
    },
  ];

  const handleSimulateStatus = (status: AppointmentStatus) => {
    if (activeAppointment) {
      updateAppointmentStatus(activeAppointment.id, status);
    }
  };

  const handleOpenChat = () => {
    if (activeAppointment) {
      startOrGetConversationWithClinic(activeAppointment.clinicId, activeAppointment.petId);
      setCurrentTab('messages');
    }
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingAppointment) return;

    setIsProcessingPayment(true);
    setTimeout(() => {
      payForAppointment(payingAppointment.id, paymentMethod);
      setIsProcessingPayment(false);
      setPaymentSuccessToast(true);
      setTimeout(() => {
        setPaymentSuccessToast(false);
        setPayingAppointment(null);
      }, 2000);
    }, 1200);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingAppointment) return;

    addReview({
      providerId: reviewingAppointment.clinicId,
      bookingId: reviewingAppointment.id,
      authorName: reviewingAppointment.ownerName || 'Sophia Rodriguez',
      petName: reviewingAppointment.petName,
      rating: ratingStars,
      comment: reviewText.trim() || 'Excellent service and attentive care for our pet.',
      serviceName: reviewingAppointment.serviceName,
    });

    setReviewSuccessToast(true);
    setTimeout(() => {
      setReviewSuccessToast(false);
      setReviewingAppointment(null);
      setReviewText('');
    }, 2000);
  };

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingAppointment) return;

    rescheduleAppointment(reschedulingAppointment.id, newDate, newTime);
    setReschedulingAppointment(null);
  };

  const filteredBookingsList = appointments.filter((apt) => {
    if (bookingFilter === 'upcoming') {
      return (
        apt.status === 'requested' ||
        apt.status === 'scheduled' ||
        apt.status === 'checked_in' ||
        apt.status === 'in_consultation' ||
        apt.status === 'prescriptions_ready'
      );
    }
    if (bookingFilter === 'completed') {
      return apt.status === 'completed';
    }
    if (bookingFilter === 'cancelled') {
      return apt.status === 'cancelled' || apt.status === 'declined';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Bookings & Live Visit Tracking
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Track real-time clinical consultation status, manage upcoming & past bookings, process online payment, and submit reviews.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200 self-start sm:self-auto">
          <button
            onClick={() => setMainView('tracker')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              mainView === 'tracker'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Live Stage Tracker
          </button>
          <button
            onClick={() => setMainView('bookings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              mainView === 'bookings'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>My Bookings</span>
            <span className="px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
              {appointments.length}
            </span>
          </button>
        </div>
      </div>

      {mainView === 'tracker' && (
        <>
          {!activeAppointment ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
              <Calendar className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="text-base font-bold text-stone-800">No active appointment today</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Schedule a consultation, grooming, or checkup with an accredited clinic to activate live queue tracking.
              </p>
              <button
                onClick={() => setCurrentTab('book')}
                className="px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-teal-700 transition cursor-pointer"
              >
                Book Appointment Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Live Progress Timeline */}
              <div className="lg:col-span-2 space-y-6">
                {/* Active Appointment Header Banner */}
                <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-stone-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-800 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                          {activeAppointment.serviceName}
                        </span>
                        {activeAppointment.status === 'requested' && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                            <Clock className="w-3 h-3 animate-pulse" />
                            <span>Pending Provider Approval</span>
                          </span>
                        )}
                        {activeAppointment.paymentStatus === 'paid' ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            Paid Online ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => setPayingAppointment(activeAppointment)}
                            className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold hover:bg-amber-400 transition cursor-pointer"
                          >
                            Pay Online ({formatPrice(activeAppointment.baseCostUSD)})
                          </button>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                        {activeAppointment.petName} · {activeAppointment.clinicName}
                      </h2>
                      <p className="text-xs text-stone-400 mt-1">
                        Attending Doctor: <strong className="text-stone-200">{activeAppointment.vetName}</strong> · Scheduled: {activeAppointment.date} at {activeAppointment.time}
                      </p>
                      {activeAppointment.status === 'requested' && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                          <div>
                            <strong className="text-amber-300 block font-bold">Appointment Request Submitted — Awaiting Confirmation</strong>
                            <span className="text-[11px] text-amber-200/90">
                              Your request has been dispatched to <strong>{activeAppointment.clinicName}</strong>. The provider received a notification and will confirm your booking.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-end gap-2">
                      <button
                        onClick={() => setReschedulingAppointment(activeAppointment)}
                        className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition cursor-pointer"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => cancelAppointment(activeAppointment.id)}
                        className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-rose-900/60 hover:text-rose-200 text-stone-300 text-xs font-semibold border border-stone-700 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Quick Simulation / Status Preview */}
                  <div className="pt-4 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[11px] text-stone-400 font-mono">Stage Simulator:</span>
                    {(['scheduled', 'checked_in', 'in_consultation', 'prescriptions_ready', 'completed'] as AppointmentStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleSimulateStatus(st)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                          activeAppointment.status === st
                            ? 'bg-teal-500 text-stone-950'
                            : 'bg-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5-Step Timeline Card */}
                <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">
                    Live Visit Progress & Queue
                  </h3>

                  <div className="space-y-6 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
                    {STEPS.map((step) => {
                      const isCompleted = step.num < currentStep;
                      const isCurrent = step.num === currentStep;

                      return (
                        <div key={step.id} className="relative flex items-start gap-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 transition-all ${
                              isCompleted
                                ? 'bg-emerald-500 text-white'
                                : isCurrent
                                ? 'bg-teal-600 text-white ring-4 ring-teal-100 animate-pulse'
                                : 'bg-stone-200 text-stone-500'
                            }`}
                          >
                            {isCompleted ? <CheckCircle className="w-4 h-4" /> : step.num}
                          </div>

                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center justify-between">
                              <h4
                                className={`text-sm font-bold ${
                                  isCurrent ? 'text-teal-900 font-black' : isCompleted ? 'text-stone-800' : 'text-stone-400'
                                }`}
                              >
                                {step.title}
                              </h4>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold uppercase tracking-wide">
                                  Current Stage
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Col: Video & Contact Desk */}
              <div className="space-y-6">
                {activeAppointment.isTelehealth && (
                  <div className="bg-teal-950 text-white rounded-3xl p-6 shadow-md border border-teal-900 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-5 h-5 text-teal-400" />
                        <h3 className="text-sm font-bold">Telehealth Video Session</h3>
                      </div>
                      <span className="text-[10px] bg-teal-800 text-teal-200 px-2 py-0.5 rounded font-mono">
                        HD Stream
                      </span>
                    </div>
                    <p className="text-xs text-teal-200">
                      Encrypted consultation room active. Keep {activeAppointment.petName} calm in a well-lit area.
                    </p>
                    {videoConnected ? (
                      <div className="p-3 bg-teal-900 rounded-xl border border-teal-700 text-teal-100 flex items-center justify-between text-xs">
                        <span className="font-semibold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Consultation Stream Active
                        </span>
                        <button
                          onClick={() => setVideoConnected(false)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold cursor-pointer"
                        >
                          End
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setVideoConnected(true)}
                        className="w-full py-2.5 bg-teal-400 hover:bg-teal-300 text-teal-950 font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
                      >
                        Join Video Room
                      </button>
                    )}
                  </div>
                )}

                <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Clinic Details
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-stone-900">{activeAppointment.clinicName}</h4>
                    <div className="flex items-start gap-1.5 text-xs text-stone-500 mt-1">
                      <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                      <span>{activeAppointment.clinicAddress}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                    <button
                      onClick={handleOpenChat}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-semibold transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
                      <span>Message Vet</span>
                    </button>
                    <a
                      href={`tel:${currentCountry.emergencyHotline.replace(/\D/g, '')}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Front Desk</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* MY BOOKINGS (Upcoming, Past, Cancelled) */}
      {mainView === 'bookings' && (
        <div className="space-y-6">
          {/* Booking Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
            {[
              { id: 'all', label: 'All Bookings' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Past & Completed' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setBookingFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  bookingFilter === tab.id
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredBookingsList.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
                No bookings found for the selected filter.
              </div>
            ) : (
              filteredBookingsList.map((apt) => {
                const isUpcoming = apt.status === 'scheduled' || apt.status === 'checked_in' || apt.status === 'in_consultation';
                const isCompleted = apt.status === 'completed';
                const isCancelled = apt.status === 'cancelled';

                return (
                  <div
                    key={apt.id}
                    className="p-5 sm:p-6 bg-white rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-sm transition"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-stone-900">{apt.serviceName}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-semibold border border-teal-200">
                          For {apt.petName}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            apt.status === 'requested'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCancelled
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-teal-100 text-teal-900'
                          }`}
                        >
                          {apt.status === 'requested' ? 'Requested (Pending)' : apt.status.replace('_', ' ')}
                        </span>
                        {apt.paymentStatus === 'paid' ? (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Paid Online
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-700 font-semibold">
                            Payment Pending
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-stone-600 flex flex-wrap items-center gap-3">
                        <span className="font-semibold text-stone-800">{apt.clinicName}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          {apt.date} at {apt.time}
                        </span>
                        <span>·</span>
                        <span>Doctor: {apt.vetName}</span>
                      </div>

                      {apt.clinicalSummary && (
                        <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                          <strong className="text-stone-800">Visit Summary:</strong> {apt.clinicalSummary}
                        </div>
                      )}

                      {/* Display written review if present */}
                      {apt.reviewRating && (
                        <div className="text-xs bg-amber-50/60 border border-amber-200/80 p-2.5 rounded-xl flex items-center gap-2">
                          <div className="flex items-center text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= (apt.reviewRating || 5) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-stone-700 italic">"{apt.reviewComment}"</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons depending on state */}
                    <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0">
                      {isUpcoming && (
                        <>
                          {apt.paymentStatus !== 'paid' && (
                            <button
                              onClick={() => setPayingAppointment(apt)}
                              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay Online ({formatPrice(apt.baseCostUSD)})</span>
                            </button>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setReschedulingAppointment(apt)}
                              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition cursor-pointer"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => cancelAppointment(apt.id)}
                              className="px-3 py-1.5 bg-stone-100 hover:bg-rose-100 hover:text-rose-800 text-stone-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      )}

                      {isCompleted && (
                        <>
                          {!apt.reviewRating ? (
                            <button
                              onClick={() => setReviewingAppointment(apt)}
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Star className="w-3.5 h-3.5" />
                              <span>Rate & Review Booking</span>
                            </button>
                          ) : (
                            <div className="text-xs text-stone-500 font-medium">
                              ✓ Review Submitted
                            </div>
                          )}
                        </>
                      )}

                      {isCancelled && (
                        <button
                          onClick={() => {
                            setCurrentTab('book');
                          }}
                          className="px-3.5 py-2 bg-stone-900 text-white hover:bg-stone-800 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Book Again
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ONLINE PAYMENT */}
      {payingAppointment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-stone-900">Secure Online Payment</h3>
              </div>
              <button
                onClick={() => setPayingAppointment(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {paymentSuccessToast ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-950">Payment Confirmed!</h4>
                <p className="text-xs text-emerald-800">
                  Transaction receipt generated and booking confirmed with {payingAppointment.clinicName}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleExecutePayment} className="space-y-4 text-xs">
                {/* Booking breakdown */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Service:</span>
                    <strong className="text-stone-800">{payingAppointment.serviceName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Facility:</span>
                    <span className="text-stone-700">{payingAppointment.clinicName}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-2 border-t border-stone-200 text-stone-900">
                    <span>Total Due:</span>
                    <span className="text-teal-700">{formatPrice(payingAppointment.baseCostUSD)}</span>
                  </div>
                </div>

                {/* Method selector */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-stone-600">Payment Option:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'bg-teal-50 border-teal-500 text-teal-900 ring-2 ring-teal-200'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      Credit/Debit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('gcash')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                        paymentMethod === 'gcash'
                          ? 'bg-teal-50 border-teal-500 text-teal-900 ring-2 ring-teal-200'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      GCash / Maya
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                        paymentMethod === 'paypal'
                          ? 'bg-teal-50 border-teal-500 text-teal-900 ring-2 ring-teal-200'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      PayPal
                    </button>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">Card Number:</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl font-mono text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        defaultValue="12/28"
                        placeholder="MM/YY"
                        className="px-3 py-2 border border-stone-200 rounded-xl font-mono text-xs"
                      />
                      <input
                        type="password"
                        defaultValue="882"
                        placeholder="CVV"
                        className="px-3 py-2 border border-stone-200 rounded-xl font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isProcessingPayment ? 'Processing Safe Transaction...' : `Confirm Payment · ${formatPrice(payingAppointment.baseCostUSD)}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: RATE & REVIEW */}
      {reviewingAppointment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-stone-900">Review & Rating</h3>
              </div>
              <button
                onClick={() => setReviewingAppointment(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reviewSuccessToast ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-950">Thank You for Your Review!</h4>
                <p className="text-xs text-emerald-800">
                  Your feedback helps other pet parents find verified, compassionate care.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                <div>
                  <div className="text-xs text-stone-600">
                    How was your appointment for <strong>{reviewingAppointment.petName}</strong> at <strong>{reviewingAppointment.clinicName}</strong>?
                  </div>
                  {/* Star selector */}
                  <div className="flex items-center gap-2 pt-3 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingStars(star)}
                        className="p-1 cursor-pointer transition transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= ratingStars
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-center font-bold text-stone-700 text-xs mt-1">
                    {ratingStars} of 5 Stars
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 font-semibold mb-1">
                    Describe your experience:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="e.g. Dr. David was exceptionally gentle with Buddy and took the time to answer all questions..."
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-teal-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setReviewingAppointment(null)}
                    className="px-4 py-2 text-stone-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition shadow-xs cursor-pointer"
                  >
                    Post Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: RESCHEDULE */}
      {reschedulingAppointment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">Reschedule Appointment</h3>
              <button
                onClick={() => setReschedulingAppointment(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] text-stone-600 font-semibold mb-1">Select New Date:</label>
                <input
                  type="text"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="e.g. Friday, Nov 14"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 font-semibold mb-1">Select New Timeslot:</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="01:30 PM">01:30 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingAppointment(null)}
                  className="px-4 py-2 text-stone-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition shadow-xs cursor-pointer"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
