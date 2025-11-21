import { apiSlice } from '../../../ApiSlice';
import type { FollowingPayload, FollowingQueryParams } from '../types';

interface FollowingResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    data: FollowingPayload['data'];
    meta: {
      limit: number;
      offset: number;
      total: number;
      hasMore: boolean;
      nextOffset: number | null;
    };
  };
}

const defaultFollowingPayload: FollowingPayload = {
  data: [],
  count: 0,
  hasMore: false,
  total: 0,
  nextOffset: null,
};

export const followingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFollowing: builder.query<FollowingPayload, FollowingQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        const queryString = queryParams.toString();
        return {
          url: `social/following${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      transformResponse: (response: FollowingResponse, _meta, arg) => {
        const payload = response?.data ?? { data: [], meta: null };
        const meta = payload.meta;
        
        if (!meta) {
          return {
            data: payload.data,
            count: 0,
            hasMore: false,
            total: 0,
            nextOffset: null,
          };
        }
        
        return {
          data: payload.data,
          count: meta.total,
          hasMore: meta.hasMore,
          total: meta.total,
          nextOffset: meta.nextOffset,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ userId }) => ({ type: 'Following' as const, id: userId })),
              { type: 'Following' as const, id: 'LIST' },
            ]
          : [{ type: 'Following' as const, id: 'LIST' }],
    }),
    deleteFollowing: builder.mutation<void, string>({
      query: (userId: string) => ({
        url: `social/follow/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: 'Following', id: userId },
        { type: 'Following', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFollowingQuery, useLazyGetFollowingQuery, useDeleteFollowingMutation } = followingApi;

