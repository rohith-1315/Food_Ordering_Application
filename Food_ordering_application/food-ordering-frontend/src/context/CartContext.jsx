import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addCartItem,
  clearCartRequest,
  getCart,
  mergeCart,
  populateFavoriteInCart,
  removeCartItem,
  updateCartItem,
} from '../api/cartApi';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

const GUEST_CART_STORAGE_KEY = 'guestCartItems';

const emptyServerCart = {
  id: null,
  items: [],
  totalAmount: 0,
  totalItems: 0,
  updatedAt: null,
};

const safeParseJSON = (value, fallbackValue) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
};

const readGuestCartItems = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  const parsed = safeParseJSON(raw, []);
  return Array.isArray(parsed) ? parsed : [];
};

const normalizeServerCart = (payload) => {
  if (!payload) {
    return emptyServerCart;
  }

  const items = (payload.items || []).map((item) => ({
    id: item.menuItemId,
    cartItemId: item.id,
    name: item.menuItemName,
    restaurantId: item.restaurantId,
    restaurantName: item.restaurantName,
    quantity: item.quantity,
    price: Number(item.unitPrice),
    available: item.available,
  }));

  const derivedTotalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: payload.id,
    items,
    totalAmount: Number(payload.totalAmount || 0),
    totalItems: payload.totalItems ?? derivedTotalItems,
    updatedAt: payload.updatedAt || null,
  };
};

export function CartProvider({ children }) {
  const { currentUser } = useContext(AuthContext);
  const [serverCart, setServerCart] = useState(emptyServerCart);
  const [guestCartItems, setGuestCartItems] = useState(readGuestCartItems);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = Boolean(currentUser);

  const syncServerCart = useCallback(async () => {
    if (!isAuthenticated) {
      setServerCart(emptyServerCart);
      return;
    }

    setLoading(true);
    try {
      const response = await getCart();
      setServerCart(normalizeServerCart(response.data?.data));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    syncServerCart();
  }, [isAuthenticated, syncServerCart]);

  useEffect(() => {
    if (!isAuthenticated || guestCartItems.length === 0) {
      return;
    }

    const mergeGuestItems = async () => {
      try {
        await mergeCart({
          items: guestCartItems.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
          })),
        });

        setGuestCartItems([]);
      } finally {
        syncServerCart();
      }
    };

    mergeGuestItems();
  }, [guestCartItems, isAuthenticated, syncServerCart]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(guestCartItems));
  }, [guestCartItems]);

  const addItem = async (item) => {
    if (isAuthenticated) {
      const response = await addCartItem({
        menuItemId: item.id,
        quantity: 1,
      });

      setServerCart(normalizeServerCart(response.data?.data));
      return;
    }

    if (guestCartItems.length > 0 && guestCartItems[0].restaurantId !== item.restaurantId) {
      throw new Error('Cart has items from another restaurant. Clear cart before adding from a different restaurant.');
    }

    setGuestCartItems((prev) => {
      const exists = prev.find((entry) => entry.id === item.id);

      if (exists) {
        return prev.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                quantity: entry.quantity + 1,
              }
            : entry
        );
      }

      return [
        ...prev,
        {
          ...item,
          price: Number(item.price),
          quantity: 1,
        },
      ];
    });
  };

  const removeItem = async (itemId) => {
    if (isAuthenticated) {
      const existing = serverCart.items.find((item) => item.id === itemId);
      if (!existing?.cartItemId) {
        return;
      }

      const response = await removeCartItem(existing.cartItemId);
      setServerCart(normalizeServerCart(response.data?.data));
      return;
    }

    setGuestCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    if (isAuthenticated) {
      const existing = serverCart.items.find((item) => item.id === itemId);
      if (!existing?.cartItemId) {
        return;
      }

      const response = await updateCartItem(existing.cartItemId, { quantity });
      setServerCart(normalizeServerCart(response.data?.data));
      return;
    }

    setGuestCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      await clearCartRequest();
      setServerCart(emptyServerCart);
      return;
    }

    setGuestCartItems([]);
  };

  const populateFromFavorite = async (favoriteId) => {
    if (!isAuthenticated) {
      return;
    }

    const response = await populateFavoriteInCart(favoriteId);
    setServerCart(normalizeServerCart(response.data?.data));
  };

  const cartItems = isAuthenticated ? serverCart.items : guestCartItems;

  const totalAmount = useMemo(() => {
    if (isAuthenticated) {
      return Number(serverCart.totalAmount || 0);
    }

    return guestCartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  }, [guestCartItems, isAuthenticated, serverCart.totalAmount]);

  const totalItems = useMemo(() => {
    if (isAuthenticated) {
      return Number(serverCart.totalItems || 0);
    }

    return guestCartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [guestCartItems, isAuthenticated, serverCart.totalItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalAmount,
        totalItems,
        loading,
        populateFromFavorite,
        refreshCart: syncServerCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
