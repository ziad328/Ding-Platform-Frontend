import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { setSearchResults, setLoading, appendSearchResults, setQuery } from '../store/slices/search/searchSlice';
import { useSearchQuery } from '../store/ApiSlice';
import type { RootState } from '../store/store';
import SearchResults from '../components/search/SearchResults';

const SearchPage: React.FC = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasMore, page, loading } = useSelector((state: RootState) => state.search);
  
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') as 'all' | 'users' | 'posts' || 'all';
  const sortBy = searchParams.get('sortBy') as 'relevance' | 'latest' || 'relevance';

  // Update Redux state with query from URL params
  useEffect(() => {
    if (query) {
      dispatch(setQuery(query));
    }
  }, [query, dispatch]);

  const { data, isLoading, error } = useSearchQuery({
    q: query,
    type,
    sortBy,
    limit: 10,
    page,
  }, {
    skip: !query || query.length < 1,
  });

  useEffect(() => {
    if (data) {
      const searchData = data.data || {};
      if (page === 1) {
        dispatch(setSearchResults({
          users: searchData.users || [],
          posts: searchData.posts || [],
          total: searchData.total || 0,
          hasMore: searchData.hasMore || false,
          page: searchData.page || 1,
        }));
      } else {
        dispatch(appendSearchResults({
          users: searchData.users || [],
          posts: searchData.posts || [],
          hasMore: searchData.hasMore || false,
        }));
      }
    }
  }, [data, dispatch, page]);

  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);

  useEffect(() => {
    if (error) {
      console.error('Search error:', error);
    }
  }, [error]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      // For pagination, we'll need to implement a different approach
      // For now, just increment page and let the query refetch
      const nextPage = page + 1;
      const params = new URLSearchParams(searchParams);
      params.set('page', nextPage.toString());
      setSearchParams(params);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search</h1>
          <p className="text-gray-600">Find users and posts across the platform</p>
        </div>

        {/* Search Results */}
        <div className="mb-8">
          <SearchResults 
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
