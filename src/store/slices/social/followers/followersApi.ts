import { apiSlice } from '../../../ApiSlice';
import type { FollowersPayload, FollowersQueryParams } from '../types';

interface FollowersResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    data: FollowersPayload['data'];
    meta: {
      limit: number;
      offset: number;
      total: number;
      hasMore: boolean;
      nextOffset: number | null;
    };
  };
}

export const followersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFollowers: builder.query<FollowersPayload, FollowersQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        const queryString = queryParams.toString();
        return {
          url: `social/followers/${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      transformResponse: (response: FollowersResponse, _meta, arg) => {
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
              ...result.data.map(({ userId }) => ({ type: 'Followers' as const, id: userId })),
              { type: 'Followers' as const, id: 'LIST' },
            ]
          : [{ type: 'Followers' as const, id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFollowersQuery, useLazyGetFollowersQuery } = followersApi;

