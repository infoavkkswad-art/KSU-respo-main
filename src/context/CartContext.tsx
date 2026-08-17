import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  calculateCartTotals,
} from '../utils/cart-calculations';
import {
  ProductService,
} from '../services/product-service';

export interface CartItem {
  sku: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    sku: string,
    quantity?: number,
  ) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (
    sku: string,
    quantity: number,
  ) => void;
  clearCart: () => void;
  subtotal: number;
  shippingTotal: 0;
  total: number;
  itemCount: number;
}

const CartContext =
  createContext<CartContextType | undefined>(
    undefined,
  );

const STORAGE_KEY =
  'kawad-swad-cart-v1';

function sanitizeCartItems(
  value: unknown,
): CartItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const quantities = new Map<
    string,
    number
  >();

  for (const item of value) {
    if (
      !item ||
      typeof item !== 'object'
    ) {
      continue;
    }

    const candidate =
      item as Partial<CartItem>;

    if (
      typeof candidate.sku !==
        'string' ||
      !candidate.sku.trim() ||
      typeof candidate.quantity !==
        'number' ||
      !Number.isFinite(
        candidate.quantity,
      ) ||
      candidate.quantity <= 0
    ) {
      continue;
    }

    const sku =
      candidate.sku
        .trim()
        .toUpperCase();

    const quantity = Math.floor(
      candidate.quantity,
    );

    if (quantity <= 0) {
      continue;
    }

    /*
     * Resolve against the central product
     * service. This automatically removes:
     * - deleted SKUs
     * - unavailable SKUs
     * - SKUs without a valid website price
     */
    if (
      !ProductService.isPurchasable(
        sku,
      )
    ) {
      continue;
    }

    quantities.set(
      sku,
      (quantities.get(sku) ?? 0) +
        quantity,
    );
  }

  return Array.from(
    quantities.entries(),
  ).map(
    ([sku, quantity]) => ({
      sku,
      quantity,
    }),
  );
}

function readStoredCart(): CartItem[] {
  try {
    if (
      typeof window ===
      'undefined'
    ) {
      return [];
    }

    const saved =
      window.localStorage.getItem(
        STORAGE_KEY,
      );

    if (!saved) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(saved);

    return sanitizeCartItems(
      parsed,
    );
  } catch {
    return [];
  }
}

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] =
    useState<CartItem[]>(
      readStoredCart,
    );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items),
      );
    } catch {
      // Ignore localStorage errors.
    }
  }, [items]);

  const addItem = (
    sku: string,
    quantity = 1,
  ) => {
    if (
      typeof sku !== 'string' ||
      !sku.trim() ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      return;
    }

    const normalizedSku =
      sku.trim().toUpperCase();

    /*
     * Never allow unavailable or
     * unpriced SKUs into the cart.
     */
    if (
      !ProductService.isPurchasable(
        normalizedSku,
      )
    ) {
      return;
    }

    const qty = Math.floor(quantity);

    if (qty <= 0) {
      return;
    }

    setItems((previous) => {
      const existing =
        previous.find(
          (item) =>
            item.sku ===
            normalizedSku,
        );

      if (existing) {
        return previous.map(
          (item) =>
            item.sku ===
            normalizedSku
              ? {
                  ...item,
                  quantity:
                    item.quantity +
                    qty,
                }
              : item,
        );
      }

      return [
        ...previous,
        {
          sku: normalizedSku,
          quantity: qty,
        },
      ];
    });
  };

  const removeItem = (
    sku: string,
  ) => {
    const normalizedSku =
      sku.trim().toUpperCase();

    setItems((previous) =>
      previous.filter(
        (item) =>
          item.sku !==
          normalizedSku,
      ),
    );
  };

  const updateQuantity = (
    sku: string,
    quantity: number,
  ) => {
    const normalizedSku =
      sku.trim().toUpperCase();

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      removeItem(normalizedSku);
      return;
    }

    /*
     * Do not allow a quantity update to
     * resurrect an unavailable SKU.
     */
    if (
      !ProductService.isPurchasable(
        normalizedSku,
      )
    ) {
      removeItem(normalizedSku);
      return;
    }

    const qty = Math.floor(quantity);

    if (qty <= 0) {
      removeItem(normalizedSku);
      return;
    }

    setItems((previous) =>
      previous.map(
        (item) =>
          item.sku ===
          normalizedSku
            ? {
                ...item,
                quantity: qty,
              }
            : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  /*
   * All monetary calculations are centralized
   * in cart-calculations.ts.
   *
   * websitePrice is already the final price
   * including the shipping cost.
   */
  const {
    subtotal,
    shippingTotal,
    total,
    itemCount,
  } = calculateCartTotals(items);

  /*
   * If catalog data changes while the cart is
   * open, calculation safely ignores invalid
   * SKUs. Keep the stored cart clean as well.
   */
  useEffect(() => {
    const sanitized =
      sanitizeCartItems(items);

    if (
      JSON.stringify(sanitized) !==
      JSON.stringify(items)
    ) {
      setItems(sanitized);
    }
  }, [items]);

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
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used within a CartProvider',
    );
  }

  return context;
}

export function formatPrice(
  amount: number,
): string {
  if (
    !Number.isFinite(amount)
  ) {
    return '₹0';
  }

  return `₹${Math.round(
    amount,
  ).toLocaleString('en-IN')}`;
}
