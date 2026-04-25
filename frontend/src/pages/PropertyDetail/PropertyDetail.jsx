import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Share2, Heart, MapPin, Bed, Bath, Maximize,
  Building, CalendarDays, Compass, CheckCircle2, ShieldCheck,
  MessageCircle, Clock, Star, Car, Snowflake, Wifi, ShowerHead,
  Lock, Zap, Dumbbell, Sparkles, Loader2
} from 'lucide-react';
import PropertyGallery from '../../components/property/PropertyGallery';
import VisitBookingModal from '../../components/visit/VisitBookingModal';

import { Check2Circle, StarFill } from 'react-bootstrap-icons';

// Map amenity string names to icons
const AMENITY_ICONS = {
  parking: Car, ac: Snowflake, wifi: Wifi, cleaning: Sparkles,
  security: Lock, power: Zap, water: ShowerHead, gym: Dumbbell,
};

function StarRating({ rating, size = 'sm' }) {
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <StarFill key={s} className={`${starSize} ${s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`} />
      ))}
    </div>
  );
}

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isAuthenticated, isChecking } = useAuthStore();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/listings/${id}`);
        setProperty(res.data?.data?.listing || null);
      } catch (err) {
        console.error('Failed to fetch property:', err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  // Handle building analytics: Increment view count on mount
  useEffect(() => {
    if (id) {
      const incView = async () => {
        try {
          await axios.patch(`/api/listings/${id}/view`);
        } catch (err) {
          // Fail silently as this is non-critical analytics
          console.debug('Failed to increment view');
        }
      };
      // Delay slightly to ensure it's a real view not a bounce
      const timer = setTimeout(incView, 2000);
      return () => clearTimeout(timer);
    }
  }, [id]);

  const handleSave = async () => {
    if (!isAuthenticated) { toast.error('Please login to save properties'); return; }
    if (!property) return;
    
    // Toggle state immediately for UI responsiveness (Optimistic UI)
    const wasSaved = isSaved;
    setIsSaved(!wasSaved);
    setSavingBookmark(true);

    try {
      if (wasSaved) {
        await axios.delete(`/api/saved/${property.id}`);
        toast.success((t) => (
          <span className="flex items-center gap-2">
            Removed from saved
            <button 
              onClick={() => { toast.dismiss(t.id); handleSave(); }}
              className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold hover:bg-primary-dark hover:text-white transition-colors"
            >
              Undo
            </button>
          </span>
        ));
      } else {
        await axios.post(`/api/saved/${property.id}`);
        toast.success((t) => (
          <span className="flex items-center gap-2">
            Property saved!
            <button 
              onClick={() => { toast.dismiss(t.id); handleSave(); }}
              className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold hover:bg-primary-dark hover:text-white transition-colors"
            >
              Undo
            </button>
          </span>
        ));
      }
    } catch (err) {
      setIsSaved(wasSaved); // Rollback on error
      toast.error(t('common.error'));
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleMessage = async () => {
    if (!isAuthenticated) { toast.error('Please login to message the landlord'); return; }
    if (!property?.users?.id) return;
    try {
      await axios.post('/api/messages/', {
        receiver_id: property.users.id,
        listing_id: property.id,
        content: `Hi, I'm interested in your property: "${property.title}". Is it still available?`
      });
      toast.success(t('common.success'));
      navigate('/dashboard/messages');
    } catch (err) {
      const msg = err?.response?.data?.message;
      // If already messaged, just navigate
      navigate('/dashboard/messages');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white border-b border-gray-100 h-14" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="h-[400px] bg-gray-200 rounded-3xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-6 bg-gray-200 rounded-full w-1/4" />
              <div className="h-10 bg-gray-200 rounded-full w-3/4" />
              <div className="h-8 bg-gray-200 rounded-full w-1/3" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {[1, 2, 3, 4].map(n => <div key={n} className="h-24 bg-gray-200 rounded-xl" />)}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-xl text-gray-500">{t('search.no_results')}</p>
        <Link to="/search" className="text-accent hover:underline font-medium">← {t('property.back_to_search')}</Link>
      </div>
    );
  }

  // Normalize data shape
  const images = (property.listing_photos || []).map(p => p.photo_url);
  const landlord = property.users || {};
  const reviews = property.reviews || [];
  const amenities = (property.amenities || []).map(a => {
    const key = typeof a === 'string' ? a.toLowerCase() : a;
    return { name: key.charAt(0).toUpperCase() + key.slice(1), icon: AMENITY_ICONS[key] || Sparkles };
  });

  // Build a shape the VisitBookingModal expects
  const bookingProp = {
    id: property.id,
    title: property.title,
    price: property.rent,
    images,
    landlord: { name: landlord.name || 'Landlord' },
    visit_days: property.visit_days || [],
    visit_slots: property.visit_slots || [],
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-14">
            <Link to="/search" aria-label={t('property.back_to_search')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> {t('property.back_to_search')}
            </Link>
            <div className="flex items-center gap-3">
              <button onClick={handleSave} disabled={savingBookmark}
                aria-label={isSaved ? "Remove from saved" : "Save property"}
                className={`p-2 rounded-full border transition-all ${isSaved ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-400 hover:text-gray-600'}`}>
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Share property link"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                    .then(() => toast.success(t('common.copy_success')))
                    .catch(() => toast.error(t('common.error')));
                }}
                title="Share property"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Gallery */}
          <PropertyGallery images={images} listingId={property.id} />

          {/* Content Grid */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & Price */}
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  {isChecking ? (
                    <span className="h-4 w-32 bg-gray-100 animate-pulse rounded" />
                  ) : isAuthenticated ? (
                    <span className="flex items-center gap-1">
                      {property.plot_no}{property.building_name ? `, ${property.building_name}` : ''}, {property.area}, {property.city}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 italic">
                      {property.area}, {property.city} 
                      <Link to="/auth/tenant" className="text-[10px] not-italic font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full hover:bg-primary hover:text-white transition-colors">{t('property.signed_out_address')}</Link>
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-heading font-bold text-gray-900 leading-tight">
                {property.bhk.includes('BHK') ? property.bhk : `${property.bhk} BHK`} {property.furnishing?.charAt(0).toUpperCase() + property.furnishing?.slice(1)} — {property.title}
              </h1>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">₹{property.rent?.toLocaleString()}</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[
                  { icon: Bed, label: t('property.bhk'), value: property.bhk },
                  { icon: Maximize, label: t('property.furnishing'), value: t(`property.${property.furnishing}`) || 'N/A' },
                  { icon: MapPin, label: t('property.area'), value: isAuthenticated ? (property.plot_no || property.area) : (property.area || 'Neighborhood') },
                  { icon: CheckCircle2, label: t('property.status'), value: t('property.active') },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-sm transition-shadow">
                    <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-xs text-gray-500 mb-0.5">{stat.label}</p>
                    <p className="font-bold text-gray-900 text-sm capitalize">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {property.description && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">{t('property.description')}</h2>
                  <p className="text-gray-600 leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Amenities */}
              {amenities.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">{t('property.amenities')}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {amenities.map((amenity) => (
                      <div key={amenity.name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary/30 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <amenity.icon className="w-5 h-5 text-primary" />
                        </div>
                        <p className="font-medium text-gray-900 text-sm">{amenity.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visit Availability */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">{t('property.visit_availability')}</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('property.preferred_days')}</p>
                    <div className="flex flex-wrap gap-2">
                      {property.visit_days?.length > 0 ? (
                        property.visit_days.map(day => (
                          <span key={day} className="px-3 py-1 bg-primary/5 text-primary border border-primary/20 rounded-full text-sm font-medium">
                            {t(`property.days.${day.toLowerCase()}`)}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Contact landlord for availability</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('property.preferred_slots')}</p>
                    <div className="flex flex-wrap gap-2">
                      {property.visit_slots?.length > 0 ? (
                        property.visit_slots.map(slot => (
                          <span key={slot} className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-sm font-medium">
                            {t(`property.slots.${slot.toLowerCase()}`)}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Flexible timing</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div id="reviews" className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm scroll-mt-24">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-heading font-bold text-gray-900">{t('property.reviews')}</h2>
                    {reviews.length > 0 && (
                      <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {reviews.length}
                      </span>
                    )}
                  </div>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2">
                      <StarRating rating={landlord.trust_score || 0} />
                      <span className="font-bold text-gray-900">{landlord.trust_score?.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">{t('search.no_results')}</p>
                    <p className="text-xs text-gray-400 mt-1">No reviews have been left for this property yet.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {reviews.map((review) => (
                      <div key={review.id} className="group relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/10 to-teal-500/10 border border-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {isAuthenticated ? (review.reviewer?.name || 'U').charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {isAuthenticated ? (review.reviewer?.name || t('property.verified_user')) : t('property.verified_user')}
                              </p>
                              <p className="text-[11px] text-gray-400 uppercase font-bold tracking-tighter">
                                {new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <StarRating rating={review.rating} />
                        </div>
                        
                        <div className="pl-14">
                          {(() => {
                            const parts = (review.comment || '').split('||PHOTOS||');
                            const cleanComment = parts[0];
                            const photos = parts[1] ? parts[1].split(',') : [];

                            return (
                              <>
                                {cleanComment && (
                                  <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">"{cleanComment}"</p>
                                )}
                                
                                {/* Review Photos */}
                                {photos.length > 0 && (
                                  <div className="flex gap-2.5 flex-wrap mt-3">
                                    {photos.map((url, idx) => (
                                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer" 
                                        className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group/img">
                                        <img
                                          src={url}
                                          alt={`Review photo ${idx + 1}`}
                                          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                        
                        {/* Type Badge */}
                        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-[10px] font-bold text-gray-300 uppercase">{review.type || 'Visit'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">{t('property.landlord')}</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {isAuthenticated ? (landlord.name || 'L').charAt(0) : <ShieldCheck className="w-7 h-7" />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {isChecking ? (
                        <span className="block h-5 w-24 bg-gray-100 animate-pulse rounded" />
                      ) : isAuthenticated ? (
                        landlord.name || 'Landlord'
                      ) : (
                        'Verified Landlord'
                      )}
                    </p>
                    <div className="flex items-center gap-1">
                      <StarRating rating={landlord.trust_score || 0} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {landlord.is_aadhaar_verified && (
                    <div className="flex items-center gap-2 text-sm group/tip relative">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700 border-b border-dotted border-gray-300 cursor-help">{t('common.verified')} (Aadhaar)</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">{t('common.verified')} (Phone)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm group/tip relative">
                    <StarFill className="w-4 h-4 text-amber-500" />
                    <span className="text-gray-700 border-b border-dotted border-gray-300 cursor-help">
                      {t('property.status')}: <span className="font-bold">{landlord.trust_score?.toFixed(1) || '0.0'}</span>
                    </span>
                  </div>
                </div>

                <button onClick={() => {
                   if (!isAuthenticated) return navigate(`/auth/tenant?redirect=/property/${property.id}`);
                   setIsBookingOpen(true);
                  }}
                  className="w-full py-3.5 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:shadow-accent/30 flex items-center justify-center gap-2 text-lg">
                  <CalendarDays className="w-5 h-5" />
                  {t('property.book_visit')}
                </button>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button className="py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                    onClick={handleMessage}
                  >
                    <MessageCircle className="w-4 h-4" /> {t('property.message')}
                  </button>
                  <button onClick={handleSave} disabled={savingBookmark}
                    className={`py-2.5 border rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      isSaved ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}>
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} /> {isSaved ? t('property.saved') : t('property.save')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VisitBookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} property={bookingProp} />
    </>
  );
}
