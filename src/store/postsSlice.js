import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  byId: {},
  allIds: [],
  trendingIds: [],
  searchResults: [],
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 0,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPost: (state, action) => {
      const post = action.payload;
      state.byId[post.id] = post;
      if (!state.allIds.includes(post.id)) {
        state.allIds.unshift(post.id);
      }
    },
    setPosts: (state, action) => {
      const posts = action.payload;
      posts.forEach(post => {
        state.byId[post.id] = post;
        if (!state.allIds.includes(post.id)) {
          state.allIds.push(post.id);
        }
      });
    },
    addNewPost: (state, action) => {
      const post = action.payload;
      state.byId[post.id] = post;
      state.allIds.unshift(post.id);
    },
    updatePost: (state, action) => {
      const { id, ...updates } = action.payload;
      if (state.byId[id]) {
        state.byId[id] = { ...state.byId[id], ...updates };
      }
    },
    likePost: (state, action) => {
      const { id, points } = action.payload;
      if (state.byId[id]) {
        state.byId[id].points = points;
        state.byId[id].isLikedByMe = true;
      }
    },
    setTrendingIds: (state, action) => {
      state.trendingIds = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    incrementPage: (state) => {
      state.currentPage += 1;
    },
    resetPosts: () => initialState,
  },
});

export const {
  setPost,
  setPosts,
  addNewPost,
  updatePost,
  likePost,
  setTrendingIds,
  setSearchResults,
  setIsLoading,
  setError,
  setHasMore,
  setCurrentPage,
  incrementPage,
  resetPosts,
} = postsSlice.actions;

export default postsSlice.reducer;
