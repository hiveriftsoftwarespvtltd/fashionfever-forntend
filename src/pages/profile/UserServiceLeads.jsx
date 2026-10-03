import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  Loader2, 
  ChevronRight, 
  ClipboardList, 
  IndianRupee,
  Users,
  Info,
  Phone
} from 'lucide-react';
import { getUserServiceLeads } from '../../api/serviceProviderService';
import { toast } from '../../utils/toast';
import UserSidebar from './UserSidebar';

const UserServiceLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await getUserServiceLeads();
      const list = res?.data?.data ?? res?.data ?? res;
      if (Array.isArray(list)) {
        // Sort by newest leads first
        const sorted = list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setLeads(sorted);
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.error("Failed to load user service leads:", err);
      toast.error("Failed to fetch custom service requests.");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'OPEN':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-500 border border-gray-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-600 border border-rose-100';
      default:
        return 'bg-amber-50 text-amber-600 border border-amber-100';
    }
  };

  const renderVal = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      return val.label || val.name || '';
    }
    return String(val);
  };

  if (loading) {
    return (
      <div className="bg-[#f8f9fa] min-h-screen py-10 font-outfit text-gray-800">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8">
            <UserSidebar />
            <div className="flex-grow bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-primary" size={36} />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Service Requests...</p>
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
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-8 text-left">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/profile" className="hover:text-primary transition-colors">Profile</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 italic">Custom Requests</span>
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
                  <span className="text-sm font-black text-primary uppercase block">Beauty Leads Portal</span>
                  <h1 className="text-2xl font-black uppercase text-gray-900 flex items-center gap-2">
                    <ClipboardList className="text-primary stroke-[2.5]" size={24} /> Custom Service Requests
                  </h1>
                </div>
                
                <Link
                  to="/booking"
                  className="bg-primary hover:bg-primary/95 text-white font-bold uppercase text-xs tracking-wider px-5 py-3 rounded-xl shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center self-start sm:self-center"
                >
                  Create New Request
                </Link>
              </div>
            </div>

            {/* Leads Cards Container */}
            <div className="space-y-4 text-left">
              {leads.length > 0 ? (
                leads.map((lead) => {
                  const preferredDateStr = lead.preferredDate 
                    ? new Date(lead.preferredDate).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })
                    : 'N/A';
                  
                  const createdDateStr = lead.createdAt
                    ? new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'N/A';

                  const categories = lead.categoryIds && lead.categoryIds.length > 0
                    ? lead.categoryIds
                        .map(c => {
                          if (!c) return 'Service';
                          if (typeof c === 'object') return c.label || c.name || 'Service';
                          return String(c);
                        })
                        .join(', ')
                    : 'Beauty Service';

                  const budgetAmount = typeof lead.budget === 'number' 
                    ? lead.budget.toLocaleString('en-IN') 
                    : (lead.budget && typeof lead.budget === 'object' ? '' : String(lead.budget || '0'));

                  const totalPersonsCount = lead.totalPersons || lead.quantity || 1;

                  return (
                    <div 
                      key={lead._id}
                      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 relative group"
                    >
                      {/* Top Header Card Info */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-50">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-primary uppercase bg-primary/5 px-2.5 py-1 rounded-lg">
                            {categories}
                          </span>
                          <span className="text-xs text-gray-400 font-medium uppercase block mt-1">
                            Posted on {createdDateStr}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Budget tag */}
                          <div className="flex items-center gap-0.5 text-xs font-black text-gray-900 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                            <IndianRupee size={12} className="text-emerald-500" />
                            <span>₹{budgetAmount}</span>
                          </div>

                          {/* Status badge */}
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${getStatusBadgeClass(renderVal(lead.status))}`}>
                            {renderVal(lead.status)}
                          </span>
                        </div>
                      </div>

                      {/* Main requirements descriptions */}
                      <div className="space-y-3 mb-5">
                        <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                          {renderVal(lead.requirement)}
                        </p>
                      </div>

                      {/* Metadata specs row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold uppercase text-gray-400">
                        {/* Preferred Date */}
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-primary flex-shrink-0" />
                          <div>
                            <span className="text-xs font-semibold text-gray-500 block leading-none mb-0.5">Preferred Schedule</span>
                            <span className="text-gray-700 font-bold">{preferredDateStr}</span>
                          </div>
                        </div>

                        {/* Persons (Qty) / Gender */}
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-primary flex-shrink-0" />
                          <div>
                            <span className="text-xs font-semibold text-gray-500 block leading-none mb-0.5">Quantity & Gender</span>
                            <span className="text-gray-700 font-bold">
                              {renderVal(totalPersonsCount)} Person(s) • {renderVal(lead.gender || 'Any')}
                            </span>
                          </div>
                        </div>

                        {/* Location address */}
                        <div className="flex items-center gap-2 sm:col-span-2 md:col-span-1">
                          <MapPin size={14} className="text-primary flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-gray-500 block leading-none mb-0.5">Service Location</span>
                            <span className="text-gray-700 font-bold truncate block" title={`${renderVal(lead.address)}, ${renderVal(lead.city)}, ${renderVal(lead.state)} - ${renderVal(lead.pincode)}`}>
                              {renderVal(lead.city)}, {renderVal(lead.state)} ({renderVal(lead.pincode)})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expandable address details and phone details on hover */}
                      <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-gray-500 bg-gray-50/50 -mx-6 -mb-6 px-6 py-4 rounded-b-3xl">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate" title={renderVal(lead.address)}>Address: {renderVal(lead.address)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Phone size={11} className="text-gray-400" />
                          <span>Phone: {renderVal(lead.phoneNumber)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 flex flex-col items-center justify-center text-center p-6">
                  <Info size={40} className="text-gray-300 mb-4" />
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide">No Custom Requests Posted</h3>
                  <p className="text-xs text-gray-500 font-medium mt-2 max-w-sm leading-relaxed">
                    Have a wedding event or custom makeup requirements? Request custom service details and let verified salons offer quotes.
                  </p>
                  <Link
                    to="/booking"
                    className="mt-6 bg-primary hover:bg-primary/95 text-white font-bold uppercase text-xs tracking-wider px-6 py-3.5 rounded-xl shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Post Requirement Now
                  </Link>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default UserServiceLeads;
