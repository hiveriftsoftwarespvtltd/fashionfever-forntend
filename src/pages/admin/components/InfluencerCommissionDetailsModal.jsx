import React, { useState, useEffect } from 'react';
import { Loader2, X, Percent, IndianRupee, Calendar, ShoppingBag, TrendingUp, SlidersHorizontal, Award, Sparkles } from 'lucide-react';
import { toast } from '../../../utils/toast';
import { getInfluencerCommissionDetails } from '../../../api/adminService';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Influencer Commission Details Modal
 */
export const InfluencerCommissionDetailsModal = ({ influencerId, onClose, initialMonth, initialYear }) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);

  // Initialize query filters with passed values or current date
  const [filters, setFilters] = useState({
    month: initialMonth || new Date().getMonth() + 1,
    year: initialYear || new Date().getFullYear()
  });

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await getInfluencerCommissionDetails(influencerId, {
        month: filters.month,
        year: filters.year
      });

      if (response.success) {
        // Nested response unpack: { success: true, statusCode: 200, data: { success: true, data: { influencer, filters, summary, slab, payouts, commissions } } }
        const outerData = response.data?.data || response.data || {};
        setDetails(outerData);
      } else {
        toast.error(response.message || 'Failed to fetch influencer commission details.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Could not load commission details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (influencerId) fetchDetails();
  }, [influencerId, filters.month, filters.year]);

  if (!influencerId) return null;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: Number(value) }));
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

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Box */}
      <div className={`relative w-full max-w-2xl rounded-3xl shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 ${
        isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-800'
      }`}>
        {/* Accent Top Bar */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-pink-400 to-purple-500 flex-shrink-0" />

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className={`absolute top-5 right-5 p-2 rounded-xl transition-all z-10 ${
            isDarkMode ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-50 text-gray-400 hover:text-gray-800'
          }`}
        >
          <X size={18} />
        </button>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-wide">
                {details?.influencer?.name || 'Influencer'} Payout Breakdown
              </h3>
              <p className="text-sm font-bold text-gray-400 uppercase">
                Influencer Commission Account ID: {influencerId}
              </p>
            </div>
          </div>

          {/* Quick Info Bar */}
          {details?.influencer && (
            <div className={`p-4 rounded-2xl border grid grid-cols-2 md:grid-cols-4 gap-4 text-left ${
              isDarkMode ? 'bg-gray-900/50 border-white/5' : 'bg-gray-50 border-gray-100'
            }`}>
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase">Creator</p>
                <p className="text-sm font-bold text-primary">{details.influencer.name}</p>
              </div>
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase">Total Orders</p>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{details.influencer.totalOrders}</p>
              </div>
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase">Lifetime Sales</p>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>₹{details.influencer.totalSales?.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase">Paid / Pending Earnings</p>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  ₹{details.influencer.paidCommission || 0} / ₹{details.influencer.pendingCommission || 0}
                </p>
              </div>
            </div>
          )}

          {/* Filters inside Modal */}
          <div className={`p-4 rounded-2xl border text-left space-y-3 ${
            isDarkMode ? 'bg-gray-900/30 border-white/5' : 'bg-gray-50/50 border-gray-100'
          }`}>
            <span className="text-sm font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal size={12} className="text-primary" /> Filter details by Month/Year
            </span>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-100 text-gray-800'
                }`}
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-100 text-gray-800'
                }`}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-primary mb-3" size={32} />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Calculating audit...</span>
            </div>
          ) : details ? (
            <div className="space-y-6">
              
              {/* Summary Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Orders This Month', value: details.summary?.totalOrders ?? 0, icon: <ShoppingBag size={14} className="text-blue-500" /> },
                  { label: 'Sales This Month', value: `₹${(details.summary?.totalSales ?? 0).toLocaleString('en-IN')}`, icon: <TrendingUp size={14} className="text-emerald-500" /> },
                  { label: 'Platform Profit', value: `₹${(details.summary?.totalPlatformCommission ?? 0).toLocaleString('en-IN')}`, icon: <Percent size={14} className="text-purple-500" /> },
                  { label: 'Achieved Slabs Rate', value: `${details.summary?.commissionRate ?? 0}%`, icon: <Percent size={14} className="text-pink-500" /> },
                  { label: 'Calculated Payout', value: `₹${(details.summary?.calculatedPayout ?? 0).toLocaleString('en-IN')}`, icon: <IndianRupee size={14} className="text-emerald-400" />, highlight: true },
                  { label: 'Settled vs Pending', value: `₹${details.summary?.settledAmount ?? 0} / ₹${details.summary?.pendingAmount ?? 0}`, icon: <Calendar size={14} className="text-amber-500" /> }
                ].map((stat, i) => (
                  <div key={i} className={`p-4 rounded-2xl border text-left flex flex-col justify-between ${
                    stat.highlight 
                      ? isDarkMode ? 'bg-primary/10 border-primary/20' : 'bg-primary/[0.02] border-primary/10'
                      : isDarkMode ? 'bg-gray-900/30 border-white/5' : 'bg-gray-50 border-gray-100'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{stat.label}</span>
                      {stat.icon}
                    </div>
                    <p className={`text-base font-black ${stat.highlight ? 'text-primary' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Achieved Slab Detail */}
              <div className={`p-5 rounded-2xl border text-left ${
                isDarkMode ? 'bg-gray-900/30 border-white/5' : 'bg-pink-500/[0.01] border-pink-500/10 shadow-sm'
              }`}>
                <span className="text-sm font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Award size={13} className="text-pink-500" /> Achieved Target Slab details
                </span>
                {details.slab ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className={`text-base font-black ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {details.summary?.commissionRate}% Commission Slab Reached!
                      </p>
                      <p className="text-sm text-gray-400 font-bold uppercase mt-1">
                        Applied slab sales target range: ₹{details.slab.minSales?.toLocaleString('en-IN')} - ₹{details.slab.maxSales?.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-pink-500/10 text-pink-500 font-black text-xs uppercase">
                      Target Achieved
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase">No target slab achieved for this month</p>
                    <p className="text-xs text-gray-400 uppercase mt-0.5">Sales generated are lower than the minimum slab requirement</p>
                  </div>
                )}
              </div>

              {/* Commissions details List */}
              <div className="space-y-3">
                <span className="text-sm font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5 text-left">
                  <ShoppingBag size={12} className="text-primary" /> Active Commission Orders List (Commissions)
                </span>
                {details.commissions && details.commissions.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-white/5">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`text-xs font-black uppercase tracking-wider border-b ${
                          isDarkMode ? 'bg-gray-900/50 border-white/5 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'
                        }`}>
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4 text-right">Order Sales</th>
                          <th className="py-3 px-4 text-right">Commission</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-xs font-medium">
                        {details.commissions.map((comm, idx) => (
                          <tr key={idx} className={isDarkMode ? 'hover:bg-white/[0.01]' : 'hover:bg-gray-50/50'}>
                            <td className="py-3 px-4 font-mono text-sm text-gray-400">{comm.orderId || 'N/A'}</td>
                            <td className="py-3 px-4 text-right">₹{(comm.salesAmount || 0).toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-primary font-bold">₹{(comm.earnedAmount || 0).toLocaleString()}</td>
                            <td className="py-3 px-4 text-center uppercase text-xs font-black">
                              <span className={comm.isSettled ? 'text-green-500' : 'text-amber-500'}>
                                {comm.isSettled ? 'Settled' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={`py-6 rounded-2xl border text-center ${
                    isDarkMode ? 'border-white/5' : 'border-gray-100 bg-gray-50/20'
                  }`}>
                    <p className="text-sm font-bold text-gray-400 uppercase">No active commission orders for this month</p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-gray-400 uppercase">Commission details empty.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-6 border-t flex-shrink-0 ${
          isDarkMode ? 'border-white/5 bg-gray-900/30' : 'border-gray-100 bg-gray-50/30'
        }`}>
          <button 
            onClick={onClose} 
            className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            Close View
          </button>
        </div>

      </div>
    </div>
  );
};

export default InfluencerCommissionDetailsModal;
