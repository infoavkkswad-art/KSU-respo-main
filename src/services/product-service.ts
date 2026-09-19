import {
  products,
  type ProductFamily,
  type Sku,
  type ProductCategory,
} from '../data/products';

import {
  getSalesSku,
  getSellingPrice,
  getLowestPrice,
  getManualPrice,
  isManualPriceEligible,
  getPriceForFulfillment,
  type SalesSkuConfig,
} from '../data/sales-config';


/* ============================================================================
 * CUSTOMER-FACING FLAT PRODUCT
 * ============================================================================
 *
 * IMPORTANT:
 *
 * websitePrice = BASE WEBSITE SELLING PRICE
 *
 * Shipping is NOT included here.
 *
 * MANUAL:
 *   websitePrice + ₹0 shipping
 *
 * SHIPPING:
 *   websitePrice + fulfilment-calculated shipping
 * ========================================================================== */

export interface FlatProductItem {
  familyId: string;
  slug: string;
  name: string;
  hindiName: string;
  category: ProductCategory;
  description: string;

  sku: string;
  packSize: number | string;

  mrp: number;

  /*
   * BASE WEBSITE SELLING PRICE.
   */
  websitePrice: number;

  /*
   * Lowest/base product price before fulfilment shipping.
   */
  lowestPrice: number;

  /*
   * Manual/local pricing metadata.
   */
  manualPrice: number | null;
  manualPriceEligible: boolean;

  /*
   * Product catalogue does not contain shipping.
   *
   * Actual shipping is resolved by fulfilment.
   */
  shipping: number;

  /*
   * This describes the current catalogue object only.
   *
   * It must not be interpreted as "shipping is always free".
   */
  freeShipping: boolean;

  available: boolean;

  featured?: boolean;
}


/* ============================================================================
 * PRODUCT RESULT TYPES
 * ========================================================================== */

export interface ProductSkuResult {
  family: ProductFamily;
  skuObj: Sku;
}


/* ============================================================================
 * CUSTOMER-FACING PURCHASABLE SKU
 * ============================================================================
 *
 * websitePrice is the BASE WEBSITE SELLING PRICE.
 *
 * It is NOT:
 *
 *     sellingPrice + shipping
 *
 * Shipping is resolved separately after PIN/fulfilment determination.
 * ========================================================================== */

export type PurchasableSku = Omit<
  Sku,
  'mrp' | 'websitePrice' | 'available'
> & {
  mrp: number;

  /*
   * BASE website selling price.
   */
  websitePrice: number;

  /*
   * Lowest/base product price before shipping.
   */
  lowestPrice: number;

  /*
   * Approved manual/local price.
   */
  manualPrice: number | null;

  manualPriceEligible: boolean;

  /*
   * Shipping is supplied separately by fulfilment.
   */
  shipping: number;

  /*
   * True only when the CURRENT resolved fulfilment
   * has zero shipping.
   */
  freeShipping: boolean;

  available: true;
};


export interface PurchasableProductSkuResult {
  family: ProductFamily;
  skuObj: PurchasableSku;
}


/* ============================================================================
 * NORMALIZATION
 * ========================================================================== */

function normalizeSkuCode(
  skuCode: string,
): string {
  return skuCode
    .trim()
    .toUpperCase();
}


/* ============================================================================
 * SALES CONFIG RESOLUTION
 * ========================================================================== */

function getSalesConfig(
  sku: Sku,
): SalesSkuConfig | undefined {
  return getSalesSku(
    normalizeSkuCode(
      sku.sku,
    ),
  );
}


/* ============================================================================
 * RESOLVE SKU
 *
 * General catalogue resolution.
 *
 * IMPORTANT:
 *
 * websitePrice is now the BASE website selling price.
 * ========================================================================== */

