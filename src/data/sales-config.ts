/* ============================================================================
 * KAWAD SWAD
 * CENTRAL SALES / COMMERCIAL MASTER
 * ============================================================================
 *
 * IMPORTANT:
 *
 * This file is the SINGLE SOURCE OF TRUTH for customer-facing SKU
 * commercial data.
 *
 * Product information such as:
 * - name
 * - slug
 * - description
 * - ingredients
 * - images
 *
 * belongs in products.ts.
 *
 * Commercial information such as:
 * - MRP
 * - website selling price
 * - shipping
 * - availability
 *
 * belongs ONLY here.
 *
 * FINAL WEBSITE PRICE IS NEVER STORED MANUALLY.
 *
 * finalWebsitePrice =
 *   sellingPrice + shipping
 *
 * This prevents price duplication and calculation mismatches.
 * ========================================================================== */

/* ============================================================================
 * TYPES
 * ========================================================================== */

export type PackSize =
  | 200
  | 500
  | 1000
  | 235;

export type SalesSkuConfig = {
  sku: string;

  packSize: PackSize;

  /*
   * Printed / declared MRP.
   */
  mrp: number | null;

  /*
   * Product selling price BEFORE shipping.
   *
   * This is the value you update when changing the product's
   * base website selling price.
   */
  sellingPrice: number | null;

  /*
   * Customer shipping charge for this SKU.
   */
  shipping: number;

  /*
   * Kept for compatibility with existing project code.
   *
   * It is derived from shipping rather than manually controlled.
   */
  freeShipping: boolean;

  /*
   * Whether this SKU can currently be purchased.
   */
  available: boolean;
};

/* ============================================================================
 * OFFERS
 * ========================================================================== */

export type SalesOffer = {
  id: string;
  name: string;

  type:
    | 'percentage'
    | 'fixed';

  value: number;

  enabled: boolean;

  startsAt?: string;
  endsAt?: string;

  minimumOrderValue?: number;
  maximumDiscount?: number;

  /*
   * Empty / undefined = all eligible SKUs.
   */
  skuCodes?: string[];
};

/* ============================================================================
 * COUPONS
 * ========================================================================== */

export type SalesCoupon = {
  code: string;
  name: string;

  type:
    | 'percentage'
    | 'fixed';

  value: number;

  enabled: boolean;

  startsAt?: string;
  endsAt?: string;

  minimumOrderValue?: number;
  maximumDiscount?: number;

  usageLimit?: number;
  perCustomerLimit?: number;

  /*
   * Empty / undefined = all eligible SKUs.
   */
  skuCodes?: string[];
};

/* ============================================================================
 * CAMPAIGNS
 * ========================================================================== */

export type SalesCampaign = {
  id: string;
  name: string;

  enabled: boolean;

  startsAt?: string;
  endsAt?: string;

  offerIds: string[];
  couponCodes: string[];
};

/* ============================================================================
 * SALES POLICY
 * ========================================================================== */

export const SALES_POLICY = {
  currency: 'INR' as const,

  /*
   * IMPORTANT:
   *
   * Selling price and shipping are stored separately.
   *
   * Final customer price is calculated as:
   *
   * sellingPrice + shipping
   */
  shippingIncludedInSellingPrice:
    false,

  /*
   * Shipping is not globally free.
   *
   * Each SKU has its own shipping value.
   */
  freeShipping: false,

  /*
   * There is no single global shipping charge.
   * Shipping comes from the SKU record.
   */
  shippingCharge: 0,

  /*
   * Shipping may be displayed separately in the cart/checkout.
   */
  showShippingCharge: true,

  allowNegativePrice: false,

  showCosting: false,

  showProfit: false,

  showDealerPrice: false,

  showDistributorPrice: false,

  showFactoryPrice: false,

  /*
   * Automatic discounts remain disabled.
   */
  showAutomaticDiscount: false,

  /*
   * Offers and coupons remain disabled until explicitly configured.
   */
  offersEnabled: false,

  couponsEnabled: false,

  campaignsEnabled: false,
} as const;

