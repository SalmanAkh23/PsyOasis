import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';

interface AuthContextProps {
  user: any; // Firebase User or null
  loading: boolean;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile?: (data: { displayName?: string; photoURL?: string; phoneNumber?: string; bio?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const COOKIE_NAME = 'psyoasis_token';
  const setAuthCookie = (token: string | null) => {
    if (typeof window === 'undefined') return;
    try {
      const secure = window.location.protocol === 'https:';
      const maxAge = 60 * 60 * 24 * 7; // 7 days
      if (token) {
        const value = encodeURIComponent(token);
        const securePart = secure ? ' Secure;' : '';
        document.cookie = `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge};${securePart} SameSite=Lax;`;
      } else {
        document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
      }
    } catch (err) {
      // ignore cookie errors in restricted environments
    }
  };

  useEffect(() => {
    // Try to set persistence to local so sessions survive browser restarts
    (async () => {
      try {
        const { setPersistence, browserLocalPersistence } = await import('firebase/auth');
        if (auth && setPersistence) {
          await setPersistence(auth, browserLocalPersistence);
        }
      } catch (err) {
        // If persistence cannot be set (e.g., dummy auth), continue silently
        // console.warn('Failed to set auth persistence', err);
      }
    })();

    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
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
        // ignore token cookie errors in dev / dummy environments
      }
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (cred.user) {
      await updateProfile(cred.user, { displayName });
      setUser(cred.user);
      try {
        if ((cred.user as any).getIdToken) {
          const token = await (cred.user as any).getIdToken(true);
          setAuthCookie(token);
        } else {
          setAuthCookie('dev');
        }
      } catch (e) {
        // ignore
      }
    }
  };

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    setUser(cred.user);
    try {
      if ((cred.user as any).getIdToken) {
        const token = await (cred.user as any).getIdToken(true);
        setAuthCookie(token);
      } else {
        setAuthCookie('dev');
      }
    } catch (e) {
      // ignore
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    setUser(cred.user);
    try {
      if ((cred.user as any).getIdToken) {
        const token = await (cred.user as any).getIdToken(true);
        setAuthCookie(token);
      } else {
        setAuthCookie('dev');
      }
    } catch (e) {
      // ignore
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    try {
      setAuthCookie(null);
    } catch (e) {
      // ignore
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string; phoneNumber?: string; bio?: string }) => {
    try {
      const current = (auth as any).currentUser;
      if (current && (typeof (current) !== 'undefined') && (updateProfile as any)) {
        // Only update displayName and photoURL using firebase.updateProfile
        const toUpdate: any = {};
        if (data.displayName) toUpdate.displayName = data.displayName;
        if (data.photoURL) toUpdate.photoURL = data.photoURL;
        if (Object.keys(toUpdate).length > 0) {
          await updateProfile(current, toUpdate);
        }
        // locally augment other fields (phone, bio) so UI reflects changes
        const newUser = { ...current, ...toUpdate };
        if (data.phoneNumber) (newUser as any).phoneNumber = data.phoneNumber;
        if (data.bio) (newUser as any).bio = data.bio;
        setUser(newUser);
      } else {
        // dev fallback: merge into local user
        setUser((prev: any) => ({ ...(prev || {}), ...data }));
      }
    } catch (err) {
      throw err;
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
