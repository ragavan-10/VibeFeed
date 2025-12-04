import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { CONTRACT_ABI } from '../contracts/abis';
import { CONTRACTS } from '../contracts/addresses';
import { formatUnits } from 'ethers';

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [handle, setHandle] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [shouldFetchFullData, setShouldFetchFullData] = useState(false);

  // Read-only contract via provider
  const contract = useMemo(() => {
    if (!provider) return null;
    try {
      return new Contract(CONTRACTS.VIBEFEED, CONTRACT_ABI, provider);
    } catch {
      return null;
    }
  }, [provider]);

  // Write-enabled contract via signer
  const signerContract = useMemo(() => {
    if (!signer) return null;
    try {
      return new Contract(CONTRACTS.VIBEFEED, CONTRACT_ABI, signer);
    } catch {
      return null;
    }
  }, [signer]);

  // Fetch user registration status and handle from contract
  const fetchUser = useCallback(async (userAddress, contractInstance) => {
    if (!contractInstance || !userAddress || isFetching) return;
    setIsFetching(true);
    try {
      const userHandle = await contractInstance.handleOf(userAddress);
      if (userHandle && userHandle !== "") {
        setIsRegistered(true);
        setHandle(userHandle);
      } else {
        setIsRegistered(false);
        setHandle(null);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setIsRegistered(false);
      setHandle(null);
    } finally {
      setIsFetching(false);
    }
  }, [isFetching]);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError('');
    try {
      if (!window.ethereum) throw new Error('MetaMask not found');
      const browserProvider = new BrowserProvider(window.ethereum);
      const signerInstance = await browserProvider.getSigner();
      const userAddress = await signerInstance.getAddress();
      
      setProvider(browserProvider);
      setSigner(signerInstance);
      setAddress(userAddress);
      
      // Create contract and fetch user immediately
      const contractInstance = new Contract(CONTRACTS.VIBEFEED, CONTRACT_ABI, browserProvider);
      await fetchUser(userAddress, contractInstance);
      
      // Signal that we should fetch full user data (will be picked up by consumers with dispatch)
      setShouldFetchFullData(true);
      
      setIsConnecting(false);
      return true;
    } catch (err) {
      setError(err?.message || 'Wallet connection failed');
      setIsConnecting(false);
      return false;
    }
  }, [fetchUser]);

  const disconnectWallet = useCallback(() => {
  setProvider(null);
  setSigner(null);
  setAddress(null);
  setIsRegistered(false);
  setHandle(null);
  }, []);

  // Switch account: request accounts and set first
  const switchAccount = useCallback(async () => {
    try {
      if (!window.ethereum) throw new Error('MetaMask not found');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        const browserProvider = new BrowserProvider(window.ethereum);
        const signerInstance = await browserProvider.getSigner();
        const userAddress = await signerInstance.getAddress();
        setProvider(browserProvider);
        setSigner(signerInstance);
        setAddress(userAddress);
        return userAddress;
      }
      throw new Error('No accounts available');
    } catch (err) {
      setError(err?.message || 'Account switch failed');
      return null;
    }
  }, []);

  useEffect(() => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      connectWallet();
    }
    if (window.ethereum) {
      const onAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      };
      const onChainChanged = () => {
        window.location.reload();
      };
      window.ethereum.on('accountsChanged', onAccountsChanged);
      window.ethereum.on('chainChanged', onChainChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', onAccountsChanged);
        window.ethereum.removeListener('chainChanged', onChainChanged);
      };
    }
  }, [connectWallet, disconnectWallet]);

  // Fetch full user data including posts, likes, and token info
  const fetchUserData = useCallback(async (userAddress, contractInstance, dispatch) => {
    if (!contractInstance || !userAddress || !dispatch) return;
    
    try {
      // Registration and handle
      const handle = await contractInstance.handleOf(userAddress);
      const isRegistered = handle && handle.length > 0;

      let myPostIds = [];
      if (isRegistered) {
        const postIds = await contractInstance.getMyPostIds(userAddress);
        myPostIds = postIds.map((id) => Number(id));
      }

      // Fetch liked post IDs (check all posts)
      let myLikedPostIds = [];
      try {
        const [allPostIds] = await contractInstance.getAllPosts();
        for (const postId of allPostIds) {
          const liked = await contractInstance.isPostLikedBy(postId, userAddress);
          if (liked) myLikedPostIds.push(Number(postId));
        }
      } catch (err) {
        console.error('Error fetching liked posts:', err);
      }

      // Token data
      const [balanceRaw, stakeStruct, pendingRewardsRaw, votingPowerRaw] = await Promise.all([
        contractInstance.balanceOf(userAddress),
        contractInstance.stakes(userAddress),
        contractInstance.pendingRewards(userAddress),
        contractInstance.votingPowerOf(userAddress),
      ]);

      // Dispatch to Redux
      const { setUserData } = await import('../store/userSlice');
      const { setTokenData } = await import('../store/tokenSlice');
      const { setPost } = await import('../store/postsSlice');

      dispatch(setUserData({
        address: userAddress,
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
        isStakedEnough: BigInt(stakeStruct.amount) >= 1000n * 1000000000000000000n,
      }));

      // Fetch post data for each postId
      for (const postId of myPostIds) {
        try {
          const postData = await contractInstance.getPost(postId);
          const [creator, postHandle, cid, points, createdAt] = postData;
          dispatch(setPost({
            id: Number(postId),
            creator,
            handle: postHandle,
            cid,
            points: formatUnits(points, 18),
            createdAt: createdAt?.toString(),
          }));
        } catch (err) {
          console.error('Error fetching post', postId, err);
        }
      }

      // Update local state
      setHandle(handle);
      setIsRegistered(!!isRegistered);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  const value = {
    provider,
    signer,
    address,
    contract,
    signerContract,
    connectWallet,
    disconnectWallet,
    switchAccount,
    isConnecting,
    error,
    isRegistered,
    handle,
    fetchUser,
    fetchUserData,
    shouldFetchFullData,
    setShouldFetchFullData,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => useContext(WalletContext);
