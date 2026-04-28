import { useState } from 'react';
import {
  useGetSellerDealsQuery,
  useGetDealHistoryQuery,
} from '../../../store/slices/marketplace/marketplaceApi';
import type { Deal } from '../../../store/slices/marketplace/types';
import SellerDashboardNav from '../../../components/marketplace/SellerDashboardNav';
import StatusBadge from '../../../components/marketplace/StatusBadge';
import PaginationControls from '../../../components/marketplace/PaginationControls';

type Tab = 'active' | 'history';

function DealRow({ deal }: { deal: Deal }) {
  return (
    <div className="flex items-center gap-4 bg-white dark:bg-neutral-b-800 border border-neutral-b-200 dark:border-neutral-b-700 rounded-2xl p-4 shadow-sm">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-neutral-b-900 dark:text-dark-text-primary text-sm truncate">
          {deal.productTitle ?? deal.productId}
        </p>
        <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted">
          Buyer: {deal.buyerName ?? deal.buyerId}
        </p>
        <p className="text-xs text-neutral-b-400 dark:text-dark-text-muted">
          {new Date(deal.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className="text-sm font-bold text-neutral-b-900 dark:text-dark-text-primary">
          {deal.currency} {deal.amount.toFixed(2)}
        </span>
        <StatusBadge status={deal.status} />
      </div>
    </div>
  );
}

function SellerDealsPage() {
  const [tab, setTab] = useState<Tab>('active');
  const [activePage, setActivePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  const { data: activeData, isLoading: activeLoading } = useGetSellerDealsQuery({ page: activePage, limit: 20 });
  const { data: historyData, isLoading: historyLoading } = useGetDealHistoryQuery({ page: historyPage, limit: 20 });

  const activeDeals = activeData?.data ?? [];
  const historyDeals = historyData?.data ?? [];

  const isLoading = tab === 'active' ? activeLoading : historyLoading;
  const deals: Deal[] = tab === 'active' ? activeDeals : historyDeals;
  const totalPages = tab === 'active' ? (activeData?.totalPages ?? 1) : (historyData?.totalPages ?? 1);
  const page = tab === 'active' ? activePage : historyPage;
  const setPage = tab === 'active' ? setActivePage : setHistoryPage;

  const tabClass = (t: Tab) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      tab === t
        ? 'bg-white dark:bg-neutral-b-700 text-neutral-b-900 dark:text-dark-text-primary shadow-sm'
        : 'text-neutral-b-600 dark:text-dark-text-muted hover:text-neutral-b-800 dark:hover:text-dark-text-secondary'
    }`;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-neutral-b-900 dark:text-dark-text-primary mb-6">
          Seller Portal
        </h1>

        <SellerDashboardNav />

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-neutral-b-100 dark:bg-neutral-b-800 mb-5 w-fit">
          <button onClick={() => setTab('active')} className={tabClass('active')}>
            Active Deals
            {activeData?.total != null && (
              <span className="ml-1.5 text-xs">({activeData.total})</span>
            )}
          </button>
          <button onClick={() => setTab('history')} className={tabClass('history')}>
            History
            {historyData?.total != null && (
              <span className="ml-1.5 text-xs">({historyData.total})</span>
            )}
          </button>
        </div>

        {isLoading && (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-neutral-b-100 dark:bg-neutral-b-800 rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && deals.length === 0 && (
          <p className="text-center py-12 text-neutral-b-500 dark:text-dark-text-muted text-sm">
            {tab === 'active' ? 'No active deals.' : 'No deal history yet.'}
          </p>
        )}

        {!isLoading && deals.length > 0 && (
          <div className="space-y-3">
            {deals.map((deal) => <DealRow key={deal.id} deal={deal} />)}
          </div>
        )}

        <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}

export default SellerDealsPage;
