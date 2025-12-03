// IPFS utilities using web3.storage
// Note: For production, use your own web3.storage token

import { getPlaceholderImage, DEMO_MODE } from './mockData';

const WEB3_STORAGE_TOKEN = 'YOUR_WEB3_STORAGE_TOKEN'; // Replace with actual token

export const uploadToIPFS = async (file) => {
  // For demo purposes, we'll use a mock implementation
  // In production, use web3.storage:
  // const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });
  // const cid = await client.put([file]);
  // return cid;
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Create a mock CID based on file content hash
      const mockCid = `bafybeig${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
      resolve(mockCid);
    };
    reader.readAsArrayBuffer(file);
  });
};

export const uploadJSONToIPFS = async (data) => {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  return uploadToIPFS(blob);
};

export const getIPFSUrl = (cid, postId = null) => {
  if (!cid) return '';
  
  // In demo mode or for mock CIDs, return placeholder
  if (DEMO_MODE || cid.startsWith('bafybeig')) {
    // Generate a colorful placeholder based on the CID
    const hash = cid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['F97316', 'EC4899', '14B8A6', '8B5CF6', '3B82F6', '10B981', 'F59E0B'];
    const color = colors[hash % colors.length];
    const id = postId || (hash % 100);
    return `https://placehold.co/800x600/${color}/FFFFFF/png?text=Post+${id}`;
  }
  
  // Use different gateways for redundancy
  return `https://w3s.link/ipfs/${cid}`;
};

export const getIPFSGatewayUrl = (cid, gateway = 'w3s.link') => {
  if (!cid) return '';
  
  if (DEMO_MODE || cid.startsWith('bafybeig')) {
    return getIPFSUrl(cid);
  }
  
  return `https://${gateway}/ipfs/${cid}`;
};

// Parse IPFS content
export const fetchIPFSContent = async (cid) => {
  try {
    const response = await fetch(getIPFSUrl(cid));
    if (!response.ok) throw new Error('Failed to fetch from IPFS');
    return await response.json();
  } catch (error) {
    console.error('IPFS fetch error:', error);
    return null;
  }
};
