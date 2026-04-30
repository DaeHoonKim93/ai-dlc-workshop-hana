import { useState, useCallback, useMemo } from 'react';
import { STORAGE_KEYS } from '@/utils/constants';
import type { CartItem } from '@/types/cart';
import type { MenuItem } from '@/types/menu';

function loadCartItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART_ITEMS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCartItems(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(items));
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCartItems);

  const updateItems = useCallback((updater: (prev: CartItem[]) => CartItem[]) => {
    setCartItems((prev) => {
      const next = updater(prev);
      saveCartItems(next);
      return next;
    });
  }, []);

  const addItem = useCallback(
    (menuItem: MenuItem) => {
      updateItems((prev) => {
        const existing = prev.find((item) => item.menuItemId === menuItem.id);
        if (existing) {
          return prev.map((item) =>
            item.menuItemId === menuItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        }
        return [
          ...prev,
          {
            menuItemId: menuItem.id,
            menuName: menuItem.name,
            price: menuItem.price,
            imageUrl: menuItem.imageUrl,
            quantity: 1,
          },
        ];
      });
    },
    [updateItems],
  );

  const removeItem = useCallback(
    (menuItemId: number) => {
      updateItems((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
    },
    [updateItems],
  );

  const updateQuantity = useCallback(
    (menuItemId: number, quantity: number) => {
      if (quantity <= 0) {
        removeItem(menuItemId);
        return;
      }
      updateItems((prev) =>
        prev.map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity } : item,
        ),
      );
    },
    [updateItems, removeItem],
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem(STORAGE_KEYS.CART_ITEMS);
  }, []);

  const totalAmount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const itemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  return {
    cartItems,
    totalAmount,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
