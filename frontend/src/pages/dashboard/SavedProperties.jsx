import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, Trash2, MapPin, Loader2, BookmarkX } from 'lucide-react';
import { PropertyImagePlaceholder } from '../../components/property/PropertyImagePlaceholder';

export default function SavedProperties() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await axios.get('/api/saved');
        setSaved(res.data?.data?.saved || []);
      } catch {
        console.warn('Could not fetch saved properties');
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  const handleRemove = async (listingId) => {
    try {
      await axios.delete(`/api/saved/${listingId}`);
      setSaved(prev => prev.filter(s => s.listing_id !== listingId));
    } catch {
      setSaved(prev => prev.filter(s => s.listing_id !== listingId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900">Saved Properties</h1>
        <p className="text-gray-500 mt-1">Properties you've bookmarked for later.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading…
        </div>
      ) : saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
          <BookmarkX className="w-16 h-16 text-gray-300" />
          <p className="text-xl font-medium text-gray-500">No saved properties yet</p>
          <p className="text-sm">Browse the <Link to="/search" className="text-accent hover:underline">search page</Link> and hit the heart icon to save listings here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {saved.map((item) => {
            const listing = item.listing || {};
            const photo = listing.listing_photos?.[0]?.photo_url;
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group">
                <Link to={`/property/${listing.id || item.listing_id}`}>
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {photo ? (
                      <img src={photo} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <PropertyImagePlaceholder id={listing.id || item.listing_id} className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/property/${listing.id || item.listing_id}`}>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-accent transition-colors truncate">{listing.title || 'Property'}</h3>
                  </Link>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {listing.address || 'N/A'}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">₹{(listing.rent || 0).toLocaleString()}<span className="text-sm font-normal text-gray-500">/mo</span></span>
                    <button
                      onClick={() => handleRemove(item.listing_id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
