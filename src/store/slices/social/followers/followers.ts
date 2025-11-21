import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import type { Follower } from '../types';
import { followersApi } from './followersApi';

interface FollowersState {
  list: Follower[];
  count: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetchedAt: number | null;
  hasMore: boolean;
  nextOffset: number;
  isFetchingMore: boolean;
}

const initialState: FollowersState = {
  list: [],
  count: 0,
  status: 'idle',
  error: null,
  lastFetchedAt: null,
  hasMore: false,
  nextOffset: 0,
  isFetchingMore: false,
};

const followersSlice = createSlice({
  name: 'followers',
  initialState,
  reducers: {
    clearFollowers: (state) => {
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
      .addMatcher(followersApi.endpoints.getFollowers.matchPending, (state, action) => {
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
      .addMatcher(followersApi.endpoints.getFollowers.matchFulfilled, (state, action) => {
        const arg = action.meta.arg as { limit?: number; offset?: number } | undefined;
        const isInitialLoad = !arg?.offset || arg.offset === 0;
        const newFollowers = action.payload.data;

        // Only replace data if this is the initial load AND the list is empty
        // Otherwise, always append to preserve accumulated data
        if (isInitialLoad && state.list.length === 0) {
          // Replace list on true initial load (empty list)
          state.list = newFollowers;
          state.status = 'succeeded';
          state.isFetchingMore = false;
        } else {
          // Append new items, deduplicate by userId
          const existingIds = new Set(state.list.map((f) => f.userId));
          const uniqueNewFollowers = newFollowers.filter((f) => !existingIds.has(f.userId));
          state.list = [...state.list, ...uniqueNewFollowers];
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
      .addMatcher(followersApi.endpoints.getFollowers.matchRejected, (state, action) => {
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
        state.error = payloadMessage || action.error?.message || 'Unable to load followers';
      });
  },
});

export const { clearFollowers } = followersSlice.actions;

export const selectFollowers = (state: RootState) => state.followers.list;
export const selectFollowersCount = (state: RootState) => state.followers.count;
export const selectFollowersStatus = (state: RootState) => state.followers.status;
export const selectFollowersError = (state: RootState) => state.followers.error;
export const selectFollowersHasMore = (state: RootState) => state.followers.hasMore;
export const selectFollowersNextOffset = (state: RootState) => state.followers.nextOffset;
export const selectFollowersIsFetchingMore = (state: RootState) => state.followers.isFetchingMore;

export default followersSlice.reducer;
