import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmPhrase: string;
  confirmValue: string;
  onConfirmValueChange: (v: string) => void;
  confirmLabel: string;
  confirmVariant?: 'danger' | 'warning';
  onConfirm: () => void;
  isLoading?: boolean;
}

function ConfirmationModal({
  isOpen,
  onClose,
  title,
  message,
  confirmPhrase,
  confirmValue,
  onConfirmValueChange,
  confirmLabel,
  confirmVariant = 'danger',
  onConfirm,
  isLoading = false,
}: ConfirmationModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const isMatch = confirmValue === confirmPhrase;

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Focus trap — focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const btnColor =
    confirmVariant === 'danger'
      ? 'bg-semantic-r-900 hover:bg-semantic-r-800 focus-visible:ring-semantic-r-900'
      : 'bg-semantic-y-900 hover:bg-semantic-y-800 focus-visible:ring-semantic-y-900';

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-md bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl border border-neutral-w-400 dark:border-dark-border p-4 sm:p-6"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 text-neutral-b-400 dark:text-dark-text-muted hover:text-neutral-b-800 dark:hover:text-dark-text-primary transition-colors"
            >
              <X size={18} />
            </button>

            {/* Title */}
            <h2
              id="modal-title"
              className="text-base font-semibold text-neutral-b-800 dark:text-dark-text-primary mb-2 pr-6"
            >
              {title}
            </h2>

            {/* Message */}
            <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted mb-5">
              {message}
            </p>

            {/* Confirmation input */}
            <div className="mb-5">
              <label
                htmlFor="confirm-phrase-input"
                className="block text-xs font-medium text-neutral-b-600 dark:text-dark-text-secondary mb-1.5"
              >
                Type{' '}
                <span className="font-mono font-bold text-neutral-b-800 dark:text-dark-text-primary">
                  {confirmPhrase}
                </span>{' '}
                to confirm
              </label>
              <input
                id="confirm-phrase-input"
                ref={inputRef}
                type="text"
                value={confirmValue}
                onChange={(e) => onConfirmValueChange(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder={confirmPhrase}
                className="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2
                  bg-white dark:bg-dark-bg-primary text-neutral-b-900 dark:text-dark-text-primary
                  placeholder:text-neutral-b-300 dark:placeholder:text-dark-text-muted
                  border-neutral-w-400 dark:border-dark-border focus:ring-primary-500 dark:focus:ring-primary-400"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl
                  bg-neutral-w-200 dark:bg-dark-bg-tertiary text-neutral-b-700 dark:text-dark-text-secondary
                  hover:bg-neutral-w-300 dark:hover:bg-dark-border transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={!isMatch || isLoading}
                aria-disabled={!isMatch || isLoading}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl text-white transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed ${btnColor}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing…
                  </span>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmationModal;
