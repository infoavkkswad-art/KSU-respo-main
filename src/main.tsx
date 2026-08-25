import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './locales/config';
import App from './App.tsx';
import './index.css';

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

  if (currentPath === '/' && redirectPath !== '/') {
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
    <App />
  </StrictMode>
);
