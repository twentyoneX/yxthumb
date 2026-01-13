# YouTube Video Downloader API

A reliable video downloader API powered by **yt-dlp** deployed on Vercel.

## 🚀 Features

- ✅ YouTube video downloads in multiple qualities
- ✅ Direct download links (no redirects)
- ✅ Supports 1000+ websites (Twitter, TikTok, Instagram, etc.)
- ✅ Fast and reliable
- ✅ Free hosting on Vercel
- ✅ Auto-updates with yt-dlp

## 📁 Repository Structure

```
yxthumb/
├── api/
│   └── download.py       # Main API endpoint
├── requirements.txt      # Python dependencies
├── vercel.json          # Vercel configuration
└── README.md            # This file
```

## 🔧 Setup Instructions

### Step 1: Update Your Repository

Replace or create these files in your GitHub repository:

1. **Delete old files:**
   - `api/download.js` (if exists)
   - `package.json` (if exists)

2. **Create/Update these files:**
   - `api/download.py` - The Python API endpoint
   - `requirements.txt` - Python dependencies
   - `vercel.json` - Vercel configuration

### Step 2: Deploy to Vercel

Vercel will automatically detect the changes and redeploy when you push to GitHub:

```bash
cd yxthumb
git add .
git commit -m "Switch to yt-dlp Python API"
git push
```

### Step 3: Wait for Deployment

- Go to your Vercel dashboard
- Wait 2-3 minutes for the build to complete
- Check for a green "Ready" status

### Step 4: Test the API

Visit this URL in your browser:
```
https://yxthumb.vercel.app/api/download?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&type=youtube
```

You should see JSON response with:
- Video title
- Thumbnail
- Multiple download formats with direct URLs

## 🎯 API Usage

### Request

```
GET /api/download?url={VIDEO_URL}&type=youtube
```

### Parameters

- `url` (required): The video URL
- `type` (optional): Platform type (default: "youtube")

### Response

```json
{
  "success": true,
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": 240,
  "uploader": "Channel Name",
  "formats": [
    {
      "quality": "1080p",
      "url": "https://...",
      "filesize": 52428800,
      "ext": "mp4"
    }
  ]
}
```

## 🔍 Troubleshooting

### Build Fails

1. Check Vercel build logs
2. Ensure `requirements.txt` is in the root directory
3. Verify `api/download.py` has no syntax errors

### API Returns 404

1. Ensure file is named exactly `api/download.py`
2. Check `vercel.json` is configured correctly
3. Redeploy from Vercel dashboard

### Video Download Fails

1. Check if the video is public and available
2. Test with a different video URL
3. Check Vercel runtime logs for errors

## 📚 Supported Platforms

Thanks to yt-dlp, this API supports:

- YouTube
- Twitter/X
- Instagram
- TikTok
- Facebook
- Vimeo
- Dailymotion
- And 1000+ more sites!

## ⚡ Performance

- **Cold start**: ~2-5 seconds
- **Warm start**: ~1-2 seconds
- **Rate limit**: 100 requests per hour (Vercel free tier)

## 🆘 Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Test the API endpoint directly
3. Verify your Blogger template is using the correct API URL

## 📝 License

Open source - feel free to use and modify!
