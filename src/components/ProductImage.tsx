import { getProductFamilyImage } from '@/data/product-images';
import type { ProductFamily } from '@/data/products';
import { CATEGORY_LABELS } from '@/data/products';

interface ProductImageProps {
  productId?: string;
  product?: ProductFamily;
  variant?: 'card' | 'detail' | 'hero';
  className?: string;
}

/**
 * Shared ProductImage component supporting deterministic product-family image resolution
 * and fallback to a controlled placeholder state when real assets are pending.
 */
export function ProductImage({ productId, product, variant = 'card', className = '' }: ProductImageProps) {
  const resolvedId = productId || (product ? product.id : '');
  const imageConfig = getProductFamilyImage(resolvedId);
  const targetProduct = product;
  const categoryLabel = targetProduct ? CATEGORY_LABELS[targetProduct.category] : 'Papad';

  const sizeClass =
    variant === 'detail'
      ? 'text-7xl'
      : variant === 'hero'
        ? 'text-8xl'
        : 'text-5xl';

  const isAvailable = imageConfig.status === 'available' && Boolean(imageConfig.primary);

  // Performance attributes per variant
  const isEager = variant === 'hero' || variant === 'detail';

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      aria-label={imageConfig.alt}
      role="img"
    >
      {isAvailable ? (
        <img
          src={imageConfig.primary}
          alt={imageConfig.alt}
          loading={isEager ? 'eager' : 'lazy'}
          decoding={isEager ? 'sync' : 'async'}
          {...(isEager ? { fetchPriority: 'high' } : {})}
          className="w-full h-full object-contain p-2"
        />
      ) : (
        <>
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-cream-dark via-brand-cream to-brand-yellow/10" />

          {/* Decorative dot pattern */}
          <div className="absolute inset-0 bg-dots opacity-40" />

          {/* Papad silhouette & Placeholder text */}
          <div className="relative z-10 flex flex-col items-center gap-3 p-4 text-center">
            <div
              className={`${sizeClass} font-serif font-bold text-brand-red/20 leading-none`}
              aria-hidden="true"
            >
              ◯
            </div>
            <div>
              <p className="font-serif font-semibold text-brand-brown text-sm sm:text-base">
                {imageConfig.alt}
              </p>
              <p className="font-sans text-2xs text-brand-brown/50 mt-1 uppercase tracking-wider">
                Product image coming soon
              </p>
            </div>
          </div>

          {/* Category badge if product data available */}
          {targetProduct && (
            <div className="absolute top-3 left-3 z-10">
              <span className="badge-brown">{categoryLabel}</span>
            </div>
          )}

          {/* Status mark */}
          <div className="absolute bottom-3 right-3 z-10">
            <span className="text-2xs font-bold uppercase tracking-wider text-brand-brown/40">
              Pending Asset
            </span>
          </div>
        </>
      )}
    </div>
  );
}
