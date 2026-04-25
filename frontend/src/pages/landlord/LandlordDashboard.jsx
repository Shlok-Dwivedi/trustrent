import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import EditListingModal from '../../components/listing/EditListingModal';
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Home, Calendar, Star, TrendingUp, CheckCircle2, XCircle, Heart, User } from 'lucide-react';
import { EmojiSmile, StarFill, RocketTakeoff, Check2Circle } from 'react-bootstrap-icons';
import WriteReviewModal from '../../components/WriteReviewModal';
import { PropertyImagePlaceholder } from '../../components/property/PropertyImagePlaceholder';

export default function LandlordDashboard() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tenancies, setTenancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editListing, setEditListing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [viewingTenant, setViewingTenant] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [listingsRes, bookingsRes, tenanciesRes] = await Promise.all([
        axios.get('/api/listings/'),
        axios.get('/api/bookings/'),
        axios.get('/api/tenancies/')
      ]);
      setListings(listingsRes.data.data.listings || []);
      setBookings(bookingsRes.data.data.bookings || []);
      setTenancies(tenanciesRes.data.data.tenancies || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchDashboardData(); }, [user]);

  const handleConfirmTenancy = async (tenancy) => {
    if (!window.confirm(`Confirm that ${tenancy.tenant?.name} has officially occupied the property?`)) return;
    try {
      await axios.patch(`/api/tenancies/${tenancy.id}/confirm`);
      toast.success('Occupation confirmed! Congratulations.');
      fetchDashboardData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to confirm tenancy');
    }
  };

  const handleEndTenancy = async (tenancy) => {
    const isConfirming = tenancy.status === 'ending' && tenancy.checkout_initiated_by !== user?.id;
    const confirmMsg = isConfirming 
      ? `Confirm ${tenancy.tenant?.name}'s checkout and mark the property as available?`
      : 'Are you sure you want to end this tenancy? This will require tenant confirmation.';

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await axios.patch(`/api/tenancies/${tenancy.id}/end`);
      if (res.data?.data?.status === 'finalized') {
        toast.success('Tenancy officially ended. Property is now available.');
      } else {
        toast.success('Checkout requested. Waiting for tenant to confirm.');
      }
      fetchDashboardData();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to update tenancy';
      toast.error(msg);
      console.error('[End Tenancy Error]', err?.response?.data);
    }
  };

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
      toast.error(t('common.error'));
    }
  };

  const handleReviewSubmitted = (bookingId) => {
    setReviewedIds(prev => new Set([...prev, bookingId]));
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
          <h1 className="text-3xl font-heading font-bold text-gray-900 flex items-center gap-2">
            {t('nav.profile')}, {user.name} <EmojiSmile className="text-accent" />
          </h1>
          <p className="text-gray-500 mt-1">{t('landing.hero_subtitle')}</p>
        </div>
        <Link to="/landlord/properties/add"
          className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-accent/20 hover:shadow-lg">
          <Plus className="w-4 h-4" /> {t('landing.cta_list')}
        </Link>
      </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {[
            { icon: Home, label: t('handshake.status_active'), value: listings.filter(l => l.is_active).length, color: 'text-primary' },
            { icon: Eye, label: 'Total Views', value: listings.reduce((acc, curr) => acc + (curr.view_count || 0), 0), color: 'text-blue-500' },
            { icon: Heart, label: t('nav.saved'), value: listings.reduce((acc, curr) => acc + (curr.saved_count || 0), 0), color: 'text-red-500' },
            { icon: Calendar, label: t('property.visit_availability'), value: pendingBookings.length, color: 'text-amber-500' },
            { 
              icon: Star, 
              label: t('property.area'), 
              value: <span>{user.trust_score?.toFixed(1) || '0.0'}<StarFill className="inline ml-1 mb-1 text-accent" /></span>, 
              color: 'text-accent',
            },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 group/tip relative">
              <div className={`${stat.color} mb-2`}><stat.icon className="w-5 h-5" /></div>
              <div className="text-2xl font-bold text-gray-900">{loading ? '–' : stat.value}</div>
              <div className={`text-sm text-gray-500 mt-0.5 ${stat.tooltip ? 'border-b border-dotted border-gray-300 cursor-help' : ''}`}>
                {stat.label}
              </div>
              {stat.tooltip && (
                <div className="absolute bottom-[20%] left-5 right-5 p-2 bg-gray-900 text-white text-[10px] rounded shadow-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50">
                  {stat.tooltip}
                </div>
              )}
            </div>
          ))}
        </div>

      {/* Move-In Requests */}
      {tenancies.filter(ten => ten.status === 'requested').length > 0 && (
        <section className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 mb-4">
            <RocketTakeoff className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-900">{t('handshake.mutual_confirmation')} ({tenancies.filter(ten => ten.status === 'requested').length})</h2>
          </div>
          <div className="space-y-3">
            {tenancies.filter(ten => ten.status === 'requested').map(ten => (
              <div key={ten.id} className="bg-white rounded-2xl border-2 border-primary border-dashed shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{ten.listing?.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-gray-700 font-semibold">{ten.tenant?.name}</p>
                    <span className="text-xs text-gray-400">requested occupation</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleConfirmTenancy(ten)}
                    className="px-6 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
                  >
                    {t('handshake.confirm_handshake')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Occupations */}
      {tenancies.filter(ten => ['active', 'ending'].includes(ten.status)).length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('handshake.status_active')} ({tenancies.filter(ten => ['active', 'ending'].includes(ten.status)).length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenancies.filter(ten => ['active', 'ending'].includes(ten.status)).map(ten => (
              <div key={ten.id} className={`bg-white rounded-2xl shadow-sm p-5 relative overflow-hidden border-2 ${ten.status === 'ending' ? 'border-indigo-200 bg-indigo-50/10' : 'border-primary/20'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{ten.listing?.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <Home className="w-3 h-3" /> {ten.tenant?.name}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleEndTenancy(ten)}
                    disabled={ten.status === 'ending' && ten.checkout_initiated_by === user?.id}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                      ten.status === 'ending' && ten.checkout_initiated_by !== user?.id
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : ten.status === 'ending'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    {ten.status === 'ending' && ten.checkout_initiated_by !== user?.id 
                      ? t('handshake.confirm_handshake') 
                      : ten.status === 'ending' ? t('common.loading') : t('handshake.end_tenancy')}
                  </button>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Since {new Date(ten.start_date).toLocaleDateString()}</span>
                  <span className={`flex items-center gap-1 capitalize font-bold ${ten.status === 'ending' ? 'text-indigo-600' : 'text-green-600'}`}>
                    <CheckCircle2 className={`w-3 h-3 ${ten.status === 'ending' ? 'text-indigo-500' : 'text-green-500'}`} /> 
                    {ten.status === 'ending' ? t('handshake.status_ending') : t(`handshake.status_${ten.status}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Past Tenancies */}
      {tenancies.filter(ten => ten.status === 'ended').length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Past Tenancies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenancies.filter(ten => ten.status === 'ended').map(ten => {
              const alreadyReviewed = reviewedIds.has(ten.id);
              return (
                <div key={ten.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{ten.listing?.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Home className="w-3 h-3" /> {ten.tenant?.name}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                      Ended
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400 mb-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Ended {new Date(ten.end_date).toLocaleDateString()}</span>
                  </div>
                  {!alreadyReviewed ? (
                    <button
                      onClick={() => setReviewTarget({ id: ten.id, tenancy_id: ten.id, tenant: ten.tenant, listing: ten.listing, type: 'tenant' })}
                      className="w-full py-2 bg-accent hover:bg-accent-dark text-white rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-colors"
                    >
                      <Star className="w-4 h-4" /> Rate Tenant
                    </button>
                  ) : (
                    <span className="w-full py-2 bg-green-50 text-green-600 rounded-xl text-sm font-bold flex justify-center items-center gap-2">
                      <Star className="w-4 h-4 fill-green-500" /> Rated
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Pending Visit Requests */}
      {pendingBookings.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Visit Requests ({pendingBookings.length})</h2>
          <div className="space-y-3">
            {pendingBookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Tenant info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-teal-500/10 border border-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                    {booking.tenant?.name?.charAt(0) || 'T'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-sm truncate">{booking.tenant?.name || 'Unknown'}</p>
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-100">
                        <Star className="w-2.5 h-2.5 fill-amber-500" />
                        {booking.tenant?.trust_score?.toFixed(1) || '0.0'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {booking.tenant?.is_aadhaar_verified && (
                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-tight">✓ Verified</p>
                      )}
                      <button 
                        onClick={() => setViewingTenant(booking.tenant)}
                        className="text-[10px] text-primary font-bold uppercase tracking-tight hover:underline"
                      >
                        View Reviews
                      </button>
                    </div>
                  </div>
                </div>
                {/* Property + slot */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{booking.listing?.title || '–'}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(booking.slot_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, {booking.slot_time}
                  </p>
                </div>
                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleBookingAction(booking.id, 'accept')}
                    className="flex-1 sm:flex-none px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm">
                    Accept
                  </button>
                  <button onClick={() => handleBookingAction(booking.id, 'decline')}
                    className="flex-1 sm:flex-none px-6 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all">
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
                        onClick={() => setReviewTarget({ ...booking, type: 'tenant' })}
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
                    <PropertyImagePlaceholder id={listing.id} className="w-full h-full" />
                  )}
                  {/* Active status badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                    listing.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                  }`}>
                  {listing.is_active ? t('property.active') : t('property.hidden')}
                  </div>
                  
                  {/* Views & Saves Badges */}
                  <div className="absolute bottom-2 left-2 flex gap-2">
                    <div className="bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {listing.view_count || 0}
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
                      title="Retire Property"
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

      {/* Modals */}
      {editListing && (
        <EditListingModal
          listing={editListing}
          onClose={() => setEditListing(null)}
          onSaved={(updated) => {
            setListings(prev => prev.map(l => l.id === updated?.id ? { ...l, ...updated } : l));
          }}
        />
      )}

      {reviewTarget && (
        <WriteReviewModal
          booking={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {viewingTenant && (
        <TenantReviewsModal 
          tenant={viewingTenant} 
          onClose={() => setViewingTenant(null)} 
        />
      )}
    </div>
  );
}

// ─── Tenant Reviews Modal ───────────────────────────────────────────
function TenantReviewsModal({ tenant, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant?.id || tenant.id === 'undefined') return;
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`/api/reviews/user/${tenant.id}`);
        setReviews(res.data.data.reviews || []);
      } catch (err) {
        toast.error('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [tenant.id]);

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              {tenant.name?.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{tenant.name}'s Reputation</h2>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Historical Feedback</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><XCircle className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center py-12 text-gray-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm font-medium">Fetching reputation…</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-500 font-medium">No reviews yet</p>
              <p className="text-xs text-gray-400 mt-1">This tenant hasn't received any feedback yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((rev) => {
                const parts = (rev.comment || '').split('||PHOTOS||');
                const cleanComment = parts[0];
                const photos = parts[1] ? parts[1].split(',') : [];

                return (
                  <div key={rev.id} className="pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-gray-300 uppercase">{new Date(rev.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 italic">"{cleanComment || 'No comment provided'}"</p>
                    
                    {/* Photo Gallery */}
                    {photos.length > 0 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        {photos.map((url, idx) => (
                          <img 
                            key={idx} 
                            src={url} 
                            alt="Review" 
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-gray-100 shadow-sm hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => window.open(url, '_blank')}
                          />
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">
                        {(rev.reviewer?.name || 'L').charAt(0)}
                      </div>
                      <span className="text-[10px] text-gray-400">— Verified Landlord</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-all text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
