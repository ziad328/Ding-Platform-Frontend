import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/auth/auth';
import { useGetProductsQuery } from '../../store/slices/marketplace/marketplaceApi';
import type { Product } from '../../store/slices/marketplace/types';
import ProductCard from '../../components/marketplace/ProductCard';
import ProductDetailModal from '../../components/marketplace/ProductDetailModal';
import PaginationControls from '../../components/marketplace/PaginationControls';
import { MOCK_PRODUCTS } from '../../data/mockMarketplace';

function MarketplacePage() {
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isAdmin = user?.role === 'ADMIN';

  const { data, isLoading, isError, isFetching } = useGetProductsQuery({ page, limit: 20 });

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
            <button
              onClick={() => navigate('/marketplace/seller')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white
                transition-colors duration-150"
            >
              <span className="hidden sm:inline">Become a Seller</span>
              <span className="sm:hidden">Sell</span>
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
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 transition-opacity
              ${isFetching ? 'opacity-60' : 'opacity-100'}`}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={setSelectedProduct}
              />
            ))}
          </div>
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
