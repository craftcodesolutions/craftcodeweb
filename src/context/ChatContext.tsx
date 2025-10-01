/* eslint-disable react-hooks/exhaustive-deps */
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

interface Chat {
  _id: string;
  participants: Contact[];
  lastMessage?: Message;
  updatedAt: string;
}

interface ChatContextType {
  allContacts: Contact[];
  chats: Chat[];
  messages: Message[];
  activeTab: string;
  selectedUser: Contact | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isSoundEnabled: boolean;
  
  toggleSound: () => void;
  setActiveTab: (tab: string) => void;
  setSelectedUser: (user: Contact | null) => void;
  getAllContacts: () => Promise<void>;
  getMyChatPartners: () => Promise<void>;
  getMessagesByUserId: (userId: string) => Promise<void>;
  sendMessage: (messageData: { text?: string; image?: string }) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user: authUser, socket } = useAuth();
  
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<string>("chats");
  const [selectedUser, setSelectedUser] = useState<Contact | null>(null);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem("isSoundEnabled") || 'false') === true;
    }
    return false;
  });

  // Ensure user returns to inbox on page refresh/reload
  useEffect(() => {
    // Clear any selected user on component mount (page refresh)
    setSelectedUser(null);
    setMessages([]);
  }, []);

  /**
   * Toggle sound notification setting
   */
  const toggleSound = () => {
    const newSoundState = !isSoundEnabled;
    setIsSoundEnabled(newSoundState);
    if (typeof window !== 'undefined') {
      localStorage.setItem("isSoundEnabled", JSON.stringify(newSoundState));
    }
  };

  /**
   * Get all contacts from the server
   */
  const getAllContacts = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const response = await fetch('/api/messages/contacts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch contacts');
      }

      const data = await response.json();
      setAllContacts(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch contacts';
      toast.error(errorMessage);
      console.error('Get contacts error:', error);
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

  /**
   * Get chat partners (users with existing conversations)
   */
  const getMyChatPartners = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const response = await fetch('/api/messages/chats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch chats');
      }

      const data = await response.json();
      setChats(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch chats';
      toast.error(errorMessage);
      console.error('Get chat partners error:', error);
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

  /**
   * Get messages for a specific user
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
    if (!selectedUser || !authUser) return;

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: Message = {
      _id: tempId,
      senderId: authUser.userId,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date(),
      isOptimistic: true,
    };

    // Immediately update the UI by adding the message
    setMessages(prevMessages => [...prevMessages, optimisticMessage]);

    try {
      const response = await fetch(`/api/messages/send/${selectedUser._id}`, {
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
    if (!selectedUser || !socket) return;

    socket.on("newMessage", (newMessage: Message) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      setMessages(prevMessages => [...prevMessages, newMessage]);

      if (isSoundEnabled && typeof Audio !== 'undefined') {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0; // reset to start
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });
  }, [selectedUser, socket, isSoundEnabled]);

  /**
   * Unsubscribe from message events
   */
  const unsubscribeFromMessages = useCallback(() => {
    if (!socket) return;
    socket.off("newMessage");
  }, [socket]);

  // Subscribe to messages when selectedUser changes
  useEffect(() => {
    if (selectedUser && socket) {
      subscribeToMessages();
    }

    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedUser, socket, isSoundEnabled]);

  return (
    <ChatContext.Provider
      value={{
        allContacts,
        chats,
        messages,
        activeTab,
        selectedUser,
        isUsersLoading,
        isMessagesLoading,
        isSoundEnabled,
        toggleSound,
        setActiveTab,
        setSelectedUser,
        getAllContacts,
        getMyChatPartners,
        getMessagesByUserId,
        sendMessage,
        subscribeToMessages,
        unsubscribeFromMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
