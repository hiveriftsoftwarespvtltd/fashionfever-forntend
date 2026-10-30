import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { X, ArrowLeft, Heart, ShoppingBag, Trash2, Plus, Minus, Info, Loader2, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from '../utils/toast';
import Swal from 'sweetalert2';
import { clearQuickCart } from '../api/quickECommerceService';
import { clearCart as apiClearCart } from '../api/cartService';
import { getImageUrl, handleImageError, DEFAULT_PRODUCT_PLACEHOLDER } from '../utils/imageUrl';

const CartItemRow = ({ item, updatingId, setUpdatingId, removeFromCart, updateQty }) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 relative group text-left">
      <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 relative">
        <img 
          src={getImageUrl(item.image || item) || DEFAULT_PRODUCT_PLACEHOLDER} 
          alt={item.name} 
          className="w-full h-full object-cover" 
          onError={handleImageError}
        />
      </div>
      
      <div className="flex-grow flex flex-col justify-between py-1">
        <div>
          <h4 className="text-xs font-black text-gray-800 leading-tight line-clamp-2 uppercase">
            {item.name}
          </h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {item.attributes && Object.entries(item.attributes).map(([k, v]) => (
              <p key={k} className="text-xs font-bold text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded">
                {k}: {v}
              </p>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">₹{Number(item.price).toFixed(2)}</span>
            {item.originalPrice > item.price && (
              <span className="text-xs font-bold text-gray-400 line-through">₹{Number(item.originalPrice).toFixed(2)}</span>
            )}
          </div>
          
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-8">
            <button 
              onClick={async () => {
                setUpdatingId(item.id);
                if (item.qty === 1) {
                  await removeFromCart(item.id);
                  toast.success("Item removed from bag");
                } else {
                  await updateQty(item.id, -1, item.productId);
                }
                setUpdatingId(null);
              }}
              disabled={updatingId === item.id}
              className="px-2 hover:bg-gray-50 text-gray-500 transition-colors disabled:opacity-30 cursor-pointer"
            >
              <Minus size={12} />
            </button>
            <span className="px-2.5 text-xs font-bold text-gray-800 border-x border-gray-200 h-full flex items-center justify-center min-w-[20px]">
              {updatingId === item.id ? <Loader2 size={10} className="animate-spin" /> : item.qty}
            </span>
            <button 
              onClick={async () => {
                setUpdatingId(item.id);
                await updateQty(item.id, 1, item.productId);
                setUpdatingId(null);
              }}
              disabled={updatingId === item.id}
              className="px-2 hover:bg-gray-50 text-gray-500 transition-colors disabled:opacity-30 cursor-pointer"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>
      
      <button 
        onClick={async () => {
          setUpdatingId(item.id);
          await removeFromCart(item.id);
          toast.success("Item removed from bag");
          setUpdatingId(null);
        }}
        disabled={updatingId === item.id}
        className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-50 cursor-pointer"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, isLoading, removeFromCart, updateQty } = useCart();
  const [updatingId, setUpdatingId] = useState(null);

  const isQuickCommPage = location.pathname.startsWith('/quick-commerce');
  const [activeCartTab, setActiveCartTab] = useState(isQuickCommPage ? 'express' : 'standard');

  useEffect(() => {
    setActiveCartTab(isQuickCommPage ? 'express' : 'standard');
  }, [isQuickCommPage, isOpen]);

  // Filter items based on active cart tab
  const activeItems = activeCartTab === 'express'
    ? cart.filter(item => item.isQuickDelivery)
    : cart.filter(item => !item.isQuickDelivery);

  const totalOriginal = Math.round(activeItems.reduce((acc, item) => {
    const price = item.originalPrice || item.price || 0;
    return acc + (price * item.qty);
  }, 0) * 100) / 100;

  const totalSales = Math.round(activeItems.reduce((acc, item) => acc + (item.price * item.qty), 0) * 100) / 100;
  const discount = Math.round((totalOriginal - totalSales) * 100) / 100;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[1000] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[1001] shadow-2xl transition-transform duration-500 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-1 hover:bg-gray-50 rounded-full transition-colors text-gray-800 cursor-pointer">
                <ArrowLeft size={22} />
              </button>
              <h2 className="text-xl font-bold text-gray-900 uppercase">
                {activeCartTab === 'express' ? 'Express Bag' : 'Shopping Bag'}
              </h2>
              {activeItems.length > 0 && (
                <button 
                  onClick={() => {
                    Swal.fire({
                      title: activeCartTab === 'express' ? 'Empty Express Bag?' : 'Empty Shopping Bag?',
                      text: "You won't be able to revert this!",
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#ef4444',
                      cancelButtonColor: '#f3f4f6',
                      confirmButtonText: 'Yes, Clear',
                      cancelButtonText: 'Cancel',
                      customClass: {
                        cancelButton: 'text-gray-700 font-bold',
                        confirmButton: 'font-bold'
                      }
                    }).then(async (result) => {
                      if (result.isConfirmed) {
                        if (activeCartTab === 'express') {
                          await clearQuickCart();
                        } else {
                          await apiClearCart();
                        }
                        window.location.reload();
                      }
                    });
                  }}
                  className="ml-2 text-xs font-bold text-gray-300 hover:text-red-500 uppercase transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
            {activeCartTab !== 'express' && (
              <Link 
                to="/wishlist" 
                onClick={onClose}
                className="text-xs font-bold text-primary uppercase hover:underline"
              >
                View Wishlist
              </Link>
            )}
          </div>

          {/* Tabs Switcher */}
          {!isQuickCommPage && (
            <div className="flex border-b border-gray-100 bg-gray-50/50 p-1 gap-1">
              <button
                onClick={() => setActiveCartTab('standard')}
                className={`flex-1 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${
                  activeCartTab === 'standard'
                    ? 'bg-white text-primary shadow-xs border border-gray-100 font-extrabold'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Standard Bag ({cart.filter(item => !item.isQuickDelivery).length})
              </button>
              <button
                onClick={() => setActiveCartTab('express')}
                className={`flex-1 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeCartTab === 'express'
                    ? 'bg-white text-rose-600 shadow-xs border border-gray-100 font-extrabold'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Zap size={10} className={activeCartTab === 'express' ? 'fill-rose-500 text-rose-500' : ''} />
                Express Bag ({cart.filter(item => item.isQuickDelivery).length})
              </button>
            </div>
          )}
 
          {/* Content */}
          <div className="flex-grow overflow-y-auto bg-gray-50/30">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : activeItems.length > 0 ? (
              <div className="p-4 space-y-6">
                
                {/* Items List */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 px-1">
                    {activeCartTab === 'express' ? (
                      <span className="bg-rose-50 text-rose-500 border border-rose-100 px-2 py-0.5 rounded-lg text-xs font-black uppercase flex items-center gap-1 animate-pulse">
                        <Zap size={11} className="fill-rose-500 text-rose-500" />
                        <span>10-Min Delivery</span>
                      </span>
                    ) : (
                      <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-lg text-xs font-black uppercase">
                        Standard Shipping
                      </span>
                    )}
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Items ({activeItems.reduce((acc, item) => acc + item.qty, 0)})
                    </h3>
                  </div>
                  {activeItems.map((item, index) => (
                    <CartItemRow 
                      key={`${item.id}-${index}`}
                      item={item} 
                      updatingId={updatingId} 
                      setUpdatingId={setUpdatingId} 
                      removeFromCart={removeFromCart} 
                      updateQty={updateQty} 
                    />
                  ))}
                </div>

                {/* Bill Details */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mt-6">
                  <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
                    <Info size={16} className="text-primary" />
                    <h5 className="text-xs font-bold text-gray-800 uppercase">Bill Details</h5>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase">
                      <span className="text-gray-500">Bag Total</span>
                      <span className="text-gray-800">₹{totalOriginal.toFixed(2)}</span>
                    </div>
                    {discount > 0.01 && (
                      <div className="flex justify-between text-xs font-bold uppercase">
                        <span className="text-gray-500">Bag Discount</span>
                        <span className="text-green-600">- ₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-bold uppercase">
                      <span className="text-gray-500">{activeCartTab === 'express' ? 'Delivery Charge' : 'Shipping'}</span>
                      <span className="text-gray-800">Free</span>
                    </div>
                    <div className="h-[1px] bg-gray-50 my-2"></div>
                    <div className="flex justify-between text-sm font-bold uppercase">
                      <span className="text-gray-900">Total Payable</span>
                      <span className="text-primary font-extrabold">₹{totalSales.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white">
                <div className="w-48 h-48 mb-8 relative flex items-center justify-center">
                  <ShoppingBag size={80} className="text-gray-200" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">Your Bag is Empty</h3>
                <p className="text-xs font-bold text-gray-400 uppercase leading-relaxed max-w-[240px]">
                  This feels too light! Go on, add all your favourites
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {activeItems.length > 0 && (
            <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] sticky bottom-0 z-20">
              <div className="flex items-center justify-between mb-4 px-2">
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-gray-900">₹{totalSales.toFixed(2)}</span>
                   <span className="text-xs font-bold text-primary uppercase">Total</span>
                 </div>
                 <button 
                    onClick={() => {
                      onClose();
                      if (activeCartTab === 'express') {
                        navigate('/checkout?mode=quick');
                      } else {
                        navigate('/checkout');
                      }
                    }}
                    className={`px-8 py-3.5 rounded-xl font-bold uppercase text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                      activeCartTab === 'express' 
                        ? 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-850' 
                        : 'bg-primary text-white shadow-primary/20 hover:bg-primary-hover'
                    }`}
                  >
                   Proceed <ArrowLeft size={16} className="rotate-180" />
                 </button>
              </div>
            </div>
          )}
          
          {!activeItems.length && (
             <div className="p-6">
                <button 
                  onClick={onClose}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold uppercase text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all cursor-pointer"
                >
                  Start Shopping
                </button>
             </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
