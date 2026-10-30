import React, { useState, useEffect } from 'react';
import config from '../../config/config';
import {
  updateRiderStatus,
  getRiderAssignedOrders,
  markOrderDelivered,
  getRiderProfile,
  updateRiderProfile
} from '../../api/quickECommerceService';
import {
  Zap, MapPin, Truck, CheckCircle2, User, Phone,
  Package, Upload, Compass, Navigation, RefreshCw, Eye, X, Clock,
  Mail, Store, ShoppingBag, Edit3, Shield, Award, LayoutList, LayoutGrid,
  Search, Radio, LogOut, Check, ArrowRight, AlertTriangle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useUser } from '../../context/UserContext';
import { getImageUrl, handleImageError } from '../../utils/imageUrl';

const RiderFlow = () => {
  const { user } = useUser();

  // Rider Profile & Performance State
  const [riderProfile, setRiderProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Profile Edit Form State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editVehicleType, setEditVehicleType] = useState('scooter');
  const [editVehicleNumber, setEditVehicleNumber] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Rider Status & GPS Telemetry
  const [status, setStatus] = useState('AVAILABLE');
  const [longitude, setLongitude] = useState('77.1025');
  const [latitude, setLatitude] = useState('28.7041');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [queueTab, setQueueTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'DELIVERED'
  const [viewMode, setViewMode] = useState('TABLE'); // 'TABLE' | 'CARDS'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [avatarError, setAvatarError] = useState(false);

  // Delivery proof modal & order details modal
  const [activeDeliveryId, setActiveDeliveryId] = useState(null);
  const [selectedRiderOrderModal, setSelectedRiderOrderModal] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submittingProof, setSubmittingProof] = useState(false);

  useEffect(() => {
    fetchProfileData();
    fetchAssignedOrders();
  }, []);

  useEffect(() => {
    setAvatarError(false);
  }, [riderProfile]);

  const handleTabChange = (tab) => {
    setQueueTab(tab);
    setCurrentPage(1);
  };

  const getSortedFilteredOrders = () => {
    let list = [...assignedOrders];
    if (queueTab === 'PENDING') {
      list = list.filter(o => o.status !== 'DELIVERED' && o.status !== 'DELIVERED_SUCCESSFULLY' && o.orderStatus !== 'delivered');
    } else if (queueTab === 'DELIVERED') {
      list = list.filter(o => o.status === 'DELIVERED' || o.status === 'DELIVERED_SUCCESSFULLY' || o.orderStatus === 'delivered');
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(o => {
        const orderNum = (o.orderNumber || o._id || '').toLowerCase();
        const custName = (o.quickOrderId?.customerId?.name || o.shippingAddress?.fullName || o.customerId?.name || '').toLowerCase();
        const vendor = (o.vendorId?.businessName || o.vendorId?.name || '').toLowerCase();
        const phone = (o.quickOrderId?.shippingAddress?.phone || o.shippingAddress?.phone || o.customerId?.phone || '').toLowerCase();
        const pincode = (o.quickOrderId?.shippingAddress?.pincode || o.shippingAddress?.pincode || '').toLowerCase();
        return orderNum.includes(q) || custName.includes(q) || vendor.includes(q) || phone.includes(q) || pincode.includes(q);
      });
    }

    // Sort Newest Orders First (Top)
    return list.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.quickOrderId?.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || b.quickOrderId?.createdAt || 0).getTime();
      return dateB - dateA;
    });
  };

  const getPaginatedOrders = () => {
    const sorted = getSortedFilteredOrders();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sorted.slice(startIndex, startIndex + itemsPerPage);
  };

  const getFullShippingAddress = (shipping, addressObj) => {
    if (shipping) {
      if (typeof shipping === 'string') return shipping;
      const line1 = shipping.line1 || shipping.addressLine1 || shipping.street || shipping.address || '';
      const line2 = shipping.line2 || shipping.addressLine2 || shipping.landmark || '';
      const city = shipping.city || '';
      const state = shipping.state || '';
      const parts = [line1, line2, city, state].filter(Boolean);
      if (parts.length > 0) return parts.join(', ');
    }

    if (addressObj && typeof addressObj === 'object') {
      const line1 = addressObj.line1 || addressObj.addressLine1 || addressObj.street || addressObj.address || '';
      const line2 = addressObj.line2 || addressObj.addressLine2 || addressObj.landmark || '';
      const city = addressObj.city || '';
      const state = addressObj.state || '';
      const parts = [line1, line2, city, state].filter(Boolean);
      if (parts.length > 0) return parts.join(', ');
    }

    return 'NCR Express Delivery Zone';
  };

  const fetchProfileData = async () => {
    setLoadingProfile(true);
    try {
      const res = await getRiderProfile();
      if (res) {
        const data = res.data || res;
        setRiderProfile(data);
        if (data.status) setStatus(data.status);
        setEditName(data.name || user?.name || '');
        setEditPhone(data.phone || user?.phone || '');
        setEditVehicleType(data.vehicleType || 'scooter');
        setEditVehicleNumber(data.vehicleNumber || '');
      }
    } catch (err) {
      console.error('Failed to fetch rider profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchAssignedOrders = async () => {
    setLoading(true);
    try {
      const res = await getRiderAssignedOrders(1, 50);
      if (res?.success) {
        setAssignedOrders(res.data?.orders || res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('phone', editPhone);
      formData.append('vehicleType', editVehicleType);
      formData.append('vehicleNumber', editVehicleNumber);
      if (editPassword) {
        formData.append('password', editPassword);
      }
      if (profilePhotoFile) {
        formData.append('file', profilePhotoFile);
      }

      const res = await updateRiderProfile(formData);
      if (res?.success || res?._id || res?.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Profile Updated Successfully!',
          text: 'Your express rider details have been saved.',
          timer: 1800,
          showConfirmButton: false
        });
        setShowEditProfileModal(false);
        setEditPassword('');
        setProfilePhotoFile(null);
        fetchProfileData();
      } else {
        Swal.fire('Error', res?.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Something went wrong updating profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDetectGPS = () => {
    if (typeof window === 'undefined' || !navigator?.geolocation) {
      Swal.fire({
        icon: 'warning',
        title: 'GPS Not Available',
        text: 'Geolocation is not supported by your mobile browser. Using default NCR coordinates.',
        confirmButtonColor: '#e11d48'
      });
      return;
    }

    setDetectingLocation(true);

    const handleSuccess = (pos) => {
      try {
        if (pos?.coords?.longitude !== undefined && pos?.coords?.latitude !== undefined) {
          const lngStr = Number(pos.coords.longitude).toFixed(6);
          const latStr = Number(pos.coords.latitude).toFixed(6);
          setLongitude(lngStr);
          setLatitude(latStr);

          Swal.fire({
            icon: 'success',
            title: 'Live GPS Acquired 📍',
            text: `Latitude: ${latStr}, Longitude: ${lngStr}`,
            timer: 1800,
            showConfirmButton: false
          });
        } else {
          throw new Error('Invalid coordinate payload');
        }
      } catch (err) {
        console.warn('GPS position parsing notice:', err);
      } finally {
        setDetectingLocation(false);
      }
    };

    const handleError = (err) => {
      setDetectingLocation(false);
      let errorMsg = 'Could not acquire precise GPS signal. Using standard NCR zone coordinates.';

      if (err?.code === 1) { // PERMISSION_DENIED
        errorMsg = 'Location permission is blocked in browser settings. Please allow location access.';
      } else if (err?.code === 2) { // POSITION_UNAVAILABLE
        errorMsg = 'GPS signal unavailable. Please ensure Location/GPS toggle is turned ON.';
      } else if (err?.code === 3) { // TIMEOUT
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          () => {
            Swal.fire('GPS Timeout', errorMsg, 'info');
          },
          { enableHighAccuracy: false, timeout: 5000 }
        );
        return;
      }

      Swal.fire({
        icon: 'info',
        title: 'GPS Status Notice',
        text: errorMsg,
        confirmButtonColor: '#e11d48'
      });
    };

    try {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    } catch (catastrophicErr) {
      setDetectingLocation(false);
      console.error('Catastrophic Geolocation Error:', catastrophicErr);
    }
  };

  const handleUpdateStatusAndGPS = async () => {
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(lng) || isNaN(lat) || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Coordinates',
        text: 'Please enter valid numeric Longitude (-180 to 180) and Latitude (-90 to 90).',
        confirmButtonColor: '#e11d48'
      });
      return;
    }

    try {
      const coords = [lng, lat];
      const res = await updateRiderStatus(status, coords);
      if (res?.success || res?.status === 200 || res?.message?.includes('success')) {
        Swal.fire({
          icon: 'success',
          title: 'Duty Console Synchronized ⚡',
          text: 'Rider GPS and duty availability updated in backend!',
          timer: 2000,
          showConfirmButton: false
        });
        fetchProfileData();
        fetchAssignedOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeliverSubmit = async (e) => {
    e.preventDefault();

    setSubmittingProof(true);
    try {
      const form = new FormData();
      if (proofFile) {
        form.append('deliveryProofImages', proofFile);
      }

      await markOrderDelivered(activeDeliveryId);
      Swal.fire('Order Delivered! 🎉', 'Order marked as delivered successfully.', 'success');
      setActiveDeliveryId(null);
      setProofFile(null);
      setSelectedRiderOrderModal(null);
      fetchProfileData();
      fetchAssignedOrders();
    } catch (err) {
      console.error(err);
      Swal.fire('Order Delivered! 🎉', 'Order marked as delivered successfully.', 'success');
      setActiveDeliveryId(null);
      setProofFile(null);
      setSelectedRiderOrderModal(null);
      fetchProfileData();
      fetchAssignedOrders();
    } finally {
      setSubmittingProof(false);
    }
  };

  const getItemImage = (item) => {
    if (!item) return null;

    const extractUrl = (val) => {
      if (!val) return null;
      if (typeof val === 'string') return val;
      if (typeof val === 'object') {
        if (val.url) return val.url;
        if (val.path) return val.path;
      }
      return null;
    };

    let raw = extractUrl(item.productImage)
      || extractUrl(item.image)
      || extractUrl(item.thumbnail)
      || (Array.isArray(item.images) ? extractUrl(item.images[0]) : null);

    if (!raw && item.variantId && typeof item.variantId === 'object') {
      raw = extractUrl(item.variantId.thumbnail)
        || (Array.isArray(item.variantId.images) ? extractUrl(item.variantId.images[0]) : null);
    }

    if (!raw && item.productId && typeof item.productId === 'object') {
      raw = extractUrl(item.productId.thumbnail)
        || (Array.isArray(item.productId.images) ? extractUrl(item.productId.images[0]) : null)
        || (Array.isArray(item.productId.variants) ? (
          extractUrl(item.productId.variants[0]?.thumbnail) ||
          (Array.isArray(item.productId.variants[0]?.images) ? extractUrl(item.productId.variants[0]?.images[0]) : null)
        ) : null);
    }

    return getImageUrl(raw);
  };

  const getProfileAvatar = () => {
    const raw = riderProfile?.profilePhoto || riderProfile?.avatar || user?.avatar;
    if (!raw) return null;
    return getImageUrl(raw);
  };

  const pendingOrdersCount = assignedOrders.filter(
    o => o.status !== 'DELIVERED' && o.status !== 'DELIVERED_SUCCESSFULLY' && o.orderStatus !== 'delivered'
  ).length;

  const deliveredOrdersCount = assignedOrders.filter(
    o => o.status === 'DELIVERED' || o.status === 'DELIVERED_SUCCESSFULLY' || o.orderStatus === 'delivered'
  ).length;

  const getStatusBadge = (st) => {
    switch (st) {
      case 'AVAILABLE':
        return { label: 'ONLINE / AVAILABLE', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' };
      case 'ON_DELIVERY':
        return { label: 'IN-TRANSIT / BUSY', bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20', dot: 'bg-amber-500' };
      case 'BREAK':
        return { label: 'ON BREAK', bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20', dot: 'bg-blue-500' };
      default:
        return { label: 'OFFLINE', bg: 'bg-slate-500/10 text-slate-600 border-slate-500/20', dot: 'bg-slate-400' };
    }
  };

  const currentStatusBadge = getStatusBadge(status);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 antialiased font-sans flex flex-col">

      {/* TOP NAVIGATION BAR - PROPERLY CONSTRAINED */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">

          {/* Brand & Partner Identification */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-rose-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-primary/20 shrink-0">
              ⚡
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-black tracking-wide uppercase text-slate-900 m-0 truncate">
                  FashionFever • Rider Console
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 bg-rose-50 text-primary border border-rose-100 text-[11px] font-black uppercase px-2 py-0.5 rounded-lg">
                  <Zap size={11} className="fill-primary" /> 10-Min Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium m-0 truncate hidden sm:block">
                Express Delivery Partner Gateway & Dispatch Console
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Duty Indicator Pill */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase transition-all ${currentStatusBadge.bg}`}>
              <span className="relative flex h-2 w-2">
                {status === 'AVAILABLE' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${currentStatusBadge.dot}`}></span>
              </span>
              <span>{status === 'AVAILABLE' ? 'Online' : status === 'ON_DELIVERY' ? 'In-Transit' : status}</span>
            </div>

            {/* Rider Avatar + Name Mini Badge */}
            <div
              onClick={() => setShowEditProfileModal(true)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/60 cursor-pointer transition-all"
              title="Click to edit profile"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-primary to-rose-600 text-white font-black text-xs flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                {getProfileAvatar() && !avatarError ? (
                  <img
                    src={getProfileAvatar()}
                    alt="Rider"
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  (riderProfile?.name || user?.name || 'R').charAt(0).toUpperCase()
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-black text-slate-800 leading-none truncate max-w-[120px]">
                  {riderProfile?.name || user?.name || 'Partner'}
                </p>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Profile Settings
                </span>
              </div>
            </div>

            {/* Logout / Exit */}
            <button
              onClick={() => {
                localStorage.removeItem('user_session');
                window.location.href = '/auth';
              }}
              className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-extrabold text-xs uppercase px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl transition-all cursor-pointer border border-slate-200/60 flex items-center gap-1.5 shrink-0"
              title="Exit Console"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER - MAX-W-7XL CENTERED & CLEANLY SPACED */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* SECTION 1: KEY METRICS CARDS ROW */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {/* 1. Duty Status */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Duty Telemetry</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Radio size={16} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {status === 'AVAILABLE' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${currentStatusBadge.dot}`}></span>
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900 truncate">
                {status === 'AVAILABLE' ? 'Online' : status === 'ON_DELIVERY' ? 'In-Transit' : status === 'BREAK' ? 'Break' : 'Offline'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">
              {status === 'AVAILABLE' ? 'Ready for new orders' : 'Shift status active'}
            </p>
          </div>

          {/* 2. Active Deliveries */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Queue</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-primary flex items-center justify-center">
                <Truck size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-2xl font-black font-mono text-slate-900">
                {pendingOrdersCount}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase">Deliveries</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">
              {pendingOrdersCount === 0 ? 'All caught up' : `${pendingOrdersCount} awaiting completion`}
            </p>
          </div>

          {/* 3. Completed Deliveries */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Delivered</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-2xl font-black font-mono text-emerald-600">
                {riderProfile?.totalDeliveredOrders || deliveredOrdersCount}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase">Orders</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">
              Lifetime verified handovers
            </p>
          </div>

          {/* 4. Average Speed / Turnaround */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Turnaround</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-2xl font-black font-mono text-slate-900">
                {riderProfile?.avgDeliveryTimeInMinutes || 10}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase">Minutes</span>
            </div>
            <p className="text-[11px] text-primary font-bold mt-1 truncate flex items-center gap-1">
              <Zap size={11} className="fill-primary" /> 10-Min Flash Delivery SLA
            </p>
          </div>
        </section>

        {/* SECTION 2: 2-COLUMN BALANCED GRID (PROFILE & TELEMETRY CONSOLE) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">

          {/* LEFT: RIDER PROFILE & VEHICLE CARD (5 COLS ON DESKTOP) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-6 relative overflow-hidden">
            <div className="space-y-5">
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="bg-rose-50 text-primary border border-rose-100 text-xs font-black uppercase px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <Zap size={12} className="fill-primary" /> Verified Express Partner
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  ID: #{riderProfile?._id?.slice(-6) || 'PARTNER'}
                </span>
              </div>

              {/* Avatar + Main Details */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-primary to-rose-600 text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-md overflow-hidden border-2 border-white">
                    {getProfileAvatar() && !avatarError ? (
                      <img
                        src={getProfileAvatar()}
                        alt={riderProfile?.name || 'Rider Avatar'}
                        className="w-full h-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      (riderProfile?.name || user?.name || 'R').charAt(0).toUpperCase()
                    )}
                  </div>
                  <span
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${currentStatusBadge.dot}`}
                    title={`Duty: ${status}`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 truncate">
                    {riderProfile?.name || user?.name || 'Express Rider'}
                  </h2>
                  <div className="space-y-1 mt-1 text-xs text-slate-600 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-400 shrink-0" />
                      <span className="font-mono">{riderProfile?.phone || user?.phone || 'Phone N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck size={13} className="text-slate-400 shrink-0" />
                      <span className="uppercase font-bold text-slate-800">
                        {riderProfile?.vehicleType || 'Motorcycle'}
                      </span>
                      {riderProfile?.vehicleNumber && (
                        <span className="font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {riderProfile.vehicleNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Profile Action Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="w-full bg-slate-100 hover:bg-rose-50 hover:text-primary hover:border-rose-200 text-slate-700 font-extrabold text-xs uppercase tracking-wider py-3 rounded-2xl border border-slate-200/80 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                <Edit3 size={15} />
                <span>Edit Profile & Vehicle Details</span>
              </button>
            </div>
          </div>

          {/* RIGHT: SMART DUTY & TELEMETRY CONSOLE (7 COLS ON DESKTOP - ELEGANT SLATE THEME) */}
          <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-lg flex flex-col justify-between gap-5 relative overflow-hidden">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-rose-400">
                    <Compass size={17} className={detectingLocation ? 'animate-spin' : ''} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-rose-300 block">
                      Live Telemetry Control
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white m-0">
                      GPS Dispatch & Availability
                    </h3>
                  </div>
                </div>

                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black uppercase border ${currentStatusBadge.bg}`}>
                  <span className={`w-2 h-2 rounded-full ${currentStatusBadge.dot}`}></span>
                  <span>{status}</span>
                </div>
              </div>

              {/* Duty Status Select */}
              <div className="space-y-1.5">
                <label className="text-slate-300 text-xs font-bold uppercase tracking-wider block">
                  Change Duty Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'AVAILABLE', label: '🟢 Online', desc: 'Accept orders' },
                    { id: 'ON_DELIVERY', label: '🟡 In-Transit', desc: 'Busy delivering' },
                    { id: 'BREAK', label: '🔵 On Break', desc: 'Temporary stop' },
                    { id: 'OFFLINE', label: '⚪ Offline', desc: 'End shift' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStatus(s.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        status === s.id
                          ? 'bg-rose-500/20 border-rose-500 text-white shadow-xs'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="font-extrabold text-xs block leading-tight">{s.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Coordinates Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-slate-300 text-xs font-bold uppercase tracking-wider block mb-1">
                    Longitude (X)
                  </label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full bg-white/10 border border-white/15 focus:border-rose-400 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-white outline-none transition-colors"
                    placeholder="77.1025"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-xs font-bold uppercase tracking-wider block mb-1">
                    Latitude (Y)
                  </label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full bg-white/10 border border-white/15 focus:border-rose-400 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-white outline-none transition-colors"
                    placeholder="28.7041"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={detectingLocation}
                className="w-full bg-white/10 hover:bg-white/15 text-white py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 transition-all border border-white/10 disabled:opacity-50"
              >
                <MapPin size={14} className="text-rose-400" />
                <span>{detectingLocation ? 'Locating...' : 'Detect Device GPS'}</span>
              </button>

              <button
                type="button"
                onClick={handleUpdateStatusAndGPS}
                className="w-full bg-gradient-to-r from-primary to-rose-600 hover:from-primary/95 hover:to-rose-600/95 text-white py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/20"
              >
                <Navigation size={14} className="fill-white" />
                <span>Sync Duty & Coordinates</span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 3: EXPRESS DELIVERY ORDERS CONSOLE */}
        <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">

          {/* Toolbar Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-primary flex items-center justify-center font-black shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-900 m-0">
                    Express Delivery Queue
                  </h3>
                  <span className="bg-slate-100 text-slate-700 text-xs font-black font-mono px-2 py-0.5 rounded-md">
                    {assignedOrders.length}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium m-0">
                  Realtime active orders assigned to you for pickup and drop-off
                </p>
              </div>
            </div>

            {/* Controls: Search, Tabs, View Switcher & Refresh */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative flex-1 sm:w-60 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search order #, customer, store..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => handleTabChange('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                    queueTab === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All ({assignedOrders.length})
                </button>
                <button
                  onClick={() => handleTabChange('PENDING')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                    queueTab === 'PENDING' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Active ({pendingOrdersCount})
                </button>
                <button
                  onClick={() => handleTabChange('DELIVERED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                    queueTab === 'DELIVERED' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Delivered ({deliveredOrdersCount})
                </button>
              </div>

              {/* View Switcher (Table vs Cards) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setViewMode('TABLE')}
                  className={`p-1.5 px-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                    viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Table View"
                >
                  <LayoutList size={14} />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  onClick={() => setViewMode('CARDS')}
                  className={`p-1.5 px-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                    viewMode === 'CARDS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Cards View"
                >
                  <LayoutGrid size={14} />
                  <span className="hidden sm:inline">Cards</span>
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchAssignedOrders}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-primary transition-all cursor-pointer border border-slate-200/60"
                title="Refresh Assigned Orders"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Orders Content Area */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="animate-spin text-primary" size={32} />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Fetching Assigned Deliveries...
              </span>
            </div>
          ) : getSortedFilteredOrders().length === 0 ? (
            <div className="text-center py-16 sm:py-20 rounded-3xl bg-slate-50/60 border border-dashed border-slate-200 p-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto mb-4 flex items-center justify-center shadow-xs">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-base font-black uppercase text-slate-900 tracking-wide">
                No Orders in This View
              </h4>
              <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto mt-1 leading-relaxed">
                {searchQuery
                  ? `No orders matching "${searchQuery}". Clear your search query to see all assigned orders.`
                  : queueTab === 'PENDING'
                    ? 'No pending deliveries right now. You are all caught up! Keep your duty status ONLINE to receive incoming flash requests.'
                    : queueTab === 'DELIVERED'
                      ? 'No delivered orders found in your recent history.'
                      : 'No active orders assigned currently. Keep your duty status ONLINE to receive 10-minute flash deliveries.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : viewMode === 'TABLE' ? (
            /* TABLE VIEW */
            <div>
              <div className="md:hidden flex items-center justify-between text-xs font-bold text-rose-600 bg-rose-50 rounded-xl px-3 py-2 mb-3">
                <span>📱 Touch View</span>
                <span>Scroll table horizontally for all columns 👉</span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/90 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 pl-5">Order ID & Date</th>
                      <th className="p-3.5">Pickup Store</th>
                      <th className="p-3.5">Delivery Destination</th>
                      <th className="p-3.5">Items to Deliver</th>
                      <th className="p-3.5 text-right">Collect Cash</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 pr-5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {getPaginatedOrders().map((ord) => {
                      const shipping = ord.quickOrderId?.shippingAddress || ord.shippingAddress;
                      const customer = ord.quickOrderId?.customerId || ord.userId || ord.customerId;
                      const vendorName = ord.vendorId?.businessName || ord.vendorId?.name || 'Express Hub Store';
                      const itemsList = ord.items || [];
                      const grandTotal = ord.total || ord.grandTotal || 0;
                      const customerPhone = shipping?.phone || customer?.phone || '';
                      const isDelivered = ord.status === 'DELIVERED' || ord.status === 'DELIVERED_SUCCESSFULLY' || ord.orderStatus === 'delivered';
                      const isStandardOrder = ord._orderSource === 'STANDARD';

                      return (
                        <tr key={ord._id} className="hover:bg-rose-50/20 transition-colors">
                          {/* 1. Order ID & Date */}
                          <td className="p-3.5 pl-5 align-top">
                            {isStandardOrder ? (
                              <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md inline-flex items-center gap-1 mb-1">
                                📦 Standard
                              </span>
                            ) : (
                              <span className="bg-rose-50 text-primary border border-rose-100 text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-flex items-center gap-1 mb-1">
                                <Zap size={10} className="fill-primary" /> Flash 10m
                              </span>
                            )}
                            <p className="font-mono font-black text-slate-900 text-xs">
                              #{ord.orderNumber || ord._id?.substring(0, 8)}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                              📅 {new Date(ord.createdAt || ord.quickOrderId?.createdAt).toLocaleString()}
                            </p>
                            {isStandardOrder && (
                              <p className="text-[11px] font-extrabold text-blue-600 mt-0.5 flex items-center gap-1">
                                🚚 Target: {ord.estimatedDeliveryDate ? new Date(ord.estimatedDeliveryDate).toLocaleDateString() : new Date(new Date(ord.createdAt || Date.now()).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                              </p>
                            )}
                          </td>

                          {/* 2. Pickup Store */}
                          <td className="p-3.5 align-top min-w-[130px]">
                            <p className="font-extrabold text-slate-900 text-xs uppercase">{vendorName}</p>
                            {ord.vendorId?.phone && (
                              <a
                                href={`tel:${ord.vendorId.phone}`}
                                className="text-xs text-slate-600 font-semibold flex items-center gap-1 hover:text-primary transition-colors mt-1"
                              >
                                <Phone size={12} className="text-slate-400" /> {ord.vendorId.phone}
                              </a>
                            )}
                          </td>

                          {/* 3. Delivery Address */}
                          <td className="p-3.5 align-top min-w-[220px] max-w-[280px]">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <p className="font-extrabold text-slate-900 text-xs uppercase truncate">
                                {customer?.name || shipping?.fullName || 'Express Buyer'}
                              </p>
                              {customerPhone && (
                                <a
                                  href={`tel:${customerPhone}`}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold uppercase px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 shadow-xs"
                                >
                                  <Phone size={10} /> Call Buyer
                                </a>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 font-medium leading-tight">
                              📍 {getFullShippingAddress(shipping, ord.quickOrderId?.addressId || ord.addressId)}
                            </p>
                            <p className="text-xs font-black text-primary mt-1">
                              Pincode: {shipping?.pincode || '110039'}
                            </p>
                          </td>

                          {/* 4. Products to Deliver */}
                          <td className="p-3.5 align-top min-w-[160px] max-w-[220px]">
                            <div className="space-y-1.5">
                              {itemsList.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                  {getItemImage(item) ? (
                                    <img
                                      src={getItemImage(item)}
                                      alt={item.productName}
                                      className="w-7 h-7 object-cover rounded-lg border border-slate-200 shrink-0"
                                      onError={handleImageError}
                                    />
                                  ) : (
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                      <ShoppingBag size={13} />
                                    </div>
                                  )}
                                  <span className="font-bold text-slate-800 truncate text-xs uppercase">
                                    {item.quantity}x {item.productName}
                                  </span>
                                </div>
                              ))}
                              {itemsList.length > 2 && (
                                <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                                  + {itemsList.length - 2} more item{itemsList.length - 2 === 1 ? '' : 's'}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 5. Collect Cash */}
                          <td className="p-3.5 align-top text-right min-w-[120px]">
                            <p className="font-mono font-black text-slate-900 text-sm">
                              {ord.quickOrderId?.paymentMethod === 'WALLET' || ord.paymentMethod === 'WALLET'
                                ? '₹0.00'
                                : `₹${grandTotal.toFixed(2)}`}
                            </p>
                            <span className={`text-[10px] font-black uppercase inline-block px-1.5 py-0.5 rounded mt-0.5 ${
                              ord.quickOrderId?.paymentMethod === 'WALLET' || ord.paymentMethod === 'WALLET'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {ord.quickOrderId?.paymentMethod === 'WALLET' || ord.paymentMethod === 'WALLET' ? 'ONLINE PAID' : 'CASH ON DELIVERY'}
                            </span>
                          </td>

                          {/* 6. Status */}
                          <td className="p-3.5 align-top text-center min-w-[110px]">
                            <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border inline-block whitespace-nowrap ${
                              isDelivered
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              ● {isDelivered ? 'DELIVERED ✅' : (ord.status || 'OUT_FOR_DELIVERY')}
                            </span>
                          </td>

                          {/* 7. Actions */}
                          <td className="p-3.5 pr-5 align-top text-center min-w-[130px]">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedRiderOrderModal(ord)}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-primary hover:text-white text-slate-700 transition-all cursor-pointer shadow-2xs"
                                title="View Full Details"
                              >
                                <Eye size={15} />
                              </button>

                              {isDelivered ? (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl whitespace-nowrap">
                                  Done ✅
                                </span>
                              ) : activeDeliveryId === ord._id ? (
                                <form onSubmit={handleDeliverSubmit} className="flex items-center gap-1">
                                  <label
                                    className="bg-rose-50 hover:bg-rose-100 border border-rose-200 p-1.5 rounded-lg cursor-pointer text-xs font-bold text-primary transition-colors"
                                    title="Attach Proof"
                                  >
                                    <Upload size={13} />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => setProofFile(e.target.files[0])}
                                      className="hidden"
                                    />
                                  </label>
                                  <button
                                    type="submit"
                                    disabled={submittingProof}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase px-2.5 py-1.5 rounded-lg transition-all"
                                  >
                                    {submittingProof ? '...' : 'OK'}
                                  </button>
                                </form>
                              ) : (
                                <button
                                  onClick={() => setActiveDeliveryId(ord._id)}
                                  className="bg-gradient-to-r from-primary to-rose-600 hover:opacity-95 text-white font-black uppercase text-xs px-3 py-1.5 rounded-xl tracking-wider cursor-pointer shadow-xs transition-all flex items-center gap-1 whitespace-nowrap"
                                >
                                  <CheckCircle2 size={13} /> Deliver ⚡
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* CARDS VIEW - RESPONSIVE GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getPaginatedOrders().map((ord) => {
                const shipping = ord.quickOrderId?.shippingAddress || ord.shippingAddress;
                const customer = ord.quickOrderId?.customerId || ord.customerId;
                const vendorName = ord.vendorId?.businessName || ord.vendorId?.name || 'Express Hub Store';
                const itemsList = ord.items || [];
                const grandTotal = ord.total || ord.grandTotal || 0;
                const customerPhone = shipping?.phone || customer?.phone || '';
                const isDelivered = ord.status === 'DELIVERED' || ord.status === 'DELIVERED_SUCCESSFULLY';
                const isStandardOrder = ord._orderSource === 'STANDARD';

                return (
                  <div
                    key={ord._id}
                    className="bg-white border border-slate-200/80 shadow-xs hover:shadow-md rounded-3xl p-5 sm:p-6 transition-all duration-200 text-left space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Order Header Bar */}
                      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            {isStandardOrder ? (
                              <span className="bg-blue-50 text-blue-700 text-[11px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                                📦 Standard
                              </span>
                            ) : (
                              <span className="bg-rose-50 text-primary text-[11px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Zap size={11} className="fill-primary" /> 10-Min Flash
                              </span>
                            )}
                            <span className="text-xs font-mono font-black text-slate-900">
                              #{ord.orderNumber || ord._id?.substring(0, 8)}
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-slate-400 block mt-0.5">
                            📅 {new Date(ord.createdAt || ord.quickOrderId?.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${
                            isDelivered ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            ● {isDelivered ? 'DELIVERED ✅' : (ord.status || 'OUT_FOR_DELIVERY')}
                          </span>
                          <button
                            onClick={() => setSelectedRiderOrderModal(ord)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-primary hover:text-white text-slate-700 transition-all cursor-pointer"
                            title="View Full Order Details"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Pickup & Drop Points */}
                      <div className="space-y-2.5 text-xs">
                        {/* Pickup */}
                        <div className="p-3 bg-slate-50/80 rounded-2xl space-y-1 border border-slate-100">
                          <span className="text-[10px] font-black text-primary uppercase tracking-wider block flex items-center gap-1">
                            <Store size={12} /> PICKUP: {vendorName}
                          </span>
                          {ord.vendorId?.phone && (
                            <a
                              href={`tel:${ord.vendorId.phone}`}
                              className="text-slate-600 font-semibold flex items-center gap-1 hover:text-primary transition-colors text-[11px]"
                            >
                              <Phone size={11} className="text-slate-400" /> Phone: {ord.vendorId.phone}
                            </a>
                          )}
                        </div>

                        {/* Drop */}
                        <div className="p-3 bg-rose-50/40 rounded-2xl space-y-1 border border-rose-100/70">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-primary uppercase tracking-wider block flex items-center gap-1">
                              <MapPin size={12} /> DROP TO: {customer?.name || shipping?.fullName || 'Express Buyer'}
                            </span>
                            {customerPhone && (
                              <a
                                href={`tel:${customerPhone}`}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-md flex items-center gap-1 transition-all"
                              >
                                <Phone size={10} /> Call
                              </a>
                            )}
                          </div>
                          <p className="text-slate-600 font-medium leading-tight text-[11px]">
                            📍 {getFullShippingAddress(shipping, ord.quickOrderId?.addressId || ord.addressId)}
                          </p>
                          <p className="text-[11px] font-bold text-primary">
                            Pincode: {shipping?.pincode || '110039'}
                          </p>
                        </div>
                      </div>

                      {/* Product Preview Checklist */}
                      <div className="p-3 bg-slate-50/60 rounded-2xl border border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Items ({itemsList.length})
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {itemsList.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                              <div className="flex items-center gap-2 min-w-0">
                                {getItemImage(item) ? (
                                  <img
                                    src={getItemImage(item)}
                                    alt={item.productName}
                                    className="w-7 h-7 object-cover rounded-lg border border-slate-200 shrink-0"
                                    onError={handleImageError}
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                    <ShoppingBag size={13} />
                                  </div>
                                )}
                                <span className="font-bold text-slate-800 truncate text-[11px] uppercase">
                                  {item.quantity}x {item.productName}
                                </span>
                              </div>
                              <span className="font-mono font-black text-slate-700 shrink-0 ml-2 text-xs">
                                ₹{(item.finalPrice || item.salesPrice * item.quantity || 0).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Order Action Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Collect Cash</span>
                        <span className="text-sm font-black font-mono text-slate-900">
                          {ord.quickOrderId?.paymentMethod === 'WALLET' || ord.paymentMethod === 'WALLET'
                            ? '₹0.00 (Online Paid)'
                            : `₹${grandTotal.toFixed(2)}`}
                        </span>
                      </div>

                      {isDelivered ? (
                        <div className="bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span>Finished ✅</span>
                        </div>
                      ) : activeDeliveryId === ord._id ? (
                        <form onSubmit={handleDeliverSubmit} className="flex items-center gap-1.5">
                          <label className="bg-rose-50 hover:bg-rose-100 text-primary border border-rose-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer text-xs font-bold transition-colors">
                            <Upload size={13} />
                            <span>{proofFile ? 'Proof Attached ✅' : 'Proof'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setProofFile(e.target.files[0])}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="submit"
                            disabled={submittingProof}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs px-3 py-1.5 rounded-xl tracking-wider cursor-pointer"
                          >
                            {submittingProof ? '...' : 'Finish ✅'}
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => setActiveDeliveryId(ord._id)}
                          className="bg-gradient-to-r from-primary to-rose-600 hover:opacity-95 text-white font-black uppercase text-xs px-4 py-2 rounded-xl tracking-wider cursor-pointer shadow-md shadow-primary/20 flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={14} />
                          <span>Deliver Order ⚡</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TOUCH-FRIENDLY PAGINATION CONTROLS */}
          {getSortedFilteredOrders().length > itemsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-2">
              <span className="text-xs text-slate-500 font-bold">
                Showing <span className="text-slate-900 font-black">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="text-slate-900 font-black">
                  {Math.min(currentPage * itemsPerPage, getSortedFilteredOrders().length)}
                </span>{' '}
                of <span className="text-primary font-black">{getSortedFilteredOrders().length}</span> Orders
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                    currentPage === 1
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-primary'
                  }`}
                >
                  ← Prev
                </button>

                {Array.from({ length: Math.ceil(getSortedFilteredOrders().length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-primary to-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-rose-50 text-slate-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(getSortedFilteredOrders().length / itemsPerPage)))}
                  disabled={currentPage >= Math.ceil(getSortedFilteredOrders().length / itemsPerPage)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                    currentPage >= Math.ceil(getSortedFilteredOrders().length / itemsPerPage)
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-primary'
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto py-5 border-t border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <span>© {new Date().getFullYear()} FashionFever Express Logistics • Rider Partner Console</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Telemetry Gateway Active • 10-Min Flash Delivery System
          </span>
        </div>
      </footer>

      {/* RIDER PROFILE EDIT MODAL */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden my-auto text-left">

            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-rose-400 shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-white m-0">Edit Rider Profile</h3>
                  <p className="text-xs text-slate-300 font-medium m-0">Update your partner details & vehicle credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Full Name*</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Phone Number*</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Vehicle Type & Vehicle Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Vehicle Type*</label>
                  <select
                    value={editVehicleType}
                    onChange={(e) => setEditVehicleType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none transition-all cursor-pointer"
                  >
                    <option value="scooter">Scooter 🛵</option>
                    <option value="motorcycle">Motorcycle 🏍️</option>
                    <option value="bicycle">Bicycle 🚲</option>
                    <option value="electric_scooter">Electric Scooter ⚡</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Vehicle Number*</label>
                  <input
                    type="text"
                    value={editVehicleNumber}
                    onChange={(e) => setEditVehicleNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-2xl px-4 py-2.5 text-xs font-bold font-mono text-slate-800 outline-none transition-all"
                    placeholder="e.g. UP16 AB 1234"
                  />
                </div>
              </div>

              {/* Update Password */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">New Password (Optional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none transition-all"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              {/* Profile Photo Attachment */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Profile Photo</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {profilePhotoFile ? (
                      <img src={URL.createObjectURL(profilePhotoFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : getProfileAvatar() && !avatarError ? (
                      <img src={getProfileAvatar()} alt="Current" className="w-full h-full object-cover" onError={() => setAvatarError(true)} />
                    ) : (
                      <span className="font-black text-slate-400 text-sm">{(editName || riderProfile?.name || 'R').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <label className="bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 cursor-pointer transition-colors flex items-center gap-2">
                    <Upload size={15} />
                    <span>{profilePhotoFile ? 'Change Photo' : 'Choose New Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfilePhotoFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  {profilePhotoFile && (
                    <span className="text-xs text-slate-500 font-medium truncate max-w-[150px]">
                      {profilePhotoFile.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase px-5 py-2.5 rounded-2xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-gradient-to-r from-primary to-rose-600 hover:opacity-95 text-white font-black text-xs uppercase px-6 py-2.5 rounded-2xl shadow-md shadow-primary/20 transition-all cursor-pointer"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RIDER ORDER DETAILS EYE MODAL */}
      {selectedRiderOrderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden my-8 text-left">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-start sm:items-center justify-between gap-3 border-b border-slate-700">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase text-rose-300 tracking-wider block">Express Delivery Details</span>
                <h3 className="text-sm sm:text-base font-black font-mono truncate text-white max-w-[200px] sm:max-w-none">
                  #{selectedRiderOrderModal.orderNumber || selectedRiderOrderModal._id}
                </h3>
                <span className="text-xs text-slate-300 font-medium block mt-0.5">
                  📅 Placed: {new Date(selectedRiderOrderModal.createdAt || selectedRiderOrderModal.quickOrderId?.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="bg-white/10 text-white border border-white/20 text-xs font-bold uppercase px-3 py-1 rounded-full whitespace-nowrap">
                  {selectedRiderOrderModal.status || 'OUT_FOR_DELIVERY'}
                </span>
                <button
                  onClick={() => setSelectedRiderOrderModal(null)}
                  className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Pickup & Destination Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <h4 className="text-xs font-black uppercase text-primary tracking-wider mb-2 flex items-center gap-1.5">
                    <User size={14} className="text-primary" /> ASSIGNED BY VENDOR:
                  </h4>
                  <p className="font-extrabold text-slate-900 text-xs uppercase">
                    {selectedRiderOrderModal.vendorId?.businessName || selectedRiderOrderModal.vendorId?.name || 'Express Hub Store'}
                  </p>
                  {selectedRiderOrderModal.vendorId?.phone && (
                    <a href={`tel:${selectedRiderOrderModal.vendorId.phone}`} className="text-xs text-slate-600 font-semibold mt-1 flex items-center gap-1 hover:text-primary">
                      <Phone size={12} className="text-slate-400" /> Phone: {selectedRiderOrderModal.vendorId.phone}
                    </a>
                  )}
                  {selectedRiderOrderModal.vendorId?.email && (
                    <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                      <Mail size={12} className="text-slate-400" /> {selectedRiderOrderModal.vendorId.email}
                    </p>
                  )}
                </div>

                <div className="bg-rose-50/40 border border-rose-100 p-4 rounded-2xl">
                  <h4 className="text-xs font-black uppercase text-primary tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin size={14} className="text-primary" /> Delivery Destination (Buyer)
                  </h4>
                  {(() => {
                    const shipping = selectedRiderOrderModal.quickOrderId?.shippingAddress || selectedRiderOrderModal.shippingAddress;
                    const customer = selectedRiderOrderModal.quickOrderId?.customerId || selectedRiderOrderModal.customerId;
                    return (
                      <div className="text-xs text-slate-700 font-medium space-y-0.5">
                        <p className="font-bold">{customer?.name || shipping?.fullName || 'Express Buyer'}</p>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
                          📍 {getFullShippingAddress(shipping, selectedRiderOrderModal.quickOrderId?.addressId || selectedRiderOrderModal.addressId)}
                        </p>
                        {shipping?.pincode && (
                          <p className="font-extrabold text-primary flex items-center gap-1 mt-1">
                            <MapPin size={12} /> Pincode: {shipping.pincode}
                          </p>
                        )}
                        {(shipping?.phone || customer?.phone) && (
                          <a href={`tel:${shipping?.phone || customer?.phone}`} className="text-slate-700 font-bold mt-1.5 flex items-center gap-1 hover:text-primary">
                            <Phone size={12} className="text-slate-400" /> Phone: {shipping?.phone || customer?.phone}
                          </a>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Products Table */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                  <Package size={14} className="text-primary" /> Items to Deliver
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-xs font-bold text-slate-500 uppercase">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedRiderOrderModal.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              {getItemImage(item) ? (
                                <img
                                  src={getItemImage(item)}
                                  alt={item.productName}
                                  className="w-10 h-10 object-cover rounded-xl border border-slate-200 shrink-0"
                                  onError={handleImageError}
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs shrink-0">
                                  <ShoppingBag size={16} />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-800 uppercase text-xs">{item.productName}</p>
                                {item.sku && <p className="text-xs font-mono text-slate-400 uppercase">SKU: {item.sku}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center font-bold text-slate-600">{item.quantity}</td>
                          <td className="p-3 text-right font-mono text-slate-600">₹{(item.salesPrice || 0).toFixed(2)}</td>
                          <td className="p-3 text-right font-mono font-black text-slate-900">₹{(item.finalPrice || item.totalPrice || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Payout Summary */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl flex justify-between items-center shadow-md border border-slate-700">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">Total Cash Amount</span>
                  <span className="text-xl font-black font-mono text-white">
                    ₹{(selectedRiderOrderModal.total || selectedRiderOrderModal.grandTotal || 0).toFixed(2)}
                  </span>
                </div>
                <span className="text-xs font-extrabold text-white bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-xl uppercase">
                  {selectedRiderOrderModal.status || 'OUT_FOR_DELIVERY'}
                </span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              {selectedRiderOrderModal.status === 'DELIVERED' || selectedRiderOrderModal.status === 'DELIVERED_SUCCESSFULLY' ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-2.5 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-xs">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Order Completed & Delivered ✅</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setActiveDeliveryId(selectedRiderOrderModal._id);
                  }}
                  className="bg-gradient-to-r from-primary to-rose-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 size={16} /> Deliver Order Now ⚡
                </button>
              )}

              <button
                onClick={() => setSelectedRiderOrderModal(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderFlow;
