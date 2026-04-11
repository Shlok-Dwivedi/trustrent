import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Filter, MapPin, CheckCircle2, X, Loader2, SearchX, Search } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// ── Fix Leaflet's default icon paths broken by bundlers ──────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom TrustRent price-pill marker
function createPriceIcon(price, isSelected = false) {
  const bg = isSelected ? '#F59E0B' : '#0D7377';
  return L.divIcon({
    className: '',
    html: `<div style="background:${bg};color:#fff;padding:4px 10px;border-radius:20px;font-weight:700;font-size:12px;font-family:Inter,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid white;white-space:nowrap;">₹${(price / 1000).toFixed(0)}k</div>`,
    iconSize: [null, null],
    iconAnchor: [24, 12],
  });
}

// Sub-component: fly map to a lat/lng when card is clicked
function MapFlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15, { duration: 0.8 });
  }, [center, map]);
  return null;
}

// Sub-component: fly map to search result
function MapFlyToSearch({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 13, { duration: 1.0 });
  }, [center, map]);
  return null;
}

// Sub-component: debounced map move handler — waits 800ms after dragging stops
function MapMoveHandler({ onBoundsSettled }) {
  const map = useMap();
  const timerRef = useRef(null);

  useEffect(() => {
    const handleMoveEnd = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const c = map.getCenter();
        onBoundsSettled([c.lat, c.lng]);
      }, 800);
    };
    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [map, onBoundsSettled]);
  return null;
}

