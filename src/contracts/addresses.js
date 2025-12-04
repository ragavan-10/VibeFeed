// Sepolia Testnet Contract Addresses
// These should be updated after deploying the contracts

// Single VibeFeed contract address (same for TOKEN and CONTENT ABIs)
export const CONTRACTS = {
  VIBEFEED: '0x477922aFBAC2A4184EB6452d7718cC4090CbC35A', // <-- paste your Remix deployed address here
};

// Set these to the network you deployed to in Remix.
// Common options: 31337 (Anvil/Hardhat local), 11155111 (Sepolia), 1 (Mainnet)
export const CHAIN_ID = 11155111; // default to Sepolia
export const CHAIN_NAME = 'Sepolia';
export const RPC_URL = 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';

export const NETWORK_CONFIG = {
  // local: {
  //   chainId: '0x7a69', // 31337 in hex
  //   chainName: 'Local Anvil',
  //   rpcUrl: 'http://127.0.0.1:8545',
  //   nativeCurrency: {
  //     name: 'Vibe',
  //     symbol: 'VIBE',
  //     decimals: 18
  //   }
  // },
  local: {
    chainId: '0xaa36a7', // Sepolia chain ID
    chainName: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/5121a47151a9435c80285cec84c862ff', // Replace with your Infura URL
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'ETH',
      decimals: 18
    }
  },
};