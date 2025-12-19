// Firestore Service for Admin Portal 2 Account Management
// This file handles all Firestore operations for adminportal2 accounts
// Using Firebase CDN - db will be passed from firebase-config.js

// Note: This file uses Firebase CDN methods instead of modular imports

// Collection name for adminportal2 accounts (separate from adminportal.html users)
const ADMIN2_ACCOUNTS_COLLECTION = 'admin2Accounts';
const ADMIN2_SETTINGS_COLLECTION = 'admin2Settings';
const ADMIN2_SETTINGS_DOC_ID = 'profile';

/**
 * Convert HTML date input (YYYY-MM-DD) to Firestore Timestamp
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Timestamp|null} - Firestore Timestamp or null
 */
function convertToFirestoreDate(dateString) {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        return firebase.firestore.Timestamp.fromDate(date);
    } catch (error) {
        console.error('Error converting date:', error);
        return null;
    }
}

/**
 * Convert Firestore Timestamp to HTML date input format (YYYY-MM-DD)
 * @param {Timestamp|Date|string} firestoreDate - Firestore Timestamp, Date, or date string
 * @returns {string} - Date string in YYYY-MM-DD format or empty string
 */
function convertFromFirestoreDate(firestoreDate) {
    if (!firestoreDate) return '';
    try {
        let date;
        if (firestoreDate.toDate) {
            // Firestore Timestamp
            date = firestoreDate.toDate();
        } else if (firestoreDate instanceof Date) {
            date = firestoreDate;
        } else {
            // String or other format
            date = new Date(firestoreDate);
        }
        
        // Format as YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('Error converting Firestore date:', error);
        return '';
    }
}

/**
 * Create a new admin2 account in Firestore
 * @param {Object} accountData - Account data object
 * @returns {Promise<string>} - Document ID of the created account
 */
async function createAdmin2Account(accountData) {
    try {
        console.log('createAdmin2Account called with data:', accountData);
        
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        
        // Prepare account data with timestamp
        const accountDoc = {
            // Account Information
            name: accountData.name || '',
            email: accountData.email || '',
            phone: accountData.phone || '',
            accountNumber: accountData.account || '',
            accountStatus: accountData.status || 'Active',
            country: accountData.country || '',
            memberSince: accountData.memberSince ? convertToFirestoreDate(accountData.memberSince) : null,
            
            // Investment Details
            initialInvestment: accountData.initial || 0,
            currentBalance: accountData.initial || 0, // Start with initial investment
            totalReturn: 0,
            investmentStrategy: accountData.strategy || '',
            assignedOperatorEmail: accountData.operator || '',
            
            // Metadata
            type: accountData.type || 'investor',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        console.log('Account document to save:', accountDoc);
        
        // Add document to Firestore
        const docRef = await db.collection(ADMIN2_ACCOUNTS_COLLECTION).add(accountDoc);
        
        console.log('Account created successfully with ID: ', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error creating account in Firestore:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}

/**
 * Update an existing admin2 account in Firestore
 * @param {string} accountId - Document ID of the account
 * @param {Object} accountData - Updated account data
 * @returns {Promise<void>}
 */
async function updateAdmin2Account(accountId, accountData) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const accountRef = db.collection(ADMIN2_ACCOUNTS_COLLECTION).doc(accountId);
        
        // Prepare update data (only include fields that are provided)
        const updateData = {
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Account Information
        if (accountData.name !== undefined) updateData.name = accountData.name;
        if (accountData.email !== undefined) updateData.email = accountData.email;
        if (accountData.phone !== undefined) updateData.phone = accountData.phone;
        if (accountData.account !== undefined) updateData.accountNumber = accountData.account;
        if (accountData.status !== undefined) updateData.accountStatus = accountData.status;
        if (accountData.country !== undefined) updateData.country = accountData.country;
        if (accountData.memberSince !== undefined) {
            updateData.memberSince = accountData.memberSince ? convertToFirestoreDate(accountData.memberSince) : null;
        }
        
        // Investment Details
        if (accountData.initial !== undefined) updateData.initialInvestment = accountData.initial;
        if (accountData.strategy !== undefined) updateData.investmentStrategy = accountData.strategy;
        if (accountData.operator !== undefined) updateData.assignedOperatorEmail = accountData.operator;
        
        // Note: currentBalance and totalReturn are calculated automatically
        // Don't update them here unless explicitly needed
        
        await accountRef.update(updateData);
        console.log('Account updated successfully');
    } catch (error) {
        console.error('Error updating account:', error);
        throw error;
    }
}

/**
 * Delete an admin2 account from Firestore
 * @param {string} accountId - Document ID of the account
 * @returns {Promise<void>}
 */
async function deleteAdmin2Account(accountId) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const accountRef = db.collection(ADMIN2_ACCOUNTS_COLLECTION).doc(accountId);
        await accountRef.delete();
        console.log('Account deleted successfully');
    } catch (error) {
        console.error('Error deleting account:', error);
        throw error;
    }
}

/**
 * Get a single admin2 account by document ID
 * @param {string} accountId - Document ID of the account
 * @returns {Promise<Object|null>} - Account data or null if not found
 */
async function getAdmin2AccountById(accountId) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const accountRef = db.collection(ADMIN2_ACCOUNTS_COLLECTION).doc(accountId);
        const accountSnap = await accountRef.get();
        
        if (accountSnap.exists()) {
            return {
                id: accountSnap.id,
                ...accountSnap.data()
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting account:', error);
        throw error;
    }
}

