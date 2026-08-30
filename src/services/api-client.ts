import type { CustomerInfo, Order } from '../context/OrderContext';
import type { CartItem } from '../context/CartContext';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  '';

/* ============================================================================
 * ORDER TYPES
 * ========================================================================== */

export interface CreateOrderPayload {
  customer: CustomerInfo;
  items: CartItem[];
  idempotencyKey?: string;
}

export type OrderStatusType =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

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
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  amount?: number;
  currency?: string;
  customer: CustomerInfo;
  items: BackendResponseItem[];
  subtotal: number;
  shipping?: number;
  total: number;
  createdAt: string;
  status: OrderStatusType;
}

/* ============================================================================
 * RAZORPAY CHECKOUT ORDER
 *
 * IMPORTANT:
 *
 * shipping is now a NUMBER.
 *
 * It can be:
 *
 *   ₹0   for MANUAL fulfilment
 *   ₹47  / ₹71 / ₹150 or another server-resolved amount
 *        for SHIPPING fulfilment
 *
 * The backend remains the final authority.
 * ========================================================================== */

export interface RazorpayCheckoutOrder extends Order {
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  amount?: number;
  currency?: string;

  /*
   * Actual shipping returned by the backend.
   */
  shipping: number;

  /*
   * Final backend order total.
   */
  total: number;

  createdAt: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/* ============================================================================
 * SERVER-SIDE CART QUOTE
 * ========================================================================== */

export interface CartQuoteItem {
  sku: string;
  quantity: number;
}

export interface CartQuoteRequest {
  pincode: string;
  items: CartQuoteItem[];
}

export interface CartQuoteResponseItem {
  sku: string;
  quantity: number;

  /*
   * BASE WEBSITE SELLING PRICE.
   */
  unitPrice: number;

  /*
   * Product subtotal only.
   */
  itemSubtotal: number;

  /*
   * Server-resolved shipping allocation, if supplied.
   */
  shipping: number;

  productName?: string;
  packSize?: number;
  mrp?: number;
}

export interface CartQuoteResponse {
  success: boolean;

  pincode: string;

  pincodeValid: boolean;

  fulfillmentType:
    | 'MANUAL'
    | 'SHIPPING';

  shippingRequired: boolean;

  pricingMode:
    | 'LOCAL'
    | 'STANDARD';

  /*
   * Actual shipping calculated by the backend.
   */
  shipping: number;

  /*
   * Product subtotal before shipping.
   */
  subtotal: number;

  /*
   * Final:
   *
   * subtotal + shipping
   */
  total: number;

  location: {
    officeName?: string | null;
    districtName?: string | null;
    stateName?: string | null;
  };

  items: CartQuoteResponseItem[];
}

/* ============================================================================
 * ENQUIRY TYPES
 * ========================================================================== */

export type EnquiryType =
  | 'bulk'
  | 'distributor'
  | 'food-business'
  | 'general';

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

/* ============================================================================
 * API ERROR
 * ========================================================================== */

async function getApiErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const errorData =
      (await response.json()) as {
        detail?: unknown;
        message?: unknown;
      };

    const detail =
      errorData.detail ??
      errorData.message;

    if (
      typeof detail === 'string' &&
      detail.trim()
    ) {
      return detail;
    }

    if (
      detail !== undefined &&
      detail !== null
    ) {
      return JSON.stringify(
        detail,
      );
    }
  } catch {
    // Use fallback below.
  }

  return fallback;
}

/* ============================================================================
 * NUMBER NORMALIZATION
 * ========================================================================== */

function safeNonNegativeNumber(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return fallback;
  }

  return value;
}

/* ============================================================================
 * NORMALIZE BACKEND ORDER
 *
 * IMPORTANT:
 *
 * Backend remains the authority for:
 *
 * - stock
 * - product price
 * - shipping
 * - final order amount
 * - Razorpay amount
 * - payment verification
 *
 * Frontend MUST NOT overwrite backend shipping with zero.
 * ========================================================================== */

function normalizeOrderResponse(
  data: BackendOrderResponse,
): RazorpayCheckoutOrder {
  const items =
    Array.isArray(data.items)
      ? data.items.map(
          (item) => ({
            sku:
              item.sku,

            quantity:
              Math.max(
                1,
                Math.floor(
                  item.quantity,
                ),
              ),

            unitPrice:
              safeNonNegativeNumber(
                item.unitPrice,
              ),

            productNameSnapshot:
              item.productNameSnapshot ??
              '',

            packSizeSnapshot:
              typeof item.packSizeSnapshot ===
                'number' &&
              Number.isFinite(
                item.packSizeSnapshot,
              )
                ? item.packSizeSnapshot
                : 0,
          }),
        )
      : [];

  const shipping =
    safeNonNegativeNumber(
      data.shipping,
    );

  const subtotal =
    safeNonNegativeNumber(
      data.subtotal,
    );

  const total =
    safeNonNegativeNumber(
      data.total,
    );

  return {
    orderId:
      data.orderId,

    razorpayOrderId:
      data.razorpayOrderId,

    razorpayKeyId:
      data.razorpayKeyId,

    amount:
      typeof data.amount ===
        'number' &&
      Number.isFinite(
        data.amount,
      ) &&
      data.amount >= 0
        ? data.amount
        : undefined,

    currency:
      data.currency ||
      'INR',

    customer:
      data.customer,

    items,

    subtotal,

    /*
     * Actual backend shipping.
     */
    shipping,

    /*
     * Compatibility field used by the
     * existing Order model.
     */
    totalShipping:
      shipping,

    /*
     * Backend final total.
     */
    total,

    timestamp:
      data.createdAt,

    createdAt:
      data.createdAt,

    status:
      data.status,
  };
}

