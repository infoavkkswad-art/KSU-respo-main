import { ProductService } from '@/services/product-service';

export interface ProductFamilyImageConfig {
  productId: string;
  primary: string;
  alt: string;
  status: 'available' | 'pending';
}

// Explicit status overrides or custom overrides for product families.
// Newly added product families will automatically fall back to standard conventions.
const PRODUCT_FAMILY_IMAGE_REGISTRY: Record<string, { status: 'available' | 'pending' }> = {
  'moong-master': { status: 'available' },
  'moong-garlic': { status: 'available' },
  'moong-jeera': { status: 'available' },
  'moong-pudhina': { status: 'available' },
  'moong-green-chilli': { status: 'available' },
  'moong-kasuri-methi': { status: 'available' },
  'moong-punjabi-masala': { status: 'available' },
  'chana-chotu': { status: 'available' },
  'chana-garlic': { status: 'available' },
  'chana-khata-mitha': { status: 'available' },
  'chana-tomato': { status: 'available' },
  'chana-punjabi-masala': { status: 'available' },
  'urad-guru': { status: 'available' },
  'urad-garlic': { status: 'available' },
  'combo-235': { status: 'available' },
};

export function getProductFamilyImage(productId: string): ProductFamilyImageConfig {
  const product = ProductService.getAllProducts().find((p) => p.id === productId);
  const altText = product ? product.name : `Product ${productId}`;

  // Controlled fallback for unknown or unmapped product IDs: strictly return 'pending' and empty primary path.
  if (!product) {
    return {
      productId,
      primary: '',
      alt: altText,
      status: 'pending',
    };
  }

  const registryEntry = PRODUCT_FAMILY_IMAGE_REGISTRY[productId];
  const status = registryEntry ? registryEntry.status : 'pending';

  return {
    productId,
    primary: `/images/products/${productId}.png`,
    alt: altText,
    status,
  };
}

export function getAllProductFamilyImageStats() {
  const allProducts = ProductService.getAllProducts();
  const expectedFamilyCount = allProducts.length;
  const mappedKeys = Object.keys(PRODUCT_FAMILY_IMAGE_REGISTRY);

  let availableCount = 0;
  let pendingCount = 0;
  let missingMappingCount = 0;
  let unknownMappingCount = 0;

  allProducts.forEach((p) => {
    if (!PRODUCT_FAMILY_IMAGE_REGISTRY[p.id]) {
      missingMappingCount++;
    }
    const img = getProductFamilyImage(p.id);
    if (img.status === 'available') {
      availableCount++;
    } else {
      pendingCount++;
    }
  });

  mappedKeys.forEach((key) => {
    if (!allProducts.some((p) => p.id === key)) {
      unknownMappingCount++;
    }
  });

  const duplicateMappingCount = mappedKeys.length - new Set(mappedKeys).size;

  return {
    directory: 'public/images/products/',
    expectedFamilyCount,
    mappedFamilyCount: mappedKeys.length,
    availableImageCount: availableCount,
    pendingImageCount: pendingCount,
    missingMappingCount,
    unknownMappingCount,
    duplicateMappingCount,
  };
}
