import {
  products,
  type ProductFamily,
  type Sku,
  type ProductCategory,
} from '../data/products';

import {
  getSalesSku,
  getFinalWebsitePrice,
  type SalesSkuConfig,
} from '../data/sales-config';

/* ============================================================================
 * CUSTOMER-FACING FLAT PRODUCT
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
  websitePrice: number;
  shipping: number;
  freeShipping: boolean;
  available: true;
}

/* ============================================================================
 * PRODUCT RESULT TYPES
 * ========================================================================== */

export interface ProductSkuResult {
  family: ProductFamily;
  skuObj: Sku;
}

/*
 * Purchasable SKU contains fully resolved commercial data.
 *
 * IMPORTANT:
 *
 * websitePrice = FINAL customer-facing price
 * shipping = actual shipping component
 *
 * Example:
 *
 * sellingPrice = ₹55
 * shipping     = ₹47
 * websitePrice = ₹102
 */
export type PurchasableSku = Omit<
  Sku,
  'mrp' | 'websitePrice' | 'available'
> & {
  mrp: number;
  websitePrice: number;
  shipping: number;
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
 *
 * sales-config.ts is the SINGLE authority for:
 *
 * - MRP
 * - website selling price
 * - shipping
 * - availability
 * - pack size
 *
 * products.ts remains responsible for:
 *
 * - product identity
 * - descriptions
 * - ingredients
 * - images
 * - category
 * - family metadata
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
 * General catalog lookup.
 *
 * The commercial values always come from sales-config.ts.
 * ========================================================================== */

function resolveSku(
  sku: Sku,
): Sku | undefined {
  const sales =
    getSalesConfig(sku);

  if (!sales) {
    return undefined;
  }

  const finalWebsitePrice =
    getFinalWebsitePrice(
      sales.sku,
    );

  if (
    sales.mrp === null ||
    sales.sellingPrice === null ||
    finalWebsitePrice === null
  ) {
    return {
      ...sku,

      sku: sales.sku,

      packSize:
        sales.packSize,

      mrp:
        sales.mrp,

      websitePrice:
        null,

      shipping:
        sales.shipping,

      freeShipping:
        sales.shipping === 0,

      available:
        sales.available,
    };
  }

  return {
    ...sku,

    sku: sales.sku,

    packSize:
      sales.packSize,

    mrp:
      sales.mrp,

    /*
     * FINAL customer-facing website price.
     *
     * sellingPrice + shipping
     */
    websitePrice:
      finalWebsitePrice,

    shipping:
      sales.shipping,

    freeShipping:
      sales.shipping === 0,

    available:
      sales.available,
  };
}

/* ============================================================================
 * PURCHASABLE SKU CHECK
 *
 * A SKU is purchasable when:
 *
 * 1. It exists in sales-config.
 * 2. It is marked available.
 * 3. It has a numeric MRP.
 * 4. It has a numeric selling price.
 * 5. It has valid shipping.
 * 6. Its final website price can be calculated.
 *
 * We do NOT silently reject a SKU because final price > MRP here.
 * ========================================================================== */

function isPurchasableSku(
  sku: Sku,
): sku is PurchasableSku {
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

  if (
    !Number.isFinite(
      sales.shipping,
    ) ||
    sales.shipping < 0
  ) {
    return false;
  }

  const finalWebsitePrice =
    getFinalWebsitePrice(
      sales.sku,
    );

  if (
    finalWebsitePrice === null ||
    !Number.isFinite(
      finalWebsitePrice,
    ) ||
    finalWebsitePrice < 0
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

  const finalWebsitePrice =
    getFinalWebsitePrice(
      sales.sku,
    );

  if (
    finalWebsitePrice === null
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
     * Final customer-facing price.
     */
    websitePrice:
      finalWebsitePrice,

    /*
     * Actual shipping component.
     */
    shipping:
      sales.shipping,

    freeShipping:
      sales.shipping === 0,

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

    for (const product of products) {
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

    for (const product of products) {
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
    const available: PurchasableSku[] =
      [];

    for (const sku of
      product.skus) {
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
     FINAL WEBSITE PRICE
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
     SHIPPING
  -------------------------------------------------------------------------- */

  getShipping(
    skuCode: string,
  ): number {
    const result =
      ProductService
        .getPurchasableProductBySku(
          skuCode,
        );

    return (
      result?.skuObj
        .shipping ?? 0
    );
  },

  /* --------------------------------------------------------------------------
     SELLING PRICE BEFORE SHIPPING
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
    ].slice(0, count);
  },

  /* --------------------------------------------------------------------------
     FLAT CUSTOMER-FACING CATALOG
  -------------------------------------------------------------------------- */

  getAllFlatItems():
    FlatProductItem[] {
    const list:
      FlatProductItem[] = [];

    for (const family of
      products) {
      for (const sourceSku of
        family.skus) {
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
           * Final customer-facing price.
           */
          websitePrice:
            sku.websitePrice,

          /*
           * Actual shipping component.
           */
          shipping:
            sku.shipping,

          freeShipping:
            sku.freeShipping,

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

    for (const product of
      products) {
      for (const sku of
        product.skus) {
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

        /* Sales configuration */

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

        /*
         * Pack size:
         *
         * sales-config is authoritative.
         */

        if (
          sales.packSize !==
          sku.packSize
        ) {
          errors.push(
            `${sku.sku}: product pack size does not match sales configuration`,
          );
        }

        /* Shipping */

        if (
          !Number.isFinite(
            sales.shipping,
          ) ||
          sales.shipping < 0
        ) {
          errors.push(
            `${sku.sku}: shipping must be a valid non-negative number`,
          );
        }

        /*
         * Free shipping must be derived from the actual
         * shipping value.
         */

        if (
          sales.freeShipping !==
          (sales.shipping === 0)
        ) {
          errors.push(
            `${sku.sku}: freeShipping does not match shipping`,
          );
        }

        /* Available SKU must have values */

        if (
          sales.available &&
          sales.sellingPrice ===
            null
        ) {
          errors.push(
            `${sku.sku}: available SKU must have a sellingPrice`,
          );
        }

        if (
          sales.available &&
          sales.mrp === null
        ) {
          errors.push(
            `${sku.sku}: available SKU must have an MRP`,
          );
        }

        /* Numeric MRP */

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
            `${sku.sku}: MRP must be a valid non-negative number`,
          );
        }

        /* Numeric selling price */

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
            `${sku.sku}: sellingPrice must be a valid non-negative number`,
          );
        }

        /*
         * Final website price must be calculable.
         */

        const finalPrice =
          getFinalWebsitePrice(
            sales.sku,
          );

        if (
          sales.available &&
          finalPrice === null
        ) {
          errors.push(
            `${sku.sku}: final website price could not be calculated`,
          );
        }
      }
    }

    /*
     * The central commercial master currently contains 43 SKUs.
     */

    const salesSkuCount =
      Object.keys(
        requireSalesSkuKeys(),
      ).length;

    if (
      salesSkuCount !== 43
    ) {
      errors.push(
        `Central sales configuration should contain 43 SKUs, found ${salesSkuCount}`,
      );
    }

    return {
      valid:
        errors.length === 0,
      errors,
    };
  },
};

/* ============================================================================
 * INTERNAL SALES SKU COUNT HELPER
 * ============================================================================
 *
 * Kept here to avoid exposing the complete SALES_SKUS object through the
 * service API.
 * ========================================================================== */

function requireSalesSkuKeys(): Record<
  string,
  unknown
> {
  /*
   * We already know getSalesSku is the central resolver.
   *
   * This helper intentionally checks the expected SKU list through the
   * product catalogue rather than maintaining a second SKU list here.
   */

  const keys: Record<
    string,
    unknown
  > = {};

  for (const product of
    products) {
    for (const sku of
      product.skus) {
      const normalized =
        normalizeSkuCode(
          sku.sku,
        );

      if (
        getSalesSku(
          normalized,
        )
      ) {
        keys[normalized] = true;
      }
    }
  }

  return keys;
}
