import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  MapPin, Home, IndianRupee, BedDouble, Sofa,
  ArrowLeft, ArrowRight, CheckCircle2, Loader2,
  Car, Snowflake, Wifi, ShowerHead, Lock, Zap, Dumbbell, Sparkles,
  Upload, X, Search, LocateFixed, CalendarDays, Clock
} from 'lucide-react';

// ── Fix Leaflet default icons ─────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="background:#0D7377;width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.4);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

// ── Amenity config ────────────────────────────────────────────────────────────
const AMENITY_OPTIONS = [
  { key: 'parking',  label: 'Parking',    icon: Car },
  { key: 'ac',       label: 'AC',          icon: Snowflake },
  { key: 'wifi',     label: 'WiFi',        icon: Wifi },
  { key: 'water',    label: 'Water 24/7',  icon: ShowerHead },
  { key: 'security', label: 'Security',    icon: Lock },
  { key: 'power',    label: 'Power Backup',icon: Zap },
  { key: 'gym',      label: 'Gym',         icon: Dumbbell },
  { key: 'cleaning', label: 'Cleaning',    icon: Sparkles },
];

const STEPS = [
  { id: 1, label: 'Basics',   icon: Home },
  { id: 2, label: 'Amenities',icon: Sparkles },
  { id: 3, label: 'Location', icon: MapPin },
  { id: 4, label: 'Scheduling', icon: CalendarDays },
];

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 }; // centre of India — fallback only

// ── Sub-component: fly map to position ───────────────────────────────────────
function FlyTo({ position }) {
  const map = useMap();
  const prev = useRef(null);
  useEffect(() => {
    if (position && JSON.stringify(position) !== JSON.stringify(prev.current)) {
      map.flyTo([position.lat, position.lng], 16, { duration: 1 });
      prev.current = position;
    }
  }, [position, map]);
  return null;
}

// ── Sub-component: click to drop pin ────────────────────────────────────────
function PinDropper({ onChange }) {
  useMapEvents({
    click(e) { onChange({ lat: e.latlng.lat, lng: e.latlng.lng }); },
  });
  return null;
}

// ── Geocode with progressive simplification ─────────────────────────────────
// Nominatim struggles with Indian flat/apartment numbers.
// We try the full address first, then strip leading tokens one-by-one
// until we either find a result or run out of parts.
async function geocodeAddress(rawAddress) {
  // Clean up: remove flat/unit numbers like "9/3," or "B-204,"
  const clean = rawAddress
    .replace(/^[\w\d\/\-]+[,.]?\s*/i, '')  // strip leading token (flat number)
    .trim();

  const attempts = [
    rawAddress,           // full original
    clean,                // without flat number
    ...clean.split(',').slice(1).map(p => p.trim()).filter(Boolean), // each trailing segment
  ];

  for (const query of attempts) {
    if (!query) continue;
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '1',
        countrycodes: 'in',   // restrict to India
        addressdetails: '0',
      });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'TrustRent-App/1.0 (trustrent.app)',
        },
      });
      const data = await res.json();
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          display: data[0].display_name,
          usedQuery: query,   // so we can tell the user what matched
        };
      }
    } catch { /* try next */ }
  }
  return null; // all attempts failed
}

