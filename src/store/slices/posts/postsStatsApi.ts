import { apiSlice } from '../../ApiSlice';
import type { PostsCountResponse } from './types';

export const postsStatsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPostsCount: builder.query<PostsCountResponse, string | void>({
      query: (profileId) => ({
        url: profileId ? `posts/count/${profileId}` : 'posts/count',
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetPostsCountQuery } = postsStatsApi;


