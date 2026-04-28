import { useState } from 'react';
import { useGetAdminLogsQuery } from '../../../store/slices/marketplace/marketplaceApi';
import type { AdminLog } from '../../../store/slices/marketplace/types';
import PaginationControls from '../../../components/marketplace/PaginationControls';
import AdminMarketplaceNav from '../../../components/marketplace/AdminMarketplaceNav';

function LogRow({ log }: { log: AdminLog }) {
  return (
    <div className="flex items-start gap-3 bg-white dark:bg-neutral-b-800 border border-neutral-b-200 dark:border-neutral-b-700 rounded-2xl p-4 shadow-sm">
      <div className="shrink-0 mt-0.5">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm">
          📋
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-b-900 dark:text-dark-text-primary">
          {log.action}
        </p>
        <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted">
          Target: {log.targetType} · {log.targetId}
        </p>
        {log.details && (
          <p className="text-xs text-neutral-b-400 dark:text-dark-text-muted mt-1 truncate">
            {log.details}
          </p>
        )}
      </div>
      <p className="text-xs text-neutral-b-400 dark:text-dark-text-muted shrink-0">
        {new Date(log.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetAdminLogsQuery({ page, limit: 50 });

  const logs: AdminLog[] = data?.data ?? [];
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
            Audit Logs
          </h2>
          <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted mt-0.5">
            All marketplace administrative actions.
          </p>
        </div>

        {isLoading && (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 bg-neutral-b-100 dark:bg-neutral-b-800 rounded-2xl" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-center py-12 text-neutral-b-500 dark:text-dark-text-muted text-sm">
            Failed to load audit logs.
          </p>
        )}

        {!isLoading && !isError && logs.length === 0 && (
          <p className="text-center py-12 text-neutral-b-500 dark:text-dark-text-muted text-sm">
            No audit logs found.
          </p>
        )}

        {!isLoading && logs.length > 0 && (
          <div className="space-y-3">
            {logs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
          </div>
        )}

        <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}

export default AdminAuditLogsPage;
