import {
  products,
  type ProductFamily,
  type Sku,
  type ProductCategory,
} from '../data/products';

import {
  getSalesSku,
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
 *
 * sales-config.ts is the SINGLE authority for:
 *
 * - MRP
 * - final website price
 * - availability
 * - pack size
 * - shipping policy
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
 * This function deliberately keeps the nullable base Sku type.
 *
 * It is used for general catalog lookup.
 *
 * Purchasable operations MUST use toPurchasableSku().
 * ========================================================================== */

function resolveSku(
  sku: Sku,
): Sku | undefined {
  const sales =
    getSalesConfig(sku);

  if (!sales) {
    return undefined;
  }

  return {
    ...sku,

    sku: sales.sku,

    packSize:
      sales.packSize,

    mrp:
      sales.mrp,

    websitePrice:
      sales.sellingPrice,

    shipping: 0,

    freeShipping: true,

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
 * 4. It has a numeric website selling price.
 * 5. Price values are non-negative.
 *
 * IMPORTANT:
 *
 * We intentionally DO NOT reject a SKU here merely because
 * websitePrice > MRP.
 *
 * That relationship is a product/legal-master issue that must
 * be resolved in the sales master and physical packaging.
 *
 * The service must not silently make a configured SKU disappear.
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

  return {
    ...sku,

    sku:
      sales.sku,

    packSize:
      sales.packSize,

    mrp:
      sales.mrp,

    websitePrice:
      sales.sellingPrice,

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
     WEBSITE PRICE
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

        /* Pack size */
        if (
          sales.packSize !==
          sku.packSize
        ) {
          /*
           * The sales master is authoritative,
           * therefore this is reported rather than
           * allowing stale product data to win.
           */
          errors.push(
            `${sku.sku}: product pack size does not match sales configuration`,
          );
        }

        /* Shipping policy */
        if (
          sales.shipping !== 0
        ) {
          errors.push(
            `${sku.sku}: shipping must be 0`,
          );
        }

        if (
          sales.freeShipping !==
          true
        ) {
          errors.push(
            `${sku.sku}: freeShipping must be true`,
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
      }
    }

    return {
      valid:
        errors.length === 0,
      errors,
    };
  },
};
