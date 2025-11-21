import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, UserMinus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileHoverPreview from '../../components/profile/ProfileHoverPreview';
import type { ProfilePreviewFriend } from '../../components/profile/ProfileHoverPreview';
import {
  selectFollowing,
  selectFollowingCount,
  selectFollowingError,
  selectFollowingStatus,
} from '../../store/slices/follow/following/following';
import { useDeleteFollowingMutation, useGetFollowingQuery } from '../../store/slices/follow/following/followingApi';
const followingRoles = ['Head of Product', 'Design Lead', 'ML Engineer', 'Revenue Ops', 'Principal PM', 'Data Architect'];
const followingCompanies = ['Axiom Labs', 'Vertex Studio', 'SignalPulse', 'Moonshot Robotics', 'Tidal Ventures', 'Clearline'];
const followingLocations = ['Seattle, USA', 'Paris, France', 'Cairo, Egypt', 'São Paulo, Brazil', 'Melbourne, Australia', 'Warsaw, Poland'];
const followingFocus = [
  'Product Strategy · Systems Thinking',
  'AI/ML · Responsible Innovation',
  'RevOps · GTM · Community',
  'Design Leadership · Ops',
];

type FollowingProfile = ProfilePreviewFriend & {
  id: string;
  username: string;
  since: string;
  cadence: string;
  focus: string;
};

const FollowingPage = () => {
  const [previewTarget, setPreviewTarget] = useState<{ following: FollowingProfile; rect: DOMRect } | null>(null);
  const [pendingUnfollowId, setPendingUnfollowId] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const previewTimeoutRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const following = useSelector(selectFollowing);
  const followingStatus = useSelector(selectFollowingStatus);
  const followingError = useSelector(selectFollowingError);
  const followingCount = useSelector(selectFollowingCount);
  const {
    isLoading: isQueryLoading,
    isError: isQueryError,
    error: queryError,
    refetch,
  } = useGetFollowingQuery();
  const [deleteFollowing] = useDeleteFollowingMutation();

  const isLoading = isQueryLoading || followingStatus === 'loading' || followingStatus === 'idle';
  const isFailed = isQueryError || followingStatus === 'failed';

  const enrichedFollowing: FollowingProfile[] = useMemo(
    () =>
      following.map((profile, index) => ({
        id: profile.userId,
        username: profile.username,
        name: profile.name,
        role: followingRoles[index % followingRoles.length],
        company: followingCompanies[index % followingCompanies.length],
        location: followingLocations[index % followingLocations.length],
        avatar: `https://i.pravatar.cc/150?img=${((index + 13) % 70) + 1}`,
        since: `${(index % 9) + 1} yrs`,
        cadence: index % 2 === 0 ? 'Publishes twice a week' : 'Weekly long-form posts',
        focus: followingFocus[index % followingFocus.length],
        bio: 'Exploring new ways to build resilient teams and products.',
      })),
    [following]
  );
  const followingCountLabel = followingCount ?? enrichedFollowing.length ?? 0;

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

  const handlePreviewEnter = (profile: FollowingProfile, target: HTMLDivElement) => {
    if (window.innerWidth < 768) return;
    clearPreviewTimeout();
    const rect = target.getBoundingClientRect();
    setPreviewTarget({ following: profile, rect });
    setIsPreviewVisible(true);
  };

  const handlePreviewLeave = () => {
    schedulePreviewClose();
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    return () => {
      clearPreviewTimeout();
      setPreviewTarget(null);
      setIsPreviewVisible(false);
      setPendingUnfollowId(null);
    };
  }, []);

  const handleUnfollow = async (userId: string) => {
    if (pendingUnfollowId) return;
    setPendingUnfollowId(userId);
    try {
      await deleteFollowing(userId).unwrap();
    } catch (error) {
      console.error('Failed to unfollow user', error);
    } finally {
      setPendingUnfollowId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-5 w-44 rounded bg-neutral-w-300" />
            <div className="h-5 w-36 rounded bg-neutral-w-300" />
            <div className="h-32 rounded-lg bg-neutral-w-300" />
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
                Following{followingCountLabel !== undefined ? ` (${followingCountLabel})` : ''}
              </h1>
              <p className="text-sm sm:text-base text-neutral-b-600">
                You follow these voices. Stay in touch or manage who you want to keep up with.
              </p>
            </div>
            {isFailed && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                <p className="text-sm font-medium">We couldn’t load who you’re following.</p>
                <p className="text-xs text-red-600 mt-1">
                  {followingError || ((queryError as { data?: { message?: string } })?.data?.message ?? 'Something went wrong.')}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-2 inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
            {!isFailed && enrichedFollowing.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-w-300 p-6 text-center">
                <p className="text-sm text-neutral-b-600">You’re not following anyone yet. Discover voices to follow and they’ll appear here.</p>
              </div>
            ) : (
              <div className="max-h-[65vh] overflow-y-auto hide-scrollbar pr-1 sm:pr-2 space-y-3 sm:space-y-4 divide-y divide-neutral-w-200">
                {enrichedFollowing.map((profile) => (
                  <div key={profile.id} className="pt-3 first:pt-0">
                    <div
                      className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                      onMouseEnter={(event) => handlePreviewEnter(profile, event.currentTarget)}
                      onMouseLeave={handlePreviewLeave}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center shrink-0 sm:w-14 sm:h-14 overflow-hidden">
                          <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-neutral-b-900">{profile.name}</p>
                          <p className="text-xs text-neutral-b-500">@{profile.username}</p>
                          <p className="text-xs sm:text-sm text-neutral-b-500">{profile.role} · {profile.company}</p>
                          <p className="text-xs text-neutral-b-400 mt-1">{profile.location} · Following for {profile.since}</p>
                          <p className="text-xs text-primary-600 mt-1">{profile.cadence}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="text-xs text-neutral-b-500 hidden sm:block">{profile.focus}</div>
                        <button
                          type="button"
                          onClick={() => handleUnfollow(profile.id)}
                          disabled={pendingUnfollowId === profile.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-b-700 border border-neutral-w-300 rounded-lg hover:bg-neutral-w-200 transition-colors"
                        >
                          <UserMinus className="w-4 h-4" />
                          {pendingUnfollowId === profile.id ? 'Unfollowing...' : 'Unfollow'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <ProfileHoverPreview
        friend={previewTarget?.following ?? null}
        anchorRect={previewTarget?.rect ?? null}
        visible={isPreviewVisible && !!previewTarget}
        onMouseEnter={clearPreviewTimeout}
        onMouseLeave={handlePreviewLeave}
        primaryActionLabel="Unfollow"
        primaryActionIcon={<UserMinus className="w-4 h-4" />}
        secondaryActionLabel="Message"
        onPrimaryAction={() => {
          if (previewTarget?.following) {
            handleUnfollow(previewTarget.following.id);
          }
        }}
        primaryActionDisabled={pendingUnfollowId === previewTarget?.following?.id}
      />
    </div>
  );
};

export default FollowingPage;


