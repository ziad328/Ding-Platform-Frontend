import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Comment } from './commentApi';

interface CommentState {
  comments: Record<string, Comment[]>; // postId -> comments
  replies: Record<string, Comment[]>; // commentId -> replies
  loading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: {},
  replies: {},
  loading: false,
  error: null,
};

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    // Add a new comment to a post
    addComment: (state, action: PayloadAction<{ postId: string; comment: Comment }>) => {
      const { postId, comment } = action.payload;
      if (!state.comments[postId]) {
        state.comments[postId] = [];
      }
      state.comments[postId].unshift(comment); // Add to beginning for recent first
    },

    // Add a reply to a comment
    addReply: (state, action: PayloadAction<{ commentId: string; reply: Comment }>) => {
      const { commentId, reply } = action.payload;
      if (!state.replies[commentId]) {
        state.replies[commentId] = [];
      }
      state.replies[commentId].unshift(reply); // Add to beginning for recent first

      // Also update the parent comment's reply count if it exists in comments
      Object.values(state.comments).forEach(postComments => {
        const parentComment = postComments.find(c => c.id === commentId);
        if (parentComment) {
          parentComment.replyCount += 1;
        }
      });
    },

    // Update a comment
    updateComment: (state, action: PayloadAction<{ commentId: string; content: string }>) => {
      const { commentId, content } = action.payload;
      
      // Update in post comments
      Object.values(state.comments).forEach(postComments => {
        const comment = postComments.find(c => c.id === commentId);
        if (comment) {
          comment.content = content;
          comment.updatedAt = new Date().toISOString();
        }
      });

      // Update in replies
      Object.values(state.replies).forEach(replies => {
        const reply = replies.find(r => r.id === commentId);
        if (reply) {
          reply.content = content;
          reply.updatedAt = new Date().toISOString();
        }
      });
    },

    // Remove a comment
    removeComment: (state, action: PayloadAction<{ commentId: string }>) => {
      const { commentId } = action.payload;
      
      // Remove from post comments
      Object.keys(state.comments).forEach(postId => {
        state.comments[postId] = state.comments[postId].filter(c => c.id !== commentId);
      });

      // Remove from replies
      Object.keys(state.replies).forEach(parentCommentId => {
        state.replies[parentCommentId] = state.replies[parentCommentId].filter(r => r.id !== commentId);
      });

      // Remove the entire replies entry if this was a parent comment
      delete state.replies[commentId];
    },

    // Set comments for a post
    setPostComments: (state, action: PayloadAction<{ postId: string; comments: Comment[] }>) => {
      const { postId, comments } = action.payload;
      state.comments[postId] = comments;
    },

    // Set replies for a comment
    setCommentReplies: (state, action: PayloadAction<{ commentId: string; replies: Comment[] }>) => {
      const { commentId, replies } = action.payload;
      state.replies[commentId] = replies;
    },

    // Clear all comments (for logout)
    clearComments: (state) => {
      state.comments = {};
      state.replies = {};
      state.error = null;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addComment,
  addReply,
  updateComment,
  removeComment,
  setPostComments,
  setCommentReplies,
  clearComments,
  setLoading,
  setError,
} = commentSlice.actions;

export default commentSlice.reducer;
