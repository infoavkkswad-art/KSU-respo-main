import { CustomerInfo, Order } from '../context/OrderContext';
import { CartItem } from '../context/CartContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface CreateOrderPayload {
  customer: CustomerInfo;
  items: CartItem[];
  idempotencyKey?: string;
}

export type OrderStatusType = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface TrackedOrderItem {
  sku: string;
  quantity: number;
  unitPrice: number;
  productNameSnapshot: string;
  packSizeSnapshot: number;
}

export interface TrackedOrder {
  orderId: string;
  status: OrderStatusType;
  customer: {
    fullName: string;
    phoneMasked: string;
    city: string;
    state: string;
  };
  items: TrackedOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
}

interface BackendResponseItem {
  sku: string;
  quantity: number;
  unitPrice?: number;
  productNameSnapshot?: string;
  packSizeSnapshot?: number;
}

interface BackendOrderResponse {
  orderId: string;
  customer: CustomerInfo;
  items: BackendResponseItem[];
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
  status: OrderStatusType;
}

export type EnquiryType = 'bulk' | 'distributor' | 'food-business' | 'general';

export interface CreateEnquiryPayload {
  type: EnquiryType;
  businessName?: string;
  contactPerson: string;
  phone?: string;
  email: string;
  businessType?: string;
  location: string;
  productsOfInterest?: string;
  quantity?: string;
  message: string;
  idempotencyKey?: string;
}

export interface EnquiryResponse {
  success: boolean;
  enquiryId: string;
  message: string;
  createdAt: string;
}

export const apiClient = {
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { status: string };
      return data.status === 'ok';
    } catch {
      return false;
    }
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMsg = 'Failed to submit order request.';
      try {
        const errorData = (await response.json()) as { detail?: string | unknown };
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        }
      } catch {
        // fallback to default message
      }
      throw new Error(errorMsg);
    }

    const data = (await response.json()) as BackendOrderResponse;
    
    return {
      orderId: data.orderId,
      customer: data.customer,
      items: data.items.map((i) => ({
        sku: i.sku,
        quantity: i.quantity,
        unitPrice: i.unitPrice ?? 0,
        productNameSnapshot: i.productNameSnapshot ?? '',
        packSizeSnapshot: i.packSizeSnapshot ?? 0,
      })),
      subtotal: data.subtotal,
      totalShipping: data.shipping,
      total: data.total,
      timestamp: data.createdAt,
      status: data.status,
    };
  },

  async trackOrder(orderId: string, phone: string): Promise<TrackedOrder> {
    const response = await fetch(
      `${API_BASE_URL}/api/orders/${encodeURIComponent(orderId.trim())}?phone=${encodeURIComponent(phone.trim())}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      let errorMsg = 'Order not found or verification failed.';
      if (response.status === 404) {
        errorMsg = 'No order found matching this Order ID and Phone number.';
      } else if (response.status === 429) {
        errorMsg = 'Too many tracking attempts. Please wait a minute before trying again.';
      } else {
        try {
          const errData = (await response.json()) as { detail?: string };
          if (errData.detail) {
            errorMsg = typeof errData.detail === 'string' ? errData.detail : errorMsg;
          }
        } catch {
          // fallback
        }
      }
      throw new Error(errorMsg);
    }

    return (await response.json()) as TrackedOrder;
  },

  async createEnquiry(payload: CreateEnquiryPayload): Promise<EnquiryResponse> {
    const response = await fetch(`${API_BASE_URL}/api/enquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMsg = 'Failed to submit enquiry.';
      try {
        const errorData = (await response.json()) as { detail?: string | unknown };
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        }
      } catch {
        // fallback
      }
      throw new Error(errorMsg);
    }

    return (await response.json()) as EnquiryResponse;
  },
};
