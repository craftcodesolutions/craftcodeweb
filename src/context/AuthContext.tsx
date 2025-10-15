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
  forceReconnectSocket: () => void;
  debugAuthState: () => void;
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
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  // Debug function to check auth state
  const debugAuthState = () => {
    const authToken = getCookie('authToken');
    console.log('🔍 Auth Debug State:', {
      isAuthenticated,
      hasUser: !!user,
      hasAuthToken: !!authToken,
      authToken: authToken ? `${authToken.substring(0, 20)}...` : 'null',
      socketConnected: socket?.connected,
      isConnecting,
      retryCount
    });
  };

  const fetchUserFromBackend = async () => {
    try {
      console.log('Fetching user with cookies:', document.cookie);
      const response = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
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
    if (!user || socket?.connected || socket || isConnecting || typeof window === 'undefined') {
      console.log(`AuthContext[${authInstanceId.current}] Skipping socket connection:`, {
        hasUser: !!user,
        socketConnected: socket?.connected,
        socketExists: !!socket,
        isConnecting,
        isClient: typeof window !== 'undefined'
      });
      return;
    }
    if (retryCount >= MAX_RETRIES) {
      console.error(`AuthContext[${authInstanceId.current}] Max retries (${MAX_RETRIES}) reached for socket connection`);
      console.error('Failed to connect to server after multiple attempts');
      setIsConnecting(false);
      setRetryCount(0); // Reset retry count
      return;
    }

    // Check if we have a valid user session before attempting connection
    if (!user || !user.userId) {
      // Only retry if we haven't exceeded max retries for user checks
      if (retryCount < 3) {
        console.warn(`AuthContext[${authInstanceId.current}] No authenticated user available, will retry in 2 seconds... (${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);
        setTimeout(connectSocket, 2000);
        return;
      } else {
        console.error(`AuthContext[${authInstanceId.current}] No authenticated user found after 3 attempts, stopping connection attempts`);
        setIsConnecting(false);
        setRetryCount(0);
        return;
      }
    }

    // Get a Socket.IO specific token from server
    let socketToken: string | null = null;
    try {
      const response = await fetch('/api/auth/socket-token', {
        method: 'GET',
        credentials: 'include', // This will include httpOnly cookies
      });
      
      if (response.ok) {
        const data = await response.json();
        socketToken = data.socketToken;
        console.log(`AuthContext[${authInstanceId.current}] Socket token obtained successfully`);
      } else {
        throw new Error(`Socket token request failed: ${response.status}`);
      }
    } catch (error) {
      console.error(`AuthContext[${authInstanceId.current}] Failed to get socket token:`, error);
      if (retryCount < 3) {
        console.warn(`AuthContext[${authInstanceId.current}] Socket token failed, will retry in 2 seconds... (${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);
        setTimeout(connectSocket, 2000);
        return;
      } else {
        console.error(`AuthContext[${authInstanceId.current}] Socket token failed after 3 attempts, stopping connection attempts`);
        setIsConnecting(false);
        setRetryCount(0);
        return;
      }
    }
    console.log(`🔌 AuthContext[${authInstanceId.current}] Initiating socket connection for user: ${user.email} (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
    setIsConnecting(true);

    try {
      console.log(`AuthContext[${authInstanceId.current}] Triggering Socket.IO server initialization`);
      const initResponse = await fetch(`/api/socket`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!initResponse.ok) {
        const errorData = await initResponse.json();
        throw new Error(`Failed to initialize Socket.IO server: ${errorData.error || initResponse.statusText}`);
      }
      const initData = await initResponse.json();
      console.log(`AuthContext[${authInstanceId.current}] Socket.IO server initialization response:`, initData);

      if (initData.message.includes('not initialized')) {
        console.log(`AuthContext[${authInstanceId.current}] Socket.IO server not ready, retrying in 2s`);
        setRetryCount(prev => prev + 1);
        setTimeout(connectSocket, 2000);
        return;
      }

      console.log(`AuthContext[${authInstanceId.current}] Connecting socket with token authentication`);

      const newSocket = io(SOCKET_URL, {
        path: '/api/socket',
        withCredentials: true,
        transports: ['websocket', 'polling'],
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        auth: {
          token: socketToken, // Send the Socket.IO specific token
          userId: user.userId,
          email: user.email
        }
      });

      newSocket.on('connect', () => {
        console.log(`✅ AuthContext[${authInstanceId.current}] Socket connected: ${newSocket.id}`);
        setIsSocketConnected(true);
        setIsConnecting(false);
        setRetryCount(0);
      });

      newSocket.on('tokenUpdated', async (data: { newToken: string; timestamp: string; reason: string }) => {
        console.log(`Token updated for user ${user?.userId}:`, data);
        await refreshUser();
        newSocket.emit('tokenUpdateReceived', { timestamp: data.timestamp, reason: data.reason });
        console.log('Your account has been updated. Session refreshed automatically.');
      });

      newSocket.on('userStatusChanged', async (data: { status: boolean; timestamp: string; reason: string }) => {
        newSocket.emit('statusUpdateReceived', { status: data.status, timestamp: data.timestamp });
        if (!data.status) {
          console.error('Your account has been deactivated. Logging out...');
          setTimeout(() => logout(), 3000);
        } else {
          console.log('Your account has been reactivated.');
          await refreshUser();
        }
      });

      newSocket.on('designationsUpdated', async (data: { designations: string[]; timestamp: string; reason: string }) => {
        console.log(`Designations updated for user ${user?.userId}:`, data);
        await refreshUser();
        newSocket.emit('designationsUpdateReceived', { timestamp: data.timestamp, reason: data.reason });
        console.log('Your designations have been updated. Session refreshed automatically.');
      });

      newSocket.on('force_logout', (data: { reason: string; timestamp: string }) => {
        console.log(`Force logout received:`, data);
        console.warn(`You have been logged out: ${data.reason}`);
        logout();
      });

      newSocket.on('getOnlineUsers', (users: string[]) => {
        console.log(`📊 AuthContext[${authInstanceId.current}] Online users updated:`, users);
        setOnlineUsers(users);
      });

      newSocket.on('newMessage', (msg: { from: string; content: string; timestamp: string; notification: boolean }) => {
        console.log(`📩 New message received:`, msg);
        if (msg.notification) {
          if (document.hidden || !document.hasFocus()) {
            showMessageNotification(msg.from, msg.content, () => {
              window.focus();
              if (document.hidden) {
                if ('focus' in window) {
                  window.focus();
                }
              }
            });
          }
        }
      });

      newSocket.on('userTyping', (data: { userId: string; isTyping: boolean; timestamp: string }) => {
        console.log(`⌨️ Typing indicator received from ${data.userId}: ${data.isTyping ? 'typing' : 'stopped'}`);
      });

      newSocket.on('messageReadReceipt', (data: { messageId: string; readBy: string; readAt: string }) => {
        console.log(`✅ Message read receipt received: ${data.messageId} read by ${data.readBy}`);
      });

      newSocket.on('connect_error', (error) => {
        console.error(`❌ Socket connection error: ${error.message}`);
        setIsSocketConnected(false);
        setIsConnecting(false);
        setSocket(null);
        
        // Handle rate limiting errors differently
        if (error.message.includes('Too many failed attempts')) {
          console.warn(`Rate limit reached, waiting longer before retry...`);
          setRetryCount(prev => prev + 1);
          // Wait longer for rate limit to reset (60 seconds)
          setTimeout(connectSocket, 60000);
        } else if (error.message.includes('Authentication error')) {
          console.warn(`Authentication error, refreshing token and retrying...`);
          // Try to refresh token before retrying
          refreshToken().then((result) => {
            if (result.success) {
              setRetryCount(prev => prev + 1);
              setTimeout(connectSocket, 2000);
            } else {
              console.error('Token refresh failed, stopping connection attempts');
              setRetryCount(MAX_RETRIES); // Stop retrying
            }
          });
        } else {
          setRetryCount(prev => prev + 1);
          setTimeout(connectSocket, 2000);
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.log(`🔌 Socket disconnected: ${newSocket.id}, reason: ${reason}`);
        setIsSocketConnected(false);
      });

      newSocket.on('reconnect', () => {
        console.log(`🔄 Socket reconnected: ${newSocket.id}`);
        setIsSocketConnected(true);
        setRetryCount(0);
      });

      newSocket.on('reconnect_failed', () => {
        console.error('❌ Socket reconnection failed after all attempts');
        setIsSocketConnected(false);
        console.error('Failed to reconnect to server');
      });

      newSocket.on('ping', (data: { timestamp: string }) => {
        newSocket.emit('pong', { timestamp: data.timestamp });
      });

      setSocket(newSocket);
    } catch (err) {
      const error = err as unknown;
      let message = 'Unknown error';
      let stack: unknown = undefined;
      if (error && typeof error === 'object') {
        message = (error as { message?: string }).message ?? message;
        stack = (error as { stack?: unknown }).stack;
      }
      console.error(`❌ Socket connection failed: ${message}`, {
        error,
        socketUrl: SOCKET_URL,
        userId: user?.userId,
        stack,
      });
      setIsSocketConnected(false);
      setIsConnecting(false);
      setSocket(null);
      setRetryCount(prev => prev + 1);
      console.error(`Failed to connect to server: ${message}`);
      setTimeout(connectSocket, 2000);
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

  const forceReconnectSocket = () => {
    console.log(`🔄 Force reconnecting socket...`);
    disconnectSocket();
    setRetryCount(0);
    if (user && isAuthenticated) {
      setTimeout(() => {
        connectSocket();
      }, 1000);
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
    if (isAuthenticated && user && !socket?.connected && !isConnecting) {
      // Reset retry count when starting fresh connection attempt
      setRetryCount(0);
      // Delay socket connection to ensure auth token is set in cookies
      const timer = setTimeout(() => {
        connectSocket();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!isAuthenticated || !user) {
      disconnectSocket();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && user && !socket?.connected && !isConnecting) {
        console.log('Page became visible, attempting socket reconnection...');
        setRetryCount(0); // Reset retry count for fresh attempt
        setTimeout(() => {
          connectSocket();
        }, 2000); // Increased delay to prevent rapid reconnections
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, user, socket?.connected, isConnecting]);

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
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designations }),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update designations');
      }
      const updatedUser = await response.json();
      if (user && user.userId === userId) {
        await refreshUser();
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
        forceReconnectSocket,
        debugAuthState,
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
