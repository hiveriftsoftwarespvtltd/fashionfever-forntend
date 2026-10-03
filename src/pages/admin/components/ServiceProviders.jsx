import { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, Briefcase, CheckCircle2, XCircle, Clock, MapPin, Eye, Search, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { getAllServiceProviders, verifyServiceProvider } from '../../../api/adminService';
import { toast } from '../../../utils/toast';
import DataTable from '../../../components/shared/DataTable';
import ServiceProviderDetailsModal from './ServiceProviderDetailsModal';

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

const ServiceProviders = ({ isDarkMode }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'APPROVED' | 'PENDING' | 'INDIVIDUAL' | 'COMPANY'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllServiceProviders();
      if (res?.success) {
        // Extracts the list from response nested structure data.data or fallback
        const data = res.data?.data ?? res.data ?? [];
        setProviders(Array.isArray(data) ? data : []);
      } else {
        setError(res?.message || 'Failed to load service providers.');
        toast.error(res?.message || 'Failed to load service providers.');
      }
    } catch (err) {
      console.error(err);
      const msg = 'Something went wrong while fetching service providers.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleVerify = (id, status) => {
    Swal.fire({
      title: `${status === 'APPROVED' ? 'Approve' : 'Reject'} Provider?`,
      text: `Are you sure you want to change this provider's verification status to ${status}?`,
      icon: status === 'APPROVED' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: status === 'APPROVED' ? '#10b981' : '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: `Yes, ${status === 'APPROVED' ? 'Approve' : 'Reject'}`,
      cancelButtonText: 'Cancel',
      background: isDarkMode ? '#1f2937' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      borderRadius: '20px',
      customClass: {
        popup: 'rounded-3xl border-none',
        confirmButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 text-white cursor-pointer',
        cancelButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 cursor-pointer'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const loadingToast = toast.loading(`${status === 'APPROVED' ? 'Approving' : 'Rejecting'} service provider...`);
        try {
          const res = await verifyServiceProvider(id, status);
          toast.dismiss(loadingToast);
          if (res.success) {
            toast.success(res.message || `Service provider verified successfully!`);
            fetchProviders();
          } else {
            toast.error(res.message || 'Failed to update verification status.');
          }
        } catch (err) {
          toast.dismiss(loadingToast);
          console.error(err);
          toast.error('Something went wrong during verification.');
        }
      }
    });
  };

  // Client side search and filters
  const filteredProviders = providers.filter((provider) => {
    // Status Filter
    if (filterStatus === 'APPROVED' && provider.verificationStatus !== 'APPROVED') return false;
    if (filterStatus === 'PENDING' && provider.verificationStatus !== 'PENDING') return false;
    if (filterStatus === 'INDIVIDUAL' && provider.providerType !== 'INDIVIDUAL') return false;
    if (filterStatus === 'SALON' && provider.providerType !== 'SALON') return false;

    // Search query matches businessName, owner name, email or phone
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchBusiness = provider.businessName?.toLowerCase().includes(term);
      const matchOwner = provider.userId?.name?.toLowerCase().includes(term);
      const matchEmail = provider.email?.toLowerCase().includes(term) || provider.userId?.email?.toLowerCase().includes(term);
      const matchPhone = provider.phone?.includes(term);
      return matchBusiness || matchOwner || matchEmail || matchPhone;
    }

    return true;
  });

  const columns = [
    {
      header: 'Provider / Business',
      render: (prov) => (
        <div className="flex items-center gap-4 text-left">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold border ${isDarkMode ? 'bg-gray-800 border-white/5' : 'bg-gray-100 border-gray-100 shadow-sm'} flex-shrink-0`}>
            <span className="text-primary font-bold text-sm">
              {(prov.businessName?.charAt(0) || prov.userId?.name?.charAt(0) || 'P').toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`text-sm font-bold truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {prov.businessName}
            </span>
            <span className="text-sm font-bold text-gray-400 uppercase truncate">
              Owner: {prov.userId?.name || '—'}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Contact Info',
      render: (prov) => (
        <div className="flex flex-col text-left">
          <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{prov.phone}</span>
          <span className="text-sm font-bold text-gray-400 uppercase truncate max-w-[150px]">{prov.userId?.email || prov.email}</span>
        </div>
      )
    },
    {
      header: 'Location',
      render: (prov) => (
        <div className="flex flex-col text-left">
          <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{prov.city}</span>
          <span className="text-sm font-bold text-gray-400 uppercase">{prov.state}</span>
        </div>
      )
    },
    {
      header: 'Type & Experience',
      render: (prov) => (
        <div className="flex flex-col text-left">
          <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{prov.providerType}</span>
          <span className="text-sm font-bold text-gray-400 uppercase">{prov.experienceYears ?? 0} Years Exp</span>
        </div>
      )
    },
    {
      header: 'Verification',
      render: (prov) => (
        <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider ${
          prov.verificationStatus === 'APPROVED' 
            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
        }`}>
          {prov.verificationStatus}
        </span>
      )
    },
    {
      header: 'Status',
      render: (prov) => (
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${prov.isActive && !prov.isDeleted ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
          <span className="text-sm font-semibold uppercase text-gray-400">{prov.isActive && !prov.isDeleted ? 'Active' : 'Banned'}</span>
        </div>
      )
    },
    {
      header: 'Registered',
      render: (prov) => (
        <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {formatDate(prov.createdAt)}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (prov) => {
        const isPending = prov.verificationStatus === 'PENDING';
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {isPending && (
              <>
                <button
                  onClick={() => handleVerify(prov._id, 'APPROVED')}
                  title="Approve Provider"
                  className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                >
                  <CheckCircle2 size={15} />
                </button>
                <button
                  onClick={() => handleVerify(prov._id, 'REJECTED')}
                  title="Reject Provider"
                  className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/20 hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                >
                  <XCircle size={15} />
                </button>
              </>
            )}
            <button
              title="View Profile Details"
              onClick={() => setSelectedProvider(prov)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${isDarkMode ? 'bg-white/5 text-gray-400 hover:text-primary hover:bg-primary/5' : 'bg-gray-50 text-gray-400 hover:text-primary'}`}
            >
              <Eye size={18} />
            </button>
          </div>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center gap-4 rounded-3xl border ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100'} shadow-xl`}>
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Loading Service Providers...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center gap-5 rounded-3xl border ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-100'} shadow-xl p-10`}>
        <AlertCircle className="text-rose-500" size={40} />
        <div className="text-center">
          <p className={`font-black text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Failed to Load</p>
          <p className="text-xs text-gray-400">{error}</p>
        </div>
        <button
          onClick={fetchProviders}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-xs uppercase shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <RefreshCw size={15} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">
            People
          </span>
          <h2 className={`text-2xl lg:text-3xl font-black uppercase ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
            Service Providers
          </h2>
          <p className={`text-xs font-semibold mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Manage and verify registered individual and salon professionals
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`px-5 py-3 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} shadow-sm`}>
            <p className="text-xs font-bold uppercase text-zinc-400 mb-0.5">Total Providers</p>
            <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{providers.length}</p>
          </div>
          <button
            onClick={fetchProviders}
            disabled={loading}
            className={`p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Approved', value: providers.filter(p => p.verificationStatus === 'APPROVED').length, color: 'text-emerald-500', bg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50', icon: <CheckCircle2 size={16} /> },
          { label: 'Pending Request', value: providers.filter(p => p.verificationStatus === 'PENDING').length, color: 'text-amber-500', bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50', icon: <Clock size={16} /> },
          { label: 'Individual', value: providers.filter(p => p.providerType === 'INDIVIDUAL').length, color: 'text-blue-500', bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50', icon: <Briefcase size={16} /> },
          { label: 'Salon Business', value: providers.filter(p => p.providerType === 'SALON').length, color: 'text-purple-500', bg: isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50', icon: <MapPin size={16} /> },
        ].map((s, i) => (
          <div key={i} className={`px-4 py-4 rounded-2xl border flex items-center gap-3 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} shadow-sm`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg} ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by business, owner name, phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-3.5 border rounded-2xl text-xs font-bold outline-none transition-all ${
              isDarkMode 
                ? 'bg-gray-900 border-white/5 text-white focus:border-primary/50' 
                : 'bg-white border-gray-150 text-gray-700 shadow-sm focus:border-primary/30'
            }`} 
          />
        </div>

        {/* Filter Tabs */}
        <div className={`flex flex-wrap gap-2 p-1.5 rounded-2xl ${isDarkMode ? 'bg-gray-900 border border-white/5' : 'bg-gray-100'} w-fit`}>
          {[
            { key: 'all', label: 'All' },
            { key: 'APPROVED', label: 'Approved' },
            { key: 'PENDING', label: 'Pending' },
            { key: 'INDIVIDUAL', label: 'Individual' },
            { key: 'SALON', label: 'Salon' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wide transition-all duration-200 cursor-pointer ${
                filterStatus === f.key
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : isDarkMode
                  ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredProviders}
        loading={loading}
      />

      {/* Details Modal */}
      <ServiceProviderDetailsModal
        provider={selectedProvider}
        onClose={() => setSelectedProvider(null)}
      />
    </div>
  );
};

export default ServiceProviders;
