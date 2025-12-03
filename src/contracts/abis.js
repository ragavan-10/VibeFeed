// Token Contract ABI
export const TOKEN_ABI = [
  // ERC20 Standard
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  
  // Staking
  'function stake(uint256 amount) external',
  'function unstake(uint256 amount) external',
  'function getStakedAmount(address user) view returns (uint256)',
  'function getUnlockTime(address user) view returns (uint256)',
  'function getVotingPower(address user) view returns (uint256)',
  
  // Rewards
  'function claimRewards() external',
  'function getPendingRewards(address user) view returns (uint256)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event Staked(address indexed user, uint256 amount)',
  'event Unstaked(address indexed user, uint256 amount)',
  'event RewardsClaimed(address indexed user, uint256 amount)',
];

// Content Contract ABI
export const CONTENT_ABI = [
  // User Registration
  'function registerUser(string handle) external',
  'function updateHandle(string newHandle) external',
  'function isUserRegistered(address user) view returns (bool)',
  'function getUserHandle(address user) view returns (string)',
  'function getAddressByHandle(string handle) view returns (address)',
  
  // Posts
  'function createPost(string cid) external returns (uint256)',
  'function getPost(uint256 postId) view returns (address creator, string handle, string cid, uint256 points, uint256 createdAt)',
  'function getTotalPosts() view returns (uint256)',
  'function getPostsByUser(address user) view returns (uint256[])',
  
  // Likes/Voting
  'function likePost(uint256 postId) external',
  'function hasLikedPost(address user, uint256 postId) view returns (bool)',
  'function getPostLikes(uint256 postId) view returns (uint256)',
  
  // Rewards
  'function generateRewards() external',
  'function getWeeklyTrendingPosts() view returns (uint256[])',
  
  // Events
  'event UserRegistered(address indexed user, string handle)',
  'event HandleUpdated(address indexed user, string oldHandle, string newHandle)',
  'event PostCreated(uint256 indexed postId, address indexed creator, string cid)',
  'event Voted(uint256 indexed postId, address indexed voter, uint256 weight)',
  'event RewardsDistributed(uint256 weekNumber, uint256 totalRewards)',
];
