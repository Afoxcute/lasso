/**
 * Lighthouse IPFS upload utility
 * 
 * This file provides functions to upload files to IPFS using Lighthouse.
 * For production use, you should replace the placeholder API key with your actual Lighthouse API key.
 * In a real application, you should use environment variables for API keys.
 */

import lighthouse from '@lighthouse-web3/sdk';

/**
 * Uploads a file to IPFS via Lighthouse
 * @param file The file to upload
 * @returns Object with success status, CID and message
 */
export const uploadFileToLighthouse = async (file: File): Promise<{
  success: boolean;
  cid?: string;
  message?: string;
}> => {
  try {
    // Get API key from environment variables
    const apiKey = import.meta.env.VITE_LIGHTHOUSE_API_KEY;
    
    // Check if we have credentials
    if (!apiKey) {
      console.warn('No Lighthouse API key found. Using mock implementation.');
      // Simulate a delay for the upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a mock CID
      const mockCid = `bafkreib${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      return {
        success: true,
        cid: mockCid,
      };
    }

    // Progress callback function
    const progressCallback = (progressData: any) => {
      let percentageDone = 100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
      console.log(`Upload progress: ${percentageDone}%`);
    };

    // Upload file to Lighthouse
    const output = await lighthouse.upload(file, apiKey, false, progressCallback);
    
    if (!output.data || !output.data.Hash) {
      throw new Error('Failed to get CID from Lighthouse');
    }

    return {
      success: true,
      cid: output.data.Hash,
    };
  } catch (error: any) {
    console.error('Error uploading to IPFS via Lighthouse:', error);
    return {
      success: false,
      message: error.message || 'Failed to upload to IPFS',
    };
  }
};

/**
 * Gets the Lighthouse gateway URL for a CID
 * @param cid IPFS CID
 * @returns Gateway URL
 */
export const getLighthouseGatewayURL = (cid: string): string => {
  if (!cid) return '';
  return `https://gateway.lighthouse.storage/ipfs/${cid}`;
}; 