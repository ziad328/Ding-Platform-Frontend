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

export const friendSuggestionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFriendSuggestions: builder.query<SuggestionsPayload, void>({
      query: () => ({
        url: 'social/recommendations/friends',
        method: 'GET',
      }),
      transformResponse: (response: SuggestionsResponse) => response?.data ?? defaultSuggestionsPayload,
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

