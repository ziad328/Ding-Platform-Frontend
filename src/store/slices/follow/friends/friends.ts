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
}

const initialState: FriendsState = {
  list: [],
  count: 0,
  status: 'idle',
  error: null,
  lastFetchedAt: null,
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(friendsApi.endpoints.getFriends.matchPending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addMatcher(friendsApi.endpoints.getFriends.matchFulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.data;
        state.count = action.payload.count;
        state.lastFetchedAt = Date.now();
      })
      .addMatcher(friendsApi.endpoints.getFriends.matchRejected, (state, action) => {
        state.status = 'failed';
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

export default friendsSlice.reducer;

