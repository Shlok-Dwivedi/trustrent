import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Shield, ShieldCheck, Star, LogOut, X } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  // Aadhaar Modal state
  const [isAadhaarModalOpen, setIsAadhaarModalOpen] = useState(false);
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [verifyingAadhaar, setVerifyingAadhaar] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('/api/auth/setup-profile', { name, email, role: user?.role });
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAadhaarVerify = async () => {
    if (aadhaarInput.length !== 4) {
      toast.error('Please enter exactly 4 digits');
      return;
    }
    setVerifyingAadhaar(true);
    try {
      const res = await axios.post('/api/auth/verify-aadhaar', { aadhaar_last_4: aadhaarInput });
      toast.success(res.data.message || 'Verified successfully!');
      // Update local store user object so UI reflects the new verification state immediately
      useAuthStore.setState({ user: res.data.data.user });
      setIsAadhaarModalOpen(false);
      setAadhaarInput('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Verification failed');
    } finally {
      setVerifyingAadhaar(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading profile…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="grid gap-8">
        {/* Trust Score Card */}
        <div className="bg-gradient-to-br from-primary to-teal-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.name || 'User'}</h2>
              <p className="text-teal-100 capitalize">{user.role || 'Not set'}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <Star className="w-5 h-5 mx-auto mb-1 text-amber-300" />
              <p className="text-2xl font-bold">{user.trust_score?.toFixed(1) || '0.0'}</p>
              <p className="text-xs text-teal-100">Trust Score</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <Phone className="w-5 h-5 mx-auto mb-1 text-green-300" />
              <p className="text-sm font-bold mt-1">✓ Verified</p>
              <p className="text-xs text-teal-100">Phone</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <Shield className="w-5 h-5 mx-auto mb-1" />
              <p className="text-sm font-bold mt-1">{user.is_aadhaar_verified ? '✓ Verified' : 'Pending'}</p>
              <p className="text-xs text-teal-100">Aadhaar</p>
            </div>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> Trust Score Breakdown
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-800">Identity Verification</p>
                <p className="text-xs text-gray-500">Aadhaar-based authentication</p>
              </div>
              <span className={`font-mono font-bold ${user.is_aadhaar_verified ? 'text-green-600' : 'text-gray-400'}`}>
                {user.is_aadhaar_verified ? '+2.00' : '+0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div>
                <p className="font-bold text-gray-800">Community Reputation</p>
                <p className="text-xs text-gray-500">Average of tenant & landlord reviews</p>
              </div>
              <span className="font-mono font-bold text-primary">
                +{Math.max(0, (user.trust_score || 0) - (user.is_aadhaar_verified ? 2 : 0)).toFixed(2)}
              </span>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-xl flex gap-3 text-xs text-blue-700">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <p>Your Trust Score is visible to landlords/tenants when you book or list properties to ensure a safe community.</p>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">Personal Information</h2>
          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4" /> Full Name
              </label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-accent focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4" /> Email (optional)
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-accent focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4" /> Mobile
              </label>
              <input
                type="text" value={`+91 ${user.mobile || ''}`} disabled
                className="block w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <button
                type="submit" disabled={saving}
                className="px-6 py-3 bg-accent hover:bg-accent-dark text-white font-bold rounded-lg transition-colors disabled:bg-gray-300"
              >
                {saving ? 'Saving…' : 'Update Profile'}
              </button>
              <button
                type="button" onClick={logout}
                className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </form>
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">Verification Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-100">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Phone Number</p>
                  <p className="text-sm text-gray-500">+91 {user.mobile}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">VERIFIED</span>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-xl border ${user.is_aadhaar_verified ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
              <div className="flex items-center gap-3">
                <ShieldCheck className={`w-5 h-5 ${user.is_aadhaar_verified ? 'text-green-600' : 'text-amber-600'}`} />
                <div>
                  <p className="font-medium text-gray-900">Aadhaar Verification</p>
                  <p className="text-sm text-gray-500">{user.is_aadhaar_verified ? 'Identity verified via Aadhaar' : 'Verify to boost your trust score by +2'}</p>
                </div>
              </div>
              {user.is_aadhaar_verified ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">VERIFIED</span>
              ) : (
                <button onClick={() => setIsAadhaarModalOpen(true)} className="px-4 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-bold rounded-lg transition-colors">
                  Verify Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Aadhaar Verification Modal */}
      {isAadhaarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Verify Identity</h3>
                  <p className="text-gray-500 text-sm">Boost your trust score by verifying your Aadhaar</p>
                </div>
                <button onClick={() => setIsAadhaarModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3 text-sm text-amber-800">
                <ShieldCheck className="w-5 h-5 shrink-0 text-amber-500" />
                <p>We do not store your full Aadhaar. Enter only the <strong>last 4 digits</strong> for simulation purposes.</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Last 4 Digits of Aadhaar</label>
                <input
                  type="text"
                  maxLength={4}
                  value={aadhaarInput}
                  onChange={e => setAadhaarInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 1234"
                  className="w-full text-center tracking-[0.5em] text-2xl font-bold px-4 py-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                  autoFocus
                />
              </div>

              <button
                onClick={handleAadhaarVerify}
                disabled={verifyingAadhaar || aadhaarInput.length !== 4}
                className="w-full py-3.5 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyingAadhaar ? 'Verifying...' : 'Submit & Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
