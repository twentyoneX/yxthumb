// api/download.js
export default async function handler(req, res) {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL required' });

  // 2. Extract Video ID (Crucial step for this API)
  const getVideoId = (link) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = link.match(regex);
    return match ? match[1] : null;
  };

  const videoId = getVideoId(url);
  if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL. Could not extract ID.' });

  try {
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'all-media-downloader4.p.rapidapi.com'
      }
    };

    // 3. The API Call (Using the endpoint you found)
    const apiUrl = `https://all-media-downloader4.p.rapidapi.com/yt/v5/download.php?id=${videoId}`;
    
    console.log("Fetching:", apiUrl); // Debug log
    const response = await fetch(apiUrl, options);
    
    if (!response.ok) {
       const err = await response.text();
       throw new Error(`RapidAPI Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    console.log("RapidAPI Data:", JSON.stringify(data).substring(0, 200) + "..."); // Log start of data

    // 4. Adapt the data for your Frontend
    // APIs like this usually return a list of formats directly or in a 'data' object
    let formats = [];
    
    // Check if 'formats' exists directly
    const rawFormats = data.formats || data.links || (data.data ? data.data.formats : []);

    if (Array.isArray(rawFormats)) {
        formats = rawFormats.map(f => ({
            quality: f.quality || f.format_note || 'Unknown',
            url: f.url,
            mimeType: 'video/mp4', // Defaulting since simple APIs might not send mime
            container: f.ext || 'mp4',
            hasAudio: true, // Assuming true for simple downloaders
            filesize: f.filesize ? (f.filesize / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'
        }));
    } else if (data.url) {
        // Fallback: Single URL response
        formats.push({
            quality: 'High',
            url: data.url,
            container: 'mp4'
        });
    }

    // 5. Send to Frontend
    return res.status(200).json({
      success: true,
      title: data.title || "YouTube Video",
      thumbnail: data.thumbnail || data.picture || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      formats: formats
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to fetch video"
    });
  }
}
