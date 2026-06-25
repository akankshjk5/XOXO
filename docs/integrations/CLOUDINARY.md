# Cloudinary Image Uploads

## Integration

| | |
|---|---|
| **Config** | `backend/src/config/cloudinary.js` |
| **Controller** | `backend/src/controllers/upload.controller.js` |
| **Route** | `POST /api/upload` (auth required) |

## Environment variables

```env
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

All three required for live mode. Any missing → local disk fallback.

## API

### Upload

```http
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
file: <image>
```

### Live response

```json
{
  "success": true,
  "url": "https://res.cloudinary.com/your_cloud/image/upload/v123/xoxo-travels/abc.jpg",
  "provider": "cloudinary",
  "live": true
}
```

### Demo / fallback response

```json
{
  "success": true,
  "url": "http://localhost:5000/uploads/abc.jpg",
  "provider": "local",
  "live": false,
  "demo": true
}
```

### Status

```http
GET /api/upload/status
```

## Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Dashboard → copy Cloud name, API Key, API Secret
3. Set all three env vars on backend
4. Ensure `next.config.mjs` allows `res.cloudinary.com` (already configured)

## Upload folder

All uploads go to Cloudinary folder: `xoxo-travels/`

Used by:
- Dashboard avatar upload
- Social post images
- Verification document uploads

## Retry & fallback

- Cloudinary upload: 3× retry on transient errors
- On failure: automatically falls back to local `backend/uploads/`
- Local files served at `/uploads/*` — **not persistent** in Docker/serverless without volume

## Production requirement

> **Cloudinary is required for production.** Local disk uploads are lost on container restart.

## Status check

```json
"uploads": {
  "configured": true,
  "cloudName": "your_cloud",
  "folder": "xoxo-travels"
}
```

## Security

- Upload route requires JWT authentication (`protect` middleware)
- Multer middleware validates file type/size (`upload.middleware.js`)
- Do not expose `CLOUDINARY_API_SECRET` to frontend

## Optimization (recommended)

Configure Cloudinary upload presets for:
- Auto format (`f_auto`)
- Auto quality (`q_auto`)
- Max width 1920 for user photos

Can be added via upload options in `cloudinary.js` when needed.
