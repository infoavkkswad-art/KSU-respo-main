/**
 * KAWAD SWAD
 * CENTRAL SALES & PRICING CONFIGURATION
 *
 * This file is the single frontend authority for:
 * - Customer-facing selling prices
 * - MRP
 * - Free shipping
 * - Product/SKU availability
 * - Future offers
 * - Future coupons
 * - Future campaigns
 *
 * IMPORTANT:
 * - No manufacturing costing is stored here.
 * - No dealer/distributor pricing is stored here.
 * - Shipping is already included in sellingPrice.
 * - Website never adds a shipping charge.
 * - Offers/coupons are disabled until explicitly configured.
 */

export type SalesPackSize =
  | 200
  | 500
  | 1000
  | 235;

export type SalesSkuConfig = {
  sku: string;
  packSize: SalesPackSize;

  /**
   * Legal/reference MRP.
   */
  mrp: number | null;

  /**
   * FINAL CUSTOMER-FACING PRICE.
   *
   * Shipping is already included.
   */
  sellingPrice: number | null;

  /**
   * Shipping is always included in sellingPrice.
   * Keep this 0 for all website sales.
   */
  shipping: 0;

  /**
   * Customer-facing shipping policy.
   */
  freeShipping: true;

  /**
   * Whether this SKU can currently be purchased.
   */
  available: boolean;
};

export type SalesOfferType =
  | 'percentage'
  | 'fixed'
  | 'buy_x_get_y'
  | 'bundle';

export type SalesOffer = {
  id: string;
  name: string;
  type: SalesOfferType;

  /**
   * Percentage:
   *   value = percentage discount
   *
   * Fixed:
   *   value = rupee discount
   *
   * Buy X Get Y / Bundle:
   *   value may be used by the future offer engine.
   */
  value: number;

  enabled: boolean;

  startsAt?: string;
  endsAt?: string;

  /**
   * Optional minimum cart value.
   */
  minimumOrderValue?: number;

  /**
   * Optional maximum discount.
   */
  maximumDiscount?: number;

  /**
   * Optional SKU restriction.
   * Empty/undefined means all eligible products.
   */
  skuCodes?: string[];
};

export type SalesCoupon = {
  code: string;

  name: string;

  type: 'percentage' | 'fixed';

  value: number;

  enabled: boolean;

  startsAt?: string;

  endsAt?: string;

  /**
   * Minimum cart value required.
   */
  minimumOrderValue?: number;

  /**
   * Maximum discount allowed.
   */
  maximumDiscount?: number;

  /**
   * Maximum number of uses.
   */
  usageLimit?: number;

  /**
   * Optional per-customer usage limit.
   */
  perCustomerLimit?: number;

  /**
   * Optional SKU restriction.
   * Empty/undefined means all eligible products.
   */
  skuCodes?: string[];
};

export type SalesCampaign = {
  id: string;

  name: string;

  enabled: boolean;

  startsAt?: string;

  endsAt?: string;

  offerIds: string[];

  couponCodes: string[];
};

/**
 * ================================================================
 * CURRENT SHIPPING POLICY
 * ================================================================
 *
 * Shipping is already included in every website selling price.
 *
 * Therefore:
 *
 * sellingPrice = final product price shown to customer
 * shipping = 0
 * freeShipping = true
 */
export const SALES_POLICY = {
  currency: 'INR' as const,

  shippingIncludedInSellingPrice: true,

  freeShipping: true,

  shippingCharge: 0,

  showShippingCharge: false,

  allowNegativePrice: false,

  showCosting: false,

  showProfit: false,

  showDealerPrice: false,

  showDistributorPrice: false,

  showFactoryPrice: false,

  showAutomaticDiscount: false,
} as const;

/**
 * ================================================================
 * CURRENT SKU PRICING
 * ================================================================
 *
 * FINAL WEBSITE PRICES PROVIDED FOR KAWAD SWAD.
 *
 * IMPORTANT:
 * These selling prices already include shipping.
 */
