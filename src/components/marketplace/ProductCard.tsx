import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { Product } from '../../store/slices/marketplace/types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  /** Animation stagger index — passed from the grid so each card delays slightly */
  index?: number;
}

// ─── Animation variants ───────────────────────────────────────────────────────

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.38,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

const imageVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.07,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const overlayVariants: Variants = {
  rest: { opacity: 0, y: 8 },
  hover: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: 'easeOut' as const },
  },
};

const shimmerVariants: Variants = {
  rest: { x: '-100%' },
  hover: {
    x: '100%',
    transition: { duration: 0.55, ease: 'easeInOut' as const },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

function ProductCard({ product, onClick, index = 0 }: ProductCardProps) {
  const thumbnail = product.images?.[0] ?? null;
  const isOutOfStock = product.quantity === 0;

  return (
    <motion.button
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(product)}
      className="group w-full text-left rounded-2xl overflow-hidden
        bg-white dark:bg-neutral-b-800
        shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.13)]
        dark:shadow-none dark:hover:shadow-[0_8px_28px_rgba(0,0,0,0.4)]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
        transition-shadow duration-300"
    >
      {/* ── Image area ─────────────────────────────────────────────────── */}
      <div className="relative w-full aspect-square overflow-hidden bg-slate-100 dark:bg-neutral-b-700">
        {thumbnail ? (
          <motion.img
            variants={imageVariants}
            src={thumbnail}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          /* Placeholder with subtle gradient */
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/30 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-primary-400 dark:text-primary-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828
                     0L20 14M8 10a2 2 0 100-4 2 2 0 000 4z"
                />
              </svg>
            </div>
            <span className="text-xs text-slate-400 dark:text-neutral-b-500 font-medium">No image</span>
          </div>
        )}

        {/* Shimmer sweep on hover */}
        <motion.div
          variants={shimmerVariants}
          className="pointer-events-none absolute inset-0 w-full bg-linear-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
        />

        {/* Out-of-stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-red-500 px-3 py-1.5 rounded-full tracking-wide uppercase shadow">
              Out of Stock
            </span>
          </div>
        )}



        {/* Quantity low badge */}
        {product.quantity > 0 && product.quantity <= 5 && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold
              bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400
              border border-amber-200 dark:border-amber-700/40">
              Only {product.quantity} left
            </span>
          </div>
        )}
      </div>

      {/* ── Info panel ─────────────────────────────────────────────────── */}
      <div className="p-3 bg-white dark:bg-neutral-b-800 border-t border-neutral-b-100 dark:border-neutral-b-700/50">
        {/* Seller name */}
        {product.sellerName && (
          <p className="text-[10px] font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-widest mb-0.5 truncate">
            {product.sellerName}
          </p>
        )}

        {/* Title */}
        <p className="text-sm font-bold text-neutral-b-900 dark:text-dark-text-primary line-clamp-2 leading-snug mb-1">
          {product.title}
        </p>

        {/* Description */}
        {product.description && (
          <p className="text-xs text-neutral-b-400 dark:text-dark-text-muted line-clamp-1 mb-2">
            {product.description}
          </p>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-base font-extrabold bg-linear-to-r from-primary-600 to-primary-500 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent">
            {product.currency} {product.price.toFixed(2)}
          </span>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full
            ${isOutOfStock
              ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
              : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'}`}
          >
            {isOutOfStock ? 'Sold out' : `${product.quantity} in stock`}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export default ProductCard;
