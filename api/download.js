// api/download.js
import ytdl from '@distube/ytdl-core';

export default async function handler(req, res) {
  // 1. Enable CORS
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
      // 2. Validate YouTube URL
      if (!ytdl.validateURL(url)) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid YouTube URL' 
        });
      }

      // 3. FIX: Create Agent with Cookies to bypass "Sign in" & 410 errors
      // You must set YOUTUBE_COOKIES in Vercel Environment Variables
      let agent;
      try {
        const cookies = process.env.YOUTUBE_COOKIES ? JSON.parse(process.env.YOUTUBE_COOKIES) : [];
        agent = ytdl.createAgent(cookies);
      } catch (err) {
        console.warn("Cookie parsing failed, attempting without cookies...", err);
        agent = undefined;
      }

      // 4. Pass the agent to getInfo
      const info = await ytdl.getInfo(url, { agent });
      
      // Filter formats (Video + Audio)
      const formats = ytdl.filterFormats(info.formats, 'videoandaudio')
        .map(format => ({
          quality: format.qualityLabel || format.quality,
          url: format.url,
          mimeType: format.mimeType,
          filesize: format.contentLength,
          container: format.container
        }))
        .filter(format => format.quality)
        .slice(0, 5);

      // Get highest quality thumbnail safely
      const thumbnails = info.videoDetails.thumbnails;
      const thumbnail = thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : '';

      return res.status(200).json({
        success: true,
        title: info.videoDetails.title,
        thumbnail: thumbnail,
        formats: formats
      });

    } else if (type === 'twitter') {
      return res.status(200).json({
        success: false,
        message: 'Twitter downloads require additional setup. Use redirect method instead.',
        redirectUrl: `https://ssstwitter.com/?url=${encodeURIComponent(url)}`
      });

    } else {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid type. Use "youtube" or "twitter"' 
      });
    }

  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to process video',
      message: error.message 
    });
  }
}