/* ============================================================================
 * NORMALIZE CART QUOTE
 * ========================================================================== */

function normalizeCartQuoteResponse(
  data: CartQuoteResponse,
): CartQuoteResponse {
  const shipping =
    safeNonNegativeNumber(
      data.shipping,
    );

  const subtotal =
    safeNonNegativeNumber(
      data.subtotal,
    );

  const total =
    safeNonNegativeNumber(
      data.total,
    );

  const items =
    Array.isArray(data.items)
      ? data.items.map(
          (item) => ({
            ...item,

            quantity:
              Math.max(
                1,
                Math.floor(
                  item.quantity,
                ),
              ),

            unitPrice:
              safeNonNegativeNumber(
                item.unitPrice,
              ),

            itemSubtotal:
              safeNonNegativeNumber(
                item.itemSubtotal,
              ),

            shipping:
              safeNonNegativeNumber(
                item.shipping,
              ),
          }),
        )
      : [];

  return {
    ...data,

    shipping,

    subtotal,

    total,

    items,
  };
}

/* ============================================================================
 * API CLIENT
 * ========================================================================== */

export const apiClient = {

  /* --------------------------------------------------------------------------
   * HEALTH
   * ------------------------------------------------------------------------ */

  async checkHealth(): Promise<boolean> {
    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/health`,
          {
            method: 'GET',

            headers: {
              Accept:
                'application/json',
            },
          },
        );

      if (!response.ok) {
        return false;
      }

      const data =
        (await response.json()) as {
          status?: string;
        };

      return (
        data.status ===
        'ok'
      );
    } catch {
      return false;
    }
  },


  /* --------------------------------------------------------------------------
   * CREATE ORDER
   * ------------------------------------------------------------------------ */

  async createOrder(
    payload: CreateOrderPayload,
  ): Promise<RazorpayCheckoutOrder> {

    const response =
      await fetch(
        `${API_BASE_URL}/api/orders`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Accept:
              'application/json',
          },

          body:
            JSON.stringify({
              customer:
                payload.customer,

              /*
               * ONLY SKU + quantity are sent.
               *
               * Browser prices are never trusted.
               *
               * Backend resolves:
               *
               * SKU
               * ↓
               * authoritative price
               * ↓
               * fulfilment shipping
               * ↓
               * final order amount
               */
              items:
                payload.items.map(
                  (item) => ({
                    sku:
                      item.sku
                        .trim()
                        .toUpperCase(),

                    quantity:
                      Math.max(
                        1,
                        Math.floor(
                          item.quantity,
                        ),
                      ),
                  }),
                ),

              ...(payload.idempotencyKey
                ? {
                    idempotencyKey:
                      payload.idempotencyKey,
                  }
                : {}),
            }),
        },
      );

    if (!response.ok) {
      throw new Error(
        await getApiErrorMessage(
          response,
          'Failed to submit order request.',
        ),
      );
    }

    const data =
      (await response.json()) as
        BackendOrderResponse;

    if (
      !data.orderId ||
      !data.customer ||
      !Array.isArray(
        data.items,
      )
    ) {
      throw new Error(
        'Invalid order response received from the server.',
      );
    }

    return normalizeOrderResponse(
      data,
    );
  },


  /* --------------------------------------------------------------------------
   * SERVER-SIDE CART QUOTE
   * ------------------------------------------------------------------------ */

  async getCartQuote(
    payload: CartQuoteRequest,
  ): Promise<CartQuoteResponse> {

    const response =
      await fetch(
        `${API_BASE_URL}/api/fulfillment/cart-quote`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Accept:
              'application/json',
          },

          body:
            JSON.stringify({
              pincode:
                payload.pincode.trim(),

              items:
                payload.items.map(
                  (item) => ({
                    sku:
                      item.sku
                        .trim()
                        .toUpperCase(),

                    quantity:
                      Math.max(
                        1,
                        Math.floor(
                          item.quantity,
                        ),
                      ),
                  }),
                ),
            }),
        },
      );

    if (!response.ok) {
      throw new Error(
        await getApiErrorMessage(
          response,
          'Unable to calculate delivery price for this PIN code.',
        ),
      );
    }

    const data =
      (await response.json()) as
        CartQuoteResponse;

    if (
      data.success !== true ||
      !data.pincodeValid ||
      !Array.isArray(
        data.items,
      )
    ) {
      throw new Error(
        'Invalid pricing quote received from the server.',
      );
    }

    if (
      data.fulfillmentType !==
        'MANUAL' &&
      data.fulfillmentType !==
        'SHIPPING'
    ) {
      throw new Error(
        'Invalid fulfilment type received from the server.',
      );
    }

    if (
      !Number.isFinite(
        data.subtotal,
      ) ||
      data.subtotal < 0
    ) {
      throw new Error(
        'Invalid subtotal received from the server.',
      );
    }

    if (
      !Number.isFinite(
        data.shipping,
      ) ||
      data.shipping < 0
    ) {
      throw new Error(
        'Invalid shipping amount received from the server.',
      );
    }

    if (
      !Number.isFinite(
        data.total,
      ) ||
      data.total <= 0
    ) {
      throw new Error(
        'Invalid order total received from the server.',
      );
    }

    /*
     * Protect against an inconsistent server response.
     *
     * Expected:
     *
     * subtotal + shipping = total
     */
    const expectedTotal =
      data.subtotal +
      data.shipping;

    if (
      Math.abs(
        expectedTotal -
          data.total,
      ) > 0.01
    ) {
      throw new Error(
        'The server returned an inconsistent pricing quote.',
      );
    }

    return normalizeCartQuoteResponse(
      data,
    );
  },


  /* --------------------------------------------------------------------------
   * VERIFY RAZORPAY PAYMENT
   * ------------------------------------------------------------------------ */

  async verifyPayment(
    payload: VerifyPaymentPayload,
  ): Promise<{
    success: boolean;
    message: string;
    orderId: string;
  }> {

    const response =
      await fetch(
        `${API_BASE_URL}/api/orders/verify-payment`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Accept:
              'application/json',
          },

          body:
            JSON.stringify(
              payload,
            ),
        },
      );

    if (!response.ok) {
      throw new Error(
        await getApiErrorMessage(
          response,
          'Payment verification failed.',
        ),
      );
    }

    const data =
      (await response.json()) as {
        success: boolean;
        message: string;
        orderId: string;
      };

    if (
      data.success !== true ||
      !data.orderId
    ) {
      throw new Error(
        data.message ||
          'Payment verification failed.',
      );
    }

    return data;
  },


  /* --------------------------------------------------------------------------
   * TRACK ORDER
   * ------------------------------------------------------------------------ */

  async trackOrder(
    orderId: string,
    phone: string,
  ): Promise<TrackedOrder> {

    const cleanOrderId =
      orderId.trim();

    const cleanPhone =
      phone.trim();

    if (!cleanOrderId) {
      throw new Error(
        'Please enter your Order ID.',
      );
    }

    if (
      !/^[6-9]\d{9}$/.test(
        cleanPhone,
      )
    ) {
      throw new Error(
        'Please enter a valid 10-digit Indian mobile number.',
      );
    }

    const response =
      await fetch(
        `${API_BASE_URL}/api/orders/${encodeURIComponent(
          cleanOrderId,
        )}?phone=${encodeURIComponent(
          cleanPhone,
        )}`,
        {
          method: 'GET',

          headers: {
            Accept:
              'application/json',
          },
        },
      );

    if (!response.ok) {

      if (
        response.status ===
        404
      ) {
        throw new Error(
          'No order found matching this Order ID and Phone number.',
        );
      }

      if (
        response.status ===
        429
      ) {
        throw new Error(
          'Too many tracking attempts. Please wait a minute before trying again.',
        );
      }

      throw new Error(
        await getApiErrorMessage(
          response,
          'Order not found or verification failed.',
        ),
      );
    }

    const data =
      (await response.json()) as
        TrackedOrder;

    /*
     * Tracking displays the ACTUAL
     * backend shipping amount.
     *
     * Older orders may legitimately
     * have ₹0 shipping.
     */
    return {
      ...data,

      items:
        Array.isArray(
          data.items,
        )
          ? data.items.map(
              (item) => ({
                ...item,

                quantity:
                  Math.max(
                    1,
                    Math.floor(
                      item.quantity,
                    ),
                  ),

                unitPrice:
                  Number.isFinite(
                    item.unitPrice,
                  ) &&
                  item.unitPrice >= 0
                    ? item.unitPrice
                    : 0,
              }),
            )
          : [],

      shipping:
        safeNonNegativeNumber(
          data.shipping,
        ),

      subtotal:
        safeNonNegativeNumber(
          data.subtotal,
        ),

      total:
        safeNonNegativeNumber(
          data.total,
        ),
    };
  },


  /* --------------------------------------------------------------------------
   * ENQUIRY
   * ------------------------------------------------------------------------ */

  async createEnquiry(
    payload: CreateEnquiryPayload,
  ): Promise<EnquiryResponse> {

    const response =
      await fetch(
        `${API_BASE_URL}/api/enquiries`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Accept:
              'application/json',
          },

          body:
            JSON.stringify(
              payload,
            ),
        },
      );

    if (!response.ok) {
      throw new Error(
        await getApiErrorMessage(
          response,
          'Failed to submit enquiry.',
        ),
      );
    }

    const data =
      (await response.json()) as
        EnquiryResponse;

    if (
      data.success !== true ||
      !data.enquiryId
    ) {
      throw new Error(
        data.message ||
          'Enquiry submission failed.',
      );
    }

    return data;
  },
};
