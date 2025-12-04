import { useState, useCallback, useEffect } from 'react';
import { BrowserProvider, Contract, formatEther, formatUnits } from 'ethers';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData, setIsConnecting, setError as setUserError, resetUser } from '../store/userSlice';
import { setTokenData, resetToken } from '../store/tokenSlice';
import { setPost, setIsLoading } from '../store/postsSlice';
import { CONTRACT_ABI } from '../contracts/abis';
import { CONTRACTS, CHAIN_ID, NETWORK_CONFIG } from '../contracts/addresses';

export const useWeb3 = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const checkNetwork = useCallback(async () => {
    if (!window.ethereum) return false;

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const targetConfig = NETWORK_CONFIG.local;
    if (chainId !== targetConfig.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: targetConfig.chainId,
              chainName: targetConfig.chainName,
              rpcUrls: [targetConfig.rpcUrl],
              nativeCurrency: targetConfig.nativeCurrency,
            },
          ],
        });
        return true;
      } catch (error) {
        console.error('Failed to switch network:', error);
        return false;
      }
    }
    return true;
  }, []);

  // Fetch all posts from contract and populate posts slice
  const fetchAllPosts = useCallback(async (contractInstance) => {
    if (!contractInstance) return;
    dispatch(setIsLoading(true));
    try {
      const [postIds, creators, handles, cids, points, createdAts] = await contractInstance.getAllPosts();
      const posts = postIds.map((id, i) => ({
        id: Number(id),
        creator: creators[i],
        handle: handles[i],
        cid: cids[i],
        points: Number(points[i]),
        createdAt: Number(createdAts[i]),
      }));
      // Use setPosts to populate allIds and byId
      posts.forEach(post => dispatch(setPost(post)));
    } catch (err) {
      console.error('Error loading all posts:', err);
    }
    dispatch(setIsLoading(false));
  }, [dispatch]);

  // Fetch all user and token data
  const fetchUserData = useCallback(async (address, contractInstance) => {
    try {
      dispatch(setIsLoading(true));
      // Registration and handle
      const handle = await contractInstance.handleOf(address);
      const isRegistered = handle && handle.length > 0;

      let myPostIds = [];
      if (isRegistered) {
        const postIds = await contractInstance.getMyPostIds(address);
        myPostIds = postIds.map((id) => Number(id));
      }

      // Fetch liked post IDs (brute force: check all posts)
      let myLikedPostIds = [];
      try {
        const [allPostIds] = await contractInstance.getAllPosts();
        for (const postId of allPostIds) {
          const liked = await contractInstance.isPostLikedBy(postId, address);
          if (liked) myLikedPostIds.push(Number(postId));
        }
      } catch (err) {
        console.error('Error fetching liked posts:', err);
      }

      // Token data
      const [balanceRaw, stakeStruct, pendingRewardsRaw, votingPowerRaw] = await Promise.all([
        contractInstance.balanceOf(address),
        contractInstance.stakes(address),
        contractInstance.pendingRewards(address),
        contractInstance.votingPowerOf(address),
      ]);

      // Store raw values as strings in Redux (serializable)
      dispatch(setUserData({
        address,
        handle,
        isRegistered,
        myPostIds,
        myLikedPostIds,
      }));

        dispatch(setTokenData({
          balance: formatUnits(balanceRaw, 18),
          stakedAmount: formatUnits(stakeStruct.amount, 18),
          unlockTime: stakeStruct.unlockTime.toString(),
          pendingRewards: formatUnits(pendingRewardsRaw, 18),
          votingPower: formatUnits(votingPowerRaw, 18),
          isStakedEnough: BigInt(stakeStruct.amount) >= 1000n * 1000000000000000000n, // 1000 * 1e18
        }));

      // Fetch post data for each postId and dispatch to postsSlice
      for (const postId of myPostIds) {
        try {
          const postData = await contractInstance.getPost(postId);
          // getPost returns [creator, handle, cid, points]
            const [creator, handle, cid, points, createdAt] = postData;
            dispatch(setPost({
              id: Number(postId),
              creator,
              handle,
              cid,
              points: formatUnits(points, 18),
              createdAt: createdAt?.toString(),
            }));
        } catch (err) {
          console.error('Error fetching post', postId, err);
        }
      }
      dispatch(setIsLoading(false));
      // After loading user data, also load all posts for global feed
      await fetchAllPosts(contractInstance);
    } catch (error) {
      dispatch(setIsLoading(false));
      console.error('Error fetching user/token data:', error);
    }
  }, [dispatch]);

  // Expose refreshUserData and refreshAllPosts for use in other components
  const refreshUserData = useCallback(async () => {
    if (!signer || !contract) return;
    const address = await signer.getAddress();
    await fetchUserData(address, contract);
  }, [signer, contract, fetchUserData]);

  const refreshAllPosts = useCallback(async () => {
    if (!contract) return;
    await fetchAllPosts(contract);
  }, [contract, fetchAllPosts]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      dispatch(setUserError('Please install MetaMask'));
      return false;
    }

    dispatch(setIsConnecting(true));

    try {
      const networkOk = await checkNetwork();
      if (!networkOk) {
        dispatch(setUserError('Please switch to the correct network'));
        dispatch(setIsConnecting(false));
        return false;
      }

      const browserProvider = new BrowserProvider(window.ethereum);
      const signerInstance = await browserProvider.getSigner();
      const address = await signerInstance.getAddress();

      setProvider(browserProvider);
      setSigner(signerInstance);

  const contractInstance = new Contract(CONTRACTS.VIBEFEED, CONTRACT_ABI, signerInstance);
  setContract(contractInstance);  

  await fetchUserData(address, contractInstance);

      dispatch(setIsConnecting(false));
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      dispatch(setUserError(error.message));
      dispatch(setIsConnecting(false));
      return false;
    }
  }, [checkNetwork, fetchUserData, dispatch]);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setContract(null);

    dispatch(resetUser());
    dispatch(resetToken());
  }, [dispatch]);

  useEffect(() => {
    // Auto-connect if MetaMask is already connected
    if (window.ethereum && window.ethereum.selectedAddress) {
      connectWallet();
    }

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [connectWallet, disconnectWallet]);

  return {
    provider,
    signer,
    contract,
    connectWallet,
    disconnectWallet,
    refreshUserData,
    refreshAllPosts,
    isConnected: !!user.address,
  };
};

export default useWeb3;
