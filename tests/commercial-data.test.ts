import { SALES_SKUS } from '../src/data/sales-config';
import { products } from '../src/data/products';

export function runCommercialDataTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  // 1. SKU Count Check
  try {
    const skuKeys = Object.keys(SALES_SKUS);
    if (skuKeys.length !== 43) {
      throw new Error(`Expected 43 SKUs in SALES_SKUS, found ${skuKeys.length}`);
    }
    let productVariantsCount = 0;
    products.forEach(p => {
      productVariantsCount += p.skus.length;
    });
    if (productVariantsCount !== 43) {
      throw new Error(`Expected 43 variant SKUs in products catalog, found ${productVariantsCount}`);
    }
    results.push({ name: 'Commercial SKUs Count (Exactly 43 SKUs)', passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: 'Commercial SKUs Count (Exactly 43 SKUs)', passed: false, error: msg });
  }

  // 2. Price Validity Check
  try {
    for (const [sku, config] of Object.entries(SALES_SKUS)) {
      if (!config.mrp || config.mrp <= 0) {
        throw new Error(`Invalid MRP for SKU ${sku}: ${config.mrp}`);
      }
      if (!config.sellingPrice || config.sellingPrice <= 0) {
        throw new Error(`Invalid selling price for SKU ${sku}: ${config.sellingPrice}`);
      }
      if (config.sellingPrice > config.mrp) {
        throw new Error(`Selling price exceeds MRP for SKU ${sku}`);
      }
    }
    results.push({ name: 'Price & MRP Integrity (Valid positive ranges)', passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: 'Price & MRP Integrity (Valid positive ranges)', passed: false, error: msg });
  }

  // 3. Catalog & Sales-Config Alignment
  try {
    for (const [skuKey] of Object.entries(SALES_SKUS)) {
      let matched = false;
      for (const prod of products) {
        if (prod.skus.some(s => s.sku.toUpperCase() === skuKey.toUpperCase())) {
          matched = true;
          break;
        }
      }
      if (!matched) {
        throw new Error(`Sales SKU ${skuKey} does not exist in product catalog`);
      }
    }
    results.push({ name: 'Catalog to Commercial Sales Mapping Alignment', passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: 'Catalog to Commercial Sales Mapping Alignment', passed: false, error: msg });
  }

  return results;
}
