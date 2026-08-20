import {
  getSalesSku,
  getSellingPrice,
  type SalesSkuConfig,
} from './sales-config';

export type ProductCategory =
  | 'moong'
  | 'chana'
  | 'urad'
  | 'combo';

export type PackSize =
  | 200
  | 500
  | 1000
  | 235;

/* ============================================================================
 * PRODUCT SKU VIEW
 * ============================================================================
 *
 * sales-config.ts is the commercial master.
 *
 * It stores:
 *   MRP
 *   sellingPrice
 *   availability
 *
 * IMPORTANT:
 *
 * websitePrice is now the BASE WEBSITE SELLING PRICE.
 *
 * Shipping is NOT included in websitePrice.
 *
 * NEW FULFILMENT MODEL:
 *
 *   MANUAL
 *      websitePrice + ₹0 shipping
 *
 *   SHIPPING
 *      websitePrice + shipping supplied by the fulfilment system
 *
 * The backend remains the final pricing authority at checkout.
 * ========================================================================== */

export interface Sku {
  sku: string;
  packSize: PackSize;
  mrp: number | null;

  /*
   * BASE customer-facing website selling price.
   *
   * Shipping is NOT included here.
   */
  websitePrice: number | null;

  /*
   * Compatibility field.
   *
   * Actual shipping is resolved separately by fulfilment.
   *
   * This value must NOT be used as a shipping calculation.
   */
  shipping: 0;

  /*
   * false means shipping is NOT permanently included/free.
   *
   * MANUAL fulfilment may still result in ₹0 shipping.
   * SHIPPING fulfilment may have a calculated shipping charge.
   */
  freeShipping: false;

  available: boolean;
}

export interface ProductFamily {
  id: string;
  slug: string;
  name: string;
  hindiName: string;
  category: ProductCategory;
  variant: string;
  description: string;
  ingredients: string[];
  tasteProfile: string;
  storage: string;
  serving: string;
  nutritionNote: string;
  skus: Sku[];
  featured: boolean;
}

export const PACK_LABELS: Record<
  number,
  string
> = {
  200: '200g',
  500: '500g',
  1000: '1kg',
  235: '235g Combo',
};

export const CATEGORY_LABELS: Record<
  ProductCategory,
  string
> = {
  moong: 'Moong',
  chana: 'Chana',
  urad: 'Urad',
  combo: 'Combo',
};

/* ============================================================================
 * SKU RESOLUTION
 * ============================================================================
 *
 * Product information lives in this file.
 *
 * Customer-facing commercial values come exclusively from:
 *
 *   src/data/sales-config.ts
 *
 * This file does NOT contain:
 *
 * - Costing
 * - Factory price
 * - Dealer price
 * - Distributor price
 * - Shipping master values
 * - Discount calculations
 * - Coupon calculations
 * - Offer calculations
 *
 * websitePrice is the BASE website selling price.
 * ========================================================================== */

function makeSku(
  skuCode: string,
): Sku {
  const salesSku =
    getSalesSku(skuCode);

  if (!salesSku) {
    throw new Error(
      `Missing sales configuration for SKU: ${skuCode}`,
    );
  }

  if (
    !Number.isFinite(
      salesSku.packSize,
    ) ||
    ![
      200,
      500,
      1000,
      235,
    ].includes(
      salesSku.packSize,
    )
  ) {
    throw new Error(
      `Invalid pack size in sales configuration for SKU: ${skuCode}`,
    );
  }

  /*
   * The product layer exposes the approved Website Selling Price.
   *
   * It does NOT add SKU shipping here.
   */
  const websiteSellingPrice =
    getSellingPrice(
      skuCode,
    );

  /*
   * An available SKU must have a valid website selling price.
   */
  if (
    salesSku.available &&
    (
      websiteSellingPrice === null ||
      !Number.isFinite(
        websiteSellingPrice,
      ) ||
      websiteSellingPrice < 0
    )
  ) {
    throw new Error(
      `Invalid website selling price for SKU: ${skuCode}`,
    );
  }

  return {
    sku: salesSku.sku,

    packSize:
      salesSku.packSize as PackSize,

    mrp:
      salesSku.mrp,

    /*
     * BASE WEBSITE SELLING PRICE.
     *
     * Example:
     *
     * KS-MMP-200 = ₹55
     *
     * Shipping is resolved separately.
     */
    websitePrice:
      websiteSellingPrice,

    /*
     * Shipping is deliberately not embedded in the product price.
     */
    shipping: 0,

    /*
     * Do not tell the UI that shipping is universally free.
     *
     * MANUAL may be ₹0.
     * SHIPPING may have a charge.
     */
    freeShipping: false,

    available:
      salesSku.available,
  };
}

