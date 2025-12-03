import { useCallback } from 'react';
import { parseEther, formatEther } from 'ethers';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData, addMyPostId, addMyLikedPostId } from '../store/userSlice';
import { setTokenData } from '../store/tokenSlice';
import { addNewPost, likePost as likePostAction, setPosts, setTrendingIds } from '../store/postsSlice';

export const useContract = (tokenContract, contentContract) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  // User Registration
  const registerUser = useCallback(async (handle) => {
    if (!contentContract) throw new Error('Contract not initialized');
    
    const tx = await contentContract.registerUser(handle);
    await tx.wait();
    
    dispatch(setUserData({
      handle,
      isRegistered: true,
    }));
    
    return tx;
  }, [contentContract, dispatch]);

  const updateHandle = useCallback(async (newHandle) => {
    if (!contentContract) throw new Error('Contract not initialized');
    
    const tx = await contentContract.updateHandle(newHandle);
    await tx.wait();
    
    dispatch(setUserData({ handle: newHandle }));
    
    return tx;
  }, [contentContract, dispatch]);

  // Posts
  const createPost = useCallback(async (cid) => {
    if (!contentContract) throw new Error('Contract not initialized');
    
    const tx = await contentContract.createPost(cid);
    const receipt = await tx.wait();
    
    // Get the post ID from the event
    const event = receipt.logs.find(log => {
      try {
        const parsed = contentContract.interface.parseLog(log);
        return parsed.name === 'PostCreated';
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = contentContract.interface.parseLog(event);
      const postId = Number(parsed.args.postId);
      dispatch(addMyPostId(postId));
      return postId;
    }
    
    return null;
  }, [contentContract, dispatch]);

  const fetchPost = useCallback(async (postId) => {
    if (!contentContract) return null;
    
    try {
      const [creator, handle, cid, points, createdAt] = await contentContract.getPost(postId);
      const isLikedByMe = user.address 
        ? await contentContract.hasLikedPost(user.address, postId)
        : false;
      
      return {
        id: postId,
        creator,
        handle,
        cid,
        points: Number(points),
        createdAt: Number(createdAt) * 1000,
        isLikedByMe,
      };
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  }, [contentContract, user.address]);

  const fetchAllPosts = useCallback(async (page = 0, limit = 20) => {
    if (!contentContract) return [];
    
    try {
      const totalPosts = await contentContract.getTotalPosts();
      const total = Number(totalPosts);
      
      const start = Math.max(0, total - (page + 1) * limit);
      const end = total - page * limit;
      
      const posts = [];
      for (let i = end - 1; i >= start; i--) {
        const post = await fetchPost(i);
        if (post) posts.push(post);
      }
      
      dispatch(setPosts(posts));
      return posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }, [contentContract, fetchPost, dispatch]);

  const fetchTrendingPosts = useCallback(async () => {
    if (!contentContract) return [];
    
    try {
      const trendingIds = await contentContract.getWeeklyTrendingPosts();
      const ids = trendingIds.map(id => Number(id));
      dispatch(setTrendingIds(ids));
      
      const posts = await Promise.all(ids.map(id => fetchPost(id)));
      dispatch(setPosts(posts.filter(Boolean)));
      
      return posts.filter(Boolean);
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      return [];
    }
  }, [contentContract, fetchPost, dispatch]);

  const likePost = useCallback(async (postId) => {
    if (!contentContract) throw new Error('Contract not initialized');
    
    const tx = await contentContract.likePost(postId);
    await tx.wait();
    
    dispatch(addMyLikedPostId(postId));
    
    const likes = await contentContract.getPostLikes(postId);
    dispatch(likePostAction({
      id: postId,
      points: Number(likes),
    }));
    
    return tx;
  }, [contentContract, dispatch]);

  // Token operations
  const stake = useCallback(async (amount) => {
    if (!tokenContract) throw new Error('Contract not initialized');
    
    const tx = await tokenContract.stake(parseEther(amount.toString()));
    await tx.wait();
    
    const stakedAmount = await tokenContract.getStakedAmount(user.address);
    const balance = await tokenContract.balanceOf(user.address);
    
    dispatch(setTokenData({
      stakedAmount: formatEther(stakedAmount),
      balance: formatEther(balance),
    }));
    
    return tx;
  }, [tokenContract, user.address, dispatch]);

  const unstake = useCallback(async (amount) => {
    if (!tokenContract) throw new Error('Contract not initialized');
    
    const tx = await tokenContract.unstake(parseEther(amount.toString()));
    await tx.wait();
    
    const stakedAmount = await tokenContract.getStakedAmount(user.address);
    const balance = await tokenContract.balanceOf(user.address);
    
    dispatch(setTokenData({
      stakedAmount: formatEther(stakedAmount),
      balance: formatEther(balance),
    }));
    
    return tx;
  }, [tokenContract, user.address, dispatch]);

  const claimRewards = useCallback(async () => {
    if (!tokenContract) throw new Error('Contract not initialized');
    
    const tx = await tokenContract.claimRewards();
    await tx.wait();
    
    const balance = await tokenContract.balanceOf(user.address);
    const pendingRewards = await tokenContract.getPendingRewards(user.address);
    
    dispatch(setTokenData({
      balance: formatEther(balance),
      pendingRewards: formatEther(pendingRewards),
    }));
    
    return tx;
  }, [tokenContract, user.address, dispatch]);

  return {
    registerUser,
    updateHandle,
    createPost,
    fetchPost,
    fetchAllPosts,
    fetchTrendingPosts,
    likePost,
    stake,
    unstake,
    claimRewards,
  };
};

export default useContract;
