'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { Message as MessageType } from '@/types/Message';

interface Message extends MessageType {
  isOptimistic?: boolean;
}

interface Contact {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
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
  const { user: authUser, socket } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [targetUser, setTargetUser] = useState<Contact | null>(null);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  const TARGET_EMAIL = 'somethinn999awkwardd@gmail.com';

  // Handle client-side hydration for localStorage
  useEffect(() => {
    setIsHydrated(true);
    const savedSoundSetting = localStorage.getItem("globalChatSoundEnabled");
    if (savedSoundSetting !== null) {
      setIsSoundEnabled(JSON.parse(savedSoundSetting) === true);
    }
  }, []);

  /**
   * Toggle chat box visibility
   */
  const toggleChatBox = () => setIsOpen(!isOpen);
  const closeChatBox = () => setIsOpen(false);
  const openChatBox = () => setIsOpen(true);

  /**
   * Toggle sound notification setting
   */
  const toggleSound = () => {
    const newSoundState = !isSoundEnabled;
    setIsSoundEnabled(newSoundState);
    if (isHydrated) {
      localStorage.setItem("globalChatSoundEnabled", JSON.stringify(newSoundState));
    }
  };

  /**
   * Initialize target user by email
   */
  const initializeTargetUser = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/contacts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const contacts = await response.json();
      const target = contacts.find((contact: Contact) => contact.email === TARGET_EMAIL);
      
      if (target) {
        setTargetUser(target);
      } else {
        console.warn(`Target user with email ${TARGET_EMAIL} not found in contacts`);
      }
    } catch (error) {
      console.error('Failed to initialize target user:', error);
    }
  }, []);

  /**
   * Get messages for the target user
   */
  const getMessagesByUserId = useCallback(async (userId: string) => {
    setIsMessagesLoading(true);
    try {
      const response = await fetch(`/api/messages/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      toast.error(errorMessage);
      console.error('Get messages error:', error);
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  /**
   * Send a message with optimistic updates
   */
  const sendMessage = async (messageData: { text?: string; image?: string }) => {
    if (!targetUser || !authUser) return;

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: Message = {
      _id: tempId,
      senderId: authUser.userId,
      receiverId: targetUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date(),
      isOptimistic: true,
    };

    // Immediately update the UI by adding the message
    setMessages(prevMessages => [...prevMessages, optimisticMessage]);

    try {
      const response = await fetch(`/api/messages/send/${targetUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const sentMessage = await response.json();
      
      // Replace optimistic message with the real one
      setMessages(prevMessages => {
        const filteredMessages = prevMessages.filter(msg => msg._id !== tempId);
        return [...filteredMessages, sentMessage];
      });
    } catch (error) {
      // Remove optimistic message on failure
      setMessages(prevMessages => prevMessages.filter(msg => msg._id !== tempId));
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      toast.error(errorMessage);
      console.error('Send message error:', error);
    }
  };

  /**
   * Subscribe to new messages via socket
   */
  const subscribeToMessages = useCallback(() => {
    if (!targetUser || !socket) return;

    socket.on("newMessage", (newMessage: Message) => {
      const isMessageSentFromTargetUser = newMessage.senderId === targetUser._id;
      if (!isMessageSentFromTargetUser) return;

      setMessages(prevMessages => [...prevMessages, newMessage]);

      if (isSoundEnabled && typeof Audio !== 'undefined') {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });
  }, [targetUser, socket, isSoundEnabled]);

  /**
   * Unsubscribe from message events
   */
  const unsubscribeFromMessages = useCallback(() => {
    if (!socket) return;
    socket.off("newMessage");
  }, [socket]);

  // Initialize target user when auth user is available
  useEffect(() => {
    if (authUser) {
      initializeTargetUser();
    }
  }, [authUser, initializeTargetUser]);

  // Subscribe to messages when target user is set and socket is available
  useEffect(() => {
    if (targetUser && socket && isOpen) {
      subscribeToMessages();
    }

    return () => {
      unsubscribeFromMessages();
    };
  }, [targetUser, socket, isOpen, subscribeToMessages, unsubscribeFromMessages]);

  // Load messages when chat box opens
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
