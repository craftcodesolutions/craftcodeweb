'use client';

import * as React from 'react';
import { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import { useAuth } from './AuthContext';
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
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [targetUser, setTargetUser] = useState<Contact | null>(null);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  const SUPPORT_EMAIL = 'somethinn999awkwardd@gmail.com';

  useEffect(() => {
    setIsHydrated(true);
    const savedSoundSetting = localStorage.getItem('globalChatSoundEnabled');
    if (savedSoundSetting !== null) {
      setIsSoundEnabled(JSON.parse(savedSoundSetting) === true);
    }
  }, []);

  useEffect(() => {
    if (isOpen && authUser && !isSocketConnected) {
      console.log('📨 Chat opened - initializing socket connection...');
      connectSocket();
    }
  }, [isOpen, authUser, connectSocket, isSocketConnected]);

  const toggleChatBox = () => setIsOpen(!isOpen);
  const closeChatBox = () => setIsOpen(false);
  const openChatBox = () => {
    setIsOpen(true);
  };

  const toggleSound = () => {
    const newSoundState = !isSoundEnabled;
    setIsSoundEnabled(newSoundState);
    if (isHydrated) {
      localStorage.setItem('globalChatSoundEnabled', JSON.stringify(newSoundState));
    }
  };

  const initializeTargetUser = useCallback(async () => {
    if (!authUser) {
      console.warn('Cannot initialize target user: No authenticated user');
      return;
    }
    console.log('🔍 Initializing target user for:', authUser.email);
    try {
      const isAdmin = authUser.email.toLowerCase() === SUPPORT_EMAIL.toLowerCase();
      
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
  }, [authUser]);

  const getMessagesByUserId = useCallback(async (userId: string) => {
    setIsMessagesLoading(true);
    try {
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
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  const sendMessage = async (messageData: { text?: string; image?: string }) => {
    if (!targetUser || !authUser) {
      console.warn('Cannot send message: Missing targetUser or authUser');
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
    if (!targetUser || !socket || !isSocketConnected) {
      console.log('⚠️ Cannot subscribe to messages:', {
        targetUser: !!targetUser,
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
  }, [targetUser, socket, isSoundEnabled, isSocketConnected, debouncedShowNotification]);

  const unsubscribeFromMessages = useCallback(() => {
    if (!socket) return;
    socket.off('newMessage');
    socket.off('messageSent');
    socket.off('userTyping');
    socket.off('userOnlineStatus');
  }, [socket]);

  useEffect(() => {
    if (authUser) {
      console.log('🔔 Initializing target user for logged-in user:', authUser.email);
      initializeTargetUser();
    }
  }, [authUser, initializeTargetUser]);

  useEffect(() => {
    // Subscribe to socket events for authenticated users
    if (authUser && targetUser && socket && isSocketConnected && isOpen) {
      subscribeToMessages();
    }

    return () => {
      unsubscribeFromMessages();
    };
  }, [targetUser, socket, isSocketConnected, isOpen, subscribeToMessages, unsubscribeFromMessages, authUser]);

  useEffect(() => {
    if (isOpen) {
      // For authenticated users, fetch messages with target user
      if (targetUser && targetUser._id) {
        getMessagesByUserId(targetUser._id);
      }
    }
  }, [isOpen, targetUser, getMessagesByUserId, authUser]);

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