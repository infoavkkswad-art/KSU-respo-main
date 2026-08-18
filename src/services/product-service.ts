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

  /*
   * Customer-facing shipping is already included in websitePrice.
   */
  shipping: 0;
  freeShipping: true;
  available: true;

  featured?: boolean;
}

/* ============================================================================
 * PRODUCT RESULT TYPES
 * ========================================================================== */

export interface ProductSkuResult {
  family: ProductFamily;
  skuObj: Sku;
}

/*
 * Customer-facing purchasable SKU.
 *
 * IMPORTANT:
 *
 * websitePrice is the FINAL customer-facing price.
 *
 * The central sales master internally stores:
 *
 * sellingPrice + shipping
 * -----------------------
 * final website price
 *
 * The customer-facing Sku continues to use:
 *
 * shipping: 0
 * freeShipping: true
 *
 * because shipping is already included in the final website price.
 */

export type PurchasableSku = Omit<
  Sku,
  'mrp' | 'websitePrice' | 'available'
> & {
  mrp: number;
  websitePrice: number;
  shipping: 0;
  freeShipping: true;
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
 * General catalog resolution.
 *
 * Customer-facing websitePrice is ALWAYS the calculated final price.
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

  return {
    ...sku,

    sku:
      sales.sku,

    packSize:
      sales.packSize,

    mrp:
      sales.mrp,

    /*
     * IMPORTANT:
     *
     * This is:
     *
     * sellingPrice + shipping
     */
    websitePrice:
      finalWebsitePrice,

    /*
     * Shipping is already included in
     * customer-facing websitePrice.
     */
    shipping: 0,

    freeShipping: true,

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
     * FINAL CUSTOMER PRICE
     *
     * Example:
     * ₹55 selling + ₹47 shipping = ₹102
     */
    websitePrice:
      finalWebsitePrice,

    /*
     * Shipping is already included in
     * websitePrice at the customer layer.
     */
    shipping: 0,

    freeShipping: true,

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
     INTERNAL SELLING PRICE
     ========================================================================== */

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

          websitePrice:
            sku.websitePrice,

          shipping: 0,

          freeShipping: true,

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

        /* Selling price */

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

        /* Shipping */

        if (
          !Number.isFinite(
            sales.shipping,
          ) ||
          sales.shipping < 0
        ) {
          errors.push(
            `${sku.sku}: invalid shipping`,
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

          const finalPrice =
            getFinalWebsitePrice(
              sales.sku,
            );

          if (
            finalPrice ===
              null ||
            !Number.isFinite(
              finalPrice,
            )
          ) {
            errors.push(
              `${sku.sku}: final website price cannot be calculated`,
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
