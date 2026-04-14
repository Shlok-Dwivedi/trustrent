import React, { useState } from 'react';
import axios from 'axios';
import { X, Calendar as CalendarIcon, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function VisitBookingModal({ isOpen, onClose, property }) {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time || isSubmitting) return;
    
    setIsSubmitting(true);
    const timeMapping = {
      'Morning (9-12 PM)': '09:00:00',
      'Afternoon (12-4 PM)': '12:00:00',
      'Evening (4-7 PM)': '16:00:00',
      'Anytime': '10:00:00'
    };

    setIsSubmitting(true);
    try {
      if (!property?.id?.startsWith('demo-')) {
        await axios.post('/api/bookings/', {
          listing_id: property.id,
          slot_date: date,
          slot_time: timeMapping[time] || '10:00:00',
        });
      }
      
      toast.success(t('common.success'));
      setTimeout(() => {
        onClose();
        setStep(1);
        setDate('');
        setTime('');
      }, 1500);
    } catch (err) {
      toast.error(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900 font-heading text-lg">{t('booking.title')}</h3>
            <p className="text-sm text-gray-500">{t('booking.subtitle')}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-white shadow-sm p-1.5 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex gap-4 items-center p-3 bg-gray-50 rounded-xl mb-6 border border-gray-100">
            <img src={property.images[0]} alt="Prop" className="w-16 h-16 rounded-lg object-cover shadow-sm" />
            <div>
              <p className="font-bold text-gray-900 truncate pr-4">{property.title}</p>
              <p className="text-sm font-medium text-accent">₹{property.price.toLocaleString()}/mo</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <div className="space-y-5 animate-in slide-in-from-left-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <CalendarIcon className="w-4 h-4 text-accent" /> {t('booking.select_date')}
                  </label>
                  <input 
                    type="date" 
                    value={date} onChange={e => {
                      const selected = new Date(e.target.value);
                      const dayName = selected.toLocaleDateString('en-US', { weekday: 'short' });
                      if (property.visit_days?.length > 0 && !property.visit_days.includes(dayName)) {
                        toast.error(t('booking.not_available', { day: t(`property.days.${dayName.toLowerCase()}`) }));
                      }
                      setDate(e.target.value);
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-accent focus:border-accent"
                    required
                  />
                  {property.visit_days?.length > 0 && (
                    <p className="text-[10px] text-gray-400 mt-1">{t('booking.available')}: {property.visit_days.map(d => t(`property.days.${d.toLowerCase()}`)).join(', ')}</p>
                  )}
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 text-accent" /> {t('booking.preferred_time')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Morning (9-12 PM)', 'Afternoon (12-4 PM)', 'Evening (4-7 PM)', 'Anytime'].map(slot => {
                      const isPreferred = property.visit_slots?.length === 0 || property.visit_slots.includes(slot);
                      return (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setTime(slot)}
                          className={`py-2 px-3 text-sm rounded-lg border font-medium transition-all ${
                            time === slot ? 'border-accent bg-accent/5 text-accent' : 
                            isPreferred ? 'border-gray-200 text-gray-600 hover:border-gray-300' :
                            'border-gray-100 text-gray-300 bg-gray-50/50 cursor-not-allowed text-[11px]'
                          }`}
                        >
                          {t(`property.slots.${slot.toLowerCase()}`)}
                          {!isPreferred && <span className="block text-[8px] opacity-60">({t('booking.not_preferred')})</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button 
                  type="button" 
                  disabled={!date || !time}
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-lg disabled:bg-gray-200 disabled:text-gray-400 mt-2 transition-all"
                >
                  {t('booking.continue')}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-in slide-in-from-right-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('booking.message_placeholder')}</label>
                  <textarea 
                    rows={3}
                    value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder={t('booking.message_hint')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-accent focus:border-accent text-sm resize-none"
                  />
                </div>

                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3 text-sm">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-blue-800">{t('booking.privacy_hint', { name: property.landlord?.name || t('property.landlord') })}</p>
                </div>

                <div className="flex gap-3 mt-2">
                  <button 
                    type="button" onClick={() => setStep(1)}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
                  >
                    {t('booking.back')}
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-accent hover:bg-accent-dark text-white font-bold rounded-lg shadow-md shadow-accent/20 transition-all flex items-center justify-center gap-2 disabled:bg-accent/70"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('booking.confirm')}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
