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

/* ============================================================================
 * CART TYPES
 * ========================================================================== */

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

  removeItem: (
    sku: string,
  ) => void;

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

/* ============================================================================
 * CONTEXT
 * ========================================================================== */

const CartContext =
  createContext<
    CartContextType | undefined
  >(undefined);

const STORAGE_KEY =
  'kawad-swad-cart-v1';

/* ============================================================================
 * SKU NORMALIZATION
 * ========================================================================== */

function normalizeSku(
  sku: string,
): string {
  return sku
    .trim()
    .toUpperCase();
}

/* ============================================================================
 * QUANTITY NORMALIZATION
 * ========================================================================== */

function normalizeQuantity(
  quantity: number,
): number {
  if (
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    return 0;
  }

  return Math.floor(quantity);
}

/* ============================================================================
 * CART SANITIZATION
 *
 * Cart stores ONLY:
 *
 *   SKU + quantity
 *
 * It does NOT store:
 *
 * - price
 * - MRP
 * - shipping
 * - product name
 * - discount
 *
 * Those values must always come from the central catalog/sales system.
 * ========================================================================== */

function sanitizeCartItems(
  value: unknown,
): CartItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const quantities =
    new Map<string, number>();

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
      !candidate.sku.trim()
    ) {
      continue;
    }

    if (
      typeof candidate.quantity !==
        'number'
    ) {
      continue;
    }

    const sku =
      normalizeSku(
        candidate.sku,
      );

    const quantity =
      normalizeQuantity(
        candidate.quantity,
      );

    if (
      !sku ||
      quantity <= 0
    ) {
      continue;
    }

    /*
     * ProductService is the gatekeeper for
     * current SKU availability and pricing.
     */
    if (
      !ProductService.isPurchasable(
        sku,
      )
    ) {
      continue;
    }

    const previous =
      quantities.get(sku) ?? 0;

    const combined =
      previous + quantity;

    /*
     * Protect against accidental numeric overflow.
     * This is not expected during normal use, but
     * keeps malformed localStorage data harmless.
     */
    if (
      !Number.isSafeInteger(
        combined,
      )
    ) {
      continue;
    }

    quantities.set(
      sku,
      combined,
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

/* ============================================================================
 * LOCAL STORAGE
 * ========================================================================== */

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
    /*
     * Broken/corrupted localStorage
     * must never break the shop.
     */
    try {
      window.localStorage.removeItem(
        STORAGE_KEY,
      );
    } catch {
      // Ignore storage errors.
    }

    return [];
  }
}

/* ============================================================================
 * PROVIDER
 * ========================================================================== */

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] =
    useState<CartItem[]>(
      readStoredCart,
    );

  /* --------------------------------------------------------------------------
     PERSIST CART
  -------------------------------------------------------------------------- */

  useEffect(() => {
    try {
      if (items.length === 0) {
        window.localStorage.removeItem(
          STORAGE_KEY,
        );

        return;
      }

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items),
      );
    } catch {
      /*
       * Storage failure must never
       * break cart functionality.
       */
    }
  }, [items]);

  /* --------------------------------------------------------------------------
     ADD ITEM
  -------------------------------------------------------------------------- */

  const addItem = (
    sku: string,
    quantity = 1,
  ) => {
    if (
      typeof sku !== 'string'
    ) {
      return;
    }

    const normalizedSku =
      normalizeSku(sku);

    if (!normalizedSku) {
      return;
    }

    const qty =
      normalizeQuantity(
        quantity,
      );

    if (qty <= 0) {
      return;
    }

    /*
     * Never allow a SKU into the cart unless
     * the current central product service says
     * that it is purchasable.
     */
    if (
      !ProductService.isPurchasable(
        normalizedSku,
      )
    ) {
      return;
    }

    setItems(
      (previous) => {
        const existing =
          previous.find(
            (item) =>
              item.sku ===
              normalizedSku,
          );

        if (!existing) {
          return [
            ...previous,
            {
              sku:
                normalizedSku,
              quantity:
                qty,
            },
          ];
        }

        const combinedQuantity =
          existing.quantity +
          qty;

        if (
          !Number.isSafeInteger(
            combinedQuantity,
          )
        ) {
          return previous;
        }

        return previous.map(
          (item) =>
            item.sku ===
            normalizedSku
              ? {
                  ...item,
                  quantity:
                    combinedQuantity,
                }
              : item,
        );
      },
    );
  };

  /* --------------------------------------------------------------------------
     REMOVE ITEM
  -------------------------------------------------------------------------- */

  const removeItem = (
    sku: string,
  ) => {
    if (
      typeof sku !== 'string'
    ) {
      return;
    }

    const normalizedSku =
      normalizeSku(sku);

    if (!normalizedSku) {
      return;
    }

    setItems(
      (previous) =>
        previous.filter(
          (item) =>
            item.sku !==
            normalizedSku,
        ),
    );
  };

  /* --------------------------------------------------------------------------
     UPDATE QUANTITY
  -------------------------------------------------------------------------- */

  const updateQuantity = (
    sku: string,
    quantity: number,
  ) => {
    if (
      typeof sku !== 'string'
    ) {
      return;
    }

    const normalizedSku =
      normalizeSku(sku);

    if (!normalizedSku) {
      return;
    }

    const qty =
      normalizeQuantity(
        quantity,
      );

    /*
     * Quantity 0 means remove.
     */
    if (qty <= 0) {
      removeItem(
        normalizedSku,
      );

      return;
    }

    /*
     * Never resurrect a deleted/unavailable
     * or unpriced SKU.
     */
    if (
      !ProductService.isPurchasable(
        normalizedSku,
      )
    ) {
      removeItem(
        normalizedSku,
      );

      return;
    }

    setItems(
      (previous) =>
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

  /* --------------------------------------------------------------------------
     CLEAR CART
  -------------------------------------------------------------------------- */

  const clearCart = () => {
    setItems([]);
  };

  /* --------------------------------------------------------------------------
     CLEAN EXISTING CART
     -------------------------------------------------------------------------- */

  useEffect(() => {
    const sanitized =
      sanitizeCartItems(items);

    if (
      JSON.stringify(
        sanitized,
      ) !==
      JSON.stringify(items)
    ) {
      setItems(sanitized);
    }
  }, [items]);

  /* --------------------------------------------------------------------------
     CALCULATE TOTALS
  -------------------------------------------------------------------------- */

  /*
   * IMPORTANT:
   *
   * CartContext does NOT calculate product prices itself.
   *
   * calculateCartTotals() resolves each SKU through
   * ProductService, which resolves pricing through
   * sales-config.ts.
   *
   * Therefore:
   *
   * sales-config
   *      ↓
   * ProductService
   *      ↓
   * cart-calculations
   *      ↓
   * CartContext
   *
   * Website price already includes shipping.
   */

  const {
    subtotal,
    shippingTotal,
    total,
    itemCount,
  } =
    calculateCartTotals(
      items,
    );

  /* --------------------------------------------------------------------------
     PROVIDER VALUE
  -------------------------------------------------------------------------- */

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

/* ============================================================================
 * HOOK
 * ========================================================================== */

export function useCart(): CartContextType {
  const context =
    useContext(
      CartContext,
    );

  if (!context) {
    throw new Error(
      'useCart must be used within a CartProvider',
    );
  }

  return context;
}

/* ============================================================================
 * PRICE FORMATTER
 * ========================================================================== */

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
