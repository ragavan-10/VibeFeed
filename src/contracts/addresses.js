// Sepolia Testnet Contract Addresses
// These should be updated after deploying the contracts

export const CONTRACTS = {
  TOKEN: '0x0000000000000000000000000000000000000000', // Replace with deployed token contract
  CONTENT: '0x0000000000000000000000000000000000000000', // Replace with deployed content contract
};

export const CHAIN_ID = 11155111; // Sepolia
export const CHAIN_NAME = 'Sepolia';
export const RPC_URL = 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';

export const NETWORK_CONFIG = {
  chainId: `0x${CHAIN_ID.toString(16)}`,
  chainName: 'Sepolia Testnet',
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [RPC_URL],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
};
