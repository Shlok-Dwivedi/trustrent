import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { Menu, X, Search, User, Bookmark, LayoutDashboard, Bell, CheckCheck, MessageSquare, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();

  const dashboardLink = user?.role === 'landlord' ? '/landlord/dashboard' : '/tenant/dashboard';

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  React.useEffect(() => {
    setMobileMenuOpen(false);
    setShowNotifs(false);
  }, [location.pathname]);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifs = async () => {
      try {
        const res = await axios.get('/api/notifications/');
        setNotifications(res.data?.data?.notifications || []);
      } catch (err) {
        console.warn('Failed to load notifications');
      }
    };
    fetchNotifs();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await axios.patch('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({...n, is_read: true})));
    } catch {}
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-[2000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">
                T
              </div>
              <span className="font-heading font-bold text-xl text-primary-dark">
                TrustRent
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/search" className="text-gray-500 hover:text-primary font-medium transition-colors flex items-center gap-1.5">
              <Search className="w-4 h-4" /> {t('nav.search')}
            </Link>
            <Link to="/how-it-works" className="text-gray-500 hover:text-primary font-medium transition-colors">
              {t('nav.how_it_works')}
            </Link>
            {isAuthenticated && (
              <>
                <Link to={dashboardLink} className="text-gray-500 hover:text-primary font-medium transition-colors flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" /> {t('nav.dashboard')}
                </Link>
                <Link to="/dashboard/saved" className="text-gray-500 hover:text-primary font-medium transition-colors flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4" /> {t('nav.saved')}
                </Link>
                <Link to="/dashboard/messages" className="text-gray-500 hover:text-primary font-medium transition-colors flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> {t('nav.messages')}
                </Link>
              </>
            )}
          </nav>

          {/* Auth / Profile / Language */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 text-gray-500 hover:text-primary transition-all font-bold text-xs uppercase"
            >
              <Languages className="w-4 h-4" />
              <span>{i18n.language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="p-2 text-gray-500 hover:text-primary transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>
                  
                  {/* Dropdown */}
                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1">
                            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-400 text-sm">No notifications yet.</div>
                        ) : (
                          <div className="divide-y divide-gray-50">
                            {notifications.map(n => (
                              <div key={n.id} className={`p-4 ${!n.is_read ? 'bg-primary/5' : 'bg-white'}`}>
                                <p className={`text-sm ${!n.is_read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                  {n.message}
                                </p>
                                <span className="text-[10px] text-gray-400 mt-1 block uppercase font-bold tracking-wider">
                                  {new Date(n.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link to="/dashboard/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{user?.name || t('nav.profile')}</span>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full capitalize">{user?.role}</span>
                </Link>
                <button onClick={logout} className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors">
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <>
                <Link to="/auth/tenant" className="text-primary hover:text-primary-dark font-medium transition-colors">
                  {t('nav.tenant_login')}
                </Link>
                <Link to="/auth/landlord" className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-full font-medium transition-all shadow-sm hover:shadow">
                  {t('nav.landlord_signup')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="md:hidden p-2 text-gray-500" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            <Link to="/search" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Search Properties</Link>
            <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-medium">How it Works</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-medium">About</Link>
            {isAuthenticated ? (
              <>
                <Link to={dashboardLink} onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Dashboard</Link>
                <Link to="/dashboard/saved" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Saved Properties</Link>
                <Link to="/dashboard/messages" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-medium">Messages</Link>
                <Link to="/dashboard/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-medium">My Profile</Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block py-2 text-red-500 font-medium">Logout</button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/auth/tenant" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 border border-primary text-primary rounded-lg font-medium">Tenant Login</Link>
                <Link to="/auth/landlord" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 bg-primary text-white rounded-lg font-medium">Landlord Sign up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
