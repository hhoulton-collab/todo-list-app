import http.server, os, socketserver
os.chdir('/Users/harrietrosehoulton/Documents/Harriet Claude Testing/notes-app')
handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(('', 8080), handler) as httpd:
    httpd.serve_forever()
