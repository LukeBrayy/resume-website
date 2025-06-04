import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocs, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBWv8rLcaC3-LCy_SPyBmG_h2U2vJryWhA",
    authDomain: "noderesume.firebaseapp.com",
    projectId: "noderesume",
    storageBucket: "noderesume.firebasestorage.app",
    messagingSenderId: "500260169914",
    appId: "1:500260169914:web:abe4d574a037aa66b3ba83"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Set persistence
setPersistence(auth, browserLocalPersistence);

// Auth helperss
export const loginWithEmail = (password) => 
    signInWithEmailAndPassword(auth, 'mooksnook@gmail.com', password);

export const isAuthenticated = async () => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) return false;
        await currentUser.getIdToken(true);
        return true;
    } catch (error) {
        console.error('Auth error:', error);
        return false;
    }
};

// Firestore helpers
export const saveDocument = (collection, docId, data) => 
    setDoc(doc(db, collection, docId), {
        ...data,
        lastUpdated: new Date().toISOString()
    });

export const getDocument = (collection, docId) => 
    getDoc(doc(db, collection, docId));

// Add these new helper functions
export const getCollection = async (collection) => {
    const snapshot = await getDocs(collection(db, collection));
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

export const updateDocument = (collection, docId, data) => 
    updateDoc(doc(db, collection, docId), data);

export const getSetting = (settingId) => 
    getDoc(doc(db, 'settings', settingId));