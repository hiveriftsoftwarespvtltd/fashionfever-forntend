import React, { useState, useEffect } from 'react';
import config from '../../config/config';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getQuickProducts,
  getQuickCheckoutDetails,
  applyQuickCheckoutCoupon,
  placeQuickOrder,
  getQuickUserOrders,
  cancelQuickOrder,
  clearQuickCart
} from '../../api/quickECommerceService';
import { getAddresses, addAddress } from '../../api/authService';
import apiClient from '../../api/apiClient';
import { useWallet } from '../../context/WalletContext';
import { useUser } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';
import { toast } from '../../utils/toast';
import Swal from 'sweetalert2';
import { getImageUrl } from '../../utils/imageUrl';

// Sub-components
import CustomerSubNav from './customer_components/CustomerSubNav';
import CustomerLocationPromptModal from './customer_components/CustomerLocationPromptModal';
import CustomerShopView from './customer_components/CustomerShopView';
import CustomerCartView from './customer_components/CustomerCartView';
import CustomerOrdersView from './customer_components/CustomerOrdersView';
import CustomerOrderDetailsModal from './customer_components/CustomerOrderDetailsModal';

const CustomerFlow = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const { balanceData, refreshWalletBalance } = useWallet();
  const { cart, removeFromCart, updateQty, addToCart, fetchUserCart } = useCart();

  // State
  const [products, setProducts] = useState([]);
  const [checkout, setCheckout] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');

  // User Orders Modal & Pagination States
  const [selectedUserOrderModal, setSelectedUserOrderModal] = useState(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderCurrentPage, setOrderCurrentPage] = useState(1);
  const [orderItemsPerPage, setOrderItemsPerPage] = useState(10);

  // Active sub tab state with localStorage and URL query param persistence
  const { search: urlSearch } = useLocation();
  const [activeSubTab, setActiveSubTabState] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['shop', 'cart'].includes(tabParam)) {
      return tabParam;
    }
    const saved = localStorage.getItem('quick_active_sub_tab');
    if (saved && ['shop', 'cart'].includes(saved)) {
      return saved;
    }
    return 'shop';
  });

  const setActiveSubTab = (tab) => {
    setActiveSubTabState(tab);
    localStorage.setItem('quick_active_sub_tab', tab);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(urlSearch);
    const tabParam = params.get('tab');
    if (tabParam === 'orders') {
      navigate('/orders');
      return;
    }
    if (tabParam === 'cart') {
      navigate('/checkout?mode=quick');
      return;
    }
  }, [urlSearch, navigate]);

  // Filters & Geolocation
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [pincode, setPincode] = useState(() => localStorage.getItem('quick_delivery_pincode') || '');
  const [locationMode, setLocationMode] = useState(() => localStorage.getItem('quick_delivery_location_mode') || 'gps');
  const [showLocationPromptModal, setShowLocationPromptModal] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [manualPincodeInput, setManualPincodeInput] = useState('');
  const [locationError, setLocationError] = useState('');
  const [gpsLocationLabel, setGpsLocationLabel] = useState(() => localStorage.getItem('quick_delivery_location_label') || '');

  // Derived state: filter only Quick Delivery items
  const quickCart = cart.filter(item => item.isQuickDelivery);

  // Dynamic categories from API
  const [dynamicCategories, setDynamicCategories] = useState([]);

  // Fetch dynamic categories from API (once on mount)
  useEffect(() => {
    const fetchDynamicCategories = async () => {
      try {
        const res = await apiClient.get('/admin-public/categories');
        const data = res.data?.data || res.data || [];
        const cats = Array.isArray(data) ? data : [];
        setDynamicCategories(cats);
      } catch (err) {
        console.error('Categories fetch error:', err);
      }
    };
    fetchDynamicCategories();
  }, []);

  // Initialize
  useEffect(() => {
    fetchProducts();
    if (isAuthenticated) {
      fetchOrdersData();
      fetchAddressesData();
      refreshWalletBalance();
      fetchUserCart();
    }
  }, [isAuthenticated, selectedAddressId, category, pincode, locationMode]);

  // Sync selected address pincode ONLY if locationMode is 'address'
  useEffect(() => {
    if (locationMode === 'address' && selectedAddressId && addresses.length > 0) {
      const addr = addresses.find(a => a._id === selectedAddressId);
      if (addr && addr.pincode) {
        setPincode(addr.pincode.toString());
        localStorage.setItem('quick_delivery_pincode', addr.pincode.toString());
      }
    }
  }, [selectedAddressId, addresses, locationMode]);

  // Show location prompt modal if no pincode/location set yet
  useEffect(() => {
    if (!pincode && (!isAuthenticated || (isAuthenticated && addresses.length === 0))) {
      setShowLocationPromptModal(true);
    }
  }, [pincode, addresses, isAuthenticated]);

  // Sync checkout details whenever quick cart items or coupon change
  useEffect(() => {
    if (isAuthenticated && quickCart.length > 0) {
      fetchCheckoutData(appliedCoupon);
    } else {
      setCheckout(null);
    }
  }, [cart, appliedCoupon, isAuthenticated]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { search, category, locationMode };
      if (pincode) {
        params.pincode = pincode;
      } else if (selectedAddressId) {
        params.addressId = selectedAddressId;
      }

      const res = await getQuickProducts(params);
      if (res?.success) {
        setProducts(res.data?.products || res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Geolocator Handlers
  const handleDetectLocation = () => {
    setDetectingLocation(true);
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          let postCode = '';
          let displayLabel = '';

          try {
            const bdcRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            if (bdcRes.ok) {
              const bdcData = await bdcRes.json();
              const bdcPostcode = bdcData.postcode?.match(/\b\d{6}\b/)?.[0] || '';
              const area = bdcData.locality || bdcData.city || bdcData.principalSubdivision || '';
              const city = bdcData.city || bdcData.localityInfo?.administrative?.[2]?.name || '';
              if (bdcPostcode) {
                postCode = bdcPostcode;
                const areaLabel = [area, city].filter((v, i, a) => v && a.indexOf(v) === i).join(', ');
                displayLabel = areaLabel ? `${areaLabel} (${postCode})` : `Pincode: ${postCode}`;
              }
            }
          } catch (e) {
            console.warn('BigDataCloud geocode fallback:', e);
          }

          if (!postCode) {
            const nomRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            if (nomRes.ok) {
              const nomData = await nomRes.json();
              const addr = nomData.address || {};
              const rawPostcode = addr.postcode || nomData.display_name?.match(/\b\d{6}\b/)?.[0] || '';
              const matchedPincode = rawPostcode.match(/\b\d{6}\b/)?.[0] || rawPostcode.replace(/\D/g, '').slice(0, 6);

              if (matchedPincode) {
                postCode = matchedPincode;
                const area = addr.suburb || addr.neighbourhood || addr.residential || addr.village || addr.town || addr.county || '';
                const city = addr.city || addr.state_district || addr.state || '';
                const areaLabel = [area, city].filter(Boolean).join(', ');
                displayLabel = areaLabel ? `${areaLabel} (${postCode})` : `Pincode: ${postCode}`;
              }
            }
          }

          if (postCode) {
            setPincode(postCode);
            setLocationMode('gps');
            setGpsLocationLabel(displayLabel);
            localStorage.setItem('quick_delivery_pincode', postCode);
            localStorage.setItem('quick_delivery_location_mode', 'gps');
            localStorage.setItem('quick_delivery_location_label', displayLabel);
            setManualPincodeInput(postCode);
            toast.success(`GPS Location: ${displayLabel}`);
            setTimeout(() => {
              setShowLocationPromptModal(false);
            }, 600);
          } else {
            setLocationError('Could not auto-detect 6-digit Pincode. Please enter manually.');
          }
        } catch (err) {
          console.error(err);
          setLocationError('Failed to fetch GPS address. Please enter Pincode manually.');
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        console.error(err);
        setLocationError('Permission denied or location lookup failed. Please enter pincode manually.');
        setDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const handleManualPincodeSubmit = (e) => {
    e.preventDefault();
    if (!manualPincodeInput || manualPincodeInput.trim().length < 5) {
      setLocationError('Please enter a valid postal code.');
      return;
    }
    const trimmed = manualPincodeInput.trim();
    setPincode(trimmed);
    setLocationMode('manual');
    setGpsLocationLabel('');
    localStorage.setItem('quick_delivery_pincode', trimmed);
    localStorage.setItem('quick_delivery_location_mode', 'manual');
    localStorage.removeItem('quick_delivery_location_label');
    setShowLocationPromptModal(false);
    toast.success(`Showing products available at pincode ${trimmed}`);
  };

  const fetchCheckoutData = async (coupon = '') => {
    try {
      const res = await getQuickCheckoutDetails(coupon);
      if (res?.success) {
        setCheckout(res.data?.data || res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrdersData = async () => {
    try {
      const res = await getQuickUserOrders(1, 20);
      if (res?.success) {
        setOrders(res.data?.orders || res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAddressesData = async () => {
    try {
      const res = await getAddresses();
      if (res?.success) {
        const addrList = res.data || [];
        setAddresses(addrList);
        if (addrList.length > 0 && !selectedAddressId) {
          setSelectedAddressId(addrList[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cart operations
  const handleAddToCart = async (product, variant) => {
    const resolvedProductId = String(product._id || product.id || '');
    const rawVariantId = typeof variant === 'object' ? (variant?._id || variant?.id) : variant;
    const resolvedVariantId = String(rawVariantId || product.variants?.[0]?._id || resolvedProductId);

    try {
      await addToCart(product, resolvedVariantId, resolvedProductId, true);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Added to Express Bag',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecreaseQuantity = async (item) => {
    try {
      await updateQty(item.id, -1, item.productId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIncreaseQuantity = async (item) => {
    try {
      await updateQty(item.id, 1, item.productId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveItem = async (item) => {
    try {
      await removeFromCart(item.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearCart = async () => {
    try {
      const res = await clearQuickCart();
      if (res?.success) {
        fetchUserCart();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNewAddress = async () => {
    try {
      window._swalSelectedAddressType = 'Home';
      window._setSwalAddrType = (type) => {
        window._swalSelectedAddressType = type;
        ['Home', 'Work', 'Other'].forEach((t) => {
          const btn = document.getElementById(`addr-type-${t}`);
          if (btn) {
            if (t === type) {
              btn.className = 'addr-type-btn py-2 px-3 rounded-xl border text-[11px] font-black uppercase transition-all flex items-center justify-center gap-1.5 bg-rose-50 border-primary text-primary shadow-xs';
            } else {
              btn.className = 'addr-type-btn py-2 px-3 rounded-xl border text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100';
            }
          }
        });
      };

      const { value: formValues } = await Swal.fire({
        padding: '0',
        customClass: {
          popup: '!rounded-[28px] !overflow-hidden shadow-2xl border border-slate-100 max-w-md w-[92vw] sm:w-full text-left !p-0 !m-auto max-h-[88vh] flex flex-col',
          htmlContainer: '!m-0 !p-0 overflow-y-auto max-h-[68vh] w-full',
          actions: '!m-0 !mt-0 !p-3.5 bg-slate-50 border-t border-slate-100 flex gap-2.5 w-full justify-end shrink-0 shadow-inner',
          confirmButton: 'bg-gradient-to-r from-primary via-rose-600 to-[#b50157] hover:opacity-95 text-white font-black text-[11px] uppercase px-6 py-2.5 rounded-xl shadow-md shadow-primary/20 transition-all cursor-pointer !m-0 tracking-wider',
          cancelButton: 'bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-colors cursor-pointer !m-0 tracking-wider'
        },
        buttonsStyling: false,
        html: `
          <div class="w-full text-left overflow-hidden bg-white">
            <div class="bg-gradient-to-r from-[#da016a] via-rose-600 to-[#b50157] text-white p-4 sm:p-5 text-left relative overflow-hidden shrink-0">
              <div class="flex items-center gap-3 relative z-10">
                <div class="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <h3 class="text-sm sm:text-base font-black uppercase tracking-tight text-white m-0 leading-tight">Add Delivery Address</h3>
                  <p class="text-xs text-rose-100 font-medium m-0 opacity-90">10-Minute Express Delivery Destination</p>
                </div>
              </div>
            </div>

            <div class="p-4 sm:p-5 space-y-3 bg-white text-left overflow-y-auto">
              <div>
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1.5">Address Type</label>
                <div class="grid grid-cols-3 gap-2" id="swal-type-selector">
                  <button type="button" onclick="window._setSwalAddrType('Home')" id="addr-type-Home" class="addr-type-btn py-1.5 px-2.5 rounded-lg border text-xs font-black uppercase transition-all flex items-center justify-center gap-1 bg-rose-50 border-primary text-primary shadow-xs">
                    <span>HOME</span>
                  </button>
                  <button type="button" onclick="window._setSwalAddrType('Work')" id="addr-type-Work" class="addr-type-btn py-1.5 px-2.5 rounded-lg border text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100">
                    <span>WORK</span>
                  </button>
                  <button type="button" onclick="window._setSwalAddrType('Other')" id="addr-type-Other" class="addr-type-btn py-1.5 px-2.5 rounded-lg border text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100">
                    <span>OTHER</span>
                  </button>
                </div>
              </div>

              <div>
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">House / Flat No & Street Address*</label>
                <div class="relative">
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <input 
                    id="swal-line1" 
                    type="text" 
                    class="w-full bg-slate-50/80 border border-slate-200 focus:border-primary focus:bg-white rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-800 outline-none transition-all shadow-xs focus:ring-2 focus:ring-primary/10" 
                    placeholder="House/Flat No, Building, Street Name"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">City*</label>
                  <div class="relative">
                    <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                    </div>
                    <input 
                      id="swal-city" 
                      type="text" 
                      class="w-full bg-slate-50/80 border border-slate-200 focus:border-primary focus:bg-white rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-800 outline-none transition-all shadow-xs focus:ring-2 focus:ring-primary/10" 
                      placeholder="e.g. Noida"
                    />
                  </div>
                </div>
                <div>
                  <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">State*</label>
                  <div class="relative">
                    <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
                    </div>
                    <input 
                      id="swal-state" 
                      type="text" 
                      class="w-full bg-slate-50/80 border border-slate-200 focus:border-primary focus:bg-white rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-800 outline-none transition-all shadow-xs focus:ring-2 focus:ring-primary/10" 
                      placeholder="e.g. Uttar Pradesh"
                    />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">6-Digit Pincode*</label>
                  <div class="relative">
                    <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    </div>
                    <input 
                      id="swal-pincode" 
                      type="text" 
                      maxLength="6"
                      class="w-full bg-slate-50/80 border border-slate-200 focus:border-primary focus:bg-white rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold font-mono text-slate-800 outline-none transition-all shadow-xs focus:ring-2 focus:ring-primary/10" 
                      placeholder="e.g. 201301"
                    />
                  </div>
                </div>
                <div>
                  <label class="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">10-Digit Mobile*</label>
                  <div class="relative">
                    <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <input 
                      id="swal-phone" 
                      type="text" 
                      maxLength="10"
                      class="w-full bg-slate-50/80 border border-slate-200 focus:border-primary focus:bg-white rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold font-mono text-slate-800 outline-none transition-all shadow-xs focus:ring-2 focus:ring-primary/10" 
                      placeholder="10-digit Mobile"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Save Address',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
          const addressType = window._swalSelectedAddressType || 'Home';
          const line1 = document.getElementById('swal-line1').value.trim();
          const city = document.getElementById('swal-city').value.trim();
          const state = document.getElementById('swal-state').value.trim();
          const pincode = document.getElementById('swal-pincode').value.trim();
          const phone = document.getElementById('swal-phone').value.trim();

          if (!line1 || !city || !state || !pincode || !phone) {
            Swal.showValidationMessage('Please fill out all required fields!');
            return false;
          }
          if (pincode.length !== 6 || isNaN(pincode)) {
            Swal.showValidationMessage('Please enter a valid 6-digit Pincode!');
            return false;
          }
          if (phone.length !== 10 || isNaN(phone)) {
            Swal.showValidationMessage('Please enter a valid 10-digit Phone Number!');
            return false;
          }

          return { addressType, line1, city, state, pincode, phone };
        }
      });

      if (formValues) {
        const payload = {
          addressType: formValues.addressType || 'Home',
          line1: formValues.line1,
          city: formValues.city,
          state: formValues.state,
          pincode: formValues.pincode,
          phone1: formValues.phone
        };

        const res = await addAddress(payload);
        if (res?.success) {
          Swal.fire('Success', 'Address added successfully!', 'success');
          fetchAddressesData();
        } else {
          Swal.fire('Error', res.message || 'Failed to save address', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Something went wrong!', 'error');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await applyQuickCheckoutCoupon(couponCode);
      if (res?.success) {
        setAppliedCoupon(couponCode);
        toast.success(res.message || 'Coupon applied successfully!');
      } else {
        Swal.fire('Failed', res.message || 'Invalid coupon code', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      Swal.fire('Address Missing', 'Please select a delivery address to complete your order!', 'warning');
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Confirm Express Order?',
        text: `Placing this order via ${paymentMethod.replace(/_/g, ' ')}. Delivery is expected within 10 minutes!`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ff007f',
        confirmButtonText: 'Yes, Place Order',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        const res = await placeQuickOrder(selectedAddressId, paymentMethod, appliedCoupon);
        if (res?.success) {
          setCheckout(null);
          setAppliedCoupon('');
          setCouponCode('');
          fetchUserCart();
          refreshWalletBalance();

          Swal.fire({
            title: 'Order Placed! 🥳',
            text: `Your 10-minute quick delivery order has been placed successfully! (Order ID: ${res.data?._id?.substring(0, 8)})`,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Track in My Orders',
            cancelButtonText: 'Continue Shopping',
            confirmButtonColor: '#da016a',
            cancelButtonColor: '#64748B'
          }).then((alertRes) => {
            if (alertRes.isConfirmed) {
              navigate('/orders');
            } else {
              setActiveSubTab('shop');
            }
          });
        } else {
          Swal.fire('Order Failed', res.message || 'We could not complete your order.', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to submit order transaction.', 'error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const { value: reason } = await Swal.fire({
        title: 'Cancel Order',
        input: 'text',
        inputLabel: 'Reason for cancellation',
        inputPlaceholder: 'Enter your reason here...',
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'You need to specify a reason!';
          }
        }
      });

      if (reason) {
        const res = await cancelQuickOrder(orderId, reason);
        if (res?.success) {
          Swal.fire('Cancelled', 'Your order cancellation request succeeded.', 'success');
          fetchOrdersData();
          refreshWalletBalance();
        } else {
          Swal.fire('Failed', res.message || 'Could not cancel order', 'error');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const maps = {
      PLACED: 'bg-blue-50 text-blue-700 border-blue-100',
      PROCESSING: 'bg-amber-50 text-amber-700 border-amber-100',
      OUT_FOR_DELIVERY: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      CANCELLED: 'bg-rose-50 text-rose-700 border-rose-100',
    };
    return maps[status] || 'bg-slate-50 text-slate-700 border-slate-100';
  };

  const formatOrderDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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

    if (!raw && item.productId && typeof item.productId === 'string' && Array.isArray(products)) {
      const found = products.find(p => String(p._id || p.id) === String(item.productId));
      if (found) {
        raw = extractUrl(found.thumbnail)
          || (Array.isArray(found.images) ? extractUrl(found.images[0]) : null)
          || (Array.isArray(found.variants) ? (
            extractUrl(found.variants[0]?.thumbnail) ||
            (Array.isArray(found.variants[0]?.images) ? extractUrl(found.variants[0]?.images[0]) : null)
          ) : null);
      }
    }

    if (!raw && item.productName && Array.isArray(products) && products.length > 0) {
      const foundByName = products.find(p => p.name?.toLowerCase().trim() === item.productName?.toLowerCase().trim());
      if (foundByName) {
        raw = extractUrl(foundByName.thumbnail)
          || (Array.isArray(foundByName.images) ? extractUrl(foundByName.images[0]) : null)
          || (Array.isArray(foundByName.variants) ? (
            extractUrl(foundByName.variants[0]?.thumbnail) ||
            (Array.isArray(foundByName.variants[0]?.images) ? extractUrl(foundByName.variants[0]?.images[0]) : null)
          ) : null);
      }
    }

    return getImageUrl(raw);
  };

  const filteredUserOrders = orders.filter((o) => {
    if (!orderSearchQuery || orderSearchQuery.trim() === '') return true;
    const q = orderSearchQuery.toLowerCase().trim();
    const orderIdStr = String(o._id || '').toLowerCase();
    const productNames = (o.items || []).map(i => String(i.productName || '').toLowerCase()).join(' ');
    const statusStr = String(o.status || '').toLowerCase();
    return orderIdStr.includes(q) || productNames.includes(q) || statusStr.includes(q);
  });

  const userOrderTotalItems = filteredUserOrders.length;
  const userOrderTotalPages = Math.ceil(userOrderTotalItems / orderItemsPerPage) || 1;
  const validUserOrderPage = Math.min(Math.max(orderCurrentPage, 1), userOrderTotalPages);
  const userOrderStartIndex = (validUserOrderPage - 1) * orderItemsPerPage;
  const paginatedUserOrders = filteredUserOrders.slice(userOrderStartIndex, userOrderStartIndex + orderItemsPerPage);

  return (
    <div className="w-full">
      {/* Quick Commerce Lightning Deals Shop */}
      <CustomerShopView
        category={category}
        setCategory={setCategory}
        dynamicCategories={dynamicCategories}
        search={search}
        setSearch={setSearch}
        fetchProducts={fetchProducts}
        locationMode={locationMode}
        gpsLocationLabel={gpsLocationLabel}
        pincode={pincode}
        isAuthenticated={isAuthenticated}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        setSelectedAddressId={setSelectedAddressId}
        setPincode={setPincode}
        setLocationMode={setLocationMode}
        setGpsLocationLabel={setGpsLocationLabel}
        setShowLocationPromptModal={setShowLocationPromptModal}
        loading={loading}
        products={products}
        quickCart={quickCart}
        handleAddToCart={handleAddToCart}
        handleDecreaseQuantity={handleDecreaseQuantity}
        handleIncreaseQuantity={handleIncreaseQuantity}
        setActiveSubTab={setActiveSubTab}
        navigate={navigate}
      />

      {/* 4. Order Details Modal */}
      <CustomerOrderDetailsModal
        selectedUserOrderModal={selectedUserOrderModal}
        setSelectedUserOrderModal={setSelectedUserOrderModal}
        handleCancelOrder={handleCancelOrder}
        formatOrderDate={formatOrderDate}
        getItemImage={getItemImage}
      />

      {/* 5. Location Prompt Modal */}
      <CustomerLocationPromptModal
        showLocationPromptModal={showLocationPromptModal}
        setShowLocationPromptModal={setShowLocationPromptModal}
        handleDetectLocation={handleDetectLocation}
        detectingLocation={detectingLocation}
        handleManualPincodeSubmit={handleManualPincodeSubmit}
        manualPincodeInput={manualPincodeInput}
        setManualPincodeInput={setManualPincodeInput}
        locationError={locationError}
        pincode={pincode}
        isAuthenticated={isAuthenticated}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        setSelectedAddressId={setSelectedAddressId}
        setPincode={setPincode}
      />
    </div>
  );
};

export default CustomerFlow;
