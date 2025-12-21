# OWASP Security Implementation Guide

This document outlines the security measures implemented to protect against common web vulnerabilities following OWASP best practices.

## ✅ Implemented Security Measures

### 1. Transport Security (HTTPS)

#### HTTPS Everywhere
- **Status**: ✅ Implemented
- **Location**: `server.js` - HTTPS redirect middleware
- **Implementation**: 
  - Automatic HTTP → HTTPS redirect in production
  - Detects secure connections via `req.secure` or proxy headers (`x-forwarded-proto`)
  - Returns 301 permanent redirect for all HTTP requests

#### HSTS (HTTP Strict Transport Security)
- **Status**: ✅ Implemented
- **Configuration**:
  - `maxAge`: 31536000 (1 year)
  - `includeSubDomains`: true
  - `preload`: true
- **Header**: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

**⚠️ Important**: Before enabling HSTS preload, ensure:
1. Your domain is fully HTTPS-capable
2. All subdomains support HTTPS
3. You've tested thoroughly
4. Submit to [HSTS Preload List](https://hstspreload.org/)

### 2. Cookie Hardening

#### Firebase Authentication Cookies
Firebase Authentication automatically sets secure cookies, but you should verify the following in your Firebase Console:

**Required Cookie Settings:**
- ✅ `Secure`: Cookies only sent over HTTPS
- ✅ `HttpOnly`: Cookies not accessible via JavaScript (prevents XSS)
- ✅ `SameSite`: Set to `Lax` or `Strict` depending on your authentication flow

**Firebase Configuration:**
1. Go to Firebase Console → Authentication → Settings
2. Ensure "Authorized domains" only includes your production domain
3. Review cookie settings in Firebase Auth configuration

**For Custom Cookies (if any):**
```javascript
// Example: Setting secure cookies in Express
res.cookie('sessionId', sessionToken, {
    secure: true,        // Only sent over HTTPS
    httpOnly: true,      // Not accessible via JavaScript
    sameSite: 'strict',  // CSRF protection (use 'lax' if you need cross-site requests)
    maxAge: 3600000,     // 1 hour
    path: '/'
});
```

**SameSite Guidelines:**
- `Strict`: Maximum security, cookies never sent in cross-site requests
- `Lax`: Cookies sent in top-level navigations (recommended for most auth flows)
- `None`: Only use if you need cross-site cookies (requires `Secure` flag)

### 3. Content Security Policy (CSP)

#### Current CSP Configuration
- **Status**: ✅ Implemented
- **Location**: `server.js` - Helmet CSP configuration

**Allowed Sources:**
- **Scripts**: 
  - `'self'` (same origin)
  - `'unsafe-inline'` (⚠️ Consider removing if possible)
  - `https://www.gstatic.com` (Firebase CDN)
  - `https://*.firebaseapp.com` (Firebase)
  - `https://*.firebasestorage.app` (Firebase Storage)
  - `https://buy.stripe.com` (Stripe payments)

- **Styles**: 
  - `'self'`
  - `'unsafe-inline'` (⚠️ Consider removing if possible)

- **Images**: 
  - `'self'`
  - `data:` (base64 images)
  - `https:` (all HTTPS sources)
  - `blob:` (file uploads)

- **Connections**: 
  - `'self'`
  - Firebase domains (`*.firebaseapp.com`, `*.firebasestorage.app`, `*.googleapis.com`)
  - Firebase WebSocket connections

- **Frames**: 
  - `'self'`
  - `https://buy.stripe.com` (Stripe payment iframes)

**⚠️ Recommendations:**
1. Remove `'unsafe-inline'` from `scriptSrc` by moving inline scripts to external files
2. Remove `'unsafe-inline'` from `styleSrc` by moving inline styles to CSS files
3. Consider restricting `imgSrc` to specific domains instead of all HTTPS

### 4. Security Headers Baseline

All headers are configured via Helmet middleware in `server.js`:

#### ✅ Content-Security-Policy
- Configured with strict allowlist
- See CSP section above for details

#### ✅ X-Frame-Options
- **Value**: `DENY`
- **Purpose**: Prevents clickjacking attacks
- **Note**: Also using CSP `frame-ancestors` directive for modern browsers

#### ✅ X-Content-Type-Options
- **Value**: `nosniff`
- **Purpose**: Prevents MIME type sniffing attacks

#### ✅ Referrer-Policy
- **Value**: `strict-origin-when-cross-origin`
- **Purpose**: Controls referrer information sent with requests

#### ✅ Permissions-Policy (formerly Feature-Policy)
- **Configured Features**:
  - `geolocation`: `'none'`
  - `microphone`: `'none'`
  - `camera`: `'none'`
  - `payment`: `'self'` and `https://buy.stripe.com` (Stripe)
  - `usb`: `'none'`
  - `magnetometer`: `'none'`
  - `gyroscope`: `'none'`
  - `accelerometer`: `'none'`

#### ✅ Strict-Transport-Security (HSTS)
- See Transport Security section above

#### ✅ X-DNS-Prefetch-Control
- **Value**: `off`
- **Purpose**: Prevents DNS prefetching

#### ✅ X-Download-Options
- **Value**: `noopen`
- **Purpose**: Prevents IE8+ from executing downloads in site context

#### ✅ X-Permitted-Cross-Domain-Policies
- **Value**: `none`
- **Purpose**: Prevents Flash/PDF cross-domain requests

#### ✅ X-XSS-Protection
- **Value**: `1; mode=block`
- **Purpose**: Legacy XSS protection (CSP is primary protection)

### 5. API Security

#### Environment-Aware API URLs
- **Status**: ✅ Implemented
- **Location**: `script.js`, `investorsportal.html`, `adminportal.html`, `adminportal3.html`

**Implementation:**
- Automatically uses HTTPS in production
- Falls back to HTTP localhost in development
- Prevents mixed content warnings

**Code Pattern:**
```javascript
const apiBaseUrl = window.location.protocol === 'https:' 
    ? window.location.origin 
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `http://localhost:${window.location.port || '3000'}`
        : window.location.origin);
