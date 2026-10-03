import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Store, 
  Percent, 
  IndianRupee, 
  Loader2, 
  Calendar, 
  Clock, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Eye
} from 'lucide-react';
import { getVendorPayouts } from '../../../api/adminService';
import { toast } from '../../../utils/toast';
import VendorPayoutDetailsModal from './VendorPayoutDetailsModal';

const VendorPayouts = ({ isDarkMode }) => {
  const [loading, setLoading] = useState(false);
  const [payouts, setPayouts] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [summary, setSummary] = useState({
    totalVendors: 0,
    totalSales: 0,
    totalCommission: 0,
    totalPayout: 0
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'all',
    month: new Date().getMonth() + 1, // Current month (1-12)
    year: new Date().getFullYear()
  });

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1
  });

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await getVendorPayouts({
        page: filters.page,
        limit: filters.limit,
        status: filters.status,
        month: filters.month,
        year: filters.year
      });

      if (res.success) {
        // Safe unpacking of nested response: { success, statusCode, data: { success, data: { filters, summary, pagination, data } } }
        const outerData = res.data?.data || res.data || {};
        const list = outerData.data || [];
        
        setPayouts(list);
        setSummary({
          totalVendors: outerData.summary?.totalVendors || list.length,
          totalSales: outerData.summary?.totalSales || outerData.summary?.totalSalesAmount || 0,
          totalCommission: outerData.summary?.totalCommission ?? outerData.summary?.totalPlatformCommission ?? outerData.summary?.platformCommission ?? 0,
          totalPayout: outerData.summary?.totalPayout ?? outerData.summary?.totalVendorPayout ?? outerData.summary?.netPayout ?? 0
        });
        
        setPagination({
          total: outerData.pagination?.total || list.length,
          totalPages: outerData.pagination?.totalPages || 1
        });
      } else {
        toast.error(res.message || 'Failed to fetch vendor payouts.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while fetching vendor payouts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [filters.page, filters.limit, filters.status, filters.month, filters.year]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to page 1 on filter changes
    }));
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - 1 + i);

  const summaryCards = [
    {
      label: 'Vendors Active',
      value: summary.totalVendors,
      icon: <Store size={20} className="text-blue-500 dark:text-blue-400" />,
      color: 'border-blue-500/20 bg-blue-500/5 text-blue-500'
    },
    {
      label: 'Vendor Sales generated',
      value: `₹${summary.totalSales?.toLocaleString('en-IN')}`,
      icon: <TrendingUp size={20} className="text-emerald-500 dark:text-emerald-400" />,
      color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500'
    },
    {
      label: 'Platform Commission',
      value: `₹${summary.totalCommission?.toLocaleString('en-IN')}`,
      icon: <Percent size={20} className="text-purple-500 dark:text-purple-400" />,
      color: 'border-purple-500/20 bg-purple-500/5 text-purple-500'
    },
    {
      label: 'Total Net Payouts',
      value: summary.totalPayout ? `₹${summary.totalPayout?.toLocaleString('en-IN')}` : '₹0',
      icon: <IndianRupee size={20} className="text-rose-500 dark:text-rose-400" />,
      color: 'border-rose-500/20 bg-rose-500/5 text-rose-500'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl lg:text-2xl font-black uppercase tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
            Vendor Payouts
          </h2>
          <p className="text-xs font-semibold uppercase text-zinc-400 tracking-wider mt-0.5">
            Oversee vendor performance, platform commissions, and cash payouts audit history
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div 
            key={i} 
            className={`p-5 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                {card.label}
              </span>
              <div className={`p-2.5 rounded-xl ${card.color.split(' ')[1]} ${card.color.split(' ')[0]}`}>
                {card.icon}
              </div>
            </div>
            <p className={`text-xl lg:text-2xl font-black tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Options */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2 mb-4 text-left">
          <SlidersHorizontal size={14} className="text-primary" />
          <span className="text-xs font-black uppercase tracking-wider text-zinc-400">Filters & Controls</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Month Filter */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Calendar size={12} className="text-primary" /> Select Month
            </label>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-primary' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-primary'
              }`}
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Calendar size={12} className="text-primary" /> Select Year
            </label>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-primary' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-primary'
              }`}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Clock size={12} className="text-primary" /> Settlement Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-primary' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-primary'
              }`}
            >
              <option value="all">All Payouts</option>
              <option value="pending">Pending Settle</option>
              <option value="settled">Settled Slabs</option>
            </select>
          </div>

          {/* Page Limit */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <SlidersHorizontal size={12} className="text-primary" /> Payouts per page
            </label>
            <select
              name="limit"
              value={filters.limit}
              onChange={handleFilterChange}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-primary' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-primary'
              }`}
            >
              <option value="5">5 Records</option>
              <option value="10">10 Records</option>
              <option value="20">20 Records</option>
              <option value="50">50 Records</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payouts Table Card */}
      <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
        isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Calculating vendor margins...</span>
          </div>
        ) : payouts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <ShoppingBag size={42} className="text-zinc-400 mb-3" />
            <p className={`text-sm font-black uppercase ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>No Vendor Payouts Found</p>
            <p className="text-xs text-zinc-400 font-bold uppercase mt-1">No sales exist for this month/year range</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className={`border-b text-left text-[11px] font-black uppercase tracking-wider ${
                  isDarkMode ? 'bg-zinc-950/60 border-zinc-800 text-zinc-400' : 'bg-zinc-50/80 border-zinc-200 text-zinc-500'
                }`}>
                  <th className="py-4 px-6">Brand / Vendor</th>
                  <th className="py-4 px-6">Orders</th>
                  <th className="py-4 px-6 text-right">Total Sales</th>
                  <th className="py-4 px-6 text-right">Platform Commission</th>
                  <th className="py-4 px-6 text-right">Net Vendor Payout</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800/60' : 'divide-zinc-100'}`}>
                {payouts.map((item, i) => (
                  <tr 
                    key={i} 
                    className={`transition-colors text-left ${isDarkMode ? 'hover:bg-zinc-800/40 text-zinc-200' : 'hover:bg-zinc-50/80 text-zinc-800'}`}
                  >
                    {/* Vendor Business Name & Profile */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${
                          isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                        }`}>
                          {item.businessName?.charAt(0).toUpperCase() || 'V'}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
                            {item.businessName || 'Vendor Brand'}
                          </span>
                          <span className="text-xs font-mono font-bold text-zinc-400 lowercase">
                            /{item.slug || 'unknown'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Total Orders */}
                    <td className="py-3.5 px-6">
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                        {item.totalOrders || 0}
                      </span>
                    </td>

                    {/* Total Sales */}
                    <td className="py-3.5 px-6 text-right">
                      <span className={`text-sm font-black ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
                        ₹{item.totalSales?.toLocaleString('en-IN') || 0}
                      </span>
                    </td>

                    {/* Platform Commission */}
                    <td className="py-3.5 px-6 text-right">
                      <span className="text-sm font-black text-primary">
                        ₹{(item.platformCommission ?? item.totalPlatformCommission ?? item.platformCommissionAmount ?? item.commissionAmount ?? 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Net Vendor Payout */}
                    <td className="py-3.5 px-6 text-right">
                      <span className="text-sm font-black text-emerald-500">
                        ₹{(item.netPayout ?? item.totalVendorPayout ?? item.payoutAmount ?? item.netPayoutAmount ?? 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Payout Status Badge */}
                    <td className="py-3.5 px-6 text-center">
                      {(() => {
                        const isSettled = (item.status === 'settled' || item.status === 'paid' || item.status === 'approved' || item.status === 'completed' || item.payoutStatus === 'settled' || item.payoutStatus === 'paid' || item.isVendorSettled === true || item.isVendorSettled === 'true');
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide border ${
                            isSettled 
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isSettled ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {isSettled ? 'Settled' : 'Pending'}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-center">
                      <button
                        title="View Details"
                        onClick={() => setSelectedVendorId(item.vendorId || item._id)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-primary' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-primary'
                        }`}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && !loading && (
        <div className="flex justify-center items-center gap-2 pt-2">
          <button 
            onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))} 
            disabled={filters.page === 1} 
            className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
              isDarkMode 
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white' 
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="w-11 h-11 flex items-center justify-center bg-primary text-white rounded-xl font-black text-sm shadow-md shadow-primary/20">
            {filters.page}
          </div>
          <button 
            onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))} 
            disabled={filters.page >= pagination.totalPages} 
            className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
              isDarkMode 
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white' 
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* ── Vendor Payout Details Modal ── */}
      {selectedVendorId && (
        <VendorPayoutDetailsModal
          vendorId={selectedVendorId}
          onClose={() => {
            setSelectedVendorId(null);
            fetchPayouts();
          }}
          initialMonth={Number(filters.month)}
          initialYear={Number(filters.year)}
        />
      )}
    </div>
  );
};

export default VendorPayouts;
