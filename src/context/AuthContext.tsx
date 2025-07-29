/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import jwt from 'jsonwebtoken';

// Types
type UserType = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  profileImage?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
};

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

type DecodedToken = {
  userId: string;
  email: string;
  isAdmin: boolean;
  exp: number;
} | null;

type AuthContextType = {
  user: UserType | null;
  loading: LoadingState;
  isInitialized: boolean;
  isAuthenticated: boolean;
  error: string | null;
  decodedToken: DecodedToken;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserType>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Provider
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decodedToken, setDecodedToken] = useState<DecodedToken>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const clearError = useCallback(() => setError(null), []);

  const decodeToken = useCallback((token: string) => {
    try {
      const decoded = jwt.decode(token) as DecodedToken;
      console.log('[DEBUG] Decoded token:', decoded);
      if (!decoded || !decoded.userId) {
        console.warn('[DEBUG] Invalid token structure');
        setDecodedToken(null);
        return null;
      }
      if (decoded.exp * 1000 < Date.now()) {
        console.warn('[DEBUG] Token is expired');
        setDecodedToken(null);
        return null;
      }
      setDecodedToken(decoded);
      return decoded;
    } catch (error) {
      console.error('[DEBUG] Token decode error:', error);
      setDecodedToken(null);
      return null;
    }
  }, []);

  const getAuthToken = useCallback(() => {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
      const [name, value] = cookie.split('=');
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);
    const token = cookies['authToken'] || null;
    console.log('[DEBUG] Retrieved authToken:', token);
    return token;
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      setLoading('loading');
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setUser(null);
        setLoading('error');
        setError('No authentication token found');
        return;
      }

      const decoded = decodeToken(token);
      if (!decoded || !decoded.userId) {
        setUser(null);
        setLoading('error');
        setError('Invalid or expired token');
        return;
      }

      const res = await fetch(`/api/users/${decoded.userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok && data && data._id) {
        setUser({
          _id: data._id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          isAdmin: data.isAdmin,
          profileImage: data.profileImage || undefined,
          bio: data.bio || undefined,
          createdAt: new Date(data.createdAt).toISOString(),
          updatedAt: new Date(data.updatedAt).toISOString(),
        });
        setLoading('success');
      } else {
        setUser(null);
        setLoading('error');
        setError(data.error || 'Invalid user data received');
      }
    } catch (error) {
      setUser(null);
      setError('Network error occurred');
      setLoading('error');
    } finally {
      setIsInitialized(true);
    }
  }, [getAuthToken, decodeToken]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading('loading');
      setError(null);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (res.ok) {
        await fetchUser();
        return { success: true };
      } else {
        const errorMsg = result.error || 'Login failed';
        setError(errorMsg);
        setLoading('error');
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = 'Network error occurred';
      setError(errorMsg);
      setLoading('error');
      return { success: false, error: errorMsg };
    }
  }, [fetchUser]);

  const register = useCallback(async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    try {
      setLoading('loading');
      setError(null);

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        await fetchUser();
        return { success: true };
      } else {
        const errorMsg = result.error || 'Registration failed';
        setError(errorMsg);
        setLoading('error');
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = 'Network error occurred';
      setError(errorMsg);
      setLoading('error');
      return { success: false, error: errorMsg };
    }
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      setLoading('loading');
      setError(null);

      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        setUser(null);
        setDecodedToken(null);
        setLoading('success');
        document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'userEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      } else {
        setError('Logout failed');
        setLoading('error');
      }
    } catch (error) {
      setError('Network error during logout');
      setLoading('error');
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserType>) => {
    try {
      if (!user?._id) {
        return { success: false, error: 'User not authenticated' };
      }

      setLoading('loading');
      setError(null);

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && key !== '_id') {
          formData.append(key, value as string);
        }
      });

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        await fetchUser();
        return { success: true };
      } else {
        const errorMsg = result.error || 'Failed to update profile';
        setError(errorMsg);
        setLoading('error');
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = 'Network error occurred';
      setError(errorMsg);
      setLoading('error');
      return { success: false, error: errorMsg };
    }
  }, [user?._id, fetchUser]);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  // 🔽 Add this useEffect to log the decoded token
  useEffect(() => {
    console.log('[DEBUG] Decoded Token (from context):', decodedToken);
    if (decodedToken) {
      console.log('User ID:', decodedToken.userId);
      console.log('Email:', decodedToken.email);
      console.log('Is Admin:', decodedToken.isAdmin);
      console.log('Expires At:', new Date(decodedToken.exp * 1000).toLocaleString());
    } else {
      console.log('[DEBUG] No valid decoded token or token expired.');
    }
  }, [decodedToken]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser, reloadTrigger]);

  const contextValue = useMemo(() => ({
    user,
    loading,
    isInitialized,
    isAuthenticated,
    error,
    decodedToken,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    clearError,
  }), [user, loading, isInitialized, isAuthenticated, error, decodedToken, login, register, logout, updateProfile, refreshUser, clearError]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
