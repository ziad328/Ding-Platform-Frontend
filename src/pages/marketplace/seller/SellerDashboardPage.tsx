import { useNavigate } from 'react-router-dom';
import {
  useGetSellerProfileQuery,
  useGetSellerProductsQuery,
  useGetSellerDealsQuery,
} from '../../../store/slices/marketplace/marketplaceApi';
import SellerDashboardNav from '../../../components/marketplace/SellerDashboardNav';
import StatusBadge from '../../../components/marketplace/StatusBadge';
import type { Deal } from '../../../store/slices/marketplace/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function StarRating({ value }: { value?: number }) {
  const rating = value ?? 0;
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <span className="flex items-center gap-0.5" aria-label={`Rating: ${rating.toFixed(1)}`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const isPartial = i === full && partial > 0;
        return (
          <span key={i} className="relative inline-block text-lg leading-none">
            <span className="text-neutral-b-200 dark:text-neutral-b-600">★</span>
            {(filled || isPartial) && (
              <span
                className="absolute inset-0 text-amber-400 overflow-hidden"
                style={{ width: filled ? '100%' : `${partial * 100}%` }}
              >
                ★
              </span>
            )}
          </span>
        );
      })}
      <span className="ml-1 text-sm font-semibold text-neutral-b-700 dark:text-dark-text-secondary">
        {rating > 0 ? rating.toFixed(1) : 'No ratings yet'}
      </span>
    </span>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  onClick?: () => void;
  accent?: string;
}

function StatCard({ icon, label, value, sub, onClick, accent = 'from-primary-50 to-white dark:from-primary-900/20 dark:to-neutral-b-800' }: StatCardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`relative overflow-hidden rounded-2xl border border-neutral-b-200 dark:border-neutral-b-700
        bg-linear-to-br ${accent}
        shadow-sm p-5 flex flex-col gap-2
        ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400' : ''}`}
    >
      <span className="text-2xl">{icon}</span>
      <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted uppercase tracking-wide font-medium">{label}</p>
      <p className="text-3xl font-extrabold text-neutral-b-900 dark:text-dark-text-primary leading-none">{value}</p>
      {sub && <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{sub}</p>}
    </div>
  );
}

// ─── Recent deal row ─────────────────────────────────────────────────────────

