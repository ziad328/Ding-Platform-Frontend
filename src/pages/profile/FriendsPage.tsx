import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ArrowLeft, MessageCircle, UserMinus } from 'lucide-react';
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

const friendRoles = ['Product Manager', 'Design Lead', 'ML Engineer', 'Growth Marketer', 'Customer Success', 'Operations Lead'];
const friendCompanies = ['Driftspace', 'Helios Lab', 'Nimbus Health', 'Brightline', 'Fjord Studio', 'Atlas Loop'];
const friendLocations = ['Toronto, Canada', 'Madrid, Spain', 'Dubai, UAE', 'Austin, USA', 'Nairobi, Kenya', 'Stockholm, Sweden'];
const friendStories = [
  'Met during Ding Labs accelerator.',
  'Co-hosted a product AMA last quarter.',
  'Worked together on the Playbook launch.',
  'Introduced via the community town hall.',
];

type FriendProfile = ProfilePreviewFriend & {
  id: string;
  username: string;
  connectedOn: string;
  recentCollab: string;
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

  const enrichedFriends: FriendProfile[] = useMemo(
    () =>
      friends.map((friend, index) => ({
        id: friend.userId,
        username: friend.username,
        name: friend.name,
        role: friendRoles[index % friendRoles.length],
        company: friendCompanies[index % friendCompanies.length],
        location: friendLocations[index % friendLocations.length],
        avatar: `https://i.pravatar.cc/150?img=${((index + 23) % 70) + 1}`,
        connectedOn: `${(index % 10) + 1} months ago`,
        recentCollab: friendStories[index % friendStories.length],
      })),
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
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
        {isInitialLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-5 w-48 rounded bg-neutral-w-300" />
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
                Friends{friendCountLabel !== undefined ? ` (${friendCountLabel})` : ''}
              </h1>
              <p className="text-sm sm:text-base text-neutral-b-600">
                You’re connected with these members. Message them or revisit recent collaborations.
              </p>
            </div>
            {isFailed && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                <p className="text-sm font-medium">We couldn’t load your friends.</p>
                <p className="text-xs text-red-600 mt-1">
                  {friendsError || ((queryError as { data?: { message?: string } })?.data?.message ?? 'Something went wrong.')}
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
            {!isFailed && enrichedFriends.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-w-300 p-6 text-center">
                <p className="text-sm text-neutral-b-600">You don’t have any friends on Ding yet. Send requests to people you know to build your network.</p>
              </div>
            ) : (
              <div 
                ref={scrollContainerRef}
                className="max-h-[60vh] overflow-y-auto hide-scrollbar pr-1 sm:pr-2 space-y-3 sm:space-y-4 divide-y divide-neutral-w-200"
              >
                {enrichedFriends.map((friend) => (
                  <div key={friend.id} className="pt-3 first:pt-0">
                    <div
                      className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                      onMouseEnter={(event) => handlePreviewEnter(friend, event.currentTarget)}
                      onMouseLeave={handlePreviewLeave}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center shrink-0 sm:w-14 sm:h-14 overflow-hidden">
                          <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-neutral-b-900">{friend.name}</p>
                          <p className="text-xs text-neutral-b-500">@{friend.username}</p>
                          <p className="text-xs sm:text-sm text-neutral-b-500">{friend.role} · {friend.company}</p>
                          <p className="text-xs text-neutral-b-400 mt-1">{friend.location} · Connected {friend.connectedOn}</p>
                          <p className="text-xs text-primary-600 mt-1">{friend.recentCollab}</p>
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
                        <button
                          type="button"
                          onClick={() => handleRemoveFriend(friend.id)}
                          disabled={pendingRemovalId === friend.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-b-700 border border-neutral-w-300 rounded-lg hover:bg-neutral-w-200 transition-colors"
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
                {!hasMore && enrichedFriends.length > 0 && !isFetchingMore && (
                  <div className="pt-4 text-center">
                    <p className="text-xs sm:text-sm text-neutral-b-500">All caught up! You've seen all your friends.</p>
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


