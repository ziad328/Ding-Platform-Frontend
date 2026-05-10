import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SearchResult {
  id: string;
  name?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  content?: string;
  authorId?: string;
  authorName?: string;
  createdAt?: string;
}

interface SearchState {
  query: string;
  results: {
    users: SearchResult[];
    posts: SearchResult[];
  };
  total: number;
  hasMore: boolean;
  page: number;
  loading: boolean;
  error: string | null;
  type: 'all' | 'users' | 'posts';
  sortBy: 'relevance' | 'latest';
}

const initialState: SearchState = {
  query: '',
  results: {
    users: [],
    posts: [],
  },
  total: 0,
  hasMore: false,
  page: 1,
  loading: false,
  error: null,
  type: 'all',
  sortBy: 'relevance',
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
      state.page = 1;
      state.results = { users: [], posts: [] };
      state.total = 0;
      state.hasMore = false;
    },
    setSearchType: (state, action: PayloadAction<'all' | 'users' | 'posts'>) => {
      state.type = action.payload;
      state.page = 1;
      state.results = { users: [], posts: [] };
      state.total = 0;
      state.hasMore = false;
    },
    setSortBy: (state, action: PayloadAction<'relevance' | 'latest'>) => {
      state.sortBy = action.payload;
      state.page = 1;
      state.results = { users: [], posts: [] };
      state.total = 0;
      state.hasMore = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<{
      users: SearchResult[];
      posts: SearchResult[];
      total: number;
      hasMore: boolean;
      page: number;
    }>) => {
      const { users, posts, total, hasMore, page } = action.payload;
      
      if (page === 1) {
        state.results = { users, posts };
      } else {
        state.results.users.push(...users);
        state.results.posts.push(...posts);
      }
      
      state.total = total;
      state.hasMore = hasMore;
      state.page = page;
      state.loading = false;
      state.error = null;
    },
    appendSearchResults: (state, action: PayloadAction<{
      users: SearchResult[];
      posts: SearchResult[];
      hasMore: boolean;
    }>) => {
      const { users, posts, hasMore } = action.payload;
      state.results.users.push(...users);
      state.results.posts.push(...posts);
      state.hasMore = hasMore;
      state.page += 1;
      state.loading = false;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearSearch: (state) => {
      state.query = '';
      state.results = { users: [], posts: [] };
      state.total = 0;
      state.hasMore = false;
      state.page = 1;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setQuery,
  setSearchType,
  setSortBy,
  setLoading,
  setSearchResults,
  appendSearchResults,
  setError,
  clearSearch,
} = searchSlice.actions;

export default searchSlice.reducer;
