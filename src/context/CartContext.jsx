import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useUser } from './UserContext';
import {
  getUserCart,
  addToCart as apiAddToCart,
  removeFromCart as apiRemoveFromCart,
  decrementCartQuantity,
  clearCart as apiClearCart
} from '../api/cartService';
import {
  getQuickCart,
  addToQuickCart,
  decreaseQuickCartItem,
  removeQuickCartItem,
  clearQuickCart
} from '../api/quickECommerceService';
import { toast } from '../utils/toast';
import { getImageUrl } from '../utils/imageUrl';

const CartContext = createContext();

const GUEST_CART_KEY = 'fashionfever_guest_cart';

const loadGuestCart = () => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading guest cart:", e);
    return [];
  }
};

const saveGuestCart = (items) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Error saving guest cart:", e);
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useUser();
  const [cart, setCart] = useState(() => loadGuestCart());
  const [isLoading, setIsLoading] = useState(false);
  const [cartId, setCartId] = useState(null);
  const prevUserRef = useRef(user);

  // Sync / Fetch both standard and quick e-commerce carts from backend
  const fetchUserCart = async () => {
    if (!user) {
      const local = loadGuestCart();
      setCart(local);
      setCartId(null);
      return;
    }
    
    setIsLoading(true);
    try {
      // 1. Fetch Standard Cart
      const res = await getUserCart();
      let standardItemsFormatted = [];
      if (res?.success) {
        setCartId(res.data?._id || res.data?.id || null);
        const items = res.data?.items || [];
        standardItemsFormatted = items.map(item => ({
          id: item.variant?._id || item.product?._id,
          productId: item.product?._id,
          variantId: item.variant?._id,
          name: `${item.product?.name || ''} ${item.variant?.attributes?.Color ? `(${item.variant.attributes.Color})` : ''}`,
          price: item.variant?.salesPrice || item.variant?.price || 0,
          originalPrice: item.variant?.price || 0,
          image: getImageUrl(item.variant?.thumbnail || item.variant?.images || item.product?.images || item.product?.thumbnail || item.image || ''),
          qty: item.quantity,
          attributes: item.variant?.attributes || {},
          isQuickDelivery: false
        }));
      }

      // 2. Fetch Quick Delivery Cart for any logged-in user
      let quickItemsFormatted = [];
      try {
        const quickRes = await getQuickCart();
        const quickCartData = quickRes?.data?.data || quickRes?.data || quickRes;
        if (quickCartData) {
          const quickItems = quickCartData.items || [];
          quickItemsFormatted = quickItems.map(item => {
            const vId = item.variant?._id ? String(item.variant._id) : (typeof item.variant === 'string' ? String(item.variant) : '');
            const pId = item.product?._id ? String(item.product._id) : (typeof item.product === 'string' ? String(item.product) : '');
            const targetId = vId || pId;
            return {
              id: targetId,
              productId: pId,
              variantId: vId,
              name: `${item.product?.name || 'Product'} ${item.variant?.attributes?.color || item.variant?.attributes?.Color ? `(${item.variant.attributes.color || item.variant.attributes.Color})` : ''}`,
              price: item.variant?.offeredPrice !== undefined ? item.variant.offeredPrice : (item.variant?.salesPrice || 0),
              originalPrice: item.variant?.salesPrice || 0,
              image: getImageUrl(item.variant?.thumbnail || item.variant?.images || item.product?.images || item.product?.thumbnail || item.image || ''),
              qty: item.quantity || 1,
              attributes: item.variant?.attributes || {},
              isQuickDelivery: true
            };
          });
        }
      } catch (err) {
        console.error("Quick cart fetch error:", err);
      }

      // Merge both arrays to keep a single source of truth
      const merged = [...standardItemsFormatted, ...quickItemsFormatted];
      setCart(merged);
    } catch (err) {
      console.error("Failed to load backend cart in context:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch cart whenever user logs in, logs out, or changes
  // AND auto-merge guest cart into logged-in user account
  useEffect(() => {
    const handleUserChange = async () => {
      if (user && !prevUserRef.current) {
        // User just logged in! Merge guest cart if any
        const guestItems = loadGuestCart();
        if (guestItems && guestItems.length > 0) {
          try {
            for (const item of guestItems) {
              const pId = String(item.productId || item.id || '');
              const vId = String(item.variantId || item.id || '');
              if (item.isQuickDelivery) {
                await addToQuickCart(pId, vId, item.qty || 1);
              } else {
                await apiAddToCart(pId, vId);
              }
            }
            localStorage.removeItem(GUEST_CART_KEY);
          } catch (mergeErr) {
            console.error("Failed to merge guest cart into user account:", mergeErr);
          }
        }
      }
      prevUserRef.current = user;
      await fetchUserCart();
    };

    handleUserChange();
  }, [user]);

  // Add Item (Optimistic UI + API Sync / LocalStorage)
  const addToCart = async (product, variantId, productId, isQuick = false) => {
    const rawVId = typeof variantId === 'object' ? (variantId?._id || variantId?.id) : variantId;
    const rawPId = typeof productId === 'object' ? (productId?._id || productId?.id) : (productId || product?.productId || product?._id);

    const vId = String(rawVId || product?.variants?.[0]?._id || product?.id || product?._id || '');
    const pId = String(rawPId || product?._id || product?.id || '');

    if (!pId || !vId || vId === '[object Object]' || pId === '[object Object]') {
      console.warn("Product or Variant ID missing or invalid when adding to cart!", { pId, vId });
      return;
    }

    const resolvedImg = getImageUrl(
      product?.image ||
      product?.thumbnail ||
      product?.variants?.[0]?.thumbnail ||
      product?.variants?.[0]?.images?.[0] ||
      product?.images?.[0] ||
      ''
    );

    const newItem = {
      ...product,
      id: vId,
      productId: pId,
      variantId: vId,
      image: resolvedImg,
      qty: 1,
      isQuickDelivery: isQuick
    };

    // 1. Optimistic Update on client
    setCart(prev => {
      const exists = prev.find(item => String(item.id) === vId && item.isQuickDelivery === isQuick);
      let updated;
      if (exists) {
        updated = prev.map(item => (String(item.id) === vId && item.isQuickDelivery === isQuick) ? { ...item, qty: item.qty + 1 } : item);
      } else {
        updated = [...prev, newItem];
      }
      if (!user) {
        saveGuestCart(updated);
      }
      return updated;
    });

    // 2. If guest, we are done! No 401 API call
    if (!user) {
      return;
    }

    // 3. If logged in, push to backend database in background
    try {
      let res;
      if (isQuick) {
        res = await addToQuickCart(pId, vId, 1);
      } else {
        res = await apiAddToCart(pId, vId);
      }
      if (res && (res.success || res.status === 200 || res.status === 201 || res.data || res.message)) {
        await fetchUserCart();
      } else {
        await fetchUserCart();
        toast.error(res?.message || "Failed to add to database cart");
      }
    } catch (err) {
      await fetchUserCart();
      console.error("Backend add error:", err);
    }
  };

  // Remove Item
  const removeFromCart = async (variantId) => {
    const targetItem = cart.find(item => item.id === variantId);
    const isQuick = targetItem?.isQuickDelivery;

    // 1. Optimistic update
    setCart(prev => {
      const updated = prev.filter(item => !(item.id === variantId && item.isQuickDelivery === isQuick));
      if (!user) {
        saveGuestCart(updated);
      }
      return updated;
    });

    // 2. If guest, done
    if (!user) {
      return;
    }

    // 3. Call backend
    try {
      let res;
      if (isQuick) {
        const pId = targetItem?.productId;
        res = await removeQuickCartItem(pId, variantId);
      } else {
        res = await apiRemoveFromCart(variantId);
      }
      if (res && (res.success || res.status === 200 || res.status === 201 || res.data || res.message)) {
        await fetchUserCart();
      } else {
        await fetchUserCart();
        toast.error(res?.message || "Failed to remove item from database");
      }
    } catch (err) {
      await fetchUserCart();
      console.error("Backend remove error:", err);
    }
  };

  // Update Quantity
  const updateQty = async (variantId, delta, productId, isQuickOverride = null) => {
    const targetItem = cart.find(item => String(item.id) === String(variantId) && (isQuickOverride === null || item.isQuickDelivery === isQuickOverride));
    const isQuick = isQuickOverride !== null ? isQuickOverride : targetItem?.isQuickDelivery;

    // 1. Optimistic update
    setCart(prev => {
      const updated = prev.map(item => 
        (String(item.id) === String(variantId) && item.isQuickDelivery === isQuick) ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      );
      if (!user) {
        saveGuestCart(updated);
      }
      return updated;
    });

    // 2. If guest, done
    if (!user) {
      return;
    }

    // 3. Call backend
    try {
      let res;
      if (isQuick) {
        const pId = productId || targetItem?.productId || variantId;
        if (delta > 0) {
          res = await addToQuickCart(pId, variantId, 1);
        } else {
          res = await decreaseQuickCartItem(pId, variantId);
        }
      } else {
        if (delta > 0) {
          res = await apiAddToCart(productId || variantId, variantId);
        } else {
          res = await decrementCartQuantity(variantId);
        }
      }

      if (res && (res.success || res.status === 200 || res.status === 201 || res.data || res.message)) {
        await fetchUserCart();
      } else {
        await fetchUserCart();
        toast.error(res?.message || "Failed to update quantity in database");
      }
    } catch (err) {
      await fetchUserCart();
      console.error("Backend update quantity error:", err);
    }
  };

  // Clear Cart
  const clearCart = async () => {
    setCart([]);
    if (!user) {
      localStorage.removeItem(GUEST_CART_KEY);
      return;
    }
    try {
      await Promise.all([
        apiClearCart().catch(err => console.error(err)),
        clearQuickCart().catch(err => console.error(err))
      ]);
      await fetchUserCart();
    } catch (err) {
      console.error("Failed to clear backend cart:", err);
    }
  };

  // Compute Totals
  const cartTotal = Math.round(cart.reduce((acc, item) => acc + (item.price * item.qty), 0) * 100) / 100;
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      isLoading,
      addToCart, 
      removeFromCart, 
      updateQty, 
      clearCart,
      cartTotal, 
      cartCount,
      fetchUserCart,
      cartId
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
