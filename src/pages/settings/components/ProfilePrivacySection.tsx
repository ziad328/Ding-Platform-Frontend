import { useState, useEffect } from 'react';
import { UserCog, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetMyProfileQuery,
  useUpdateProfilePrivacyMutation,
  type VisibilityLevel,
  type ProfilePrivacyData,
} from '../../../store/slices/settings/settingsApi';

type VisibilityOption = { value: VisibilityLevel; label: string; description: string };

const VISIBILITY_OPTIONS: VisibilityOption[] = [
  { value: 'PUBLIC', label: 'Public', description: 'Visible to everyone' },
  { value: 'FRIENDS', label: 'Friends', description: 'Only visible to friends' },
  { value: 'PRIVATE', label: 'Private', description: 'Only visible to you' },
];

interface SelectFieldProps {
  id: string;
  label: string;
  value: VisibilityLevel;
  onChange: (v: VisibilityLevel) => void;
}

function SelectField({ id, label, value, onChange }: SelectFieldProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b last:border-0 border-neutral-w-300 dark:border-dark-border">
      <label htmlFor={id} className="text-sm font-medium text-neutral-b-800 dark:text-dark-text-primary shrink-0">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as VisibilityLevel)}
        className="px-3 py-2 text-sm rounded-xl border border-neutral-w-400 dark:border-dark-border
          bg-white dark:bg-dark-bg-primary text-neutral-b-900 dark:text-dark-text-primary
          focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-150 min-w-[140px]"
      >
        {VISIBILITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label} — {opt.description}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ToggleRowProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ id, label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b last:border-0 border-neutral-w-300 dark:border-dark-border">
      <label htmlFor={id} className="text-sm font-medium text-neutral-b-800 dark:text-dark-text-primary">
        {label}
      </label>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2
          focus-visible:ring-primary-500 focus-visible:ring-offset-2
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
      <div className="h-3 w-36 bg-neutral-w-300 dark:bg-dark-border rounded" />
      <div className="h-9 w-44 bg-neutral-w-200 dark:bg-dark-bg-tertiary rounded-xl" />
    </div>
  );
}

const EMPTY: ProfilePrivacyData = {
  profileVisibility: 'PUBLIC',
  postsVisibility: 'PUBLIC',
  emailVisibility: 'PRIVATE',
  allowCameraAccess: false,
};

function ProfilePrivacySection() {
  const { data: profile, isLoading, isError } = useGetMyProfileQuery();
  const [updateProfilePrivacy, { isLoading: isSaving }] = useUpdateProfilePrivacyMutation();

  const [localSettings, setLocalSettings] = useState<ProfilePrivacyData>(EMPTY);
  const [isDirty, setIsDirty] = useState(false);

  // Populate form when profile data arrives
  useEffect(() => {
    const p = profile?.privacy ?? profile?.privacySettings;
    if (p) {
      setLocalSettings({
        profileVisibility: p.profileVisibility ?? 'PUBLIC',
        postsVisibility: p.postsVisibility ?? 'PUBLIC',
        emailVisibility: p.emailVisibility ?? 'PRIVATE',
        allowCameraAccess: p.allowCameraAccess ?? false,
      });
    }
  }, [profile]);

  const updateField = <K extends keyof ProfilePrivacyData>(key: K, value: ProfilePrivacyData[K]) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await updateProfilePrivacy(localSettings).unwrap();
      setIsDirty(false);
      toast.success('Profile privacy settings saved');
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Failed to save settings. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <section
      aria-labelledby="profile-privacy-heading"
      className="bg-white dark:bg-dark-bg-secondary rounded-2xl border border-neutral-w-400 dark:border-dark-border p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-1">
        <UserCog size={18} className="text-primary-500" />
        <h2 id="profile-privacy-heading" className="text-lg font-semibold text-neutral-b-800 dark:text-dark-text-primary">
          Privacy — Profile Visibility
        </h2>
      </div>
      <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted mb-6">
        Control who can see your profile and activity. Save changes when done.
      </p>

      {isError && (
        <p className="text-sm text-semantic-r-900 dark:text-red-400 mb-4">
          Could not load profile settings. Please refresh.
        </p>
      )}

      <div>
        {isLoading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : (
          <>
            <SelectField
              id="profile-visibility"
              label="Profile Visibility"
              value={localSettings.profileVisibility}
              onChange={(v) => updateField('profileVisibility', v)}
            />
            <SelectField
              id="posts-visibility"
              label="Posts Visibility"
              value={localSettings.postsVisibility}
              onChange={(v) => updateField('postsVisibility', v)}
            />
            <SelectField
              id="email-visibility"
              label="Email Visibility"
              value={localSettings.emailVisibility}
              onChange={(v) => updateField('emailVisibility', v)}
            />
            <ToggleRow
              id="allow-camera-access"
              label="Allow Camera Access"
              checked={localSettings.allowCameraAccess}
              onChange={(v) => updateField('allowCameraAccess', v)}
            />
          </>
        )}
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          id="save-profile-privacy"
          onClick={handleSave}
          disabled={isSaving || isLoading || !isDirty}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-xl text-white
            bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          {isSaving ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save size={15} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </section>
  );
}

export default ProfilePrivacySection;
