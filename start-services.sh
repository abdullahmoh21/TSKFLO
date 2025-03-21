#!/bin/sh

# Start the backend server in the background
echo "Starting Node.js backend..."
cd /app/backend
NODE_ENV=development node server.js & 

# Start nginx in the foreground
echo "Starting Nginx..."
nginx -g "daemon off;"
