import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FeedState, FeedPost } from './types';
import type { RootState } from '../../store';

const initialState: FeedState = {
    posts: [],
    loading: false,
    error: null,
    currentPage: 1,
    hasMore: true,
    totalPosts: 0,
};

const feedSlice = createSlice({
    name: 'feed',
    initialState,
    reducers: {
        setFeedPosts: (state, action: PayloadAction<FeedPost[]>) => {
            state.posts = action.payload;
            state.loading = false;
            state.error = null;
        },
        appendFeedPosts: (state, action: PayloadAction<FeedPost[]>) => {
            state.posts = [...state.posts, ...action.payload];
            state.loading = false;
            state.error = null;
        },
        setFeedLoading: (state) => {
            state.loading = true;
            state.error = null;
        },
        setFeedError: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        incrementPage: (state) => {
            state.currentPage += 1;
        },
        setHasMore: (state, action: PayloadAction<boolean>) => {
            state.hasMore = action.payload;
        },
        setTotalPosts: (state, action: PayloadAction<number>) => {
            state.totalPosts = action.payload;
        },
        resetFeed: (state) => {
            state.posts = [];
            state.currentPage = 1;
            state.hasMore = true;
            state.totalPosts = 0;
            state.loading = false;
            state.error = null;
        },
    },
});

export const {
    setFeedPosts,
    appendFeedPosts,
    setFeedLoading,
    setFeedError,
    incrementPage,
    setHasMore,
    setTotalPosts,
    resetFeed,
} = feedSlice.actions;

export const selectFeedPosts = (state: RootState) => state.feed.posts;
export const selectFeedLoading = (state: RootState) => state.feed.loading;
export const selectFeedError = (state: RootState) => state.feed.error;
export const selectCurrentPage = (state: RootState) => state.feed.currentPage;
export const selectHasMore = (state: RootState) => state.feed.hasMore;
export const selectTotalPosts = (state: RootState) => state.feed.totalPosts;

export default feedSlice.reducer;
