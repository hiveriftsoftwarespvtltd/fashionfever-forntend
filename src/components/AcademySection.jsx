import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, GraduationCap, ChevronLeft, ChevronRight, BookOpen, Loader2, ArrowRight } from 'lucide-react';
import { getPublicUserCourseList } from '../api/educatorService';

const getImageForCourse = (item) => {
  if (item.thumbnail?.url) return item.thumbnail.url;
  if (typeof item.thumbnail === 'string' && item.thumbnail.startsWith('http')) return item.thumbnail;
  if (item.coverImage?.url) return item.coverImage.url;
  if (typeof item.coverImage === 'string' && item.coverImage.startsWith('http')) return item.coverImage;

  const n = (item.title || item.name || '').toUpperCase();
  if (n.includes('MANICURE') || n.includes('NAIL')) {
    return 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop';
  }
  if (n.includes('SKIN') || n.includes('FACIAL') || n.includes('HITESH')) {
    return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop';
  }
  if (n.includes('HAIR')) {
    return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop';
  }
  if (n.includes('MAKEUP')) {
    return 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop';
};

const AcademySection = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Call exact endpoint params: page=1&limit=6
        const res = await getPublicUserCourseList({ page: 1, limit: 6 });
        
        if (isMounted && res?.success) {
          const list = res.data?.courses || (Array.isArray(res.data) ? res.data : (res.data?.data || []));
          if (Array.isArray(list)) {
            const formatted = list.map(item => {
              const offeredPrice = item.offeredPrice !== undefined ? item.offeredPrice : (item.sellingPrice || item.price || 4999);
              const sellingPrice = item.sellingPrice !== undefined ? item.sellingPrice : (item.costPrice || Math.round(offeredPrice * 1.4));
              const discountPercent = sellingPrice > offeredPrice ? Math.round(((sellingPrice - offeredPrice) / sellingPrice) * 100) : 0;

              const catName = typeof item.categoryId === 'object' ? (item.categoryId?.name || item.categoryId?.label || 'COURSE') : (item.category || item.level || 'COURSE');
              const eduName = typeof item.educatorId === 'object' ? (item.educatorId?.fullName || item.educatorId?.userName || 'Fashion Fever Educator') : (item.instructor || 'Fashion Fever Educator');

              return {
                id: item._id || item.id,
                category: String(catName).toUpperCase(),
                name: item.title || item.name || 'Professional Course',
                instructor: eduName,
                rating: item.averageRating || item.rating || 4.9,
                students: `${item.enrolledCount || item.totalStudents || 120}+ Enrolled`,
                duration: item.totalDurationInMinutes ? `${item.totalDurationInMinutes} Mins` : (item.duration || 'Self Paced'),
                mode: item.level ? `${String(item.level).toUpperCase()} LEVEL` : 'Online Course',
                price: offeredPrice,
                originalPrice: sellingPrice,
                image: getImageForCourse(item),
                discount: discountPercent > 0 ? `${discountPercent}% OFF` : null
              };
            });
            setCourses(formatted);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dynamic courses from /courses/public-user-course-list:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCourses();
    return () => { isMounted = false; };
  }, []);

  const scrollBy = (dir) => {
    const el = scrollRef.current;
    if (el) {
      const offset = el.clientWidth * 0.8 * dir;
      el.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="bg-white py-6 sm:py-10">
        <div className="max-w-[1600px] mx-auto px-2 sm:px-4 md:px-8">
          <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex items-center justify-center gap-2 text-gray-400 font-bold text-sm">
            <Loader2 className="animate-spin text-[#ff4d6d]" size={20} />
            <span>Loading Academy Courses...</span>
          </div>
        </div>
      </section>
    );
  }

  if (!courses || courses.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-6 sm:py-10">
      <style>{`.as-track::-webkit-scrollbar{display:none}`}</style>
      <div className="max-w-[1600px] mx-auto px-2 sm:px-4 md:px-8">
        
        {/* Outer Card Wrapper */}
        <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-8 shadow-2xs overflow-hidden">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-slate-100">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-black uppercase tracking-widest border border-purple-200/80 mb-2 shadow-2xs">
                <GraduationCap size={14} className="text-purple-600" /> LEARN BEAUTY & MAKEUP
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight font-serif">
                Professional Academy Courses
              </h2>
            </div>
            <Link
              to="/academy"
              className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-[#ff4d6d] text-slate-700 hover:text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300 border border-slate-200 hover:border-[#ff4d6d] shadow-2xs cursor-pointer self-start sm:self-auto"
            >
              <span>View All Courses</span>
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
              className="as-track flex gap-3 sm:gap-4 overflow-x-auto py-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex-shrink-0 w-[165px] sm:w-[200px] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-4rem)/5)]"
                >
                  <div 
                    onClick={() => navigate(`/academy?courseId=${course.id}`)}
                    className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-2xs hover:shadow-lg hover:border-gray-300 transition-all duration-300 w-full cursor-pointer h-full text-left p-2 sm:p-3 font-sans"
                  >
                    {/* Course Image Box */}
                    <div className="relative w-full h-[140px] sm:h-[180px] bg-gray-50 rounded-xl overflow-hidden mb-2 shrink-0">
                      <img
                        src={course.image}
                        alt={course.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop'; }}
                      />
                      {course.discount && (
                        <span className="absolute top-1.5 left-1.5 bg-[#ff4d6d] text-white text-[11px] sm:text-xs font-extrabold uppercase px-1.5 py-0.5 rounded-xs tracking-wider shadow-2xs">
                          {course.discount}
                        </span>
                      )}
                    </div>

                    {/* Course Details */}
                    <div className="flex flex-col flex-grow text-left min-w-0">
                      
                      {/* Category Tag */}
                      <span className="text-xs font-black uppercase text-gray-500 tracking-wider truncate mb-0.5">
                        {course.category}
                      </span>
                      
                      {/* Course Title */}
                      <h3 className="text-gray-900 font-extrabold text-[11px] sm:text-sm uppercase tracking-tight truncate leading-snug group-hover:text-[#ff4d6d] transition-colors mb-0.5" title={course.name}>
                        {course.name}
                      </h3>

                      {/* Instructor / Educator Name */}
                      <p className="text-xs text-gray-700 font-bold truncate mb-0.5">
                        {course.instructor}
                      </p>

                      {/* Rating & Students */}
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mb-0.5">
                        <Star size={10} className="fill-amber-400 text-amber-400 shrink-0" />
                        <span className="text-gray-700 font-bold">{course.rating} ({course.students})</span>
                      </div>

                      {/* Duration & Mode */}
                      <p className="text-xs text-gray-500 font-medium mb-1.5 truncate flex items-center gap-1">
                        <GraduationCap size={11} /> {course.duration} • {course.mode}
                      </p>

                      {/* Price & Action Row */}
                      <div className="flex items-center justify-between gap-1 mb-2 mt-auto min-w-0">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs sm:text-base font-black text-gray-900">₹{course.price}</span>
                          {course.originalPrice > course.price && (
                            <span className="text-xs text-gray-400 line-through font-medium">₹{course.originalPrice}</span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => navigate(`/academy?courseId=${course.id}`)}
                          className="flex-1 bg-[#ff4d6d]/10 hover:bg-[#ff4d6d]/20 text-[#ff4d6d] rounded-lg font-extrabold text-[11px] sm:text-xs h-7 sm:h-8 flex items-center justify-center transition-all cursor-pointer"
                        >
                          Syllabus
                        </button>
                        <button 
                          onClick={() => navigate(`/academy?courseId=${course.id}`)}
                          className="flex-1 bg-[#ff4d6d] hover:bg-[#e63956] text-white rounded-lg font-extrabold text-[11px] sm:text-xs h-7 sm:h-8 flex items-center justify-center transition-all cursor-pointer"
                        >
                          Enroll
                        </button>
                      </div>

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

export default AcademySection;
