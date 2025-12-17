// Firebase Configuration using CDN
// Using Firebase CDN v10.7.1

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9DvEzXUxUppgsp71H5d3abPKWkjkea6A",
  authDomain: "opessocius-17ab9.firebaseapp.com",
  projectId: "opessocius-17ab9",
  storageBucket: "opessocius-17ab9.firebasestorage.app",
  messagingSenderId: "835445796116",
  appId: "1:835445796116:web:71b8595886ecb53e612601",
  measurementId: "G-44CX9N3E3J"
};

// Initialize Firebase using CDN
// This will be loaded from CDN in the HTML file
let app, analytics, auth, db;

// Function to initialize Firebase (called after CDN loads)
function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase CDN not loaded');
        return;
    }
    
    app = firebase.initializeApp(firebaseConfig);
    analytics = firebase.analytics();
    auth = firebase.auth();
    db = firebase.firestore();
    
    console.log('Firebase initialized from CDN');
}

// Export for use in other files
export { app, analytics, auth, db, initializeFirebase, firebaseConfig };

