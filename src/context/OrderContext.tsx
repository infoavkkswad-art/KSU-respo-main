import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

import type { CartItem } from './CartContext';

import {
  apiClient,
  type OrderStatusType,
} from '../services/api-client';

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItemSnapshotItem
  extends CartItem {
  unitPrice?: number;
  productNameSnapshot?: string;
  packSizeSnapshot?: number;
}

export interface Order {
  orderId: string;
  customer: CustomerInfo;
  items: OrderItemSnapshotItem[];
  subtotal: number;
  totalShipping: number;
  total: number;
  timestamp: string;
  status: OrderStatusType;
}

interface OrderContextValue {
  lastOrder: Order | null;

  setCompletedOrder: (
    order: Order,
  ) => void;

  placeOrder: (
    customer: CustomerInfo,
    items: CartItem[],
    totals: {
      subtotal: number;
      totalShipping: number;
      total: number;
    },
    idempotencyKey?: string,
  ) => Promise<Order>;

  clearLastOrder: () => void;
}

const OrderContext =
  createContext<OrderContextValue | null>(
    null,
  );

const ORDER_STORAGE_KEY =
  'kawad-swad-last-order-v1';

/* ============================================================================
 * LOCAL ORDER VALIDATION
 * ========================================================================== */

function isValidCustomer(
  customer: unknown,
): customer is CustomerInfo {
  if (
    !customer ||
    typeof customer !== 'object'
  ) {
    return false;
  }

  const value =
    customer as Record<string, unknown>;

  return (
    typeof value.fullName === 'string' &&
    typeof value.phone === 'string' &&
    typeof value.email === 'string' &&
    typeof value.address === 'string' &&
    typeof value.city === 'string' &&
    typeof value.state === 'string' &&
    typeof value.pincode === 'string'
  );
}

function isValidOrderItem(
  item: unknown,
): item is OrderItemSnapshotItem {
  if (
    !item ||
    typeof item !== 'object'
  ) {
    return false;
  }

  const value =
    item as Record<string, unknown>;

  if (
    typeof value.sku !== 'string' ||
    typeof value.quantity !== 'number' ||
    !Number.isFinite(
      value.quantity,
    ) ||
    value.quantity <= 0
  ) {
    return false;
  }

  if (
    value.unitPrice !== undefined &&
    (
      typeof value.unitPrice !==
        'number' ||
      !Number.isFinite(
        value.unitPrice,
      ) ||
      value.unitPrice < 0
    )
  ) {
    return false;
  }

  if (
    value.productNameSnapshot !==
      undefined &&
    typeof value.productNameSnapshot !==
      'string'
  ) {
    return false;
  }

  if (
    value.packSizeSnapshot !==
      undefined &&
    (
      typeof value.packSizeSnapshot !==
        'number' ||
      !Number.isFinite(
        value.packSizeSnapshot,
      )
    )
  ) {
    return false;
  }

  return true;
}

function isValidOrder(
  value: unknown,
): value is Order {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return false;
  }

  const order =
    value as Record<string, unknown>;

  if (
    typeof order.orderId !==
      'string' ||
    !order.orderId.trim()
  ) {
    return false;
  }

  if (
    !isValidCustomer(
      order.customer,
    )
  ) {
    return false;
  }

  if (
    !Array.isArray(order.items) ||
    order.items.length === 0 ||
    !order.items.every(
      isValidOrderItem,
    )
  ) {
    return false;
  }

  if (
    typeof order.subtotal !==
      'number' ||
    !Number.isFinite(
      order.subtotal,
    ) ||
    order.subtotal < 0
  ) {
    return false;
  }

  /*
   * Customer-facing shipping is always FREE.
   * Historical orders are normalized to zero so
   * stale localStorage data cannot reintroduce
   * a separate shipping charge.
   */
  if (
    typeof order.totalShipping !==
      'number' ||
    !Number.isFinite(
      order.totalShipping,
    )
  ) {
    return false;
  }

  if (
    typeof order.total !==
      'number' ||
    !Number.isFinite(
      order.total,
    ) ||
    order.total < 0
  ) {
    return false;
  }

  if (
    typeof order.timestamp !==
      'string'
  ) {
    return false;
  }

  if (
    typeof order.status !==
      'string'
  ) {
    return false;
  }

  return true;
}

