// Mock data for demo mode when contracts aren't deployed

export const DEMO_MODE = true; // Set to false when contracts are deployed

export const mockPosts = [
  {
    id: 1,
    creator: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD78',
    handle: 'cryptoartist',
    cid: 'bafybeig1234567890abcdef',
    points: 1247,
    createdAt: Date.now() - 1000 * 60 * 30, // 30 mins ago
    isLikedByMe: false,
  },
  {
    id: 2,
    creator: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    handle: 'web3_sarah',
    cid: 'bafybeig2345678901bcdefg',
    points: 892,
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    isLikedByMe: true,
  },
  {
    id: 3,
    creator: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
    handle: 'defi_degen',
    cid: 'bafybeig3456789012cdefgh',
    points: 2103,
    createdAt: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    isLikedByMe: false,
  },
  {
    id: 4,
    creator: '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
    handle: 'nft_collector',
    cid: 'bafybeig4567890123defghi',
    points: 456,
    createdAt: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
    isLikedByMe: false,
  },
  {
    id: 5,
    creator: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
    handle: 'blockchain_dev',
    cid: 'bafybeig5678901234efghij',
    points: 3421,
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    isLikedByMe: true,
  },
];

export const mockUserData = {
  balance: '15420.5',
  stakedAmount: '5000',
  pendingRewards: '123.45',
  unlockTime: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 3, // 3 days from now
  votingPower: 50,
  isStakedEnough: true,
};

// Generate placeholder image URL based on post id
export const getPlaceholderImage = (postId) => {
  const colors = ['F97316', 'EC4899', '14B8A6', '8B5CF6', '3B82F6'];
  const color = colors[postId % colors.length];
  return `https://placehold.co/800x600/${color}/FFFFFF?text=Post+${postId}`;
};
