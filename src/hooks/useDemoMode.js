import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData, setIsConnecting, addMyPostId, addMyLikedPostId } from '../store/userSlice';
import { setTokenData } from '../store/tokenSlice';
import { setPosts, addNewPost, likePost as likePostAction, setTrendingIds } from '../store/postsSlice';
import { mockPosts, mockUserData, DEMO_MODE } from '../utils/mockData';

export const useDemoMode = () => {
  const dispatch = useDispatch();
  const { address, isRegistered } = useSelector((state) => state.user);
  const { byId, allIds } = useSelector((state) => state.posts);

  const connectWalletDemo = useCallback(async () => {
    if (!DEMO_MODE) return false;

    dispatch(setIsConnecting(true));

    // Simulate wallet connection delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate random address for demo
    const demoAddress = '0x' + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    dispatch(setUserData({
      address: demoAddress,
      isRegistered: false,
    }));

    dispatch(setIsConnecting(false));
    return true;
  }, [dispatch]);

  const registerUserDemo = useCallback(async (handle) => {
    if (!DEMO_MODE) return;

    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    dispatch(setUserData({
      handle,
      isRegistered: true,
      myPostIds: [],
      myLikedPostIds: [2, 5], // Demo user has liked posts 2 and 5
    }));

    // Set initial token data
    dispatch(setTokenData(mockUserData));

    // Load mock posts
    dispatch(setPosts(mockPosts));
    dispatch(setTrendingIds([5, 3, 1]));
  }, [dispatch]);

  const disconnectWalletDemo = useCallback(() => {
    dispatch(setUserData({
      address: null,
      handle: null,
      isRegistered: false,
      myPostIds: [],
      myLikedPostIds: [],
    }));
    dispatch(setTokenData({
      balance: '0',
      stakedAmount: '0',
      pendingRewards: '0',
      unlockTime: 0,
      votingPower: 0,
      isStakedEnough: false,
    }));
  }, [dispatch]);

  const createPostDemo = useCallback(async (cid) => {
    if (!DEMO_MODE) return null;

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newPostId = Math.max(...allIds, 0) + 1;
    const { handle, address: creator } = useSelector((state) => state.user);

    const newPost = {
      id: newPostId,
      creator,
      handle,
      cid,
      points: 0,
      createdAt: Date.now(),
      isLikedByMe: false,
    };

    dispatch(addNewPost(newPost));
    dispatch(addMyPostId(newPostId));

    return newPostId;
  }, [dispatch, allIds]);

  const likePostDemo = useCallback(async (postId) => {
    if (!DEMO_MODE) return;

    await new Promise((resolve) => setTimeout(resolve, 500));

    const post = byId[postId];
    if (post) {
      dispatch(likePostAction({
        id: postId,
        points: post.points + Math.floor(Math.random() * 10) + 1,
      }));
      dispatch(addMyLikedPostId(postId));
    }
  }, [dispatch, byId]);

  const stakeDemo = useCallback(async (amount) => {
    if (!DEMO_MODE) return;

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const currentBalance = parseFloat(mockUserData.balance);
    const currentStaked = parseFloat(mockUserData.stakedAmount);

    dispatch(setTokenData({
      balance: (currentBalance - amount).toString(),
      stakedAmount: (currentStaked + amount).toString(),
      unlockTime: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days lock
    }));
  }, [dispatch]);

  const unstakeDemo = useCallback(async (amount) => {
    if (!DEMO_MODE) return;

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const currentBalance = parseFloat(mockUserData.balance);
    const currentStaked = parseFloat(mockUserData.stakedAmount);

    dispatch(setTokenData({
      balance: (currentBalance + amount).toString(),
      stakedAmount: (currentStaked - amount).toString(),
    }));
  }, [dispatch]);

  const claimRewardsDemo = useCallback(async () => {
    if (!DEMO_MODE) return;

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const currentBalance = parseFloat(mockUserData.balance);
    const rewards = parseFloat(mockUserData.pendingRewards);

    dispatch(setTokenData({
      balance: (currentBalance + rewards).toString(),
      pendingRewards: '0',
    }));
  }, [dispatch]);

  return {
    isDemoMode: DEMO_MODE,
    connectWalletDemo,
    registerUserDemo,
    disconnectWalletDemo,
    createPostDemo,
    likePostDemo,
    stakeDemo,
    unstakeDemo,
    claimRewardsDemo,
  };
};

export default useDemoMode;
