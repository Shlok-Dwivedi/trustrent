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
              onClick={() => setActiveIndex(idx)}
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
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center">
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>
          
          <img 
            src={images[activeIndex]} 
            className="max-h-[85vh] max-w-[90vw] object-contain"
            alt="Large view" 
          />
          
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between">
            <button onClick={prevImage} className="text-white/50 hover:text-white p-4">
              <ChevronLeft className="w-12 h-12" />
            </button>
            <button onClick={nextImage} className="text-white/50 hover:text-white p-4">
              <ChevronRight className="w-12 h-12" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
