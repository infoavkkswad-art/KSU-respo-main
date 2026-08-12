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
  whatsappUrl: `https://wa.me/919630976867`,
} as const;

export const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Products', path: '/products' },
  { label: 'Shop', path: '/shop' },
  { label: 'Business', path: '/business' },
  { label: 'Manufacturing', path: '/manufacturing' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact', path: '/contact' },
] as const;

export const footerLinks = {
  brand: [
    { label: 'About', path: '/about' },
    { label: 'Manufacturing', path: '/manufacturing' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Blog', path: '/blog' },
    { label: 'Media', path: '/media' },
  ],
  shop: [
    { label: 'Products', path: '/products' },
    { label: 'Shop', path: '/shop' },
    { label: 'Cart', path: '/cart' },
    { label: 'Checkout', path: '/checkout' },
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
    { label: 'Policies', path: '/policies' },
    { label: 'Reviews', path: '/reviews' },
  ],
} as const;
