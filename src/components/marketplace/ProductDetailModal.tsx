import { useState } from 'react';
import { toast } from 'sonner';
import type { Product } from '../../store/slices/marketplace/types';
import { useBuyProductMutation } from '../../store/slices/marketplace/marketplaceApi';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [buyProduct, { isLoading: isBuying }] = useBuyProductMutation();

  if (!product) return null;

  const handleBuy = async () => {
    try {
      await buyProduct(product.id).unwrap();
      toast.success('Purchase successful! The seller will be in touch.');
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Purchase failed. Please try again.');
    }
  };

  const images = product.images?.length ? product.images : [];

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto
          bg-white dark:bg-neutral-b-800 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full
            bg-neutral-b-100 dark:bg-neutral-b-700
            text-neutral-b-600 dark:text-dark-text-secondary
            hover:bg-neutral-b-200 dark:hover:bg-neutral-b-600
            transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Images column */}
          <div className="md:w-1/2 p-4 flex flex-col gap-3">
            <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-b-100 dark:bg-neutral-b-700">
              {images.length > 0 ? (
                <img
                  src={images[activeImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <svg
                    className="w-16 h-16 text-neutral-b-300 dark:text-neutral-b-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M8 10a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all
                      ${i === activeImage
                        ? 'border-primary-500'
                        : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info column */}
          <div className="md:w-1/2 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-b-900 dark:text-dark-text-primary mb-2">
                {product.title}
              </h2>
              <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted mb-4 leading-relaxed">
                {product.description}
              </p>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
                  {product.currency} {product.price.toFixed(2)}
                </span>
              </div>

              <div className="text-sm text-neutral-b-500 dark:text-dark-text-muted mb-6">
                {product.quantity > 0 ? (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    ✓ {product.quantity} in stock
                  </span>
                ) : (
                  <span className="text-red-500 font-medium">✗ Out of stock</span>
                )}
              </div>
            </div>

            <button
              onClick={handleBuy}
              disabled={isBuying || product.quantity === 0}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white
                bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 active:bg-primary-800
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-150"
            >
              {isBuying ? 'Processing…' : product.quantity === 0 ? 'Out of Stock' : 'Buy Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailModal;