// ── Main Component ────────────────────────────────────────────────────────────
import { RocketTakeoff, Check2Circle } from 'react-bootstrap-icons';

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', rent: '', bhk: '1BHK',
    furnishing: 'unfurnished', amenities: [],
    address: '',
    plot_no: '',
    building_name: '',
    area: '',
    locality_2: '',
    landmark: '',
    city: '',
    visit_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    visit_slots: ['Morning (9-12 PM)', 'Evening (4-7 PM)'],
  });

  const [photos, setPhotos]        = useState([]); // [{url, path, preview}]
  const [uploading, setUploading]  = useState(false);
  const [pinLocation, setPinLocation] = useState(null);   // null until located
  const [flyTarget, setFlyTarget]  = useState(null);
  const [mapReady, setMapReady]    = useState(false);

  // On mount: try to get user's real location
  useEffect(() => {
    if (!navigator.geolocation) return;
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPinLocation(loc);
        setFlyTarget(loc);
        setGeoLocating(false);
      },
      () => {
        // Geolocation denied/unavailable → fall back to India centre
        setPinLocation(INDIA_CENTER);
        setGeoLocating(false);
      },
      { timeout: 8000 }
    );
  }, []);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const toggleAmenity = (key) =>
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(key)
        ? f.amenities.filter(a => a !== key)
        : [...f.amenities, key],
    }));

  const toggleVisitDay = (day) =>
    setForm(f => ({
      ...f,
      visit_days: f.visit_days.includes(day)
        ? f.visit_days.filter(d => d !== day)
        : [...f.visit_days, day],
    }));

  const toggleVisitSlot = (slot) =>
    setForm(f => ({
      ...f,
      visit_slots: f.visit_slots.includes(slot)
        ? f.visit_slots.filter(s => s !== slot)
        : [...f.visit_slots, slot],
    }));

  // ── File upload ───────────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await axios.post('/api/photos/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const { url, path } = res.data?.data || {};
        setPhotos(prev => [...prev, {
          url,
          path,
          preview: URL.createObjectURL(file),
          name: file.name,
        }]);
        toast.success('Photo uploaded!');
      } catch (err) {
        toast.error(err.response?.data?.error || `Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
    e.target.value = '';
  };

  const removePhoto = async (index) => {
    const photo = photos[index];
    try {
      if (photo.path) {
        await axios.delete('/api/photos/delete', { data: { path: photo.path } });
      }
    } catch { /* if delete fails, still remove from UI */ }
    URL.revokeObjectURL(photo.preview);
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // ── Address geocoding ─────────────────────────────────────────────────────
  const handleGeocode = async () => {
    // Construct a search string from structured fields
    const searchString = [
      form.building_name,
      form.area,
      form.locality_2,
      form.city
    ].filter(Boolean).join(', ');

    if (!searchString.trim()) { toast.error('Enter at least Area and City to find on map'); return; }
    setGeocoding(true);
    try {
      const result = await geocodeAddress(searchString);
      if (!result) {
        toast.error('Could not find this location. Try entering just the area + city (e.g. Wardha Road, Nagpur).');
        return;
      }
      setPinLocation({ lat: result.lat, lng: result.lng });
      setFlyTarget({ lat: result.lat, lng: result.lng });
      // If we used a simplified query, tell the user
      if (result.usedQuery !== form.address) {
        toast.success(`Found: ${result.usedQuery.split(',')[0].trim()}`);
      } else {
        toast.success('Pin moved to address!');
      }
    } catch {
      toast.error('Geocoding failed. Please place the pin manually on the map.');
    } finally {
      setGeocoding(false);
    }
  };

  // ── Get my location ──────────────────────────────────────────────────────
  const handleLocateMe = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPinLocation(loc);
        setFlyTarget(loc);
        setGeoLocating(false);
        toast.success('Moved to your location!');
      },
      () => { toast.error('Could not get your location'); setGeoLocating(false); }
    );
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const canNext = () => {
    if (step === 1) return form.title && form.rent && form.bhk;
    if (step === 2) return true;
    if (step === 3) return form.plot_no && form.area && form.landmark && form.city && pinLocation;
    if (step === 4) return form.visit_days.length > 0 && form.visit_slots.length > 0;
    return false;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!pinLocation) { toast.error('Please set a location on the map'); return; }
    setSubmitting(true);
    try {
      // Create the concatenated address for backward compatibility/quick display
      const fullAddress = [
        form.plot_no,
        form.building_name,
        form.area,
        form.locality_2,
        form.landmark,
        form.city
      ].filter(Boolean).join(', ');

      await axios.post('/api/listings/', {
        title: form.title,
        description: form.description,
        rent: parseFloat(form.rent),
        bhk: form.bhk,
        furnishing: form.furnishing,
        amenities: form.amenities,
        address: fullAddress,
        plot_no: form.plot_no,
        building_name: form.building_name,
        area: form.area,
        locality_2: form.locality_2,
        landmark: form.landmark,
        city: form.city,
        lat: pinLocation.lat,
        lng: pinLocation.lng,
        visit_days: form.visit_days,
        visit_slots: form.visit_slots,
        photo_urls: photos.map(p => p.url).filter(Boolean),
      });
      toast.success('Property listed successfully!', { icon: <Check2Circle className="text-green-500" /> });
      navigate('/landlord/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const mapInitialCenter = pinLocation || INDIA_CENTER;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/landlord/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-heading font-bold text-gray-900">List a New Property</h1>
          <p className="text-gray-500 mt-1">Fill in the details below to publish your listing.</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                step === s.id ? 'bg-primary text-white shadow-md'
                : step > s.id  ? 'bg-green-100 text-green-700'
                : 'bg-white text-gray-400 border border-gray-200'
              }`}>
                {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                {s.label}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${step > s.id ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

          {/* ── Step 1: Basics ──────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Listing Title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Spacious 2BHK in Koramangala with parking"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Describe your property — layout, building, neighbourhood highlights..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent outline-none resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    <IndianRupee className="w-4 h-4" /> Monthly Rent *
                  </label>
                  <input type="number" value={form.rent} onChange={e => set('rent', e.target.value)}
                    placeholder="25000"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    <BedDouble className="w-4 h-4" /> BHK Type *
                  </label>
                  <select value={form.bhk} onChange={e => set('bhk', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent outline-none bg-white">
                    {['1BHK','2BHK','3BHK','4BHK','Studio','Villa'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                  <Sofa className="w-4 h-4" /> Furnishing
                </label>
                <div className="flex gap-3">
                  {['unfurnished', 'semi-furnished', 'fully-furnished'].map(f => (
                    <button key={f} type="button" onClick={() => set('furnishing', f)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${
                        form.furnishing === f ? 'border-accent bg-accent/10 text-accent' : 'border-gray-200 text-gray-600 hover:border-accent'
                      }`}>
                      {f.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Amenities & Photos ─────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-7">
              <h2 className="text-xl font-bold text-gray-900">Amenities & Photos</h2>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AMENITY_OPTIONS.map(({ key, label, icon: Icon }) => (
                    <button key={key} type="button" onClick={() => toggleAmenity(key)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                        form.amenities.includes(key)
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-gray-200 text-gray-500 hover:border-primary/40'
                      }`}>
                      <Icon className="w-5 h-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Property Photos</label>

                {/* Upload area */}
                <label className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  uploading ? 'border-accent/50 bg-accent/5' : 'border-gray-200 hover:border-accent/50 hover:bg-gray-50'
                }`}>
                  <input type="file" accept="image/*" multiple onChange={handleFileChange}
                    className="sr-only" disabled={uploading} />
                  {uploading ? (
                    <><Loader2 className="w-8 h-8 animate-spin text-accent" /><span className="text-sm text-gray-500">Uploading to cloud…</span></>
                  ) : (
                    <><Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500 font-medium">Click to upload photos</span>
                    <span className="text-xs text-gray-400">JPG, PNG, WebP — max 5MB each</span></>
                  )}
                </label>

                {/* Photo Previews */}
                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {photos.map((photo, i) => (
                      <div key={i} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                        <img src={photo.preview || photo.url} alt={`Photo ${i+1}`}
                          className="w-full h-full object-cover" />
                        <button onClick={() => removePhoto(i)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Photos are uploaded to Supabase Storage and linked to your listing.
                  {photos.length === 0 && ' Add at least one photo for better visibility.'}
                </p>
              </div>
            </div>
          )}

          {/* ── Step 3: Location ────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900">Set Location</h2>

              {/* Address + geocode */}
              <div>
              {/* Address Fields */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Address Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plot / House No. *</label>
                    <input
                      value={form.plot_no || ''}
                      onChange={e => set('plot_no', e.target.value)}
                      placeholder="e.g. 14 or Flat 202"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Building Name (Optional)</label>
                    <input
                      value={form.building_name || ''}
                      onChange={e => set('building_name', e.target.value)}
                      placeholder="e.g. Sunshine Apartments"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Layout / Area *</label>
                    <input
                      value={form.area || ''}
                      onChange={e => set('area', e.target.value)}
                      placeholder="e.g. Koramangala 4th Block"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sub-Locality (Optional)</label>
                    <input
                      value={form.locality_2 || ''}
                      onChange={e => set('locality_2', e.target.value)}
                      placeholder="e.g. Near BDA Complex"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Landmark *</label>
                    <input
                      value={form.landmark || ''}
                      onChange={e => set('landmark', e.target.value)}
                      placeholder="e.g. Behind Axis Bank"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City *</label>
                    <input
                      value={form.city || ''}
                      onChange={e => set('city', e.target.value)}
                      placeholder="e.g. Bangalore"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-accent outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button type="button" onClick={handleGeocode} disabled={geocoding}
                    className="w-full py-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-primary/20">
                    {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    Confirm Address on Map
                  </button>
                  <p className="text-[10px] text-gray-400 mt-2 text-center uppercase tracking-widest font-bold">
                    This will automatically position the pin for tenants
                  </p>
                </div>
              </div>
              </div>

              {/* Map */}
              <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 320 }}>
                {geoLocating && !mapReady ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10 gap-3 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Getting your location…</span>
                  </div>
                ) : (
                  <MapContainer
                    center={[mapInitialCenter.lat, mapInitialCenter.lng]}
                    zoom={14}
                    style={{ width: '100%', height: '100%' }}
                    scrollWheelZoom
                    whenReady={() => setMapReady(true)}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      attribution='&copy; OpenStreetMap &copy; CARTO'
                    />
                    <FlyTo position={flyTarget} />
                    <PinDropper onChange={pos => { setPinLocation(pos); setFlyTarget(null); }} />
                    {pinLocation && (
                      <Marker
                        position={[pinLocation.lat, pinLocation.lng]}
                        icon={pinIcon}
                        draggable
                        eventHandlers={{
                          dragend(e) {
                            const ll = e.target.getLatLng();
                            setPinLocation({ lat: ll.lat, lng: ll.lng });
                          },
                        }}
                      />
                    )}
                  </MapContainer>
                )}

                {/* Locate Me button floating over map */}
                <button
                  type="button"
                  onClick={handleLocateMe}
                  disabled={geoLocating}
                  className="absolute bottom-3 right-3 z-[1000] bg-white text-primary border border-gray-200 shadow-md rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-1.5 hover:bg-primary hover:text-white transition-all"
                >
                  {geoLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                  My Location
                </button>
              </div>

              {/* Coordinate readout */}
              {pinLocation && (
                <div className="flex gap-3">
                  <div className="flex-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600 font-mono">
                    Lat: {pinLocation.lat.toFixed(6)}
                  </div>
                  <div className="flex-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600 font-mono">
                    Lng: {pinLocation.lng.toFixed(6)}
                  </div>
                </div>
              )}
            </div>
          )}

            {step === 4 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Visit Availability</h2>
                  <p className="text-sm text-gray-500 mb-6">Select when you are available to show the property to potential tenants.</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
                    <CalendarDays className="w-5 h-5 text-primary" /> Preferred Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <button key={day} type="button" onClick={() => toggleVisitDay(day)}
                        className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                          form.visit_days.includes(day)
                            ? 'border-primary bg-primary text-white shadow-md'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}>
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
                    <Clock className="w-5 h-5 text-primary" /> Preferred Time Slots
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['Morning (9-12 PM)', 'Afternoon (12-4 PM)', 'Evening (4-7 PM)', 'Anytime'].map(slot => (
                      <button key={slot} type="button" onClick={() => toggleVisitSlot(slot)}
                        className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-bold transition-all ${
                          form.visit_slots.includes(slot)
                            ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          form.visit_slots.includes(slot) ? 'border-primary bg-primary' : 'border-gray-300'
                        }`}>
                          {form.visit_slots.includes(slot) && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Setting clear availability helps reduce back-and-forth messaging and lets tenants book visits instantly when you're free.
                  </p>
                </div>
              </div>
            )}

            {/* ── Nav Buttons ─────────────────────────────────────────────── */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
              <button type="button" onClick={() => setStep(s => s - 1)} disabled={step === 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-30 transition-all">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {step < 4 ? (
                <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                  <button type="button" onClick={handleSubmit} disabled={!canNext() || submitting}
                className="flex items-center gap-2 px-8 py-2.5 bg-accent hover:bg-accent-dark text-white font-bold rounded-lg shadow-md shadow-accent/20 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</> : <><RocketTakeoff className="w-4 h-4" /> Publish Listing</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
