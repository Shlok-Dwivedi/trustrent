import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Home, Activity, LogOut, CheckCircle, Ban, RefreshCw, Trash2, EyeOff, Eye, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ total_users: 0, total_listings: 0, total_bookings: 0 });
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [st, us, ls] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/listings')
      ]);
      setStats(st.data.data);
      setUsers(us.data.data.users);
      setListings(ls.data.data.listings);
    } catch (error) {
      toast.error('Failed to sync system data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('WARNING: Irreversibly delete this user and ALL their data?')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      toast.success('User purged from system');
      fetchData();
    } catch (err) {
      toast.error('Failed to purge user');
    }
  };

  const handleToggleArchive = async (id) => {
    try {
      const res = await axios.patch(`/api/admin/listings/${id}/toggle-archive`);
      toast.success(res.data.data.message);
      fetchData();
    } catch (err) {
      toast.error('Failed to update listing status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-slate-200 selection:bg-red-500/30">
      
      {/* ── HEADER ── */}
      <header className="bg-slate-900/50 backdrop-blur-lg border-b border-slate-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/20 rounded flex items-center justify-center ring-1 ring-red-500/50">
              <Activity className="w-4 h-4 text-red-500" />
            </div>
            <span className="font-bold tracking-widest uppercase text-sm">Nexus Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchData} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white group">
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-4 py-2 rounded-lg transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Disconnect
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', ring: 'ring-blue-400/30' },
            { label: 'Active Listings', value: stats.total_listings, icon: Home, color: 'text-emerald-400', bg: 'bg-emerald-400/10', ring: 'ring-emerald-400/30' },
            { label: 'System Bookings', value: stats.total_bookings, icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-400/10', ring: 'ring-purple-400/30' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-32 h-32 ${s.bg} rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110`}></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">{s.label}</p>
                  <h3 className="text-4xl font-light text-white">{isLoading ? '-' : s.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg} ${s.color} ring-1 ${s.ring}`}>
                  <s.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-2 mb-6 bg-slate-900/40 p-1.5 rounded-xl border border-slate-800/50 w-fit">
          {[
            { id: 'users', label: 'Identity Matrix' },
            { id: 'listings', label: 'Property Ledger' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold tracking-wider uppercase transition-all ${
                activeTab === tab.id 
                  ? 'bg-slate-800 text-white shadow-lg ring-1 ring-white/10' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── CONTENT AREA ── */}
        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/80 rounded-2xl overflow-hidden relative min-h-[400px]">
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
               <RefreshCw className="w-8 h-8 text-slate-500 animate-spin" />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-500 uppercase">User ID</th>
                    <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-500 uppercase">Name & Role</th>
                    <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-500 uppercase">Contact</th>
                    <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono text-slate-400">{u.id.substring(0,8)}...</div>
                        <div className="text-[10px] text-slate-600 mt-1">{new Date(u.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-200">{u.name || 'Incomplete Setup'}</div>
                        <div className="text-xs capitalize text-slate-500 mt-0.5">{u.role || 'Unassigned'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-300">{u.mobile}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all ring-1 ring-rose-500/30"
                          title="Purge User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && !isLoading && (
                     <tr><td colSpan="4" className="text-center py-10 text-slate-500">No user data found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'listings' && (
             <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-900/80 border-b border-slate-800">
                   <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-500 uppercase">Property ID</th>
                   <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-500 uppercase">Details</th>
                   <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-500 uppercase">Landlord</th>
                   <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-500 uppercase">Status</th>
                   <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-500 uppercase text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/50">
                 {listings.map(l => (
                   <tr key={l.id} className={`transition-colors ${l.is_archived ? 'bg-slate-900/80 opacity-60' : 'hover:bg-slate-800/30'}`}>
                     <td className="px-6 py-4">
                       <div className="text-xs font-mono text-slate-400">{l.id.substring(0,8)}...</div>
                       <div className="text-[10px] text-slate-600 mt-1">{new Date(l.created_at).toLocaleDateString()}</div>
                     </td>
                     <td className="px-6 py-4">
                       <div className="font-bold text-slate-200">{l.title}</div>
                       <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                          <MapPin className="w-3 h-3" /> {l.address}
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <div className="text-sm font-medium text-slate-300">{l.users?.name || 'Unknown'}</div>
                       <div className="text-xs text-slate-500">{l.users?.mobile}</div>
                     </td>
                     <td className="px-6 py-4 flex flex-col gap-2">
                       <div>
                         {l.is_archived ? (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30">
                             <EyeOff className="w-3 h-3" /> Archived
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
                             <CheckCircle className="w-3 h-3" /> Active
                           </span>
                         )}
                       </div>
                       <div>
                         {l.status === 'rented' ? (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30">
                             <Users className="w-3 h-3" /> Occupied
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/30">
                             <Home className="w-3 h-3" /> Empty
                           </span>
                         )}
                       </div>
                     </td>
                     <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => handleToggleArchive(l.id)}
                         className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ring-1 ${
                           l.is_archived 
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 ring-slate-700' 
                            : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white ring-amber-500/30'
                         }`}
                       >
                         {l.is_archived ? <><Eye className="w-3.5 h-3.5"/> Restore</> : <><Ban className="w-3.5 h-3.5"/> Takedown</>}
                       </button>
                     </td>
                   </tr>
                 ))}
                 {listings.length === 0 && !isLoading && (
                     <tr><td colSpan="5" className="text-center py-10 text-slate-500">No properties found.</td></tr>
                  )}
               </tbody>
             </table>
           </div>
          )}

        </div>

      </main>
    </div>
  );
}
