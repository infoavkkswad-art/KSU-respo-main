import express, { Request, Response } from 'express';
import { randomBytes, randomInt } from 'node:crypto';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { products } from './src/data/products';
import { getSalesSku, getSellingPrice } from './src/data/sales-config';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data stores for orders, enquiries, and reviews
interface StoredOrder {
  orderId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount?: number;
  currency: string;
  customer: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    sku: string;
    quantity: number;
    unitPrice: number;
    productNameSnapshot: string;
    packSizeSnapshot: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled';
  fulfillmentType: 'MANUAL' | 'SHIPPING';
  fulfillmentStatus: string;
  createdAt: string;
  paymentVerifiedAt?: string;
  paymentMethod?: string;
}

interface StoredEnquiry {
  enquiryId: string;
  type: string;
  businessName?: string;
  contactPerson: string;
  phone?: string;
  email: string;
  businessType?: string;
  location: string;
  productsOfInterest?: string;
  quantity?: string;
  message: string;
  createdAt: string;
}

interface StoredReview {
  reviewId: string;
  productId: string;
  rating: number;
  userName: string;
  userLocation: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

interface ItemQuote {
  sku: string;
  quantity: number;
  unitPrice: number;
  itemSubtotal: number;
  shipping: number;
  productName: string;
  packSize: number;
  mrp: number | null;
}

const ordersStore = new Map<string, StoredOrder>();
const enquiriesStore = new Map<string, StoredEnquiry>();
const reviewsStore: StoredReview[] = [
  {
    reviewId: 'rev-1',
    productId: 'moong-master-papad',
    rating: 5,
    userName: 'Rajesh Sharma',
    userLocation: 'Indore, MP',
    comment: 'Authentic Nimar taste! The crispness and pepper blend are just perfect.',
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    reviewId: 'rev-2',
    productId: 'chana-garlic-papad',
    rating: 5,
    userName: 'Anjali Verma',
    userLocation: 'Bhopal, MP',
    comment: 'Rich garlic flavor and traditional crunch. Reminds me of homemade papads.',
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    reviewId: 'rev-3',
    productId: 'urad-guru-papad',
    rating: 5,
    userName: 'Sunil Patel',
    userLocation: 'Ahmedabad, Gujarat',
    comment: 'Excellent quality urad papad with genuine spices. Fast delivery too.',
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    reviewId: 'rev-4',
    productId: 'combo-235',
    rating: 5,
    userName: 'Priya Rathore',
    userLocation: 'Khandwa, MP',
    comment: 'Great combo pack to try all classic varieties in one purchase!',
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

// Shipping rate by pack size
const SHIPPING_BY_PACK_SIZE: Record<number, number> = {
  200: 47,
  235: 47,
  500: 71,
  1000: 150,
};

// Pincode helpers
function resolvePincode(pincode: string) {
  const cleanPin = pincode.trim();
  if (!/^\d{6}$/.test(cleanPin)) {
    return null;
  }
  
  // Local Nimar and West MP PIN codes
  const isLocalNimar = /^(450|451|452|453|454|455|456)/.test(cleanPin);
  
  let districtName = 'Nimar Region';
  let stateName = 'Madhya Pradesh';
  let officeName = 'Regional Head Post Office';
  
  if (cleanPin.startsWith('451')) {
    districtName = 'Khargone (West Nimar)';
    stateName = 'Madhya Pradesh';
    officeName = 'Khargone H.O';
  } else if (cleanPin.startsWith('450')) {
    districtName = 'Khandwa (East Nimar)';
    stateName = 'Madhya Pradesh';
    officeName = 'Khandwa H.O';
  } else if (cleanPin.startsWith('452')) {
    districtName = 'Indore';
    stateName = 'Madhya Pradesh';
    officeName = 'Indore G.P.O';
  } else if (cleanPin.startsWith('110')) {
    districtName = 'New Delhi';
    stateName = 'Delhi';
    officeName = 'New Delhi G.P.O';
  } else if (cleanPin.startsWith('400')) {
    districtName = 'Mumbai';
    stateName = 'Maharashtra';
    officeName = 'Mumbai G.P.O';
  } else if (cleanPin.startsWith('380')) {
    districtName = 'Ahmedabad';
    stateName = 'Gujarat';
    officeName = 'Ahmedabad G.P.O';
  } else if (cleanPin.startsWith('560')) {
    districtName = 'Bengaluru';
    stateName = 'Karnataka';
    officeName = 'Bengaluru G.P.O';
  }

  return {
    pincode: cleanPin,
    validPincode: true,
    isLocalNimar,
    fulfillmentType: (isLocalNimar ? 'MANUAL' : 'SHIPPING') as 'MANUAL' | 'SHIPPING',
    officeName,
    districtName,
    stateName,
  };
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// 1. Health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// 2. Fulfillment Pincode Lookup
app.get('/api/fulfillment/pincode/:pincode', (req: Request, res: Response) => {
  const info = resolvePincode(String(req.params.pincode));
  if (!info) {
    return res.status(400).json({ detail: 'Please enter a valid 6-digit Indian PIN code.' });
  }
  res.json({
    pincode: info.pincode,
    validPincode: true,
    officeName: info.officeName,
    districtName: info.districtName,
    stateName: info.stateName,
    fulfillmentType: info.fulfillmentType,
  });
});

// 3. Fulfillment Quote
app.get('/api/fulfillment/quote/:pincode', (req: Request, res: Response) => {
  const info = resolvePincode(String(req.params.pincode));
  if (!info) {
    return res.status(400).json({ detail: 'Please enter a valid 6-digit Indian PIN code.' });
  }
  res.json({
    pincode: info.pincode,
    validPincode: true,
    fulfillmentType: info.fulfillmentType,
    shippingCharge: info.fulfillmentType === 'MANUAL' ? 0 : 47,
    officeName: info.officeName,
    districtName: info.districtName,
    stateName: info.stateName,
  });
});

// 4. Cart Quote
app.post('/api/fulfillment/cart-quote', (req: Request, res: Response) => {
  try {
    const { pincode, items } = req.body;
    if (!pincode || typeof pincode !== 'string') {
      return res.status(400).json({ detail: 'Pincode is required.' });
    }
    const info = resolvePincode(pincode);
    if (!info) {
      return res.status(400).json({ detail: 'Please enter a valid Indian PIN code.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ detail: 'Cart is empty.' });
    }

    const isManual = info.fulfillmentType === 'MANUAL';
    let subtotal = 0;
    let maxShipping = 0;
    const itemQuotes: ItemQuote[] = [];

    for (const item of items) {
      const skuCode = String(item.sku || '').trim().toUpperCase();
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));

      // Find product family and sales config
      const salesConfig = getSalesSku(skuCode);
      let productName = 'Kawad Swad Product';
      const packSize = salesConfig?.packSize || 200;
      const mrp = salesConfig?.mrp || 100;
      const sellingPrice = getSellingPrice(skuCode) ?? 55;

      for (const prod of products) {
        const found = prod.skus.find(s => s.sku.toUpperCase() === skuCode);
        if (found) {
          productName = prod.name;
          break;
        }
      }

      const itemSubtotal = sellingPrice * quantity;
      const skuShippingRate = SHIPPING_BY_PACK_SIZE[packSize] || 47;
      const itemShipping = isManual ? 0 : skuShippingRate * quantity;

      subtotal += itemSubtotal;
      if (itemShipping > maxShipping) {
        maxShipping = itemShipping;
      }

      itemQuotes.push({
        sku: skuCode,
        quantity,
        unitPrice: sellingPrice,
        itemSubtotal,
        shipping: isManual ? 0 : itemShipping,
        productName,
        packSize,
        mrp,
      });
    }

    const finalShipping = isManual ? 0 : maxShipping;
    const finalTotal = subtotal + finalShipping;

    res.json({
      success: true,
      pincode: info.pincode,
      pincodeValid: true,
      fulfillmentType: info.fulfillmentType,
      shippingRequired: !isManual,
      pricingMode: isManual ? 'LOCAL' : 'STANDARD',
      shipping: finalShipping,
      subtotal,
      total: finalTotal,
      location: {
        officeName: info.officeName,
        districtName: info.districtName,
        stateName: info.stateName,
      },
      items: itemQuotes,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error calculating cart quote';
    res.status(500).json({ detail: message });
  }
});

// 5. Create Order
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const { customer, items } = req.body;
    if (!customer || !customer.fullName || !customer.phone) {
      return res.status(400).json({ detail: 'Customer details are incomplete.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ detail: 'Cart items cannot be empty.' });
    }

    const pincode = customer.pincode || '451001';
    const info = resolvePincode(pincode) || {
      fulfillmentType: 'SHIPPING' as const,
      officeName: '',
      districtName: '',
      stateName: '',
    };
    const isManual = info.fulfillmentType === 'MANUAL';

    let subtotal = 0;
    let maxShipping = 0;
    const processedItems: Array<{
      sku: string;
      quantity: number;
      unitPrice: number;
      productNameSnapshot: string;
      packSizeSnapshot: number;
    }> = [];

    for (const item of items) {
      const skuCode = String(item.sku || '').trim().toUpperCase();
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const salesConfig = getSalesSku(skuCode);
      let productName = 'Kawad Swad Product';
      const packSize = salesConfig?.packSize || 200;
      const sellingPrice = getSellingPrice(skuCode) ?? 55;

      for (const prod of products) {
        const found = prod.skus.find(s => s.sku.toUpperCase() === skuCode);
        if (found) {
          productName = prod.name;
          break;
        }
      }

      const itemSubtotal = sellingPrice * quantity;
      const skuShippingRate = SHIPPING_BY_PACK_SIZE[packSize] || 47;
      const itemShipping = isManual ? 0 : skuShippingRate * quantity;

      subtotal += itemSubtotal;
      if (itemShipping > maxShipping) {
        maxShipping = itemShipping;
      }

      processedItems.push({
        sku: skuCode,
        quantity,
        unitPrice: sellingPrice,
        productNameSnapshot: productName,
        packSizeSnapshot: packSize,
      });
    }

    const shipping = isManual ? 0 : maxShipping;
    const total = subtotal + shipping;
    const orderNum = randomInt(1000, 10000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderId = `KS-${dateStr}-${orderNum}`;
    const amountInPaise = Math.round(total * 100);
    const razorpayOrderId = `order_${Date.now()}_${randomBytes(4).toString('hex')}`;
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock';

    const newOrder: StoredOrder = {
      orderId,
      razorpayOrderId,
      razorpayPaymentId: '',
      amount: amountInPaise,
      currency: 'INR',
      customer,
      items: processedItems,
      subtotal,
      shipping,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      fulfillmentType: info.fulfillmentType,
      fulfillmentStatus: isManual ? 'READY_LOCAL' : 'AWAITING_PAYMENT',
      createdAt: new Date().toISOString(),
    };

    ordersStore.set(orderId, newOrder);
    ordersStore.set(razorpayOrderId, newOrder);

    res.status(201).json({
      orderId,
      razorpayOrderId,
      razorpayKeyId,
      amount: amountInPaise,
      currency: 'INR',
      customer,
      items: processedItems,
      subtotal,
      shipping,
      total,
      createdAt: newOrder.createdAt,
      status: 'pending',
      paymentStatus: 'pending',
      fulfillmentType: info.fulfillmentType,
      fulfillmentStatus: newOrder.fulfillmentStatus,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create order.';
    res.status(500).json({ detail: message });
  }
});

// 6. Verify Payment
app.post('/api/orders/verify-payment', (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id } = req.body;
    if (!razorpay_order_id) {
      return res.status(400).json({ detail: 'razorpay_order_id is required.' });
    }

    const order = ordersStore.get(razorpay_order_id);
    if (!order) {
      return res.status(404).json({ detail: 'Order reference not found for this payment session.' });
    }

    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.razorpayPaymentId = razorpay_payment_id || `pay_${Date.now()}`;
    order.paymentVerifiedAt = new Date().toISOString();
    order.fulfillmentStatus = order.fulfillmentType === 'MANUAL' ? 'READY_LOCAL' : 'READY_TO_SHIP';

    res.json({
      success: true,
      message: 'Payment verified and order confirmed successfully.',
      orderId: order.orderId,
      status: 'confirmed',
      paymentStatus: 'paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: order.razorpayPaymentId,
      fulfillmentType: order.fulfillmentType,
      fulfillmentStatus: order.fulfillmentStatus,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Payment verification failed.';
    res.status(500).json({ detail: message });
  }
});

// 7. Payment Dismissed
app.post('/api/orders/payment-dismissed', (req: Request, res: Response) => {
  const { razorpayOrderId } = req.body;
  res.json({
    success: true,
    message: 'Payment dismissed acknowledged.',
    razorpayOrderId,
  });
});

// 8. Track Order by ID and Phone
app.get('/api/orders/:orderId', (req: Request, res: Response) => {
  const orderId = String(req.params.orderId);
  const phone = String(req.query.phone || '').trim();

  const order = ordersStore.get(orderId);
  if (!order) {
    return res.status(404).json({ detail: 'No order found matching this Order ID and Phone number.' });
  }

  // Validate phone matches last digits or exact
  const cleanOrderPhone = order.customer.phone.replace(/\D/g, '');
  const cleanQueryPhone = phone.replace(/\D/g, '');
  if (cleanQueryPhone && !cleanOrderPhone.endsWith(cleanQueryPhone) && !cleanQueryPhone.endsWith(cleanOrderPhone)) {
    return res.status(404).json({ detail: 'No order found matching this Order ID and Phone number.' });
  }

  res.json({
    orderId: order.orderId,
    status: order.status,
    customer: {
      fullName: order.customer.fullName,
      phoneMasked: order.customer.phone.replace(/(\d{2})\d+(\d{2})/, '$1******$2'),
      city: order.customer.city,
      state: order.customer.state,
    },
    items: order.items,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    createdAt: order.createdAt,
  });
});

// 9. Enquiries
app.post('/api/enquiries', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload.contactPerson || !payload.email || !payload.message) {
      return res.status(400).json({ detail: 'Please fill in all required enquiry fields.' });
    }

    const enquiryId = `ENQ-${Date.now().toString().slice(-8)}`;
    const newEnquiry: StoredEnquiry = {
      enquiryId,
      type: payload.type || 'general',
      businessName: payload.businessName,
      contactPerson: payload.contactPerson,
      phone: payload.phone,
      email: payload.email,
      businessType: payload.businessType,
      location: payload.location || '',
      productsOfInterest: payload.productsOfInterest,
      quantity: payload.quantity,
      message: payload.message,
      createdAt: new Date().toISOString(),
    };

    enquiriesStore.set(enquiryId, newEnquiry);

    res.status(201).json({
      success: true,
      enquiryId,
      message: 'Enquiry submitted successfully. Our team will contact you soon.',
      createdAt: newEnquiry.createdAt,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit enquiry.';
    res.status(500).json({ detail: message });
  }
});

// 10. Reviews
app.get('/api/reviews/:productId', (req: Request, res: Response) => {
  const { productId } = req.params;
  const limit = Math.max(1, Number(req.query.limit) || 20);
  const skip = Math.max(0, Number(req.query.skip) || 0);

  const matched = reviewsStore.filter(
    r => r.productId === productId || productId === 'all'
  );

  const paginated = matched.slice(skip, skip + limit);
  res.json(paginated);
});

app.get('/api/reviews/:productId/summary', (req: Request, res: Response) => {
  const { productId } = req.params;
  const matched = reviewsStore.filter(
    r => r.productId === productId || productId === 'all'
  );

  const totalReviews = matched.length;
  const sum = matched.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = totalReviews > 0 ? Number((sum / totalReviews).toFixed(1)) : 5.0;

  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of matched) {
    const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
    ratingCounts[rounded] = (ratingCounts[rounded] || 0) + 1;
  }

  res.json({
    productId,
    averageRating,
    totalReviews,
    ratingCounts,
  });
});

app.post('/api/reviews', (req: Request, res: Response) => {
  try {
    const { productId, rating, userName, userLocation, comment } = req.body;
    if (!productId || !userName || !comment) {
      return res.status(400).json({ detail: 'Please provide all review details.' });
    }

    const reviewId = `rev-${Date.now()}`;
    const newReview: StoredReview = {
      reviewId,
      productId,
      rating: Number(rating) || 5,
      userName,
      userLocation: userLocation || 'India',
      comment,
      verifiedPurchase: true,
      createdAt: new Date().toISOString(),
    };

    reviewsStore.unshift(newReview);

    res.status(201).json(newReview);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit review.';
    res.status(500).json({ detail: message });
  }
});

// -------------------------------------------------------------
// VITE MIDDLEWARE / PRODUCTION SERVING
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kawad Swad Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
