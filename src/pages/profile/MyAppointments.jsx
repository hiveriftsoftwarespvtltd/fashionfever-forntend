import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  XCircle, 
  CheckCircle2, 
  Navigation,
  Star,
  User,
  Loader2,
  ChevronRight,
  ShoppingBag,
  Eye,
  Phone,
  X,
  Check,
  Copy,
  Scissors,
  CreditCard,
  Receipt,
  Sparkles
} from 'lucide-react';
import { getUserBookingHistory } from '../../api/serviceProviderService';
import { toast } from '../../utils/toast';
import UserSidebar from './UserSidebar';

const MyAppointments = () => {
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyId = (id, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('Booking ID copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTimeSlot = (startTime, endTime) => {
    const formatSingle = (str) => {
      if (!str) return '';
      if (typeof str === 'string' && str.includes('T')) {
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
      }
      return str;
    };

    const start = formatSingle(startTime);
    const end = formatSingle(endTime);
    if (start && end) return `${start} - ${end}`;
    return start || end || 'Flexible Slot';
  };

  const getStatusStyle = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-600 border border-red-200';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  useEffect(() => {
    if (selectedBooking) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedBooking]);

  useEffect(() => {
    const fetchBookingHistory = async () => {
      setLoading(true);
      try {
        // Calculate dynamic range: 6 months ago to 6 months in future
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        const sixMonthsAhead = new Date();
        sixMonthsAhead.setMonth(today.getMonth() + 6);
        
        const formatDateString = (date) => {
          return date.toISOString().split('T')[0];
        };
        
        const startDate = formatDateString(sixMonthsAgo);
        const endDate = formatDateString(sixMonthsAhead);

        const res = await getUserBookingHistory(startDate, endDate);
        const unpacked = res?.data?.data ?? res?.data ?? res;
        if (Array.isArray(unpacked)) {
          setAppointments(unpacked);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        console.error("Failed to load appointments history:", err);
        toast.error("Failed to fetch booking history.");
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingHistory();
  }, []);

  const isUpcoming = (apt) => {
    // If the booking is completed or cancelled, it goes to past visits
    if (apt.bookingStatus === 'CANCELLED' || apt.bookingStatus === 'COMPLETED') return false;
    
    // Otherwise, check date
    const date = new Date(apt.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const filtered = appointments.filter(apt => {
    const upcoming = isUpcoming(apt);
    return activeFilter === 'upcoming' ? upcoming : !upcoming;
  });

  if (loading) {
    return (
      <div className="bg-[#f8f9fa] min-h-screen py-10 font-outfit text-gray-800">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <UserSidebar />
            <div className="flex-grow bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-primary" size={36} />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Hydrating Appointments Pipeline...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 font-outfit text-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 italic">My Appointments</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar */}
          <UserSidebar />

          {/* Right Content */}
          <div className="flex-grow space-y-6">
            
            {/* Header Block Section */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 text-left space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-black text-primary uppercase block">Salon Services Pipeline</span>
                  <h1 className="text-2xl font-black uppercase text-gray-900 flex items-center gap-2">
                    <ShoppingBag className="text-primary stroke-[2.5]" size={24} /> My Appointments
                  </h1>
                </div>
                
                {/* Modern Switcher Bar */}
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100/60 self-start sm:self-center">
                  <button 
                    onClick={() => setActiveFilter('upcoming')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all duration-300 cursor-pointer ${
                      activeFilter === 'upcoming' 
                        ? 'bg-white text-primary shadow-sm' 
                        : 'text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    Upcoming Slots
                  </button>
                  <button 
                    onClick={() => setActiveFilter('past')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all duration-300 cursor-pointer ${
                      activeFilter === 'past' 
                        ? 'bg-white text-primary shadow-sm' 
                        : 'text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    Past Visits
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Card Container Grid */}
            <div className="space-y-4">
               {filtered.length > 0 ? filtered.map((apt) => {
                 const bookingDateStr = apt.bookingDate 
                   ? new Date(apt.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                   : 'N/A';
                 const isAptUpcoming = isUpcoming(apt);
                 
                 // Map bookingStatus to styling
                 let statusStyle = 'bg-gray-100 text-gray-500';
                 if (apt.bookingStatus === 'CONFIRMED') statusStyle = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                 if (apt.bookingStatus === 'PENDING') statusStyle = 'bg-amber-50 text-amber-600 border border-amber-100';
                 if (apt.bookingStatus === 'CANCELLED') statusStyle = 'bg-red-50 text-red-600 border border-red-100';
                 if (apt.bookingStatus === 'COMPLETED') statusStyle = 'bg-blue-50 text-blue-600 border border-blue-100';

                 return (
                   <div 
                     key={apt._id} 
                     className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 flex flex-col md:flex-row gap-6 items-start md:items-center group hover:shadow-xl transition-all duration-300"
                   >
                      {/* Compact Thumbnail Icon Area */}
                      <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0 relative border border-pink-50 mx-auto md:mx-0">
                         <Calendar className="text-primary" size={28} />
                      </div>
                      
                      {/* Center Content Metadata Node */}
                      <div className="flex-grow text-left space-y-1.5 w-full">
                         <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md ${statusStyle}`}>
                               {apt.bookingStatus || 'Pending'}
                            </span>
                            <span className="text-xs font-mono font-bold text-gray-400 uppercase">ID: #${apt._id.substring(apt._id.length - 6).toUpperCase()}</span>
                         </div>
                         
                         <h3 className="text-xs sm:text-sm font-extrabold text-gray-800 line-clamp-1 uppercase leading-snug">
                            Appointment at {apt.providerId?.businessName || 'Beauty Salon'}
                         </h3>
                         
                         {/* Parameters Spacing Strip */}
                         <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-sm font-bold text-gray-400 uppercase">
                            <div className="flex items-center gap-1">
                               <Calendar size={14} className="text-primary flex-shrink-0" /> 
                               <span className="text-gray-600 font-extrabold">{bookingDateStr}</span>
                            </div>
                            <div className="flex items-center gap-1">
                               <Clock size={14} className="text-primary flex-shrink-0" /> 
                               <span className="text-gray-600 font-extrabold">{formatTimeSlot(apt.slotStartTime, apt.slotEndTime)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                               <User size={14} className="text-primary flex-shrink-0" />
                               <span className="text-gray-600 font-extrabold">Stylist: {apt.staffId?.name || 'Any'}</span>
                            </div>
                            <div className="flex items-center gap-1 truncate max-w-[200px]">
                               <MapPin size={14} className="text-primary flex-shrink-0" /> 
                               <span className="truncate text-gray-500 font-bold">{apt.serviceAddress || apt.providerId?.address}</span>
                            </div>
                         </div>
                      </div>
      
                      {/* Right Area Info: Total amount & Actions */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 w-full md:w-auto md:min-w-[160px] border-t md:border-t-0 border-gray-50 pt-4 md:pt-0">
                         <div className="text-left md:text-right">
                            <p className="text-xs font-bold uppercase text-gray-400">Total Amount</p>
                            <p className="text-base font-black text-gray-900">₹{apt.totalAmount ?? apt.subtotal ?? 0}</p>
                         </div>
                         <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-auto">
                            <button
                               onClick={() => setSelectedBooking(apt)}
                               className="flex-1 md:w-full bg-primary hover:bg-primary/90 text-white px-3.5 py-2.5 rounded-xl font-bold uppercase text-xs shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                            >
                               <Eye size={13} /> View Details
                            </button>
                            {isAptUpcoming && apt.bookingStatus !== 'CANCELLED' && (
                               <button 
                                 onClick={() => {
                                   if (apt.providerId?.phone) {
                                     window.open(`tel:${apt.providerId.phone}`);
                                   } else {
                                     toast.info('Salon phone not available');
                                   }
                                 }}
                                 className="flex-1 md:w-full bg-gray-900 hover:bg-black text-white px-3.5 py-2.5 rounded-xl font-bold uppercase text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                               >
                                  <Phone size={13} /> Contact Salon
                               </button>
                            )}
                            {apt.bookingStatus === 'COMPLETED' && (
                              <button 
                                onClick={() => toast.success("Feature coming soon!")}
                                className="w-full border border-primary/20 hover:border-primary text-primary py-2.5 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-1.5 transition-all hover:bg-primary hover:text-white cursor-pointer shadow-sm shadow-primary/5 active:scale-95"
                              >
                                 <Star size={13} fill="currentColor" /> Leave Review
                              </button>
                            )}
                         </div>
                      </div>
                   </div>
                 );
               }) : (
                 /* Empty Placeholder State Grid */
                 <div className="bg-white py-20 rounded-3xl text-center border border-dashed border-gray-200 shadow-sm animate-in fade-in duration-300">
                    <Calendar size={36} className="mx-auto text-gray-200 mb-4" />
                    <h3 className="text-sm font-bold text-gray-400 uppercase">No Logged Sessions</h3>
                    <p className="text-sm font-bold text-gray-300 uppercase mt-1">Time to book your premium beauty service tier!</p>
                 </div>
               )}
            </div>

          </div>{/* end right */}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setSelectedBooking(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden relative z-10 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-pink-50/50 to-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Scissors size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-tight">Booking Details</h2>
                    <span className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full ${getStatusStyle(selectedBooking.bookingStatus)}`}>
                      {selectedBooking.bookingStatus || 'Confirmed'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-mono font-bold text-gray-400">ID: #{selectedBooking._id}</span>
                    <button 
                      onClick={(e) => handleCopyId(selectedBooking._id, e)} 
                      className="text-gray-400 hover:text-primary p-0.5 rounded transition-colors"
                      title="Copy Booking ID"
                    >
                      {copiedId === selectedBooking._id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-left custom-scrollbar">
              
              {/* Salon & Stylist Summary Card */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Salon / Provider</p>
                    <h4 className="text-sm sm:text-base font-black text-gray-800 uppercase mt-0.5">
                      {selectedBooking.providerId?.businessName || 'Beauty Salon'}
                    </h4>
                  </div>
                  {selectedBooking.providerId?.phone && (
                    <a
                      href={`tel:${selectedBooking.providerId.phone}`}
                      className="inline-flex items-center gap-1.5 self-start sm:self-auto bg-white border border-gray-200 hover:border-gray-900 text-gray-800 px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase transition-all shadow-sm"
                    >
                      <Phone size={12} className="text-primary" /> {selectedBooking.providerId.phone}
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-gray-200/60 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-400 uppercase text-xs block">Location</span>
                      <span className="font-bold text-gray-700">
                        {selectedBooking.serviceAddress || selectedBooking.providerId?.address || 'Salon Location'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <User size={14} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-400 uppercase text-xs block">Stylist Assigned</span>
                      <span className="font-bold text-gray-700">
                        {selectedBooking.staffId?.name || 'Any Available Stylist'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slot & Schedule Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-pink-50/50 border border-pink-100">
                  <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Scheduled Date</p>
                    <p className="text-xs sm:text-sm font-black text-gray-800">
                      {selectedBooking.bookingDate 
                        ? new Date(selectedBooking.bookingDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-pink-50/50 border border-pink-100">
                  <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Time Slot</p>
                    <p className="text-xs sm:text-sm font-black text-gray-800">
                      {formatTimeSlot(selectedBooking.slotStartTime, selectedBooking.slotEndTime)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booked Services List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">
                    Booked Services ({selectedBooking.items?.length || 0})
                  </h4>
                </div>

                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-white">
                  {selectedBooking.items && selectedBooking.items.length > 0 ? (
                    selectedBooking.items.map((item, idx) => {
                      const itemTitle = item.serviceName || item.serviceId?.title || `Service #${idx + 1}`;
                      const itemPrice = item.offeredPrice ?? item.sellingPrice ?? item.costPrice ?? item.price ?? item.total ?? 0;
                      const duration = item.serviceId?.duration;

                      return (
                        <div key={idx} className="p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
                              <Scissors size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-extrabold text-gray-800 truncate uppercase">{itemTitle}</p>
                              {duration && (
                                <p className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
                                  <Clock size={10} /> {duration} Mins
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-xs sm:text-sm font-black text-gray-900">₹{itemPrice}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-400 font-bold">Standard Appointment Service</div>
                  )}
                </div>
              </div>

              {/* Payment & Bill Summary */}
              <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2.5">
                <div className="flex items-center gap-1.5 pb-2 border-b border-gray-200/60">
                  <Receipt size={14} className="text-primary" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-700">Payment Summary</h4>
                </div>

                <div className="space-y-1.5 text-xs font-bold text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>₹{selectedBooking.subtotal || selectedBooking.totalAmount || 0}</span>
                  </div>

                  {selectedBooking.couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Coupon Discount</span>
                      <span>- ₹{selectedBooking.couponDiscount}</span>
                    </div>
                  )}

                  {selectedBooking.influencerDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Influencer Discount</span>
                      <span>- ₹{selectedBooking.influencerDiscount}</span>
                    </div>
                  )}

                  {selectedBooking.walletAmountUsed > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>Wallet Used</span>
                      <span>- ₹{selectedBooking.walletAmountUsed}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-black text-gray-900">
                    <span>Total Amount</span>
                    <span className="text-primary text-base">₹{selectedBooking.totalAmount ?? selectedBooking.subtotal ?? 0}</span>
                  </div>

                  {selectedBooking.advanceAmount > 0 && (
                    <div className="flex justify-between text-[11px] text-gray-500 pt-1">
                      <span>Advance Paid</span>
                      <span className="text-emerald-600 font-extrabold">₹{selectedBooking.advanceAmount}</span>
                    </div>
                  )}

                  {selectedBooking.remainingAmount > 0 && (
                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>Remaining to pay at Salon</span>
                      <span className="text-amber-600 font-extrabold">₹{selectedBooking.remainingAmount}</span>
                    </div>
                  )}
                </div>

                {/* Payment Method & Status Pill */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-500 font-bold uppercase text-[11px]">
                    <CreditCard size={13} className="text-gray-400" />
                    <span>Method: {selectedBooking.paymentMethod || 'Online'}</span>
                  </div>
                  <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    selectedBooking.paymentStatus === 'PAID' || selectedBooking.paymentStatus === 'SUCCESS'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    Payment {selectedBooking.paymentStatus || 'Pending'}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
              <span className="text-[11px] font-bold text-gray-400 text-center sm:text-left">
                Need help? Call salon or visit help center
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {selectedBooking.providerId?.phone && (
                  <button
                    onClick={() => window.open(`tel:${selectedBooking.providerId.phone}`)}
                    className="flex-1 sm:flex-initial bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Phone size={13} /> Call Salon
                  </button>
                )}
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1 sm:flex-initial bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase transition-all cursor-pointer active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