/* ============================================================================
 * CENTRAL 43-SKU COMMERCIAL MASTER
 * ============================================================================
 *
 * ONLY THIS TABLE SHOULD BE EDITED FOR NORMAL WEBSITE PRICE / SHIPPING
 * CHANGES.
 *
 * finalWebsitePrice is calculated automatically.
 * ========================================================================== */

export const SALES_SKUS: Record<
  string,
  SalesSkuConfig
> = {
  /* ==========================================================================
     MOONG MASTER
     ======================================================================== */

  'KS-MMP-200': {
    sku: 'KS-MMP-200',
    packSize: 200,
    mrp: 110,
    sellingPrice: 55,
    shipping: 47,
    freeShipping: false,
    available: true,
  },

  'KS-MMP-500': {
    sku: 'KS-MMP-500',
    packSize: 500,
    mrp: 249,
    sellingPrice: 140,
    shipping: 71,
    freeShipping: false,
    available: true,
  },

  'KS-MMP-1000': {
    sku: 'KS-MMP-1000',
    packSize: 1000,
    mrp: 499,
    sellingPrice: 275,
    shipping: 150,
    freeShipping: false,
    available: true,
  },

  /* ==========================================================================
     MOONG GARLIC
     ======================================================================== */

  'KS-MGP-200': {
    sku: 'KS-MGP-200',
    packSize: 200,
    mrp: 125,
    sellingPrice: 60,
    shipping: 47,
    freeShipping: false,
    available: true,
  },

  'KS-MGP-500': {
    sku: 'KS-MGP-500',
    packSize: 500,
    mrp: 309,
    sellingPrice: 145,
    shipping: 71,
    freeShipping: false,
    available: true,
  },

  'KS-MGP-1000': {
    sku: 'KS-MGP-1000',
    packSize: 1000,
    mrp: 619,
    sellingPrice: 290,
    shipping: 150,
    freeShipping: false,
    available: true,
  },

  /* ==========================================================================
     MOONG JEERA
     ======================================================================== */

  'KS-MJP-200': {
    sku: 'KS-MJP-200',
    packSize: 200,
    mrp: 109,
    sellingPrice: 65,
    shipping: 47,
    freeShipping: false,
    available: true,
  },

  'KS-MJP-500': {
    sku: 'KS-MJP-500',
    packSize: 500,
    mrp: 279,
    sellingPrice: 155,
    shipping: 71,
    freeShipping: false,
    available: true,
  },

  'KS-MJP-1000': {
    sku: 'KS-MJP-1000',
    packSize: 1000,
    mrp: 559,
    sellingPrice: 305,
    shipping: 150,
    freeShipping: false,
    available: true,
  },

  /* ==========================================================================
     MOONG PUDHINA
     ======================================================================== */

  'KS-MPP-200': {
    sku: 'KS-MPP-200',
    packSize: 200,
    mrp: 105,
    sellingPrice: 60,
    shipping: 47,
    freeShipping: false,
    available: true,
  },

  'KS-MPP-500': {
    sku: 'KS-MPP-500',
    packSize: 500,
    mrp: 265,
    sellingPrice: 145,
    shipping: 71,
    freeShipping: false,
    available: true,
  },

  'KS-MPP-1000': {
    sku: 'KS-MPP-1000',
    packSize: 1000,
    mrp: 529,
    sellingPrice: 285,
    shipping: 150,
    freeShipping: false,
    available: true,
  },

  /* ==========================================================================
     MOONG GREEN CHILLI
     ======================================================================== */

  'KS-MGCP-200': {
    sku: 'KS-MGCP-200',
    packSize: 200,
    mrp: 105,
    sellingPrice: 60,
    shipping: 47,
    freeShipping: false,
    available: true,
  },

  'KS-MGCP-500': {
    sku: 'KS-MGCP-500',
    packSize: 500,
    mrp: 265,
    sellingPrice: 145,
    shipping: 71,
    freeShipping: false,
    available: true,
  },

  'KS-MGCP-1000': {
    sku: 'KS-MGCP-1000',
    packSize: 1000,
    mrp: 529,
    sellingPrice: 285,
    shipping: 150,
    freeShipping: false,
    available: true,
  },

  /* ==========================================================================
     MOONG KASURI METHI
     ======================================================================== */

  'KS-MKMP-200': {
    sku: 'KS-MKMP-200',
    packSize: 200,
    mrp: 109,
    sellingPrice: 60,
    shipping: 47,
    freeShipping: false,
    available: true,
  },

  'KS-MKMP-500': {
    sku: 'KS-MKMP-500',
    packSize: 500,
    mrp: 229,
    sellingPrice: 150,
    shipping: 71,
    freeShipping: false,
    available: true,
  },

  'KS-MKMP-1000': {
    sku: 'KS-MKMP-1000',
    packSize: 1000,
    mrp: 559,
    sellingPrice: 300,
    shipping: 150,
    freeShipping: false,
    available: true,
  },

  /* ==========================================================================
     MOONG PUNJABI MASALA
     ======================================================================== */

  'KS-MPMP-200': {
    sku: 'KS-MPMP-200',
    packSize: 200,
    mrp: 119,
    sellingPrice: 60,
    shipping: 47,
    freeShipping: false,
    available: true,
  },

  'KS-MPMP-500': {
    sku: 'KS-MPMP-500',
    packSize: 500,
    mrp: 299,
    sellingPrice: 145,
    shipping: 71,
    freeShipping: false,
    available: true,
  },

  'KS-MPMP-1000': {
    sku: 'KS-MPMP-1000',
    packSize: 1000,
    mrp: 599,
    sellingPrice: 285,
    shipping: 150,
    freeShipping: false,
    available: true,
  },

  /* ==========================================================================
     CHANA CHOTU
     ======================================================================== */

  'KS-CCP-200': {
    sku: 'KS-CCP-200',
    packSize: 200,
    mrp: 110,
    sellingPrice: 55,
    shipping: 47,
    freeShipping: false,
    available: true,
  },

  'KS-CCP-500': {
    sku: 'KS-CCP-500',
    packSize: 500,
    mrp: 249,
    sellingPrice: 140,
    shipping: 71,
    freeShipping: false,
    available: true,
  },

  'KS-CCP-1000': {
    sku: 'KS-CCP-1000',
    packSize: 1000,
    mrp: 499,
    sellingPrice: 275,
    shipping: 150,
    freeShipping: false,
    available: true,
  },

  /* ==========================================================================
     CHANA GARLIC
     ======================================================================== */

  'KS-CGP-200': {
    sku: 'KS-CGP-200',
    packSize: 200,
    mrp: 125,
    sellingPrice: 60,
    shipping: 47,
    freeShipping: false,
    available: true,
  },

  'KS-CGP-500': {
    sku: 'KS-CGP-500',
    packSize: 500,
    mrp: 309,
    sellingPrice: 150,
    shipping: 71,
    freeShipping: false,
    available: true,
  },

  'KS-CGP-1000': {
    sku: 'KS-CGP-1000',
    packSize: 1000,
    mrp: 619,
    sellingPrice: 300,
    shipping: 150,
    freeShipping: false,
    available: true,
  },

  /* ==========================================================================
     CHANA KHATA MITHA
     ======================================================================== */

  'KS-CKM-200': {
    sku: 'KS-CKM-200',
    packSize: 200,
    mrp: 99,
    sellingPrice: 60,
    shipping: 47,
    freeShipping: false,
    available: true,
  },

  'KS-CKM-500': {
    sku: 'KS-CKM-500',
    packSize: 500,
    mrp: 249,
    sellingPrice: 145,
    shipping: 71,
    freeShipping: false,
    available: true,
  },

  'KS-CKM-1000': {
    sku: 'KS-CKM-1000',
    packSize: 1000,
    mrp: 499,
    sellingPrice: 285,
    shipping: 150,
    freeShipping: false,
    available: true,
  },

  /* ==========================================================================
     CHANA TOMATO
     ======================================================================== */

  'KS-CTP-200': {
    sku: 'KS-CTP-200',
    packSize: 200,
    mrp: 99,
    sellingPrice: 60,
    shipping: 47,
    freeShipping: false,
    available: true,
  },

  'KS-CTP-500': {
    sku: 'KS-CTP-500',
    packSize: 500,
    mrp: 249,
    sellingPrice: 150,
    shipping: 71,
    freeShipping: false,
    available: true,
  },

  'KS-CTP-1000': {
    sku: 'KS-CTP-1000',
    packSize: 1000,
    mrp: 499,
    sellingPrice: 300,
    shipping: 150,
    freeShipping: false,
    available: true,
  },

  /* ==========================================================================
     CHANA PUNJABI MASALA
     ======================================================================== */

  'KS-CPM-200': {
    sku: 'KS-CPM-200',
    packSize: 200,
    mrp: 119,
    sellingPrice: 60,
    shipping: 47,
    freeShipping: false,
    available: true,
  },

  'KS-CPM-500': {
    sku: 'KS-CPM-500',
    packSize: 500,
    mrp: 299,
    sellingPrice: 145,
    shipping: 71,
    freeShipping: false,
    available: true,
  },

  'KS-CPM-1000': {
    sku: 'KS-CPM-1000',
    packSize: 1000,
    mrp: 599,
    sellingPrice: 285,
    shipping: 150,
    freeShipping: false,
    available: true,
  },

  /* ==========================================================================
     URAD GURU
     ======================================================================== */

  'KS-UGP-200': {
    sku: 'KS-UGP-200',
    packSize: 200,
    mrp: 119,
    sellingPrice: 65,
    shipping: 47,
    freeShipping: false,
    available: true,
  },

  'KS-UGP-500': {
    sku: 'KS-UGP-500',
    packSize: 500,
    mrp: 299,
    sellingPrice: 160,
    shipping: 71,
    freeShipping: false,
    available: true,
  },

  'KS-UGP-1000': {
    sku: 'KS-UGP-1000',
    packSize: 1000,
    mrp: 599,
    sellingPrice: 315,
    shipping: 150,
    freeShipping: false,
    available: true,
  },

  /* ==========================================================================
     URAD GARLIC
     ======================================================================== */

  'KS-UGG-200': {
    sku: 'KS-UGG-200',
    packSize: 200,
    mrp: 125,
    sellingPrice: 70,
    shipping: 47,
    freeShipping: false,
    available: true,
  },

  'KS-UGG-500': {
    sku: 'KS-UGG-500',
    packSize: 500,
    mrp: 319,
    sellingPrice: 170,
    shipping: 71,
    freeShipping: false,
    available: true,
  },

  'KS-UGG-1000': {
    sku: 'KS-UGG-1000',
    packSize: 1000,
    mrp: 639,
    sellingPrice: 335,
    shipping: 150,
    freeShipping: false,
    available: true,
  },

  /* ==========================================================================
     COMBO PACK
     ======================================================================== */

  'KS-COMB-235': {
    sku: 'KS-COMB-235',
    packSize: 235,
    mrp: 199,
    sellingPrice: 150,
    shipping: 47,
    freeShipping: false,
    available: true,
  },
};

