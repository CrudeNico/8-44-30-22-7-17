# Quick Start Guide - Stripe Payment Integration

## The Error You're Seeing

If you see: **"Payment system is not ready. Please refresh the page and try again."**

This means the server is not running. Follow these steps:

## Step 1: Start the Server

Open a terminal in the project directory and run:

```bash
npm start
```

Or:

```bash
node server.js
```

You should see:
```
🚀 Server running on http://localhost:3000
📧 SMTP configured: ...
💳 Stripe configured: Yes / No
```

## Step 2: Configure Stripe Keys

1. Create a `.env` file in the project root (if it doesn't exist)
2. Add your Stripe keys:

```env
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
BASE_URL=http://localhost:3000
```

**To get your keys:**
- Go to https://dashboard.stripe.com/apikeys
- Copy your **Publishable key** (starts with `pk_test_`)
- Copy your **Secret key** (starts with `sk_test_`)

**For webhook secret (local testing):**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Copy the `whsec_...` secret that appears.

## Step 3: Test

1. Make sure the server is running (Step 1)
2. Open your browser to: `http://localhost:3000/learn.html`
3. Click "Get Started" on any pricing plan
4. You should be redirected to Stripe Checkout

## Troubleshooting

### Server not starting?
- Check if port 3000 is already in use
- Make sure you're in the correct directory
- Check for errors in the terminal

### Still getting "Payment system is not ready"?
1. Open browser console (F12)
2. Check for error messages
3. Verify the server is running on port 3000
4. Verify `.env` file exists and has `STRIPE_PUBLISHABLE_KEY`

### 404 errors on `/api/stripe/publishable-key`?
- Server is not running
- Server is running on a different port
- Check browser console for the exact error

## Common Issues

**"Stripe is not configured"**
→ Add `STRIPE_SECRET_KEY` to `.env` file

**"Failed to load resource: 404"**
→ Server is not running. Start it with `npm start`

**"Unexpected token '<', "<!DOCTYPE "..."**
→ Server returned HTML instead of JSON. Check if server is running and route exists.

