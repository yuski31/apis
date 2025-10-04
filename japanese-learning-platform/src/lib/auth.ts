import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from '@/lib/supabase/client'

// Define custom user type
interface User {
  id: string
  name?: string
  email?: string
  image?: string
}

// Configure NextAuth options
export const authOptions: NextAuthOptions = {
  providers: [
    // Email/password authentication
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Check if supabase is available
        if (!supabase) {
          console.error('Supabase client not initialized')
          return null
        }

        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        })

        if (error) {
          console.error('Authentication error:', error)
          return null
        }

        // Return user object
        return {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email,
          email: data.user.email,
          image: data.user.user_metadata?.avatar_url
        } as User
      }
    }),
    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    })
  ],
  callbacks: {
    // JWT callback
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    // Session callback
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET
}