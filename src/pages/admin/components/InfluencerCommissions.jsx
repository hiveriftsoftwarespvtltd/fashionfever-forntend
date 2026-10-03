import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Percent, 
  IndianRupee, 
  Loader2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Eye,
  Check,
  X,
  AlertCircle,
  Landmark,
  FileText
} from 'lucide-react';
import { getInfluencerCommissions, getAdminInfluencerPayouts, settleAdminInfluencerPayout, rejectAdminInfluencerPayout } from '../../../api/adminService';
import { toast } from '../../../utils/toast';
import InfluencerCommissionDetailsModal from './InfluencerCommissionDetailsModal';

const InfluencerCommissions = ({ isDarkMode }) => {
  const [loading, setLoading] = useState(false);
  const [commissions, setCommissions] = useState([]);
  const [selectedInfluencerId, setSelectedInfluencerId] = useState(null);
  const [summary, setSummary] = useState({
    totalInfluencers: 0,
    totalSales: 0,
    totalProfit: 0,
    totalPayout: 0
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'approved',
    month: new Date().getMonth() + 1, // Current month (1-12)
    year: new Date().getFullYear()
  });

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1
  });

  // Payout Sub-Tab states
  const [activeSubTab, setActiveSubTab] = useState('commissions'); // 'commissions' | 'payouts'
  const [payouts, setPayouts] = useState([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [payoutFilter, setPayoutFilter] = useState('all');
  const [payoutPage, setPayoutPage] = useState(1);
  const [payoutTotalPages, setPayoutTotalPages] = useState(1);

  // Settlement & Rejection modal states
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [transactionIdInput, setTransactionIdInput] = useState('');
  const [settleRemarksInput, setSettleRemarksInput] = useState('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayouts = async () => {
    setLoadingPayouts(true);
    try {
      const params = {
        page: payoutPage,
        limit: 10,
        ...(payoutFilter !== 'all' ? { status: payoutFilter } : {})
      };
      const res = await getAdminInfluencerPayouts(params);
      if (res?.success) {
        const outer = res.data?.data || res.data || {};
        setPayouts(outer.items || []);
        setPayoutTotalPages(outer.totalPages || 1);
      } else {
        toast.error(res?.message || 'Failed to fetch influencer payouts');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error loading influencer payouts');
    } finally {
      setLoadingPayouts(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'payouts') {
      fetchPayouts();
    }
  }, [activeSubTab, payoutPage, payoutFilter]);

  const handleOpenSettle = (payout) => {
    setSelectedPayout(payout);
    setTransactionIdInput('');
    setSettleRemarksInput('');
    setSettleModalOpen(true);
  };

  const handleOpenReject = (payout) => {
    setSelectedPayout(payout);
    setRejectionReasonInput('');
    setRejectModalOpen(true);
  };

  const handleSettle = async () => {
    if (!transactionIdInput || !transactionIdInput.trim()) {
      toast.error('Transaction ID / UTR reference is mandatory');
      return;
    }
    setActionLoading(true);
    try {
      const res = await settleAdminInfluencerPayout({
        payoutId: selectedPayout._id,
        transactionId: transactionIdInput.trim(),
        remarks: settleRemarksInput.trim() || undefined
      });
      if (res?.success) {
        toast.success('Payout settled successfully!');
        setSettleModalOpen(false);
        setSelectedPayout(null);
        setTransactionIdInput('');
        setSettleRemarksInput('');
        fetchPayouts();
      } else {
        toast.error(res?.message || 'Failed to settle payout');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error settling payout');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReasonInput || !rejectionReasonInput.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    setActionLoading(true);
    try {
      const res = await rejectAdminInfluencerPayout({
        payoutId: selectedPayout._id,
        reason: rejectionReasonInput.trim()
      });
      if (res?.success) {
        toast.success('Payout rejected and commissions unlocked');
        setRejectModalOpen(false);
        setSelectedPayout(null);
        setRejectionReasonInput('');
        fetchPayouts();
      } else {
        toast.error(res?.message || 'Failed to reject payout');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error rejecting payout');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const res = await getInfluencerCommissions({
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
        
        setCommissions(list);
        setSummary({
          totalInfluencers: outerData.summary?.totalInfluencers || 0,
          totalSales: outerData.summary?.totalSales || 0,
          totalProfit: outerData.summary?.totalProfit || 0,
          totalPayout: outerData.summary?.totalPayout || 0
        });
        
        setPagination({
          total: outerData.pagination?.total || list.length,
          totalPages: outerData.pagination?.totalPages || 1
        });
      } else {
        toast.error(res.message || 'Failed to fetch commissions.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while fetching commissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
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

  const years = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - 1 + i); // prev year to next 2 years

  const summaryCards = [
    {
      label: 'Influencers Active',
      value: summary.totalInfluencers,
      icon: <Users size={20} className="text-blue-500 dark:text-blue-400" />,
      color: 'border-blue-500/20 bg-blue-500/5 text-blue-500'
    },
    {
      label: 'Net E-Commerce Sales',
      value: `₹${summary.totalSales?.toLocaleString('en-IN')}`,
      icon: <TrendingUp size={20} className="text-emerald-500 dark:text-emerald-400" />,
      color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500'
    },
    {
      label: 'Total Platform Profit',
      value: `₹${summary.totalProfit?.toLocaleString('en-IN')}`,
      icon: <Percent size={20} className="text-purple-500 dark:text-purple-400" />,
      color: 'border-purple-500/20 bg-purple-500/5 text-purple-500'
    },
    {
      label: 'Settled Creator Payouts',
      value: summary.totalPayout ? `₹${summary.totalPayout?.toLocaleString('en-IN')}` : '₹0',
      icon: <IndianRupee size={20} className="text-rose-500 dark:text-rose-400" />,
      color: 'border-rose-500/20 bg-rose-500/5 text-rose-500'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl lg:text-2xl font-black uppercase tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
            Influencer Commissions & Payouts
          </h2>
          <p className="text-xs font-semibold uppercase text-zinc-400 tracking-wider mt-0.5">
            Track creator commissions, verify bank transfer details, and settle withdrawal requests
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
          <button
            type="button"
            onClick={() => setActiveSubTab('commissions')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'commissions'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Commissions Ledger
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('payouts')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'payouts'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Payout Requests
          </button>
        </div>
      </div>

      {activeSubTab === 'commissions' ? (
        <>

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
              <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
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
          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">Filters & Controls</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Month Filter */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Calendar size={11} className="text-primary" /> Select Month
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
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Calendar size={11} className="text-primary" /> Select Year
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
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Clock size={11} className="text-primary" /> Payout Status
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
              <option value="approved">Approved Slabs</option>
              <option value="pending">Pending Slabs</option>
              <option value="settled">Settled Slabs</option>
            </select>
          </div>

          {/* Page Limit */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <SlidersHorizontal size={11} className="text-primary" /> Slabs per page
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
              <option value="5">5 Slabs</option>
              <option value="10">10 Slabs</option>
              <option value="20">20 Slabs</option>
              <option value="50">50 Slabs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Slabs Table Card */}
      <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
        isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Calculating commissions...</span>
          </div>
        ) : commissions.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <ShoppingBag size={42} className="text-zinc-400 mb-3" />
            <p className={`text-sm font-black uppercase ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>No Commission Records Found</p>
            <p className="text-xs text-zinc-400 font-bold uppercase mt-1">No target sales exist for this month/year range</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className={`border-b text-left text-[11px] font-black uppercase tracking-wider ${
                  isDarkMode ? 'bg-zinc-950/60 border-zinc-800 text-zinc-400' : 'bg-zinc-50/80 border-zinc-200 text-zinc-500'
                }`}>
                  <th className="py-4 px-6">Influencer</th>
                  <th className="py-4 px-6">Orders</th>
                  <th className="py-4 px-6 text-right">Total Sales</th>
                  <th className="py-4 px-6 text-right">Platform Profit</th>
                  <th className="py-4 px-6 text-center">Active Slab</th>
                  <th className="py-4 px-6 text-right">Calculated Payout</th>
                  <th className="py-4 px-6 text-center">Settlement Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800/60' : 'divide-zinc-100'}`}>
                {commissions.map((item, i) => (
                  <tr 
                    key={i} 
                    className={`transition-colors text-left ${isDarkMode ? 'hover:bg-zinc-800/40 text-zinc-200' : 'hover:bg-zinc-50/80 text-zinc-800'}`}
                  >
                    {/* Influencer Name & ID */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${
                          isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                        }`}>
                          {item.influencerName?.charAt(0).toUpperCase() || 'I'}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
                            {item.influencerName}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            ID: {item.influencerId?.substring(18)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Total Orders */}
                    <td className="py-3.5 px-6">
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                        {item.totalOrders}
                      </span>
                    </td>

                    {/* Total Sales */}
                    <td className="py-3.5 px-6 text-right">
                      <span className={`text-sm font-black ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
                        ₹{item.totalSales?.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Total Profit */}
                    <td className="py-3.5 px-6 text-right">
                      <span className="text-sm font-black text-primary">
                        ₹{item.totalProfit?.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Active Slab Details */}
                    <td className="py-3.5 px-6 text-center">
                      {item.slab ? (
                        <div className="inline-flex flex-col items-center justify-center px-2.5 py-1 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20 text-center">
                          <span className="text-xs font-black">{item.commissionRate}% Rate</span>
                          <span className="text-xs font-bold uppercase tracking-wide mt-0.5 opacity-90">
                            ₹{item.slab.minSales?.toLocaleString('en-IN')} - ₹{item.slab.maxSales?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold uppercase text-zinc-400">—</span>
                      )}
                    </td>

                    {/* Calculated Payout */}
                    <td className="py-3.5 px-6 text-right">
                      {item.calculatedPayout !== null ? (
                        <span className="text-sm font-black text-emerald-500">
                          ₹{item.calculatedPayout?.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-xs font-bold uppercase text-zinc-400">—</span>
                      )}
                    </td>

                    {/* Payout & Orders Settle Count */}
                    <td className="py-3.5 px-6">
                      <div className="flex flex-col items-center gap-1">
                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide border ${
                          item.payoutStatus === 'settled' || item.payoutStatus === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.payoutStatus === 'settled' || item.payoutStatus === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {item.payoutStatus}
                        </span>
                        {/* Settled / Unsettled Counts */}
                        <span className="text-xs font-bold text-zinc-400 uppercase">
                          S: {item.settledCount || 0} / U: {item.unsettledCount || 0} Orders
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <button
                        title="View Details"
                        onClick={() => setSelectedInfluencerId(item.influencerId)}
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
        </>
      ) : (
        /* Payout Requests & Settlement View */
        <div className="space-y-6">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'pending', 'paid', 'rejected', 'failed'].map((st) => (
              <button
                key={st}
                onClick={() => { setPayoutFilter(st); setPayoutPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  payoutFilter === st
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : isDarkMode
                    ? 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200 shadow-sm'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Payouts Table */}
          <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
            isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            {loadingPayouts ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-primary mb-3" size={32} />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Loading payout requests...</span>
              </div>
            ) : payouts.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <Landmark size={42} className="text-zinc-400 mb-3 opacity-40" />
                <p className={`text-sm font-black uppercase ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>No Payout Requests Found</p>
                <p className="text-xs text-zinc-400 font-bold uppercase mt-1">There are no creator withdrawal requests matching this filter</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className={`border-b text-[11px] font-black uppercase tracking-wider ${
                      isDarkMode ? 'bg-zinc-950/60 border-zinc-800 text-zinc-400' : 'bg-zinc-50/80 border-zinc-200 text-zinc-500'
                    }`}>
                      <th className="py-4 px-6">Creator</th>
                      <th className="py-4 px-6">Bank / UPI Transfer Snapshot</th>
                      <th className="py-4 px-6 text-center">Orders</th>
                      <th className="py-4 px-6 text-right">Payout Amount</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6">Reference / Note</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800/60' : 'divide-zinc-100'}`}>
                    {payouts.map((p) => {
                      const creator = p.influencerId || {};
                      const bankSnap = p.bankAccountSnapshot || creator.bankDetails || {};
                      const hasBank = bankSnap.accountNumber || bankSnap.upiId || creator.upiId;
                      return (
                        <tr 
                          key={p._id}
                          className={`transition-colors text-xs ${isDarkMode ? 'hover:bg-zinc-800/40 text-zinc-200' : 'hover:bg-zinc-50/80 text-zinc-800'}`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">{creator.name || 'Creator'}</span>
                              <span className="text-xs text-zinc-400 font-medium">{creator.email || creator.phone || '—'}</span>
                              <span className="text-[10px] text-zinc-500 font-mono mt-0.5">Ref: {creator.referralCode || '—'}</span>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            {hasBank ? (
                              <div className="flex flex-col space-y-0.5 text-xs">
                                {bankSnap.accountNumber && (
                                  <span className="font-mono font-bold text-zinc-700 dark:text-zinc-200">
                                    A/C: {bankSnap.accountNumber}
                                  </span>
                                )}
                                {bankSnap.ifscCode && (
                                  <span className="text-xs text-zinc-400 font-mono">
                                    IFSC: {bankSnap.ifscCode} ({bankSnap.bankName || 'Bank'})
                                  </span>
                                )}
                                {(bankSnap.upiId || creator.upiId) && (
                                  <span className="text-xs font-mono font-bold text-emerald-500">
                                    UPI: {bankSnap.upiId || creator.upiId}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-amber-500 font-medium italic">No Bank Info Snapshot</span>
                            )}
                          </td>

                          <td className="py-4 px-6 text-center font-bold">
                            {p.totalOrders || p.commissionIds?.length || 0}
                          </td>

                          <td className="py-4 px-6 text-right">
                            <span className="text-base font-black text-emerald-500">
                              ₹{(p.totalCommission ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                              p.status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : p.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'paid' ? 'bg-emerald-500' : p.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                              {p.status}
                            </span>
                          </td>

                          <td className="py-4 px-6">
                            <div className="flex flex-col text-left max-w-[200px]">
                              {p.transactionId && (
                                <span className="text-xs font-mono font-bold text-emerald-500">
                                  UTR: {p.transactionId}
                                </span>
                              )}
                              {p.remarks && (
                                <span className="text-xs text-zinc-400 font-medium truncate" title={p.remarks}>
                                  {p.remarks}
                                </span>
                              )}
                              {!p.transactionId && !p.remarks && (
                                <span className="text-xs text-zinc-500">—</span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-6 text-center">
                            {p.status === 'pending' ? (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenSettle(p)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Check size={12} /> Settle
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenReject(p)}
                                  className="px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600 hover:text-white text-rose-500 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 border border-rose-500/20"
                                >
                                  <X size={12} /> Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] font-bold text-zinc-400 uppercase">Processed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Settle Payout Modal ── */}
      {settleModalOpen && selectedPayout && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div 
            onClick={() => !actionLoading && setSettleModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          />
          <div className={`relative w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border animate-in zoom-in-95 duration-200 text-left ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-800'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black uppercase tracking-wide">
                Settle Creator Payout
              </h3>
              <button 
                disabled={actionLoading}
                onClick={() => setSettleModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 block">Payout Amount</span>
              <span className="text-2xl font-black text-emerald-500 block mt-0.5">
                ₹{(selectedPayout.totalCommission ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-zinc-400 font-medium mt-1 block">
                Creator: <strong>{selectedPayout.influencerId?.name || 'Creator'}</strong>
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide block mb-1">
                  Bank / UPI Transaction ID / UTR Reference <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={transactionIdInput}
                  onChange={(e) => setTransactionIdInput(e.target.value)}
                  placeholder="e.g. UTR1234567890 or BANK-TXN-9988"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono font-bold outline-none border transition-all ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-primary' : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-primary'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide block mb-1">
                  Optional Settlement Remarks
                </label>
                <input
                  type="text"
                  value={settleRemarksInput}
                  onChange={(e) => setSettleRemarksInput(e.target.value)}
                  placeholder="e.g. Transferred via NEFT"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium outline-none border transition-all ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-primary' : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-primary'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setSettleModalOpen(false)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase transition-all ${
                  isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSettle}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={15} />}
                Confirm Settle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Payout Modal ── */}
      {rejectModalOpen && selectedPayout && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div 
            onClick={() => !actionLoading && setRejectModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          />
          <div className={`relative w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border animate-in zoom-in-95 duration-200 text-left ${
            isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-800'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black uppercase tracking-wide text-rose-500">
                Reject Payout Request
              </h3>
              <button 
                disabled={actionLoading}
                onClick={() => setRejectModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-4">
              Rejecting this payout will release all locked commissions back to the creator's wallet as <strong>APPROVED</strong> so they can be requested again.
            </p>

            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide block">
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Bank account details provided are invalid"
                rows={3}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium outline-none border transition-all ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-rose-500' : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-rose-500'
                }`}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setRejectModalOpen(false)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase transition-all ${
                  isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleReject}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <X size={15} />}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Influencer Commission Details Modal ── */}
      {selectedInfluencerId && (
        <InfluencerCommissionDetailsModal
          influencerId={selectedInfluencerId}
          onClose={() => setSelectedInfluencerId(null)}
          initialMonth={Number(filters.month)}
          initialYear={Number(filters.year)}
        />
      )}
    </div>
  );
};

export default InfluencerCommissions;
