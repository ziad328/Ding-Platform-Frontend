import { useState } from 'react';
import { toast } from 'sonner';
import {
  useGetPendingApplicationsQuery,
  useGetApplicationDetailQuery,
  useApproveApplicationMutation,
  useDeclineApplicationMutation,
} from '../../../store/slices/marketplace/marketplaceApi';
import type { SellerApplication } from '../../../store/slices/marketplace/types';
import StatusBadge from '../../../components/marketplace/StatusBadge';
import PaginationControls from '../../../components/marketplace/PaginationControls';
import AdminMarketplaceNav from '../../../components/marketplace/AdminMarketplaceNav';

// ─── Detail drawer ──────────────────────────────────────────────────────────

interface DetailDrawerProps {
  applicationId: string;
  onClose: () => void;
}

function ApplicationDetailDrawer({ applicationId, onClose }: DetailDrawerProps) {
  const { data, isLoading } = useGetApplicationDetailQuery(applicationId);
  const [approveApp, { isLoading: isApproving }] = useApproveApplicationMutation();
  const [declineApp, { isLoading: isDeclining }] = useDeclineApplicationMutation();
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineInput, setShowDeclineInput] = useState(false);

  const application = data?.data;

  const handleApprove = async () => {
    try {
      await approveApp(applicationId).unwrap();
      toast.success('Application approved!');
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Approval failed.');
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      toast.error('Please provide a reason.');
      return;
    }
    try {
      await declineApp({ applicationId, reason: declineReason.trim() }).unwrap();
      toast.success('Application declined.');
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Decline failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm h-full bg-white dark:bg-neutral-b-800 shadow-2xl overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-neutral-b-900 dark:text-dark-text-primary">Application Detail</h3>
          <button onClick={onClose} className="text-neutral-b-400 hover:text-neutral-b-700 dark:hover:text-dark-text-secondary transition-colors">Close</button>
        </div>

        {isLoading && <div className="animate-pulse space-y-3"><div className="h-6 bg-neutral-b-100 dark:bg-neutral-b-700 rounded" /><div className="h-24 bg-neutral-b-100 dark:bg-neutral-b-700 rounded" /></div>}

        {application && (
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase font-medium text-neutral-b-400 dark:text-dark-text-muted mb-1">Status</p>
              <StatusBadge status={application.status} />
            </div>
            <Field label="Applicant" value={application.fullName ?? application.userName ?? application.userId} />
            <Field label="Email" value={application.email ?? application.userEmail ?? '—'} />
            <Field label="Business Name" value={application.businessName ?? '—'} />
            <Field label="Phone" value={application.phoneNumber ?? '—'} />
            <Field label="City" value={application.city ?? '—'} />
            <Field label="Applied" value={new Date(application.submittedAt ?? application.createdAt ?? Date.now()).toLocaleDateString()} />

            {(application.status === 'PENDING' || application.status === 'pending') && (
              <div className="pt-4 space-y-3">
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isApproving ? 'Approving...' : 'Approve'}
                </button>

                {!showDeclineInput ? (
                  <button
                    onClick={() => setShowDeclineInput(true)}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                  >
                    Decline
                  </button>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      rows={3}
                      placeholder="Reason for declining…"
                      className="w-full px-3 py-2 rounded-xl text-sm resize-none
                        bg-white dark:bg-neutral-b-700
                        border border-neutral-b-200 dark:border-neutral-b-600
                        text-neutral-b-900 dark:text-dark-text-primary
                        focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <button
                      onClick={handleDecline}
                      disabled={isDeclining}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {isDeclining ? 'Declining...' : 'Confirm Decline'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase font-medium text-neutral-b-400 dark:text-dark-text-muted mb-0.5">{label}</p>
      <p className="text-sm text-neutral-b-900 dark:text-dark-text-primary">{value}</p>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

function AdminApplicationsPage() {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useGetPendingApplicationsQuery({ page, limit: 20 });

  const applications: SellerApplication[] = data?.data ?? [];
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
            Seller Applications
          </h2>
          <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted mt-0.5">
            Review and manage pending seller applications.
          </p>
        </div>

        {isLoading && (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-neutral-b-100 dark:bg-neutral-b-800 rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && applications.length === 0 && (
          <p className="text-center py-12 text-neutral-b-500 dark:text-dark-text-muted text-sm">
            No pending applications.
          </p>
        )}

        {!isLoading && applications.length > 0 && (
          <div className="space-y-3">
            {applications.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelectedId(app.id)}
                className="w-full text-left flex items-center gap-4
                  bg-white dark:bg-neutral-b-800
                  border border-neutral-b-200 dark:border-neutral-b-700
                  rounded-2xl p-4 shadow-sm
                  hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-b-900 dark:text-dark-text-primary text-sm">
                    {app.businessName}
                  </p>
                  <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted">
                  {app.fullName ?? app.userName ?? app.userId} · {app.city}
                  </p>
                  <p className="text-xs text-neutral-b-400 dark:text-dark-text-muted">
                  {new Date(app.submittedAt ?? app.createdAt ?? Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </button>
            ))}
          </div>
        )}

        <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {selectedId && (
        <ApplicationDetailDrawer
          applicationId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

export default AdminApplicationsPage;
