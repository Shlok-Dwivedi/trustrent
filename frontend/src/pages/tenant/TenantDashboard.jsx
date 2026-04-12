import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Search, Calendar, Heart, MessageSquare, User,
  ShieldCheck, Star, ChevronRight, Loader2,
  MapPin, Clock, AlertCircle, CheckCircle2, Home
} from 'lucide-react';

// ─── Quick Action Card ────────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, sub, to, accent }) {
  return (
    <Link
      to={to}
      className="group bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md hover:border-primary/20 transition-all duration-200"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" />
    </Link>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    confirmed: 'bg-green-100 text-green-700',
    pending:   'bg-amber-100 text-amber-700',
    declined:  'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
    requested: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

import { EmojiSmile, StarFill, RocketTakeoff, Check2Circle } from 'react-bootstrap-icons';

export default function TenantDashboard() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [tenancies, setTenancies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      axios.get('/api/bookings/'),
      axios.get('/api/tenancies/')
    ])
      .then(([bRes, tRes]) => {
        setBookings(bRes.data?.data?.bookings || []);
        setTenancies(tRes.data?.data?.tenancies || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  // Find the most relevant tenancy (Active or Requested)
  const activeTenancy = tenancies.find(t => ['active', 'requested'].includes(t.status));
  const now = new Date();
  const upcoming = bookings.filter(b =>
    ['pending', 'confirmed'].includes(b.status) && new Date(b.slot_date) >= now
  );
  const nextVisit = upcoming[0];
  const profileComplete = user.is_aadhaar_verified && user.name && user.email;

  const handleCheckout = async (id) => {
    if (!window.confirm('Are you sure you want to end this tenancy?')) return;
    try {
      await axios.patch(`/api/tenancies/${id}/end`);
      toast.success('Tenancy ended. Please leave a review!');
      setTenancies(prev => prev.map(t => t.id === id ? { ...t, status: 'ended' } : t));
    } catch {
      toast.error('Failed to end tenancy');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900 flex items-center gap-2">
          Welcome back, {user.name?.split(' ')[0] || 'there'} <EmojiSmile className="text-accent" />
        </h1>
        <p className="text-gray-500 mt-1">Here's your rental journey at a glance.</p>
      </div>

      {/* ── Active Tenancy Highlight ─────────────────────────────────── */}
      {activeTenancy && (
        <div className="bg-white border-2 border-primary rounded-2xl p-6 mb-8 shadow-xl shadow-primary/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3">
             <RocketTakeoff className="w-12 h-12 text-primary/10 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Home className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-bold text-primary uppercase tracking-wider">
              {activeTenancy.status === 'active' ? 'Your Current Home' : 'Move-In Request Sent'}
            </p>
          </div>
          {activeTenancy.status === 'requested' && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-600" />
              <p className="text-xs text-amber-700 font-medium italic">
                Waiting for the landlord to confirm your occupation...
              </p>
            </div>
          )}
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{activeTenancy.listing?.title}</h2>
              <p className="text-gray-500 flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" /> {activeTenancy.listing?.address}
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Landlord:</span>
                  <span className="font-semibold text-gray-700">{activeTenancy.landlord?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Started:</span>
                  <span className="font-semibold text-gray-700">
                    {new Date(activeTenancy.start_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 self-end md:self-center">
              <button 
                onClick={() => handleCheckout(activeTenancy.id)}
                className="w-full sm:w-auto px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors"
                >
                End Tenancy
              </button>
              <Link 
                to={`/property/${activeTenancy.listing_id}`}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white hover:bg-primary-dark rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                View Details <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile Completion Banner ────────────────────────────────── */}
      {!profileComplete && (
        <Link
          to="/dashboard/profile"
          className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 hover:bg-amber-100 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-amber-900 text-sm">Complete your profile to build trust</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {!user.is_aadhaar_verified ? 'Verify Aadhaar (+2 trust score)' : 'Add your email address'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      {/* ── Next Visit Highlight ─────────────────────────────────────── */}
      {nextVisit && (
        <div className="bg-gradient-to-r from-primary to-teal-500 rounded-2xl p-6 mb-8 text-white shadow-lg shadow-primary/20">
          <p className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">Next Upcoming Visit</p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{nextVisit.listing?.title || 'Property Visit'}</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-white/80">
                {nextVisit.listing?.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {nextVisit.listing.address}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(nextVisit.slot_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {nextVisit.slot_time}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                nextVisit.status === 'confirmed' ? 'bg-green-400/30 text-white' : 'bg-white/20 text-white'
              }`}>
                {nextVisit.status}
              </span>
              <Link
                to="/dashboard/visits"
                className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-colors"
              >
                Manage <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats Row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Star}
          label="Trust Score"
          value={<span>{user.trust_score?.toFixed(1) || '0.0'}<StarFill className="inline ml-1 mb-1" /></span>}
          color="bg-amber-50 text-amber-500"
        />
        <StatCard
          icon={Calendar}
          label="Upcoming Visits"
          value={upcoming.length}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="Confirmed Visits"
          value={bookings.filter(b => b.status === 'confirmed').length}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={ShieldCheck}
          label="Aadhaar"
          value={user.is_aadhaar_verified ? 'Verified' : 'Pending'}
          color={user.is_aadhaar_verified ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}
        />
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            icon={Search}
            label="Search Properties"
            sub="Find your next home"
            to="/search"
            accent="bg-primary/10 text-primary group-hover:bg-primary/20"
          />
          <QuickAction
            icon={Calendar}
            label="My Visits"
            sub={`${upcoming.length} upcoming`}
            to="/dashboard/visits"
            accent="bg-accent/10 text-accent group-hover:bg-accent/20"
          />
          <QuickAction
            icon={Heart}
            label="Saved Properties"
            sub="Your shortlist"
            to="/dashboard/saved"
            accent="bg-red-50 text-red-500 group-hover:bg-red-100"
          />
          <QuickAction
            icon={MessageSquare}
            label="Messages"
            sub="Chat with landlords"
            to="/dashboard/messages"
            accent="bg-teal-50 text-teal-600 group-hover:bg-teal-100"
          />
        </div>
      </div>

      {/* ── Recent Bookings ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Visit Requests</h2>
          {bookings.length > 3 && (
            <Link to="/dashboard/visits" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-gray-400 py-6">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading visits…
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <Home className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-3">No visit requests yet</p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors"
            >
              <Search className="w-4 h-4" /> Browse Properties
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              {bookings.slice(0, 4).map(booking => (
                <div key={booking.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="bg-primary/5 rounded-xl p-3 text-center min-w-14 flex-shrink-0">
                    <p className="text-[10px] font-bold text-primary uppercase">
                      {new Date(booking.slot_date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {new Date(booking.slot_date).getDate()}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{booking.listing?.title || 'Property Visit'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {booking.slot_time}
                      {booking.landlord?.name ? ` · with ${booking.landlord.name}` : ''}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))}
            </div>
            {bookings.length > 4 && (
              <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50">
                <Link to="/dashboard/visits" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
                  View all {bookings.length} visits <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
