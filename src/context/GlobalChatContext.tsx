'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useGuest } from './GuestContext';
import { MessageType } from '@/types/Message';
import { showMessageNotification, showSentMessageNotification } from '@/lib/notificationService';
import { debounce } from 'lodash';
interface Contact {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  isAdmin?: boolean;
}

interface Message extends MessageType {
  isOptimistic?: boolean;
}

interface GlobalChatContextType {
  isOpen: boolean;
  messages: Message[];
  targetUser: Contact | null;
  isMessagesLoading: boolean;
  isSoundEnabled: boolean;
  toggleChatBox: () => void;
  closeChatBox: () => void;
  openChatBox: () => void;
  toggleSound: () => void;
  getMessagesByUserId: (userId: string) => Promise<void>;
  sendMessage: (messageData: { text?: string; image?: string }) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
  initializeTargetUser: () => Promise<void>;
}

const GlobalChatContext = createContext<GlobalChatContextType | null>(null);

export function useGlobalChat(): GlobalChatContextType {
  const context = useContext(GlobalChatContext);
  if (!context) throw new Error('useGlobalChat must be used within a GlobalChatProvider');
  return context;
}

export function GlobalChatProvider({ children }: { children: ReactNode }) {
  const { user: authUser, socket, connectSocket, isSocketConnected } = useAuth();
  const { guestUser, guestSocket, createGuestSession, sendGuestMessage } = useGuest();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [targetUser, setTargetUser] = useState<Contact | null>(null);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@craftcode.com';

  useEffect(() => {
    setIsHydrated(true);
    const savedSoundSetting = localStorage.getItem('globalChatSoundEnabled');
    if (savedSoundSetting !== null) {
      setIsSoundEnabled(JSON.parse(savedSoundSetting) === true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (authUser && !isSocketConnected) {
        console.log('📨 Chat opened - initializing auth socket connection...');
        connectSocket();
      } else if (!authUser && !guestUser) {
        console.log('📨 Chat opened - creating guest session...');
        createGuestSession();
      }
    }
  }, [isOpen, authUser, connectSocket, isSocketConnected, guestUser, createGuestSession]);

  const toggleChatBox = () => setIsOpen(!isOpen);
  const closeChatBox = () => setIsOpen(false);
  const openChatBox = () => setIsOpen(true);

  const toggleSound = () => {
    const newSoundState = !isSoundEnabled;
    setIsSoundEnabled(newSoundState);
    if (isHydrated) {
      localStorage.setItem('globalChatSoundEnabled', JSON.stringify(newSoundState));
    }
  };

  const initializeTargetUser = useCallback(async () => {
    if (!authUser && !guestUser) {
      console.warn('Cannot initialize target user: No authenticated user or guest session');
      return;
    }
    
    if (guestUser) {
      // For guests, fetch the actual support user ID from the database
      console.log('🔍 Initializing target user for guest:', guestUser.guestName);
      
      try {
        // Create a guest-accessible endpoint to get support user info
        const response = await fetch('/api/users/support', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const supportUser = await response.json();
          setTargetUser({
            _id: supportUser._id,
            email: supportUser.email,
            firstName: supportUser.firstName || 'Support',
            lastName: supportUser.lastName || 'Team',
            isAdmin: true
          });
          console.log('✅ Guest target user set to real support user:', supportUser._id);
          return;
        } else {
          console.warn('⚠️ Could not fetch support user, falling back to email query');
        }
      } catch (error) {
        console.error('❌ Failed to fetch support user:', error);
      }

      // Fallback: Try to fetch from contacts (though this might not work for guests)
      try {
        const response = await fetch('/api/messages/contacts', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const contacts: Contact[] = await response.json();
          const supportUser = contacts.find(
            (contact: Contact) => contact.email.toLowerCase() === SUPPORT_EMAIL.toLowerCase()
          );

          if (supportUser) {
            setTargetUser({
              _id: supportUser._id,
              email: supportUser.email,
              firstName: supportUser.firstName || 'Support',
              lastName: supportUser.lastName || 'Team',
              isAdmin: true
            });
            console.log('✅ Guest target user set via contacts fallback:', supportUser._id);
            return;
          }
        }
      } catch (error) {
        console.warn('⚠️ Contacts fallback also failed:', error);
      }

      // Final fallback: use placeholder
      console.warn('⚠️ Using placeholder ID for guest support');
      setTargetUser({
        _id: 'guest_support',
        email: SUPPORT_EMAIL,
        firstName: 'Support',
        lastName: 'Team',
        isAdmin: true
      });
      return;
    }
    
    console.log('🔍 Initializing target user for:', authUser!.email);
    try {
      const isAdmin = authUser!.email.toLowerCase() === SUPPORT_EMAIL.toLowerCase();
      
      // Fetch contacts from API instead of direct database call
      const response = await fetch('/api/messages/contacts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const contacts: Contact[] = await response.json();
      const target = contacts.find(
        (contact: Contact) => contact.email.toLowerCase() === SUPPORT_EMAIL.toLowerCase()
      );

      if (isAdmin) {
        setTargetUser(null);
        console.log('Admin user detected, no default target user set');
      } else if (target) {
        setTargetUser(target);
        console.log('✅ Target user set:', { _id: target._id, email: target.email });
      } else {
        console.error(`Support user ${SUPPORT_EMAIL} not found in contacts`);
        setTargetUser(null);
      }
    } catch (error) {
      console.error('Failed to initialize target user:', error);
    }
  }, [authUser, guestUser, SUPPORT_EMAIL]);

  const getMessagesByUserId = useCallback(async (userId: string) => {
    setIsMessagesLoading(true);
    try {
      // For guests, use the unified API with guestToken query param
      if (guestUser && !authUser) {
        const response = await fetch(`/api/messages/${userId}?guestToken=${guestUser.guestToken}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch guest messages');
        }

        const guestMessages = await response.json();
        
        console.log('📬 Raw guest messages from unified API:', guestMessages);
        
        // Messages are already formatted by the API
        const formattedMessages: Message[] = guestMessages.map((msg: { 
          _id: string; 
          senderId: string; 
          receiverId: string;
          text?: string; 
          image?: string; 
          createdAt: string;
        }) => ({
          _id: msg._id,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          text: msg.text,
          image: msg.image, // Include image field
          createdAt: new Date(msg.createdAt),
          isOptimistic: false,
        }));
        
        console.log('📬 Formatted guest messages:', formattedMessages);
        setMessages(formattedMessages);
        console.log(`📬 Fetched ${formattedMessages.length} guest messages`);
        return;
      }

      // For authenticated users, use regular API
      const response = await fetch(`/api/messages/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data: MessageType[] = await response.json();
      const uniqueMessages = Array.from(
        new Map(data.map((msg) => [msg._id, msg])).values()
      ) as Message[];
      setMessages(uniqueMessages);
      console.log(`📬 Fetched ${uniqueMessages.length} unique messages for user ${userId}`);
    } catch (error) {
      console.error('Get messages error:', error);
      // Set empty array on error to prevent loading state stuck
      setMessages([]);
    } finally {
      setIsMessagesLoading(false);
    }
  }, [guestUser, authUser]);

  const sendMessage = async (messageData: { text?: string; image?: string }) => {
    if (!targetUser) {
      console.warn('Cannot send message: Missing targetUser');
      return;
    }

    // Handle guest messages
    if (guestUser && !authUser) {
      if (!messageData.text && !messageData.image) {
        console.warn('Guest messages require either text or image');
        return;
      }

      console.log('📤 Sending guest message:', messageData.text || 'Image only message');
      console.log('🖼️ Guest message image data:', messageData.image ? 'Present' : 'Not present');
      if (messageData.image) {
        console.log('🖼️ Image data length:', messageData.image.length);
        console.log('🖼️ Image data preview:', messageData.image.substring(0, 100) + '...');
      }
      const tempId = `guest-temp-${Date.now()}-${Math.random().toString(36).substring(2)}`;
      
      // Add optimistic message for guest
      const optimisticMessage: Message = {
        _id: tempId,
        senderId: guestUser.guestId,
        receiverId: 'support',
        text: messageData.text || '',
        image: messageData.image, // Include image in optimistic message
        createdAt: new Date(),
        isOptimistic: true,
      };
      
      console.log('📤 Adding optimistic message:', optimisticMessage);
      setMessages((prevMessages) => [...prevMessages, optimisticMessage]);

      try {
        // Send via socket for real-time
        console.log('📤 Sending via socket...');
        sendGuestMessage(messageData.text || '', messageData.image);
        
        // Also send via unified API for persistence
        console.log('📤 Sending via unified API...');
        const response = await fetch(`/api/messages/send/${targetUser._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: messageData.text || '',
            image: messageData.image, // Include image for guest messages
            guestToken: guestUser.guestToken
          }),
        });

        console.log('📤 API Response status:', response.status);
        if (!response.ok) {
          throw new Error('Failed to send guest message to API');
        }

        const result = await response.json();
        console.log('📤 API Response result:', result);
        console.log('🖼️ API Response image:', result.image ? 'Present' : 'Not present');
        if (result.image) {
          console.log('🖼️ API Response image URL:', result.image);
        }
        
        // Replace optimistic message with real message
        setMessages((prevMessages) => {
          const filteredMessages = prevMessages.filter((msg) => msg._id !== tempId);
          const realMessage: Message = {
            _id: result.messageId,
            senderId: guestUser.guestId,
            receiverId: 'support',
            text: messageData.text || '',
            image: result.image || messageData.image, // Include image from API response or original
            createdAt: new Date(),
            isOptimistic: false,
          };
          return [...filteredMessages, realMessage];
        });

        if (isSoundEnabled && typeof Audio !== 'undefined') {
          const notificationSound = new Audio('/sounds/notification.mp3');
          notificationSound.currentTime = 0;
          notificationSound.play().catch((e) => console.log('Audio play failed:', e));
        }

        console.log('✅ Guest message sent successfully');
      } catch (error) {
        console.error('❌ Failed to send guest message:', error);
        // Remove optimistic message on error
        setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== tempId));
      }
      
      return;
    }

    if (!authUser) {
      console.warn('Cannot send message: Not authenticated and not guest');
      return;
    }

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`;

    const optimisticMessage: Message = {
      _id: tempId,
      senderId: authUser.userId,
      receiverId: targetUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date(),
      isOptimistic: true,
    };

    setMessages((prevMessages) => {
      const filteredMessages = prevMessages.filter((msg) => !msg.isOptimistic || msg._id !== tempId);
      return [...filteredMessages, optimisticMessage];
    });

    try {
      const response = await fetch(`/api/messages/send/${targetUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const sentMessage: Message = await response.json();

      setMessages((prevMessages) => {
        const filteredMessages = prevMessages.filter((msg) => msg._id !== tempId);
        const messageExists = filteredMessages.some((msg) => msg._id === sentMessage._id);
        if (messageExists) {
          console.warn(`Message with _id ${sentMessage._id} already exists, skipping`, sentMessage);
          return filteredMessages;
        }
        return [...filteredMessages, sentMessage];
      });

      if (isSoundEnabled && typeof Audio !== 'undefined') {
        const notificationSound = new Audio('/sounds/notification.mp3');
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log('Audio play failed:', e));
      }

      if (document.hidden || !document.hasFocus()) {
        const receiverName = targetUser.isAdmin ? 'Support' : (targetUser.firstName || targetUser.email);
        const messageText = messageData.text || (messageData.image ? 'Sent an image' : 'Message sent');
        debouncedShowSentNotification(receiverName, messageText, () => {
          window.focus();
          setIsOpen(true);
        });
      }
    } catch (error) {
      setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== tempId));
      console.error('Send message error:', error);
    }
  };

  const debouncedShowNotification = useCallback(
    (senderName: string, messageText: string, onClick: () => void) => {
      const debouncedFn = debounce(() => {
        showMessageNotification(senderName, messageText, onClick);
      }, 1000);
      debouncedFn();
    },
    []
  );

  const debouncedShowSentNotification = useCallback(
    (receiverName: string, messageText: string, onClick: () => void) => {
      const debouncedFn = debounce(() => {
        showSentMessageNotification(receiverName, messageText, onClick);
      }, 1000);
      debouncedFn();
    },
    []
  );

  const subscribeToMessages = useCallback(() => {
    if (!targetUser) {
      console.log('⚠️ Cannot subscribe to messages: no target user');
      return;
    }

    // For guests, subscribe to guest-specific events using guestSocket from GuestContext
    if (guestUser && !authUser && guestSocket) {
      console.log('📡 Subscribing to guest messages for:', guestUser.guestName);
      
      // Subscribe to support replies
      guestSocket.on('supportReply', (replyData: { text: string; timestamp: string }) => {
        console.log('📨 Received support reply:', replyData);
        
        const supportMessage: Message = {
          _id: `support-reply-${Date.now()}-${Math.random().toString(36).substring(2)}`,
          senderId: 'support',
          receiverId: guestUser.guestId,
          text: replyData.text,
          createdAt: new Date(replyData.timestamp),
          isOptimistic: false,
        };
        
        setMessages((prevMessages) => [...prevMessages, supportMessage]);
        
        if (isSoundEnabled && typeof Audio !== 'undefined') {
          const notificationSound = new Audio('/sounds/notification.mp3');
          notificationSound.currentTime = 0;
          notificationSound.play().catch((e) => console.log('Audio play failed:', e));
        }
      });

      // Subscribe to other guest-specific events
      guestSocket.on('supportReplyToGuest', (replyData: { text: string; timestamp: string }) => {
        console.log('📨 Received support reply to guest:', replyData);
        
        const supportMessage: Message = {
          _id: `support-reply-${Date.now()}-${Math.random().toString(36).substring(2)}`,
          senderId: 'support',
          receiverId: guestUser.guestId,
          text: replyData.text,
          createdAt: new Date(replyData.timestamp),
          isOptimistic: false,
        };
        
        setMessages((prevMessages) => [...prevMessages, supportMessage]);
        
        if (isSoundEnabled && typeof Audio !== 'undefined') {
          const notificationSound = new Audio('/sounds/notification.mp3');
          notificationSound.currentTime = 0;
          notificationSound.play().catch((e) => console.log('Audio play failed:', e));
        }
      });
      
      return;
    }

    if (!socket || !isSocketConnected) {
      console.log('⚠️ Cannot subscribe to messages:', {
        socket: !!socket,
        isSocketConnected,
      });
      return;
    }

    console.log('📡 Subscribing to messages for user:', targetUser._id);

    socket.on('newMessage', (newMessage: Message) => {
      console.log('📨 Received new message:', newMessage);

      if (!newMessage._id) {
        console.warn('Received message without _id, skipping:', newMessage);
        return;
      }

      const isMessageSentFromTargetUser = newMessage.senderId === targetUser._id;
      if (!isMessageSentFromTargetUser) {
        console.log('❌ Message not from target user:', {
          senderId: newMessage.senderId,
          targetUserId: targetUser._id,
        });
        return;
      }

      setMessages((prevMessages) => {
        const messageExists = prevMessages.some((msg) => msg._id === newMessage._id);
        if (messageExists) {
          console.warn(`Message with _id ${newMessage._id} already exists, skipping`, newMessage);
          return prevMessages;
        }
        return [...prevMessages, newMessage];
      });

      if (isSoundEnabled && typeof Audio !== 'undefined') {
        const notificationSound = new Audio('/sounds/notification.mp3');
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log('Audio play failed:', e));
      }

      if (document.hidden || !document.hasFocus()) {
        const senderName = targetUser.isAdmin ? 'Support' : (targetUser.firstName || targetUser.email);
        const messageText = newMessage.text || (newMessage.image ? 'Sent an image' : 'New message');

        debouncedShowNotification(senderName, messageText, () => {
          window.focus();
          setIsOpen(true);
        });
      }
    });

    socket.on('messageSent', (sentMessage: Message) => {
      console.log('📤 Received message sent confirmation:', sentMessage);

      if (!sentMessage._id) {
        console.warn('Received messageSent without _id, skipping:', sentMessage);
        return;
      }

      const isMessageToTargetUser = sentMessage.receiverId === targetUser._id;
      if (!isMessageToTargetUser) {
        console.log('❌ Message sent confirmation not for target user');
        return;
      }

      setMessages((prevMessages) => {
        const messageExists = prevMessages.some((msg) => msg._id === sentMessage._id);
        if (messageExists) {
          console.warn(`Message with _id ${sentMessage._id} already exists, skipping`, sentMessage);
          return prevMessages;
        }
        return [...prevMessages, sentMessage];
      });
    });
  }, [targetUser, socket, guestSocket, isSoundEnabled, isSocketConnected, debouncedShowNotification, authUser, guestUser]);

  const unsubscribeFromMessages = useCallback(() => {
    // Cleanup regular socket events
    if (socket) {
      socket.off('newMessage');
      socket.off('messageSent');
      socket.off('userTyping');
      socket.off('userOnlineStatus');
    }
    
    // Cleanup guest socket events
    if (guestSocket) {
      guestSocket.off('supportReply');
      guestSocket.off('supportReplyToGuest');
    }
  }, [socket, guestSocket]);

  useEffect(() => {
    if (authUser) {
      console.log('🔔 Initializing target user for logged-in user:', authUser.email);
      initializeTargetUser();
    }
  }, [authUser, initializeTargetUser]);

  useEffect(() => {
    if (guestUser) {
      console.log('🔔 Initializing target user for guest user:', guestUser.guestName);
      initializeTargetUser();
    }
  }, [guestUser, initializeTargetUser]);

  useEffect(() => {
    // Subscribe for authenticated users
    if (targetUser && socket && isSocketConnected && isOpen && authUser) {
      subscribeToMessages();
    }
    
    // Subscribe for guest users
    if (targetUser && guestSocket && isOpen && guestUser && !authUser) {
      subscribeToMessages();
    }

    return () => {
      unsubscribeFromMessages();
    };
  }, [targetUser, socket, guestSocket, isSocketConnected, isOpen, authUser, guestUser, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (isOpen && targetUser && targetUser._id) {
      getMessagesByUserId(targetUser._id);
    }
  }, [isOpen, targetUser, getMessagesByUserId]);

  return (
    <GlobalChatContext.Provider
      value={{
        isOpen,
        messages,
        targetUser,
        isMessagesLoading,
        isSoundEnabled,
        toggleChatBox,
        closeChatBox,
        openChatBox,
        toggleSound,
        getMessagesByUserId,
        sendMessage,
        subscribeToMessages,
        unsubscribeFromMessages,
        initializeTargetUser,
      }}
    >
      {children}
    </GlobalChatContext.Provider>
  );
}