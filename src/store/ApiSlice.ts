import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logOut, selectCurrentToken } from './slices/auth/auth';
import { reinitializeSocket } from '../services/socketService';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BASE_BACK_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = selectCurrentToken(getState() as any);
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReAuth = async (
  args: string | { url: string; method?: string; body?: any },
  api: any,
  extraOptions: any
) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result?.error?.status === 401) {
    const refreshResult = await baseQuery({
      url: 'auth/refresh',
      method: 'POST',
    }, api, extraOptions);

    if (refreshResult?.data) {
      const user = (api.getState() as { auth: { user: any } }).auth.user;

      const refreshData = refreshResult.data as any;

      if (refreshData.data && refreshData.data.accessToken) {
        const newToken: string = refreshData.data.accessToken;
        api.dispatch(setCredentials({
          accessToken: newToken,
          user: refreshData.data.user || user
        }));
        reinitializeSocket(newToken);
      } else if (refreshData.accessToken) {
        const newToken: string = refreshData.accessToken;
        api.dispatch(setCredentials({
          accessToken: newToken,
          user: refreshData.user || user
        }));
        reinitializeSocket(newToken);
      } else {
        api.dispatch(logOut());
        return result;
      }

      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logOut());
    }
  }

  return result;
};

const tagTypes = [
  'Followers',
  'Following',
  'Friends',
  'FriendSuggestions',
  'FollowSuggestions',
  'FriendRequests',
  'SocialStats',
  'Profile',
  'Rooms',
  'Messages',
] as const;

export const apiSlice = createApi({
  baseQuery: baseQueryWithReAuth,
  tagTypes,
  endpoints: () => ({}),
});