function RecentDealRow({ deal }: { deal: Deal }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-neutral-b-100 dark:border-neutral-b-700/50 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-base shrink-0">
        🛒
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-b-900 dark:text-dark-text-primary truncate">
          {deal.productTitle ?? deal.productId}
        </p>
        <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted">
          {deal.buyerName ?? deal.buyerId} · {formatDate(deal.createdAt)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-sm font-bold text-neutral-b-900 dark:text-dark-text-primary">
          {deal.currency} {deal.amount.toFixed(2)}
        </span>
        <StatusBadge status={deal.status} />
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

function SellerDashboardPage() {
  const navigate = useNavigate();

  const { data: profileData, isLoading: profileLoading } = useGetSellerProfileQuery();
  const { data: productsData, isLoading: productsLoading } = useGetSellerProductsQuery({ page: 1, limit: 1 });
  const { data: dealsData, isLoading: dealsLoading } = useGetSellerDealsQuery({ page: 1, limit: 5 });

  const profile = profileData?.data;
  const recentDeals = Array.isArray(dealsData?.data) ? dealsData.data : [];

  const isLoading = profileLoading || productsLoading || dealsLoading;

  const joinedDate = profile?.registeredAt ?? profile?.createdAt;
  const location = [profile?.city, profile?.country].filter(Boolean).join(', ');

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-neutral-b-900 dark:text-dark-text-primary mb-6">
          Seller Portal
        </h1>

        <SellerDashboardNav />

        {/* ── Loading skeleton ─────────────────────────────────────────── */}
        {isLoading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-36 bg-neutral-b-100 dark:bg-neutral-b-800 rounded-2xl" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 bg-neutral-b-100 dark:bg-neutral-b-800 rounded-2xl" />
              ))}
            </div>
            <div className="h-48 bg-neutral-b-100 dark:bg-neutral-b-800 rounded-2xl" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* ── Hero / profile banner ───────────────────────────────── */}
            {profile && (
              <div className="relative overflow-hidden rounded-2xl border border-neutral-b-200 dark:border-neutral-b-700 shadow-sm mb-5 bg-linear-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 p-6 text-white">
                {/* decorative circles */}
                <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />

                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left – identity */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={profile.status} />
                    </div>
                    <h2 className="text-2xl font-extrabold leading-tight">{profile.businessName}</h2>
                    {location && (
                      <p className="text-sm text-primary-100 flex items-center gap-1 mt-1">
                        <span>📍</span> {location}
                      </p>
                    )}
                    {profile.phoneNumber && (
                      <p className="text-sm text-primary-100 flex items-center gap-1 mt-0.5">
                        <span>📞</span> {profile.phoneNumber}
                      </p>
                    )}
                    {joinedDate && (
                      <p className="text-xs text-primary-200 mt-2">
                        Member since {formatDate(joinedDate)}
                      </p>
                    )}
                  </div>

                  {/* Right – rating + edit */}
                  <div className="flex flex-col items-start sm:items-end gap-3">
                    <StarRating value={profile.rating} />
                    <button
                      onClick={() => navigate('/marketplace/seller/profile')}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/15 hover:bg-white/25 border border-white/30 transition-colors backdrop-blur-sm"
                    >
                      Edit Profile →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Stats grid ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              <StatCard
                icon="📦"
                label="Total Products"
                value={productsData?.total ?? '—'}
                sub="Manage →"
                onClick={() => navigate('/marketplace/seller/products')}
                accent="from-blue-50 to-white dark:from-blue-900/20 dark:to-neutral-b-800"
              />
              <StatCard
                icon="🤝"
                label="Active Deals"
                value={dealsData?.total ?? '—'}
                sub="View →"
                onClick={() => navigate('/marketplace/seller/deals')}
                accent="from-emerald-50 to-white dark:from-emerald-900/20 dark:to-neutral-b-800"
              />
              <StatCard
                icon="⭐"
                label="Seller Rating"
                value={profile?.rating != null ? profile.rating.toFixed(1) : '—'}
                sub={profile?.rating != null ? 'out of 5.0' : 'No ratings yet'}
                accent="from-amber-50 to-white dark:from-amber-900/20 dark:to-neutral-b-800"
              />
              <StatCard
                icon="💰"
                label="Total Sales"
                value={profile?.totalSales ?? '—'}
                sub={profile?.totalSales != null ? 'completed orders' : 'No sales yet'}
                accent="from-violet-50 to-white dark:from-violet-900/20 dark:to-neutral-b-800"
              />
            </div>

            {/* ── Quick actions ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {[
                {
                  icon: '➕',
                  label: 'Add a Product',
                  desc: 'List a new item for sale',
                  onClick: () => navigate('/marketplace/seller/products'),
                },
                {
                  icon: '📋',
                  label: 'Manage Products',
                  desc: 'Edit price, stock & details',
                  onClick: () => navigate('/marketplace/seller/products'),
                },
                {
                  icon: '📈',
                  label: 'Deal History',
                  desc: 'Review completed transactions',
                  onClick: () => navigate('/marketplace/seller/deals'),
                },
              ].map(({ icon, label, desc, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="flex items-center gap-3 p-4 rounded-2xl text-left
                    bg-white dark:bg-neutral-b-800
                    border border-neutral-b-200 dark:border-neutral-b-700
                    hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-neutral-b-900 dark:text-dark-text-primary">{label}</p>
                    <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted">{desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* ── Recent deals ─────────────────────────────────────────── */}
            <div className="bg-white dark:bg-neutral-b-800 rounded-2xl border border-neutral-b-200 dark:border-neutral-b-700 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-neutral-b-900 dark:text-dark-text-primary">
                  Recent Deals
                </h3>
                <button
                  onClick={() => navigate('/marketplace/seller/deals')}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View all →
                </button>
              </div>

              {recentDeals.length === 0 ? (
                <p className="text-center py-8 text-sm text-neutral-b-500 dark:text-dark-text-muted">
                  No active deals yet. Start selling to see activity here.
                </p>
              ) : (
                <div>
                  {recentDeals.map((deal) => (
                    <RecentDealRow key={deal.id} deal={deal} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SellerDashboardPage;
