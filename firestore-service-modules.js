// Firestore Service for Learning Modules Management
// This file handles all Firestore operations for learning modules
// Using Firebase CDN - db will be passed from firebase-config.js

// Collection name for learning modules
const LEARNING_MODULES_COLLECTION = 'learningModules';

/**
 * Create a new learning module in Firestore
 * @param {Object} moduleData - Module data object
 * @returns {Promise<string>} - Document ID of the created module
 */
async function createLearningModule(moduleData) {
    try {
        console.log('createLearningModule called with data:', moduleData);
        
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        
        // Prepare module data with timestamp
        const moduleDoc = {
            title: moduleData.title || '',
            description: moduleData.description || '',
            content: moduleData.content || '',
            image: moduleData.image || '',
            additionalImages: moduleData.additionalImages || [],
            order: moduleData.order || 0,
            published: moduleData.published !== false, // Default to true
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        console.log('Module document to save:', moduleDoc);
        
        // Add document to Firestore
        const docRef = await db.collection(LEARNING_MODULES_COLLECTION).add(moduleDoc);
        
        console.log('Module created successfully with ID: ', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error creating module in Firestore:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}

/**
 * Update an existing learning module in Firestore
 * @param {string} moduleId - Document ID of the module
 * @param {Object} moduleData - Updated module data
 * @returns {Promise<void>}
 */
async function updateLearningModule(moduleId, moduleData) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const moduleRef = db.collection(LEARNING_MODULES_COLLECTION).doc(moduleId);
        
        // Prepare update data (only include fields that are provided)
        const updateData = {
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (moduleData.title !== undefined) updateData.title = moduleData.title;
        if (moduleData.description !== undefined) updateData.description = moduleData.description;
        if (moduleData.content !== undefined) updateData.content = moduleData.content;
        if (moduleData.image !== undefined) updateData.image = moduleData.image;
        if (moduleData.additionalImages !== undefined) updateData.additionalImages = moduleData.additionalImages;
        if (moduleData.order !== undefined) updateData.order = moduleData.order;
        if (moduleData.published !== undefined) updateData.published = moduleData.published;
        
        await moduleRef.update(updateData);
        console.log('Module updated successfully');
    } catch (error) {
        console.error('Error updating module:', error);
        throw error;
    }
}

/**
 * Delete a learning module from Firestore
 * @param {string} moduleId - Document ID of the module
 * @returns {Promise<void>}
 */
async function deleteLearningModule(moduleId) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const moduleRef = db.collection(LEARNING_MODULES_COLLECTION).doc(moduleId);
        await moduleRef.delete();
        console.log('Module deleted successfully');
    } catch (error) {
        console.error('Error deleting module:', error);
        throw error;
    }
}

/**
 * Get a single learning module by document ID
 * @param {string} moduleId - Document ID of the module
 * @returns {Promise<Object|null>} - Module data or null if not found
 */
async function getLearningModuleById(moduleId) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const moduleRef = db.collection(LEARNING_MODULES_COLLECTION).doc(moduleId);
        const moduleSnap = await moduleRef.get();
        
        if (moduleSnap.exists()) {
            return {
                id: moduleSnap.id,
                ...moduleSnap.data()
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting module:', error);
        throw error;
    }
}

/**
 * Get all learning modules from Firestore
 * @param {boolean} publishedOnly - If true, only return published modules
 * @returns {Promise<Array>} - Array of module objects
 */
async function getAllLearningModules(publishedOnly = false) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        let query;
        
        if (publishedOnly) {
            query = db.collection(LEARNING_MODULES_COLLECTION)
                .where('published', '==', true)
                .orderBy('order', 'asc')
                .orderBy('createdAt', 'desc');
        } else {
            query = db.collection(LEARNING_MODULES_COLLECTION)
                .orderBy('order', 'asc')
                .orderBy('createdAt', 'desc');
        }
        
        const querySnapshot = await query.get();
        const modules = [];
        
        querySnapshot.forEach((doc) => {
            modules.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return modules;
    } catch (error) {
        console.error('Error getting all modules:', error);
        throw error;
    }
}

/**
 * Convert Firestore module data to format expected by admin portal
 * @param {Object} firestoreModule - Module data from Firestore
 * @returns {Object} - Formatted module data
 */
function formatModuleForAdminPortal(firestoreModule) {
    return {
        id: firestoreModule.id,
        title: firestoreModule.title || '',
        description: firestoreModule.description || '',
        content: firestoreModule.content || '',
        image: firestoreModule.image || '',
        additionalImages: firestoreModule.additionalImages || [],
        order: firestoreModule.order || 0,
        published: firestoreModule.published !== false,
        createdAt: firestoreModule.createdAt,
        updatedAt: firestoreModule.updatedAt
    };
}

/**
 * Convert admin portal module data to Firestore format
 * @param {Object} adminModule - Module data from admin portal form
 * @returns {Object} - Formatted module data for Firestore
 */
function formatModuleForFirestore(adminModule) {
    return {
        title: adminModule.title,
        description: adminModule.description || '',
        content: adminModule.content || '',
        image: adminModule.image || '',
        additionalImages: adminModule.additionalImages || [],
        order: adminModule.order || 0,
        published: adminModule.published !== false
    };
}

// Export functions to window object for use in adminportal3.html and learn.html
window.learningModulesFirestoreService = {
    createLearningModule,
    updateLearningModule,
    deleteLearningModule,
    getLearningModuleById,
    getAllLearningModules,
    formatModuleForAdminPortal,
    formatModuleForFirestore
};



