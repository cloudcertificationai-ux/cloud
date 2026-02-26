// src/app/api/admin/media/__tests__/admin-media-api.test.ts
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { GET } from '../route';
import { POST as presignPost } from '../presign/route';
import { POST as completePost } from '../complete/route';
import { DELETE, PATCH } from '../[id]/route';
import prisma from '@/lib/db';
import { getMediaService } from '@/lib/media-service';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));
jest.mock('@/lib/media-service');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockPrismaUserFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>;
const mockGetMediaService = getMediaService as jest.MockedFunction<typeof getMediaService>;

describe('Admin Media API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/admin/media/presign', () => {
    it('should return 401 if not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/media/presign', {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.mp4',
          fileType: 'video/mp4',
          fileSize: 1000000,
        }),
      });

      const response = await presignPost(request);
      expect(response.status).toBe(401);
    });

    it('should return 403 if user is not admin or instructor', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'student@test.com' },
      } as any);

      mockPrismaUserFindUnique.mockResolvedValue({
        id: 'user-1',
        role: 'STUDENT',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/media/presign', {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.mp4',
          fileType: 'video/mp4',
          fileSize: 1000000,
        }),
      });

      const response = await presignPost(request);
      expect(response.status).toBe(403);
    });

    it('should return 400 if required fields are missing', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'instructor@test.com' },
      } as any);

      mockPrismaUserFindUnique.mockResolvedValue({
        id: 'user-1',
        role: 'INSTRUCTOR',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/media/presign', {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.mp4',
        }),
      });

      const response = await presignPost(request);
      expect(response.status).toBe(400);
    });

    it('should generate presigned URL for valid request', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'instructor@test.com' },
      } as any);

      mockPrismaUserFindUnique.mockResolvedValue({
        id: 'user-1',
        role: 'INSTRUCTOR',
      } as any);

      const mockMediaService = {
        generatePresignedUpload: jest.fn().mockResolvedValue({
          uploadUrl: 'https://r2.example.com/presigned-url',
          mediaId: 'media-1',
          expiresAt: new Date('2024-01-01T12:00:00Z'),
        }),
      };

      mockGetMediaService.mockReturnValue(mockMediaService as any);

      const request = new NextRequest('http://localhost:3000/api/admin/media/presign', {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.mp4',
          fileType: 'video/mp4',
          fileSize: 1000000,
        }),
      });

      const response = await presignPost(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.uploadUrl).toBe('https://r2.example.com/presigned-url');
      expect(data.data.mediaId).toBe('media-1');
    });
  });

  describe('GET /api/admin/media', () => {
    it('should return 401 if not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/media');

      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('should return 403 if user is not admin or instructor', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'student@test.com' },
      } as any);

      mockPrismaUserFindUnique.mockResolvedValue({
        id: 'user-1',
        role: 'STUDENT',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/media');

      const response = await GET(request);
      expect(response.status).toBe(403);
    });

    it('should list media with pagination', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'instructor@test.com' },
      } as any);

      mockPrismaUserFindUnique.mockResolvedValue({
        id: 'user-1',
        role: 'INSTRUCTOR',
      } as any);

      const mockMediaService = {
        listMedia: jest.fn().mockResolvedValue({
          media: [
            {
              id: 'media-1',
              originalName: 'test.mp4',
              r2Key: 'media/media-1/test.mp4',
              manifestUrl: null,
              thumbnails: [],
              duration: null,
              width: null,
              height: null,
              fileSize: BigInt(1000000),
              mimeType: 'video/mp4',
              status: 'UPLOADED',
              metadata: {},
              uploadedBy: 'user-1',
              user: {
                id: 'user-1',
                name: 'Test User',
                email: 'instructor@test.com',
              },
              createdAt: new Date('2024-01-01T12:00:00Z'),
              updatedAt: new Date('2024-01-01T12:00:00Z'),
            },
          ],
          total: 1,
          page: 1,
        }),
      };

      mockGetMediaService.mockReturnValue(mockMediaService as any);

      const request = new NextRequest('http://localhost:3000/api/admin/media?page=1&limit=20');

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.pagination.total).toBe(1);
    });
  });

  describe('DELETE /api/admin/media/[id]', () => {
    it('should return 401 if not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/media/media-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'media-1' } });
      expect(response.status).toBe(401);
    });

    it('should delete media successfully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'instructor@test.com' },
      } as any);

      mockPrismaUserFindUnique.mockResolvedValue({
        id: 'user-1',
        role: 'INSTRUCTOR',
      } as any);

      const mockMediaService = {
        deleteMedia: jest.fn().mockResolvedValue(undefined),
      };

      mockGetMediaService.mockReturnValue(mockMediaService as any);

      const request = new NextRequest('http://localhost:3000/api/admin/media/media-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'media-1' } });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(mockMediaService.deleteMedia).toHaveBeenCalledWith('media-1', 'user-1');
    });
  });

  describe('PATCH /api/admin/media/[id]', () => {
    it('should return 401 if not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/media/media-1', {
        method: 'PATCH',
        body: JSON.stringify({ originalName: 'updated.mp4' }),
      });

      const response = await PATCH(request, { params: { id: 'media-1' } });
      expect(response.status).toBe(401);
    });

    it('should update media successfully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'instructor@test.com' },
      } as any);

      mockPrismaUserFindUnique.mockResolvedValue({
        id: 'user-1',
        role: 'INSTRUCTOR',
      } as any);

      const mockMediaService = {
        updateMedia: jest.fn().mockResolvedValue({
          id: 'media-1',
          originalName: 'updated.mp4',
          r2Key: 'media/media-1/test.mp4',
          manifestUrl: null,
          thumbnails: [],
          duration: null,
          width: null,
          height: null,
          fileSize: BigInt(1000000),
          mimeType: 'video/mp4',
          status: 'UPLOADED',
          metadata: {},
          uploadedBy: 'user-1',
          createdAt: new Date('2024-01-01T12:00:00Z'),
          updatedAt: new Date('2024-01-01T12:00:00Z'),
        }),
      };

      mockGetMediaService.mockReturnValue(mockMediaService as any);

      const request = new NextRequest('http://localhost:3000/api/admin/media/media-1', {
        method: 'PATCH',
        body: JSON.stringify({ originalName: 'updated.mp4' }),
      });

      const response = await PATCH(request, { params: { id: 'media-1' } });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.originalName).toBe('updated.mp4');
    });
  });
});