/* ============================================================================
 * DERIVED PRICE HELPERS
 * ============================================================================
 *
 * These functions calculate the final customer price.
 *
 * DO NOT create another manually maintained final-price table.
 * ========================================================================== */

/**
 * Return the final customer-facing website price.
 *
 * Example:
 *
 * sellingPrice = 55
 * shipping = 47
 *
 * finalWebsitePrice = 102
 */
export function getFinalWebsitePrice(
  sku: string,
): number | null {
  const config =
    getSalesSku(sku);

  if (!config) {
    return null;
  }

  if (
    config.sellingPrice === null ||
    !Number.isFinite(
      config.sellingPrice,
    )
  ) {
    return null;
  }

  if (
    !Number.isFinite(
      config.shipping,
    ) ||
    config.shipping < 0
  ) {
    return null;
  }

  return (
    config.sellingPrice +
    config.shipping
  );
}

/**
 * Return the calculated final price from a config object.
 */
export function calculateFinalWebsitePrice(
  config: SalesSkuConfig,
): number | null {
  if (
    config.sellingPrice === null ||
    !Number.isFinite(
      config.sellingPrice,
    )
  ) {
    return null;
  }

  if (
    !Number.isFinite(
      config.shipping,
    ) ||
    config.shipping < 0
  ) {
    return null;
  }

  return (
    config.sellingPrice +
    config.shipping
  );
}

