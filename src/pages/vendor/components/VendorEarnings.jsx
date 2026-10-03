import React from 'react';
import { IndianRupee, Percent, TrendingUp, Clock, Eye, Wallet } from 'lucide-react';

const VendorEarnings = ({
  isDarkMode,
  overviewData,
  salesPerformance,
  salesPerformanceLoading,
  orders,
  ordersLoading,
  onViewOrder,
  formatCurrency
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-[28px] border transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
          isDarkMode ? 'bg-gray-900 border-white/5 shadow-xl text-white' : 'bg-white border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] text-gray-800'
        }`}>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Net Earnings</p>
          <span className={`text-xl font-extrabold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
            {formatCurrency(overviewData?.netProfit || 0)}
          </span>
          <div className="absolute right-4 bottom-4 text-emerald-500/20"><IndianRupee size={28} /></div>
        </div>

        <div className={`p-6 rounded-[28px] border transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
          isDarkMode ? 'bg-gray-900 border-white/5 shadow-xl text-white' : 'bg-white border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] text-gray-800'
        }`}>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Commission Deducted</p>
          <span className={`text-xl font-extrabold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            {formatCurrency((overviewData?.totalRevenue || 0) - (overviewData?.netProfit || 0))}
          </span>
          <div className="absolute right-4 bottom-4 text-indigo-500/20"><Percent size={28} /></div>
        </div>

        <div className={`p-6 rounded-[28px] border transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
          isDarkMode ? 'bg-gray-900 border-white/5 shadow-xl text-white' : 'bg-white border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] text-gray-800'
        }`}>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Gross Revenue</p>
          <span className="text-xl font-extrabold text-primary">
            {formatCurrency(overviewData?.totalRevenue || 0)}
          </span>
          <div className="absolute right-4 bottom-4 text-primary/20"><TrendingUp size={28} /></div>
        </div>

        <div className={`p-6 rounded-[28px] border transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
          isDarkMode ? 'bg-gray-900 border-white/5 shadow-xl text-white' : 'bg-white border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] text-gray-800'
        }`}>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Pending Payouts</p>
          <span className={`text-xl font-extrabold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
            {formatCurrency(overviewData?.pendingPayout || 0)}
          </span>
          <div className="absolute right-4 bottom-4 text-amber-500/20"><Clock size={28} /></div>
        </div>
      </div>


      {/* Sales Performance API block */}
      <div className={`p-6 md:p-8 rounded-[32px] border text-left transition-all duration-300 ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 shadow-md' : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-xs font-bold text-primary uppercase block mb-1">Metrics Node</span>
            <h3 className={`text-base font-extrabold uppercase ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              Sales Performance Analytics
            </h3>
          </div>
          <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-xl text-xs font-bold uppercase">
            Active Analytics
          </span>
        </div>

        {salesPerformanceLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Hydrating sales performance analytics...</p>
          </div>
        ) : salesPerformance.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-gray-950 text-gray-700' : 'bg-gray-50 text-gray-350'}`}>
              <TrendingUp size={32} />
            </div>
            <div>
              <h4 className={`text-sm font-bold uppercase ${isDarkMode ? 'text-gray-250' : 'text-gray-700'}`}>No Performance Records</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Sales performance logs are currently empty. Check back once orders are placed and processed!
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className={`${isDarkMode ? 'bg-gray-950/40 border-b border-white/5' : 'bg-gray-50 border-b border-gray-100'}`}>
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase">Period</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase">Orders Count</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase">Gross Volume</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase">Commission</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase text-right">Net Payout</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-50'}`}>
                {salesPerformance.map((item, idx) => (
                  <tr key={idx} className={`${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50/50'} transition-colors text-xs font-bold`}>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{item.period || item.month || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.ordersCount || item.totalOrders || 0}</td>
                    <td className="px-4 py-3 text-primary">₹{(item.grossRevenue || item.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-indigo-500">₹{(item.commissionDeducted || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-green-600 text-right">₹{(item.netPayout || item.payoutAmount || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Earnings Ledger Table */}
      <div className={`rounded-[32px] border overflow-hidden transition-all duration-300 ${
        isDarkMode ? 'bg-gray-900 border-white/5 shadow-xl' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-white/5' : 'border-gray-50'}`}>
          <div>
            <h3 className={`text-base font-extrabold uppercase ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Earnings Ledger</h3>
            <p className="text-sm text-gray-400 font-bold uppercase mt-1">Detailed Payout Breakdown per Customer Order</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`}>
            Active Ledger
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`${isDarkMode ? 'bg-gray-950/40 border-b border-white/5' : 'bg-gray-50 border-b border-gray-100'}`}>
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Order Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Sale Value</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Commission Fee</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Net Payout</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Payout Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-gray-50'}`}>
              {ordersLoading ? (
                <tr><td colSpan="6" className="p-10 text-center font-bold text-gray-400">Loading ledger logs...</td></tr>
              ) : orders.map((order) => {
                const payoutAmt = order.payoutAmount || 0;
                const grandTotalAmt = order.grandTotal || 0;
                const commissionAmt = Math.max(grandTotalAmt - payoutAmt, 0);
                const isSettled = order.paymentStatus === 'paid' && order.orderStatus === 'delivered';
                const payoutStatusColor = isSettled
                  ? (isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600')
                  : (isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600');
                
                return (
                  <tr key={order._id} className={`${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50/50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`font-bold text-sm ${isDarkMode ? 'text-gray-250' : 'text-gray-800'}`}>{order.orderNumber}</span>
                        <span className={`text-sm font-mono ${isDarkMode ? 'text-gray-550' : 'text-gray-400'}`}>{order.userId?.name || 'User'}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>₹{grandTotalAmt.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-indigo-500">₹{commissionAmt.toLocaleString()} ({order.commissionRate || 0}%)</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-500">₹{payoutAmt.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${payoutStatusColor}`}>
                        {isSettled ? 'Settled' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onViewOrder(order)}
                        className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-gray-500 hover:text-blue-400 hover:bg-blue-500/10' : 'text-gray-300 hover:text-blue-500 hover:bg-blue-50'} cursor-pointer`}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && !ordersLoading && (
                <tr><td colSpan="6" className="p-10 text-center font-bold text-gray-400">No ledger transactions recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorEarnings;
