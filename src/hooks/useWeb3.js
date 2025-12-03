import { useState, useCallback, useEffect } from 'react';
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData, setIsConnecting, setError as setUserError, resetUser } from '../store/userSlice';
import { setTokenData, resetToken } from '../store/tokenSlice';
import { setPosts, addNewPost, likePost, setTrendingIds } from '../store/postsSlice';
import { CONTRACTS, CHAIN_ID, NETWORK_CONFIG } from '../contracts/addresses';
import { TOKEN_ABI, CONTENT_ABI } from '../contracts/abis';

export const useWeb3 = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [contentContract, setContentContract] = useState(null);

  const checkNetwork = useCallback(async () => {
    if (!window.ethereum) return false;
    
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (parseInt(chainId, 16) !== CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: NETWORK_CONFIG.chainId }],
        });
        return true;
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [NETWORK_CONFIG],
            });
            return true;
          } catch (addError) {
            console.error('Failed to add network:', addError);
            return false;
          }
        }
        return false;
      }
    }
    return true;
  }, []);

  const setupContracts = useCallback(async (signerInstance) => {
    const token = new Contract(CONTRACTS.TOKEN, TOKEN_ABI, signerInstance);
    const content = new Contract(CONTRACTS.CONTENT, CONTENT_ABI, signerInstance);
    setTokenContract(token);
    setContentContract(content);
    return { token, content };
  }, []);

  const fetchUserData = useCallback(async (address, content, token) => {
    try {
      // Check if user is registered
      const isRegistered = await content.isUserRegistered(address);
      
      if (isRegistered) {
        const handle = await content.getUserHandle(address);
        const postIds = await content.getPostsByUser(address);
        
        dispatch(setUserData({
          address,
          handle,
          isRegistered: true,
          myPostIds: postIds.map(id => Number(id)),
        }));
      } else {
        dispatch(setUserData({
          address,
          isRegistered: false,
        }));
      }

      // Fetch token data
      const balance = await token.balanceOf(address);
      const stakedAmount = await token.getStakedAmount(address);
      const pendingRewards = await token.getPendingRewards(address);
      const unlockTime = await token.getUnlockTime(address);

      dispatch(setTokenData({
        balance: formatEther(balance),
        stakedAmount: formatEther(stakedAmount),
        pendingRewards: formatEther(pendingRewards),
        unlockTime: Number(unlockTime),
      }));
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [dispatch]);

  const setupEventListeners = useCallback((content, token) => {
    // PostCreated event
    content.on('PostCreated', (postId, creator, cid) => {
      dispatch(addNewPost({
        id: Number(postId),
        creator,
        cid,
        points: 0,
        createdAt: Date.now(),
        isLikedByMe: false,
      }));
    });

    // Voted event
    content.on('Voted', (postId, voter, weight) => {
      content.getPostLikes(postId).then(likes => {
        dispatch(likePost({
          id: Number(postId),
          points: Number(likes),
        }));
      });
    });

    // Staked event
    token.on('Staked', async (userAddress, amount) => {
      if (userAddress.toLowerCase() === user.address?.toLowerCase()) {
        const stakedAmount = await token.getStakedAmount(userAddress);
        dispatch(setTokenData({ stakedAmount: formatEther(stakedAmount) }));
      }
    });

    // Unstaked event
    token.on('Unstaked', async (userAddress, amount) => {
      if (userAddress.toLowerCase() === user.address?.toLowerCase()) {
        const stakedAmount = await token.getStakedAmount(userAddress);
        const balance = await token.balanceOf(userAddress);
        dispatch(setTokenData({
          stakedAmount: formatEther(stakedAmount),
          balance: formatEther(balance),
        }));
      }
    });

    // RewardsClaimed event
    token.on('RewardsClaimed', async (userAddress, amount) => {
      if (userAddress.toLowerCase() === user.address?.toLowerCase()) {
        const balance = await token.balanceOf(userAddress);
        const pendingRewards = await token.getPendingRewards(userAddress);
        dispatch(setTokenData({
          balance: formatEther(balance),
          pendingRewards: formatEther(pendingRewards),
        }));
      }
    });

    return () => {
      content.removeAllListeners();
      token.removeAllListeners();
    };
  }, [dispatch, user.address]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      dispatch(setUserError('Please install MetaMask'));
      return false;
    }

    dispatch(setIsConnecting(true));

    try {
      const networkOk = await checkNetwork();
      if (!networkOk) {
        dispatch(setUserError('Please switch to Sepolia network'));
        dispatch(setIsConnecting(false));
        return false;
      }

      const browserProvider = new BrowserProvider(window.ethereum);
      const signerInstance = await browserProvider.getSigner();
      const address = await signerInstance.getAddress();

      setProvider(browserProvider);
      setSigner(signerInstance);

      const { token, content } = await setupContracts(signerInstance);
      await fetchUserData(address, content, token);
      setupEventListeners(content, token);

      dispatch(setIsConnecting(false));
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      dispatch(setUserError(error.message));
      dispatch(setIsConnecting(false));
      return false;
    }
  }, [checkNetwork, setupContracts, fetchUserData, setupEventListeners, dispatch]);

  const disconnectWallet = useCallback(() => {
    if (tokenContract) tokenContract.removeAllListeners();
    if (contentContract) contentContract.removeAllListeners();
    
    setProvider(null);
    setSigner(null);
    setTokenContract(null);
    setContentContract(null);
    
    dispatch(resetUser());
    dispatch(resetToken());
  }, [tokenContract, contentContract, dispatch]);

  // Listen for account changes
  useEffect(() => {
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
    tokenContract,
    contentContract,
    connectWallet,
    disconnectWallet,
    isConnected: !!user.address,
  };
};

export default useWeb3;
