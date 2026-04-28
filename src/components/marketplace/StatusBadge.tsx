import type { ApplicationStatus, DealStatus, SellerStatus } from '../../store/slices/marketplace/types';

type BadgeVariant = ApplicationStatus | DealStatus | SellerStatus;

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  APPROVED:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  DECLINED:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  ACTIVE:    'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  BANNED:    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  SUSPENDED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

const VARIANT_LABELS: Record<BadgeVariant, string> = {
  PENDING:   'Pending',
  APPROVED:  'Approved',
  DECLINED:  'Declined',
  ACTIVE:    'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  BANNED:    'Banned',
  SUSPENDED: 'Suspended',
};

interface StatusBadgeProps {
  status: BadgeVariant;
}

function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${VARIANT_STYLES[status]}`}
    >
      {VARIANT_LABELS[status]}
    </span>
  );
}

export default StatusBadge;
