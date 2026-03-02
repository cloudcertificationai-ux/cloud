# VOD Media System Setup Guide

This guide walks you through setting up the Video-on-Demand (VOD) Media System for AnyWhereDoor, including Cloudflare R2 storage, video transcoding, and secure playback.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Cloudflare R2 Setup](#cloudflare-r2-setup)
3. [Environment Configuration](#environment-configuration)
4. [FFmpeg Installation](#ffmpeg-installation)
5. [BullMQ Worker Deployment](#bullmq-worker-deployment)
6. [Cloudflare Signed URL Setup](#cloudflare-signed-url-setup)
7. [Testing the Setup](#testing-the-setup)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before setting up the VOD system, ensure you have:

- **Cloudflare Account** with R2 enabled (requires Workers Paid plan or higher)
- **PostgreSQL Database** (configured in `DATABASE_URL`)
- **Redis Instance** (configured in `REDIS_URL`)
- **Node.js 18+** installed
- **FFmpeg** with H.264 encoding support (for video transcoding)
- **Admin access** to the Cloudflare dashboard

---

## Cloudflare R2 Setup

### Step 1: Create an R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2 Object Storage** in the left sidebar
3. Click **Create bucket**
4. Enter a bucket name (e.g., `anywheredoor-media`)
5. Choose a location hint (closest to your users)
6. Click **Create bucket**

### Step 2: Configure CORS

R2 buckets need CORS configuration to allow uploads from your application.

1. Go to your bucket's **Settings** tab
2. Scroll to **CORS Policy**
3. Click **Add CORS policy**
4. Add the following configuration:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://your-production-domain.com"
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

5. Replace `your-production-domain.com` with your actual domain
6. Click **Save**

### Step 3: Generate API Tokens

1. Click **Manage R2 API Tokens** in the R2 overview
2. Click **Create API Token**
3. Configure the token:
   - **Token name**: `AnyWhereDoor Production`
   - **Permissions**: `Object Read & Write`
   - **TTL**: Choose based on your security policy (or leave as "Forever")
4. Click **Create API Token**
5. **Important**: Copy the **Access Key ID** and **Secret Access Key** immediately (shown only once!)
6. Store these securely - you'll need them for environment variables

### Step 4: Get Your Account ID

1. Your Account ID is visible in the R2 overview page URL
2. Format: `https://dash.cloudflare.com/{ACCOUNT_ID}/r2`
3. Copy the Account ID for environment configuration

### Step 5: Configure Public Access (Optional)

For CDN delivery without signed URLs:

1. Go to bucket **Settings**
2. Under **Public Access**, click **Allow Access**
3. Note the public R2.dev domain (e.g., `https://your-bucket.r2.dev`)

**For custom domains:**
1. Go to **Settings** > **Custom Domains**
2. Click **Connect Domain**
3. Enter your domain (e.g., `cdn.anywheredoor.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation

---

## Environment Configuration

### Step 1: Copy Environment Template

```bash
cd anywheredoor
cp .env.example .env
```

### Step 2: Configure R2 Variables

Update the following in your `.env` file:

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID="your-account-id-from-step-4"
R2_ACCESS_KEY_ID="your-access-key-from-step-3"
R2_SECRET_ACCESS_KEY="your-secret-key-from-step-3"
R2_BUCKET_NAME="anywheredoor-media"
R2_PUBLIC_DOMAIN="https://your-bucket.r2.dev"
```

### Step 3: Configure Redis

Ensure Redis is configured for BullMQ job queue:

```bash
# Local development
REDIS_URL="redis://localhost:6379"

# Production with authentication
REDIS_URL="redis://username:password@redis-host:6379"
```

---

## FFmpeg Installation

FFmpeg is required for video transcoding. Install with H.264 encoding support.

### macOS

```bash
# Using Homebrew
brew install ffmpeg

# Verify installation
ffmpeg -version
ffmpeg -codecs | grep h264
```

### Ubuntu/Debian

```bash
# Install FFmpeg with common codecs
sudo apt update
sudo apt install ffmpeg

# Verify installation
ffmpeg -version
ffmpeg -codecs | grep h264
```

### Docker (Recommended for Production)

Use an FFmpeg-enabled Docker image for the transcode worker:

```dockerfile
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Copy application
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Run worker
CMD ["node", "dist/workers/transcode-worker.js"]
```

### AWS MediaConvert Alternative

For serverless transcoding without managing FFmpeg:

1. Set up AWS MediaConvert in your AWS account
2. Create an IAM role with MediaConvert permissions
3. Update `TranscodeService` to use MediaConvert API instead of local FFmpeg
4. Configure MediaConvert job templates for HLS output

**Note**: This requires code changes in `src/lib/transcode-service.ts` and `src/workers/transcode-worker.ts`.

---

## BullMQ Worker Deployment

The transcode worker processes video encoding jobs asynchronously.

### Option 1: Local Development

Run the worker alongside your Next.js app:

```bash
# Terminal 1: Start Next.js app
npm run dev

# Terminal 2: Start transcode worker
npm run worker:transcode
```

Add to `package.json`:

```json
{
  "scripts": {
    "worker:transcode": "tsx src/workers/transcode-worker.ts"
  }
}
```

### Option 2: Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - R2_ACCOUNT_ID=${R2_ACCOUNT_ID}
      - R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
      - R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
    depends_on:
      - redis
      - postgres

  worker:
    build: .
    command: node dist/workers/transcode-worker.js
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - R2_ACCOUNT_ID=${R2_ACCOUNT_ID}
      - R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
      - R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=anywheredoor
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
```

Run with:

```bash
docker-compose up -d
```

### Option 3: AWS ECS (Production)

1. **Build Docker image**:
   ```bash
   docker build -t anywheredoor-worker:latest .
   ```

2. **Push to ECR**:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin {account-id}.dkr.ecr.us-east-1.amazonaws.com
   docker tag anywheredoor-worker:latest {account-id}.dkr.ecr.us-east-1.amazonaws.com/anywheredoor-worker:latest
   docker push {account-id}.dkr.ecr.us-east-1.amazonaws.com/anywheredoor-worker:latest
   ```

3. **Create ECS Task Definition**:
   - Container: Use ECR image
   - CPU: 2048 (2 vCPU)
   - Memory: 4096 MB (4 GB)
   - Environment variables: Add all R2 and Redis configs

4. **Create ECS Service**:
   - Launch type: Fargate
   - Desired tasks: 2 (for redundancy)
   - Auto-scaling: Scale based on BullMQ queue depth

### Option 4: Kubernetes

Create deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: transcode-worker
spec:
  replicas: 2
  selector:
    matchLabels:
      app: transcode-worker
  template:
    metadata:
      labels:
        app: transcode-worker
    spec:
      containers:
      - name: worker
        image: anywheredoor-worker:latest
        env:
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: redis-url
        - name: R2_ACCESS_KEY_ID
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: r2-access-key
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
```

---

## Cloudflare Signed URL Setup

Signed URLs provide secure, time-limited access to videos for enrolled students only.

### Step 1: Generate Key Pair

1. Go to your R2 bucket in Cloudflare Dashboard
2. Navigate to **Settings** tab
3. Scroll to **Signed URLs** section
4. Click **Generate Key Pair**
5. Copy the **Key Pair ID** (save for `CLOUDFLARE_KEY_PAIR_ID`)
6. Click **Download Private Key** (saves as `.pem` file)

### Step 2: Convert Private Key to Base64

```bash
# Convert PEM to base64 (single line)
cat private-key.pem | base64 | tr -d '\n'
```

Copy the output for `CLOUDFLARE_PRIVATE_KEY`.

### Step 3: Update Environment Variables

Add to `.env`:

```bash
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_KEY_PAIR_ID="your-key-pair-id"
CLOUDFLARE_PRIVATE_KEY="your-base64-private-key"
```

### Step 4: Secure the Private Key

**Important security practices:**

- Never commit `.env` to version control
- Use secret management in production (AWS Secrets Manager, HashiCorp Vault, etc.)
- Rotate keys periodically
- Restrict key access to authorized personnel only

---

## Testing the Setup

### 1. Test R2 Connection

```bash
# Run the R2 client test
npm run test -- r2-client.test.ts
```

### 2. Test Media Upload

1. Start the application:
   ```bash
   npm run dev
   ```

2. Log in as an instructor
3. Navigate to Media Library
4. Upload a test video (small file, e.g., 10MB)
5. Check the upload completes successfully

### 3. Test Transcoding

1. After upload, check the transcode worker logs:
   ```bash
   # If running locally
   tail -f logs/transcode-worker.log
   
   # If using Docker
   docker-compose logs -f worker
   ```

2. Verify the Media status changes:
   - `UPLOADED` → `PROCESSING` → `READY`

3. Check R2 bucket for HLS outputs:
   - `media/{mediaId}/master.m3u8`
   - `media/{mediaId}/1080p/`, `720p/`, `480p/` directories
   - `media/{mediaId}/thumbnails/` directory

### 4. Test Playback

1. Log in as a student
2. Enroll in a course with a video lesson
3. Navigate to the video lesson
4. Verify:
   - Video player loads
   - Quality selector shows variants (1080p, 720p, 480p)
   - Playback works smoothly
   - Progress tracking updates

---

## Troubleshooting

### Issue: "Access Denied" when uploading to R2

**Cause**: Incorrect API credentials or insufficient permissions.

**Solution**:
1. Verify `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` are correct
2. Check API token has "Object Read & Write" permissions
3. Ensure bucket name matches `R2_BUCKET_NAME`
4. Test credentials with AWS CLI:
   ```bash
   aws s3 ls --endpoint-url https://{account-id}.r2.cloudflarestorage.com s3://{bucket-name}
   ```

### Issue: CORS errors during upload

**Cause**: CORS policy not configured or incorrect origins.

**Solution**:
1. Check CORS policy in R2 bucket settings
2. Ensure `AllowedOrigins` includes your app URL
3. Verify `AllowedMethods` includes `PUT` and `POST`
4. Clear browser cache and retry

### Issue: Transcode worker not processing jobs

**Cause**: Worker not running, Redis connection issue, or FFmpeg not installed.

**Solution**:
1. Check worker is running:
   ```bash
   ps aux | grep transcode-worker
   ```
2. Verify Redis connection:
   ```bash
   redis-cli -u $REDIS_URL ping
   ```
3. Check FFmpeg is installed:
   ```bash
   ffmpeg -version
   ```
4. Review worker logs for errors
5. Restart worker:
   ```bash
   npm run worker:transcode
   ```

### Issue: Video transcoding fails with "codec not found"

**Cause**: FFmpeg missing H.264 encoder.

**Solution**:
1. Check available codecs:
   ```bash
   ffmpeg -codecs | grep h264
   ```
2. Reinstall FFmpeg with full codec support:
   ```bash
   # macOS
   brew reinstall ffmpeg
   
   # Ubuntu
   sudo apt install ffmpeg libavcodec-extra
   ```

### Issue: Signed URLs return 403 Forbidden

**Cause**: Invalid signature, expired URL, or incorrect key pair.

**Solution**:
1. Verify `CLOUDFLARE_KEY_PAIR_ID` matches the generated key pair
2. Check `CLOUDFLARE_PRIVATE_KEY` is correctly base64-encoded
3. Ensure URL hasn't expired (default: 5 minutes)
4. Test key pair in Cloudflare dashboard
5. Regenerate key pair if necessary

### Issue: HLS playback stutters or buffers frequently

**Cause**: Insufficient bandwidth, CDN not configured, or segment size too large.

**Solution**:
1. Enable CDN with custom domain for R2 bucket
2. Verify CDN cache headers are set correctly
3. Reduce HLS segment duration (default: 6 seconds)
4. Check network conditions with browser DevTools
5. Consider adding more quality variants for adaptive streaming

### Issue: Progress not saving during playback

**Cause**: Heartbeat not sending, Redis connection issue, or authentication problem.

**Solution**:
1. Check browser console for heartbeat errors
2. Verify Redis is running and accessible
3. Check NextAuth session is valid
4. Review API logs for `/api/progress` endpoint
5. Test with network throttling disabled

### Issue: "Media not found" after upload

**Cause**: Database record not created or R2 upload incomplete.

**Solution**:
1. Check database for Media record:
   ```sql
   SELECT * FROM "Media" WHERE id = 'media-id';
   ```
2. Verify R2 object exists:
   ```bash
   aws s3 ls --endpoint-url https://{account-id}.r2.cloudflarestorage.com s3://{bucket-name}/media/{media-id}/
   ```
3. Review upload completion API logs
4. Check for transaction rollbacks in database logs

### Issue: Worker running out of memory during transcoding

**Cause**: Large video files or insufficient worker resources.

**Solution**:
1. Increase worker memory allocation:
   ```bash
   # Docker
   docker run --memory="4g" ...
   
   # Node.js
   NODE_OPTIONS="--max-old-space-size=4096" npm run worker:transcode
   ```
2. Implement streaming transcoding instead of loading entire file
3. Add file size limits in upload validation
4. Scale horizontally with multiple workers

### Getting Help

If you encounter issues not covered here:

1. Check application logs: `logs/app.log`
2. Check worker logs: `logs/transcode-worker.log`
3. Review Cloudflare R2 dashboard for bucket metrics
4. Check Redis queue status:
   ```bash
   redis-cli -u $REDIS_URL
   > LLEN bull:transcode:wait
   > LLEN bull:transcode:active
   > LLEN bull:transcode:failed
   ```
5. Enable debug logging:
   ```bash
   DEBUG=* npm run dev
   ```

---

## Next Steps

After completing the setup:

1. Review the [Admin Media Management Guide](./ADMIN_MEDIA_GUIDE.md)
2. Configure monitoring and alerts for transcode failures
3. Set up backup and disaster recovery for R2 bucket
4. Implement CDN caching strategy
5. Configure video watermarking (optional)
6. Set up analytics for video engagement tracking

---

## Additional Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [HLS Specification](https://datatracker.ietf.org/doc/html/rfc8216)
- [VOD System Design Document](./.kiro/specs/vod-media-system/design.md)
