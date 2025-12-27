// api/download.js - DEBUG MODE
export default async function handler(req, res) {
  const { url } = req.query;

  // Extract ID (Required for this API endpoint)
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url && url.match(regex);
  const videoId = match ? match[1] : null;

  if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

  try {
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'all-media-downloader4.p.rapidapi.com'
      }
    };

    // The endpoint we know works for connection
    const apiUrl = `https://all-media-downloader4.p.rapidapi.com/yt/v5/download.php?id=${videoId}`;
    
    const response = await fetch(apiUrl, options);
    const data = await response.json();

    // 🛑 DEBUG: Send RAW data back to browser.
    // This allows us to read the JSON structure.
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ 
        error: error.message, 
        stack: error.stack 
    });
  }
}
