import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, MessageCircle, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileHoverPreview from '../../components/profile/ProfileHoverPreview';
import type { ProfilePreviewFriend } from '../../components/profile/ProfileHoverPreview';
import {
  selectFollowers,
  selectFollowersCount,
  selectFollowersError,
  selectFollowersStatus,
} from '../../store/slices/follow/followers/followers';
import { useGetFollowersQuery } from '../../store/slices/follow/followers/followersApi';

const followerRoles = ['Product Engineer', 'CX Strategist', 'Marketing Lead', 'Solutions Architect', 'Design Manager', 'Community Lead'];
const followerCompanies = ['Northwind Labs', 'Helio Systems', 'Vector Health', 'Kinetic Studio', 'Nimbus AI', 'Lunar Capital'];
const followerLocations = ['Chicago, USA', 'Berlin, Germany', 'Mumbai, India', 'Dubai, UAE', 'Vancouver, Canada', 'Oslo, Norway'];
const followerHighlights = [
  'Following you since joining Ding.',
  'Engages with your product posts frequently.',
  'Attended your recent virtual AMA.',
  'Shares similar interests in AI Ops.',
];

type FollowerProfile = ProfilePreviewFriend & {
  id: string;
  username: string;
  joined: string;
  engagement: string;
};

const FollowersPage = () => {
  const [previewTarget, setPreviewTarget] = useState<{ follower: FollowerProfile; rect: DOMRect } | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const previewTimeoutRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const followers = useSelector(selectFollowers);
  const followersStatus = useSelector(selectFollowersStatus);
  const followersError = useSelector(selectFollowersError);
  const followersCount = useSelector(selectFollowersCount);
  const {
    isLoading: isQueryLoading,
    isError: isQueryError,
    error: queryError,
    refetch,
  } = useGetFollowersQuery();

  const isLoading = isQueryLoading || followersStatus === 'loading' || followersStatus === 'idle';
  const isFailed = isQueryError || followersStatus === 'failed';

  const enrichedFollowers: FollowerProfile[] = useMemo(
    () =>
      followers.map((follower, index) => {
        const role = followerRoles[index % followerRoles.length];
        const company = followerCompanies[index % followerCompanies.length];
        const location = followerLocations[index % followerLocations.length];
        const joined = `${(index % 11) + 1} months ago`;
        const engagement = followerHighlights[index % followerHighlights.length];
        const avatar = `https://i.pravatar.cc/150?img=${((index + 7) % 70) + 1}`;

        return {
          id: follower.userId,
          username: follower.username,
          name: follower.name,
          role,
          company,
          location,
          avatar,
          joined,
          engagement,
        };
      }),
    [followers]
  );
  const followerCountLabel = followersCount ?? enrichedFollowers.length ?? 0;

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

  const handlePreviewEnter = (follower: FollowerProfile, target: HTMLDivElement) => {
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
  }, []);

  useEffect(() => {
    return () => {
      clearPreviewTimeout();
      setPreviewTarget(null);
      setIsPreviewVisible(false);
    };
  }, []);

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
                Followers{followerCountLabel !== undefined ? ` (${followerCountLabel})` : ''}
              </h1>
              <p className="text-sm sm:text-base text-neutral-b-600">
                These members follow your updates. Send a quick note or start a conversation.
              </p>
            </div>
            {isFailed && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                <p className="text-sm font-medium">We couldn’t load your followers.</p>
                <p className="text-xs text-red-600 mt-1">{followersError || ((queryError as { data?: { message?: string } })?.data?.message ?? 'Something went wrong.')}</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-2 inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
            {!isFailed && enrichedFollowers.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-w-300 p-6 text-center">
                <p className="text-sm text-neutral-b-600">No followers yet. Once people start following you, they’ll appear here.</p>
              </div>
            ) : (
              <div className="max-h-[65vh] overflow-y-auto hide-scrollbar pr-1 sm:pr-2 space-y-3 sm:space-y-4 divide-y divide-neutral-w-200">
                {enrichedFollowers.map((follower) => (
                  <div key={follower.id} className="pt-3 first:pt-0">
                    <div
                      className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                      onMouseEnter={(event) => handlePreviewEnter(follower, event.currentTarget)}
                      onMouseLeave={handlePreviewLeave}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center shrink-0 sm:w-14 sm:h-14 overflow-hidden">
                          <img src={follower.avatar} alt={follower.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-neutral-b-900">{follower.name}</p>
                          <p className="text-xs text-neutral-b-500">@{follower.username}</p>
                          <p className="text-xs sm:text-sm text-neutral-b-500">{follower.role} · {follower.company}</p>
                          <p className="text-xs text-neutral-b-400 mt-1">{follower.location} · Joined {follower.joined}</p>
                          <p className="text-xs text-primary-600 mt-1">{follower.engagement}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-primary-600 border border-primary-100 rounded-lg hover:bg-primary-50 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Message
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
        friend={previewTarget?.follower ?? null}
        anchorRect={previewTarget?.rect ?? null}
        visible={isPreviewVisible && !!previewTarget}
        onMouseEnter={clearPreviewTimeout}
        onMouseLeave={handlePreviewLeave}
        primaryActionLabel="Follow back"
        primaryActionIcon={<UserPlus className="w-4 h-4" />}
        secondaryActionLabel="Message"
        secondaryActionIcon={<MessageCircle className="w-4 h-4" />}
      />
    </div>
  );
};

export default FollowersPage;


