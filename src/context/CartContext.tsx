import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { calculateCartTotals } from '../utils/cart-calculations';

export interface CartItem {
  sku: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (sku: string, quantity?: number) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  shippingTotal: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'kawad-swad-cart-v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      
      // Validate and sanitize stored items using our calculation utility
      const valid: CartItem[] = [];
      for (const item of parsed) {
        if (item && typeof item.sku === 'string' && typeof item.quantity === 'number' && item.quantity > 0) {
          valid.push({ sku: item.sku, quantity: Math.floor(item.quantity) });
        }
      }
      
      // Re-verify against active catalog
      const evaluated = calculateCartTotals(valid);
      return evaluated.resolvedItems.map((r) => ({ sku: r.sku, quantity: r.quantity }));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items]);

  const addItem = (sku: string, quantity = 1) => {
    if (!sku || quantity <= 0) return;
    const qty = Math.floor(quantity);
    setItems((prev) => {
      const existing = prev.find((item) => item.sku === sku);
      if (existing) {
        return prev.map((item) =>
          item.sku === sku ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { sku, quantity: qty }];
    });
  };

  const removeItem = (sku: string) => {
    setItems((prev) => prev.filter((item) => item.sku !== sku));
  };

  const updateQuantity = (sku: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(sku);
      return;
    }
    const qty = Math.floor(quantity);
    setItems((prev) =>
      prev.map((item) => (item.sku === sku ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Centralized calculations
  const { subtotal, shippingTotal, total, itemCount } = calculateCartTotals(items);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        shippingTotal,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
