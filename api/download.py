from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import yt_dlp
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Enable CORS
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

        try:
            # Parse query parameters
            query_components = parse_qs(urlparse(self.path).query)
            video_url = query_components.get('url', [None])[0]
            
            if not video_url:
                error_response = json.dumps({
                    'success': False,
                    'message': 'Missing URL parameter'
                })
                self.wfile.write(error_response.encode())
                return

            # yt-dlp options for best compatibility
            ydl_opts = {
                'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
                'nocheckcertificate': True,
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            }

            # Extract video information
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)
                
                # Get available formats
                formats = []
                seen_qualities = set()
                
                if 'formats' in info:
                    for f in info['formats']:
                        # Only include video+audio or video formats
                        if f.get('vcodec') != 'none' and f.get('ext') in ['mp4', 'webm']:
                            height = f.get('height', 0)
                            if height and height not in seen_qualities and height >= 360:
                                quality_label = f"{height}p"
                                formats.append({
                                    'quality': quality_label,
                                    'url': f.get('url', ''),
                                    'ext': f.get('ext', 'mp4'),
                                    'filesize': f.get('filesize', 0)
                                })
                                seen_qualities.add(height)
                
                # Sort by quality (highest first)
                formats.sort(key=lambda x: int(x['quality'].replace('p', '')), reverse=True)
                
                # Limit to top 5 formats
                formats = formats[:5]
                
                # If no formats found, add a fallback
                if not formats:
                    formats.append({
                        'quality': 'Best Available',
                        'url': info.get('url', ''),
                        'ext': 'mp4',
                        'filesize': 0
                    })

                response = {
                    'success': True,
                    'title': info.get('title', 'Unknown'),
                    'thumbnail': info.get('thumbnail', ''),
                    'duration': info.get('duration', 0),
                    'uploader': info.get('uploader', 'Unknown'),
                    'formats': formats
                }

            self.wfile.write(json.dumps(response).encode())

        except Exception as e:
            error_response = json.dumps({
                'success': False,
                'message': f'Error: {str(e)}'
            })
            self.wfile.write(error_response.encode())

    def do_OPTIONS(self):
        # Handle CORS preflight
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
