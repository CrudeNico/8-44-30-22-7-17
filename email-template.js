/**
 * Generate professional HTML email template
 * @param {string} message - The email message content
 * @param {string} subject - Email subject (optional, for context)
 * @returns {string} - HTML email template
 */
export function generateEmailTemplate(message, subject = '') {
    // Convert plain text newlines to HTML line breaks
    // First escape HTML entities, then convert newlines to <br>
    const htmlMessage = message
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Opessocius</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px 40px 30px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 600; letter-spacing: 1px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                OPESSOCIUS
                            </h1>
                            <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 14px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">
                                Wealth Partners
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <div style="color: #1f2937; font-size: 16px; line-height: 1.6;">
                                ${htmlMessage}
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Divider -->
                    <tr>
                        <td>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 0 40px;">
                                        <div style="border-top: 1px solid #e5e7eb; margin: 0;"></div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">
                                            Best regards,
                                        </p>
                                        <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                                            Opessocius Wealth Partners
                                        </p>
                                        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">
                                            relations@opessocius.support
                                        </p>
                                        <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                                            Building the backbone of specialized market investing
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Bottom Bar -->
                    <tr>
                        <td style="background-color: #1e3a8a; padding: 20px 40px; text-align: center;">
                            <p style="margin: 0; color: #e0e7ff; font-size: 11px; letter-spacing: 0.5px;">
                                © ${new Date().getFullYear()} Opessocius. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
                
                <!-- Spacer -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600">
                    <tr>
                        <td style="padding: 20px 0; text-align: center;">
                            <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                                This email was sent from Opessocius Wealth Partners
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

