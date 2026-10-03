import React, { useState } from 'react';
import { RefreshCw, Search, X, ShoppingBag, Calendar, Eye, Truck, ChevronLeft, ChevronRight, Phone, MapPin } from 'lucide-react';

const VendorOrdersPipeline = ({
  orders = [],
  activeOrderTab,
  setActiveOrderTab,
  orderStatuses = [],
  loading,
  handleRefresh,
  handleUpdateOrderStatus,
  handleCancelOrder,
  setSelectedOrderModal,
  setAssigningOrderId,
  formatDate,
  getItemImage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = !activeOrderTab || activeOrderTab === 'ALL'
      ? true
      : activeOrderTab === 'PREPARING'
        ? (o.status === 'PREPARING' || o.status === 'PLACED')
        : o.status === activeOrderTab;

    if (!matchesStatus) return false;

    if (!searchQuery || searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase().trim();
    const orderIdStr = String(o._id || '').toLowerCase();
    const customerName = String(o.quickOrderId?.customerId?.name || '').toLowerCase();
    const customerPhone = String(o.quickOrderId?.shippingAddress?.phone || '').toLowerCase();
    const productNames = (o.items || []).map(i => String(i.productName || '').toLowerCase()).join(' ');

    return orderIdStr.includes(q) || customerName.includes(q) || customerPhone.includes(q) || productNames.includes(q);
  });

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="lg:col-span-8 flex flex-col gap-6 text-left">
      {/* Pipeline tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {orderStatuses.map((tab) => (
            <button
              key={tab.code}
              onClick={() => { setActiveOrderTab(tab.code); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeOrderTab === tab.code
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleRefresh}
          title="Refresh orders"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search & Items Per Page Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by Order ID, Customer, Phone..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary font-medium"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setCurrentPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>Rows:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-white border border-slate-200 text-slate-700 rounded-xl px-2 py-1 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="animate-spin text-primary" size={24} />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Refreshing pipeline...</span>
        </div>
      ) : paginatedOrders.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          <ShoppingBag className="mx-auto mb-4 text-slate-350 stroke-[1.5]" size={44} />
          <h4 className="text-sm font-black uppercase text-slate-700 tracking-wider">No Orders Found</h4>
          <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto mt-1">
            There are no active quick commerce orders matching your selected status or search filter.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm bg-white">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Total Payout</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedOrders.map((ord) => (
                <tr key={ord._id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Order ID & Date */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-black text-slate-800 block text-xs">
                      #{ord._id?.substring(0, 8)}
                    </span>
                    <span className="text-xs font-medium text-slate-400 block mt-0.5 flex items-center gap-1">
                      <Calendar size={11} className="inline text-slate-400" />
                      {formatDate(ord.createdAt || ord.quickOrderId?.createdAt)}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block text-xs capitalize">
                      {ord.quickOrderId?.customerId?.name || 'Customer'}
                    </span>
                    {ord.quickOrderId?.shippingAddress?.phone && (
                      <span className="text-xs text-slate-500 block font-medium flex items-center gap-1">
                        <Phone size={11} /> {ord.quickOrderId.shippingAddress.phone}
                      </span>
                    )}
                    {ord.quickOrderId?.shippingAddress?.pincode && (
                      <span className="text-xs text-slate-400 block flex items-center gap-1">
                        <MapPin size={11} /> Pincode: {ord.quickOrderId.shippingAddress.pincode}
                      </span>
                    )}
                  </td>

                  {/* Items */}
                  <td className="py-3.5 px-4 max-w-[280px]">
                    {ord.items && ord.items.length > 0 ? (
                      <div className="flex items-center gap-2.5">
                        {getItemImage(ord.items[0]) ? (
                          <img
                            src={getItemImage(ord.items[0])}
                            alt={ord.items[0]?.productName}
                            className="w-9 h-9 object-cover rounded-xl border border-slate-200 shadow-xs flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs flex-shrink-0">
                            <ShoppingBag size={14} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-slate-800 block truncate uppercase text-xs">
                            {ord.items[0]?.quantity}x {ord.items[0]?.productName}
                          </span>
                          {ord.items.length > 1 && (
                            <span className="text-xs font-bold text-rose-500 block">
                              +{ord.items.length - 1} more items
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No items</span>
                    )}
                  </td>

                  {/* Payment */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block bg-slate-100 text-slate-700 font-extrabold text-xs px-2.5 py-0.5 rounded-md uppercase tracking-wider mb-0.5">
                      {ord.quickOrderId?.paymentMethod?.replace(/_/g, ' ') || 'COD'}
                    </span>
                    <span className={`block text-xs font-bold uppercase ${
                      ord.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {ord.paymentStatus || 'PENDING'}
                    </span>
                  </td>

                  {/* Total Payout */}
                  <td className="py-3.5 px-4 font-black font-mono text-slate-800 text-sm">
                    ₹{(ord.total || 0).toFixed(2)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      ord.status === 'PREPARING' || ord.status === 'PLACED'
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : ord.status === 'WAITING_FOR_DELIVERY_BOY'
                          ? 'bg-purple-50 text-purple-600 border border-purple-200'
                          : ord.status === 'OUT_FOR_DELIVERY'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : ord.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      {ord.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* EYE BUTTON FOR FULL DETAILS */}
                      <button
                        onClick={() => setSelectedOrderModal(ord)}
                        title="View Order Details"
                        className="p-2 rounded-xl bg-rose-50 hover:bg-primary hover:text-white text-primary border border-rose-100 transition-colors cursor-pointer shadow-sm"
                      >
                        <Eye size={15} />
                      </button>

                      {(ord.status === 'PLACED' || ord.status === 'PREPARING') && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord._id, 'WAITING_FOR_DELIVERY_BOY')}
                          title="Mark Ready for Rider"
                          className="px-2.5 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer shadow-sm"
                        >
                          Ready 📦
                        </button>
                      )}

                      {(ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED') && (
                        <button
                          onClick={() => setAssigningOrderId(ord._id)}
                          title="Assign Dispatch Rider"
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                        >
                          <Truck size={12} />
                          <span>{ord.deliveryPersonId ? 'Re-Assign' : 'Assign Rider'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{totalItems === 0 ? 0 : startIndex + 1}</strong> to{' '}
            <strong className="text-slate-800">{Math.min(startIndex + itemsPerPage, totalItems)}</strong> of{' '}
            <strong className="text-slate-800">{totalItems}</strong> entries
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-primary border border-rose-100 font-extrabold text-xs">
              Page {validCurrentPage} of {totalPages}
            </span>

            <button
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorOrdersPipeline;
