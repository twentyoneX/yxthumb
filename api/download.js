// api/download.js
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL required' });

  // 1. Extract Video ID (Required by this API)
  const getVideoId = (link) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = link.match(regex);
    return match ? match[1] : null;
  };

  const videoId = getVideoId(url);
  if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

  try {
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        // 👇 UPDATED HOST for the new API
        'x-rapidapi-host': 'social-media-video-downloader.p.rapidapi.com'
      }
    };

    // 2. Construct URL with parameters from your curl example
    const apiUrl = `https://social-media-video-downloader.p.rapidapi.com/youtube/v3/video/details?videoId=${videoId}&renderableFormats=720p,highres&urlAccess=proxied&getTranscript=false`;
    
    console.log("Requesting:", apiUrl);
    const response = await fetch(apiUrl, options);
    
    if (!response.ok) {
       const err = await response.text();
       throw new Error(`RapidAPI Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    console.log("API Data:", JSON.stringify(data).substring(0, 200)); // Log for debugging

    // 3. Parse the response (Adapting their format to yours)
    let formats = [];
    
    // This API usually returns 'data.videos' or 'data.formats' or 'items'
    // We look in all common places
    const rawList = 
        data.videos || 
        data.items || 
        data.formats || 
        (data.data ? data.data.videos : []) ||
        [];

    if (Array.isArray(rawList)) {
        formats = rawList.map(f => ({
            quality: f.qualityLabel || f.quality || 'Video',
            url: f.url || f.link,
            mimeType: f.mimeType || 'video/mp4',
            container: f.container || 'mp4',
            filesize: f.sizeText || (f.size ? (f.size/1024/1024).toFixed(1)+'MB' : ''),
            hasAudio: f.hasAudio !== false // Assume true unless specified
        }));
    }

    if (formats.length === 0) {
        return res.status(500).json({ 
            success: false, 
            error: "No downloadable links returned.",
            debug: data 
        });
    }

    return res.status(200).json({
      success: true,
      title: data.title || "YouTube Video",
      thumbnail: data.thumbnail || data.cover || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      formats: formats
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
        success: false, 
        error: error.message 
    });
  }
}
