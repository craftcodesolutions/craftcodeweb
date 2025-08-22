/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
  bio?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (updateData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  updateEmail: (currentEmail: string, newEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (email: string, currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user info from backend using the /api/auth/me endpoint.
   */
  const fetchUserFromBackend = async () => {
    try {
      const response = await fetch(`/api/auth/me`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data or token expired/invalid');
      }

      const data = await response.json();
      console.log('Fetched user data from /api/auth/me:', data); // Debug log

      const updatedUser: User = {
        userId: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        isAdmin: data.isAdmin,
        profileImage: data.profileImage,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        bio: data.bio || '',
      };

      setUser(updatedUser);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      console.error('Auth error:', err);
      setIsAuthenticated(false);
      setUser(null);
      setError('Authentication failed. Please log in again.');
    }
  };

  /**
   * Refresh user data to reflect session updates.
   */
  const refreshUser = async () => {
    setIsLoading(true);
    await fetchUserFromBackend();
    setIsLoading(false);
  };

  // Initial user fetch on mount
  useEffect(() => {
    refreshUser();
  }, []);

  // Periodic polling to check for session updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      await fetchUserFromBackend();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        await fetchUserFromBackend();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (err) {
      console.error('Login failed:', err);
      return { success: false, error: 'Unexpected error during login' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setIsLoading(false);
    }
  };

  /**
   * Update user profile and refresh session
   */
  const updateProfile = async (updateData: Partial<User>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${user?.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData = await response.json();
      console.log('Updated user data from /api/users/[id]:', updatedData); // Debug log

      await refreshUser();
      return { success: true };
    } catch (err) {
      console.error('Profile update failed:', err);
      setError('Failed to update profile');
      return { success: false, error: 'Failed to update profile' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user email
   */
  const updateEmail = async (currentEmail: string, newEmail: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/update-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentEmail, newEmail, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update email');
      }

      await fetchUserFromBackend();
      return { success: true };
    } catch (err) {
      console.error('Email update failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to update email');
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update email' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Change user password
   */
  const changePassword = async (email: string, currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, currentPassword, newPassword }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change password');
      }

      return { success: true };
    } catch (err) {
      console.error('Password change failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to change password');
      return { success: false, error: err instanceof Error ? err.message : 'Failed to change password' };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, isLoading, error, login, logout, refreshUser, updateProfile, updateEmail, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}