import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ArrowLeft, UserCheck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { SuggestedFollowersSkeleton } from '../../components/profile/ProfileSkeletons';
import ProfileHoverPreview from '../../components/profile/ProfileHoverPreview';
import type { ProfilePreviewFriend } from '../../components/profile/ProfileHoverPreview';
import {
  selectFollowSuggestions,
  selectFollowSuggestionsCount,
  selectFollowSuggestionsError,
  selectFollowSuggestionsStatus,
  selectFollowSuggestionsHasMore,
  selectFollowSuggestionsNextOffset,
  selectFollowSuggestionsIsFetchingMore,
  clearFollowSuggestions,
} from '../../store/slices/social/suggestions/follow/followSuggestions';
import { useGetFollowSuggestionsQuery, useLazyGetFollowSuggestionsQuery, useFollowUserMutation } from '../../store/slices/social/suggestions/follow/followSuggestionsApi';

type SuggestedFollower = ProfilePreviewFriend & {
  userId: string | null;
  mutualConnections: number;
  reason?: string;
  score?: number;
};

const SuggestedFollowersPage = () => {
  const [previewTarget, setPreviewTarget] = useState<{ follower: SuggestedFollower; rect: DOMRect } | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const previewTimeoutRef = useRef<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const previousSuggestionsLengthRef = useRef<number>(0);
  const [followStates, setFollowStates] = useState<Record<
    string,
    {
      isPending: boolean;
      isFollowing: boolean;
      error: string | null;
    }
  >>({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const suggestions = useSelector(selectFollowSuggestions);
  const suggestionsStatus = useSelector(selectFollowSuggestionsStatus);
  const suggestionsError = useSelector(selectFollowSuggestionsError);
  const suggestionsCount = useSelector(selectFollowSuggestionsCount);
  const hasMore = useSelector(selectFollowSuggestionsHasMore);
  const nextOffset = useSelector(selectFollowSuggestionsNextOffset);
  const isFetchingMore = useSelector(selectFollowSuggestionsIsFetchingMore);

  // Initial load with limit=10, offset=0
  const {
    isLoading: isQueryLoading,
    isError: isQueryError,
    error: queryError,
    refetch,
  } = useGetFollowSuggestionsQuery({ limit: 10, offset: 0 });

  // Lazy query for fetching additional pages
  const [fetchNextPageQuery, { isFetching: isFetchingNextPage }] = useLazyGetFollowSuggestionsQuery();
  const [followUser] = useFollowUserMutation();

  // Only show full loading skeleton on initial load (when there's no data)
  // During pagination, we show the bottom skeleton loader instead
  const isInitialLoading = (isQueryLoading || suggestionsStatus === 'loading' || suggestionsStatus === 'idle') && suggestions.length === 0;
  const isFailed = isQueryError || suggestionsStatus === 'failed';

  // Fetch next page function
  const fetchNextPage = useCallback(() => {
    if (!hasMore || isFetchingMore || isFetchingNextPage || isInitialLoading) return;
    fetchNextPageQuery({ limit: 10, offset: nextOffset });
  }, [hasMore, isFetchingMore, isFetchingNextPage, isInitialLoading, nextOffset, fetchNextPageQuery]);

  // Retry handler - resets pagination and refetches from beginning
  const handleRetry = useCallback(() => {
    dispatch(clearFollowSuggestions());
    refetch();
  }, [dispatch, refetch]);

  // Enrich API data with display information
  const getReasonLabel = (reason?: string, mutualFriends?: number) => {
    if (reason === 'common_following') {
      const count = mutualFriends ?? 0;
      if (count === 0) return 'Popular with the people you follow';
      if (count === 1) return 'Followed by 1 person you follow';
      return `Followed by ${count} people you follow`;
    }
    if (!reason) return 'Suggested creator';
    return reason.replace(/_/g, ' ');
  };

  const suggestedFollowers: SuggestedFollower[] = useMemo(
    () =>
      suggestions.map((suggestion, index) => {
        const userId = suggestion.userId ?? null;
        const fallbackId = userId ?? `suggested-follower-${index}`;
        const name = suggestion.user?.name || suggestion.name || `Creator ${index + 1}`;
        const mutualConnections = suggestion.mutualFriends ?? 0;
        const reasonLabel = getReasonLabel(suggestion.reason, mutualConnections);
        const location = suggestion.user?.location || suggestion.headline || '';

        return {
          id: fallbackId,
          userId,
          name,
          role: reasonLabel,
          company: suggestion.user?.company ?? '',
          location,
          avatar: suggestion.user?.image ?? null,
          bio: suggestion.bio ?? undefined,
          focus: undefined,
          education: undefined,
          mutualConnections,
          reason: suggestion.reason,
          score: suggestion.score,
        };
      }),
    [suggestions]
  );

  const handleFollowClick = async (follower: SuggestedFollower) => {
    const targetUserId = follower.userId;
    if (!targetUserId) return;

    const currentState = followStates[targetUserId];
    if (currentState?.isPending || currentState?.isFollowing) return;

    setFollowStates((prev) => ({
      ...prev,
      [targetUserId]: {
        isPending: true,
        isFollowing: currentState?.isFollowing ?? false,
        error: null,
      },
    }));

    try {
      await followUser(targetUserId).unwrap();
      setFollowStates((prev) => ({
        ...prev,
        [targetUserId]: {
          isPending: false,
          isFollowing: true,
          error: null,
        },
      }));
    } catch (err) {
      const requestErrorMessage =
        (err as { data?: { message?: string }; error?: string })?.data?.message ||
        (err as { data?: { message?: string }; error?: string })?.error ||
        'Unable to follow this user.';

      setFollowStates((prev) => ({
        ...prev,
        [targetUserId]: {
          isPending: false,
          isFollowing: false,
          error: requestErrorMessage,
        },
      }));
    }
  };

  const getFollowState = (userId: string | null) => {
    if (!userId) return undefined;
    return followStates[userId];
  };

  const handleNavigateToProfile = (followerId: number | string) => {
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
    if (suggestions.length === 0) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []); // Only run on mount

  // Track suggestions length to detect when new items are added via pagination
  useEffect(() => {
    previousSuggestionsLengthRef.current = suggestedFollowers.length;
  }, [suggestedFollowers.length]);

  // Auto-scroll to show skeleton when it appears during pagination
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only auto-scroll if we're fetching more and have existing suggestions
    if ((isFetchingMore || isFetchingNextPage) && suggestedFollowers.length > 0) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (container) {
          // Scroll to bottom to show the skeleton
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }, [isFetchingMore, isFetchingNextPage, suggestedFollowers.length]);

  useEffect(() => {
    return () => {
      clearPreviewTimeout();
      setPreviewTarget(null);
      setIsPreviewVisible(false);
    };
  }, []);

  const previewFollowerUserId = previewTarget?.follower?.userId ?? null;
  const previewFollowState = previewFollowerUserId ? getFollowState(previewFollowerUserId) : undefined;

  return (
    <div className="w-full mx-auto">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
        {isInitialLoading ? (
          <div className="space-y-4">
            <div className="h-5 w-40 rounded bg-neutral-w-300 dark:bg-dark-bg-tertiary animate-pulse" />
            <div className="h-5 w-40 rounded bg-neutral-w-300 dark:bg-dark-bg-tertiary animate-pulse" />
            <div className="space-y-2 animate-pulse pt-2">
              <div className="h-3 w-32 rounded bg-neutral-w-300 dark:bg-dark-bg-tertiary" />
              <div className="h-7 w-48 rounded bg-neutral-w-300 dark:bg-dark-bg-tertiary" />
              <div className="h-4 w-64 rounded bg-neutral-w-300 dark:bg-dark-bg-tertiary" />
            </div>
            <SuggestedFollowersSkeleton />
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
                Suggested Followers{suggestionsCount !== undefined ? ` (${suggestionsCount})` : ''}
              </h1>
              <p className="text-sm sm:text-base text-neutral-b-600 dark:text-dark-text-secondary">
                Stay close to leaders and creators sharing insights you care about. Discover new voices and follow their updates.
              </p>
            </div>
            {isFailed && (
              <div className="mb-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-3 text-red-700 dark:text-red-400">
                <p className="text-sm font-medium">We couldn't load follower suggestions.</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {suggestionsError || ((queryError as { data?: { message?: string } })?.data?.message ?? 'Something went wrong.')}
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
            {!isFailed && suggestedFollowers.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-w-300 dark:border-dark-border p-6 text-center">
                <p className="text-sm text-neutral-b-600 dark:text-dark-text-secondary">No follower suggestions available at the moment. Check back later for new recommendations.</p>
              </div>
            ) : (
              <div 
                ref={scrollContainerRef}
                className="max-h-[60vh] overflow-y-auto hide-scrollbar pr-1 sm:pr-2 space-y-3 sm:space-y-4 divide-y divide-neutral-w-200 dark:divide-dark-border"
              >
              {suggestedFollowers.map((follower) => {
                const followState = getFollowState(follower.userId);
                const isPendingFollow = followState?.isPending;
                const isAlreadyFollowing = followState?.isFollowing;
                return (
                <div key={follower.id} className="first:pt-0 pb-3">
                  <div
                    className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between group"
                  >
                    <button
                      type="button"
                      onClick={() => handleNavigateToProfile(follower.id)}
                      className="flex items-start gap-3 sm:gap-4 text-left w-full sm:w-auto focus:outline-none"
                      aria-label={`Open ${follower.name}'s profile`}
                    >
                      <div 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-neutral-w-900 dark:bg-dark-bg-secondary border-3 sm:border-4 border-white dark:border-dark-bg-secondary flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                        onMouseEnter={(event) => handlePreviewEnter(follower, event.currentTarget)}
                        onMouseLeave={handlePreviewLeave}
                      >
                        {follower.avatar ? (
                          <img
                            src={follower.avatar}
                            alt={follower.name}
                            className="w-full h-full rounded-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <User className="w-6 h-6 sm:w-7 sm:h-7 text-neutral-b-400 dark:text-dark-text-muted" />
                        )}
                      </div>
                      <div>
                        <p 
                          className="text-sm sm:text-base font-semibold text-neutral-b-900 dark:text-dark-text-primary hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer inline-block"
                          onMouseEnter={(event) => handlePreviewEnter(follower, event.currentTarget)}
                          onMouseLeave={handlePreviewLeave}
                        >
                          {follower.name}
                        </p>
                        <p className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted">{follower.role}</p>
                        {(follower.location || follower.mutualConnections > 0) && (
                          <p className="text-xs text-neutral-b-400 dark:text-dark-text-muted mt-1">
                            {follower.location || 'Active in your circles'}
                            {follower.mutualConnections > 0 ? ` · ${follower.mutualConnections} mutual followers` : ''}
                          </p>
                        )}
                        {follower.bio && (
                          <p className="text-xs text-primary-600 dark:text-primary-400 mt-1 line-clamp-2">{follower.bio}</p>
                        )}
                      </div>
                    </button>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {follower.role && (
                        <div className="text-xs text-neutral-b-500 dark:text-dark-text-muted hidden sm:block">
                          {follower.role}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleFollowClick(follower)}
                        disabled={!follower.userId || isPendingFollow || isAlreadyFollowing}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-primary-600 dark:bg-primary-500 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <UserCheck className="w-4 h-4" />
                        {isAlreadyFollowing ? 'Following' : 'Follow'}
                      </button>
                      {followState?.error && (
                        <p className="text-xs text-red-600 dark:text-red-400">{followState.error}</p>
                      )}
                    </div>
                    </div>
                  </div>
                );
              })}
                {/* Loading skeleton - shows when fetching more suggestions */}
                {(isFetchingMore || isFetchingNextPage) && suggestedFollowers.length > 0 && (
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
                {!hasMore && suggestedFollowers.length > 0 && !isFetchingMore && (
                  <div className="pt-4 text-center">
                    <p className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted">All caught up! You've seen all follower suggestions.</p>
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
        primaryActionLabel={previewFollowState?.isFollowing ? 'Following' : 'Follow'}
        primaryActionDisabled={
          !previewFollowerUserId || previewFollowState?.isPending || previewFollowState?.isFollowing
        }
        onPrimaryAction={() => {
          if (previewTarget?.follower) {
            handleFollowClick(previewTarget.follower);
          }
        }}
        secondaryActionLabel="Message"
      />
    </div>
  );
};

export default SuggestedFollowersPage;


