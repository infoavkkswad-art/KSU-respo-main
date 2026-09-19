import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { apiClient } from '@/services/api-client';

import {
  resetProductMasterCatalog,
  setProductMasterCatalog,
} from '@/services/product-master-store';

interface ProductMasterContextType {
  ready: boolean;
  error: string | null;
}

const ProductMasterContext =
  createContext<
    ProductMasterContextType | undefined
  >(undefined);

function CatalogLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div
        className="
          w-10
          h-10
          border-3
          border-brand-red/20
          border-t-brand-red
          rounded-full
          animate-spin
        "
        aria-label="Loading product prices"
      />
    </div>
  );
}

export function ProductMasterProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [ready, setReady] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    let cancelled = false;

    apiClient
      .getProducts()
      .then((products) => {
        if (cancelled) {
          return;
        }

        setProductMasterCatalog(
          products,
        );
        setError(null);
        setReady(true);
      })
      .catch((loadError: unknown) => {
        if (cancelled) {
          return;
        }

        resetProductMasterCatalog();
        setReady(false);
        setError(
          loadError instanceof Error &&
            loadError.message
            ? loadError.message
            : 'Unable to load product prices.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="container-max container-px py-20 text-center">
        <h1
          className="
            text-2xl
            font-serif
            font-bold
            text-brand-brown
            mb-2
          "
        >
          Product prices unavailable
        </h1>
        <p className="text-brand-brown/60">
          {error}
        </p>
      </div>
    );
  }

  if (!ready) {
    return <CatalogLoader />;
  }

  return (
    <ProductMasterContext.Provider
      value={{
        ready,
        error,
      }}
    >
      {children}
    </ProductMasterContext.Provider>
  );
}

export function useProductMaster(): ProductMasterContextType {
  const context = useContext(
    ProductMasterContext,
  );

  if (!context) {
    throw new Error(
      'useProductMaster must be used within ProductMasterProvider.',
    );
  }

  return context;
}
