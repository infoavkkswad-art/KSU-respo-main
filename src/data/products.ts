export type ProductCategory = 'moong' | 'chana' | 'urad' | 'combo';

export type PackSize = 200 | 500 | 1000 | 235;

export interface Sku {
  sku: string;
  packSize: number;
  mrp: number;
  websitePrice: number;
  shipping: number;
  freeShipping: boolean;
}

export interface ProductFamily {
  id: string;
  slug: string;
  name: string;
  hindiName: string;
  category: ProductCategory;
  variant: string;
  description: string;
  ingredients: string[];
  tasteProfile: string;
  storage: string;
  serving: string;
  nutritionNote: string;
  skus: Sku[];
  featured: boolean;
}

export const PACK_LABELS: Record<number, string> = {
  200: '200g',
  500: '500g',
  1000: '1kg',
  235: '235g Combo',
};

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  moong: 'Moong',
  chana: 'Chana',
  urad: 'Urad',
  combo: 'Combo',
};

function makeSkus(
  prefix: string,
  prices: Array<[number, number, number]>,
): Sku[] {
  return prices.map(([packSize, mrp, websitePrice]) => {
    const freeShipping = packSize === 1000;
    return {
      sku: `${prefix}-${packSize}`,
      packSize,
      mrp,
      websitePrice,
      shipping: freeShipping ? 0 : 49,
      freeShipping,
    };
  });
}

