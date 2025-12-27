// api/download.js
import ytdl from '@distube/ytdl-core';

export default async function handler(req, res) {
  // 1. CORS Headers (Allows your frontend to talk to this backend)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight check
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // 2. Load the Cookies you saved in Vercel
    let agent;
    try {
        const cookieString = process.env.YOUTUBE_COOKIES;
        if (!cookieString) {
            console.warn("No cookies found in environment variables.");
        } else {
            const cookies = JSON.parse(cookieString);
            // Create the "Agent" using your Visitor Cookies
            agent = ytdl.createAgent(cookies);
        }
    } catch (err) {
        console.error("Error parsing cookies:", err);
    }

    // 3. Validate URL
    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ success: false, error: 'Invalid YouTube URL' });
    }

    // 4. Get Video Info (Passing the Agent/Cookies)
    // This is the step that usually fails without cookies
    const info = await ytdl.getInfo(url, { agent });
    
    // 5. Filter for Video+Audio formats
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio')
      .map(format => ({
        quality: format.qualityLabel || format.quality,
        url: format.url,
        mimeType: format.mimeType,
        filesize: format.contentLength,
        container: format.container
      }))
      .filter(format => format.quality) // Remove unknown qualities
      .slice(0, 10); // Return top 10 options

    // 6. Send success response
    return res.status(200).json({
      success: true,
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.pop().url, // Best quality thumbnail
      formats: formats
    });

  } catch (error) {
    console.error('Download error:', error);
    
    // Check for specific YouTube errors
    let userMessage = 'Failed to process video';
    if (error.message.includes('410')) userMessage = 'Video unavailable (410)';
    if (error.message.includes('Sign in')) userMessage = 'Server blocked by YouTube. Cookies expired.';

    return res.status(500).json({ 
      success: false,
      error: userMessage,
      debug: error.message 
    });
  }
}
