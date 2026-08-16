import { ProductService } from '@/services/product-service';

export interface ProductFamilyImageConfig {
  productId: string;
  primary: string;
  alt: string;
  status: 'available' | 'pending';
}

const PRODUCT_FAMILY_IMAGE_REGISTRY: Record<
  string,
  { status: 'available' | 'pending' }
> = {
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

export function getProductFamilyImage(
  productId: string,
): ProductFamilyImageConfig {
  const product = ProductService.getAllProducts().find(
    (item) => item.id === productId,
  );

  const altText = product
    ? product.name
    : `Product ${productId}`;

  if (!product) {
    return {
      productId,
      primary: '',
      alt: altText,
      status: 'pending',
    };
  }

  const registryEntry =
    PRODUCT_FAMILY_IMAGE_REGISTRY[productId];

  const status = registryEntry?.status ?? 'pending';

  return {
    productId,
    primary: `/images/products/${productId}.png`,
    alt: altText,
    status,
  };
}

export function getAllProductFamilyImageStats() {
  const allProducts = ProductService.getAllProducts();
  const mappedKeys = Object.keys(
    PRODUCT_FAMILY_IMAGE_REGISTRY,
  );

  let availableCount = 0;
  let pendingCount = 0;
  let missingMappingCount = 0;
  let unknownMappingCount = 0;

  allProducts.forEach((product) => {
    if (!PRODUCT_FAMILY_IMAGE_REGISTRY[product.id]) {
      missingMappingCount++;
    }

    const image = getProductFamilyImage(product.id);

    if (image.status === 'available') {
      availableCount++;
    } else {
      pendingCount++;
    }
  });

  mappedKeys.forEach((key) => {
    if (!allProducts.some((product) => product.id === key)) {
      unknownMappingCount++;
    }
  });

  const duplicateMappingCount =
    mappedKeys.length -
    new Set(mappedKeys).size;

  return {
    directory: 'public/images/products/',
    expectedFamilyCount: allProducts.length,
    mappedFamilyCount: mappedKeys.length,
    availableImageCount: availableCount,
    pendingImageCount: pendingCount,
    missingMappingCount,
    unknownMappingCount,
    duplicateMappingCount,
  };
}
