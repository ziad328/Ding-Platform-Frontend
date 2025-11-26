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

export const friendSuggestionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFriendSuggestions: builder.query<SuggestionsPayload, SuggestionsQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        const queryString = queryParams.toString();
        return {
          url: `social/recommendations/friends${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      transformResponse: (response: SuggestionsResponse) => {
        const payload = response?.data ?? { data: [], meta: null };
        const meta = payload.meta;
        const normalizedData = (payload.data ?? []).map((item) => ({
          ...item,
          name: item.name ?? item.user?.name ?? '',
          username: item.username ?? item.user?.username ?? '',
          headline: item.headline ?? item.user?.headline ?? '',
        }));

        if (!meta) {
          return {
            data: normalizedData,
            count: 0,
            hasMore: false,
            total: 0,
            nextOffset: null,
          };
        }

        return {
          data: normalizedData,
          count: meta.total,
          hasMore: meta.hasMore,
          total: meta.total,
          nextOffset: meta.nextOffset,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ userId }) => ({ type: 'FriendSuggestions' as const, id: userId })),
              { type: 'FriendSuggestions' as const, id: 'LIST' },
            ]
          : [{ type: 'FriendSuggestions' as const, id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFriendSuggestionsQuery, useLazyGetFriendSuggestionsQuery } = friendSuggestionsApi;

