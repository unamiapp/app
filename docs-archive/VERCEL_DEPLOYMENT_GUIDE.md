# Vercel Deployment Guide

This guide provides detailed instructions for deploying the UNCIP application to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Git repository with your UNCIP application code
- Firebase project configured for production

## Environment Setup

1. Create a production Firebase project or configure your existing project for production use.

2. Create a `.env.production` file based on the `.env.production.example` template:
   ```bash
   cp .env.production.example .env.production
   ```

3. Update the `.env.production` file with your production Firebase credentials.

## Deployment Options

### Option 1: Vercel CLI Deployment

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to Vercel:
   ```bash
   vercel --prod
   ```
   
   Or use the npm script:
   ```bash
   npm run vercel-deploy
   ```

4. Follow the CLI prompts to complete the deployment.

### Option 2: GitHub Integration (Recommended)

1. Push your code to a GitHub repository.

2. Log in to the [Vercel Dashboard](https://vercel.com/dashboard).

3. Click "New Project" and select your GitHub repository.

4. Configure the project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

5. Add environment variables:
   - Click on "Environment Variables"
   - Add all variables from your `.env.production` file
   - Make sure to properly format multi-line variables like `FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY`

6. Click "Deploy" to start the deployment process.

## Post-Deployment Configuration

1. Set up a custom domain (if needed):
   - Go to your project settings in the Vercel dashboard
   - Navigate to "Domains"
   - Add your custom domain and follow the verification steps

2. Configure Firebase Security Rules:
   - Deploy your Firestore and Storage rules to production:
   ```bash
   firebase use production
   npm run deploy:rules
   ```

3. Create admin users for the production environment:
   ```bash
   NODE_ENV=production npm run setup:users
   ```

## Continuous Deployment

With the GitHub integration, Vercel will automatically deploy your application whenever you push changes to your repository. You can configure:

- Production branch (usually `main` or `master`)
- Preview deployments for pull requests
- Environment variables per deployment environment

## Troubleshooting

- **Build Errors**: Check the build logs in the Vercel dashboard for specific error messages.
- **Environment Variables**: Ensure all required environment variables are correctly set in the Vercel dashboard.
- **Firebase Connection Issues**: Verify that your Firebase project is properly configured and that the service account has the necessary permissions.
- **API Routes Failing**: Check that your API routes are properly configured for serverless functions.

## Monitoring and Analytics

- Use the Vercel dashboard to monitor your application's performance and usage.
- Set up Firebase Analytics for more detailed user behavior tracking.
- Configure logging and error tracking services like Sentry for production monitoring.