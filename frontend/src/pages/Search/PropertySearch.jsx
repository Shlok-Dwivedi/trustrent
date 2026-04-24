import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { StarFill, Search as SearchIcon } from 'react-bootstrap-icons';
import { Filter, MapPin, CheckCircle2, X, Loader2, SearchX, Search, Heart } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { PropertyImagePlaceholder } from '../../components/property/PropertyImagePlaceholder';

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
function MapFlyTo({ center, onComplete }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 0.8 });
      if (onComplete) onComplete();
    }
  }, [center, map, onComplete]);
  return null;
}

// Sub-component: fly map to search result
function MapFlyToSearch({ center, onComplete }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { duration: 1.0 });
      if (onComplete) onComplete();
    }
  }, [center, map, onComplete]);
  return null;
}

// Sub-component: debounced map move handler
function MapMoveHandler({ onBoundsSettled }) {
  const map = useMap();
  const timerRef = useRef(null);

  useEffect(() => {
    const handleMoveEnd = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const c = map.getCenter();
        const z = map.getZoom();
        onBoundsSettled([c.lat, c.lng], z);
      }, 500);
    };
    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [map, onBoundsSettled]);
  return null;
}

// ── Memoized Map Component to prevent "shaking" on parent re-renders ──────────
const SearchMap = React.memo(({ properties, selectedId, onBoundsSettled, stableSearchFlyTarget, stableFlyTarget, getDisplayCoords, handleMarkerClick }) => {
  return (
    <MapContainer 
      center={[12.9716, 77.5946]} 
      zoom={13} 
      style={{ width: '100%', height: '100%' }} 
      zoomControl={false}
      scrollWheelZoom={true}
    >
      <MapMoveHandler onBoundsSettled={onBoundsSettled} />
      {stableSearchFlyTarget && <MapFlyToSearch center={stableSearchFlyTarget} onComplete={() => {}} />}
      {stableFlyTarget && <MapFlyTo center={stableFlyTarget} onComplete={() => {}} />}
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
      {properties.map(prop => (
        <Marker 
          key={prop.id} 
          position={getDisplayCoords(prop.lat, prop.lng, prop.id)} 
          icon={createPriceIcon(prop.rent, prop.id === selectedId)}
          eventHandlers={{ click: () => handleMarkerClick(prop.id) }}
        >
          <Popup><div className="text-sm font-bold">{prop.title}</div></Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}, (prev, next) => {
  // Only re-render if essential data changes
  return prev.properties === next.properties && 
         prev.selectedId === next.selectedId &&
         prev.stableSearchFlyTarget === next.stableSearchFlyTarget &&
         prev.stableFlyTarget === next.stableFlyTarget;
});

const DEFAULT_CENTER = [12.9716, 77.5946];

export default function PropertySearch() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(13);
  const [searchFlyTarget, setSearchFlyTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const cardRefs = useRef({});

  const [maxRent, setMaxRent] = useState(100000);
  const [selectedBhk, setSelectedBhk] = useState(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const fetchProperties = useCallback(async () => {
    if (properties.length === 0) setLoading(true);
    else setIsRefreshing(true);

    try {
      const params = { lat: mapCenter[0], lng: mapCenter[1], radius: 15 };
      if (maxRent < 100000) params.max_rent = maxRent;
      if (selectedBhk) params.bhk = selectedBhk;

      const res = await axios.get('/api/search/', { params });
      let listings = res.data?.data?.listings || [];

      if (listings.length === 0) {
        const wideRes = await axios.get('/api/search/', {
          params: { ...params, radius: 100 }
        });
        listings = wideRes.data?.data?.listings || [];
      }

      setProperties(listings);
    } catch {
      if (properties.length === 0) setProperties([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [maxRent, selectedBhk, mapCenter, properties.length]);

  const handleSearchLocation = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      if (res.data && res.data.length > 0) {
        const loc = [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
        setMapCenter(loc);
        setMapZoom(13);
        setSearchFlyTarget(loc);
      } else {
        toast.error(t('search.no_results'));
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !searchQuery) {
      setSearchQuery(q);
      const triggerInitialSearch = async () => {
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
          if (res.data && res.data.length > 0) {
             const loc = [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
             setMapCenter(loc);
             setSearchFlyTarget(loc);
          }
        } catch {}
      };
      triggerInitialSearch();
    }
  }, [searchParams]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const getDisplayCoords = useCallback((lat, lng, id) => {
    if (isAuthenticated) return [parseFloat(lat), parseFloat(lng)];
    const seed = id.split('-').pop() || 'abc';
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const jitterLat = ((hash % 100) / 10000) - 0.005;
    const jitterLng = (((hash * 13) % 100) / 10000) - 0.005;
    return [parseFloat(lat) + jitterLat, parseFloat(lng) + jitterLng];
  }, [isAuthenticated]);

  const display = useMemo(() => properties
    .filter(p => !verifiedOnly || p.users?.is_aadhaar_verified)
    .map(p => ({
      ...p,
      price: p.rent,
      type: `${p.bhk} BHK`,
      rating: p.users?.trust_score || 0,
      verified: p.users?.is_aadhaar_verified || false,
      image: p.listing_photos?.[0]?.photo_url || '',
      landlordName: p.users?.name,
    })), [properties, verifiedOnly]);

  const stableSearchFlyTarget = useMemo(() => searchFlyTarget, [searchFlyTarget?.join(',')]);
  const stableFlyTarget = useMemo(() => {
    const sel = display.find(p => p.id === selectedId);
    return sel ? [parseFloat(sel.lat), parseFloat(sel.lng)] : null;
  }, [selectedId, display]);

  const handleMarkerClick = useCallback((id) => {
    setSelectedId(id);
    setMapZoom(16);
    cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const handleBoundsSettled = useCallback((c, z) => {
    setMapCenter(c);
    setMapZoom(z);
  }, []);

  const handleSave = async (ListingId, e) => {
    e.stopPropagation();
    if (!isAuthenticated) return toast.error('Please login to save');
    try {
      await axios.post(`/api/saved/${ListingId}`);
      toast.success((t) => (
        <span className="flex items-center gap-2">
          Saved!
          <button onClick={async () => {
            toast.dismiss(t.id);
            await axios.delete(`/api/saved/${ListingId}`);
            toast('Removed');
          }} className="font-bold underline text-[10px]">Undo</button>
        </span>
      ));
    } catch { toast.error('Failed to save'); }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      <aside className={`
        ${isFilterOpen ? 'block' : 'hidden'} md:block
        w-full md:w-72 bg-white border-r border-gray-200 overflow-y-auto z-20
        absolute md:relative h-full shadow-xl md:shadow-none
      `}>
        <div className="p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-gray-900">{t('search.filters')}</h2>
            <button onClick={() => setIsFilterOpen(false)} className="md:hidden text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>{t('search.max_rent')}</span>
                <span className="text-accent font-bold">₹{(maxRent / 1000).toFixed(0)}k</span>
              </label>
              <input type="range" min="5000" max="100000" step="5000"
                value={maxRent} onChange={e => setMaxRent(Number(e.target.value))}
                className="w-full accent-accent" />
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Verified Only
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-accent after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
            
            <button onClick={() => { setMaxRent(100000); setVerifiedOnly(false); }}
              className="w-full py-2 bg-gray-100 rounded-lg text-sm font-medium">{t('search.clear_filters')}</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] md:w-[400px]">
          <form onSubmit={handleSearchLocation} className="relative">
             <input type="text" placeholder="Search a city..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
               aria-label="Search location"
               className="w-full bg-white shadow-lg rounded-full px-5 py-3 border border-gray-200 focus:ring-2 focus:ring-accent outline-none text-sm" />
             <button type="submit" aria-label="Perform search" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent text-white rounded-full"><SearchIcon className="w-4 h-4" /></button>
          </form>
        </div>

        <div className="flex-1 relative z-0">
          <SearchMap 
            properties={properties}
            selectedId={selectedId}
            onBoundsSettled={handleBoundsSettled}
            stableSearchFlyTarget={stableSearchFlyTarget}
            stableFlyTarget={stableFlyTarget}
            getDisplayCoords={getDisplayCoords}
            handleMarkerClick={handleMarkerClick}
          />
        </div>

        <div className="h-[42vh] md:h-[44vh] bg-white border-t border-gray-200 overflow-y-auto px-4 py-4 md:px-6 relative">
          {isRefreshing && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-accent/20 overflow-hidden z-30">
              <div className="h-full bg-accent animate-progress w-full" />
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-900">
              {loading ? t('common.loading') : `${display.length} ${t('search.results_found')}`}
            </h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(n => <div key={n} className="h-40 bg-gray-100 rounded-xl animate-pulse" />) }
            </div>
          ) : display.length === 0 ? (
            <div className="py-16 text-center"><SearchX className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p>{t('search.no_results')}</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {display.map(prop => (
                <div key={prop.id} ref={el => cardRefs.current[prop.id] = el} onClick={() => setSelectedId(prop.id)}
                  className={`flex flex-col bg-white rounded-xl border p-3 cursor-pointer transition-all ${prop.id === selectedId ? 'border-accent shadow-lg shadow-accent/10' : 'border-gray-100 shadow-sm'}`}>
                  <div className="relative h-32 rounded-lg overflow-hidden mb-2">
                    {prop.image ? (
                      <img src={prop.image} alt={`Property: ${prop.title}`} className="w-full h-full object-cover" />
                    ) : (
                      <PropertyImagePlaceholder id={prop.id} className="w-full h-full" />
                    )}
                    <button onClick={(e) => handleSave(prop.id, e)} 
                      aria-label={isAuthenticated ? "Save this property" : "Login to save"}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm"><Heart className="w-4 h-4" /></button>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm truncate">{prop.title}</h4>
                  <div className="mt-auto pt-2 flex justify-between items-center border-t border-gray-50">
                    <span className="font-bold">₹{prop.price.toLocaleString()}</span>
                    <button onClick={() => navigate(`/property/${prop.id}`)} className="px-3 py-1 bg-accent text-white text-[10px] font-bold rounded-lg">{t('landing.view_all')} →</button>
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