export const products: ProductFamily[] = [
  {
    id: 'moong-master',
    slug: 'moong-master-papad',
    name: 'Moong Master Papad',
    hindiName: 'मूंग मास्टर पापड़',
    category: 'moong',
    variant: 'Classic',
    description:
      'Our signature moong papad — thin, crisp and full of traditional Nimar flavour. Made from premium moong dal with a balanced blend of natural spices.',
    ingredients: ['Moong dal flour', 'Natural spices', 'Edible oil', 'Salt'],
    tasteProfile: 'Crisp, savoury and well-balanced with a classic roasted aroma.',
    storage: 'Store in a cool, dry place in an airtight container.',
    serving: 'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote: 'Nutrition information will be available soon.',
    skus: makeSkus('KS-MMP', [
      [200, 110, 89],
      [500, 249, 199],
      [1000, 499, 429],
    ]),
    featured: true,
  },
  {
    id: 'moong-garlic',
    slug: 'moong-garlic-papad',
    name: 'Moong Garlic Papad',
    hindiName: 'मूंग लहसुन पापड़',
    category: 'moong',
    variant: 'Garlic',
    description:
      'Moong papad infused with natural garlic flavour for a bold, aromatic taste. A favourite for garlic lovers.',
    ingredients: ['Moong dal flour', 'Garlic', 'Natural spices', 'Edible oil', 'Salt'],
    tasteProfile: 'Bold garlic aroma with a crisp, savoury bite.',
    storage: 'Store in a cool, dry place in an airtight container.',
    serving: 'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote: 'Nutrition information will be available soon.',
    skus: makeSkus('KS-MGP', [
      [200, 125, 99],
      [500, 309, 259],
      [1000, 619, 539],
    ]),
    featured: true,
  },
  {
    id: 'moong-jeera',
    slug: 'moong-jeera-papad',
    name: 'Moong Jeera Papad',
    hindiName: 'मूंग जीरा पापड़',
    category: 'moong',
    variant: 'Jeera',
    description:
      'Moong papad with the warm, earthy flavour of cumin seeds. A timeless combination that pairs beautifully with any meal.',
    ingredients: ['Moong dal flour', 'Cumin seeds', 'Natural spices', 'Edible oil', 'Salt'],
    tasteProfile: 'Warm cumin aroma with a crisp, earthy finish.',
    storage: 'Store in a cool, dry place in an airtight container.',
    serving: 'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote: 'Nutrition information will be available soon.',
    skus: makeSkus('KS-MJP', [
      [200, 109, 89],
      [500, 279, 229],
      [1000, 559, 489],
    ]),
    featured: false,
  },
  {
    id: 'moong-pudhina',
    slug: 'moong-pudhina-papad',
    name: 'Moong Pudhina Papad',
    hindiName: 'मूंग पुदीना पापड़',
    category: 'moong',
    variant: 'Pudhina',
    description:
      'Moong papad with refreshing mint flavour. Cool, aromatic and perfectly balanced for a light, crisp bite.',
    ingredients: ['Moong dal flour', 'Mint', 'Natural spices', 'Edible oil', 'Salt'],
    tasteProfile: 'Cool mint aroma with a crisp, refreshing finish.',
    storage: 'Store in a cool, dry place in an airtight container.',
    serving: 'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote: 'Nutrition information will be available soon.',
    skus: makeSkus('KS-MPP', [
      [200, 105, 85],
      [500, 265, 219],
      [1000, 529, 459],
    ]),
    featured: false,
  },
  {
    id: 'moong-green-chilli',
    slug: 'moong-green-chilli-papad',
    name: 'Moong Green Chilli Papad',
    hindiName: 'मूंग हरी मिर्च पापड़',
    category: 'moong',
    variant: 'Green Chilli',
    description:
      'Moong papad with a lively green chilli kick. For those who enjoy a bit of heat with their crunch.',
    ingredients: ['Moong dal flour', 'Green chilli', 'Natural spices', 'Edible oil', 'Salt'],
    tasteProfile: 'Spicy green chilli heat with a crisp, savoury base.',
    storage: 'Store in a cool, dry place in an airtight container.',
    serving: 'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote: 'Nutrition information will be available soon.',
    skus: makeSkus('KS-MGCP', [
      [200, 105, 85],
      [500, 265, 219],
      [1000, 529, 459],
    ]),
    featured: false,
  },
  {
    id: 'moong-kasuri-methi',
    slug: 'moong-kasuri-methi-papad',
    name: 'Moong Kasuri Methi Papad',
    hindiName: 'मूंग कसूरी मेथी पापड़',
    category: 'moong',
    variant: 'Kasuri Methi',
    description:
      'Moong papad with the distinctive aroma of kasuri methi (dried fenugreek leaves). A fragrant, savoury treat.',
    ingredients: ['Moong dal flour', 'Kasuri methi', 'Natural spices', 'Edible oil', 'Salt'],
    tasteProfile: 'Fragrant fenugreek aroma with a crisp, savoury finish.',
    storage: 'Store in a cool, dry place in an airtight container.',
    serving: 'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote: 'Nutrition information will be available soon.',
    skus: [
      {
        sku: 'KS-MKMP-200',
        packSize: 200,
        mrp: 109,
        websitePrice: 89,
        shipping: 49,
        freeShipping: false,
      },
      {
        sku: 'KS-MKMP-500',
        packSize: 500,
        mrp: 229,
        websitePrice: 49,
        shipping: 189,
        freeShipping: false,
      },
      {
        sku: 'KS-MKMP-1000',
        packSize: 1000,
        mrp: 559,
        websitePrice: 489,
        shipping: 0,
        freeShipping: true,
      },
    ],
    featured: false,
  },
  {
    id: 'moong-punjabi-masala',
    slug: 'moong-punjabi-masala-papad',
    name: 'Moong Punjabi Masala Papad',
    hindiName: 'मूंग पंजाबी मसाला पापड़',
    category: 'moong',
    variant: 'Punjabi Masala',
    description:
      'Moong papad with a rich Punjabi-style masala blend. Bold, aromatic and full of traditional character.',
    ingredients: ['Moong dal flour', 'Punjabi masala blend', 'Natural spices', 'Edible oil', 'Salt'],
    tasteProfile: 'Bold, aromatic masala with a crisp, full-bodied finish.',
    storage: 'Store in a cool, dry place in an airtight container.',
    serving: 'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote: 'Nutrition information will be available soon.',
    skus: makeSkus('KS-MPMP', [
      [200, 119, 99],
      [500, 299, 249],
      [1000, 599, 529],
    ]),
    featured: false,
  },
  {
    id: 'chana-chotu',
    slug: 'chana-chotu-papad',
    name: 'Chana Chotu Papad',
    hindiName: 'चना छोटू पापड़',
    category: 'chana',
    variant: 'Classic',
    description:
      'Classic chana dal papad with a compact, crisp texture. A traditional Nimar favourite for everyday meals.',
    ingredients: ['Chana dal flour', 'Natural spices', 'Edible oil', 'Salt'],
    tasteProfile: 'Crisp and savoury with a classic roasted chana aroma.',
    storage: 'Store in a cool, dry place in an airtight container.',
    serving: 'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote: 'Nutrition information will be available soon.',
    skus: makeSkus('KS-CCP', [
      [200, 110, 89],
      [500, 249, 199],
      [1000, 499, 429],
    ]),
    featured: true,
  },
  {
    id: 'chana-garlic',
    slug: 'chana-garlic-papad',
    name: 'Chana Garlic Papad',
    hindiName: 'चना लहसुन पापड़',
    category: 'chana',
    variant: 'Garlic',
    description:
      'Chana dal papad with natural garlic flavour. Bold, aromatic and deeply satisfying.',
    ingredients: ['Chana dal flour', 'Garlic', 'Natural spices', 'Edible oil', 'Salt'],
    tasteProfile: 'Bold garlic aroma with a crisp chana base.',
    storage: 'Store in a cool, dry place in an airtight container.',
    serving: 'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote: 'Nutrition information will be available soon.',
    skus: makeSkus('KS-CGP', [
      [200, 125, 99],
      [500, 309, 259],
      [1000, 619, 539],
    ]),
    featured: false,
  },
  {
    id: 'chana-khata-mitha',
    slug: 'chana-khata-mitha-papad',
    name: 'Chana Khata Mitha Papad',
    hindiName: 'चना खटा मीठा पापड़',
    category: 'chana',
    variant: 'Khata Mitha',
    description:
      'Chana papad with a sweet-and-sour flavour profile. A unique, tangy twist on traditional papad.',
    ingredients: ['Chana dal flour', 'Sweet-and-sour spices', 'Natural spices', 'Edible oil', 'Salt'],
    tasteProfile: 'Tangy sweet-and-sour flavour with a crisp base.',
    storage: 'Store in a cool, dry place in an airtight container.',
    serving: 'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote: 'Nutrition information will be available soon.',
    skus: makeSkus('KS-CKM', [
      [200, 99, 79],
      [500, 249, 199],
      [1000, 499, 429],
    ]),
    featured: false,
  },
  {
    id: 'chana-tomato',
    slug: 'chana-tomato-papad',
    name: 'Chana Tomato Papad',
    hindiName: 'चना टमाटर पापड़',
    category: 'chana',
    variant: 'Tomato',
    description:
      'Chana papad with a tangy tomato flavour. A refreshing, zesty take on traditional papad.',
    ingredients: ['Chana dal flour', 'Tomato flavour', 'Natural spices', 'Edible oil', 'Salt'],
    tasteProfile: 'Tangy tomato flavour with a crisp, savoury base.',
    storage: 'Store in a cool, dry place in an airtight container.',
    serving: 'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote: 'Nutrition information will be available soon.',
    skus: makeSkus('KS-CTP', [
      [200, 99, 79],
      [500, 249, 199],
      [1000, 499, 429],
    ]),
    featured: false,
  },
  {
    id: 'chana-punjabi-masala',
    slug: 'chana-punjabi-masala-papad',
    name: 'Chana Punjabi Masala Papad',
    hindiName: 'चना पंजाबी मसाला पापड़',
    category: 'chana',
    variant: 'Punjabi Masala',
    description:
      'Chana papad with a rich Punjabi-style masala blend. Bold, aromatic and full of character.',
    ingredients: ['Chana dal flour', 'Punjabi masala blend', 'Natural spices', 'Edible oil', 'Salt'],
    tasteProfile: 'Bold, aromatic masala with a crisp chana base.',
    storage: 'Store in a cool, dry place in an airtight container.',
    serving: 'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote: 'Nutrition information will be available soon.',
    skus: makeSkus('KS-CPM', [
      [200, 119, 99],
      [500, 299, 249],
      [1000, 599, 529],
    ]),
    featured: false,
  },
  {
    id: 'urad-guru',
    slug: 'urad-guru-papad',
    name: 'Urad Guru Papad',
    hindiName: 'उड़द गुरु पापड़',
    category: 'urad',
    variant: 'Classic',
    description:
      'Premium urad dal papad with a rich, traditional taste. Thick, hearty and deeply satisfying.',
    ingredients: ['Urad dal flour', 'Natural spices', 'Edible oil', 'Salt'],
    tasteProfile: 'Rich, hearty and savoury with a classic roasted urad aroma.',
    storage: 'Store in a cool, dry place in an airtight container.',
    serving: 'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote: 'Nutrition information will be available soon.',
    skus: makeSkus('KS-UGP', [
      [200, 119, 99],
      [500, 299, 249],
      [1000, 599, 529],
    ]),
    featured: true,
  },
  {
    id: 'urad-garlic',
    slug: 'urad-garlic-papad',
    name: 'Urad Garlic Papad',
    hindiName: 'उड़द लहसुन पापड़',
    category: 'urad',
    variant: 'Garlic',
    description:
      'Urad dal papad with natural garlic flavour. Bold, aromatic and deeply satisfying.',
    ingredients: ['Urad dal flour', 'Garlic', 'Natural spices', 'Edible oil', 'Salt'],
    tasteProfile: 'Bold garlic aroma with a rich, hearty urad base.',
    storage: 'Store in a cool, dry place in an airtight container.',
    serving: 'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote: 'Nutrition information will be available soon.',
    skus: makeSkus('KS-UGG', [
      [200, 125, 99],
      [500, 319, 269],
      [1000, 639, 559],
    ]),
    featured: false,
  },
  {
    id: 'combo-235',
    slug: 'kawad-swad-combo-pack',
    name: 'Kawad Swad Combo Pack',
    hindiName: 'कवाड़ स्वाद कॉम्बो पैक',
    category: 'combo',
    variant: 'Assorted',
    description:
      'A curated assortment of our most-loved papad varieties in one convenient pack. Perfect for trying a range of flavours.',
    ingredients: ['Assorted moong & chana papad varieties', 'Natural spices', 'Edible oil', 'Salt'],
    tasteProfile: 'A balanced mix of classic, garlic and spiced papad flavours.',
    storage: 'Store in a cool, dry place in an airtight container.',
    serving: 'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote: 'Nutrition information will be available soon.',
    skus: [
      {
        sku: 'KS-COMB-235',
        packSize: 235,
        mrp: 199,
        websitePrice: 189,
        shipping: 49,
        freeShipping: false,
      },
    ],
    featured: true,
  },
];
