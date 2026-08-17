/**
 * KAWAD SWAD
 * CENTRAL SALES, PRICING & PROMOTION CONFIGURATION
 *
 * SINGLE FRONTEND AUTHORITY FOR:
 * - Customer-facing selling prices
 * - MRP
 * - Product/SKU availability
 * - Free shipping
 * - Future offers
 * - Future coupons
 * - Future campaigns
 *
 * NOT STORED HERE:
 * - Manufacturing costing
 * - Factory price
 * - Dealer price
 * - Distributor price
 * - Profit
 *
 * IMPORTANT:
 * sellingPrice is the final customer-facing website price.
 * Shipping is included in sellingPrice.
 * Website shipping charge = ₹0.
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
   * Customer-facing MRP must not be exceeded.
   */
  mrp: number | null;

  /**
   * FINAL CUSTOMER-FACING WEBSITE PRICE.
   * Shipping is already included.
   */
  sellingPrice: number | null;

  /**
   * Shipping is included in sellingPrice.
   */
  shipping: 0;

  /**
   * Customer-facing shipping policy.
   */
  freeShipping: true;

  /**
   * Whether this SKU is currently purchasable.
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
   * percentage:
   *   10 = 10%
   *
   * fixed:
   *   50 = ₹50
   *
   * buy_x_get_y / bundle:
   *   Reserved for the future promotion engine.
   */
  value: number;

  enabled: boolean;

  startsAt?: string;
  endsAt?: string;

  minimumOrderValue?: number;
  maximumDiscount?: number;

  /**
   * Empty/undefined = all eligible SKUs.
   */
  skuCodes?: string[];
};

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

  /**
   * Empty/undefined = all eligible SKUs.
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

/* ============================================================================
 * SALES POLICY
 * ========================================================================== */

export const SALES_POLICY = {
  currency: 'INR' as const,

  shippingIncludedInSellingPrice:
    true,

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

  /*
   * Offers and coupons remain disabled until
   * explicitly configured.
   */
  offersEnabled: false,

  couponsEnabled: false,

  campaignsEnabled: false,
} as const;

/* ============================================================================
 * CURRENT SKU PRICING
 * ========================================================================== */

export const SALES_SKUS: Record<
  string,
  SalesSkuConfig
