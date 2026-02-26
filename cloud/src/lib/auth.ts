// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { createId } from '@paralleldrive/cuid2'
import prisma from '@/lib/db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            password: true,
          }
        })

        if (!user || !user.password) {
          throw new Error('Invalid email or password')
        }

        // Check if user is an admin
        if (user.role !== 'ADMIN') {
          throw new Error('Access denied. Admin privileges required.')
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        // Update last login time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        // Create audit log for successful login
        await prisma.auditLog.create({
          data: {
            id: createId(),
            userId: user.id,
            action: 'ADMIN_LOGIN_SUCCESS',
            resourceType: 'AdminPanel',
            resourceId: user.id,
            details: {
              email: user.email,
              provider: 'credentials'
            }
          }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.email = token.email as string
      }
      
      return session
    },
  },
  events: {
    async signOut({ session, token }) {
      // Create audit log for admin logout
      const userId = token?.sub || token?.id || session?.user?.id
      if (userId) {
        try {
          // Verify user exists before creating audit log
          const userExists = await prisma.user.findUnique({
            where: { id: userId as string },
            select: { id: true }
          })
          
          if (userExists) {
            await prisma.auditLog.create({
              data: {
                id: createId(),
                userId: userId as string,
                action: 'ADMIN_LOGOUT',
                resourceType: 'AdminPanel',
                resourceId: userId as string,
                details: {
                  email: token?.email || session?.user?.email
                }
              }
            })
          }
        } catch (error) {
          console.error('Failed to create logout audit log:', error)
        }
      }
      console.log('Admin user signed out successfully')
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
}
