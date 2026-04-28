import type { Product } from '../../store/slices/marketplace/types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

function ProductCard({ product, onClick }: ProductCardProps) {
  const thumbnail = product.images?.[0] ?? null;

  return (
    <button
      onClick={() => onClick(product)}
      className="group w-full text-left rounded-2xl overflow-hidden
        bg-white dark:bg-neutral-b-800
        border border-neutral-b-200 dark:border-neutral-b-700
        shadow-sm hover:shadow-md
        transition-all duration-200 hover:-translate-y-0.5 focus:outline-none
        focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-neutral-b-100 dark:bg-neutral-b-700 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg
              className="w-12 h-12 text-neutral-b-400 dark:text-neutral-b-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14
                   M8 10a2 2 0 100-4 2 2 0 000 4z"
              />
            </svg>
          </div>
        )}

        {/* Quantity badge */}
        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-sm font-semibold bg-red-500 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold text-neutral-b-800 dark:text-dark-text-primary line-clamp-2 mb-1">
          {product.title}
        </p>
        <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted line-clamp-1 mb-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-blue-600 dark:text-blue-400">
            {product.currency} {product.price.toFixed(2)}
          </span>
          <span className="text-xs text-neutral-b-400 dark:text-dark-text-muted">
            Qty: {product.quantity}
          </span>
        </div>
      </div>
    </button>
  );
}

export default ProductCard;
