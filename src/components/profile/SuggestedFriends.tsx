import { useMemo } from 'react';
import { User, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  selectFriendSuggestions,
  selectFriendSuggestionsError,
  selectFriendSuggestionsStatus,
} from '../../store/slices/social/suggestions/friend/friendSuggestions';
import { useGetFriendSuggestionsQuery } from '../../store/slices/social/suggestions/friend/friendSuggestionsApi';
import { SuggestedFriendsSkeleton } from './ProfileSkeletons';

const buildFallbackUsername = (name?: string, userId?: string) => {
  if (name) {
    return name.toLowerCase().replace(/\s+/g, '.').slice(0, 20);
  }
  if (userId) {
    return userId.slice(0, 10);
  }
  return 'member';
};

const SuggestedFriends = () => {
  const suggestions = useSelector(selectFriendSuggestions);
  const status = useSelector(selectFriendSuggestionsStatus);
  const error = useSelector(selectFriendSuggestionsError);
  const { isLoading: queryLoading, isError: queryError, error: queryErrorPayload, refetch } = useGetFriendSuggestionsQuery();

  const isLoading = queryLoading || status === 'loading' || status === 'idle';
  const isErrorState = queryError || status === 'failed';
  const displaySuggestions = useMemo(() => suggestions.slice(0, 4), [suggestions]);

  if (isLoading && !isErrorState) {
    return <SuggestedFriendsSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5 space-y-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-semibold text-neutral-b-900 dark:text-dark-text-primary">Suggested Friends</h3>
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
      {!isErrorState && displaySuggestions.length === 0 && (
        <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted">No suggestions right now. Check back soon!</p>
      )}
      {!isErrorState && displaySuggestions.length > 0 && (
        <div className="space-y-2.5 sm:space-y-3">
          {displaySuggestions.map((friend, index) => {
            const name = friend.user?.name || friend.name || `Community member ${index + 1}`;
            const username = buildFallbackUsername(friend.username || friend.user?.username || friend.name, friend.userId);
            const mutuals = friend.mutualFriends ?? 0;

            return (
              <div key={friend.userId} className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-w-300 dark:bg-dark-bg-tertiary flex items-center justify-center shrink-0 overflow-hidden">
                    {friend.user?.image ? (
                      <img src={friend.user.image} alt={name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-b-500 dark:text-dark-text-muted" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <h4 className="text-xs sm:text-sm font-medium text-neutral-b-900 dark:text-dark-text-primary truncate">{name}</h4>
                    <p className="text-[11px] text-neutral-b-500 dark:text-dark-text-muted mt-0.5 truncate">@{username}</p>
                    {mutuals > 0 && (
                      <p className="text-[11px] text-neutral-b-400 dark:text-dark-text-muted truncate">{mutuals} mutual friends</p>
                    )}
                  </div>
                </div>
                <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 p-0.5 sm:p-1 transition-colors shrink-0">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div className="pt-2 border-t border-neutral-w-300 dark:border-dark-border">
        <Link
          to="/profile/suggested-friends"
          className="text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 transition-colors"
        >
          View all suggested friends
        </Link>
      </div>
    </div>
  );
};

export default SuggestedFriends;