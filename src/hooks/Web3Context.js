
import React, { createContext, useContext } from 'react';
import useWeb3 from './useWeb3';

const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const web3 = useWeb3();
  return (
    <Web3Context.Provider value={web3}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3Context = () => useContext(Web3Context);
