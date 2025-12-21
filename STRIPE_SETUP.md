# Stripe Payment Integration Setup Guide

This guide explains how to set up Stripe payments for the Opessocius learning platform.

## Security Architecture

The integration follows Stripe's security best practices:

- **Publishable Key (pk_...)** → Frontend only (safe to expose)
- **Secret Key (sk_...)** → Backend only (NEVER expose)
- **Webhook Secret (whsec_...)** → Backend only (NEVER expose)

## Step 1: Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. If you don't have an account, create one (free to start)
3. Copy your **Publishable key** (starts with `pk_test_` for testing or `pk_live_` for production)
4. Copy your **Secret key** (starts with `sk_test_` for testing or `sk_live_` for production)

⚠️ **IMPORTANT**: Never commit secret keys to Git. Always use environment variables.

## Step 2: Set Up Environment Variables

1. Create a `.env` file in the project root (copy from `.env.example` if it exists)
2. Add your Stripe keys:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Base URL for redirects
BASE_URL=http://localhost:3000
```

## Step 3: Set Up Webhooks (Production)

Webhooks are essential for reliable payment confirmation. They notify your server when payments succeed or fail.

### For Local Development:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copy the webhook signing secret (starts with `whsec_`) and add it to `.env`

### For Production:

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret and add it to your production `.env`

## Step 4: Test the Integration

1. Start the server: `npm start` or `node server.js`
2. Navigate to `http://localhost:3000/learn.html`
3. Click "Get Started" on any pricing plan
4. You'll be redirected to Stripe Checkout
5. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Use any future expiry date and any 3-digit CVC

## Payment Flow

1. **User clicks "Get Started"** → Frontend calls `/api/stripe/create-checkout-session`
2. **Backend creates Stripe session** → Returns checkout URL
3. **User redirected to Stripe Checkout** → Secure payment page hosted by Stripe
4. **User completes payment** → Stripe processes payment
5. **Stripe sends webhook** → Backend receives payment confirmation
6. **User redirected to success page** → `payment-success.html`

## Pricing Plans

The integration supports three plans:

- **Essential**: €49/month or €41/month (annually)
- **Professional**: €99/month or €83/month (annually)
- **Mastery**: €199/month or €16.69/month (annually)

Plans are configured in `learn.html` and automatically create subscriptions (monthly/annual) or one-time payments.

## Security Checklist

- ✅ Secret key only in backend (environment variables)
- ✅ Publishable key loaded from backend endpoint
- ✅ Payment amounts validated on backend
- ✅ Webhook signature verification enabled
- ✅ HTTPS required in production
- ✅ No sensitive data in frontend JavaScript

## Troubleshooting

### "Stripe publishable key not configured"
- Check that `STRIPE_PUBLISHABLE_KEY` is set in `.env`
- Restart the server after adding environment variables

### "Webhook signature verification failed"
- Ensure `STRIPE_WEBHOOK_SECRET` is correct
- For local development, use the secret from `stripe listen` command
- For production, use the secret from Stripe Dashboard

### Payments not completing
- Check server logs for errors
- Verify webhook endpoint is accessible
- Test with Stripe test cards first

## Production Deployment

Before going live:

1. Switch to **live mode** in Stripe Dashboard
2. Update `.env` with live keys (`pk_live_...` and `sk_live_...`)
3. Set up production webhook endpoint
4. Update `BASE_URL` to your production domain
5. Test with real card (use small amount first)
6. Enable HTTPS (required by Stripe)

## Support

For Stripe-specific issues, consult:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

