/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { io, Socket } from 'socket.io-client';

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
  updateUserByAdmin: (userId: string, field: 'isAdmin' | 'status', value: boolean) => Promise<{ success: boolean; error?: string; updatedUser?: User }>;
  // New functionalities from Zustand store
  isSigningUp: boolean;
  isLoggingIn: boolean;
  socket: Socket | null;
  onlineUsers: string[];
  checkAuth: () => Promise<void>;
  signup: (data: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<{ success: boolean; error?: string }>;
  connectSocket: () => void;
  disconnectSocket: () => void;
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
  // New state variables from Zustand store
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Base URL for socket connection
  const BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "/";

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
    checkAuth();
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
    setIsLoggingIn(true);
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
        toast.success("Logged in successfully");
        connectSocket();
        return { success: true };
      } else {
        const errorMessage = data.error || 'Login failed';
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = 'Unexpected error during login';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      toast.success("Logged out successfully");
    } catch (err) {
      console.error('Logout failed:', err);
      toast.error("Error logging out");
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setIsLoading(false);
      disconnectSocket();
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
      toast.success("Profile updated successfully");
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

  /**
   * Check authentication status - equivalent to checkAuth from Zustand
   */
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Authentication check failed');
      }

      const data = await response.json();
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
      connectSocket();
    } catch (error) {
      console.log("Error in authCheck:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Signup function - equivalent to signup from Zustand
   */
  const signup = async (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
    setIsSigningUp(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      const userData = await response.json();
      const newUser: User = {
        userId: userData.userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isAdmin: userData.isAdmin,
        profileImage: userData.profileImage,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        bio: userData.bio || '',
      };

      setUser(newUser);
      setIsAuthenticated(true);
      setError(null);

      toast.success("Account created successfully!");
      connectSocket();
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSigningUp(false);
    }
  };

  /**
   * Connect socket - equivalent to connectSocket from Zustand
   */
  const connectSocket = () => {
    if (!user || socket?.connected) return;

    try {
      const newSocket = io(BASE_URL, {
        withCredentials: true, // this ensures cookies are sent with the connection
      });

      newSocket.connect();
      setSocket(newSocket);

      // listen for online users event
      newSocket.on("getOnlineUsers", (userIds: string[]) => {
        setOnlineUsers(userIds);
      });
    } catch (error) {
      console.error('Socket connection failed:', error);
    }
  };

  /**
   * Disconnect socket - equivalent to disconnectSocket from Zustand
   */
  const disconnectSocket = () => {
    if (socket?.connected) {
      socket.disconnect();
      setSocket(null);
      setOnlineUsers([]);
    }
  };

  /**
   * Update user by admin - for admin user management
   */
  const updateUserByAdmin = async (userId: string, field: 'isAdmin' | 'status', value: boolean) => {
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update ${field}`);
      }

      const updatedUser = await response.json();
      
      // Check if the updated user is the current logged-in user
      if (user && user.userId === userId) {
        // Refresh the current user's session data
        await refreshUser();
        toast.success(`Your ${field === 'isAdmin' ? 'admin status' : 'account status'} has been updated`);
      }

      return { success: true, updatedUser };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to update ${field}`;
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        isAuthenticated, 
        user, 
        isLoading, 
        error, 
        login, 
        logout, 
        refreshUser, 
        updateProfile, 
        updateEmail, 
        changePassword,
        updateUserByAdmin,
        // New properties from Zustand store
        isSigningUp,
        isLoggingIn,
        socket,
        onlineUsers,
        checkAuth,
        signup,
        connectSocket,
        disconnectSocket
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}