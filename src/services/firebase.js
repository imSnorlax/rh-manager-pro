import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // ← Plus simple, sans persistence
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBIl_8ACyOmF8iUEHZ9NciwlFOw4TXp5Bg",
  authDomain: "rhmanagerpro-f8c40.firebaseapp.com",
  projectId: "rhmanagerpro-f8c40",
  storageBucket: "rhmanagerpro-f8c40.firebasestorage.app",
  messagingSenderId: "1098234970628",
  appId: "1:1098234970628:web:b433fab73889561d956b51"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth SANS persistence AsyncStorage
// L'utilisateur sera déconnecté après fermeture de l'app
export const auth = getAuth(app);

// Initialize Firestore avec config optimisée pour React Native
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // Fix pour React Native
});

// Initialize Storage
export const storage = getStorage(app);

export default app;