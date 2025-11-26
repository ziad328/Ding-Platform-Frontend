import { apiSlice } from '../../../ApiSlice';
import type { SocialStats, SocialStatsResponse } from '../types';

export const socialStatsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSocialStats: builder.query<SocialStats, void>({
      query: () => ({
        url: 'social/stats',
        method: 'GET',
      }),
      transformResponse: (response: SocialStatsResponse) => response.data,
      providesTags: () => [{ type: 'SocialStats', id: 'STATS' }],
    }),
  }),
});

export const { useGetSocialStatsQuery } = socialStatsApi;

