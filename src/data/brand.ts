export const brand = {
  name: 'KAWAD SWAD',
  hindiName: 'कवाड़ स्वाद',
  manufacturer: 'Kawad Swad Udhyog',
  tagline: 'निमाड़ का अपना पापड़',
  taglineEnglish: 'The Taste of Nimar, Made with Tradition',
  region: 'Nimar, Madhya Pradesh, India',
  fssai: '21425890001224',
  dietType: '100% Vegetarian',
  phone: '+91 9630976867',
  phoneRaw: '919630976867',
  email: 'info.av.kkswad@gmail.com',
  instagram: 'kawadswad',
  instagramUrl: 'https://www.instagram.com/kawadswad',
  youtube: 'kawadswadudhyog',
  youtubeUrl: 'https://www.youtube.com/@kawadswadudhyog',
  whatsappUrl: 'https://wa.me/919630976867',
} as const;

/**
 * Primary navigation
 *
 * Keep the public navigation intentionally small.
 * Secondary destinations remain available through the footer
 * and contextual page links.
 */
export const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/shop' },
  { label: 'Our Story', path: '/about' },
  { label: 'Making', path: '/manufacturing' },
  { label: 'Journal', path: '/blog' },
  { label: 'Contact', path: '/contact' },
] as const;

/**
 * Footer navigation
 *
 * Primary destinations plus supporting/business routes.
 * These are deliberately kept out of the main navigation
 * to maintain a cleaner premium experience.
 */
export const footerLinks = {
  brand: [
    { label: 'Our Story', path: '/about' },
    { label: 'Making', path: '/manufacturing' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Journal', path: '/blog' },
    { label: 'Media', path: '/media' },
  ],

  shop: [
    { label: 'Shop Papads', path: '/shop' },
    { label: 'All Products', path: '/products' },
    { label: 'Cart', path: '/cart' },
    { label: 'Track Order', path: '/track-order' },
  ],

  business: [
    { label: 'Business Hub', path: '/business' },
    { label: 'Bulk Orders', path: '/bulk-orders' },
    { label: 'Distributor', path: '/distributor' },
    { label: 'Work With Us', path: '/work-with-us' },
  ],

  support: [
    { label: 'Contact', path: '/contact' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Reviews', path: '/reviews' },
    { label: 'Policies', path: '/policies' },
  ],
} as const;
