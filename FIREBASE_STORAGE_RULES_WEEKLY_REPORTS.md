# Firebase Storage Security Rules for Weekly Reports

The CORS errors you're seeing when uploading weekly reports (PDFs and videos) are because Firebase Storage security rules need to be configured to allow uploads to the `weekly-reports/` path.

## To Fix the Weekly Report Upload Issue:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `opessocius-17ab9`
3. Navigate to **Storage** > **Rules**
4. Update the rules to allow uploads to the `weekly-reports/` path

## Recommended Storage Rules for Weekly Reports:

Add these rules to allow uploads of PDF reports and video files:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all files
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow write access to weekly reports folder
    match /weekly-reports/{fileName} {
      // Allow uploads of PDFs (max 50MB)
      allow write: if request.resource.size < 50 * 1024 * 1024  // 50MB limit
                   && (request.resource.contentType.matches('application/pdf') ||
                       request.resource.contentType.matches('video/.*'));
      allow read: if true;
    }
    
    // Allow write access to community messages folder (if needed)
    match /community-messages/{messageId}/{fileName} {
      allow write: if request.resource.size < 10 * 1024 * 1024  // 10MB limit
                   && request.resource.contentType.matches('image/.*');
      allow read: if true;
    }
    
    // Deny all other writes by default
    match /{allPaths=**} {
      allow write: if false;
    }
  }
}
```

## Alternative: More Permissive Rules (for development/testing only)

If you want to allow uploads during development, you can use:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.resource.size < 100 * 1024 * 1024; // 100MB limit
    }
  }
}
```

**⚠️ WARNING:** The more permissive rules are less secure and should **ONLY** be used for development/testing. For production, use the specific path-based rules above.

## Current Status

- ✅ **Report metadata (author, date, file names) is being saved correctly to Firestore**
- ⚠️ **PDF and video uploads are failing due to Storage security rules blocking the uploads**
- ✅ **The report data is still saved successfully even if file uploads fail**

Once you update the Storage rules in Firebase Console, file uploads should work correctly. The report metadata (author, date published, file names) is already being saved correctly to the database.

## File Size Limits

- **PDF Reports**: Maximum 50MB (can be adjusted in rules)
- **Video Files**: Maximum 100MB (can be adjusted in rules, but consider using video compression for better performance)

## Authentication Requirements

If you want to restrict uploads to authenticated users only, you can modify the rules to:

```javascript
match /weekly-reports/{fileName} {
  allow write: if request.auth != null  // User must be authenticated
               && request.resource.size < 50 * 1024 * 1024
               && (request.resource.contentType.matches('application/pdf') ||
                   request.resource.contentType.matches('video/.*'));
  allow read: if true;
}
```

## Troubleshooting

### CORS Errors
If you see CORS errors in the console, it means:
1. The Storage security rules are blocking the upload
2. You need to update the rules in Firebase Console as shown above

### Upload Timeout Errors
- PDF uploads timeout after 60 seconds
- Video uploads timeout after 120 seconds (2 minutes)
- If uploads consistently timeout, check your internet connection or reduce file sizes

### "Storage upload failed" Errors
This indicates that Firebase Storage security rules are preventing the upload. Follow the steps above to configure the rules.

