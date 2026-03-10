import { apiSlice } from '../../ApiSlice';

export interface CommentAuthor {
  id: string;
  name?: string | null;
  image?: string | null;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  parentCommentId?: string | null;
  replyCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
  liked?: boolean;
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface GetPostCommentsResponse {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetCommentRepliesResponse {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const commentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create a comment on a post
    createComment: builder.mutation<Comment, { postId: string; data: CreateCommentRequest }>({
      query: ({ postId, data }) => ({
        url: `comments/posts/${postId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Posts', 'Comments'],
    }),

    // Get comments for a post
    getPostComments: builder.query<
      GetPostCommentsResponse,
      { postId: string; page?: number; limit?: number; sort?: 'top' | 'recent' }
    >({
      query: ({ postId, page = 1, limit = 20, sort = 'top' }) => ({
        url: `comments/posts/${postId}`,
        params: { page, limit, sort },
      }),
      providesTags: ['Comments'],
    }),

    // Get replies for a comment
    getCommentReplies: builder.query<
      GetCommentRepliesResponse,
      { commentId: string; page?: number; limit?: number }
    >({
      query: ({ commentId, page = 1, limit = 10 }) => ({
        url: `comments/${commentId}/replies`,
        params: { page, limit },
      }),
      providesTags: ['Comments'],
    }),

    // Update a comment
    updateComment: builder.mutation<Comment, { commentId: string; data: UpdateCommentRequest }>({
      query: ({ commentId, data }) => ({
        url: `comments/${commentId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Comments'],
    }),

    // Delete a comment
    deleteComment: builder.mutation<void, { commentId: string }>({
      query: ({ commentId }) => ({
        url: `comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Comments'],
    }),

    // Like a comment
    likeComment: builder.mutation<{ success: boolean; likesCount: number }, { commentId: string }>({
      query: ({ commentId }) => ({
        url: `likes/comments/${commentId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Comments'],
    }),

    // Unlike a comment
    unlikeComment: builder.mutation<{ success: boolean; likesCount: number }, { commentId: string }>({
      query: ({ commentId }) => ({
        url: `likes/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Comments'],
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useGetPostCommentsQuery,
  useGetCommentRepliesQuery,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
} = commentApi;
