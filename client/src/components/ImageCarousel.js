import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const MediaCarousel = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalItem, setModalItem] = useState(null);

  const nextSlide = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => Math.min(prev + 1, items.length - 3));
  };

  const prevSlide = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const openModal = (item) => {
    setModalItem(item);
    setShowModal(true);
  };

  const MediaItem = ({ item, isModal = false }) => {
    if (item.type === 'video') {
      return (
        <video
          src={item.url}
          alt={item.alt || 'Carousel video'}
          controls={isModal}
          className={`${isModal ? 'w-full h-full' : 'w-full h-48'} object-cover rounded-lg cursor-pointer`}
          onClick={() => !isModal && openModal(item)}
        />
      );
    }
    return (
      <img
        src={item.url}
        alt={item.alt || 'Carousel image'}
        className={`${isModal ? 'w-full h-full' : 'w-full h-48'} object-cover rounded-lg cursor-pointer`}
        onClick={() => !isModal && openModal(item)}
      />
    );
  };

  return (
    <>
      <div className="relative w-full group">
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
          >
            {items.map((item, idx) => (
              <div key={idx} className="w-1/3 flex-shrink-0 p-1">
                <MediaItem item={item} />
              </div>
            ))}
          </div>
        </div>

        {currentIndex > 0 && (
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
        
        {currentIndex < items.length - 3 && (
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {showModal && modalItem && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <MediaItem item={modalItem} isModal={true} />
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 bg-black/50 p-1 rounded-full"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaCarousel;