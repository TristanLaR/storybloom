# StoryBloom Deployment Guide

This guide covers deploying StoryBloom to production using Vercel (frontend) and Convex Cloud (backend).

## Prerequisites

- Node.js 18+ installed
- Git repository connected to GitHub
- Accounts created for:
  - [Vercel](https://vercel.com)
  - [Convex](https://convex.dev)
  - [Stripe](https://stripe.com)
  - [Google Cloud Console](https://console.cloud.google.com) (for OAuth)
  - [Lulu Direct API](https://developers.lulu.com) (for printing)

## Step 1: Deploy Convex Backend

### 1.1 Create Convex Project

1. Log in to [Convex Dashboard](https://dashboard.convex.dev)
2. Click "New Project"
3. Name it `storybloom-production`
4. Note the deployment URL (e.g., `https://abc123.convex.cloud`)

### 1.2 Deploy Convex Functions

```bash
# Install Convex CLI if not already installed
npm install -g convex

# Login to Convex
npx convex login

# Deploy to production
npx convex deploy --prod
```

### 1.3 Configure Convex Environment Variables

In the Convex Dashboard, navigate to Settings > Environment Variables and add:

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key for story generation |
| `NANO_BANANA_API_URL` | NanoBanana API endpoint |
| `NANO_BANANA_API_KEY` | NanoBanana API key for image generation |
| `STRIPE_SECRET_KEY` | Stripe secret key (live mode: `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `LULU_API_KEY` | Lulu Direct API key |
| `LULU_API_SECRET` | Lulu Direct API secret |
| `LULU_WEBHOOK_SECRET` | Lulu webhook secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `APPLE_CLIENT_ID` | Apple Sign In client ID |
| `APPLE_CLIENT_SECRET` | Apple Sign In client secret |

## Step 2: Deploy to Vercel

### 2.1 Import Project

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Import Project"
3. Select your GitHub repository
4. Choose the `main` branch

### 2.2 Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 2.3 Configure Environment Variables

Add these environment variables in Vercel:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex deployment URL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_live_...`) |

### 2.4 Deploy

Click "Deploy" and wait for the build to complete.

## Step 3: Configure Webhooks

### 3.1 Stripe Webhooks

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL: `https://your-convex-url.convex.cloud/stripe-webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the signing secret and add to Convex as `STRIPE_WEBHOOK_SECRET`

### 3.2 Lulu Webhooks

1. Log in to Lulu Developer Portal
2. Navigate to Webhooks settings
3. Add endpoint: `https://your-convex-url.convex.cloud/lulu-webhook`
4. Select events:
   - `PRINT_JOB_STATUS_CHANGED`
   - `SHIPMENT_CREATED`
5. Copy the webhook secret and add to Convex as `LULU_WEBHOOK_SECRET`

## Step 4: Custom Domain (Optional)

### 4.1 Add Domain in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to Settings > Domains
3. Add your custom domain (e.g., `storybloom.com`)
4. Follow DNS configuration instructions

### 4.2 SSL Configuration

Vercel automatically provisions SSL certificates for custom domains. No additional configuration needed.

## Step 5: Post-Deployment Verification

### 5.1 Test Checklist

- [ ] Homepage loads correctly
- [ ] User can sign up / log in with Google
- [ ] User can create a new book
- [ ] AI story generation works
- [ ] AI image generation works
- [ ] PDF generation works
- [ ] Stripe checkout works
- [ ] Order submission to Lulu works
- [ ] Webhooks receive and process events

### 5.2 Health Check Endpoints

- Frontend: `https://your-domain.com` (should return 200)
- Convex: `https://your-convex-url.convex.cloud/health` (should return 200)

## Troubleshooting

### Common Issues

**Build fails on Vercel**
- Check that all dependencies are listed in `package.json`
- Verify environment variables are set correctly
- Check build logs for specific error messages

**Convex functions not working**
- Verify Convex deployment URL is correct in Vercel env vars
- Check Convex Dashboard logs for errors
- Ensure all Convex environment variables are set

**Stripe payments failing**
- Verify using live keys, not test keys
- Check Stripe Dashboard for error logs
- Ensure webhook endpoint is correctly configured

**OAuth login not working**
- Verify redirect URIs in Google Cloud Console
- Check that client ID/secret are correct
- Ensure production domain is in allowed origins

## Environment Variables Summary

### Vercel (Frontend)

```env
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### Convex (Backend)

```env
GEMINI_API_KEY=xxx
NANO_BANANA_API_URL=https://api.nanobanana.com
NANO_BANANA_API_KEY=xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
LULU_API_KEY=xxx
LULU_API_SECRET=xxx
LULU_WEBHOOK_SECRET=xxx
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
APPLE_CLIENT_ID=xxx
APPLE_CLIENT_SECRET=xxx
```

## Security Best Practices

1. **Never commit secrets** - Use environment variables only
2. **Rotate API keys** regularly
3. **Enable 2FA** on all service accounts
4. **Monitor logs** for unusual activity
5. **Set up alerts** for failed payments and errors

## Support

For deployment issues, contact:
- Vercel Support: https://vercel.com/support
- Convex Support: https://convex.dev/community
- StoryBloom Team: support@storybloom.com