> = {
  /* --------------------------------------------------------------------------
     MOONG MASTER
  -------------------------------------------------------------------------- */

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

  /* --------------------------------------------------------------------------
     MOONG GARLIC
  -------------------------------------------------------------------------- */

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

  /* --------------------------------------------------------------------------
     MOONG JEERA
  -------------------------------------------------------------------------- */

  'KS-MJP-200': {
    sku: 'KS-MJP-200',
    packSize: 200,
    mrp: 109,
    sellingPrice: 102,
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

  /* --------------------------------------------------------------------------
     MOONG PUDHINA
  -------------------------------------------------------------------------- */

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

  /* --------------------------------------------------------------------------
     MOONG GREEN CHILLI
  -------------------------------------------------------------------------- */

  'KS-MGCP-200': {
    sku: 'KS-MGCP-200',
    packSize: 200,
    mrp: 105,
    sellingPrice: 102,
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

  /* --------------------------------------------------------------------------
     MOONG KASURI METHI
  -------------------------------------------------------------------------- */

  'KS-MKMP-200': {
    sku: 'KS-MKMP-200',
    packSize: 200,
    mrp: 109,
    sellingPrice: 102,
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

  /* --------------------------------------------------------------------------
     MOONG PUNJABI MASALA
  -------------------------------------------------------------------------- */

  'KS-MPMP-200': {
    sku: 'KS-MPMP-200',
    packSize: 200,
    mrp: 119,
    sellingPrice: 102,
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

  /* --------------------------------------------------------------------------
     CHANA CHOTU
  -------------------------------------------------------------------------- */

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

  /* --------------------------------------------------------------------------
     CHANA GARLIC
  -------------------------------------------------------------------------- */

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

  /* --------------------------------------------------------------------------
     CHANA KHATA MITHA
  -------------------------------------------------------------------------- */

  'KS-CKM-200': {
    sku: 'KS-CKM-200',
    packSize: 200,
    mrp: 99,
    sellingPrice: 99,
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

  /* --------------------------------------------------------------------------
     CHANA TOMATO
  -------------------------------------------------------------------------- */

  'KS-CTP-200': {
    sku: 'KS-CTP-200',
    packSize: 200,
    mrp: 99,
    sellingPrice: 99,
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

  /* --------------------------------------------------------------------------
     CHANA PUNJABI MASALA
  -------------------------------------------------------------------------- */

  'KS-CPM-200': {
    sku: 'KS-CPM-200',
    packSize: 200,
    mrp: 119,
    sellingPrice: 102,
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

  /* --------------------------------------------------------------------------
     URAD GURU
  -------------------------------------------------------------------------- */

  'KS-UGP-200': {
    sku: 'KS-UGP-200',
    packSize: 200,
    mrp: 119,
    sellingPrice: 102,
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

  /* --------------------------------------------------------------------------
     URAD GARLIC
  -------------------------------------------------------------------------- */

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

  /* --------------------------------------------------------------------------
     COMBO
  -------------------------------------------------------------------------- */

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

/* ============================================================================
 * OFFERS
 * ========================================================================== */

export const SALES_OFFERS: SalesOffer[] = [];

/* ============================================================================
 * COUPONS
 * ========================================================================== */

export const SALES_COUPONS: SalesCoupon[] = [];

/* ============================================================================
 * CAMPAIGNS
 * ========================================================================== */

export const SALES_CAMPAIGNS: SalesCampaign[] = [];

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

export function isSkuAvailable(
  sku: string,
): boolean {
  const config =
    getSalesSku(sku);

  return Boolean(
    config &&
      config.available &&
      config.sellingPrice !==
        null,
  );
}

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
    normalizeCouponCode(code);

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
 * CAMPAIGN HELPERS
 * ========================================================================== */

export function isCampaignActive(
  campaign: SalesCampaign,
  now = new Date(),
): boolean {
  if (
    !SALES_POLICY.campaignsEnabled
  ) {
    return false;
  }

  return isDateRangeActive(
    campaign.enabled,
    campaign.startsAt,
    campaign.endsAt,
    now,
  );
}

export function getActiveCampaigns(
  now = new Date(),
): SalesCampaign[] {
  if (
    !SALES_POLICY.campaignsEnabled
  ) {
    return [];
  }

  return SALES_CAMPAIGNS.filter(
    (campaign) =>
      isCampaignActive(
        campaign,
        now,
      ),
  );
}

/* ============================================================================
 * DISCOUNT CALCULATION HELPERS
 *
 * These functions only calculate configured promotions.
 * They do not alter the base sellingPrice.
 * ========================================================================== */

export function calculateOfferDiscount(
  offer: SalesOffer,
  eligibleAmount: number,
): number {
  if (
    !Number.isFinite(
      eligibleAmount,
    ) ||
    eligibleAmount <= 0
  ) {
    return 0;
  }

  if (
    offer.minimumOrderValue !==
      undefined &&
    eligibleAmount <
      offer.minimumOrderValue
  ) {
    return 0;
  }

  let discount = 0;

  if (
    offer.type ===
    'percentage'
  ) {
    discount =
      eligibleAmount *
      (offer.value / 100);
  }

  if (
    offer.type === 'fixed'
  ) {
    discount = offer.value;
  }

  if (
    offer.maximumDiscount !==
      undefined
  ) {
    discount = Math.min(
      discount,
      offer.maximumDiscount,
    );
  }

  return Math.max(
    0,
    Math.min(
      discount,
      eligibleAmount,
    ),
  );
}

export function calculateCouponDiscount(
  coupon: SalesCoupon,
  eligibleAmount: number,
): number {
  if (
    !Number.isFinite(
      eligibleAmount,
    ) ||
    eligibleAmount <= 0
  ) {
    return 0;
  }

  if (
    coupon.minimumOrderValue !==
      undefined &&
    eligibleAmount <
      coupon.minimumOrderValue
  ) {
    return 0;
  }

  let discount = 0;

  if (
    coupon.type ===
    'percentage'
  ) {
    discount =
      eligibleAmount *
      (coupon.value / 100);
  }

  if (
    coupon.type === 'fixed'
  ) {
    discount = coupon.value;
  }

  if (
    coupon.maximumDiscount !==
      undefined
  ) {
    discount = Math.min(
      discount,
      coupon.maximumDiscount,
    );
  }

  return Math.max(
    0,
    Math.min(
      discount,
      eligibleAmount,
    ),
  );
}

/* ============================================================================
 * CENTRAL SALES CONFIG VALIDATION
 * ========================================================================== */

export function validateSalesConfig(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const seenSkus =
    new Set<string>();

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

    /* Shipping */
    if (
      config.shipping !== 0
    ) {
      errors.push(
        `${config.sku}: shipping must be 0.`,
      );
    }

    if (
      config.freeShipping !==
      true
    ) {
      errors.push(
        `${config.sku}: freeShipping must be true.`,
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

    /*
     * Consumer selling price must not exceed
     * declared MRP.
     */
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
  }

  /* ==========================================================================
   * OFFER VALIDATION
   * ======================================================================== */

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
          !getSalesSku(sku)
        ) {
          errors.push(
            `${offer.id}: unknown SKU ${sku}.`,
          );
        }
      }
    }
  }

  /* ==========================================================================
   * COUPON VALIDATION
   * ======================================================================== */

  const couponCodes =
    new Set<string>();

  for (const coupon of
    SALES_COUPONS) {
    const code =
      normalizeCouponCode(
        coupon.code,
      );

    if (!code) {
      errors.push(
        'Coupon code cannot be empty.',
      );
    }

    if (
      couponCodes.has(code)
    ) {
      errors.push(
        `Duplicate coupon code: ${code}`,
      );
    }

    couponCodes.add(code);

    if (
      !Number.isFinite(
        coupon.value,
      ) ||
      coupon.value < 0
    ) {
      errors.push(
        `${code}: invalid coupon value.`,
      );
    }

    if (
      coupon.type ===
        'percentage' &&
      coupon.value > 100
    ) {
      errors.push(
        `${code}: percentage coupon cannot exceed 100%.`,
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
        `${code}: invalid minimum order value.`,
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
        `${code}: invalid maximum discount.`,
      );
    }

    if (
      coupon.usageLimit !==
        undefined &&
      (
        !Number.isInteger(
          coupon.usageLimit,
        ) ||
        coupon.usageLimit <= 0
      )
    ) {
      errors.push(
        `${code}: usageLimit must be a positive integer.`,
      );
    }

    if (
      coupon.perCustomerLimit !==
        undefined &&
      (
        !Number.isInteger(
          coupon.perCustomerLimit,
        ) ||
        coupon.perCustomerLimit <=
          0
      )
    ) {
      errors.push(
        `${code}: perCustomerLimit must be a positive integer.`,
      );
    }

    if (
      coupon.skuCodes
    ) {
      for (const sku of
        coupon.skuCodes) {
        if (
          !getSalesSku(sku)
        ) {
          errors.push(
            `${code}: unknown SKU ${sku}.`,
          );
        }
      }
    }
  }

  /* ==========================================================================
   * CAMPAIGN VALIDATION
   * ======================================================================== */

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
          `${campaign.id}: unknown offer ${offerId}.`,
        );
      }
    }

    for (const couponCode of
      campaign.couponCodes) {
      const normalized =
        normalizeCouponCode(
          couponCode,
        );

      if (
        !SALES_COUPONS.some(
          (coupon) =>
            normalizeCouponCode(
              coupon.code,
            ) === normalized,
        )
      ) {
        errors.push(
          `${campaign.id}: unknown coupon ${couponCode}.`,
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
