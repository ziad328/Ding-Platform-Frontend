import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/auth/auth';
import {
  useGetProductsQuery,
  useGetApplicationStatusQuery,
} from '../../store/slices/marketplace/marketplaceApi';
import type { Product } from '../../store/slices/marketplace/types';
import ProductCard from '../../components/marketplace/ProductCard';
import ProductDetailModal from '../../components/marketplace/ProductDetailModal';
import PaginationControls from '../../components/marketplace/PaginationControls';
import { MOCK_PRODUCTS } from '../../data/mockMarketplace';

// ─── Seller button configuration based on application status ─────────────────

type SellerButtonConfig = {
  label: string;
  shortLabel: string;
  path: string;
  disabled: boolean;
  className: string;
};

function getSellerButtonConfig(status?: string): SellerButtonConfig {
  const normalised = status?.toUpperCase();
  switch (normalised) {
    case 'APPROVED':
      return {
        label: 'My Seller Dashboard',
        shortLabel: 'Dashboard',
        path: '/marketplace/seller/dashboard',
        disabled: false,
        className:
          'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium ' +
          'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white ' +
          'transition-colors duration-150',
      };
    case 'PENDING':
      return {
        label: 'Application Pending',
        shortLabel: 'Pending',
        path: '/marketplace/seller',
        disabled: true,
        className:
          'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium ' +
          'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 ' +
          'border border-amber-300 dark:border-amber-700/50 cursor-not-allowed opacity-80',
      };
    case 'DECLINED':
      return {
        label: 'Re-apply as Seller',
        shortLabel: 'Re-apply',
        path: '/marketplace/seller/apply',
        disabled: false,
        className:
          'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium ' +
          'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white ' +
          'transition-colors duration-150',
      };
    default:
      return {
        label: 'Become a Seller',
        shortLabel: 'Sell',
        path: '/marketplace/seller',
        disabled: false,
        className:
          'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium ' +
          'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white ' +
          'transition-colors duration-150',
      };
  }
}

function MarketplacePage() {
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isAdmin = user?.role === 'ADMIN';

  const { data, isLoading, isError, isFetching } = useGetProductsQuery({ page, limit: 20 });

  // Fetch the current user's seller application status to drive the CTA button
  const { data: appData, isLoading: appLoading } = useGetApplicationStatusQuery();
  const applicationStatus = appData?.data?.status;
  const sellerBtn = getSellerButtonConfig(applicationStatus);

  // Fall back to mock data while the backend has no products yet
  const apiProducts = data?.data ?? [];
  const products = apiProducts.length > 0 ? apiProducts : MOCK_PRODUCTS;
  const totalPages = data?.totalPages ?? 1;
  const isMock = apiProducts.length === 0 && !isLoading;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-b-900 dark:text-dark-text-primary">
              Marketplace
            </h1>
            <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted mt-1">
              Browse products from verified sellers
            </p>
          </div>

          {/* Quick-nav actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Seller CTA – adapts to the user's application status */}
            <button
              onClick={() => !sellerBtn.disabled && navigate(sellerBtn.path)}
              disabled={sellerBtn.disabled || appLoading}
              className={sellerBtn.className}
              title={sellerBtn.label}
            >
              {appLoading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline">{sellerBtn.label}</span>
                  <span className="sm:hidden">{sellerBtn.shortLabel}</span>
                </>
              )}
            </button>

            {isAdmin && (
              <button
                onClick={() => navigate('/marketplace/admin/applications')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                  bg-white dark:bg-neutral-b-800
                  border border-neutral-b-200 dark:border-neutral-b-700
                  text-neutral-b-700 dark:text-dark-text-secondary
                  hover:bg-neutral-b-50 dark:hover:bg-neutral-b-700
                  transition-colors duration-150"
              >
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Mock data notice */}
        {isMock && (
          <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl
            bg-amber-50 dark:bg-amber-900/20
            border border-amber-200 dark:border-amber-700/40
            text-amber-700 dark:text-amber-400 text-xs font-medium">
            Showing demo products — live listings will appear here once sellers add products.
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden bg-neutral-b-100 dark:bg-neutral-b-800 animate-pulse"
              >
                <div className="aspect-square bg-neutral-b-200 dark:bg-neutral-b-700" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-neutral-b-200 dark:bg-neutral-b-700 rounded" />
                  <div className="h-3 bg-neutral-b-200 dark:bg-neutral-b-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-neutral-b-500 dark:text-dark-text-muted text-sm">
              Failed to load products. Please try again later.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-neutral-b-500 dark:text-dark-text-muted text-sm">
              No products available yet.
            </p>
          </div>
        )}

        {/* Product grid */}
        {!isLoading && products.length > 0 && (
          <AnimatePresence mode="wait">
            <div
              key={page}
              className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 transition-opacity
                ${isFetching ? 'opacity-60' : 'opacity-100'}`}
            >
              {products.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={setSelectedProduct}
                  index={i}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* Product detail modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

export default MarketplacePage;
