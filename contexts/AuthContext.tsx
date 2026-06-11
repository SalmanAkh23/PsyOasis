import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextProps {
  user: any;
  loading: boolean;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string; phoneNumber?: string; bio?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const COOKIE_NAME = 'psyoasis_token';

const setAuthCookie = (token: string | null) => {
  if (typeof window === 'undefined') return;
  try {
    const secure = window.location.protocol === 'https:';
    const maxAge = 60 * 60 * 24 * 7;
    if (token) {
      const value = encodeURIComponent(token);
      const securePart = secure ? ' Secure;' : '';
      document.cookie = `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge};${securePart} SameSite=Lax;`;
    } else {
      document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    }
  } catch (err) {
    console.error('Auth cookie error:', err);
  }
};

const getFirestoreProfile = async (uid: string): Promise<Record<string, any>> => {
  if (!db) return {};
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.error('Firestore profile fetch error:', err);
  }
  return {};
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserWithProfile = async (firebaseUser: any) => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }
    const profile = await getFirestoreProfile(firebaseUser.uid);
    setUser({ ...firebaseUser, ...profile });
  };

  useEffect(() => {
    (async () => {
      try {
        const { setPersistence, browserLocalPersistence } = await import('firebase/auth');
        if (auth && setPersistence) {
          await setPersistence(auth, browserLocalPersistence);
        }
      } catch (err) {
        console.error('Persistence set error:', err);
      }
    })();

    const unsubscribe = auth.onAuthStateChanged(async (u: any) => {
      try {
        if (u) {
          await refreshUserWithProfile(u);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
      }
      setLoading(false);

      try {
        if (typeof window !== 'undefined' && u) {
          const getId = (u as any).getIdToken;
          if (getId) {
            const token = await (u as any).getIdToken(true);
            setAuthCookie(token);
          } else {
            setAuthCookie('dev');
          }
        } else if (typeof window !== 'undefined') {
          setAuthCookie(null);
        }
      } catch (e) {
        console.error('Auth token sync error:', e);
      }
    });

    return () => unsubscribe();
  }, []);

  const syncToken = async (u: any) => {
    try {
      if (u && (u as any).getIdToken) {
        const token = await (u as any).getIdToken(true);
        setAuthCookie(token);
      } else if (u) {
        setAuthCookie('dev');
      } else {
        setAuthCookie(null);
      }
    } catch (e) {
      console.error('syncToken error:', e);
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (cred.user) {
      await updateProfile(cred.user, { displayName });
      if (db) {
        await setDoc(doc(db, 'users', cred.user.uid), { displayName, email, createdAt: new Date().toISOString() });
      }
      await refreshUserWithProfile(cred.user);
      await syncToken(cred.user);
    }
  };

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await refreshUserWithProfile(cred.user);
    await syncToken(cred.user);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    if (db && cred.user) {
      const ref = doc(db, 'users', cred.user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          displayName: cred.user.displayName,
          email: cred.user.email,
          createdAt: new Date().toISOString(),
        });
      }
    }
    await refreshUserWithProfile(cred.user);
    await syncToken(cred.user);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    try {
      setAuthCookie(null);
    } catch (e) {
      console.error('Logout cookie clear error:', e);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string; phoneNumber?: string; bio?: string }) => {
    const current = auth.currentUser;
    if (!current) return;
    // Update Firebase Auth fields (skip photoURL — data URL terlalu panjang)
    const toUpdate: any = {};
    if (data.displayName) toUpdate.displayName = data.displayName;
    if (Object.keys(toUpdate).length > 0) {
      try {
        await updateProfile(current, toUpdate);
      } catch (err) {
        console.error('Auth profile update error:', err);
      }
    }

    // Save to Firestore
    if (db) {
      try {
        const ref = doc(db, 'users', current.uid);
        const firestoreData: Record<string, any> = {};
        if (data.displayName) firestoreData.displayName = data.displayName;
        if (data.phoneNumber) firestoreData.phoneNumber = data.phoneNumber;
        if (data.bio) firestoreData.bio = data.bio;
        if (data.photoURL) firestoreData.photoURL = data.photoURL;
        if (Object.keys(firestoreData).length > 0) {
          await setDoc(ref, firestoreData, { merge: true });
        }
      } catch (err) {
        console.error('Firestore profile save error:', err);
      }
    }

    // Refresh local state
    try {
      await refreshUserWithProfile(current);
    } catch (err) {
      setUser((prev: any) => ({ ...(prev || {}), ...data }));
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, loginWithGoogle, logout, resetPassword, updateUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};