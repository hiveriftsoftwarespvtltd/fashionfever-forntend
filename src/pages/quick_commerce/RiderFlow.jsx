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
  Package, FileImage, Upload, Compass, Navigation, RefreshCw, Eye, X, Clock, AlertCircle, Mail, Store, ShoppingBag, Edit3, Shield, Award, Calendar, ChevronRight, LayoutList, LayoutGrid
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useUser } from '../../context/UserContext';
import { getImageUrl } from '../../utils/imageUrl';

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
        // Fallback retry with fast network location
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
      } else {
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

      const res = await markOrderDelivered(activeDeliveryId);
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
    if (riderProfile?.profilePhoto?.url) return riderProfile.profilePhoto.url;
    if (riderProfile?.avatar?.url) return riderProfile.avatar.url;
    if (user?.avatar?.url) return user.avatar.url;
    return null;
  };

  return (
    <div className="bg-slate-50/60 min-h-screen p-3 sm:p-6 lg:p-8 text-left space-y-5">

      {/* RIDER APP COMPACT TOP HEADER BAR */}
      <div className="bg-white rounded-2xl p-3.5 sm:px-5 flex items-center justify-between shadow-md border-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-rose-600 flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0">
            ⚡
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-black uppercase text-slate-900 m-0 tracking-wider truncate">
              FashionFever • Rider Dashboard
            </h2>
            <p className="text-xs text-slate-400 font-bold m-0 truncate">10-Min Flash Delivery Partner Console</p>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem('user_session');
            window.location.href = '/auth';
          }}
          className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-extrabold text-xs uppercase px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs shrink-0 ml-2"
        >
          Logout / Exit 🚪
        </button>
      </div>

      {/* ROW 1: HALF-HALF (50% / 50%) GRID FOR RIDER PROFILE & DUTY TELEMETRY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">

        {/* CARD 1 (50% Width): RIDER PROFILE CARD */}
        <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 flex flex-col justify-between gap-4 relative overflow-hidden border-0">
          <div>
            <div className="flex flex-row items-center justify-between gap-3 mb-4">
              {/* Rider Avatar & Info */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  {getProfileAvatar() ? (
                    <img
                      src={getProfileAvatar()}
                      alt="Rider Avatar"
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-primary to-rose-500 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-md">
                      {(riderProfile?.name || user?.name || 'R').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${status === 'AVAILABLE' ? 'bg-emerald-500' :
                      status === 'ON_DELIVERY' ? 'bg-amber-500' :
                        status === 'BREAK' ? 'bg-blue-500' : 'bg-slate-400'
                    }`} title={`Status: ${status}`}>
                    <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <span className="bg-rose-50 text-primary text-xs font-black uppercase px-2.5 py-1 rounded-md flex items-center gap-1 shadow-2xs">
                      <Zap size={11} className="fill-primary" /> Express Partner
                    </span>
                    <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-md shadow-2xs ${status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700' :
                        status === 'ON_DELIVERY' ? 'bg-amber-50 text-amber-700' :
                          status === 'BREAK' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                      ● {status === 'AVAILABLE' ? 'ONLINE' : status === 'ON_DELIVERY' ? 'BUSY' : status}
                    </span>
                  </div>

                  <h1 className="text-base sm:text-lg font-black text-slate-900 truncate">
                    {riderProfile?.name || user?.name || 'Express Rider'}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 font-semibold mt-0.5">
                    <span className="flex items-center gap-1">
                      <Phone size={12} className="text-slate-400" />
                      {riderProfile?.phone || user?.phone || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck size={12} className="text-slate-400" />
                      <span className="uppercase font-bold text-slate-700">{riderProfile?.vehicleType || 'Scooter'}</span>
                      {riderProfile?.vehicleNumber && <span className="font-mono text-slate-500">({riderProfile.vehicleNumber})</span>}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowEditProfileModal(true)}
              className="w-full bg-gradient-to-r from-primary via-rose-600 to-[#b50157] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider py-3 rounded-xl shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Edit3 size={15} />
              <span>Edit Rider Profile</span>
            </button>
          </div>

          {/* Performance Metrics Row */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div className="bg-slate-50/80 rounded-xl p-3 text-left shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Total Delivered</span>
              <span className="text-base font-black font-mono text-slate-800">
                {riderProfile?.totalDeliveredOrders || 0} Orders
              </span>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-3 text-left shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Avg Turnaround</span>
              <span className="text-base font-black font-mono text-primary flex items-center gap-1">
                <Clock size={14} /> {riderProfile?.avgDeliveryTimeInMinutes || 10} Mins
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2 (50% Width): DUTY TELEMETRY CONSOLE */}
        <div className="bg-gradient-to-r from-primary via-rose-600 to-[#b50157] text-white rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-lg border-0 flex flex-col justify-between gap-4">
          <div className="absolute top-4 right-4 bg-white/20 p-2 rounded-xl text-white">
            <Compass className="animate-spin" size={18} style={{ animationDuration: '6s' }} />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-rose-100 block mb-0.5">
              Duty Telemetry Console
            </span>
            <h2 className="text-sm sm:text-base font-black text-white truncate mb-3 flex items-center gap-2">
              <Truck size={16} />
              <span>Duty & GPS Control</span>
            </h2>

            <div className="space-y-3 text-xs font-semibold">
              {/* Status Select */}
              <div className="flex flex-col gap-1">
                <label className="text-rose-100 uppercase text-xs tracking-wider font-bold">Duty Status Switcher</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-md rounded-xl px-3 py-2.5 outline-none font-bold text-white text-xs cursor-pointer border-0 shadow-inner"
                >
                  <option className="text-slate-900 font-bold" value="AVAILABLE">🟢 ONLINE / AVAILABLE</option>
                  <option className="text-slate-900 font-bold" value="ON_DELIVERY">🟡 IN-TRANSIT / BUSY</option>
                  <option className="text-slate-900 font-bold" value="BREAK">🔵 ON BREAK</option>
                  <option className="text-slate-900 font-bold" value="OFFLINE">⚪ OFFLINE</option>
                </select>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-0.5">
                  <label className="text-rose-100 uppercase text-xs tracking-wider font-bold">Longitude (X)</label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full bg-white/20 backdrop-blur-md rounded-xl px-3 py-2 outline-none font-mono font-bold text-white text-xs border-0"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-rose-100 uppercase text-xs tracking-wider font-bold">Latitude (Y)</label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full bg-white/20 backdrop-blur-md rounded-xl px-3 py-2 outline-none font-mono font-bold text-white text-xs border-0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-white/20">
            <button
              onClick={handleDetectGPS}
              disabled={detectingLocation}
              className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-xs border-0"
            >
              <MapPin size={13} />
              <span>{detectingLocation ? 'Locating...' : 'Detect GPS'}</span>
            </button>

            <button
              onClick={handleUpdateStatusAndGPS}
              className="w-full bg-white hover:bg-rose-50 text-primary py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md border-0"
            >
              <Navigation size={13} className="fill-primary" />
              <span>Sync Duty</span>
            </button>
          </div>
        </div>
      </div>

      {/* ROW 2: FULL SCREEN 100% WIDTH FOR EXPRESS DELIVERY QUEUE TABLE */}
      <div className="w-full flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md border-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-primary font-black shrink-0 shadow-2xs">
              <Truck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 m-0">
                Express Delivery Queue
              </h3>
              <p className="text-xs text-slate-400 font-medium m-0">
                {assignedOrders.length} Total Assigned Order{assignedOrders.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl shadow-2xs">
              <button
                onClick={() => handleTabChange('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${queueTab === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                All ({assignedOrders.length})
              </button>
              <button
                onClick={() => handleTabChange('PENDING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${queueTab === 'PENDING' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Active ({assignedOrders.filter(o => o.status !== 'DELIVERED' && o.orderStatus !== 'delivered').length})
              </button>
              <button
                onClick={() => handleTabChange('DELIVERED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${queueTab === 'DELIVERED' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Delivered ({assignedOrders.filter(o => o.status === 'DELIVERED' || o.orderStatus === 'delivered').length})
              </button>
            </div>

            {/* View Switcher (Table vs Cards) */}
            <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-2xl shadow-2xs">
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 px-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                title="Table View"
              >
                <LayoutList size={14} />
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewMode('CARDS')}
                className={`p-1.5 px-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${viewMode === 'CARDS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                title="Cards View"
              >
                <LayoutGrid size={14} />
                <span>Cards</span>
              </button>
            </div>

            <button
              onClick={fetchAssignedOrders}
              className="p-2 rounded-xl bg-white hover:bg-rose-50 text-primary transition-all cursor-pointer shadow-xs border-0"
              title="Refresh List"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl py-16 flex flex-col items-center justify-center gap-2 shadow-md border-0">
            <RefreshCw className="animate-spin text-primary" size={32} />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fetching Assigned Orders...</span>
          </div>
        ) : getSortedFilteredOrders().length === 0 ? (
          <div className="bg-white text-center py-16 sm:py-20 rounded-2xl shadow-md p-6 border-0">
            <CheckCircle2 className="mx-auto mb-3 text-emerald-500 stroke-[1.5]" size={52} />
            <h4 className="text-base font-black uppercase text-slate-800 tracking-wider">No Orders Found!</h4>
            <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto mt-1 leading-relaxed">
              {queueTab === 'PENDING' ? 'No pending active deliveries right now. You are all caught up!' :
                queueTab === 'DELIVERED' ? 'No completed orders in history yet.' :
                  'No active orders assigned right now. Keep your duty status ONLINE.'}
            </p>
          </div>
        ) : viewMode === 'TABLE' ? (
          /* TABLE VIEW */
          <div>
            <div className="md:hidden flex items-center justify-between text-xs font-bold text-rose-600 bg-rose-50/80 rounded-xl px-3 py-1.5 mb-2.5 shadow-2xs">
              <span>📱 Mobile Touch View</span>
              <span>👈 Swipe table horizontally 👉</span>
            </div>
            <div className="overflow-x-auto rounded-2xl shadow-md bg-white border-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 pl-5">Order ID & Date</th>
                    <th className="p-3.5">Pickup Store</th>
                    <th className="p-3.5">Delivery Address (Buyer)</th>
                    <th className="p-3.5">Products to Deliver</th>
                    <th className="p-3.5 text-right">Collect Cash</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 pr-5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getPaginatedOrders().map((ord) => {
                    const shipping = ord.quickOrderId?.shippingAddress || ord.shippingAddress;
                    const customer = ord.quickOrderId?.customerId || ord.userId || ord.customerId;
                    const vendorName = ord.vendorId?.businessName || ord.vendorId?.name || 'Express Cosmetics Store';
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
                            <span className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold uppercase px-2.5 py-0.5 rounded-md inline-flex items-center gap-1 mb-1">
                              📦 Standard
                            </span>
                          ) : (
                            <span className="bg-rose-50 text-primary border border-rose-100 text-xs font-bold uppercase px-2.5 py-0.5 rounded-md inline-flex items-center gap-1 mb-1">
                              <Zap size={11} className="fill-primary" /> Express
                            </span>
                          )}
                          <p className="font-mono font-black text-slate-900 text-xs">#{ord.orderNumber || ord._id?.substring(0, 8)}</p>
                          <p className="text-xs font-medium text-slate-400 mt-0.5">
                            📅 {new Date(ord.createdAt || ord.quickOrderId?.createdAt).toLocaleString()}
                          </p>
                          {isStandardOrder && (
                            <p className="text-[10px] font-extrabold text-blue-600 mt-0.5 flex items-center gap-1">
                              🚚 Target: {ord.estimatedDeliveryDate ? new Date(ord.estimatedDeliveryDate).toLocaleDateString() : new Date(new Date(ord.createdAt || Date.now()).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </p>
                          )}
                        </td>

                        {/* 2. Pickup Store */}
                        <td className="p-3.5 align-top min-w-[130px]">
                          <p className="font-extrabold text-slate-900 text-xs uppercase">{vendorName}</p>
                          {ord.vendorId?.phone && (
                            <a href={`tel:${ord.vendorId.phone}`} className="text-xs text-slate-600 font-semibold flex items-center gap-1 hover:text-primary transition-colors mt-1">
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
                              <a href={`tel:${customerPhone}`} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 shadow-xs">
                                <Phone size={11} /> Call Buyer
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
                                  <img src={getItemImage(item)} alt={item.productName} className="w-7 h-7 object-cover rounded-lg border border-slate-200 shrink-0" />
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
                              <span className="text-xs font-semibold text-slate-400 uppercase block">
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
                          <span className="text-xs font-bold text-slate-400 block uppercase mt-0.5">
                            {ord.quickOrderId?.paymentMethod === 'WALLET' || ord.paymentMethod === 'WALLET' ? 'ONLINE/WALLET' : 'COLLECT CASH'}
                          </span>
                        </td>

                        {/* 6. Status */}
                        <td className="p-3.5 align-top text-center min-w-[110px]">
                          <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border inline-block whitespace-nowrap ${isDelivered
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
                              className="p-2 rounded-xl bg-slate-100 hover:bg-primary hover:text-white text-slate-700 transition-all cursor-pointer shadow-xs"
                              title="View Full Details"
                            >
                              <Eye size={15} />
                            </button>

                            {isDelivered ? (
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl whitespace-nowrap">
                                Finished ✅
                              </span>
                            ) : activeDeliveryId === ord._id ? (
                              <form onSubmit={handleDeliverSubmit} className="flex items-center gap-1">
                                <label className="bg-rose-50 hover:bg-rose-100 border border-rose-200 p-1.5 rounded-lg cursor-pointer text-xs font-bold text-primary transition-colors" title="Attach Proof">
                                  <Upload size={13} />
                                  <input type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files[0])} className="hidden" />
                                </label>
                                <button type="submit" disabled={submittingProof} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase px-2 py-1.5 rounded-lg transition-all">
                                  {submittingProof ? '...' : 'OK'}
                                </button>
                              </form>
                            ) : (
                              <button
                                onClick={() => setActiveDeliveryId(ord._id)}
                                className="bg-gradient-to-r from-primary via-rose-600 to-[#b50157] hover:opacity-95 text-white font-bold uppercase text-xs px-3 py-2 rounded-xl tracking-wider cursor-pointer shadow-xs transition-all flex items-center gap-1 whitespace-nowrap"
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
          /* CARDS VIEW */
          <div className="flex flex-col gap-4">
            {getPaginatedOrders().map((ord) => {
              const shipping = ord.quickOrderId?.shippingAddress || ord.shippingAddress;
              const customer = ord.quickOrderId?.customerId || ord.customerId;
              const vendorName = ord.vendorId?.businessName || ord.vendorId?.name || 'Express Cosmetics Store';
              const itemsList = ord.items || [];
              const grandTotal = ord.total || ord.grandTotal || 0;
              const customerPhone = shipping?.phone || customer?.phone || '';
              const isDelivered = ord.status === 'DELIVERED' || ord.status === 'DELIVERED_SUCCESSFULLY';

              return (
                <div
                  key={ord._id}
                  className="bg-white border-0 shadow-md rounded-2xl p-5 sm:p-6 transition-all duration-200 text-left space-y-4"
                >
                  {/* Order Header Bar */}
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3.5 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {isStandardOrder ? (
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                            📦 Standard Delivery
                          </span>
                        ) : (
                          <span className="bg-rose-50 text-primary text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                            <Zap size={11} className="fill-primary" /> 10-Min Express
                          </span>
                        )}
                        <span className="text-xs font-mono font-black text-slate-900">
                          #{ord.orderNumber || ord._id?.substring(0, 8)}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-400 block mt-1">
                        📅 {new Date(ord.createdAt || ord.quickOrderId?.createdAt).toLocaleString()}
                      </span>
                      {isStandardOrder && (
                        <span className="text-[10px] font-extrabold text-blue-600 block mt-0.5">
                          🚚 Target: {ord.estimatedDeliveryDate ? new Date(ord.estimatedDeliveryDate).toLocaleDateString() : new Date(new Date(ord.createdAt || Date.now()).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full shadow-2xs ${isDelivered
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                        }`}>
                        ● {isDelivered ? 'DELIVERED ✅' : (ord.status || 'OUT_FOR_DELIVERY')}
                      </span>
                      <button
                        onClick={() => setSelectedRiderOrderModal(ord)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-primary hover:text-white text-slate-700 border-0 transition-all cursor-pointer shadow-xs"
                        title="View Full Order Details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Vendor Pickup & Customer Destination Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Vendor Store */}
                    <div className="bg-slate-50/80 border-0 p-4 rounded-2xl space-y-1.5 shadow-2xs">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider block flex items-center gap-1">
                        <Store size={13} /> PICKUP FROM STORE
                      </span>
                      <p className="font-extrabold text-slate-900 text-xs uppercase">{vendorName}</p>
                      {ord.vendorId?.phone && (
                        <a
                          href={`tel:${ord.vendorId.phone}`}
                          className="text-xs text-slate-600 font-semibold flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <Phone size={12} className="text-slate-400" /> Phone: {ord.vendorId.phone}
                        </a>
                      )}
                      {ord.vendorId?.email && (
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Mail size={11} className="text-slate-400" /> {ord.vendorId.email}
                        </p>
                      )}
                    </div>

                    {/* Customer Destination */}
                    <div className="bg-rose-50/40 border-0 p-4 rounded-2xl space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider block flex items-center gap-1">
                          <MapPin size={13} /> DELIVER TO BUYER
                        </span>
                        {customerPhone && (
                          <a
                            href={`tel:${customerPhone}`}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all shadow-xs"
                          >
                            <Phone size={11} /> Call Buyer
                          </a>
                        )}
                      </div>

                      <p className="font-extrabold text-slate-900 text-xs uppercase">
                        {customer?.name || shipping?.fullName || 'Express Buyer'}
                      </p>
                      <p className="text-xs text-slate-600 font-medium leading-tight">
                        📍 {getFullShippingAddress(shipping, ord.quickOrderId?.addressId || ord.addressId)}
                      </p>
                      <p className="text-xs font-bold text-primary flex items-center gap-1">
                        <MapPin size={12} /> Pincode: {shipping?.pincode || '110039'}
                      </p>
                    </div>
                  </div>

                  {/* Product Checklist */}
                  <div className="bg-slate-50/60 p-3.5 rounded-2xl border-0 shadow-2xs">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      📦 Items to Deliver ({itemsList.length})
                    </span>
                    <div className="flex flex-col gap-2">
                      {itemsList.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {getItemImage(item) ? (
                              <img
                                src={getItemImage(item)}
                                alt={item.productName}
                                className="w-9 h-9 object-cover rounded-xl border-0 shadow-xs shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-slate-100 border-0 flex items-center justify-center text-xs shrink-0 text-slate-400 shadow-2xs">
                                <ShoppingBag size={15} />
                              </div>
                            )}
                            <span className="font-bold text-slate-800 truncate uppercase text-xs">
                              {item.quantity}x {item.productName}
                            </span>
                          </div>
                          <span className="font-mono font-black text-slate-700 shrink-0 ml-2">
                            ₹{(item.finalPrice || item.salesPrice * item.quantity || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Action Footer */}
                  <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Collect Cash</span>
                        <span className="text-base font-black font-mono text-slate-900">
                          {ord.quickOrderId?.paymentMethod === 'WALLET' || ord.paymentMethod === 'WALLET'
                            ? '₹0.00 (Paid Online/Wallet)'
                            : `₹${grandTotal.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="border-l border-slate-200 pl-4">
                        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">Target Time</span>
                        <span className="text-xs font-bold text-primary flex items-center gap-1">
                          <Clock size={13} /> ⚡ Within 10 Mins
                        </span>
                      </div>
                    </div>

                    {isDelivered ? (
                      <div className="bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-2xs">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>Order Delivered & Completed ✅</span>
                      </div>
                    ) : activeDeliveryId === ord._id ? (
                      <form onSubmit={handleDeliverSubmit} className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                        <label className="bg-rose-50 hover:bg-rose-100 text-primary border-0 px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer text-xs font-bold transition-colors w-full sm:w-auto justify-center shadow-xs">
                          <Upload size={15} />
                          <span>{proofFile ? 'Proof Attached ✅' : 'Upload Delivery Proof 📸'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProofFile(e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            type="submit"
                            disabled={submittingProof}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs px-5 py-2.5 rounded-xl tracking-wider cursor-pointer flex-1 sm:flex-initial transition-all shadow-md"
                          >
                            {submittingProof ? 'Completing...' : 'Finish ✅'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDeliveryId(null);
                              setProofFile(null);
                            }}
                            className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold uppercase text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setActiveDeliveryId(ord._id)}
                        className="bg-gradient-to-r from-primary via-rose-600 to-[#b50157] hover:opacity-95 text-white font-black uppercase text-xs px-6 py-3 rounded-2xl tracking-wider cursor-pointer shadow-lg shadow-primary/20 flex items-center gap-2 w-full sm:w-auto justify-center transition-all"
                      >
                        <CheckCircle2 size={16} />
                        <span>Deliver & Complete Order ⚡</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TOUCH-FRIENDLY PAGINATION CONTROLS (5 Entries Per Page) */}
        {getSortedFilteredOrders().length > itemsPerPage && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:px-5 rounded-2xl shadow-md border-0 mt-1">
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer shadow-xs ${currentPage === 1
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
                  className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${currentPage === page
                      ? 'bg-gradient-to-r from-primary via-rose-600 to-[#b50157] text-white shadow-md'
                      : 'bg-slate-100 hover:bg-rose-50 text-slate-700'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(getSortedFilteredOrders().length / itemsPerPage)))}
                disabled={currentPage >= Math.ceil(getSortedFilteredOrders().length / itemsPerPage)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer shadow-xs ${currentPage >= Math.ceil(getSortedFilteredOrders().length / itemsPerPage)
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-primary'
                  }`}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIDER PROFILE EDIT MODAL */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden my-auto text-left">

            {/* Header */}
            <div className="bg-gradient-to-r from-primary via-rose-600 to-[#b50157] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-white m-0">Edit Rider Profile</h3>
                  <p className="text-xs text-rose-100 font-medium m-0">Update your partner details & vehicle credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="p-1.5 hover:bg-white/20 rounded-full text-white/90 hover:text-white transition-colors cursor-pointer"
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
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Phone Number*</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 outline-none transition-all"
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
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 outline-none transition-all cursor-pointer"
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
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-2xl px-4 py-3 text-xs font-bold font-mono text-slate-800 outline-none transition-all"
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 outline-none transition-all"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              {/* Profile Photo Attachment */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Profile Photo</label>
                <div className="flex items-center gap-3">
                  <label className="bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 cursor-pointer transition-colors flex items-center gap-2">
                    <Upload size={15} />
                    <span>{profilePhotoFile ? 'Photo Selected ✅' : 'Choose New Photo'}</span>
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
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase px-5 py-3 rounded-2xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-gradient-to-r from-primary via-rose-600 to-[#b50157] text-white font-black text-xs uppercase px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all cursor-pointer"
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
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden my-8 text-left">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary via-rose-600 to-[#b50157] text-white p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold uppercase text-rose-100 tracking-wider block">Express Delivery Order Details</span>
                <h3 className="text-xs sm:text-base font-black font-mono truncate text-white max-w-[180px] sm:max-w-none">
                  #{selectedRiderOrderModal._id}
                </h3>
                <span className="text-xs text-rose-100 font-semibold block mt-0.5">
                  📅 Placed: {new Date(selectedRiderOrderModal.createdAt || selectedRiderOrderModal.quickOrderId?.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="bg-white/20 text-white border border-white/30 text-xs font-bold uppercase px-3 py-1 rounded-full whitespace-nowrap">
                  {selectedRiderOrderModal.status || 'OUT_FOR_DELIVERY'}
                </span>
                <button
                  onClick={() => setSelectedRiderOrderModal(null)}
                  className="p-1.5 hover:bg-white/20 rounded-full text-white/90 hover:text-white transition-colors cursor-pointer flex-shrink-0"
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
              <div className="bg-gradient-to-r from-primary via-rose-600 to-[#b50157] text-white p-4 rounded-2xl flex justify-between items-center shadow-md">
                <div>
                  <span className="text-xs font-semibold text-rose-100 uppercase tracking-widest block">Total Cash Amount</span>
                  <span className="text-xl font-black font-mono">
                    ₹{(selectedRiderOrderModal.total || selectedRiderOrderModal.grandTotal || 0).toFixed(2)}
                  </span>
                </div>
                <span className="text-xs font-extrabold text-white bg-white/20 border border-white/30 px-3.5 py-1.5 rounded-xl uppercase">
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
                  className="bg-gradient-to-r from-primary via-rose-600 to-[#b50157] text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 size={16} /> Deliver Order Now ⚡
                </button>
              )}

              <button
                onClick={() => setSelectedRiderOrderModal(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-3 rounded-2xl text-xs font-bold uppercase transition-colors cursor-pointer"
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
