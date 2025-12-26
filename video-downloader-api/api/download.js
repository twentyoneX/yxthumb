// api/download.js - Vercel Serverless Function
// Deploy this to Vercel and get your API endpoint

import ytdl from 'ytdl-core';

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
        return res.status(400).json({ 
          success: false,
          error: 'Invalid YouTube URL' 
        });
      }

      // Get video info
      const info = await ytdl.getInfo(url);
      
      // Filter formats that have both video and audio
      const formats = ytdl.filterFormats(info.formats, 'videoandaudio')
        .map(format => ({
          quality: format.qualityLabel || format.quality,
          url: format.url,
          mimeType: format.mimeType,
          filesize: format.contentLength,
          container: format.container
        }))
        .filter(format => format.quality) // Only include formats with quality labels
        .slice(0, 5); // Limit to top 5 formats

      return res.status(200).json({
        success: true,
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
        formats: formats
      });

    } else if (type === 'twitter') {
      // Twitter requires different handling
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