export const SALES_SKUS: Record<
  string,
  SalesSkuConfig
> = {
  /* ==============================================================
     MOONG MASTER
  ============================================================== */

  'KS-MMP-200': {
    sku: 'KS-MMP-200',
    packSize: 200,
    mrp: 110,
    sellingPrice: 102,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-MMP-500': {
    sku: 'KS-MMP-500',
    packSize: 500,
    mrp: 249,
    sellingPrice: 211,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-MMP-1000': {
    sku: 'KS-MMP-1000',
    packSize: 1000,
    mrp: 499,
    sellingPrice: 425,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  /* ==============================================================
     MOONG GARLIC
  ============================================================== */

  'KS-MGP-200': {
    sku: 'KS-MGP-200',
    packSize: 200,
    mrp: 125,
    sellingPrice: 107,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-MGP-500': {
    sku: 'KS-MGP-500',
    packSize: 500,
    mrp: 309,
    sellingPrice: 216,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-MGP-1000': {
    sku: 'KS-MGP-1000',
    packSize: 1000,
    mrp: 619,
    sellingPrice: 440,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  /* ==============================================================
     MOONG JEERA
  ============================================================== */

  'KS-MJP-200': {
    sku: 'KS-MJP-200',
    packSize: 200,
    mrp: 109,
    sellingPrice: 112,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-MJP-500': {
    sku: 'KS-MJP-500',
    packSize: 500,
    mrp: 279,
    sellingPrice: 226,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-MJP-1000': {
    sku: 'KS-MJP-1000',
    packSize: 1000,
    mrp: 559,
    sellingPrice: 455,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  /* ==============================================================
     MOONG PUDHINA
  ============================================================== */

  'KS-MPP-200': {
    sku: 'KS-MPP-200',
    packSize: 200,
    mrp: 105,
    sellingPrice: 107,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-MPP-500': {
    sku: 'KS-MPP-500',
    packSize: 500,
    mrp: 265,
    sellingPrice: 216,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-MPP-1000': {
    sku: 'KS-MPP-1000',
    packSize: 1000,
    mrp: 529,
    sellingPrice: 435,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  /* ==============================================================
     MOONG GREEN CHILLI
  ============================================================== */

  'KS-MGCP-200': {
    sku: 'KS-MGCP-200',
    packSize: 200,
    mrp: 105,
    sellingPrice: 107,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-MGCP-500': {
    sku: 'KS-MGCP-500',
    packSize: 500,
    mrp: 265,
    sellingPrice: 216,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-MGCP-1000': {
    sku: 'KS-MGCP-1000',
    packSize: 1000,
    mrp: 529,
    sellingPrice: 435,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  /* ==============================================================
     MOONG KASURI METHI
  ============================================================== */

  'KS-MKMP-200': {
    sku: 'KS-MKMP-200',
    packSize: 200,
    mrp: 109,
    sellingPrice: 107,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-MKMP-500': {
    sku: 'KS-MKMP-500',
    packSize: 500,
    mrp: 229,
    sellingPrice: 221,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-MKMP-1000': {
    sku: 'KS-MKMP-1000',
    packSize: 1000,
    mrp: 559,
    sellingPrice: 450,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  /* ==============================================================
     MOONG PUNJABI MASALA
  ============================================================== */

  'KS-MPMP-200': {
    sku: 'KS-MPMP-200',
    packSize: 200,
    mrp: 119,
    sellingPrice: 107,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-MPMP-500': {
    sku: 'KS-MPMP-500',
    packSize: 500,
    mrp: 299,
    sellingPrice: 216,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-MPMP-1000': {
    sku: 'KS-MPMP-1000',
    packSize: 1000,
    mrp: 599,
    sellingPrice: 435,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  /* ==============================================================
     CHANA CHOTU
  ============================================================== */

  'KS-CCP-200': {
    sku: 'KS-CCP-200',
    packSize: 200,
    mrp: 110,
    sellingPrice: 102,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-CCP-500': {
    sku: 'KS-CCP-500',
    packSize: 500,
    mrp: 249,
    sellingPrice: 211,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-CCP-1000': {
    sku: 'KS-CCP-1000',
    packSize: 1000,
    mrp: 499,
    sellingPrice: 425,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  /* ==============================================================
     CHANA GARLIC
  ============================================================== */

  'KS-CGP-200': {
    sku: 'KS-CGP-200',
    packSize: 200,
    mrp: 125,
    sellingPrice: 107,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-CGP-500': {
    sku: 'KS-CGP-500',
    packSize: 500,
    mrp: 309,
    sellingPrice: 221,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-CGP-1000': {
    sku: 'KS-CGP-1000',
    packSize: 1000,
    mrp: 619,
    sellingPrice: 450,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  /* ==============================================================
     CHANA KHATA MITHA
  ============================================================== */

  'KS-CKM-200': {
    sku: 'KS-CKM-200',
    packSize: 200,
    mrp: 99,
    sellingPrice: 107,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-CKM-500': {
    sku: 'KS-CKM-500',
    packSize: 500,
    mrp: 249,
    sellingPrice: 216,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-CKM-1000': {
    sku: 'KS-CKM-1000',
    packSize: 1000,
    mrp: 499,
    sellingPrice: 435,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  /* ==============================================================
     CHANA TOMATO
  ============================================================== */

  'KS-CTP-200': {
    sku: 'KS-CTP-200',
    packSize: 200,
    mrp: 99,
    sellingPrice: 107,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-CTP-500': {
    sku: 'KS-CTP-500',
    packSize: 500,
    mrp: 249,
    sellingPrice: 221,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-CTP-1000': {
    sku: 'KS-CTP-1000',
    packSize: 1000,
    mrp: 499,
    sellingPrice: 450,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  /* ==============================================================
     CHANA PUNJABI MASALA
  ============================================================== */

  'KS-CPM-200': {
    sku: 'KS-CPM-200',
    packSize: 200,
    mrp: 119,
    sellingPrice: 107,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-CPM-500': {
    sku: 'KS-CPM-500',
    packSize: 500,
    mrp: 299,
    sellingPrice: 216,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-CPM-1000': {
    sku: 'KS-CPM-1000',
    packSize: 1000,
    mrp: 599,
    sellingPrice: 435,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  /* ==============================================================
     URAD GURU
  ============================================================== */

  'KS-UGP-200': {
    sku: 'KS-UGP-200',
    packSize: 200,
    mrp: 119,
    sellingPrice: 112,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-UGP-500': {
    sku: 'KS-UGP-500',
    packSize: 500,
    mrp: 299,
    sellingPrice: 231,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-UGP-1000': {
    sku: 'KS-UGP-1000',
    packSize: 1000,
    mrp: 599,
    sellingPrice: 465,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  /* ==============================================================
     URAD GARLIC
  ============================================================== */

  'KS-UGG-200': {
    sku: 'KS-UGG-200',
    packSize: 200,
    mrp: 125,
    sellingPrice: 117,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-UGG-500': {
    sku: 'KS-UGG-500',
    packSize: 500,
    mrp: 319,
    sellingPrice: 241,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  'KS-UGG-1000': {
    sku: 'KS-UGG-1000',
    packSize: 1000,
    mrp: 639,
    sellingPrice: 485,
    shipping: 0,
    freeShipping: true,
    available: true,
  },

  /* ==============================================================
     COMBO
  ============================================================== */

  'KS-COMB-235': {
    sku: 'KS-COMB-235',
    packSize: 235,
    mrp: 199,
    sellingPrice: null,
    shipping: 0,
    freeShipping: true,
    available: false,
  },
};

/**
 * ================================================================
 * OFFERS
 * ================================================================
 *
 * Empty for now.
 *
 * Future offers are added here.
 */
export const SALES_OFFERS: SalesOffer[] = [];

/**
 * ================================================================
 * COUPONS
 * ================================================================
 *
 * Empty for now.
 *
 * Future coupons are added here.
 */
export const SALES_COUPONS: SalesCoupon[] = [];

/**
 * ================================================================
 * CAMPAIGNS
 * ================================================================
 *
 * Empty for now.
 */
export const SALES_CAMPAIGNS: SalesCampaign[] = [];

/**
 * ================================================================
 * HELPERS
 * ================================================================
 */

export function getSalesSku(
  sku: string,
): SalesSkuConfig | undefined {
  return SALES_SKUS[sku];
}

export function getSellingPrice(
  sku: string,
): number | null {
  return SALES_SKUS[sku]?.sellingPrice ?? null;
}

export function isSkuAvailable(
  sku: string,
): boolean {
  const config = SALES_SKUS[sku];

  return Boolean(
    config &&
      config.available &&
      config.sellingPrice !== null,
  );
}

export function isOfferActive(
  offer: SalesOffer,
  now = new Date(),
): boolean {
  if (!offer.enabled) {
    return false;
  }

  const timestamp = now.getTime();

  if (offer.startsAt) {
    const startsAt = new Date(
      offer.startsAt,
    ).getTime();

    if (
      Number.isFinite(startsAt) &&
      timestamp < startsAt
    ) {
      return false;
    }
  }

  if (offer.endsAt) {
    const endsAt = new Date(
      offer.endsAt,
    ).getTime();

    if (
      Number.isFinite(endsAt) &&
      timestamp > endsAt
    ) {
      return false;
    }
  }

  return true;
}

export function isCouponActive(
  coupon: SalesCoupon,
  now = new Date(),
): boolean {
  if (!coupon.enabled) {
    return false;
  }

  const timestamp = now.getTime();

  if (coupon.startsAt) {
    const startsAt = new Date(
      coupon.startsAt,
    ).getTime();

    if (
      Number.isFinite(startsAt) &&
      timestamp < startsAt
    ) {
      return false;
    }
  }

  if (coupon.endsAt) {
    const endsAt = new Date(
      coupon.endsAt,
    ).getTime();

    if (
      Number.isFinite(endsAt) &&
      timestamp > endsAt
    ) {
      return false;
    }
  }

  return true;
}

export function getActiveOffers(
  now = new Date(),
): SalesOffer[] {
  return SALES_OFFERS.filter((offer) =>
    isOfferActive(offer, now),
  );
}

export function getActiveCoupons(
  now = new Date(),
): SalesCoupon[] {
  return SALES_COUPONS.filter((coupon) =>
    isCouponActive(coupon, now),
  );
}

/**
 * ================================================================
 * CONFIG VALIDATION
 * ================================================================
 *
 * Useful during development/build checks.
 */
export function validateSalesConfig(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const [sku, config] of Object.entries(
    SALES_SKUS,
  )) {
    if (config.sku !== sku) {
      errors.push(
        `SKU key mismatch: ${sku}`,
      );
    }

    if (config.shipping !== 0) {
      errors.push(
        `${sku}: shipping must be 0.`,
      );
    }

    if (!config.freeShipping) {
      errors.push(
        `${sku}: freeShipping must be true.`,
      );
    }

    if (
      config.sellingPrice !== null &&
      config.sellingPrice < 0
    ) {
      errors.push(
        `${sku}: sellingPrice cannot be negative.`,
      );
    }

    if (
      config.mrp !== null &&
      config.mrp < 0
    ) {
      errors.push(
        `${sku}: MRP cannot be negative.`,
      );
    }

    if (
      config.available &&
      config.sellingPrice === null
    ) {
      errors.push(
        `${sku}: available SKU must have a sellingPrice.`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
