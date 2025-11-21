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
}

const initialState: FollowingState = {
  list: [],
  count: 0,
  status: 'idle',
  error: null,
  lastFetchedAt: null,
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(followingApi.endpoints.getFollowing.matchPending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addMatcher(followingApi.endpoints.getFollowing.matchFulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.data;
        state.count = action.payload.count;
        state.lastFetchedAt = Date.now();
      })
      .addMatcher(followingApi.endpoints.getFollowing.matchRejected, (state, action) => {
        state.status = 'failed';
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

export default followingSlice.reducer;

