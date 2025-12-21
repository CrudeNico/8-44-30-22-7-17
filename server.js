import express from 'express';
import cors from 'cors';
import multer from 'multer';
import helmet from 'helmet';
import { sendEmail } from './email-service.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// ============================================
// OWASP SECURITY: HTTPS Redirect Middleware
// ============================================
// Force HTTPS redirect in production
if (isProduction) {
    app.use((req, res, next) => {
        // Check if request is secure (HTTPS) or forwarded from a proxy
        const isSecure = req.secure || 
                        req.headers['x-forwarded-proto'] === 'https' ||
                        req.headers['x-forwarded-ssl'] === 'on';
        
        if (!isSecure) {
            return res.redirect(301, `https://${req.headers.host}${req.url}`);
        }
        next();
    });
}

// ============================================
// OWASP SECURITY: Security Headers with Helmet
// ============================================
app.use(helmet({
    // Content Security Policy (CSP) - Strict allowlist
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'", // Required for inline scripts (consider removing if possible)
                "https://www.gstatic.com", // Firebase CDN
                "https://*.firebaseapp.com", // Firebase
                "https://*.firebasestorage.app", // Firebase Storage
                "https://buy.stripe.com", // Stripe payment links
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'", // Required for inline styles (consider removing if possible)
            ],
            imgSrc: [
                "'self'",
                "data:", // For data URIs (base64 images)
                "https:", // Allow HTTPS images from any source (adjust if needed)
                "blob:", // For blob URLs (file uploads)
            ],
            fontSrc: [
                "'self'",
                "data:", // For data URI fonts
                "https:", // Allow HTTPS fonts
            ],
            connectSrc: [
                "'self'",
                "https://*.firebaseapp.com", // Firebase
                "https://*.firebasestorage.app", // Firebase Storage
                "https://*.googleapis.com", // Firebase APIs
                "wss://*.firebaseio.com", // Firebase WebSocket
                "wss://*.firebaseapp.com", // Firebase WebSocket
            ],
            frameSrc: [
                "'self'",
                "https://buy.stripe.com", // Stripe payment iframes
            ],
            objectSrc: ["'none'"], // Block plugins
            upgradeInsecureRequests: isProduction ? [] : null, // Only in production
            blockAllMixedContent: isProduction, // Block mixed content in production
        },
    },
    
    // HTTP Strict Transport Security (HSTS)
    strictTransportSecurity: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },
    
    // X-Frame-Options (anti-clickjacking) - Using CSP frame-ancestors instead
    // But keeping for older browser support
    frameguard: {
        action: 'deny', // Deny all framing
    },
    
    // X-Content-Type-Options: nosniff
    noSniff: true,
    
    // Referrer-Policy
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
    },
    
    // Permissions-Policy (formerly Feature-Policy)
    permissionsPolicy: {
        features: {
            geolocation: ["'none'"],
            microphone: ["'none'"],
            camera: ["'none'"],
            payment: ["'self'", "https://buy.stripe.com"], // Allow Stripe payments
            usb: ["'none'"],
            magnetometer: ["'none'"],
            gyroscope: ["'none'"],
            accelerometer: ["'none'"],
        },
    },
    
    // X-DNS-Prefetch-Control
    dnsPrefetchControl: {
        allow: false,
    },
    
    // X-Download-Options (IE8+)
    ieNoOpen: true,
    
    // X-Permitted-Cross-Domain-Policies
    permittedCrossDomainPolicies: false,
    
    // X-XSS-Protection (legacy, but still useful)
    xssFilter: true,
}));

// ============================================
// CORS Configuration (Security Hardened)
// ============================================
// Update CORS to be more restrictive in production
const corsOptions = {
    origin: isProduction 
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com'] // Configure your domain
        : true, // Allow all origins in development
    credentials: true, // Allow cookies
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// ============================================
// Additional Security Middleware
// ============================================
// Body parser security
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Limit URL-encoded payload size

// Serve static files from current directory
app.use(express.static('.', {
    // Security headers for static files
    setHeaders: (res, path) => {
        // Don't cache sensitive files
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        }
    },
}));

// Configure multer for file uploads (in memory)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit per file
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Email server is running' });
});

// Email sending endpoint
app.post('/api/send-email', upload.array('attachments', 10), async (req, res) => {
    try {
        let { recipients, subject, message, html, fromEmail, fromName } = req.body;

        // Parse recipients if it's a JSON string (from FormData)
        if (typeof recipients === 'string') {
            try {
                recipients = JSON.parse(recipients);
            } catch (e) {
                // If parsing fails, treat as single email
                recipients = [recipients];
            }
        }

        // Ensure recipients is an array
        if (!Array.isArray(recipients)) {
            recipients = [recipients];
        }

        // Validate required fields
        if (!recipients || recipients.length === 0 || recipients.every(r => !r || r.trim() === '')) {
            return res.status(400).json({ 
                success: false, 
                error: 'At least one recipient email is required' 
            });
        }

        // Filter out empty emails
        recipients = recipients.filter(r => r && r.trim() !== '');

        if (!subject || (!message && !html)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Subject and message (or html) are required' 
            });
        }

        // Get attachments from request
        const attachments = req.files ? req.files.map(file => ({
            filename: file.originalname,
            content: file.buffer,
            contentType: file.mimetype
        })) : [];

        // Send email (template will be applied automatically)
        const result = await sendEmail({
            to: recipients,
            subject: subject,
            text: message, // Plain text version
            html: html, // HTML version (optional)
            attachments: attachments,
            fromEmail: fromEmail,
            fromName: fromName
        });

        res.json({
            success: true,
            message: 'Email sent successfully',
            messageId: result.messageId
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to send email'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Email server running on http://localhost:${PORT}`);
    console.log(`📧 SMTP configured: ${process.env.SMTP_HOST || 'Not configured'}`);
});

