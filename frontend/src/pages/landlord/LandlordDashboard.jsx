import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import EditListingModal from '../../components/listing/EditListingModal';
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Home, Calendar, Star, TrendingUp, CheckCircle2, XCircle, Heart } from 'lucide-react';

// ─── Write Review Modal (Rate Tenant) ────────────────────────────────────────
function WriteReviewModal({ booking, onClose, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    setSubmitting(true);
    try {
      await axios.post('/api/reviews/', {
        booking_id: booking.id,
        rating,
        comment,
      });
      toast.success('Tenant rated successfully!');
      onReviewSubmitted(booking.id);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
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
        >
          <XCircle className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-heading font-bold text-gray-900 mb-1">Rate this Tenant</h2>
        <p className="text-sm text-gray-500 mb-5">
          How was your experience with <span className="font-medium text-gray-700">{booking.tenant?.name || 'this tenant'}</span>?
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
            placeholder="How was the tenant's conduct during the visit? Were they punctual and respectful?"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/500</p>
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
            {submitting ? 'Submitting…' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LandlordDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editListing, setEditListing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewedIds, setReviewedIds] = useState(new Set());

  const fetchDashboardData = async () => {
    try {
      const [listingsRes, bookingsRes] = await Promise.all([
        axios.get('/api/listings/'),
        axios.get('/api/bookings/')
      ]);
      setListings(listingsRes.data.data.listings || []);
      setBookings(bookingsRes.data.data.bookings || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      toast.error('Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchDashboardData(); }, [user]);

  const handleDelete = async (listingId) => {
    if (!window.confirm('Archive this property? It will be hidden from search but not permanently deleted.')) return;
    setDeletingId(listingId);
    try {
      await axios.delete(`/api/listings/${listingId}`);
      toast.success('Property archived');
      setListings(prev => prev.filter(l => l.id !== listingId));
    } catch {
      toast.error('Failed to archive property');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (listing) => {
    try {
      const res = await axios.patch(`/api/listings/${listing.id}`, { is_active: !listing.is_active });
      const updated = res.data?.data?.listing;
      setListings(prev => prev.map(l => l.id === listing.id ? { ...l, ...updated } : l));
      toast.success(updated?.is_active ? 'Listing set to active' : 'Listing hidden from search');
    } catch {
      toast.error('Failed to update listing');
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      await axios.patch(`/api/bookings/${bookingId}/respond`, { action });
      toast.success(action === 'accept' ? 'Visit confirmed!' : 'Visit declined');
      fetchDashboardData();
    } catch {
      toast.error('Failed to respond to booking');
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  const pendingBookings = bookings.filter(b => b.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Welcome, {user.name} 👋</h1>
          <p className="text-gray-500 mt-1">Manage your properties and visit requests.</p>
        </div>
        <Link to="/landlord/properties/add"
          className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-accent/20 hover:shadow-lg">
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {[
          { icon: Home, label: 'Active Properties', value: listings.filter(l => l.is_active).length, color: 'text-primary' },
          { icon: Eye, label: 'Total Views', value: listings.reduce((acc, curr) => acc + (curr.views_count || 0), 0), color: 'text-blue-500' },
          { icon: Heart, label: 'Interested', value: listings.reduce((acc, curr) => acc + (curr.saved_count || 0), 0), color: 'text-red-500' },
          { icon: Calendar, label: 'Pending Visits', value: pendingBookings.length, color: 'text-amber-500' },
          { icon: Star, label: 'Trust Score', value: `${user.trust_score?.toFixed(1) || '0.0'}★`, color: 'text-accent' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`${stat.color} mb-2`}><stat.icon className="w-5 h-5" /></div>
            <div className="text-2xl font-bold text-gray-900">{loading ? '–' : stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pending Visit Requests */}
      {pendingBookings.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Visit Requests ({pendingBookings.length})</h2>
          <div className="space-y-3">
            {pendingBookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Tenant info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                    {booking.tenant?.name?.charAt(0) || 'T'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{booking.tenant?.name || 'Unknown'}</p>
                    {booking.tenant?.is_aadhaar_verified && (
                      <p className="text-xs text-green-600 font-medium">✓ Aadhaar Verified</p>
                    )}
                  </div>
                </div>
                {/* Property + slot */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{booking.listing?.title || '–'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(booking.slot_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, {booking.slot_time}
                  </p>
                </div>
                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleBookingAction(booking.id, 'accept')}
                    className="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors">
                    Accept
                  </button>
                  <button onClick={() => handleBookingAction(booking.id, 'decline')}
                    className="flex-1 sm:flex-none px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-xl transition-colors">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Bookings (non-pending) */}
      {bookings.filter(b => b.status !== 'pending').length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Visit History</h2>
          <div className="space-y-3">
            {bookings.filter(b => b.status !== 'pending').map(booking => {
              const isPast = new Date(booking.slot_date) < new Date();
              const canReview = booking.status === 'confirmed' && isPast && !reviewedIds.has(booking.id);
              const alreadyReviewed = reviewedIds.has(booking.id);
              return (
                <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900 text-sm">{booking.tenant?.name || 'Unknown'}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'declined' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{booking.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{booking.listing?.title || '–'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(booking.slot_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {canReview && (
                      <button
                        onClick={() => setReviewTarget(booking)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        <Star className="w-3.5 h-3.5" /> Rate Tenant
                      </button>
                    )}
                    {alreadyReviewed && (
                      <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-green-500 text-green-500" /> Rated
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* My Properties */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Your Properties ({listings.length})</h2>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-gray-400 py-8">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading properties…
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-4">You haven't listed any properties yet.</p>
            <Link to="/landlord/properties/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-bold rounded-xl hover:bg-accent-dark transition-colors">
              <Plus className="w-4 h-4" /> List Your First Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map(listing => (
              <div key={listing.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Photo */}
                <div className="relative h-44 bg-gray-100">
                  {listing.listing_photos?.[0]?.photo_url ? (
                    <img src={listing.listing_photos[0].photo_url} alt={listing.title}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-teal-100 flex items-center justify-center">
                      <Home className="w-8 h-8 text-primary/30" />
                    </div>
                  )}
                  {/* Active status badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                    listing.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                  }`}>
                  {listing.is_active ? 'Active' : 'Hidden'}
                  </div>
                  
                  {/* Views & Saves Badges */}
                  <div className="absolute bottom-2 left-2 flex gap-2">
                    <div className="bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {listing.views_count || 0}
                    </div>
                    <div className="bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-400 fill-current" /> {listing.saved_count || 0}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 truncate">{listing.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5 truncate">{listing.address}</p>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-accent">₹{listing.rent?.toLocaleString()}<span className="text-xs font-normal text-gray-400">/mo</span></span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">{listing.bhk}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-gray-50 flex gap-2">
                    <button onClick={() => setEditListing(listing)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => handleToggleActive(listing)}
                      title={listing.is_active ? 'Hide from search' : 'Make active'}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                      {listing.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(listing.id)} disabled={deletingId === listing.id}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors disabled:opacity-50">
                      {deletingId === listing.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Edit Modal */}
      {reviewTarget && (
        <WriteReviewModal
          booking={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onReviewSubmitted={(id) => setReviewedIds(prev => new Set([...prev, id]))}
        />
      )}

      {editListing && (
        <EditListingModal
          listing={editListing}
          onClose={() => setEditListing(null)}
          onSaved={(updated) => {
            setListings(prev => prev.map(l => l.id === updated?.id ? { ...l, ...updated } : l));
          }}
        />
      )}
    </div>
  );
}
