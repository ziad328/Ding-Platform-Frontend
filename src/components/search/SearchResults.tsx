import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import UserCard from './UserCard';
import PostCard from './PostCard';

interface SearchResultsProps {
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  onLoadMore, 
  hasMore, 
  loading 
}) => {
  const { results, total, query } = useSelector((state: RootState) => state.search);

  if (!query) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Enter a search term to find users and posts</p>
      </div>
    );
  }

  if (results.users.length === 0 && results.posts.length === 0 && !loading) {
    return (
      <div className="text-center py-8">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-500">Try searching for different keywords</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Found {total} results for "{query}"
        </p>
      </div>

      {/* Users section */}
      {results.users.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </div>
      )}

      {/* Posts section */}
      {results.posts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Posts</h3>
          <div className="space-y-4">
            {results.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* Load more button */}
      {hasMore && (
        <div className="text-center py-4">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span className="text-gray-600">Loading more results...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
