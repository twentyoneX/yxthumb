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
        // 👇 UPDATE THIS LINE with the host from your new API page
        'x-rapidapi-host': 'all-media-downloader.p.rapidapi.com' 
      }
    };

    // 👇 UPDATE THIS URL if your API uses a different endpoint (Check the "Endpoints" tab)
    // Most "All Media" downloaders use /index or /download
    const apiUrl = `https://all-media-downloader.p.rapidapi.com/index?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl, options);
    
    if (!response.ok) {
       const err = await response.text();
       throw new Error(`API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();

    // The generic "All Media" APIs usually return the direct link in `data.url` or `data.links`
    // We send the whole data back so your frontend can figure it out
    return res.status(200).json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
