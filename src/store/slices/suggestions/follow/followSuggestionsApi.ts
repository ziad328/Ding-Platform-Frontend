import { apiSlice } from '../../../ApiSlice';
import type { SuggestionsPayload } from '../types';

interface SuggestionsResponse {
  code: number;
  success: boolean;
  message: string;
  data: SuggestionsPayload;
}

const defaultSuggestionsPayload: SuggestionsPayload = {
  data: [],
  count: 0,
};

export const followSuggestionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFollowSuggestions: builder.query<SuggestionsPayload, void>({
      query: () => ({
        url: 'social/recommendations/follow',
        method: 'GET',
      }),
      transformResponse: (response: SuggestionsResponse) => response?.data ?? defaultSuggestionsPayload,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ userId }) => ({ type: 'FollowSuggestions' as const, id: userId })),
              { type: 'FollowSuggestions' as const, id: 'LIST' },
            ]
          : [{ type: 'FollowSuggestions' as const, id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFollowSuggestionsQuery, useLazyGetFollowSuggestionsQuery } = followSuggestionsApi;

