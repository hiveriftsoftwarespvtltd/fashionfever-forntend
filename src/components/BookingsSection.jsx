import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Scissors, ArrowRight } from 'lucide-react';
import { initialDefaultCards } from '../pages/admin/components/HomeBookingCardsManager';
import apiClient from '../api/apiClient';
import config from '../config/config';

const getFallbackByName = (name) => {
  const n = (name || '').toUpperCase();
  if (n.includes('JEWEL') || n.includes('JWEL')) {
    return 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop';
  }
  if (n.includes('OUTFIT') || n.includes('RENT') || n.includes('DRESS')) {
    return 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop';
  }
  if (n.includes('MODEL') || n.includes('HIRING')) {
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop';
  }
  if (n.includes('STAFF') || n.includes('PROFESSIONAL') || n.includes('PROFESIONAL')) {
    return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop';
  }
  if (n.includes('HAIR') || n.includes('CARE')) {
    return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop';
  }
  if (n.includes('NAIL')) {
    return 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop';
  }
  if (n.includes('FACIAL') || n.includes('SKIN')) {
    return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=600&fit=crop';
};

const resolveServiceImage = (item) => {
  const img = item.image || item.imageMedia || item.imageUrl || item.file || item.thumbnail || item.fileId;
  if (!img) return getFallbackByName(item.name || item.title || item.label);
  
  if (typeof img === 'string') {
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:') || img.startsWith('blob:')) {
      return img;
    }
    if (/^[0-9a-fA-F]{24}$/.test(img)) {
      return `${config.API_URL}/file/get-file/${img}`;
    }
    if (img.startsWith('/')) {
      return `${config.API_URL}${img}`;
    }
  } else if (typeof img === 'object') {
    if (img.url) return resolveServiceImage({ image: img.url, name: item.name });
    if (img.path) return resolveServiceImage({ image: img.path, name: item.name });
    if (img._id) return `${config.API_URL}/file/get-file/${img._id}`;
  }
  return getFallbackByName(item.name || item.title || item.label);
};

const BookingsSection = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const scrollRef = useRef(null);

  const loadCards = async () => {
    try {
      // 1. Fetch from /service/get-all-service-categories
      const res1 = await apiClient.get('/service/get-all-service-categories').catch(() => null);
      const list1 = res1?.data?.success ? (res1.data.data ?? []) : (Array.isArray(res1?.data) ? res1.data : []);

      // 2. Fetch from /admin/home-booking-cards/public
      const res2 = await apiClient.get('/admin/home-booking-cards/public').catch(() => null);
      const list2 = res2?.data?.success ? (res2.data.data ?? []) : [];

      const combined = [...(Array.isArray(list1) ? list1 : []), ...(Array.isArray(list2) ? list2 : [])];

      if (combined.length > 0) {
        const activeItems = combined.filter(item => item.isActive !== false);
        const apiCards = activeItems.map(item => ({
          id: item._id || item.id,
          category: String(item.label || item.category || 'SALON SERVICE').toUpperCase(),
          name: item.name || item.label || 'Beauty Service',
          image: resolveServiceImage(item),
          slug: item.description || item.slug || item.name?.toLowerCase().replace(/\s+/g, '-') || item._id
        }));
        setServices(apiCards);
        return;
      }
    } catch (err) {
      console.error("Failed to load booking cards on homepage:", err);
    }

    setServices(initialDefaultCards);
  };

  useEffect(() => {
    loadCards();

    // Listen for Super Admin CRUD updates
    const handleUpdate = () => loadCards();
    window.addEventListener('home_booking_cards_updated', handleUpdate);
    return () => {
      window.removeEventListener('home_booking_cards_updated', handleUpdate);
    };
  }, []);

  const scrollBy = (dir) => {
    const el = scrollRef.current;
    if (el) {
      const offset = el.clientWidth * 0.8 * dir;
      el.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const displayServices = services.length > 0 ? services : initialDefaultCards;

  return (
    <section className="bg-white py-6 sm:py-10 font-sans">
      <style>{`.bs-track::-webkit-scrollbar{display:none}`}</style>
      <div className="max-w-[1600px] mx-auto px-2 sm:px-4 md:px-8">
        
        {/* Outer Card Wrapper matching homepage sections */}
        <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-8 shadow-2xs overflow-hidden">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-slate-100">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#ff4d6d] text-xs font-black uppercase tracking-widest border border-rose-100/80 mb-2 shadow-2xs">
                <Scissors size={13} className="text-[#ff4d6d]" /> POPULAR SERVICES
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight font-serif">
                Salon & Bridal Bookings
              </h2>
            </div>
            <Link
              to="/booking"
              className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-[#ff4d6d] text-slate-700 hover:text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300 border border-slate-200 hover:border-[#ff4d6d] shadow-2xs cursor-pointer self-start sm:self-auto"
            >
              <span>Explore All Services</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* ── Carousel Track ─────────────────────────────── */}
          <div className="relative">

            {/* ← Prev Arrow */}
            <button
              onClick={() => scrollBy(-1)}
              className="hidden md:flex absolute -left-5 md:-left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-gray-200 shadow-lg items-center justify-center text-gray-700 hover:text-[#ff4d6d] hover:border-[#ff4d6d] transition-all cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* → Next Arrow */}
            <button
              onClick={() => scrollBy(1)}
              className="hidden md:flex absolute -right-5 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-gray-200 shadow-lg items-center justify-center text-gray-700 hover:text-[#ff4d6d] hover:border-[#ff4d6d] transition-all cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Scrollable Track */}
            <div
              ref={scrollRef}
              className="bs-track flex gap-3 sm:gap-4 overflow-x-auto py-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {displayServices.map((service) => (
                <div
                  key={service.id}
                  className="flex-shrink-0 w-[165px] sm:w-[200px] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-4rem)/5)]"
                >
                  <div 
                    onClick={() => navigate(`/booking?category=${service.slug}`)}
                    className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-2xs hover:shadow-lg hover:border-gray-300 transition-all duration-300 w-full cursor-pointer h-full text-left p-2.5 sm:p-3"
                  >
                    {/* Service Image Box */}
                    <div className="relative w-full h-[140px] sm:h-[180px] bg-gray-50 rounded-xl overflow-hidden mb-2 shrink-0">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = getFallbackByName(service.name);
                        }}
                      />
                    </div>

                    {/* Service Info */}
                    <div className="flex flex-col flex-grow text-left min-w-0">
                      
                      {/* Category Tag */}
                      <span className="text-xs font-black uppercase text-gray-400 tracking-wider truncate mb-0.5">
                        {service.category}
                      </span>
                      
                      {/* Service Title */}
                      <h3 className="text-gray-900 font-extrabold text-[12px] sm:text-sm uppercase tracking-tight truncate leading-snug group-hover:text-[#ff4d6d] transition-colors mb-3 mt-auto" title={service.name}>
                        {service.name}
                      </h3>

                      {/* Book Now Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/booking?category=${service.slug}`);
                        }}
                        className="w-full bg-[#ff4d6d] hover:bg-[#e63956] text-white rounded-lg font-extrabold text-xs sm:text-sm h-8 sm:h-9 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      >
                        Book Now
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default BookingsSection;
