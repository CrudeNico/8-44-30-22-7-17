# Firestore Data Structure for Investor Users

## Overview

The investor user data structure has been implemented in Firestore with all the required fields from the admin portal form.

## Collection Name

**`users`** - Main collection for storing investor user data

## Document Structure

Each user document in Firestore contains the following fields:

### Account Information

```javascript
{
  // Login Credentials (stored separately in Firebase Auth)
  username: "john_investor",           // String - Unique username for login
  email: "john@example.com",            // String - Email address (used for Firebase Auth)
  
  // Personal Information
  fullName: "John Investor",           // String - Full name of the user
  phone: "+34 123 456 789",           // String - Phone number
  accountNumber: "ACC-2024-001234",    // String - Account number
  accountStatus: "Active",             // String - Status: "Active", "Inactive", "Suspended"
  country: "Spain",                    // String - Country
  memberSince: "January 2024",        // String - Initiation/start date
  
  // Investment Details
  initialInvestment: 230000,          // Number - Initial investment amount in €
  currentBalance: 287450,              // Number - Current balance (calculated)
  totalReturn: 24.98,                  // Number - Total return percentage (calculated)
  investmentStrategy: "Crude Oil Futures",  // String - Investment strategy
  assignedOperatorEmail: "operator@opessocius.com",  // String - Operator email
  
  // Metadata
  type: "investor",                    // String - User type: "investor" or "admin"
  createdAt: Timestamp,                // Firestore Timestamp - Creation date
  updatedAt: Timestamp                 // Firestore Timestamp - Last update date
}
```

## Important Notes

### Password Storage
- **Passwords are NOT stored in Firestore**
- Passwords are managed through Firebase Authentication
- When creating a user, both Firestore document and Firebase Auth user are created
- Password field in the form is used to create/update the Firebase Auth user

### Calculated Fields
- `currentBalance` - Starts with `initialInvestment`, updated through performance entries
- `totalReturn` - Calculated as: `((currentBalance - initialInvestment) / initialInvestment) * 100`

### Unique Constraints
- `username` - Must be unique across all users
- `email` - Must be unique (also used for Firebase Auth)

## Firestore Service Functions

The `firestore-service.js` file provides the following functions:

### User CRUD Operations

```javascript
// Create a new user
await createUser(userData);

// Update an existing user
await updateUser(userId, userData);

// Delete a user
await deleteUser(userId);

// Get user by document ID
await getUserById(userId);

// Get user by username
await getUserByUsername(username);

// Get user by email
await getUserByEmail(email);

// Get all users (optionally filtered by type)
await getAllUsers(userType); // userType: 'investor', 'admin', or null for all
```

### Helper Functions

```javascript
// Format Firestore user data for admin portal
formatUserForAdminPortal(firestoreUser);

// Format admin portal user data for Firestore
formatUserForFirestore(adminUser);

// Update user balance and return
updateUserBalance(userId, newBalance);
```

## Usage in Admin Portal

The admin portal (`adminportal.html`) has been updated to:

1. **Load users from Firestore** - `loadUsersList()` now fetches from Firestore
2. **Create users** - Form submission creates both Firestore document and Firebase Auth user
3. **Update users** - Form submission updates Firestore document
4. **Validate uniqueness** - Checks username and email uniqueness before saving

## Firebase Authentication Integration

When creating a new user:
1. User data is saved to Firestore
2. Firebase Auth user is created with email/password
3. The email from the form is used as the Firebase Auth identifier

When updating a user:
- Firestore document is updated
- Password can be updated separately (requires user to be signed in for security)

## Example: Creating a User

```javascript
const userData = {
    username: "john_investor",
    password: "securePassword123",  // Used for Firebase Auth only
    name: "John Investor",
    email: "john@example.com",
    phone: "+34 123 456 789",
    account: "ACC-2024-001234",
    status: "Active",
    country: "Spain",
    memberSince: "January 2024",
    initial: 230000,
    strategy: "Crude Oil Futures",
    operator: "operator@opessocius.com",
    type: "investor"
};

// Create user in Firestore
const userId = await createUser(userData);

// User is also created in Firebase Auth automatically
```

## Security Rules Example

For Firestore security rules, you might want:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can read their own data
      allow read: if request.auth != null && 
                     (request.auth.uid == userId || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.type == 'admin');
      
      // Only admins can write
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.type == 'admin';
    }
  }
}
```

## Next Steps

1. **Set up Firestore indexes** (if needed for queries)
   - Go to Firebase Console → Firestore → Indexes
   - Create composite indexes for complex queries

2. **Test the integration**
   - Open admin portal
   - Try creating a new user
   - Verify data appears in Firestore Console
   - Verify user appears in Firebase Authentication

3. **Update other admin portals**
   - Apply similar changes to `adminportal2.html` and `adminportal3.html` if needed

4. **Implement login functionality**
   - Update `login.html` to query Firestore by username
   - Map username to email for Firebase Auth login
   - Store user role/type for authorization

## Troubleshooting

### Users not loading
- Check browser console for errors
- Verify Firestore service is loaded: `window.firestoreService` should exist
- Check Firestore security rules allow reads

### Cannot create users
- Verify Firestore security rules allow writes
- Check that Firebase Auth is enabled
- Verify email/password authentication is enabled in Firebase Console

### Username/email conflicts
- The service automatically checks for duplicates
- Error messages will appear if conflicts are found





