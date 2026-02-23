import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface LikeState {
  likedPosts: string[];
  loading: boolean;
  error: string | null;
}

const initialState: LikeState = {
  likedPosts: [],
  loading: false,
  error: null,
};

const likeSlice = createSlice({
  name: 'like',
  initialState,
  reducers: {
    setLikedPosts: (state, action: PayloadAction<string[]>) => {
      state.likedPosts = action.payload;
    },
    addLikedPost: (state, action: PayloadAction<string>) => {
      state.likedPosts.push(action.payload);
    },
    removeLikedPost: (state, action: PayloadAction<string>) => {
      state.likedPosts = state.likedPosts.filter(id => id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setLikedPosts, addLikedPost, removeLikedPost, setLoading, setError } = likeSlice.actions;
export default likeSlice.reducer;
