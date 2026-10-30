import React from 'react';
import { ShoppingBag, Heart, Star, Truck, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../utils/toast';
import { getImageUrl, handleImageError } from '../../utils/imageUrl';

const ProductCard = ({ product, isWishlisted, onWishlistToggle }) => {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, updateQty } = useCart();

  const productId = product._id || product.id;
  const name = product.name || 'Unnamed Product';

  const getCategoryName = () => {
    if (product.category && typeof product.category === 'object') {
      return product.category.name || product.category.label || 'SKINCARE';
    }
    if (product.categoryId && typeof product.categoryId === 'object') {
      return product.categoryId.name || product.categoryId.label || 'SKINCARE';
    }
    return product.category || 'SKINCARE';
  };
  const categoryName = typeof getCategoryName() === 'object' ? 'SKINCARE' : String(getCategoryName());

  const getVendorName = () => {
    if (product.vendor && typeof product.vendor === 'object') {
      return product.vendor.businessName || product.vendor.name || 'Fashion Fever';
    }
    if (product.vendorId && typeof product.vendorId === 'object') {
      return product.vendorId.businessName || product.vendorId.name || 'Fashion Fever';
    }
    return product.brand || 'Fashion Fever';
  };
  const vendorName = typeof getVendorName() === 'object' ? 'Fashion Fever' : String(getVendorName());

  const variants = product.variants || [];
  const firstVariant = variants[0] || {};
  const variantId = firstVariant._id || productId;

  const offeredPrice = firstVariant.offeredPrice !== undefined ? firstVariant.offeredPrice : (firstVariant.salesPrice !== undefined ? firstVariant.salesPrice : (product.price || 0));
  const salesPrice = firstVariant.salesPrice !== undefined ? firstVariant.salesPrice : (product.price || 0);

  const stock = firstVariant.stock !== undefined ? firstVariant.stock : 10;

  const rawImage = firstVariant.thumbnail?.url || (typeof firstVariant.thumbnail === 'string' ? firstVariant.thumbnail : null) || (product.images?.[0]?.url || (typeof product.images?.[0] === 'string' ? product.images[0] : null)) || product.image || '';
  const imageUrl = getImageUrl(rawImage);

  const averageRating = product.averageRating || product.rating || 0;
  const totalReviews = product.totalReviews || 0;

  const discountPercent = salesPrice > offeredPrice ? Math.round(((salesPrice - offeredPrice) / salesPrice) * 100) : 50;

  const cartItem = cart?.find(item => (item.id === variantId || item.variantId === variantId) && !item.isQuickDelivery);
  const isInCart = !!cartItem;

  const handleCardClick = () => {
    navigate(`/product/${productId}`);
  };

  const handleBuyNow = async (e) => {
    e.stopPropagation();
    if (!isInCart) {
      const cartItemLocal = {
        id: variantId,
        name: `${name} ${firstVariant?.attributes?.color ? `(${firstVariant.attributes.color})` : ''}`,
        price: offeredPrice,
        image: imageUrl,
      };
      await addToCart(cartItemLocal, variantId, productId);
    }
    navigate('/checkout');
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all duration-300 w-full cursor-pointer h-full text-left p-3 font-sans"
    >
      {/* ── Product Image Box ────────────────── */}
      <div className="relative w-full h-[150px] sm:h-[180px] bg-white rounded-xl overflow-hidden flex items-center justify-center p-2 mb-2 shrink-0">

        {/* Discount Badge on Top Left */}
        <span className="absolute top-1.5 left-1.5 z-10 bg-[#ff4d6d] text-white text-xs font-black uppercase px-2 py-0.5 rounded-md shadow-2xs tracking-wider">
          {discountPercent}% OFF
        </span>

        {/* Wishlist Heart Button on Top Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onWishlistToggle) onWishlistToggle(productId, variantId);
          }}
          className="absolute top-1.5 right-1.5 z-20 p-1 text-gray-400 hover:text-[#ff4d6d] transition-colors cursor-pointer"
          title="Wishlist"
        >
          <Heart size={16} fill={isWishlisted ? '#ff4d6d' : 'none'} className={isWishlisted ? 'text-[#ff4d6d]' : ''} />
        </button>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300 font-bold uppercase text-xs">
            No Image
          </div>
        )}
      </div>

      {/* ── Product Info Section ────────────────── */}
      <div className="flex flex-col flex-grow text-left min-w-0">

        {/* Category Name */}
        <span className="text-xs font-bold uppercase text-gray-400 tracking-wider truncate mb-0.5">
          {categoryName}
        </span>

        {/* Brand / Vendor Name */}
        <p className="text-xs text-gray-700 font-bold truncate mb-0.5">
          {vendorName}
        </p>

        {/* Product Title */}
        <h3 className="text-gray-900 font-extrabold text-[12px] sm:text-sm tracking-tight truncate leading-tight group-hover:text-[#ff4d6d] transition-colors mb-1" title={name}>
          {name}
        </h3>

        {/* Rating Stars & Reviews */}
        <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 mb-1">
          <div className="flex items-center text-amber-400">
            <Star size={10} className="fill-amber-400" />
            <Star size={10} className="fill-amber-400" />
            <Star size={10} className="fill-amber-400" />
            <Star size={10} className="fill-amber-400" />
            <Star size={10} className="fill-gray-200 text-gray-200" />
          </div>
          <span>{totalReviews > 0 ? `${averageRating} (${totalReviews})` : 'No Reviews Yet'}</span>
        </div>

    

        {/* Price & Stock Status Row */}
        <div className="flex items-baseline justify-between gap-1 mb-2.5 mt-auto min-w-0">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-sm sm:text-base font-black text-gray-900">₹{offeredPrice}</span>
            {salesPrice > offeredPrice && (
              <span className="text-xs text-gray-400 line-through font-medium truncate">₹{salesPrice}</span>
            )}
          </div>

          <span className={`text-xs font-extrabold shrink-0 ${stock > 0 ? (stock < 10 ? 'text-[#ff4d6d]' : 'text-emerald-600') : 'text-rose-600'}`}>
            {stock > 10 ? 'In Stock' : stock > 0 ? 'Few Left' : 'Out of Stock'}
          </span>
        </div>

        {/* ── Action Buttons Row (Add & Buy) ────────────────── */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>

          {/* Add Button */}
          {isInCart ? (
            <div className="flex-1 h-8 sm:h-9 border border-[#ff4d6d] rounded-xl flex items-center justify-between px-2 bg-rose-50 text-[#ff4d6d] text-xs font-extrabold shadow-2xs">
              <button
                onClick={() => {
                  if (cartItem.qty === 1) {
                    removeFromCart(cartItem.id);
                    toast.success(`${name} removed`);
                  } else {
                    updateQty(cartItem.id, -1, productId);
                  }
                }}
                className="hover:bg-rose-100 rounded p-0.5 cursor-pointer"
              >
                <Minus size={11} />
              </button>
              <span>{cartItem.qty}</span>
              <button
                onClick={() => {
                  if (stock && cartItem.qty >= stock) {
                    toast.error("Maximum available stock reached!");
                  } else {
                    updateQty(cartItem.id, 1, productId);
                  }
                }}
                className="hover:bg-rose-100 rounded p-0.5 cursor-pointer"
              >
                <Plus size={11} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                const cartItemLocal = {
                  id: variantId,
                  name: `${name} ${firstVariant?.attributes?.color ? `(${firstVariant.attributes.color})` : ''}`,
                  price: offeredPrice,
                  image: imageUrl,
                };
                addToCart(cartItemLocal, variantId, productId);
                toast.success(`${name} added to bag`);
              }}
              disabled={stock === 0}
              className="flex-1 bg-pink-50 hover:bg-pink-100 text-[#ff4d6d] border border-pink-200 rounded-xl font-bold text-xs sm:text-sm h-8 sm:h-9 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
            >
              Add
            </button>
          )}

          {/* Buy Button */}
          <button
            onClick={handleBuyNow}
            disabled={stock === 0}
            className="flex-1 bg-[#ff4d6d] hover:bg-[#e63956] text-white rounded-xl font-extrabold text-xs sm:text-sm h-8 sm:h-9 flex items-center justify-center transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            Buy
          </button>

        </div>

      </div>
    </div>
  );
};

export default ProductCard;
