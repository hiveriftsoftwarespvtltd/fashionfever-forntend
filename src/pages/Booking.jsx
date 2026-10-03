import React, { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from '../utils/toast';
import Swal from 'sweetalert2';
import { searchServices, getAvailableSlots, createBooking, createServiceLead, validateServiceCoupon } from '../api/serviceProviderService';
import { useUser } from '../context/UserContext';
import { useWallet } from '../context/WalletContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  X, 
  Loader2, 
  MapPin, 
  Navigation, 
  Calendar, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Scissors, 
  Store, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Tag, 
  Wallet, 
  UserCheck, 
  ChevronRight, 
  Clock, 
  Star, 
  Search 
} from 'lucide-react';
import bookingHeroImg from '../assets/bookinghero.png';

// Sub-components
import BookingStepper from '../components/booking/BookingStepper';
import BookingSummarySidebar from '../components/booking/BookingSummarySidebar';
import BookingMobileFooter from '../components/booking/BookingMobileFooter';
import WalletTopupModal from '../components/booking/modals/WalletTopupModal';
import DateTimeSlotSelector from '../components/booking/DateTimeSlotSelector';

const POPULAR_CITIES = ['All Salons', 'Delhi', 'Noida', 'Gurugram', 'Gorakhpur', 'Lucknow', 'Mumbai'];

