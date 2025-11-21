import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../../../store';
import type { SuggestedPerson } from '../types';
import { friendSuggestionsApi } from './friendSuggestionsApi';

interface FriendSuggestionsState {
  list: SuggestedPerson[];
  count: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetchedAt: number | null;
  hasMore: boolean;
  nextOffset: number;
  isFetchingMore: boolean;
}

const initialState: FriendSuggestionsState = {
  list: [],
  count: 0,
  status: 'idle',
  error: null,
  lastFetchedAt: null,
  hasMore: false,
  nextOffset: 0,
  isFetchingMore: false,
};

const friendSuggestionsSlice = createSlice({
  name: 'friendSuggestions',
  initialState,
  reducers: {
    clearFriendSuggestions: (state) => {
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
      .addMatcher(friendSuggestionsApi.endpoints.getFriendSuggestions.matchPending, (state, action) => {
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
      .addMatcher(friendSuggestionsApi.endpoints.getFriendSuggestions.matchFulfilled, (state, action) => {
        const arg = action.meta.arg as { limit?: number; offset?: number } | undefined;
        const isInitialLoad = !arg?.offset || arg.offset === 0;
        const newSuggestions = action.payload.data;

        // Only replace data if this is the initial load AND the list is empty
        // Otherwise, always append to preserve accumulated data
        if (isInitialLoad && state.list.length === 0) {
          // Replace list on true initial load (empty list)
          state.list = newSuggestions;
          state.status = 'succeeded';
          state.isFetchingMore = false;
        } else {
          // Append new items, deduplicate by userId
          const existingIds = new Set(state.list.map((s) => s.userId));
          const uniqueNewSuggestions = newSuggestions.filter((s) => !existingIds.has(s.userId));
          state.list = [...state.list, ...uniqueNewSuggestions];
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
      .addMatcher(friendSuggestionsApi.endpoints.getFriendSuggestions.matchRejected, (state, action) => {
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
        state.error = payloadMessage || action.error?.message || 'Unable to load friend suggestions';
      });
  },
});

export const { clearFriendSuggestions } = friendSuggestionsSlice.actions;

export const selectFriendSuggestions = (state: RootState) => state.friendSuggestions.list;
export const selectFriendSuggestionsCount = (state: RootState) => state.friendSuggestions.count;
export const selectFriendSuggestionsStatus = (state: RootState) => state.friendSuggestions.status;
export const selectFriendSuggestionsError = (state: RootState) => state.friendSuggestions.error;
export const selectFriendSuggestionsHasMore = (state: RootState) => state.friendSuggestions.hasMore;
export const selectFriendSuggestionsNextOffset = (state: RootState) => state.friendSuggestions.nextOffset;
export const selectFriendSuggestionsIsFetchingMore = (state: RootState) => state.friendSuggestions.isFetchingMore;

export default friendSuggestionsSlice.reducer;

