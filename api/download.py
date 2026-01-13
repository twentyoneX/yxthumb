# api/download.py - yt-dlp video downloader API
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import json
import yt_dlp

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parse query parameters
        parsed_path = urlparse(self.path)
        params = parse_qs(parsed_path.query)
        
        # Enable CORS
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        # Validate URL parameter
        if 'url' not in params:
            error_response = {
                'success': False,
                'error': 'URL parameter is required'
            }
            self.wfile.write(json.dumps(error_response).encode())
            return
        
        video_url = params['url'][0]
        video_type = params.get('type', ['youtube'])[0]
        
        try:
            # Configure yt-dlp options
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
                'format': 'best',
            }
            
            # Extract video info
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)
                
                # Get available formats with both video and audio
                formats_list = []
                seen_qualities = set()
                
                if 'formats' in info:
                    for f in info['formats']:
                        # Get quality label
                        quality = f.get('format_note', f.get('quality', 'unknown'))
                        height = f.get('height', 0)
                        
                        # Create quality label
                        if height:
                            quality_label = f"{height}p"
                        else:
                            quality_label = str(quality)
                        
                        # Only include formats with both video and audio, and unique qualities
                        if (f.get('vcodec') != 'none' and 
                            f.get('acodec') != 'none' and 
                            quality_label not in seen_qualities and
                            f.get('url')):
                            
                            seen_qualities.add(quality_label)
                            
                            formats_list.append({
                                'quality': quality_label,
                                'resolution': f.get('resolution', 'unknown'),
                                'ext': f.get('ext', 'mp4'),
                                'filesize': f.get('filesize') or f.get('filesize_approx', 0),
                                'url': f.get('url', ''),
                                'format_id': f.get('format_id', ''),
                                'fps': f.get('fps', 30),
                                'vcodec': f.get('vcodec', 'unknown'),
                                'acodec': f.get('acodec', 'unknown')
                            })
                
                # Sort by quality (highest resolution first)
                formats_list = sorted(
                    formats_list, 
                    key=lambda x: (
                        int(x['quality'].replace('p', '')) if x['quality'].endswith('p') else 0
                    ), 
                    reverse=True
                )[:6]  # Limit to top 6 formats
                
                # Get best thumbnail
                thumbnail = info.get('thumbnail', '')
                if 'thumbnails' in info and info['thumbnails']:
                    # Get the highest quality thumbnail
                    thumbnail = info['thumbnails'][-1].get('url', thumbnail)
                
                # Prepare successful response
                response = {
                    'success': True,
                    'title': info.get('title', 'Unknown Title'),
                    'thumbnail': thumbnail,
                    'duration': info.get('duration', 0),
                    'uploader': info.get('uploader', 'Unknown'),
                    'view_count': info.get('view_count', 0),
                    'upload_date': info.get('upload_date', ''),
                    'description': info.get('description', '')[:200] + '...' if info.get('description') else '',
                    'formats': formats_list
                }
                
                self.wfile.write(json.dumps(response).encode())
                
        except yt_dlp.utils.DownloadError as e:
            error_response = {
                'success': False,
                'error': 'Download error',
                'message': 'Video unavailable or restricted. It may be private, age-restricted, or removed.'
            }
            self.wfile.write(json.dumps(error_response).encode())
            
        except yt_dlp.utils.ExtractorError as e:
            error_response = {
                'success': False,
                'error': 'Extraction error',
                'message': 'Could not extract video information. Please check the URL.'
            }
            self.wfile.write(json.dumps(error_response).encode())
            
        except Exception as e:
            error_response = {
                'success': False,
                'error': 'Failed to process video',
                'message': str(e)
            }
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        # Handle CORS preflight
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
