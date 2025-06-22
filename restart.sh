#!/bin/bash

echo "Stopping any running Next.js processes..."
pkill -f "node.*next" || true

echo "Clearing Next.js cache..."
rm -rf .next/cache

echo "Verifying environment variables..."
node verify-env.js

echo "Starting Next.js server..."
npm run dev:clean