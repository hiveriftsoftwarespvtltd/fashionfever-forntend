import React, { useState, useEffect } from 'react';
import { 
  Play, 
  BookOpen, 
  Clock, 
  Search, 
  Sparkles, 
  Globe, 
  SlidersHorizontal,
  ChevronRight,
  BookMarked,
  Heart,
  LayoutGrid,
  List,
  ChevronDown,
  ArrowRight,
  Star,
  GraduationCap,
  Award,
  CheckCircle2,
  RotateCcw,
  X,
  Palette,
  Droplets,
  Scissors,
  Eye,
  Package,
  Layers,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPublicUserCourseList, getCourseCategories, searchCourses } from '../../api/educatorService';
import { toast } from '../../utils/toast';
import config from '../../config/config';
import acadmyHeroImg from '../../assets/acadmyhero.png';
import { getImageUrl } from '../../utils/imageUrl';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  const [langFilter, setLangFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'price_low' | 'price_high' | 'rating'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(9);

  const toggleWishlist = (id, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setWishlistedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info("Removed from wishlist");
      } else {
        next.add(id);
        toast.success("Added to wishlist");
      }
      return next;
    });
  };

  // Debounce search input to query API
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInputValue);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 450);
    return () => clearTimeout(timer);
  }, [searchInputValue]);

  // Robust course image resolution with category-based smart fallbacks
  const getCourseImage = (courseItem) => {
    if (!courseItem) return acadmyHeroImg;
    
    // 1. Check populated thumbnail object or string
    const thumb = courseItem.thumbnail;
    if (thumb) {
      if (thumb.url && typeof thumb.url === 'string') return getImageUrl(thumb.url);
      if (typeof thumb === 'string') {
        if (thumb.startsWith('http://') || thumb.startsWith('https://') || thumb.startsWith('data:')) {
          return getImageUrl(thumb);
        }
        return `${config.API_URL}/file/get-file/${thumb}`;
      }
    }

    // 2. Check coverImage or image field
    if (courseItem.coverImage?.url) return getImageUrl(courseItem.coverImage.url);
    if (typeof courseItem.coverImage === 'string' && courseItem.coverImage.startsWith('http')) return getImageUrl(courseItem.coverImage);
    if (courseItem.image) return getImageUrl(courseItem.image);

    // 3. Fallbacks based on category / title keywords
    const name = (courseItem.title || courseItem.name || '').toUpperCase();
    if (name.includes('SKIN') || name.includes('FACIAL')) {
      return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80';
    }
    if (name.includes('MAKEUP') || name.includes('COSMETIC') || name.includes('BRIDAL')) {
      return 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80';
    }
    if (name.includes('HAIR') || name.includes('STYLING')) {
      return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80';
    }
    if (name.includes('NAIL') || name.includes('MANICURE')) {
      return 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop&q=80';
    }

    return acadmyHeroImg;
  };

  // Title case formatting helper
  const formatCourseTitle = (str) => {
    if (!str) return 'Professional Masterclass';
    return str
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  // Level badge styling
  const getLevelBadgeStyle = (lvl) => {
    switch ((lvl || '').toUpperCase()) {
      case 'ADVANCED':
      case 'PRO':
        return 'bg-purple-900/85 text-purple-200 border-purple-500/40';
      case 'INTERMEDIATE':
        return 'bg-sky-900/85 text-sky-200 border-sky-500/40';
      default:
        return 'bg-emerald-900/85 text-emerald-200 border-emerald-500/40';
    }
  };

  // Category Icon helper
  const getCategoryIcon = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('all')) return <LayoutGrid size={14} />;
    if (lower.includes('skin') || lower.includes('facial')) return <Droplets size={14} className="text-sky-500" />;
    if (lower.includes('makeup') || lower.includes('cosmetic')) return <Palette size={14} className="text-rose-500" />;
    if (lower.includes('hair')) return <Scissors size={14} className="text-amber-500" />;
    if (lower.includes('eye')) return <Eye size={14} className="text-indigo-500" />;
    if (lower.includes('nail')) return <Sparkles size={14} className="text-purple-500" />;
    return <GraduationCap size={14} className="text-primary" />;
  };

  // Fetch categories list on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCourseCategories();
        if (res?.success) {
          const list = res.data?.data || res.data || [];
          setCategoriesList(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch courses with active category parameter or search query and pagination
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: limit
        };
        
        let res;
        
        if (searchQuery.trim()) {
          params.keyword = searchQuery.trim();
          res = await searchCourses(params);
        } else {
          if (activeCategory !== 'All') {
            const selectedCat = categoriesList.find(c => (c.label || c.name) === activeCategory);
            if (selectedCat) {
              params.categoryId = selectedCat._id;
            }
          }
          res = await getPublicUserCourseList(params);
        }

        if (res?.success) {
          const list = res.data?.courses || res.data?.data?.courses || res.data || [];
          setCourses(Array.isArray(list) ? list : []);
          
          const pagination = res.data?.pagination || res.data?.data?.pagination;
          if (pagination) {
            setTotalPages(pagination.totalPages || 1);
            setCurrentPage(pagination.currentPage || 1);
          } else {
            setTotalPages(1);
          }
        } else {
          toast.error(res?.message || 'Failed to fetch courses');
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        toast.error('Could not connect to the server');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [activeCategory, currentPage, limit, categoriesList, searchQuery]);

  // Dynamically extract categories from list for tab controls
  const categories = ['All', ...categoriesList.map(c => c.label || c.name).filter(Boolean)];

  // Local filtering & sorting
  const processedCourses = courses
    .filter(course => {
      const matchesLevel = levelFilter === 'All' || (course.level || '').toUpperCase() === levelFilter.toUpperCase();
      const matchesLang = langFilter === 'All' || (course.language || '').toUpperCase() === langFilter.toUpperCase();
      return matchesLevel && matchesLang;
    })
    .sort((a, b) => {
      const priceA = a.offeredPrice !== undefined && a.offeredPrice !== null ? a.offeredPrice : (a.sellingPrice || a.price || 0);
      const priceB = b.offeredPrice !== undefined && b.offeredPrice !== null ? b.offeredPrice : (b.sellingPrice || b.price || 0);
      if (sortBy === 'price_low') return priceA - priceB;
      if (sortBy === 'price_high') return priceB - priceA;
      if (sortBy === 'rating') return (b.averageRating || b.rating || 4.9) - (a.averageRating || a.rating || 4.9);
      return 0; // Default recommended
    });

  const handleCategoryChange = (catName) => {
    setActiveCategory(catName);
    setCurrentPage(1);
  };

  const hasActiveFilters = levelFilter !== 'All' || langFilter !== 'All' || activeCategory !== 'All' || searchQuery !== '' || sortBy !== 'recommended';

  const resetAllFilters = () => {
    setLevelFilter('All');
    setLangFilter('All');
    setActiveCategory('All');
    setSearchInputValue('');
    setSearchQuery('');
    setSortBy('recommended');
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen font-outfit pb-24 text-left text-gray-700 antialiased">
      
      {/* ── 1. ACADEMY HERO BANNER ────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden bg-pink-100/50 border-b border-gray-200 h-[150px] sm:h-[210px] md:h-[250px]">
        <img
          src={acadmyHeroImg}
          alt="FashionFever Pro Academy Banner"
          className="w-full h-full object-cover object-center block absolute inset-0"
        />

        {/* Text Overlay */}
        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-white/60 via-white/20 to-transparent">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl text-left space-y-1 sm:space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-black text-xs uppercase tracking-wider">
                <Sparkles size={12} /> FashionFever Pro Academy
              </span>

              <h1 className="text-xl sm:text-3xl md:text-4xl font-normal text-gray-900 font-serif leading-[1.1] tracking-tight">
                Unlock Your <span className="font-serif italic font-bold text-primary">Creative Genius</span>
              </h1>

              <p className="text-gray-700 font-medium text-xs sm:text-sm md:text-base leading-snug max-w-md hidden sm:block">
                Step-by-step masterclasses led by celebrity artists & industry heavyweights. Build your certified beauty portfolio.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. TRUST & FEATURES STRIP ────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-150 py-3 sm:py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-xs font-bold text-gray-600">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-pink-50 text-primary flex items-center justify-center shrink-0">
                <Play size={14} className="fill-primary" />
              </div>
              <span className="truncate">4K Step-by-Step Videos</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Award size={15} />
              </div>
              <span className="truncate">Govt. Verified Certificate</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Star size={14} className="fill-amber-400" />
              </div>
              <span className="truncate">4.9/5 Rating (1.2k+ Artists)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Clock size={14} />
              </div>
              <span className="truncate">Lifetime On-Demand Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN CATALOG & TOOLBAR CONTAINER ─────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-20">
        
        {/* Top Control Bar */}
        <div className="space-y-4 mb-8">
          
          {/* Row 1: Search, Filter Toggle, View Switcher & Sort */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input 
                type="text" 
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                placeholder="Search masterclasses, facial, bridal, hair..." 
                className="w-full bg-white border border-gray-200 rounded-2xl py-2.5 pl-10 pr-9 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-xs"
              />
              {searchInputValue && (
                <button
                  onClick={() => { setSearchInputValue(''); setSearchQuery(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Quick Controls: Sort, Filter Drawer & View Switcher */}
            <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0 flex-wrap">
              
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-700 outline-none cursor-pointer hover:border-gray-300 transition-all shadow-xs"
              >
                <option value="recommended">Featured / Top</option>
                <option value="rating">Highest Rated</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>

              {/* Filters Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                  showFilters || hasActiveFilters
                    ? 'bg-primary border-primary text-white' 
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <SlidersHorizontal size={14} /> 
                <span>Filters</span> 
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-white inline-block animate-pulse" />
                )}
                <ChevronDown size={14} className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* Grid vs List View Toggle */}
              <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200/80">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid' 
                      ? 'bg-white text-primary shadow-xs' 
                      : 'text-gray-400 hover:text-gray-800'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list' 
                      ? 'bg-white text-primary shadow-xs' 
                      : 'text-gray-400 hover:text-gray-800'
                  }`}
                  title="List View"
                >
                  <List size={16} />
                </button>
              </div>

            </div>

          </div>

          {/* Row 2: Category Rail Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-2 shrink-0 border select-none ${
                    isActive 
                      ? 'bg-primary border-primary text-white shadow-xs scale-[1.02]' 
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* Active Filter Chips Bar (if filters active) */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-pink-50/60 border border-pink-100/80 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-primary uppercase text-xs tracking-wider">Active Filters:</span>
                {activeCategory !== 'All' && (
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-pink-200 font-bold text-gray-800 flex items-center gap-1">
                    Category: {activeCategory}
                    <button onClick={() => setActiveCategory('All')} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                  </span>
                )}
                {levelFilter !== 'All' && (
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-pink-200 font-bold text-gray-800 flex items-center gap-1">
                    Level: {levelFilter}
                    <button onClick={() => setLevelFilter('All')} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                  </span>
                )}
                {langFilter !== 'All' && (
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-pink-200 font-bold text-gray-800 flex items-center gap-1">
                    Language: {langFilter}
                    <button onClick={() => setLangFilter('All')} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                  </span>
                )}
              </div>
              <button
                onClick={resetAllFilters}
                className="text-xs font-black text-primary hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} /> Clear All
              </button>
            </div>
          )}

          {/* Expandable Advanced Filters Drawer */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-white border border-gray-200 shadow-sm animate-in fade-in duration-200 text-sm">
              <div>
                <label className="text-[11px] font-black uppercase text-gray-400 block mb-1.5 tracking-wider">Course Level</label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800 outline-none cursor-pointer focus:border-primary"
                >
                  <option value="All">All Skill Levels</option>
                  <option value="BEGINNER">Beginner (Foundation)</option>
                  <option value="INTERMEDIATE">Intermediate (Skilled)</option>
                  <option value="ADVANCED">Advanced (Pro Artist)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-gray-400 block mb-1.5 tracking-wider">Instruction Language</label>
                <select
                  value={langFilter}
                  onChange={(e) => setLangFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800 outline-none cursor-pointer focus:border-primary"
                >
                  <option value="All">All Languages</option>
                  <option value="HINDI">Hindi (हिंदी)</option>
                  <option value="ENGLISH">English</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetAllFilters}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={13} /> Reset Filter Set
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ── 4. COURSES CATALOG STAGE (GRID / LIST VIEW) ───────────────────── */}
        {loading ? (
          /* Modern Card Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4.5">
            {[1, 2, 3, 4].map((skeleton) => (
              <div key={skeleton} className="bg-white rounded-2xl overflow-hidden border border-gray-150 p-3.5 space-y-3 animate-pulse">
                <div className="w-full aspect-[16/9.5] bg-gray-200 rounded-xl" />
                <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-3.5 bg-gray-200 rounded w-full" />
                <div className="h-8 bg-gray-200 rounded-lg pt-2" />
              </div>
            ))}
          </div>
        ) : processedCourses.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200 p-8 flex flex-col items-center justify-center shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-pink-50 text-primary flex items-center justify-center mb-4">
              <BookMarked size={32} />
            </div>
            <h3 className="text-base font-extrabold text-gray-800 uppercase tracking-tight">No Masterclasses Found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs text-center leading-relaxed font-medium">
              We couldn't find any beauty masterclasses matching your selected filters.
            </p>
            <button
              onClick={resetAllFilters}
              className="mt-5 bg-primary hover:bg-[#b50157] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* ── GRID VIEW (Compact & Elegant 4-Column Cards) ─────────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4.5">
            {processedCourses.map((course) => {
              const categoryName = typeof course.categoryId === 'object' 
                ? (course.categoryId?.name || course.categoryId?.label || 'Cosmetics')
                : (course.category || 'Beauty Academy');
              
              const educatorName = typeof course.educatorId === 'object' 
                ? (course.educatorId?.fullName || course.educatorId?.userName || 'Master Educator')
                : (course.instructor || 'FashionFever Artist');

              const educatorAvatar = typeof course.educatorId === 'object' && course.educatorId?.profileImage 
                ? getImageUrl(course.educatorId.profileImage) 
                : null;

              const isFree = course.isFree || course.offeredPrice === 0;
              const offeredPrice = isFree ? 0 : (course.offeredPrice !== undefined && course.offeredPrice !== null ? course.offeredPrice : (course.sellingPrice || course.price || 999));
              const sellingPrice = course.sellingPrice && course.sellingPrice > offeredPrice 
                ? course.sellingPrice 
                : (course.costPrice && course.costPrice > offeredPrice ? course.costPrice : Math.round(offeredPrice * 1.5));
              const discountPercent = !isFree && sellingPrice > offeredPrice ? Math.round(((sellingPrice - offeredPrice) / sellingPrice) * 100) : 0;

              const level = (course.level || 'BEGINNER').toUpperCase();
              const duration = course.totalDurationInMinutes ? `${course.totalDurationInMinutes} Mins` : (course.duration || '25 Mins');
              const totalLessons = course.totalLessons || 1;
              const rating = course.averageRating || course.rating || 4.9;
              const enrolledCount = course.enrolledCount || 120;
              const courseImage = getCourseImage(course);
              const formattedTitle = formatCourseTitle(course.title);
              const isWishlisted = wishlistedIds.has(course._id);

              return (
                <div 
                  key={course._id}
                  className="group relative flex flex-col bg-white rounded-2xl border border-gray-200/90 hover:border-primary/40 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden text-left"
                >
                  {/* Top Thumbnail Box */}
                  <div className="relative w-full aspect-[16/9.5] bg-gray-900 overflow-hidden shrink-0">
                    <img 
                      src={courseImage} 
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = acadmyHeroImg;
                      }}
                    />
                    
                    {/* Dark Vignette Overlay for Crisp Text Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

                    {/* Centered Hover Play Button Overlay */}
                    <Link 
                      to={`/academy/course/${course._id}`}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/95 text-primary flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-200">
                        <Play size={16} className="fill-primary ml-0.5" />
                      </div>
                    </Link>

                    {/* Top Level Badge & Wishlist Heart */}
                    <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-20 pointer-events-auto">
                      <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur-md border shadow-2xs ${getLevelBadgeStyle(level)}`}>
                        {level}
                      </span>
                      <button 
                        type="button"
                        onClick={(e) => toggleWishlist(course._id, e)}
                        className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-primary backdrop-blur-md flex items-center justify-center shadow-xs transition-all cursor-pointer active:scale-90"
                        title="Wishlist"
                      >
                        <Heart size={14} className={isWishlisted ? 'fill-[#ff4d6d] text-[#ff4d6d]' : ''} />
                      </button>
                    </div>

                    {/* Bottom Metadata Badges on Image */}
                    <div className="absolute bottom-2 inset-x-2.5 flex items-center justify-between z-20 text-xs font-bold text-white pointer-events-none">
                      <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
                        <Clock size={11} className="text-[#ff4d6d]" /> {duration}
                      </span>
                      {discountPercent > 0 && (
                        <span className="bg-[#ff4d6d] text-white font-black px-1.5 py-0.5 rounded shadow-2xs text-xs uppercase tracking-wider">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3 sm:p-3.5 flex flex-col flex-grow justify-between space-y-2">
                    
                    <div>
                      {/* Category Tag + Rating */}
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-primary text-xs font-black uppercase tracking-wider border border-rose-100/80">
                          {categoryName}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                          <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
                          <span className="text-gray-800 font-extrabold">{rating}</span>
                          <span className="text-gray-400 text-xs font-medium">({enrolledCount})</span>
                        </div>
                      </div>

                      {/* Course Title */}
                      <Link to={`/academy/course/${course._id}`}>
                        <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-primary transition-colors leading-snug line-clamp-1" title={course.title}>
                          {formattedTitle}
                        </h3>
                      </Link>

                      {/* Educator / Instructor Section */}
                      <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-gray-100">
                        {educatorAvatar ? (
                          <img src={educatorAvatar} alt={educatorName} className="w-5 h-5 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center text-xs font-black uppercase">
                            {educatorName.charAt(0)}
                          </div>
                        )}
                        <span className="text-[11px] font-bold text-gray-700 truncate">
                          {educatorName}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded ml-auto flex items-center gap-0.5 shrink-0">
                          <CheckCircle2 size={9} /> Verified
                        </span>
                      </div>

                      {/* Feature Highlights Pills */}
                      <div className="flex flex-wrap items-center gap-1 mt-2 text-xs font-bold text-gray-500">
                        <span className="flex items-center gap-1 bg-gray-50 border border-gray-150 px-1.5 py-0.5 rounded">
                          <Globe size={10} className="text-[#ff4d6d]" /> {course.language || 'HINDI'}
                        </span>
                        <span className="flex items-center gap-1 bg-gray-50 border border-gray-150 px-1.5 py-0.5 rounded">
                          <BookOpen size={10} className="text-[#ff4d6d]" /> {totalLessons} {totalLessons === 1 ? 'Lesson' : 'Lessons'}
                        </span>
                        <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded">
                          <Award size={10} /> Certificate
                        </span>
                      </div>
                    </div>

                    {/* Pricing & CTA Bottom Footer */}
                    <div className="pt-2.5 border-t border-dashed border-gray-150 flex items-center justify-between gap-2 mt-auto">
                      <div>
                        <div className="flex items-baseline gap-1">
                          {isFree ? (
                            <span className="text-sm font-black text-emerald-600">FREE</span>
                          ) : (
                            <>
                              <span className="text-sm sm:text-base font-black text-gray-900">₹{offeredPrice}</span>
                              {sellingPrice > offeredPrice && (
                                <span className="text-xs text-gray-400 line-through font-semibold">₹{sellingPrice}</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <Link 
                        to={`/academy/course/${course._id}`}
                        className="bg-primary hover:bg-[#b50157] text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all shadow-xs active:scale-95 shrink-0"
                      >
                        <span>Enroll</span>
                        <ArrowRight size={11} className="stroke-[3]" />
                      </Link>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── LIST VIEW (Compact Proportioned Masterclass Cards) ────────── */
          <div className="flex flex-col gap-3.5">
            {processedCourses.map((course) => {
              const categoryName = typeof course.categoryId === 'object' 
                ? (course.categoryId?.name || course.categoryId?.label || 'Cosmetics')
                : (course.category || 'Beauty Academy');
              
              const educatorName = typeof course.educatorId === 'object' 
                ? (course.educatorId?.fullName || course.educatorId?.userName || 'Master Educator')
                : (course.instructor || 'FashionFever Artist');

              const educatorAvatar = typeof course.educatorId === 'object' && course.educatorId?.profileImage 
                ? getImageUrl(course.educatorId.profileImage) 
                : null;

              const isFree = course.isFree || course.offeredPrice === 0;
              const offeredPrice = isFree ? 0 : (course.offeredPrice !== undefined && course.offeredPrice !== null ? course.offeredPrice : (course.sellingPrice || course.price || 999));
              const sellingPrice = course.sellingPrice && course.sellingPrice > offeredPrice 
                ? course.sellingPrice 
                : (course.costPrice && course.costPrice > offeredPrice ? course.costPrice : Math.round(offeredPrice * 1.5));
              const discountPercent = !isFree && sellingPrice > offeredPrice ? Math.round(((sellingPrice - offeredPrice) / sellingPrice) * 100) : 0;

              const level = (course.level || 'BEGINNER').toUpperCase();
              const duration = course.totalDurationInMinutes ? `${course.totalDurationInMinutes} Mins` : (course.duration || '25 Mins');
              const totalLessons = course.totalLessons || 1;
              const rating = course.averageRating || course.rating || 4.9;
              const enrolledCount = course.enrolledCount || 120;
              const courseImage = getCourseImage(course);
              const formattedTitle = formatCourseTitle(course.title);
              const isWishlisted = wishlistedIds.has(course._id);

              return (
                <div 
                  key={course._id}
                  className="group relative flex flex-col sm:flex-row bg-white rounded-2xl border border-gray-200/90 hover:border-primary/40 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden text-left"
                >
                  {/* Left Thumbnail (Fixed Width Aspect Ratio) */}
                  <div className="w-full sm:w-48 md:w-56 shrink-0 aspect-[16/9] sm:aspect-auto relative bg-gray-900 overflow-hidden">
                    <img 
                      src={courseImage} 
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = acadmyHeroImg;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

                    {/* Centered Hover Play Button Overlay */}
                    <Link 
                      to={`/academy/course/${course._id}`}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/95 text-primary flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-200">
                        <Play size={16} className="fill-primary ml-0.5" />
                      </div>
                    </Link>

                    {/* Top Badges */}
                    <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-20 pointer-events-auto">
                      <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur-md border shadow-xs ${getLevelBadgeStyle(level)}`}>
                        {level}
                      </span>
                      <button 
                        type="button"
                        onClick={(e) => toggleWishlist(course._id, e)}
                        className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-primary backdrop-blur-md flex items-center justify-center shadow-xs transition-all cursor-pointer active:scale-90"
                      >
                        <Heart size={14} className={isWishlisted ? 'fill-[#ff4d6d] text-[#ff4d6d]' : ''} />
                      </button>
                    </div>

                    {/* Bottom Metadata Badges */}
                    <div className="absolute bottom-2 inset-x-2.5 flex items-center justify-between z-20 text-xs font-bold text-white pointer-events-none">
                      <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
                        <Clock size={11} className="text-[#ff4d6d]" /> {duration}
                      </span>
                      {discountPercent > 0 && (
                        <span className="bg-[#ff4d6d] text-white font-black px-1.5 py-0.5 rounded shadow-xs text-xs uppercase tracking-wider">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Details Panel */}
                  <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 space-y-2.5">
                    
                    <div>
                      {/* Top Row: Category Tag + Rating */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-primary text-xs font-black uppercase tracking-wider border border-rose-100/80">
                          {categoryName}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                          <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
                          <span className="text-gray-800 font-extrabold">{rating}</span>
                          <span className="text-gray-400 text-xs font-medium">({enrolledCount}+ enrolled)</span>
                        </div>
                      </div>

                      {/* Course Title */}
                      <Link to={`/academy/course/${course._id}`}>
                        <h3 className="text-sm sm:text-base font-extrabold text-gray-900 group-hover:text-primary transition-colors leading-snug line-clamp-1">
                          {formattedTitle}
                        </h3>
                      </Link>

                      {/* Educator Row */}
                      <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-gray-100">
                        {educatorAvatar ? (
                          <img src={educatorAvatar} alt={educatorName} className="w-5 h-5 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center text-xs font-black uppercase">
                            {educatorName.charAt(0)}
                          </div>
                        )}
                        <span className="text-xs font-bold text-gray-800">
                          {educatorName}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <CheckCircle2 size={10} /> Verified Instructor
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] sm:text-xs text-gray-500 font-normal mt-1.5 line-clamp-2 leading-relaxed">
                        {course.description || course.subtitle || `Step-by-step masterclass covering professional ${categoryName.toLowerCase()} techniques.`}
                      </p>

                      {/* Meta Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-xs font-bold text-gray-600">
                        <span className="flex items-center gap-1 bg-gray-50 border border-gray-150 px-2 py-0.5 rounded">
                          <Globe size={11} className="text-[#ff4d6d]" /> {course.language || 'HINDI'}
                        </span>
                        <span className="flex items-center gap-1 bg-gray-50 border border-gray-150 px-2 py-0.5 rounded">
                          <BookOpen size={11} className="text-[#ff4d6d]" /> {totalLessons} {totalLessons === 1 ? 'Lesson' : 'Lessons'}
                        </span>
                        <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded">
                          <Award size={11} /> Certificate Included
                        </span>
                      </div>
                    </div>

                    {/* Bottom Pricing & CTA */}
                    <div className="pt-2.5 border-t border-dashed border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mt-auto">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          {isFree ? (
                            <span className="text-base font-black text-emerald-600">FREE</span>
                          ) : (
                            <>
                              <span className="text-base sm:text-lg font-black text-gray-900">₹{offeredPrice}</span>
                              {sellingPrice > offeredPrice && (
                                <span className="text-xs text-gray-400 line-through font-semibold">₹{sellingPrice}</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Link 
                          to={`/academy/course/${course._id}`}
                          className="flex-1 sm:flex-initial bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all text-center"
                        >
                          View Syllabus
                        </Link>
                        <Link 
                          to={`/academy/course/${course._id}`}
                          className="flex-1 sm:flex-initial bg-primary hover:bg-[#b50157] text-white px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-xs active:scale-95"
                        >
                          <span>Enroll Now</span>
                          <ArrowRight size={11} className="stroke-[3]" />
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── 5. PAGINATION CONTROLS ────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-14 pt-6 border-t border-gray-150">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              Prev
            </button>
            <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              Next
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

export default CourseCatalog;
