import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Calendar, Clock, MapPin, Loader2, CalendarX, Star,
  XCircle, ChevronRight, User, Home, Sparkles, Image as ImageIcon, Plus as PlusIcon
} from 'lucide-react';
import { RocketTakeoff } from 'react-bootstrap-icons';
import { PropertyImagePlaceholder } from '../../components/property/PropertyImagePlaceholder';

// ─── Write Review Modal ───────────────────────────────────────────
function WriteReviewModal({ booking, onClose, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [photoUrls, setPhotoUrls] = useState(['']);
  const [submitting, setSubmitting] = useState(false);

  const addPhotoField = () => setPhotoUrls([...photoUrls, '']);
  const updatePhotoUrl = (val, idx) => {
    const next = [...photoUrls];
    next[idx] = val;
    setPhotoUrls(next);
  };

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    setSubmitting(true);
    try {
      await axios.post('/api/reviews/', {
        booking_id: booking.id,
        tenancy_id: booking.tenancy_id,
        rating,
        comment,
        photo_urls: photoUrls.filter(u => u.trim() !== '')
      });
      toast.success('Review submitted! Thank you.');
      onReviewSubmitted(booking.id);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit review';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const starLabel = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <XCircle className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-heading font-bold text-gray-900 mb-1">Write a Review</h2>
        <p className="text-sm text-gray-500 mb-5">
          Share your experience for <span className="font-medium text-gray-700">{booking.listing?.title || 'this property'}</span>
        </p>

        {/* Star Rating */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating</label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-9 h-9 transition-colors ${
                    star <= (hovered || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-200 fill-gray-200'
                  }`}
                />
              </button>
            ))}
            {(hovered || rating) > 0 && (
              <span className="ml-2 text-sm font-semibold text-amber-600">
                {starLabel[hovered || rating]}
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Comment <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell others about the property, the landlord, and your overall visit experience..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/500</p>
        </div>

        {/* Photos */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
            Photos <span className="text-xs font-normal text-gray-400">Add URLs of property condition</span>
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
            {photoUrls.map((url, idx) => (
              <div key={idx} className="flex gap-2">
                <div className="flex-1 relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updatePhotoUrl(e.target.value, idx)}
                    placeholder="https://image-url.com/photo.jpg"
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={addPhotoField}
            className="mt-2 text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1"
          >
            <PlusIcon className="w-3 h-3" /> Add another photo
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:   { cls: 'bg-amber-100 text-amber-700',  label: 'Pending' },
    confirmed: { cls: 'bg-green-100 text-green-700',  label: 'Confirmed' },
    declined:  { cls: 'bg-red-100 text-red-700',      label: 'Declined' },
    cancelled: { cls: 'bg-gray-100 text-gray-500',    label: 'Cancelled' },
  };
  const { cls, label } = map[status] || { cls: 'bg-gray-100 text-gray-600', label: status };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}

// ─── Booking Card ─────────────────────────────────────────────────
function BookingCard({ booking, onCancel, onReview, reviewedIds, isRequesting, onOccupancyRequest, requestedIds }) {
  const date = new Date(booking.slot_date);
  const isUpcoming = new Date(booking.slot_date) >= new Date();
  const canCancel = ['pending', 'confirmed'].includes(booking.status) && isUpcoming;
  const canReview = booking.status === 'confirmed' && !isUpcoming && !reviewedIds.has(booking.id);
  const alreadyReviewed = reviewedIds.has(booking.id);
  
  const canRequestOccupancy = booking.status === 'confirmed' && !requestedIds.has(booking.id);
  const alreadyRequested = requestedIds.has(booking.id);
  const photo = booking.listing?.listing_photos?.[0]?.photo_url;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col sm:flex-row">
      {/* Property thumbnail */}
      <Link to={`/property/${booking.listing_id}`} className="block sm:w-40 h-32 sm:h-auto flex-shrink-0 bg-gray-100 relative overflow-hidden group">
        {photo ? (
          <img src={photo} alt={booking.listing?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <PropertyImagePlaceholder id={booking.listing_id} className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 p-4 flex flex-col justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <Link to={`/property/${booking.listing_id}`} className="font-bold text-gray-900 hover:text-primary transition-colors line-clamp-1">
              {booking.listing?.title || 'Property Visit'}
            </Link>
            <StatusBadge status={booking.status} />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate max-w-[200px]">{booking.listing?.address || '—'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {booking.slot_time}
            </span>
            {booking.landlord?.name && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" />
                {booking.landlord.name}
              </span>
            )}
          </div>
        </div>

        {/* Action row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-50">
          <Link
            to={`/property/${booking.listing_id}`}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            View Property <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          {canCancel && (
            <button
              onClick={() => onCancel(booking)}
              className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel Visit
            </button>
          )}

          {canReview && (
            <button
              onClick={() => onReview(booking)}
              className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent-dark text-white text-xs font-bold transition-colors shadow-sm"
            >
              <Star className="w-3.5 h-3.5" /> Rate Property
            </button>
          )}

          {canRequestOccupancy && (
            <button
              onClick={() => onOccupancyRequest(booking)}
              disabled={isRequesting}
              className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-colors shadow-sm shadow-primary/20 disabled:opacity-50"
            >
              <RocketTakeoff className="w-3.5 h-3.5" /> Request Move-In
            </button>
          )}

          {alreadyRequested && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-primary font-semibold italic bg-primary/5 px-3 py-1.5 rounded-lg">
              <Sparkles className="w-3.5 h-3.5" /> Request Sent
            </span>
          )}

          {alreadyReviewed && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-green-600 font-semibold">
              <Star className="w-3.5 h-3.5 fill-green-500 text-green-500" /> Review Submitted
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
const TABS = [
  { key: 'upcoming',  label: 'Upcoming' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'past',      label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function VisitManagement() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  // track booking IDs user has reviewed this session
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [requestedIds, setRequestedIds] = useState(new Set());
  const [requestingRoom, setRequestingRoom] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/bookings/');
      setBookings(res.data?.data?.bookings || []);
    } catch {
      toast.error('Could not load your visits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'landlord') {
      navigate('/landlord/dashboard', { replace: true });
      return;
    }
    fetchBookings();
  }, [user, fetchBookings, navigate]);

  // ── Tab filtering logic ───────────────────────────────────────
  const now = new Date();
  const filtered = bookings.filter((b) => {
    const visitDate = new Date(b.slot_date);
    if (tab === 'upcoming')  return ['pending', 'confirmed'].includes(b.status) && visitDate >= now;
    if (tab === 'confirmed') return b.status === 'confirmed';
    if (tab === 'past')      return visitDate < now && b.status !== 'cancelled';
    if (tab === 'cancelled') return b.status === 'cancelled' || b.status === 'declined';
    return true;
  });

  // ── Cancel ────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await axios.patch(`/api/bookings/${cancelTarget.id}/cancel`);
      toast.success('Visit cancelled');
      setBookings(prev =>
        prev.map(b => b.id === cancelTarget.id ? { ...b, status: 'cancelled' } : b)
      );
      setCancelTarget(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  const handleReviewSubmitted = (bookingId) => {
    setReviewedIds(prev => new Set([...prev, bookingId]));
  };

  const handleOccupancyRequest = async (booking) => {
    setRequestingRoom(true);
    try {
      await axios.post('/api/tenancies/', {
        booking_id: booking.id,
        listing_id: booking.listing_id
      });
      toast.success('Occupation request sent to landlord!');
      setRequestedIds(prev => new Set([...prev, booking.id]));
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Request failed';
      toast.error(msg);
    } finally {
      setRequestingRoom(false);
    }
  };

  const counts = {
    upcoming:  bookings.filter(b => ['pending', 'confirmed'].includes(b.status) && new Date(b.slot_date) >= now).length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    past:      bookings.filter(b => new Date(b.slot_date) < now && b.status !== 'cancelled').length,
    cancelled: bookings.filter(b => b.status === 'cancelled' || b.status === 'declined').length,
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900">My Visits</h1>
          <p className="text-gray-500 mt-1">Track all your property visit requests in one place.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-full overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 min-w-max flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
              {counts[t.key] > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {counts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading your visits…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <CalendarX className="w-16 h-16 text-gray-200" />
            <p className="text-lg font-semibold text-gray-400">No {tab} visits</p>
            {tab === 'upcoming' && (
              <p className="text-sm text-gray-400">
                Looking for a place?{' '}
                <Link to="/search" className="text-primary font-semibold hover:underline">
                  Browse properties →
                </Link>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={setCancelTarget}
                onReview={setReviewTarget}
                reviewedIds={reviewedIds}
                isRequesting={requestingRoom}
                onOccupancyRequest={handleOccupancyRequest}
                requestedIds={requestedIds}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirm Dialog */}
      {cancelTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setCancelTarget(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-heading font-bold text-gray-900 mb-2">Cancel this visit?</h2>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to cancel your visit to{' '}
              <span className="font-semibold text-gray-700">{cancelTarget.listing?.title || 'this property'}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Keep Visit
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewTarget && (
        <WriteReviewModal
          booking={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </>
  );
}
