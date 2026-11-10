import { runCommercialDataTests } from './commercial-data.test';
import { runPaymentSecurityTests } from './payment-security.test';
import { runOrderAuthorizationTests } from './order-authorization.test';
import { runReviewModerationTests } from './review-moderation.test';
import { runCartFulfillmentTests } from './cart-fulfillment.test';
import { runAnalyticsIntegrationTests } from './analytics-integration.test';

async function main() {
  console.log('====================================================');
  console.log('  KAWAD SWAD 2.0 AUTOMATED REGRESSION & AUDIT SUITE');
  console.log('====================================================\n');

  const suiteResults = [
    { suite: 'Commercial Data Integrity', tests: runCommercialDataTests() },
    { suite: 'Payment Security & Signatures', tests: runPaymentSecurityTests() },
    { suite: 'Order Authorization & IDOR', tests: runOrderAuthorizationTests() },
    { suite: 'Review Moderation & Trust', tests: runReviewModerationTests() },
    { suite: 'Cart Calculations & Fulfilment', tests: runCartFulfillmentTests() },
    { suite: 'GA4 Analytics & Privacy Consent', tests: runAnalyticsIntegrationTests() },
  ];

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const group of suiteResults) {
    console.log(`\n--- [Suite: ${group.suite}] ---`);
    for (const test of group.tests) {
      totalTests++;
      if (test.passed) {
        passedTests++;
        console.log(`  ✓ PASS: ${test.name}`);
      } else {
        failedTests++;
        console.error(`  ✗ FAIL: ${test.name} - ${test.error}`);
      }
    }
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test runner encountered an unexpected error:', err);
  process.exit(1);
});
