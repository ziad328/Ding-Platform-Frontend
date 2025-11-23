import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ArrowLeft, MessageCircle, UserMinus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ProfileHoverPreview from '../../components/profile/ProfileHoverPreview';
import type { ProfilePreviewFriend } from '../../components/profile/ProfileHoverPreview';
import {
  selectFriends,
  selectFriendsCount,
  selectFriendsError,
  selectFriendsStatus,
  selectFriendsHasMore,
  selectFriendsNextOffset,
  selectFriendsIsFetchingMore,
  clearFriends,
} from '../../store/slices/social/friends/friends';
import { useDeleteFriendMutation, useGetFriendsQuery, useLazyGetFriendsQuery } from '../../store/slices/social/friends/friendsApi';

type FriendProfile = ProfilePreviewFriend & {
  id: string;
  username: string;
};

const FriendsPage = () => {
  const [previewTarget, setPreviewTarget] = useState<{ friend: FriendProfile; rect: DOMRect } | null>(null);
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const previewTimeoutRef = useRef<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const previousFriendsLengthRef = useRef<number>(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const friends = useSelector(selectFriends);
  const friendsStatus = useSelector(selectFriendsStatus);
  const friendsError = useSelector(selectFriendsError);
  const friendsCount = useSelector(selectFriendsCount);
  const hasMore = useSelector(selectFriendsHasMore);
  const nextOffset = useSelector(selectFriendsNextOffset);
  const isFetchingMore = useSelector(selectFriendsIsFetchingMore);

  // Initial load with limit=10, offset=0
  const {
    isLoading: isQueryLoading,
    isError: isQueryError,
    error: queryError,
    refetch,
  } = useGetFriendsQuery({ limit: 10, offset: 0 });

  // Lazy query for fetching additional pages
  const [fetchNextPageQuery, { isFetching: isFetchingNextPage }] = useLazyGetFriendsQuery();

  const [deleteFriend] = useDeleteFriendMutation();

  // Only show full loading skeleton on initial load (when there's no data)
  // During pagination, we show the bottom skeleton loader instead
  const isInitialLoading = (isQueryLoading || friendsStatus === 'loading' || friendsStatus === 'idle') && friends.length === 0;
  const isFailed = isQueryError || friendsStatus === 'failed';

  // Fetch next page function
  const fetchNextPage = useCallback(() => {
    if (!hasMore || isFetchingMore || isFetchingNextPage || isInitialLoading) return;
    fetchNextPageQuery({ limit: 10, offset: nextOffset });
  }, [hasMore, isFetchingMore, isFetchingNextPage, isInitialLoading, nextOffset, fetchNextPageQuery]);

  // Retry handler - resets pagination and refetches from beginning
  const handleRetry = useCallback(() => {
    dispatch(clearFriends());
    refetch();
  }, [dispatch, refetch]);

  // Generate username from name (fallback if not provided)
  const generateUsername = (name: string): string => {
    if (!name || name.trim() === '') return 'user';
    return name.toLowerCase().replace(/\s+/g, '.').substring(0, 20);
  };

  const enrichedFriends: FriendProfile[] = useMemo(
    () => {
      if (friends.length === 0) return [];
      
      return friends
        .filter((friend) => {
          // More lenient filter - just check if friend exists and has userId
          if (!friend || !friend.userId) return false;
          // If user exists but name is missing, we'll use a fallback
          return true;
        })
        .map((friend) => ({
          id: friend.userId,
          username: generateUsername(friend.user?.name || friend.userId),
          name: friend.user?.name || 'Unknown User',
          role: '', // Not provided in API
          company: '', // Not provided in API
          location: '', // Not provided in API
          avatar: friend.user?.image || null, // Use API image directly, null if not available
          bio: friend.bio || '',
        }));
    },
    [friends]
  );
  const friendCountLabel = friendsCount ?? enrichedFriends.length ?? 0;

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

  const handlePreviewEnter = (friend: FriendProfile, target: HTMLDivElement) => {
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
    if (friends.length === 0) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []); // Only run on mount

  // Track friends length to detect when new items are added via pagination
  useEffect(() => {
    previousFriendsLengthRef.current = enrichedFriends.length;
  }, [enrichedFriends.length]);

  // Auto-scroll to show skeleton when it appears during pagination
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only auto-scroll if we're fetching more and have existing friends
    if ((isFetchingMore || isFetchingNextPage) && enrichedFriends.length > 0) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (container) {
          // Scroll to bottom to show the skeleton
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }, [isFetchingMore, isFetchingNextPage, enrichedFriends.length]);

  useEffect(() => {
    return () => {
      clearPreviewTimeout();
      setPreviewTarget(null);
      setIsPreviewVisible(false);
      setPendingRemovalId(null);
    };
  }, []);

  const handleRemoveFriend = async (userId: string) => {
    if (pendingRemovalId) return;
    setPendingRemovalId(userId);
    try {
      await deleteFriend(userId).unwrap();
    } catch (error) {
      console.error('Failed to remove friend', error);
    } finally {
      setPendingRemovalId(null);
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
        {isInitialLoading ? (
            <div className="space-y-3 animate-pulse">
            <div className="h-5 w-48 rounded bg-neutral-w-300 dark:bg-dark-bg-tertiary" />
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
                Friends{friendCountLabel !== undefined ? ` (${friendCountLabel})` : ''}
              </h1>
              <p className="text-sm sm:text-base text-neutral-b-600 dark:text-dark-text-secondary">
                You're connected with these members. Message them or revisit recent collaborations.
              </p>
            </div>
            {isFailed && (
              <div className="mb-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-3 text-red-700 dark:text-red-400">
                <p className="text-sm font-medium">We couldn't load your friends.</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {friendsError || ((queryError as { data?: { message?: string } })?.data?.message ?? 'Something went wrong.')}
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
            {!isFailed && enrichedFriends.length === 0 && friends.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-w-300 dark:border-dark-border p-6 text-center">
                <p className="text-sm text-neutral-b-600 dark:text-dark-text-secondary">You don't have any friends on Ding yet. Send requests to people you know to build your network.</p>
              </div>
            ) : !isFailed && enrichedFriends.length === 0 && friends.length > 0 ? (
              <div className="rounded-lg border border-dashed border-yellow-300 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/20 p-6 text-center">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">Data received but couldn't process. Check console for details.</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">Raw friends: {friends.length}</p>
              </div>
            ) : (
              <div 
                ref={scrollContainerRef}
                className="max-h-[60vh] overflow-y-auto hide-scrollbar pr-1 sm:pr-2 space-y-3 sm:space-y-4 divide-y divide-neutral-w-200 dark:divide-dark-border"
              >
                {enrichedFriends.map((friend) => (
                  <div key={friend.id} className="first:pt-0 pb-3">
                    <div
                      className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div 
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-neutral-w-900 dark:bg-dark-bg-secondary border-3 sm:border-4 border-white dark:border-dark-bg-secondary flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                          onMouseEnter={(event) => handlePreviewEnter(friend, event.currentTarget)}
                          onMouseLeave={handlePreviewLeave}
                        >
                          {friend.avatar ? (
                            <img src={friend.avatar} alt={friend.name} className="w-full h-full rounded-full object-cover" loading="lazy" />
                          ) : (
                            <User className="w-6 h-6 sm:w-7 sm:h-7 text-neutral-b-400 dark:text-dark-text-muted" />
                          )}
                        </div>
                        <div>
                          <p 
                            className="text-sm sm:text-base font-semibold text-neutral-b-900 dark:text-dark-text-primary hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer inline-block"
                            onMouseEnter={(event) => handlePreviewEnter(friend, event.currentTarget)}
                            onMouseLeave={handlePreviewLeave}
                          >{friend.name}</p>
                          <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted">@{friend.username}</p>
                          {friend.bio && (
                            <p className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-secondary mt-1 line-clamp-2">{friend.bio}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/50 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFriend(friend.id)}
                          disabled={pendingRemovalId === friend.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-b-700 dark:text-dark-text-primary border border-neutral-w-300 dark:border-dark-border rounded-lg hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary transition-colors disabled:opacity-50"
                        >
                          <UserMinus className="w-4 h-4" />
                          {pendingRemovalId === friend.id ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Loading skeleton - shows when fetching more friends */}
                {(isFetchingMore || isFetchingNextPage) && enrichedFriends.length > 0 && (
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
                {!hasMore && enrichedFriends.length > 0 && !isFetchingMore && (
                  <div className="pt-4 text-center">
                    <p className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted">All caught up! You've seen all your friends.</p>
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
        primaryActionLabel="Remove"
        primaryActionIcon={<UserMinus className="w-4 h-4" />}
        secondaryActionLabel="Message"
        secondaryActionIcon={<MessageCircle className="w-4 h-4" />}
        onPrimaryAction={() => {
          if (previewTarget?.friend) {
            handleRemoveFriend(previewTarget.friend.id);
          }
        }}
        primaryActionDisabled={pendingRemovalId === previewTarget?.friend?.id}
      />
    </div>
  );
};

export default FriendsPage;


