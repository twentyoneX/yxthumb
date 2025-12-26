// api/download.js
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    // We send the URL to Cobalt's public API
    const response = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        vCodec: 'h264',
        vQuality: '720',
        aFormat: 'mp3',
        filenamePattern: 'basic'
      })
    });

    const data = await response.json();

    if (data.status === 'error') {
       throw new Error(data.text);
    }

    // Cobalt returns a direct download link (data.url)
    return res.status(200).json({
      success: true,
      download_url: data.url, 
      // Note: Cobalt doesn't always provide titles/thumbnails in the basic JSON 
      // You might need a separate call (like the regex one I showed earlier) for thumbnails
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