/* ============================================================================
 * NORMALIZE CUSTOMER-FACING ORDER
 * ========================================================================== */

function normalizeOrder(
  order: Order,
): Order {
  return {
    ...order,

    /*
     * Shipping is included in the final product
     * selling price and is therefore always zero
     * as a separate order charge.
     */
    totalShipping: 0,

    items: order.items.map(
      (item) => ({
        ...item,
        quantity: Math.floor(
          item.quantity,
        ),

        /*
         * Never store negative/invalid historical
         * prices as customer-facing snapshots.
         */
        ...(item.unitPrice !==
          undefined &&
        Number.isFinite(
          item.unitPrice,
        ) &&
        item.unitPrice >= 0
          ? {
              unitPrice:
                item.unitPrice,
            }
          : {}),
      }),
    ),
  };
}

/* ============================================================================
 * PROVIDER
 * ========================================================================== */

export function OrderProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [lastOrder, setLastOrder] =
    useState<Order | null>(() => {
      try {
        const saved =
          localStorage.getItem(
            ORDER_STORAGE_KEY,
          );

        if (!saved) {
          return null;
        }

        const parsed: unknown =
          JSON.parse(saved);

        if (!isValidOrder(parsed)) {
          localStorage.removeItem(
            ORDER_STORAGE_KEY,
          );

          return null;
        }

        return normalizeOrder(
          parsed,
        );
      } catch {
        try {
          localStorage.removeItem(
            ORDER_STORAGE_KEY,
          );
        } catch {
          // Ignore storage errors.
        }

        return null;
      }
    });

  useEffect(() => {
    try {
      if (lastOrder) {
        localStorage.setItem(
          ORDER_STORAGE_KEY,
          JSON.stringify(
            normalizeOrder(
              lastOrder,
            ),
          ),
        );
      } else {
        localStorage.removeItem(
          ORDER_STORAGE_KEY,
        );
      }
    } catch {
      // Ignore localStorage errors.
    }
  }, [lastOrder]);

  /* ==========================================================================
   * COMPLETED PAYMENT ORDER
   * ======================================================================== */

  const setCompletedOrder = (
    order: Order,
  ) => {
    if (!isValidOrder(order)) {
      console.error(
        'Invalid completed order received.',
      );

      return;
    }

    setLastOrder(
      normalizeOrder(order),
    );
  };

  /* ==========================================================================
   * LEGACY / DIRECT ORDER PLACEMENT
   *
   * Kept for compatibility with existing project code.
   * The backend remains the authority for final pricing,
   * availability and order totals.
   * ======================================================================== */

  const placeOrder:
    OrderContextValue['placeOrder'] =
    async (
      customer,
      items,
      _totals,
      idempotencyKey,
    ) => {
      const order =
        await apiClient.createOrder({
          customer,
          items,
          idempotencyKey,
        });

      const normalized =
        normalizeOrder(order);

      setLastOrder(normalized);

      return normalized;
    };

  /* ==========================================================================
   * CLEAR
   * ======================================================================== */

  const clearLastOrder = () => {
    setLastOrder(null);

    try {
      localStorage.removeItem(
        ORDER_STORAGE_KEY,
      );
    } catch {
      // Ignore localStorage errors.
    }
  };

  return (
    <OrderContext.Provider
      value={{
        lastOrder,
        setCompletedOrder,
        placeOrder,
        clearLastOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

/* ============================================================================
 * HOOK
 * ========================================================================== */

export function useOrder(): OrderContextValue {
  const ctx =
    useContext(OrderContext);

  if (!ctx) {
    throw new Error(
      'useOrder must be used within OrderProvider',
    );
  }

  return ctx;
}
