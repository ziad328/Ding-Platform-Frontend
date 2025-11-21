import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ArrowLeft, UserCheck } from 'lucide-react';
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
import { useGetFollowSuggestionsQuery, useLazyGetFollowSuggestionsQuery } from '../../store/slices/social/suggestions/follow/followSuggestionsApi';

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
  const [previewTarget, setPreviewTarget] = useState<{ follower: SuggestedFollower; rect: DOMRect } | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const previewTimeoutRef = useRef<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const previousSuggestionsLengthRef = useRef<number>(0);
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
  const suggestedFollowers: SuggestedFollower[] = useMemo(
    () =>
      suggestions.map((suggestion, index) => ({
        id: parseInt(suggestion.userId) || index + 1,
        name: suggestion.name || `${creatorNames[index % creatorNames.length]} ${creatorLastNames[(index * 5) % creatorLastNames.length]}`,
        role: niches[index % niches.length],
        company: organizations[index % organizations.length],
        location: suggestion.headline || regions[index % regions.length],
        bio: taglines[index % taglines.length],
        focus: focusDescriptors[index % focusDescriptors.length],
        avatar: `https://i.pravatar.cc/150?img=${(index % 70) + 1}`,
        followers: 1200 + index * 23,
        sharedTopics: focusDescriptors[index % focusDescriptors.length],
        cadence: index % 2 === 0 ? 'Posts weekly' : 'Daily short takes',
      })),
    [suggestions]
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

  return (
    <div className="w-full mx-auto">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
        {isInitialLoading ? (
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
                Suggested Followers{suggestionsCount !== undefined ? ` (${suggestionsCount})` : ''}
              </h1>
              <p className="text-sm sm:text-base text-neutral-b-600">
                Stay close to leaders and creators sharing insights you care about. Discover new voices and follow their updates.
              </p>
            </div>
            {isFailed && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                <p className="text-sm font-medium">We couldn't load follower suggestions.</p>
                <p className="text-xs text-red-600 mt-1">
                  {suggestionsError || ((queryError as { data?: { message?: string } })?.data?.message ?? 'Something went wrong.')}
                </p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-2 inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
            {!isFailed && suggestedFollowers.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-w-300 p-6 text-center">
                <p className="text-sm text-neutral-b-600">No follower suggestions available at the moment. Check back later for new recommendations.</p>
              </div>
            ) : (
              <div 
                ref={scrollContainerRef}
                className="max-h-[60vh] overflow-y-auto hide-scrollbar pr-1 sm:pr-2 space-y-3 sm:space-y-4 divide-y divide-neutral-w-200"
              >
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
                {/* Loading skeleton - shows when fetching more suggestions */}
                {(isFetchingMore || isFetchingNextPage) && suggestedFollowers.length > 0 && (
                  <div className="pt-3 animate-pulse">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-12 h-12 rounded-full bg-neutral-w-300 shrink-0 sm:w-14 sm:h-14" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-32 rounded bg-neutral-w-300" />
                          <div className="h-3 w-24 rounded bg-neutral-w-300" />
                          <div className="h-3 w-40 rounded bg-neutral-w-300" />
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
                    <p className="text-xs sm:text-sm text-neutral-b-500">All caught up! You've seen all follower suggestions.</p>
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
        primaryActionLabel="Follow"
        secondaryActionLabel="Message"
      />
    </div>
  );
};

export default SuggestedFollowersPage;


