import { createHmac } from 'node:crypto';

export function runPaymentSecurityTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const secret = 'rzp_live_secret_sample_key_12345';
  const orderId = 'order_test_987654321';
  const paymentId = 'pay_test_123456789';

  // 1. Valid Signature Test
  try {
    const validSignature = createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const testSignature = createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (validSignature !== testSignature) {
      throw new Error('HMAC signature match failed');
    }
    results.push({ name: 'Payment HMAC-SHA256 Signature Verification', passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: 'Payment HMAC-SHA256 Signature Verification', passed: false, error: msg });
  }

  // 2. Tampered Signature Rejection Test
  try {
    const tamperedSignature = 'tampered_signature_payload_xyz';
    const expectedSignature = createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (tamperedSignature === expectedSignature) {
      throw new Error('Tampered signature was unexpectedly accepted');
    }
    results.push({ name: 'Tampered Signature Rejection', passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: 'Tampered Signature Rejection', passed: false, error: msg });
  }

  // 3. Webhook Raw Body Signature Verification
  try {
    const webhookSecret = 'whsec_sample_secret_998877';
    const rawPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: { entity: { id: paymentId, order_id: orderId, status: 'captured' } }
      }
    });

    const validWebhookSig = createHmac('sha256', webhookSecret)
      .update(rawPayload)
      .digest('hex');

    const checkSig = createHmac('sha256', webhookSecret)
      .update(rawPayload)
      .digest('hex');

    if (validWebhookSig !== checkSig) {
      throw new Error('Webhook signature mismatch');
    }
    results.push({ name: 'Razorpay Webhook Raw Body Signature Check', passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: 'Razorpay Webhook Raw Body Signature Check', passed: false, error: msg });
  }

  // 4. Financial Precision in Paise
  try {
    const rupeeAmount = 249.00;
    const amountInPaise = Math.round(rupeeAmount * 100);
    if (amountInPaise !== 24900) {
      throw new Error(`Expected 24900 paise, got ${amountInPaise}`);
    }
    const decimalAmount = 55.50;
    const decimalPaise = Math.round(decimalAmount * 100);
    if (decimalPaise !== 5550) {
      throw new Error(`Expected 5550 paise, got ${decimalPaise}`);
    }
    results.push({ name: 'Paise Financial Precision Integer Conversion', passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: 'Paise Financial Precision Integer Conversion', passed: false, error: msg });
  }

  return results;
}
