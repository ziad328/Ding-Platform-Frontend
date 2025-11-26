import { Globe, MapPin, Phone, Shield, CalendarDays } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ProfileData } from '../../store/slices/profile/profile';

interface ProfileAboutCardProps {
  profile: ProfileData | null;
  isLoading: boolean;
}

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
}) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-b-600 dark:text-dark-text-secondary">
      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-b-500 dark:text-dark-text-muted" />
      <span className="font-medium text-neutral-b-800 dark:text-dark-text-primary">{label}:</span>
      <span className="truncate">{value}</span>
    </div>
  );
};

const PrivacyRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-xs text-neutral-b-500 dark:text-dark-text-muted">
    <span>{label}</span>
    <span className="font-semibold text-neutral-b-800 dark:text-dark-text-primary">{value}</span>
  </div>
);

const ProfileAboutCard = ({ profile, isLoading }: ProfileAboutCardProps) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 animate-pulse">
        <div className="h-4 w-24 bg-neutral-w-400 dark:bg-dark-bg-tertiary rounded mb-4" />
        <div className="space-y-2">
          {[...Array(3)].map((_, idx) => (
            <div key={`about-skeleton-${idx}`} className="h-3 bg-neutral-w-400 dark:bg-dark-bg-tertiary rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const { privacySettings } = profile;

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-b-900 dark:text-dark-text-primary mb-3">
          About
        </h2>
        {profile.bio && (
          <p className="text-sm text-neutral-b-600 dark:text-dark-text-secondary mb-4 leading-relaxed">{profile.bio}</p>
        )}
        <div className="space-y-2">
          <InfoRow icon={MapPin} label="Location" value={profile.location} />
          <InfoRow icon={Globe} label="Website" value={profile.website} />
          <InfoRow icon={Phone} label="Phone" value={profile.phoneNumber} />
          <InfoRow icon={CalendarDays} label="Birthday" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : null} />
        </div>
      </div>
      {privacySettings && (
        <div className="border-t border-neutral-w-400 dark:border-dark-border p-4 sm:p-5 bg-neutral-w-100/60 dark:bg-dark-bg-tertiary/30">
          <div className="flex items-center gap-2 mb-3 text-neutral-b-800 dark:text-dark-text-primary">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-semibold">Privacy controls</span>
          </div>
          <div className="space-y-1.5">
            <PrivacyRow label="Profile visibility" value={privacySettings.profileVisibility} />
            <PrivacyRow label="Posts visibility" value={privacySettings.postsVisibility} />
            <PrivacyRow label="Friends visibility" value={privacySettings.friendsVisibility} />
            <PrivacyRow label="Who can message" value={privacySettings.whoCanMessageMe} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAboutCard;

