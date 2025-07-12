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
 * Upload a file to IPFS using the selected provider with silent fallback
 * @param file The file to upload
 * @param provider The storage provider to use
 * @param skipLighthouse Optional flag to skip Lighthouse and use Pinata directly
 * @returns Object with success status, CID and message
 */
export const uploadFileToIPFS = async (
  file: File,
  provider: StorageProvider = 'pinata',
  skipLighthouse: boolean = false
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
    let actualProvider = provider;
    
    // Check if we should skip Lighthouse entirely
    if (provider === 'lighthouse' && skipLighthouse) {
      console.log('Skipping Lighthouse as requested, using Pinata directly');
      actualProvider = 'pinata';
      result = await pinFileToIPFS(file);
      return {
        ...result,
        provider: 'pinata',
        fallbackUsed: true
      };
    }
    
    // First attempt with the selected provider
    if (provider === 'lighthouse' && !skipLighthouse) {
      try {
        console.log('Attempting to upload to Lighthouse...');
        
        // Set a timeout for Lighthouse upload to ensure we don't wait too long
        const lighthousePromise = uploadFileToLighthouse(file);
        
        // Create a timeout promise that rejects after 3 seconds (reduced from 5)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Lighthouse upload timeout')), 3000);
        });
        
        // Race the upload against the timeout
        result = await Promise.race([
          lighthousePromise,
          timeoutPromise.catch(error => {
            console.warn('Lighthouse upload timed out:', error);
            return { success: false, message: 'Upload timed out' };
          })
        ]);
        
        // If Lighthouse fails or times out, immediately fallback to Pinata
        if (!result.success) {
          console.warn(`Lighthouse upload failed: ${result.message}, immediately falling back to Pinata`);
          fallbackUsed = true;
          actualProvider = 'pinata';
          result = await pinFileToIPFS(file);
        }
      } catch (error) {
        // Silent fallback to Pinata on any error
        console.warn('Lighthouse upload error, immediately falling back to Pinata:', error);
        fallbackUsed = true;
        actualProvider = 'pinata';
        result = await pinFileToIPFS(file);
      }
    } else {
      // Use Pinata as the primary provider
      try {
        console.log('Uploading to Pinata...');
        result = await pinFileToIPFS(file);
      } catch (error) {
        console.error('Pinata upload failed with no fallback:', error);
        throw error; // Re-throw to be caught by the outer try-catch
      }
    }
    
    return {
      ...result,
      provider: actualProvider,
      fallbackUsed
    };
  } catch (error: any) {
    console.error(`Error uploading to IPFS:`, error);
    return {
      success: false,
      message: error.message || `Failed to upload to IPFS`,
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