import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronDown,
  ShoppingBag, 
  Clock, 
  MapPin, 
  Package, 
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Truck,
  Loader2,
  Tag,
  Star,
  Upload,
  X,
  Trash2,
  Zap,
  Search,
  Copy,
  Check,
  Phone,
  FileText,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import Swal from 'sweetalert2';
import UserSidebar from './UserSidebar';
import { getImageUrl, handleImageError, DEFAULT_PRODUCT_PLACEHOLDER } from '../../utils/imageUrl';
import { getUserOrders } from '../../api/authService';
import { getQuickUserOrders } from '../../api/quickECommerceService';
import { toast } from '../../utils/toast';
import apiClient from '../../api/apiClient';
import { addProductReview, updateProductReview, deleteProductReview } from '../../api/productService';

const Orders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') || searchParams.get('type') || 'all';

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(urlTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [productDetails, setProductDetails] = useState({});

  // Sync activeTab if searchParams change
  useEffect(() => {
    const param = searchParams.get('tab') || searchParams.get('type');
    if (param && ['all', 'quick', 'standard', 'processing', 'delivered', 'cancelled'].includes(param)) {
      setActiveTab(param);
    }
  }, [searchParams]);

  // Review Modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState('');
  const [reviewProductId, setReviewProductId] = useState('');
  const [reviewProductName, setReviewProductName] = useState('');
  const [reviewVendorOrderId, setReviewVendorOrderId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewRatingHover, setReviewRatingHover] = useState(null);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewImagePreviews, setReviewImagePreviews] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Toggle order accordion
  const toggleOrderAccordion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Copy Order ID
  const handleCopyOrderId = (orderNumber, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(orderNumber);
    setCopiedId(orderNumber);
    toast.success('Order ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenReviewModal = (order, item, vendorOrd, reviewId = null, existingReview = null) => {
    setReviewProductId(item.productId?._id || item.productId || '');
    setReviewProductName(item.productName || 'Product');
    setReviewVendorOrderId(vendorOrd?._id || vendorOrd?.id || '');
    setReviewImages([]);
    setReviewImagePreviews([]);

    if (reviewId) {
      setIsEditingReview(true);
      setEditingReviewId(reviewId);
      setReviewRating(existingReview?.rating || 5);
      setReviewTitle(existingReview?.title || '');
      setReviewBody(existingReview?.review || '');
    } else {
      setIsEditingReview(false);
      setEditingReviewId('');
      setReviewRating(5);
      setReviewTitle('');
      setReviewBody('');
    }
    setIsReviewModalOpen(true);
  };

  const handleReviewImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setReviewImages(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setReviewImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeReviewImage = (index) => {
    URL.revokeObjectURL(reviewImagePreviews[index]);
    const updatedFiles = reviewImages.filter((_, i) => i !== index);
    const updatedPreviews = reviewImagePreviews.filter((_, i) => i !== index);
    setReviewImages(updatedFiles);
    setReviewImagePreviews(updatedPreviews);
  };

  useEffect(() => {
    return () => {
      reviewImagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [reviewImagePreviews]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!reviewTitle.trim()) {
      toast.error('Please enter a review title.');
      return;
    }
    if (!reviewBody.trim()) {
      toast.error('Please enter review details.');
      return;
    }

    setSubmittingReview(true);
    try {
      let res;
      if (isEditingReview) {
        res = await updateProductReview(editingReviewId, {
          productId: reviewProductId,
          rating: reviewRating,
          title: reviewTitle.trim(),
          review: reviewBody.trim()
        });
      } else {
        const formData = new FormData();
        formData.append('productId', reviewProductId);
        formData.append('rating', reviewRating.toString());
        formData.append('title', reviewTitle.trim());
        formData.append('review', reviewBody.trim());

        reviewImages.forEach(file => {
          formData.append('images', file);
        });

        res = await addProductReview(formData);
      }

      if (res?.success) {
        toast.success(isEditingReview ? 'Your review has been updated.' : 'Thank you! Your review has been posted.');
        setIsReviewModalOpen(false);
        fetchOrders();
      } else {
        toast.error(res?.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Review submission error:', err);
      toast.error('An error occurred while submitting your review.');
    } finally {
      setSubmittingReview(false);
    }
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
          fetchOrders();
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

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const [standardRes, quickRes] = await Promise.allSettled([
        getUserOrders(),
        getQuickUserOrders(1, 50)
      ]);

      let standardList = [];
      if (standardRes.status === 'fulfilled' && standardRes.value?.success) {
        const raw = standardRes.value.data?.data ?? standardRes.value.data ?? [];
        standardList = Array.isArray(raw) ? raw.map(o => ({ ...o, isQuickDelivery: false })) : [];
      }

      let quickList = [];
      if (quickRes.status === 'fulfilled') {
        const rawVal = quickRes.value;
        const rawQuick = rawVal?.orders ?? rawVal?.data?.orders ?? (Array.isArray(rawVal?.data) ? rawVal?.data : []);
        if (Array.isArray(rawQuick)) {
          quickList = rawQuick.map(q => {
            const normalizedVendorOrders = (q.vendorOrders && q.vendorOrders.length > 0)
              ? q.vendorOrders.map(vo => ({
                  ...vo,
                  items: (vo.items && vo.items.length > 0) ? vo.items : (q.items || [])
                }))
              : [{ _id: q._id, items: q.items || [] }];

            return {
              _id: q._id,
              orderNumber: q.orderNumber || `FFQ-${q._id.toString().slice(-6)}`,
              orderStatus: q.status || 'PROCESSING',
              status: q.status || 'PROCESSING',
              isQuickDelivery: true,
              isQuickCommerce: true,
              grandTotal: q.grandTotal || 0,
              subtotal: q.subtotal || 0,
              subTotal: q.subtotal || 0,
              deliveryCharge: q.deliveryCharge || 0,
              shippingCharge: q.deliveryCharge || 0,
              discount: q.discount || 0,
              tax: q.tax || 0,
              packagingCharge: q.packagingCharge || 0,
              paymentMethod: q.paymentMethod || 'CASH_ON_DELIVERY',
              paymentStatus: q.paymentStatus || 'PENDING',
              createdAt: q.createdAt,
              shippingAddress: q.shippingAddress,
              vendorOrders: normalizedVendorOrders,
              items: q.items || [],
              deliveryPerson: q.vendorOrders?.[0]?.deliveryPersonId || null
            };
          });
        }
      }

      // Combine both lists and sort descending by order date
      const combined = [...standardList, ...quickList].sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });

      setOrders(combined);
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('An error occurred while fetching your orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length === 0) return;

    const productIds = new Set();
    orders.forEach(order => {
      order.vendorOrders?.forEach(vendorOrd => {
        vendorOrd.items?.forEach(item => {
          const pId = item.productId?._id || item.productId;
          if (pId && typeof pId === 'string') {
            productIds.add(pId);
          }
        });
      });
    });

    const uniqueProductIds = Array.from(productIds);
    if (uniqueProductIds.length === 0) return;

    const fetchAllDetails = async () => {
      const detailsMap = { ...productDetails };
      let updated = false;

      const toFetch = uniqueProductIds.filter(pId => !detailsMap[pId]);
      if (toFetch.length === 0) return;

      try {
        const fetchPromises = toFetch.map(async (pId) => {
          try {
            const response = await apiClient.get(`/public-user/product-details/${pId}`);
            const product = response?.data?.data?.data || response?.data?.data;
            return { pId, product };
          } catch (err) {
            console.error(`Failed to load product details for ${pId}:`, err);
            return { pId, product: null };
          }
        });

        const results = await Promise.all(fetchPromises);
        results.forEach(({ pId, product }) => {
          if (product) {
            detailsMap[pId] = product;
            updated = true;
          }
        });

        if (updated) {
          setProductDetails(detailsMap);
        }
      } catch (err) {
        console.error("Error fetching product details for orders list:", err);
      }
    };

    fetchAllDetails();
  }, [orders]);

  const getVariantImage = (item) => {
    if (item.productImage) {
      return getImageUrl(item.productImage);
    }

    const pId = item.productId?._id || item.productId;
    const vId = item.variantId?._id || item.variantId;
    
    if (pId && vId && productDetails[pId]) {
      const product = productDetails[pId];
      const variant = product.variants?.find(v => v._id === vId);
      if (variant) {
        const raw = variant.thumbnail?.url || variant.thumbnail || variant.images?.[0]?.url || variant.images?.[0];
        if (raw) return getImageUrl(raw);
      }
    }
    
    const directRaw = 
      item.variantId?.thumbnail?.url || 
      item.variantId?.thumbnail || 
      item.variantId?.images?.[0]?.url || 
      item.variantId?.images?.[0] || 
      item.productImage || 
      item.image;
      
    if (directRaw) {
      return getImageUrl(directRaw);
    }
    
    return DEFAULT_PRODUCT_PLACEHOLDER;
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || 'pending';
    switch (s) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
            Shipped
          </span>
        );
      case 'out_for_delivery':
      case 'out for delivery':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-300 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            Out for Delivery
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wide bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            Processing
          </span>
        );
    }
  };

  // Tab stats count
  const tabCounts = useMemo(() => {
    const counts = {
      all: orders.length,
      quick: 0,
      standard: 0,
      processing: 0,
      delivered: 0,
      cancelled: 0
    };

    orders.forEach(o => {
      const isQuick = !!(o.isQuickDelivery || o.isQuickCommerce || o.orderType === 'QUICK');
      if (isQuick) counts.quick++;
      else counts.standard++;

      const s = (o.orderStatus || o.status || '').toLowerCase();
      if (s === 'delivered') counts.delivered++;
      else if (s === 'cancelled') counts.cancelled++;
      else if (['pending', 'processing', 'placed', 'shipped', 'out_for_delivery', 'out for delivery'].includes(s)) {
        counts.processing++;
      }
    });

    return counts;
  }, [orders]);

  // Filter orders based on active tab & search query
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Tab filter
      if (activeTab === 'quick') {
        const isQuick = !!(order.isQuickDelivery || order.isQuickCommerce || order.orderType === 'QUICK');
        if (!isQuick) return false;
      } else if (activeTab === 'standard') {
        const isQuick = !!(order.isQuickDelivery || order.isQuickCommerce || order.orderType === 'QUICK');
        if (isQuick) return false;
      } else if (activeTab === 'processing') {
        const s = (order.orderStatus || order.status || '').toLowerCase();
        if (!['pending', 'processing', 'placed', 'shipped', 'out_for_delivery', 'out for delivery'].includes(s)) return false;
      } else if (activeTab === 'delivered') {
        const s = (order.orderStatus || order.status || '').toLowerCase();
        if (s !== 'delivered') return false;
      } else if (activeTab === 'cancelled') {
        const s = (order.orderStatus || order.status || '').toLowerCase();
        if (s !== 'cancelled') return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesOrderNumber = (order.orderNumber || '').toLowerCase().includes(query);
        const matchesProduct = order.vendorOrders?.some(vo => 
          vo.items?.some(it => 
            (it.productName || '').toLowerCase().includes(query) ||
            (it.sku || '').toLowerCase().includes(query)
          )
        );
        return matchesOrderNumber || matchesProduct;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-4 sm:py-8 font-outfit text-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-gray-400 uppercase mb-4 sm:mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} className="text-gray-300" />
          <Link to="/profile" className="hover:text-primary transition-colors">Profile</Link>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="text-gray-900 font-extrabold">My Orders</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-5 lg:gap-8">
          
          {/* Left Sidebar */}
          <UserSidebar />

          {/* Right Content */}
          <div className="flex-grow space-y-4 sm:space-y-6 min-w-0 pb-24">
            
            {/* Header section with search and filter pills */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm text-left space-y-4">
              
              {/* Top Title & Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black uppercase text-gray-900 tracking-tight flex items-center gap-2">
                      <ShoppingBag className="text-primary stroke-[2.5]" size={22} /> My Orders
                    </h1>
                    <span className="text-xs font-black text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full font-mono">
                      {orders.length}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-400 font-semibold">
                    Track, manage, and review your purchases in real-time
                  </p>
                </div>

                {/* Quick Delivery Feature Badge */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[11px] sm:text-xs font-bold">
                    <Zap size={13} className="text-amber-500 fill-amber-500 animate-pulse" />
                    <span>10-Min Quick Delivery Active</span>
                  </div>
                </div>
              </div>

              {/* Search Bar for Orders */}
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Order ID (e.g. FFQ-...) or Product Name..."
                  className="w-full pl-9 pr-8 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white rounded-xl border border-gray-200/80 focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs font-medium text-gray-800 placeholder:text-gray-400 transition-all outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Horizontal Scrollable Tabs */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1 pb-1 -mx-1 px-1">
                {[
                  { id: 'all', label: 'All Orders', count: tabCounts.all },
                  { id: 'quick', label: '⚡ 10-Min Quick', count: tabCounts.quick, highlight: true },
                  { id: 'standard', label: '📦 Standard', count: tabCounts.standard },
                  { id: 'processing', label: 'Processing', count: tabCounts.processing },
                  { id: 'delivered', label: 'Delivered', count: tabCounts.delivered },
                  { id: 'cancelled', label: 'Cancelled', count: tabCounts.cancelled }
                ].map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                        isActive
                          ? 'bg-primary text-white shadow-sm shadow-primary/25 scale-[1.02]'
                          : tab.highlight
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-100'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-200/80 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Main Orders List container */}
            {isLoading ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-12 sm:p-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-primary" size={32} />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading your orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-10 sm:p-16 text-center space-y-5">
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto text-primary border border-primary/10">
                  <Package size={30} className="stroke-[2.5]" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="text-base font-extrabold uppercase text-gray-900">
                    {searchQuery ? 'No Matching Orders' : 'No Orders Found'}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed">
                    {searchQuery 
                      ? `We couldn't find any orders matching "${searchQuery}". Try searching with another keyword.`
                      : activeTab === 'all' 
                      ? "You haven't placed any orders yet on FashionFever." 
                      : `You have no ${activeTab} orders at this moment.`}
                  </p>
                </div>
                {searchQuery ? (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black uppercase px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Clear Search
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Link 
                      to="/shop" 
                      className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase px-5 py-3 rounded-xl shadow-md shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                      Cosmetics Shop <ChevronRight size={14} className="stroke-[3]" />
                    </Link>
                    <Link 
                      to="/quick-shop" 
                      className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase px-5 py-3 rounded-xl shadow-md shadow-amber-500/20 hover:scale-[1.02] transition-all"
                    >
                      <Zap size={14} className="fill-white" /> 10-Min Delivery
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5">
                {filteredOrders.map((order) => {
                  const isQuick = !!(order.isQuickDelivery || order.isQuickCommerce || order.orderType === 'QUICK');
                  const isExpanded = !!expandedOrders[order._id];
                  
                  // Total items count
                  let totalQuantity = 0;
                  order.vendorOrders?.forEach(vo => {
                    vo.items?.forEach(it => {
                      totalQuantity += (it.quantity || 1);
                    });
                  });

                  return (
                    <div 
                      key={order._id} 
                      className={`bg-white rounded-2xl sm:rounded-3xl border transition-all duration-200 overflow-hidden text-left ${
                        isQuick 
                          ? 'border-amber-200/70 shadow-xs hover:border-amber-300' 
                          : 'border-gray-100 shadow-xs hover:border-gray-200'
                      }`}
                    >
                      
                      {/* CARD HEADER */}
                      <div className="p-3.5 sm:p-5 bg-gradient-to-r from-gray-50/70 via-gray-50/40 to-white border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          
                          {/* Left: Mode Badge & Order ID */}
                          <div className="flex flex-wrap items-center gap-2">
                            {isQuick ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase bg-amber-500 text-white shadow-xs">
                                <Zap size={11} className="fill-white" /> 10-Min Fast
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase bg-slate-100 text-slate-700 border border-slate-200">
                                <Truck size={11} /> Standard Shipping
                              </span>
                            )}

                            {/* Order ID Pill with Copy */}
                            <button
                              onClick={(e) => handleCopyOrderId(order.orderNumber, e)}
                              title="Click to copy order ID"
                              className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-gray-800 transition-colors cursor-pointer group"
                            >
                              <span>{order.orderNumber}</span>
                              {copiedId === order.orderNumber ? (
                                <Check size={12} className="text-emerald-600" />
                              ) : (
                                <Copy size={11} className="text-gray-400 group-hover:text-primary transition-colors" />
                              )}
                            </button>
                          </div>

                          {/* Right: Placed Date & Status */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-0 border-gray-100">
                            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 font-medium">
                              <Calendar size={12} className="text-gray-400" />
                              <span>
                                {order.createdAt 
                                  ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                  : 'N/A'}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span>
                                {order.createdAt 
                                  ? new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                                  : ''}
                              </span>
                            </div>

                            {/* Status badge */}
                            <div>
                              {getStatusBadge(order.orderStatus)}
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* CARD BODY: ORDERED PRODUCTS */}
                      <div className="p-3.5 sm:p-5 space-y-3.5">
                        <div className="space-y-3">
                          {order.vendorOrders?.map((vendorOrd) => 
                            vendorOrd.items?.map((item, idx) => {
                              const color = item.attributes?.color || item.attributes?.Color;
                              const size = item.attributes?.size || item.attributes?.Size;
                              const itemTotal = item.finalPrice || (item.salesPrice * (item.quantity || 1));
                              const isDelivered = (order.orderStatus || order.status || '').toLowerCase() === 'delivered';

                              return (
                                <div 
                                  key={item._id || idx} 
                                  className="flex gap-3 sm:gap-4 items-center sm:items-start pb-3.5 border-b border-gray-100 last:border-0 last:pb-0"
                                >
                                  {/* Product Thumbnail */}
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden relative">
                                    <img 
                                      src={getVariantImage(item)} 
                                      alt={item.productName || 'Product'} 
                                      className="w-full h-full object-cover"
                                      onError={handleImageError}
                                    />
                                  </div>

                                  {/* Middle Info */}
                                  <div className="flex-grow min-w-0 space-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug line-clamp-1 sm:line-clamp-2">
                                        {item.productName || 'Cosmetics Item'}
                                      </h4>
                                      <div className="text-right flex-shrink-0 sm:hidden">
                                        <span className="text-xs font-black text-gray-900 font-mono">
                                          ₹{itemTotal.toLocaleString()}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Variant badges & SKU */}
                                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 font-semibold">
                                      {item.sku && (
                                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-mono">
                                          {item.sku}
                                        </span>
                                      )}
                                      {color && (
                                        <span className="text-primary font-bold">
                                          Color: {color}
                                        </span>
                                      )}
                                      {size && (
                                        <span className="text-gray-600">
                                          • Size: {size}
                                        </span>
                                      )}
                                    </div>

                                    {/* Qty & Unit Price */}
                                    <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-500">
                                      <span>Qty: <strong className="text-gray-900">{item.quantity || 1}</strong></span>
                                      <span>×</span>
                                      <span className="font-semibold text-gray-700">₹{(item.salesPrice || 0).toLocaleString()}</span>
                                      {item.discountAmount > 0 && (
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                                          Save ₹{item.discountAmount}
                                        </span>
                                      )}
                                    </div>

                                    {/* Review action buttons (if delivered) */}
                                    {isDelivered && (
                                      <div className="pt-1.5 flex flex-wrap gap-2">
                                        {item.reviewId || item.review ? (
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => handleOpenReviewModal(order, item, vendorOrd, item.reviewId || (typeof item.review === 'string' ? item.review : item.review?._id), typeof item.review === 'object' ? item.review : null)}
                                              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                            >
                                              <Star size={11} fill="currentColor" /> Edit Review
                                            </button>
                                            <button
                                              onClick={() => handleDeleteReview(item.reviewId || (typeof item.review === 'string' ? item.review : item.review?._id))}
                                              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                            >
                                              <Trash2 size={11} /> Delete
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => handleOpenReviewModal(order, item, vendorOrd)}
                                            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-primary bg-primary/5 hover:bg-primary hover:text-white border border-primary/20 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-xs"
                                          >
                                            <Star size={11} fill="currentColor" /> Rate & Review
                                          </button>
                                        )}
                                      </div>
                                    )}

                                  </div>

                                  {/* Right Total (Desktop) */}
                                  <div className="hidden sm:block text-right flex-shrink-0 min-w-[90px]">
                                    <span className="text-sm font-black text-gray-900 font-mono">
                                      ₹{itemTotal.toLocaleString()}
                                    </span>
                                    {item.discountAmount > 0 && (
                                      <p className="text-xs font-bold text-emerald-600 uppercase mt-0.5">
                                        Saved ₹{item.discountAmount}
                                      </p>
                                    )}
                                  </div>

                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Quick Commerce Delivery Partner Strip */}
                        {isQuick && order.deliveryPerson && (
                          <div className="mt-2 bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-teal-50/50 p-3 rounded-xl border border-emerald-200/80 flex items-center justify-between text-left">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                                <Zap size={16} className="fill-white" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-black uppercase text-emerald-800 tracking-wider block">
                                  Quick Delivery Partner
                                </span>
                                <p className="text-xs font-black text-gray-900 truncate">
                                  {order.deliveryPerson.name}
                                  {order.deliveryPerson.vehicleNumber && (
                                    <span className="font-mono text-gray-500 text-[11px] ml-1.5 font-normal">
                                      ({order.deliveryPerson.vehicleNumber})
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            {order.deliveryPerson.phone && (
                              <a 
                                href={`tel:${order.deliveryPerson.phone}`}
                                className="inline-flex items-center gap-1 text-[11px] font-bold uppercase bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 px-2.5 py-1 rounded-lg shadow-xs transition-colors flex-shrink-0 ml-2"
                              >
                                <Phone size={11} /> Call Rider
                              </a>
                            )}
                          </div>
                        )}

                        {/* Courier Tracking Strip */}
                        {(order.trackingId || order.vendorOrders?.some(vo => vo.trackingId)) && (
                          <div className="mt-2 bg-blue-50/70 p-3 rounded-xl border border-blue-200/80 flex items-center justify-between text-left">
                            <div className="flex items-center gap-2 min-w-0">
                              <Truck size={15} className="text-blue-600 flex-shrink-0" />
                              <div className="min-w-0">
                                <span className="text-xs font-bold uppercase text-blue-600 block">
                                  Tracking Number
                                </span>
                                <span className="text-xs font-black font-mono text-blue-900 select-all truncate block">
                                  {order.trackingId || order.vendorOrders?.find(vo => vo.trackingId)?.trackingId}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-black uppercase bg-blue-600 text-white px-2 py-0.5 rounded-md flex-shrink-0">
                              En Route
                            </span>
                          </div>
                        )}

                      </div>

                      {/* CARD FOOTER BAR (Always Visible with Accordion Toggle) */}
                      <div className="bg-gray-50/60 px-3.5 sm:px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
                        
                        {/* Left: Payment Method & Items count */}
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                          <span className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-700">
                            <CreditCard size={12} className="text-gray-400" />
                            {order.paymentMethod === 'CashOnDelivery' || order.paymentMethod === 'CASH_ON_DELIVERY' 
                              ? 'COD' 
                              : order.paymentMethod === 'WALLET' 
                              ? 'Wallet' 
                              : order.paymentMethod === 'WALLET_PLUS_COD' 
                              ? 'Wallet + COD' 
                              : order.paymentMethod || 'COD'}
                          </span>
                          <span className="text-gray-400 hidden sm:inline">•</span>
                          <span className="text-gray-500 text-[11px] font-medium hidden sm:inline">
                            {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
                          </span>
                        </div>

                        {/* Right: Grand Total & Accordion Toggle */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs font-bold text-gray-400 uppercase block leading-none">
                              Grand Total
                            </span>
                            <span className="text-sm sm:text-base font-black text-primary font-mono leading-tight">
                              ₹{(order.grandTotal || 0).toLocaleString()}
                            </span>
                          </div>

                          <button
                            onClick={() => toggleOrderAccordion(order._id)}
                            className="inline-flex items-center gap-1 bg-white hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 transition-colors cursor-pointer shadow-2xs"
                          >
                            <span>{isExpanded ? 'Hide' : 'Details'}</span>
                            <ChevronDown 
                              size={14} 
                              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                            />
                          </button>
                        </div>

                      </div>

                      {/* EXPANDABLE ACCORDION: ADDRESS & INVOICE BREAKDOWN */}
                      {isExpanded && (
                        <div className="p-3.5 sm:p-5 bg-gray-50/40 border-t border-gray-100 text-xs animate-in slide-in-from-top-2 duration-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Destination Address */}
                            <div className="bg-white p-3.5 rounded-xl border border-gray-200/70 space-y-2">
                              <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin size={13} className="text-primary" /> Delivery Destination
                              </h5>
                              <div className="text-gray-600 font-medium space-y-0.5 leading-relaxed text-xs">
                                {order.shippingAddress?.phone && (
                                  <p className="font-bold text-gray-900">
                                    Phone: {order.shippingAddress.phone}
                                  </p>
                                )}
                                <p>{order.shippingAddress?.line1 || order.shippingAddress?.addressLine1 || 'N/A'}</p>
                                {(order.shippingAddress?.line2 || order.shippingAddress?.addressLine2) && (
                                  <p>{order.shippingAddress.line2 || order.shippingAddress.addressLine2}</p>
                                )}
                                <p className="font-bold text-gray-800">
                                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                                </p>
                                <p className="text-gray-400">{order.shippingAddress?.country || 'India'}</p>
                              </div>
                            </div>

                            {/* Line-item Invoice breakdown */}
                            <div className="bg-white p-3.5 rounded-xl border border-gray-200/70 space-y-2">
                              <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText size={13} className="text-primary" /> Invoice Breakdown
                              </h5>
                              
                              <div className="space-y-1.5 text-xs text-gray-600 font-medium">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Subtotal</span>
                                  <span className="font-semibold text-gray-800">₹{(order.subtotal || order.subTotal || 0).toLocaleString()}</span>
                                </div>

                                {(order.discount > 0 || order.couponDiscount > 0) && (
                                  <div className="flex justify-between text-emerald-600 font-semibold">
                                    <span className="flex items-center gap-1">
                                      <Tag size={11} /> Coupon ({order.appliedCoupon?.code || order.couponCode || 'PROMO'})
                                    </span>
                                    <span>-₹{(order.discount || order.couponDiscount || 0).toLocaleString()}</span>
                                  </div>
                                )}

                                <div className="flex justify-between">
                                  <span className="text-gray-500">Shipping & Handling</span>
                                  <span className="font-semibold text-gray-800">
                                    {(order.deliveryCharge || order.shippingCharge || 0) > 0 
                                      ? `₹${(order.deliveryCharge || order.shippingCharge || 0).toLocaleString()}` 
                                      : <span className="text-emerald-600 font-bold">FREE</span>}
                                  </span>
                                </div>

                                {order.packagingCharge > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Packaging Fee</span>
                                    <span className="font-semibold text-gray-800">₹{(order.packagingCharge || 0).toLocaleString()}</span>
                                  </div>
                                )}

                                {order.codCharge > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">COD Fee</span>
                                    <span className="font-semibold text-gray-800">₹{(order.codCharge || 0).toLocaleString()}</span>
                                  </div>
                                )}

                                <div className="h-[1px] bg-gray-100 my-1"></div>

                                <div className="flex justify-between items-center text-sm font-black text-gray-900 pt-0.5">
                                  <span>Total Paid / Payable</span>
                                  <span className="text-primary font-mono">₹{(order.grandTotal || 0).toLocaleString()}</span>
                                </div>

                                <div className="flex items-center justify-between text-[11px] font-bold uppercase pt-1 text-gray-500">
                                  <span>Payment Status</span>
                                  <span className={`px-2 py-0.5 rounded font-mono ${
                                    (order.paymentStatus?.toLowerCase() === 'paid') 
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    {order.paymentStatus || 'Pending'}
                                  </span>
                                </div>

                              </div>
                            </div>

                          </div>
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
      
      {/* Review Posting Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden text-left animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gray-50/70 px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black text-primary uppercase block tracking-wider">
                  {isEditingReview ? 'Update Review' : 'Rate & Review'}
                </span>
                <h3 className="text-xs sm:text-sm font-black uppercase text-gray-800 truncate max-w-[240px]">
                  {reviewProductName}
                </h3>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleReviewSubmit} className="p-5 sm:p-6 space-y-4">
              {/* Star Rating Select */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">Your Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((starNum) => {
                    const isFilled = reviewRatingHover !== null ? starNum <= reviewRatingHover : starNum <= reviewRating;
                    return (
                      <button
                        type="button"
                        key={starNum}
                        onClick={() => setReviewRating(starNum)}
                        onMouseEnter={() => setReviewRatingHover(starNum)}
                        onMouseLeave={() => setReviewRatingHover(null)}
                        className="text-2xl transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                      >
                        <Star 
                          size={22} 
                          fill={isFilled ? "#F59E0B" : "none"} 
                          className={isFilled ? "text-amber-500" : "text-gray-200"}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-black text-gray-700 uppercase ml-2">
                    {reviewRating === 5 ? 'Excellent' : reviewRating === 4 ? 'Good' : reviewRating === 3 ? 'Average' : reviewRating === 2 ? 'Poor' : 'Terrible'}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label htmlFor="reviewTitle" className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">Review Title</label>
                <input 
                  id="reviewTitle"
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Amazing texture and long lasting!"
                  className="w-full text-xs font-medium p-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white text-gray-800 outline-none placeholder:text-gray-300 transition-all"
                  required
                />
              </div>

              {/* Review Body */}
              <div className="space-y-1">
                <label htmlFor="reviewBody" className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">Review Details</label>
                <textarea 
                  id="reviewBody"
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Share your experience with this cosmetic product..."
                  rows={3}
                  className="w-full text-xs font-medium p-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white text-gray-700 outline-none placeholder:text-gray-300 transition-all resize-none"
                  required
                />
              </div>

              {/* Multiple File Upload */}
              {!isEditingReview && (
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">Add Photos (Optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {/* Upload Box */}
                    <label className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                      <Upload size={14} className="text-gray-400 group-hover:text-primary transition-colors" />
                      <span className="text-xs font-bold text-gray-400 group-hover:text-primary uppercase mt-0.5 tracking-wider">Add</span>
                      <input 
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleReviewImageChange}
                        className="hidden"
                      />
                    </label>

                    {/* Previews */}
                    {reviewImagePreviews.map((src, idx) => (
                      <div key={idx} className="relative w-14 h-14 rounded-xl border border-gray-200 overflow-hidden group">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeReviewImage(idx)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X size={14} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-primary hover:bg-primary/95 text-white h-11 rounded-xl font-black uppercase text-xs tracking-widest shadow-md shadow-primary/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {submittingReview ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Submitting...
                  </>
                ) : (
                  isEditingReview ? 'Update Review' : 'Submit Review'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;
