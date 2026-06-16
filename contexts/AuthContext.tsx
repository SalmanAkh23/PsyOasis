import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../lib/types';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string; phoneNumber?: string; bio?: string; birthDate?: string; gender?: string; emergencyContactName?: string; emergencyContactRelation?: string; settings?: Record<string, any> }) => Promise<void>;
  refreshUser: () => Promise<void>;
  verificationEmail: string | null;
  resendVerificationEmail: (email?: string) => Promise<void>;
  setVerificationEmail: (email: string | null) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const COOKIE_NAME = 'psyoasis_auth';

const setAuthCookie = (value: string | null) => {
  if (typeof window === 'undefined') return;
  try {
    const secure = window.location.protocol === 'https:';
    if (value) {
      const securePart = secure ? ' Secure;' : '';
      document.cookie = `${COOKIE_NAME}=${value}; Path=/; Max-Age=${60 * 60 * 24 * 7};${securePart} SameSite=Lax;`;
    } else {
      document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    }
  } catch (err) {
    console.error('Auth cookie error:', err);
  }
};

const getProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error && error.code === 'PGRST116') return {};
    if (data) return data;
  } catch (err) {
    console.error('Profile fetch error:', err);
  }
  return {};
};

const buildUser = (session: any, profile: any): User | null => {
  if (!session?.user) return null;
  const au = session.user;
  return {
    uid: au.id,
    email: au.email,
    lastSignInAt: au.last_sign_in_at,
    displayName: profile?.display_name || au.user_metadata?.display_name || au.email?.split('@')[0] || 'User',
    role: profile?.role || 'user',
    status: profile?.status || 'active',
    photoURL: profile?.photo_url || '',
    phoneNumber: profile?.phone_number || '',
    bio: profile?.bio || '',
    birthDate: profile?.birth_date || '',
    gender: profile?.gender || '',
    emergencyContactName: profile?.emergency_contact_name || '',
    emergencyContactRelation: profile?.emergency_contact_relation || '',
    favorites: profile?.favorites || [],
    savedArticles: profile?.saved_articles || [],
    settings: profile?.settings || {},
    notificationSettings: profile?.notification_settings || {},
    createdAt: profile?.created_at || au.created_at,
    ...profile,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserWithProfile = async (session: any) => {
    if (!session?.user) {
      setUser(null);
      return;
    }
    const profile = await getProfile(session.user.id);
    setUser(buildUser(session, profile));
  };

  useEffect(() => {
    const fallbackTimer = setTimeout(() => setLoading(false), 4000);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(fallbackTimer);
      if (session) {
        await refreshUserWithProfile(session);
        setAuthCookie('true');
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await refreshUserWithProfile(session);
        setAuthCookie('true');
      } else {
        setUser(null);
        setAuthCookie(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);

  const register = async (email: string, password: string, displayName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw error;
    if (data.session) {
      await refreshUserWithProfile(data.session);
      setAuthCookie('true');
    } else {
      setVerificationEmail(email);
    }
  };

  const resendVerificationEmail = async (email?: string) => {
    const target = email || verificationEmail;
    if (!target) throw new Error('Email tidak ditemukan');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: target,
    });
    if (error) throw error;
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await refreshUserWithProfile(data.session);
    setAuthCookie('true');
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthCookie(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined,
    });
    if (error) throw error;
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string; phoneNumber?: string; bio?: string; birthDate?: string; gender?: string; emergencyContactName?: string; emergencyContactRelation?: string; settings?: Record<string, any> }) => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session?.user) return;

    const payload: Record<string, any> = {};
    if (data.displayName !== undefined) payload.display_name = data.displayName;
    if (data.phoneNumber !== undefined) payload.phone_number = data.phoneNumber;
    if (data.bio !== undefined) payload.bio = data.bio;
    if (data.photoURL !== undefined) payload.photo_url = data.photoURL;
    if (data.birthDate !== undefined) payload.birth_date = data.birthDate;
    if (data.gender !== undefined) payload.gender = data.gender;
    if (data.emergencyContactName !== undefined) payload.emergency_contact_name = data.emergencyContactName;
    if (data.emergencyContactRelation !== undefined) payload.emergency_contact_relation = data.emergencyContactRelation;
    if (data.settings !== undefined) payload.settings = data.settings;
    payload.updated_at = new Date().toISOString();

    if (Object.keys(payload).length > 1) {
      const { error } = await supabase.from('users').update(payload).eq('id', session.user.id);
      if (error) console.error('Profile update error:', error);
    }

    if (data.displayName) {
      await supabase.auth.updateUser({ data: { display_name: data.displayName } });
    }

    await refreshUserWithProfile(session);
  };

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await refreshUserWithProfile(session);
    }
  }, []);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') refreshUser(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, loginWithGoogle, logout, resetPassword, updateUserProfile, refreshUser, verificationEmail, resendVerificationEmail, setVerificationEmail }}
    >
      {children}
    </AuthContext.Provider>
  );
};
