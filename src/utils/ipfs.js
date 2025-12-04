// ipfs.js - Using Pinata (FREE)
// Replace PINATA_JWT with your actual JWT from pinata.cloud

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3YjhkZGI0ZC0xOWVhLTRmYjctYTJhZi0xZTY5OTM2OTc1MTAiLCJlbWFpbCI6InRoYXJsb3MueGhha0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNmU3ZWQ4YmVkZWQzMjdkMjM2YzIiLCJzY29wZWRLZXlTZWNyZXQiOiIxMGVhMTU3N2QzYTczZWEyYzgxZTRkMDE4ZDJkMzdmOTliMjRhNzQ2NmFkYzY3NDViMWFhYmI2NjhhMWY5NDQzIiwiZXhwIjoxNzk2MzQ3MzcyfQ.i86FGwmeTHqte55U6TO1opZZIyXXd7dw2NKYJfnBrSo"; // VERY IMPORTANT

const PINATA_UPLOAD_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

/**
 * Upload a file (image, video, blob, etc.) to Pinata IPFS
 * @param {File | Blob} file
 * @returns {Promise<string>} CID
 */
export const uploadToIPFS = async (file) => {
  if (!PINATA_JWT || PINATA_JWT === "YOUR_PINATA_JWT") {
    throw new Error("❌ Missing Pinata JWT API key in ipfs.js");
  }

  try {
    const formData = new FormData();

    // Convert Blob → File if needed
    let fileObj = file;
    if (!(file instanceof File)) {
      fileObj = new File([file], "upload.bin");
    }

    formData.append("file", fileObj);

    const res = await fetch(PINATA_UPLOAD_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Pinata upload failed: ${data.error || res.statusText}`);
    }

    return data.IpfsHash; // CID
  } catch (err) {
    throw new Error("❌ IPFS (Pinata) upload failed: " + err.message);
  }
};

/**
 * Upload a JSON object to IPFS via Pinata
 * @param {Object} jsonData
 * @returns {Promise<string>} CID
 */
export const uploadJSONToIPFS = async (jsonData) => {
  if (!PINATA_JWT) {
    throw new Error("❌ Missing Pinata JWT API key in ipfs.js");
  }

  try {
    const res = await fetch(PINATA_JSON_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Pinata JSON upload failed: ${data.error || res.statusText}`);
    }

    return data.IpfsHash; // CID
  } catch (err) {
    throw new Error("❌ JSON upload to Pinata failed: " + err.message);
  }
};

/**
 * Gateway URL helpers
 */
export const getIPFSUrl = (cid) => {
  if (!cid) return "";
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
};

// alternative public gateways
export const getIPFSGatewayUrl = (cid, gateway = "https://w3s.link/ipfs/") => {
  if (!cid) return "";
  return `${gateway.replace(/\/$/, "")}/${cid}`;
};

/**
 * Fetch JSON content from IPFS
 * @param {string} cid
 */
export const fetchIPFSContent = async (cid) => {
  try {
    const url = getIPFSUrl(cid);
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch IPFS content");
    return await res.json();
  } catch (err) {
    console.error("❌ IPFS fetch error:", err);
    return null;
  }
};
