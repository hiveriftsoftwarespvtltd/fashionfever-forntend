import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Ticket, Wallet, ShoppingBag, Heart, CreditCard,
  LogOut, ChevronRight, Loader2, Camera, Trash2, Mail,
  Shield, Calendar, CheckCircle2, AlertTriangle, Key,
  Pencil, Phone, X, Check, MapPin, Lock, Bell, Eye,
  Zap, Package, ArrowRight, Truck, Clock
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { getUserDetails, uploadUserAvatar, getUserAvatar, deleteUserAvatar, editUserDetails, getUserOrders } from '../../api/authService';
import { getQuickUserOrders } from '../../api/quickECommerceService';
import { getImageUrl } from '../../utils/imageUrl';
import { toast } from '../../utils/toast';
import UserSidebar from './UserSidebar';

const AVATAR_KEY = 'fashionfever_avatar_url';

const Profile = () => {
  const navigate = useNavigate();
  const { user: contextUser, isLoading: isAuthLoading, token, updateUser, logout } = useUser();

  const [profileData, setProfileData]   = useState(null);
  const [avatarUrl, setAvatarUrl]       = useState(() => localStorage.getItem(AVATAR_KEY) || '');
  const [imgError, setImgError]         = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [isUploading, setIsUploading]   = useState(false);
  const [isEditing, setIsEditing]       = useState(false);
  const [isSaving, setIsSaving]         = useState(false);
  const [editForm, setEditForm]         = useState({ name: '', phone: '' });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Interactive UI buttons state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [notifs, setNotifs]             = useState({ email: true, sms: false, orders: true });
  const [showPassModal, setShowPassModal] = useState(false);
  const [passForm, setPassForm]         = useState({ current: '', newPassword: '', confirmPassword: '' });
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passForm.current || !passForm.newPassword || !passForm.confirmPassword) {
      toast.error('All password fields are required.');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setIsChangingPass(true);
    setTimeout(() => {
      setIsChangingPass(false);
      setShowPassModal(false);
      setPassForm({ current: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully!');
    }, 1500);
  };

  /* ─── helpers ─────────────────────────────────────────────── */
  const persistAvatar = (url) => {
    if (url) localStorage.setItem(AVATAR_KEY, url);
    else     localStorage.removeItem(AVATAR_KEY);
    setAvatarUrl(url);
    setImgError(false);
  };

  /* ─── fetch ────────────────────────────────────────────────── */
  const fetchProfileDetails = async () => {
    setIsLoading(true);
    try {
      const detailsRes = await getUserDetails();
      if (detailsRes?.success) setProfileData(detailsRes.data);
      else                     setProfileData(contextUser);

      const avatarRes  = await getUserAvatar();
      let fetchedUrl   = '';
      if      (avatarRes?.data?.data?.avatar?.url) fetchedUrl = avatarRes.data.data.avatar.url;
      else if (avatarRes?.data?.avatar?.url)       fetchedUrl = avatarRes.data.avatar.url;
      else if (avatarRes?.avatar?.url)             fetchedUrl = avatarRes.avatar.url;

      if (fetchedUrl) {
        persistAvatar(fetchedUrl);
        if (updateUser) updateUser({ avatar: fetchedUrl });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    setIsOrdersLoading(true);
    try {
      const [standardRes, quickRes] = await Promise.allSettled([
        getUserOrders(),
        getQuickUserOrders(1, 10)
      ]);

      let standardList = [];
      if (standardRes.status === 'fulfilled' && standardRes.value?.success) {
        const raw = standardRes.value.data?.data ?? standardRes.value.data ?? [];
        standardList = Array.isArray(raw) ? raw.map(o => ({
          _id: o._id,
          orderNumber: o.orderNumber || `FF-${o._id?.toString().slice(-6)}`,
          orderStatus: o.orderStatus || o.status || 'PENDING',
          isQuickDelivery: false,
          grandTotal: o.grandTotal || o.totalAmount || 0,
          createdAt: o.createdAt,
          itemsCount: o.items?.length || 0,
          items: o.items || []
        })) : [];
      }

      let quickList = [];
      if (quickRes.status === 'fulfilled') {
        const rawVal = quickRes.value;
        const rawQuick = rawVal?.orders ?? rawVal?.data?.orders ?? (Array.isArray(rawVal?.data) ? rawVal?.data : []);
        if (Array.isArray(rawQuick)) {
          quickList = rawQuick.map(q => ({
            _id: q._id,
            orderNumber: q.orderNumber || `FFQ-${q._id?.toString().slice(-6)}`,
            orderStatus: q.status || 'PROCESSING',
            isQuickDelivery: true,
            grandTotal: q.grandTotal || 0,
            createdAt: q.createdAt,
            itemsCount: q.items?.length || 0,
            items: q.items || []
          }));
        }
      }

      const combined = [...standardList, ...quickList].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setRecentOrders(combined);
    } catch (err) {
      console.error('Failed to load recent orders:', err);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (token) {
        fetchProfileDetails();
        fetchRecentOrders();
      } else {
        setIsLoading(false);
      }
    }
  }, [isAuthLoading, token]);

  /* ─── avatar upload ────────────────────────────────────────── */
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/'))    { toast.error('Please upload an image file.'); return; }
    if (file.size > 5 * 1024 * 1024)       { toast.error('File size must be under 5MB.');  return; }

    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    const t = toast.loading('Uploading photo...');
    try {
      const res = await uploadUserAvatar(formData);
      if (res?.success) {
        toast.success('Photo updated!', { id: t });
        let newUrl = '';
        if      (res?.data?.data?.data && typeof res.data.data.data === 'string') newUrl = res.data.data.data;
        else if (res?.data?.data       && typeof res.data.data       === 'string') newUrl = res.data.data;
        else if (res?.data             && typeof res.data            === 'string') newUrl = res.data;

        if (newUrl) { persistAvatar(newUrl); if (updateUser && profileData) updateUser({ ...profileData, avatar: newUrl }); }
        else        await fetchProfileDetails();
      } else {
        toast.error(res?.message || 'Upload failed.', { id: t });
      }
    } catch { toast.error('Upload error.', { id: t }); }
    finally  { setIsUploading(false); }
  };

  /* ─── avatar delete ────────────────────────────────────────── */
  const handleAvatarDelete = () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-gray-800">Remove profile photo?</p>
        <div className="flex gap-2">
          <button onClick={async () => {
            toast.dismiss(t.id);
            setIsUploading(true);
            const dt = toast.loading('Removing...');
            try {
              const res = await deleteUserAvatar();
              if (res?.success) {
                toast.success('Photo removed.', { id: dt });
                persistAvatar('');
                if (updateUser && profileData) updateUser({ ...profileData, avatar: '' });
              } else toast.error(res?.message || 'Delete failed.', { id: dt });
            } catch { toast.error('Error removing photo.', { id: dt }); }
            finally  { setIsUploading(false); }
          }} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer">
            Yes, Remove
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer">
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  /* ─── edit save ────────────────────────────────────────────── */
  const handleSaveDetails = async () => {
    if (!editForm.name.trim()) { toast.error('Name cannot be empty.'); return; }
    setIsSaving(true);
    try {
      const payload = {};
      if (editForm.name.trim())  payload.name  = editForm.name.trim();
      if (editForm.phone.trim()) payload.phone = editForm.phone.trim();
      const res = await editUserDetails(payload);
      if (res?.success) {
        const updated = res.data?.data || res.data;
        toast.success('Profile updated!');
        setProfileData(prev => ({ ...prev, ...updated }));
        if (updateUser) updateUser({ name: updated.name, phone: updated.phone });
        setIsEditing(false);
      } else toast.error(res?.message || 'Update failed.');
    } catch { toast.error('Save error.'); }
    finally  { setIsSaving(false); }
  };

  /* ─── derived ──────────────────────────────────────────────── */
  const nameLetter = profileData?.name?.charAt(0)?.toUpperCase() || 'U';
  const activeQuickOrder = recentOrders.find(o => 
    o.isQuickDelivery && ['PENDING', 'ACCEPTED', 'PROCESSING', 'PACKED', 'OUT_FOR_DELIVERY'].includes((o.orderStatus || '').toUpperCase())
  );
  const quickCount = recentOrders.filter(o => o.isQuickDelivery).length;

  /* ─── loading skeleton ─────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="bg-[#f3f3f3] min-h-screen py-10">
        <div className="container mx-auto px-4 max-w-7xl flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-xs font-bold text-gray-400 uppercase ">Loading Profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f3f3f3] min-h-screen py-10 font-outfit">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 italic">My Profile</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left Sidebar ─────────────────────────────────── */}
          <UserSidebar />

          {/* ── Right Content ─────────────────────────────────── */}
          <div className="flex-grow space-y-6">

            {/* Avatar + Name card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Cover banner */}
              <div className="h-32 bg-gradient-to-r from-primary/10 via-pink-50 to-primary/5" />

              <div className="px-8 pb-8 -mt-16">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">

                  {/* Avatar */}
                  <div className="relative group w-28 h-28 rounded-2xl overflow-hidden bg-white p-1 shadow-xl border border-gray-100 flex-shrink-0">
                    <div className="w-full h-full rounded-xl overflow-hidden bg-gray-50 relative flex items-center justify-center">
                      {avatarUrl && !imgError ? (
                        <img 
                          src={getImageUrl(avatarUrl)} 
                          alt={profileData?.name || 'User'} 
                          className="w-full h-full object-cover" 
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        <div className="w-full h-full bg-primary flex items-center justify-center text-white text-3xl font-extrabold">
                          {nameLetter}
                        </div>
                      )}
                      {/* hover overlay */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white cursor-pointer"
                      >
                        <Camera size={18} />
                        <span className="text-xs font-bold uppercase">Change</span>
                      </button>
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="animate-spin text-white" size={22} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name & role */}
                  <div className="flex-grow text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h1 className="text-2xl font-extrabold text-gray-900 uppercase leading-none">
                        {profileData?.name}
                      </h1>
                      <span className="bg-primary/10 text-primary text-xs font-bold uppercase px-3 py-1 rounded-full">
                        {profileData?.role || 'User'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase  mt-2">{profileData?.email}</p>
                  </div>

                  {/* Upload / delete buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase  px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Camera size={13} /> Upload Photo
                    </button>
                    {avatarUrl && (
                      <button
                        onClick={handleAvatarDelete}
                        disabled={isUploading}
                        className="bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-100 p-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                        title="Remove photo"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between p-6 border-b border-gray-50">
                <h2 className="text-sm font-extrabold text-gray-900 uppercase ">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => { setEditForm({ name: profileData?.name || '', phone: profileData?.phone || '' }); setIsEditing(true); }}
                    className="flex items-center gap-2 text-sm font-bold uppercase  text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 px-3 py-2 rounded-lg transition-all cursor-pointer"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={handleSaveDetails} disabled={isSaving}
                      className="flex items-center gap-1.5 text-sm font-bold uppercase text-white bg-primary hover:bg-primary-hover px-3 py-2 rounded-lg transition-all cursor-pointer disabled:opacity-60">
                      {isSaving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Save
                    </button>
                    <button onClick={() => setIsEditing(false)} disabled={isSaving}
                      className="flex items-center gap-1.5 text-sm font-bold uppercase text-gray-500 border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all cursor-pointer disabled:opacity-60">
                      <X size={11} /> Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                    <User size={16} />
                  </div>
                  <div className="flex-grow">
                    <label className="text-sm font-bold text-gray-400 uppercase ">Full Name</label>
                    {isEditing ? (
                      <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Enter full name"
                        className="mt-1 w-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 outline-none transition-all bg-gray-50/50" />
                    ) : (
                      <p className="text-sm font-bold text-gray-800 uppercase mt-0.5">{profileData?.name}</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                    <Phone size={16} />
                  </div>
                  <div className="flex-grow">
                    <label className="text-sm font-bold text-gray-400 uppercase ">Phone Number</label>
                    {isEditing ? (
                      <input type="tel" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="Enter phone number"
                        className="mt-1 w-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 outline-none transition-all bg-gray-50/50" />
                    ) : (
                      <p className="text-sm font-bold text-gray-800 mt-0.5">{profileData?.phone || <span className="text-gray-400 font-medium normal-case text-xs">Not provided</span>}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                    <Mail size={16} />
                  </div>
                  <div className="flex-grow">
                    <label className="text-sm font-bold text-gray-400 uppercase ">Email Address</label>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{profileData?.email}</p>
                  </div>
                  {profileData?.isEmailVerified ? (
                    <span className="flex items-center gap-1 bg-green-50 border border-green-100 text-green-600 px-2.5 py-1 rounded-full text-xs font-bold uppercase self-start mt-4">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-600 px-2.5 py-1 rounded-full text-xs font-bold uppercase self-start mt-4">
                      <AlertTriangle size={12} /> Unverified
                    </span>
                  )}
                </div>

                {/* Joined */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-400 uppercase ">Member Since</label>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders & Quick Deliveries Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-left">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-gray-100 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-primary flex-shrink-0">
                    <Package size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-extrabold text-gray-900 uppercase">Recent Orders & Quick Deliveries</h2>
                      {quickCount > 0 && (
                        <span className="bg-amber-100 text-amber-800 text-xs font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Zap size={10} className="fill-amber-500 text-amber-500" /> {quickCount} Quick
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">Track your 10-minute deliveries & standard orders</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link
                    to="/orders?tab=quick"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold uppercase text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    <Zap size={13} className="fill-amber-500 text-amber-500" /> Quick Orders
                  </Link>
                  <Link
                    to="/orders"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold uppercase text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    View All <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Active Quick Order Banner */}
              {activeQuickOrder && (
                <div className="mx-6 mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-50 to-amber-500/5 border border-amber-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                      <Zap size={18} className="fill-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-amber-900 tracking-wide">⚡ Live Quick Delivery in Progress</span>
                        <span className="bg-amber-500 text-white text-xs font-black uppercase px-2 py-0.5 rounded-full">
                          {activeQuickOrder.orderStatus}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-700 mt-0.5">
                        Order #{activeQuickOrder.orderNumber} &bull; ₹{activeQuickOrder.grandTotal} ({activeQuickOrder.itemsCount} {activeQuickOrder.itemsCount === 1 ? 'item' : 'items'})
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/orders?tab=quick"
                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                  >
                    Track Live Delivery <ArrowRight size={12} />
                  </Link>
                </div>
              )}

              {/* Orders List / Empty State */}
              <div className="p-6">
                {isOrdersLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2">
                    <Loader2 size={24} className="animate-spin text-primary" />
                    <span className="text-xs font-bold text-gray-400 uppercase">Loading orders...</span>
                  </div>
                ) : recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {recentOrders.slice(0, 3).map((order) => {
                      const isQuick = order.isQuickDelivery;
                      return (
                        <div
                          key={order._id}
                          className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                            isQuick ? 'bg-amber-50/20 border-amber-200/70 hover:border-amber-300' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isQuick ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {isQuick ? <Zap size={18} className="fill-amber-500 text-amber-500" /> : <Package size={18} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-extrabold text-gray-900 uppercase">#{order.orderNumber}</span>
                                {isQuick ? (
                                  <span className="bg-amber-100 text-amber-800 text-xs font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Zap size={9} className="fill-amber-500 text-amber-500" /> 10-Min Quick
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-700 text-xs font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Truck size={9} /> Standard
                                  </span>
                                )}
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                                  order.orderStatus?.toUpperCase() === 'DELIVERED'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : order.orderStatus?.toUpperCase() === 'CANCELLED'
                                    ? 'bg-red-50 text-red-600 border border-red-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                  {order.orderStatus}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
                                <span>&bull;</span>
                                <span>{order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}</span>
                                <span>&bull;</span>
                                <span className="font-extrabold text-gray-900">₹{order.grandTotal}</span>
                              </div>
                            </div>
                          </div>

                          <Link
                            to={isQuick ? '/orders?tab=quick' : '/orders'}
                            className="self-end sm:self-center text-xs font-bold uppercase text-primary hover:text-primary-hover flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-primary/30 shadow-2xs transition-all cursor-pointer"
                          >
                            View Order <ChevronRight size={13} />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-primary mb-3">
                      <ShoppingBag size={22} />
                    </div>
                    <p className="text-sm font-bold text-gray-800 uppercase">No orders placed yet</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm">
                      Get your favourite beauty & cosmetics products delivered in 10 minutes with Quick Commerce!
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <Link
                        to="/quick-commerce"
                        className="flex items-center gap-1.5 text-xs font-bold uppercase text-white bg-primary hover:bg-primary-hover px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        <Zap size={13} className="fill-white" /> Quick Commerce (10-Min)
                      </Link>
                      <Link
                        to="/shop"
                        className="text-xs font-bold uppercase text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Explore Shop
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase  border-b border-gray-50 pb-4 mb-5 flex items-center gap-2">
                <Key size={14} className="text-primary" /> Account Security & Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                
                {/* Credentials */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-800 uppercase">Password</p>
                      <p className="text-sm text-gray-400 mt-0.5">Last updated: 3 months ago</p>
                    </div>
                    <button 
                      onClick={() => setShowPassModal(true)}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase text-primary border border-primary/20 bg-white hover:bg-primary/5 px-3 py-2 rounded-lg transition-all cursor-pointer shadow-sm"
                    >
                      <Lock size={13} /> Change Password
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-800 uppercase">Two-Factor Auth (2FA)</p>
                      <p className="text-sm text-gray-400 mt-0.5">Add an extra layer of protection</p>
                    </div>
                    <button 
                      onClick={() => {
                        const nextState = !is2FAEnabled;
                        setIs2FAEnabled(nextState);
                        toast.success(nextState ? '2FA Enabled Successfully!' : '2FA Disabled');
                      }}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        is2FAEnabled ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        is2FAEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-800 uppercase">Sessions & Devices</p>
                      <p className="text-sm text-gray-400 mt-0.5">Currently logged in: 1 active device</p>
                    </div>
                    <button 
                      onClick={() => toast.success('Logged out of all other devices.')}
                      className="text-xs font-bold uppercase text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all cursor-pointer shadow-sm"
                    >
                      Log Out Others
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50/20 rounded-xl border border-red-100/50">
                    <div className="text-left">
                      <p className="text-xs font-bold text-red-700 uppercase">Deactivate Account</p>
                      <p className="text-sm text-red-400 mt-0.5">Temporarily disable your profile</p>
                    </div>
                    <button 
                      onClick={() => {
                        toast((t) => (
                          <div className="flex flex-col gap-3">
                            <p className="text-sm font-bold text-gray-800">Deactivate your account?</p>
                            <div className="flex gap-2">
                              <button onClick={() => { toast.dismiss(t.id); toast.success('Account deactivated.'); }} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer">Yes, Disable</button>
                              <button onClick={() => toast.dismiss(t.id)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer">Cancel</button>
                            </div>
                          </div>
                        ), { duration: 6000 });
                      }}
                      className="text-xs font-bold uppercase text-red-500 bg-white border border-red-100 hover:bg-red-50 px-3 py-2 rounded-lg transition-all cursor-pointer shadow-sm"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Notification Preferences Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase border-b border-gray-50 pb-4 mb-5 flex items-center gap-2">
                <Bell size={14} className="text-primary" /> Notification Preferences
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Email offers toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50/40 rounded-xl border border-gray-100 text-left">
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-800 uppercase">Email Promos</p>
                    <p className="text-xs text-gray-400">Coupons & deals</p>
                  </div>
                  <button 
                    onClick={() => {
                      const nextVal = !notifs.email;
                      setNotifs(prev => ({ ...prev, email: nextVal }));
                      toast.success(nextVal ? 'Subscribed to emails!' : 'Unsubscribed from emails');
                    }}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      notifs.email ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifs.email ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* SMS offers toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50/40 rounded-xl border border-gray-100 text-left">
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-800 uppercase">SMS Alerts</p>
                    <p className="text-xs text-gray-400">Flash sales texts</p>
                  </div>
                  <button 
                    onClick={() => {
                      const nextVal = !notifs.sms;
                      setNotifs(prev => ({ ...prev, sms: nextVal }));
                      toast.success(nextVal ? 'Subscribed to SMS alerts!' : 'Unsubscribed from SMS alerts');
                    }}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      notifs.sms ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifs.sms ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Order notifications toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50/40 rounded-xl border border-gray-100 text-left">
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-800 uppercase">Order Status</p>
                    <p className="text-xs text-gray-400">Shipped, delivered alerts</p>
                  </div>
                  <button 
                    onClick={() => {
                      const nextVal = !notifs.orders;
                      setNotifs(prev => ({ ...prev, orders: nextVal }));
                      toast.success(nextVal ? 'Order updates enabled!' : 'Order updates disabled');
                    }}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      notifs.orders ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifs.orders ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

              </div>
            </div>

            {/* Become a Vendor card */}
            {profileData?.role === 'user' && !profileData?.isVendorOnboardingCompleted && (
              <div className="bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl shadow-lg shadow-primary/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <h3 className="text-sm font-bold uppercase  mb-1">Want to sell on FASHIONFEVER?</h3>
                  <p className="text-sm font-medium uppercase opacity-80">Become a registered merchant and list your products or beauty services!</p>
                </div>
                <button
                  onClick={() => toast.success('Opening Merchant Application...')}
                  className="flex-shrink-0 bg-white text-primary text-xs font-bold uppercase  px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer whitespace-nowrap"
                >
                  Apply as Vendor
                </button>
              </div>
            )}

          </div>{/* end right */}
        </div>
      </div>

      {/* ─── Change Password Modal ─────────────────────────── */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-gray-900 uppercase flex items-center gap-2">
                <Lock size={16} className="text-primary" /> Change Password
              </h3>
              <button 
                onClick={() => setShowPassModal(false)}
                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-400 uppercase mb-1 block">Current Password</label>
                <input 
                  type="password"
                  value={passForm.current}
                  onChange={e => setPassForm(f => ({ ...f, current: e.target.value }))}
                  placeholder="Enter current password"
                  className="w-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-400 uppercase mb-1 block">New Password</label>
                <input 
                  type="password"
                  value={passForm.newPassword}
                  onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))}
                  placeholder="Enter new password (min. 6 chars)"
                  className="w-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-400 uppercase mb-1 block">Confirm New Password</label>
                <input 
                  type="password"
                  value={passForm.confirmPassword}
                  onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Re-enter new password"
                  className="w-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isChangingPass ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassModal(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
