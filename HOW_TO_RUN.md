# How to Run the Website with Firebase

## ⚠️ Important: You MUST Use a Local Server

Firebase and ES modules **do not work** when opening HTML files directly (file:// protocol). You **must** run a local development server.

## Quick Start

### Option 1: Using Python (Recommended - Usually Pre-installed)

1. Open a terminal/command prompt in this folder
2. Run one of these commands:

**Windows:**
```bash
python -m http.server 8000
```

**Mac/Linux:**
```bash
python3 -m http.server 8000
```

3. Open your browser and go to: `http://localhost:8000`
4. Navigate to `adminportal.html`

### Option 2: Using the Provided Scripts

**Windows:**
- Double-click `start-server.bat`

**Windows PowerShell:**
- Right-click `start-server.ps1` → "Run with PowerShell"

### Option 3: Using Node.js (if you have it installed)

```bash
npx serve -p 8000
```

Then open: `http://localhost:8000`

### Option 4: Using PHP (if you have it installed)

```bash
php -S localhost:8000
```

Then open: `http://localhost:8000`

## Why Do I Need a Server?

- **ES Modules**: The `import/export` statements in JavaScript require HTTP/HTTPS protocol
- **CORS Policy**: Browsers block file:// protocol for security reasons
- **Firebase**: Firebase SDK requires a proper origin (localhost counts)

## Troubleshooting

### "python is not recognized"
- Install Python from https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation

### "npx is not recognized"
- Install Node.js from https://nodejs.org/
- This will also install npm and npx

### Port 8000 is already in use
- Use a different port: `python -m http.server 8080`
- Then access: `http://localhost:8080`

### Still Getting CORS Errors
1. Make sure you're accessing via `http://localhost:8000` (not file://)
2. Check the browser console for the exact error
3. Make sure all files are in the same directory

## Testing Firebase

Once the server is running:

1. Open `http://localhost:8000/adminportal.html`
2. Check browser console (F12) - you should see: "Firebase and Firestore services loaded"
3. Go to Account Settings
4. Try creating a user
5. Check Firebase Console to verify the user was created

## Note About Browser Extension Errors

The `evmAsk.js` errors you see are from a browser extension (likely a crypto wallet). These can be ignored - they don't affect your website functionality.



