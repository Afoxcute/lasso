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

    // For browser environment, we need to handle File objects correctly
    // The Lighthouse SDK expects the file to be passed directly
    console.log('Uploading file to Lighthouse:', file.name, file.size);
    
    const uploadResponse = await lighthouse.upload(file, apiKey);
    
    console.log('Lighthouse upload response:', uploadResponse);
    
    if (!uploadResponse.data || !uploadResponse.data.Hash) {
      throw new Error('Failed to get CID from Lighthouse response');
    }

    return {
      success: true,
      cid: uploadResponse.data.Hash,
    };
  } catch (error: any) {
    console.error('Error uploading to IPFS via Lighthouse:', error);
    return {
      success: false,
      message: error.message || 'Failed to upload to IPFS via Lighthouse',
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

/**
 * Downloads a file from Lighthouse using the CID
 * @param cid The IPFS CID of the file
 * @returns Promise that resolves to the file data as a blob
 */
export const downloadFileFromLighthouse = async (cid: string): Promise<Blob> => {
  try {
    const response = await fetch(`https://gateway.lighthouse.storage/ipfs/${cid}`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    
    return await response.blob();
  } catch (error: any) {
    console.error('Failed to download file from Lighthouse:', error);
    throw new Error(`Failed to download file: ${error.message}`);
  }
};

/**
 * Gets uploads list from Lighthouse
 * @param apiKey The Lighthouse API key
 * @param lastKey Optional last key for pagination
 * @returns Promise that resolves to the uploads list
 */
export const getLighthouseUploads = async (apiKey: string, lastKey: string | null = null) => {
  try {
    const response = await lighthouse.getUploads(apiKey, lastKey);
    return response;
  } catch (error: any) {
    console.error('Failed to get uploads from Lighthouse:', error);
    throw new Error(`Failed to get uploads: ${error.message}`);
  }
}; 