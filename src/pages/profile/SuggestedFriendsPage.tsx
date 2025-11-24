import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ArrowLeft, UserPlus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { SuggestedFriendsSkeleton } from '../../components/profile/ProfileSkeletons';
import ProfileHoverPreview from '../../components/profile/ProfileHoverPreview';
import type { ProfilePreviewFriend } from '../../components/profile/ProfileHoverPreview';
import {
  selectFriendSuggestions,
  selectFriendSuggestionsCount,
  selectFriendSuggestionsError,
  selectFriendSuggestionsStatus,
  selectFriendSuggestionsHasMore,
  selectFriendSuggestionsNextOffset,
  selectFriendSuggestionsIsFetchingMore,
  clearFriendSuggestions,
} from '../../store/slices/social/suggestions/friend/friendSuggestions';
import { useGetFriendSuggestionsQuery, useLazyGetFriendSuggestionsQuery } from '../../store/slices/social/suggestions/friend/friendSuggestionsApi';

const firstNames = ['Olivia', 'Liam', 'Emma', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'Logan', 'Mia', 'Lucas'];
const lastNames = ['Anderson', 'Baker', 'Chen', 'Diaz', 'Edwards', 'Fisher', 'Garcia', 'Harris', 'Ivanov', 'Johnson', 'Khan', 'Lewis'];
const roles = ['Product Designer', 'Software Engineer', 'Marketing Lead', 'Data Scientist', 'Project Manager', 'UX Researcher', 'DevOps Engineer', 'Content Strategist'];
const locations = ['New York, USA', 'London, UK', 'Berlin, Germany', 'Paris, France', 'Cairo, Egypt', 'Dubai, UAE', 'Toronto, Canada', 'Sydney, Australia'];
const companies = ['Nova Labs', 'Orbit Health', 'PixelForge', 'Skyline Ventures', 'Northwind Tech', 'Lumos Studio', 'BluePeak Data', 'Cascade Systems'];
const educations = ['Stanford University', 'MIT', 'University of Toronto', 'Sorbonne University', 'UCLA', 'Imperial College London', 'ETH Zurich', 'University of Sydney'];
const bios = [
  'Building delightful user experiences with a focus on accessibility and inclusive design.',
  'Scaling cloud-native platforms and mentoring teams on DevOps best practices.',
  'Helping product squads validate ideas quickly using data-driven experiments.',
  'Obsessed with solving customer problems through storytelling and community.',
  'Bridging design and engineering to deliver polished, production-ready interfaces.',
  'Making AI systems explainable and ethical for everyday businesses.',
];
const focusAreas = [
  'SaaS · Growth · Design Systems',
  'Developer Experience · DevOps · Cloud',
  'Product Analytics · Experimentation',
  'Community · Content · Partnerships',
  'Frontend Architecture · Design Tokens',
  'AI/ML · Responsible Tech · Research',
];

type SuggestedFriend = Omit<ProfilePreviewFriend, 'id'> & {
  id: number;
  mutualConnections: number;
  availability: string;
  bio: string;
  focus: string;
  education: string;
};

