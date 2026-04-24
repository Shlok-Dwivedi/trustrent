import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Star, XCircle, Image as ImageIcon, Plus as PlusIcon, Loader2 } from 'lucide-react';

export default function WriteReviewModal({ booking, onClose, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [photoUrls, setPhotoUrls] = useState(['']);
  const [submitting, setSubmitting] = useState(false);

  const addPhotoField = () => setPhotoUrls([...photoUrls, '']);
  const updatePhotoUrl = (val, idx) => {
    const next = [...photoUrls];
    next[idx] = val;
    setPhotoUrls(next);
  };

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    setSubmitting(true);
    try {
      await axios.post('/api/reviews/', {
        booking_id: booking.id !== booking.tenancy_id ? booking.id : undefined,
        tenancy_id: booking.tenancy_id || booking.id, // Support passing just a tenancy
        rating,
        comment,
        photo_urls: photoUrls.filter(u => u.trim() !== '')
      });
      toast.success('Review submitted! Thank you.');
      onReviewSubmitted(booking.id);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit review';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const starLabel = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <XCircle className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-heading font-bold text-gray-900 mb-1">Write a Review</h2>
        <p className="text-sm text-gray-500 mb-5">
          Share your experience for <span className="font-medium text-gray-700">{booking.listing?.title || 'this property'}</span>
        </p>

        {/* Star Rating */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating</label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-9 h-9 transition-colors ${
                    star <= (hovered || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-200 fill-gray-200'
                  }`}
                />
              </button>
            ))}
            {(hovered || rating) > 0 && (
              <span className="ml-2 text-sm font-semibold text-amber-600">
                {starLabel[hovered || rating]}
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Comment <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell others about the property, the people, and your overall experience..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/500</p>
        </div>

        {/* Photos */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
            Photos <span className="text-xs font-normal text-gray-400">Add URLs of property condition</span>
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
            {photoUrls.map((url, idx) => (
              <div key={idx} className="flex gap-2">
                <div className="flex-1 relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updatePhotoUrl(e.target.value, idx)}
                    placeholder="https://image-url.com/photo.jpg"
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={addPhotoField}
            className="mt-2 text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1"
          >
            <PlusIcon className="w-3 h-3" /> Add another photo
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
