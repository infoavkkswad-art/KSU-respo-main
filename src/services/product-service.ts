import { products, ProductFamily, Sku, ProductCategory } from '../data/products';

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
  featured?: boolean;
}

export const ProductService = {
  getAllProducts(): ProductFamily[] {
    return products;
  },

  getProductBySlug(slug: string): ProductFamily | undefined {
    return products.find((p) => p.slug === slug);
  },

  getProductsByCategory(category: string): ProductFamily[] {
    if (!category || category === 'all') return products;
    return products.filter((p) => p.category === category);
  },

  getFeaturedProducts(): ProductFamily[] {
    return products.filter((p) => p.featured);
  },

  getProductBySku(skuCode: string): { family: ProductFamily; skuObj: Sku } | undefined {
    for (const product of products) {
      const skuObj = product.skus.find((s) => s.sku === skuCode);
      if (skuObj) return { family: product, skuObj };
    }
    return undefined;
  },

  searchProducts(query: string): ProductFamily[] {
    const q = query.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.hindiName.includes(q) ||
        p.variant.toLowerCase().includes(q) ||
        p.category.includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.skus.some((s) => s.sku.toLowerCase().includes(q) || String(s.packSize).includes(q)),
    );
  },

  getRelatedProducts(product: ProductFamily, count = 4): ProductFamily[] {
    return products
      .filter((p) => p.id !== product.id && p.category === product.category)
      .concat(products.filter((p) => p.id !== product.id && p.category !== product.category))
      .slice(0, count);
  },

  getAllFlatItems(): FlatProductItem[] {
    const list: FlatProductItem[] = [];
    for (const family of products) {
      for (const skuObj of family.skus) {
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
          websitePrice: skuObj.websitePrice,
          shipping: skuObj.shipping,
          freeShipping: skuObj.freeShipping,
          featured: family.featured,
        });
      }
    }
    return list;
  },
};
