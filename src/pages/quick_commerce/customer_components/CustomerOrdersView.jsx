import React from 'react';
import { Search, X, XCircle, Calendar, Eye, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { handleImageError } from '../../../utils/imageUrl';

const CustomerOrdersView = ({
  orders = [],
  orderSearchQuery,
  setOrderSearchQuery,
  orderCurrentPage,
  setOrderCurrentPage,
  orderItemsPerPage,
  setOrderItemsPerPage,
  paginatedUserOrders = [],
  filteredUserOrders = [],
  userOrderTotalItems,
  userOrderTotalPages,
  validUserOrderPage,
  userOrderStartIndex,
  setSelectedUserOrderModal,
  handleCancelOrder,
  getStatusBadge,
  formatOrderDate,
  getItemImage
}) => {
  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Controls Bar: Search & Page Size */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={orderSearchQuery}
            onChange={(e) => { setOrderSearchQuery(e.target.value); setOrderCurrentPage(1); }}
            placeholder="Search by Order ID, Product name..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary font-medium text-slate-800"
          />
          {orderSearchQuery && (
            <button onClick={() => { setOrderSearchQuery(''); setOrderCurrentPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>Rows:</span>
            <select
              value={orderItemsPerPage}
              onChange={(e) => { setOrderItemsPerPage(Number(e.target.value)); setOrderCurrentPage(1); }}
              className="bg-white border border-slate-200 text-slate-700 rounded-xl px-2 py-1 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {paginatedUserOrders.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          <XCircle className="mx-auto mb-4 text-slate-350 stroke-[1.5]" size={44} />
          <h4 className="text-sm font-black uppercase text-slate-700 tracking-wider">No Quick Orders Found</h4>
          <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto mt-1">
            You haven't placed any 10-minute express orders matching your search or filters yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm bg-white">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-100 text-xs font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Items Ordered</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Total Paid</th>
                <th className="py-3.5 px-4">Delivery Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedUserOrders.map((ord) => (
                <tr key={ord._id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Order ID & Date */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-black text-slate-800 block text-xs">
                      #{ord._id?.substring(0, 8)}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 block mt-0.5 flex items-center gap-1">
                      <Calendar size={10} className="inline text-slate-400" />
                      {formatOrderDate(ord.createdAt)}
                    </span>
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
                            onError={handleImageError}
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
                    <span className="inline-block bg-slate-100 text-slate-700 font-extrabold text-xs px-2 py-0.5 rounded-md uppercase tracking-wider mb-0.5">
                      {ord.paymentMethod?.replace(/_/g, ' ') || 'COD'}
                    </span>
                    <span className={`block text-xs font-black uppercase ${
                      ord.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {ord.paymentStatus || 'PENDING'}
                    </span>
                  </td>

                  {/* Total Paid */}
                  <td className="py-3.5 px-4 font-black font-mono text-slate-800 text-sm">
                    ₹{(ord.grandTotal || ord.total || 0).toFixed(2)}
                  </td>

                  {/* Delivery Status */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusBadge(ord.status)}`}>
                      {ord.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* EYE BUTTON FOR FULL USER DETAILS */}
                      <button
                        onClick={() => setSelectedUserOrderModal(ord)}
                        title="View Full Order Details"
                        className="p-2 rounded-xl bg-rose-50 hover:bg-primary hover:text-white text-primary border border-rose-100 transition-colors cursor-pointer shadow-sm"
                      >
                        <Eye size={15} />
                      </button>

                      {(ord.status === 'PLACED' || ord.status === 'PROCESSING') && (
                        <button
                          onClick={() => handleCancelOrder(ord._id)}
                          title="Cancel Order"
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl text-xs font-black uppercase transition-colors cursor-pointer"
                        >
                          Cancel
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
      {filteredUserOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{userOrderTotalItems === 0 ? 0 : userOrderStartIndex + 1}</strong> to{' '}
            <strong className="text-slate-800">{Math.min(userOrderStartIndex + orderItemsPerPage, userOrderTotalItems)}</strong> of{' '}
            <strong className="text-slate-800">{userOrderTotalItems}</strong> entries
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={validUserOrderPage <= 1}
              onClick={() => setOrderCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-primary border border-rose-100 font-extrabold text-xs">
              Page {validUserOrderPage} of {userOrderTotalPages}
            </span>

            <button
              disabled={validUserOrderPage >= userOrderTotalPages}
              onClick={() => setOrderCurrentPage(prev => Math.min(prev + 1, userOrderTotalPages))}
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

export default CustomerOrdersView;
