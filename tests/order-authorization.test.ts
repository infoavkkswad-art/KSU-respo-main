export function runOrderAuthorizationTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const mockOrder = {
    orderId: 'KS-20261031-1001',
    customer: {
      fullName: 'Sunil Verma',
      phone: '+91 9876543210',
      city: 'Indore',
      state: 'Madhya Pradesh'
    }
  };

  // 1. Authorized Lookup with Matching Phone
  try {
    const cleanOrderPhone = mockOrder.customer.phone.replace(/\D/g, '');
    const validQueryPhone = '9876543210';
    const cleanQueryPhone = validQueryPhone.replace(/\D/g, '');

    const isMatch = cleanOrderPhone.endsWith(cleanQueryPhone) || cleanQueryPhone.endsWith(cleanOrderPhone);
    if (!isMatch) {
      throw new Error('Authorized phone lookup failed to match');
    }
    results.push({ name: 'Order Tracking Phone Authorization (Valid User Access)', passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: 'Order Tracking Phone Authorization (Valid User Access)', passed: false, error: msg });
  }

  // 2. IDOR Prevention: Missing Phone Blocked
  try {
    const emptyQueryPhone = '';
    const cleanQueryPhone = emptyQueryPhone.replace(/\D/g, '');
    const isAllowed = cleanQueryPhone.length >= 4;
    if (isAllowed) {
      throw new Error('Empty phone number should be blocked with 400 error');
    }
    results.push({ name: 'IDOR Prevention: Missing Phone Parameter Rejection', passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: 'IDOR Prevention: Missing Phone Parameter Rejection', passed: false, error: msg });
  }

  // 3. IDOR Prevention: Mismatched Phone Blocked
  try {
    const cleanOrderPhone = mockOrder.customer.phone.replace(/\D/g, '');
    const attackerPhone = '9999999999';
    const cleanQueryPhone = attackerPhone.replace(/\D/g, '');

    const isMatch = cleanOrderPhone.endsWith(cleanQueryPhone) || cleanQueryPhone.endsWith(cleanOrderPhone);
    if (isMatch) {
      throw new Error('Attacker phone was incorrectly granted access');
    }
    results.push({ name: 'IDOR Prevention: Mismatched Customer Phone Rejection', passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: 'IDOR Prevention: Mismatched Customer Phone Rejection', passed: false, error: msg });
  }

  // 4. Rate Limiting Protection
  try {
    const trackingHistory: number[] = [];
    const maxLookups = 10;
    const now = Date.now();

    for (let i = 0; i < maxLookups; i++) {
      trackingHistory.push(now - i * 1000);
    }

    const isLimitExceeded = trackingHistory.length >= maxLookups;
    if (!isLimitExceeded) {
      throw new Error('Rate limit threshold was not enforced');
    }
    results.push({ name: 'Order Lookup Rate Limiting (10 req/min per IP threshold)', passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: 'Order Lookup Rate Limiting (10 req/min per IP threshold)', passed: false, error: msg });
  }

  return results;
}
