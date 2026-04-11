import { useTranslation } from 'react-i18next';

const MOCK_PROPERTIES = [
  { id: 1, title: 'Koramangala 5th Block', rent: '₹22,000', type: '2 BHK', trustScore: 4.5, verified: true, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800' },
  { id: 2, title: 'Whitefield', rent: '₹18,000', type: '1 BHK', trustScore: 4.2, verified: true, image: 'https://images.unsplash.com/photo-1502672260266-1c1de2d9d344?auto=format&fit=crop&q=80&w=800' },
  { id: 3, title: 'Indiranagar', rent: '₹35,000', type: '3 BHK', trustScore: 4.8, verified: true, image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800' },
  { id: 4, title: 'HSR Layout', rent: '₹28,000', type: '2 BHK', trustScore: 4.6, verified: true, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800' },
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();

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
              placeholder="Search by area, locality, or city..." 
              className="flex-1 bg-transparent border-none px-4 py-3 text-gray-800 focus:outline-none text-lg"
            />
            <button type="submit" className="bg-accent hover:bg-accent-dark text-white px-8 py-3 rounded-full font-bold transition-colors">
              {t('nav.search')}
            </button>
          </form>

          <div className="mt-12 flex justify-center gap-4 text-sm font-medium text-teal-100">
            <span className="flex items-center"><span className="text-accent mr-1">⭐</span> 10,000+ Verified Properties</span>
            <span className="flex items-center"><span className="text-accent mr-1">⭐</span> 50,000+ Trust Matches</span>
          </div>
        </div>
      </section>

      {/* Why TrustRent */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-center text-gray-900 mb-12">Why TrustRent?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { title: 'Dual Verified', desc: 'Both tenants & landlords verify identity', icon: '✅' },
              { title: 'Trust Score', desc: 'Real reviews from actual visits', icon: '📊' },
              { title: 'Map-First', desc: 'See properties visually by area', icon: '🗺️' },
              { title: 'Fraud Proof', desc: 'Aadhaar hash prevents fake accounts', icon: '🔒' }
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
              <h2 className="text-3xl font-heading font-bold text-gray-900">Featured Properties</h2>
              <p className="text-gray-500 mt-2">Verified listings in top localities</p>
            </div>
            <Link to="/search" className="text-primary font-medium hover:text-primary-dark">View All &rarr;</Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_PROPERTIES.map(prop => (
              <Link to={`/property/demo-${prop.id}`} key={prop.id} className="group cursor-pointer rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img src={prop.image} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {prop.verified && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-green-700 flex items-center shadow-sm">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      Verified
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{prop.title}</h3>
                    <div className="flex items-center text-sm font-medium">
                      <span className="text-accent mr-1">★</span>{prop.trustScore}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">{prop.type}</p>
                  <div className="mt-auto text-xl font-bold text-primary-dark">
                    {prop.rent}<span className="text-sm font-normal text-gray-500">/mo</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
