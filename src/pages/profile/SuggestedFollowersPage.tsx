import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SuggestedFollowersSkeleton } from '../../components/profile/ProfileSkeletons';
import ProfileHoverPreview from '../../components/profile/ProfileHoverPreview';
import type { ProfilePreviewFriend } from '../../components/profile/ProfileHoverPreview';

const creatorNames = ['Harper', 'Kai', 'Zara', 'Mateo', 'Evelyn', 'Omar', 'Sofia', 'Leo', 'Amelia', 'Jonas', 'Layla', 'Aarav'];
const creatorLastNames = ['Nguyen', 'Silva', 'Bennett', 'Okafor', 'Kim', 'Santos', 'Mehta', 'Hassan', 'Olsen', 'Rivera', 'Ali', 'Hughes'];
const niches = ['Product Strategy', 'AI Ops', 'Climate Tech', 'Fintech', 'Design Leadership', 'Data Governance', 'Web3', 'People Ops'];
const regions = ['Tokyo, Japan', 'San Francisco, USA', 'Lisbon, Portugal', 'Nairobi, Kenya', 'Seoul, South Korea', 'Austin, USA', 'Barcelona, Spain', 'Stockholm, Sweden'];
const organizations = ['Atlas Labs', 'Fjord Ventures', 'Helix Health', 'TerraGrid', 'Aurora Finance', 'Beacon Studio', 'North Star AI', 'Civicly'];
const taglines = [
  'Sharing frameworks for building purpose-driven teams.',
  'Documenting the journey of scaling AI responsibly.',
  'Breaking down complex fintech ideas into action plans.',
  'Designing products that make sustainability actionable.',
];
const focusDescriptors = [
  'Leadership · Growth · Community',
  'AI Safety · Ops · Tooling',
  'Founders · Storytelling · No-Code',
  'Culture · Hiring · Enablement',
];

type SuggestedFollower = Omit<ProfilePreviewFriend, 'id'> & {
  id: number;
  followers: number;
  sharedTopics: string;
  cadence: string;
};

const SuggestedFollowersPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [previewTarget, setPreviewTarget] = useState<{ follower: SuggestedFollower; rect: DOMRect } | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const previewTimeoutRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const suggestedFollowers: SuggestedFollower[] = useMemo(
    () =>
      Array.from({ length: 80 }, (_, index) => ({
        id: index + 1,
        name: `${creatorNames[index % creatorNames.length]} ${creatorLastNames[(index * 5) % creatorLastNames.length]}`,
        role: niches[index % niches.length],
        company: organizations[index % organizations.length],
        location: regions[index % regions.length],
        bio: taglines[index % taglines.length],
        focus: focusDescriptors[index % focusDescriptors.length],
        avatar: `https://i.pravatar.cc/150?img=${(index % 70) + 1}`,
        followers: 1200 + index * 23,
        sharedTopics: focusDescriptors[index % focusDescriptors.length],
        cadence: index % 2 === 0 ? 'Posts weekly' : 'Daily short takes',
      })) as SuggestedFollower[],
    []
  );

  const handleNavigateToProfile = (followerId: number) => {
    navigate(`/profile?user=${followerId}`);
  };

  const clearPreviewTimeout = () => {
    if (previewTimeoutRef.current) {
      window.clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }
  };

  const schedulePreviewClose = () => {
    clearPreviewTimeout();
    previewTimeoutRef.current = window.setTimeout(() => {
      setIsPreviewVisible(false);
      setPreviewTarget(null);
    }, 120);
  };

  const handlePreviewEnter = (follower: SuggestedFollower, target: HTMLDivElement) => {
    if (window.innerWidth < 768) return;
    clearPreviewTimeout();
    const rect = target.getBoundingClientRect();
    setPreviewTarget({ follower, rect });
    setIsPreviewVisible(true);
  };

  const handlePreviewLeave = () => {
    schedulePreviewClose();
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      clearPreviewTimeout();
      setPreviewTarget(null);
      setIsPreviewVisible(false);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-5 w-40 rounded bg-neutral-w-300 animate-pulse" />
            <div className="h-5 w-40 rounded bg-neutral-w-300 animate-pulse" />
            <div className="space-y-2 animate-pulse pt-2">
              <div className="h-3 w-32 rounded bg-neutral-w-300" />
              <div className="h-7 w-48 rounded bg-neutral-w-300" />
              <div className="h-4 w-64 rounded bg-neutral-w-300" />
            </div>
            <SuggestedFollowersSkeleton />
          </div>
        ) : (
          <>
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <button
                onClick={() => navigate('/profile')}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to profile
              </button>
              <h1 className="text-xl sm:text-2xl font-semibold text-neutral-b-900">
                Suggested Followers
              </h1>
              <p className="text-sm sm:text-base text-neutral-b-600">
                Stay close to leaders and creators sharing insights you care about. Discover new voices and follow their updates.
              </p>
            </div>
            <div className="max-h-[65vh] overflow-y-auto hide-scrollbar pr-1 sm:pr-2 space-y-3 sm:space-y-4 divide-y divide-neutral-w-200">
              {suggestedFollowers.map((follower) => (
                <div key={follower.id} className="pt-3 first:pt-0">
                  <div
                    className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between group"
                    onMouseEnter={(event) => handlePreviewEnter(follower, event.currentTarget)}
                    onMouseLeave={handlePreviewLeave}
                  >
                    <button
                      type="button"
                      onClick={() => handleNavigateToProfile(follower.id)}
                      className="flex items-start gap-3 sm:gap-4 text-left w-full sm:w-auto focus:outline-none"
                      aria-label={`Open ${follower.name}'s profile`}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center shrink-0 sm:w-14 sm:h-14 overflow-hidden">
                        <img
                          src={follower.avatar}
                          alt={follower.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-neutral-b-900 hover:text-primary-600 transition-colors">
                          {follower.name}
                        </p>
                        <p className="text-xs sm:text-sm text-neutral-b-500">{follower.role}</p>
                        <p className="text-xs text-neutral-b-400 mt-1">
                          {follower.location} · {follower.followers.toLocaleString()} followers
                        </p>
                        <p className="text-xs text-primary-600 mt-1">{follower.cadence}</p>
                      </div>
                    </button>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-xs text-neutral-b-500 hidden sm:block">
                        {follower.sharedTopics}
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <UserCheck className="w-4 h-4" />
                        Follow
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <ProfileHoverPreview
        friend={previewTarget?.follower ?? null}
        anchorRect={previewTarget?.rect ?? null}
        visible={isPreviewVisible && !!previewTarget}
        onMouseEnter={clearPreviewTimeout}
        onMouseLeave={handlePreviewLeave}
        primaryActionLabel="Follow"
        secondaryActionLabel="Message"
      />
    </div>
  );
};

export default SuggestedFollowersPage;


