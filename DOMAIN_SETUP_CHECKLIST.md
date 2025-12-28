# Domain Setup Checklist

## ⏰ When to Configure

**✅ DO NOW:** Configure all the settings below (you can do this before pointing DNS)
**⏳ WAIT:** Actually point your domain's DNS to your server until you're ready to go live

This way you can test everything and be ready when you deploy!

---

## 📋 Configuration Checklist

### 1. Create `.env` File (Environment Variables)

Create a `.env` file in the project root with your domain:

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# Domain Configuration
BASE_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email Configuration (if using)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password

# Stripe Configuration (if using)
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

**Replace `yourdomain.com` with your actual domain!**

---

### 2. Firebase Configuration

#### Add Authorized Domain:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `opessocius-17ab9`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add: `yourdomain.com` and `www.yourdomain.com`
6. Click **Save**

**Note:** `localhost` is already authorized for development, so you can keep testing locally.

---

### 3. Stripe Configuration

#### Update Webhook URL:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Find your webhook endpoint (or create a new one)
3. Update the endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Make sure these events are selected:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the new webhook signing secret and update it in your `.env` file

#### Switch to Live Keys:
- Replace test keys (`pk_test_`, `sk_test_`) with live keys (`pk_live_`, `sk_live_`)
- Get live keys from: [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys)

---

### 4. Email Service Configuration

If you're using SMTP for emails:
- Update `SMTP_HOST` in `.env` to your production email server
- Make sure your email service allows sending from your domain
- Test email sending before going live

---

### 5. DNS Configuration (Do This Last!)

**Only point DNS when you're ready to go live:**

#### A Record (for root domain):
```
Type: A
Name: @
Value: [Your server's IP address]
TTL: 3600
```

#### CNAME Record (for www subdomain):
```
Type: CNAME
Name: www
Value: yourdomain.com
TTL: 3600
```

#### SSL Certificate:
- Make sure your hosting provider sets up SSL/HTTPS
- Most providers (like Vercel, Netlify, AWS, etc.) do this automatically
- Wait for SSL to be active before pointing DNS

---

### 6. Test Before Going Live

Before pointing DNS, test locally with production settings:

1. Set `NODE_ENV=production` in `.env`
2. Test all features:
   - ✅ User login/authentication
   - ✅ Payment flow (use Stripe test mode first!)
   - ✅ Email sending
   - ✅ Firebase database operations
   - ✅ All forms and submissions

---

### 7. Deployment Steps (When Ready)

1. **Upload files to your server/hosting**
2. **Install dependencies:** `npm install`
3. **Set environment variables** on your hosting platform
4. **Point DNS** to your server
5. **Wait for DNS propagation** (can take up to 48 hours, usually 1-2 hours)
6. **Test everything** on the live domain
7. **Monitor for errors** in the first few days

---

## 🔍 Quick Verification

After setup, verify these URLs work:
- ✅ `https://yourdomain.com` (main site)
- ✅ `https://www.yourdomain.com` (www version)
- ✅ `https://yourdomain.com/api/health` (server health check)
- ✅ Firebase authentication works
- ✅ Stripe payments work (test with test mode first!)

---

## ⚠️ Important Notes

1. **Never commit `.env` file to Git** - it contains secrets!
2. **Test with Stripe test mode** before switching to live mode
3. **Keep localhost authorized** in Firebase for development
4. **SSL is required** - don't go live without HTTPS
5. **Backup everything** before deploying

---

## 🆘 Troubleshooting

### "CORS error" after deployment?
→ Check `ALLOWED_ORIGINS` in `.env` includes your domain

### "Firebase auth not working"?
→ Verify domain is added to Firebase authorized domains

### "Stripe webhook not working"?
→ Check webhook URL is correct and SSL is active

### "Email not sending"?
→ Verify SMTP credentials and check spam folder

---

## 📞 Need Help?

Check these files for more details:
- `STRIPE_SETUP.md` - Stripe configuration
- `FIREBASE_SETUP.md` - Firebase configuration
- `EMAIL_SETUP.md` - Email configuration
- `SECURITY_IMPLEMENTATION.md` - Security settings

