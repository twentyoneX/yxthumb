// api/download.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'all-media-downloader4.p.rapidapi.com'
      }
    };

    // 1. Use the UNIVERSAL endpoint (No ID extraction needed)
    // This often bypasses specific YouTube filters because it looks like a generic request
    const apiUrl = `https://all-media-downloader4.p.rapidapi.com/?url=${encodeURIComponent(url)}`;
    
    console.log("Requesting:", apiUrl);
    const response = await fetch(apiUrl, options);
    
    if (!response.ok) {
       const err = await response.text();
       throw new Error(`RapidAPI Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    console.log("API Response:", JSON.stringify(data));

    // 2. Universal Parser
    let formats = [];
    
    // Check all possible locations for links
    const directLink = data.download_url || data.url || (data.data ? data.data.url : null);
    const list = data.formats || data.links || (data.data ? data.data.formats : []);

    if (Array.isArray(list) && list.length > 0) {
        formats = list.map(f => ({
            quality: f.quality || f.format_note || 'Video',
            url: f.url,
            mimeType: 'video/mp4',
            container: 'mp4'
        }));
    } else if (directLink) {
        formats.push({
            quality: 'High',
            url: directLink,
            mimeType: 'video/mp4',
            container: 'mp4'
        });
    }

    if (formats.length === 0) {
        // If we get here, the API returned success but gave no links (Copyright blocked)
        return res.status(500).json({ 
            success: false, 
            error: "This video is protected (Copyright) or unavailable.",
            debug: data
        });
    }

    return res.status(200).json({
      success: true,
      title: data.title || "Video Download",
      thumbnail: data.thumbnail || data.picture || "",
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