/**
 * Return all commercial data for a SKU.
 */
export function getSalesSkuWithFinalPrice(
  sku: string,
):
  | (SalesSkuConfig & {
      finalWebsitePrice: number | null;
    })
  | undefined {
  const config =
    getSalesSku(sku);

  if (!config) {
    return undefined;
  }

  return {
    ...config,
    finalWebsitePrice:
      calculateFinalWebsitePrice(
        config,
      ),
  };
}

/* ============================================================================
 * SKU HELPERS
 * ========================================================================== */

export function getSalesSku(
  sku: string,
): SalesSkuConfig | undefined {
  const normalizedSku =
    sku.trim().toUpperCase();

  return SALES_SKUS[
    normalizedSku
  ];
}

export function getSellingPrice(
  sku: string,
): number | null {
  const config =
    getSalesSku(sku);

  return (
    config?.sellingPrice ??
    null
  );
}

export function getShippingCharge(
  sku: string,
): number {
  return (
    getSalesSku(sku)
      ?.shipping ?? 0
  );
}

export function getMRP(
  sku: string,
): number | null {
  return (
    getSalesSku(sku)
      ?.mrp ?? null
  );
}

export function isSkuAvailable(
  sku: string,
): boolean {
  const config =
    getSalesSku(sku);

  return Boolean(
    config &&
      config.available &&
      config.sellingPrice !==
        null &&
      Number.isFinite(
        config.sellingPrice,
      ) &&
      config.shipping >= 0,
  );
}

