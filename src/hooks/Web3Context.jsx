import React, { createContext, useContext, useMemo } from 'react';
import useWeb3 from './useWeb3';
import { BrowserProvider, Contract } from 'ethers';
import { CONTRACT_ABI } from '../contracts/abis';
import { CONTRACTS } from '../contracts/addresses';

const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const web3 = useWeb3();
  // Read-only contract (provider)
  const contract = useMemo(() => {
    if (!window.ethereum) return null;
    try {
      const provider = new BrowserProvider(window.ethereum);
      return new Contract(CONTRACTS.VIBEFEED, CONTRACT_ABI, provider);
    } catch {
      return null;
    }
  }, []);
  // Write-enabled contract (signer)
  const signerContract = useMemo(() => {
    if (!window.ethereum || !web3.signer) return null;
    try {
      return new Contract(CONTRACTS.VIBEFEED, CONTRACT_ABI, web3.signer);
    } catch {
      return null;
    }
  }, [web3.signer]);
  return (
    <Web3Context.Provider value={{ ...web3, contract, signerContract }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3Context = () => useContext(Web3Context);
