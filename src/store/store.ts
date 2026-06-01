import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth/auth';
import userReducers from './slices/user/user';
import profileReducer from './slices/profile/profile';
import sessionReducer from './slices/session/session';
import followersReducer from './slices/social/followers/followers';
import followingReducer from './slices/social/following/following';
import friendsReducer from './slices/social/friends/friends';
import friendSuggestionsReducer from './slices/social/suggestions/friend/friendSuggestions';
import followSuggestionsReducer from './slices/social/suggestions/follow/followSuggestions';
import feedReducer from './slices/feed/feed';
import commentReducer from './slices/comment/commentSlice';
import likeReducer from './slices/like/likeSlice';
import { chatReducer } from './slices/chat';
import themeReducer from './slices/theme/themeSlice';
import { apiSlice } from './ApiSlice';
import { noroChatApi } from './noroChatApi';
import noroChatReducer from './slices/noroChat/chatSlice';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import searchReducer from './slices/search/searchSlice';

const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'user'],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    user: userReducers,
    profile: profileReducer,
    session: sessionReducer,
    followers: followersReducer,
    following: followingReducer,
    friends: friendsReducer,
    friendSuggestions: friendSuggestionsReducer,
    followSuggestions: followSuggestionsReducer,
    feed: feedReducer,
    comments: commentReducer,
    like: likeReducer,
    chat: chatReducer,
    search: searchReducer,
    theme: themeReducer,
    noroChat: noroChatReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [noroChatApi.reducerPath]: noroChatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore actions related to redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware).concat(noroChatApi.middleware),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;