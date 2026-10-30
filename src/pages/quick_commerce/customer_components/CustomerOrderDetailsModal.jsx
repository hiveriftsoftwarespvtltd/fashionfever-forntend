import React from 'react';
import { X, MapPin, Truck, Package, Calendar, Phone, Zap, ShoppingBag } from 'lucide-react';
import { handleImageError } from '../../../utils/imageUrl';

const CustomerOrderDetailsModal = ({
  selectedUserOrderModal,
  setSelectedUserOrderModal,
  handleCancelOrder,
  formatOrderDate,
  getItemImage
}) => {
  if (!selectedUserOrderModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden my-8 text-left">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary to-rose-600 text-white p-3.5 sm:p-5 flex items-start sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-black uppercase text-rose-100 tracking-wider block">Express Quick Order Details</span>
            <h3 className="text-xs sm:text-base font-black font-mono truncate text-white max-w-[180px] sm:max-w-none">
              #{selectedUserOrderModal._id}
            </h3>
            <span className="text-xs text-rose-100 font-semibold block mt-0.5 flex items-center gap-1">
              <Calendar size={11} /> Placed: {formatOrderDate(selectedUserOrderModal.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="bg-white/20 text-white border border-white/30 text-[11px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-full whitespace-nowrap">
              {selectedUserOrderModal.status}
            </span>
            <button
              onClick={() => setSelectedUserOrderModal(null)}
              className="p-1.5 hover:bg-white/20 rounded-full text-white/90 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Section 1: Address & Express Rider Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin size={14} className="text-primary" /> Delivery Address
              </h4>
              {selectedUserOrderModal.shippingAddress ? (
                <div className="text-xs text-slate-700 font-medium space-y-0.5">
                  <p className="font-bold">{selectedUserOrderModal.shippingAddress.line1}</p>
                  {selectedUserOrderModal.shippingAddress.line2 && <p>{selectedUserOrderModal.shippingAddress.line2}</p>}
                  <p>{selectedUserOrderModal.shippingAddress.city}, {selectedUserOrderModal.shippingAddress.state}</p>
                  <p className="font-extrabold text-primary flex items-center gap-1">
                    <MapPin size={12} className="inline" /> Pincode: {selectedUserOrderModal.shippingAddress.pincode}
                  </p>
                  <p className="text-slate-500 font-semibold mt-1 flex items-center gap-1">
                    <Phone size={12} className="inline" /> {selectedUserOrderModal.shippingAddress.phone}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Address info not available</p>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                <Truck size={14} className="text-primary" /> Express Rider Info
              </h4>
              {(() => {
                const rider = selectedUserOrderModal.deliveryPersonId || selectedUserOrderModal.vendorOrders?.find(vo => vo.deliveryPersonId)?.deliveryPersonId;
                if (!rider) {
                  return (
                    <p className="text-xs text-slate-400 italic flex items-center gap-1">
                      <Zap size={12} className="text-amber-500 fill-amber-500" /> Rider being assigned (Expected within 10 Mins)
                    </p>
                  );
                }
                return (
                  <div className="text-xs text-slate-700 font-semibold space-y-1">
                    <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Truck size={14} className="text-primary" /> {rider.name || 'Express Rider'}
                    </p>
                    {rider.phone && (
                      <p className="text-slate-600 flex items-center gap-1">
                        <Phone size={12} /> Phone: {rider.phone}
                      </p>
                    )}
                    {rider.vehicleType && <p className="text-xs text-slate-400 capitalize">Vehicle: {rider.vehicleType}</p>}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Section 2: Payment & Order Info */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-wrap justify-between items-center gap-3">
            <div>
              <span className="text-xs font-black uppercase text-slate-400 block tracking-wider">Payment Method</span>
              <span className="font-extrabold text-slate-800 text-xs uppercase">{selectedUserOrderModal.paymentMethod?.replace(/_/g, ' ') || 'CASH ON DELIVERY'}</span>
            </div>
            <div>
              <span className="text-xs font-black uppercase text-slate-400 block tracking-wider">Payment Status</span>
              <span className={`text-xs font-black uppercase ${
                selectedUserOrderModal.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {selectedUserOrderModal.paymentStatus || 'PENDING'}
              </span>
            </div>
            <div>
              <span className="text-xs font-black uppercase text-slate-400 block tracking-wider">Est. Delivery</span>
              <span className="font-bold text-primary text-xs flex items-center gap-1">
                <Zap size={12} className="fill-primary" /> Within 10 Minutes
              </span>
            </div>
          </div>

          {/* Section 3: Product Items Table */}
          <div>
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
              <Package size={14} className="text-primary" /> Ordered Items
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-xs font-black text-slate-500 uppercase">
                  <tr>
                    <th className="p-2.5">Product</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedUserOrderModal.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5">
                        <div className="flex items-center gap-2.5">
                          {getItemImage(item) ? (
                            <img
                              src={getItemImage(item)}
                              alt={item.productName}
                              className="w-10 h-10 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                              onError={handleImageError}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs flex-shrink-0">
                              <ShoppingBag size={16} />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-800 uppercase text-xs">{item.productName}</p>
                            {item.sku && <p className="text-xs font-mono text-slate-400 uppercase">SKU: {item.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-600">{item.quantity}</td>
                      <td className="p-2.5 text-right font-mono text-slate-600">₹{(item.salesPrice || 0).toFixed(2)}</td>
                      <td className="p-2.5 text-right font-mono font-black text-slate-900">₹{(item.finalPrice || item.totalPrice || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Bill Summary */}
          <div className="bg-gradient-to-r from-primary to-rose-600 text-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
            <div>
              <span className="text-xs font-bold text-rose-100 uppercase tracking-widest block">Total Amount Paid</span>
              <span className="text-xl font-black font-mono">₹{(selectedUserOrderModal.grandTotal || selectedUserOrderModal.total || 0).toFixed(2)}</span>
            </div>
            <span className="text-xs font-extrabold text-white bg-white/20 border border-white/30 px-3 py-1 rounded-xl uppercase">
              {selectedUserOrderModal.status}
            </span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          {(selectedUserOrderModal.status === 'PLACED' || selectedUserOrderModal.status === 'PROCESSING') && (
            <button
              onClick={() => {
                handleCancelOrder(selectedUserOrderModal._id);
                setSelectedUserOrderModal(null);
              }}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors cursor-pointer"
            >
              Cancel Order
            </button>
          )}

          <button
            onClick={() => setSelectedUserOrderModal(null)}
            className="ml-auto bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderDetailsModal;
