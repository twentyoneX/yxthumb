// api/download.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL required' });

  // Regex to find ID
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
        'x-rapidapi-host': 'all-media-downloader4.p.rapidapi.com'
      }
    };

    // We use the ID endpoint
    const apiUrl = `https://all-media-downloader4.p.rapidapi.com/yt/v5/download.php?id=${videoId}`;
    
    const response = await fetch(apiUrl, options);
    
    if (!response.ok) {
       const err = await response.text();
       throw new Error(`API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    
    // --- ROBUST PARSING LOGIC ---
    let formats = [];

    // 1. Look for array in common places
    const rawList = 
        data.formats || 
        data.links || 
        data.videos || 
        (data.data ? data.data.formats : []) || 
        (data.data ? data.data.videos : []) ||
        [];

    if (Array.isArray(rawList) && rawList.length > 0) {
        formats = rawList.map(f => ({
            quality: f.quality || f.format_note || 'Video',
            url: f.url,
            mimeType: 'video/mp4',
            container: f.ext || 'mp4',
            filesize: f.filesize ? (f.filesize / 1024 / 1024).toFixed(2) + ' MB' : ''
        }));
    } 
    // 2. Look for single url in common places
    else {
        const directUrl = data.url || data.download_url || (data.data ? data.data.url : null);
        if (directUrl) {
            formats.push({
                quality: 'High Quality',
                url: directUrl,
                mimeType: 'video/mp4',
                container: 'mp4'
            });
        }
    }

    // If we still found nothing, send an error so the frontend knows
    if (formats.length === 0) {
        return res.status(500).json({ 
            success: false, 
            error: "No download links found for this video. (Copyright or API limit)",
            debug: JSON.stringify(data) // Sends raw data to console for debugging
        });
    }

    return res.status(200).json({
      success: true,
      title: data.title || "YouTube Video",
      thumbnail: data.thumbnail || data.picture || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      formats: formats
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
