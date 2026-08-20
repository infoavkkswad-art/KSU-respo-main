/**
 * KAWAD SWAD 2.0 — SALES CONFIGURATION
 * Single commercial source of truth for website pricing.
 *
 * IMPORTANT:
 * - sellingPrice = lowest/local product price before shipping
 * - shipping = configured shipping component
 * - websitePrice = sellingPrice + shipping
 *
 * Stage 2.1:
 * - Existing commercial values are preserved.
 * - Manual/local eligibility is validated for 200g packs.
 * - Prices are NOT silently changed here.
 */

export interface SalesSkuConfig {
  sku: string;
  packSize: number;
  sellingPrice: number;
  shipping: number;
  websitePrice: number;
}

export const SALES_CONFIG: SalesSkuConfig[] = [
  { sku: 'KS-MP-MAS-200', packSize: 200, sellingPrice: 55, shipping: 47, websitePrice: 102 },
  { sku: 'KS-MP-MAS-500', packSize: 500, sellingPrice: 155, shipping: 47, websitePrice: 202 },
  { sku: 'KS-MP-MAS-1000', packSize: 1000, sellingPrice: 250, shipping: 47, websitePrice: 297 },

  { sku: 'KS-MP-GAR-200', packSize: 200, sellingPrice: 65, shipping: 47, websitePrice: 112 },
  { sku: 'KS-MP-GAR-500', packSize: 500, sellingPrice: 165, shipping: 47, websitePrice: 212 },
  { sku: 'KS-MP-GAR-1000', packSize: 1000, sellingPrice: 310, shipping: 47, websitePrice: 357 },

  { sku: 'KS-MP-JEE-200', packSize: 200, sellingPrice: 60, shipping: 47, websitePrice: 107 },
  { sku: 'KS-MP-JEE-500', packSize: 500, sellingPrice: 140, shipping: 47, websitePrice: 187 },
  { sku: 'KS-MP-JEE-1000', packSize: 1000, sellingPrice: 280, shipping: 47, websitePrice: 327 },

  { sku: 'KS-MP-PUD-200', packSize: 200, sellingPrice: 60, shipping: 47, websitePrice: 107 },
  { sku: 'KS-MP-PUD-500', packSize: 500, sellingPrice: 135, shipping: 47, websitePrice: 182 },
  { sku: 'KS-MP-PUD-1000', packSize: 1000, sellingPrice: 265, shipping: 47, websitePrice: 312 },

  { sku: 'KS-MP-GRC-200', packSize: 200, sellingPrice: 60, shipping: 47, websitePrice: 107 },
  { sku: 'KS-MP-GRC-500', packSize: 500, sellingPrice: 135, shipping: 47, websitePrice: 182 },
  { sku: 'KS-MP-GRC-1000', packSize: 1000, sellingPrice: 265, shipping: 47, websitePrice: 312 },

  { sku: 'KS-MP-KSM-200', packSize: 200, sellingPrice: 60, shipping: 47, websitePrice: 107 },
  { sku: 'KS-MP-KSM-500', packSize: 500, sellingPrice: 145, shipping: 47, websitePrice: 192 },
  { sku: 'KS-MP-KSM-1000', packSize: 1000, sellingPrice: 280, shipping: 47, websitePrice: 327 },

  { sku: 'KS-MP-PUN-200', packSize: 200, sellingPrice: 60, shipping: 47, websitePrice: 107 },
  { sku: 'KS-MP-PUN-500', packSize: 500, sellingPrice: 140, shipping: 47, websitePrice: 187 },
  { sku: 'KS-MP-PUN-1000', packSize: 1000, sellingPrice: 275, shipping: 47, websitePrice: 322 },

  { sku: 'KS-MP-KHM-200', packSize: 200, sellingPrice: 60, shipping: 47, websitePrice: 107 },
  { sku: 'KS-MP-KHM-500', packSize: 500, sellingPrice: 140, shipping: 47, websitePrice: 187 },
  { sku: 'KS-MP-KHM-1000', packSize: 1000, sellingPrice: 275, shipping: 47, websitePrice: 322 },

  { sku: 'KS-CP-CHO-200', packSize: 200, sellingPrice: 55, shipping: 47, websitePrice: 102 },
  { sku: 'KS-CP-CHO-500', packSize: 500, sellingPrice: 125, shipping: 47, websitePrice: 172 },
  { sku: 'KS-CP-CHO-1000', packSize: 1000, sellingPrice: 250, shipping: 47, websitePrice: 297 },

  { sku: 'KS-CP-GAR-200', packSize: 200, sellingPrice: 65, shipping: 47, websitePrice: 112 },
  { sku: 'KS-CP-GAR-500', packSize: 500, sellingPrice: 165, shipping: 47, websitePrice: 212 },
  { sku: 'KS-CP-GAR-1000', packSize: 1000, sellingPrice: 310, shipping: 47, websitePrice: 357 },

  { sku: 'KS-CP-KHM-200', packSize: 200, sellingPrice: 60, shipping: 47, websitePrice: 107 },
  { sku: 'KS-CP-KHM-500', packSize: 500, sellingPrice: 140, shipping: 47, websitePrice: 187 },
  { sku: 'KS-CP-KHM-1000', packSize: 1000, sellingPrice: 275, shipping: 47, websitePrice: 322 },

  { sku: 'KS-CP-TOM-200', packSize: 200, sellingPrice: 60, shipping: 47, websitePrice: 107 },
  { sku: 'KS-CP-TOM-500', packSize: 500, sellingPrice: 140, shipping: 47, websitePrice: 187 },
  { sku: 'KS-CP-TOM-1000', packSize: 1000, sellingPrice: 275, shipping: 47, websitePrice: 322 },

  { sku: 'KS-CP-PUN-200', packSize: 200, sellingPrice: 60, shipping: 47, websitePrice: 107 },
  { sku: 'KS-CP-PUN-500', packSize: 500, sellingPrice: 140, shipping: 47, websitePrice: 187 },
  { sku: 'KS-CP-PUN-1000', packSize: 1000, sellingPrice: 275, shipping: 47, websitePrice: 322 },

  { sku: 'KS-UP-GUR-200', packSize: 200, sellingPrice: 65, shipping: 47, websitePrice: 112 },
  { sku: 'KS-UP-GUR-500', packSize: 500, sellingPrice: 155, shipping: 47, websitePrice: 202 },
  { sku: 'KS-UP-GUR-1000', packSize: 1000, sellingPrice: 300, shipping: 47, websitePrice: 347 },

  { sku: 'KS-UP-GAR-200', packSize: 200, sellingPrice: 75, shipping: 47, websitePrice: 122 },
  { sku: 'KS-UP-GAR-500', packSize: 500, sellingPrice: 175, shipping: 47, websitePrice: 222 },
  { sku: 'KS-UP-GAR-1000', packSize: 1000, sellingPrice: 320, shipping: 47, websitePrice: 367 },

  { sku: 'KS-MAS-MOO-105', packSize: 105, sellingPrice: 99, shipping: 47, websitePrice: 146 },
  { sku: 'KS-MAS-CHA-130', packSize: 130, sellingPrice: 99, shipping: 47, websitePrice: 146 },
];

