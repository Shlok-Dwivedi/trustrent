import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function LandlordAuthFlow() {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  
  const { sendOTP, verifyOTP, setupProfile, isLoading, error, isAuthenticated, user: authUser } = useAuthStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated && !authUser?.is_profile_complete) {
      setStep(3);
      if (authUser?.mobile) setMobile(authUser.mobile);
    }
  }, [isAuthenticated, authUser]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    const success = await sendOTP(mobile);
    if (success) setStep(2);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const { success, is_new, user } = await verifyOTP(mobile, otp);
    if (success) {
      if (is_new || !user?.is_profile_complete) {
        setStep(3);
      } else if (user?.role && user?.role !== 'landlord') {
        useAuthStore.getState().logout();
        setStep(1);
        alert("SECURITY BLOCK: This phone number is already registered to a Tenant account!");
      } else {
        navigate('/landlord/dashboard'); 
      }
    }
  };

  const handleSetupProfile = async (e) => {
    e.preventDefault();
    const success = await setupProfile({ name, role: 'landlord' });
    if (success) {
      navigate('/landlord/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        
        <div className="mb-8 text-center">
          <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-xl font-bold text-accent">L</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Landlord Registration</h1>
          <p className="text-gray-500 mt-2 text-sm">List properties and find verified tenants.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {/* STEP 1: PHONE */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 sm:text-sm">
                  +91
                </span>
                <input 
                  type="tel" 
                  value={mobile} onChange={(e) => setMobile(e.target.value)}
                  placeholder="99999 99999"
                  className="flex-1 min-w-0 block w-full px-4 py-3 rounded-none rounded-r-lg border border-gray-200 focus:ring-accent focus:border-accent sm:text-sm outline-none" 
                  required 
                  maxLength={10} minLength={10}
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading || mobile.length < 10}
              className="w-full bg-accent hover:bg-accent-dark disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
            <p className="text-center text-sm text-gray-500">
              Are you a Tenant? <Link to="/auth/tenant" className="text-accent hover:underline">Register here</Link>
            </p>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">We've sent a 6-digit code to</p>
              <p className="font-bold text-gray-900">+91 {mobile}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter Verification Code</label>
              <input 
                type="text" 
                value={otp} onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="block w-full text-center tracking-[0.5em] font-mono text-2xl border-b-2 border-gray-200 focus:border-accent px-4 py-3 bg-transparent outline-none transition-colors" 
                required 
                maxLength={6} minLength={6}
              />
              <p className="mt-2 text-xs text-gray-400 text-center">Tip: Check python backend console for the MOCK SMS</p>
            </div>
            <button 
              type="submit" 
              disabled={isLoading || otp.length < 6}
              className="w-full bg-accent hover:bg-accent-dark disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? 'Verifying...' : 'Verify Phone'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-500 hover:text-gray-900 mt-2">
              &larr; Change number
            </button>
          </form>
        )}

        {/* STEP 3: SETUP PROFILE */}
        {step === 3 && (
          <form onSubmit={handleSetupProfile} className="space-y-6">
            <div className="mb-6">
              <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
                Number Verified ✓
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Rajesh Kumar"
                className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-accent focus:border-accent sm:text-sm outline-none" 
                required 
              />
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-amber-100 mb-4">
              <p className="text-sm text-amber-800 font-medium tracking-tight">Your role is set to <strong>Landlord</strong></p>
              <p className="text-xs text-amber-600 mt-1">You will be managing properties and verifying tenants.</p>
            </div>
            <button 
              type="submit" 
              disabled={isLoading || !name}
              className="w-full bg-accent hover:bg-accent-dark disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? 'Saving...' : 'Complete Setup & Go to Dashboard'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
