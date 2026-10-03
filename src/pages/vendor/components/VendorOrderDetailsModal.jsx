import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, ShoppingBag, Tag, Landmark, ShieldCheck, Truck, UserCheck, Phone, Bike, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { updateVendorOrder } from '../../../api/vendorService';
import { getVendorDeliveryPersons, assignDeliveryPerson, assignRiderToStandardOrder, getAvailableRiders } from '../../../api/quickECommerceService';
import { toast } from '../../../utils/toast';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Premium Vendor Order Details / Invoice Modal
 * Displays complete order logs, customer details, and payout distributions.
 * Includes interactive order updating panels (PUT `/vendor/update-order/:orderId`).
 */
const VendorOrderDetailsModal = ({ isOpen, onClose, order, onUpdate }) => {
  const { isDarkMode } = useTheme();
  const [currentOrder, setCurrentOrder] = useState(order);
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [updating, setUpdating] = useState(false);

  // Rider Assignment State
  const [riders, setRiders] = useState([]);
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [assigningRider, setAssigningRider] = useState(false);

  useEffect(() => {
    setCurrentOrder(order);
    if (order) {
      setOrderStatus(order.orderStatus || 'pending');
      setPaymentStatus(order.paymentStatus || 'pending');
      setTrackingId(order.trackingId || '');
      setCancellationReason(order.cancellationReason || '');
      // Pre-select already assigned rider
      const existingRider = order.deliveryPersonId;
      setSelectedRiderId(
        existingRider && typeof existingRider === 'object' ? existingRider._id : (existingRider || '')
      );
    }
  }, [order]);

  // Fetch vendor's own riders when modal opens
  useEffect(() => {
    if (!isOpen) return;
    getVendorDeliveryPersons(1, 100)
      .then((res) => {
        let list = [];
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.data)) list = res.data;
        else if (Array.isArray(res?.data?.deliveryPersons)) list = res.data.deliveryPersons;
        else if (Array.isArray(res?.deliveryPersons)) list = res.deliveryPersons;
        setRiders(list);
      })
      .catch((err) => { console.error('[Rider Modal] fetch error:', err); setRiders([]); });
  }, [isOpen]);

  const handleAssignRider = async () => {
    if (!selectedRiderId) { toast.error('Please select a rider first.'); return; }
    setAssigningRider(true);
    const tid = toast.loading('Dispatching rider...');
    try {
      const isQuick = currentOrder.isQuickDelivery || currentOrder.orderType === 'QUICK' || currentOrder.isQuickCommerce;
      const res = isQuick
        ? await assignDeliveryPerson(currentOrder._id, selectedRiderId)
        : await assignRiderToStandardOrder(currentOrder._id, selectedRiderId);
      toast.dismiss(tid);
      if (res?.success || res?.message) {
        toast.success('Rider dispatched successfully!');
        const updated = res.order || res.data;
        setCurrentOrder(updated || { ...currentOrder, deliveryPersonId: selectedRiderId, orderStatus: 'shipped' });
        setOrderStatus('shipped');
        if (onUpdate) onUpdate();
      } else {
        toast.error(res?.message || 'Failed to assign rider.');
      }
    } catch (err) {
      toast.dismiss(tid);
      toast.error('Error assigning rider. Try again.');
    } finally {
      setAssigningRider(false);
    }
  };

  if (!isOpen || !currentOrder) return null;

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

  const dateVal = currentOrder.createdAt || currentOrder.dateOfPurchase;
  const dateObj = dateVal ? new Date(dateVal) : null;
  const isDateValid = dateObj && !isNaN(dateObj.getTime());

  const handleUpdateStatus = async () => {
    setUpdating(true);
    const loadingToast = toast.loading('Updating order status...');
    try {
      const res = await updateVendorOrder(currentOrder._id, {
        orderStatus,
        paymentStatus,
        trackingId,
        cancellationReason
      });
      toast.dismiss(loadingToast);
      if (res.success) {
        toast.success(res.message || 'Order updated successfully!');

        // Extract updated object matching backend double-nested payload structure
        const updatedObj = res.data?.data || res.data || res.order;
        if (updatedObj) {
          setCurrentOrder(updatedObj);
        } else {
          setCurrentOrder(prev => ({
            ...prev,
            orderStatus,
            paymentStatus,
            trackingId,
            cancellationReason
          }));
        }

        if (onUpdate) onUpdate();
      } else {
        toast.error(res.message || 'Failed to update order status.');
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error(err);
      toast.error('Something went wrong.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto font-outfit text-left">
      <div className={`w-full max-w-2xl my-auto rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border transition-all duration-300 ${isDarkMode ? 'bg-gray-900 border-white/5 text-white' : 'bg-white border-gray-100 text-gray-800'
        }`}>

        <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto space-y-6">
          {/* Modal Header */}
          <div className={`flex justify-between items-start border-b pb-4 ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${isDarkMode ? 'bg-primary/20 border-primary/30' : 'bg-primary/10 border-primary/20'
                }`}>
                <ShoppingBag className="text-primary" size={20} />
              </div>
              <div>
                <h2 className={`text-lg font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{currentOrder.orderNumber}</h2>
                <p className="text-sm font-bold text-gray-400 uppercase mt-0.5 flex items-center gap-1">
                  <Calendar size={10} /> {isDateValid ? dateObj.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className={`p-2 rounded-xl transition-all hover:scale-105 cursor-pointer ${isDarkMode ? 'hover:bg-white/5 text-gray-500 hover:text-gray-300' : 'hover:bg-gray-50 text-gray-400 hover:text-gray-800'
              }`}>
              <X size={20} />
            </button>
          </div>

          {/* Quick Payout Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'border-green-500/20 bg-green-500/5' : 'border-green-100 bg-green-50/20'
              }`}>
              <p className="text-sm font-bold text-green-500 uppercase mb-1 flex items-center gap-1">
                <Landmark size={10} /> Vendor Payout
              </p>
              <span className={`text-lg font-extrabold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                {formatCurrency(currentOrder.payoutAmount || 0)}
              </span>
            </div>
            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'border-purple-500/20 bg-purple-500/5' : 'border-purple-100 bg-purple-50/20'
              }`}>
              <p className="text-sm font-bold text-purple-500 uppercase mb-1 flex items-center gap-1">
                <Tag size={10} /> Commission Rate
              </p>
              <span className={`text-base font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {currentOrder.commissionRate || 0}%
              </span>
              <p className="text-xs font-bold text-zinc-400 uppercase mt-1">
                Fee: {formatCurrency(currentOrder.commissionAmount || 0)}
              </p>
            </div>
            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'border-white/5 bg-gray-950/40' : 'border-gray-100 bg-gray-50/50'
              }`}>
              <p className="text-sm font-bold text-gray-400 uppercase mb-1">Order Status</p>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${getOrderStatusColor(currentOrder.orderStatus)}`}>
                {currentOrder.orderStatus || 'Pending'}
              </span>
            </div>
          </div>

          {/* Customer & Shipping Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Address */}
            <div className={`p-5 rounded-3xl border ${isDarkMode ? 'border-white/5 bg-gray-950/20' : 'border-gray-100 bg-gray-50/30'
              }`}>
              <p className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                <MapPin size={12} /> Shipping Address
              </p>
              {currentOrder.shippingAddress ? (
                <div className={`text-xs space-y-1 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p className={`text-sm font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Phone: {currentOrder.shippingAddress.phone}</p>
                  <p>{currentOrder.shippingAddress.line1}</p>
                  {currentOrder.shippingAddress.line2 && <p>{currentOrder.shippingAddress.line2}</p>}
                  <p>{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} - {currentOrder.shippingAddress.pincode}</p>
                  <p className="uppercase font-bold text-sm text-primary tracking-wider mt-1">{currentOrder.shippingAddress.country || 'India'}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400">No shipping address recorded.</p>
              )}
            </div>

            {/* Customer Details */}
            <div className={`p-5 rounded-3xl border flex flex-col justify-between ${isDarkMode ? 'border-white/5 bg-gray-950/20' : 'border-gray-100 bg-gray-50/30'
              }`}>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                  <ShieldCheck size={12} /> Customer Identity
                </p>
                {currentOrder.userId ? (
                  <div className={`text-xs space-y-1 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {typeof currentOrder.userId === 'object' ? (currentOrder.userId.name || 'User') : 'User'}
                    </p>
                    <p className={`text-sm uppercase font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {typeof currentOrder.userId === 'object' ? currentOrder.userId.email : currentOrder.userId}
                    </p>
                    {typeof currentOrder.userId === 'object' && currentOrder.userId.role && (
                      <p className={`text-xs uppercase font-bold px-2 py-0.5 rounded inline-block mt-2 ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
                        }`}>
                        Role: {currentOrder.userId.role}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">Anonymous Customer</p>
                )}
              </div>
              <div className={`mt-4 pt-4 border-t flex justify-between items-center text-xs ${isDarkMode ? 'border-zinc-800' : 'border-zinc-100'}`}>
                <span className="font-bold text-zinc-400 uppercase text-xs">Payment Status</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${currentOrder.paymentStatus === 'paid'
                    ? (isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-500')
                    : (isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-500')
                  }`}>
                  {currentOrder.paymentStatus || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase mb-3">Order Items</p>
            <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDarkMode ? 'border-white/5 bg-gray-950' : 'border-gray-100 bg-white'
              }`}>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className={`border-b text-xs font-bold uppercase text-zinc-400 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                    }`}>
                    <th className="p-3">Product Name</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800' : 'divide-zinc-100'}`}>
                  {currentOrder.items?.map((item, index) => (
                    <tr key={index} className={`${isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50/50'}`}>
                      <td className="p-3 font-outfit">
                        <span className={`font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{item.productName}</span>
                        {item.sku && <p className={`text-xs font-mono mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>SKU: {item.sku}</p>}
                        {item.attributes && (
                          <div className="flex gap-2 mt-1">
                            {Object.entries(item.attributes).map(([key, val]) => (
                              <span key={key} className={`px-2 py-0.5 rounded text-xs uppercase font-semibold ${isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
                                }`}>
                                {key}: {val}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className={`p-3 text-center font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.quantity}</td>
                      <td className={`p-3 text-right font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{formatCurrency(item.salesPrice || item.price || 0)}</td>
                      <td className="p-3 text-right font-bold text-primary">{formatCurrency(item.totalPrice || ((item.salesPrice || item.price || 0) * (item.quantity || 0)))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Applied Coupon Info */}
          {currentOrder.orderId?.appliedCoupon && currentOrder.orderId.appliedCoupon.code && (
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${isDarkMode ? 'border-purple-500/20 bg-purple-500/5' : 'border-purple-100 bg-purple-50/30'
              }`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                  <Tag size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">Coupon {currentOrder.orderId.appliedCoupon.code}</span>
                  <p className="text-xs text-zinc-400 uppercase mt-0.5">Discount Scheme: {currentOrder.orderId.appliedCoupon.couponType || 'Fixed'}</p>
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="font-bold text-purple-500">- {formatCurrency(currentOrder.orderId.appliedCoupon.discountAmount)}</span>
                <p className="text-xs text-zinc-400 uppercase mt-0.5">Discount Applied</p>
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className={`p-5 rounded-3xl border space-y-3 ${isDarkMode ? 'border-white/5 bg-gray-950/20' : 'border-gray-100 bg-gray-50/30'
            }`}>
            <div className={`flex justify-between text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <span>Subtotal</span>
              <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{formatCurrency(currentOrder.subTotal || 0)}</span>
            </div>
            {(currentOrder.discount || 0) > 0 && (
              <div className="flex justify-between text-xs text-purple-500 font-semibold">
                <span>Discounts</span>
                <span className="font-bold">- {formatCurrency(currentOrder.discount || 0)}</span>
              </div>
            )}
            {(currentOrder.shippingCharge || 0) > 0 && (
              <div className={`flex justify-between text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>Shipping Fee</span>
                <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{formatCurrency(currentOrder.shippingCharge || 0)}</span>
              </div>
            )}
            {(currentOrder.tax || 0) > 0 && (
              <div className={`flex justify-between text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>Calculated Tax (GST)</span>
                <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{formatCurrency(currentOrder.tax || 0)}</span>
              </div>
            )}
            <div className={`flex justify-between pt-3 border-t text-sm ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
              <span className={`font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Grand Total</span>
              <span className="font-bold text-primary text-base">{formatCurrency(currentOrder.grandTotal || 0)}</span>
            </div>
          </div>

          {/* ── Rider Assignment Panel ── */}
          <div className={`p-5 rounded-3xl border space-y-4 ${
            isDarkMode ? 'border-amber-500/20 bg-amber-500/5' : 'border-amber-100 bg-amber-50/40'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Truck size={14} /> Assign Delivery Rider
              </h3>
              {currentOrder.deliveryPersonId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-green-500/15 text-green-600 border border-green-500/30">
                  <UserCheck size={12} /> Rider Assigned
                </span>
              )}
            </div>

            {/* Currently Assigned Rider Info */}
            {currentOrder.deliveryPersonId && (
              <div className={`flex items-center justify-between p-3 rounded-2xl border text-xs ${
                isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-amber-100'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-amber-500/15' : 'bg-amber-100'}`}>
                    <Bike size={14} className="text-amber-600" />
                  </div>
                  <div>
                    <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                      {typeof currentOrder.deliveryPersonId === 'object'
                        ? (currentOrder.deliveryPersonId.name || 'Assigned Rider')
                        : 'Assigned Rider'}
                    </p>
                    {typeof currentOrder.deliveryPersonId === 'object' && currentOrder.deliveryPersonId.phone && (
                      <p className="text-xs font-mono text-zinc-400 mt-0.5 flex items-center gap-1">
                        <Phone size={10} /> {currentOrder.deliveryPersonId.phone}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs font-bold uppercase px-2.5 py-1 rounded bg-amber-500/15 text-amber-600">
                  {currentOrder.deliveryStatus || 'ASSIGNED'}
                </span>
              </div>
            )}

            {/* Rider Select + Dispatch Button */}
            <div className="flex flex-col gap-2.5">
              <select
                value={selectedRiderId}
                onChange={(e) => setSelectedRiderId(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                  isDarkMode ? 'bg-gray-950 border-white/10 text-gray-200' : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <option value="">
                {riders.length === 0
                  ? 'No riders available — add a rider first'
                  : '-- Select a Rider --'}
                </option>
                {riders.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name} · {r.phone} · {r.vehicleType || 'bike'} · {r.status || 'AVAILABLE'}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssignRider}
                disabled={assigningRider || !selectedRiderId || riders.length === 0}
                className="w-full px-5 py-3 bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <Truck size={14} />
                {assigningRider
                  ? <><Loader2 size={14} className="animate-spin" /> Dispatching...</>
                  : 'Dispatch Rider'}
              </button>
            </div>
          </div>

          {/* Action / Update Panel */}
          <div className={`p-5 rounded-3xl border space-y-4 ${isDarkMode ? 'border-primary/20 bg-primary/5' : 'border-primary/10 bg-primary/5'
            }`}>
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Landmark size={12} /> Manage Order Actions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-400 uppercase block mb-1.5">Order Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all ${isDarkMode ? 'bg-gray-950 border-white/10 text-gray-200' : 'bg-white border-gray-200 text-gray-700'
                    }`}
                >
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-400 uppercase block mb-1.5">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all ${isDarkMode ? 'bg-gray-950 border-white/10 text-gray-200' : 'bg-white border-gray-200 text-gray-700'
                    }`}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            {/* Tracking ID input (only show if status is shipped or delivered) */}
            {(orderStatus === 'shipped' || orderStatus === 'delivered') && (
              <div className="animate-in slide-in-from-top-2 duration-150">
                <label className="text-sm font-bold text-gray-400 uppercase block mb-1.5">Tracking ID</label>
                <input
                  type="text"
                  placeholder="Enter courier tracking ID..."
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all ${isDarkMode ? 'bg-gray-950 border-white/10 text-gray-200 placeholder-gray-650' : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400'
                    }`}
                />
              </div>
            )}

            {/* Cancellation Reason input (only show if status is cancelled) */}
            {orderStatus === 'cancelled' && (
              <div className="animate-in slide-in-from-top-2 duration-150">
                <label className="text-sm font-bold text-gray-400 uppercase block mb-1.5">Cancellation Reason</label>
                <textarea
                  placeholder="Reason for cancellation..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  rows="2"
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none ${isDarkMode ? 'bg-gray-950 border-white/10 text-gray-200 placeholder-gray-650' : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400'
                    }`}
                />
              </div>
            )}

            <button
              onClick={handleUpdateStatus}
              disabled={updating}
              className="w-full py-2.5 bg-primary hover:bg-primary/95 disabled:bg-gray-300 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-md shadow-primary/10 hover:opacity-95 active:opacity-90 cursor-pointer text-center flex items-center justify-center gap-2"
            >
              {updating
                ? <><Loader2 size={15} className="animate-spin" /> Saving Changes...</>
                : <><CheckCircle2 size={15} /> Save Order &amp; Payout Status</>}
            </button>
          </div>

          <button onClick={onClose} className={`w-full py-4 rounded-2xl font-bold text-xs uppercase transition-all cursor-pointer text-center ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}>
            Dismiss Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorOrderDetailsModal;
