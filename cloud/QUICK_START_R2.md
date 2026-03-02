# Quick Start: R2 Media Upload

Get media uploads working in 5 minutes.

## 1. Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → R2
2. Click "Create bucket"
3. Name it `anywheredoor-media`
4. Click "Create bucket"

## 2. Get API Credentials

1. In R2 dashboard, click "Manage R2 API Tokens"
2. Click "Create API Token"
3. Set permissions: "Object Read & Write"
4. Copy the credentials shown (only shown once!)

## 3. Configure Environment

Create `anywheredoor_admin/.env`:

```bash
R2_ACCOUNT_ID=your-account-id-here
R2_ACCESS_KEY_ID=your-access-key-here
R2_SECRET_ACCESS_KEY=your-secret-key-here
R2_BUCKET_NAME=anywheredoor-media
R2_PUBLIC_DOMAIN=https://pub-xxxxx.r2.dev
```

Find your Account ID in the R2 overview page.

## 4. Configure CORS

In your bucket settings → CORS Policy:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3001"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## 5. Test It

```bash
cd anywheredoor_admin
npm run dev
```

Navigate to course creation and try uploading an image!

## Troubleshooting

**"R2_NOT_CONFIGURED" error?**
→ Check all environment variables are set in `.env`

**CORS error?**
→ Verify CORS policy includes your localhost URL

**Upload fails?**
→ Check API token has "Object Read & Write" permissions

## Next Steps

- See `R2_SETUP_GUIDE.md` for detailed setup
- See `MEDIA_UPLOAD_USAGE.md` for usage examples
- Set up custom domain for production

## Cost

Free tier includes:
- 10 GB storage
- 1 million Class A operations/month
- 10 million Class B operations/month
- Unlimited egress (always free!)

Perfect for development and small production deployments.
