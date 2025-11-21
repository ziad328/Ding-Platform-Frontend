import { apiSlice } from '../../../ApiSlice';
import type { FollowersPayload } from '../types';

interface FollowersResponse {
  code: number;
  success: boolean;
  message: string;
  data: FollowersPayload;
}

const defaultFollowersPayload: FollowersPayload = {
  data: [],
  count: 0,
};

export const followersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFollowers: builder.query<FollowersPayload, void>({
      query: () => ({
        url: 'social/followers/',
        method: 'GET',
      }),
      transformResponse: (response: FollowersResponse) => response?.data ?? defaultFollowersPayload,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ userId }) => ({ type: 'Followers' as const, id: userId })),
              { type: 'Followers' as const, id: 'LIST' },
            ]
          : [{ type: 'Followers' as const, id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFollowersQuery, useLazyGetFollowersQuery } = followersApi;

