"""
Simple HTTP server for Japanese Wordle game
Serves files locally to avoid CORS issues
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

# Configuration
PORT = 8000
DIRECTORY = "."

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with CORS headers."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        """Add CORS headers to every response."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle preflight OPTIONS request."""
        self.send_response(200)
        self.end_headers()

def start_server():
    """Start the local development server."""
    os.chdir(Path(__file__).parent)
    
    with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
        print("="*50)
        print("Japanese Wordle - Local Development Server")
        print("="*50)
        print(f"\n✓ Server running at: http://localhost:{PORT}")
        print(f"✓ Open your browser to: http://localhost:{PORT}/index.html")
        print("\nPress Ctrl+C to stop the server\n")
        print("="*50)
        
        # Optionally auto-open browser
        webbrowser.open(f'http://localhost:{PORT}/index.html')
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n✓ Server stopped")

if __name__ == "__main__":
    start_server()