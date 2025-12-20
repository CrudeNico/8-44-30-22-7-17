// Firestore Service for Community Messages
// This file handles all Firestore operations for community messages sent by admins
// Using Firebase CDN - db and storage will be passed from firebase-config.js

// Collection name for community messages
const COMMUNITY_MESSAGES_COLLECTION = 'communityMessages';

/**
 * Save a community message to Firestore
 * @param {Object} messageData - Message data object
 * @param {string} messageData.title - Message title
 * @param {string} messageData.subheading - Message subheading (optional)
 * @param {string} messageData.link - Link to share (optional)
 * @param {string} messageData.message - Message text
 * @returns {Promise<string>} - Document ID of the created message
 */
async function saveCommunityMessage(messageData) {
    try {
        console.log('saveCommunityMessage called with data:', {
            title: messageData.title,
            subheading: messageData.subheading,
            link: messageData.link,
            message: messageData.message,
            professor: messageData.professor,
            professorTitle: messageData.professorTitle
        });
        
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        
        // Create message document first to get ID
        // Ensure all fields are properly saved
        const messageDoc = {
            title: (messageData.title || '').trim(),
            subheading: (messageData.subheading || '').trim(),
            link: (messageData.link || '').trim(),
            message: (messageData.message || '').trim(),
            imageUrls: [], // Images not supported - kept for backward compatibility
            professor: messageData.professor || 'Admin', // Default to 'Admin' or get from admin profile
            professorTitle: messageData.professorTitle || 'Administrator', // Default title
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        console.log('Saving message document to Firestore:', {
            title: messageDoc.title,
            subheading: messageDoc.subheading,
            link: messageDoc.link,
            messageLength: messageDoc.message.length,
            professor: messageDoc.professor,
            professorTitle: messageDoc.professorTitle
        });
        
        // Add document to Firestore to get ID
        const docRef = await db.collection(COMMUNITY_MESSAGES_COLLECTION).add(messageDoc);
        const messageId = docRef.id;
        
        console.log('Message document created successfully with ID:', messageId);
        
        // Verify the document was saved correctly
        try {
            const savedDoc = await docRef.get();
            // In Firebase compat API, exists is a property, not a method
            if (savedDoc.exists) {
                const savedData = savedDoc.data();
                console.log('Verified saved message data:', {
                    title: savedData.title,
                    subheading: savedData.subheading,
                    link: savedData.link,
                    messageLength: savedData.message ? savedData.message.length : 0,
                    professor: savedData.professor,
                    professorTitle: savedData.professorTitle
                });
            } else {
                console.warn('Document verification: Document does not exist after creation');
            }
        } catch (verifyError) {
            console.warn('Could not verify saved document (non-critical):', verifyError);
            // Don't throw - message was already created successfully
        }
        
        console.log('Community message saved successfully with ID:', messageId);
        return messageId;
    } catch (error) {
        console.error('Error saving community message:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}

/**
 * Get all community messages from Firestore
 * @param {number} limit - Optional limit on number of messages to retrieve
 * @returns {Promise<Array>} - Array of message objects
 */
async function getAllCommunityMessages(limit = null) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        let query = db.collection(COMMUNITY_MESSAGES_COLLECTION)
            .orderBy('timestamp', 'desc');
        
        if (limit) {
            query = query.limit(limit);
        }
        
        const querySnapshot = await query.get();
        const messages = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                professor: data.professor || 'Admin',
                professorTitle: data.professorTitle || 'Administrator',
                messageTitle: data.title || '', // Message title
                message: data.message || '',
                subheading: data.subheading || '',
                link: data.link || '',
                imageUrls: data.imageUrls || [],
                timestamp: data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate().toISOString() : data.timestamp) : new Date().toISOString(),
                createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString()
            });
        });
        
        return messages;
    } catch (error) {
        console.error('Error getting community messages:', error);
        throw error;
    }
}

/**
 * Delete a community message from Firestore
 * @param {string} messageId - Document ID of the message
 * @returns {Promise<void>}
 */
async function deleteCommunityMessage(messageId) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const messageRef = db.collection(COMMUNITY_MESSAGES_COLLECTION).doc(messageId);
        
        // Note: Image deletion removed - images are no longer supported
        
        await messageRef.delete();
        console.log('Community message deleted successfully');
    } catch (error) {
        console.error('Error deleting community message:', error);
        throw error;
    }
}

// Export functions to window object for use in HTML files
window.communityMessagesFirestoreService = {
    saveCommunityMessage,
    getAllCommunityMessages,
    deleteCommunityMessage
};

