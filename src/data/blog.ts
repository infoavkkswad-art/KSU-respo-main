export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Recipes' | 'Papad Knowledge' | 'Indian Food' | 'Brand Updates' | 'Business';
  date: string;
  readTime: string;
  author: string;
  content: string[];
}

export const blogCategories = [
  'All',
  'Recipes',
  'Papad Knowledge',
  'Indian Food',
  'Brand Updates',
  'Business',
] as const;

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-roast-papad-perfectly',
    title: 'How to Roast Papad Perfectly Every Time',
    excerpt:
      'A simple guide to getting that perfect crisp — whether you roast, fry, or air-fry your papad.',
    category: 'Papad Knowledge',
    date: '2025-07-15',
    readTime: '3 min read',
    author: 'Kawad Swad Team',
    content: [
      'Papad is one of the simplest yet most satisfying parts of an Indian meal. A well-roasted papad adds crunch, flavour and character to any plate.',
      'There are three popular ways to prepare papad at home: roasting on an open flame, deep-frying, and air-frying. Each method brings out a slightly different texture.',
      'For open-flame roasting, hold the papad with tongs and move it steadily across the flame. Rotate it so it cooks evenly. Press lightly with a cloth to help it puff up.',
      'For deep-frying, heat oil to medium temperature and slip the papad in. It will expand within seconds. Remove it quickly before it overcooks.',
      'Air-frying is a lighter option. Lightly brush the papad with oil and air-fry at 200°C for about 2 minutes. Watch closely, as air-fryers vary in power.',
      'Whichever method you choose, serve the papad immediately for the best crunch. A perfectly roasted papad is crisp, light and full of aroma.',
    ],
  },
  {
    slug: 'moong-vs-chana-vs-urad-papad',
    title: 'Moong vs Chana vs Urad: Understanding Papad Varieties',
    excerpt:
      'Each lentil brings its own character to papad. Here is what makes moong, chana and urad papad distinct.',
    category: 'Papad Knowledge',
    date: '2025-06-28',
    readTime: '4 min read',
    author: 'Kawad Swad Team',
    content: [
      'Papad is made from different lentil flours, and each lentil gives the papad a unique texture and taste.',
      'Moong papad is thin, light and crisp. It roasts quickly and has a delicate, clean flavour. It is a popular everyday choice.',
      'Chana papad has a slightly denser, more robust texture. It holds spices well and has a deeper, earthier taste.',
      'Urad papad is the thickest and heartiest. It has a rich, traditional flavour and a satisfying bite. It is often the choice for festive occasions.',
      'Within each lentil, different spice blends — garlic, jeera, pudhina, green chilli, kasuri methi, Punjabi masala — create a wide range of flavour experiences.',
      'Understanding these differences helps you choose the right papad for the right moment, whether it is a simple weekday lunch or a special gathering.',
    ],
  },
  {
    slug: 'papad-in-indian-thali-tradition',
    title: 'The Role of Papad in the Indian Thali Tradition',
    excerpt:
      'Why papad is an essential part of the Indian thali — and what it brings to the meal beyond crunch.',
    category: 'Indian Food',
    date: '2025-06-10',
    readTime: '3 min read',
    author: 'Kawad Swad Team',
    content: [
      'The Indian thali is a complete meal on a single plate — a balance of flavours, textures and nutrients. Papad is one of its most beloved components.',
      'In a thali, papad provides the crunch. It contrasts with soft rotis, rice, dal and curries, adding a textural dimension that makes the meal more satisfying.',
      'Papad also serves as a palate cleanser between different dishes. Its crisp, salty character refreshes the mouth between bites of rich curries and sweet dishes.',
      'In many households, papad is also used as a base for toppings — chopped onion, tomato, chilli and chutney — to create a quick chaat-style snack.',
      'Whether it is a festive thali or a simple everyday meal, papad holds its place as a small but essential part of the Indian dining tradition.',
    ],
  },
  {
    slug: 'jain-food-philosophy-and-papad',
    title: 'Jain Food Philosophy and Papad',
    excerpt:
      'How Jain dietary principles shape traditional food choices and recipe selections.',
    category: 'Indian Food',
    date: '2025-05-20',
    readTime: '4 min read',
    author: 'Kawad Swad Team',
    content: [
      'Jain food philosophy is rooted in the principle of ahimsa — non-violence. This shapes every aspect of traditional vegetarian dining.',
      'A strict Jain diet avoids root vegetables like onion and garlic, prioritizing ingredients and preparation styles that align with specific dietary observances.',
      'In our product offerings, we provide options that respect these dietary practices alongside our spiced and garlic-infused variants, allowing households to select varieties suited to their preferences.',
      'Understanding traditional dietary philosophies helps consumers choose products that fit their lifestyle, whether they prefer standard lentil blends or specific variant options.',
      'Respecting culinary traditions is part of offering a diverse range of traditional food choices for every table.',
    ],
  },
  {
    slug: 'starting-a-papad-business-in-india',
    title: 'What It Takes to Build a Papad Brand in India',
    excerpt:
      'A look at the journey of building a traditional food brand with modern manufacturing standards.',
    category: 'Business',
    date: '2025-04-15',
    readTime: '5 min read',
    author: 'Kawad Swad Team',
    content: [
      'Building a food brand in India is both a craft and a commitment. It starts with a deep respect for traditional taste and grows through consistent quality.',
      'For Kawad Swad, the journey begins in Nimar, Madhya Pradesh — a region with a strong tradition of papad making. Our goal is to bring that tradition to a wider audience.',
      'Modern manufacturing does not replace tradition; it supports it. Consistent ingredient quality, hygienic preparation and careful packaging help preserve the taste that people remember.',
      'A key part of building the brand is listening — to consumers, to retailers, and to distributors. Their feedback shapes the product range and the way we serve our customers.',
      'We are still early in this journey. There is much to learn and much to build, and we are committed to doing it the right way.',
    ],
  },
  {
    slug: 'papad-topping-ideas',
    title: '5 Simple Papad Topping Ideas for Quick Snacks',
    excerpt:
      'Turn a plain roasted papad into a quick, tasty snack with these simple topping ideas.',
    category: 'Recipes',
    date: '2025-03-30',
    readTime: '3 min read',
    author: 'Kawad Swad Team',
    content: [
      'A roasted papad is delicious on its own, but with a few toppings it becomes a quick and satisfying snack.',
      '1. Masala Papad: Top with finely chopped onion, tomato, green chilli, coriander, chaat masala and a squeeze of lemon.',
      '2. Cheese Papad: Sprinkle grated cheese on a hot roasted papad and let it melt. Add chilli flakes for extra kick.',
      '3. Bhel Papad: Crush the papad and mix with puffed rice, chutney, onion and sev for a quick bhel.',
      '4. Curd Papad: Place roasted papad in a plate, top with whisked curd, tamarind chutney and roasted cumin powder.',
      '5. Salad Papad: Top with a light kachumber salad of cucumber, tomato and onion for a fresh, crunchy bite.',
      'These toppings take just a few minutes and are a great way to enjoy papad in new ways.',
    ],
  },
];

export const blogService = {
  getAll(): BlogPost[] {
    return [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));
  },

  getBySlug(slug: string): BlogPost | undefined {
    return blogPosts.find((p) => p.slug === slug);
  },

  getByCategory(category: string): BlogPost[] {
    if (category === 'All') return this.getAll();
    return this.getAll().filter((p) => p.category === category);
  },
};
