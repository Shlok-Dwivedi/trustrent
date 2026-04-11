import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X, Loader2 } from 'lucide-react';

const AMENITY_OPTIONS = [
  'parking', 'ac', 'wifi', 'water', 'security', 'power', 'gym', 'cleaning'
];

export default function EditListingModal({ listing, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: '', description: '', rent: '', bhk: '1BHK',
    furnishing: 'unfurnished', amenities: [], address: '', is_active: true,
    visit_days: [], visit_slots: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (listing) {
      setForm({
        title: listing.title || '',
        description: listing.description || '',
        rent: listing.rent || '',
        bhk: listing.bhk || '1BHK',
        furnishing: listing.furnishing || 'unfurnished',
        amenities: listing.amenities || [],
        address: listing.address || '',
        is_active: listing.is_active ?? true,
        visit_days: listing.visit_days || [],
        visit_slots: listing.visit_slots || [],
      });
    }
  }, [listing]);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.patch(`/api/listings/${listing.id}`, {
        title: form.title,
        description: form.description,
        rent: parseFloat(form.rent),
        bhk: form.bhk,
        furnishing: form.furnishing,
        amenities: form.amenities,
        address: form.address,
        is_active: form.is_active,
        visit_days: form.visit_days,
        visit_slots: form.visit_slots,
      });
      toast.success('Listing updated!');
      onSaved(res.data?.data?.listing);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  if (!listing) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Edit Listing</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-accent outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-accent outline-none resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rent (₹/mo)</label>
              <input type="number" value={form.rent} onChange={e => set('rent', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-accent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BHK</label>
              <select value={form.bhk} onChange={e => set('bhk', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-accent outline-none bg-white">
                {['1BHK','2BHK','3BHK','4BHK','Studio','Villa'].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing</label>
            <div className="flex gap-2">
              {['unfurnished','semi-furnished','fully-furnished'].map(f => (
                <button key={f} type="button" onClick={() => set('furnishing', f)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${
                    form.furnishing === f ? 'border-accent bg-accent/10 text-accent' : 'border-gray-200 text-gray-600 hover:border-accent'
                  }`}>
                  {f.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map(key => (
                <button key={key} type="button" onClick={() => toggleAmenity(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize transition-all ${
                    form.amenities.includes(key)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 text-gray-500 hover:border-primary/40'
                  }`}>
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input value={form.address} onChange={e => set('address', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-accent outline-none" />
          </div>

          <div className="space-y-4 py-4 border-t border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-900">Visit Availability</h3>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Days</p>
              <div className="flex flex-wrap gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <button key={day} type="button" onClick={() => toggleVisitDay(day)}
                    className={`px-3 py-1 rounded-md text-xs font-bold border transition-all ${
                      form.visit_days.includes(day) ? 'bg-primary text-white border-primary' : 'text-gray-400 border-gray-100 hover:border-gray-200'
                    }`}>
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Slots</p>
              <div className="grid grid-cols-2 gap-2">
                {['Morning (9-12 PM)', 'Afternoon (12-4 PM)', 'Evening (4-7 PM)', 'Anytime'].map(slot => (
                  <button key={slot} type="button" onClick={() => toggleVisitSlot(slot)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all text-left ${
                      form.visit_slots.includes(slot) ? 'bg-primary/5 text-primary border-primary/20' : 'text-gray-400 border-gray-100'
                    }`}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-800">Listing Active</p>
              <p className="text-xs text-gray-500">Turn off to temporarily hide from search</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-accent hover:bg-accent-dark text-white font-bold rounded-lg transition-colors disabled:bg-gray-300">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
