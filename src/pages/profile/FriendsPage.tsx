import { useEffect, useMemo, useRef, useState, useCallback, type RefObject } from 'react';
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
import {
  useDeleteFriendMutation,
  useGetFriendRequestsQuery,
  useGetFriendsQuery,
  useLazyGetFriendRequestsQuery,
  useLazyGetFriendsQuery,
} from '../../store/slices/social/friends/friendsApi';

type FriendProfile = ProfilePreviewFriend & {
  id: string;
  username: string;
};

const FriendsPage = () => {
  const [previewTarget, setPreviewTarget] = useState<{ friend: FriendProfile; rect: DOMRect } | null>(null);
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const previewTimeoutRef = useRef<number | null>(null);
  const friendsSentinelRef = useRef<HTMLDivElement | null>(null);
  const friendsScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const requestsSentinelRef = useRef<HTMLDivElement | null>(null);
  const requestsScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
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
  const {
    data: friendRequestsPayload,
    isLoading: isRequestQueryLoading,
    isError: isRequestQueryError,
    error: requestQueryError,
    refetch: refetchFriendRequests,
  } = useGetFriendRequestsQuery({ limit: 10, offset: 0 }, { skip: activeTab !== 'requests' });
  const [fetchNextFriendRequestsQuery, { isFetching: isFetchingFriendRequestsNextPage }] = useLazyGetFriendRequestsQuery();
  const [friendRequestsState, setFriendRequestsState] = useState({
    data: [] as typeof friends,
    count: 0,
    hasMore: false,
    total: 0,
    nextOffset: null as number | null,
  });
  const [hasInitializedRequests, setHasInitializedRequests] = useState(false);
  const [isRequestFetchingMore, setIsRequestFetchingMore] = useState(false);

  // Only show full loading skeleton on initial load (when there's no data)
  // During pagination, we show the bottom skeleton loader instead
  const isInitialLoading = (isQueryLoading || friendsStatus === 'loading' || friendsStatus === 'idle') && friends.length === 0;
  const isFailed = isQueryError || friendsStatus === 'failed';

  // Fetch next page function
  const fetchNextPage = useCallback(() => {
    if (!hasMore || isFetchingMore || isFetchingNextPage || isInitialLoading) return;
    fetchNextPageQuery({ limit: 10, offset: nextOffset });
  }, [hasMore, isFetchingMore, isFetchingNextPage, isInitialLoading, nextOffset, fetchNextPageQuery]);

  const requestsHasMore = friendRequestsState.hasMore;
  const requestsNextOffset = friendRequestsState.nextOffset ?? null;
  const isRequestsInitialLoading =
    (isRequestQueryLoading || !hasInitializedRequests) && friendRequestsState.data.length === 0 && activeTab === 'requests';
  const isRequestsFailed = isRequestQueryError;

  const fetchNextRequestsPage = useCallback(() => {
    if (
      activeTab !== 'requests' ||
      !requestsHasMore ||
      isRequestFetchingMore ||
      isFetchingFriendRequestsNextPage ||
      isRequestsInitialLoading ||
      requestsNextOffset === null
    ) {
      return;
    }

    setIsRequestFetchingMore(true);
    fetchNextFriendRequestsQuery({ limit: 10, offset: requestsNextOffset })
      .unwrap()
      .then((response) => {
        setFriendRequestsState((prev) => ({
          data: [...prev.data, ...(response?.data ?? [])],
          count: response?.count ?? prev.count,
          hasMore: response?.hasMore ?? false,
          total: response?.total ?? response?.count ?? prev.total,
          nextOffset: response?.nextOffset ?? null,
        }));
      })
      .catch((error) => {
        console.error('Failed to fetch additional friend requests', error);
      })
      .finally(() => {
        setIsRequestFetchingMore(false);
      });
  }, [
    activeTab,
    fetchNextFriendRequestsQuery,
    isFetchingFriendRequestsNextPage,
    isRequestFetchingMore,
    isRequestsInitialLoading,
    requestsHasMore,
    requestsNextOffset,
  ]);

  const generateUsername = useCallback((name: string): string => {
    if (!name || name.trim() === '') return 'user';
    return name.toLowerCase().replace(/\s+/g, '.').substring(0, 20);
  }, []);

  const convertToFriendProfiles = useCallback(
    (items: typeof friends): FriendProfile[] => {
      if (!items || items.length === 0) return [];

      return items
        .filter((friend) => friend && friend.userId)
        .map((friend) => ({
          id: friend.userId,
          username: generateUsername(friend.user?.name || friend.userId),
          name: friend.user?.name || 'Unknown User',
          role: '',
          company: '',
          location: '',
          avatar: friend.user?.image || null,
          bio: friend.bio || '',
        }));
    },
    [generateUsername]
  );

  const enrichedFriends: FriendProfile[] = useMemo(
    () => convertToFriendProfiles(friends),
    [convertToFriendProfiles, friends]
  );

  const enrichedFriendRequests: FriendProfile[] = useMemo(
    () => convertToFriendProfiles(friendRequestsState.data),
    [convertToFriendProfiles, friendRequestsState.data]
  );

  const friendCountLabel = friendsCount ?? enrichedFriends.length ?? 0;

  // Retry handler - resets pagination and refetches from beginning
  const handleRetry = useCallback(() => {
    dispatch(clearFriends());
    refetch();
  }, [dispatch, refetch]);

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

  useEffect(() => {
    if (!friendRequestsPayload || activeTab !== 'requests') return;
    setFriendRequestsState({
      data: friendRequestsPayload.data ?? [],
      count: friendRequestsPayload.count ?? 0,
      hasMore: friendRequestsPayload.hasMore ?? false,
      total: friendRequestsPayload.total ?? friendRequestsPayload.count ?? 0,
      nextOffset: friendRequestsPayload.nextOffset ?? null,
    });
    setHasInitializedRequests(true);
  }, [activeTab, friendRequestsPayload]);

  // IntersectionObserver for infinite scroll (friends)
  useEffect(() => {
    if (
      activeTab !== 'friends' ||
      !friendsSentinelRef.current ||
      !friendsScrollContainerRef.current ||
      !hasMore ||
      isFetchingMore ||
      isFetchingNextPage ||
      isInitialLoading
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isFetchingMore && !isFetchingNextPage) {
          setTimeout(() => {
            fetchNextPage();
          }, 300);
        }
      },
      {
        root: friendsScrollContainerRef.current,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    observer.observe(friendsSentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [activeTab, hasMore, isFetchingMore, isFetchingNextPage, isInitialLoading, fetchNextPage]);

  // IntersectionObserver for infinite scroll (friend requests)
  useEffect(() => {
    if (
      activeTab !== 'requests' ||
      !requestsSentinelRef.current ||
      !requestsScrollContainerRef.current ||
      !requestsHasMore ||
      isRequestFetchingMore ||
      isFetchingFriendRequestsNextPage ||
      isRequestsInitialLoading
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isRequestFetchingMore && !isFetchingFriendRequestsNextPage) {
          setTimeout(() => {
            fetchNextRequestsPage();
          }, 300);
        }
      },
      {
        root: requestsScrollContainerRef.current,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    observer.observe(requestsSentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [
    activeTab,
    fetchNextRequestsPage,
    isFetchingFriendRequestsNextPage,
    isRequestFetchingMore,
    isRequestsInitialLoading,
    requestsHasMore,
  ]);

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
    const container = friendsScrollContainerRef.current;
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

  // Auto-scroll for friend requests pagination
  useEffect(() => {
    const container = requestsScrollContainerRef.current;
    if (!container || activeTab !== 'requests') return;

    if ((isRequestFetchingMore || isFetchingFriendRequestsNextPage) && friendRequestsState.data.length > 0) {
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }, [
    activeTab,
    friendRequestsState.data.length,
    isFetchingFriendRequestsNextPage,
    isRequestFetchingMore,
  ]);

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

  const handleRequestsRetry = useCallback(() => {
    setFriendRequestsState({
      data: [],
      count: 0,
      hasMore: false,
      total: 0,
      nextOffset: null,
    });
    setHasInitializedRequests(false);
    refetchFriendRequests();
  }, [refetchFriendRequests]);

  const requestsCountLabel =
    friendRequestsState.total ??
    friendRequestsState.count ??
    enrichedFriendRequests.length ??
    0;

  const activeHeading = activeTab === 'friends' ? 'Friends' : 'Received Requests';
  const activeDescription =
    activeTab === 'friends'
      ? "You're connected with these members. Message them or revisit recent collaborations."
      : 'These members sent you connection requests. Review the details and manage them when ready.';
  const activeCountLabel = activeTab === 'friends' ? friendCountLabel : requestsCountLabel;

  const renderListSection = ({
    profiles,
    rawCount,
    isInitialLoadingState,
    isFailedState,
    errorMessage,
    onRetry,
    emptyDescription,
    containerRef,
    sentinelRef,
    hasMoreState,
    isFetchingMoreState,
    isFetchingNextPageState,
    endOfListMessage,
  }: {
    profiles: FriendProfile[];
    rawCount: number;
    isInitialLoadingState: boolean;
    isFailedState: boolean;
    errorMessage: string;
    onRetry: () => void;
    emptyDescription: string;
    containerRef: RefObject<HTMLDivElement | null>;
    sentinelRef: RefObject<HTMLDivElement | null>;
    hasMoreState: boolean;
    isFetchingMoreState: boolean;
    isFetchingNextPageState: boolean;
    endOfListMessage: string;
  }) => {
    if (isInitialLoadingState) {
      return (
        <div className="space-y-3 animate-pulse">
          <div className="h-5 w-48 rounded bg-neutral-w-300 dark:bg-dark-bg-tertiary" />
          <div className="h-5 w-36 rounded bg-neutral-w-300 dark:bg-dark-bg-tertiary" />
          <div className="h-32 rounded-lg bg-neutral-w-300 dark:bg-dark-bg-tertiary" />
        </div>
      );
    }

    if (isFailedState) {
      return (
        <div className="mb-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-3 text-red-700 dark:text-red-400">
          <p className="text-sm font-medium">We couldn't load this list.</p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errorMessage}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex items-center rounded-md bg-red-600 dark:bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    if (profiles.length === 0 && rawCount === 0) {
      return (
        <div className="rounded-lg border border-dashed border-neutral-w-300 dark:border-dark-border p-6 text-center">
          <p className="text-sm text-neutral-b-600 dark:text-dark-text-secondary">{emptyDescription}</p>
        </div>
      );
    }

    if (profiles.length === 0 && rawCount > 0) {
      return (
        <div className="rounded-lg border border-dashed border-yellow-300 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/20 p-6 text-center">
          <p className="text-sm text-yellow-800 dark:text-yellow-400">Data received but couldn't process. Check console for details.</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">Raw entries: {rawCount}</p>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className="max-h-[60vh] overflow-y-auto hide-scrollbar pr-1 sm:pr-2 space-y-3 sm:space-y-4 divide-y divide-neutral-w-200 dark:divide-dark-border"
      >
        {profiles.map((friend) => (
          <div key={friend.id} className="first:pt-0 pb-3">
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                  >
                    {friend.name}
                  </p>
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
        {(isFetchingMoreState || isFetchingNextPageState) && profiles.length > 0 && (
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
        {hasMoreState && !isFetchingMoreState && !isFetchingNextPageState && (
          <div ref={sentinelRef} className="h-4" />
        )}
        {!hasMoreState && profiles.length > 0 && !isFetchingMoreState && (
          <div className="pt-4 text-center">
            <p className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted">{endOfListMessage}</p>
          </div>
        )}
      </div>
    );
  };

  const friendsErrorMessage =
    friendsError || ((queryError as { data?: { message?: string } })?.data?.message ?? 'Something went wrong.');
  const requestsErrorMessage =
    (requestQueryError as { data?: { message?: string } })?.data?.message ?? 'Something went wrong.';

  const tabs: Array<{ id: 'friends' | 'requests'; label: string }> = [
    { id: 'friends', label: 'Friends' },
    { id: 'requests', label: 'Received Requests' },
  ];

  return (
    <div className="w-full mx-auto">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/profile')}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to profile
          </button>
          <div className="flex flex-col gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-neutral-b-900 dark:text-dark-text-primary">
                {activeHeading}
                {typeof activeCountLabel === 'number' ? ` (${activeCountLabel})` : ''}
              </h1>
              <p className="text-sm sm:text-base text-neutral-b-600 dark:text-dark-text-secondary">{activeDescription}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 bg-primary-50 text-primary-600 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-300'
                      : 'border-transparent bg-neutral-w-100 text-neutral-b-600 hover:bg-neutral-w-200 dark:bg-dark-bg-tertiary dark:text-dark-text-secondary dark:hover:bg-dark-bg-tertiary/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTab === 'friends'
          ? renderListSection({
              profiles: enrichedFriends,
              rawCount: friends.length,
              isInitialLoadingState: isInitialLoading,
              isFailedState: isFailed,
              errorMessage: friendsErrorMessage,
              onRetry: handleRetry,
              emptyDescription: "You don't have any friends on Ding yet. Send requests to people you know to build your network.",
              containerRef: friendsScrollContainerRef,
              sentinelRef: friendsSentinelRef,
              hasMoreState: hasMore,
              isFetchingMoreState: isFetchingMore,
              isFetchingNextPageState: isFetchingNextPage,
              endOfListMessage: "All caught up! You've seen all your friends.",
            })
          : renderListSection({
              profiles: enrichedFriendRequests,
              rawCount: friendRequestsState.data.length,
              isInitialLoadingState: isRequestsInitialLoading,
              isFailedState: isRequestsFailed,
              errorMessage: requestsErrorMessage,
              onRetry: handleRequestsRetry,
              emptyDescription: "You haven't received any new friend requests yet.",
              containerRef: requestsScrollContainerRef,
              sentinelRef: requestsSentinelRef,
              hasMoreState: requestsHasMore,
              isFetchingMoreState: isRequestFetchingMore,
              isFetchingNextPageState: isFetchingFriendRequestsNextPage,
              endOfListMessage: 'All caught up! You have reviewed every friend request.',
            })}
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
