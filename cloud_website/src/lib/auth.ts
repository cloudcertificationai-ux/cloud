// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import Auth0Provider from 'next-auth/providers/auth0'
import prisma from '@/lib/db'
import type { Adapter } from 'next-auth/adapters'

// Custom adapter that handles account linking gracefully
function CustomPrismaAdapter(p: typeof prisma): Adapter {
  const baseAdapter = PrismaAdapter(p)
  
  return {
    ...baseAdapter,
    async linkAccount(account: any) {
      try {
        console.log('[CustomAdapter] Linking account:', account.provider, account.providerAccountId)
        
        // Try to create the account
        const linkedAccount = await p.account.create({
          data: {
            userId: account.userId,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          },
        })
        
        console.log('[CustomAdapter] Account linked successfully')
        return linkedAccount
      } catch (error: any) {
        // If account already exists (unique constraint violation)
        if (error.code === 'P2002') {
          console.log('[CustomAdapter] Account already exists, fetching it')
          const existingAccount = await p.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
          })
          
          if (existingAccount) {
            console.log('[CustomAdapter] Returning existing account')
            return existingAccount
          }
        }
        
        console.error('[CustomAdapter] Error linking account:', error)
        throw error
      }
    },
  }
}

export const authOptions: NextAuthOptions = {
  adapter: CustomPrismaAdapter(prisma),
  providers: [
    // Auth0 - Handles Google, Apple, and other social logins
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER!,
      profile(profile) {
        console.log('[Auth0] Profile received:', {
          sub: profile.sub,
          email: profile.email,
          name: profile.name,
        })
        
        // Safely extract profile data
        const email = profile.email || ''
        const name = profile.name || profile.nickname || email.split('@')[0]
        const picture = profile.picture || null
        const emailVerified = profile.email_verified === true ? new Date() : null
        
        return {
          id: profile.sub,
          email,
          name,
          image: picture,
          emailVerified,
          role: 'STUDENT' as const,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
        token.role = user.role as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
        
        console.log('[JWT] Token created for user:', user.email)
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
        session.user.role = (token.role as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT') || 'STUDENT'
        
        console.log('[Session] Session created for:', session.user.email)
      }
      
      return session
    },
    async signIn({ user, account, profile }) {
      try {
        console.log('[SignIn] Callback started for:', user.email)
        
        // Update user profile with latest data
        if (profile && user.id) {
          const profileData: {
            name?: string | null
            image?: string | null
            emailVerified?: Date | null
            lastLoginAt: Date
          } = {
            lastLoginAt: new Date()
          }

          if (profile.name && typeof profile.name === 'string') {
            profileData.name = profile.name
          }
          
          const imageUrl = (profile as { picture?: string }).picture
          if (imageUrl && typeof imageUrl === 'string') {
            profileData.image = imageUrl
          }

          if ((profile as { email_verified?: boolean }).email_verified === true) {
            profileData.emailVerified = new Date()
          }

          await prisma.user.update({
            where: { id: user.id },
            data: profileData
          })

          console.log('[SignIn] Profile updated successfully')
        }

        console.log('[SignIn] Callback completed successfully')
        return true
      } catch (error) {
        console.error('[SignIn] Error:', error)
        // Don't block sign in if profile update fails
        return true
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
