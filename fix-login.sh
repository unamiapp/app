#!/bin/bash

echo "Stopping any running Next.js processes..."
pkill -f "node.*next" || true

echo "Clearing Next.js cache..."
rm -rf .next/cache

echo "Verifying environment variables..."
echo "NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:0:10}..."

echo "Starting Next.js server with environment variables..."
NEXTAUTH_SECRET=$(grep NEXTAUTH_SECRET .env.local | cut -d '=' -f2) npm run dev