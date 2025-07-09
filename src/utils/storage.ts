/**
 * Storage provider management utility
 * 
 * This file provides functions to manage different storage providers for IPFS uploads.
 */

import { pinFileToIPFS, getIPFSGatewayURL as getPinataGatewayURL } from './pinata';
import { uploadFileToLighthouse, getLighthouseGatewayURL } from './lighthouse';
import { supabase } from './supabase';

// Available storage providers
export type StorageProvider = 'pinata' | 'lighthouse';

/**
 * Get the currently selected storage provider for a wallet address
 * @param walletAddress The wallet address to check
 * @returns The selected storage provider, defaults to 'pinata' if not set
 */
export const getStorageProvider = async (walletAddress: string): Promise<StorageProvider> => {
  if (!walletAddress) return 'pinata';
  
  try {
    const { data, error } = await supabase
      .from('organization_admins')
      .select('storage_provider')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (error || !data || !data.storage_provider) {
      return 'pinata'; // Default to pinata
    }
    
    return data.storage_provider as StorageProvider;
  } catch (error) {
    console.error('Error getting storage provider:', error);
    return 'pinata'; // Default to pinata on error
  }
};

/**
 * Set the storage provider for a wallet address
 * @param walletAddress The wallet address to update
 * @param provider The storage provider to set
 * @returns Success status and any error message
 */
export const setStorageProvider = async (
  walletAddress: string,
  provider: StorageProvider
): Promise<{ success: boolean; message?: string }> => {
  if (!walletAddress) {
    return { success: false, message: 'No wallet address provided' };
  }

  try {
    const { error } = await supabase
      .from('organization_admins')
      .update({ storage_provider: provider })
      .eq('wallet_address', walletAddress);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error setting storage provider:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to update storage provider' 
    };
  }
};

/**
 * Upload a file to IPFS using the selected provider with fallback
 * @param file The file to upload
 * @param provider The storage provider to use
 * @returns Object with success status, CID and message
 */
export const uploadFileToIPFS = async (
  file: File,
  provider: StorageProvider = 'pinata'
): Promise<{
  success: boolean;
  cid?: string;
  message?: string;
  provider: StorageProvider;
  fallbackUsed?: boolean;
}> => {
  try {
    let result;
    let fallbackUsed = false;
    
    if (provider === 'lighthouse') {
      try {
        console.log('Attempting to upload to Lighthouse...');
        result = await uploadFileToLighthouse(file);
        
        if (!result.success) {
          console.warn('Lighthouse upload failed, falling back to Pinata');
          fallbackUsed = true;
          result = await pinFileToIPFS(file);
        }
      } catch (error) {
        console.warn('Lighthouse upload error, falling back to Pinata:', error);
        fallbackUsed = true;
        result = await pinFileToIPFS(file);
      }
    } else {
      // Default to Pinata
      result = await pinFileToIPFS(file);
    }
    
    return {
      ...result,
      provider: fallbackUsed ? 'pinata' : provider,
      fallbackUsed
    };
  } catch (error: any) {
    console.error(`Error uploading to IPFS via ${provider}:`, error);
    return {
      success: false,
      message: error.message || `Failed to upload to IPFS via ${provider}`,
      provider,
      fallbackUsed: false
    };
  }
};

/**
 * Get an IPFS gateway URL for a CID
 * @param cid The IPFS CID
 * @param provider The storage provider to use for the gateway
 * @returns The gateway URL
 */
export const getIPFSGatewayURL = (cid: string, provider: StorageProvider = 'pinata'): string => {
  if (!cid) return '';
  
  if (provider === 'lighthouse') {
    return getLighthouseGatewayURL(cid);
  }
  
  // Default to Pinata
  return getPinataGatewayURL(`ipfs://${cid}`);
}; 