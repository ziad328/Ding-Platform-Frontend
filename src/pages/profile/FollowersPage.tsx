import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ArrowLeft, MessageCircle, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ProfileHoverPreview from '../../components/profile/ProfileHoverPreview';
import type { ProfilePreviewFriend } from '../../components/profile/ProfileHoverPreview';
import {
  selectFollowers,
  selectFollowersCount,
  selectFollowersError,
  selectFollowersStatus,
  selectFollowersHasMore,
  selectFollowersNextOffset,
  selectFollowersIsFetchingMore,
  clearFollowers,
} from '../../store/slices/social/followers/followers';
import { useGetFollowersQuery, useLazyGetFollowersQuery } from '../../store/slices/social/followers/followersApi';

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
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const previousFollowersLengthRef = useRef<number>(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const followers = useSelector(selectFollowers);
  const followersStatus = useSelector(selectFollowersStatus);
  const followersError = useSelector(selectFollowersError);
  const followersCount = useSelector(selectFollowersCount);
  const hasMore = useSelector(selectFollowersHasMore);
  const nextOffset = useSelector(selectFollowersNextOffset);
  const isFetchingMore = useSelector(selectFollowersIsFetchingMore);

  // Initial load with limit=10, offset=0
  const {
    isLoading: isQueryLoading,
    isError: isQueryError,
    error: queryError,
    refetch,
  } = useGetFollowersQuery({ limit: 10, offset: 0 });

  // Lazy query for fetching additional pages
  const [fetchNextPageQuery, { isFetching: isFetchingNextPage }] = useLazyGetFollowersQuery();

  // Only show full loading skeleton on initial load (when there's no data)
  // During pagination, we show the bottom skeleton loader instead
  const isInitialLoading = (isQueryLoading || followersStatus === 'loading' || followersStatus === 'idle') && followers.length === 0;
  const isFailed = isQueryError || followersStatus === 'failed';

  // Fetch next page function
  const fetchNextPage = useCallback(() => {
    if (!hasMore || isFetchingMore || isFetchingNextPage || isInitialLoading) return;
    fetchNextPageQuery({ limit: 10, offset: nextOffset });
  }, [hasMore, isFetchingMore, isFetchingNextPage, isInitialLoading, nextOffset, fetchNextPageQuery]);

  // Retry handler - resets pagination and refetches from beginning
  const handleRetry = useCallback(() => {
    dispatch(clearFollowers());
    refetch();
  }, [dispatch, refetch]);

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

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !scrollContainerRef.current || !hasMore || isFetchingMore || isFetchingNextPage || isInitialLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isFetchingMore && !isFetchingNextPage) {
          // Small delay to mimic "take some time"
          setTimeout(() => {
            fetchNextPage();
          }, 300);
        }
      },
      {
        root: scrollContainerRef.current, // Use scrollable container as root
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isFetchingMore, isFetchingNextPage, isInitialLoading, fetchNextPage]);

  // Only scroll to top on initial mount when there's no data
  useEffect(() => {
    if (followers.length === 0) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []); // Only run on mount

  // Track followers length to detect when new items are added via pagination
  useEffect(() => {
    previousFollowersLengthRef.current = enrichedFollowers.length;
  }, [enrichedFollowers.length]);

  // Auto-scroll to show skeleton when it appears during pagination
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only auto-scroll if we're fetching more and have existing followers
    if ((isFetchingMore || isFetchingNextPage) && enrichedFollowers.length > 0) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (container) {
          // Scroll to bottom to show the skeleton
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }, [isFetchingMore, isFetchingNextPage, enrichedFollowers.length]);

  useEffect(() => {
    return () => {
      clearPreviewTimeout();
      setPreviewTarget(null);
      setIsPreviewVisible(false);
    };
  }, []);

  return (
    <div className="w-full mx-auto">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
        {isInitialLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-5 w-44 rounded bg-neutral-w-300 dark:bg-dark-bg-tertiary" />
            <div className="h-5 w-36 rounded bg-neutral-w-300 dark:bg-dark-bg-tertiary" />
            <div className="h-32 rounded-lg bg-neutral-w-300 dark:bg-dark-bg-tertiary" />
          </div>
        ) : (
          <>
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <button
                onClick={() => navigate('/profile')}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to profile
              </button>
              <h1 className="text-xl sm:text-2xl font-semibold text-neutral-b-900 dark:text-dark-text-primary">
                Followers{followerCountLabel !== undefined ? ` (${followerCountLabel})` : ''}
              </h1>
              <p className="text-sm sm:text-base text-neutral-b-600 dark:text-dark-text-secondary">
                These members follow your updates. Send a quick note or start a conversation.
              </p>
            </div>
            {isFailed && (
              <div className="mb-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-3 text-red-700 dark:text-red-400">
                <p className="text-sm font-medium">We couldn't load your followers.</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{followersError || ((queryError as { data?: { message?: string } })?.data?.message ?? 'Something went wrong.')}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-2 inline-flex items-center rounded-md bg-red-600 dark:bg-semantic-r-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 dark:hover:bg-semantic-r-900 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
            {!isFailed && enrichedFollowers.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-w-300 dark:border-dark-border p-6 text-center">
                <p className="text-sm text-neutral-b-600 dark:text-dark-text-secondary">No followers yet. Once people start following you, they'll appear here.</p>
              </div>
            ) : (
              <div
                ref={scrollContainerRef}
                className="max-h-[60vh] overflow-y-auto hide-scrollbar pr-1 sm:pr-2 space-y-3 sm:space-y-4 divide-y divide-neutral-w-200 dark:divide-dark-border"
              >
                {enrichedFollowers.map((follower) => (
                  <div key={follower.id} className="pt-3 first:pt-0">
                    <div
                      className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                      onMouseEnter={(event) => handlePreviewEnter(follower, event.currentTarget)}
                      onMouseLeave={handlePreviewLeave}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0 sm:w-14 sm:h-14 overflow-hidden">
                          <img src={follower.avatar} alt={follower.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-neutral-b-900 dark:text-dark-text-primary">{follower.name}</p>
                          <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted">@{follower.username}</p>
                          <p className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted">{follower.role} · {follower.company}</p>
                          <p className="text-xs text-neutral-b-400 dark:text-dark-text-muted mt-1">{follower.location} · Joined {follower.joined}</p>
                          <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">{follower.engagement}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Loading skeleton - shows when fetching more followers */}
                {(isFetchingMore || isFetchingNextPage) && enrichedFollowers.length > 0 && (
                  <div className="pt-3 animate-pulse">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-12 h-12 rounded-full bg-neutral-w-300 dark:bg-dark-bg-tertiary shrink-0 sm:w-14 sm:h-14" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-32 rounded bg-neutral-w-300 dark:bg-dark-bg-tertiary" />
                          <div className="h-3 w-24 rounded bg-neutral-w-300 dark:bg-dark-bg-tertiary" />
                          <div className="h-3 w-40 rounded bg-neutral-w-300 dark:bg-dark-bg-tertiary" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Sentinel div for infinite scroll */}
                {hasMore && !isFetchingMore && !isFetchingNextPage && (
                  <div ref={sentinelRef} className="h-4" />
                )}
                {/* End of list message */}
                {!hasMore && enrichedFollowers.length > 0 && !isFetchingMore && (
                  <div className="pt-4 text-center">
                    <p className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted">All caught up! You've seen all your followers.</p>
                  </div>
                )}
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


