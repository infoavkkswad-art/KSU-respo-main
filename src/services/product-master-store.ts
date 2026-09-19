/* ============================================================================
 * Product master overlay from GET /api/products.
 *
 * Presentation (copy, images) stays in products.ts.
 * Display and checkout unit prices come from this catalog, never from an
 * independent sales-config checkout path.
 * ========================================================================== */

export type ProductMasterItem = {
  sku: string;
  name: string;
  weight_g: number;
  mrp: number;
  selling_price: number;
  active: boolean;
};

let ready = false;

const bySku = new Map<string, ProductMasterItem>();

function normalizeSku(sku: string): string {
  return sku.trim().toUpperCase();
}

export function setProductMasterCatalog(
  items: ProductMasterItem[],
): void {
  bySku.clear();

  for (const item of items) {
    const sku = normalizeSku(item.sku);

    if (!sku) {
      continue;
    }

    bySku.set(sku, {
      sku,
      name: item.name,
      weight_g: item.weight_g,
      mrp: item.mrp,
      selling_price: item.selling_price,
      active: item.active,
    });
  }

  ready = true;
}

export function resetProductMasterCatalog(): void {
  bySku.clear();
  ready = false;
}

export function isProductMasterReady(): boolean {
  return ready;
}

export function getMasterSku(
  sku: string,
): ProductMasterItem | undefined {
  return bySku.get(normalizeSku(sku));
}

export function getMasterCatalog(): ProductMasterItem[] {
  return Array.from(bySku.values());
}