const SuggestedFriendsPage = () => {
  const [previewTarget, setPreviewTarget] = useState<{ friend: SuggestedFriend; rect: DOMRect } | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const previewTimeoutRef = useRef<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const previousSuggestionsLengthRef = useRef<number>(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const suggestions = useSelector(selectFriendSuggestions);
  const suggestionsStatus = useSelector(selectFriendSuggestionsStatus);
  const suggestionsError = useSelector(selectFriendSuggestionsError);
  const suggestionsCount = useSelector(selectFriendSuggestionsCount);
  const hasMore = useSelector(selectFriendSuggestionsHasMore);
  const nextOffset = useSelector(selectFriendSuggestionsNextOffset);
  const isFetchingMore = useSelector(selectFriendSuggestionsIsFetchingMore);

  // Initial load with limit=10, offset=0
  const {
    isLoading: isQueryLoading,
    isError: isQueryError,
    error: queryError,
    refetch,
  } = useGetFriendSuggestionsQuery({ limit: 10, offset: 0 });

  // Lazy query for fetching additional pages
  const [fetchNextPageQuery, { isFetching: isFetchingNextPage }] = useLazyGetFriendSuggestionsQuery();

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
    dispatch(clearFriendSuggestions());
    refetch();
  }, [dispatch, refetch]);

  // Enrich API data with display information
  const suggestedFriends: SuggestedFriend[] = useMemo(
    () =>
      suggestions.map((suggestion, index) => ({
        id: parseInt(suggestion.userId) || index + 1,
        name: suggestion.name || `${firstNames[index % firstNames.length]} ${lastNames[(index * 3) % lastNames.length]}`,
        role: roles[index % roles.length],
        mutualConnections: (index * 7) % 58 + 3,
        location: suggestion.headline || locations[index % locations.length],
        availability: index % 2 === 0 ? 'Open to mentoring' : 'Exploring new roles',
        bio: bios[index % bios.length],
        focus: focusAreas[index % focusAreas.length],
        company: companies[index % companies.length],
        education: educations[index % educations.length],
        avatar: `https://i.pravatar.cc/150?img=${(index % 70) + 1}`,
      })),
    [suggestions]
  );

  const handleNavigateToProfile = (friendId: number) => {
    navigate(`/profile?user=${friendId}`);
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

  const handlePreviewEnter = (friend: SuggestedFriend, target: HTMLDivElement) => {
    if (window.innerWidth < 768) return;
    clearPreviewTimeout();
    const rect = target.getBoundingClientRect();
    setPreviewTarget({ friend, rect });
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
    previousSuggestionsLengthRef.current = suggestedFriends.length;
  }, [suggestedFriends.length]);

  // Auto-scroll to show skeleton when it appears during pagination
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only auto-scroll if we're fetching more and have existing suggestions
    if ((isFetchingMore || isFetchingNextPage) && suggestedFriends.length > 0) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (container) {
          // Scroll to bottom to show the skeleton
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }, [isFetchingMore, isFetchingNextPage, suggestedFriends.length]);

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
          <div className="space-y-4">
            <div className="h-5 w-32 rounded bg-neutral-w-300 dark:bg-dark-bg-tertiary animate-pulse" />
            <div className="h-5 w-32 rounded bg-neutral-w-300 dark:bg-dark-bg-tertiary animate-pulse" />
            <div className="space-y-2 animate-pulse pt-2">
              <div className="h-3 w-32 rounded bg-neutral-w-300 dark:bg-dark-bg-tertiary" />
              <div className="h-7 w-48 rounded bg-neutral-w-300 dark:bg-dark-bg-tertiary" />
              <div className="h-4 w-64 rounded bg-neutral-w-300 dark:bg-dark-bg-tertiary" />
            </div>
            <SuggestedFriendsSkeleton />
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
                Suggested Friends{suggestionsCount !== undefined ? ` (${suggestionsCount})` : ''}
              </h1>
              <p className="text-sm sm:text-base text-neutral-b-600 dark:text-dark-text-secondary">
                Connect with professionals aligned with your interests, industry, and goals.
                Browse the curated list below and grow your network.
              </p>
            </div>
            {isFailed && (
              <div className="mb-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-3 text-red-700 dark:text-red-400">
                <p className="text-sm font-medium">We couldn't load friend suggestions.</p>
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
            {!isFailed && suggestedFriends.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-w-300 dark:border-dark-border p-6 text-center">
                <p className="text-sm text-neutral-b-600 dark:text-dark-text-secondary">No friend suggestions available at the moment. Check back later for new recommendations.</p>
              </div>
            ) : (
              <div 
                ref={scrollContainerRef}
                className="max-h-[60vh] overflow-y-auto hide-scrollbar pr-1 sm:pr-2 space-y-3 sm:space-y-4 divide-y divide-neutral-w-200 dark:divide-dark-border"
              >
              {suggestedFriends.map((friend) => (
                <div key={friend.id} className="first:pt-0 pb-3">
                  <div
                    className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between group"
                  >
                    <button
                      type="button"
                      onClick={() => handleNavigateToProfile(friend.id)}
                      className="flex items-start gap-3 sm:gap-4 text-left w-full sm:w-auto focus:outline-none"
                      aria-label={`Open ${friend.name}'s profile`}
                    >
                      <div 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-neutral-w-900 dark:bg-dark-bg-secondary border-3 sm:border-4 border-white dark:border-dark-bg-secondary flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                        onMouseEnter={(event) => handlePreviewEnter(friend, event.currentTarget)}
                        onMouseLeave={handlePreviewLeave}
                      >
                        {friend.avatar ? (
                          <img
                            src={friend.avatar}
                            alt={friend.name}
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
                          onMouseEnter={(event) => handlePreviewEnter(friend, event.currentTarget)}
                          onMouseLeave={handlePreviewLeave}
                        >
                          {friend.name}
                        </p>
                        <p className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted">{friend.role}</p>
                        <p className="text-xs text-neutral-b-400 dark:text-dark-text-muted mt-1">
                          {friend.location} · {friend.mutualConnections} mutual connections
                        </p>
                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">{friend.availability}</p>
                      </div>
                    </button>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-primary-600 dark:bg-primary-500 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Friend
                      </button>
                    </div>
                    </div>
                  </div>
                ))}
                {/* Loading skeleton - shows when fetching more suggestions */}
                {(isFetchingMore || isFetchingNextPage) && suggestedFriends.length > 0 && (
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
                {!hasMore && suggestedFriends.length > 0 && !isFetchingMore && (
                  <div className="pt-4 text-center">
                    <p className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted">All caught up! You've seen all friend suggestions.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <ProfileHoverPreview
        friend={previewTarget?.friend ?? null}
        anchorRect={previewTarget?.rect ?? null}
        visible={isPreviewVisible && !!previewTarget}
        onMouseEnter={clearPreviewTimeout}
        onMouseLeave={handlePreviewLeave}
      />
    </div>
  );
};

export default SuggestedFriendsPage;

