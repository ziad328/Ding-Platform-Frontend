import { apiSlice } from '../../../../ApiSlice';
import type { SuggestionsPayload, SuggestionsQueryParams } from '../types';

interface SuggestionsResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    data: SuggestionsPayload['data'];
    meta: {
      limit: number;
      offset: number;
      total: number;
      hasMore: boolean;
      nextOffset: number | null;
    };
  };
}

export const followSuggestionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFollowSuggestions: builder.query<SuggestionsPayload, SuggestionsQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        const queryString = queryParams.toString();
        return {
          url: `social/recommendations/follow${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      transformResponse: (response: SuggestionsResponse) => {
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
              ...result.data.map(({ userId }) => ({ type: 'FollowSuggestions' as const, id: userId })),
              { type: 'FollowSuggestions' as const, id: 'LIST' },
            ]
          : [{ type: 'FollowSuggestions' as const, id: 'LIST' }],
    }),
    followUser: builder.mutation<{ message?: string }, string>({
      query: (userId) => ({
        url: `social/follow/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: 'FollowSuggestions', id: userId },
        { type: 'FollowSuggestions', id: 'LIST' },
        { type: 'Following', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFollowSuggestionsQuery, useLazyGetFollowSuggestionsQuery, useFollowUserMutation } = followSuggestionsApi;