/* ============================================================================
 * OFFERS
 * ========================================================================== */

export const SALES_OFFERS: SalesOffer[] =
  [];

/* ============================================================================
 * COUPONS
 * ========================================================================== */

export const SALES_COUPONS: SalesCoupon[] =
  [];

/* ============================================================================
 * CAMPAIGNS
 * ========================================================================== */

export const SALES_CAMPAIGNS: SalesCampaign[] =
  [];

/* ============================================================================
 * DATE HELPERS
 * ========================================================================== */

function isDateRangeActive(
  enabled: boolean,
  startsAt?: string,
  endsAt?: string,
  now = new Date(),
): boolean {
  if (!enabled) {
    return false;
  }

  const timestamp =
    now.getTime();

  if (startsAt) {
    const start =
      new Date(
        startsAt,
      ).getTime();

    if (
      Number.isFinite(start) &&
      timestamp < start
    ) {
      return false;
    }
  }

  if (endsAt) {
    const end =
      new Date(
        endsAt,
      ).getTime();

    if (
      Number.isFinite(end) &&
      timestamp > end
    ) {
      return false;
    }
  }

  return true;
}

/* ============================================================================
 * OFFER HELPERS
 * ========================================================================== */

export function isOfferActive(
  offer: SalesOffer,
  now = new Date(),
): boolean {
  if (
    !SALES_POLICY.offersEnabled
  ) {
    return false;
  }

  return isDateRangeActive(
    offer.enabled,
    offer.startsAt,
    offer.endsAt,
    now,
  );
}

