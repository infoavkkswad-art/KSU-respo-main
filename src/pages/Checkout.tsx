const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Inside order submission handler:
const orderResponse = await apiClient.createOrder({
  customer,
  items,
  idempotencyKey: generatedIdempotencyKey,
});

const scriptLoaded = await loadRazorpayScript();
if (!scriptLoaded) {
  throw new Error('Razorpay payment SDK failed to load. Please check your internet connection.');
}

const options = {
  key: orderResponse.razorpayKeyId,
  amount: orderResponse.amount,
  currency: orderResponse.currency,
  name: 'Kawad Swad Udhyog',
  description: 'Authentic Traditional Papad Order',
  order_id: orderResponse.razorpayOrderId,
  handler: async function (response: any) {
    try {
      const verifyRes = await apiClient.verifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });

      setCompletedOrder({
        orderId: verifyRes.orderId,
        customer: orderResponse.customer,
        items: orderResponse.items,
        subtotal: orderResponse.subtotal,
        totalShipping: orderResponse.shipping,
        total: orderResponse.total,
        timestamp: orderResponse.createdAt,
        status: 'confirmed',
      });
      clearCart();
      setIsSubmitting(false);
    } catch (err: any) {
      setError(err.message || 'Payment verification failed.');
      setIsSubmitting(false);
    }
  },
  modal: {
    ondismiss: function () {
      setIsSubmitting(false);
      setError('Payment was cancelled or dismissed. You can retry anytime.');
    }
  },
  prefill: {
    name: customer.fullName,
    email: customer.email || 'kswadu2025@gmail.com',
    contact: customer.phone,
  },
  theme: {
    color: '#D97706',
  },
};

const rzp = new (window as any).Razorpay(options);
rzp.open();
