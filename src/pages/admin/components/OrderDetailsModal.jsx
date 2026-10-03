import React, { useState, useEffect } from 'react';
import { Loader2, X, FileText, MapPin, Calendar, CreditCard, Tag, MessageSquare, ShoppingBag } from 'lucide-react';
import { toast } from '../../../utils/toast';
import { getOrderById } from '../../../api/adminService';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Order Details Modal
 * Fetches order details dynamically from /admin/orderDetails/:orderId
 */
const OrderDetailsModal = ({ orderId, onClose }) => {
  const { isDarkMode } = useTheme();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const response = await getOrderById(orderId);
        // The API returns data wrapped in data: { success, data: order }
        if (response.success) {
          const order = response.data?.data || response.data || response;
          setDetails(order);
        } else {
          toast.error(response.message || 'Failed to fetch order details');
        }
      } catch (err) {
        console.error('Fetch order details error:', err);
        toast.error('Could not load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [orderId]);

  if (!orderId) return null;

  // Formatting currency in Indian Rupees (INR)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'shipped':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'delivered':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'cancelled':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto font-outfit text-left">
      <div className={`w-full max-w-2xl my-auto rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <span className="text-xs font-bold text-gray-400 uppercase">Fetching Order Details...</span>
          </div>
        ) : details ? (
          <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b pb-4 border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${isDarkMode ? 'bg-gray-900 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  <ShoppingBag className="text-primary" size={20} />
                </div>
                <div>
                  <h2 className={`text-lg font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{details.orderNumber}</h2>
                  <p className="text-sm font-bold text-gray-400 uppercase mt-0.5 flex items-center gap-1">
                    <Calendar size={10} /> {(() => {
                      const dateVal = details.createdAt || details.dateOfPurchase;
                      const dateObj = dateVal ? new Date(dateVal) : null;
                      return dateObj && !isNaN(dateObj.getTime())
                        ? dateObj.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                        : 'N/A';
                    })()}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className={`p-2 rounded-xl transition-all hover:scale-105 cursor-pointer ${isDarkMode ? 'hover:bg-white/5 text-gray-500 hover:text-white' : 'hover:bg-gray-50 text-gray-400 hover:text-gray-800'}`}>
                <X size={20} />
              </button>
            </div>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900/50 border-white/5' : 'bg-gray-50 border-gray-100/50'}`}>
                <p className="text-sm font-bold text-gray-400 uppercase mb-1">Order Status</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${getOrderStatusColor(details.orderStatus)}`}>
                  {details.orderStatus || 'Pending'}
                </span>
              </div>
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900/50 border-white/5' : 'bg-gray-50 border-gray-100/50'}`}>
                <p className="text-sm font-bold text-gray-400 uppercase mb-1">Payment Method</p>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase flex items-center gap-1">
                  <CreditCard size={12} className="text-primary" /> {details.paymentMethod || 'COD'}
                </span>
              </div>
              <div className={`p-4 rounded-2xl border col-span-2 sm:col-span-1 ${isDarkMode ? 'bg-gray-900/50 border-white/5' : 'bg-gray-50 border-gray-100/50'}`}>
                <p className="text-sm font-bold text-gray-400 uppercase mb-1">Payment Status</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${details.paymentStatus === 'paid' ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'}`}>
                  {details.paymentStatus || 'Pending'}
                </span>
              </div>
            </div>

            {/* Customer & Shipping Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-gray-900/20 border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
                <p className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                  <MapPin size={12} /> Shipping Address
                </p>
                {details.shippingAddress ? (
                  <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400 font-medium">
                    <p className={`text-sm font-bold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Phone: {details.shippingAddress.phone}</p>
                    <p>{details.shippingAddress.line1}</p>
                    {details.shippingAddress.line2 && <p>{details.shippingAddress.line2}</p>}
                    <p>{details.shippingAddress.city}, {details.shippingAddress.state} - {details.shippingAddress.pincode}</p>
                    <p className="uppercase font-bold text-sm text-primary tracking-wider mt-1">{details.shippingAddress.country || 'India'}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No shipping address recorded.</p>
                )}
              </div>

              {/* Vendor & General Info */}
              <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-gray-900/20 border-white/5' : 'bg-gray-50/50 border-gray-100'} flex flex-col justify-between`}>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                    <FileText size={12} /> Order Notes
                  </p>
                  <p className={`p-3 rounded-xl text-xs border leading-relaxed italic ${isDarkMode ? 'bg-gray-900/50 border-white/5 text-gray-400' : 'bg-white border-gray-100 text-gray-500'}`}>
                    {details.notes || 'No instructions provided.'}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-400 uppercase text-xs">Vendor ID</span>
                  <span className="font-mono font-bold text-zinc-600 dark:text-zinc-300">{details.vendorId || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase mb-3">Order Items</p>
              <div className={`border rounded-2xl overflow-hidden ${isDarkMode ? 'border-white/5' : 'border-gray-100 shadow-sm bg-white dark:bg-transparent'}`}>
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-xs font-bold uppercase text-zinc-400 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                      <th className="p-3">Product Name</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {details.items?.map((item, index) => (
                      <tr key={index} className={isDarkMode ? 'hover:bg-zinc-900/50' : 'hover:bg-zinc-50'}>
                        <td className="p-3">
                          <span className={`font-bold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>{item.productName}</span>
                          {item.sku && <p className="text-xs text-zinc-400 font-mono mt-0.5">SKU: {item.sku}</p>}
                        </td>
                        <td className="p-3 text-center font-bold text-gray-600 dark:text-gray-400">{item.quantity || 0}</td>
                        <td className="p-3 text-right font-medium text-gray-600 dark:text-gray-400">{formatCurrency(item.salesPrice || item.price || 0)}</td>
                        <td className="p-3 text-right font-bold text-primary">{formatCurrency(item.totalPrice || ((item.salesPrice || item.price || 0) * (item.quantity || 0)))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Applied Coupon Info */}
            {details.appliedCoupon && details.appliedCoupon.code && (
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${isDarkMode ? 'bg-purple-950/20 border-purple-500/15' : 'bg-purple-50/30 border-purple-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                    <Tag size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Coupon {details.appliedCoupon.code}</span>
                    <p className="text-xs text-zinc-400 uppercase mt-0.5">Partner: {details.appliedCoupon.influencerName || 'Global'}</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span className="font-bold text-purple-600 dark:text-purple-400">- {formatCurrency(details.appliedCoupon.discountAmount)}</span>
                  <p className="text-xs text-zinc-400 uppercase mt-0.5">Discount Applied</p>
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className={`p-5 rounded-3xl border space-y-3 ${isDarkMode ? 'bg-gray-900/30 border-white/5' : 'bg-gray-50/30 border-gray-100'}`}>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-bold">{formatCurrency(details.subTotal || 0)}</span>
              </div>
              {(details.discount || 0) > 0 && (
                <div className="flex justify-between text-xs text-purple-600 dark:text-purple-400">
                  <span>Discount Code</span>
                  <span className="font-bold">- {formatCurrency(details.discount || 0)}</span>
                </div>
              )}
              {(details.shippingCharge || 0) > 0 && (
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Shipping & Delivery</span>
                  <span className="font-bold">{formatCurrency(details.shippingCharge || 0)}</span>
                </div>
              )}
              {(details.tax || 0) > 0 && (
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Tax & Compliance (GST)</span>
                  <span className="font-bold">{formatCurrency(details.tax || 0)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-white/5 text-sm">
                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Grand Total</span>
                <span className="font-bold text-primary text-base">{formatCurrency(details.grandTotal || 0)}</span>
              </div>
            </div>

            <button onClick={onClose} className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-xs uppercase shadow-xl shadow-primary/20 hover:opacity-95 active:opacity-90 transition-all cursor-pointer">
              Dismiss Invoice
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default OrderDetailsModal;