/**
 * Get an admin2 account by email
 * @param {string} email - Email to search for
 * @returns {Promise<Object|null>} - Account data or null if not found
 */
async function getAdmin2AccountByEmail(email) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const querySnapshot = await db.collection(ADMIN2_ACCOUNTS_COLLECTION)
            .where('email', '==', email)
            .get();
        
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting account by email:', error);
        throw error;
    }
}

/**
 * Get all admin2 accounts from Firestore
 * @param {string} accountType - Optional: filter by account type ('investor', 'admin', etc.)
 * @returns {Promise<Array>} - Array of account objects
 */
async function getAllAdmin2Accounts(accountType = null) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        let query;
        
        if (accountType) {
            query = db.collection(ADMIN2_ACCOUNTS_COLLECTION)
                .where('type', '==', accountType)
                .orderBy('createdAt', 'desc');
        } else {
            query = db.collection(ADMIN2_ACCOUNTS_COLLECTION)
                .orderBy('createdAt', 'desc');
        }
        
        const querySnapshot = await query.get();
        const accounts = [];
        
        querySnapshot.forEach((doc) => {
            accounts.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return accounts;
    } catch (error) {
        console.error('Error getting all accounts:', error);
        throw error;
    }
}

/**
 * Convert Firestore account data to format expected by admin portal 2
 * @param {Object} firestoreAccount - Account data from Firestore
 * @returns {Object} - Formatted account data
 */
function formatAccountForAdminPortal2(firestoreAccount) {
    return {
        id: firestoreAccount.id,
        name: firestoreAccount.name || '',
        email: firestoreAccount.email || '',
        phone: firestoreAccount.phone || '',
        account: firestoreAccount.accountNumber || '',
        status: firestoreAccount.accountStatus || 'Active',
        country: firestoreAccount.country || '',
        memberSince: convertFromFirestoreDate(firestoreAccount.memberSince) || '',
        initial: firestoreAccount.initialInvestment || 0,
        balance: firestoreAccount.currentBalance || 0,
        return: firestoreAccount.totalReturn || 0,
        strategy: firestoreAccount.investmentStrategy || '',
        operator: firestoreAccount.assignedOperatorEmail || '',
        type: firestoreAccount.type || 'investor',
        // Include Firestore timestamps if needed
        createdAt: firestoreAccount.createdAt,
        updatedAt: firestoreAccount.updatedAt
    };
}

/**
 * Convert admin portal 2 account data to Firestore format
 * @param {Object} adminAccount - Account data from admin portal form
 * @returns {Object} - Formatted account data for Firestore
 */
function formatAccountForFirestore(adminAccount) {
    return {
        name: adminAccount.name,
        email: adminAccount.email,
        phone: adminAccount.phone || '',
        account: adminAccount.account,
        status: adminAccount.status,
        country: adminAccount.country || '',
        memberSince: adminAccount.memberSince,
        initial: adminAccount.initial,
        strategy: adminAccount.strategy || '',
        operator: adminAccount.operator || '',
        type: adminAccount.type || 'investor'
    };
}

/**
 * Update account balance and return (for performance calculations)
 * @param {string} accountId - Document ID of the account
 * @param {number} newBalance - New balance amount
 * @returns {Promise<void>}
 */
async function updateAdmin2AccountBalance(accountId, newBalance) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const accountRef = db.collection(ADMIN2_ACCOUNTS_COLLECTION).doc(accountId);
        const accountSnap = await accountRef.get();
        
        if (accountSnap.exists()) {
            const accountData = accountSnap.data();
            const initialInvestment = accountData.initialInvestment || 0;
            const totalReturn = initialInvestment > 0 
                ? ((newBalance - initialInvestment) / initialInvestment * 100) 
                : 0;
            
            await accountRef.update({
                currentBalance: newBalance,
                totalReturn: totalReturn,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error updating account balance:', error);
        throw error;
    }
}

/**
 * Get admin2 profile settings
 * @returns {Promise<Object|null>} - Profile settings or null if not found
 */
async function getAdmin2ProfileSettings() {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const settingsRef = db.collection(ADMIN2_SETTINGS_COLLECTION).doc(ADMIN2_SETTINGS_DOC_ID);
        const settingsSnap = await settingsRef.get();
        
        // Check if document exists - safest approach: try to get data
        // If document doesn't exist, data() returns undefined
        const data = settingsSnap.data();
        
        if (data !== undefined && data !== null) {
            return data;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting admin2 profile settings:', error);
        throw error;
    }
}

/**
 * Update admin2 profile settings
 * @param {Object} settings - Settings object with profilePictureUrl and/or profileName
 * @returns {Promise<void>}
 */
async function updateAdmin2ProfileSettings(settings) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const settingsRef = db.collection(ADMIN2_SETTINGS_COLLECTION).doc(ADMIN2_SETTINGS_DOC_ID);
        
        const updateData = {
            ...settings,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Use set with merge to create if doesn't exist, or update if exists
        await settingsRef.set(updateData, { merge: true });
    } catch (error) {
        console.error('Error updating admin2 profile settings:', error);
        throw error;
    }
}

// Export functions to window object for use in adminportal2.html
window.admin2FirestoreService = {
    createAdmin2Account,
    updateAdmin2Account,
    deleteAdmin2Account,
    getAdmin2AccountById,
    getAdmin2AccountByEmail,
    getAllAdmin2Accounts,
    formatAccountForAdminPortal2,
    formatAccountForFirestore,
    updateAdmin2AccountBalance,
    getAdmin2ProfileSettings,
    updateAdmin2ProfileSettings
};

