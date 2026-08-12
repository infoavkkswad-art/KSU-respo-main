import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { CartItem } from './CartContext';
import { apiClient, OrderStatusType } from '../services/api-client';

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItemSnapshotItem extends CartItem {
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
  placeOrder: (
    customer: CustomerInfo,
    items: CartItem[],
    totals: {
      subtotal: number;
      totalShipping: number;
      total: number;
    },
    idempotencyKey?: string
  ) => Promise<Order>;
  clearLastOrder: () => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

const ORDER_STORAGE_KEY = 'kawad-swad-last-order-v1';

export function OrderProvider({ children }: { children: ReactNode }) {
  const [lastOrder, setLastOrder] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem(ORDER_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Order) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (lastOrder) {
        localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(lastOrder));
      } else {
        localStorage.removeItem(ORDER_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }, [lastOrder]);

  const placeOrder: OrderContextValue['placeOrder'] = async (
    customer,
    items,
    _totals,
    idempotencyKey
  ) => {
    // Call real backend API
    const order = await apiClient.createOrder({
      customer,
      items,
      idempotencyKey,
    });

    setLastOrder(order);
    return order;
  };

  const clearLastOrder = () => {
    setLastOrder(null);
    try {
      localStorage.removeItem(ORDER_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  };

  return (
    <OrderContext.Provider value={{ lastOrder, placeOrder, clearLastOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used within OrderProvider');
  return ctx;
}