export const MANUAL_PRICE_RULE = {
  minExclusive: 60,
  maxExclusive: 75,
  applicablePackSize: 200,
} as const;

export function getSalesConfigBySku(
  sku: string,
): SalesSkuConfig | undefined {
  return SALES_CONFIG.find(
    (item) => item.sku === sku,
  );
}

export function getLowestPrice(
  sku: string,
): number | null {
  const config = getSalesConfigBySku(sku);

  return config
    ? config.sellingPrice
    : null;
}

export function getWebsitePrice(
  sku: string,
): number | null {
  const config = getSalesConfigBySku(sku);

  return config
    ? config.websitePrice
    : null;
}

export function isManualPriceEligible(
  sku: string,
): boolean {
  const config = getSalesConfigBySku(sku);

  if (!config) {
    return false;
  }

  if (
    config.packSize !==
    MANUAL_PRICE_RULE.applicablePackSize
  ) {
    return true;
  }

  return (
    config.sellingPrice >
      MANUAL_PRICE_RULE.minExclusive &&
    config.sellingPrice <
      MANUAL_PRICE_RULE.maxExclusive
  );
}

export function getShippingCharge(
  sku: string,
): number {
  const config = getSalesConfigBySku(sku);

  return config
    ? config.shipping
    : 0;
}

export function calculateWebsitePrice(
  sku: string,
): number | null {
  const config = getSalesConfigBySku(sku);

  if (!config) {
    return null;
  }

  return (
    config.sellingPrice +
    config.shipping
  );
}
