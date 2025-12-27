// api/download.js
export default async function handler(req, res) {
  // CORS Headers
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

    // SWITCH STRATEGY: Use the main endpoint with the FULL URL.
    // This is usually safer than extracting IDs manually.
    const apiUrl = `https://all-media-downloader4.p.rapidapi.com/?url=${encodeURIComponent(url)}`;
    
    console.log("Calling API:", apiUrl); 
    
    const response = await fetch(apiUrl, options);
    
    // Check if RapidAPI rejected us (e.g., Bad Key or Quota Limit)
    if (!response.ok) {
       const errText = await response.text();
       console.error("RapidAPI Error:", response.status, errText);
       throw new Error(`RapidAPI Error: ${response.status} (Check Vercel Logs)`);
    }

    const data = await response.json();
    console.log("API Data:", JSON.stringify(data)); // See this in Vercel Logs

    // --- PARSING ---
    // This API usually puts the link in 'download_url', 'url', or 'data.url'
    let formats = [];
    
    const directLink = data.download_url || data.url || (data.data ? data.data.url : null);
    const formatList = data.formats || (data.data ? data.data.formats : []);

    if (Array.isArray(formatList) && formatList.length > 0) {
        // If they give us a list of qualities
        formats = formatList.map(f => ({
            quality: f.quality || f.format_note || 'Video',
            url: f.url,
            mimeType: 'video/mp4',
            container: 'mp4'
        }));
    } else if (directLink) {
        // If they just give us one link
        formats.push({
            quality: 'High Quality',
            url: directLink,
            mimeType: 'video/mp4',
            container: 'mp4'
        });
    }

    if (formats.length === 0) {
        return res.status(500).json({ 
            success: false, 
            error: "No download link returned by API", 
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
