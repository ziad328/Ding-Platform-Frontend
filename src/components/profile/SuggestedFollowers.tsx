import { useMemo, useState } from 'react';
import { User, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  selectFollowSuggestions,
  selectFollowSuggestionsError,
  selectFollowSuggestionsStatus,
} from '../../store/slices/social/suggestions/follow/followSuggestions';
import { useGetFollowSuggestionsQuery, useFollowUserMutation } from '../../store/slices/social/suggestions/follow/followSuggestionsApi';
import { SuggestedFollowersSkeleton } from './ProfileSkeletons';

const buildFallbackUsername = (name?: string, userId?: string) => {
  if (name) {
    return name.toLowerCase().replace(/\s+/g, '.').slice(0, 20);
  }
  if (userId) {
    return userId.slice(0, 10);
  }
  return 'creator';
};

const SuggestedFollowers = () => {
  const suggestions = useSelector(selectFollowSuggestions);
  const status = useSelector(selectFollowSuggestionsStatus);
  const error = useSelector(selectFollowSuggestionsError);
  const { isLoading: queryLoading, isError: queryError, error: queryErrorPayload, refetch } = useGetFollowSuggestionsQuery();
  const [followUser] = useFollowUserMutation();
  const [followStates, setFollowStates] = useState<Record<
    string,
    {
      isPending: boolean;
      isFollowing: boolean;
      error: string | null;
    }
  >>({});

  const isLoading = queryLoading || status === 'loading' || status === 'idle';
  const isErrorState = queryError || status === 'failed';
  const displayFollowers = useMemo(
    () =>
      suggestions.slice(0, 4).map((suggestion, index) => {
        const name = suggestion.user?.name || suggestion.name || `Creator ${index + 1}`;
        const username = buildFallbackUsername(suggestion.username || suggestion.user?.username || name, suggestion.userId);
        const mutualFollowers = suggestion.mutualFriends ?? 0;

        return {
          id: suggestion.userId ?? `follower-${index}`,
          userId: suggestion.userId ?? null,
          name,
          username,
          avatar: suggestion.user?.image ?? null,
          mutualFollowers,
        };
      }),
    [suggestions]
  );

  const handleFollow = async (userId: string | null) => {
    if (!userId) return;
    const currentState = followStates[userId];
    if (currentState?.isPending || currentState?.isFollowing) return;

    setFollowStates((prev) => ({
      ...prev,
      [userId]: {
        isPending: true,
        isFollowing: currentState?.isFollowing ?? false,
        error: null,
      },
    }));

    try {
      await followUser(userId).unwrap();
      setFollowStates((prev) => ({
        ...prev,
        [userId]: {
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
        [userId]: {
          isPending: false,
          isFollowing: false,
          error: requestErrorMessage,
        },
      }));
    }
  };

  if (isLoading && !isErrorState) {
    return <SuggestedFollowersSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5 space-y-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-semibold text-neutral-b-900 dark:text-dark-text-primary">Suggested Followers</h3>
      </div>
      {isErrorState && (
        <div className="rounded-md border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-2">
          <p className="text-xs text-red-700 dark:text-red-400">
            {error || ((queryErrorPayload as { data?: { message?: string } })?.data?.message ?? 'Unable to load suggestions.')}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-1 text-[11px] font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            Retry
          </button>
        </div>
      )}
      {!isErrorState && displayFollowers.length === 0 && (
        <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted">No follower recommendations right now.</p>
      )}
      {!isErrorState && displayFollowers.length > 0 && (
        <div className="space-y-2.5 sm:space-y-3">
          {displayFollowers.map((follower) => {
            const followState = follower.userId ? followStates[follower.userId] : undefined;
            const isPendingFollow = followState?.isPending;
            const isAlreadyFollowing = followState?.isFollowing;
            return (
            <div key={follower.id} className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-w-300 dark:bg-dark-bg-tertiary flex items-center justify-center shrink-0 overflow-hidden">
                  {follower.avatar ? (
                    <img src={follower.avatar} alt={follower.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-b-500 dark:text-dark-text-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h4 className="text-xs sm:text-sm font-medium text-neutral-b-900 dark:text-dark-text-primary truncate">{follower.name}</h4>
                  <p className="text-[11px] text-neutral-b-500 dark:text-dark-text-muted mt-0.5 truncate">@{follower.username}</p>
                  {follower.mutualFollowers > 0 && (
                    <p className="text-[11px] text-neutral-b-400 dark:text-dark-text-muted truncate">
                      {follower.mutualFollowers} mutual followers
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end">
              <button
                type="button"
                onClick={() => handleFollow(follower.userId)}
                disabled={!follower.userId || isPendingFollow || isAlreadyFollowing}
                className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 text-xs sm:text-sm font-medium transition-colors shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{isAlreadyFollowing ? 'Following' : 'Follow'}</span>
              </button>
              {followState?.error && <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{followState.error}</p>}
              </div>
            </div>
          );
          })}
        </div>
      )}
      <div className="pt-2 border-t border-neutral-w-300 dark:border-dark-border">
        <Link
          to="/profile/suggested-followers"
          className="text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 transition-colors"
        >
          View all suggested followers
        </Link>
      </div>
    </div>
  );
};

export default SuggestedFollowers;

