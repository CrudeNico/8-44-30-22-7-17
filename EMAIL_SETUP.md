# 📧 Email SMTP Setup Guide

## ✅ What You Need

The SMTP credentials you provided are correct and have been configured:
- **SMTP Server**: smtp-relay.brevo.com
- **Port**: 587
- **Username**: 9e77a1001@smtp-brevo.com
- **Password**: y18x7OQfwULhaYt6

## 🚀 Quick Start

### Step 1: Install Dependencies

Open a terminal in this folder and run:

```bash
npm install
```

This will install:
- `express` - Web server
- `nodemailer` - Email sending library
- `cors` - Cross-origin resource sharing
- `multer` - File upload handling
- `dotenv` - Environment variable management

### Step 2: Configure Environment Variables

The credentials are already configured in `server.js` and `email-service.js`. However, for better security, you can create a `.env` file (it's already in `.gitignore`):

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=9e77a1001@smtp-brevo.com
SMTP_PASS=y18x7OQfwULhaYt6
SMTP_FROM_EMAIL=noreply@opessocius.com
SMTP_FROM_NAME=Opessocius
PORT=3000
```

### Step 3: Start the Email Server

Run one of these commands:

**Option 1: Using npm script**
```bash
npm start
```

**Option 2: Direct node command**
```bash
node server.js
```

**Option 3: Windows PowerShell (double-click)**
- Double-click `start-email-server.ps1`

The server will start on `http://localhost:3000`

### Step 4: Start Your Website Server

In a **separate terminal**, start your website server:

```bash
python -m http.server 8000
```

Or use any of the methods from `HOW_TO_RUN.md`

### Step 5: Test Email Sending

1. Open `http://localhost:8000/adminportal3.html`
2. Navigate to the "Emails" section
3. Fill out the email form and send a test email

## 📋 How It Works

1. **Frontend** (`adminportal3.html`): The email form collects recipient(s), subject, message, and attachments
2. **API Endpoint** (`/api/send-email`): Receives the email data and files
3. **Email Service** (`email-service.js`): Uses nodemailer to send emails via Brevo SMTP
4. **Response**: Returns success/error message to the frontend

## 🔧 API Endpoint

**POST** `/api/send-email`

**Request Body** (FormData):
- `recipients` (JSON string array): Email addresses
- `subject` (string): Email subject
- `message` (string): Email body (supports plain text)
- `attachments` (files): Optional PDF attachments (max 10MB each)

**Response**:
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "..."
}
```

## 🛠️ Troubleshooting

### "Cannot connect to email server"
- Make sure the email server is running: `npm start`
- Check that port 3000 is not in use
- Verify the server console shows "✅ SMTP server is ready to send emails"

### "CORS error"
- The server has CORS enabled, but if you see errors, make sure:
  - Website is running on `http://localhost:8000`
  - Email server is running on `http://localhost:3000`
  - Both are using `localhost` (not `127.0.0.1`)

### "SMTP authentication failed"
- Verify your Brevo credentials are correct
- Check if your Brevo account is active
- Ensure port 587 is not blocked by firewall

### "Email not received"
- Check spam/junk folder
- Verify recipient email address is correct
- Check Brevo dashboard for delivery status
- Look at server console for error messages

## 🔒 Security Notes

- The `.env` file is in `.gitignore` to protect credentials
- Never commit SMTP credentials to version control
- For production, use environment variables or a secure secrets manager
- Consider rate limiting for production use

## 📝 Email Features

✅ Send to multiple recipients  
✅ HTML and plain text support  
✅ PDF attachments (up to 10MB each)  
✅ Custom sender name and email  
✅ Error handling and user feedback  

## 🎯 Next Steps

- Test sending emails from the admin portal
- Customize email templates if needed
- Set up email logging/monitoring for production
- Consider adding email templates for common messages