// ── Fallback demo data ────────────────────────────────────────────────────────
const FALLBACK = [
  { id: 'demo-1', title: 'Koramangala 5th Block', bhk: '2 BHK', rent: 25000,
    users: { trust_score: 4.5, is_aadhaar_verified: true, name: 'Rajesh K.' },
    listing_photos: [{ photo_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400' }],
    lat: 12.9352, lng: 77.6245, address: 'Koramangala, Bangalore' },
  { id: 'demo-2', title: 'Indiranagar 100ft Road', bhk: '1 BHK', rent: 18000,
    users: { trust_score: 4.2, is_aadhaar_verified: true, name: 'Priya M.' },
    listing_photos: [{ photo_url: 'https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?auto=format&fit=crop&q=80&w=400' }],
    lat: 12.9784, lng: 77.6408, address: 'Indiranagar, Bangalore' },
  { id: 'demo-3', title: 'HSR Layout Sector 2', bhk: '3 BHK', rent: 40000,
    users: { trust_score: 4.8, is_aadhaar_verified: true, name: 'Amit S.' },
    listing_photos: [{ photo_url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=400' }],
    lat: 12.9121, lng: 77.6446, address: 'HSR Layout, Bangalore' },
  { id: 'demo-4', title: 'JP Nagar 7th Phase', bhk: '2 BHK', rent: 22000,
    users: { trust_score: 4.0, is_aadhaar_verified: false, name: 'Sneha T.' },
    listing_photos: [{ photo_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=400' }],
    lat: 12.9077, lng: 77.5937, address: 'JP Nagar, Bangalore' },
];

const DEFAULT_CENTER = [12.9716, 77.5946]; // Bangalore

export default function PropertySearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [fetchCenter, setFetchCenter] = useState(DEFAULT_CENTER); // center used for API calls (debounced)
  const [searchFlyTarget, setSearchFlyTarget] = useState(null);   // one-shot fly for search bar
  const [searchQuery, setSearchQuery] = useState('');
  const cardRefs = useRef({});

  // Filter state
  const [maxRent, setMaxRent] = useState(100000);
  const [selectedBhk, setSelectedBhk] = useState(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = { lat: mapCenter[0], lng: mapCenter[1], radius: 15 };
      if (maxRent < 100000) params.max_rent = maxRent;
      if (selectedBhk) params.bhk = selectedBhk;

      const res = await axios.get('/api/search', { params });
      let listings = res.data?.data?.listings || [];

      // If no results nearby, widen to 100km city-level fallback
      if (listings.length === 0) {
        const wideRes = await axios.get('/api/search', {
          params: { ...params, radius: 100 }
        });
        listings = wideRes.data?.data?.listings || [];
      }

      setProperties(listings.length > 0 ? listings : FALLBACK);
      setUsingFallback(listings.length === 0);
    } catch {
      setProperties(FALLBACK);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, [maxRent, selectedBhk, mapCenter]);

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      if (res.data && res.data.length > 0) {
        setMapCenter([parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)]);
        setSearchFlyTarget([parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)]);
      } else {
        alert("Location not found");
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !searchQuery) {
      setSearchQuery(q);
      // We manually trigger the geocode logic for the initial mount
      const triggerInitialSearch = async () => {
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
          if (res.data && res.data.length > 0) {
            const loc = [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
            setMapCenter(loc);
            setSearchFlyTarget(loc);
          }
        } catch (err) {
          console.error("Initial geocoding failed", err);
        }
      };
      triggerInitialSearch();
    }
  }, [searchParams]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  // Normalise into a consistent display shape
  const display = properties
    .filter(p => !verifiedOnly || p.users?.is_aadhaar_verified)
    .map(p => ({
      id: p.id,
      title: p.title,
      type: typeof p.bhk === 'number' ? `${p.bhk} BHK` : p.bhk,
      price: p.rent,
      rating: p.users?.trust_score || 0,
      verified: p.users?.is_aadhaar_verified || false,
      image: p.listing_photos?.[0]?.photo_url || '',
      lat: parseFloat(p.lat),
      lng: parseFloat(p.lng),
      address: p.address,
      landlordName: p.users?.name,
    }));

  // Selected property for map flyTo
  const selected = display.find(p => p.id === selectedId);
  const flyTarget = selected ? [selected.lat, selected.lng] : null;

  const handleMarkerClick = (id) => {
    setSelectedId(id);
    // Scroll the card into view
    cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-gray-50">

      {/* Mobile Filter Toggle */}
      <div className="md:hidden p-3 bg-white border-b border-gray-200 flex gap-2">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 text-sm"
        >
          <Filter className="w-4 h-4" />
          {isFilterOpen ? 'Hide Filters' : 'Filters'}
        </button>
      </div>

      {/* ── FILTER PANEL ─────────────────────────────────────── */}
      <aside className={`
        ${isFilterOpen ? 'block' : 'hidden'} md:block
        w-full md:w-72 bg-white border-r border-gray-200 overflow-y-auto z-20
        absolute md:relative h-full shadow-xl md:shadow-none
      `}>
        <div className="p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            <button onClick={() => setIsFilterOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Max Rent */}
            <div>
              <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Max Rent</span>
                <span className="text-accent font-bold">₹{(maxRent / 1000).toFixed(0)}k</span>
              </label>
              <input type="range" min="5000" max="100000" step="5000"
                value={maxRent} onChange={e => setMaxRent(Number(e.target.value))}
                className="w-full accent-accent" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>₹5k</span><span>₹1L</span></div>
            </div>

            {/* BHK */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
              <div className="flex flex-wrap gap-2">
                {[null, '1BHK', '2BHK', '3BHK', 'Studio'].map(val => (
                  <button key={String(val)} onClick={() => setSelectedBhk(val)}
                    className={`flex-1 min-w-[60px] py-2 border rounded-lg text-sm font-medium transition-colors ${selectedBhk === val ? 'border-accent bg-accent/10 text-accent' : 'border-gray-200 text-gray-600 hover:border-accent hover:text-accent'}`}>
                    {val === null ? 'All' : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Verified toggle */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="flex items-center gap-1 text-sm font-bold text-gray-900">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Verified Only
                </span>
                <span className="text-xs text-gray-500">Aadhaar verified landlords</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>

            <button onClick={() => { setMaxRent(100000); setSelectedBhk(null); setVerifiedOnly(false); }}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm transition-colors">
              Clear Filters
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAP + LIST ──────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* Location Search Bar overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] md:w-[400px]">
          <form onSubmit={handleSearchLocation} className="relative">
             <input
               type="text"
               placeholder="Search a city or neighborhood..."
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full bg-white shadow-lg rounded-full px-5 py-3 pr-12 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent text-sm text-gray-800"
             />
             <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent hover:bg-accent-dark text-white rounded-full transition-colors">
               <SearchX className="w-4 h-4 hidden" /> {/* Hidden for lucide import mapping */}
               <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </button>
          </form>
          {usingFallback && (
            <div className="mt-2 mx-auto w-fit bg-amber-50 shadow-md rounded-full px-4 py-1 border border-amber-200 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              <span className="text-xs font-medium text-amber-700">Demo mode — Check backend connection</span>
            </div>
          )}
        </div>

        {/* Leaflet Map */}
        <div className="flex-1 relative z-0">
          <MapContainer
            center={mapCenter}
            zoom={13}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
          >
            <MapMoveHandler onBoundsSettled={setMapCenter} />
            {searchFlyTarget && <MapFlyToSearch center={searchFlyTarget} />}
            {/* CartoDB Voyager tiles — clean, modern, no API key needed */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {flyTarget && <MapFlyTo center={flyTarget} />}

            {display.map(prop => (
              <Marker
                key={prop.id}
                position={[prop.lat, prop.lng]}
                icon={createPriceIcon(prop.price, prop.id === selectedId)}
                eventHandlers={{ click: () => handleMarkerClick(prop.id) }}
              >
                <Popup>
                  <div className="text-sm font-medium">{prop.title}</div>
                  <div className="text-xs text-gray-500">₹{prop.price.toLocaleString()}/mo</div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Property Cards (bottom panel) */}
        <div className="h-[42vh] md:h-[44vh] bg-white border-t border-gray-200 overflow-y-auto px-4 py-4 md:px-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-900">
              {loading ? 'Searching…' : `${display.length} Properties Found`}
            </h3>
            <span className="text-sm text-gray-400">Sorted by relevance</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
                  <div className="h-40 bg-gray-200 w-full" />
                  <div className="p-3 flex flex-col flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                    <div className="mt-auto pt-2 flex justify-between items-center border-t border-gray-50 mt-2">
                       <div className="h-5 bg-gray-200 rounded w-1/3" />
                       <div className="h-6 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : display.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3">
              <SearchX className="w-10 h-10" />
              <p className="font-medium">No properties match your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {display.map(prop => (
                <div
                  key={prop.id}
                  ref={el => cardRefs.current[prop.id] = el}
                  onClick={() => setSelectedId(prop.id)}
                  className={`group flex flex-col bg-white rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 ${
                    prop.id === selectedId
                      ? 'border-accent shadow-md shadow-accent/10 ring-1 ring-accent/30'
                      : 'border-gray-100 shadow-sm hover:shadow-md hover:border-accent/30'
                  }`}
                >
                  <div className="relative h-40 overflow-hidden">
                  {prop.image ? (
                    <img src={prop.image} alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-teal-100 flex items-center justify-center">
                      <span className="text-primary/50 text-sm font-medium">No Photo</span>
                    </div>
                  )}
                    {prop.verified && (
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-bold text-gray-700">Verified</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <h4 className="font-bold text-gray-900 truncate group-hover:text-accent transition-colors text-sm">{prop.title}</h4>
                    <p className="text-gray-400 text-xs mt-0.5">{prop.type}{prop.landlordName ? ` · ${prop.landlordName}` : ''}</p>
                    <div className="mt-auto pt-2 flex justify-between items-center border-t border-gray-50 mt-2">
                      <div>
                        <span className="text-base font-bold text-gray-900">₹{prop.price.toLocaleString()}</span>
                        <span className="text-xs text-gray-400">/mo</span>
                      </div>
                      <div className="flex gap-2">
                        {prop.rating > 0 && (
                          <span className="flex items-center gap-0.5 bg-gray-50 px-1.5 py-0.5 rounded text-xs font-bold text-gray-700">
                            ★ {prop.rating}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/property/${prop.id}`);
                          }}
                          className="px-2.5 py-1 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-dark transition-colors cursor-pointer"
                        >
                          View →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
