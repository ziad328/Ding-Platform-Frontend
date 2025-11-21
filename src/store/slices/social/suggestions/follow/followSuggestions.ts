import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../../../store';
import type { SuggestedPerson } from '../types';
import { followSuggestionsApi } from './followSuggestionsApi';

interface FollowSuggestionsState {
  list: SuggestedPerson[];
  count: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetchedAt: number | null;
  hasMore: boolean;
  nextOffset: number;
  isFetchingMore: boolean;
}

const initialState: FollowSuggestionsState = {
  list: [],
  count: 0,
  status: 'idle',
  error: null,
  lastFetchedAt: null,
  hasMore: false,
  nextOffset: 0,
  isFetchingMore: false,
};

const followSuggestionsSlice = createSlice({
  name: 'followSuggestions',
  initialState,
  reducers: {
    clearFollowSuggestions: (state) => {
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
      .addMatcher(followSuggestionsApi.endpoints.getFollowSuggestions.matchPending, (state, action) => {
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
      .addMatcher(followSuggestionsApi.endpoints.getFollowSuggestions.matchFulfilled, (state, action) => {
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
      .addMatcher(followSuggestionsApi.endpoints.getFollowSuggestions.matchRejected, (state, action) => {
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
        state.error = payloadMessage || action.error?.message || 'Unable to load follow suggestions';
      });
  },
});

export const { clearFollowSuggestions } = followSuggestionsSlice.actions;

export const selectFollowSuggestions = (state: RootState) => state.followSuggestions.list;
export const selectFollowSuggestionsCount = (state: RootState) => state.followSuggestions.count;
export const selectFollowSuggestionsStatus = (state: RootState) => state.followSuggestions.status;
export const selectFollowSuggestionsError = (state: RootState) => state.followSuggestions.error;
export const selectFollowSuggestionsHasMore = (state: RootState) => state.followSuggestions.hasMore;
export const selectFollowSuggestionsNextOffset = (state: RootState) => state.followSuggestions.nextOffset;
export const selectFollowSuggestionsIsFetchingMore = (state: RootState) => state.followSuggestions.isFetchingMore;

export default followSuggestionsSlice.reducer;

