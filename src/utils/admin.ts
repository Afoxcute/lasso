import { supabase } from './supabase';

export interface AdminInfo {
  fullName: string | null;
  email: string | null;
  subscriptionPlan: string | null;
  isAdmin: boolean;
}

/**
 * Fetches admin information from Supabase based on wallet address
 * @param walletAddress The Algorand wallet address
 * @returns AdminInfo object with admin details
 */
export async function fetchAdminInfo(walletAddress: string): Promise<AdminInfo> {
  if (!walletAddress) {
    return {
      fullName: null,
      email: null,
      subscriptionPlan: null,
      isAdmin: false
    };
  }

  try {
    // Get user data from Supabase organization_admins table
    const { data, error } = await supabase
      .from('organization_admins')
      .select('full_name, email, subscription_plan')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error('Error fetching admin info:', error);
    }
    
    if (data) {
      return {
        fullName: data.full_name,
        email: data.email,
        subscriptionPlan: data.subscription_plan,
        isAdmin: true
      };
    }
    
    // Try to get info from auth session as fallback
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const metadata = session.user.user_metadata || {};
      return {
        fullName: typeof metadata.full_name === 'string' ? metadata.full_name : null,
        email: typeof session.user.email === 'string' ? session.user.email : null,
        subscriptionPlan: null,
        isAdmin: false
      };
    }
    
    return {
      fullName: null,
      email: null,
      subscriptionPlan: null,
      isAdmin: false
    };
  } catch (error) {
    console.error('Error in fetchAdminInfo:', error);
    return {
      fullName: null,
      email: null,
      subscriptionPlan: null,
      isAdmin: false
    };
  }
}

/**
 * Updates admin information in Supabase
 * @param walletAddress The Algorand wallet address
 * @param updates The fields to update
 * @returns Success status and any error message
 */
export async function updateAdminInfo(
  walletAddress: string,
  updates: { fullName?: string; email?: string }
): Promise<{ success: boolean; message?: string }> {
  if (!walletAddress) {
    return { success: false, message: 'No wallet address provided' };
  }

  try {
    // Check if user is an admin
    const { data: adminData } = await supabase
      .from('organization_admins')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();
    
    const isAdmin = !!adminData;
    
    // Update the organization_admins table if user is an admin
    if (isAdmin) {
      const updateData: Record<string, any> = {};
      if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
      if (updates.email !== undefined) updateData.email = updates.email;
      
      const { error } = await supabase
        .from('organization_admins')
        .update(updateData)
        .eq('wallet_address', walletAddress);
      
      if (error) throw error;
    }
    
    // Update user metadata in auth.users if possible
    if (updates.fullName !== undefined) {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: updates.fullName }
      });
      
      if (error) throw error;
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating admin info:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to update admin information' 
    };
  }
} 