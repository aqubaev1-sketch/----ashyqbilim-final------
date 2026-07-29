'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';
import { DBManager, UserProgress } from './dbManager';

interface AuthContextType {
  user: User | null;
  progress: UserProgress | null;
  loading: boolean;
  isAdmin: boolean;
  refreshProgress: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  progress: null,
  loading: true,
  isAdmin: false,
  refreshProgress: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const checkAdmin = (email: string | undefined) => {
  if (!email) return false;
  
  // Добавьте сюда вашу личную почту:
  const adminEmails = [
    'admin@mail.ru',
    'wer@mail.ru',
    'prince@mail.ru',
    'altynbekova.zhanar1930@gmail.com',
    // 'ais@mail.ru' // <-- Впишите сюда свой email
  ];

  return adminEmails.includes(email) || email.startsWith('admiiiii1n@');
};

  const fetchProgressAndDetails = async (currentUser: User) => {
    try {
      const userProgress = await DBManager.getUserProgress(currentUser.id);
      setProgress(userProgress);
    } catch (e) {
      console.error('Error fetching progress:', e);
    }
  };

  const refreshProgress = async () => {
    if (user) {
      await fetchProgressAndDetails(user);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(checkAdmin(currentUser?.email));
      if (currentUser) {
        fetchProgressAndDetails(currentUser);
      } else {
        setProgress(null);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(checkAdmin(currentUser?.email));
      if (currentUser) {
        await fetchProgressAndDetails(currentUser);
      } else {
        setProgress(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProgress(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, progress, loading, isAdmin, refreshProgress, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
