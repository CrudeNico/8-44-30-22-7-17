// Firestore Service for Weekly Reports
// This file handles all Firestore operations for weekly reports
// Using Firebase CDN - db and storage will be passed from firebase-config.js

// Collection name for weekly reports (only one document exists at a time)
const WEEKLY_REPORTS_COLLECTION = 'weeklyReports';
const WEEKLY_REPORT_DOC_ID = 'current'; // Single document ID for the current weekly report

/**
 * Upload a PDF file to Firebase Storage
 * @param {File} pdfFile - The PDF file to upload
 * @returns {Promise<string>} - Download URL of the uploaded PDF
 */
async function uploadWeeklyReportPDF(pdfFile) {
    try {
        if (!window.firebaseStorage) {
            throw new Error('Firebase Storage not initialized');
        }
        
        // Check authentication if available
        if (window.firebaseAuth) {
            const currentUser = window.firebaseAuth.currentUser;
            if (!currentUser) {
                console.warn('No authenticated user - upload may fail due to Storage security rules');
            }
        }
        
        const storage = window.firebaseStorage;
        const storageRef = storage.ref();
        
        // Create a unique filename
        const timestamp = Date.now();
        const fileExtension = pdfFile.name.split('.').pop();
        const fileName = `weekly-reports/report_${timestamp}.${fileExtension}`;
        
        console.log(`Uploading PDF to: ${fileName} (size: ${(pdfFile.size / 1024 / 1024).toFixed(2)} MB)`);
        
        // Upload file with metadata
        const pdfRef = storageRef.child(fileName);
        const uploadTask = pdfRef.put(pdfFile, {
            contentType: 'application/pdf',
            customMetadata: {
                originalName: pdfFile.name
            }
        });
        
        // Create a promise that resolves/rejects based on upload state
        let uploadStarted = false;
        let uploadCompleted = false;
        let uploadError = null;
        
        const uploadPromise = new Promise((resolve, reject) => {
            // Monitor upload progress
            uploadTask.on('state_changed',
                (snapshot) => {
                    // Upload started and progressing
                    uploadStarted = true;
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`PDF upload progress: ${progress.toFixed(1)}%`);
                },
                (error) => {
                    // Error occurred during upload
                    console.error('PDF upload error detected:', error);
                    uploadError = error;
                    uploadCompleted = true;
                    reject(error);
                },
                () => {
                    // Upload completed successfully
                    uploadCompleted = true;
                    resolve();
                }
            );
        });
        
        // Quick timeout to catch CORS errors (they fail immediately, usually within 5-8 seconds)
        const quickTimeoutDuration = 10000; // 10 seconds to catch CORS/network errors quickly
        let quickTimeoutId;
        let fullTimeoutId;
        const fullTimeoutDuration = 60000; // 60 seconds total timeout
        
        // Quick check for CORS errors
        const quickTimeoutPromise = new Promise((_, reject) => {
            quickTimeoutId = setTimeout(() => {
                // If upload hasn't started after 10 seconds, likely CORS/network issue
                if (!uploadStarted && !uploadCompleted) {
                    try {
                        uploadTask.cancel();
                    } catch (e) {
                        console.error('Error canceling upload:', e);
                    }
                    reject(new Error('Upload failed to start after 10 seconds - likely CORS or Firebase Storage security rules issue. Please check Storage rules allow uploads to weekly-reports/ path'));
                }
            }, quickTimeoutDuration);
        });
        
        // Full timeout as backup
        const fullTimeoutPromise = new Promise((_, reject) => {
            fullTimeoutId = setTimeout(() => {
                if (!uploadCompleted) {
                    try {
                        uploadTask.cancel();
                    } catch (e) {
                        console.error('Error canceling upload:', e);
                    }
                    reject(new Error('Upload timeout after 60 seconds'));
                }
            }, fullTimeoutDuration);
        });
        
        try {
            // Race between upload completion and timeouts
            await Promise.race([
                uploadPromise,
                quickTimeoutPromise,
                fullTimeoutPromise
            ]);
            
            // Clear timeouts if upload succeeded
            if (quickTimeoutId) clearTimeout(quickTimeoutId);
            if (fullTimeoutId) clearTimeout(fullTimeoutId);
        } catch (timeoutError) {
            // Clear timeouts
            if (quickTimeoutId) clearTimeout(quickTimeoutId);
            if (fullTimeoutId) clearTimeout(fullTimeoutId);
            // Cancel the upload task if still running
            try {
                uploadTask.cancel();
            } catch (cancelError) {
                // Ignore cancel errors
            }
            throw timeoutError;
        }
        
        // Get download URL
        const downloadURL = await pdfRef.getDownloadURL();
        console.log(`PDF uploaded successfully. URL: ${downloadURL.substring(0, 100)}...`);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading PDF:', error);
        // Check if it's a CORS/Storage rules error or timeout
        // CORS errors typically manifest as network errors or "failed to start" errors
        if (error.code === 'storage/unauthorized' || 
            error.code === 'storage/canceled' ||
            error.code === 'storage/quota-exceeded' ||
            error.code === 'storage/unknown' ||
            error.message?.includes('CORS') || 
            error.message?.includes('timeout') || 
            error.message?.includes('Storage rules') ||
            error.message?.includes('security rules') ||
            error.message?.includes('network') ||
            error.message?.includes('permission') ||
            error.message?.includes('failed to start') ||
            error.message?.includes('ERR_FAILED') ||
            error.message?.includes('Access to XMLHttpRequest')) {
            const storageError = new Error('Storage upload failed - Firebase Storage security rules need to allow uploads to weekly-reports/ path. Please check FIREBASE_STORAGE_RULES_WEEKLY_REPORTS.md for setup instructions.');
            storageError.code = error.code || 'storage/unauthorized';
            storageError.isStorageError = true;
            storageError.originalError = error;
            throw storageError;
        }
        throw error;
    }
}

