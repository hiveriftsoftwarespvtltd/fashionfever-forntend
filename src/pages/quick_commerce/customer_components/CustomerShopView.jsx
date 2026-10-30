import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  MapPin, 
  Search, 
  ShoppingBag, 
  Check, 
  ChevronRight, 
  Star, 
  Heart, 
  Plus, 
  Minus, 
  LayoutGrid, 
  Scissors, 
  Package, 
  Droplets, 
  Palette, 
  Eye, 
  ArrowRight, 
  X, 
  Clock, 
  SlidersHorizontal, 
  Tag, 
  Filter, 
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { getImageUrl, handleImageError } from '../../../utils/imageUrl';

const CustomerShopView = ({
  category,
  setCategory,
  dynamicCategories = [],
  search,
  setSearch,
  fetchProducts,
  locationMode,
  gpsLocationLabel,
  pincode,
  isAuthenticated,
  addresses = [],
  selectedAddressId,
  setSelectedAddressId,
  setPincode,
  setLocationMode,
  setGpsLocationLabel,
  setShowLocationPromptModal,
  loading,
  products = [],
  quickCart = [],
  handleAddToCart,
  handleDecreaseQuantity,
  handleIncreaseQuantity,
  setActiveSubTab,
  navigate
}) => {
  // Calculate maximum price in catalog (default 2000 if catalog is small or empty)
  const maxCatalogPrice = useMemo(() => {
    if (!products || products.length === 0) return 2000;
    const maxP = products.reduce((max, p) => {
      const price = p.variants?.[0]?.offeredPrice !== undefined ? p.variants[0].offeredPrice : (p.offeredPrice || p.price || 0);
      return Math.max(max, price);
    }, 0);
    return Math.max(Math.ceil(maxP / 500) * 500, 1000);
  }, [products]);

  // Client-side quick filter, pricing slider, and sorting states
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'price_asc' | 'price_desc' | 'discount'
  const [maxPrice, setMaxPrice] = useState(3000);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Synchronize initial maxPrice when products load
  React.useEffect(() => {
    if (maxCatalogPrice > 0) {
      setMaxPrice(prev => (prev === 3000 ? maxCatalogPrice : Math.min(prev, maxCatalogPrice)));
    }
  }, [maxCatalogPrice]);

  const isPriceFiltered = maxPrice < maxCatalogPrice;

  // Helper to dynamically render a stylish icon for categories
  const getCategoryIcon = (catName) => {
    const lower = (catName || '').toLowerCase();
    if (lower.includes('skin') || lower.includes('serum') || lower.includes('face') || lower.includes('lotion')) {
      return <Droplets size={16} className="text-sky-500 shrink-0" />;
    }
    if (lower.includes('lip') || lower.includes('makeup') || lower.includes('matte') || lower.includes('cosmetic')) {
      return <Palette size={16} className="text-rose-500 shrink-0" />;
    }
    if (lower.includes('hair') || lower.includes('shampoo') || lower.includes('oil')) {
      return <Scissors size={16} className="text-amber-500 shrink-0" />;
    }
    if (lower.includes('eye') || lower.includes('liner') || lower.includes('mascara') || lower.includes('brow')) {
      return <Eye size={16} className="text-indigo-500 shrink-0" />;
    }
    if (lower.includes('fragrance') || lower.includes('perfume') || lower.includes('body')) {
      return <Heart size={16} className="text-pink-500 shrink-0" />;
    }
    return <Package size={16} className="text-gray-500 shrink-0" />;
  };

  // Filter & Sort Products
  const processedProducts = useMemo(() => {
    let result = [...products];

    // 1. Price Range Slider Bar Filter
    if (maxPrice < maxCatalogPrice) {
      result = result.filter(p => {
        const price = p.variants?.[0]?.offeredPrice !== undefined ? p.variants[0].offeredPrice : (p.offeredPrice || p.price || 0);
        return price <= maxPrice;
      });
    }

    // 2. In Stock Only
    if (inStockOnly) {
      result = result.filter(p => {
        const stock = p.variants?.[0]?.stock !== undefined ? p.variants[0].stock : (p.stock || 10);
        return stock > 0;
      });
    }

    // 3. Sort Options
    if (sortBy === 'price_asc') {
      result.sort((a, b) => {
        const priceA = a.variants?.[0]?.offeredPrice !== undefined ? a.variants[0].offeredPrice : (a.offeredPrice || a.price || 0);
        const priceB = b.variants?.[0]?.offeredPrice !== undefined ? b.variants[0].offeredPrice : (b.offeredPrice || b.price || 0);
        return priceA - priceB;
      });
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => {
        const priceA = a.variants?.[0]?.offeredPrice !== undefined ? a.variants[0].offeredPrice : (a.offeredPrice || a.price || 0);
        const priceB = b.variants?.[0]?.offeredPrice !== undefined ? b.variants[0].offeredPrice : (b.offeredPrice || b.price || 0);
        return priceB - priceA;
      });
    } else if (sortBy === 'discount') {
      result.sort((a, b) => {
        const aSales = a.variants?.[0]?.salesPrice || a.price || 0;
        const aOff = a.variants?.[0]?.offeredPrice || a.offeredPrice || aSales;
        const bSales = b.variants?.[0]?.salesPrice || b.price || 0;
        const bOff = b.variants?.[0]?.offeredPrice || b.offeredPrice || bSales;
        const discA = aSales > aOff ? (aSales - aOff) : 0;
        const discB = bSales > bOff ? (bSales - bOff) : 0;
        return discB - discA;
      });
    }

    return result;
  }, [products, maxPrice, maxCatalogPrice, inStockOnly, sortBy]);

  // Express bag calculation for sticky bottom bar
  const totalQuickCartPrice = quickCart.reduce((acc, it) => acc + (it.price * it.qty), 0);

  return (
    <div className="w-full text-left font-outfit antialiased">
      
      {/* MOBILE CATEGORY SCROLL RAIL (< md screens) */}
      <div className="block md:hidden mb-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold uppercase text-gray-700 tracking-wider flex items-center gap-1.5">
            <LayoutGrid size={15} className="text-gray-600" /> Categories
          </span>
          {category && (
            <button 
              onClick={() => setCategory('')}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Show All
            </button>
          )}
        </div>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1 -mx-2 px-2 scroll-smooth">
          {/* All category pill */}
          <button
            onClick={() => setCategory('')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              category === ''
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <LayoutGrid size={15} />
            <span>All Products</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ml-1 ${
              category === '' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {products.length}
            </span>
          </button>

          {/* Dynamic categories */}
          {dynamicCategories.map((cat) => {
            const catId = cat._id || cat.id || cat.name;
            const isSelected = category === catId;
            return (
              <button
                key={catId}
                onClick={() => setCategory(catId)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {getCategoryIcon(cat.name)}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT (DESKTOP SIDEBAR + PRODUCTS STAGE) */}
      <div className="flex flex-col md:flex-row gap-5 lg:gap-6 items-start w-full">
        
        {/* ======================================================== */}
        {/* 1. BEST-APPROACH DESKTOP CATEGORY & FILTER SIDEBAR */}
        {/* ======================================================== */}
        <aside className="hidden md:block w-72 lg:w-80 shrink-0 sticky top-[165px] self-start max-h-[calc(100vh-185px)] overflow-y-auto space-y-4 pr-1 z-20">
          
          {/* Main Categories Card */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
                  <LayoutGrid size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-950 tracking-tight">
                    Categories
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">
                    {dynamicCategories.length + 1} Collections
                  </span>
                </div>
              </div>

              {category && (
                <button
                  onClick={() => setCategory('')}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Categories List */}
            <div className="space-y-1">
              {/* All Cosmetics */}
              <button
                onClick={() => setCategory('')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group text-left ${
                  category === ''
                    ? 'bg-rose-50 text-primary font-bold border-l-2 border-primary'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-950'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    category === '' ? 'bg-primary text-white shadow-2xs' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  }`}>
                    <LayoutGrid size={15} />
                  </div>
                  <span className="truncate">All Products</span>
                </div>
                <ChevronRight size={15} className={`transition-transform duration-200 ${
                  category === '' ? 'text-primary translate-x-0.5' : 'text-gray-400 opacity-60 group-hover:opacity-100'
                }`} />
              </button>

              {/* Dynamic Categories */}
              {dynamicCategories.map((cat) => {
                const catId = cat._id || cat.id || cat.name;
                const isSelected = category === catId;
                return (
                  <button
                    key={catId}
                    onClick={() => setCategory(catId)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group text-left ${
                      isSelected
                        ? 'bg-rose-50 text-primary font-bold border-l-2 border-primary'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-950'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-primary text-white shadow-2xs' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                      }`}>
                        {getCategoryIcon(cat.name)}
                      </div>
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <ChevronRight size={15} className={`transition-transform duration-200 ${
                      isSelected ? 'text-primary translate-x-0.5' : 'text-gray-400 opacity-60 group-hover:opacity-100'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider Bar */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-950 flex items-center gap-2">
                <Filter size={15} className="text-primary" /> Filter by Price
              </span>
              {(isPriceFiltered || inStockOnly) && (
                <button
                  onClick={() => {
                    setMaxPrice(maxCatalogPrice);
                    setInStockOnly(false);
                  }}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              )}
            </div>

            {/* Slider Bar & Live Values */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Max Budget:</span>
                <span className="text-sm font-extrabold text-primary font-mono bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  Up to ₹{maxPrice}
                </span>
              </div>

              {/* Range Input Slider Bar */}
              <div className="relative pt-1 pb-1">
                <input
                  type="range"
                  min="100"
                  max={maxCatalogPrice}
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Min & Max Labels */}
              <div className="flex justify-between items-center text-xs font-semibold text-gray-500 font-mono">
                <span>₹100</span>
                <span>₹{Math.round(maxCatalogPrice / 2)}</span>
                <span>₹{maxCatalogPrice}</span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[
                  { label: 'Under ₹500', val: 500 },
                  { label: 'Under ₹1000', val: 1000 },
                  { label: 'All Items', val: maxCatalogPrice }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setMaxPrice(preset.val)}
                    className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer border text-center ${
                      maxPrice === preset.val 
                        ? 'bg-gray-900 text-white border-gray-900 shadow-xs' 
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="pt-3 border-t border-gray-100">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-gray-800 group-hover:text-gray-950">
                  In Stock Only
                </span>
                <input 
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-primary w-4.5 h-4.5 cursor-pointer rounded"
                />
              </label>
            </div>
          </div>

          {/* 10-Min Fast Delivery Card - Clean & Minimal */}
          <div className="bg-gray-50/80 rounded-2xl border border-gray-200/90 p-4 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <h4 className="text-sm font-bold text-gray-950">10-Min Express Delivery</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed pl-9">
              Dispatched from local dark store in temperature-controlled packaging.
            </p>
          </div>

        </aside>

        {/* ======================================================== */}
        {/* 2. MAIN PRODUCTS STAGE */}
        {/* ======================================================== */}
        <main className="flex-1 min-w-0 space-y-4">
          
          {/* TOP UTILITY CONTROL BAR (Radar + Location + Search + Sort) */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
            
            {/* Row 1: Radar Status & Deliver To Location Badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              {/* Radar Status */}
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs sm:text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                  <Zap size={14} className="fill-emerald-500 text-emerald-500" />
                  <span>Express Hub Active: 10-Min Arrival</span>
                </span>
              </div>

              {/* Location Badge */}
              <div className="flex items-center justify-between w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-700">
                <div className="flex items-center gap-2 min-w-0 mr-3">
                  <MapPin size={15} className="text-gray-500 shrink-0" />
                  <span className="text-xs text-gray-500 font-medium shrink-0">Deliver to:</span>
                  <span className="font-bold text-gray-900 truncate max-w-[160px] sm:max-w-[240px]">
                    {locationMode === 'gps' && gpsLocationLabel ? gpsLocationLabel : pincode ? pincode : 'Select Pincode'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLocationPromptModal(true)}
                  className="text-xs font-bold text-primary hover:underline transition-all cursor-pointer shrink-0"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Row 2: Search Bar + Sort Dropdown */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-grow min-w-0">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                  placeholder="Search 10-minute cosmetics, lipsticks, hair serums..."
                  className="w-full bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl h-11 pl-10 pr-10 text-sm font-normal text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch('');
                      fetchProducts();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Sort Selector Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative w-full sm:w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto appearance-none bg-gray-50/80 hover:bg-gray-50 border border-gray-200 rounded-xl h-11 pl-4 pr-9 text-xs sm:text-sm font-bold text-gray-800 outline-none focus:border-primary cursor-pointer transition-all"
                  >
                    <option value="recommended">Featured / Popular</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="discount">Biggest Savings</option>
                  </select>
                  <SlidersHorizontal size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 3: Live Feed Counter & Quick Sort Tags */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs sm:text-sm">
              <span className="font-medium text-gray-600">
                Showing <strong className="text-gray-900 font-bold">{processedProducts.length}</strong> express items ready for 10-min dispatch
              </span>

              {/* Quick Filter Chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'All Items', onClick: () => { setMaxPrice(maxCatalogPrice); setSortBy('recommended'); }, active: maxPrice >= maxCatalogPrice && sortBy !== 'discount' },
                  { label: 'Under ₹500', onClick: () => setMaxPrice(500), active: maxPrice === 500 },
                  { label: 'Under ₹1000', onClick: () => setMaxPrice(1000), active: maxPrice === 1000 },
                  { label: '⚡ Top Savings', onClick: () => setSortBy('discount'), active: sortBy === 'discount' }
                ].map(f => (
                  <button
                    key={f.label}
                    onClick={f.onClick}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      f.active
                        ? 'bg-rose-50 text-primary border-primary/30 font-bold'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* PRODUCTS LIST GRID */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4.5 py-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white border border-gray-150 rounded-2xl p-3.5 animate-pulse space-y-3">
                  <div className="bg-gray-100 h-32 sm:h-40 w-full rounded-xl" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-9 bg-gray-100 rounded-xl w-full mt-2" />
                </div>
              ))}
            </div>
          ) : processedProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200/80 p-10 sm:p-16 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-primary border border-rose-100">
                <ShoppingBag size={28} className="stroke-[2.5]" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h4 className="text-base font-bold text-gray-900 tracking-tight">
                  No Express Items Found
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed">
                  We could not find any items matching your selected category or price slider. Try adjusting the price bar or clearing filters.
                </p>
              </div>
              <button
                onClick={() => {
                  setCategory('');
                  setSearch('');
                  setMaxPrice(maxCatalogPrice);
                  setInStockOnly(false);
                  fetchProducts();
                }}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4.5">
              {processedProducts.map((prod) => {
                const firstVariant = prod.variants?.[0] || {};
                const variantId = firstVariant._id || prod._id;
                const offeredPrice = firstVariant.offeredPrice !== undefined ? firstVariant.offeredPrice : (prod.offeredPrice || prod.price || 0);
                const salesPrice = firstVariant.salesPrice !== undefined ? firstVariant.salesPrice : (prod.price || offeredPrice);
                const discountPercent = salesPrice > offeredPrice ? Math.round(((salesPrice - offeredPrice) / salesPrice) * 100) : 0;
                const savings = salesPrice > offeredPrice ? (salesPrice - offeredPrice) : 0;

                const rawImage =
                  firstVariant.thumbnail?.url ||
                  (typeof firstVariant.thumbnail === 'string' ? firstVariant.thumbnail : '') ||
                  firstVariant.images?.[0]?.url ||
                  (typeof firstVariant.images?.[0] === 'string' ? firstVariant.images[0] : '') ||
                  prod.images?.[0]?.url ||
                  (typeof prod.images?.[0] === 'string' ? prod.images[0] : '') ||
                  prod.image || '';

                const productImage = getImageUrl(rawImage);
                const categoryName = prod.categoryId?.name || prod.categoryId?.label || prod.category || 'Cosmetics';
                const stock = firstVariant.stock !== undefined ? firstVariant.stock : 10;
                const cartItem = quickCart.find(item => item.id === variantId || item.variantId === variantId);

                return (
                  <div
                    key={prod._id}
                    onClick={() => navigate(`/product/${prod._id}`)}
                    className="group relative flex flex-col bg-white rounded-2xl border border-gray-200 hover:border-gray-300 shadow-2xs hover:shadow-sm transition-all duration-200 w-full cursor-pointer h-full text-left p-2.5 sm:p-3.5 overflow-hidden font-outfit"
                  >
                    {/* Image Container with Badges */}
                    <div className="relative w-full h-[125px] sm:h-[160px] md:h-[175px] bg-[#f8f9fa] rounded-xl overflow-hidden flex items-center justify-center p-2 mb-2 shrink-0 border border-gray-100">
                      
                      {/* Discount Badge */}
                      {discountPercent > 0 && (
                        <span className="absolute top-1.5 left-1.5 z-10 bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-2xs">
                          {discountPercent}% OFF
                        </span>
                      )}

                      {/* 10 MIN Speed Badge */}
                      <span className="absolute top-1.5 right-1.5 z-10 bg-white/95 backdrop-blur-xs text-gray-800 border border-gray-200/70 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                        <Zap size={11} className="fill-amber-500 text-amber-500" />
                        <span>10 MINS</span>
                      </span>

                      {productImage ? (
                        <img
                          src={productImage}
                          alt={prod.name}
                          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 font-semibold text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Product Info Section */}
                    <div className="flex flex-col flex-grow text-left min-w-0">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate mb-1">
                        {String(categoryName)}
                      </span>

                      <h4 
                        className="text-gray-900 font-bold text-sm sm:text-base tracking-tight truncate leading-snug group-hover:text-primary transition-colors mb-1.5" 
                        title={prod.name}
                      >
                        {prod.name}
                      </h4>

                      {/* Star Rating */}
                      <div className="flex items-center gap-1 text-xs text-gray-600 font-semibold mb-2">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span>4.8</span>
                      </div>

                      {/* Price Row */}
                      <div className="flex items-baseline justify-between gap-1 mb-3 mt-auto min-w-0">
                        <div className="flex items-baseline gap-1.5 min-w-0">
                          <span className="text-base sm:text-lg font-extrabold text-gray-950 font-mono">
                            ₹{offeredPrice}
                          </span>
                          {salesPrice > offeredPrice && (
                            <span className="text-xs sm:text-sm text-gray-400 line-through font-medium truncate font-mono">
                              ₹{salesPrice}
                            </span>
                          )}
                        </div>

                        {savings > 0 && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">
                            Save ₹{savings}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex items-center gap-2 pt-2.5 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                        {cartItem ? (
                          <div className="flex-1 h-9 border border-primary rounded-xl flex items-center justify-between px-2.5 bg-rose-50 text-primary text-xs sm:text-sm font-bold">
                            <button
                              onClick={() => handleDecreaseQuantity(cartItem)}
                              className="hover:bg-rose-100 rounded-lg p-1 transition-colors cursor-pointer"
                              title="Decrease quantity"
                            >
                              <Minus size={13} className="stroke-[2.5]" />
                            </button>
                            <span className="font-mono font-bold text-sm">{cartItem.qty}</span>
                            <button
                              onClick={() => handleIncreaseQuantity(cartItem)}
                              className="hover:bg-rose-100 rounded-lg p-1 transition-colors cursor-pointer"
                              title="Increase quantity"
                            >
                              <Plus size={13} className="stroke-[2.5]" />
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled={stock === 0}
                            onClick={() => handleAddToCart(prod, firstVariant)}
                            className="flex-1 bg-rose-50 hover:bg-rose-100 text-primary border border-rose-200/80 rounded-xl font-bold text-xs sm:text-sm h-9 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                          >
                            + Add
                          </button>
                        )}

                        {/* Buy Now Button (1-Click straight to /checkout?mode=quick) */}
                        <button
                          disabled={stock === 0}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!cartItem) {
                              await handleAddToCart(prod, firstVariant);
                            }
                            navigate('/checkout?mode=quick');
                          }}
                          className="flex-1 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-xs sm:text-sm h-9 flex items-center justify-center transition-all cursor-pointer shadow-2xs disabled:opacity-50 active:scale-[0.98]"
                        >
                          Buy
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>

      </div>

      {/* FLOATING STICKY EXPRESS BAG BAR (Zepto / Instamart style) */}
      {quickCart && quickCart.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg bg-gray-950/95 text-white p-3.5 rounded-2xl shadow-2xl backdrop-blur-md border border-gray-800 flex items-center justify-between animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xs shadow-md shrink-0">
              <Zap size={18} className="fill-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                {quickCart.length} {quickCart.length === 1 ? 'item' : 'items'} in Express Bag
              </span>
              <span className="text-xs sm:text-sm text-gray-300 font-mono font-semibold">
                Total: ₹{totalQuickCartPrice.toFixed(2)}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/checkout?mode=quick')}
            className="bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold uppercase px-4 sm:px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
          >
            <span>Proceed to Checkout</span>
            <ChevronRight size={15} className="stroke-[3]" />
          </button>
        </div>
      )}

    </div>
  );
};

export default CustomerShopView;
