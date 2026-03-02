# Blog System Setup Guide

A complete blog system has been created with admin panel integration and Cloudflare R2 image storage.

## Features Implemented

### 1. Database Schema
- Added `BlogPost` model to both Prisma schemas (cloud_website and cloud)
- Fields include: title, slug, excerpt, content, cover image, tags, SEO metadata, publish status
- Automatic view tracking
- Author relationship with User model

### 2. Website Blog Pages
- **Blog Listing Page** (`/blog`): Displays all published blog posts with featured post section
- **Blog Detail Page** (`/blog/[slug]`): Individual blog post view with related articles
- Responsive design with image optimization
- SEO-friendly with metadata

### 3. Admin Panel
- **Blog Management** (`/admin/blog`): List all blog posts with filters (all/published/draft)
- **Create Blog** (`/admin/blog/new`): Rich text editor for creating new posts
- **Edit Blog** (`/admin/blog/edit/[id]`): Edit existing blog posts
- Professional WYSIWYG editor with React Quill
- Image upload integration with Cloudflare R2
- Tag management
- SEO settings (meta title, meta description)
- Publish/Featured toggles

### 4. API Endpoints

#### Website APIs (`cloud_website/src/app/api/blog/`)
- `GET /api/blog` - Fetch published blog posts
- `POST /api/blog` - Create new blog post (admin only)
- `GET /api/blog/[id]` - Get single blog post
- `PUT /api/blog/[id]` - Update blog post (admin only)
- `DELETE /api/blog/[id]` - Delete blog post (admin only)

#### Admin Panel APIs (`cloud/src/app/api/blog/`)
- Same endpoints with admin authentication

### 5. Navigation Updates
- Added "Blog" link to main website navigation (after Contact)
- Added "Blog" to admin panel sidebar

## Installation Steps

### 1. Install Dependencies

For the admin panel, add React Quill:
```bash
cd cloud
npm install react-quill@2.0.0
npm install @types/react-quill --save-dev
```

For the website (if not already installed):
```bash
cd cloud_website
npm install date-fns
```

### 2. Run Database Migrations

For cloud_website:
```bash
cd cloud_website
npx prisma migrate dev --name add_blog_posts
npx prisma generate
```

For cloud (admin panel):
```bash
cd cloud
npx prisma migrate dev --name add_blog_posts
npx prisma generate
```

### 3. Environment Variables

Ensure your `.env` files have the necessary Cloudflare R2 credentials:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

### 4. Image Upload Setup

The blog editor uses the existing media upload API. Ensure the following endpoint exists:

`/api/media/upload` - Should handle file uploads to Cloudflare R2

If this endpoint doesn't exist, create it at `cloud/src/app/api/media/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `blog/${Date.now()}-${file.name}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const url = `${process.env.R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

## Usage Guide

### Creating a Blog Post

1. Navigate to `/admin/blog` in the admin panel
2. Click "Create New Post"
3. Fill in the required fields:
   - **Title**: Main blog post title
   - **Slug**: URL-friendly identifier (auto-generated from title)
   - **Excerpt**: Brief summary for listings
   - **Content**: Full blog post content using the rich text editor
   - **Cover Image**: Upload an image (stored in Cloudflare R2)
   - **Tags**: Add relevant tags
   - **SEO Settings**: Optional meta title and description
4. Toggle "Published" to make it live
5. Toggle "Featured" to show it prominently on the blog page
6. Click "Save Post"

### Managing Blog Posts

- **View All Posts**: See all blog posts with status indicators
- **Filter**: Switch between All, Published, and Draft posts
- **Edit**: Click "Edit" to modify any post
- **Delete**: Click "Delete" to remove a post (with confirmation)
- **View Stats**: See view counts for each post

### Blog Post Features

- **Rich Text Editor**: Format text, add headings, lists, links, and images
- **Image Management**: Upload and manage cover images via Cloudflare R2
- **SEO Optimization**: Custom meta titles and descriptions
- **Tag System**: Organize posts with tags
- **Draft System**: Save posts as drafts before publishing
- **Featured Posts**: Highlight important posts on the blog page
- **View Tracking**: Automatic view count increment
- **Related Posts**: Automatically show related articles

## File Structure

```
cloud_website/
├── src/app/
│   ├── blog/
│   │   ├── page.tsx                    # Blog listing page
│   │   └── [slug]/
│   │       └── page.tsx                # Blog detail page
│   └── api/blog/
│       ├── route.ts                    # Blog API endpoints
│       └── [id]/route.ts               # Single blog API endpoints
├── prisma/
│   └── schema.prisma                   # Updated with BlogPost model

cloud/
├── src/app/
│   ├── admin/blog/
│   │   ├── page.tsx                    # Blog management page
│   │   ├── new/page.tsx                # Create blog page
│   │   ├── edit/[id]/page.tsx          # Edit blog page
│   │   └── components/
│   │       └── BlogEditor.tsx          # Rich text editor component
│   └── api/blog/
│       ├── route.ts                    # Admin blog API
│       └── [id]/route.ts               # Admin single blog API
├── prisma/
│   └── schema.prisma                   # Updated with BlogPost model
```

## Security Features

- Admin-only access to create/edit/delete operations
- Session-based authentication via NextAuth
- Input validation and sanitization
- Slug uniqueness validation
- Secure file uploads to Cloudflare R2

## Performance Optimizations

- Image optimization with Next.js Image component
- Lazy loading of blog posts
- Efficient database queries with Prisma
- CDN delivery via Cloudflare R2
- Server-side rendering for SEO

## Troubleshooting

### Issue: React Quill not loading
**Solution**: Ensure React Quill is dynamically imported with `ssr: false`

### Issue: Images not uploading
**Solution**: Check R2 credentials in `.env` and verify the upload API endpoint exists

### Issue: Blog posts not showing
**Solution**: Ensure posts are marked as "Published" and run database migrations

### Issue: Slug conflicts
**Solution**: The system automatically validates slug uniqueness and shows an error

## Next Steps

1. Run the database migrations
2. Install the required dependencies
3. Test creating a blog post in the admin panel
4. Verify the blog appears on the website
5. Customize the styling to match your brand

## Support

For issues or questions, refer to:
- Prisma documentation: https://www.prisma.io/docs
- Next.js documentation: https://nextjs.org/docs
- React Quill documentation: https://github.com/zenoamaro/react-quill
- Cloudflare R2 documentation: https://developers.cloudflare.com/r2/
