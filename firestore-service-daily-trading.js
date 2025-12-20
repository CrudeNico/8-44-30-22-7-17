// Firestore Service for Daily Trading Data (Tier 3 Users)
// This service handles storing and retrieving daily trading P&L data

(function() {
    'use strict';
    
    const DAILY_TRADING_COLLECTION = 'dailyTrading';
    
    // Initialize service
    if (!window.dailyTradingFirestoreService) {
        window.dailyTradingFirestoreService = {};
    }
    
    /**
     * Get user collection name based on user type
     * @param {string} userId - User ID
     * @returns {Promise<string>} Collection name ('users' or 'learningUsers')
     */
    async function getUserCollection(userId) {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        // Try users collection first
        const userDoc = await window.firebaseDb.collection('users').doc(userId).get();
        if (userDoc.exists) {
            return 'users';
        }
        
        // Try learningUsers collection
        const learningUserDoc = await window.firebaseDb.collection('learningUsers').doc(userId).get();
        if (learningUserDoc.exists) {
            return 'learningUsers';
        }
        
        // Default to users (for backward compatibility)
        return 'users';
    }
    
    /**
     * Save daily trading data
     * @param {string} userId - User ID (Firestore document ID)
     * @param {Object} tradingData - Trading data object
     * @param {string} tradingData.date - Date in YYYY-MM-DD format
     * @param {number} tradingData.pnl - Profit and Loss amount (positive for profit, negative for loss)
     * @param {number} tradingData.tradesCount - Number of trades
     * @param {string} tradingData.description - Trading description
     * @param {string} tradingData.entry - Entry point/price
     * @param {string} tradingData.exit - Exit point/price
     * @param {number} tradingData.profit - Profit amount
     * @returns {Promise<string>} Document ID
     */
    window.dailyTradingFirestoreService.saveDailyTrading = async function(userId, tradingData) {
        try {
            if (!window.firebaseDb) {
                throw new Error('Firebase database not initialized');
            }
            
            const db = window.firebaseDb;
            const userCollection = await getUserCollection(userId);
            
            // Check if document already exists for this date
            const dateQuery = await db.collection(userCollection).doc(userId)
                .collection(DAILY_TRADING_COLLECTION)
                .where('date', '==', tradingData.date)
                .limit(1)
                .get();
            
            const dataToSave = {
                date: tradingData.date,
                pnl: parseFloat(tradingData.pnl) || 0,
                tradesCount: parseInt(tradingData.tradesCount) || 0,
                description: tradingData.description || '',
                entry: tradingData.entry || '',
                exit: tradingData.exit || '',
                profit: parseFloat(tradingData.profit) || 0,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            if (!dateQuery.empty) {
                // Update existing document
                const docId = dateQuery.docs[0].id;
                await db.collection(userCollection).doc(userId)
                    .collection(DAILY_TRADING_COLLECTION)
                    .doc(docId)
                    .update(dataToSave);
                console.log('Daily trading data updated for date:', tradingData.date);
                return docId;
            } else {
                // Create new document
                dataToSave.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                const docRef = await db.collection(userCollection).doc(userId)
                    .collection(DAILY_TRADING_COLLECTION)
                    .add(dataToSave);
                console.log('Daily trading data saved for date:', tradingData.date);
                return docRef.id;
            }
        } catch (error) {
            console.error('Error saving daily trading data:', error);
            throw error;
        }
    };
    
    /**
     * Get daily trading data for a specific date
     * @param {string} userId - User ID
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {Promise<Object|null>} Trading data or null if not found
     */
    window.dailyTradingFirestoreService.getDailyTradingByDate = async function(userId, date) {
        try {
            if (!window.firebaseDb) {
                throw new Error('Firebase database not initialized');
            }
            
            const db = window.firebaseDb;
            const userCollection = await getUserCollection(userId);
            const querySnapshot = await db.collection(userCollection).doc(userId)
                .collection(DAILY_TRADING_COLLECTION)
                .where('date', '==', date)
                .limit(1)
                .get();
            
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                return {
                    id: doc.id,
                    ...doc.data()
                };
            }
            
            return null;
        } catch (error) {
            console.error('Error getting daily trading data:', error);
            throw error;
        }
    };
    
    /**
     * Get all daily trading data for a month
     * @param {string} userId - User ID
     * @param {number} year - Year (e.g., 2025)
     * @param {number} month - Month (1-12)
     * @returns {Promise<Array>} Array of trading data objects
     */
    window.dailyTradingFirestoreService.getDailyTradingByMonth = async function(userId, year, month) {
        try {
            if (!window.firebaseDb) {
                throw new Error('Firebase database not initialized');
            }
            
            const db = window.firebaseDb;
            const userCollection = await getUserCollection(userId);
            
            // Create date range for the month
            const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
            
            const querySnapshot = await db.collection(userCollection).doc(userId)
                .collection(DAILY_TRADING_COLLECTION)
                .where('date', '>=', startDate)
                .where('date', '<=', endDate)
                .get();
            
            const tradingData = [];
            querySnapshot.forEach((doc) => {
                tradingData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return tradingData;
        } catch (error) {
            console.error('Error getting daily trading data by month:', error);
            throw error;
        }
    };
    
    /**
     * Get all daily trading data for portfolio growth calculation
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of trading data objects sorted by date
     */
    window.dailyTradingFirestoreService.getAllDailyTrading = async function(userId) {
        try {
            if (!window.firebaseDb) {
                throw new Error('Firebase database not initialized');
            }
            
            const db = window.firebaseDb;
            const userCollection = await getUserCollection(userId);
            
            const querySnapshot = await db.collection(userCollection).doc(userId)
                .collection(DAILY_TRADING_COLLECTION)
                .orderBy('date', 'asc')
                .get();
            
            const tradingData = [];
            querySnapshot.forEach((doc) => {
                tradingData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return tradingData;
        } catch (error) {
            console.error('Error getting all daily trading data:', error);
            throw error;
        }
    };
    
    /**
     * Delete daily trading data
     * @param {string} userId - User ID
     * @param {string} documentId - Document ID to delete
     * @returns {Promise<void>}
     */
    window.dailyTradingFirestoreService.deleteDailyTrading = async function(userId, documentId) {
        try {
            if (!window.firebaseDb) {
                throw new Error('Firebase database not initialized');
            }
            
            const db = window.firebaseDb;
            const userCollection = await getUserCollection(userId);
            await db.collection(userCollection).doc(userId)
                .collection(DAILY_TRADING_COLLECTION)
                .doc(documentId)
                .delete();
            
            console.log('Daily trading data deleted:', documentId);
        } catch (error) {
            console.error('Error deleting daily trading data:', error);
            throw error;
        }
    };
    
    console.log('Daily Trading Firestore Service initialized');
})();

