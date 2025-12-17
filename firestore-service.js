// Firestore Service for User Management
// This file handles all Firestore operations for investor users
// Using Firebase CDN - db will be passed from firebase-config.js

// Note: This file now uses Firebase CDN methods instead of modular imports

// Collection name for users
const USERS_COLLECTION = 'users';

/**
 * Convert HTML date input (YYYY-MM-DD) to Firestore Timestamp
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Timestamp|null} - Firestore Timestamp or null
 */
function convertToFirestoreDate(dateString) {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        return Timestamp.fromDate(date);
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
 * Create a new investor user in Firestore
 * @param {Object} userData - User data object
 * @returns {Promise<string>} - Document ID of the created user
 */
export async function createUser(userData) {
    try {
        console.log('createUser called with data:', userData);
        
        // Prepare user data with timestamp
        const userDoc = {
            // Account Information
            username: userData.username,
            email: userData.email,
            phone: userData.phone || '',
            accountNumber: userData.account || '',
            accountStatus: userData.status || 'Active',
            country: userData.country || '',
            memberSince: userData.memberSince ? convertToFirestoreDate(userData.memberSince) : null,
            fullName: userData.name || '',
            
            // Investment Details
            initialInvestment: userData.initial || 0,
            currentBalance: userData.initial || 0, // Start with initial investment
            totalReturn: 0,
            investmentStrategy: userData.strategy || '',
            assignedOperatorEmail: userData.operator || '',
            
            // Metadata
            type: userData.type || 'investor',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            
            // Note: Password should NOT be stored in Firestore
            // Use Firebase Authentication for password management
        };
        
        console.log('User document to save:', userDoc);
        
        // Add document to Firestore
        const docRef = await addDoc(collection(db, USERS_COLLECTION), userDoc);
        
        console.log('User created successfully with ID: ', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error creating user in Firestore:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}

/**
 * Update an existing user in Firestore
 * @param {string} userId - Document ID of the user
 * @param {Object} userData - Updated user data
 * @returns {Promise<void>}
 */
export async function updateUser(userId, userData) {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        
        // Prepare update data (only include fields that are provided)
        const updateData = {
            updatedAt: serverTimestamp()
        };
        
        // Account Information
        if (userData.username !== undefined) updateData.username = userData.username;
        if (userData.email !== undefined) updateData.email = userData.email;
        if (userData.name !== undefined) updateData.fullName = userData.name;
        if (userData.phone !== undefined) updateData.phone = userData.phone;
        if (userData.account !== undefined) updateData.accountNumber = userData.account;
        if (userData.status !== undefined) updateData.accountStatus = userData.status;
        if (userData.country !== undefined) updateData.country = userData.country;
        if (userData.memberSince !== undefined) {
            updateData.memberSince = userData.memberSince ? convertToFirestoreDate(userData.memberSince) : null;
        }
        
        // Investment Details
        if (userData.initial !== undefined) updateData.initialInvestment = userData.initial;
        if (userData.strategy !== undefined) updateData.investmentStrategy = userData.strategy;
        if (userData.operator !== undefined) updateData.assignedOperatorEmail = userData.operator;
        
        // Note: currentBalance and totalReturn are calculated automatically
        // Don't update them here unless explicitly needed
        
        await updateDoc(userRef, updateData);
        console.log('User updated successfully');
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

/**
 * Delete a user from Firestore
 * @param {string} userId - Document ID of the user
 * @returns {Promise<void>}
 */
export async function deleteUser(userId) {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        await deleteDoc(userRef);
        console.log('User deleted successfully');
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

/**
 * Get a single user by document ID
 * @param {string} userId - Document ID of the user
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export async function getUserById(userId) {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            return {
                id: userSnap.id,
                ...userSnap.data()
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
}

/**
 * Get a user by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export async function getUserByUsername(username) {
    try {
        const q = query(
            collection(db, USERS_COLLECTION),
            where('username', '==', username)
        );
        
        const querySnapshot = await getDocs(q);
        
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
        console.error('Error getting user by username:', error);
        throw error;
    }
}

/**
 * Get a user by email
 * @param {string} email - Email to search for
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export async function getUserByEmail(email) {
    try {
        const q = query(
            collection(db, USERS_COLLECTION),
            where('email', '==', email)
        );
        
        const querySnapshot = await getDocs(q);
        
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
        console.error('Error getting user by email:', error);
        throw error;
    }
}

/**
 * Get all users from Firestore
 * @param {string} userType - Optional: filter by user type ('investor', 'admin', etc.)
 * @returns {Promise<Array>} - Array of user objects
 */
export async function getAllUsers(userType = null) {
    try {
        let q;
        
        if (userType) {
            q = query(
                collection(db, USERS_COLLECTION),
                where('type', '==', userType),
                orderBy('createdAt', 'desc')
            );
        } else {
            q = query(
                collection(db, USERS_COLLECTION),
                orderBy('createdAt', 'desc')
            );
        }
        
        const querySnapshot = await getDocs(q);
        const users = [];
        
        querySnapshot.forEach((doc) => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return users;
    } catch (error) {
        console.error('Error getting all users:', error);
        throw error;
    }
}

/**
 * Convert Firestore user data to format expected by admin portal
 * @param {Object} firestoreUser - User data from Firestore
 * @returns {Object} - Formatted user data
 */
export function formatUserForAdminPortal(firestoreUser) {
    return {
        id: firestoreUser.id,
        username: firestoreUser.username || '',
        email: firestoreUser.email || '',
        name: firestoreUser.fullName || '',
        phone: firestoreUser.phone || '',
        account: firestoreUser.accountNumber || '',
        status: firestoreUser.accountStatus || 'Active',
        country: firestoreUser.country || '',
        memberSince: convertFromFirestoreDate(firestoreUser.memberSince) || '',
        initial: firestoreUser.initialInvestment || 0,
        balance: firestoreUser.currentBalance || 0,
        return: firestoreUser.totalReturn || 0,
        strategy: firestoreUser.investmentStrategy || '',
        operator: firestoreUser.assignedOperatorEmail || '',
        type: firestoreUser.type || 'investor',
        // Include Firestore timestamps if needed
        createdAt: firestoreUser.createdAt,
        updatedAt: firestoreUser.updatedAt
    };
}

/**
 * Convert admin portal user data to Firestore format
 * @param {Object} adminUser - User data from admin portal form
 * @returns {Object} - Formatted user data for Firestore
 */
export function formatUserForFirestore(adminUser) {
    return {
        username: adminUser.username,
        email: adminUser.email,
        name: adminUser.name,
        phone: adminUser.phone,
        account: adminUser.account,
        status: adminUser.status,
        country: adminUser.country,
        memberSince: adminUser.memberSince,
        initial: adminUser.initial,
        strategy: adminUser.strategy,
        operator: adminUser.operator,
        type: adminUser.type || 'investor'
    };
}

/**
 * Update user balance and return (for performance calculations)
 * @param {string} userId - Document ID of the user
 * @param {number} newBalance - New balance amount
 * @returns {Promise<void>}
 */
export async function updateUserBalance(userId, newBalance) {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const userData = userSnap.data();
            const initialInvestment = userData.initialInvestment || 0;
            const totalReturn = initialInvestment > 0 
                ? ((newBalance - initialInvestment) / initialInvestment * 100) 
                : 0;
            
            await updateDoc(userRef, {
                currentBalance: newBalance,
                totalReturn: totalReturn,
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error updating user balance:', error);
        throw error;
    }
}

