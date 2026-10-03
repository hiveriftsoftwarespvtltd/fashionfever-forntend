import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, ClipboardList, IndianRupee, MapPin, Eye, Search, AlertCircle, Calendar, Users, Phone, Shield } from 'lucide-react';
import { getServiceProviderMyLeads } from '../../../api/serviceProviderService';
import { toast } from '../../../utils/toast';
import DataTable from '../../../components/shared/DataTable';

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    : '—';

const ServiceProviderLeads = ({ isDarkMode }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getServiceProviderMyLeads();
      if (res?.success) {
        const data = res.data?.data ?? res.data ?? [];
        setLeads(Array.isArray(data) ? data : []);
      } else {
        setError(res?.message || 'Failed to load service leads.');
        toast.error(res?.message || 'Failed to load service leads.');
      }
    } catch (err) {
      console.error(err);
      const msg = 'Something went wrong while fetching service leads.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Safe string render helper
  const renderVal = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      return val.label || val.name || '';
    }
    return String(val);
  };

  // Filters
  const filteredLeads = leads.filter((lead) => {
    // Status Filter
    if (filterStatus !== 'all' && lead.status?.toUpperCase() !== filterStatus.toUpperCase()) return false;

    // Search query matches requirement, user name, city, state, or phone
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchRequirement = lead.requirement?.toLowerCase().includes(term);
      const matchName = lead.name?.toLowerCase().includes(term) || lead.userId?.name?.toLowerCase().includes(term);
      const matchCity = lead.city?.toLowerCase().includes(term);
      const matchState = lead.state?.toLowerCase().includes(term);
      const matchPhone = lead.phoneNumber?.includes(term);
      return matchRequirement || matchName || matchCity || matchState || matchPhone;
    }

    return true;
  });

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'OPEN':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'CLOSED':
        return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    }
  };

  const columns = [
    {
      header: 'Customer Details',
      render: (lead) => (
        <div className="flex items-center gap-3 text-left min-w-[180px]">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs border ${isDarkMode ? 'bg-gray-800 border-white/5' : 'bg-gray-100 border-gray-200 shadow-xs'} flex-shrink-0`}>
            <span className="text-primary font-bold">
              {(renderVal(lead.name || lead.userId?.name || 'U').charAt(0)).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`text-xs font-black uppercase truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {renderVal(lead.name || lead.userId?.name || 'Customer')}
            </span>
            <span className="text-xs font-medium text-gray-400 lowercase truncate">
              {renderVal(lead.email || lead.userId?.email || '—')}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Requirement',
      render: (lead) => (
        <div className="flex flex-col text-left max-w-[280px]">
          <span className={`text-xs font-semibold line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {renderVal(lead.requirement)}
          </span>
          <span className="text-xs font-medium text-gray-400 uppercase mt-1">
            Category: {lead.categoryIds?.map(c => renderVal(c)).filter(Boolean).join(', ') || 'Beauty Service'}
          </span>
        </div>
      )
    },
    {
      header: 'Budget & Persons',
      render: (lead) => {
        const budgetAmount = typeof lead.budget === 'number' 
          ? lead.budget.toLocaleString('en-IN') 
          : (lead.budget && typeof lead.budget === 'object' ? '' : String(lead.budget || '0'));
        return (
          <div className="flex flex-col text-left">
            <span className={`text-xs font-black flex items-center gap-0.5 ${isDarkMode ? 'text-gray-200' : 'text-gray-805'}`}>
              <IndianRupee size={12} className="text-emerald-500" /> {budgetAmount}
            </span>
            <span className="text-xs font-semibold text-gray-500 uppercase mt-0.5">
              Qty: {lead.totalPersons || lead.quantity || 1} • {renderVal(lead.gender || 'Any')}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Preferred Date',
      render: (lead) => (
        <div className="flex flex-col text-left text-xs font-bold text-gray-500">
          <span className={isDarkMode ? 'text-gray-305' : 'text-gray-600'}>
            {formatDate(lead.preferredDate)}
          </span>
        </div>
      )
    },
    {
      header: 'Location & Contact',
      render: (lead) => (
        <div className="flex flex-col text-left max-w-[180px]">
          <span className={`text-xs font-bold truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} title={`${renderVal(lead.address)}, ${renderVal(lead.city)}, ${renderVal(lead.state)}`}>
            {renderVal(lead.city)}, {renderVal(lead.state)}
          </span>
          <span className="text-xs font-medium text-gray-400 uppercase mt-0.5">
            {renderVal(lead.phoneNumber || '—')}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      render: (lead) => (
        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${getStatusBadgeClass(renderVal(lead.status))}`}>
          {renderVal(lead.status || 'OPEN')}
        </span>
      )
    },
    {
      header: 'Action',
      render: (lead) => (
        <button
          onClick={() => setSelectedLead(lead)}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            isDarkMode 
              ? 'hover:bg-white/5 text-gray-400 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
          }`}
          title="View Details"
        >
          <Eye size={15} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Upper header action blocks */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h1 className={`text-2xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>
            Customer Leads Pipeline
          </h1>
          <p className={`text-xs font-semibold mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Explore custom client requests, wedding styling demands, and salon requirements.
          </p>
        </div>
        
        <button
          onClick={fetchLeads}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            isDarkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-white'
              : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm'
          }`}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh Pipeline
        </button>
      </div>

      {/* Filter and search bar */}
      <div className={`p-4 rounded-3xl border flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between ${
        isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        {/* Status switcher tabs */}
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100/60 self-start md:self-center overflow-x-auto max-w-full">
          {['all', 'OPEN', 'IN_PROGRESS', 'CLOSED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-white text-primary shadow-xs font-extrabold'
                  : 'text-gray-400 hover:text-gray-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Input bar */}
        <div className="relative flex items-center w-full md:w-80">
          <Search size={14} className="absolute left-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, city or requirements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-2xl text-xs font-bold outline-none border transition-all ${
              isDarkMode
                ? 'bg-gray-800 border-white/5 text-white focus:border-primary/40 focus:ring-4 focus:ring-primary/5'
                : 'bg-gray-50 border-gray-150 text-gray-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5'
            }`}
          />
        </div>
      </div>

      {/* Leads DataTable table panel */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-primary" size={36} />
          <p className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Hydrating Customer Leads Pipeline...
          </p>
        </div>
      ) : error ? (
        <div className={`p-8 rounded-3xl border text-center flex flex-col items-center justify-center gap-3 ${
          isDarkMode ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50 border-red-100'
        }`}>
          <AlertCircle className="text-red-500" size={32} />
          <p className="text-xs font-black text-red-600 uppercase tracking-wide">{error}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredLeads}
          isDarkMode={isDarkMode}
          emptyMessage="No customer service leads found matching criteria."
        />
      )}

      {/* Leads Detail View Modal Dialog */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-3xl shadow-2xl border flex flex-col overflow-hidden animate-in scale-in-95 duration-200 ${
            isDarkMode ? 'bg-gray-900 border-white/5 text-white' : 'bg-white border-gray-100 text-gray-800'
          }`}>
            {/* Modal Header */}
            <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
              <div className="flex items-center gap-2.5">
                <ClipboardList className="text-primary stroke-[2.5]" size={20} />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Service Lead Inspection</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase mt-0.5">ID: {selectedLead._id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isDarkMode ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-705'
                }`}
              >
                <Eye size={18} className="rotate-45" /> {/* simple cross close visual replacement */}
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] text-xs text-left">
              {/* User Profiling grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  <span className="text-xs font-bold text-gray-400 uppercase block mb-2 tracking-wider">Customer Contact</span>
                  <div className="space-y-1.5 font-semibold text-gray-600">
                    <p><strong className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Name:</strong> {renderVal(selectedLead.name || selectedLead.userId?.name || '—')}</p>
                    <p><strong className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Email:</strong> {renderVal(selectedLead.email || selectedLead.userId?.email || '—')}</p>
                    <p><strong className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Phone:</strong> {renderVal(selectedLead.phoneNumber || '—')}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  <span className="text-xs font-bold text-gray-400 uppercase block mb-2 tracking-wider">Lead Coordinates & Location</span>
                  <div className="space-y-1.5 font-semibold text-gray-600">
                    <p><strong className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Pincode:</strong> {renderVal(selectedLead.pincode)}</p>
                    <p><strong className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>City / State:</strong> {renderVal(selectedLead.city)}, {renderVal(selectedLead.state)}</p>
                    <p><strong className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Coordinates:</strong> [{selectedLead.location?.coordinates?.join(', ')}]</p>
                  </div>
                </div>
              </div>

              {/* Requirement detailed text block */}
              <div className={`p-4 rounded-2xl border text-left ${isDarkMode ? 'bg-gray-800/40 border-white/5' : 'bg-gray-55 border-gray-100'}`}>
                <span className="text-xs font-bold text-gray-400 uppercase block mb-2 tracking-wider">Requirement Details</span>
                <p className={`text-xs font-semibold leading-relaxed ${isDarkMode ? 'text-gray-350' : 'text-gray-700'}`}>
                  {renderVal(selectedLead.requirement)}
                </p>
              </div>

              {/* Specs detailed specs list grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-gray-800/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  <Calendar size={15} className="mx-auto text-primary mb-1" />
                  <span className="text-xs font-semibold text-gray-400 uppercase block">Schedule</span>
                  <span className={`text-xs font-bold block mt-0.5 ${isDarkMode ? 'text-gray-200' : 'text-gray-750'}`}>{formatDate(selectedLead.preferredDate)}</span>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-gray-800/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  <Users size={15} className="mx-auto text-primary mb-1" />
                  <span className="text-xs font-semibold text-gray-400 uppercase block">Quantity</span>
                  <span className={`text-xs font-bold block mt-0.5 ${isDarkMode ? 'text-gray-200' : 'text-gray-750'}`}>{selectedLead.totalPersons || selectedLead.quantity || 1} Person(s)</span>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-gray-800/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  <Shield size={15} className="mx-auto text-primary mb-1" />
                  <span className="text-xs font-semibold text-gray-400 uppercase block">Gender</span>
                  <span className={`text-xs font-bold block mt-0.5 ${isDarkMode ? 'text-gray-200' : 'text-gray-755'}`}>{renderVal(selectedLead.gender)}</span>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-gray-800/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  <IndianRupee size={15} className="mx-auto text-primary mb-1" />
                  <span className="text-xs font-semibold text-gray-400 uppercase block">Budget</span>
                  <span className={`text-xs font-bold block mt-0.5 ${isDarkMode ? 'text-gray-200' : 'text-gray-755'}`}>₹{selectedLead.budget?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Exact full address details block */}
              <div className={`p-4 rounded-2xl border text-left ${isDarkMode ? 'bg-gray-800/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <span className="text-xs font-bold text-gray-400 uppercase block mb-1.5 tracking-wider">Detailed Address</span>
                <p className={`text-xs font-semibold leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {renderVal(selectedLead.address)}, {renderVal(selectedLead.city)}, {renderVal(selectedLead.state)} - {renderVal(selectedLead.pincode)}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-6 border-t flex justify-end ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
              <button
                onClick={() => setSelectedLead(null)}
                className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer active:scale-95 shadow-md shadow-primary/20"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceProviderLeads;
