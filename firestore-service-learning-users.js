// Firestore Service for Learning Users Management
// This file handles all Firestore operations for learning community users
// Using Firebase CDN - db will be passed from firebase-config.js

// Collection name for learning users
const LEARNING_USERS_COLLECTION = 'learningUsers';

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
 * Create a new learning user in Firestore
 * @param {Object} userData - User data object
 * @returns {Promise<string>} - Document ID of the created user
 */
async function createLearningUser(userData) {
    try {
        console.log('createLearningUser called with data:', userData);
        
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        
        // Prepare user data with timestamp
        const userDoc = {
            // Account Information
            username: userData.username || '',
            email: userData.email || '',
            phone: userData.phone || '',
            fullName: userData.firstname && userData.lastname 
                ? `${userData.firstname} ${userData.lastname}`.trim()
                : userData.firstname || userData.lastname || '',
            firstName: userData.firstname || '',
            lastName: userData.lastname || '',
            
            // User Type and Tier
            type: 'learning', // Always learning user
            tier: userData.tier || 'tier1', // tier1, tier2, or tier3
            
            // Status
            active: userData.active !== false, // Default to true
            
            // Metadata
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        console.log('Learning user document to save:', userDoc);
        
        // Add document to Firestore
        const docRef = await db.collection(LEARNING_USERS_COLLECTION).add(userDoc);
        
        console.log('Learning user created successfully with ID: ', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error creating learning user in Firestore:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}

/**
 * Update an existing learning user in Firestore
 * @param {string} userId - Document ID of the user
 * @param {Object} userData - Updated user data
 * @returns {Promise<void>}
 */
async function updateLearningUser(userId, userData) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const userRef = db.collection(LEARNING_USERS_COLLECTION).doc(userId);
        
        // Prepare update data (only include fields that are provided)
        const updateData = {
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Account Information
        if (userData.username !== undefined) updateData.username = userData.username;
        if (userData.email !== undefined) updateData.email = userData.email;
        if (userData.phone !== undefined) updateData.phone = userData.phone;
        if (userData.firstname !== undefined) updateData.firstName = userData.firstname;
        if (userData.lastname !== undefined) updateData.lastName = userData.lastname;
        if (userData.firstname !== undefined || userData.lastname !== undefined) {
            const firstName = userData.firstname !== undefined ? userData.firstname : (await userRef.get()).data()?.firstName || '';
            const lastName = userData.lastname !== undefined ? userData.lastname : (await userRef.get()).data()?.lastName || '';
            updateData.fullName = `${firstName} ${lastName}`.trim();
        }
        
        // Tier
        if (userData.tier !== undefined) updateData.tier = userData.tier;
        
        // Status
        if (userData.active !== undefined) updateData.active = userData.active;
        
        await userRef.update(updateData);
        console.log('Learning user updated successfully');
    } catch (error) {
        console.error('Error updating learning user:', error);
        throw error;
    }
}

/**
 * Delete a learning user from Firestore
 * @param {string} userId - Document ID of the user
 * @returns {Promise<void>}
 */
async function deleteLearningUser(userId) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const userRef = db.collection(LEARNING_USERS_COLLECTION).doc(userId);
        await userRef.delete();
        console.log('Learning user deleted successfully');
    } catch (error) {
        console.error('Error deleting learning user:', error);
        throw error;
    }
}

/**
 * Get a single learning user by document ID
 * @param {string} userId - Document ID of the user
 * @returns {Promise<Object|null>} - User data or null if not found
 */
async function getLearningUserById(userId) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const userRef = db.collection(LEARNING_USERS_COLLECTION).doc(userId);
        const userSnap = await userRef.get();
        
        if (userSnap.exists()) {
            return {
                id: userSnap.id,
                ...userSnap.data()
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting learning user:', error);
        throw error;
    }
}

/**
 * Get a learning user by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} - User data or null if not found
 */
async function getLearningUserByUsername(username) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const querySnapshot = await db.collection(LEARNING_USERS_COLLECTION)
            .where('username', '==', username)
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
        console.error('Error getting learning user by username:', error);
        throw error;
    }
}

/**
 * Get a learning user by email
 * @param {string} email - Email to search for
 * @returns {Promise<Object|null>} - User data or null if not found
 */
async function getLearningUserByEmail(email) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const querySnapshot = await db.collection(LEARNING_USERS_COLLECTION)
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
        console.error('Error getting learning user by email:', error);
        throw error;
    }
}

/**
 * Get all learning users from Firestore
 * @returns {Promise<Array>} - Array of user objects
 */
async function getAllLearningUsers() {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const querySnapshot = await db.collection(LEARNING_USERS_COLLECTION)
            .orderBy('createdAt', 'desc')
            .get();
        
        const users = [];
        
        querySnapshot.forEach((doc) => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return users;
    } catch (error) {
        console.error('Error getting all learning users:', error);
        throw error;
    }
}

/**
 * Convert Firestore learning user data to format expected by admin portal
 * @param {Object} firestoreUser - User data from Firestore
 * @returns {Object} - Formatted user data
 */
function formatLearningUserForAdminPortal(firestoreUser) {
    return {
        id: firestoreUser.id,
        username: firestoreUser.username || '',
        email: firestoreUser.email || '',
        firstname: firestoreUser.firstName || '',
        lastname: firestoreUser.lastName || '',
        phone: firestoreUser.phone || '',
        tier: firestoreUser.tier || 'tier1',
        active: firestoreUser.active !== false,
        type: 'learning',
        createdAt: firestoreUser.createdAt,
        updatedAt: firestoreUser.updatedAt
    };
}

/**
 * Convert admin portal learning user data to Firestore format
 * @param {Object} adminUser - User data from admin portal form
 * @returns {Object} - Formatted user data for Firestore
 */
function formatLearningUserForFirestore(adminUser) {
    return {
        username: adminUser.username,
        email: adminUser.email,
        firstname: adminUser.firstname,
        lastname: adminUser.lastname,
        phone: adminUser.phone || '',
        tier: adminUser.tier || 'tier1',
        active: adminUser.active !== false
    };
}

// Export functions to window object for use in adminportal3.html
window.learningUsersFirestoreService = {
    createLearningUser,
    updateLearningUser,
    deleteLearningUser,
    getLearningUserById,
    getLearningUserByUsername,
    getLearningUserByEmail,
    getAllLearningUsers,
    formatLearningUserForAdminPortal,
    formatLearningUserForFirestore
};


