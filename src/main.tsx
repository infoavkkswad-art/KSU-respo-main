```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './index.css';

import { LanguageProvider } from '@/context/LanguageContext';


const redirectPath = sessionStorage.getItem(
  'github-pages-redirect'
);

if (redirectPath) {
  sessionStorage.removeItem(
    'github-pages-redirect'
  );

  const currentPath =
    window.location.pathname +
    window.location.search +
    window.location.hash;

  if (
    currentPath === '/' &&
    redirectPath !== '/'
  ) {
    window.history.replaceState(
      null,
      '',
      redirectPath
    );
  }
}


createRoot(
  document.getElementById('root')!
).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>
);
```
