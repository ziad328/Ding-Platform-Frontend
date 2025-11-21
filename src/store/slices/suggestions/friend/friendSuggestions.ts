import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import type { SuggestedPerson } from '../types';
import { friendSuggestionsApi } from './friendSuggestionsApi';

interface FriendSuggestionsState {
  list: SuggestedPerson[];
  count: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetchedAt: number | null;
}

const initialState: FriendSuggestionsState = {
  list: [],
  count: 0,
  status: 'idle',
  error: null,
  lastFetchedAt: null,
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(friendSuggestionsApi.endpoints.getFriendSuggestions.matchPending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addMatcher(friendSuggestionsApi.endpoints.getFriendSuggestions.matchFulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.data;
        state.count = action.payload.count;
        state.lastFetchedAt = Date.now();
      })
      .addMatcher(friendSuggestionsApi.endpoints.getFriendSuggestions.matchRejected, (state, action) => {
        state.status = 'failed';
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

export default friendSuggestionsSlice.reducer;

