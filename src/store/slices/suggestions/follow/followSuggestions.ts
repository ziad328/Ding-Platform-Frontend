import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import type { SuggestedPerson } from '../types';
import { followSuggestionsApi } from './followSuggestionsApi';

interface FollowSuggestionsState {
  list: SuggestedPerson[];
  count: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetchedAt: number | null;
}

const initialState: FollowSuggestionsState = {
  list: [],
  count: 0,
  status: 'idle',
  error: null,
  lastFetchedAt: null,
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(followSuggestionsApi.endpoints.getFollowSuggestions.matchPending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addMatcher(followSuggestionsApi.endpoints.getFollowSuggestions.matchFulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.data;
        state.count = action.payload.count;
        state.lastFetchedAt = Date.now();
      })
      .addMatcher(followSuggestionsApi.endpoints.getFollowSuggestions.matchRejected, (state, action) => {
        state.status = 'failed';
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

export default followSuggestionsSlice.reducer;

