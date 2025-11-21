import { apiSlice } from '../../../ApiSlice';
import type { FollowingPayload } from '../types';

interface FollowingResponse {
  code: number;
  success: boolean;
  message: string;
  data: FollowingPayload;
}

const defaultFollowingPayload: FollowingPayload = {
  data: [],
  count: 0,
};

export const followingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFollowing: builder.query<FollowingPayload, void>({
      query: () => ({
        url: 'social/following/',
        method: 'GET',
      }),
      transformResponse: (response: FollowingResponse) => response?.data ?? defaultFollowingPayload,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ userId }) => ({ type: 'Following' as const, id: userId })),
              { type: 'Following' as const, id: 'LIST' },
            ]
          : [{ type: 'Following' as const, id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFollowingQuery, useLazyGetFollowingQuery } = followingApi;

