import { useEffect } from 'react';

import { brand } from '@/data/brand';


/* ==========================================================================
   KAWAD SWAD 2.0
   CENTRAL SEO SYSTEM

   Responsibilities:
   - Document title
   - Meta description
   - Robots
   - Canonical URL
   - Open Graph
   - Twitter cards
   - JSON-LD structured data

   Important:
   This component owns SEO metadata only.
   It does not introduce visual design dependencies.
   ========================================================================== */


interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
  indexable?: boolean;
}


/* ==========================================================================
   SITE CONSTANTS
   ========================================================================== */

const SITE_URL = 'https://kawadswad.in';

const DEFAULT_OG_IMAGE =
  `${SITE_URL}/og-default.png`;

const STRUCTURED_DATA_ID =
  'kawad-swad-structured-data';


/* ==========================================================================
   HELPERS
   ========================================================================== */

function upsertMeta(
  name: string,
  content: string,
  attribute: 'name' | 'property' = 'name',
) {
  let element =
    document.querySelector<HTMLMetaElement>(
      `meta[${attribute}="${name}"]`,
    );

  if (!element) {
    element =
      document.createElement('meta');

    element.setAttribute(
      attribute,
      name,
    );

    document.head.appendChild(
      element,
    );
  }

  element.setAttribute(
    'content',
    content,
  );
}


function upsertLink(
  rel: string,
  href: string,
) {
  let element =
    document.querySelector<HTMLLinkElement>(
      `link[rel="${rel}"]`,
    );

  if (!element) {
    element =
      document.createElement('link');

    element.setAttribute(
      'rel',
      rel,
    );

    document.head.appendChild(
      element,
    );
  }

  element.setAttribute(
    'href',
    href,
  );
}


/* ==========================================================================
   SEO COMPONENT
   ========================================================================== */

export function SEO({
  title,
  description,
  path = '',
  image,
  type = 'website',
  structuredData,
  indexable = true,
}: SEOProps) {
  const normalizedPath =
    path.startsWith('/')
      ? path
      : path
        ? `/${path}`
        : '';

  const fullTitle =
    `${title} | ${brand.name}`;

  const url =
    `${SITE_URL}${normalizedPath}`;

  const ogImage =
    image || DEFAULT_OG_IMAGE;


  useEffect(() => {
    /* ========================================================================
       BASIC DOCUMENT SEO
       ====================================================================== */

    document.title = fullTitle;

    upsertMeta(
      'description',
      description,
    );

    upsertMeta(
      'robots',
      indexable
        ? 'index, follow'
        : 'noindex, follow',
    );

    upsertLink(
      'canonical',
      url,
    );


    /* ========================================================================
       OPEN GRAPH
       ====================================================================== */

    upsertMeta(
      'og:title',
      fullTitle,
      'property',
    );

    upsertMeta(
      'og:description',
      description,
      'property',
    );

    upsertMeta(
      'og:url',
      url,
      'property',
    );

    upsertMeta(
      'og:type',
      type,
      'property',
    );

    upsertMeta(
      'og:image',
      ogImage,
      'property',
    );


    /* ========================================================================
       TWITTER
       ====================================================================== */

    upsertMeta(
      'twitter:card',
      'summary_large_image',
    );

    upsertMeta(
      'twitter:title',
      fullTitle,
    );

    upsertMeta(
      'twitter:description',
      description,
    );

    upsertMeta(
      'twitter:image',
      ogImage,
    );


    /* ========================================================================
       STRUCTURED DATA
       ====================================================================== */

    const existingScript =
      document.getElementById(
        STRUCTURED_DATA_ID,
      );

    if (structuredData) {
      const script =
        existingScript ||
        document.createElement(
          'script',
        );

      script.id =
        STRUCTURED_DATA_ID;

      script.type =
        'application/ld+json';

      script.textContent =
        JSON.stringify(
          structuredData,
        );

      if (!existingScript) {
        document.head.appendChild(
          script,
        );
      }
    } else {
      existingScript?.remove();
    }


    /* ========================================================================
       CLEANUP

       We intentionally do not remove the metadata here because another
       route can immediately replace it during SPA navigation.
       ====================================================================== */

  }, [
    fullTitle,
    description,
    url,
    ogImage,
    type,
    structuredData,
    indexable,
  ]);


  return null;
}


/* ==========================================================================
   ORGANIZATION SCHEMA
   ========================================================================== */

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',

    name: brand.name,

    alternateName:
      brand.hindiName,

    description:
      'Traditional Indian papads rooted in the taste of Nimar.',

    email:
      brand.email,

    telephone:
      brand.phone,

    funder: {
      '@type': 'Organization',
      name: brand.manufacturer,
    },

    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Madhya Pradesh',
      addressCountry: 'IN',
    },

    sameAs: [
      brand.instagramUrl,
      brand.youtubeUrl,
    ],
  };
}


/* ==========================================================================
   PRODUCT SCHEMA
   ========================================================================== */

export function productSchema(
  name: string,
  description: string,
  price: number,
  category: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',

    name,

    description,

    category,

    brand: {
      '@type': 'Brand',
      name: brand.name,
    },

    offers: {
      '@type': 'Offer',
      price: price.toString(),
      priceCurrency: 'INR',
    },
  };
}


/* ==========================================================================
   ARTICLE SCHEMA
   ========================================================================== */

export function articleSchema(
  title: string,
  description: string,
  date: string,
  author: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',

    headline: title,

    description,

    datePublished: date,

    author: {
      '@type': 'Organization',
      name: author,
    },

    publisher: {
      '@type': 'Organization',
      name: brand.name,
    },
  };
}


/* ==========================================================================
   BREADCRUMB SCHEMA
   ========================================================================== */

export function breadcrumbSchema(
  items: {
    name: string;
    path: string;
  }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',

    itemListElement:
      items.map(
        (item, index) => ({
          '@type': 'ListItem',

          position:
            index + 1,

          name:
            item.name,

          item:
            `${SITE_URL}${
              item.path.startsWith('/')
                ? item.path
                : `/${item.path}`
            }`,
        }),
      ),
  };
}
