import React from 'react';
import { Eye, Download, Truck, UserCheck, Bike } from 'lucide-react';

const VendorOrders = ({
  isDarkMode,
  orders,
  ordersLoading,
  onViewOrder,
  onExportOrders
}) => {
  const [orderTypeFilter, setOrderTypeFilter] = React.useState('standard');

  const filteredOrders = orders.filter((order) => {
    const isQuick = order.isQuickDelivery || order.orderType === 'QUICK' || order.isQuickCommerce;
    if (orderTypeFilter === 'quick') return isQuick;
    if (orderTypeFilter === 'standard') return !isQuick;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold">Customer Orders</h2>
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setOrderTypeFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${orderTypeFilter === 'all'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setOrderTypeFilter('standard')}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${orderTypeFilter === 'standard'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              📦 Standard ({orders.filter(o => !o.isQuickDelivery && o.orderType !== 'QUICK' && !o.isQuickCommerce).length})
            </button>
          </div>
        </div>

        {orders.length > 0 && (
          <button
            onClick={onExportOrders}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold uppercase transition-all shadow-md shadow-primary/10 cursor-pointer self-start sm:self-auto"
          >
            <Download size={14} />
            Export CSV
          </button>
        )}
      </div>

      <div className={`rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-zinc-900 border-zinc-800 shadow-md' : 'bg-white border-zinc-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`${isDarkMode ? 'bg-zinc-950 border-b border-zinc-800' : 'bg-zinc-50 border-b border-zinc-200'}`}>
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Order Number</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Items</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Grand Total</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Payout Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800' : 'divide-zinc-100'}`}>
              {ordersLoading ? (
                <tr><td colSpan="8" className="p-10 text-center font-bold text-zinc-400">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="8" className="p-10 text-center font-bold text-zinc-400">No orders found matching the selected filter.</td></tr>
              ) : filteredOrders.map((order) => {
                const itemsCount = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
                const orderDate = order.createdAt ? new Date(order.createdAt) : null;
                const isDateValid = orderDate && !isNaN(orderDate.getTime());

                let statusColor = isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-655';
                if (order.orderStatus === 'delivered') statusColor = isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600';
                else if (order.orderStatus === 'cancelled') statusColor = isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-655';

                return (
                  <tr key={order._id} className={`${isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50/50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`font-bold text-sm ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{order.orderNumber}</span>
                        {(order.isQuickDelivery || order.orderType === 'QUICK' || order.isQuickCommerce) ? (
                          <span className="inline-flex items-center gap-1 w-max px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-amber-500/20 text-amber-500 border border-amber-500/30 animate-pulse">
                            ⚡ 10-MIN EXPRESS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 w-max px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-zinc-500/10 text-zinc-400 border border-zinc-700/50">
                            📦 STANDARD
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`font-bold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{order.userId?.name || 'User'}</span>
                        <span className={`text-sm font-mono ${isDarkMode ? 'text-gray-550' : 'text-gray-400'}`}>{order.userId?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-250' : 'text-gray-800'}`}>
                          {isDateValid ? orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </span>
                        <span className={`text-sm uppercase font-bold ${isDarkMode ? 'text-gray-550' : 'text-gray-400'}`}>
                          {isDateValid ? orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-gray-450' : 'text-gray-600'}`}>{itemsCount} units</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">₹{(order.grandTotal || 0).toLocaleString()}</td>
                    <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>₹{(order.payoutAmount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full w-max ${statusColor}`}>
                          {order.orderStatus || 'pending'}
                        </span>
                        {order.deliveryPersonId ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-500">
                            <UserCheck size={11} /> {typeof order.deliveryPersonId === 'object' ? (order.deliveryPersonId.name || 'Rider Assigned') : 'Rider Assigned'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-500/80">
                            <Bike size={11} /> Rider Unassigned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewOrder(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all cursor-pointer"
                          title="Assign Rider & View Details"
                        >
                          <Truck size={14} />
                          <span>{order.deliveryPersonId ? 'Rider Details' : 'Assign Rider'}</span>
                        </button>
                        <button
                          onClick={() => onViewOrder(order)}
                          className={`p-2 rounded-xl transition-all ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'} cursor-pointer`}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && !ordersLoading && (
                <tr><td colSpan="8" className="p-10 text-center font-bold text-gray-400">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorOrders;

