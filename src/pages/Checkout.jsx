import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { 
  CreditCard, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  Lock, 
  MapPin, 
  Check, 
  User, 
  ShoppingBag, 
  Loader2, 
  Truck, 
  Wallet, 
  Pencil, 
  Plus, 
  Trash2, 
  Ticket, 
  Sparkles, 
  Phone, 
  Home, 
  Building, 
  Info, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  PackageCheck, 
  CheckCircle2, 
  Tag, 
  HelpCircle, 
  BadgePercent, 
  CheckCircle,
  Zap
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWallet } from '../context/WalletContext';
import { getCartDetails, getCoupons, validateCoupon, placeOrder } from '../api/cartService';
import { getQuickCheckoutDetails, placeQuickOrder, clearQuickCart } from '../api/quickECommerceService';
import { addAddress, getAddresses, editAddress, deleteAddress } from '../api/authService';
import { toast } from '../utils/toast';
import Swal from 'sweetalert2';
import { getImageUrl, handleImageError, DEFAULT_PRODUCT_PLACEHOLDER } from '../utils/imageUrl';
import { lookupPincode } from '../utils/pincodeLookup';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useUser();
  const queryMode = searchParams.get('mode'); // 'quick' | 'standard'

  const { balanceData, refreshWalletBalance } = useWallet();
  const { cartId, cart, clearCart, fetchUserCart } = useCart();

  // 1. Separate cart into Quick vs Standard items
  const quickItems = useMemo(() => (cart || []).filter(item => item.isQuickDelivery), [cart]);
  const standardItems = useMemo(() => (cart || []).filter(item => !item.isQuickDelivery), [cart]);

  // Determine initial mode
  const [checkoutMode, setCheckoutMode] = useState(() => {
    if (queryMode === 'quick') return 'quick';
    if (queryMode === 'standard') return 'standard';
    if (quickItems.length > 0 && standardItems.length === 0) return 'quick';
    return 'standard';
  });

  // Sync mode if query parameter changes
  useEffect(() => {
    if (queryMode === 'quick' && checkoutMode !== 'quick') setCheckoutMode('quick');
    if (queryMode === 'standard' && checkoutMode !== 'standard') setCheckoutMode('standard');
  }, [queryMode]);

  const isQuickMode = checkoutMode === 'quick';
  const activeBagItems = isQuickMode ? quickItems : standardItems;
  const isCurrentBagEmpty = activeBagItems.length === 0;

  // Stepper & Payment State
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'wallet'
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);
  const [orderNotes, setOrderNotes] = useState(isQuickMode ? '10-minute lightning delivery request' : 'Please deliver safely');

  // Address States
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressType, setAddressType] = useState('HOME');

  const [shippingForm, setShippingForm] = useState({
    firstName: '',
    lastName: '',
    line1: '',
    line2: '',
    phone1: '',
    phone2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [pincodeAutoDetected, setPincodeAutoDetected] = useState(false);

  // Standard Cart Dynamic Details
  const [detailedCart, setDetailedCart] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Quick Cart Dynamic Details
  const [quickSummary, setQuickSummary] = useState(null);
  const [isLoadingQuickSummary, setIsLoadingQuickSummary] = useState(false);

  // Coupons State
  const [coupons, setCoupons] = useState([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [showCouponsModal, setShowCouponsModal] = useState(false);

  // Quick delivery instructions options
  const quickDeliveryNotes = [
    'Leave at door / front porch',
    'Call upon arrival',
    'Do not ring the bell',
    'Leave with security / guard',
    'Hand over directly to recipient'
  ];

  // Helper to merge duplicate variants for clean UI
  const getMergedItems = (itemsList) => {
    if (!itemsList || itemsList.length === 0) return [];
    const merged = {};
    itemsList.forEach(item => {
      const name = item.productName || item.name || '';
      const color = ((item.attributes?.Color || item.attributes?.color) ?? '').trim().toLowerCase();
      const size = ((item.attributes?.Size || item.attributes?.size) ?? '').trim().toLowerCase();
      const key = `${name}-${color}-${size}-${item.productId || item.id}`;
      
      if (merged[key]) {
        merged[key].quantity = (merged[key].quantity || merged[key].qty || 1) + (item.quantity || item.qty || 1);
        merged[key].qty = merged[key].quantity;
      } else {
        merged[key] = { 
          ...item,
          quantity: item.quantity || item.qty || 1,
          qty: item.quantity || item.qty || 1
        };
      }
    });
    return Object.values(merged);
  };

  const displayCartItems = useMemo(() => {
    if (isQuickMode) {
      return getMergedItems(quickItems);
    }
    if (detailedCart?.cartItems?.length > 0) {
      return getMergedItems(detailedCart.cartItems.filter(item => !item.isQuickDelivery));
    }
    return getMergedItems(standardItems);
  }, [isQuickMode, quickItems, standardItems, detailedCart]);

  // Fetch standard cart calculation when address is selected
  useEffect(() => {
    if (!isQuickMode && selectedAddressId && isAuthenticated) {
      const fetchCartSummary = async () => {
        setIsLoadingDetails(true);
        try {
          const res = await getCartDetails(selectedAddressId);
          if (res?.success) {
            setDetailedCart(res.data);
          }
        } catch (err) {
          console.error("Failed fetching standard checkout cart details:", err);
        } finally {
          setIsLoadingDetails(false);
        }
      };
      fetchCartSummary();
    }
  }, [isQuickMode, selectedAddressId, isAuthenticated]);

  // Fetch quick commerce calculation
  useEffect(() => {
    if (isQuickMode && quickItems.length > 0 && isAuthenticated) {
      const fetchQuickSummary = async () => {
        setIsLoadingQuickSummary(true);
        try {
          const res = await getQuickCheckoutDetails(appliedCoupon?.code || '');
          const data = res?.data?.data ?? res?.data ?? res;
          if (res?.success || data) {
            setQuickSummary(data);
          }
        } catch (err) {
          console.error("Failed fetching quick checkout summary:", err);
        } finally {
          setIsLoadingQuickSummary(false);
        }
      };
      fetchQuickSummary();
    }
  }, [isQuickMode, quickItems.length, appliedCoupon, isAuthenticated]);

  // Fetch Saved Addresses
  const fetchUserAddresses = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getAddresses();
      if (res?.success) {
        const list = res.data?.data ?? res.data ?? [];
        const addressList = Array.isArray(list) ? list : [];
        setAddresses(addressList);
        if (addressList.length > 0) {
          setSelectedAddressId(addressList[0]._id);
          setShippingForm(prev => ({
            ...prev,
            firstName: prev.firstName || 'Customer',
            line1: addressList[0].line1 || '',
            line2: addressList[0].line2 || '',
            phone1: addressList[0].phone1 || '',
            phone2: addressList[0].phone2 || '',
            landmark: addressList[0].landmark || '',
            city: addressList[0].city || '',
            state: addressList[0].state || '',
            pincode: addressList[0].pincode || ''
          }));
        } else {
          setIsFormOpen(true);
        }
      }
    } catch (err) {
      console.error("Failed to load user addresses:", err);
    }
  };

  // Fetch Available Coupons
  const fetchCouponsList = async () => {
    if (!isAuthenticated) return;
    setIsLoadingCoupons(true);
    try {
      const res = await getCoupons();
      if (res?.success) {
        const list = res.data?.data ?? res.data ?? [];
        setCoupons(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error("Failed to load available coupons:", err);
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserAddresses();
      fetchCouponsList();
    }
  }, [isAuthenticated]);

  const selectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setShippingForm(prev => ({
      ...prev,
      line1: addr.line1 || '',
      line2: addr.line2 || '',
      phone1: addr.phone1 || '',
      phone2: addr.phone2 || '',
      landmark: addr.landmark || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || ''
    }));
  };

  const handleDeleteAddress = (id) => {
    Swal.fire({
      title: 'Remove Address?',
      text: "Are you sure you want to delete this delivery address?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#da016a',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Keep it',
      customClass: {
        popup: 'rounded-3xl font-outfit shadow-2xl',
        confirmButton: 'rounded-xl font-bold uppercase text-xs px-6 py-3',
        cancelButton: 'rounded-xl font-bold uppercase text-xs px-6 py-3'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteAddress(id);
          if (res?.success) {
            toast.success(res?.message || 'Address deleted.');
            await fetchUserAddresses();
            setSelectedAddressId((prevId) => (prevId === id ? null : prevId));
          } else {
            toast.error(res?.message || 'Failed to delete address.');
          }
        } catch (err) {
          console.error("Delete address failed:", err);
          toast.error('An error occurred while deleting the address.');
        }
      }
    });
  };

  // Price calculations
  const getSubtotalAmount = () => {
    if (isQuickMode) {
      if (quickSummary?.subtotal) return Number(quickSummary.subtotal);
      return quickItems.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.qty || 1)), 0);
    }
    if (detailedCart?.cartItems?.length > 0) {
      const detailedItems = detailedCart.cartItems.filter(item => !item.isQuickDelivery);
      return detailedItems.reduce((acc, item) => acc + (Number(item.price || item.finalPrice || 0) * Number(item.quantity || 1)), 0);
    }
    return standardItems.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.qty || 1)), 0);
  };

  const getPackagingCharge = () => {
    if (isQuickMode) {
      return Number(quickSummary?.packingCharge || 10);
    }
    return 0;
  };

  const getShippingOrDeliveryCharge = () => {
    if (isQuickMode) {
      return Number(quickSummary?.deliveryCharge !== undefined ? quickSummary.deliveryCharge : 20);
    }
    return Number(detailedCart?.cartSummary?.shippingCharge || 0);
  };

  const getCodCharge = () => {
    if (paymentMethod === 'cod') {
      if (isQuickMode) return 0;
      return Number(detailedCart?.cartSummary?.codCharge || 0);
    }
    return 0;
  };

  const getDiscountAmount = () => {
    if (isQuickMode && quickSummary?.discountAmount) {
      return Number(quickSummary.discountAmount);
    }
    return Number(appliedCoupon?.discount || 0);
  };

  const getFinalTotal = () => {
    if (isQuickMode && quickSummary?.total) {
      return Number(quickSummary.total);
    }
    const subtotal = getSubtotalAmount();
    const packaging = getPackagingCharge();
    const delivery = getShippingOrDeliveryCharge();
    const cod = getCodCharge();
    const discount = getDiscountAmount();
    return Math.max(0, subtotal + packaging + delivery + cod - discount);
  };

  // Place Order Execution
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address.");
      setStep(1);
      return;
    }

    const orderTotal = getFinalTotal();

    if (paymentMethod === 'wallet') {
      const currentBalance = balanceData?.balance || 0;
      if (currentBalance < orderTotal) {
        toast.error("Insufficient wallet balance. Please choose another payment method.");
        return;
      }
    }

    setIsConfirmingOrder(true);
    
    Swal.fire({
      title: isQuickMode ? 'Locking in 10-Min Fast Order ⚡' : 'Securing Your Order...',
      text: isQuickMode 
        ? 'Connecting with the nearest partner store and assigning your delivery partner.'
        : 'Finalizing inventory and generating your secure order package.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'rounded-3xl font-outfit p-8 shadow-2xl',
      }
    });

    try {
      // 1. QUICK COMMERCE ORDER PIPELINE
      if (isQuickMode) {
        const paymentMethodValue = paymentMethod === 'wallet' ? 'WALLET' : 'CASH_ON_DELIVERY';
        const res = await placeQuickOrder(selectedAddressId, paymentMethodValue, appliedCoupon?.code || '');
        const success = res?.success || false;
        const quickData = res?.data || {};

        if (success) {
          await clearQuickCart();
          await fetchUserCart();
          if (paymentMethod === 'wallet') {
            await refreshWalletBalance();
          }

          Swal.fire({
            title: '10-Min Order Confirmed! ⚡🥳',
            html: `
              <div class="space-y-4 text-left font-outfit mt-2">
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Rider Dispatched • 10 Mins Arrival
                </div>
                <p class="text-xs text-gray-600 font-medium leading-relaxed">
                  Your express cosmetics order has been placed! Our local beauty hub is packing your bag right now.
                </p>
                <div class="bg-gray-50/90 p-4 rounded-2xl border border-gray-150 text-xs font-bold text-gray-600 space-y-2">
                  <div class="flex justify-between border-b border-gray-200/50 pb-1.5">
                    <span class="text-gray-400 uppercase text-xs">Order ID:</span>
                    <span class="text-primary font-mono font-black text-sm">${quickData._id?.substring(0, 10) || 'FFQ-EXPRESS'}</span>
                  </div>
                  <div class="flex justify-between border-b border-gray-200/50 pb-1.5">
                    <span class="text-gray-400 uppercase text-xs">Payment Mode:</span>
                    <span class="text-gray-900 font-black">${paymentMethod === 'wallet' ? 'Wallet Payment (Paid)' : 'Cash on Delivery'}</span>
                  </div>
                  <div class="flex justify-between items-center pt-1">
                    <span class="text-gray-400 uppercase text-xs">Deliver To:</span>
                    <span class="text-gray-900 font-extrabold truncate max-w-[200px]">${shippingForm.line1 || 'Saved Address'}</span>
                  </div>
                </div>
              </div>
            `,
            icon: 'success',
            showCancelButton: true,
            confirmButtonColor: '#da016a',
            cancelButtonColor: '#64748B',
            confirmButtonText: 'Track in My Orders 📦',
            cancelButtonText: 'Continue Shopping',
            allowOutsideClick: false,
            customClass: {
              popup: 'rounded-3xl font-outfit p-8 shadow-2xl',
              confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-3 shadow-md shadow-primary/25',
              cancelButton: 'rounded-xl font-bold uppercase text-xs px-6 py-3 ml-2'
            }
          }).then((alertRes) => {
            if (alertRes.isConfirmed) {
              navigate('/orders');
            } else {
              navigate('/quick-commerce');
            }
          });
        } else {
          Swal.close();
          Swal.fire({
            title: 'Quick Order Notice',
            text: res?.message || 'We could not complete your express order. Please verify that your address is within quick delivery range.',
            icon: 'error',
            confirmButtonColor: '#da016a',
            customClass: {
              popup: 'rounded-3xl font-outfit p-8 shadow-2xl',
              confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-3.5',
            }
          });
        }
        return;
      }

      // 2. STANDARD E-COMMERCE ORDER PIPELINE
      const mergedPayloadItems = {};
      standardItems.forEach(item => {
        const pId = item.productId || item.id;
        const vId = item.variantId || item.id;
        const qty = item.qty || item.quantity || 1;
        
        if (mergedPayloadItems[vId]) {
          mergedPayloadItems[vId].quantity += qty;
        } else {
          mergedPayloadItems[vId] = {
            productId: pId,
            variantId: vId,
            quantity: qty
          };
        }
      });
      const orderItems = Object.values(mergedPayloadItems);

      const payload = {
        addressId: selectedAddressId,
        paymentMethod: paymentMethod === 'wallet' ? 'Wallet' : 'CashOnDelivery',
        couponCode: appliedCoupon?.code || null,
        notes: orderNotes,
        items: orderItems
      };

      const res = await placeOrder(payload);
      const success = res?.success || res?.data?.success || false;
      const orderData = res?.data?.data || res?.data || {};

      if (success) {
        await clearCart();
        await fetchUserCart();
        if (paymentMethod === 'wallet') {
          await refreshWalletBalance();
        }
        
        Swal.fire({
          title: 'Order Confirmed! 🎉',
          html: `
            <div class="space-y-4 text-left font-outfit mt-2">
              <p class="text-xs text-gray-600 font-medium leading-relaxed">
                ${paymentMethod === 'wallet' 
                  ? 'Thank you for shopping with FashionFever! Your payment was processed seamlessly via your Wallet.' 
                  : 'Thank you for shopping with FashionFever! Your order has been placed with Cash on Delivery.'}
              </p>
              <div class="bg-gray-50/90 p-5 rounded-2xl border border-gray-150 text-xs font-bold text-gray-600 space-y-2.5">
                <div class="flex justify-between border-b border-gray-200/50 pb-2">
                  <span class="text-gray-400 uppercase text-xs tracking-wider">Order Reference:</span>
                  <span class="text-primary font-mono select-all font-black text-sm">${orderData.orderNumber || 'ORD-PLACED'}</span>
                </div>
                <div class="flex justify-between border-b border-gray-200/50 pb-2">
                  <span class="text-gray-400 uppercase text-xs tracking-wider">Recipient:</span>
                  <span class="text-gray-900 font-extrabold">${shippingForm.firstName} ${shippingForm.lastName || ''}</span>
                </div>
                <div class="flex justify-between border-b border-gray-200/50 pb-2">
                  <span class="text-gray-400 uppercase text-xs tracking-wider">Destination:</span>
                  <span class="text-gray-900 font-semibold">${shippingForm.city}, ${shippingForm.state} - ${shippingForm.pincode}</span>
                </div>
                <div class="flex justify-between items-center pt-1">
                  <span class="text-gray-400 uppercase text-xs tracking-wider">Payment Mode:</span>
                  <span class="px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
                    paymentMethod === 'wallet' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-primary/10 text-primary border border-primary/20'
                  }">
                    ${paymentMethod === 'wallet' ? 'Wallet Payment (Paid)' : 'Cash on Delivery (COD)'}
                  </span>
                </div>
              </div>
            </div>
          `,
          icon: 'success',
          showCancelButton: true,
          confirmButtonColor: '#da016a',
          cancelButtonColor: '#64748B',
          confirmButtonText: 'Track in My Orders 📦',
          cancelButtonText: 'Continue Shopping',
          allowOutsideClick: false,
          customClass: {
            popup: 'rounded-3xl font-outfit p-8 shadow-2xl',
            confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-3.5 shadow-lg shadow-primary/25',
            cancelButton: 'rounded-xl font-bold uppercase text-xs px-6 py-3.5 ml-2'
          }
        }).then((alertRes) => {
          if (alertRes.isConfirmed) {
            navigate('/orders');
          } else {
            navigate('/');
          }
        });
      } else {
        Swal.close();
        Swal.fire({
          title: 'Order Notice',
          text: res?.message || 'The checkout pipeline encountered an error. Please verify your details.',
          icon: 'error',
          confirmButtonColor: '#da016a',
          customClass: {
            popup: 'rounded-3xl font-outfit p-8 shadow-2xl',
            confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-3.5',
          }
        });
      }
    } catch (err) {
      console.error("Order completion error:", err);
      Swal.close();
      Swal.fire({
        title: 'Network Notice',
        text: 'Failed to communicate with order service. Please check your network and retry.',
        icon: 'error',
        confirmButtonColor: '#da016a',
        customClass: {
          popup: 'rounded-3xl font-outfit p-8 shadow-2xl',
          confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-3.5',
        }
      });
    } finally {
      setIsConfirmingOrder(false);
    }
  };

  const handleInputChange = async (e, field) => {
    const val = e.target.value;
    if (field === 'pincode') {
      const cleanPin = val.replace(/\D/g, '').slice(0, 6);
      setShippingForm(prev => ({ ...prev, pincode: cleanPin }));
      setPincodeAutoDetected(false);

      if (cleanPin.length === 6) {
        setIsPincodeLoading(true);
        try {
          const res = await lookupPincode(cleanPin);
          if (res.success) {
            setShippingForm(prev => ({
              ...prev,
              city: res.city || prev.city,
              state: res.state || prev.state
            }));
            setPincodeAutoDetected(true);
            toast.success(`📍 Auto-filled: ${res.city}, ${res.state}`);
          }
        } catch (err) {
          console.error('Pincode lookup error:', err);
        } finally {
          setIsPincodeLoading(false);
        }
      }
    } else {
      setShippingForm(prev => ({ ...prev, [field]: val }));
    }
  };

  const totalItemsCount = displayCartItems.reduce((acc, item) => acc + (item.qty || item.quantity || 1), 0);
  const finalGrandTotal = getFinalTotal();

  const stepsConfig = !isAuthenticated ? [
    { number: 1, title: 'Sign In', subtitle: 'Account Access', icon: Lock },
    { number: 2, title: 'Delivery', subtitle: 'Shipping Address', icon: MapPin },
    { number: 3, title: 'Payment', subtitle: 'Select Payment Mode', icon: CreditCard }
  ] : [
    { number: 1, title: 'Delivery', subtitle: 'Shipping Address', icon: MapPin },
    { number: 2, title: 'Payment', subtitle: 'Select Payment Mode', icon: CreditCard },
    { number: 3, title: 'Review', subtitle: 'Verify & Confirm', icon: ShieldCheck }
  ];

  // EMPTY BAG STATE
  if (isCurrentBagEmpty) {
    return (
      <div className="bg-[#f8f9fd] min-h-screen py-16 px-4 flex items-center justify-center font-outfit text-gray-800 antialiased">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-gray-200/80 shadow-xl shadow-gray-200/50 text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-pink-50 to-pink-100/70 border border-pink-200 flex items-center justify-center text-primary relative shadow-inner">
            <ShoppingBag size={42} className="stroke-[1.8]" />
            <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black shadow-md shadow-primary/30">
              0
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {isQuickMode ? 'Your Express Bag is Empty' : 'Your Shopping Bag is Empty'}
            </h2>
            <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">
              {isQuickMode 
                ? 'You do not have any 10-minute lightning items ready for checkout. Add cosmetics from our Quick Store to get fast delivery.'
                : "You don't have any items ready for standard checkout. Browse our newest luxury collection to complete your order."}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {isQuickMode ? (
              <Link
                to="/quick-commerce"
                className="flex-1 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                <Zap size={14} className="fill-white" />
                <span>Explore 10-Min Deals</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/cart"
                  className="flex-1 py-3.5 px-4 bg-gray-100 hover:bg-gray-200/70 text-gray-700 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all"
                >
                  View Cart
                </Link>
                <Link
                  to="/shop"
                  className="flex-1 py-3.5 px-4 bg-gradient-to-r from-primary to-[#fe3e6a] hover:from-primary-hover hover:to-primary text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <span>Start Shopping</span>
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-6 text-[11px] text-gray-500 font-semibold">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> 100% Genuine</span>
            <span className="flex items-center gap-1.5"><Truck size={14} className="text-blue-500" /> Express Delivery</span>
            <span className="flex items-center gap-1.5"><Lock size={13} className="text-purple-500" /> 256-Bit SSL</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fd] min-h-screen py-6 md:py-12 font-outfit text-gray-800 antialiased pb-28 lg:pb-14">
      <div className="container max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* DUAL DELIVERY MODE SELECTOR PILL (If both bags have items) */}
        {quickItems.length > 0 && standardItems.length > 0 && (
          <div className="flex items-center gap-2 p-1.5 bg-white border border-gray-200/80 rounded-2xl mb-6 max-w-md mx-auto shadow-sm">
            <button
              type="button"
              onClick={() => {
                setCheckoutMode('quick');
                setSearchParams({ mode: 'quick' });
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isQuickMode
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <Zap size={13} className="fill-current" />
              <span>⚡ 10-Min Express ({quickItems.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCheckoutMode('standard');
                setSearchParams({ mode: 'standard' });
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isQuickMode
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <Truck size={13} />
              <span>📦 Standard ({standardItems.length})</span>
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-8 pb-3 sm:pb-6 border-b border-gray-200/80">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link 
              to={isQuickMode ? "/quick-commerce" : "/cart"}
              className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-white border border-gray-200 hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center text-gray-700 hover:text-primary transition-all shadow-xs cursor-pointer shrink-0"
              title={isQuickMode ? "Return to Quick Commerce" : "Return to Cart"}
            >
              <ChevronLeft size={16} />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-2xl font-black text-gray-950 tracking-tight font-outfit">
                  {isQuickMode ? '10-Min Express Checkout' : 'Express Checkout'}
                </h1>
                {isQuickMode ? (
                  <span className="bg-amber-500 text-white text-[9px] sm:text-xs font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs shrink-0">
                    <Zap size={9} className="fill-white" /> 10-Min Fast
                  </span>
                ) : (
                  <span className="bg-primary/10 text-primary text-[9px] sm:text-xs font-black uppercase px-2 py-0.5 rounded-full border border-primary/20 shrink-0">
                    Secure 256-Bit
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-sm text-gray-500 font-medium mt-0.5">
                {isQuickMode 
                  ? 'Hyperlocal express delivery straight from your local store'
                  : 'Complete your luxury order in 3 simple steps'}
              </p>
            </div>
          </div>

          {/* Trust Guarantees Header */}
          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-700 font-bold">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Check size={14} className="stroke-[3]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-800">100% Genuine</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                {isQuickMode ? <Zap size={14} className="text-amber-500 fill-amber-500" /> : <Truck size={14} />}
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-800">
                {isQuickMode ? '10-Min Dispatch' : 'Fast Dispatch'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Lock size={13} />
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-800">PCI-DSS Safe</span>
            </div>
          </div>
        </div>

        {/* Stepper Navigation */}
        <div className="max-w-2xl mx-auto mb-5 sm:mb-10 px-1 sm:px-0">
          <div className="relative flex items-center justify-between">
            <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 sm:h-1 bg-gray-200/80 -z-0 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ease-out ${
                  isQuickMode 
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                    : 'bg-gradient-to-r from-primary to-[#fe3e6a]'
                }`}
                style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
              />
            </div>

            {stepsConfig.map((item) => {
              const IconComponent = item.icon;
              const isPassed = step > item.number;
              const isCurrent = step === item.number;

              return (
                <button
                  key={item.number}
                  type="button"
                  onClick={() => {
                    if (isPassed) setStep(item.number);
                  }}
                  disabled={!isPassed && !isCurrent}
                  className={`relative z-10 flex flex-col items-center gap-1 transition-all cursor-pointer group ${
                    isPassed ? 'cursor-pointer' : isCurrent ? 'cursor-default' : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <div 
                    className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm transition-all duration-300 shadow-sm ${
                      isPassed
                        ? 'bg-emerald-500 text-white shadow-emerald-500/25 ring-2 sm:ring-4 ring-emerald-50'
                        : isCurrent
                        ? isQuickMode 
                          ? 'bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-amber-500/30 ring-2 sm:ring-4 ring-amber-100 scale-105'
                          : 'bg-gradient-to-tr from-primary to-[#fe3e6a] text-white shadow-primary/30 ring-2 sm:ring-4 ring-primary/15 scale-105'
                        : 'bg-white text-gray-400 border border-gray-200'
                    }`}
                  >
                    {isPassed ? (
                      <Check size={14} className="stroke-[3]" />
                    ) : (
                      <IconComponent size={14} />
                    )}
                  </div>
                  <div className="text-center">
                    <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider block ${
                      isCurrent ? (isQuickMode ? 'text-amber-600' : 'text-primary') : isPassed ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {item.title}
                    </span>
                    <span className="hidden sm:block text-xs font-medium text-gray-400 mt-0.5">
                      {item.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          
          {/* Main Left Stage (Col 7) */}
          <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-200/70 shadow-sm relative overflow-hidden text-left">
            
            {!isAuthenticated ? (
              <div className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 sm:gap-4 pb-3.5 sm:pb-4 border-b border-gray-150">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
                    <Lock size={18} />
                  </div>
                  <div>
                    <span className="inline-block text-[10px] sm:text-xs font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full mb-0.5">
                      Account Required
                    </span>
                    <h2 className="text-base sm:text-2xl font-black text-gray-950 tracking-tight font-outfit leading-snug">
                      Sign In to Complete Order
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                      Please log in or create an account to choose your delivery address and make payment.
                    </p>
                  </div>
                </div>

                {/* Bag reserved banner */}
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50/60 border border-pink-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white border border-pink-200 flex items-center justify-center text-primary shadow-xs shrink-0">
                      <ShoppingBag size={15} />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 block">Items Reserved in Bag</span>
                      <span className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                        {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} waiting in your cart
                      </span>
                    </div>
                  </div>
                  <span className="text-sm sm:text-lg font-black text-gray-950 font-outfit">
                    ₹{Number(finalGrandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Benefits list */}
                <div className="space-y-2 sm:space-y-2.5 pt-1 text-xs sm:text-sm text-gray-600 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span>Auto-saves your delivery addresses & order tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span>Earn wallet cashback & redeem exclusive coupons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span>100% Secure Checkout with 256-Bit SSL Protection</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      const redirectTarget = location.pathname + location.search;
                      navigate(`/auth?redirect=${encodeURIComponent(redirectTarget)}`);
                    }}
                    className="w-full bg-primary hover:bg-[#b50157] text-white py-2.5 sm:py-3.5 px-4 rounded-xl font-bold uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-md shadow-pink-500/20 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <User size={15} />
                    <span className="sm:hidden">Sign In to Continue</span>
                    <span className="hidden sm:inline">Sign In / Create Account to Continue</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(isQuickMode ? '/quick-commerce' : '/shop')}
                    className="w-full py-2 sm:py-2.5 rounded-xl border border-gray-250 hover:bg-gray-50 text-gray-700 font-bold uppercase text-xs tracking-wider transition-all cursor-pointer text-center"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : (
              <>
            {/* STEP 1: SHIPPING ADDRESS */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <span className={`text-xs font-black uppercase tracking-widest block mb-1 ${
                      isQuickMode ? 'text-amber-600' : 'text-primary'
                    }`}>
                      Step 1 of 3
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                      {isQuickMode ? 'Express Delivery Address' : 'Shipping Destination'}
                    </h2>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingAddressId(null);
                      setShippingForm({
                        firstName: shippingForm.firstName || 'Customer',
                        lastName: '',
                        line1: '',
                        line2: '',
                        phone1: '',
                        phone2: '',
                        landmark: '',
                        city: '',
                        state: '',
                        pincode: ''
                      });
                      setIsFormOpen(!isFormOpen);
                    }}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isFormOpen 
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                        : isQuickMode 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        : 'bg-primary/5 text-primary border border-primary/20 hover:bg-primary hover:text-white'
                    }`}
                  >
                    {isFormOpen ? 'Close Form' : <><Plus size={14} /> Add New Address</>}
                  </button>
                </div>

                {isQuickMode && (
                  <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-center gap-2.5 text-xs text-amber-800 font-semibold">
                    <Zap size={16} className="text-amber-500 fill-amber-500 shrink-0 animate-pulse" />
                    <span>Your order will be fulfilled in 10 minutes by a local rider at this address.</span>
                  </div>
                )}

                {/* Add/Edit Address Form Modal/Inline */}
                {isFormOpen && (
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setIsSavingAddress(true);
                      try {
                        const payload = {
                          addressType,
                          line1: shippingForm.line1,
                          line2: shippingForm.line2,
                          landmark: shippingForm.landmark,
                          city: shippingForm.city,
                          state: shippingForm.state,
                          pincode: shippingForm.pincode,
                          phone1: shippingForm.phone1,
                          phone2: shippingForm.phone2
                        };
                        let res;
                        if (editingAddressId) {
                          res = await editAddress(editingAddressId, payload);
                        } else {
                          res = await addAddress(payload);
                        }
                        if (res?.success) {
                          toast.success(editingAddressId ? "Address updated successfully!" : "Address added successfully!");
                          await fetchUserAddresses();
                          setIsFormOpen(false);
                          setEditingAddressId(null);
                        } else {
                          toast.error(res?.message || "Failed to save address.");
                        }
                      } catch (err) {
                        console.error(err);
                        toast.error("An error occurred while saving address.");
                      } finally {
                        setIsSavingAddress(false);
                      }
                    }}
                    className="p-5 sm:p-6 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-4 text-left"
                  >
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-700">
                      {editingAddressId ? 'Update Delivery Address' : 'Enter New Delivery Address'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-black uppercase text-gray-400 block mb-1">House / Flat / Street*</label>
                        <input 
                          type="text" 
                          required 
                          value={shippingForm.line1}
                          onChange={(e) => handleInputChange(e, 'line1')}
                          placeholder="House/Flat No, Building, Street" 
                          className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase text-gray-400 block mb-1">Area / Landmark</label>
                        <input 
                          type="text" 
                          value={shippingForm.landmark}
                          onChange={(e) => handleInputChange(e, 'landmark')}
                          placeholder="Near metro station, mall, etc." 
                          className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-black uppercase text-gray-400 block">City*</label>
                          {pincodeAutoDetected && shippingForm.city && (
                            <span className="text-xs font-black text-emerald-600 flex items-center gap-0.5 uppercase">
                              <Check size={9} className="stroke-[3]" /> Auto-Filled
                            </span>
                          )}
                        </div>
                        <input 
                          type="text" 
                          required 
                          value={shippingForm.city}
                          onChange={(e) => handleInputChange(e, 'city')}
                          placeholder="e.g. New Delhi" 
                          className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none transition-all ${
                            pincodeAutoDetected && shippingForm.city
                              ? 'border-emerald-300 bg-emerald-50/15 focus:border-emerald-500'
                              : 'bg-white border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-black uppercase text-gray-400 block">State*</label>
                          {pincodeAutoDetected && shippingForm.state && (
                            <span className="text-xs font-black text-emerald-600 flex items-center gap-0.5 uppercase">
                              <Check size={9} className="stroke-[3]" /> Auto-Filled
                            </span>
                          )}
                        </div>
                        <input 
                          type="text" 
                          required 
                          value={shippingForm.state}
                          onChange={(e) => handleInputChange(e, 'state')}
                          placeholder="e.g. Delhi" 
                          className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none transition-all ${
                            pincodeAutoDetected && shippingForm.state
                              ? 'border-emerald-300 bg-emerald-50/15 focus:border-emerald-500'
                              : 'bg-white border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-black uppercase text-gray-400 block">6-Digit Pincode*</label>
                          {isPincodeLoading && (
                            <span className="flex items-center gap-1 text-xs font-black text-primary animate-pulse uppercase">
                              <Loader2 size={9} className="animate-spin" /> Detecting...
                            </span>
                          )}
                          {!isPincodeLoading && pincodeAutoDetected && (
                            <span className="flex items-center gap-0.5 text-xs font-black text-emerald-600 uppercase">
                              <Check size={9} className="stroke-[3]" /> Verified
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input 
                            type="text" 
                            required 
                            inputMode="numeric"
                            maxLength={6}
                            value={shippingForm.pincode}
                            onChange={(e) => handleInputChange(e, 'pincode')}
                            placeholder="e.g. 110001" 
                            className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none transition-all ${
                              pincodeAutoDetected 
                                ? 'border-emerald-400 ring-1 ring-emerald-200 bg-white' 
                                : 'bg-white border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20'
                            }`}
                          />
                          {isPincodeLoading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 size={13} className="animate-spin text-primary" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-black uppercase text-gray-400 block mb-1">10-Digit Mobile*</label>
                        <input 
                          type="text" 
                          required 
                          maxLength={10}
                          value={shippingForm.phone1}
                          onChange={(e) => handleInputChange(e, 'phone1')}
                          placeholder="Mobile for rider to call" 
                          className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase text-gray-400 block mb-1">Address Label</label>
                        <div className="flex gap-2">
                          {['HOME', 'WORK', 'OTHER'].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setAddressType(type)}
                              className={`flex-1 py-2 text-xs font-black uppercase rounded-xl border transition-all cursor-pointer ${
                                addressType === type 
                                  ? 'bg-primary text-white border-primary shadow-xs' 
                                  : 'bg-white text-gray-600 border-gray-200'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingAddress}
                        className={`px-6 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-1.5 ${
                          isQuickMode 
                            ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' 
                            : 'bg-primary hover:bg-primary-hover shadow-primary/20'
                        }`}
                      >
                        {isSavingAddress ? <Loader2 size={13} className="animate-spin" /> : editingAddressId ? 'Update Address' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Saved Addresses List */}
                <div className="space-y-3">
                  {addresses.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-xs text-gray-400 font-bold uppercase">No saved addresses found. Please add an address to continue.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {addresses.map((addr) => {
                        const isSelected = selectedAddressId === addr._id;
                        return (
                          <div 
                            key={addr._id}
                            onClick={() => selectAddress(addr)}
                            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                              isSelected 
                                ? isQuickMode
                                  ? 'border-amber-500 bg-amber-50/20 shadow-sm ring-2 ring-amber-500/10'
                                  : 'border-primary bg-primary/[0.02] shadow-sm ring-2 ring-primary/10' 
                                : 'border-gray-200/90 hover:border-gray-300 bg-white hover:shadow-xs'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2.5">
                                <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                  isSelected 
                                    ? isQuickMode ? 'bg-amber-500 text-white' : 'bg-primary text-white' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  <Home size={10} /> {addr.addressType || addr.landmark || 'Home'}
                                </span>

                                <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingAddressId(addr._id);
                                      setShippingForm({
                                        firstName: shippingForm.firstName || 'Customer',
                                        lastName: '',
                                        line1: addr.line1 || '',
                                        line2: addr.line2 || '',
                                        phone1: addr.phone1 || '',
                                        phone2: addr.phone2 || '',
                                        landmark: addr.landmark || '',
                                        city: addr.city || '',
                                        state: addr.state || '',
                                        pincode: addr.pincode || ''
                                      });
                                      setIsFormOpen(true);
                                    }}
                                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                                    title="Edit address"
                                  >
                                    <Pencil size={11} />
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAddress(addr._id);
                                    }}
                                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                                    title="Delete address"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>

                              <p className="text-xs font-extrabold text-gray-900 leading-snug line-clamp-2">
                                {addr.line1}
                              </p>
                              {addr.line2 && (
                                <p className="text-[11px] text-gray-500 mt-0.5">{addr.line2}</p>
                              )}
                              <p className="text-[11px] font-bold text-gray-700 mt-1">
                                {addr.city}, {addr.state} - <span className="font-mono">{addr.pincode}</span>
                              </p>
                              {addr.phone1 && (
                                <p className="text-[11px] font-medium text-gray-500 mt-1 flex items-center gap-1">
                                  <Phone size={10} /> {addr.phone1}
                                </p>
                              )}
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                              <span className={`text-xs font-black uppercase ${
                                isSelected ? (isQuickMode ? 'text-amber-600' : 'text-primary') : 'text-gray-400'
                              }`}>
                                {isSelected ? '✓ Selected Address' : 'Click to select'}
                              </span>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected 
                                  ? isQuickMode ? 'border-amber-500 bg-amber-500 text-white' : 'border-primary bg-primary text-white' 
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && <Check size={10} className="stroke-[3]" />}
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    disabled={!selectedAddressId}
                    onClick={() => setStep(2)}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl font-bold uppercase text-xs sm:text-sm tracking-wider text-white shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] ${
                      isQuickMode 
                        ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25' 
                        : 'bg-primary hover:bg-primary-hover shadow-primary/25'
                    }`}
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            )}

            {/* STEP 2: PAYMENT & INSTRUCTIONS */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <span className={`text-xs font-black uppercase tracking-widest block mb-1 ${
                      isQuickMode ? 'text-amber-600' : 'text-primary'
                    }`}>
                      Step 2 of 3
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                      Payment & Delivery Notes
                    </h2>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-gray-400 hover:text-gray-700 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={12} /> Back to Address
                  </button>
                </div>

                {/* Payment Options */}
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-700 block">
                    Choose Payment Method
                  </span>

                  {/* Cash on Delivery */}
                  <label className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'cod' 
                      ? isQuickMode 
                        ? 'border-amber-500 bg-amber-50/20 shadow-xs ring-2 ring-amber-500/10'
                        : 'border-primary bg-primary/[0.02] shadow-xs ring-2 ring-primary/10' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cod" 
                        checked={paymentMethod === 'cod'} 
                        onChange={() => setPaymentMethod('cod')}
                        className="accent-primary w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase text-gray-900">Cash on Delivery (COD)</span>
                          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded">
                            Verified Safe
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                          {isQuickMode ? 'Pay cash or UPI to rider upon 10-minute delivery' : 'Pay in cash when order arrives at your doorstep'}
                        </p>
                      </div>
                    </div>
                    <CreditCard size={18} className="text-gray-400" />
                  </label>

                  {/* Wallet Payment */}
                  <label className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'wallet' 
                      ? isQuickMode 
                        ? 'border-amber-500 bg-amber-50/20 shadow-xs ring-2 ring-amber-500/10'
                        : 'border-primary bg-primary/[0.02] shadow-xs ring-2 ring-primary/10' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="wallet" 
                        checked={paymentMethod === 'wallet'} 
                        onChange={() => setPaymentMethod('wallet')}
                        className="accent-primary w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase text-gray-900">FashionFever Wallet</span>
                          <span className="bg-primary/10 text-primary text-xs font-black uppercase px-2 py-0.5 rounded">
                            Instant 1-Click
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                          Available Balance: <strong className="text-gray-900 font-mono">₹{(balanceData?.balance || 0).toLocaleString()}</strong>
                        </p>
                      </div>
                    </div>
                    <Wallet size={18} className="text-gray-400" />
                  </label>
                </div>

                {/* Delivery Notes / Instructions */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-700 block flex items-center gap-1.5">
                    <Clock size={13} className="text-primary" /> Delivery Instructions (Optional)
                  </span>
                  
                  {/* Quick Pills */}
                  <div className="flex flex-wrap gap-2">
                    {quickDeliveryNotes.map((note) => (
                      <button
                        key={note}
                        type="button"
                        onClick={() => setOrderNotes(note)}
                        className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          orderNotes === note 
                            ? 'bg-gray-900 text-white border-gray-900' 
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {note}
                      </button>
                    ))}
                  </div>

                  <input 
                    type="text" 
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Add special delivery instructions for our partner..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer text-center"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl font-bold uppercase text-xs sm:text-sm tracking-wider text-white shadow-md transition-all cursor-pointer hover:scale-[1.01] ${
                      isQuickMode 
                        ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25' 
                        : 'bg-primary hover:bg-primary-hover shadow-primary/25'
                    }`}
                  >
                    <span>Review Order</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            )}

            {/* STEP 3: REVIEW & CONFIRM */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <span className={`text-xs font-black uppercase tracking-widest block mb-1 ${
                      isQuickMode ? 'text-amber-600' : 'text-primary'
                    }`}>
                      Step 3 of 3
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                      Order Summary & Confirmation
                    </h2>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-gray-400 hover:text-gray-700 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={12} /> Back
                  </button>
                </div>

                {/* Delivery Snapshot Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
                      <MapPin size={12} className="text-primary" /> Delivery Destination
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                  <div className="text-xs text-gray-700 font-semibold space-y-0.5">
                    <p className="text-gray-900 font-black">{shippingForm.line1}</p>
                    {shippingForm.line2 && <p>{shippingForm.line2}</p>}
                    <p>{shippingForm.city}, {shippingForm.state} - {shippingForm.pincode}</p>
                    {shippingForm.phone1 && <p className="text-gray-500">Contact: {shippingForm.phone1}</p>}
                  </div>
                </div>

                {/* Delivery Logistics Badge */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isQuickMode ? 'bg-amber-50/80 border-amber-200' : 'bg-blue-50/80 border-blue-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isQuickMode ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {isQuickMode ? <Zap size={18} className="fill-white" /> : <Truck size={18} />}
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase text-gray-900 block">
                        {isQuickMode ? '10-Minute Express Dispatch' : 'Pan-India Standard Shipping'}
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {isQuickMode ? 'Guaranteed local delivery in 10-15 minutes' : 'Dispatched via trusted courier within 2-4 days'}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg ${
                    isQuickMode ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    {isQuickMode ? '⚡ 10 MINS' : 'STANDARD'}
                  </span>
                </div>

                {/* Selected Payment Mode */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CreditCard size={15} className="text-gray-400" />
                    <span className="font-bold text-gray-700">Payment:</span>
                    <span className="font-black text-gray-900 uppercase">
                      {paymentMethod === 'wallet' ? 'FashionFever Wallet (Instant)' : 'Cash on Delivery (COD)'}
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {/* Final Order Confirmation Button */}
                <div className="pt-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer text-center"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    disabled={isConfirmingOrder}
                    onClick={handlePlaceOrder}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-8 sm:py-3.5 rounded-xl font-bold uppercase text-xs sm:text-sm tracking-wider text-white shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
                      isQuickMode 
                        ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' 
                        : 'bg-primary hover:bg-primary-hover shadow-primary/30'
                    }`}
                  >
                    {isConfirmingOrder ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Confirming Order...</span>
                      </>
                    ) : (
                      <>
                        {isQuickMode ? <Zap size={15} className="fill-white" /> : <ShoppingBag size={15} />}
                        <span>Confirm & Place {isQuickMode ? '10-Min' : ''} Order (₹{Number(getFinalTotal()).toLocaleString('en-IN')})</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}
              </>
            )}

          </div>

          {/* Right Summary Column (Col 5) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200/80 shadow-sm space-y-4">
              
              {/* Order Summary Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-150">
                <h3 className="text-sm sm:text-base font-black uppercase text-gray-900 tracking-wider flex items-center gap-2">
                  <ShoppingBag size={16} className={isQuickMode ? 'text-amber-500' : 'text-primary'} />
                  {isQuickMode ? 'Express Bag Summary' : 'Order Summary'}
                </h3>
                <span className="text-[11px] sm:text-xs font-bold text-gray-700 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full font-mono">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1 divide-y divide-gray-100 no-scrollbar">
                {displayCartItems.map((item, i) => {
                  const color = item.attributes?.Color || item.attributes?.color;
                  const size = item.attributes?.Size || item.attributes?.size;
                  const itemPrice = Number(item.price || item.finalPrice || item.salesPrice || 0);

                  return (
                    <div key={i} className="pt-2.5 first:pt-0 flex items-center gap-3 group">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-50 border border-gray-150 flex-shrink-0 overflow-hidden relative">
                        <img 
                          src={getImageUrl(item.thumbnail?.url || item.thumbnail || item.image || item) || DEFAULT_PRODUCT_PLACEHOLDER} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          onError={handleImageError}
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {item.productName || item.name || 'Cosmetics Item'}
                        </h4>
                        {(color || size) && (
                          <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mt-0.5">
                            {color && `Color: ${color}`} {size && `• Size: ${size}`}
                          </p>
                        )}
                        <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-0.5">
                          Qty: <span className="font-bold text-gray-900">{item.quantity || item.qty}</span> • <span className="font-black text-gray-950">₹{itemPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupons Section */}
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-150 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-gray-800 tracking-wider flex items-center gap-1.5">
                    <Ticket size={14} className="text-primary" /> Apply Coupon
                  </span>
                  {coupons.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowCouponsModal(!showCouponsModal)}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {coupons.length} offers <ChevronRight size={13} />
                    </button>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs sm:text-sm font-black uppercase text-emerald-800">
                          {appliedCoupon.code} Applied!
                        </p>
                        <p className="text-[11px] text-emerald-600 font-semibold">
                          You saved ₹{Number(appliedCoupon.discount).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setPromoInput('');
                        toast.success("Coupon removed.");
                      }}
                      className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && document.getElementById('apply-coupon-btn')?.click()}
                      placeholder="ENTER COUPON CODE" 
                      className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 placeholder:text-gray-400 placeholder:font-sans placeholder:normal-case placeholder:text-xs" 
                    />
                    <button
                      id="apply-coupon-btn"
                      type="button"
                      disabled={isValidatingCoupon || !promoInput.trim()}
                      onClick={async () => {
                        if (!promoInput.trim()) return;
                        setIsValidatingCoupon(true);
                        try {
                          const res = await validateCoupon(promoInput.trim());
                          const data = res?.data?.data ?? res?.data ?? res;
                          if (res?.success || data?.success) {
                            const couponInfo = data?.coupon ?? data;
                            const discountAmt = data?.discountAmount ?? couponInfo?.value ?? 0;
                            setAppliedCoupon({
                              code: promoInput.trim(),
                              discount: discountAmt,
                              type: couponInfo?.type,
                              value: couponInfo?.value
                            });
                            toast.success(res?.message || data?.message || `Coupon applied! Saved ₹${discountAmt}`);
                          } else {
                            toast.error(res?.message || data?.message || "Invalid coupon code.");
                          }
                        } catch (err) {
                          console.error("Coupon error:", err);
                          toast.error("Failed to validate coupon.");
                        } finally {
                          setIsValidatingCoupon(false);
                        }
                      }}
                      className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isValidatingCoupon ? <Loader2 size={13} className="animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                )}

                {/* Available Coupons Dropdown */}
                {showCouponsModal && coupons.length > 0 && (
                  <div className="pt-2 space-y-2 border-t border-gray-200/60 max-h-[160px] overflow-y-auto pr-1">
                    {coupons.map((c) => (
                      <div 
                        key={c._id}
                        onClick={() => {
                          if (c.isValid) {
                            setPromoInput(c.code);
                            toast.info(`Selected ${c.code}. Click Apply!`);
                          } else {
                            toast.error(c.reason || "Coupon conditions not met.");
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          c.isValid 
                            ? 'bg-white border-primary/30 hover:border-primary cursor-pointer' 
                            : 'bg-gray-100/60 border-gray-200 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-xs sm:text-sm text-primary">{c.code}</span>
                          <span className="text-[10px] sm:text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                          </span>
                        </div>
                        {c.description && (
                          <p className="text-xs text-gray-600 font-medium mt-0.5">{c.description}</p>
                        )}
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Min Order: ₹{c.minimumOrderAmount || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Line Items Breakdown */}
              <div className="space-y-2 sm:space-y-2.5 pt-2.5 border-t border-gray-150 text-xs sm:text-sm font-semibold text-gray-700">
                <div className="flex justify-between items-center">
                  <span>Bag Subtotal</span>
                  <span className="font-black text-gray-950 font-mono text-xs sm:text-sm">
                    ₹{Number(getSubtotalAmount()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {getDiscountAmount() > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Tag size={13} /> Coupon Discount
                    </span>
                    <span className="font-mono font-black text-xs sm:text-sm">-₹{Number(getDiscountAmount()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {isQuickMode && (
                  <div className="flex justify-between items-center">
                    <span>Express Packaging</span>
                    <span className="font-black text-gray-950 font-mono text-xs sm:text-sm">
                      ₹{getPackagingCharge().toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>{isQuickMode ? '⚡ 10-Min Delivery Fee' : 'Shipping & Handling'}</span>
                  <span className="font-black text-gray-950 font-mono text-xs sm:text-sm">
                    {getShippingOrDeliveryCharge() > 0 
                      ? `₹${getShippingOrDeliveryCharge().toFixed(2)}`
                      : <span className="text-emerald-600 font-extrabold uppercase text-[10px] sm:text-xs">Free</span>}
                  </span>
                </div>

                {!isQuickMode && paymentMethod === 'cod' && getCodCharge() > 0 && (
                  <div className="flex justify-between items-center">
                    <span>COD Convenience Fee</span>
                    <span className="font-black text-gray-950 font-mono text-xs sm:text-sm">
                      ₹{getCodCharge().toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-primary pt-0.5 text-xs sm:text-sm font-bold">
                  <span>Delivery Estimate:</span>
                  <span className={isQuickMode ? 'text-amber-600 font-black' : ''}>
                    {isQuickMode ? '⚡ Guaranteed 10-15 Minutes' : (detailedCart?.cartSummary?.estimatedDeliveryDate || 'Within 2-4 Days')}
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t border-gray-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-900 block">
                    Grand Total
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                    (Inclusive of all taxes)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl md:text-3xl font-black text-gray-950 font-outfit">
                    ₹{Number(getFinalTotal()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;