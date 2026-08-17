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

export interface ProductSkuResult {
  family: ProductFamily;
  skuObj: Sku;
}

export type PurchasableSku = Omit<
  Sku,
  'mrp' | 'websitePrice'
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

function normalizeSkuCode(
  skuCode: string,
): string {
  return skuCode.trim().toUpperCase();
}

/**
 * Sales configuration is the single authority for:
 * - MRP
 * - final website selling price
 * - availability
 * - shipping policy
 *
 * Product data remains responsible for:
 * - product identity
 * - descriptions
 * - ingredients
 * - images
 * - family/category information
 */
function getSalesConfig(
  sku: Sku,
): SalesSkuConfig | undefined {
  return getSalesSku(
    normalizeSkuCode(sku.sku),
  );
}

/**
 * Creates the customer-facing SKU object by combining
 * catalogue metadata with the central sales configuration.
 */
function resolveSku(
  sku: Sku,
): Sku | undefined {
  const sales = getSalesConfig(sku);

  if (!sales) {
    return undefined;
  }

  return {
    ...sku,
    sku: sales.sku,
    packSize: sales.packSize,
    mrp: sales.mrp,
    websitePrice: sales.sellingPrice,
    shipping: 0,
    freeShipping: true,
    available: sales.available,
  };
}

/**
 * Returns only SKUs that are actually purchasable.
 *
 * A SKU is purchasable only when:
 * - it exists in the central sales configuration
 * - it is marked available
 * - it has a valid MRP
 * - it has a valid final website selling price
 */
function isPurchasableSku(
  sku: Sku,
): sku is PurchasableSku {
  const sales = getSalesConfig(sku);

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
    !Number.isFinite(sales.mrp) ||
    !Number.isFinite(
      sales.sellingPrice,
    )
  ) {
    return false;
  }

  if (sales.mrp < 0) {
    return false;
  }

  if (sales.sellingPrice < 0) {
    return false;
  }

  const resolved = resolveSku(sku);

  if (!resolved) {
    return false;
  }

  return (
    typeof resolved.mrp === 'number' &&
    Number.isFinite(resolved.mrp) &&
    typeof resolved.websitePrice ===
      'number' &&
    Number.isFinite(
      resolved.websitePrice,
    ) &&
    resolved.available === true &&
    resolved.shipping === 0 &&
    resolved.freeShipping === true
  );
}

function toPurchasableSku(
  sku: Sku,
): PurchasableSku | undefined {
  if (!isPurchasableSku(sku)) {
    return undefined;
  }

  const sales = getSalesConfig(sku);

  if (
    !sales ||
    sales.mrp === null ||
    sales.sellingPrice === null
  ) {
    return undefined;
  }

  return {
    ...sku,
    sku: sales.sku,
    packSize: sales.packSize,
    mrp: sales.mrp,
    websitePrice: sales.sellingPrice,
    shipping: 0,
    freeShipping: true,
    available: true,
  };
}

