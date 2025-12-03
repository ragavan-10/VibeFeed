import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import postsReducer from './postsSlice';
import tokenReducer from './tokenSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postsReducer,
    token: tokenReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['user/setProvider'],
        ignoredPaths: ['user.provider'],
      },
    }),
});

export default store;
