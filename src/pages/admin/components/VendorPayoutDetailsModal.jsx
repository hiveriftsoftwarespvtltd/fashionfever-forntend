import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Loader2, X, Store, IndianRupee, Calendar, ShoppingBag, TrendingUp, SlidersHorizontal, ChevronLeft, ChevronRight, Percent } from 'lucide-react';
import { toast } from '../../../utils/toast';
import { getVendorPayoutDetails, settleVendorPayout } from '../../../api/adminService';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Vendor Payout Details Modal
 */
export const VendorPayoutDetailsModal = ({ vendorId, onClose, initialMonth, initialYear }) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);

  // Initialize query filters inside modal
  const [filters, setFilters] = useState({
    month: initialMonth || new Date().getMonth() + 1,
    year: initialYear || new Date().getFullYear(),
    status: 'all',
    page: 1,
    limit: 5
  });

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1
  });

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await getVendorPayoutDetails(vendorId, {
        month: filters.month,
        year: filters.year,
        status: filters.status,
        page: filters.page,
        limit: filters.limit
      });

      if (response.success) {
        // Nested response unpack safely: { success: true, statusCode: 200, data: { success: true, data: { vendor, filters, summary, pagination, orders } } }
        const outerData = response.data?.data || response.data || {};
        setDetails(outerData);
        
        setPagination({
          total: outerData.pagination?.total || 0,
          totalPages: outerData.pagination?.totalPages || 1
        });
      } else {
        toast.error(response.message || 'Failed to fetch vendor payout details.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Could not load vendor payout details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) fetchDetails();
  }, [vendorId, filters.month, filters.year, filters.status, filters.page, filters.limit]);

  if (!vendorId) return null;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'limit' || name === 'month' || name === 'year' ? Number(value) : value,
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

  const unsettledOrders = details?.orders?.filter(o => !o.isVendorSettled) || [];
  const unsettledOrderIds = unsettledOrders.map(o => o._id || o.orderId);

  const handleSettlePayout = async () => {
    if (unsettledOrderIds.length === 0) {
      toast.error('No pending orders to settle.');
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: 'Settle Vendor Payout',
      html: `
        <div class="text-left space-y-4 font-sans ${isDarkMode ? 'text-white' : 'text-gray-800'}">
          <p class="text-xs text-gray-400 font-bold uppercase tracking-wider text-left">
            Settling ${unsettledOrderIds.length} orders for ${months.find(m => m.value === filters.month)?.label} ${filters.year}
          </p>
          <div class="text-left">
            <label class="block text-[11px] font-bold text-gray-400 uppercase mb-1.5 text-left">Transaction ID <span class="text-red-500">*</span></label>
            <input 
              id="swal-txn-id" 
              type="text" 
              class="w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all ${
                isDarkMode 
                  ? 'bg-gray-900 border-gray-700 text-white focus:border-primary' 
                  : 'bg-white border-gray-200 text-gray-800 focus:border-primary'
              }" 
              placeholder="e.g. TXN9876543210"
              required
            />
          </div>
          <div class="text-left">
            <label class="block text-[11px] font-bold text-gray-400 uppercase mb-1.5 text-left">Remarks / Notes</label>
            <textarea 
              id="swal-remarks" 
              rows="3"
              class="w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all resize-none ${
                isDarkMode 
                  ? 'bg-gray-900 border-gray-700 text-white focus:border-primary' 
                  : 'bg-white border-gray-200 text-gray-800 focus:border-primary'
              }" 
              placeholder="Add payout details or reference notes..."
            ></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirm Settlement',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#EC4899',
      cancelButtonColor: isDarkMode ? '#374151' : '#E5E7EB',
      customClass: {
        popup: `${isDarkMode ? '!bg-gray-800 !text-white' : '!bg-white !text-gray-800'} rounded-3xl p-6 md:p-8 max-w-md w-full border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`,
        title: '!text-lg !font-bold !uppercase !tracking-wide !mb-4 !mt-2 !text-left',
        actions: 'flex gap-3 w-full mt-4',
        confirmButton: '!flex-1 !py-3.5 !rounded-2xl !font-bold !text-xs !uppercase !shadow-lg !m-0 !cursor-pointer',
        cancelButton: `!flex-1 !py-3.5 !rounded-2xl !font-bold !text-xs !uppercase !m-0 !cursor-pointer ${isDarkMode ? '!text-gray-300' : '!text-gray-500'}`
      },
      focusConfirm: false,
      preConfirm: () => {
        const transactionId = document.getElementById('swal-txn-id').value.trim();
        const remarks = document.getElementById('swal-remarks').value.trim();
        if (!transactionId) {
          Swal.showValidationMessage('Transaction ID is required to settle payment');
          return false;
        }
        return { transactionId, remarks: remarks || 'Vendor Settle' };
      }
    });

    if (formValues) {
      Swal.fire({
        title: 'Processing Payment',
        html: `
          <div class="flex flex-col items-center justify-center py-6">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Settle transaction in progress...</p>
          </div>
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
        customClass: {
          popup: `${isDarkMode ? '!bg-gray-800 !text-white' : '!bg-white !text-gray-800'} rounded-3xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`,
          title: '!text-base !font-bold !uppercase !tracking-wide !mb-2'
        }
      });

      try {
        const payload = {
          vendorId,
          remarks: formValues.remarks,
          transactionId: formValues.transactionId,
          month: filters.month,
          year: filters.year,
          vendorOrderIds: unsettledOrderIds
        };

        const response = await settleVendorPayout(payload);
        if (response.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Payout Completed',
            text: response.message || 'Vendor payout settled successfully!',
            confirmButtonText: 'Awesome',
            confirmButtonColor: '#10B981',
            customClass: {
              popup: `${isDarkMode ? '!bg-gray-800 !text-white' : '!bg-white !text-gray-800'} rounded-3xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`,
              title: '!text-base !font-bold !uppercase !tracking-wide !mb-2',
              confirmButton: '!py-3 !px-6 !rounded-2xl !font-bold !text-xs !uppercase !shadow-lg'
            }
          });
          fetchDetails();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Settlement Failed',
            text: response.message || 'Failed to complete payout settlement.',
            confirmButtonText: 'Try Again',
            confirmButtonColor: '#EF4444',
            customClass: {
              popup: `${isDarkMode ? '!bg-gray-800 !text-white' : '!bg-white !text-gray-800'} rounded-3xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`,
              title: '!text-base !font-bold !uppercase !tracking-wide !mb-2',
              confirmButton: '!py-3 !px-6 !rounded-2xl !font-bold !text-xs !uppercase !shadow-lg'
            }
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error Occurred',
          text: 'Something went wrong during settlement. Please try again.',
          confirmButtonText: 'Dismiss',
          confirmButtonColor: '#EF4444',
          customClass: {
            popup: `${isDarkMode ? '!bg-gray-800 !text-white' : '!bg-white !text-gray-800'} rounded-3xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`,
            title: '!text-base !font-bold !uppercase !tracking-wide !mb-2',
            confirmButton: '!py-3 !px-6 !rounded-2xl !font-bold !text-xs !uppercase !shadow-lg'
          }
        });
      }
    }
  };

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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Store size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-wide">
                {details?.vendor?.businessName || 'Vendor'} Payout Details
              </h3>
              <p className="text-sm font-bold text-gray-400 uppercase">
                Vendor Brand Account ID: {vendorId}
              </p>
            </div>
          </div>

          {/* Quick Info Bar */}
          {details?.vendor && (
            <div className={`p-4 rounded-2xl border grid grid-cols-2 gap-4 text-left ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase">Brand Shop</p>
                <p className="text-sm font-bold text-primary">{details.vendor.businessName}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase">Vendor Reference ID</p>
                <p className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-300">{details.vendor._id}</p>
              </div>
            </div>
          )}

          {/* Interactive Filters Bar */}
          <div className={`p-4 rounded-2xl border text-left space-y-3 ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <span className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal size={14} className="text-primary" /> Filter vendor payments and orders list
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all cursor-pointer ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-800'
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
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all cursor-pointer ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-800'
                }`}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold outline-none border transition-all cursor-pointer ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-800'
                }`}
              >
                <option value="all">All Payout Orders</option>
                <option value="pending">Pending Settle</option>
                <option value="settled">Settled Slabs</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-primary mb-3" size={32} />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Calculating payout audits...</span>
            </div>
          ) : details ? (
            <div className="space-y-6">
              
              {/* Summary Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Orders', value: details.summary?.totalOrders ?? 0, icon: <ShoppingBag size={15} className="text-blue-500" /> },
                  { label: 'Gross Sales', value: `₹${(details.summary?.totalSales ?? 0).toLocaleString('en-IN')}`, icon: <TrendingUp size={15} className="text-emerald-500" /> },
                  { label: 'Platform Profit', value: `₹${(details.summary?.platformCommission ?? 0).toLocaleString('en-IN')}`, icon: <Percent size={15} className="text-purple-500" /> },
                  { label: 'Net Vendor Payout', value: `₹${(details.summary?.netPayout ?? 0).toLocaleString('en-IN')}`, icon: <IndianRupee size={15} className="text-rose-500" />, highlight: true }
                ].map((stat, i) => (
                  <div key={i} className={`p-4 rounded-2xl border text-left flex flex-col justify-between ${
                    stat.highlight 
                      ? isDarkMode ? 'bg-primary/10 border-primary/20' : 'bg-primary/[0.02] border-primary/10'
                      : isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{stat.label}</span>
                      {stat.icon}
                    </div>
                    <p className={`text-base font-black ${stat.highlight ? 'text-primary' : isDarkMode ? 'text-white' : 'text-zinc-800'}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Contributed Orders List */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 text-left">
                  <ShoppingBag size={14} className="text-primary" /> Vendor Orders List
                </span>
                {details.orders && details.orders.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`text-xs font-bold uppercase tracking-wider border-b ${
                          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                        }`}>
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4 text-right">Order Sales</th>
                          <th className="py-3 px-4 text-right">Platform Commission</th>
                          <th className="py-3 px-4 text-right">Vendor Net Share</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs font-medium">
                        {details.orders.map((ord, idx) => (
                          <tr key={idx} className={isDarkMode ? 'hover:bg-zinc-900/50' : 'hover:bg-zinc-50'}>
                            <td className="py-3 px-4 font-mono text-xs font-bold text-zinc-400">{ord.orderId || 'N/A'}</td>
                            <td className="py-3 px-4 text-right font-bold text-zinc-700 dark:text-zinc-200">₹{(ord.salesAmount || 0).toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-primary font-bold">₹{(ord.platformCommission || 0).toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-emerald-500 font-bold">₹{(ord.netPayout || 0).toLocaleString()}</td>
                            <td className="py-3 px-4 text-center uppercase text-xs font-bold">
                              <span className={ord.isVendorSettled ? 'text-emerald-500' : 'text-amber-500'}>
                                {ord.isVendorSettled ? 'Settled' : 'Pending'}
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
                    <p className="text-sm font-bold text-gray-400 uppercase">No customer orders for this vendor in this period</p>
                  </div>
                )}
              </div>

              {/* Table pagination inside modal */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-3 pt-2">
                  <button 
                    disabled={filters.page === 1}
                    onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                    className={`p-2.5 rounded-xl disabled:opacity-30 border transition-all cursor-pointer ${
                      isDarkMode ? 'bg-gray-900 border-gray-700 text-white hover:bg-primary' : 'bg-white border-gray-100 hover:bg-primary hover:text-white'
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="px-4 py-2 flex items-center justify-center bg-primary text-white rounded-xl font-bold text-xs">
                    {filters.page} / {pagination.totalPages}
                  </div>
                  <button 
                    disabled={filters.page >= pagination.totalPages}
                    onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                    className={`p-2.5 rounded-xl disabled:opacity-30 border transition-all cursor-pointer ${
                      isDarkMode ? 'bg-gray-900 border-gray-700 text-white hover:bg-primary' : 'bg-white border-gray-100 hover:bg-primary hover:text-white'
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-gray-400 uppercase">Vendor Payout history empty.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-6 border-t flex-shrink-0 flex gap-4 ${
          isDarkMode ? 'border-white/5 bg-gray-900/30' : 'border-gray-100 bg-gray-50/30'
        }`}>
          <button 
            onClick={onClose} 
            className={`flex-1 py-4 border rounded-2xl font-bold text-xs uppercase hover:scale-[1.02] active:scale-95 transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300' 
                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
            }`}
          >
            Close View
          </button>
          
          {unsettledOrders.length > 0 && (
            <button 
              onClick={handleSettlePayout}
              className="flex-1 py-4 bg-gradient-to-r from-primary via-pink-500 to-purple-600 hover:opacity-90 text-white rounded-2xl font-bold text-xs uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              Settle Payout ({unsettledOrders.length})
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default VendorPayoutDetailsModal;
