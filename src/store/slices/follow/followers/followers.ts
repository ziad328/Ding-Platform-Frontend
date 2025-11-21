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
}

const initialState: FollowersState = {
  list: [],
  count: 0,
  status: 'idle',
  error: null,
  lastFetchedAt: null,
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(followersApi.endpoints.getFollowers.matchPending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addMatcher(followersApi.endpoints.getFollowers.matchFulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.data;
        state.count = action.payload.count;
        state.lastFetchedAt = Date.now();
      })
      .addMatcher(followersApi.endpoints.getFollowers.matchRejected, (state, action) => {
        state.status = 'failed';
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

export default followersSlice.reducer;
