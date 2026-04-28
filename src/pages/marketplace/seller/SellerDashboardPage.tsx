import { useNavigate } from 'react-router-dom';
import { useGetSellerProfileQuery, useGetSellerProductsQuery, useGetSellerDealsQuery } from '../../../store/slices/marketplace/marketplaceApi';
import SellerDashboardNav from '../../../components/marketplace/SellerDashboardNav';
import StatusBadge from '../../../components/marketplace/StatusBadge';

function SellerDashboardPage() {
  const navigate = useNavigate();
  const { data: profileData, isLoading: profileLoading } = useGetSellerProfileQuery();
  const { data: productsData } = useGetSellerProductsQuery({ page: 1, limit: 1 });
  const { data: dealsData } = useGetSellerDealsQuery({ page: 1, limit: 1 });

  const profile = profileData?.data;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-neutral-b-900 dark:text-dark-text-primary mb-6">
          Seller Portal
        </h1>

        <SellerDashboardNav />

        {profileLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-24 bg-neutral-b-100 dark:bg-neutral-b-800 rounded-2xl" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-neutral-b-100 dark:bg-neutral-b-800 rounded-2xl" />
              <div className="h-24 bg-neutral-b-100 dark:bg-neutral-b-800 rounded-2xl" />
            </div>
          </div>
        ) : (
          <>
            {/* Profile summary */}
            {profile && (
              <div className="bg-white dark:bg-neutral-b-800 rounded-2xl p-5 border border-neutral-b-200 dark:border-neutral-b-700 shadow-sm mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted uppercase tracking-wide font-medium mb-1">
                      Business
                    </p>
                    <p className="text-lg font-bold text-neutral-b-900 dark:text-dark-text-primary">
                      {profile.businessName}
                    </p>
                    <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted">
                      {profile.city} · {profile.phoneNumber}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={profile.status} />
                    <button
                      onClick={() => navigate('/marketplace/seller/profile')}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Edit Profile →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div
                className="bg-white dark:bg-neutral-b-800 rounded-2xl p-5 border border-neutral-b-200 dark:border-neutral-b-700 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/marketplace/seller/products')}
              >
                <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted uppercase tracking-wide font-medium mb-1">
                  Total Products
                </p>
                <p className="text-3xl font-extrabold text-neutral-b-900 dark:text-dark-text-primary">
                  {productsData?.total ?? '—'}
                </p>
                <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">Manage</p>
              </div>

              <div
                className="bg-white dark:bg-neutral-b-800 rounded-2xl p-5 border border-neutral-b-200 dark:border-neutral-b-700 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/marketplace/seller/deals')}
              >
                <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted uppercase tracking-wide font-medium mb-1">
                  Active Deals
                </p>
                <p className="text-3xl font-extrabold text-neutral-b-900 dark:text-dark-text-primary">
                  {dealsData?.total ?? '—'}
                </p>
                <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">View</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SellerDashboardPage;
