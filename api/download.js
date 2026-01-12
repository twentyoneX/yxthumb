// api/download.js - Simple redirect-based solution (no ytdl-core dependency)

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get parameters
  const { url, type } = req.query;

  // Validate input
  if (!url) {
    return res.status(400).json({ 
      success: false,
      error: 'URL parameter is required' 
    });
  }

  try {
    if (type === 'youtube') {
      // Extract video ID from YouTube URL
      const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
      
      if (!videoIdMatch) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid YouTube URL',
          message: 'Could not extract video ID from URL'
        });
      }

      const videoId = videoIdMatch[1];
      
      // Return redirect URLs to working download services
      return res.status(200).json({
        success: true,
        videoId: videoId,
        title: 'YouTube Video',
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        downloadServices: [
          {
            name: 'SaveFrom.net',
            url: `https://en.savefrom.net/#url=https://www.youtube.com/watch?v=${videoId}`,
            description: 'Multiple quality options'
          },
          {
            name: 'Y2Mate',
            url: `https://www.y2mate.com/youtube/${videoId}`,
            description: 'HD quality downloads'
          },
          {
            name: 'SSYouTube',
            url: `https://ssyoutube.com/watch?v=${videoId}`,
            description: 'Fast downloads'
          }
        ],
        message: 'Click on any service below to download the video'
      });

    } else if (type === 'twitter') {
      return res.status(200).json({
        success: true,
        downloadServices: [
          {
            name: 'SSSTwitter',
            url: `https://ssstwitter.com/?url=${encodeURIComponent(url)}`,
            description: 'Fast and reliable'
          },
          {
            name: 'TWMate',
            url: `https://twmate.com/en2?url=${encodeURIComponent(url)}`,
            description: 'HD quality support'
          }
        ],
        message: 'Click on any service below to download the video'
      });

    } else {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid type',
        message: 'Type must be either "youtube" or "twitter"'
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
}
