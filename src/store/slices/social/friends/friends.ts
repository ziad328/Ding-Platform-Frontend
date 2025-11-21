import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import type { Friend } from '../types';
import { friendsApi } from './friendsApi';

interface FriendsState {
  list: Friend[];
  count: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetchedAt: number | null;
  hasMore: boolean;
  nextOffset: number;
  isFetchingMore: boolean;
}

const initialState: FriendsState = {
  list: [],
  count: 0,
  status: 'idle',
  error: null,
  lastFetchedAt: null,
  hasMore: false,
  nextOffset: 0,
  isFetchingMore: false,
};

const friendsSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    clearFriends: (state) => {
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
      .addMatcher(friendsApi.endpoints.getFriends.matchPending, (state, action) => {
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
      .addMatcher(friendsApi.endpoints.getFriends.matchFulfilled, (state, action) => {
        const arg = action.meta.arg as { limit?: number; offset?: number } | undefined;
        const isInitialLoad = !arg?.offset || arg.offset === 0;
        const newFriends = action.payload.data;

        // Only replace data if this is the initial load AND the list is empty
        // Otherwise, always append to preserve accumulated data
        if (isInitialLoad && state.list.length === 0) {
          // Replace list on true initial load (empty list)
          state.list = newFriends;
          state.status = 'succeeded';
          state.isFetchingMore = false;
        } else {
          // Append new items, deduplicate by userId
          const existingIds = new Set(state.list.map((f) => f.userId));
          const uniqueNewFriends = newFriends.filter((f) => !existingIds.has(f.userId));
          state.list = [...state.list, ...uniqueNewFriends];
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
      .addMatcher(friendsApi.endpoints.getFriends.matchRejected, (state, action) => {
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
        state.error = payloadMessage || action.error?.message || 'Unable to load friends';
      });
  },
});

export const { clearFriends } = friendsSlice.actions;

export const selectFriends = (state: RootState) => state.friends.list;
export const selectFriendsCount = (state: RootState) => state.friends.count;
export const selectFriendsStatus = (state: RootState) => state.friends.status;
export const selectFriendsError = (state: RootState) => state.friends.error;
export const selectFriendsHasMore = (state: RootState) => state.friends.hasMore;
export const selectFriendsNextOffset = (state: RootState) => state.friends.nextOffset;
export const selectFriendsIsFetchingMore = (state: RootState) => state.friends.isFetchingMore;

export default friendsSlice.reducer;

