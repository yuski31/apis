import { createClient } from '@supabase/supabase-js'

// Define the types for our Supabase client
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      // We'll define tables as we implement them based on DATABASE_SCHEMA.md
    }
    Views: {
      // We'll define views as needed
    }
    Functions: {
      // We'll define functions as needed
    }
    Enums: {
      // We'll define enums as needed
    }
    CompositeTypes: {
      // We'll define composite types as needed
    }
  }
}

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create Supabase client (with fallback for development)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null

// Server-side client with service role key (for server-side operations)
export const createServiceRoleClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}