import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { StarFill, Check2Circle, GraphUpArrow, Map, ShieldLock } from 'react-bootstrap-icons';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get('/api/listings/recent');
        setFeatured(res.data?.data?.listings || []);
      } catch (err) {
        console.error('Failed to fetch featured listings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-dark via-primary to-teal-500 text-white py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1920')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 tracking-tight">
            {t('landing.hero_title')}
          </h1>
          <p className="text-lg md:text-2xl mb-10 text-teal-50 max-w-2xl mx-auto">
            {t('landing.hero_subtitle')}
          </p>
          
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto bg-white rounded-full p-2 flex shadow-2xl items-center focus-within:ring-4 focus-within:ring-accent/50 transition-all">
            <span className="pl-6 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search.search_placeholder')} 
              className="flex-1 bg-transparent border-none px-4 py-3 text-gray-800 focus:outline-none text-lg"
            />
            <button type="submit" className="bg-accent hover:bg-accent-dark text-white px-8 py-3 rounded-full font-bold transition-colors">
              {t('nav.search')}
            </button>
          </form>

          <div className="mt-12 flex justify-center gap-8 text-sm font-medium text-teal-100">
            <span className="flex items-center gap-2"><StarFill className="text-accent" /> 10,000+ {t('common.verified')}</span>
            <span className="flex items-center gap-2"><StarFill className="text-accent" /> 50,000+ {t('handshake.mutual_confirmation')}</span>
          </div>
        </div>
      </section>

      {/* Why TrustRent */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-center text-gray-900 mb-12">{t('landing.why_trustrent')}</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { title: t('landing.feature_1_title'), desc: t('landing.feature_1_desc'), icon: <Check2Circle className="text-green-500" /> },
              { title: t('property.status'), desc: t('landing.feature_2_desc'), icon: <GraphUpArrow className="text-blue-500" /> },
              { title: t('landing.feature_3_title'), desc: t('landing.feature_3_desc'), icon: <Map className="text-teal-500" /> },
              { title: t('landing.feature_4_title'), desc: t('landing.feature_4_desc'), icon: <ShieldLock className="text-orange-500" /> }
            ].map((feature, idx) => (
               <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                 <div className="text-4xl mb-4">{feature.icon}</div>
                 <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                 <p className="text-gray-600">{feature.desc}</p>
               </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-heading font-bold text-gray-900">{t('landing.recent_title')}</h2>
              <p className="text-gray-500 mt-2">{t('landing.hero_subtitle')}</p>
            </div>
            <Link to="/search" className="text-primary font-medium hover:text-primary-dark">{t('landing.view_all')} &rarr;</Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl" />)
            ) : featured.length === 0 ? (
              <div className="col-span-full py-20 text-center text-gray-400">
                {t('search.no_results')}
              </div>
            ) : (
              featured.map(prop => (
                <Link to={`/property/${prop.id}`} key={prop.id} className="group cursor-pointer rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img src={prop.listing_photos?.[0]?.photo_url || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800'} 
                      alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-green-700 flex items-center shadow-sm">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {t('common.verified')}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{prop.title}</h3>
                    </div>
                    <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                      <Map className="w-3 h-3 text-teal-500" /> {prop.area || prop.city}
                    </p>
                    <p className="text-gray-400 text-sm mb-4">{prop.bhk}</p>
                    <div className="mt-auto text-xl font-bold text-primary-dark">
                      ₹{prop.rent.toLocaleString()}<span className="text-sm font-normal text-gray-500">/mo</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
