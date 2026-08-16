export type ProductCategory =
  'moong' | 'chana' | 'urad' | 'combo';

export type PackSize =
  200 | 500 | 1000 | 235;

export interface Sku {
  sku: string;
  packSize: number;
  mrp: number | null;
  websitePrice: number | null;
  shipping: number;
  freeShipping: boolean;
  available: boolean;
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

export const CATEGORY_LABELS: Record<
  ProductCategory,
  string
> = {
  moong: 'Moong',
  chana: 'Chana',
  urad: 'Urad',
  combo: 'Combo',
};

/*
 * IMPORTANT CUSTOMER-PRICING RULE
 *
 * websitePrice is the FINAL customer-facing price.
 * It already includes the shipping cost.
 *
 * The website must:
 * - show only websitePrice
 * - show "Free Shipping"
 * - never add shipping again
 * - never display a separate shipping charge
 * - never display a discount/sale percentage
 *
 * Costing is intentionally NOT stored here.
 */

function makeSkus(
  prefix: string,
  prices: Array<[number, number, number]>,
): Sku[] {
  return prices.map(
    ([packSize, mrp, websitePrice]) => ({
      sku: `${prefix}-${packSize}`,
      packSize,
      mrp,
      websitePrice,
      shipping: 0,
      freeShipping: true,
      available: true,
    }),
  );
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
      'Our signature moong papad, crafted from premium moong dal with a balanced traditional spice blend. Thin, crisp and made for the everyday Nimar table.',
    ingredients: [
      'Moong dal flour',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Crisp, savoury and well-balanced with a classic roasted aroma.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus('KS-MMP', [
      [200, 110, 102],
      [500, 249, 211],
      [1000, 499, 425],
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
      'A crisp moong papad with a bold garlic character and aromatic spice blend. A flavour-forward choice for garlic lovers.',
    ingredients: [
      'Moong dal flour',
      'Garlic',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Bold garlic aroma with a crisp, savoury bite.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus('KS-MGP', [
      [200, 125, 107],
      [500, 309, 216],
      [1000, 619, 440],
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
      'A classic moong papad featuring the warm, earthy aroma of jeera. A simple traditional combination that pairs naturally with everyday meals.',
    ingredients: [
      'Moong dal flour',
      'Cumin seeds',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Warm cumin aroma with a crisp, earthy finish.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus('KS-MJP', [
      [200, 109, 112],
      [500, 279, 226],
      [1000, 559, 455],
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
      'A refreshing moong papad with the distinctive aroma of mint. Crisp, light and designed for a fresh twist on traditional papad.',
    ingredients: [
      'Moong dal flour',
      'Mint',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Cool mint aroma with a crisp, refreshing finish.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus('KS-MPP', [
      [200, 105, 107],
      [500, 265, 216],
      [1000, 529, 435],
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
      'A crisp moong papad with the lively flavour of green chilli. Made for those who enjoy a little extra heat with their crunch.',
    ingredients: [
      'Moong dal flour',
      'Green chilli',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Spicy green chilli heat with a crisp, savoury base.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus('KS-MGCP', [
      [200, 105, 107],
      [500, 265, 216],
      [1000, 529, 435],
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
      'A fragrant moong papad infused with the distinctive character of kasuri methi. Aromatic, savoury and crisp.',
    ingredients: [
      'Moong dal flour',
      'Kasuri methi',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Fragrant fenugreek aroma with a crisp, savoury finish.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus('KS-MKMP', [
      [200, 109, 107],
      [500, 229, 221],
      [1000, 559, 450],
    ]),
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
      'A bold moong papad seasoned with a Punjabi-style masala blend. Rich in aroma and full of traditional spice character.',
    ingredients: [
      'Moong dal flour',
      'Punjabi masala blend',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Bold, aromatic masala with a crisp, full-bodied finish.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus('KS-MPMP', [
      [200, 119, 107],
      [500, 299, 216],
      [1000, 599, 435],
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
      'A classic chana dal papad with a crisp texture and traditional flavour. A dependable everyday companion for the Nimar meal.',
    ingredients: [
      'Chana dal flour',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Crisp and savoury with a classic roasted chana aroma.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus('KS-CCP', [
      [200, 110, 102],
      [500, 249, 211],
      [1000, 499, 425],
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
      'Chana dal papad with a bold garlic flavour and aromatic spice character. Crisp, savoury and satisfying.',
    ingredients: [
      'Chana dal flour',
      'Garlic',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Bold garlic aroma with a crisp chana base.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus('KS-CGP', [
      [200, 125, 107],
      [500, 309, 221],
      [1000, 619, 450],
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
      'A distinctive chana papad with a sweet-and-sour flavour profile. Tangy, crisp and different from the everyday classic.',
    ingredients: [
      'Chana dal flour',
      'Sweet-and-sour spices',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Tangy sweet-and-sour flavour with a crisp base.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus('KS-CKM', [
      [200, 99, 107],
      [500, 249, 216],
      [1000, 499, 435],
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
      'A crisp chana papad with a tangy tomato flavour and savoury spice base. A zesty take on traditional papad.',
    ingredients: [
      'Chana dal flour',
      'Tomato flavour',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Tangy tomato flavour with a crisp, savoury base.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus('KS-CTP', [
      [200, 99, 107],
      [500, 249, 221],
      [1000, 499, 450],
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
      'A chana papad seasoned with a rich Punjabi-style masala blend. Bold, aromatic and packed with character.',
    ingredients: [
      'Chana dal flour',
      'Punjabi masala blend',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Bold, aromatic masala with a crisp chana base.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus('KS-CPM', [
      [200, 119, 107],
      [500, 299, 216],
      [1000, 599, 435],
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
      'A premium urad dal papad with a rich, hearty traditional character. Crisp, satisfying and full of depth.',
    ingredients: [
      'Urad dal flour',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Rich, hearty and savoury with a classic roasted urad aroma.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus('KS-UGP', [
      [200, 119, 112],
      [500, 299, 231],
      [1000, 599, 465],
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
      'A rich urad dal papad with bold garlic flavour and an aromatic spice character. Hearty, crisp and deeply satisfying.',
    ingredients: [
      'Urad dal flour',
      'Garlic',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'Bold garlic aroma with a rich, hearty urad base.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: makeSkus('KS-UGG', [
      [200, 125, 117],
      [500, 319, 241],
      [1000, 639, 485],
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
      'A curated assortment of popular Kawad Swad papad varieties in one convenient pack, ideal for discovering different flavours.',
    ingredients: [
      'Assorted moong & chana papad varieties',
      'Natural spices',
      'Edible oil',
      'Salt',
    ],
    tasteProfile:
      'A balanced mix of classic, garlic and spiced papad flavours.',
    storage:
      'Store in a cool, dry place in an airtight container.',
    serving:
      'Roast or deep-fry until crisp. Serve as a side or snack.',
    nutritionNote:
      'Nutrition information will be available soon.',
    skus: [
      {
        sku: 'KS-COMB-235',
        packSize: 235,
        mrp: 199,
        websitePrice: null,
        shipping: 0,
        freeShipping: true,
        available: false,
      },
    ],
    featured: true,
  },
];
