import {
  products,
  type ProductFamily,
  type Sku,
  type ProductCategory,
} from '../data/products';

import {
  getMasterSku,
  isProductMasterReady,
} from './product-master-store';


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


function applyMasterPrices(
  sku: Sku,
): Sku | undefined {
  if (
    !isProductMasterReady()
  ) {
    return undefined;
  }

  const master =
    getMasterSku(
      sku.sku,
    );

  if (
    !master ||
    !master.active
  ) {
    return undefined;
  }

  if (
    !Number.isFinite(
      master.selling_price,
    ) ||
    master.selling_price < 0 ||
    !Number.isFinite(
      master.mrp,
    ) ||
    master.mrp < 0 ||
    !Number.isFinite(
      master.weight_g,
    ) ||
    master.weight_g <= 0
  ) {
    return undefined;
  }

  return {
    ...sku,

    sku:
      master.sku,

    packSize:
      master.weight_g as Sku['packSize'],

    mrp:
      master.mrp,

    websitePrice:
      master.selling_price,

    shipping: 0,

    freeShipping: false,

    available:
      master.active,
  };
}


function overlayFamily(
  product: ProductFamily,
): ProductFamily {
  return {
    ...product,
    skus: product.skus.map(
      (sku) =>
        applyMasterPrices(
          sku,
        ) ?? {
          ...sku,
          websitePrice: null,
          available: false,
        },
    ),
  };
}


/* ============================================================================
 * SALES CONFIG RESOLUTION
 * ========================================================================== */

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
  return applyMasterPrices(sku);
}


/* ============================================================================
 * PURCHASABLE SKU CHECK
 * ========================================================================== */

function isPurchasableSku(
  sku: Sku,
): boolean {
  return applyMasterPrices(sku) !== undefined;
}


/* ============================================================================
 * CONVERT TO PURCHASABLE SKU
 * ========================================================================== */

function toPurchasableSku(
  sku: Sku,
): PurchasableSku | undefined {
  const resolved =
    applyMasterPrices(
      sku,
    );

  if (!resolved) {
    return undefined;
  }

  const websiteSellingPrice =
    resolved.websitePrice;

  if (
    websiteSellingPrice ===
      null ||
    !Number.isFinite(
      websiteSellingPrice,
    )
  ) {
    return undefined;
  }

  const mrp =
    resolved.mrp;

  if (
    mrp === null ||
    !Number.isFinite(
      mrp,
    )
  ) {
    return undefined;
  }

  return {
    ...resolved,

    mrp,

    websitePrice:
      websiteSellingPrice,

    lowestPrice:
      websiteSellingPrice,

    manualPrice:
      websiteSellingPrice,

    manualPriceEligible: true,

    shipping: 0,

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
    return products.map(
      overlayFamily,
    );
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

    const product =
      products.find(
        (item) =>
          item.slug.toLowerCase() ===
          normalizedSlug,
      );

    return product
      ? overlayFamily(
          product,
        )
      : undefined;
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
      return products.map(
        overlayFamily,
      );
    }

    return products
      .filter(
        (product) =>
          product.category ===
          normalizedCategory,
      )
      .map(
        overlayFamily,
      );
  },


  /* --------------------------------------------------------------------------
     FEATURED PRODUCTS
  -------------------------------------------------------------------------- */

  getFeaturedProducts():
    ProductFamily[] {
    return products
      .filter(
        (product) =>
          product.featured,
      )
      .map(
        overlayFamily,
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
        family:
          overlayFamily(
            product,
          ),
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
        family:
          overlayFamily(
            product,
          ),
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
    const master =
      getMasterSku(
        normalizeSkuCode(
          skuCode,
        ),
      );

    if (
      !isProductMasterReady() ||
      !master ||
      !master.active
    ) {
      return undefined;
    }

    return master.selling_price;
  },


  /* --------------------------------------------------------------------------
     LOWEST PRICE
  -------------------------------------------------------------------------- */

  getLowestPrice(
    skuCode: string,
  ):
    | number
    | undefined {
    return ProductService.getSellingPrice(
      skuCode,
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
    return ProductService.getSellingPrice(
      skuCode,
    );
  },


  /* --------------------------------------------------------------------------
     MANUAL PRICE ELIGIBILITY
  -------------------------------------------------------------------------- */

  isManualPriceEligible(
    skuCode: string,
  ): boolean {
    return (
      ProductService.getSellingPrice(
        skuCode,
      ) !== undefined
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
    const sellingPrice =
      ProductService.getSellingPrice(
        skuCode,
      );

    if (
      sellingPrice ===
      undefined
    ) {
      return undefined;
    }

    if (
      fulfillmentType ===
      'MANUAL'
    ) {
      return sellingPrice;
    }

    if (
      !Number.isFinite(
        shippingCharge,
      ) ||
      shippingCharge < 0
    ) {
      return undefined;
    }

    return (
      sellingPrice +
      shippingCharge
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
            (sku) =>
              sku.sku
                .toLowerCase()
                .includes(q) ||
              String(
                sku.packSize,
              ).includes(q),
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

        if (
          sku.websitePrice !==
          null
        ) {
          errors.push(
            `${sku.sku}: presentation catalogue must not store websitePrice`,
          );
        }
      }
    }

    if (seenSkus.size !== 43) {
      errors.push(
        `Expected 43 product SKUs but found ${seenSkus.size}.`,
      );
    }

    return {
      valid:
        errors.length === 0,

      errors,
    };
  },
};
