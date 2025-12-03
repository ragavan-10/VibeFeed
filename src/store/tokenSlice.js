import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  balance: '0',
  stakedAmount: '0',
  unlockTime: 0,
  timeUntilUnlock: '0',
  pendingRewards: '0',
  votingPower: 0,
  isStakedEnough: false,
  rewardsByPost: {},
  rewardsByLike: {},
  totalRevenue: '0',
  isLoading: false,
  error: null,
};

const MIN_STAKE_AMOUNT = 1000;

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    setBalance: (state, action) => {
      state.balance = action.payload;
    },
    setStakedAmount: (state, action) => {
      state.stakedAmount = action.payload;
      state.isStakedEnough = parseFloat(action.payload) >= MIN_STAKE_AMOUNT;
      state.votingPower = Math.floor(parseFloat(action.payload) / 100);
    },
    setUnlockTime: (state, action) => {
      state.unlockTime = action.payload;
    },
    setTimeUntilUnlock: (state, action) => {
      state.timeUntilUnlock = action.payload;
    },
    setPendingRewards: (state, action) => {
      state.pendingRewards = action.payload;
    },
    setVotingPower: (state, action) => {
      state.votingPower = action.payload;
    },
    setRewardsByPost: (state, action) => {
      state.rewardsByPost = action.payload;
    },
    setRewardsByLike: (state, action) => {
      state.rewardsByLike = action.payload;
    },
    setTotalRevenue: (state, action) => {
      state.totalRevenue = action.payload;
    },
    setTokenData: (state, action) => {
      const data = action.payload;
      if (data.balance !== undefined) state.balance = data.balance;
      if (data.stakedAmount !== undefined) {
        state.stakedAmount = data.stakedAmount;
        state.isStakedEnough = parseFloat(data.stakedAmount) >= MIN_STAKE_AMOUNT;
        state.votingPower = Math.floor(parseFloat(data.stakedAmount) / 100);
      }
      if (data.unlockTime !== undefined) state.unlockTime = data.unlockTime;
      if (data.pendingRewards !== undefined) state.pendingRewards = data.pendingRewards;
      if (data.totalRevenue !== undefined) state.totalRevenue = data.totalRevenue;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetToken: () => initialState,
  },
});

export const {
  setBalance,
  setStakedAmount,
  setUnlockTime,
  setTimeUntilUnlock,
  setPendingRewards,
  setVotingPower,
  setRewardsByPost,
  setRewardsByLike,
  setTotalRevenue,
  setTokenData,
  setIsLoading,
  setError,
  resetToken,
} = tokenSlice.actions;

export default tokenSlice.reducer;
