'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface GuestUser {
  _id: string;
  name: string;
  email: string;
  token?: string;
}

interface GuestContextType {
  isGuest: boolean;
  guestUser: GuestUser | null;
  guestSocket: Socket | null;
  isGuestConnected: boolean;
  createGuestSession: (name?: string, email?: string) => Promise<void>;
  sendGuestMessage: (message: string, image?: string) => void;
  connectGuestSocket: () => void;
  disconnectGuestSocket: () => void;
  onSupportReply: (callback: (reply: { text: string; timestamp: string }) => void) => void;
  offSupportReply: () => void;
}

const GuestContext = createContext<GuestContextType | null>(null);

export function useGuest(): GuestContextType {
  const context = useContext(GuestContext);
  if (!context) throw new Error('useGuest must be used within a GuestProvider');
  return context;
}

export function GuestProvider({ children }: { children: ReactNode }) {
  const [isGuest, setIsGuest] = useState(false);
  const [guestUser, setGuestUser] = useState<GuestUser | null>(null);
  const [guestSocket, setGuestSocket] = useState<Socket | null>(null);
  const [isGuestConnected, setIsGuestConnected] = useState(false);
  const [supportReplyCallback, setSupportReplyCallback] = useState<((reply: { text: string; timestamp: string }) => void) | null>(null);

  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3008' : 'https://server-wp4r.onrender.com');

  const createGuestSession = async (name?: string, email?: string) => {
    try {
      // Generate unique guest ID
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const guestName = name || `Guest-${guestId.substring(0, 8)}`;
      const guestEmail = email || `${guestId.substring(0, 8)}@guest.local`;

      // Create guest user via API
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, dummyName: guestName, dummyEmail: guestEmail })
      });

      if (!response.ok) {
        throw new Error('Failed to create guest session');
      }

      const data = await response.json();
      const guest: GuestUser = {
        _id: data.data.guestId,
        name: data.data.dummyName,
        email: data.data.dummyEmail,
        token: data.token
      };

      setGuestUser(guest);
      setIsGuest(true);

      // Store guest info in localStorage
      localStorage.setItem('guestUser', JSON.stringify(guest));

      console.log('✅ Guest session created:', guest);
      
      // Connect socket after creating guest
      connectGuestSocket();
      
    } catch (error) {
      console.error('❌ Failed to create guest session:', error);
    }
  };

  const connectGuestSocket = useCallback(() => {
    if (!guestUser || guestSocket?.connected) return;

    console.log('🔌 Connecting guest socket...');

    const newSocket = io(SOCKET_URL, {
      path: '/api/socket',
      withCredentials: true,
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      auth: guestUser.token ? {
        guestToken: guestUser.token
      } : {
        guestId: guestUser._id,
        dummyName: guestUser.name,
        dummyEmail: guestUser.email
      }
    });

    newSocket.on('connect', () => {
      console.log('✅ Guest socket connected:', newSocket.id);
      setIsGuestConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔴 Guest socket disconnected:', reason);
      setIsGuestConnected(false);
    });

    newSocket.on('guestTokenIssued', (data: { token: string }) => {
      console.log('🎫 Guest token received');
      if (guestUser) {
        const updatedGuest = { ...guestUser, guestToken: data.token };
        setGuestUser(updatedGuest);
        localStorage.setItem('guestUser', JSON.stringify(updatedGuest));
      }
    });

    newSocket.on('supportReply', (data: { text: string; timestamp: string }) => {
      console.log('💬 Support reply received:', data);
      // Handle support replies here
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Guest socket connection error:', error);
      setIsGuestConnected(false);
    });

    setGuestSocket(newSocket);
  }, [guestUser, guestSocket, SOCKET_URL]);

  const disconnectGuestSocket = useCallback(() => {
    if (guestSocket) {
      guestSocket.disconnect();
      setGuestSocket(null);
      setIsGuestConnected(false);
    }
  }, [guestSocket]);

  const onSupportReply = (callback: (reply: { text: string; timestamp: string }) => void) => {
    setSupportReplyCallback(callback);
    if (guestSocket) {
      guestSocket.on('supportReplyToGuest', callback);
    }
  };

  const offSupportReply = () => {
    if (guestSocket && supportReplyCallback) {
      guestSocket.off('supportReplyToGuest', supportReplyCallback);
    }
    setSupportReplyCallback(null);
  };

  const sendGuestMessage = async (message: string, image?: string) => {
    if (!guestUser?._id) {
      console.error('❌ Cannot send message: No guest session');
      return;
    }

    const messageData = {
      guestId: guestUser._id,
      message,
      image,
      chatId: `chat_${guestUser._id}`,
      type: 'guest_message' as const,
      guestName: guestUser.name || 'Guest User',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    try {
      // Send via socket for real-time updates
      if (guestSocket && isGuestConnected) {
        guestSocket.emit('guestSendMessage', messageData);
        console.log('📨 Guest message sent:', { text: message, image: image ? 'Image included' : 'No image' });
      }

      // Store in database
      const response = await fetch('/api/messages/guest/' + guestUser._id, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error('Failed to store message');
      }
    } catch (error) {
      console.error('❌ Error sending guest message:', error);
    }
  };

  // Load guest session from localStorage on mount
  useEffect(() => {
    const savedGuest = localStorage.getItem('guestUser');
    if (savedGuest) {
      try {
        const guest = JSON.parse(savedGuest);
        setGuestUser(guest);
        setIsGuest(true);
        console.log('🔄 Restored guest session:', guest);
      } catch (error) {
        console.error('❌ Failed to restore guest session:', error);
        localStorage.removeItem('guestUser');
      }
    }
  }, []);

  // Connect socket when guest user is available
  useEffect(() => {
    if (guestUser && !guestSocket) {
      connectGuestSocket();
    }
  }, [guestUser, guestSocket, connectGuestSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectGuestSocket();
    };
  }, [disconnectGuestSocket]);

  return (
    <GuestContext.Provider value={{
      isGuest,
      guestUser,
      guestSocket,
      isGuestConnected,
      createGuestSession,
      sendGuestMessage,
      connectGuestSocket,
      disconnectGuestSocket,
      onSupportReply,
      offSupportReply
    }}>
      {children}
    </GuestContext.Provider>
  );
}