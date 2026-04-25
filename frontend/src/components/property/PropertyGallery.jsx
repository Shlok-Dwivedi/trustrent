import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { PropertyImagePlaceholder } from './PropertyImagePlaceholder';

export default function PropertyGallery({ images, listingId }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return <PropertyImagePlaceholder id={listingId} className="h-64 rounded-2xl" />;
  }

  const nextImage = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const [zoom, setZoom] = useState(1);

  // Add keyboard support
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (zoom > 1) setZoom(1);
        else setIsLightboxOpen(false);
      }
    };
    if (isLightboxOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen, zoom]);

  const toggleZoom = (e) => {
    e.stopPropagation();
    setZoom(prev => prev === 1 ? 2.5 : 1);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Main Image */}
        <div 
          className="relative h-[40vh] md:h-[50vh] rounded-2xl overflow-hidden cursor-pointer group"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img 
            src={images[activeIndex]} 
            alt={`Property view ${activeIndex + 1}`} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Controls Overlay */}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between px-4 pointer-events-none">
            <button 
              onClick={prevImage}
              className="pointer-events-auto bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full backdrop-blur-sm transition-all shadow-md"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextImage}
              className="pointer-events-auto bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full backdrop-blur-sm transition-all shadow-md"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          
          {/* Index Counter */}
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
            {activeIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => { setActiveIndex(idx); setZoom(1); }}
              className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden snap-center transition-all ${
                idx === activeIndex ? 'ring-2 ring-accent ring-offset-2' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => { setIsLightboxOpen(false); setZoom(1); }}
        >
          {/* Close Button */}
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-[110] bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all"
            onClick={() => { setIsLightboxOpen(false); setZoom(1); }}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Zoom Controls */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 z-[110]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setZoom(prev => Math.max(1, prev - 0.5))} className="text-white/70 hover:text-white font-bold text-xl">－</button>
            <span className="text-white text-sm font-bold min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(prev => Math.min(4, prev + 0.5))} className="text-white/70 hover:text-white font-bold text-xl">＋</button>
          </div>
          
          <div className={`relative max-h-[90vh] max-w-[95vw] flex items-center justify-center transition-all duration-300 ${zoom > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'}`} onClick={toggleZoom}>
            <div className="overflow-auto max-h-screen max-w-screen flex items-center justify-center scrollbar-hide">
              <img 
                src={images[activeIndex]} 
                style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                className="max-h-[85vh] max-w-[90vw] object-contain shadow-2xl rounded-sm origin-center"
                alt="Large view" 
              />
            </div>
            
            {zoom === 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); prevImage(e); }} 
                  className="absolute left-0 -translate-x-full md:translate-x-0 md:-left-20 text-white/30 hover:text-white p-4 transition-all"
                >
                  <ChevronLeft className="w-12 h-12" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); nextImage(e); }} 
                  className="absolute right-0 translate-x-full md:translate-x-0 md:-right-20 text-white/30 hover:text-white p-4 transition-all"
                >
                  <ChevronRight className="w-12 h-12" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
