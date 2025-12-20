# Firebase Storage Security Rules for Community Messages

The CORS error you're seeing is because Firebase Storage security rules need to be configured to allow uploads.

## To Fix the Image Upload Issue:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `opessocius-17ab9`
3. Navigate to **Storage** > **Rules**
4. Update the rules to allow uploads to the `community-messages/` path

## Recommended Storage Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all files
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow write access to community messages folder
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

## Alternative: More Permissive Rules (for development/testing)

If you want to allow uploads during development, you can use:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

**Note:** The more permissive rules are less secure and should only be used for development/testing.

## Current Status

- ✅ **Message text, title, subheading, and link are being saved correctly to Firestore**
- ⚠️ **Image uploads are failing due to Storage security rules**
- ✅ **The message is still saved successfully even if images fail**

Once you update the Storage rules, image uploads should work. The message data (title, subheading, link, message text) is already being saved correctly to the database.