const Booking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useUser();
  const { balanceData, loading: walletLoading, refreshWalletBalance } = useWallet();

  // Navigation (Steps 1 to 4, Step 5 is Confirmation Receipt)
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [bookingConfirmLoading, setBookingConfirmLoading] = useState(false);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);

  // Search & Geolocation
  const [city, setCity] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState(100);
  const [lat, setLat] = useState(28.5245);
  const [lng, setLng] = useState(77.2066);

  // Salons State
  const [searchResults, setSearchResults] = useState([]);
  const [allNearbySalons, setAllNearbySalons] = useState([]);

  // Selection states
  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Treatments filter in Step 2
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');

  // Coupon state in Step 4 — per-service coupon Map: serviceId → { code, discountAmount, couponId }
  // Key: service._id, Value: { code, discountAmount, couponId, serviceName, servicePrice }
  const [appliedCoupons, setAppliedCoupons] = useState({}); // serviceId → coupon result
  const [couponInputs, setCouponInputs] = useState({});     // serviceId → input string
  const [couponApplying, setCouponApplying] = useState({}); // serviceId → boolean

  // Confirmed Receipt Data
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);

  // Custom Lead Modal
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [leadRequirement, setLeadRequirement] = useState('');
  const [leadBudget, setLeadBudget] = useState('');
  const [leadPreferredDate, setLeadPreferredDate] = useState('');
  const [leadAddress, setLeadAddress] = useState('');
  const [leadPincode, setLeadPincode] = useState('');
  const [leadCity, setLeadCity] = useState('');
  const [leadState, setLeadState] = useState('');
  const [leadQuantity, setLeadQuantity] = useState(1);
  const [leadPhoneNumber, setLeadPhoneNumber] = useState('');
  const [leadGender, setLeadGender] = useState('FEMALE');
  const [leadSelectedCategories, setLeadSelectedCategories] = useState([]);
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  const scheduleRef = useRef(null);
  const topStepRef = useRef(null);

  // Rehydrate draft from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('ff_booking_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedResult) setSelectedResult(parsed.selectedResult);
        if (Array.isArray(parsed.selectedServices) && parsed.selectedServices.length > 0) {
          setSelectedServices(parsed.selectedServices);
        }
        if (parsed.selectedDate) setSelectedDate(parsed.selectedDate);
        if (parsed.selectedSlot) setSelectedSlot(parsed.selectedSlot);
        if (parsed.selectedStaff) setSelectedStaff(parsed.selectedStaff);
        if (parsed.currentStep && parsed.currentStep >= 1 && parsed.currentStep <= 4) {
          setCurrentStep(parsed.currentStep);
          setMaxStepReached(Math.max(parsed.maxStepReached || 1, parsed.currentStep));
        }
      }
    } catch (e) {
      console.warn("Could not restore booking draft:", e);
    }
  }, []);

  // Sync draft to sessionStorage
  useEffect(() => {
    if (currentStep === 5) return;
    try {
      const draft = {
        currentStep,
        maxStepReached,
        selectedResult,
        selectedServices,
        selectedDate,
        selectedSlot,
        selectedStaff,
        city
      };
      sessionStorage.setItem('ff_booking_draft', JSON.stringify(draft));
    } catch (e) {
      console.warn("Could not save booking draft:", e);
    }
  }, [currentStep, maxStepReached, selectedResult, selectedServices, selectedDate, selectedSlot, selectedStaff, city]);

  // Read URL parameters (?category=)
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategoryFilter(cat.toUpperCase());
    }
  }, [searchParams]);

  // Load nearby salons on mount without city filter so salons are always displayed
  useEffect(() => {
    detectLocation(true);
  }, []);

  // Fetch slots when provider, services, or date change
  useEffect(() => {
    const fetchSlotsData = async () => {
      if (!selectedResult || selectedServices.length === 0 || !selectedDate) {
        setSlots([]);
        return;
      }
      
      setSlotsLoading(true);
      try {
        const providerId = selectedResult.provider._id;
        const serviceIds = selectedServices.map(s => s._id);
        const res = await getAvailableSlots(providerId, serviceIds, selectedDate);
        const unpacked = res?.data?.data ?? res?.data ?? res;
        const slotsArray = unpacked?.slots ?? (Array.isArray(unpacked) ? unpacked : []);
        setSlots(slotsArray);
      } catch (err) {
        console.error("Error fetching available slots:", err);
        setSlots([]);
        toast.error("Failed to load time slots.");
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlotsData();
  }, [selectedResult, selectedServices, selectedDate]);

  // Geolocation detection
  const detectLocation = (isSilent = false) => {
    if (!navigator.geolocation) {
      if (!isSilent) toast.error("Geolocation is not supported by your browser");
      handleSearch(lat, lng, '', maxDistanceKm);
      return;
    }
    
    if (!isSilent) setSearchingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;
        setLat(uLat);
        setLng(uLng);
        if (!isSilent) {
          setSearchingLocation(false);
          toast.success("Location retrieved successfully!");
        }
        handleSearch(uLat, uLng, isSilent ? '' : city, maxDistanceKm);
      },
      (error) => {
        console.error("Geolocation retrieval error:", error);
        if (!isSilent) {
          setSearchingLocation(false);
          toast.error("Location permission denied. Showing all nearby lounges.");
        }
        handleSearch(lat, lng, isSilent ? '' : city, maxDistanceKm);
      },
      { timeout: 8000 }
    );
  };

  const handleSearchClick = (e) => {
    e?.preventDefault();
    handleSearch(lat, lng, city.trim(), maxDistanceKm);
  };

  const handleSearch = async (sLat, sLng, sCity = '', sDist = maxDistanceKm) => {
    setLoading(true);
    setActiveSearchTerm(sCity);
    try {
      const res = await searchServices({
        lat: sLat,
        lng: sLng,
        maxDistanceKm: sDist,
        city: sCity
      });

      const unpacked = res?.data?.data ?? res?.data ?? res;
      const list = Array.isArray(unpacked) ? unpacked : [];
      setSearchResults(list);

      if (!sCity && list.length > 0) {
        setAllNearbySalons(list);
      }
    } catch (err) {
      console.error("Search API error:", err);
      toast.error("Failed to fetch nearby salons.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuickCity = (cityName) => {
    if (cityName === 'All Salons') {
      setCity('');
      setActiveSearchTerm('');
      handleSearch(lat, lng, '', maxDistanceKm);
    } else {
      setCity(cityName);
      setActiveSearchTerm(cityName);
      handleSearch(lat, lng, cityName, maxDistanceKm);
    }
  };

  const handleSelectLounge = (result) => {
    if (selectedResult && selectedResult.provider?._id !== result.provider?._id) {
      setSelectedServices([]);
      setSelectedSlot(null);
      setSelectedStaff(null);
      setSlots([]);
    }
    setSelectedResult(result);
    setCurrentStep(2);
    setMaxStepReached(prev => Math.max(prev, 2));
    topStepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleToggleService = (service) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s._id === service._id);
      if (exists) {
        return prev.filter(s => s._id !== service._id);
      } else {
        return [...prev, service];
      }
    });
    setSelectedSlot(null);
    setSelectedStaff(null);
  };

  const handleRemoveService = (serviceId) => {
    setSelectedServices(prev => prev.filter(s => s._id !== serviceId));
    setSelectedSlot(null);
    setSelectedStaff(null);
  };

  // Calculations
  const subtotal = useMemo(() => {
    return selectedServices.reduce((sum, s) => {
      const price = s.offeredPrice || s.sellingPrice || s.costPrice || 0;
      return sum + price;
    }, 0);
  }, [selectedServices]);

  // Total coupon discount = sum of all per-service discounts
  const couponDiscount = useMemo(() => {
    return Object.values(appliedCoupons).reduce((sum, c) => sum + (c?.discountAmount || 0), 0);
  }, [appliedCoupons]);

  const netTotal = useMemo(() => {
    return Math.max(0, subtotal - couponDiscount);
  }, [subtotal, couponDiscount]);

  const advanceRequired = useMemo(() => {
    return parseFloat((netTotal * 0.2).toFixed(2));
  }, [netTotal]);

  const remainingPayableAtSalon = useMemo(() => {
    return parseFloat((netTotal - advanceRequired).toFixed(2));
  }, [netTotal, advanceRequired]);

  const userWalletBalance = balanceData?.balance || 0;
  const hasSufficientWallet = userWalletBalance >= advanceRequired;
  const walletShortfall = Math.max(0, parseFloat((advanceRequired - userWalletBalance).toFixed(2)));

  // Per-service coupon handlers
  const handleApplyCoupon = async (serviceId, e) => {
    e?.preventDefault();
    const code = (couponInputs[serviceId] || '').trim().toUpperCase();
    if (!code) { toast.error('Please enter a coupon code.'); return; }

    const providerId = selectedResult?.provider?._id;
    if (!providerId) { toast.error('No salon selected.'); return; }

    setCouponApplying(prev => ({ ...prev, [serviceId]: true }));
    try {
      const res = await validateServiceCoupon(code, serviceId, providerId);
      if (res?.success) {
        const d = res.data;
        setAppliedCoupons(prev => ({ ...prev, [serviceId]: d }));
        toast.success(`"${d.code}" applied! Save ₹${d.discountAmount} on ${d.serviceName}`);
      } else {
        toast.error(res?.message || 'Invalid coupon code.');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to validate coupon.');
    } finally {
      setCouponApplying(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  const handleRemoveCoupon = (serviceId) => {
    setAppliedCoupons(prev => { const n = { ...prev }; delete n[serviceId]; return n; });
    setCouponInputs(prev => { const n = { ...prev }; delete n[serviceId]; return n; });
    toast.info('Coupon removed.');
  };

  const setCouponInputForService = (serviceId, val) => {
    setCouponInputs(prev => ({ ...prev, [serviceId]: val }));
  };

  // Step Navigation
  const handleStepChange = (targetStep) => {
    if (targetStep <= maxStepReached) {
      setCurrentStep(targetStep);
      topStepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedResult) {
        toast.error("Please select a salon lounge to continue.");
        return;
      }
      setCurrentStep(2);
      setMaxStepReached(prev => Math.max(prev, 2));
    } else if (currentStep === 2) {
      if (selectedServices.length === 0) {
        toast.error("Please select at least one treatment to continue.");
        return;
      }
      setCurrentStep(3);
      setMaxStepReached(prev => Math.max(prev, 3));
    } else if (currentStep === 3) {
      if (!selectedDate || !selectedSlot) {
        toast.error("Please select an appointment date and time slot.");
        return;
      }
      setCurrentStep(4);
      setMaxStepReached(prev => Math.max(prev, 4));
    } else if (currentStep === 4) {
      handleConfirmBooking();
    }
    topStepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      topStepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 1) return !selectedResult;
    if (currentStep === 2) return selectedServices.length === 0;
    if (currentStep === 3) return !selectedDate || !selectedSlot;
    if (currentStep === 4) return bookingConfirmLoading;
    return false;
  };

  const getNextButtonLabel = () => {
    if (currentStep === 1) return 'Select Treatments';
    if (currentStep === 2) return 'Proceed to Schedule';
    if (currentStep === 3) return 'Review & Pay';
    if (currentStep === 4) {
      if (!isAuthenticated) return 'Login to Book';
      if (!hasSufficientWallet) return `Add ₹${walletShortfall} & Book`;
      return `Pay ₹${advanceRequired} & Confirm`;
    }
    return 'Continue';
  };

  // Safe slot ISO date parser
  const parseValidSlotStartTime = (slot, dateStr) => {
    if (slot?.utcStartTime) {
      return new Date(slot.utcStartTime).toISOString();
    }
    if (slot?.startTime) {
      const raw = String(slot.startTime).trim();
      if (raw.includes('T')) return new Date(raw).toISOString();
      const isPM = raw.toUpperCase().includes('PM');
      const isAM = raw.toUpperCase().includes('AM');
      const clean = raw.replace(/AM|PM/i, '').trim();
      const parts = clean.split(':');
      let hours = parseInt(parts[0], 10) || 10;
      const mins = parseInt(parts[1], 10) || 0;
      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;
      const pad = (n) => String(n).padStart(2, '0');
      const parsed = new Date(`${dateStr}T${pad(hours)}:${pad(mins)}:00.000Z`);
      if (!isNaN(parsed.getTime())) return parsed.toISOString();
    }
    return new Date(`${dateStr}T10:00:00.000Z`).toISOString();
  };

  // Confirm booking
  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please log in to book your appointment and pay the 20% advance.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EC4899',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Login Now',
        customClass: {
          popup: 'rounded-2xl font-outfit text-sm',
          confirmButton: 'rounded-xl font-semibold text-sm px-6 py-2.5 text-white',
          cancelButton: 'rounded-xl font-semibold text-sm px-6 py-2.5'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/auth?redirect=/booking');
        }
      });
      return;
    }

    if (!selectedResult || selectedServices.length === 0 || !selectedSlot) {
      toast.error("Missing booking selection details.");
      return;
    }

    if (!hasSufficientWallet) {
      setIsTopupModalOpen(true);
      toast.error(`Insufficient wallet balance. Please add at least ₹${walletShortfall} to confirm.`);
      return;
    }

    const items = selectedServices.map(s => ({ serviceId: s._id }));
    const staffId = selectedStaff?._id || selectedSlot?.availableStaff?.[0]?._id;
    if (!staffId) {
      toast.error("No stylist/staff available for the selected slot.");
      return;
    }

    const serviceProviderId = selectedResult.provider?._id;
    const serviceAddress = [selectedResult.provider?.address, selectedResult.provider?.city].filter(Boolean).join(', ') || 'Delhi';
    const validSlotStartTime = parseValidSlotStartTime(selectedSlot, selectedDate);
    const validBookingDate = new Date(selectedDate).toISOString();

    // Build coupon codes for the booking payload (one per service that has a coupon applied)
    // We pass the first applied coupon code as the primary couponCode for the backend
    const firstApplied = Object.values(appliedCoupons)[0];

    const payload = {
      items,
      staffId,
      serviceProviderId,
      bookingDate: validBookingDate,
      slotStartTime: validSlotStartTime,
      serviceAddress,
      ...(firstApplied ? { couponCode: firstApplied.code } : {}),
    };

    setBookingConfirmLoading(true);
    try {
      const response = await createBooking(payload);
      const unpacked = response?.data?.data ?? response?.data ?? response;
      
      if (response.success || unpacked?.success || unpacked?._id) {
        const salonName = selectedResult.provider?.businessName || 'Beauty Lounge';
        const staffName = selectedStaff ? selectedStaff.name : (selectedSlot?.availableStaff?.find(st => st._id === staffId)?.name || 'Assigned Stylist');
        const bookingRef = unpacked?.bookingReference || unpacked?._id?.slice(-8).toUpperCase() || 'FF-' + Math.floor(100000 + Math.random() * 900000);

        setConfirmedBookingData({
          bookingId: unpacked?._id,
          bookingReference: bookingRef,
          salonName,
          salonAddress: serviceAddress,
          services: [...selectedServices],
          stylistName: staffName,
          date: selectedDate,
          time: selectedSlot.startTime,
          subtotal,
          couponDiscount,
          appliedCoupons: { ...appliedCoupons },
          netTotal,
          advancePaid: advanceRequired,
          remainingAtSalon
        });

        setCurrentStep(5);
        setMaxStepReached(5);
        sessionStorage.removeItem('ff_booking_draft');
        refreshWalletBalance();
        toast.success("Appointment successfully confirmed!");
      } else {
        Swal.fire({
          title: 'Booking Notice',
          text: response.message || 'Failed to create booking. Please try again.',
          icon: 'error',
          confirmButtonColor: '#EC4899',
          customClass: { popup: 'rounded-2xl font-outfit text-sm' }
        });
      }
    } catch (err) {
      console.error("Booking API execution error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to confirm booking.");
    } finally {
      setBookingConfirmLoading(false);
    }
  };

  const handleResetBooking = () => {
    setSelectedResult(null);
    setSelectedServices([]);
    setSelectedSlot(null);
    setSelectedStaff(null);
    setSlots([]);
    setAppliedCoupons({});
    setCouponInputs({});
    setCouponApplying({});
    setConfirmedBookingData(null);
    setCurrentStep(1);
    setMaxStepReached(1);
    sessionStorage.removeItem('ff_booking_draft');
  };

  // Custom Lead Modal handlers
  const handleOpenLeadModal = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to post custom requirements.");
      navigate('/auth?redirect=/booking');
      return;
    }
    setIsLeadModalOpen(true);
    setCategoriesLoading(true);
    try {
      const res = await getAllServiceCategories();
      const list = res?.data?.data || res?.data || res || [];
      setCategoriesList(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (leadSelectedCategories.length === 0) {
      toast.error("Please select at least one service category.");
      return;
    }
    setLeadSubmitting(true);
    try {
      const payload = {
        categoryIds: leadSelectedCategories,
        requirement: leadRequirement,
        budget: Number(leadBudget),
        preferredDate: new Date(leadPreferredDate).toISOString(),
        address: leadAddress,
        pincode: leadPincode,
        city: leadCity,
        state: leadState,
        location: { type: "Point", coordinates: [lng || 77.2090, lat || 28.6139] },
        quantity: Number(leadQuantity),
        phoneNumber: leadPhoneNumber,
        gender: leadGender
      };
      const res = await createServiceLead(payload);
      if (res?.success) {
        setIsLeadModalOpen(false);
        setLeadRequirement('');
        setLeadBudget('');
        setLeadPreferredDate('');
        setLeadAddress('');
        setLeadPincode('');
        setLeadCity('');
        setLeadState('');
        setLeadQuantity(1);
        setLeadPhoneNumber('');
        setLeadSelectedCategories([]);
        Swal.fire({
          title: 'Requirement Posted!',
          text: 'Local beauty lounges and stylists will contact you with quotes.',
          icon: 'success',
          confirmButtonColor: '#EC4899',
          customClass: { popup: 'rounded-2xl font-outfit text-sm' }
        });
      } else {
        toast.error(res?.message || 'Failed to submit request.');
      }
    } catch (err) {
      toast.error('Something went wrong. Please check fields and try again.');
    } finally {
      setLeadSubmitting(false);
    }
  };

  // Salons to display (Search results or fallback to all nearby)
  const displayedSalons = searchResults.length > 0 ? searchResults : allNearbySalons;
  const isShowingFallbackNotice = searchResults.length === 0 && allNearbySalons.length > 0 && activeSearchTerm !== '';

  // Active Salon Treatments (Step 2)
  const salonServices = useMemo(() => selectedResult?.services || [], [selectedResult]);

  const salonCategories = useMemo(() => {
    const cats = new Set();
    salonServices.forEach(s => {
      const type = s.serviceType || s.category?.name || s.category?.title;
      if (type) cats.add(type);
    });
    return Array.from(cats);
  }, [salonServices]);

  const displayedServices = useMemo(() => {
    return salonServices.filter(s => {
      const matchesCat = 
        selectedCategoryFilter === 'ALL' || 
        (s.serviceType && s.serviceType.toUpperCase() === selectedCategoryFilter.toUpperCase()) ||
        (s.category?.name && s.category.name.toUpperCase() === selectedCategoryFilter.toUpperCase());
      const title = (s.title || s.name || '').toLowerCase();
      const desc = (s.description || '').toLowerCase();
      const q = serviceSearchTerm.toLowerCase().trim();
      return matchesCat && (!q || title.includes(q) || desc.includes(q));
    });
  }, [salonServices, selectedCategoryFilter, serviceSearchTerm]);

  return (
    <div ref={topStepRef} className="bg-gray-50/70 min-h-screen font-outfit text-gray-800 pb-28 lg:pb-16 text-left">
      
      {/* Banner */}
      <div className="relative w-full overflow-hidden bg-[#fff0f4] border-b border-pink-100 shadow-2xs">
        <div className="relative w-full h-36 sm:h-44 md:h-52 flex items-center px-6 sm:px-12 md:px-20">
          <img
            src={bookingHeroImg}
            alt="Salon & Beauty Booking Hero"
            className="absolute inset-0 w-full h-full object-cover object-right sm:object-center opacity-90"
          />
          <div className="relative z-10 max-w-xl text-left py-2">
            <span className="text-[#ff4d6d] font-bold text-xs uppercase tracking-wide mb-1 block">
              Verified Salon Appointments
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-gray-900 leading-tight mb-1 tracking-tight">
              Book Beauty Services
            </h1>
            <p className="text-gray-600 text-sm max-w-md leading-relaxed hidden sm:block">
              Choose your local salon, select treatments, schedule your stylist & pay 20% advance securely.
            </p>
          </div>
        </div>
      </div>

      {/* Stepper (Steps 1 to 4) */}
      {currentStep <= 4 && (
        <BookingStepper
          currentStep={currentStep}
          maxStepReached={maxStepReached}
          onStepClick={handleStepChange}
        />
      )}

      {/* Layout Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Step 5: Confirmed Receipt */}
        {currentStep === 5 && confirmedBookingData && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-emerald-200 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
                <CheckCircle2 size={36} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                Booking Confirmed
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                Your Appointment is Scheduled!
              </h2>
              <p className="text-sm text-gray-500">
                Reference ID: <span className="font-semibold text-gray-800">{confirmedBookingData.bookingReference}</span>
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-gray-200">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold">Salon</span>
                  <p className="font-bold text-gray-900">{confirmedBookingData.salonName}</p>
                  <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                    <MapPin size={13} className="text-primary shrink-0" /> {confirmedBookingData.salonAddress}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold">Date & Time</span>
                  <p className="font-bold text-gray-900">{confirmedBookingData.date}</p>
                  <p className="text-xs text-primary font-semibold flex items-center gap-1 mt-0.5">
                    <Clock size={13} /> {confirmedBookingData.time}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-gray-600">Assigned Stylist:</span>
                <span className="font-bold text-primary bg-pink-50 px-3 py-1 rounded-lg">
                  {confirmedBookingData.stylistName}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-500 uppercase font-semibold">Booked Treatments</span>
                <div className="divide-y divide-gray-150 bg-white rounded-lg border border-gray-200 px-4 py-1">
                  {confirmedBookingData.services.map((svc) => (
                    <div key={svc._id} className="py-2 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{svc.title || svc.name}</p>
                        <p className="text-xs text-gray-400">{svc.durationMinutes || 30} mins</p>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ₹{svc.offeredPrice || svc.sellingPrice || svc.costPrice || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-gray-200 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Total Amount:</span>
                  <span className="font-semibold text-gray-900">₹{confirmedBookingData.subtotal}</span>
                </div>
                {confirmedBookingData.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount:</span>
                    <span>-₹{confirmedBookingData.couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <Wallet size={15} /> 20% Advance Paid via Wallet:
                  </span>
                  <span>₹{confirmedBookingData.advancePaid}</span>
                </div>
                <div className="flex justify-between text-gray-800 font-semibold pt-1">
                  <span>Balance Due at Salon:</span>
                  <span>₹{confirmedBookingData.remainingAtSalon}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex-1 py-3 px-5 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold text-sm transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>View My Appointments</span>
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={handleResetBooking}
                className="py-3 px-5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-all cursor-pointer"
              >
                Book Another Service
              </button>
            </div>
          </div>
        )}

        {/* Steps 1 to 4 Grid */}
        {currentStep <= 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* Left 65% Pane */}
            <div className="lg:col-span-8 min-w-0 space-y-6">

              {/* STEP 1: Select Salon & City */}
              {currentStep === 1 && (
                <div className="bg-white rounded-2xl p-5 sm:p-7 border border-gray-200 shadow-xs space-y-5">
                  
                  {/* Step Header */}
                  <div className="pb-3 border-b border-gray-150">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center">
                        1
                      </span>
                      <h2 className="text-lg font-bold text-gray-900">
                        Select Salon & City
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Choose a verified beauty lounge near you or search by city.
                    </p>
                  </div>

                  {/* Search Card */}
                  <div className="p-4 sm:p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">
                        Find Salon by Location
                      </span>
                      <button
                        type="button"
                        onClick={() => detectLocation(false)}
                        disabled={searchingLocation}
                        className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                      >
                        {searchingLocation ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                        <span>{searchingLocation ? 'Detecting...' : 'Detect GPS Location'}</span>
                      </button>
                    </div>

                    <form onSubmit={handleSearchClick} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-sm">
                      <div className="sm:col-span-7">
                        <div className="relative">
                          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                          <input
                            type="text"
                            placeholder="Enter city or salon name (e.g. Delhi, Karol Bagh)..."
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-800 outline-none focus:border-primary transition-all shadow-2xs"
                          />
                          {city && (
                            <button
                              type="button"
                              onClick={() => {
                                setCity('');
                                setActiveSearchTerm('');
                                handleSearch(lat, lng, '', maxDistanceKm);
                              }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                              <X size={15} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <select
                          value={maxDistanceKm}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setMaxDistanceKm(val);
                            handleSearch(lat, lng, city, val);
                          }}
                          className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-800 outline-none focus:border-primary cursor-pointer shadow-2xs"
                        >
                          <option value={25}>Within 25 KM</option>
                          <option value={50}>Within 50 KM</option>
                          <option value={100}>Within 100 KM</option>
                          <option value={250}>Within 250 KM</option>
                          <option value={2000}>All Distances</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
                        </button>
                      </div>
                    </form>

                    {/* Quick Filters */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-xs font-semibold text-gray-500">Quick Cities:</span>
                      {POPULAR_CITIES.map((c) => {
                        const isAll = c === 'All Salons';
                        const isSelected = isAll 
                          ? (city === '' && activeSearchTerm === '') 
                          : city.toLowerCase() === c.toLowerCase();

                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleSelectQuickCity(c)}
                            className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-primary text-white border-primary shadow-xs'
                                : 'bg-white border-gray-250 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fallback Notice */}
                  {isShowingFallbackNotice && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-amber-800">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-amber-600 shrink-0" />
                        <span>
                          No salons found in <strong>"{activeSearchTerm}"</strong>. Showing all verified lounges nearby:
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCity('');
                          setActiveSearchTerm('');
                          handleSearch(lat, lng, '', maxDistanceKm);
                        }}
                        className="font-bold text-amber-900 underline hover:no-underline cursor-pointer shrink-0"
                      >
                        Reset to All Salons
                      </button>
                    </div>
                  )}

                  {/* Salons List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-800">
                        {isShowingFallbackNotice ? 'Nearby Salons' : 'Available Salons'} ({displayedSalons.length})
                      </span>
                      {selectedResult && (
                        <span className="text-xs font-semibold text-primary capitalize">
                          Selected: {selectedResult.provider?.businessName}
                        </span>
                      )}
                    </div>

                    {loading ? (
                      <div className="py-16 flex flex-col items-center justify-center text-center">
                        <Loader2 size={32} className="animate-spin text-primary mb-2" />
                        <p className="text-sm text-gray-500 font-medium">Scanning nearby salons...</p>
                      </div>
                    ) : displayedSalons.length === 0 ? (
                      <div className="py-12 text-center border border-dashed border-gray-200 rounded-xl p-6">
                        <Store size={36} className="mx-auto text-gray-300 mb-2" />
                        <h4 className="text-sm font-semibold text-gray-700">No Lounges Found</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                          Try setting distance to "All Distances" or click "All Salons" above.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleSelectQuickCity('All Salons')}
                          className="mt-3 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          View All Salons
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {displayedSalons.map((result, idx) => {
                          const prov = result.provider;
                          const isSelected = selectedResult?.provider?._id === prov._id;
                          const servicesCount = result.services?.length || 0;

                          return (
                            <div
                              key={prov._id || idx}
                              onClick={() => handleSelectLounge(result)}
                              className={`p-4 sm:p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-4 ${
                                isSelected
                                  ? 'border-primary ring-2 ring-primary/20 bg-pink-50/40 shadow-xs'
                                  : 'border-gray-200 hover:border-gray-300 hover:shadow-xs bg-white'
                              }`}
                            >
                              <div className="flex items-start gap-3.5">
                                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                                  {result.services?.[0]?.images?.[0]?.url ? (
                                    <img
                                      src={result.services[0].images[0].url}
                                      alt={prov.businessName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Store size={24} className="text-gray-400" />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-base font-bold text-gray-900 truncate capitalize">
                                      {prov.businessName}
                                    </h4>
                                    <span className="flex items-center gap-1 text-xs font-bold text-primary bg-pink-50 px-2 py-0.5 rounded-md shrink-0">
                                      <Star size={12} className="fill-primary" /> {prov.rating || 5}
                                    </span>
                                  </div>

                                  <p className="text-xs sm:text-sm text-gray-600 font-medium truncate flex items-center gap-1 mt-1 capitalize">
                                    <MapPin size={13} className="text-primary shrink-0" />
                                    {prov.address || prov.city || 'Delhi'}
                                  </p>

                                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                                    <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-md">
                                      {servicesCount} Treatments
                                    </span>
                                    {prov.city && (
                                      <span className="text-xs font-semibold text-primary uppercase bg-pink-50 px-2.5 py-0.5 rounded-md">
                                        {prov.city}
                                      </span>
                                    )}
                                    {result.distanceKm !== undefined && (
                                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                                        {result.distanceKm} km away
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-gray-150 flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500">
                                  Verified Partner Salon
                                </span>
                                <div className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                  isSelected 
                                    ? 'bg-primary text-white shadow-xs' 
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}>
                                  {isSelected ? 'Selected ✓' : 'Select Salon'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Custom Lead Banner */}
                  <div className="p-4 sm:p-5 bg-pink-50/50 rounded-2xl border border-pink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Need a custom bridal package or group booking?</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Post your requirement to receive quotes directly from multiple local lounges.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenLeadModal}
                      className="px-4 py-2 bg-white hover:bg-pink-50 text-primary border border-primary/30 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer shadow-2xs"
                    >
                      Post Requirement
                    </button>
                  </div>

                  {/* Step 1 Footer */}
                  <div className="pt-4 border-t border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      {selectedResult ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Selected:</span>
                          <span className="px-3 py-1 rounded-xl bg-pink-50 border border-pink-200 text-primary font-bold text-xs sm:text-sm capitalize truncate max-w-[200px] sm:max-w-xs">
                            {selectedResult.provider?.businessName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm font-medium text-gray-500">
                          Select a salon above to proceed
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!selectedResult}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs sm:text-sm transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                    >
                      <span>Select Treatments</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>

                </div>
              )}

              {/* STEP 2: Choose Treatments */}
              {currentStep === 2 && (
                <div className="bg-white rounded-2xl p-5 sm:p-7 border border-gray-200 shadow-xs space-y-5">
                  
                  {/* Step Header */}
                  <div className="pb-3 border-b border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center">
                          2
                        </span>
                        <h2 className="text-lg font-bold text-gray-900">
                          Choose Treatments
                        </h2>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Select one or more services from {selectedResult?.provider?.businessName}.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-pink-50 border border-pink-200 px-3.5 py-1.5 rounded-xl shrink-0">
                      <div>
                        <p className="text-xs font-bold text-primary truncate max-w-[150px]">
                          {selectedResult?.provider?.businessName}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">
                          {selectedResult?.provider?.city || 'Verified'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer ml-2 border-l border-pink-200 pl-2"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Category Chips */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                      Filter by Category:
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryFilter('ALL')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                          selectedCategoryFilter === 'ALL'
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        All Treatments ({salonServices.length})
                      </button>
                      {salonCategories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategoryFilter(cat)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer capitalize ${
                            selectedCategoryFilter === cat
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search haircuts, facials, bridal packages, spa treatments..."
                      value={serviceSearchTerm}
                      onChange={(e) => setServiceSearchTerm(e.target.value)}
                      className="w-full pl-4 pr-9 py-2.5 bg-gray-50 border border-gray-250 rounded-xl text-sm font-medium text-gray-800 outline-none focus:border-primary focus:bg-white transition-all shadow-2xs"
                    />
                    {serviceSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setServiceSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Treatments Grid */}
                  {displayedServices.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-gray-200 rounded-xl p-6">
                      <Scissors size={32} className="mx-auto text-gray-300 mb-2" />
                      <h4 className="text-sm font-semibold text-gray-700">No Services Found</h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                        No treatments match your current filter. Try selecting "All Treatments".
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {displayedServices.map((service) => {
                        const isChecked = selectedServices.some(s => s._id === service._id);
                        const price = service.offeredPrice || service.sellingPrice || service.costPrice || 0;

                        return (
                          <div
                            key={service._id}
                            onClick={() => handleToggleService(service)}
                            className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3.5 ${
                              isChecked
                                ? 'border-primary ring-2 ring-primary/15 bg-pink-50/30 shadow-xs'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-xs bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-3.5">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-200 flex items-center justify-center">
                                {service.images?.[0]?.url ? (
                                  <img src={service.images[0].url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Scissors size={22} className="text-gray-300" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                {service.serviceType && (
                                  <span className="text-xs font-semibold text-primary bg-pink-50 px-2 py-0.5 rounded-md uppercase">
                                    {service.serviceType}
                                  </span>
                                )}
                                <h4 className={`text-base font-bold truncate mt-1 capitalize ${isChecked ? 'text-primary' : 'text-gray-900'}`}>
                                  {service.title || service.name}
                                </h4>
                                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                  {service.description || 'Professional salon treatment tailored for you.'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2.5 border-t border-gray-150">
                              <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <Clock size={13} className="text-primary" /> {service.durationMinutes || 30} mins
                              </span>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-base text-gray-900">₹{price}</span>
                                <div className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                  isChecked ? 'bg-primary text-white shadow-xs' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {isChecked ? 'Added ✓' : 'Add +'}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Step 2 Footer */}
                  <div className="pt-4 border-t border-gray-150 flex items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-3.5 sm:px-4 py-2.5 rounded-xl border border-gray-250 hover:bg-gray-50 font-bold text-xs sm:text-sm text-gray-700 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={selectedServices.length === 0}
                      className="flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs sm:text-sm transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <span>Proceed to Schedule</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                </div>
              )}

              {/* STEP 3: Schedule Date, Time Slot & Stylist */}
              {currentStep === 3 && (
                <div className="bg-white rounded-2xl p-5 sm:p-7 border border-gray-200 shadow-xs space-y-5">
                  <div className="pb-3 border-b border-gray-150">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center">
                        3
                      </span>
                      <h2 className="text-lg font-bold text-gray-900">
                        Date, Time Slot & Stylist
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Choose an available calendar slot and your preferred stylist at {selectedResult?.provider?.businessName}.
                    </p>
                  </div>

                  <DateTimeSlotSelector
                    selectedResult={selectedResult}
                    selectedServices={selectedServices}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedSlot={selectedSlot}
                    setSelectedSlot={setSelectedSlot}
                    selectedStaff={selectedStaff}
                    setSelectedStaff={setSelectedStaff}
                    slots={slots}
                    slotsLoading={slotsLoading}
                    scheduleRef={scheduleRef}
                  />

                  <div className="pt-4 border-t border-gray-150 flex items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-3.5 sm:px-4 py-2.5 rounded-xl border border-gray-250 hover:bg-gray-50 font-bold text-xs sm:text-sm text-gray-700 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!selectedSlot}
                      className="flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs sm:text-sm transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <span>Review & Pay</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Wallet Advance Verification */}
              {currentStep === 4 && (
                <div className="bg-white rounded-2xl p-5 sm:p-7 border border-gray-200 shadow-xs space-y-5">
                  <div className="pb-3 border-b border-gray-150">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center">
                        4
                      </span>
                      <h2 className="text-lg font-bold text-gray-900">
                        Review Booking & Pay Wallet Advance
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Verify your appointment details, apply coupons, and confirm with your 20% wallet advance.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Beauty Lounge</span>
                      <p className="font-bold text-gray-900 text-base capitalize">
                        {selectedResult?.provider?.businessName || 'Beauty Lounge'}
                      </p>
                      <p className="text-gray-600 text-xs sm:text-sm flex items-center gap-1 capitalize">
                        <MapPin size={13} className="text-primary shrink-0" />
                        {selectedResult?.provider?.address || selectedResult?.provider?.city || 'Delhi'}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Schedule & Specialist</span>
                      <p className="font-bold text-gray-900 text-base">
                        {selectedDate} at {selectedSlot?.startTime}
                      </p>
                      <p className="text-primary font-semibold text-xs sm:text-sm flex items-center gap-1">
                        <UserCheck size={14} /> Specialist: {selectedStaff?.name || selectedSlot?.availableStaff?.[0]?.name || 'Any Available Specialist'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                      Treatments Selected ({selectedServices.length}):
                    </span>
                    <div className="divide-y divide-gray-200 bg-gray-50/50 rounded-xl border border-gray-200 px-4 py-1">
                      {selectedServices.map((svc) => (
                        <div key={svc._id} className="py-3 flex items-center justify-between text-sm">
                          <div>
                            <p className="font-bold text-gray-900 capitalize">{svc.title || svc.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{svc.durationMinutes || 30} mins</p>
                          </div>
                          <span className="font-bold text-base text-gray-900">
                            ₹{svc.offeredPrice || svc.sellingPrice || svc.costPrice || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Per-Service Coupon Section ── */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Tag size={14} className="text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Service Coupons
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium ml-1">
                        (coupon codes are service-specific)
                      </span>
                    </div>

                    <div className="divide-y divide-gray-100 bg-gray-50/60 rounded-xl border border-gray-200">
                      {selectedServices.map((svc) => {
                        const svcId = svc._id;
                        const applied = appliedCoupons[svcId];
                        const inputVal = couponInputs[svcId] || '';
                        const isApplying = couponApplying[svcId] || false;
                        const price = svc.offeredPrice || svc.sellingPrice || svc.costPrice || 0;

                        return (
                          <div key={svcId} className="px-4 py-3 space-y-2">
                            {/* Service title + price row */}
                            <div className="flex items-center justify-between text-sm">
                              <div>
                                <p className="font-bold text-gray-900 capitalize">{svc.title || svc.name}</p>
                                <p className="text-xs text-gray-400">{svc.durationMinutes || 30} mins</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">₹{price}</p>
                                {applied && (
                                  <p className="text-xs text-emerald-600 font-semibold">-₹{applied.discountAmount} off</p>
                                )}
                              </div>
                            </div>

                            {/* Applied badge or coupon input */}
                            {applied ? (
                              <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                                  <span className="text-xs font-bold text-emerald-800">
                                    {applied.code} — Save ₹{applied.discountAmount}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCoupon(svcId)}
                                  className="text-[10px] font-bold text-emerald-700 hover:text-rose-600 uppercase transition-colors cursor-pointer ml-2 shrink-0"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <form
                                onSubmit={(e) => handleApplyCoupon(svcId, e)}
                                className="flex gap-2"
                              >
                                <input
                                  type="text"
                                  placeholder={`Coupon for ${(svc.title || svc.name || '').split(' ')[0]}...`}
                                  value={inputVal}
                                  onChange={(e) => setCouponInputForService(svcId, e.target.value.toUpperCase())}
                                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold uppercase outline-none focus:border-primary shadow-2xs min-w-0"
                                />
                                <button
                                  type="submit"
                                  disabled={isApplying || !inputVal.trim()}
                                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-[10px] font-bold uppercase disabled:opacity-50 transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
                                >
                                  {isApplying ? <Loader2 size={12} className="animate-spin" /> : 'Apply'}
                                </button>
                              </form>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>


                  <div className="p-4 sm:p-5 bg-pink-50/40 rounded-2xl border border-pink-100 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-gray-900">₹{subtotal}</span>
                    </div>
                    {/* Per-service coupon discount rows */}
                    {Object.entries(appliedCoupons).map(([svcId, c]) => (
                      <div key={svcId} className="flex justify-between text-emerald-600 font-medium text-xs">
                        <span className="flex items-center gap-1">
                          <Tag size={11} className="shrink-0" />
                          {c.code} ({c.serviceName?.split(' ')[0] || 'Service'}):
                        </span>
                        <span>-₹{c.discountAmount}</span>
                      </div>
                    ))}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold text-sm pt-1 border-t border-emerald-100">
                        <span>Total Coupon Savings:</span>
                        <span>-₹{couponDiscount}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-900 font-bold text-base pt-2 border-t border-gray-200">
                      <span>Total Service Amount:</span>
                      <span>₹{netTotal}</span>
                    </div>

                    <div className="pt-2 border-t border-dashed border-gray-200 space-y-1.5">
                      <div className="flex justify-between items-center text-primary font-bold">
                        <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                          <Wallet size={14} className="shrink-0" />
                          <span>20% Wallet Advance:</span>
                        </span>
                        <span className="text-sm sm:text-base font-black">₹{advanceRequired}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500">
                        <span>80% Balance at Salon:</span>
                        <span className="font-semibold text-gray-700">₹{remainingPayableAtSalon}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 sm:p-5 rounded-2xl border transition-all text-xs sm:text-sm ${
                    hasSufficientWallet 
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                      : 'bg-amber-50/80 border-amber-200 text-amber-900'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          hasSufficientWallet ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          <Wallet size={15} />
                        </div>
                        <div>
                          <p className="font-bold text-xs sm:text-sm">
                            Your Wallet Balance: ₹{userWalletBalance}
                          </p>
                          <p className="text-[11px] sm:text-xs opacity-85 mt-0.5">
                            {hasSufficientWallet 
                              ? `Sufficient balance. ₹${advanceRequired} will be debited upon booking.` 
                              : `Shortfall of ₹${walletShortfall}. You need at least ₹${advanceRequired} in your wallet.`
                            }
                          </p>
                        </div>
                      </div>

                      {!hasSufficientWallet && (
                        <button
                          type="button"
                          onClick={() => setIsTopupModalOpen(true)}
                          className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs text-center shrink-0 whitespace-nowrap"
                        >
                          + Recharge Wallet
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-150 flex items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-3.5 sm:px-4 py-2.5 rounded-xl border border-gray-250 hover:bg-gray-50 font-bold text-xs sm:text-sm text-gray-700 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={bookingConfirmLoading}
                      className="flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      {bookingConfirmLoading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Confirming...</span>
                        </>
                      ) : (
                        getNextButtonLabel()
                      )}
                    </button>
                  </div>

                </div>
              )}

            </div>

            {/* Right 35% Sticky Sidebar */}
            <div className="hidden lg:block lg:col-span-4 sticky top-6">
              <BookingSummarySidebar
                currentStep={currentStep}
                selectedResult={selectedResult}
                selectedServices={selectedServices}
                onRemoveService={handleRemoveService}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                selectedStaff={selectedStaff}
                appliedCoupons={appliedCoupons}
                couponDiscount={couponDiscount}
                walletBalance={userWalletBalance}
                walletLoading={walletLoading}
                onOpenTopupModal={() => setIsTopupModalOpen(true)}
                onNextStep={handleNextStep}
                onPrevStep={handlePrevStep}
                nextDisabled={isNextDisabled()}
                nextButtonLabel={getNextButtonLabel()}
                loadingAction={bookingConfirmLoading}
              />
            </div>

          </div>
        )}

      </div>

      {/* Floating Bottom Drawer (< 1024px) */}
      {currentStep <= 4 && (
        <BookingMobileFooter
          currentStep={currentStep}
          selectedServices={selectedServices}
          netTotal={netTotal}
          advanceRequired={advanceRequired}
          walletBalance={userWalletBalance}
          onNextStep={handleNextStep}
          nextDisabled={isNextDisabled()}
          nextButtonLabel={getNextButtonLabel()}
          loadingAction={bookingConfirmLoading}
        />
      )}

      {/* Topup Modal */}
      <WalletTopupModal
        isOpen={isTopupModalOpen}
        onClose={() => setIsTopupModalOpen(false)}
        shortfall={walletShortfall}
        currentBalance={userWalletBalance}
        onSuccess={() => {
          refreshWalletBalance();
          toast.success("Wallet successfully recharged!");
        }}
      />

      {/* Custom Lead Modal */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-150 flex flex-col">
            <div className="p-5 border-b border-gray-150 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-gray-900">Request Custom Service</h3>
                <p className="text-xs text-gray-500 mt-0.5">Post requirement details to receive quotes</p>
              </div>
              <button
                onClick={() => setIsLeadModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitLead} className="p-5 space-y-4 text-xs text-left">
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Select Categories *
                </label>
                {categoriesLoading ? (
                  <div className="flex items-center gap-1.5 py-1 text-gray-400">
                    <Loader2 size={13} className="animate-spin text-primary" /> Loading categories...
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categoriesList.map(cat => {
                      const isSelected = leadSelectedCategories.includes(cat._id);
                      return (
                        <button
                          key={cat._id}
                          type="button"
                          onClick={() => {
                            setLeadSelectedCategories(prev => 
                              prev.includes(cat._id) ? prev.filter(id => id !== cat._id) : [...prev, cat._id]
                            );
                          }}
                          className={`px-3 py-1.5 rounded-lg border font-semibold text-xs transition-all ${
                            isSelected 
                              ? 'bg-primary border-primary text-white shadow-xs' 
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {cat.label || cat.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Explain your Requirement *
                </label>
                <textarea
                  required
                  rows={3}
                  value={leadRequirement}
                  onChange={e => setLeadRequirement(e.target.value)}
                  placeholder="e.g. Bridal makeup, hair styling for wedding event..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-medium outline-none focus:border-primary bg-gray-50/50 resize-none text-gray-800 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Estimated Budget (₹) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={leadBudget}
                    onChange={e => setLeadBudget(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 font-medium outline-none focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Preferred Date *</label>
                  <input
                    type="datetime-local"
                    required
                    value={leadPreferredDate}
                    onChange={e => setLeadPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 font-medium outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={leadPhoneNumber}
                    onChange={e => setLeadPhoneNumber(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 font-medium outline-none focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Total Persons *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={leadQuantity}
                    onChange={e => setLeadQuantity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 font-medium outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={leadSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary/95 text-white rounded-xl font-semibold text-xs disabled:opacity-50"
                >
                  {leadSubmitting ? <Loader2 size={13} className="animate-spin" /> : null}
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Booking;
