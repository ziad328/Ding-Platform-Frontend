import { useMemo } from 'react';
import { User, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  selectFollowSuggestions,
  selectFollowSuggestionsError,
  selectFollowSuggestionsStatus,
} from '../../store/slices/social/suggestions/follow/followSuggestions';
import { useGetFollowSuggestionsQuery } from '../../store/slices/social/suggestions/follow/followSuggestionsApi';
import { SuggestedFollowersSkeleton } from './ProfileSkeletons';

const SuggestedFollowers = () => {
  const suggestions = useSelector(selectFollowSuggestions);
  const status = useSelector(selectFollowSuggestionsStatus);
  const error = useSelector(selectFollowSuggestionsError);
  const { isLoading: queryLoading, isError: queryError, error: queryErrorPayload, refetch } = useGetFollowSuggestionsQuery();

  const isLoading = queryLoading || status === 'loading' || status === 'idle';
  const isErrorState = queryError || status === 'failed';
  const displaySuggestions = useMemo(() => suggestions.slice(0, 4), [suggestions]);

  if (isLoading && !isErrorState) {
    return <SuggestedFollowersSkeleton />;
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5 space-y-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-semibold text-neutral-b-900">Suggested Followers</h3>
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
      {!isErrorState && displaySuggestions.length === 0 && (
        <p className="text-xs text-neutral-b-500">No follower recommendations right now.</p>
      )}
      {!isErrorState && displaySuggestions.length > 0 && (
        <div className="space-y-2.5 sm:space-y-3">
          {displaySuggestions.map((follower) => (
            <div key={follower.userId} className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-w-300 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-b-500" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h4 className="text-xs sm:text-sm font-medium text-neutral-b-900 truncate">{follower.name}</h4>
                  <p className="text-xs text-neutral-b-500 mt-0.5 truncate">{follower.headline || `@${follower.username}`}</p>
                </div>
              </div>
              <button className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium transition-colors shrink-0">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Follow</span>
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="pt-2 border-t border-neutral-w-300">
        <Link
          to="/profile/suggested-followers"
          className="text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          View all suggested followers
        </Link>
      </div>
    </div>
  );
};

export default SuggestedFollowers;

