import { supabase } from '../supabase/client'
import { UserProfile } from './types'

// Get user profile by ID
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data as UserProfile
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

// Create user profile
export const createUserProfile = async (profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at' | 'last_active'>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          ...profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return null
    }

    return data as UserProfile
  } catch (error) {
    console.error('Error creating user profile:', error)
    return null
  }
}

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      return null
    }

    return data as UserProfile
  } catch (error) {
    console.error('Error updating user profile:', error)
    return null
  }
}

// Update user's last active timestamp
export const updateUserLastActive = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        last_active: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user last active:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating user last active:', error)
    return false
  }
}