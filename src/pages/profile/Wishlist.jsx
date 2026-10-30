import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star,
  ChevronRight,
  Loader2,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist, clearWishlist } from '../../api/wishlistService';
import { toast } from '../../utils/toast';
import UserSidebar from './UserSidebar';
import { useCart } from '../../context/CartContext';
import { getImageUrl, handleImageError, DEFAULT_PRODUCT_PLACEHOLDER } from '../../utils/imageUrl';

const Wishlist = () => {
  const { addToCart: addGlobalCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [clearing, setClearing] = useState(false);

  const fetchWishlist = async () => {
    try {
      const response = await getWishlist();
      if (response.success) {
        setItems(response.data.items || []);
      }
    } catch (error) {
      console.error("Fetch wishlist error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (variantId) => {
    setActionId(variantId);
    try {
      const response = await removeFromWishlist(variantId);
      if (response.success) {
        toast.success("Removed from wishlist");
        setItems(prev => prev.filter(item => item.variant?._id !== variantId));
      }
    } catch (error) {
      toast.error("Failed to remove");
    } finally {
      setActionId(null);
    }
  };

  const handleMoveToBag = async (item) => {
    const variantId = item.variant?._id;
    const productId = item.product?._id;
    setActionId(variantId);
    try {
      const cartItemLocal = {
        id: variantId,
        name: `${item.product?.name} ${item.variant?.attributes?.color ? `(${item.variant.attributes.color})` : ''}`,
        price: item.variant?.salesPrice || item.variant?.price || 0,
        image: item.variant?.thumbnail?.url || item.product?.variants?.[0]?.thumbnail?.url || '',
      };
      await addGlobalCart(cartItemLocal, variantId, productId);
      const removeResponse = await removeFromWishlist(variantId);
      if (removeResponse.success) {
        toast.success("Moved to Bag!");
        setItems(prev => prev.filter(i => i.variant?._id !== variantId));
      }
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setActionId(null);
    }
  };

  const handleClear = () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-gray-800">Clear entire wishlist?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setClearing(true);
              try {
                const response = await clearWishlist();
                if (response.success) {
                  toast.success("Wishlist cleared!");
                  setItems([]);
                } else {
                  toast.error("Failed to clear wishlist.");
                }
              } catch {
                toast.error("Error clearing wishlist.");
              } finally {
                setClearing(false);
              }
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
          >Yes, Clear</button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
          >Cancel</button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  return (
    <div className="bg-[#f3f3f3] min-h-screen py-10 font-outfit">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 italic">My Wishlist</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <UserSidebar />

          {/* Main Content */}
          <div className="flex-grow">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px] overflow-hidden">
              {/* Header */}
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                  My Wishlist <span className="text-primary font-bold">({items.length})</span>
                </h1>
                {items.length > 0 && (
                  <button 
                    onClick={handleClear}
                    disabled={clearing}
                    className="text-xs font-bold text-gray-400 hover:text-red-500 uppercase flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {clearing ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                    Clear Wishlist
                  </button>
                )}
              </div>

              {/* Grid */}
              <div className="p-8">
                {loading ? (
                  <div className="flex items-center justify-center py-40">
                    <Loader2 className="animate-spin text-primary" size={40} />
                  </div>
                ) : items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {items.map((item, index) => (
                      <div key={item.product?._id || index} className="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col relative bg-white">
                        {/* Delete icon */}
                        <button 
                          onClick={() => handleRemove(item.variant?._id || item.product?._id)}
                          disabled={actionId === (item.variant?._id || item.product?._id)}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-md z-10 transition-colors disabled:opacity-50"
                        >
                          {actionId === (item.variant?._id || item.product?._id) ? <Loader2 size={14} className="animate-spin" /> : <X size={16} />}
                        </button>

                        {/* Image */}
                        <div className="aspect-[3/2] bg-gray-50 overflow-hidden relative">
                          <img 
                            src={getImageUrl(item.variant?.thumbnail || item.product?.variants?.[0]?.thumbnail || item.product?.images || item.image || item) || DEFAULT_PRODUCT_PLACEHOLDER} 
                            alt={item.product?.name || 'Product'} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            onError={handleImageError}
                          />
                        </div>

                        {/* Details */}
                        <div className="p-3 flex-grow flex flex-col">
                          <h3 className="text-xs font-bold text-gray-800 leading-tight mb-1.5 line-clamp-1 uppercase">
                            {item.product?.name || 'Unknown Product'}
                          </h3>
                          
                          <div className="flex items-center gap-2 mb-1.5">
                             {item.variant?.salesPrice < item.variant?.price && (
                               <span className="text-sm font-bold text-gray-400 line-through">₹{item.variant?.price}</span>
                             )}
                             <span className="text-xs font-bold text-gray-900">₹{item.variant?.salesPrice || item.variant?.price || 0}</span>
                             {item.variant?.salesPrice < item.variant?.price && item.variant?.price > 0 && (
                               <span className="text-sm font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase">
                                 {Math.round(((item.variant?.price - item.variant?.salesPrice) / item.variant?.price) * 100)}% Off
                               </span>
                             )}
                          </div>

                          <div className="flex items-center gap-1 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} className={i < 4 ? "fill-gray-900 text-gray-900" : "text-gray-300"} />
                              ))}
                            </div>
                            <span className="text-sm font-bold text-gray-400 ml-1">(120)</span>
                          </div>

                          <button 
                            onClick={() => handleMoveToBag(item)}
                            disabled={actionId === item.variant?._id}
                            className="w-full py-2.5 border border-primary/10 rounded-lg text-xs font-bold text-primary uppercase hover:bg-primary hover:text-white transition-all mt-auto flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {actionId === item.variant?._id ? <Loader2 size={12} className="animate-spin" /> : "Move to Bag"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                      <Heart size={32} className="text-gray-200" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-400 uppercase">Your wishlist is empty</h2>
                    <Link to="/" className="mt-8 bg-primary !text-white px-10 py-4 rounded-xl font-bold uppercase text-xs shadow-xl shadow-primary/20">
                      Go Shopping
                    </Link>
                  </div>
                )}

                {/* Footer text */}
                <div className="mt-20 border-t border-gray-50 pt-10 text-center">
                   <p className="text-xs font-bold text-gray-500 uppercase">No More Products to Show</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
