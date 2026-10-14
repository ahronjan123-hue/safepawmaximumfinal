import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Star,
  CheckCircle,
  Award,
  Sparkles,
  Heart,
  MessageSquare,
  Building,
} from 'lucide-react';

interface RateProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
  serviceName?: string;
  bookingId?: string;
  petName?: string;
  onShowToast?: (msg: string) => void;
}

export const RateProviderModal: React.FC<RateProviderModalProps> = ({
  isOpen,
  onClose,
  providerId,
  providerName,
  serviceName,
  bookingId,
  petName,
  onShowToast,
}) => {
  const { addReview, selectedPet } = useApp();
  const { profile } = useAuth();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [activePetName, setActivePetName] = useState(petName || selectedPet?.name || 'Buddy');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const quickCompliments = [
    'Gentle and patient handling',
    'Thorough clinical explanation',
    'Spotlessly clean facility',
    'Minimal waiting time',
    'Compassionate veterinary staff',
    'Great grooming precision',
  ];

  const handleAddCompliment = (comp: string) => {
    if (comment.includes(comp)) return;
    setComment((prev) => (prev ? `${prev}. ${comp}` : comp));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addReview({
      providerId,
      bookingId,
      authorName: profile?.fullName || 'Sophia Rodriguez',
      petName: activePetName,
      rating,
      comment: comment.trim(),
      serviceName: serviceName || 'Veterinary Clinical Service',
    });

    setSubmitted(true);
    onShowToast?.(`Thank you! Your ${rating}-star review for ${providerName} has been recorded.`);

    setTimeout(() => {
      setSubmitted(false);
      setComment('');
      onClose();
    }, 1800);
  };

  const ratingDescriptions = [
    'Select a rating',
    'Needs improvement',
    'Fair experience',
    'Good care',
    'Very good & attentive',
    'Exceptional care & compassion (5/5)',
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-stone-200 animate-scaleUp text-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900">
                Rate Care Provider
              </h3>
              <p className="text-xs text-stone-500 truncate max-w-[280px]">
                {providerName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-stone-900">
              Review Submitted Successfully!
            </h4>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Your feedback is verified and helps pet owners find accredited, top-tier veterinary care.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Star Rating Section */}
            <div className="text-center py-2 bg-stone-50 rounded-2xl border border-stone-100 p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                How would you rate your experience?
              </span>

              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition transform hover:scale-125 focus:outline-hidden"
                    >
                      <Star
                        className={`w-8 h-8 transition ${
                          isFilled
                            ? 'fill-amber-400 text-amber-500 drop-shadow-sm'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="text-xs font-bold text-stone-700">
                {ratingDescriptions[hoverRating || rating]}
              </div>
            </div>

            {/* Pet info & Service info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Pet Patient Name
                </label>
                <input
                  type="text"
                  value={activePetName}
                  onChange={(e) => setActivePetName(e.target.value)}
                  placeholder="e.g. Buddy"
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Service Rendered
                </label>
                <input
                  type="text"
                  readOnly
                  value={serviceName || 'Clinical Consultation'}
                  className="w-full bg-stone-100 border border-stone-200 rounded-xl px-3 py-2 text-stone-600"
                />
              </div>
            </div>

            {/* Quick compliments */}
            <div>
              <span className="text-[11px] font-semibold text-stone-500 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Compliments (tap to add):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickCompliments.map((comp) => (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => handleAddCompliment(comp)}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium transition cursor-pointer"
                  >
                    + {comp}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-stone-700 font-bold mb-1 text-xs">
                Detailed Feedback & Experience *
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience regarding the quality of medical care, facility cleanliness, and staff bedside manner..."
                className="w-full bg-white border border-stone-200 rounded-xl p-3 text-stone-900 text-xs focus:outline-hidden focus:border-teal-500"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Star className="w-4 h-4 fill-white" />
                <span>Submit Verified Review</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
