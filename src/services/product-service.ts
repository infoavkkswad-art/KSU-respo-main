import {
  products,
  ProductFamily,
  Sku,
  ProductCategory,
} from '../data/products';

export interface FlatProductItem {
  familyId: string;
  slug: string;
  name: string;
  hindiName: string;
  category: ProductCategory;
  description: string;
  sku: string;
  packSize: number;
  mrp: number;
  websitePrice: number;
  shipping: 0;
  freeShipping: true;
  available: boolean;
  featured?: boolean;
}

export interface ProductSkuResult {
  family: ProductFamily;
  skuObj: Sku;
}

export interface PurchasableProductSkuResult {
  family: ProductFamily;
  skuObj: Sku & {
    websitePrice: number;
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
      (product) => product.slug === slug,
    );
  },

  getProductsByCategory(
    category: string,
  ): ProductFamily[] {
    if (!category || category === 'all') {
      return products;
    }

    return products.filter(
      (product) =>
        product.category === category,
    );
  },

  getFeaturedProducts(): ProductFamily[] {
    return products.filter(
      (product) => product.featured,
    );
  },

  /**
   * Returns the complete SKU record.
   *
   * This can include unavailable SKUs whose
   * websitePrice is null.
   */
  getProductBySku(
    skuCode: string,
  ): ProductSkuResult | undefined {
    const normalizedSku =
      skuCode.trim().toUpperCase();

    for (const product of products) {
      const skuObj = product.skus.find(
        (sku) =>
          sku.sku.toUpperCase() ===
          normalizedSku,
      );

      if (skuObj) {
        return {
          family: product,
          skuObj,
        };
      }
    }

    return undefined;
  },

  /**
   * Returns a SKU only when it is currently
   * purchasable on the website.
   *
   * This is the method to use for:
   * - Cart
   * - Checkout
   * - Order totals
   * - Buy buttons
   * - Add-to-cart actions
   */
  getPurchasableProductBySku(
    skuCode: string,
  ): PurchasableProductSkuResult | undefined {
    const result =
      ProductService.getProductBySku(
        skuCode,
      );

    if (
      !result ||
      !result.skuObj.available ||
      result.skuObj.websitePrice === null
    ) {
      return undefined;
    }

    return {
      family: result.family,
      skuObj: {
        ...result.skuObj,
        websitePrice:
          result.skuObj.websitePrice,
      },
    };
  },

  /**
   * Returns only currently available SKUs
   * for a product family.
   */
  getAvailableSkus(
    product: ProductFamily,
  ): Sku[] {
    return product.skus.filter(
      (sku) =>
        sku.available &&
        sku.websitePrice !== null,
    );
  },

  /**
   * Returns the customer-facing price.
   *
   * websitePrice is already the final price.
   * Shipping is never added here.
   */
  getWebsitePrice(
    skuCode: string,
  ): number | undefined {
    const result =
      ProductService.getPurchasableProductBySku(
        skuCode,
      );

    return result?.skuObj.websitePrice;
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
        product.category.includes(q) ||
        product.description
          .toLowerCase()
          .includes(q) ||
        product.skus.some(
          (sku) =>
            sku.sku
              .toLowerCase()
              .includes(q) ||
            String(
              sku.packSize,
            ).includes(q),
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

  /**
   * Returns only purchasable SKU records.
   *
   * This keeps null website prices and
   * unavailable SKUs out of shopping data.
   */
  getAllFlatItems(): FlatProductItem[] {
    const list: FlatProductItem[] = [];

    for (const family of products) {
      for (const skuObj of family.skus) {
        if (
          !skuObj.available ||
          skuObj.websitePrice === null ||
          skuObj.mrp === null
        ) {
          continue;
        }

        list.push({
          familyId: family.id,
          slug: family.slug,
          name: family.name,
          hindiName: family.hindiName,
          category: family.category,
          description: family.description,
          sku: skuObj.sku,
          packSize: skuObj.packSize,
          mrp: skuObj.mrp,
          websitePrice:
            skuObj.websitePrice,

          /*
           * Customer-facing sales rule:
           *
           * websitePrice is the FINAL price.
           * Shipping is already included.
           *
           * Never add shipping again.
           * Never display a separate shipping charge.
           */
          shipping: 0,
          freeShipping: true,
          available: true,

          featured: family.featured,
        });
      }
    }

    return list;
  },

  /**
   * Returns only products that have at least
   * one currently purchasable SKU.
   */
  getPurchasableProducts(): ProductFamily[] {
    return products.filter(
      (product) =>
        product.skus.some(
          (sku) =>
            sku.available &&
            sku.websitePrice !== null,
        ),
    );
  },

  /**
   * Returns whether a SKU can currently be
   * purchased from the website.
   */
  isPurchasable(
    skuCode: string,
  ): boolean {
    return (
      ProductService.getPurchasableProductBySku(
        skuCode,
      ) !== undefined
    );
  },

  /**
   * Central validation for the product/sales
   * relationship.
   *
   * Customer pricing rules:
   * - shipping is always 0
   * - freeShipping is always true
   * - websitePrice comes from sales config
   */
  validateProductData(): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (const product of products) {
      const skuSet = new Set<string>();

      for (const sku of product.skus) {
        if (skuSet.has(sku.sku)) {
          errors.push(
            `Duplicate SKU: ${sku.sku}`,
          );
        }

        skuSet.add(sku.sku);

        if (sku.shipping !== 0) {
          errors.push(
            `${sku.sku}: shipping must be 0`,
          );
        }

        if (!sku.freeShipping) {
          errors.push(
            `${sku.sku}: freeShipping must be true`,
          );
        }

        if (
          sku.available &&
          sku.websitePrice === null
        ) {
          errors.push(
            `${sku.sku}: available SKU cannot have null websitePrice`,
          );
        }

        if (
          sku.mrp !== null &&
          sku.mrp < 0
        ) {
          errors.push(
            `${sku.sku}: MRP cannot be negative`,
          );
        }

        if (
          sku.websitePrice !== null &&
          sku.websitePrice < 0
        ) {
          errors.push(
            `${sku.sku}: websitePrice cannot be negative`,
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
