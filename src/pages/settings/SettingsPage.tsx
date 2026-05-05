import AppearanceSection from './components/AppearanceSection';
import SecuritySection from './components/SecuritySection';
import ProfilePrivacySection from './components/ProfilePrivacySection';
import DangerZoneSection from './components/DangerZoneSection';

function SettingsPage() {
  return (
    <main
      id="settings-main"
      className="min-h-screen bg-neutral-w-100 dark:bg-dark-bg-primary py-10 px-4"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-b-900 dark:text-dark-text-primary tracking-tight">
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
