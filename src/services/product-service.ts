import {
  products,
  type ProductFamily,
  type Sku,
  type ProductCategory,
} from '../data/products';

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

export type PurchasableSku = Sku & {
  mrp: number;
  websitePrice: number;
};

export interface PurchasableProductSkuResult {
  family: ProductFamily;
  skuObj: PurchasableSku;
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

  getPurchasableProductBySku(
    skuCode: string,
  ): PurchasableProductSkuResult | undefined {
    const result =
      ProductService.getProductBySku(
        skuCode,
      );

    if (!result) {
      return undefined;
    }

    const { family, skuObj } = result;

    const websitePrice =
      skuObj.websitePrice;

    const mrp = skuObj.mrp;

    if (
      !skuObj.available ||
      websitePrice === null ||
      mrp === null ||
      !Number.isFinite(websitePrice) ||
      !Number.isFinite(mrp)
    ) {
      return undefined;
    }

    return {
      family,
      skuObj: {
        ...skuObj,
        websitePrice,
        mrp,
        shipping: 0,
        freeShipping: true,
        available: true,
      },
    };
  },

  getAvailableSkus(
    product: ProductFamily,
  ): Sku[] {
    return product.skus.filter(
      (sku) =>
        sku.available &&
        sku.websitePrice !== null &&
        sku.mrp !== null &&
        Number.isFinite(
          sku.websitePrice,
        ) &&
        Number.isFinite(sku.mrp),
    );
  },

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

  getAllFlatItems(): FlatProductItem[] {
    const list: FlatProductItem[] = [];

    for (const family of products) {
      for (const skuObj of family.skus) {
        const websitePrice =
          skuObj.websitePrice;

        const mrp = skuObj.mrp;

        if (
          !skuObj.available ||
          websitePrice === null ||
          mrp === null ||
          !Number.isFinite(websitePrice) ||
          !Number.isFinite(mrp)
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
          mrp,
          websitePrice,
          shipping: 0,
          freeShipping: true,
          available: true,
          featured: family.featured,
        });
      }
    }

    return list;
  },

  getPurchasableProducts(): ProductFamily[] {
    return products.filter(
      (product) =>
        product.skus.some(
          (sku) =>
            sku.available &&
            sku.websitePrice !== null &&
            sku.mrp !== null &&
            Number.isFinite(
              sku.websitePrice,
            ) &&
            Number.isFinite(sku.mrp),
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

    const seenSkus = new Set<string>();

    for (const product of products) {
      for (const sku of product.skus) {
        const normalizedSku =
          sku.sku.toUpperCase();

        if (seenSkus.has(normalizedSku)) {
          errors.push(
            `Duplicate SKU: ${sku.sku}`,
          );
        }

        seenSkus.add(normalizedSku);

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
          (
            sku.websitePrice === null ||
            sku.mrp === null
          )
        ) {
          errors.push(
            `${sku.sku}: available SKU must have both websitePrice and MRP`,
          );
        }

        if (
          sku.mrp !== null &&
          (
            !Number.isFinite(sku.mrp) ||
            sku.mrp < 0
          )
        ) {
          errors.push(
            `${sku.sku}: MRP must be a valid non-negative number`,
          );
        }

        if (
          sku.websitePrice !== null &&
          (
            !Number.isFinite(
              sku.websitePrice,
            ) ||
            sku.websitePrice < 0
          )
        ) {
          errors.push(
            `${sku.sku}: websitePrice must be a valid non-negative number`,
          );
        }

        if (
          sku.available &&
          sku.websitePrice !== null &&
          sku.mrp !== null &&
          sku.websitePrice > sku.mrp
        ) {
          errors.push(
            `${sku.sku}: websitePrice cannot exceed MRP`,
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
