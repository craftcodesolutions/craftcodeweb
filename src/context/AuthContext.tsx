/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { showMessageNotification, initializeNotifications } from '@/lib/notificationService';

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
  refreshToken: () => Promise<{ success: boolean; error?: string; user?: User }>;
  updateProfile: (updateData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  updateEmail: (currentEmail: string, newEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (email: string, currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateUserByAdmin: (userId: string, field: 'isAdmin' | 'status', value: boolean) => Promise<{ success: boolean; error?: string; updatedUser?: User }>;
  updateUserDesignations: (userId: string, designations: string[]) => Promise<{ success: boolean; error?: string; updatedUser?: User }>;
  signup: (data: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<{ success: boolean; error?: string }>;
  checkAuth: () => Promise<void>;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  socket: Socket | null;
  onlineUsers: string[];
  isSocketConnected: boolean;
  connectSocket: () => void;
  disconnectSocket: () => void;
  joinChatRoom: (chatId: string) => void;
  leaveChatRoom: (chatId: string) => void;
  sendTypingIndicator: (receiverId: string, isTyping: boolean) => void;
  sendMessageReadReceipt: (messageId: string, senderId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const authInstanceId = React.useRef(Math.random().toString(36).substr(2, 9));
  console.log('🏗️ AuthProvider instance created:', authInstanceId.current);

  const BASE_URL = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}`
    : process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : '/';

    const SOCKET_URL = process.env.SOCKET_URL || 
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3008' : 'https://server-wp4r.onrender.com');

  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const fetchUserFromBackend = async () => {
    try {
      console.log('Fetching user with cookies:', document.cookie);
      const response = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      console.log('Response status:', response.status);
      if (!response.ok) {
        if (response.status === 401) {
          // Check for authToken before attempting refresh
          const authToken = getCookie('authToken');
          if (!authToken) {
            console.log('No authToken found, skipping token refresh.');
            throw new Error('No authentication token available');
          }

          console.log('Attempting token refresh...');
          const refreshResult = await refreshToken();
          if (refreshResult.success) {
            console.log('Token refreshed, retrying user fetch...');
            const retryResponse = await fetch('/api/auth/me', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            });
            if (!retryResponse.ok) {
              throw new Error('Failed to fetch user data after token refresh');
            }
            const data = await retryResponse.json();
            console.log('User data:', data);
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
            return;
          } else {
            throw new Error('Token refresh failed: ' + refreshResult.error);
          }
        }
        throw new Error('Failed to fetch user data or token expired/invalid');
      }
      const data = await response.json();
      console.log('User data:', data);
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

  const refreshUser = async () => {
    setIsLoading(true);
    await fetchUserFromBackend();
    setIsLoading(false);
  };

  const checkAuth = async () => {
    try {
      await fetchUserFromBackend();
    } finally {
      setIsLoading(false);
    }
  };

  const connectSocket = async () => {
    if (!user || isConnecting || typeof window === 'undefined') {
      console.log(`AuthContext[${authInstanceId.current}] Skipping socket connection:`, {
        hasUser: !!user,
        isConnecting,
        isClient: typeof window !== 'undefined',
      });
      return;
    }
  
    if (socket && socket.connected) {
      console.log(`AuthContext[${authInstanceId.current}] Socket already connected: ${socket.id}`);
      return;
    }
  
    console.log(`🔌 AuthContext[${authInstanceId.current}] Connecting socket for ${user.email}`);
  
    const res = await fetch('/api/auth/token', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch token');
    const { token: authToken } = await res.json();
    if (!authToken) {
      console.error(`AuthContext[${authInstanceId.current}] ❌ No authToken found, cannot connect socket`);
      return;
    }
  
    setIsConnecting(true);
  
    try {
      const newSocket = io(SOCKET_URL, {
        path: '/api/socket',
        transports: ['websocket'],
        withCredentials: true,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        auth: { token: authToken }, // ✅ THIS IS WHAT SERVER READS
      });
  
      newSocket.on('connect', () => {
        console.log(`✅ AuthContext[${authInstanceId.current}] Socket connected: ${newSocket.id}`);
        setSocket(newSocket);
        setIsSocketConnected(true);
        setIsConnecting(false);
      });
  
      newSocket.on('connect_error', (err) => {
        console.error(`❌ Socket connection error: ${err.message}`);
        setIsSocketConnected(false);
        setIsConnecting(false);
        setSocket(null);
      });
  
      newSocket.on('disconnect', (reason) => {
        console.log(`🔌 Socket disconnected: ${reason}`);
        setIsSocketConnected(false);
      });
  
      newSocket.on('userStatusChanged', (data) => {
        console.log(`👤 User status changed:`, data);
        if (!data.status) logout();
      });
  
    } catch (err) {
      console.error(`❌ Failed to connect socket:`, err);
      setIsConnecting(false);
    }
  };
  

  const disconnectSocket = () => {
    if (socket) {
      socket.removeAllListeners();
      if (socket.connected) socket.disconnect();
      setSocket(null);
      setIsSocketConnected(false);
      setIsConnecting(false);
      setOnlineUsers([]);
      setRetryCount(0);
    }
  };

  const joinChatRoom = (chatId: string) => {
    if (socket && socket.connected) {
      socket.emit('joinChatRoom', { chatId });
      console.log(`💬 Joining chat room: chat_${chatId}`);
    }
  };

  const leaveChatRoom = (chatId: string) => {
    if (socket && socket.connected) {
      socket.emit('leaveChatRoom', { chatId });
      console.log(`👋 Leaving chat room: chat_${chatId}`);
    }
  };

  const sendTypingIndicator = (receiverId: string, isTyping: boolean) => {
    if (socket && socket.connected) {
      socket.emit('typing', { receiverId, isTyping });
      console.log(`⌨️ Sending typing indicator to ${receiverId}: ${isTyping ? 'typing' : 'stopped'}`);
    }
  };

  const sendMessageReadReceipt = (messageId: string, senderId: string) => {
    if (socket && socket.connected) {
      socket.emit('messageRead', { messageId, senderId });
      console.log(`✅ Sending read receipt for message ${messageId} to ${senderId}`);
    }
  };

  useEffect(() => {
    checkAuth();
    
    initializeNotifications().then(success => {
      if (success) {
        console.log('✅ Notification service initialized in AuthContext');
      } else {
        console.log('ℹ️ Notifications not supported or denied in AuthContext');
      }
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && user) {
        connectSocket();
      } else if (document.visibilityState === 'hidden') {
        disconnectSocket();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      disconnectSocket();
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      await fetchUserFromBackend();
    }, 300000);

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
        console.log('Logged in successfully');
        return { success: true };
      } else {
        const errorMessage = data.error || 'Login failed';
        console.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = 'Unexpected error during login';
      console.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      disconnectSocket();
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      console.log('Logged out successfully');
    } catch (err) {
      console.error('Logout failed:', err);
      console.error('Error logging out');
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setIsLoading(false);
      localStorage.removeItem('globalChatSoundEnabled');
    }
  };

  const updateProfile = async (updateData: Partial<User>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${user?.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update profile');
      await refreshUser();
      console.log('Profile updated successfully');
      return { success: true };
    } catch (err) {
      console.error('Profile update failed:', err);
      setError('Failed to update profile');
      return { success: false, error: 'Failed to update profile' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmail = async (currentEmail: string, newEmail: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/update-email', {
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

  const changePassword = async (email: string, currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/change-password', {
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
      console.log('Account created successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setError(errorMessage);
      console.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSigningUp(false);
    }
  };

  const refreshToken = async () => {
    try {
      console.log('Attempting token refresh, cookies:', document.cookie);
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
  
      const data = await response.json();
      const refreshedUser: User = {
        userId: data.user.id,
        email: data.user.email,
        firstName: data.user.name?.split(' ')[0] || '',
        lastName: data.user.name?.split(' ').slice(1).join(' ') || '',
        isAdmin: data.user.isAdmin,
        profileImage: data.user.profileImage,
        createdAt: data.user.createdAt,
        updatedAt: data.user.updatedAt,
        bio: data.user.bio || '',
      };
  
      setUser(refreshedUser);
      setIsAuthenticated(true);
      setError(null);
  
      console.log('Token refreshed successfully');
      return { success: true, user: refreshedUser };
    } catch (error) {
      console.error('Token refresh failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Token refresh failed' };
    }
  };
  
  const updateUserByAdmin = async (userId: string, field: 'isAdmin' | 'status', value: boolean) => {
    setIsLoading(true);
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
      if (user && user.userId === userId) {
        await refreshUser();
        console.log(`Your ${field === 'isAdmin' ? 'admin status' : 'account status'} has been updated successfully!`);
      } else {
        console.log(`User ${field === 'isAdmin' ? 'admin status' : 'account status'} updated successfully`);
      }
      return { success: true, updatedUser };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to update ${field}`;
      console.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserDesignations = async (userId: string, designations: string[]) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'designations', value: designations }),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update designations');
      }
      const updatedUser = await response.json();
      if (user && user.userId === userId) {
        await refreshUser();
        console.log('Your designations have been updated successfully!');
      } else {
        console.log('User designations updated successfully');
      }
      return { success: true, updatedUser };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update designations';
      console.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
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
        refreshToken,
        updateProfile,
        updateEmail,
        changePassword,
        updateUserByAdmin,
        updateUserDesignations,
        signup,
        checkAuth,
        isSigningUp,
        isLoggingIn,
        socket,
        onlineUsers,
        isSocketConnected,
        connectSocket,
        disconnectSocket,
        joinChatRoom,
        leaveChatRoom,
        sendTypingIndicator,
        sendMessageReadReceipt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;