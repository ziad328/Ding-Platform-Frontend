import { useState } from 'react';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetPrivacySettingsQuery,
  useUpdatePrivacySettingsMutation,
} from '../../../store/slices/settings/settingsApi';

interface ToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ id, label, description, checked, disabled, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 border-b last:border-0 border-neutral-w-300 dark:border-dark-border">
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-b-800 dark:text-dark-text-primary">{label}</p>
        <p className="text-xs text-neutral-b-400 dark:text-dark-text-muted mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2
          focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
          ${checked ? 'bg-primary-500' : 'bg-neutral-w-400'}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg
            ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-4 border-b last:border-0 border-neutral-w-300 dark:border-dark-border animate-pulse">
      <div className="space-y-1.5">
        <div className="h-3 w-32 bg-neutral-w-300 dark:bg-dark-border rounded" />
        <div className="h-2.5 w-52 bg-neutral-w-200 dark:bg-dark-bg-tertiary rounded" />
      </div>
      <div className="h-6 w-11 bg-neutral-w-300 dark:bg-dark-border rounded-full" />
    </div>
  );
}

function PrivacySection() {
  const { data, isLoading, isError } = useGetPrivacySettingsQuery();
  const [updatePrivacy, { isLoading: isUpdating }] = useUpdatePrivacySettingsMutation();

  // Optimistic local state while request is in-flight
  const [optimistic, setOptimistic] = useState<{ showEmail?: boolean; showPhone?: boolean }>({});

  const showEmail = optimistic.showEmail ?? data?.showEmail ?? false;
  const showPhone = optimistic.showPhone ?? data?.showPhone ?? false;

  const handleToggle = async (field: 'showEmail' | 'showPhone', value: boolean) => {
    setOptimistic((prev) => ({ ...prev, [field]: value }));
    try {
      await updatePrivacy({ [field]: value }).unwrap();
      setOptimistic((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    } catch (err: any) {
      // Revert
      setOptimistic((prev) => ({ ...prev, [field]: !value }));
      const msg = err?.data?.message ?? 'Failed to update privacy setting.';
      toast.error(msg);
    }
  };

  return (
    <section
      aria-labelledby="privacy-contact-heading"
      className="bg-white dark:bg-dark-bg-secondary rounded-2xl border border-neutral-w-400 dark:border-dark-border p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-1">
        <Shield size={18} className="text-primary-500" />
        <h2 id="privacy-contact-heading" className="text-lg font-semibold text-neutral-b-800 dark:text-dark-text-primary">
          Privacy — Contact Visibility
        </h2>
      </div>
      <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted mb-6">
        Control who can see your contact information. Changes save automatically.
      </p>

      {isError && (
        <p className="text-sm text-semantic-r-900 dark:text-red-400 mb-4">
          Could not load privacy settings. Please refresh.
        </p>
      )}

      <div>
        {isLoading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : (
          <>
            <ToggleRow
              id="toggle-show-email"
              label="Show Email Address"
              description="Allow others to see your email on your profile"
              checked={showEmail}
              disabled={isUpdating}
              onChange={(v) => handleToggle('showEmail', v)}
            />
            <ToggleRow
              id="toggle-show-phone"
              label="Show Phone Number"
              description="Allow others to see your phone number on your profile"
              checked={showPhone}
              disabled={isUpdating}
              onChange={(v) => handleToggle('showPhone', v)}
            />
          </>
        )}
      </div>
    </section>
  );
}

export default PrivacySection;
