#!/bin/bash

# Script to prepare the UNCIP app for Vercel deployment

echo "Preparing UNCIP app for Vercel deployment..."

# Clean up development artifacts
echo "Cleaning up development artifacts..."
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies
echo "Installing dependencies..."
npm install

# Run linting
echo "Running linter..."
npm run lint

# Build the application
echo "Building the application..."
npm run build

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo "Warning: .env.production file not found. Creating from example..."
  cp .env.production.example .env.production
  echo "Please update .env.production with your production environment variables."
fi

echo "Deployment preparation complete!"
echo "You can now deploy to Vercel using one of these methods:"
echo "1. Run 'vercel --prod' or 'npm run vercel-deploy'"
echo "2. Push to your GitHub repository if you've set up Vercel GitHub integration"
echo ""
echo "For more detailed instructions, see docs-archive/VERCEL_DEPLOYMENT_GUIDE.md"