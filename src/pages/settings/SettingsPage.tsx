import AppearanceSection from '../../components/settings/AppearanceSection';
import SecuritySection from '../../components/settings/SecuritySection';
import ProfilePrivacySection from '../../components/settings/ProfilePrivacySection';
import DangerZoneSection from '../../components/settings/DangerZoneSection';

function SettingsPage() {
  return (
    <main
      id="settings-main"
      className="min-h-screen dark:bg-dark-bg-primary py-6 px-3 sm:py-8 sm:px-4 md:py-10"
    >
      <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6">
        {/* Page header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-b-900 dark:text-dark-text-primary tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted mt-1">
            Manage your account preferences, security, and privacy.
          </p>
        </div>

        {/* 1 — Appearance */}
        <AppearanceSection />

        {/* 2 — Security (Change Password) */}
        <SecuritySection />

        {/* 3 — Privacy: Profile Visibility */}
        <ProfilePrivacySection />

        {/* 5 — Danger Zone */}
        <DangerZoneSection />
      </div>
    </main>
  );
}

export default SettingsPage;