function resolveSku(
  sku: Sku,
): Sku | undefined {
  const sales =
    getSalesConfig(sku);

  if (!sales) {
    return undefined;
  }

  const websiteSellingPrice =
    getSellingPrice(
      sales.sku,
    );

  if (
    websiteSellingPrice ===
      null ||
    !Number.isFinite(
      websiteSellingPrice,
    )
  ) {
    return undefined;
  }

  return {
    ...sku,

    sku:
      sales.sku,

    packSize:
      sales.packSize,

    mrp:
      sales.mrp,

    /*
     * BASE WEBSITE SELLING PRICE.
     *
     * Shipping is intentionally NOT added here.
     */
    websitePrice:
      websiteSellingPrice,

    /*
     * Shipping is resolved separately.
     */
    shipping: 0,

    freeShipping: false,

    available:
      sales.available,
  };
}


/* ============================================================================
 * PURCHASABLE SKU CHECK
 * ========================================================================== */

function isPurchasableSku(
  sku: Sku,
): boolean {
  const sales =
    getSalesConfig(sku);

  if (!sales) {
    return false;
  }

  if (!sales.available) {
    return false;
  }

  if (
    sales.mrp === null ||
    sales.sellingPrice === null
  ) {
    return false;
  }

  if (
    !Number.isFinite(
      sales.mrp,
    ) ||
    !Number.isFinite(
      sales.sellingPrice,
    )
  ) {
    return false;
  }

  if (
    sales.mrp < 0 ||
    sales.sellingPrice < 0
  ) {
    return false;
  }

  /*
   * New model:
   *
   * websitePrice = sellingPrice
   *
   * No SKU-level shipping is added.
   */
  const websiteSellingPrice =
    getSellingPrice(
      sales.sku,
    );

  if (
    websiteSellingPrice ===
      null ||
    !Number.isFinite(
      websiteSellingPrice,
    ) ||
    websiteSellingPrice < 0
  ) {
    return false;
  }

  return true;
}


/* ============================================================================
 * CONVERT TO PURCHASABLE SKU
 * ========================================================================== */

function toPurchasableSku(
  sku: Sku,
): PurchasableSku | undefined {
  if (
    !isPurchasableSku(sku)
  ) {
    return undefined;
  }

  const sales =
    getSalesConfig(sku);

  if (
    !sales ||
    sales.mrp === null ||
    sales.sellingPrice === null
  ) {
    return undefined;
  }

  const websiteSellingPrice =
    getSellingPrice(
      sales.sku,
    );

  if (
    websiteSellingPrice ===
      null ||
    !Number.isFinite(
      websiteSellingPrice,
    )
  ) {
    return undefined;
  }

  const lowestPrice =
    getLowestPrice(
      sales.sku,
    );

  if (
    lowestPrice === null ||
    !Number.isFinite(
      lowestPrice,
    )
  ) {
    return undefined;
  }

  const manualPriceEligible =
    isManualPriceEligible(
      sales.sku,
    );

  const manualPrice =
    getManualPrice(
      sales.sku,
    );

  return {
    ...sku,

    sku:
      sales.sku,

    packSize:
      sales.packSize,

    mrp:
      sales.mrp,

    /*
     * BASE CUSTOMER PRODUCT PRICE.
     *
     * Example:
     *
     * KS-MMP-200 → ₹55
     *
     * NOT ₹102.
     */
    websitePrice:
      websiteSellingPrice,

    /*
     * Base product price before shipping.
     */
    lowestPrice,

    manualPrice,

    manualPriceEligible,

    /*
     * No shipping is attached at catalogue level.
     */
    shipping: 0,

    /*
     * Do not claim universal free shipping.
     *
     * MANUAL may become ₹0 shipping.
     * SHIPPING may receive a charge.
     */
    freeShipping: false,

    available: true,
  };
}


/* ============================================================================
 * PRODUCT SERVICE
 * ========================================================================== */