function makeSkus(
  skuCodes: string[],
): Sku[] {
  return skuCodes.map(
    makeSku,
  );
}

/* ============================================================================
 * PRODUCT MASTER
 * ========================================================================== */

export const products: ProductFamily[] = [
  {
    id: 'moong-master',
    slug: 'moong-master-papad',
    name: 'Moong Master Papad',
    hindiName: 'मूंग मास्टर पापड़',
    category: 'moong',
    variant: 'Classic',
    description:
      'Our signature moong papad, crafted from premium moong dal with a balanced traditional spice blend. Thin, crisp and made for the everyday Nimar table.',
    ingredients: [
      'Moong dal flour',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Crisp, savoury and well-balanced with a classic roasted aroma.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus([
      'KS-MMP-200',
      'KS-MMP-500',
      'KS-MMP-1000',
    ]),
    featured: true,
  },

  {
    id: 'moong-garlic',
    slug: 'moong-garlic-papad',
    name: 'Moong Garlic Papad',
    hindiName: 'मूंग लहसुन पापड़',
    category: 'moong',
    variant: 'Garlic',
    description:
      'A crisp moong papad with a bold garlic character and aromatic spice blend. A flavour-forward choice for garlic lovers.',
    ingredients: [
      'Moong dal flour',
      'Garlic',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Bold garlic aroma with a crisp, savoury bite.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus([
      'KS-MGP-200',
      'KS-MGP-500',
      'KS-MGP-1000',
    ]),
    featured: true,
  },

  {
    id: 'moong-jeera',
    slug: 'moong-jeera-papad',
    name: 'Moong Jeera Papad',
    hindiName: 'मूंग जीरा पापड़',
    category: 'moong',
    variant: 'Jeera',
    description:
      'A classic moong papad featuring the warm, earthy aroma of jeera. A simple traditional combination that pairs naturally with everyday meals.',
    ingredients: [
      'Moong dal flour',
      'Cumin seeds',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Warm cumin aroma with a crisp, earthy finish.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus([
      'KS-MJP-200',
      'KS-MJP-500',
      'KS-MJP-1000',
    ]),
    featured: false,
  },

  {
    id: 'moong-pudhina',
    slug: 'moong-pudhina-papad',
    name: 'Moong Pudhina Papad',
    hindiName: 'मूंग पुदीना पापड़',
    category: 'moong',
    variant: 'Pudhina',
    description:
      'A refreshing moong papad with the distinctive aroma of mint. Crisp, light and designed for a fresh twist on traditional papad.',
    ingredients: [
      'Moong dal flour',
      'Mint',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Cool mint aroma with a crisp, refreshing finish.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus([
      'KS-MPP-200',
      'KS-MPP-500',
      'KS-MPP-1000',
    ]),
    featured: false,
  },

  {
    id: 'moong-green-chilli',
    slug: 'moong-green-chilli-papad',
    name: 'Moong Green Chilli Papad',
    hindiName: 'मूंग हरी मिर्च पापड़',
    category: 'moong',
    variant: 'Green Chilli',
    description:
      'A crisp moong papad with the lively flavour of green chilli. Made for those who enjoy a little extra heat with their crunch.',
    ingredients: [
      'Moong dal flour',
      'Green chilli',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Spicy green chilli heat with a crisp, savoury base.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus([
      'KS-MGCP-200',
      'KS-MGCP-500',
      'KS-MGCP-1000',
    ]),
    featured: false,
  },

  {
    id: 'moong-kasuri-methi',
    slug: 'moong-kasuri-methi-papad',
    name: 'Moong Kasuri Methi Papad',
    hindiName: 'मूंग कसूरी मेथी पापड़',
    category: 'moong',
    variant: 'Kasuri Methi',
    description:
      'A fragrant moong papad infused with the distinctive character of kasuri methi. Aromatic, savoury and crisp.',
    ingredients: [
      'Moong dal flour',
      'Kasuri methi',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Fragrant fenugreek aroma with a crisp, savoury finish.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus([
      'KS-MKMP-200',
      'KS-MKMP-500',
      'KS-MKMP-1000',
    ]),
    featured: false,
  },

  {
    id: 'moong-punjabi-masala',
    slug: 'moong-punjabi-masala-papad',
    name: 'Moong Punjabi Masala Papad',
    hindiName: 'मूंग पंजाबी मसाला पापड़',
    category: 'moong',
    variant: 'Punjabi Masala',
    description:
      'A bold moong papad seasoned with a Punjabi-style masala blend. Rich in aroma and full of traditional spice character.',
    ingredients: [
      'Moong dal flour',
      'Punjabi masala blend',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Bold, aromatic masala with a crisp, full-bodied finish.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus([
      'KS-MPMP-200',
      'KS-MPMP-500',
      'KS-MPMP-1000',
    ]),
    featured: false,
  },

  {
    id: 'chana-chotu',
    slug: 'chana-chotu-papad',
    name: 'Chana Chotu Papad',
    hindiName: 'चना छोटू पापड़',
    category: 'chana',
    variant: 'Classic',
    description:
      'A classic chana dal papad with a crisp texture and traditional flavour. A dependable everyday companion for the Nimar meal.',
    ingredients: [
      'Chana dal flour',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Crisp and savoury with a classic roasted chana aroma.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus([
      'KS-CCP-200',
      'KS-CCP-500',
      'KS-CCP-1000',
    ]),
    featured: true,
  },

  {
    id: 'chana-garlic',
    slug: 'chana-garlic-papad',
    name: 'Chana Garlic Papad',
    hindiName: 'चना लहसुन पापड़',
    category: 'chana',
    variant: 'Garlic',
    description:
      'Chana dal papad with a bold garlic flavour and aromatic spice character. Crisp, savoury and satisfying.',
    ingredients: [
      'Chana dal flour',
      'Garlic',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Bold garlic aroma with a crisp chana base.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus([
      'KS-CGP-200',
      'KS-CGP-500',
      'KS-CGP-1000',
    ]),
    featured: false,
  },

  {
    id: 'chana-khata-mitha',
    slug: 'chana-khata-mitha-papad',
    name: 'Chana Khata Mitha Papad',
    hindiName: 'चना खटा मीठा पापड़',
    category: 'chana',
    variant: 'Khata Mitha',
    description:
      'A distinctive chana papad with a sweet-and-sour flavour profile. Tangy, crisp and different from the everyday classic.',
    ingredients: [
      'Chana dal flour',
      'Sweet-and-sour spices',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Tangy sweet-and-sour flavour with a crisp base.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus([
      'KS-CKM-200',
      'KS-CKM-500',
      'KS-CKM-1000',
    ]),
    featured: false,
  },

  {
    id: 'chana-tomato',
    slug: 'chana-tomato-papad',
    name: 'Chana Tomato Papad',
    hindiName: 'चना टमाटर पापड़',
    category: 'chana',
    variant: 'Tomato',
    description:
      'A crisp chana papad with a tangy tomato flavour and savoury spice base. A zesty take on traditional papad.',
    ingredients: [
      'Chana dal flour',
      'Tomato flavour',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Tangy tomato flavour with a crisp, savoury base.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus([
      'KS-CTP-200',
      'KS-CTP-500',
      'KS-CTP-1000',
    ]),
    featured: false,
  },

  {
    id: 'chana-punjabi-masala',
    slug: 'chana-punjabi-masala-papad',
    name: 'Chana Punjabi Masala Papad',
    hindiName: 'चना पंजाबी मसाला पापड़',
    category: 'chana',
    variant: 'Punjabi Masala',
    description:
      'A chana papad seasoned with a rich Punjabi-style masala blend. Bold, aromatic and packed with character.',
    ingredients: [
      'Chana dal flour',
      'Punjabi masala blend',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Bold, aromatic masala with a crisp chana base.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus([
      'KS-CPM-200',
      'KS-CPM-500',
      'KS-CPM-1000',
    ]),
    featured: false,
  },

  {
    id: 'urad-guru',
    slug: 'urad-guru-papad',
    name: 'Urad Guru Papad',
    hindiName: 'उड़द गुरु पापड़',
    category: 'urad',
    variant: 'Classic',
    description:
      'A premium urad dal papad with a rich, hearty traditional character. Crisp, satisfying and full of depth.',
    ingredients: [
      'Urad dal flour',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Rich, hearty and savoury with a classic roasted urad aroma.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus([
      'KS-UGP-200',
      'KS-UGP-500',
      'KS-UGP-1000',
    ]),
    featured: true,
  },

  {
    id: 'urad-garlic',
    slug: 'urad-garlic-papad',
    name: 'Urad Garlic Papad',
    hindiName: 'उड़द लहसुन पापड़',
    category: 'urad',
    variant: 'Garlic',
    description:
      'A rich urad dal papad with bold garlic flavour and an aromatic spice character. Hearty, crisp and deeply satisfying.',
    ingredients: [
      'Urad dal flour',
      'Garlic',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Bold garlic aroma with a rich, hearty urad base.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus([
      'KS-UGG-200',
      'KS-UGG-500',
      'KS-UGG-1000',
    ]),
    featured: false,
  },

  {
    id: 'combo-235',
    slug: 'kawad-swad-combo-pack',
    name: 'Kawad Swad Combo Pack',
    hindiName: 'कवाड़ स्वाद कॉम्बो पैक',
    category: 'combo',
    variant: 'Assorted',
    description:
      'A curated assortment of popular Kawad Swad papad varieties in one convenient pack, ideal for discovering different flavours.',
    ingredients: [
      'Assorted moong & chana papad varieties',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'A balanced mix of classic, garlic and spiced papad flavours.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus([
      'KS-COMB-235',
    ]),
    featured: true,
  },
];

/* ============================================================================
 * SALES CONFIGURATION VALIDATION
 * ============================================================================
 *
 * Every product SKU must exist in the central sales configuration.
 *
 * NEW MODEL:
 *
 * sales-config.ts
 *   sellingPrice = BASE WEBSITE SELLING PRICE
 *
 * products.ts
 *   websitePrice = sellingPrice
 *
 * Fulfilment shipping is resolved separately.
 * ========================================================================== */

export function validateProductSalesMapping(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const seenProductSkus =
    new Set<string>();

  for (const product of products) {
    if (
      !product.id.trim()
    ) {
      errors.push(
        'Product is missing an ID.',
      );
    }

    if (
      !product.slug.trim()
    ) {
      errors.push(
        `${product.name || 'Unknown product'}: missing slug.`,
      );
    }

    if (
      product.skus.length === 0
    ) {
      errors.push(
        `${product.name}: no SKUs configured.`,
      );
    }

    for (const sku of product.skus) {
      const normalizedSku =
        sku.sku
          .trim()
          .toUpperCase();

      if (!normalizedSku) {
        errors.push(
          `${product.name}: empty SKU.`,
        );
        continue;
      }

      if (
        seenProductSkus.has(
          normalizedSku,
        )
      ) {
        errors.push(
          `Duplicate product SKU: ${sku.sku}`,
        );
      }

      seenProductSkus.add(
        normalizedSku,
      );

      const salesSku:
        | SalesSkuConfig
        | undefined =
        getSalesSku(
          normalizedSku,
        );

      if (!salesSku) {
        errors.push(
          `${product.name}: missing sales configuration for ${sku.sku}`,
        );
        continue;
      }

      if (
        sku.packSize !==
        salesSku.packSize
      ) {
        errors.push(
          `${sku.sku}: pack size mismatch.`,
        );
      }

      if (
        sku.mrp !==
        salesSku.mrp
      ) {
        errors.push(
          `${sku.sku}: MRP mismatch.`,
        );
      }

      /*
       * NEW RULE:
       *
       * websitePrice must equal the approved BASE Website Selling Price.
       *
       * Example:
       *
       * KS-MMP-200
       * sellingPrice = ₹55
       * websitePrice = ₹55
       *
       * Shipping is NOT included here.
       */
      if (
        sku.websitePrice !==
        salesSku.sellingPrice
      ) {
        errors.push(
          `${sku.sku}: website selling price mismatch. Expected ₹${salesSku.sellingPrice ?? 'invalid'}, got ₹${sku.websitePrice ?? 'invalid'}.`,
        );
      }

      /*
       * Product-level shipping must remain zero.
       *
       * This does NOT mean all orders have free shipping.
       *
       * It means shipping is resolved separately by fulfilment.
       */
      if (
        sku.shipping !== 0
      ) {
        errors.push(
          `${sku.sku}: product-layer shipping must be 0 because shipping is resolved separately by fulfilment.`,
        );
      }

      /*
       * freeShipping must NOT be true globally.
       *
       * MANUAL may have ₹0 shipping.
       * SHIPPING may have a charge.
       */
      if (
        sku.freeShipping !== false
      ) {
        errors.push(
          `${sku.sku}: freeShipping must be false because shipping depends on fulfilment.`,
        );
      }

      if (
        sku.available !==
        salesSku.available
      ) {
        errors.push(
          `${sku.sku}: availability mismatch.`,
        );
      }

      if (
        sku.mrp !== null &&
        (
          !Number.isFinite(
            sku.mrp,
          ) ||
          sku.mrp < 0
        )
      ) {
        errors.push(
          `${sku.sku}: invalid MRP.`,
        );
      }

      if (
        sku.websitePrice !==
          null &&
        (
          !Number.isFinite(
            sku.websitePrice,
          ) ||
          sku.websitePrice < 0
        )
      ) {
        errors.push(
          `${sku.sku}: invalid website selling price.`,
        );
      }

      if (
        sku.available &&
        (
          sku.mrp === null ||
          sku.websitePrice === null
        )
      ) {
        errors.push(
          `${sku.sku}: available SKU must have MRP and website selling price.`,
        );
      }

      /*
       * Selling price should not exceed MRP.
       */
      if (
        sku.mrp !== null &&
        sku.websitePrice !== null &&
        sku.websitePrice >
          sku.mrp
      ) {
        errors.push(
          `${sku.sku}: website selling price ₹${sku.websitePrice} exceeds MRP ₹${sku.mrp}.`,
        );
      }
    }
  }

  /*
   * The current master contains 43 active SKUs.
   */
  if (
    seenProductSkus.size !== 43
  ) {
    errors.push(
      `Expected 43 product SKUs but found ${seenProductSkus.size}.`,
    );
  }

  return {
    valid:
      errors.length === 0,

    errors,
  };
}
