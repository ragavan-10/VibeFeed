import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { CONTRACT_ABI } from '../contracts/abis';
import { CONTRACTS } from '../contracts/addresses';

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

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
      setIsConnecting(false);
      return true;
    } catch (err) {
      setError(err?.message || 'Wallet connection failed');
      setIsConnecting(false);
      return false;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
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
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => useContext(WalletContext);
