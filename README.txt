KAWAD SWAD - FRONTEND TYPECHECK FIX

Files included:
1. src/context/CartContext.tsx
   - Removed unused React default import.

2. src/pages/Distributor.tsx
   - Removed unused Mail icon import.

3. src/pages/TrackOrder.tsx
   - Removed unused shippingTotal constant.
   - Imported FormEvent as a type and replaced React.FormEvent.

These fixes target the TS6133 errors shown in GitHub Actions.

Upload/replace ONLY these three files at the matching paths.
Then commit to the main branch and wait for a NEW Frontend Typecheck run.

Do not overwrite tsconfig files with this package.
