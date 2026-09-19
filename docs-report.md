# Kawad Swad 2.0 Visual Makeup Review

## Source reviewed
The uploaded repository ZIP was inspected across the React/Vite frontend, product data, image registry, shared components, routes, cart/order contexts, API client, and Tailwind/CSS configuration.

## Important findings

- Existing frontend is already a substantial implementation, not a blank site.
- The visual layer already contains the intended Kawad Swad structure: header, homepage hero, product cards, PDP, cart, checkout, footer, responsive layouts and motion.
- The product image registry maps the 15 current product families to matching assets in `public/images/products/`.
- Product assets include both square and portrait packaging. The existing image system correctly uses `object-contain`.
- The current Tailwind palette was still using an earlier green/saffron/brown system. The patch aligns the design tokens with the approved Kawad Swad 2.0 palette.
- Several decorative classes used by the existing UI (`bg-grid`, `bg-dots`, `bg-warm-glow`) were referenced but not defined. The patch adds them.
- `shadow-gold-glow` was referenced but missing from Tailwind configuration. The patch adds it.
- The header contained the typo `Nimad's Own Papad`; the patch corrects it to `Nimar's Own Papad`.
- The root HTML theme color was an unrelated orange value. The patch changes it to the approved Nimar green.
- The existing ecommerce, cart, order, Razorpay, shipping and product-data code was not changed by this visual patch.

## Files changed by this patch

- `tailwind.config.js`
- `src/styles/kawad-visual.css` (new)
- `src/main.tsx`
- `index.html`
- `src/components/Header.tsx`
- `src/components/ProductImage.tsx`

## Explicitly not changed

- SKU data
- MRP
- selling prices
- pack sizes
- availability
- product names
- product catalogue logic
- CartContext
- OrderContext
- Razorpay
- shipping/fulfilment logic
- backend/API contracts

## Validation to run after pasting

```bash
npm run typecheck
npm run lint
npm run build
```

Do not merge/deploy until those checks pass.