export const ProductService = {

  /* --------------------------------------------------------------------------
     ALL PRODUCTS
  -------------------------------------------------------------------------- */

  getAllProducts():
    ProductFamily[] {
    return products;
  },


  /* --------------------------------------------------------------------------
     PRODUCT BY SLUG
  -------------------------------------------------------------------------- */

  getProductBySlug(
    slug: string,
  ):
    | ProductFamily
    | undefined {
    const normalizedSlug =
      slug
        .trim()
        .toLowerCase();

    return products.find(
      (product) =>
        product.slug.toLowerCase() ===
        normalizedSlug,
    );
  },


  /* --------------------------------------------------------------------------
     PRODUCTS BY CATEGORY
  -------------------------------------------------------------------------- */

  getProductsByCategory(
    category: string,
  ): ProductFamily[] {
    const normalizedCategory =
      category
        .trim()
        .toLowerCase();

    if (
      !normalizedCategory ||
      normalizedCategory ===
        'all'
    ) {
      return products;
    }

    return products.filter(
      (product) =>
        product.category ===
        normalizedCategory,
    );
  },


  /* --------------------------------------------------------------------------
     FEATURED PRODUCTS
  -------------------------------------------------------------------------- */

  getFeaturedProducts():
    ProductFamily[] {
    return products.filter(
      (product) =>
        product.featured,
    );
  },


  /* --------------------------------------------------------------------------
     PRODUCT BY SKU
  -------------------------------------------------------------------------- */

  getProductBySku(
    skuCode: string,
  ):
    | ProductSkuResult
    | undefined {
    const normalizedSku =
      normalizeSkuCode(
        skuCode,
      );

    if (!normalizedSku) {
      return undefined;
    }

    for (
      const product of products
    ) {
      const sourceSku =
        product.skus.find(
          (sku) =>
            normalizeSkuCode(
              sku.sku,
            ) === normalizedSku,
        );

      if (!sourceSku) {
        continue;
      }

      const resolvedSku =
        resolveSku(
          sourceSku,
        );

      if (!resolvedSku) {
        return undefined;
      }

      return {
        family: product,
        skuObj: resolvedSku,
      };
    }

    return undefined;
  },


  /* --------------------------------------------------------------------------
     PURCHASABLE PRODUCT BY SKU
  -------------------------------------------------------------------------- */

  getPurchasableProductBySku(
    skuCode: string,
  ):
    | PurchasableProductSkuResult
    | undefined {
    const normalizedSku =
      normalizeSkuCode(
        skuCode,
      );

    if (!normalizedSku) {
      return undefined;
    }

    for (
      const product of products
    ) {
      const sourceSku =
        product.skus.find(
          (sku) =>
            normalizeSkuCode(
              sku.sku,
            ) === normalizedSku,
        );

      if (!sourceSku) {
        continue;
      }

      const skuObj =
        toPurchasableSku(
          sourceSku,
        );

      if (!skuObj) {
        return undefined;
      }

      return {
        family: product,
        skuObj,
      };
    }

    return undefined;
  },


  /* --------------------------------------------------------------------------
     AVAILABLE SKUS FOR A PRODUCT
  -------------------------------------------------------------------------- */

  getAvailableSkus(
    product: ProductFamily,
  ): PurchasableSku[] {
    const available:
      PurchasableSku[] = [];

    for (
      const sku of
      product.skus
    ) {
      const resolved =
        toPurchasableSku(
          sku,
        );

      if (resolved) {
        available.push(
          resolved,
        );
      }
    }

    return available;
  },


  /* --------------------------------------------------------------------------
     BASE WEBSITE PRICE
  -------------------------------------------------------------------------- */

  getWebsitePrice(
    skuCode: string,
  ):
    | number
    | undefined {
    const result =
      ProductService
        .getPurchasableProductBySku(
          skuCode,
        );

    return result
      ?.skuObj
      .websitePrice;
  },


  /* --------------------------------------------------------------------------
     BASE SELLING PRICE
  -------------------------------------------------------------------------- */

  getSellingPrice(
    skuCode: string,
  ):
    | number
    | undefined {
    const sales =
      getSalesSku(
        normalizeSkuCode(
          skuCode,
        ),
      );

    return (
      sales?.sellingPrice ??
      undefined
    );
  },


  /* --------------------------------------------------------------------------
     LOWEST PRICE
  -------------------------------------------------------------------------- */

  getLowestPrice(
    skuCode: string,
  ):
    | number
    | undefined {
    return (
      getLowestPrice(
        normalizeSkuCode(
          skuCode,
        ),
      ) ??
      undefined
    );
  },


  /* --------------------------------------------------------------------------
     MANUAL / LOCAL PRICE
  -------------------------------------------------------------------------- */

  getManualPrice(
    skuCode: string,
  ):
    | number
    | undefined {
    return (
      getManualPrice(
        normalizeSkuCode(
          skuCode,
        ),
      ) ??
      undefined
    );
  },


  /* --------------------------------------------------------------------------
     MANUAL PRICE ELIGIBILITY
  -------------------------------------------------------------------------- */

  isManualPriceEligible(
    skuCode: string,
  ): boolean {
    return isManualPriceEligible(
      normalizeSkuCode(
        skuCode,
      ),
    );
  },


  /* --------------------------------------------------------------------------
     PRICE FOR FULFILMENT
     --------------------------------------------------------------------------
     IMPORTANT:
     For SHIPPING, the actual shipping charge must be supplied by the
     fulfilment system/backend.

     This frontend helper therefore returns the base price for MANUAL and
     the base price plus any explicitly supplied shipping charge for SHIPPING.
  -------------------------------------------------------------------------- */

  getPriceForFulfillment(
    skuCode: string,
    fulfillmentType:
      | 'MANUAL'
      | 'SHIPPING',
    shippingCharge = 0,
  ):
    | number
    | undefined {
    return (
      getPriceForFulfillment(
        normalizeSkuCode(
          skuCode,
        ),
        fulfillmentType,
        shippingCharge,
      ) ??
      undefined
    );
  },


  /* --------------------------------------------------------------------------
     SEARCH
  -------------------------------------------------------------------------- */

  searchProducts(
    query: string,
  ): ProductFamily[] {
    const q =
      query
        .toLowerCase()
        .trim();

    if (!q) {
      return products;
    }

    return products.filter(
      (product) => {
        const matchesProduct =
          product.name
            .toLowerCase()
            .includes(q) ||
          product.hindiName
            .includes(q) ||
          product.variant
            .toLowerCase()
            .includes(q) ||
          product.category
            .toLowerCase()
            .includes(q) ||
          product.description
            .toLowerCase()
            .includes(q);

        const matchesSku =
          product.skus.some(
            (sku) => {
              const sales =
                getSalesConfig(
                  sku,
                );

              return (
                sku.sku
                  .toLowerCase()
                  .includes(q) ||
                String(
                  sales?.packSize ??
                    sku.packSize,
                ).includes(q)
              );
            },
          );

        return (
          matchesProduct ||
          matchesSku
        );
      },
    );
  },


  /* --------------------------------------------------------------------------
     RELATED PRODUCTS
  -------------------------------------------------------------------------- */

  getRelatedProducts(
    product: ProductFamily,
    count = 4,
  ): ProductFamily[] {
    if (
      count <= 0
    ) {
      return [];
    }

    const sameCategory =
      products.filter(
        (item) =>
          item.id !== product.id &&
          item.category ===
            product.category &&
          item.skus.some(
            (sku) =>
              toPurchasableSku(
                sku,
              ) !== undefined,
          ),
      );

    const otherCategory =
      products.filter(
        (item) =>
          item.id !== product.id &&
          item.category !==
            product.category &&
          item.skus.some(
            (sku) =>
              toPurchasableSku(
                sku,
              ) !== undefined,
          ),
      );

    return [
      ...sameCategory,
      ...otherCategory,
    ].slice(
      0,
      count,
    );
  },


  /* --------------------------------------------------------------------------
     FLAT CUSTOMER-FACING CATALOG
  -------------------------------------------------------------------------- */

  getAllFlatItems():
    FlatProductItem[] {
    const list:
      FlatProductItem[] = [];

    for (
      const family of products
    ) {
      for (
        const sourceSku of
        family.skus
      ) {
        const sku =
          toPurchasableSku(
            sourceSku,
          );

        if (!sku) {
          continue;
        }

        list.push({
          familyId:
            family.id,

          slug:
            family.slug,

          name:
            family.name,

          hindiName:
            family.hindiName,

          category:
            family.category,

          description:
            family.description,

          sku:
            sku.sku,

          packSize:
            sku.packSize,

          mrp:
            sku.mrp,

          /*
           * BASE WEBSITE SELLING PRICE.
           */
          websitePrice:
            sku.websitePrice,

          lowestPrice:
            sku.lowestPrice,

          manualPrice:
            sku.manualPrice,

          manualPriceEligible:
            sku.manualPriceEligible,

          /*
           * No shipping is attached at catalogue level.
           */
          shipping: 0,

          /*
           * Do not claim universal free shipping.
           */
          freeShipping: false,

          available: true,

          featured:
            family.featured,
        });
      }
    }

    return list;
  },


  /* --------------------------------------------------------------------------
     PRODUCTS WITH AT LEAST ONE PURCHASABLE SKU
  -------------------------------------------------------------------------- */

  getPurchasableProducts():
    ProductFamily[] {
    return products.filter(
      (product) =>
        product.skus.some(
          (sku) =>
            toPurchasableSku(
              sku,
            ) !== undefined,
        ),
    );
  },


  /* --------------------------------------------------------------------------
     IS PURCHASABLE
  -------------------------------------------------------------------------- */

  isPurchasable(
    skuCode: string,
  ): boolean {
    return (
      ProductService
        .getPurchasableProductBySku(
          skuCode,
        ) !== undefined
    );
  },


  /* --------------------------------------------------------------------------
     VALIDATE PRODUCT DATA
  -------------------------------------------------------------------------- */

  validateProductData(): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] =
      [];

    const seenSkus =
      new Set<string>();

    for (
      const product of products
    ) {
      for (
        const sku of
        product.skus
      ) {
        const normalizedSku =
          normalizeSkuCode(
            sku.sku,
          );

        /* Duplicate SKU */

        if (
          seenSkus.has(
            normalizedSku,
          )
        ) {
          errors.push(
            `Duplicate SKU: ${sku.sku}`,
          );
        }

        seenSkus.add(
          normalizedSku,
        );

        /* Central sales configuration */

        const sales =
          getSalesConfig(
            sku,
          );

        if (!sales) {
          errors.push(
            `${sku.sku}: missing from central sales configuration`,
          );
          continue;
        }

        /* SKU identity */

        if (
          sales.sku !==
          normalizedSku
        ) {
          errors.push(
            `${sku.sku}: sales configuration SKU mismatch`,
          );
        }

        /* Pack size */

        if (
          sales.packSize !==
          sku.packSize
        ) {
          errors.push(
            `${sku.sku}: pack size mismatch`,
          );
        }

        /* MRP */

        if (
          sales.mrp !== null &&
          (
            !Number.isFinite(
              sales.mrp,
            ) ||
            sales.mrp < 0
          )
        ) {
          errors.push(
            `${sku.sku}: invalid MRP`,
          );
        }

        /* Base website selling price */

        if (
          sales.sellingPrice !==
            null &&
          (
            !Number.isFinite(
              sales.sellingPrice,
            ) ||
            sales.sellingPrice < 0
          )
        ) {
          errors.push(
            `${sku.sku}: invalid selling price`,
          );
        }

        /* Available SKU */

        if (
          sales.available
        ) {
          if (
            sales.mrp === null
          ) {
            errors.push(
              `${sku.sku}: available SKU has no MRP`,
            );
          }

          if (
            sales.sellingPrice ===
            null
          ) {
            errors.push(
              `${sku.sku}: available SKU has no selling price`,
            );
          }

          /*
           * Product websitePrice must exactly equal the
           * approved BASE selling price.
           */
          if (
            sku.websitePrice !==
            sales.sellingPrice
          ) {
            errors.push(
              `${sku.sku}: websitePrice must equal approved sellingPrice. Expected ₹${sales.sellingPrice ?? 'invalid'}, got ₹${sku.websitePrice ?? 'invalid'}.`,
            );
          }
        }
      }
    }

    return {
      valid:
        errors.length === 0,

      errors,
    };
  },
};
