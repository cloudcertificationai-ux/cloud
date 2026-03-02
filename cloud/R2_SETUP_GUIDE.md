# Cloudflare R2 Setup Guide

This guide walks you through setting up Cloudflare R2 storage for the AnyWhereDoor admin panel media uploads.

## Overview

Cloudflare R2 is an S3-compatible object storage service with zero egress fees. It's perfect for storing course media assets like videos, images, PDFs, and 3D models.

## Prerequisites

- Cloudflare account (free tier available)
- Admin access to your Cloudflare account

## Step 1: Create R2 Bucket

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** in the left sidebar
3. Click **Create bucket**
4. Enter a bucket name (e.g., `anywheredoor-media`)
5. Choose a location (automatic is recommended)
6. Click **Create bucket**

## Step 2: Configure Public Access (Optional)

If you want direct public access to your media files:

1. Go to your bucket settings
2. Click **Settings** tab
3. Under **Public access**, click **Allow Access**
4. Note the public bucket URL (e.g., `https://pub-xxxxx.r2.dev`)

Alternatively, you can set up a custom domain:

1. Go to **Settings** > **Custom Domains**
2. Click **Connect Domain**
3. Enter your domain (e.g., `media.yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation

## Step 3: Create API Token

1. In the R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API Token**
3. Configure the token:
   - **Token name**: `anywheredoor-admin-upload`
   - **Permissions**: 
     - Object Read & Write
   - **Bucket scope**: Select your bucket or choose "Apply to all buckets"
   - **TTL**: No expiry (or set as needed)
4. Click **Create API Token**
5. **Important**: Copy and save the following credentials:
   - Access Key ID
   - Secret Access Key
   - Account ID (found in the R2 overview page)

⚠️ **Warning**: The Secret Access Key is only shown once. Store it securely!

## Step 4: Configure CORS (for Browser Uploads)

1. Go to your bucket settings
2. Click **Settings** tab
3. Scroll to **CORS Policy**
4. Add the following CORS configuration:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3001",
      "https://admin.yourdomain.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

Replace `https://admin.yourdomain.com` with your actual admin panel domain.

## Step 5: Configure Environment Variables

### Admin Panel (.env)

Create or update `anywheredoor_admin/.env`:

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=anywheredoor-media
R2_PUBLIC_DOMAIN=https://media.yourdomain.com
```

**Where to find these values:**

- `R2_ACCOUNT_ID`: Found in R2 overview page or in the API token creation page
- `R2_ACCESS_KEY_ID`: From Step 3 (API token creation)
- `R2_SECRET_ACCESS_KEY`: From Step 3 (API token creation)
- `R2_BUCKET_NAME`: Your bucket name from Step 1
- `R2_PUBLIC_DOMAIN`: 
  - If using custom domain: `https://media.yourdomain.com`
  - If using public bucket URL: `https://pub-xxxxx.r2.dev`
  - If bucket is private: Leave as is (presigned URLs will be used)

## Step 6: Test the Configuration

1. Start the admin panel:
   ```bash
   cd anywheredoor_admin
   npm run dev
   ```

2. Navigate to course creation/editing page
3. Try uploading a test image or video
4. Verify the upload completes successfully
5. Check your R2 bucket to confirm the file appears

## File Organization

Files are automatically organized in R2 with the following structure:

```
anywheredoor-media/
├── courses/
│   ├── {courseId}/
│   │   ├── video/
│   │   │   └── {timestamp}-{filename}.mp4
│   │   ├── image/
│   │   │   └── {timestamp}-{filename}.jpg
│   │   ├── pdf/
│   │   │   └── {timestamp}-{filename}.pdf
│   │   └── 3d-model/
│   │       └── {timestamp}-{filename}.glb
```

## Upload Limits

The following limits are configured by default:

- **Videos**: 500 MB max
- **PDFs**: 50 MB max
- **Images**: 10 MB max
- **3D Models**: 100 MB max

These can be adjusted in `src/lib/r2-config.ts`.

## Supported File Types

### Videos
- MP4 (video/mp4)
- WebM (video/webm)
- OGG (video/ogg)

### Documents
- PDF (application/pdf)

### Images
- JPEG (image/jpeg)
- PNG (image/png)
- WebP (image/webp)
- GIF (image/gif)

### 3D Models
- GLB (model/gltf-binary)
- GLTF (model/gltf+json)

## Security Best Practices

1. **API Token Permissions**: Only grant necessary permissions (Object Read & Write)
2. **Bucket Scope**: Limit token to specific bucket if possible
3. **Environment Variables**: Never commit `.env` files to version control
4. **CORS Configuration**: Only allow your actual domains
5. **Token Rotation**: Periodically rotate API tokens
6. **Access Logs**: Enable R2 access logs for audit purposes

## Cost Considerations

Cloudflare R2 pricing (as of 2024):

- **Storage**: $0.015 per GB/month
- **Class A Operations** (writes): $4.50 per million requests
- **Class B Operations** (reads): $0.36 per million requests
- **Egress**: FREE (no bandwidth charges)

Example monthly cost for 100 GB storage with 10,000 uploads:
- Storage: 100 GB × $0.015 = $1.50
- Uploads: 10,000 × $4.50/1M = $0.045
- **Total**: ~$1.55/month

## Troubleshooting

### Upload fails with "R2_NOT_CONFIGURED"

**Solution**: Verify all environment variables are set correctly in `.env`

### Upload fails with "Access Denied"

**Solution**: 
1. Check API token has Object Read & Write permissions
2. Verify token is scoped to the correct bucket
3. Ensure bucket name matches `R2_BUCKET_NAME`

### CORS errors in browser console

**Solution**:
1. Verify CORS policy is configured in bucket settings
2. Ensure your admin panel URL is in `AllowedOrigins`
3. Check that `AllowedMethods` includes `PUT`

### Files upload but can't be accessed

**Solution**:
1. If using public access, ensure it's enabled in bucket settings
2. If using custom domain, verify DNS is configured correctly
3. Check `R2_PUBLIC_DOMAIN` matches your actual domain

### "Invalid endpoint" error

**Solution**: Verify `R2_ACCOUNT_ID` is correct. It should be your Cloudflare account ID, not your email.

## Migration from AWS S3

If you're migrating from AWS S3:

1. Use [rclone](https://rclone.org/) to copy files from S3 to R2
2. Update environment variables from AWS to R2
3. Update any hardcoded S3 URLs in your database
4. Test thoroughly before switching production traffic

Example rclone command:
```bash
rclone copy s3:old-bucket r2:new-bucket --progress
```

## Additional Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [R2 API Documentation](https://developers.cloudflare.com/r2/api/s3/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [R2 Limits](https://developers.cloudflare.com/r2/platform/limits/)

## Support

For issues specific to:
- **R2 Configuration**: Check Cloudflare R2 documentation
- **Application Issues**: Check application logs and error messages
- **CORS Issues**: Verify CORS policy and browser console errors

---

**Next Steps**: After completing this setup, refer to `MEDIA_UPLOAD_USAGE.md` for information on using the media upload functionality in your application.
