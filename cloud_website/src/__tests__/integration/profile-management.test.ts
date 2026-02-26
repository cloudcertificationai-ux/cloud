// src/__tests__/integration/profile-management.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import prisma from '@/lib/db'

describe('Profile Management Integration Tests', () => {
  let testUser: any
  let testProfile: any

  beforeAll(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'profile-test@example.com',
        name: 'Profile Test User',
        image: 'https://example.com/avatar.jpg',
        role: 'STUDENT',
      },
    })

    // Create test profile
    testProfile = await prisma.profile.create({
      data: {
        userId: testUser.id,
        bio: 'Test user bio',
        location: 'Test City',
        timezone: 'America/New_York',
        phone: '+1234567890',
      },
    })
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.profile.delete({ where: { id: testProfile.id } })
    await prisma.user.delete({ where: { id: testUser.id } })
  })

  it('should retrieve user profile with all fields', async () => {
    const user = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: { profile: true },
    })

    expect(user).toBeDefined()
    expect(user?.email).toBe('profile-test@example.com')
    expect(user?.name).toBe('Profile Test User')
    expect(user?.image).toBe('https://example.com/avatar.jpg')
    expect(user?.profile).toBeDefined()
    expect(user?.profile?.bio).toBe('Test user bio')
    expect(user?.profile?.location).toBe('Test City')
    expect(user?.profile?.timezone).toBe('America/New_York')
    expect(user?.profile?.phone).toBe('+1234567890')
  })

  it('should update user basic information', async () => {
    const updatedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: {
        name: 'Updated Profile Test User',
        image: 'https://example.com/new-avatar.jpg',
      },
    })

    expect(updatedUser.name).toBe('Updated Profile Test User')
    expect(updatedUser.image).toBe('https://example.com/new-avatar.jpg')
  })

  it('should update profile extended information', async () => {
    const updatedProfile = await prisma.profile.update({
      where: { id: testProfile.id },
      data: {
        bio: 'Updated bio',
        location: 'Updated City',
        timezone: 'America/Los_Angeles',
        phone: '+9876543210',
      },
    })

    expect(updatedProfile.bio).toBe('Updated bio')
    expect(updatedProfile.location).toBe('Updated City')
    expect(updatedProfile.timezone).toBe('America/Los_Angeles')
    expect(updatedProfile.phone).toBe('+9876543210')
  })

  it('should persist profile updates', async () => {
    // Update profile
    await prisma.profile.update({
      where: { id: testProfile.id },
      data: {
        bio: 'Persisted bio',
      },
    })

    // Retrieve and verify
    const profile = await prisma.profile.findUnique({
      where: { id: testProfile.id },
    })

    expect(profile?.bio).toBe('Persisted bio')
  })

  it('should handle profile with null optional fields', async () => {
    // Create user without profile
    const minimalUser = await prisma.user.create({
      data: {
        email: 'minimal-profile@example.com',
        name: 'Minimal User',
        role: 'STUDENT',
      },
    })

    const user = await prisma.user.findUnique({
      where: { id: minimalUser.id },
      include: { profile: true },
    })

    expect(user).toBeDefined()
    expect(user?.profile).toBeNull()

    // Clean up
    await prisma.user.delete({ where: { id: minimalUser.id } })
  })

  it('should create profile for user without one', async () => {
    // Create user without profile
    const newUser = await prisma.user.create({
      data: {
        email: 'new-profile@example.com',
        name: 'New Profile User',
        role: 'STUDENT',
      },
    })

    // Create profile
    const newProfile = await prisma.profile.create({
      data: {
        userId: newUser.id,
        bio: 'New profile bio',
      },
    })

    const userWithProfile = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: { profile: true },
    })

    expect(userWithProfile?.profile).toBeDefined()
    expect(userWithProfile?.profile?.bio).toBe('New profile bio')

    // Clean up
    await prisma.profile.delete({ where: { id: newProfile.id } })
    await prisma.user.delete({ where: { id: newUser.id } })
  })

  it('should update user timestamps on profile changes', async () => {
    const userBefore = await prisma.user.findUnique({
      where: { id: testUser.id },
    })

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 100))

    await prisma.user.update({
      where: { id: testUser.id },
      data: {
        name: 'Timestamp Test User',
      },
    })

    const userAfter = await prisma.user.findUnique({
      where: { id: testUser.id },
    })

    expect(userAfter?.updatedAt.getTime()).toBeGreaterThan(
      userBefore?.updatedAt.getTime() || 0
    )
  })

  it('should display profile information consistently', async () => {
    const user = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: { profile: true },
    })

    // Verify all profile fields are accessible
    expect(user?.email).toBeDefined()
    expect(user?.name).toBeDefined()
    expect(user?.role).toBeDefined()
    expect(user?.createdAt).toBeDefined()
    expect(user?.updatedAt).toBeDefined()
    
    if (user?.profile) {
      expect(user.profile.bio).toBeDefined()
      expect(user.profile.location).toBeDefined()
      expect(user.profile.timezone).toBeDefined()
      expect(user.profile.phone).toBeDefined()
    }
  })

  it('should handle profile photo URL updates', async () => {
    const photoUrls = [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
      null,
    ]

    for (const photoUrl of photoUrls) {
      await prisma.user.update({
        where: { id: testUser.id },
        data: { image: photoUrl },
      })

      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
      })

      expect(user?.image).toBe(photoUrl)
    }
  })

  it('should maintain profile-user relationship integrity', async () => {
    const profile = await prisma.profile.findUnique({
      where: { id: testProfile.id },
      include: { user: true },
    })

    expect(profile).toBeDefined()
    expect(profile?.user).toBeDefined()
    expect(profile?.user.id).toBe(testUser.id)
    expect(profile?.user.email).toBe(testUser.email)
  })
})
