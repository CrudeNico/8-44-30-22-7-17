# Firestore Security Rules Setup

## Current Error
You're getting `permission-denied` because Firestore security rules are blocking writes.

## Quick Fix (Development Only)

Go to Firebase Console → Firestore Database → Rules tab and use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes (DEVELOPMENT ONLY - NOT FOR PRODUCTION!)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ WARNING: These rules allow anyone to read/write. Only use for development!**

## Production Rules (Recommended)

For production, use these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.type == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read their own data
      allow read: if isAuthenticated() && 
                     (request.auth.uid == userId || isAdmin());
      
      // Only admins can create/update users
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## How to Update Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **opessocius-17ab9**
3. Click **Firestore Database** in the left menu
4. Click the **Rules** tab
5. Paste the rules above
6. Click **Publish**

## Testing

After updating rules:
1. Refresh your admin portal page
2. Try creating a user again
3. The error should be gone

## For Now (Quick Test)

If you just want to test quickly, use the development rules (first set) temporarily, then switch to production rules later.

