import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ArrowLeft, UserMinus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ProfileHoverPreview from '../../components/profile/ProfileHoverPreview';
import type { ProfilePreviewFriend } from '../../components/profile/ProfileHoverPreview';
import {
  selectFollowing,
  selectFollowingCount,
  selectFollowingError,
  selectFollowingStatus,
  selectFollowingHasMore,
  selectFollowingNextOffset,
  selectFollowingIsFetchingMore,
  clearFollowing,
} from '../../store/slices/social/following/following';
import { useDeleteFollowingMutation, useGetFollowingQuery, useLazyGetFollowingQuery } from '../../store/slices/social/following/followingApi';
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
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const previousFollowingLengthRef = useRef<number>(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const following = useSelector(selectFollowing);
  const followingStatus = useSelector(selectFollowingStatus);
  const followingError = useSelector(selectFollowingError);
  const followingCount = useSelector(selectFollowingCount);
  const hasMore = useSelector(selectFollowingHasMore);
  const nextOffset = useSelector(selectFollowingNextOffset);
  const isFetchingMore = useSelector(selectFollowingIsFetchingMore);

  // Initial load with limit=10, offset=0
  const {
    isLoading: isQueryLoading,
    isError: isQueryError,
    error: queryError,
    refetch,
  } = useGetFollowingQuery({ limit: 10, offset: 0 });

  // Lazy query for fetching additional pages
  const [fetchNextPageQuery, { isFetching: isFetchingNextPage }] = useLazyGetFollowingQuery();

  const [deleteFollowing] = useDeleteFollowingMutation();

  // Only show full loading skeleton on initial load (when there's no data)
  // During pagination, we show the bottom skeleton loader instead
  const isInitialLoading = (isQueryLoading || followingStatus === 'loading' || followingStatus === 'idle') && following.length === 0;
  const isFailed = isQueryError || followingStatus === 'failed';

  // Fetch next page function
  const fetchNextPage = useCallback(() => {
    if (!hasMore || isFetchingMore || isFetchingNextPage || isInitialLoading) return;
    fetchNextPageQuery({ limit: 10, offset: nextOffset });
  }, [hasMore, isFetchingMore, isFetchingNextPage, isInitialLoading, nextOffset, fetchNextPageQuery]);

  // Retry handler - resets pagination and refetches from beginning
  const handleRetry = useCallback(() => {
    dispatch(clearFollowing());
    refetch();
  }, [dispatch, refetch]);

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
    if (following.length === 0) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []); // Only run on mount

  // Track following length to detect when new items are added via pagination
  useEffect(() => {
    previousFollowingLengthRef.current = enrichedFollowing.length;
  }, [enrichedFollowing.length]);

  // Auto-scroll to show skeleton when it appears during pagination
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only auto-scroll if we're fetching more and have existing following
    if ((isFetchingMore || isFetchingNextPage) && enrichedFollowing.length > 0) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (container) {
          // Scroll to bottom to show the skeleton
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }, [isFetchingMore, isFetchingNextPage, enrichedFollowing.length]);

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
                Following{followingCountLabel !== undefined ? ` (${followingCountLabel})` : ''}
              </h1>
              <p className="text-sm sm:text-base text-neutral-b-600 dark:text-dark-text-secondary">
                You follow these voices. Stay in touch or manage who you want to keep up with.
              </p>
            </div>
            {isFailed && (
              <div className="mb-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-3 text-red-700 dark:text-red-400">
                <p className="text-sm font-medium">We couldn't load who you're following.</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {followingError || ((queryError as { data?: { message?: string } })?.data?.message ?? 'Something went wrong.')}
                </p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-2 inline-flex items-center rounded-md bg-red-600 dark:bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
            {!isFailed && enrichedFollowing.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-w-300 dark:border-dark-border p-6 text-center">
                <p className="text-sm text-neutral-b-600 dark:text-dark-text-secondary">You're not following anyone yet. Discover voices to follow and they'll appear here.</p>
              </div>
            ) : (
              <div 
                ref={scrollContainerRef}
                className="max-h-[60vh] overflow-y-auto hide-scrollbar pr-1 sm:pr-2 space-y-3 sm:space-y-4 divide-y divide-neutral-w-200 dark:divide-dark-border"
              >
                {enrichedFollowing.map((profile) => (
                  <div key={profile.id} className="first:pt-0 pb-3">
                    <div
                      className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div 
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-neutral-w-900 dark:bg-dark-bg-secondary border-3 sm:border-4 border-white dark:border-dark-bg-secondary flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                          onMouseEnter={(event) => handlePreviewEnter(profile, event.currentTarget)}
                          onMouseLeave={handlePreviewLeave}
                        >
                          {profile.avatar ? (
                            <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" loading="lazy" />
                          ) : (
                            <User className="w-6 h-6 sm:w-7 sm:h-7 text-neutral-b-400 dark:text-dark-text-muted" />
                          )}
                        </div>
                        <div>
                          <p 
                            className="text-sm sm:text-base font-semibold text-neutral-b-900 dark:text-dark-text-primary hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer inline-block"
                            onMouseEnter={(event) => handlePreviewEnter(profile, event.currentTarget)}
                            onMouseLeave={handlePreviewLeave}
                          >{profile.name}</p>
                          <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted">@{profile.username}</p>
                          <p className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted">{profile.role} · {profile.company}</p>
                          <p className="text-xs text-neutral-b-400 dark:text-dark-text-muted mt-1">{profile.location} · Following for {profile.since}</p>
                          <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">{profile.cadence}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="text-xs text-neutral-b-500 dark:text-dark-text-muted hidden sm:block">{profile.focus}</div>
                        <button
                          type="button"
                          onClick={() => handleUnfollow(profile.id)}
                          disabled={pendingUnfollowId === profile.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-b-700 dark:text-dark-text-primary border border-neutral-w-300 dark:border-dark-border rounded-lg hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary transition-colors disabled:opacity-50"
                        >
                          <UserMinus className="w-4 h-4" />
                          {pendingUnfollowId === profile.id ? 'Unfollowing...' : 'Unfollow'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Loading skeleton - shows when fetching more following */}
                {(isFetchingMore || isFetchingNextPage) && enrichedFollowing.length > 0 && (
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
                {!hasMore && enrichedFollowing.length > 0 && !isFetchingMore && (
                  <div className="pt-4 text-center">
                    <p className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted">All caught up! You've seen all the people you're following.</p>
                  </div>
                )}
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


