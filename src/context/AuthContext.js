import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { ROLES, DEFAULT_CONGES_RESTANTS, FIREBASE_COLLECTIONS } from '../utils/constants';

// Créer le Context
const AuthContext = createContext({});

// Hook personnalisé pour utiliser le context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Écouter les changements d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User connecté - récupérer son profil
        try {
          const userDoc = await getDoc(doc(db, FIREBASE_COLLECTIONS.USERS, firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(firebaseUser);
            setUserProfile(userDoc.data());
          }
        } catch (err) {
          console.error('Erreur récupération profil:', err);
          setError(err.message);
        }
      } else {
        // User déconnecté
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    // Cleanup
    return unsubscribe;
  }, []);

  // Inscription
  const register = async (email, password, userData) => {
    try {
      setLoading(true);
      setError(null);

      // Créer user dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Créer profil dans Firestore
      const userProfileData = {
        uid: newUser.uid,
        email: email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || '',
        role: userData.role || ROLES.EMPLOYEE,
        department: userData.department || '',
        position: userData.position || '',
        managerId: userData.managerId || null,
        congesRestants: DEFAULT_CONGES_RESTANTS,
        active: true,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, FIREBASE_COLLECTIONS.USERS, newUser.uid), userProfileData);

      setUser(newUser);
      setUserProfile(userProfileData);
      
      return { success: true, user: newUser };
    } catch (err) {
      console.error('Erreur inscription:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Connexion
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedUser = userCredential.user;

      // Récupérer profil
      const userDoc = await getDoc(doc(db, FIREBASE_COLLECTIONS.USERS, loggedUser.uid));
      
      if (userDoc.exists()) {
        const profile = userDoc.data();
        
        // Vérifier si compte actif
        if (!profile.active) {
          await signOut(auth);
          throw new Error('Compte désactivé. Contactez l\'administrateur.');
        }

        setUser(loggedUser);
        setUserProfile(profile);
        
        return { success: true, user: loggedUser, profile };
      } else {
        throw new Error('Profil utilisateur introuvable');
      }
    } catch (err) {
      console.error('Erreur connexion:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      return { success: true };
    } catch (err) {
      console.error('Erreur déconnexion:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir le profil
  const refreshProfile = async () => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, FIREBASE_COLLECTIONS.USERS, user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      } catch (err) {
        console.error('Erreur refresh profil:', err);
      }
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    register,
    login,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;