/**
 * Upload a video file to Firebase Storage
 * @param {File} videoFile - The video file to upload
 * @returns {Promise<string>} - Download URL of the uploaded video
 */
async function uploadWeeklyReportVideo(videoFile) {
    try {
        if (!window.firebaseStorage) {
            throw new Error('Firebase Storage not initialized');
        }
        
        // Check authentication if available
        if (window.firebaseAuth) {
            const currentUser = window.firebaseAuth.currentUser;
            if (!currentUser) {
                console.warn('No authenticated user - upload may fail due to Storage security rules');
            }
        }
        
        const storage = window.firebaseStorage;
        const storageRef = storage.ref();
        
        // Create a unique filename
        const timestamp = Date.now();
        const fileExtension = videoFile.name.split('.').pop();
        const fileName = `weekly-reports/video_${timestamp}.${fileExtension}`;
        
        console.log(`Uploading video to: ${fileName} (size: ${(videoFile.size / 1024 / 1024).toFixed(2)} MB)`);
        
        // Upload file with metadata
        const videoRef = storageRef.child(fileName);
        const uploadTask = videoRef.put(videoFile, {
            contentType: videoFile.type || 'video/mp4',
            customMetadata: {
                originalName: videoFile.name
            }
        });
        
        // Create a promise that resolves/rejects based on upload state
        let uploadStarted = false;
        let uploadCompleted = false;
        let uploadError = null;
        
        const uploadPromise = new Promise((resolve, reject) => {
            // Monitor upload progress
            uploadTask.on('state_changed',
                (snapshot) => {
                    // Upload started and progressing
                    uploadStarted = true;
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Video upload progress: ${progress.toFixed(1)}%`);
                },
                (error) => {
                    // Error occurred during upload
                    console.error('Video upload error detected:', error);
                    uploadError = error;
                    uploadCompleted = true;
                    reject(error);
                },
                () => {
                    // Upload completed successfully
                    uploadCompleted = true;
                    resolve();
                }
            );
        });
        
        // Quick timeout to catch CORS errors (they fail immediately, usually within 5-8 seconds)
        const quickTimeoutDuration = 10000; // 10 seconds to catch CORS/network errors quickly
        let quickTimeoutId;
        let fullTimeoutId;
        const fullTimeoutDuration = 120000; // 120 seconds total timeout
        
        // Quick check for CORS errors
        const quickTimeoutPromise = new Promise((_, reject) => {
            quickTimeoutId = setTimeout(() => {
                // If upload hasn't started after 10 seconds, likely CORS/network issue
                if (!uploadStarted && !uploadCompleted) {
                    try {
                        uploadTask.cancel();
                    } catch (e) {
                        console.error('Error canceling upload:', e);
                    }
                    reject(new Error('Upload failed to start after 10 seconds - likely CORS or Firebase Storage security rules issue. Please check Storage rules allow uploads to weekly-reports/ path'));
                }
            }, quickTimeoutDuration);
        });
        
        // Full timeout as backup
        const fullTimeoutPromise = new Promise((_, reject) => {
            fullTimeoutId = setTimeout(() => {
                if (!uploadCompleted) {
                    try {
                        uploadTask.cancel();
                    } catch (e) {
                        console.error('Error canceling upload:', e);
                    }
                    reject(new Error('Upload timeout after 120 seconds'));
                }
            }, fullTimeoutDuration);
        });
        
        try {
            // Race between upload completion and timeouts
            await Promise.race([
                uploadPromise,
                quickTimeoutPromise,
                fullTimeoutPromise
            ]);
            
            // Clear timeouts if upload succeeded
            if (quickTimeoutId) clearTimeout(quickTimeoutId);
            if (fullTimeoutId) clearTimeout(fullTimeoutId);
        } catch (timeoutError) {
            // Clear timeouts
            if (quickTimeoutId) clearTimeout(quickTimeoutId);
            if (fullTimeoutId) clearTimeout(fullTimeoutId);
            // Cancel the upload task if still running
            try {
                uploadTask.cancel();
            } catch (cancelError) {
                // Ignore cancel errors
            }
            throw timeoutError;
        }
        
        // Get download URL
        const downloadURL = await videoRef.getDownloadURL();
        console.log(`Video uploaded successfully. URL: ${downloadURL.substring(0, 100)}...`);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading video:', error);
        // Check if it's a CORS/Storage rules error or timeout
        // CORS errors typically manifest as network errors or "failed to start" errors
        if (error.code === 'storage/unauthorized' || 
            error.code === 'storage/canceled' ||
            error.code === 'storage/quota-exceeded' ||
            error.code === 'storage/unknown' ||
            error.message?.includes('CORS') || 
            error.message?.includes('timeout') || 
            error.message?.includes('Storage rules') ||
            error.message?.includes('security rules') ||
            error.message?.includes('network') ||
            error.message?.includes('permission') ||
            error.message?.includes('failed to start') ||
            error.message?.includes('ERR_FAILED') ||
            error.message?.includes('Access to XMLHttpRequest')) {
            const storageError = new Error('Storage upload failed - Firebase Storage security rules need to allow uploads to weekly-reports/ path. Please check FIREBASE_STORAGE_RULES_WEEKLY_REPORTS.md for setup instructions.');
            storageError.code = error.code || 'storage/unauthorized';
            storageError.isStorageError = true;
            storageError.originalError = error;
            throw storageError;
        }
        throw error;
    }
}

/**
 * Delete old files from Storage
 * @param {string} oldPdfUrl - Old PDF URL to delete (optional)
 * @param {string} oldVideoUrl - Old video URL to delete (optional)
 */
async function deleteOldWeeklyReportFiles(oldPdfUrl, oldVideoUrl) {
    if (!window.firebaseStorage) return;
    
    const storage = window.firebaseStorage;
    
    // Delete old PDF if provided
    if (oldPdfUrl) {
        try {
            const pdfRef = storage.refFromURL(oldPdfUrl);
            await pdfRef.delete();
            console.log('Old PDF deleted from storage');
        } catch (error) {
            console.error('Error deleting old PDF:', error);
            // Continue even if deletion fails
        }
    }
    
    // Delete old video if provided
    if (oldVideoUrl) {
        try {
            const videoRef = storage.refFromURL(oldVideoUrl);
            await videoRef.delete();
            console.log('Old video deleted from storage');
        } catch (error) {
            console.error('Error deleting old video:', error);
            // Continue even if deletion fails
        }
    }
}

/**
 * Save or update the weekly report to Firestore
 * @param {Object} reportData - Report data object
 * @param {string} reportData.author - Report author
 * @param {string} reportData.datePublished - Date published (YYYY-MM-DD)
 * @param {File} reportData.pdfFile - PDF file (required)
 * @param {string} reportData.videoTitle - Video title (optional)
 * @param {File} reportData.videoFile - Video file (optional - if not provided, keeps existing)
 * @returns {Promise<string>} - Document ID (always 'current')
 */
async function saveWeeklyReport(reportData) {
    try {
        console.log('saveWeeklyReport called with data:', {
            author: reportData.author,
            datePublished: reportData.datePublished,
            hasPdf: !!reportData.pdfFile,
            videoTitle: reportData.videoTitle,
            hasVideo: !!reportData.videoFile
        });
        
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const reportRef = db.collection(WEEKLY_REPORTS_COLLECTION).doc(WEEKLY_REPORT_DOC_ID);
        
        // Get existing report to preserve video if not updating it
        let existingReport = null;
        try {
            const existingDoc = await reportRef.get();
            if (existingDoc.exists) {
                existingReport = existingDoc.data();
                console.log('Found existing weekly report');
            }
        } catch (error) {
            console.log('No existing report found (this is fine for first upload)');
        }
        
        // Upload PDF (always required, always updates)
        let pdfUrl = null;
        let pdfFileName = null;
        let oldPdfUrl = null;
        
        if (!reportData.pdfFile) {
            throw new Error('PDF file is required');
        }
        
        pdfFileName = reportData.pdfFile.name;
        
        // Get old PDF URL for deletion
        if (existingReport && existingReport.pdfUrl) {
            oldPdfUrl = existingReport.pdfUrl;
        }
        
        // Try to upload PDF - if it fails due to Storage rules, we'll still save the report data
        try {
            pdfUrl = await uploadWeeklyReportPDF(reportData.pdfFile);
            console.log('PDF uploaded successfully');
        } catch (uploadError) {
            console.error('PDF upload failed:', uploadError);
            // If upload fails due to Storage rules, save report data without file URL
            // The file name is still saved so admin knows what was attempted
            if (uploadError.isStorageError || uploadError.code === 'storage/unauthorized' || uploadError.code === 'storage/canceled' ||
                (uploadError.message && (uploadError.message.includes('CORS') || uploadError.message.includes('timeout') || uploadError.message.includes('Storage rules')))) {
                console.warn('PDF upload failed due to Storage rules - saving report data without file URL');
                // Set pdfUrl to null - we'll save the report data anyway
                pdfUrl = null;
                // Don't throw - continue to save the report metadata
            } else if (existingReport && existingReport.pdfUrl) {
                // Other error but we have existing PDF - keep it
                pdfUrl = existingReport.pdfUrl;
                console.warn('PDF upload failed, keeping existing PDF');
            } else {
                // No existing PDF and upload failed - still save metadata but warn
                console.warn('PDF upload failed - saving report metadata without file URL');
                pdfUrl = null;
                // Don't throw - save what we can
            }
        }
        
        // Handle video - update if provided, keep existing if not
        let videoUrl = null;
        let videoFileName = null;
        let videoTitle = null;
        let oldVideoUrl = null;
        
        if (reportData.videoFile) {
            // New video provided - try to upload it
            videoFileName = reportData.videoFile.name;
            videoTitle = reportData.videoTitle || 'Weekly Analysis Video';
            
            // Get old video URL for deletion
            if (existingReport && existingReport.videoUrl) {
                oldVideoUrl = existingReport.videoUrl;
            }
            
            // Try to upload video - if it fails, keep existing if available
            try {
                videoUrl = await uploadWeeklyReportVideo(reportData.videoFile);
                console.log('Video uploaded successfully');
            } catch (uploadError) {
                console.error('Video upload failed:', uploadError);
                // If upload fails due to Storage rules, try to keep existing
                if (uploadError.isStorageError || uploadError.code === 'storage/unauthorized' || 
                    (uploadError.message && uploadError.message.includes('CORS'))) {
                    console.warn('Video upload failed due to Storage rules');
                    // Try to keep existing video if available
                    if (existingReport && existingReport.videoUrl) {
                        videoUrl = existingReport.videoUrl;
                        videoFileName = existingReport.videoFileName;
                        videoTitle = existingReport.videoTitle;
                        console.warn('Keeping existing video');
                    } else {
                        // No existing video - set to null (video is optional)
                        videoUrl = null;
                        videoFileName = null;
                        videoTitle = null;
                        console.warn('Video upload failed - no video will be available');
                    }
                } else if (existingReport && existingReport.videoUrl) {
                    // Other error but we have existing video - keep it
                    videoUrl = existingReport.videoUrl;
                    videoFileName = existingReport.videoFileName;
                    videoTitle = existingReport.videoTitle;
                    console.warn('Video upload failed, keeping existing video');
                } else {
                    // No existing video and upload failed - set to null (video is optional)
                    videoUrl = null;
                    videoFileName = null;
                    videoTitle = null;
                    console.warn('Video upload failed - no video will be available');
                }
            }
        } else {
            // No new video - keep existing if available
            if (existingReport && existingReport.videoUrl) {
                videoUrl = existingReport.videoUrl;
                videoFileName = existingReport.videoFileName;
                videoTitle = existingReport.videoTitle;
                console.log('Keeping existing video');
            }
        }
        
        // Prepare report document
        // Always include all fields, even if null (Firestore will store null values)
        const reportDoc = {
            author: (reportData.author || '').trim(),
            datePublished: reportData.datePublished || '',
            pdfUrl: pdfUrl, // Can be null - Firestore will store it
            pdfFileName: pdfFileName || '',
            videoUrl: videoUrl, // Can be null
            videoFileName: videoFileName || null,
            videoTitle: videoTitle || null,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Preserve createdAt if it exists, otherwise create new
        if (existingReport && existingReport.createdAt) {
            reportDoc.createdAt = existingReport.createdAt;
        } else {
            reportDoc.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        }
        
        console.log('Saving weekly report to Firestore:', {
            author: reportDoc.author,
            datePublished: reportDoc.datePublished,
            pdfUrl: reportDoc.pdfUrl, // Log actual value
            pdfUrlType: typeof reportDoc.pdfUrl,
            pdfFileName: reportDoc.pdfFileName,
            videoUrl: reportDoc.videoUrl,
            videoTitle: reportDoc.videoTitle
        });
        
        // Save/update the report (using set with merge to create or update)
        await reportRef.set(reportDoc, { merge: true });
        
        console.log('Report document saved to Firestore');
        
        // Verify it was saved
        const savedDoc = await reportRef.get();
        if (savedDoc.exists) {
            const savedData = savedDoc.data();
            console.log('Weekly report saved successfully. Verified data:', {
                author: savedData.author,
                datePublished: savedData.datePublished,
                pdfUrl: savedData.pdfUrl, // Log actual value
                pdfUrlType: typeof savedData.pdfUrl,
                pdfUrlIsNull: savedData.pdfUrl === null,
                pdfUrlIsUndefined: savedData.pdfUrl === undefined,
                pdfFileName: savedData.pdfFileName
            });
        } else {
            console.error('ERROR: Report was not saved to Firestore!');
        }
        
        // Delete old files after successful save
        if (oldPdfUrl || oldVideoUrl) {
            // Delete asynchronously (don't wait)
            deleteOldWeeklyReportFiles(oldPdfUrl, oldVideoUrl).catch(error => {
                console.error('Error deleting old files:', error);
            });
        }
        
        return WEEKLY_REPORT_DOC_ID;
    } catch (error) {
        console.error('Error saving weekly report:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}

/**
 * Get the current weekly report from Firestore
 * @returns {Promise<Object|null>} - Report data or null if not found
 */
async function getWeeklyReport() {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const reportRef = db.collection(WEEKLY_REPORTS_COLLECTION).doc(WEEKLY_REPORT_DOC_ID);
        const reportSnap = await reportRef.get();
        
        if (reportSnap.exists) {
            const data = reportSnap.data();
            
            // Handle base64 storage method
            let pdfUrl = null;
            if (data.fileUrl === 'base64' && data.fileBase64) {
                // Construct data URL from base64
                pdfUrl = 'data:application/pdf;base64,' + data.fileBase64;
            } else if (data.pdfUrl !== undefined && data.pdfUrl !== null && data.pdfUrl !== 'base64') {
                // Use Storage URL if available
                pdfUrl = data.pdfUrl;
            }
            
            console.log('Retrieved weekly report from Firestore:', {
                author: data.author,
                datePublished: data.datePublished,
                hasPdfUrl: pdfUrl !== null,
                storageMethod: data.storageMethod || 'storage',
                pdfFileName: data.pdfFileName || data.fileName
            });
            
            return {
                id: reportSnap.id,
                author: data.author || '',
                datePublished: data.datePublished || '',
                pdfUrl: pdfUrl,
                pdfFileName: data.pdfFileName || data.fileName || '',
                fileBase64: data.fileBase64 || null,
                storageMethod: data.storageMethod || (pdfUrl && pdfUrl.startsWith('data:') ? 'base64' : 'storage'),
                videoUrl: data.videoUrl !== undefined ? data.videoUrl : null,
                videoFileName: data.videoFileName || null,
                videoTitle: data.videoTitle || null,
                createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : null,
                updatedAt: data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt) : null
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting weekly report:', error);
        throw error;
    }
}

/**
 * Delete the weekly report from Firestore and Storage
 * @returns {Promise<void>}
 */
async function deleteWeeklyReport() {
    try {
        if (!window.firebaseDb) {
            throw new Error('Firebase database not initialized');
        }
        
        const db = window.firebaseDb;
        const reportRef = db.collection(WEEKLY_REPORTS_COLLECTION).doc(WEEKLY_REPORT_DOC_ID);
        
        // Get report data to delete files
        const reportSnap = await reportRef.get();
        if (reportSnap.exists) {
            const data = reportSnap.data();
            
            // Delete files from Storage
            await deleteOldWeeklyReportFiles(data.pdfUrl, data.videoUrl);
        }
        
        // Delete document
        await reportRef.delete();
        console.log('Weekly report deleted successfully');
    } catch (error) {
        console.error('Error deleting weekly report:', error);
        throw error;
    }
}

// Export functions to window object for use in HTML files
window.weeklyReportsFirestoreService = {
    saveWeeklyReport,
    getWeeklyReport,
    deleteWeeklyReport
};

