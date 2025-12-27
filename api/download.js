// api/download.js
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL required' });

  // Helper to get ID
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
        'x-rapidapi-host': 'youtube-media-downloader.p.rapidapi.com'
      }
    };

    // Call the API
    const response = await fetch(`https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`, options);
    
    if (!response.ok) {
        // This will tell us if you ran out of quota or if the key is wrong
        const errText = await response.text();
        throw new Error(`RapidAPI Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();

    // The API returns data.videos.items. We need to format it for your frontend.
    const formats = [];
    
    if (data.videos && data.videos.items) {
        data.videos.items.forEach(v => {
            formats.push({
                quality: v.quality,
                url: v.url,
                mimeType: 'video/mp4',
                filesize: v.sizeText,
                container: 'mp4',
                hasAudio: v.hasAudio
            });
        });
    }

    return res.status(200).json({
      success: true,
      title: data.title,
      thumbnail: data.thumbnails ? data.thumbnails[data.thumbnails.length - 1].url : '',
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
