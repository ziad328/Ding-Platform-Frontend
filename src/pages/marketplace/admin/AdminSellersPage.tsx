import { useState } from 'react';
import { toast } from 'sonner';
import {
  useGetSellersQuery,
  useGetSellerDetailQuery,
  useBanSellerMutation,
  useUnbanSellerMutation,
  useSuspendSellerMutation,
  useUnsuspendSellerMutation,
} from '../../../store/slices/marketplace/marketplaceApi';
import type { SellerProfile } from '../../../store/slices/marketplace/types';
import StatusBadge from '../../../components/marketplace/StatusBadge';
import PaginationControls from '../../../components/marketplace/PaginationControls';
import AdminMarketplaceNav from '../../../components/marketplace/AdminMarketplaceNav';

// ─── Action Modal ───────────────────────────────────────────────────────────

type SellerAction = 'ban' | 'suspend';

interface ActionModalProps {
  seller: SellerProfile;
  action: SellerAction;
  onClose: () => void;
}

function SellerActionModal({ seller, action, onClose }: ActionModalProps) {
  const [cause, setCause] = useState('');
  const [banSeller, { isLoading: isBanning }] = useBanSellerMutation();
  const [suspendSeller, { isLoading: isSuspending }] = useSuspendSellerMutation();

  const isLoading = isBanning || isSuspending;
  const verb = action === 'ban' ? 'Ban' : 'Suspend';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cause.trim()) { toast.error('Please provide a reason.'); return; }
    try {
      if (action === 'ban') {
        await banSeller({ sellerUserId: seller.userId, cause: cause.trim() }).unwrap();
      } else {
        await suspendSeller({ sellerUserId: seller.userId, cause: cause.trim() }).unwrap();
      }
      toast.success(`Seller ${action === 'ban' ? 'banned' : 'suspended'} successfully.`);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Action failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white dark:bg-neutral-b-800 rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-neutral-b-900 dark:text-dark-text-primary mb-4">
          {verb} Seller — {seller.businessName}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={cause}
            onChange={(e) => setCause(e.target.value)}
            rows={3}
            placeholder={`Reason for ${verb.toLowerCase()}…`}
            className="w-full px-3 py-2 rounded-xl text-sm resize-none
              bg-white dark:bg-neutral-b-700
              border border-neutral-b-200 dark:border-neutral-b-600
              text-neutral-b-900 dark:text-dark-text-primary
              focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-neutral-b-200 dark:border-neutral-b-600 text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary hover:bg-neutral-b-50 dark:hover:bg-neutral-b-700 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors">
              {isLoading ? `${verb}ning…` : `${verb} Seller`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Seller Detail Drawer ───────────────────────────────────────────────────

interface SellerDrawerProps {
  sellerUserId: string;
  onClose: () => void;
}

function SellerDetailDrawer({ sellerUserId, onClose }: SellerDrawerProps) {
  const { data, isLoading } = useGetSellerDetailQuery(sellerUserId);
  const [unbanSeller, { isLoading: isUnbanning }] = useUnbanSellerMutation();
  const [unsuspendSeller, { isLoading: isUnsuspending }] = useUnsuspendSellerMutation();
  const [actionModal, setActionModal] = useState<SellerAction | null>(null);

  const seller = data?.data;

  const handleUnban = async () => {
    try {
      await unbanSeller(sellerUserId).unwrap();
      toast.success('Seller unbanned.');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Unban failed.');
    }
  };

  const handleUnsuspend = async () => {
    try {
      await unsuspendSeller(sellerUserId).unwrap();
      toast.success('Seller unsuspended.');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Unsuspend failed.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div
          className="w-full max-w-sm h-full bg-white dark:bg-neutral-b-800 shadow-2xl overflow-y-auto p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-neutral-b-900 dark:text-dark-text-primary">Seller Detail</h3>
            <button onClick={onClose} className="text-neutral-b-400 hover:text-neutral-b-700 dark:hover:text-dark-text-secondary">✕</button>
          </div>

          {isLoading && <div className="animate-pulse space-y-3"><div className="h-6 bg-neutral-b-100 dark:bg-neutral-b-700 rounded" /><div className="h-40 bg-neutral-b-100 dark:bg-neutral-b-700 rounded" /></div>}

          {seller && (
            <div className="space-y-4">
              <div><p className="text-xs uppercase font-medium text-neutral-b-400 mb-0.5">Status</p><StatusBadge status={seller.status} /></div>
              <div><p className="text-xs uppercase font-medium text-neutral-b-400 mb-0.5">Business</p><p className="text-sm text-neutral-b-900 dark:text-dark-text-primary">{seller.businessName}</p></div>
              <div><p className="text-xs uppercase font-medium text-neutral-b-400 mb-0.5">Phone</p><p className="text-sm text-neutral-b-900 dark:text-dark-text-primary">{seller.phoneNumber}</p></div>
              <div><p className="text-xs uppercase font-medium text-neutral-b-400 mb-0.5">City</p><p className="text-sm text-neutral-b-900 dark:text-dark-text-primary">{seller.city}</p></div>
              <div><p className="text-xs uppercase font-medium text-neutral-b-400 mb-0.5">Member Since</p><p className="text-sm text-neutral-b-900 dark:text-dark-text-primary">{new Date(seller.createdAt).toLocaleDateString()}</p></div>

              <div className="pt-4 space-y-2">
                {seller.status === 'ACTIVE' && (
                  <>
                    <button onClick={() => setActionModal('suspend')} className="w-full py-2.5 rounded-xl text-sm font-semibold text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900 hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors">Suspend</button>
                    <button onClick={() => setActionModal('ban')} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors">Ban</button>
                  </>
                )}
                {seller.status === 'SUSPENDED' && (
                  <button onClick={handleUnsuspend} disabled={isUnsuspending} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {isUnsuspending ? 'Unsuspending…' : 'Unsuspend'}
                  </button>
                )}
                {seller.status === 'BANNED' && (
                  <button onClick={handleUnban} disabled={isUnbanning} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors">
                    {isUnbanning ? 'Unbanning…' : 'Unban'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {actionModal && seller && (
        <SellerActionModal
          seller={seller}
          action={actionModal}
          onClose={() => setActionModal(null)}
        />
      )}
    </>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

function AdminSellersPage() {
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data, isLoading } = useGetSellersQuery({ page, limit: 20 });

  const sellers: SellerProfile[] = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-neutral-b-900 dark:text-dark-text-primary">
            Admin — Marketplace
          </h1>
        </div>

        <AdminMarketplaceNav />

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-neutral-b-900 dark:text-dark-text-primary">
            Sellers Management
          </h2>
          <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted mt-0.5">
            View and manage all approved sellers.
          </p>
        </div>

        {isLoading && (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-neutral-b-100 dark:bg-neutral-b-800 rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && sellers.length === 0 && (
          <p className="text-center py-12 text-neutral-b-500 dark:text-dark-text-muted text-sm">No sellers found.</p>
        )}

        {!isLoading && sellers.length > 0 && (
          <div className="space-y-3">
            {sellers.map((seller) => (
              <button
                key={seller.id}
                onClick={() => setSelectedUserId(seller.userId)}
                className="w-full text-left flex items-center gap-4
                  bg-white dark:bg-neutral-b-800
                  border border-neutral-b-200 dark:border-neutral-b-700
                  rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-b-900 dark:text-dark-text-primary text-sm">
                    {seller.businessName}
                  </p>
                  <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted">
                    {seller.city} · {seller.phoneNumber}
                  </p>
                </div>
                <StatusBadge status={seller.status} />
              </button>
            ))}
          </div>
        )}

        <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {selectedUserId && (
        <SellerDetailDrawer sellerUserId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}

export default AdminSellersPage;