export function getActiveOffers(
  now = new Date(),
): SalesOffer[] {
  if (
    !SALES_POLICY.offersEnabled
  ) {
    return [];
  }

  return SALES_OFFERS.filter(
    (offer) =>
      isOfferActive(
        offer,
        now,
      ),
  );
}

/* ============================================================================
 * COUPON HELPERS
 * ========================================================================== */

export function normalizeCouponCode(
  code: string,
): string {
  return code
    .trim()
    .toUpperCase();
}

export function getSalesCoupon(
  code: string,
): SalesCoupon | undefined {
  const normalized =
    normalizeCouponCode(
      code,
    );

  return SALES_COUPONS.find(
    (coupon) =>
      normalizeCouponCode(
        coupon.code,
      ) === normalized,
  );
}

export function isCouponActive(
  coupon: SalesCoupon,
  now = new Date(),
): boolean {
  if (
    !SALES_POLICY.couponsEnabled
  ) {
    return false;
  }

  return isDateRangeActive(
    coupon.enabled,
    coupon.startsAt,
    coupon.endsAt,
    now,
  );
}

export function getActiveCoupons(
  now = new Date(),
): SalesCoupon[] {
  if (
    !SALES_POLICY.couponsEnabled
  ) {
    return [];
  }

  return SALES_COUPONS.filter(
    (coupon) =>
      isCouponActive(
        coupon,
        now,
      ),
  );
}

/* ============================================================================
 * VALIDATION
 * ============================================================================
 *
 * This validation is intentionally strict.
 *
 * It catches:
 * - duplicate SKUs
 * - mismatched keys
 * - invalid pack sizes
 * - invalid MRP
 * - invalid selling prices
 * - invalid shipping
 * - unavailable SKUs without prices
 * - selling price above MRP
 * - final price calculation errors
 * - invalid offers
 * - invalid coupons
 * ========================================================================== */

