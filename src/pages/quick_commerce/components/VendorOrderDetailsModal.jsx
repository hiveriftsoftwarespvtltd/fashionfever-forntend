import React from 'react';
import { X, User, MapPin, CreditCard, Truck, Package, Phone, Mail, Calendar, ShoppingBag } from 'lucide-react';

const VendorOrderDetailsModal = ({
  selectedOrderModal,
  setSelectedOrderModal,
  handleUpdateStatus,
  formatDate,
  getItemImage
}) => {
  if (!selectedOrderModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary to-rose-600 text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-rose-100 tracking-wider block">Express Vendor Order</span>
            <h3 className="text-base font-black font-mono">#{selectedOrderModal._id}</h3>
            <span className="text-xs text-rose-100 font-semibold block mt-0.5 flex items-center gap-1">
              <Calendar size={12} /> Placed: {formatDate(selectedOrderModal.createdAt)}
            </span>
          </div>
          <button
            onClick={() => setSelectedOrderModal(null)}
            className="p-1.5 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-left">
          {/* Section 1: Customer & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                <User size={14} className="text-primary" /> Customer Info
              </h4>
              <p className="font-extrabold text-slate-800 text-sm">{selectedOrderModal.quickOrderId?.customerId?.name || 'Customer'}</p>
              {selectedOrderModal.quickOrderId?.shippingAddress?.phone && (
                <p className="text-xs text-slate-600 font-semibold mt-1 flex items-center gap-1">
                  <Phone size={12} className="text-slate-400" /> {selectedOrderModal.quickOrderId.shippingAddress.phone}
                </p>
              )}
              {selectedOrderModal.quickOrderId?.customerId?.email && (
                <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                  <Mail size={12} className="text-slate-400" /> {selectedOrderModal.quickOrderId.customerId.email}
                </p>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin size={14} className="text-primary" /> Delivery Address
              </h4>
              {selectedOrderModal.quickOrderId?.shippingAddress ? (
                <div className="text-xs text-slate-700 font-medium space-y-0.5">
                  <p className="font-bold">{selectedOrderModal.quickOrderId.shippingAddress.line1}</p>
                  {selectedOrderModal.quickOrderId.shippingAddress.line2 && <p>{selectedOrderModal.quickOrderId.shippingAddress.line2}</p>}
                  <p>{selectedOrderModal.quickOrderId.shippingAddress.city}, {selectedOrderModal.quickOrderId.shippingAddress.state}</p>
                  <p className="font-extrabold text-primary flex items-center gap-1">
                    <MapPin size={12} /> Pincode: {selectedOrderModal.quickOrderId.shippingAddress.pincode}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Address not populated</p>
              )}
            </div>
          </div>

          {/* Section 2: Payment & Rider Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                <CreditCard size={14} className="text-primary" /> Payment Details
              </h4>
              <p className="font-black text-slate-800 text-xs uppercase">{selectedOrderModal.quickOrderId?.paymentMethod?.replace(/_/g, ' ') || 'CASH ON DELIVERY'}</p>
              <span className={`inline-block mt-1 text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                selectedOrderModal.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                Status: {selectedOrderModal.paymentStatus || 'PENDING'}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                <Truck size={14} className="text-primary" /> Dispatch Rider
              </h4>
              {selectedOrderModal.deliveryPersonId ? (
                <div className="text-xs text-slate-700 font-semibold space-y-0.5">
                  <p className="font-extrabold text-slate-900">{selectedOrderModal.deliveryPersonId.name}</p>
                  <p className="text-slate-500 flex items-center gap-1">
                    <Phone size={12} /> {selectedOrderModal.deliveryPersonId.phone}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">Vehicle: {selectedOrderModal.deliveryPersonId.vehicleType}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No rider assigned yet</p>
              )}
            </div>
          </div>

          {/* Section 3: Ordered Products Table */}
          <div>
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
              <Package size={14} className="text-primary" /> Items in Order
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-2.5">Product</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrderModal.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5">
                        <div className="flex items-center gap-2.5">
                          {getItemImage(item) ? (
                            <img
                              src={getItemImage(item)}
                              alt={item.productName}
                              className="w-10 h-10 object-cover rounded-xl border border-slate-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">
                              <ShoppingBag size={14} />
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

          {/* Section 4: Vendor Actions & Status Update */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 block tracking-wider">Current Pipeline Status</span>
              <span className="font-black text-slate-800 text-sm uppercase">{selectedOrderModal.status}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Update Status:</span>
              <select
                value={selectedOrderModal.status}
                onChange={(e) => {
                  handleUpdateStatus(selectedOrderModal._id, e.target.value);
                  setSelectedOrderModal(prev => ({ ...prev, status: e.target.value }));
                }}
                className="bg-white border border-slate-200 text-slate-800 text-xs font-black rounded-xl px-3 py-2 outline-none focus:border-primary shadow-xs cursor-pointer uppercase"
              >
                <option value="PROCESSING">PROCESSING</option>
                <option value="PACKED">PACKED</option>
                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setSelectedOrderModal(null)}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorOrderDetailsModal;
