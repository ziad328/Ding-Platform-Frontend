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

const SuggestedFriends = () => {
  const suggestions = useSelector(selectFriendSuggestions);
  const status = useSelector(selectFriendSuggestionsStatus);
  const error = useSelector(selectFriendSuggestionsError);
  const { isLoading: queryLoading, isError: queryError, error: queryErrorPayload, refetch } = useGetFriendSuggestionsQuery();

  const isLoading = queryLoading || status === 'loading' || status === 'idle';
  const isErrorState = queryError || status === 'failed';
  const displaySuggestions = useMemo(() => suggestions.slice(0, 4), [suggestions]);

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5 space-y-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-semibold text-neutral-b-900">Suggested Friends</h3>
        {isLoading && <div className="text-[10px] text-neutral-b-400 shrink-0">Updating…</div>}
      </div>
      {isErrorState && (
        <div className="rounded-md border border-red-200 bg-red-50 p-2">
          <p className="text-xs text-red-700">
            {error || ((queryErrorPayload as { data?: { message?: string } })?.data?.message ?? 'Unable to load suggestions.')}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-1 text-[11px] font-semibold text-red-600 hover:text-red-700"
          >
            Retry
          </button>
        </div>
      )}
      {!isErrorState && isLoading && (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between animate-pulse gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-w-200 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="h-3 w-24 bg-neutral-w-200 rounded" />
                  <div className="h-2 w-16 bg-neutral-w-100 rounded mt-1" />
                </div>
              </div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-neutral-w-200 shrink-0" />
            </div>
          ))}
        </div>
      )}
      {!isErrorState && !isLoading && displaySuggestions.length === 0 && (
        <p className="text-xs text-neutral-b-500">No suggestions right now. Check back soon!</p>
      )}
      {!isErrorState && !isLoading && displaySuggestions.length > 0 && (
        <div className="space-y-2.5 sm:space-y-3">
          {displaySuggestions.map((friend) => (
            <div key={friend.userId} className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-w-300 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-b-500" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h4 className="text-xs sm:text-sm font-medium text-neutral-b-900 truncate">{friend.name}</h4>
                  <p className="text-xs text-neutral-b-500 mt-0.5 truncate">@{friend.username}</p>
                </div>
              </div>
              <button className="text-primary-600 hover:text-primary-700 p-0.5 sm:p-1 transition-colors shrink-0">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="pt-2 border-t border-neutral-w-300">
        <Link
          to="/profile/suggested-friends"
          className="text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          View all suggested friends
        </Link>
      </div>
    </div>
  );
};

export default SuggestedFriends;