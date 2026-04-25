import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Star, XCircle, Loader2, UploadCloud, X } from 'lucide-react';

export default function WriteReviewModal({ booking, onClose, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]); // [{ url, preview, uploading }]
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      const preview = URL.createObjectURL(file);
      setPhotos(prev => [...prev, { url: null, preview, uploading: true }]);

      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post('/api/photos/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const uploadedUrl = res.data?.data?.url;
        setPhotos(prev => prev.map(p =>
          p.preview === preview ? { url: uploadedUrl, preview, uploading: false } : p
        ));
      } catch {
        toast.error('Failed to upload photo');
        setPhotos(prev => prev.filter(p => p.preview !== preview));
      }
    }
    e.target.value = '';
  };

  const removePhoto = (preview) => {
    setPhotos(prev => prev.filter(p => p.preview !== preview));
  };

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    if (photos.some(p => p.uploading)) { toast.error('Please wait for photos to finish uploading'); return; }

    setSubmitting(true);
    try {
      // If tenancy_id and id are same, it's a tenancy-only review
      const isTenancy = booking.tenancy_id === booking.id || !booking.id;
      
      await axios.post('/api/reviews', {
        booking_id: isTenancy ? undefined : booking.id,
        tenancy_id: isTenancy ? booking.tenancy_id : undefined,
        rating,
        comment,
        photo_urls: photos.filter(p => p.url).map(p => p.url)
      });
      toast.success('Review submitted! Thank you.');
      onReviewSubmitted(booking.id);
      onClose();
    } catch (err) {
      // 409 = already reviewed — treat as success silently
      if (err?.response?.status === 409) {
        onReviewSubmitted(booking.id);
        onClose();
        return;
      }
      toast.error(err?.response?.data?.message || 'Failed to submit review');
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Close">
          <XCircle className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-heading font-bold text-gray-900 mb-1">
          {booking.type === 'tenant' ? 'Rate Tenant' : 'Rate Property'}
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Share your experience for <span className="font-medium text-gray-700">{booking.listing?.title || booking.tenant?.name || 'this experience'}</span>
        </p>

        {/* Star Rating */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating</label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)} className="transition-transform hover:scale-110 focus:outline-none" aria-label={`Rate ${star} stars`}>
                <Star className={`w-9 h-9 transition-colors ${star <= (hovered || rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
              </button>
            ))}
            {(hovered || rating) > 0 && <span className="ml-2 text-sm font-semibold text-amber-600">{starLabel[hovered || rating]}</span>}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Comment <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell others about the property, the people, and your overall experience..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" maxLength={500} />
          <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/500</p>
        </div>

        {/* Photo Upload */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Photos <span className="text-xs font-normal text-gray-400">(optional · JPEG, PNG, WebP)</span>
          </label>

          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {photos.map((p) => (
                <div key={p.preview} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img src={p.preview} alt="preview" className="w-full h-full object-cover" />
                  {p.uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                  {!p.uploading && (
                    <button onClick={() => removePhoto(p.preview)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group">
            <UploadCloud className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
            <span className="text-sm text-gray-500 group-hover:text-primary transition-colors">Click to upload photos</span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting || rating === 0} className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
