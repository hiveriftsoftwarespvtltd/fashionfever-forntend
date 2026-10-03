import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, Search, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import DataTable from '../../../components/shared/DataTable';

const ServiceProviderBookings = ({ isDarkMode, bookings = [], setBookings }) => {
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'Pending' | 'Completed' | 'Cancelled'
  const [searchTerm, setSearchTerm] = useState('');

  const handleUpdateStatus = (id, status) => {
    Swal.fire({
      title: `Mark Booking as ${status}?`,
      text: `Are you sure you want to change this appointment status to ${status}?`,
      icon: status === 'Completed' ? 'success' : 'warning',
      showCancelButton: true,
      confirmButtonColor: status === 'Completed' ? '#10b981' : '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Update',
      cancelButtonText: 'Cancel',
      background: isDarkMode ? '#1f2937' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      borderRadius: '20px',
      customClass: {
        popup: 'rounded-3xl border-none',
        confirmButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 text-white cursor-pointer',
        cancelButton: 'rounded-xl font-bold uppercase text-xs px-5 py-2.5 cursor-pointer'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
        Swal.fire({
          title: 'Success!',
          text: `Booking status updated to ${status}.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: isDarkMode ? '#1f2937' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#1f2937',
          borderRadius: '20px'
        });
      }
    });
  };

  const filteredBookings = bookings.filter(b => {
    // Filter by tab
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    
    // Search query matches customer name, service name or phone
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchCustomer = b.customerName?.toLowerCase().includes(term);
      const matchService = b.serviceName?.toLowerCase().includes(term);
      const matchPhone = b.phone?.includes(term);
      return matchCustomer || matchService || matchPhone;
    }
    return true;
  });

  const columns = [
    {
      header: 'Customer Details',
      render: (row) => (
        <div className="flex items-center gap-4 text-left">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold border ${isDarkMode ? 'bg-gray-800 border-white/5 text-gray-500' : 'bg-gray-150 border-gray-100 text-gray-400'} flex-shrink-0`}>
            <span className="text-primary font-bold">{row.customerName?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`text-sm font-bold truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {row.customerName}
            </span>
            <span className="text-sm font-bold text-gray-400 uppercase truncate">
              Phone: {row.phone}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Service Booked',
      render: (row) => (
        <div className="flex flex-col text-left">
          <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{row.serviceName}</span>
          <span className="text-sm font-bold text-primary uppercase">{row.category}</span>
        </div>
      )
    },
    {
      header: 'Appointment Schedule',
      render: (row) => (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar size={13} className="text-gray-400" />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-gray-400 uppercase mt-0.5">
            <Clock size={11} className="text-gray-400" />
            <span>{row.timeSlot}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Booking Price',
      render: (row) => (
        <span className="text-sm font-black text-primary">
          ₹{row.price?.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => {
        let badgeStyle = '';
        if (row.status === 'Pending') badgeStyle = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        else if (row.status === 'Completed') badgeStyle = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        else badgeStyle = 'bg-rose-500/10 text-rose-500 border-rose-500/20';

        return (
          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border ${badgeStyle}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      render: (row) => {
        const isPending = row.status === 'Pending';
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {isPending ? (
              <>
                <button
                  onClick={() => handleUpdateStatus(row._id, 'Completed')}
                  title="Mark Completed"
                  className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                >
                  <CheckCircle2 size={15} />
                </button>
                <button
                  onClick={() => handleUpdateStatus(row._id, 'Cancelled')}
                  title="Cancel Booking"
                  className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/20 hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                >
                  <XCircle size={15} />
                </button>
              </>
            ) : (
              <span className={`text-sm font-bold text-gray-400 uppercase`}>No Actions</span>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 text-left font-outfit animate-in fade-in duration-300">
      
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm font-bold text-primary uppercase">Schedule Grid</span>
          <h2 className={`text-xl md:text-2xl font-bold uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bookings & Schedule</h2>
        </div>
      </div>

      {/* Search & Filter section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by customer, service..." 
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
            { key: 'Pending', label: 'Pending' },
            { key: 'Completed', label: 'Completed' },
            { key: 'Cancelled', label: 'Cancelled' },
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
        data={filteredBookings}
        loading={false}
      />
    </div>
  );
};

export default ServiceProviderBookings;
