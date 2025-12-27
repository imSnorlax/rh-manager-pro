import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialize Auth avec persistence AsyncStorage
// Cela permet de garder l'utilisateur connecté même après fermeture de l'app
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize autres services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;