# Firebase Setup Guide

## Files Created

1. **firebase-config.js** - Firebase configuration file with your credentials
2. **package.json** - Node.js package configuration
3. **firebase-example.html** - Example file showing how to use Firebase

## Current Setup

Firebase has been integrated into `login.html`. The configuration includes:
- Firebase App initialization
- Firebase Authentication
- Firestore Database
- Analytics

## How to Use Firebase

### Option 1: Using npm packages (Current Setup)

Since you've installed Firebase via npm, you need to run a local development server for ES modules to work:

1. **Start a local server:**
   ```bash
   # Option A: Using Python
   python -m http.server 8000
   
   # Option B: Using Node.js serve
   npx serve
   
   # Option C: Using PHP
   php -S localhost:8000
   ```

2. **Access your site:**
   Open `http://localhost:8000` in your browser

3. **Why?** 
   - ES modules (`import/export`) require a server due to CORS restrictions
   - Direct file access (`file://`) won't work with ES modules

### Option 2: Using Firebase CDN (Simpler)

If you prefer not to use a local server, you can use Firebase CDN instead:

1. In `login.html`, uncomment the CDN script block (lines with `<!-- Alternative: Firebase CDN -->`)
2. Comment out or remove the npm import script
3. This works without a local server

## Next Steps

### 1. Set up Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `opessocius-17ab9`
3. Go to **Authentication** → **Sign-in method**
4. Enable **Email/Password** authentication
5. (Optional) Enable other sign-in methods as needed

### 2. Create Users in Firebase

You can create users in two ways:

**Option A: Firebase Console**
- Go to Authentication → Users
- Click "Add user"
- Enter email and password

**Option B: Programmatically**
- Use the admin portals you created to add users
- Store username/password in Firestore and map to Firebase Auth

### 3. Update Login Logic

Currently, the login page tries Firebase Auth first, then falls back to hardcoded credentials. You should:

1. Store user data in Firestore with:
   - `username` field
   - `email` field (for Firebase Auth)
   - `password` field (hashed, or use Firebase Auth)
   - `role` field (tier1, tier2, tier3, admin, etc.)

2. Update login to:
   - Query Firestore by username
   - Get the associated email
   - Use Firebase Auth with email/password
   - Check user role and redirect accordingly

### 4. Set up Firestore Database

1. Go to Firebase Console → **Firestore Database**
2. Create a database (start in test mode for development)
3. Create collections:
   - `users` - Store user information
   - `transactions` - Store transaction data
   - `reports` - Store monthly reports
   - etc.

### 5. Security Rules

Set up Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add more rules as needed
  }
}
```

## Using Firebase in Other Files

To use Firebase in other HTML files:

```html
<script type="module">
    import { app, auth, db } from './firebase-config.js';
    
    // Use Firebase services
    import { collection, getDocs } from 'firebase/firestore';
    
    // Example: Get users from Firestore
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    snapshot.forEach((doc) => {
        console.log(doc.id, doc.data());
    });
</script>
```

## Common Firebase Services

### Authentication
```javascript
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Sign in
await signInWithEmailAndPassword(auth, email, password);

// Sign up
await createUserWithEmailAndPassword(auth, email, password);

// Sign out
await signOut(auth);
```

### Firestore
```javascript
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Add document
await addDoc(collection(db, 'users'), { name: 'John', email: 'john@example.com' });

// Get documents
const snapshot = await getDocs(collection(db, 'users'));

// Update document
await updateDoc(doc(db, 'users', userId), { name: 'Jane' });

// Delete document
await deleteDoc(doc(db, 'users', userId));
```

## Troubleshooting

### "Cannot use import statement outside a module"
- Make sure your script tag has `type="module"`
- Run a local server (see Option 1 above)

### "Firebase not initialized"
- Check that `firebase-config.js` is in the same directory
- Make sure the script is loaded before using Firebase
- Check browser console for errors

### Authentication not working
- Verify Email/Password is enabled in Firebase Console
- Check that users exist in Firebase Authentication
- Ensure you're using email (not username) for Firebase Auth

## Production Deployment

When deploying to production:

1. Update Firestore security rules
2. Enable proper authentication methods
3. Set up proper CORS if needed
4. Consider using environment variables for config (don't commit API keys to public repos)
5. Test all authentication flows

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Guide](https://firebase.google.com/docs/auth)
- [Firestore Guide](https://firebase.google.com/docs/firestore)





