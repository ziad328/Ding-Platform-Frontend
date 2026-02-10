import { apiSlice } from '../../ApiSlice';

export interface CreatePostResponse {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  privacy: string;
  createdAt: string;
  updatedAt: string;
  images?: string[];
  videos?: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
}

export const postsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPost: builder.mutation<CreatePostResponse, FormData>({
      query: (formData) => ({
        url: 'posts/create',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['Posts'],
    }),
    getPosts: builder.query<CreatePostResponse[], { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => ({
        url: `posts/?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['Posts'],
    }),
  }),
});

export const { useCreatePostMutation, useGetPostsQuery } = postsApi;
