import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import type { Following } from '../types';
import { followingApi } from './followingApi';

interface FollowingState {
  list: Following[];
  count: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetchedAt: number | null;
  hasMore: boolean;
  nextOffset: number;
  isFetchingMore: boolean;
}

const initialState: FollowingState = {
  list: [],
  count: 0,
  status: 'idle',
  error: null,
  lastFetchedAt: null,
  hasMore: false,
  nextOffset: 0,
  isFetchingMore: false,
};

const followingSlice = createSlice({
  name: 'following',
  initialState,
  reducers: {
    clearFollowing: (state) => {
      state.list = [];
      state.count = 0;
      state.status = 'idle';
      state.error = null;
      state.lastFetchedAt = null;
      state.hasMore = false;
      state.nextOffset = 0;
      state.isFetchingMore = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(followingApi.endpoints.getFollowing.matchPending, (state, action) => {
        const arg = action.meta.arg as { limit?: number; offset?: number } | undefined;
        const isInitialLoad = !arg?.offset || arg.offset === 0;
        if (isInitialLoad) {
          state.status = 'loading';
          state.isFetchingMore = false;
        } else {
          state.isFetchingMore = true;
        }
        state.error = null;
      })
      .addMatcher(followingApi.endpoints.getFollowing.matchFulfilled, (state, action) => {
        const arg = action.meta.arg as { limit?: number; offset?: number } | undefined;
        const isInitialLoad = !arg?.offset || arg.offset === 0;
        const newFollowing = action.payload.data;

        // Only replace data if this is the initial load AND the list is empty
        // Otherwise, always append to preserve accumulated data
        if (isInitialLoad && state.list.length === 0) {
          // Replace list on true initial load (empty list)
          state.list = newFollowing;
          state.status = 'succeeded';
          state.isFetchingMore = false;
        } else {
          // Append new items, deduplicate by userId
          const existingIds = new Set(state.list.map((f) => f.userId));
          const uniqueNewFollowing = newFollowing.filter((f) => !existingIds.has(f.userId));
          state.list = [...state.list, ...uniqueNewFollowing];
          state.isFetchingMore = false;
          // Update status if it was loading
          if (state.status === 'loading') {
            state.status = 'succeeded';
          }
        }

        state.count = action.payload.count;
        state.hasMore = action.payload.hasMore ?? false;
        // Use nextOffset from backend meta, fallback to 0 if null
        state.nextOffset = action.payload.nextOffset ?? 0;
        state.lastFetchedAt = Date.now();
      })
      .addMatcher(followingApi.endpoints.getFollowing.matchRejected, (state, action) => {
        const arg = action.meta.arg as { limit?: number; offset?: number } | undefined;
        const isInitialLoad = !arg?.offset || arg.offset === 0;
        if (isInitialLoad) {
          state.status = 'failed';
        } else {
          state.isFetchingMore = false;
        }
        let payloadMessage: string | null = null;
        if (typeof action.payload === 'string') {
          payloadMessage = action.payload;
        } else if (action.payload && typeof action.payload === 'object') {
          const payloadObject = action.payload as { data?: { message?: string }; error?: string };
          payloadMessage = payloadObject.data?.message ?? payloadObject.error ?? null;
        }
        state.error = payloadMessage || action.error?.message || 'Unable to load following';
      });
  },
});

export const { clearFollowing } = followingSlice.actions;

export const selectFollowing = (state: RootState) => state.following.list;
export const selectFollowingCount = (state: RootState) => state.following.count;
export const selectFollowingStatus = (state: RootState) => state.following.status;
export const selectFollowingError = (state: RootState) => state.following.error;
export const selectFollowingHasMore = (state: RootState) => state.following.hasMore;
export const selectFollowingNextOffset = (state: RootState) => state.following.nextOffset;
export const selectFollowingIsFetchingMore = (state: RootState) => state.following.isFetchingMore;

export default followingSlice.reducer;

