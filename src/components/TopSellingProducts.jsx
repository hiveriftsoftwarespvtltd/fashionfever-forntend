import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Heart, Star, Loader2, ChevronLeft, ChevronRight, Flame, ArrowRight } from 'lucide-react';
import { getTopSellingProducts } from '../api/productService';
import { addToCart } from '../api/cartService';
import { addToWishlist, getWishlist, removeFromWishlist } from '../api/wishlistService';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '../utils/toast';
import { useCart } from '../context/CartContext';
import ProductCard from './shared/ProductCard';

const TopSellingProducts = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);

  const scrollRef = useRef(null);
  const isPausedRef = useRef(false);

  const scrollBy = (dir) => {
    isPausedRef.current = true;
    const el = scrollRef.current;
    if (el) {
      const offset = el.clientWidth * 0.8 * dir;
      el.scrollBy({ left: offset, behavior: 'smooth' });
    }
    setTimeout(() => { isPausedRef.current = false; }, 1000);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchTopSelling = async () => {
      try {
        const response = await getTopSellingProducts();
        if (response.success && isMounted) {
          const payload = response.data ?? response;
          if (Array.isArray(payload)) {
            const productsList = payload.map(item => item.product).filter(Boolean);
            setProducts(productsList);
          }
        }

        const sessionStr = localStorage.getItem('user_session');
        if (sessionStr && isMounted) {
          try {
            const wishRes = await getWishlist();
            if (wishRes.success) {
              const ids = wishRes.data?.items?.map(item => item.variant?._id || item.variant) || [];
              setWishlistIds(ids);
            }
          } catch (wishErr) {
            console.warn("Could not load authenticated wishlist:", wishErr);
          }
        }
      } catch (error) {
        console.error("Error fetching top selling products:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTopSelling();
    return () => { isMounted = false; };
  }, []);

  const handleAddToWishlist = async (productId, variantId) => {
    if (!productId || !variantId) {
      toast.error("Product identifier references missing.");
      return;
    }

    const isWishlisted = wishlistIds.includes(variantId);
    try {
      if (isWishlisted) {
        setWishlistIds(prev => prev.filter(id => id !== variantId));
        const response = await removeFromWishlist(variantId);
        if (response.success) {
          toast.success("Removed from Wishlist!");
        } else {
          setWishlistIds(prev => [...prev, variantId]);
          toast.error(response.message || "Failed to remove item.");
        }
      } else {
        setWishlistIds(prev => [...prev, variantId]);
        const response = await addToWishlist(productId, variantId);
        if (response.success) {
          toast.success("Saved to Wishlist!");
        } else {
          setWishlistIds(prev => prev.filter(id => id !== variantId));
          toast.error(response.message || "Failed to add to wishlist.");
        }
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  if (loading) {
    return null;
  }

  return (
    <section className="bg-white py-6 sm:py-10">
      <style>{`.tsp-track::-webkit-scrollbar{display:none}`}</style>
      <div className="max-w-[1600px] mx-auto px-2 sm:px-4 md:px-8">
        
        {/* Outer Card Wrapper matching Reference Image */}
        <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-8 shadow-2xs overflow-hidden">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-slate-100">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-black uppercase tracking-widest border border-amber-200/80 mb-2 shadow-2xs">
                <Flame size={13} className="text-amber-500 fill-amber-500" /> CUSTOMER FAVORITES
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight font-serif">
                Top Products
              </h2>
            </div>
            <Link
              to="/shop"
              className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-[#ff4d6d] text-slate-700 hover:text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300 border border-slate-200 hover:border-[#ff4d6d] shadow-2xs cursor-pointer self-start sm:self-auto"
            >
              <span>View All</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* ── Carousel Track ─────────────────────────────── */}
          <div className="relative">

            {/* ← Prev Arrow (Shown on MD+ to prevent mobile overflow) */}
            <button
              onClick={() => scrollBy(-1)}
              onMouseEnter={() => { isPausedRef.current = true; }}
              onMouseLeave={() => { isPausedRef.current = false; }}
              className="hidden md:flex absolute -left-5 md:-left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-gray-200 shadow-lg items-center justify-center text-gray-700 hover:text-[#ff4d6d] hover:border-[#ff4d6d] transition-all cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* → Next Arrow */}
            <button
              onClick={() => scrollBy(1)}
              onMouseEnter={() => { isPausedRef.current = true; }}
              onMouseLeave={() => { isPausedRef.current = false; }}
              className="hidden md:flex absolute -right-5 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-gray-200 shadow-lg items-center justify-center text-gray-700 hover:text-[#ff4d6d] hover:border-[#ff4d6d] transition-all cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Scrollable track */}
            <div
              ref={scrollRef}
              className="tsp-track flex gap-3 sm:gap-4 overflow-x-auto py-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onMouseEnter={() => { isPausedRef.current = true; }}
              onMouseLeave={() => { isPausedRef.current = false; }}
            >
              {products.map((product) => {
                const firstVariant = product.variants?.[0];
                return (
                  <div
                    key={product._id}
                    className="flex-shrink-0 w-[165px] sm:w-[200px] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-4rem)/5)]"
                  >
                    <ProductCard
                      product={product}
                      isWishlisted={wishlistIds.includes(firstVariant?._id)}
                      onWishlistToggle={() => handleAddToWishlist(product._id, firstVariant?._id)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TopSellingProducts;
