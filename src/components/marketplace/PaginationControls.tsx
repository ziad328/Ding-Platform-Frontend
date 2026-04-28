interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-4 py-2 text-sm font-medium rounded-lg
          bg-white dark:bg-neutral-b-800
          border border-neutral-b-200 dark:border-neutral-b-700
          text-neutral-b-700 dark:text-dark-text-secondary
          hover:bg-neutral-b-50 dark:hover:bg-neutral-b-700
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors"
      >
        ← Prev
      </button>

      <span className="px-3 py-2 text-sm text-neutral-b-500 dark:text-dark-text-muted">
        {page} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-2 text-sm font-medium rounded-lg
          bg-white dark:bg-neutral-b-800
          border border-neutral-b-200 dark:border-neutral-b-700
          text-neutral-b-700 dark:text-dark-text-secondary
          hover:bg-neutral-b-50 dark:hover:bg-neutral-b-700
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors"
      >
        Next →
      </button>
    </div>
  );
}

export default PaginationControls;
