/**
 * API Type Definitions
 * Defines all request/response types for frontend-backend communication.
 * Keep these in sync with backend Pydantic models.
 */

// ============================================================================
// GENERIC API RESPONSE WRAPPER
// ============================================================================

export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

// ============================================================================
// PRODUCT & CATALOG
// ============================================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  category: string;
  image_url: string;
  images: string[];
  rating: number;
  reviews_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  category?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'price' | 'rating' | 'newest';
}

// ============================================================================
// CART & CHECKOUT
// ============================================================================

export interface CartItem {
  product_id: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderRequest {
  items: CartItem[];
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  coupon_code?: string;
  notes?: string;
  shipping_method?: string;
}

// ============================================================================
// ORDERS
// ============================================================================

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  items: CartItem[];
  status: OrderStatus;
  total_amount: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  shipping_address: ShippingAddress;
  billing_address: ShippingAddress;
  payment_method: string;
  payment_id?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
}

export interface OrderStatusResponse {
  order_id: string;
  order_number: string;
  status: OrderStatus;
  current_location?: string;
  estimated_delivery?: string;
  tracking_number?: string;
  events: OrderEvent[];
}

export interface OrderEvent {
  status: OrderStatus;
  timestamp: string;
  location?: string;
  message: string;
}

// ============================================================================
// PRICING & SHIPPING
// ============================================================================

export interface PricingRequest {
  items: CartItem[];
  pincode: string;
  coupon_code?: string;
}

export interface PricingResponse {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  breakdown?: {
    item: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimated_days: number;
  is_available: boolean;
}

export interface PincodeValidationResponse {
  pincode: string;
  is_serviceable: boolean;
  available_methods: ShippingMethod[];
  message?: string;
}

// ============================================================================
// REVIEWS & RATINGS
// ============================================================================

export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  customer_name: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  images?: string[];
}

export interface ReviewRequest {
  product_id: string;
  rating: number;
  title: string;
  comment: string;
  images?: File[];
}

export interface ReviewResponse {
  id: string;
  message: string;
}

// ============================================================================
// INQUIRIES & CONTACT
// ============================================================================

export interface ContactFormRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category?: 'general' | 'business' | 'distributor' | 'support';
}

export interface ContactFormResponse {
  id: string;
  message: string;
  support_ticket?: string;
}

export interface EnquiryRequest {
  type: 'bulk_order' | 'distributor' | 'business' | 'general';
  company_name?: string;
  contact_person: string;
  email: string;
  phone: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface EnquiryResponse {
  id: string;
  message: string;
  reference_id: string;
}

// ============================================================================
// PAYMENT
// ============================================================================

export interface PaymentInitiateRequest {
  order_id: string;
  amount: number;
  currency: string;
}

export interface PaymentInitiateResponse {
  razorpay_order_id: string;
  razorpay_key_id: string;
  amount: number;
  currency: string;
}

export interface PaymentVerificationRequest {
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  order_id: string;
}

// ============================================================================
// FULFILLMENT & LOGISTICS
// ============================================================================

export interface FulfillmentRule {
  id: string;
  min_amount: number;
  max_amount: number;
  pincode_range?: {
    start: string;
    end: string;
  };
  shipping_method: string;
  processing_days: number;
  delivery_days: number;
  is_active: boolean;
}

export interface TrackingResponse {
  order_id: string;
  tracking_number: string;
  current_status: OrderStatus;
  carrier: string;
  events: TrackingEvent[];
}

export interface TrackingEvent {
  status: string;
  timestamp: string;
  location: string;
  description: string;
}

// ============================================================================
// AUTHENTICATION & USERS
// ============================================================================

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addresses: ShippingAddress[];
  created_at: string;
  updated_at: string;
}

export interface AuthToken {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

export interface APIError {
  success: false;
  error: string;
  message: string;
  details?: Record<string, unknown>;
  status_code: number;
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export interface BulkOrderRequest {
  products: {
    product_id: string;
    quantity: number;
  }[];
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  company_name?: string;
  delivery_address: ShippingAddress;
  special_requirements?: string;
}

export interface BulkOrderResponse {
  order_id: string;
  reference_number: string;
  message: string;
  estimated_price_range?: {
    min: number;
    max: number;
  };
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if response is a success response
 */
export function isSuccessResponse<T>(
  response: APIResponse<T> | APIError
): response is APIResponse<T> {
  return response.success === true;
}

/**
 * Check if response is an error response
 */
export function isErrorResponse(response: unknown): response is APIError {
  return typeof response === 'object' && response !== null && (response as Record<string, unknown>).success === false;
}