export const ProductService = {
  getAllProducts(): ProductFamily[] {
    return products;
  },

  getProductBySlug(
    slug: string,
  ): ProductFamily | undefined {
    return products.find(
      (product) =>
        product.slug === slug,
    );
  },

  getProductsByCategory(
    category: string,
  ): ProductFamily[] {
    if (
      !category ||
      category === 'all'
    ) {
      return products;
    }

    return products.filter(
      (product) =>
        product.category === category,
    );
  },

  getFeaturedProducts(): ProductFamily[] {
    return products.filter(
      (product) =>
        product.featured,
    );
  },

  getProductBySku(
    skuCode: string,
  ): ProductSkuResult | undefined {
    const normalizedSku =
      normalizeSkuCode(skuCode);

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
        resolveSku(sourceSku);

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

  getPurchasableProductBySku(
    skuCode: string,
  ):
    | PurchasableProductSkuResult
    | undefined {
    const normalizedSku =
      normalizeSkuCode(skuCode);

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
        toPurchasableSku(sourceSku);

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

  getAvailableSkus(
    product: ProductFamily,
  ): PurchasableSku[] {
    const available: PurchasableSku[] =
      [];

    for (const sku of product.skus) {
      const resolved =
        toPurchasableSku(sku);

      if (resolved) {
        available.push(resolved);
      }
    }

    return available;
  },

  getWebsitePrice(
    skuCode: string,
  ): number | undefined {
    const result =
      ProductService.getPurchasableProductBySku(
        skuCode,
      );

    return result?.skuObj
      .websitePrice;
  },

  searchProducts(
    query: string,
  ): ProductFamily[] {
    const q = query
      .toLowerCase()
      .trim();

    if (!q) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name
          .toLowerCase()
          .includes(q) ||
        product.hindiName.includes(q) ||
        product.variant
          .toLowerCase()
          .includes(q) ||
        product.category
          .toLowerCase()
          .includes(q) ||
        product.description
          .toLowerCase()
          .includes(q) ||
        product.skus.some(
          (sku) => {
            const sales =
              getSalesConfig(sku);

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
        ),
    );
  },

  getRelatedProducts(
    product: ProductFamily,
    count = 4,
  ): ProductFamily[] {
    return products
      .filter(
        (item) =>
          item.id !== product.id &&
          item.category ===
            product.category,
      )
      .concat(
        products.filter(
          (item) =>
            item.id !== product.id &&
            item.category !==
              product.category,
        ),
      )
      .slice(0, count);
  },

  getAllFlatItems(): FlatProductItem[] {
    const list: FlatProductItem[] =
      [];

    for (const family of products) {
      for (const sourceSku of family.skus) {
        const sku =
          toPurchasableSku(sourceSku);

        if (!sku) {
          continue;
        }

        list.push({
          familyId: family.id,
          slug: family.slug,
          name: family.name,
          hindiName: family.hindiName,
          category: family.category,
          description:
            family.description,
          sku: sku.sku,
          packSize: sku.packSize,
          mrp: sku.mrp,
          websitePrice:
            sku.websitePrice,
          shipping: 0,
          freeShipping: true,
          available: true,
          featured: family.featured,
        });
      }
    }

    return list;
  },

  getPurchasableProducts():
    ProductFamily[] {
    return products.filter(
      (product) =>
        product.skus.some(
          (sku) =>
            toPurchasableSku(sku) !==
            undefined,
        ),
    );
  },

  isPurchasable(
    skuCode: string,
  ): boolean {
    return (
      ProductService.getPurchasableProductBySku(
        skuCode,
      ) !== undefined
    );
  },

  validateProductData(): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    const seenSkus =
      new Set<string>();

    for (const product of products) {
      for (const sku of product.skus) {
        const normalizedSku =
          normalizeSkuCode(
            sku.sku,
          );

        if (
          seenSkus.has(normalizedSku)
        ) {
          errors.push(
            `Duplicate SKU: ${sku.sku}`,
          );
        }

        seenSkus.add(normalizedSku);

        const sales =
          getSalesConfig(sku);

        if (!sales) {
          errors.push(
            `${sku.sku}: missing from central sales configuration`,
          );
          continue;
        }

        if (
          sales.sku !==
          normalizedSku
        ) {
          errors.push(
            `${sku.sku}: sales configuration SKU mismatch`,
          );
        }

        if (sales.shipping !== 0) {
          errors.push(
            `${sku.sku}: shipping must be 0`,
          );
        }

        if (!sales.freeShipping) {
          errors.push(
            `${sku.sku}: freeShipping must be true`,
          );
        }

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

        if (
          sales.available &&
          sales.sellingPrice !==
            null &&
          sales.mrp !== null &&
          sales.sellingPrice >
            sales.mrp
        ) {
          errors.push(
            `${sku.sku}: sellingPrice cannot exceed MRP`,
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};
