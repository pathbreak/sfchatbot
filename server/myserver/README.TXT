Start the web server to get HTTP API requests:
	1. cd myserver/nodejs

	2. node index
	
	3. It runs at http://localhost:8000


Start an ngrok tunnel to get a public endpoint for our server:

	ngrok http 8000
	
	This'll create an ngrok.com/blahblah  public URL for out server.
	
	
