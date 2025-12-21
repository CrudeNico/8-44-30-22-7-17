import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { sendEmail } from './email-service.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

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

