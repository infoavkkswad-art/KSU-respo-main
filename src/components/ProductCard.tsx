import { useState, useId } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, ChevronDown } from 'lucide-react';
import type { ProductFamily } from '../data/products';
import { PACK_LABELS } from '../data/products';
import { ProductImage } from '../components/ProductImage';
import { useCart, formatPrice } from '../context/CartContext';

interface ProductCardProps {
  product: ProductFamily;
  className?: string;
}

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedSkuIndex, setSelectedSkuIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const selectId = useId();

  const selectedSku = product.skus[selectedSkuIndex] || product.skus[0];
  const discount = Math.round(
    ((selectedSku.mrp - selectedSku.websitePrice) / selectedSku.mrp) * 100,
  );

  const handleAdd = () => {
    addItem(selectedSku.sku, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSkuIndex(Number(e.target.value));
  };

  const isCombo = product.category === 'combo' || product.skus.length === 1;

  return (
    <div className={`card overflow-hidden bg-white border border-brand-brown/5 flex flex-col h-full hover:shadow-lift transition-all duration-300 ${className}`}>
      {/* Image Link */}
      <Link
        to={`/product/${product.slug}`}
        aria-label={`View details for ${product.name}`}
        className="relative aspect-square overflow-hidden bg-brand-cream-dark block group"
      >
        <ProductImage
          productId={product.id}
          product={product}
          variant="card"
          className="w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="badge-red">{discount}% OFF</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <Link
            to={`/product/${product.slug}`}
            className="font-serif font-semibold text-brand-brown text-base leading-tight mb-1 hover:text-brand-red transition-colors block"
          >
            {product.name}
          </Link>
          <p className="text-xs text-brand-brown/60 mb-3">
            {product.variant}
          </p>

          {/* Pack Size Selector / Badge */}
          <div className="mb-4">
            {isCombo ? (
              <div className="inline-block px-3 py-1 bg-brand-cream text-brand-brown rounded-lg text-xs font-semibold border border-brand-brown/10">
                {PACK_LABELS[selectedSku.packSize] || `${selectedSku.packSize}g`} Combo
              </div>
            ) : (
              <div className="space-y-1.5">
                <label htmlFor={`pack-size-${selectId}`} className="block text-2xs font-bold uppercase tracking-wider text-brand-brown/70">
                  Pack Size
                </label>
                <div className="relative inline-block w-full">
                  <select
                    id={`pack-size-${selectId}`}
                    value={selectedSkuIndex}
                    onChange={handleSelectChange}
                    className="w-full appearance-none bg-brand-cream/50 border border-brand-brown/15 rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-brand-brown focus:outline-none focus:border-brand-red cursor-pointer transition-colors"
                  >
                    {product.skus.map((skuObj, idx) => (
                      <option key={skuObj.sku} value={idx}>
                        {PACK_LABELS[skuObj.packSize] || `${skuObj.packSize}g`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-brown/50 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-2.5 mb-1">
            <span className="text-lg font-bold text-brand-red">
              {formatPrice(selectedSku.websitePrice)}
            </span>
            <span className="text-sm text-brand-brown/40 line-through">
              {formatPrice(selectedSku.mrp)}
            </span>
          </div>
          <p className="text-2xs text-brand-brown/60 mb-4">
            {selectedSku.freeShipping ? (
              <span className="text-green-600 font-medium">Free shipping</span>
            ) : (
              `+ ${formatPrice(selectedSku.shipping)} shipping`
            )}
          </p>
        </div>

        <button
          onClick={handleAdd}
          className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all mt-2 ${
            added 
              ? 'bg-emerald-600 text-white' 
              : 'border border-brand-brown/20 text-brand-brown hover:bg-brand-brown/5'
          }`}
          aria-label={`Add ${product.name} (${PACK_LABELS[selectedSku.packSize] || `${selectedSku.packSize}g`}) to cart`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" /> Added
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
