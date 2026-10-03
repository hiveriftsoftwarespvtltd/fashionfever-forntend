import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, ShoppingBag, Menu, ChevronDown, ChevronRight, Wallet, User, LogOut, 
  Settings, UserCircle, X, Heart, LayoutDashboard, Bookmark, Bell, 
  Loader2, Smartphone, MapPin, Gift, HelpCircle, Zap
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSearch } from '../context/SearchContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useWallet } from '../context/WalletContext';
import CartDrawer from './CartDrawer';
import { getMyNotifications, markNotificationRead } from '../api/notificationService';
import { toast } from '../utils/toast';
import feverlogo from '../assets/feverlogo.png';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getMyNotifications(1, 10);
      if (res?.success) {
        const list = res.data?.data ?? res.data ?? [];
        setNotifications(list);
        const unread = list.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await markNotificationRead(id);
      if (res?.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    if (unreadNotifications.length === 0) return;

    try {
      await Promise.all(unreadNotifications.map(n => markNotificationRead(n._id)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative flex items-center shrink-0" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        className="text-[#3f414d] hover:text-primary transition-colors p-1.5 relative flex items-center justify-center cursor-pointer"
        title="Notifications"
      >
        <Bell size={18} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 bg-white shadow-2xl rounded-2xl border border-gray-100 w-80 max-h-[400px] overflow-hidden flex flex-col z-[1000] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-150 flex items-center justify-between bg-gray-50/50">
            <span className="text-xs font-black uppercase tracking-wider text-gray-800">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[9px] font-black uppercase tracking-wider text-primary hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="flex-grow overflow-y-auto divide-y divide-gray-55 scrollbar-thin">
            {loading && notifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-primary" size={20} />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Bell className="mx-auto mb-2 text-gray-300 stroke-[1.5]" size={28} />
                <p className="text-[10px] font-bold uppercase tracking-wider">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleMarkAsRead(n._id)}
                  className={`p-4 text-left transition-colors cursor-pointer flex gap-3 ${n.isRead ? 'hover:bg-gray-50/60' : 'bg-primary/5 hover:bg-primary/10'}`}
                >
                  <div className="flex-grow space-y-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-[11px] font-extrabold text-gray-800 uppercase truncate">
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 font-semibold leading-relaxed break-words">
                      {n.body}
                    </p>
                    <span className="text-[8px] text-gray-450 font-bold uppercase block mt-1">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const getDashboardLink = (user) => {
  if (!user) return null;
  const roles = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
  const activeRole = roles.find(r => r && String(r).toLowerCase() !== 'user') || user.role || 'user';
  const role = String(activeRole).toLowerCase();

  if (role === 'admin' || role === 'super_admin') {
    return { path: '/admin?tab=dashboard', label: 'Admin Panel' };
  }
  if (role === 'vendor') {
    return { path: '/vendor/dashboard', label: 'Vendor Dashboard' };
  }
  if (role === 'service_provider') {
    return { path: '/service-provider/panel', label: 'Service Provider Panel' };
  }
  if (role === 'educator' || role === 'tutor') {
    return { path: '/educator/onboard', label: 'Educator Portal' };
  }
  if (role === 'influencer') {
    return { path: user.influencerId || user.influencer ? '/influencer/dashboard' : '/influencer/register', label: 'Influencer Portal' };
  }
  if (role === 'delivery_person' || role === 'rider' || role === 'driver') {
    return { path: '/quick-commerce/rider', label: 'Rider Portal' };
  }
  if (role === 'distributor') {
    return { path: '/distributor/dashboard', label: 'Distributor Portal' };
  }
  return null;
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const { searchQuery, setSearchQuery } = useSearch();
  const { cart } = useCart();

  const isQuickCommPage = location.pathname.startsWith('/quick-commerce');
  const activeCartCount = isQuickCommPage
    ? cart.filter(item => item.isQuickDelivery).reduce((acc, item) => acc + item.qty, 0)
    : cart.filter(item => !item.isQuickDelivery).reduce((acc, item) => acc + item.qty, 0);

  const { wishlistCount } = useWishlist();
  const { balanceData } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-[100] bg-white w-full shadow-xs">
      
      {/* ─── DESKTOP TOP BAR (Row 1) ─── */}
      <div className="bg-white border-b border-gray-150 hidden lg:block w-full">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-[108px] gap-4">
            
            {/* Top Left Utility Links */}
            <div className="flex items-center gap-3 xl:gap-5 text-gray-800 text-[12px] font-bold whitespace-nowrap shrink-0">
              <Link to="/get-app" className="flex items-center gap-1.5 hover:text-primary transition-colors whitespace-nowrap shrink-0">
                <Smartphone size={16} className="text-gray-700 stroke-[1.8] shrink-0" />
                <span className="whitespace-nowrap">Get App</span>
              </Link>
              <Link to="/stores" className="flex items-center gap-1.5 hover:text-primary transition-colors whitespace-nowrap shrink-0">
                <MapPin size={16} className="text-gray-700 stroke-[1.8] shrink-0" />
                <span className="whitespace-nowrap">Store & Events</span>
              </Link>
              <Link to="/coupons" className="flex items-center gap-1.5 hover:text-primary transition-colors whitespace-nowrap shrink-0">
                <Gift size={16} className="text-gray-700 stroke-[1.8] shrink-0" />
                <span className="whitespace-nowrap">Gift Card</span>
              </Link>
              <Link to="/help" className="flex items-center gap-1.5 hover:text-primary transition-colors whitespace-nowrap shrink-0">
                <HelpCircle size={16} className="text-gray-700 stroke-[1.8] shrink-0" />
                <span className="whitespace-nowrap">Help</span>
              </Link>
            </div>

            {/* Top Center Brand Logo Image (feverlogo.png) */}
            <Link to="/" className="flex flex-col items-center justify-center text-center group py-1 shrink-0 px-2">
              <img 
                src={feverlogo} 
                alt="Fashion Fever - " 
                className="h-14 sm:h-16 md:h-20 lg:h-24 xl:h-28 2xl:h-32 max-h-[120px] w-auto object-contain hover:opacity-90 transition-opacity" 
              />
            </Link>

            {/* Top Right Quick Delivery, Search, Bell, Wishlist, Profile & Shopping Bag */}
            <div className="flex items-center gap-2.5 xl:gap-3.5 whitespace-nowrap shrink-0">
              
              {/* Quick Delivery */}
              <Link 
                to="/quick-commerce" 
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50/80 border border-amber-200/80 text-amber-900 text-[11px] font-bold hover:bg-amber-100 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <Zap size={13} className="text-amber-500 fill-amber-500 shrink-0" />
                <span className="whitespace-nowrap">Quick Delivery</span>
                <span className="text-amber-500 shrink-0">⚡</span>
              </Link>

              {/* Search Pill Input */}
              <div className="relative w-36 xl:w-48 shrink-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-[#f4f4f4] border border-gray-200 rounded-full h-[38px] pl-3 pr-8 text-[12px] font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:border-primary focus:bg-white transition-all"
                />
                <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors cursor-pointer">
                  <Search size={15} strokeWidth={2} />
                </button>
              </div>

              {/* Notification Bell */}
              <NotificationBell />

              {/* Wishlist Button */}
              <Link
                to="/wishlist"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50/80 hover:bg-rose-100 border border-rose-200/80 text-[11px] font-extrabold text-rose-600 transition-all shadow-2xs relative cursor-pointer whitespace-nowrap shrink-0"
                title="View Wishlist"
              >
                <Heart size={15} className="text-[#ff4d6d] fill-rose-50 stroke-[2] shrink-0" />
                <span className="whitespace-nowrap">Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="bg-[#ff4d6d] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs shrink-0">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* User Account / Profile Button */}
              {user ? (
                <div className="flex items-center gap-2 shrink-0">
                  {user.role === 'user' && (
                    <Link
                      to="/wallet"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-xl text-[11px] font-bold text-gray-700 hover:text-primary transition-all whitespace-nowrap shrink-0"
                      title="Wallet Balance"
                    >
                      <Wallet size={13} className="text-primary shrink-0" />
                      <span className="whitespace-nowrap">₹{balanceData.balance?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    </Link>
                  )}

                  <div className="relative group shrink-0">
                    <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f4f4f4] hover:bg-gray-200 transition-all text-[11px] font-bold text-gray-800 border border-gray-200/80 cursor-pointer whitespace-nowrap shrink-0">
                      {user.avatar ? (
                        <img
                          src={typeof user.avatar === 'string' ? user.avatar : (user.avatar.url || '')}
                          alt={user.name}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <User size={14} className="text-gray-700 shrink-0" />
                      )}
                      <span className="max-w-[80px] truncate whitespace-nowrap">{user.name?.split(' ')[0]}</span>
                      <ChevronDown size={12} className="text-gray-500 shrink-0" />
                    </button>

                    {/* Profile Dropdown Menu */}
                    <div className="absolute top-full right-0 pt-1 w-64 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[500]">
                      <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 p-2 relative before:content-[''] before:absolute before:-top-2 before:right-6 before:w-3.5 before:h-3.5 before:bg-white before:rotate-45 before:border-l before:border-t before:border-gray-100">
                        <div className="flex flex-col gap-1 text-left relative z-10 bg-white rounded-xl overflow-hidden">
                          <div className="px-4 py-3 bg-gray-50/70 border-b border-gray-100">
                            <p className="text-xs font-bold text-gray-800 uppercase truncate">{user.name}</p>
                            <p className="text-[10px] font-semibold text-gray-400 truncate mt-0.5">{user.email}</p>
                          </div>

                          <div className="p-1.5 flex flex-col gap-0.5">
                            {(() => {
                              const dashInfo = getDashboardLink(user);
                              return dashInfo ? (
                                <Link to={dashInfo.path} className="flex items-center gap-3 px-3 py-2 bg-primary/5 hover:bg-primary/10 rounded-xl text-xs font-bold text-primary transition-all">
                                  <LayoutDashboard size={15} /> {dashInfo.label}
                                </Link>
                              ) : null;
                            })()}
                            <Link to="/profile" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 hover:text-primary transition-all">
                              <User size={15} /> My Profile
                            </Link>
                            <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 hover:text-primary transition-all">
                              <Heart size={15} className="text-[#ff4d6d]" /> View Wishlist
                            </Link>
                            <Link to="/settings" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 hover:text-primary transition-all">
                              <Settings size={15} /> Settings
                            </Link>
                            <div className="h-[1px] bg-gray-100 my-1 mx-2"></div>
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 px-3 py-2 hover:bg-red-50 rounded-xl text-xs font-bold text-red-600 transition-all text-left w-full cursor-pointer"
                            >
                              <LogOut size={15} /> Logout
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f4f4f4] hover:bg-gray-200 border border-gray-200/80 text-[11px] font-extrabold text-gray-800 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <User size={14} className="text-gray-700 shrink-0" />
                  <span className="whitespace-nowrap">Sign in</span>
                </Link>
              )}

              {/* Shopping Bag Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50/80 hover:bg-rose-100 border border-rose-200/80 text-[11px] font-extrabold text-rose-600 transition-all shadow-2xs relative cursor-pointer whitespace-nowrap shrink-0"
              >
                <ShoppingBag size={15} className="text-[#ff4d6d] shrink-0" />
                <span className="whitespace-nowrap">Shopping Bag</span>
                {activeCartCount > 0 && (
                  <span className="ml-0.5 bg-[#ff4d6d] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs shrink-0">
                    {activeCartCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ─── DESKTOP LOWER NAVIGATION BAR (Row 2) ─── */}
      <div className="bg-white border-b border-gray-200 hidden lg:block w-full">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-[46px] relative">
            
            {/* Category Navigation Links */}
            <div className="flex items-center gap-8 whitespace-nowrap">
              
              {/* Shop */}
              <Link to="/shop" className="text-[13px] font-extrabold text-gray-900 hover:text-[#ff4d6d] tracking-wide transition-colors py-2.5 whitespace-nowrap">
                Shop
              </Link>

              {/* Bookings */}
              <Link to="/booking" className="text-[13px] font-extrabold text-gray-900 hover:text-[#ff4d6d] tracking-wide transition-colors py-2.5 whitespace-nowrap">
                Bookings
              </Link>

              {/* Academy */}
              <Link to="/academy" className="text-[13px] font-extrabold text-gray-900 hover:text-[#ff4d6d] tracking-wide transition-colors py-2.5 whitespace-nowrap">
                Academy
              </Link>

              {/* Quick E-Commerce */}
              <Link to="/quick-commerce" className="text-[13px] font-extrabold text-[#ff4d6d] hover:text-[#e63956] tracking-wide transition-colors py-2.5 whitespace-nowrap flex items-center gap-1.5">
                <Zap size={14} className="fill-[#ff4d6d] text-[#ff4d6d]" /> Quick E-Commerce
              </Link>

              {/* International High-End */}
              <Link to="/luxe" className="text-[13px] font-extrabold text-gray-900 hover:text-[#ff4d6d] tracking-wide transition-colors py-2.5 whitespace-nowrap">
                International High-End
              </Link>

              {/* Beauty Advice */}
              <Link to="/advice" className="text-[13px] font-extrabold text-gray-900 hover:text-[#ff4d6d] tracking-wide transition-colors py-2.5 whitespace-nowrap">
                Beauty Advice
              </Link>

            </div>

          </div>
        </div>
      </div>

      {/* ─── MOBILE / TABLET HEADER ─── */}
      <div className="bg-white border-b border-gray-100 lg:hidden">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          
          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-1.5 rounded-xl bg-gray-100 text-gray-800 hover:text-primary transition-colors cursor-pointer"
          >
            <Menu size={22} />
          </button>

          {/* Mobile Center Logo Image */}
          <Link to="/" className="flex flex-col items-center text-center">
            <img 
              src={feverlogo} 
              alt="Fashion Fever" 
              className="h-14 sm:h-16 md:h-18 max-h-[64px] w-auto object-contain" 
            />
          </Link>

          {/* Mobile Right Action Icons */}
          <div className="flex items-center gap-2">
            <Link to="/wishlist" className="p-1.5 text-gray-700 hover:text-rose-500 transition-colors relative">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 text-rose-600 hover:text-rose-700 transition-colors relative cursor-pointer"
            >
              <ShoppingBag size={20} />
              {activeCartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#ff4d6d] text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {activeCartCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Search Bar Row */}
        <div className="px-4 pb-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands..."
              className="w-full bg-[#f4f4f4] border border-gray-200 rounded-full h-[36px] pl-4 pr-9 text-[12px] font-medium text-gray-800 placeholder:text-gray-400 outline-none"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── MOBILE DRAWER OVERLAY ─── */}
      <div
        className={`fixed inset-0 bg-black/50 z-[1000] lg:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className={`absolute left-0 top-0 h-full w-[290px] bg-white shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex flex-col text-left">
                <img 
                  src={feverlogo} 
                  alt="Fashion Fever" 
                  className="h-11 max-h-[44px] w-auto object-contain" 
                />
              </Link>
              <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-primary transition-colors cursor-pointer">
                <X size={22} />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="flex-grow overflow-y-auto py-4">
              <div className="px-5 space-y-6 text-left">
                
                {/* Mobile Quick Delivery Banner */}
                <Link 
                  to="/quick-commerce"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-100/60 border border-rose-200/80 text-primary text-xs font-black uppercase shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-primary fill-primary" />
                    <span>Quick 10-Min Express Delivery</span>
                  </div>
                  <span>⚡</span>
                </Link>

                {/* Categories */}
                <div className="space-y-3.5">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Main Menu</span>
                  
                  <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between text-sm font-bold text-gray-800 hover:text-primary uppercase py-1">
                    <span>Shop</span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </Link>
                  <Link to="/booking" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between text-sm font-bold text-gray-800 hover:text-primary uppercase py-1">
                    <span>Bookings</span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </Link>
                  <Link to="/academy" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between text-sm font-bold text-gray-800 hover:text-primary uppercase py-1">
                    <span>Academy</span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </Link>
                  <Link to="/luxe" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between text-sm font-bold text-gray-800 hover:text-primary uppercase py-1">
                    <span>International High-End</span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </Link>
                  <Link to="/advice" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between text-sm font-bold text-gray-800 hover:text-primary uppercase py-1">
                    <span>Beauty Advice</span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </Link>
                </div>

                {/* Logged-in User Links */}
                {user && (
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">My Account</span>
                    
                    {(() => {
                      const dashInfo = getDashboardLink(user);
                      return dashInfo ? (
                        <Link
                          to={dashInfo.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2.5 text-xs font-black text-primary uppercase bg-rose-50/60 p-2.5 rounded-xl border border-rose-100"
                        >
                          <LayoutDashboard size={15} /> {dashInfo.label}
                        </Link>
                      ) : null;
                    })()}

                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 text-xs font-bold text-gray-700 hover:text-primary py-1">
                      <User size={15} /> My Profile
                    </Link>
                    <Link to="/my-learning" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 text-xs font-bold text-gray-700 hover:text-primary py-1">
                      <Bookmark size={15} /> My Learning
                    </Link>
                    <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 text-xs font-bold text-gray-700 hover:text-primary py-1">
                      <Heart size={15} className="text-rose-500 fill-rose-500/20" /> My Wishlist
                    </Link>
                  </div>
                )}

              </div>
            </div>

            {/* Drawer Bottom Utility & Actions Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-4">
              
              {/* Utility Help Links moved to bottom */}
              <div className="space-y-2 text-left">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block px-1">Help & Information</span>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <Link to="/get-app" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-100 text-[11px] font-bold text-gray-700 hover:text-primary hover:border-primary/20 transition-all truncate">
                    <Smartphone size={14} className="shrink-0 text-primary" /> <span className="truncate">Get App</span>
                  </Link>
                  <Link to="/stores" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-100 text-[11px] font-bold text-gray-700 hover:text-primary hover:border-primary/20 transition-all truncate">
                    <MapPin size={14} className="shrink-0 text-primary" /> <span className="truncate">Store & Events</span>
                  </Link>
                  <Link to="/coupons" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-100 text-[11px] font-bold text-gray-700 hover:text-primary hover:border-primary/20 transition-all truncate">
                    <Gift size={14} className="shrink-0 text-primary" /> <span className="truncate">Gift & Coupons</span>
                  </Link>
                  <Link to="/help" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-100 text-[11px] font-bold text-gray-700 hover:text-primary hover:border-primary/20 transition-all truncate">
                    <HelpCircle size={14} className="shrink-0 text-primary" /> <span className="truncate">Help & Support</span>
                  </Link>
                </div>
              </div>

              {/* User Profile & Auth Action */}
              {user ? (
                <div className="space-y-2 text-left pt-1 border-t border-gray-200/60">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100 gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-black text-xs uppercase shrink-0">
                        {user.name?.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-xs font-black text-gray-900 uppercase truncate">{user.name}</p>
                        <p className="text-[9px] font-semibold text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full border border-rose-200 text-rose-600 bg-white hover:bg-rose-50 h-[38px] rounded-xl font-bold uppercase text-[11px] flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full bg-primary text-white h-[42px] rounded-xl font-black uppercase text-xs flex items-center justify-center shadow-md shadow-primary/20 cursor-pointer"
                >
                  Sign in
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Navbar;
