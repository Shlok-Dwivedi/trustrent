import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [secret, setSecret] = useState('');
  const { adminLogin, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!secret) return;
    const success = await adminLogin(secret);
    if (success) {
      toast.success('Admin access granted');
      navigate('/admin/dashboard');
    } else {
      toast.error('Invalid passphrase');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-800/50 z-10">
        <div className="p-10 text-center border-b border-white/5">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/30">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">Restricted Area</h1>
          <p className="text-slate-400 text-sm mt-3 tracking-wide">Enter the system passphrase to establish connection.</p>
        </div>
        <form onSubmit={handleLogin} className="p-10">
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Key className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="password"
              placeholder="System Passphrase"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !secret}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-[0.98]"
          >
            {isLoading ? 'Verifying...' : 'Initialize Override'}
          </button>
        </form>
      </div>

      <div className="absolute bottom-6 text-slate-600 text-xs tracking-widest uppercase">
        TrustRent Admin Infrastructure
      </div>
    </div>
  );
}
