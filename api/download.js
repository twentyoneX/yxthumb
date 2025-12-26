// api/download.js
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;

  if (!url) return res.status(400).json({ error: 'URL required' });

  // Extract Video ID helper
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

    // We ask RapidAPI for the video details
    const response = await fetch(`https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`, options);
    
    if (!response.ok) {
        throw new Error(`RapidAPI Error: ${response.status}`);
    }

    const data = await response.json();

    // Map RapidAPI response to your Frontend's expected format
    // Note: The API returns data.videos (array) and data.audios (array)
    // We combine them for your frontend
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

    if (data.audios && data.audios.items) {
        data.audios.items.forEach(a => {
            formats.push({
                quality: 'Audio Only',
                url: a.url,
                mimeType: 'audio/mp3',
                filesize: a.sizeText,
                container: 'mp3'
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
