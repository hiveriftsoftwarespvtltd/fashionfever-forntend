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
  ShoppingBag
} from 'lucide-react';
import { getUserBookingHistory } from '../../api/serviceProviderService';
import { toast } from '../../utils/toast';
import UserSidebar from './UserSidebar';

const MyAppointments = () => {
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <div className="flex flex-col lg:flex-row gap-8">
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

        <div className="flex flex-col lg:flex-row gap-8">
          
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
                               <span className="text-gray-600 font-extrabold">{apt.slotStartTime} - {apt.slotEndTime || '1 hr'}</span>
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
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 w-full md:w-auto md:min-w-[150px] border-t md:border-t-0 border-gray-50 pt-4 md:pt-0">
                         <div className="text-left md:text-right">
                            <p className="text-xs font-bold uppercase text-gray-400">Total Amount</p>
                            <p className="text-sm font-black text-gray-900">₹{apt.totalAmount || apt.subtotal}</p>
                         </div>
                         <div className="flex gap-2 w-full md:w-auto">
                            {isAptUpcoming && apt.bookingStatus !== 'CANCELLED' ? (
                              <>
                                 <button 
                                   onClick={() => toast.info(`Contact Salon: ${apt.providerId?.phone || 'N/A'}`)}
                                   className="flex-1 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl font-bold uppercase text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                                 >
                                    Contact Salon
                                 </button>
                              </>
                            ) : (
                              apt.bookingStatus === 'COMPLETED' && (
                                <button 
                                  onClick={() => toast.success("Feature coming soon!")}
                                  className="w-full border border-primary/20 hover:border-primary text-primary py-2.5 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-1.5 transition-all hover:bg-primary hover:text-white cursor-pointer shadow-sm shadow-primary/5"
                                >
                                   <Star size={13} fill="currentColor" /> Leave Review
                                </button>
                              )
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
    </div>
  );
};

export default MyAppointments;
