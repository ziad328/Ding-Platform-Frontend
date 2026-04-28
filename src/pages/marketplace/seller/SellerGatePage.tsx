import { useNavigate, Link } from 'react-router-dom';
import { useGetApplicationStatusQuery } from '../../../store/slices/marketplace/marketplaceApi';
import StatusBadge from '../../../components/marketplace/StatusBadge';

/**
 * SellerGatePage — entry point for /marketplace/seller.
 * Checks application status and renders the appropriate state.
 */
function SellerGatePage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetApplicationStatusQuery();

  const application = data?.data;

  // APPROVED → redirect to dashboard immediately
  if (!isLoading && application?.status === 'APPROVED') {
    navigate('/marketplace/seller/dashboard', { replace: true });
    return null;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-neutral-b-900 dark:text-dark-text-primary">
            Seller Portal
          </h1>
          <Link
            to="/marketplace"
            className="text-xs text-neutral-b-500 dark:text-dark-text-muted hover:text-neutral-b-800 dark:hover:text-dark-text-primary transition-colors"
          >
            ← Marketplace
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* No application / error (404) */}
        {!isLoading && (isError || !application) && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="max-w-sm">
              <div className="text-5xl mb-4">🛍️</div>
              <h2 className="text-xl font-bold text-neutral-b-900 dark:text-dark-text-primary mb-2">
                Become a Seller
              </h2>
              <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted mb-6">
                Start selling on the Ding Marketplace. Apply today and reach thousands of users.
              </p>
              <button
                onClick={() => navigate('/marketplace/seller/apply')}
                className="w-full py-3 px-6 rounded-xl font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Apply to Sell
              </button>
            </div>
          </div>
        )}

        {/* PENDING */}
        {!isLoading && application?.status === 'PENDING' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="max-w-sm">
              <div className="text-5xl mb-4">⏳</div>
              <h2 className="text-xl font-bold text-neutral-b-900 dark:text-dark-text-primary mb-2">
                Application Under Review
              </h2>
              <div className="flex justify-center mb-3">
                <StatusBadge status="PENDING" />
              </div>
              <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted">
                Your seller application is being reviewed. We'll notify you when a decision is made.
              </p>
            </div>
          </div>
        )}

        {/* DECLINED */}
        {!isLoading && application?.status === 'DECLINED' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="max-w-sm">
              <div className="text-5xl mb-4">❌</div>
              <h2 className="text-xl font-bold text-neutral-b-900 dark:text-dark-text-primary mb-2">
                Application Declined
              </h2>
              <div className="flex justify-center mb-3">
                <StatusBadge status="DECLINED" />
              </div>
              {application.declineReason && (
                <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted mb-4">
                  Reason: {application.declineReason}
                </p>
              )}
              <button
                onClick={() => navigate('/marketplace/seller/apply')}
                className="w-full py-3 px-6 rounded-xl font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Re-apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerGatePage;

