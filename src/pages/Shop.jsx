import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, Star, ShoppingBag, Heart, Search, SlidersHorizontal, X, Check, LayoutGrid, Loader2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from '../utils/toast';
import { getProducts, getPublicCategories, getPublicBrands } from '../api/productService';
import ProductCard from '../components/shared/ProductCard';
import shopHeroImg from '../assets/shophero.png';


const Shop = () => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useSearch();
  const { cart, addToCart, updateQty, removeFromCart } = useCart();
  const { incrementWishlistCount, decrementWishlistCount } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [sortBy, setSortBy] = useState('Popularity');
  const [brandSearch, setBrandSearch] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [freeShippingOnly, setFreeShippingOnly] = useState(false);
  const [availableBrands, setAvailableBrands] = useState(['FashionFever Luxe', 'Skin Glow', 'Natural Flow', 'Hair Care+', 'Beauty Base', 'Lakme']);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [categories, setCategories] = useState(['All', 'Makeup', 'Skincare', 'Haircare', 'Fragrance', 'Tools', 'Natural']);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getPublicCategories();
        if (response.success) {
          const payload = response.data ?? response;
          if (Array.isArray(payload)) {
            const names = payload.map(cat => cat.name);
            setCategories(['All', ...names]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch public categories for Shop:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await getPublicBrands();
        if (response.success) {
          const payload = response.data ?? response;
          if (Array.isArray(payload)) {
            const names = payload.map(b => b.brand).filter(Boolean);
            if (names.length > 0) {
              setAvailableBrands(names);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch public brands for Shop:", error);
      }
    };
    fetchBrands();
  }, []);

  // Synchronize local search text with global search context
  useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

  // Reset page to 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [localSearch, activeCategory, selectedPrices, selectedBrands, freeShippingOnly]);

  // Lock body scroll when mobile filter is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileFilterOpen]);

  const brands = availableBrands;

  const priceRanges = [
    { label: 'Under ₹500', min: 0, max: 500 },
    { label: '₹500 - ₹1000', min: 500, max: 1000 },
    { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
    { label: 'Above ₹2000', min: 2000, max: 99999 }
  ];

  // Dynamic Product Hydration with filters mapped to /public-user/products
  useEffect(() => {
    let isMounted = true;
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 10
        };

        // 1. Search Query mapping
        if (localSearch) {
          params.search = localSearch;
        }

        // 2. Category Filter mapping
        if (activeCategory && activeCategory !== 'All') {
          params.category = activeCategory.toLowerCase();
        }

        // 3. Price Filter mapping
        if (selectedPrices.length > 0) {
          const matchedRanges = selectedPrices.map(label => priceRanges.find(r => r.label === label)).filter(Boolean);
          if (matchedRanges.length > 0) {
            const minPrices = matchedRanges.map(r => r.min);
            const maxPrices = matchedRanges.map(r => r.max);
            params.minPrice = Math.min(...minPrices);
            params.maxPrice = Math.max(...maxPrices);
          }
        }

        // 4. Brand Filter mapping
        if (selectedBrands.length > 0) {
          params.brand = selectedBrands[0];
        }

        // 5. Shipping Filter mapping (Only filter if free shipping checkbox is active)
        if (freeShippingOnly) {
          params.is_shipping_apply = false;
        }

        const response = await getProducts(params);
        if (isMounted) {
          if (response.success) {
            let rawProducts = [];
            const rawData = response.data;

            if (Array.isArray(rawData)) {
              rawProducts = rawData;
            } else if (rawData) {
              if (Array.isArray(rawData.products)) {
                rawProducts = rawData.products;
              } else if (Array.isArray(rawData.data)) {
                rawProducts = rawData.data;
              } else if (rawData.data && Array.isArray(rawData.data.products)) {
                rawProducts = rawData.data.products;
              } else if (rawData.data && Array.isArray(rawData.data.data)) {
                rawProducts = rawData.data.data;
              }
            }

            // Set dynamic total pages count returned by API or compute via totalProducts count
            const totalItems = response.data?.totalProducts || response.data?.total || response.data?.count || response.data?.data?.totalProducts || response.data?.data?.total || 0;
            const apiPagesCount = response.data?.totalPages || response.data?.pages || response.data?.data?.totalPages || response.data?.data?.pages;
            const pagesCount = apiPagesCount || (totalItems ? Math.ceil(totalItems / 10) : 1);
            setTotalPages(pagesCount || 1);

            // Brands are loaded dynamically from /public-user/brands on mount

            // Filter raw products to ONLY include products added by actual Vendors (p.vendor or p.vendorId must exist)
            const realVendorProducts = rawProducts.filter(p => {
              const vendorObj = p.vendor || p.vendorId;
              return Boolean(vendorObj && (typeof vendorObj === 'object' ? (vendorObj._id || vendorObj.businessName) : vendorObj));
            });

            const mapped = realVendorProducts.map(p => {
              const firstVariant = p.variants?.[0] || {};
              const vendorObj = p.vendor || p.vendorId;
              const vendorName = (typeof vendorObj === 'object' ? vendorObj.businessName : null) || p.brand || 'Vendor Merchant';
              const imgUrl = firstVariant.thumbnail?.url || (typeof firstVariant.thumbnail === 'string' ? firstVariant.thumbnail : null) || p.images?.[0]?.url || (typeof p.images?.[0] === 'string' ? p.images[0] : null) || p.image || '';
              return {
                id: p._id,
                name: p.name,
                brand: vendorName,
                price: firstVariant.offeredPrice || firstVariant.salesPrice || 0,
                rating: p.rating || 4.7,
                reviews: 120,
                image: imgUrl,
                category: p.categoryId?.name || p.category?.name || 'Beauty',
                badge: p.tags?.[0] || null,
                originalProduct: p,
                firstVariant: firstVariant
              };
            });
            setProducts(mapped);
          } else {
            setProducts([]);
            setTotalPages(1);
          }
        }
      } catch (err) {
        console.error("Failed fetching filtered products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFilteredProducts();
    return () => { isMounted = false; };
  }, [localSearch, activeCategory, selectedPrices, selectedBrands, freeShippingOnly, currentPage]);

  // Toggle Wishlist
  const toggleWishlist = (productId) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
      decrementWishlistCount();
      toast.success('Removed from wishlist');
    } else {
      setWishlist([...wishlist, productId]);
      incrementWishlistCount();
      toast.success('Added to wishlist');
    }
  };

  // Toggle Brand Filter
  const handleBrandChange = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  // Toggle Price Filter
  const handlePriceChange = (label) => {
    setSelectedPrices(prev =>
      prev.includes(label) ? prev.filter(p => p !== label) : [...prev, label]
    );
  };

  // Clear All Filters
  const clearAllFilters = () => {
    setActiveCategory('All');
    setSelectedBrands([]);
    setSelectedPrices([]);
    setBrandSearch('');
    setFreeShippingOnly(false);
  };

  // Filter & Sort Logic (Local Brand Filter over fetched products)
  const filteredProducts = products.filter(product => {
    const matchesBrand = selectedBrands.length === 0 ||
      selectedBrands.some(b => b.toLowerCase() === product.brand?.toLowerCase());
    return matchesBrand;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    if (sortBy === 'Customer Rating') return b.rating - a.rating;
    return b.reviews - a.reviews;
  });

  // Filter Sidebar Content Component
  const FilterContent = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h2 className="text-lg font-bold uppercase  text-gray-900 flex items-center gap-2">
          <SlidersHorizontal size={20} className="text-primary" /> Filters
        </h2>
        {(activeCategory !== 'All' || selectedBrands.length > 0 || selectedPrices.length > 0 || freeShippingOnly) && (
          <button
            onClick={clearAllFilters}
            className="text-sm font-semibold text-primary hover:text-white hover:bg-primary px-3 py-1.5 rounded-lg uppercase  transition-all"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase text-gray-400">Categories</h3>
        <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <label
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex items-center gap-3 cursor-pointer group text-left py-0.5 select-none"
              >
                {/* Square Checkbox Box */}
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-[#ff4d6d] border-[#ff4d6d] shadow-2xs' : 'border-gray-300 bg-white group-hover:border-[#ff4d6d]'}`}>
                  {isSelected && <Check size={13} className="text-white stroke-[3.5]" />}
                </div>
                <span className={`text-xs font-bold uppercase transition-colors ${isSelected ? 'text-gray-900 font-extrabold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                  {cat.trim()}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Brand */}
      <div className="space-y-4 pt-6 border-t border-gray-100">
        <h3 className="text-xs font-bold uppercase text-gray-400">Brands</h3>
        <div className="relative mb-3 group">
          <div className="absolute inset-0 bg-primary/5 rounded-xl blur transition-opacity opacity-0 group-hover:opacity-100"></div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              placeholder="Search brands..."
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#ff4d6d] focus:bg-white transition-all font-bold placeholder:font-medium text-gray-700"
            />
          </div>
        </div>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {brands
            .filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()))
            .map((brand) => (
              <label key={brand} className="flex items-center gap-3 cursor-pointer group py-0.5 select-none">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedBrands.includes(brand) ? 'bg-[#ff4d6d] border-[#ff4d6d] shadow-2xs' : 'border-gray-300 bg-white group-hover:border-[#ff4d6d]'}`}>
                  {selectedBrands.includes(brand) && <Check size={13} className="text-white stroke-[3.5]" />}
                </div>
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                  className="hidden"
                />
                <span className={`text-xs font-bold uppercase transition-colors ${selectedBrands.includes(brand) ? 'text-gray-900 font-extrabold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                  {brand}
                </span>
              </label>
            ))}
        </div>
      </div>

      {/* Price */}
      <div className="space-y-4 pt-6 border-t border-gray-100">
        <h3 className="text-xs font-bold uppercase text-gray-400">Price Range</h3>
        <div className="space-y-3">
          {priceRanges.map((range) => (
            <label key={range.label} className="flex items-center gap-3 cursor-pointer group py-0.5 select-none">
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedPrices.includes(range.label) ? 'bg-[#ff4d6d] border-[#ff4d6d] shadow-2xs' : 'border-gray-300 bg-white group-hover:border-[#ff4d6d]'}`}>
                {selectedPrices.includes(range.label) && <Check size={13} className="text-white stroke-[3.5]" />}
              </div>
              <input
                type="checkbox"
                checked={selectedPrices.includes(range.label)}
                onChange={() => handlePriceChange(range.label)}
                className="hidden"
              />
              <span className={`text-xs font-bold uppercase transition-colors ${selectedPrices.includes(range.label) ? 'text-gray-900 font-extrabold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Shipping */}
      <div className="space-y-4 pt-6 border-t border-gray-100">
        <h3 className="text-xs font-bold uppercase text-gray-400">Shipping</h3>
        <label className="flex items-center gap-3 cursor-pointer group py-0.5 select-none">
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${freeShippingOnly ? 'bg-[#ff4d6d] border-[#ff4d6d] shadow-2xs' : 'border-gray-300 bg-white group-hover:border-[#ff4d6d]'}`}>
            {freeShippingOnly && <Check size={13} className="text-white stroke-[3.5]" />}
          </div>
          <input
            type="checkbox"
            checked={freeShippingOnly}
            onChange={() => setFreeShippingOnly(!freeShippingOnly)}
            className="hidden"
          />
          <span className={`text-xs font-bold uppercase transition-colors ${freeShippingOnly ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'}`}>
            Free Shipping Only
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="bg-[#fcfcfc] min-h-screen font-outfit pb-24">

      {/* Premium Hero Banner - Full Width */}
      <div className="relative w-full overflow-hidden bg-[#fff0f4] border-b border-pink-100">
        <div className="relative w-full h-[140px] sm:h-[200px] md:h-[240px] flex items-center px-6 sm:px-12 md:px-20">

          {/* Background Banner Image */}
          <img
            src={shopHeroImg}
            alt="Shop Hero Banner"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* Text Overlay Content */}
          <div className="relative z-10 max-w-lg text-left py-2">
            <span className="text-[#ff4d6d] font-black uppercase tracking-wider text-xs mb-1 block">
              NEW ARRIVALS 2024
            </span>

            <h1 className="text-lg sm:text-2xl md:text-3xl font-serif text-gray-900 leading-[1.15] mb-1 sm:mb-2 tracking-tight">
              Discover Your <span className="font-serif">Signature Look</span>
            </h1>

            <p className="text-gray-600 font-medium text-[11px] sm:text-xs md:text-sm max-w-md leading-snug hidden sm:block">
              Shop our curated collection of premium beauty essentials designed to enhance your natural radiance.
            </p>
          </div>

        </div>
      </div>

      <div className="container mx-auto px-4 max-w-[1600px] mt-8 md:mt-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0 sticky top-[165px] self-start z-20">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 xl:p-8 shadow-sm max-h-[calc(100vh-185px)] overflow-y-auto custom-scrollbar">
              <FilterContent />
            </div>
          </aside>

          {/* Mobile Filter Drawer Overlay */}
          <div
            className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[200] lg:hidden transition-opacity duration-300 ${isMobileFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Mobile Filter Drawer */}
          <div className={`fixed inset-y-0 left-0 w-[300px] max-w-[85vw] bg-white shadow-2xl z-[210] lg:hidden transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold uppercase  text-gray-900 flex items-center gap-2">
                <Filter size={20} className="text-primary" /> Filters
              </h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <FilterContent />
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold uppercase text-xs  shadow-xl shadow-gray-900/20 active:opacity-90 transition-opacity"
              >
                Show {sortedProducts.length} Results
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-grow min-w-0">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 lg:p-5 rounded-2xl border border-gray-100 shadow-sm">

              <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start gap-4">
                {/* Mobile Filter Trigger */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-xs font-bold uppercase  text-gray-800 hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <Filter size={16} /> Filter
                </button>
                <p className="text-[11px] lg:text-xs text-gray-500 font-bold uppercase ">
                  Showing <span className="text-gray-900 font-bold">{sortedProducts.length}</span> products
                </p>
              </div>

              {/* In-page Direct Search Box */}
              <div className="relative w-full sm:max-w-xs group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => {
                    setLocalSearch(e.target.value);
                    if (setSearchQuery) setSearchQuery(e.target.value);
                  }}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:border-primary/30 focus:bg-white transition-all font-bold placeholder:font-medium text-gray-700"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <span className="hidden sm:inline-block text-sm font-semibold text-gray-400 uppercase ">Sort By</span>
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-bold uppercase  px-4 py-2.5 pr-10 outline-none cursor-pointer text-gray-800 hover:bg-gray-100 focus:border-primary/30 transition-all w-full sm:w-auto"
                  >
                    <option value="Popularity">Popularity</option>
                    <option value="Price: Low to High">Price: Low to High</option>
                    <option value="Price: High to Low">Price: High to Low</option>
                    <option value="Customer Rating">Customer Rating</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-gray-900" />
                </div>
              </div>
            </div>
            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-4 border border-gray-100 flex flex-col h-[380px] animate-pulse">
                    <div className="aspect-square w-full bg-gray-100 rounded-2xl mb-4"></div>
                    <div className="h-3 w-1/3 bg-gray-100 rounded mb-2"></div>
                    <div className="h-5 w-3/4 bg-gray-100 rounded mb-4"></div>
                    <div className="mt-auto h-10 w-full bg-gray-100 rounded-xl"></div>
                  </div>
                ))
              ) : sortedProducts.length === 0 ? (
                <div className="col-span-full py-32 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-inner">
                    <Search size={32} className="text-gray-300" />
                  </div>
                  <p className="text-base font-bold text-gray-800 uppercase  mb-2">No Products Found</p>
                  <p className="text-xs text-gray-400 uppercase font-bold ">Try adjusting your filters or search query</p>
                  <button onClick={clearAllFilters} className="mt-8 px-8 py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase  hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all">
                    Reset All Filters
                  </button>
                </div>
              ) : (
                sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product.originalProduct}
                    isWishlisted={wishlist.includes(product.id)}
                    onWishlistToggle={() => toggleWishlist(product.id)}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages >= 1 && (
              <div className="mt-16 mb-8 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${p === currentPage
                      ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/20'
                      : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300'
                      }`}
                  >
                    {p}
                  </button>
                ))}
                {currentPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-4 h-10 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-bold text-xs uppercase flex items-center transition-all ml-2 cursor-pointer"
                  >
                    Next
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Shop;
