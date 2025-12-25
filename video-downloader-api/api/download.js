// api/download.js - Vercel Serverless Function
// Deploy this to Vercel and get your API endpoint

const ytdl = require('ytdl-core');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, type } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    if (type === 'youtube') {
      // Validate YouTube URL
      if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
      }

      // Get video info
      const info = await ytdl.getInfo(url);
      const formats = info.formats
        .filter(format => format.hasVideo && format.hasAudio)
        .map(format => ({
          quality: format.qualityLabel,
          url: format.url,
          mimeType: format.mimeType,
          filesize: format.contentLength,
          container: format.container
        }));

      return res.status(200).json({
        success: true,
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails[0].url,
        formats: formats
      });

    } else if (type === 'twitter') {
      // For Twitter, we'll use a different approach
      // Twitter requires API authentication which is complex
      // Better to use a third-party API or library
      
      return res.status(200).json({
        success: false,
        message: 'Twitter downloads require additional setup. Use redirect method instead.',
        redirectUrl: `https://ssstwitter.com/?url=${encodeURIComponent(url)}`
      });

    } else {
      return res.status(400).json({ error: 'Invalid type. Use "youtube" or "twitter"' });
    }

  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ 
      error: 'Failed to process video',
      message: error.message 
    });
  }
}

// Note: You need to install ytdl-core in your Vercel project
// Add to package.json:
// {
//   "dependencies": {
//     "ytdl-core": "^4.11.5"
//   }
// }