export function validateSalesConfig(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const seenSkus =
    new Set<string>();

  /* --------------------------------------------------------------------------
     SKU VALIDATION
  -------------------------------------------------------------------------- */

  for (const [
    skuKey,
    config,
  ] of Object.entries(
    SALES_SKUS,
  )) {
    const normalizedKey =
      skuKey
        .trim()
        .toUpperCase();

    const normalizedSku =
      config.sku
        .trim()
        .toUpperCase();

    /* SKU integrity */

    if (
      normalizedKey !==
      normalizedSku
    ) {
      errors.push(
        `${skuKey}: configuration SKU does not match record key.`,
      );
    }

    if (
      seenSkus.has(
        normalizedSku,
      )
    ) {
      errors.push(
        `Duplicate SKU: ${config.sku}`,
      );
    }

    seenSkus.add(
      normalizedSku,
    );

    /* Pack size */

    if (
      ![
        200,
        500,
        1000,
        235,
      ].includes(
        config.packSize,
      )
    ) {
      errors.push(
        `${config.sku}: invalid pack size.`,
      );
    }

    /* MRP */

    if (
      config.mrp !== null &&
      (
        !Number.isFinite(
          config.mrp,
        ) ||
        config.mrp < 0
      )
    ) {
      errors.push(
        `${config.sku}: MRP must be a valid non-negative number.`,
      );
    }

    /* Selling price */

    if (
      config.sellingPrice !==
        null &&
      (
        !Number.isFinite(
          config.sellingPrice,
        ) ||
        config.sellingPrice < 0
      )
    ) {
      errors.push(
        `${config.sku}: sellingPrice must be a valid non-negative number.`,
      );
    }

    /* Shipping */

    if (
      !Number.isFinite(
        config.shipping,
      ) ||
      config.shipping < 0
    ) {
      errors.push(
        `${config.sku}: shipping must be a valid non-negative number.`,
      );
    }

    /* Free shipping consistency */

    const shouldBeFree =
      config.shipping === 0;

    if (
      config.freeShipping !==
      shouldBeFree
    ) {
      errors.push(
        `${config.sku}: freeShipping does not match shipping value.`,
      );
    }

    /* Available SKU */

    if (
      config.available &&
      config.sellingPrice ===
        null
    ) {
      errors.push(
        `${config.sku}: available SKU must have a selling price.`,
      );
    }

    if (
      config.available &&
      config.mrp === null
    ) {
      errors.push(
        `${config.sku}: available SKU must have an MRP.`,
      );
    }

    /* Selling price must not exceed MRP */

    if (
      config.mrp !== null &&
      config.sellingPrice !==
        null &&
      config.sellingPrice >
        config.mrp
    ) {
      errors.push(
        `${config.sku}: sellingPrice cannot exceed MRP.`,
      );
    }

    /* Final price */

    const finalPrice =
      calculateFinalWebsitePrice(
        config,
      );

    if (
      config.available &&
      finalPrice ===
        null
    ) {
      errors.push(
        `${config.sku}: available SKU must have a valid final website price.`,
      );
    }

    /*
     * Final website price must not exceed MRP.
     *
     * This is important because the new sheet separates
     * selling price and shipping.
     */
    if (
      config.mrp !== null &&
      finalPrice !== null &&
      finalPrice >
        config.mrp
    ) {
      errors.push(
        `${config.sku}: final website price ₹${finalPrice} exceeds MRP ₹${config.mrp}.`,
      );
    }
  }

  /* --------------------------------------------------------------------------
     EXPECTED SKU COUNT
  -------------------------------------------------------------------------- */

  const skuCount =
    Object.keys(
      SALES_SKUS,
    ).length;

  if (skuCount !== 43) {
    errors.push(
      `Expected 43 SKUs but found ${skuCount}.`,
    );
  }

  /* --------------------------------------------------------------------------
     OFFER VALIDATION
  -------------------------------------------------------------------------- */

  const offerIds =
    new Set<string>();

  for (const offer of SALES_OFFERS) {
    if (
      offerIds.has(
        offer.id,
      )
    ) {
      errors.push(
        `Duplicate offer ID: ${offer.id}`,
      );
    }

    offerIds.add(
      offer.id,
    );

    if (
      !offer.id.trim()
    ) {
      errors.push(
        'Offer ID cannot be empty.',
      );
    }

    if (
      !Number.isFinite(
        offer.value,
      ) ||
      offer.value < 0
    ) {
      errors.push(
        `${offer.id}: invalid offer value.`,
      );
    }

    if (
      offer.type ===
        'percentage' &&
      offer.value > 100
    ) {
      errors.push(
        `${offer.id}: percentage offer cannot exceed 100%.`,
      );
    }

    if (
      offer.minimumOrderValue !==
        undefined &&
      (
        !Number.isFinite(
          offer.minimumOrderValue,
        ) ||
        offer.minimumOrderValue <
          0
      )
    ) {
      errors.push(
        `${offer.id}: invalid minimum order value.`,
      );
    }

    if (
      offer.maximumDiscount !==
        undefined &&
      (
        !Number.isFinite(
          offer.maximumDiscount,
        ) ||
        offer.maximumDiscount <
          0
      )
    ) {
      errors.push(
        `${offer.id}: invalid maximum discount.`,
      );
    }

    if (
      offer.skuCodes
    ) {
      for (const sku of
        offer.skuCodes) {
        if (
          !getSalesSku(
            sku,
          )
        ) {
          errors.push(
            `${offer.id}: unknown SKU ${sku}.`,
          );
        }
      }
    }
  }

  /* --------------------------------------------------------------------------
     COUPON VALIDATION
  -------------------------------------------------------------------------- */

  const couponCodes =
    new Set<string>();

  for (const coupon of
    SALES_COUPONS) {
    const normalizedCode =
      normalizeCouponCode(
        coupon.code,
      );

    if (
      couponCodes.has(
        normalizedCode,
      )
    ) {
      errors.push(
        `Duplicate coupon code: ${coupon.code}`,
      );
    }

    couponCodes.add(
      normalizedCode,
    );

    if (
      !normalizedCode
    ) {
      errors.push(
        'Coupon code cannot be empty.',
      );
    }

    if (
      !Number.isFinite(
        coupon.value,
      ) ||
      coupon.value < 0
    ) {
      errors.push(
        `${coupon.code}: invalid coupon value.`,
      );
    }

    if (
      coupon.type ===
        'percentage' &&
      coupon.value > 100
    ) {
      errors.push(
        `${coupon.code}: percentage coupon cannot exceed 100%.`,
      );
    }

    if (
      coupon.minimumOrderValue !==
        undefined &&
      (
        !Number.isFinite(
          coupon.minimumOrderValue,
        ) ||
        coupon.minimumOrderValue <
          0
      )
    ) {
      errors.push(
        `${coupon.code}: invalid minimum order value.`,
      );
    }

    if (
      coupon.maximumDiscount !==
        undefined &&
      (
        !Number.isFinite(
          coupon.maximumDiscount,
        ) ||
        coupon.maximumDiscount <
          0
      )
    ) {
      errors.push(
        `${coupon.code}: invalid maximum discount.`,
      );
    }

    if (
      coupon.usageLimit !==
        undefined &&
      (
        !Number.isFinite(
          coupon.usageLimit,
        ) ||
        coupon.usageLimit < 0
      )
    ) {
      errors.push(
        `${coupon.code}: invalid usage limit.`,
      );
    }

    if (
      coupon.perCustomerLimit !==
        undefined &&
      (
        !Number.isFinite(
          coupon.perCustomerLimit,
        ) ||
        coupon.perCustomerLimit <
          0
      )
    ) {
      errors.push(
        `${coupon.code}: invalid per-customer limit.`,
      );
    }

    if (
      coupon.skuCodes
    ) {
      for (const sku of
        coupon.skuCodes) {
        if (
          !getSalesSku(
            sku,
          )
        ) {
          errors.push(
            `${coupon.code}: unknown SKU ${sku}.`,
          );
        }
      }
    }
  }

  /* --------------------------------------------------------------------------
     CAMPAIGN VALIDATION
  -------------------------------------------------------------------------- */

  const campaignIds =
    new Set<string>();

  for (const campaign of
    SALES_CAMPAIGNS) {
    if (
      campaignIds.has(
        campaign.id,
      )
    ) {
      errors.push(
        `Duplicate campaign ID: ${campaign.id}`,
      );
    }

    campaignIds.add(
      campaign.id,
    );

    for (const offerId of
      campaign.offerIds) {
      if (
        !SALES_OFFERS.some(
          (offer) =>
            offer.id ===
            offerId,
        )
      ) {
        errors.push(
          `${campaign.id}: unknown offer ID ${offerId}.`,
        );
      }
    }

    for (const couponCode of
      campaign.couponCodes) {
      if (
        !SALES_COUPONS.some(
          (coupon) =>
            normalizeCouponCode(
              coupon.code,
            ) ===
            normalizeCouponCode(
              couponCode,
            ),
        )
      ) {
        errors.push(
          `${campaign.id}: unknown coupon code ${couponCode}.`,
        );
      }
    }
  }

  return {
    valid:
      errors.length === 0,
    errors,
  };
}

/* ============================================================================
 * DEVELOPMENT SAFETY CHECK
 * ========================================================================== */

const salesConfigValidation =
  validateSalesConfig();

if (
  !salesConfigValidation.valid
) {
  console.warn(
    '[Kawad Swad] Sales configuration validation warnings:',
    salesConfigValidation.errors,
  );
}
