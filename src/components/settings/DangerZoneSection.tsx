import { useState } from 'react';
import { AlertTriangle, UserX, Trash2, ShieldAlert, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logOut } from '../../store/slices/auth/auth';
import {
  useToggleUserActivityMutation,
  useDeleteUserMutation,
} from '../../store/slices/settings/settingsApi';
import ConfirmationModal from './ConfirmationModal';

// ─── Individual Action Card ────────────────────────────────────────────────

interface DangerCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  buttonId: string;
  variant: 'warning' | 'danger';
  onClick: () => void;
}

function DangerCard({
  icon,
  title,
  description,
  buttonLabel,
  buttonId,
  variant,
  onClick,
}: DangerCardProps) {
  const [hovered, setHovered] = useState(false);

  const isWarning = variant === 'warning';

  const accentColor = isWarning
    ? 'from-amber-500/10 to-orange-500/5 border-amber-500/30 dark:border-amber-700/40'
    : 'from-red-500/10 to-rose-500/5 border-red-500/30 dark:border-red-800/40';

  const iconBg = isWarning
    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';

  const btnClass = isWarning
    ? `border border-amber-500 text-amber-700 dark:text-amber-400
       hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 dark:hover:text-white`
    : `border border-red-500 text-red-700 dark:text-red-400
       hover:bg-red-600 hover:text-white dark:hover:bg-red-700 dark:hover:text-white`;

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`relative rounded-xl border bg-linear-to-r p-5 flex flex-col sm:flex-row
        sm:items-center gap-4 transition-all duration-300 overflow-hidden ${accentColor}`}
    >
      {/* Subtle animated glow on hover */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className={`absolute inset-0 pointer-events-none ${isWarning
            ? 'bg-amber-400/5 dark:bg-amber-400/5'
            : 'bg-red-400/5 dark:bg-red-400/5'
          }`}
      />

      {/* Icon */}
      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-b-800 dark:text-dark-text-primary">
          {title}
        </p>
        <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action button */}
      <motion.button
        type="button"
        id={buttonId}
        onClick={onClick}
        whileTap={{ scale: 0.97 }}
        className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
          bg-transparent transition-all duration-200 focus:outline-none
          focus-visible:ring-2 focus-visible:ring-offset-2
          focus-visible:ring-red-500 whitespace-nowrap ${btnClass}`}
      >
        {buttonLabel}
        <ChevronRight size={14} />
      </motion.button>
    </motion.div>
  );
}

// ─── Main Section ──────────────────────────────────────────────────────────

type ModalType = 'deactivate' | 'delete' | null;

function DangerZoneSection() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [confirmValue, setConfirmValue] = useState('');

  const [toggleActivity, { isLoading: isDeactivating }] = useToggleUserActivityMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const openModal = (type: ModalType) => {
    setConfirmValue('');
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setConfirmValue('');
  };

  const handleDeactivate = async () => {
    if (!currentUser?.id) return;
    try {
      await toggleActivity(currentUser.id).unwrap();
      toast.success('Account deactivated. Logging you out…');
      closeModal();
      dispatch(logOut());
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Failed to deactivate account.');
    }
  };

  const handleDelete = async () => {
    if (!currentUser?.id) return;
    try {
      await deleteUser(currentUser.id).unwrap();
      toast.success('Account permanently deleted. Logging you out…');
      closeModal();
      dispatch(logOut());
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Failed to delete account.');
    }
  };

  return (
    <>
      <section aria-labelledby="danger-zone-heading" className="relative">
        {/* Outer card */}
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 overflow-hidden shadow-sm">

          {/* Header band */}
          <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4
            bg-linear-to-r from-red-600 to-rose-600 dark:from-red-700 dark:to-rose-700">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
              <ShieldAlert size={17} className="text-white" />
            </div>
            <div>
              <h2
                id="danger-zone-heading"
                className="text-sm font-bold text-white tracking-wide uppercase"
              >
                Danger Zone
              </h2>
              <p className="text-xs text-red-100 mt-0.5">
                Actions here are permanent and cannot be reversed.
              </p>
            </div>


          </div>

          {/* Warning banner */}
          <div className="flex items-start gap-2 sm:gap-3 px-4 sm:px-6 py-3 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800/40">
            <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              Please read carefully before proceeding. These actions affect your entire account
              and all associated data including posts, messages, and marketplace listings.
            </p>
          </div>

          {/* Action cards */}
          <div className="p-3 sm:p-5 space-y-3 bg-white dark:bg-dark-bg-secondary">
            <DangerCard
              icon={<UserX size={18} />}
              title="Deactivate Account"
              description="Temporarily hide your profile and suspend account access. You can reactivate by contacting support."
              buttonLabel="Deactivate"
              buttonId="deactivate-account-btn"
              variant="warning"
              onClick={() => openModal('deactivate')}
            />

            <DangerCard
              icon={<Trash2 size={18} />}
              title="Delete Account"
              description="Permanently erase your account and all data including posts, comments, and messages. This cannot be undone."
              buttonLabel="Delete Account"
              buttonId="delete-account-btn"
              variant="danger"
              onClick={() => openModal('delete')}
            />
          </div>
        </div>
      </section>

      {/* Deactivate Modal */}
      <ConfirmationModal
        isOpen={activeModal === 'deactivate'}
        onClose={closeModal}
        title="Deactivate Your Account?"
        message="Your profile will be hidden and you will be logged out. You can reactivate anytime by contacting support."
        confirmPhrase="DEACTIVATE"
        confirmValue={confirmValue}
        onConfirmValueChange={setConfirmValue}
        confirmLabel="Yes, Deactivate"
        confirmVariant="warning"
        onConfirm={handleDeactivate}
        isLoading={isDeactivating}
      />

      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={activeModal === 'delete'}
        onClose={closeModal}
        title="Permanently Delete Account?"
        message="All your posts, messages, and account data will be erased forever. This action cannot be undone."
        confirmPhrase="DELETE MY ACCOUNT"
        confirmValue={confirmValue}
        onConfirmValueChange={setConfirmValue}
        confirmLabel="Delete Permanently"
        confirmVariant="danger"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}

export default DangerZoneSection;
