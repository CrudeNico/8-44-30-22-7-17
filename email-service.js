import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateEmailTemplate } from './email-template.js';

dotenv.config();

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || '9e77a1001@smtp-brevo.com',
        pass: process.env.SMTP_PASS || 'y18x7OQfwULhaYt6'
    },
    tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('SMTP connection error:', error);
    } else {
        console.log('✅ SMTP server is ready to send emails');
    }
});

/**
 * Send email using SMTP
 * @param {Object} options - Email options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 * @param {Array} options.attachments - Array of attachment objects
 * @param {string} options.fromEmail - Sender email (optional)
 * @param {string} options.fromName - Sender name (optional)
 * @returns {Promise<Object>} - Result with messageId
 */
export async function sendEmail(options) {
    const {
        to,
        subject,
        html,
        text,
        attachments = [],
        fromEmail = process.env.SMTP_FROM_EMAIL || 'relations@opessocius.support',
        fromName = process.env.SMTP_FROM_NAME || 'Opessocius'
    } = options;

    // Ensure 'to' is an array
    const recipients = Array.isArray(to) ? to : [to];

    // Generate professional HTML template if html is not provided or is plain text
    let finalHtml = html;
    let finalText = text;
    
    // If html is not provided or looks like plain text, use template
    if (!html || (!html.includes('<html') && !html.includes('<!DOCTYPE'))) {
        // Use the message content (either text or html)
        const messageContent = text || html || '';
        finalHtml = generateEmailTemplate(messageContent, subject);
        finalText = text || html || '';
    } else {
        // HTML is already provided, use it as is
        finalHtml = html;
        finalText = text || html.replace(/<[^>]*>/g, ''); // Strip HTML for text version
    }

    // Mail options
    const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: recipients.join(', '),
        subject: subject,
        text: finalText,
        html: finalHtml,
        attachments: attachments
    };

    // Send mail
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', {
        messageId: info.messageId,
        to: recipients,
        subject: subject
    });

    return {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
    };
}

