#!/bin/bash
# Kill any existing Next.js server
pkill -f "node.*next"

# Start the Next.js server with the correct port
PORT=3002 npm run dev