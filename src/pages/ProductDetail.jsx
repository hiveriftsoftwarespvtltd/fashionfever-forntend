import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Share2,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Info,
  MapPin,
  Check,
  Minus,
  Plus,
  Package,
  Bookmark,
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Play,
  Trash2,
  Eye,
  Zap
} from 'lucide-react';
import Swal from 'sweetalert2';
import apiClient from '../api/apiClient';
import { useCart } from '../context/CartContext';
import { addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist } from '../api/wishlistService';
import { toast } from '../utils/toast';
import { useUser } from '../context/UserContext';
import { getProductReviews, deleteProductReview } from '../api/productService';
import config from '../config/config';
import { getImageUrl, handleImageError, DEFAULT_PRODUCT_PLACEHOLDER } from '../utils/imageUrl';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, updateQty } = useCart();
  const { isAuthenticated, user } = useUser();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviewsData, setReviewsData] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState('center center');
  const [isExpressDelivery, setIsExpressDelivery] = useState(false);

  const fetchProductDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/public-user/product-details/${id}`);
      const fetchedProduct = response?.data?.data?.data || response?.data?.data;
      if (fetchedProduct) {
        setProduct(fetchedProduct);
        setIsWishlisted(!!fetchedProduct.isWishlisted);
        if (fetchedProduct.vendorId?.quickCommerce?.enabled) {
          setIsExpressDelivery(true);
        }

        // Fetch reviews
        try {
          const reviewsRes = await getProductReviews(id);
          if (reviewsRes?.success) {
            setReviewsData(reviewsRes.data);
          }
        } catch (revErr) {
          console.error("Failed to load reviews inside fetchProductDetails:", revErr);
        }

        // Fetch related products
        try {
          const categoryQuery = fetchedProduct.categoryId?.slug || fetchedProduct.categoryId?.name || (typeof fetchedProduct.categoryId === 'string' ? fetchedProduct.categoryId : null);
          let rawProducts = [];
          if (categoryQuery) {
            const relRes = await apiClient.get('/public-user/products', { 
              params: { category: categoryQuery, limit: 6 } 
            });
            if (relRes?.data?.success) {
              const rawData = relRes.data?.data;
              if (Array.isArray(rawData)) {
                rawProducts = rawData;
              } else if (rawData) {
                if (Array.isArray(rawData.products)) rawProducts = rawData.products;
                else if (Array.isArray(rawData.data)) rawProducts = rawData.data;
              }
            }
          }
          let list = rawProducts.filter(p => p._id !== id);
          if (list.length === 0) {
            const fallbackRes = await apiClient.get('/public-user/products', { params: { limit: 6 } });
            if (fallbackRes?.data?.success) {
              const fallbackData = fallbackRes.data?.data;
              let fallbackRaw = [];
              if (Array.isArray(fallbackData)) fallbackRaw = fallbackData;
              else if (fallbackData && Array.isArray(fallbackData.products)) fallbackRaw = fallbackData.products;
              list = fallbackRaw.filter(p => p._id !== id);
            }
          }
          setRelatedProducts(list.slice(0, 4));
        } catch (e) {
          console.warn("Could not load related products:", e);
        }
      } else {
        setError("Product parameters or details not available.");
      }
    } catch (err) {
      console.error("Failed loading product detail page:", err);
      setError("Something went wrong while fetching the product details.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProductDetails = async () => {
    try {
      const response = await apiClient.get(`/public-user/product-details/${id}`);
      const fetchedProduct = response?.data?.data?.data || response?.data?.data;
      if (fetchedProduct) {
        setProduct(fetchedProduct);
        setIsWishlisted(!!fetchedProduct.isWishlisted);
      }
      const reviewsRes = await getProductReviews(id);
      if (reviewsRes?.success) {
        setReviewsData(reviewsRes.data);
      }
    } catch (err) {
      console.error("Failed refreshing product detail:", err);
    }
  };

  useEffect(() => {
    setSelectedVariantIndex(0);
    setSelectedImage(0);
    setQuantity(1);
    setRelatedProducts([]);
    if (id) fetchProductDetails();
  }, [id]);

  const [activeFullImage, setActiveFullImage] = useState(null);

  const reviewsList = reviewsData?.reviews || [];
  const totalReviewsCount = reviewsList.length;
  const averageReviewsRating = totalReviewsCount > 0 
    ? (reviewsList.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviewsCount).toFixed(1)
    : (product?.averageRating || '0.0');

  const getReviewImageUrl = (img) => {
    if (!img) return '';
    if (typeof img === 'string') {
      return `${config.API_URL}/file/get-file/${img}`;
    }
    return img.url || '';
  };

  const isVideoFile = (url) => {
    if (!url) return false;
    return url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm') || url.toLowerCase().endsWith('.ogg') || url.toLowerCase().endsWith('.mov');
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  };

  const handleAddProductToBag = () => {
    if (!currentVariant || currentVariant.stock <= 0) {
      toast.error("This option is currently out of stock!");
      return;
    }
    const itemPayload = {
      id: currentVariant._id || product._id,
      name: `${product.name} ${
        currentVariant.attributes?.color || currentVariant.attributes?.Color 
          ? `(${currentVariant.attributes.color || currentVariant.attributes.Color})` 
          : ''
      }`,
      price: currentVariant.offeredPrice || currentVariant.salesPrice || 0,
      image: getImageUrl(currentVariant.thumbnail?.url || currentVariant.thumbnail || variantImages?.[0]?.url || variantImages?.[0] || ''),
    };
    addToCart(itemPayload, currentVariant._id, product._id, isExpressDelivery);
    if (quantity > 1) {
      updateQty(currentVariant._id, quantity - 1, product._id, isExpressDelivery);
    }
    toast.success(`In Bag! Added successfully.`);
  };

  const handleDirectPurchase = async () => {
    if (!currentVariant || currentVariant.stock <= 0) {
      toast.error("Option out of inventory.");
      return;
    }
    const itemPayload = {
      id: currentVariant._id || product._id,
      name: `${product.name}`,
      price: currentVariant.offeredPrice || currentVariant.salesPrice || 0,
      image: getImageUrl(currentVariant.thumbnail?.url || currentVariant.thumbnail || ''),
    };
    await addToCart(itemPayload, currentVariant._id, product._id, isExpressDelivery);
    if (quantity > 1) {
      await updateQty(currentVariant._id, quantity - 1, product._id, isExpressDelivery);
    }
    if (isExpressDelivery) {
      navigate("/checkout?mode=quick");
    } else {
      navigate("/checkout");
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login for shopping");
      return;
    }
    if (!product || !currentVariant) return;
    const previousState = isWishlisted;
    setIsWishlisted(!previousState);

    try {
      if (previousState) {
        const res = await apiRemoveFromWishlist(currentVariant._id);
        if (res.success) toast.success("Removed from Wishlist");
        else { setIsWishlisted(previousState); toast.error(res.message); }
      } else {
        const res = await apiAddToWishlist(product._id, currentVariant._id);
        if (res.success) toast.success("Added to Wishlist!");
        else { setIsWishlisted(previousState); toast.error(res.message); }
      }
    } catch (err) {
      setIsWishlisted(previousState);
      toast.error("System linkage sync failed.");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Copied shareable product link!");
  };

  const handleWriteReviewClick = () => {
    toast.info("Please write your reviews from the 'My Orders' panel!");
    navigate("/profile/orders");
  };

  const handleDeleteReview = async (reviewId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this review?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E11D48',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, delete it!',
      background: '#fff',
      customClass: {
        title: 'text-lg font-bold font-outfit uppercase',
        htmlContainer: 'text-xs font-bold font-outfit text-gray-500 uppercase',
        confirmButton: 'bg-primary px-6 py-2.5 rounded-xl font-bold uppercase text-xs text-white',
        cancelButton: 'bg-slate-100 text-slate-800 px-6 py-2.5 rounded-xl font-bold uppercase text-xs ml-2'
      }
    });

    if (result.isConfirmed) {
      const loadingAlert = Swal.fire({
        title: 'Deleting review...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
      try {
        const res = await deleteProductReview(reviewId);
        if (res.success) {
          toast.success("Review deleted successfully!");
          refreshProductDetails();
        } else {
          toast.error(res.message || "Failed to delete review.");
        }
      } catch (err) {
        console.error("Delete review error:", err);
        toast.error("An error occurred while deleting the review.");
      } finally {
        Swal.close();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center font-inter">
        <div className="max-w-[1400px] w-full mx-auto px-4 md:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-square bg-slate-200 rounded-xl w-full" />
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-slate-200 rounded-xl" />
              <div className="w-16 h-16 bg-slate-200 rounded-xl" />
              <div className="w-16 h-16 bg-slate-200 rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="h-4 w-24 bg-slate-200 rounded-md" />
            <div className="h-10 w-3/4 bg-slate-200 rounded-xl" />
            <div className="h-6 w-1/4 bg-slate-200 rounded-lg" />
            <div className="h-28 bg-slate-200 rounded-xl w-full" />
            <div className="h-12 bg-slate-200 rounded-xl w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center p-6 text-center font-inter">
        <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-xl max-w-sm w-full">
          <AlertCircle size={40} className="text-primary mx-auto mb-4" />
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">Product Missing</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase mt-1 leading-relaxed">{error || "Product identity not found."}</p>
          <Link to="/shop" className="mt-6 block w-full bg-primary text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/25 hover:scale-[1.01] transition-all">
            Return To Shop
          </Link>
        </div>
      </div>
    );
  }

  const currentVariant = product.variants?.[selectedVariantIndex] || product.variants?.[0] || {};
  const cartItem = cart?.find(item => item.id === currentVariant._id);
  const isInCart = !!cartItem;
  
  const variantImages = [];
  if (currentVariant.images && currentVariant.images.length > 0) {
    currentVariant.images.forEach(img => {
      if (img && img.url) variantImages.push(img);
    });
  }
  if (currentVariant.thumbnail && currentVariant.thumbnail.url) {
    if (!variantImages.some(img => img.url === currentVariant.thumbnail.url)) {
      variantImages.unshift(currentVariant.thumbnail);
    }
  }
  if (variantImages.length === 0 && product.thumbnail && product.thumbnail.url) {
    variantImages.push(product.thumbnail);
  }

  const hasDiscount = currentVariant.salesPrice && currentVariant.offeredPrice && (currentVariant.salesPrice > currentVariant.offeredPrice);
  const discountPercent = hasDiscount ? Math.round(((currentVariant.salesPrice - currentVariant.offeredPrice) / currentVariant.salesPrice) * 100) : 0;

  const displayStarsRating = totalReviewsCount > 0 ? parseFloat(averageReviewsRating) : 4;

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-inter text-slate-900 pb-24 lg:pb-12">
      
      {/* SECTION 1: Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-100 py-4">
        <div className="container max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-1.5 text-sm sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            {product.categoryId?.name && (
              <>
                <ChevronRight size={12} className="text-slate-300" />
                <span className="hover:text-primary cursor-pointer transition-colors">{product.categoryId.name}</span>
              </>
            )}
            {product.brand && (
              <>
                <ChevronRight size={12} className="text-slate-300" />
                <span className="hover:text-primary cursor-pointer transition-colors">{product.brand}</span>
              </>
            )}
            <ChevronRight size={12} className="text-slate-300" />
            <span className="text-slate-800 font-extrabold max-w-[120px] sm:max-w-[200px] truncate">{product.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleShare}
              className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-full transition-all duration-300"
              title="Share Product"
            >
              <Share2 size={16} />
            </button>
            <button 
              onClick={toggleWishlist}
              className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-full transition-all duration-300"
              title="Add to Wishlist"
            >
              <Heart 
                size={16} 
                fill={isWishlisted ? "var(--primary)" : "none"} 
                className={isWishlisted ? "text-primary stroke-primary scale-110" : ""} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="container max-w-[1400px] mx-auto px-4 md:px-8 py-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* SECTION 2: Product Gallery (Left Side, 5 Columns) */}
          <div className="lg:col-span-5 flex flex-col md:flex-row gap-4 lg:sticky lg:top-6">
            
            {/* Gallery Thumbnails */}
            {variantImages.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar order-2 md:order-1 md:w-20 max-h-[450px]">
                {variantImages.map((img, i) => {
                  const isVid = isVideoFile(img.url);
                  return (
                    <button
                      key={img._id || i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border-2 relative transition-all bg-white p-0.5 cursor-pointer flex-shrink-0 ${
                        selectedImage === i ? 'border-primary ring-2 ring-primary/10 shadow-sm' : 'border-transparent hover:border-slate-200'
                      }`}
                    >
                      {isVid ? (
                        <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center relative">
                          <Play size={16} className="text-white fill-white" />
                        </div>
                      ) : (
                        <img 
                          src={getImageUrl(img.url || img) || DEFAULT_PRODUCT_PLACEHOLDER} 
                          alt="" 
                          className="w-full h-full object-cover rounded-xl" 
                          onError={handleImageError}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main Stage */}
            <div className="flex-1 order-1 md:order-2">
              <div 
                className="w-full relative aspect-square rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm flex items-center justify-center cursor-zoom-in group transition-all duration-300 hover:shadow-md"
                onMouseEnter={() => !isVideoFile(variantImages[selectedImage]?.url) && setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onClick={() => !isVideoFile(variantImages[selectedImage]?.url) && setActiveFullImage(variantImages[selectedImage]?.url)}
              >
                {variantImages[selectedImage] ? (
                  isVideoFile(variantImages[selectedImage]?.url) ? (
                    <div className="w-full h-full relative">
                      <video 
                        src={variantImages[selectedImage].url} 
                        controls 
                        className="w-full h-full object-contain bg-slate-955"
                        autoPlay
                        muted
                      />
                      <span className="absolute top-4 left-4 z-10 bg-slate-900/90 text-white backdrop-blur-md text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm border border-white/10 flex items-center gap-1">
                        <Play size={10} className="fill-white" /> Video Preview
                      </span>
                    </div>
                  ) : (
                    <img 
                      src={getImageUrl(variantImages[selectedImage]?.url || variantImages[selectedImage]) || DEFAULT_PRODUCT_PLACEHOLDER} 
                      alt={product.name} 
                      className={`w-full h-full object-cover transition-transform duration-200 ease-out ${isZoomed ? 'scale-200' : 'scale-100'}`}
                      style={{ transformOrigin: zoomOrigin }}
                      loading="lazy"
                      onError={handleImageError}
                    />
                  )
                ) : (
                  <div className="text-sm font-black text-slate-300 uppercase tracking-widest">No Image Loaded</div>
                )}

                {/* Float Category Overlay */}
                {!isVideoFile(variantImages[selectedImage]?.url) && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-slate-900/90 text-white backdrop-blur-md text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm border border-white/10">
                      {product.brand || 'Product'}
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Product Info & Purchase flow (7 Columns) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* SECTION 3: Product Information */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="bg-primary/5 text-primary text-xs font-black uppercase px-2.5 py-1 rounded-md tracking-wider">
                  ACTIVE
                </span>
                
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < Math.round(displayStarsRating) ? "currentColor" : "none"} 
                        className={i < Math.round(displayStarsRating) ? "text-yellow-400" : "text-slate-200"}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-black text-slate-400 uppercase tracking-wider">
                    ({totalReviewsCount} {totalReviewsCount === 1 ? 'Review' : 'Reviews'})
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-wide leading-tight">
                  {product.name}
                </h1>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100/60 max-w-sm">
                  {product.brand && (
                    <div>
                      <span className="text-sm font-black text-slate-400 uppercase tracking-widest block">Brand</span>
                      <span className="text-xs font-black text-slate-800 uppercase">{product.brand}</span>
                    </div>
                  )}
                  {product.categoryId?.name && (
                    <div>
                      <span className="text-sm font-black text-slate-400 uppercase tracking-widest block">Category</span>
                      <span className="text-xs font-black text-slate-800 uppercase">{product.categoryId.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-50">
                  {product.tags.map((tag, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-600 text-[11px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing, Discount, Stock & Actions Block */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xs space-y-6">
              
              {/* Pricing section */}
              <div className="flex items-baseline justify-between gap-4 flex-wrap pb-4 border-b border-slate-50">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    ₹{Number(currentVariant.offeredPrice || currentVariant.salesPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm font-bold text-slate-400 line-through">
                      ₹{Number(currentVariant.salesPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                
                {hasDiscount && (
                  <div className="bg-primary/5 text-primary border border-primary/10 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">
                    {discountPercent}% OFF SAVED
                  </div>
                )}
              </div>

              {/* Stock info */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-black uppercase text-slate-500 tracking-wider">
                {currentVariant.stock > 0 ? (
                  currentVariant.stock < 10 ? (
                    <div className="flex items-center gap-1.5 text-amber-600">
                      <AlertCircle size={14} className="stroke-[2.5]" />
                      <span>Only Few Items Left ({currentVariant.stock} available)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <ShieldCheck size={14} className="stroke-[2.5]" />
                      <span>In Stock ({currentVariant.stock} available)</span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-1.5 text-red-500">
                    <AlertCircle size={14} className="stroke-[2.5]" />
                    <span>Out of Stock</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <Truck size={14} className="text-primary" />
                  <span>Free Shipping Applied</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <RotateCcw size={14} className="text-primary" />
                  <span>Easy Returns</span>
                </div>
              </div>

              {/* Select Variant Attributes Display */}
              <div className="flex gap-3 flex-wrap border-t border-slate-50 pt-4">
                {currentVariant.attributes?.color && (
                  <div className="bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400" style={{ backgroundColor: currentVariant.attributes.color.trim().toLowerCase() }}></span>
                    <span>Color: <span className="font-extrabold">{currentVariant.attributes.color}</span></span>
                  </div>
                )}
                {currentVariant.attributes?.size && (
                  <div className="bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700">
                    Size: <span className="font-extrabold">{currentVariant.attributes.size}</span>
                  </div>
                )}
              </div>

              {/* Selection pills for variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Select Variant Option</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {product.variants.map((v, i) => {
                      const isSelected = selectedVariantIndex === i;
                      const colorVal = v.attributes?.color || v.attributes?.Color;
                      const sizeVal = v.attributes?.size || v.attributes?.Size;
                      const labelName = [colorVal, sizeVal].filter(Boolean).join(' • ') || `Variant ${i + 1}`;

                      return (
                        <button
                          key={v._id || i}
                          onClick={() => {
                            setSelectedVariantIndex(i);
                            setSelectedImage(0);
                          }}
                          className={`p-3.5 rounded-xl border text-left transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected 
                              ? 'border-primary bg-primary/[0.01] ring-2 ring-primary/5 shadow-xs' 
                              : 'border-slate-100 bg-white hover:border-slate-200'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-black uppercase truncate ${isSelected ? 'text-primary' : 'text-slate-800'}`}>
                              {labelName}
                            </p>
                            <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">
                              ₹{(v.offeredPrice || v.salesPrice || 0).toLocaleString()} • {v.stock > 0 ? `In Stock (${v.stock})` : 'Out of Stock'}
                            </p>
                          </div>
                          <div className={`w-3.5 h-3.5 rounded-full border border-slate-200 flex-shrink-0 flex items-center justify-center transition-all ${
                            isSelected ? 'border-primary bg-primary' : 'border-slate-200'
                          }`}>
                            {isSelected && <Check size={8} className="text-white stroke-[4px]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery Mode Selector if Quick Commerce is enabled */}
              {product.vendorId?.quickCommerce?.enabled && (
                <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-rose-500/5 border border-rose-500/20 p-4 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-rose-600 flex items-center gap-1">
                      <Zap size={12} className="fill-rose-500 text-rose-500 animate-pulse" /> Express Delivery Available
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase">Within 10 Mins!</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setIsExpressDelivery(false)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        !isExpressDelivery
                          ? 'border-primary bg-white ring-2 ring-primary/5 shadow-xs font-black text-primary text-xs'
                          : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 text-slate-500 text-xs font-bold'
                      }`}
                    >
                      <span>Standard Shipping</span>
                      <span className="text-xs opacity-75 font-semibold">2-3 Days Delivery</span>
                    </button>
                    
                    <button
                      onClick={() => setIsExpressDelivery(true)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        isExpressDelivery
                          ? 'border-rose-500 bg-white ring-2 ring-rose-500/5 shadow-xs font-black text-rose-600 text-xs'
                          : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 text-slate-500 text-xs font-bold'
                      }`}
                    >
                      <span className="flex items-center gap-1">⚡ Express Delivery</span>
                      <span className="text-xs opacity-75 font-semibold">10 Mins Delivery</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quantity and Checkout buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6 border-t border-slate-100 w-full">
                
                {/* Quantity incrementor */}
                <div className="flex items-center justify-between border border-slate-200 rounded-xl overflow-hidden h-12 bg-white sm:flex-shrink-0">
                  <button 
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="px-4 h-full hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer font-black"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="px-4 text-xs font-black text-slate-800 h-full flex items-center min-w-[32px] justify-center">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="px-4 h-full hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer font-black"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div className="flex flex-grow gap-3 min-w-0">
                  {/* Add to Bag */}
                  <button
                    onClick={handleAddProductToBag}
                    disabled={currentVariant.stock <= 0}
                    className="flex-1 bg-white hover:bg-slate-50 border border-primary text-primary h-12 rounded-xl font-black uppercase text-sm tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] px-2 truncate"
                  >
                    <ShoppingBag size={14} className="flex-shrink-0" /> Add to Cart
                  </button>

                  {/* Buy Now */}
                  <button
                    onClick={handleDirectPurchase}
                    disabled={currentVariant.stock <= 0}
                    className="flex-1 bg-primary hover:bg-primary/95 text-white h-12 rounded-xl font-black uppercase text-sm tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] px-2 truncate"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              <div className="text-[11px] font-black text-slate-400 uppercase flex items-center gap-1 pt-1 justify-center sm:justify-start">
                <Info size={10} /> Price inclusive of all GST parameters
              </div>

            </div>

            {/* SECTION 4: Vendor Information Card */}
            {product.vendorId && (
              <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-black uppercase">
                    {product.vendorId.businessName?.charAt(0) || 'V'}
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sold By Vendor</p>
                    <p className="text-xs font-black text-slate-800 uppercase mt-0.5">
                      {product.vendorId.businessName || 'Vendor'}
                    </p>
                    {(product.vendorId.city || product.vendorId.state) && (
                      <div className="flex items-center gap-1 text-sm font-bold text-slate-500 uppercase mt-1">
                        <MapPin size={12} className="text-primary" />
                        <span>{[product.vendorId.city, product.vendorId.state].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  {product.vendorId.status === 'APPROVED' && (
                    <span className="bg-green-50 text-green-600 text-xs font-black uppercase px-2.5 py-1 rounded-md border border-green-100 flex items-center gap-1 self-start sm:self-auto">
                      <Check size={10} className="stroke-[3]" /> Approved Vendor
                    </span>
                  )}
                  <button 
                    onClick={() => navigate(`/shop?vendor=${product.vendorId._id}`)}
                    className="text-xs font-black text-primary uppercase tracking-widest hover:underline text-left sm:text-right"
                  >
                    View Store &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 7: Shipping Information */}
            {product.isShippingApply && (
              <div className="p-5 bg-gradient-to-r from-primary/[0.03] to-primary/0 rounded-2xl border border-primary/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-xs border border-slate-100">
                  <Truck size={20} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Shipping Available</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">Fast Standard Delivery & Secure Product Packaging</p>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Technical Specs & Description Stacking */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-12 items-start text-left">
          
          {/* SECTION 5: About / Description (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {product.description && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-3">
                  About This Product
                </h2>
                <div className="text-xs text-slate-600 font-semibold leading-relaxed uppercase tracking-wider space-y-3">
                  <p>{product.description}</p>
                </div>
              </div>
            )}

            {/* SECTION 8: Reviews Section */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xs space-y-6">
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4 text-left w-full sm:w-auto">
                  <span className="text-5xl font-black text-slate-900">{averageReviewsRating}</span>
                  <div className="space-y-1">
                    <div className="flex gap-0.5 text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          fill={i < Math.round(parseFloat(averageReviewsRating) || 4) ? "currentColor" : "none"} 
                          className={i < Math.round(parseFloat(averageReviewsRating) || 4) ? "text-yellow-400" : "text-slate-200"}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-slate-400 uppercase block">
                      Based on {reviewsList.length} verified buyer {reviewsList.length === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={handleWriteReviewClick}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} /> Write Review
                </button>
              </div>

              {/* Reviews Listing */}
              <div className="space-y-4 text-left">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Customer Review Feed</h3>
                
                {reviewsList.length === 0 ? (
                  <div className="bg-slate-50/50 p-8 rounded-xl border border-slate-100 text-center space-y-2">
                    <Sparkles className="mx-auto text-primary" size={24} />
                    <p className="text-xs font-bold text-slate-700 uppercase">No Reviews Yet</p>
                    <p className="text-sm text-slate-400 uppercase">Be the first customer to review this product.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                    {reviewsList.map((rev) => {
                      const authorName = rev.userId?.firstName 
                        ? `${rev.userId.firstName} ${rev.userId.lastName || ''}` 
                        : (typeof rev.userId === 'object' && rev.userId?.name) || 'Verified Buyer';
                      
                      const isVerified = rev.isVerifiedPurchase ?? true;
                      const reviewDate = rev.createdAt 
                        ? new Date(rev.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'Recent';

                      const revImages = Array.isArray(rev.images) ? rev.images : [];
                      const isOwner = isAuthenticated && user?._id === (rev.userId?._id || rev.userId);

                      return (
                        <div key={rev._id} className="bg-slate-50/50 p-4 sm:p-5 rounded-2xl border border-slate-100 text-left transition-all hover:border-slate-200 relative group">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-slate-800 uppercase">{authorName}</span>
                                {isVerified && (
                                  <span className="bg-green-50 text-green-600 text-[11px] font-black uppercase px-1.5 py-0.5 rounded border border-green-100 tracking-wider">
                                    Verified Purchase
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-0.5 text-yellow-400 mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={10} 
                                    fill={i < rev.rating ? "currentColor" : "none"} 
                                    className={i < rev.rating ? "text-yellow-400" : "text-slate-200"}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400 uppercase font-bold">{reviewDate}</span>
                              {isOwner && (
                                <button
                                  onClick={() => handleDeleteReview(rev._id)}
                                  className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50/80 transition-all cursor-pointer"
                                  title="Delete Review"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {rev.title && (
                            <h4 className="text-sm font-black text-slate-800 uppercase mb-1">{rev.title}</h4>
                          )}
                          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide leading-relaxed">
                            "{rev.review}"
                          </p>

                          {/* Uploaded Review Photos */}
                          {revImages.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {revImages.map((img, imgIdx) => {
                                const imgUrl = getReviewImageUrl(img);
                                return (
                                  <div 
                                    key={imgIdx} 
                                    onClick={() => setActiveFullImage(imgUrl)}
                                    className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 hover:border-primary transition-colors cursor-zoom-in bg-white"
                                  >
                                    <img 
                                      src={getImageUrl(imgUrl) || DEFAULT_PRODUCT_PLACEHOLDER} 
                                      alt="" 
                                      className="w-full h-full object-cover" 
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* SECTION 6: Technical Specifications (5 Columns) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-3">
              Technical Specifications
            </h2>
            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs uppercase font-extrabold text-slate-600 border-collapse">
                <tbody>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <td className="p-3 text-slate-400 font-extrabold w-1/3">Brand</td>
                    <td className="p-3 text-slate-800">{product.brand || 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="p-3 text-slate-400 font-extrabold">Category</td>
                    <td className="p-3 text-slate-800">{product.categoryId?.name || 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <td className="p-3 text-slate-400 font-extrabold">SKU Code</td>
                    <td className="p-3 text-slate-800 font-mono">{currentVariant.sku || 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="p-3 text-slate-400 font-extrabold">Color Option</td>
                    <td className="p-3 text-slate-800">{currentVariant.attributes?.color || currentVariant.attributes?.Color || 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <td className="p-3 text-slate-400 font-extrabold">Size Attribute</td>
                    <td className="p-3 text-slate-800">{currentVariant.attributes?.size || currentVariant.attributes?.Size || 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="p-3 text-slate-400 font-extrabold">Weight</td>
                    <td className="p-3 text-slate-800">{currentVariant.weight !== undefined && currentVariant.weight !== null ? `${currentVariant.weight} kg` : 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <td className="p-3 text-slate-400 font-extrabold">Dimensions</td>
                    <td className="p-3 text-slate-800">{currentVariant.length && currentVariant.width && currentVariant.height ? `${currentVariant.length}x${currentVariant.width}x${currentVariant.height} cm` : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400 font-extrabold">Product Status</td>
                    <td className="p-3 text-slate-800">
                      <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-sm font-black uppercase">
                        {product.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 9: Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-slate-100 bg-white py-16 mt-8">
          <div className="container max-w-[1400px] mx-auto px-4 md:px-8">
            <div className="flex flex-col items-start mb-8 text-left">
              <span className="text-sm font-black text-primary uppercase tracking-widest mb-1.5">You May Also Like</span>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wide">Related Products</h2>
              <div className="w-12 h-1 bg-primary mt-2.5 rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => {
                const firstVariant = p.variants?.[0] || {};
                const imageSrc = firstVariant.thumbnail?.url || firstVariant.images?.[0]?.url || p.thumbnail?.url || '';
                const hasDisc = firstVariant.salesPrice && firstVariant.offeredPrice && (firstVariant.salesPrice > firstVariant.offeredPrice);
                
                return (
                  <div
                    key={p._id}
                    onClick={() => {
                      navigate(`/product/${p._id}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group bg-slate-50 rounded-xl border border-slate-100 hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between text-left"
                  >
                    <div className="relative aspect-square overflow-hidden bg-white border-b border-slate-100/50 flex items-center justify-center">
                      {imageSrc ? (
                        <img 
                          src={imageSrc} 
                          alt={p.name} 
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <ImageIcon size={32} className="text-slate-300" />
                      )}
                      {hasDisc && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="bg-primary text-white text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm">
                            Sale
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-primary uppercase tracking-wider truncate">
                            {p.brand || 'Luxe'}
                          </span>
                          <div className="flex items-center gap-0.5 bg-yellow-400/10 text-yellow-600 px-1.5 py-0.5 rounded text-[11px] font-black">
                            <span>{p.averageRating !== undefined && p.averageRating !== null ? p.averageRating : '0.0'}</span> <Star size={8} fill="currentColor" />
                          </div>
                        </div>

                        <h3 className="text-xs font-bold text-slate-800 line-clamp-2 uppercase tracking-wide group-hover:text-primary transition-colors leading-snug">
                          {p.name}
                        </h3>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100/50 flex items-baseline gap-2.5">
                        <span className="text-xs font-black text-slate-900">
                          ₹{Number(firstVariant.offeredPrice || firstVariant.salesPrice || 0).toLocaleString('en-IN')}
                        </span>
                        {hasDisc && (
                          <span className="text-sm font-bold text-slate-300 line-through">
                            ₹{Number(firstVariant.salesPrice || 0).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE STICKY BOTTOM ACTIONS CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 p-4 flex items-center justify-between gap-3 md:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-2 max-w-[40%] flex-shrink-0">
          {variantImages[0]?.url && (
            <img 
              src={variantImages[0].url} 
              alt="" 
              className="w-10 h-10 object-cover rounded-lg border border-slate-100 flex-shrink-0"
            />
          )}
          <div className="min-w-0 text-left">
            <h4 className="text-sm font-black text-slate-800 uppercase truncate leading-tight">{product.name}</h4>
            <p className="text-xs font-black text-slate-900 mt-0.5">
              ₹{Number(currentVariant.offeredPrice || currentVariant.salesPrice || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 flex-grow justify-end min-w-0">
          <button 
            onClick={handleAddProductToBag}
            disabled={currentVariant.stock <= 0}
            className="flex-1 max-w-[100px] py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 active:scale-[0.97] truncate px-1"
          >
            <ShoppingBag size={12} className="flex-shrink-0" /> Cart
          </button>
          <button 
            onClick={handleDirectPurchase}
            disabled={currentVariant.stock <= 0}
            className="flex-1 max-w-[120px] py-3 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 active:scale-[0.97] shadow-md shadow-primary/15 truncate px-1"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      {activeFullImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 transition-all duration-300"
          onClick={() => setActiveFullImage(null)}
        >
          <button 
            onClick={() => setActiveFullImage(null)}
            className="absolute top-6 right-6 text-white hover:text-primary transition-colors bg-white/10 hover:bg-white/20 p-2.5 rounded-full cursor-pointer"
          >
            <X size={20} className="stroke-[2.5]" />
          </button>
          <img 
            src={activeFullImage} 
            alt="Fullscreen review detail" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

    </div>
  );
};

export default ProductDetail;