```

### 6. CORS Configuration

#### Security-Hardened CORS
- **Status**: ✅ Implemented
- **Location**: `server.js`

**Configuration:**
- Production: Restrictive origin whitelist (configure `ALLOWED_ORIGINS` env var)
- Development: Allows all origins for local development
- Credentials: Enabled (for cookie-based auth)
- Methods: Limited to necessary HTTP methods
- Headers: Restricted to `Content-Type` and `Authorization`

**Environment Variable:**
```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## 🔒 Production Deployment Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production` environment variable
- [ ] Configure `ALLOWED_ORIGINS` with your production domain(s)
- [ ] Ensure SSL/TLS certificate is properly configured
- [ ] Test HTTPS redirect functionality
- [ ] Verify HSTS header is present (use [SecurityHeaders.com](https://securityheaders.com))
- [ ] Test CSP in browser console (check for violations)
- [ ] Verify Firebase cookie settings in Firebase Console
- [ ] Remove or minimize `'unsafe-inline'` from CSP if possible
- [ ] Test all functionality with security headers enabled
- [ ] Submit domain to HSTS Preload List (optional but recommended)
- [ ] Configure reverse proxy (nginx/Apache) with security headers if needed
- [ ] Set up security monitoring and logging

## 🧪 Testing Security Headers

### Online Tools:
1. [SecurityHeaders.com](https://securityheaders.com) - Test security headers
2. [Mozilla Observatory](https://observatory.mozilla.org) - Comprehensive security scan
3. [SSL Labs](https://www.ssllabs.com/ssltest/) - SSL/TLS configuration test

### Browser DevTools:
1. Open Network tab
2. Check Response Headers for security headers
3. Check Console for CSP violations
4. Verify cookies have `Secure`, `HttpOnly`, and `SameSite` flags

## 📝 Additional Recommendations

### 1. Remove Inline Scripts and Styles
- Move all inline `<script>` tags to external `.js` files
- Move all inline `<style>` tags to external `.css` files
- This allows removal of `'unsafe-inline'` from CSP

### 2. Implement Subresource Integrity (SRI)
For external scripts (Firebase CDN), add integrity checks:
```html
<script 
    src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
    integrity="sha384-..."
    crossorigin="anonymous">
</script>
```

### 3. Regular Security Audits
- Run `npm audit` regularly
- Update dependencies promptly
- Review security advisories for used packages

### 4. Rate Limiting
Consider adding rate limiting middleware:
```bash
npm install express-rate-limit
```

### 5. Input Validation
- Validate all user inputs server-side
- Sanitize data before storing in database
- Use parameterized queries (if using SQL)

### 6. Error Handling
- Don't expose sensitive information in error messages
- Log errors server-side, show generic messages to users

## 🔗 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [Mozilla MDN - CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Helmet.js Documentation](https://helmetjs.github.io/)

## ⚠️ Important Notes

1. **CSP 'unsafe-inline'**: Currently enabled for scripts and styles. This is a security risk. Consider refactoring to remove inline code.

2. **HSTS Preload**: Only submit to HSTS preload list after thorough testing. Once submitted, it's difficult to remove.

3. **Cookie SameSite**: If you need to support cross-site authentication flows, use `Lax` instead of `Strict`.

4. **Development vs Production**: Security headers are more permissive in development. Always test in production-like environment.

5. **Firebase Configuration**: Review Firebase security rules and authentication settings regularly.

