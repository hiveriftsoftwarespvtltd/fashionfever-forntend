import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, MapPin, Tag, Zap } from 'lucide-react';
import { getImageUrl, handleImageError } from '../../../utils/imageUrl';

const CustomerCartView = ({
  quickCart = [],
  setActiveSubTab,
  handleDecreaseQuantity,
  handleIncreaseQuantity,
  handleRemoveItem,
  addresses = [],
  selectedAddressId,
  setSelectedAddressId,
  handleAddNewAddress,
  appliedCoupon,
  couponCode,
  setCouponCode,
  handleApplyCoupon,
  handleRemoveCoupon,
  paymentMethod,
  setPaymentMethod,
  checkout,
  handlePlaceOrder
}) => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Cart items list (7 columns) */}
      <div className="lg:col-span-7 space-y-4">
        {quickCart.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            <ShoppingBag className="mx-auto mb-4 text-slate-350 stroke-[1.5]" size={48} />
            <h4 className="text-sm font-black uppercase text-slate-700 tracking-wider">Your Express Bag is Empty</h4>
            <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto mt-2">
              Add lightning-delivery products to your bag to place an express order.
            </p>
            <button
              onClick={() => setActiveSubTab('shop')}
              className="mt-6 bg-primary text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all cursor-pointer animate-pulse"
            >
              Browse Deals ⚡
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Items in Bag</h3>
            {quickCart.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex gap-4 relative group">
                <div className="w-20 h-24 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 relative">
                  <img 
                    src={getImageUrl(item.image || item)} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                    onError={handleImageError}
                  />
                </div>
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 leading-tight line-clamp-2 uppercase">
                      {item.name}
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.attributes && Object.entries(item.attributes).map(([k, v]) => (
                        <span key={k} className="text-[11px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-mono font-black text-slate-900">₹{(item.price * item.qty).toFixed(2)}</span>
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden h-8 bg-slate-50">
                      <button
                        onClick={() => handleDecreaseQuantity(item)}
                        className="px-3 hover:bg-slate-150 text-slate-500 font-bold transition-all text-xs cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-black text-slate-800 border-x border-slate-200 h-full flex items-center justify-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => handleIncreaseQuantity(item)}
                        className="px-3 hover:bg-slate-150 text-slate-500 font-bold transition-all text-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="absolute top-4 right-4 p-1.5 text-slate-350 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout & Bill Summary (5 columns) */}
      {quickCart.length > 0 && (
        <div className="lg:col-span-5 space-y-6">
          {/* Delivery Address */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Delivery Address</h3>
              <button
                onClick={handleAddNewAddress}
                className="text-xs font-black uppercase text-primary hover:underline cursor-pointer"
              >
                + Add New
              </button>
            </div>
            {addresses.length === 0 ? (
              <div className="text-center py-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                <p className="text-xs text-slate-400 font-medium">No saved addresses found.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                {addresses.map((addr) => (
                  <button
                    key={addr._id}
                    onClick={() => setSelectedAddressId(addr._id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs font-semibold flex items-start gap-2.5 ${selectedAddressId === addr._id
                        ? 'bg-rose-50/30 border-primary text-slate-800'
                        : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-600'
                      }`}
                  >
                    <MapPin size={14} className="text-primary flex-shrink-0 mt-0.5" />
                    <div className="truncate">
                      <p className="font-extrabold uppercase text-xs text-slate-800">{addr.addressType || 'Address'}</p>
                      <p className="truncate text-slate-500">{addr.streetAddress || addr.line1}, {addr.city} ({addr.pincode})</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Promo Code / Coupon */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Apply Coupon</h3>
            {appliedCoupon ? (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-bold">
                <span>Applied: <strong className="uppercase">{appliedCoupon}</strong></span>
                <button onClick={handleRemoveCoupon} className="text-rose-500 hover:text-rose-700 font-extrabold uppercase text-xs">Remove</button>
              </div>
            ) : (
              <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="ENTER COUPON"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full pl-11 pr-20 py-3.5 bg-slate-50 border-none rounded-2xl font-black text-xs outline-none focus:ring-2 focus:ring-primary/10 uppercase"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold uppercase text-xs hover:bg-black transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Payment Method</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'CASH_ON_DELIVERY', label: 'Cash / COD' },
                { key: 'WALLET', label: 'Wallet Pay' },
                { key: 'ONLINE', label: 'Online Pay' }
              ].map((pay) => (
                <button
                  key={pay.key}
                  onClick={() => setPaymentMethod(pay.key)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-[11px] font-bold ${paymentMethod === pay.key
                      ? 'border-primary bg-primary/[0.01] ring-2 ring-primary/5 text-primary font-black'
                      : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 text-slate-500'
                    }`}
                >
                  <span>{pay.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bill Details Summary */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Bill Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                <span>Items Subtotal</span>
                <span className="text-slate-850 font-mono">₹{(checkout?.subtotal || quickCart.reduce((acc, item) => acc + item.price * item.qty, 0)).toFixed(2)}</span>
              </div>
              {checkout?.packingCharge > 0 && (
                <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                  <span>Packing Charge</span>
                  <span className="text-slate-850 font-mono">₹{Number(checkout.packingCharge).toFixed(2)}</span>
                </div>
              )}
              {checkout?.deliveryCharge > 0 && (
                <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                  <span>Delivery Fee</span>
                  <span className="text-slate-850 font-mono">₹{Number(checkout.deliveryCharge).toFixed(2)}</span>
                </div>
              )}
              {checkout?.tax > 0 && (
                <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                  <span>Govt Tax (GST)</span>
                  <span className="text-slate-850 font-mono">₹{Number(checkout.tax).toFixed(2)}</span>
                </div>
              )}
              {checkout?.discountAmount > 0 && (
                <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                  <span>Coupon Discount</span>
                  <span className="text-emerald-600 font-mono">- ₹{Number(checkout.discountAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="h-[1px] bg-slate-100 my-2"></div>
              <div className="flex justify-between text-sm font-black uppercase items-baseline text-slate-800">
                <span>Grand Total</span>
                <span className="text-lg text-primary font-mono font-black">₹{(checkout?.total || quickCart.reduce((acc, item) => acc + item.price * item.qty, 0)).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout?mode=quick')}
              className="w-full bg-primary hover:bg-primary/95 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <Zap size={14} className="fill-white" /> Proceed to 10-Min Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCartView;
