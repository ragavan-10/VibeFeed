import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  address: null,
  handle: null,
  profilePicCid: null,
  myPostIds: [],
  myLikedPostIds: [],
  isRegistered: false,
  isConnecting: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAddress: (state, action) => {
      state.address = action.payload;
    },
    setHandle: (state, action) => {
      state.handle = action.payload;
    },
    setProfilePicCid: (state, action) => {
      state.profilePicCid = action.payload;
    },
    setMyPostIds: (state, action) => {
      state.myPostIds = action.payload;
    },
    addMyPostId: (state, action) => {
      if (!state.myPostIds.includes(action.payload)) {
        state.myPostIds.unshift(action.payload);
      }
    },
    setMyLikedPostIds: (state, action) => {
      state.myLikedPostIds = action.payload;
    },
    addMyLikedPostId: (state, action) => {
      if (!state.myLikedPostIds.includes(action.payload)) {
        state.myLikedPostIds.push(action.payload);
      }
    },
    removeMyLikedPostId: (state, action) => {
      state.myLikedPostIds = state.myLikedPostIds.filter(id => id !== action.payload);
    },
    setIsRegistered: (state, action) => {
      state.isRegistered = action.payload;
    },
    setIsConnecting: (state, action) => {
      state.isConnecting = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setUserData: (state, action) => {
      const { address, handle, profilePicCid, myPostIds, myLikedPostIds, isRegistered } = action.payload;
      if (address !== undefined) state.address = address;
      if (handle !== undefined) state.handle = handle;
      if (profilePicCid !== undefined) state.profilePicCid = profilePicCid;
      if (myPostIds !== undefined) state.myPostIds = myPostIds;
      if (myLikedPostIds !== undefined) state.myLikedPostIds = myLikedPostIds;
      if (isRegistered !== undefined) state.isRegistered = isRegistered;
    },
    resetUser: () => initialState,
  },
});

export const {
  setAddress,
  setHandle,
  setProfilePicCid,
  setMyPostIds,
  addMyPostId,
  setMyLikedPostIds,
  addMyLikedPostId,
  removeMyLikedPostId,
  setIsRegistered,
  setIsConnecting,
  setError,
  setUserData,
  resetUser,
} = userSlice.actions;

export default userSlice.reducer;
