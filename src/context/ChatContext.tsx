/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Message as MessageType } from '@/types/Message';
import { showMessageNotification, showSentMessageNotification } from '@/lib/notificationService';
import { debounce } from 'lodash';
import { Contact } from '@/lib/contacts';

interface Message extends MessageType {
  isOptimistic?: boolean;
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
  initializeTargetUser: (email: string) => Promise<Contact | null>;
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
  const { user: authUser, socket, connectSocket, isSocketConnected } = useAuth();
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<string>('chats');
  const [selectedUser, setSelectedUser] = useState<Contact | null>(null);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('isSoundEnabled');
      setIsSoundEnabled(saved === 'true');
    }
  }, []);


  // const SUPPORT_EMAIL = 'somethinn999awkwardd@gmail.com'; // Removed - not used

  useEffect(() => {
    console.log('📨 Messenger opened - initializing socket connection...');
    if (authUser && !isSocketConnected) {
      connectSocket();
    }
  }, [authUser, connectSocket, isSocketConnected]);
  useEffect(() => {
    setSelectedUser(null);
    setMessages([]);
  }, [authUser]);

  const initializeTargetUser = useCallback(async (email: string): Promise<Contact | null> => {
    console.log('🔍 Initializing target user:', email);
    try {
      const response = await fetch('/api/messages/contacts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const contacts: Contact[] = await response.json();
      const targetUser = contacts.find((contact) => contact.email.toLowerCase() === email.toLowerCase());

      if (!targetUser) {
        console.error(`Target user with email ${email} not found in contacts`);
        return null;
      }

      setSelectedUser(targetUser);
      console.log('✅ Target user set:', { _id: targetUser._id, email: targetUser.email });
      return targetUser;
    } catch (error) {
      console.error('Initialize target user error:', error);
      return null;
    }
  }, [authUser]);

  const toggleSound = () => {
    const newSoundState = !isSoundEnabled;
    setIsSoundEnabled(newSoundState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isSoundEnabled', JSON.stringify(newSoundState));
    }
  };
  

  const getAllContacts = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const response = await fetch('/api/messages/contacts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();
      setAllContacts(data);
      console.log(`📋 Fetched ${data.length} contacts`);
    } catch (error) {
      console.error('Get contacts error:', error);
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

  const getMyChatPartners = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const response = await fetch('/api/messages/chats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Get chat partners error:', error);
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

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
    if (!selectedUser || !authUser) {
      console.warn('Cannot send message: Missing selectedUser or authUser');
      return;
    }

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`;

    const optimisticMessage: Message = {
      _id: tempId,
      senderId: authUser.userId,
      receiverId: selectedUser._id,
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
      const response = await fetch(`/api/messages/send/${selectedUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
        credentials: 'include',
      });

      if (!response.ok) {
        let errorText = `Failed to send message (HTTP ${response.status})`;
        try {
          const data = await response.json();
          if (data?.error || data?.details) {
            errorText = `${data.error || 'Error'}: ${data.details || ''}`.trim();
          }
        } catch { }
        console.error('Send message API error:', errorText);
        throw new Error(errorText);
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
        const receiverName = selectedUser.isAdmin ? 'Support' : (selectedUser.firstName || selectedUser.email);
        const messageText = messageData.text || (messageData.image ? 'Sent an image' : 'Message sent');
        debouncedShowSentNotification(receiverName, messageText, () => {
          window.focus();
          setSelectedUser(selectedUser);
        });
      }
    } catch (error) {
      setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== tempId));
      console.error('Send message error:', error);
    }
  };

  const debouncedShowNotification = useCallback(
    debounce((senderName: string, messageText: string, onClick: () => void) => {
      showMessageNotification(senderName, messageText, onClick);
    }, 1000),
    []
  );

  const debouncedShowSentNotification = useCallback(
    debounce((receiverName: string, messageText: string, onClick: () => void) => {
      showSentMessageNotification(receiverName, messageText, onClick);
    }, 1000),
    []
  );

  const subscribeToMessages = useCallback(() => {
    if (!socket || !isSocketConnected) {
      console.log('⚠️ Cannot subscribe to messages:', {
        socket: !!socket,
        isSocketConnected,
      });
      return;
    }

    console.log('📡 Subscribing to messages for user:', authUser?.email);

    // Load current conversation messages once when subscribing
    if (selectedUser?._id) {
      getMessagesByUserId(selectedUser._id);
    }

    // Ensure we don't accumulate duplicate listeners across re-subscribes
    socket.off('newMessage');
    socket.off('messageSent');

    socket.on('newMessage', (newMessage: Message) => {
      console.log('📨 Received new message:', newMessage);

      if (!newMessage._id) {
        console.warn('Received message without _id, skipping:', newMessage);
        return;
      }

      const isMessageForSelectedUser = selectedUser && newMessage.senderId === selectedUser._id;

      if (!isMessageForSelectedUser) {
        console.log('Message not for selected user:', newMessage.senderId);
        return;
      }

      if (isMessageForSelectedUser) {
        setMessages((prevMessages) => {
          const messageExists = prevMessages.some((msg) => msg._id === newMessage._id);
          if (messageExists) {
            console.warn(`Message with _id ${newMessage._id} already exists, skipping`, newMessage);
            return prevMessages;
          }
          return [...prevMessages, newMessage];
        });

        setChats((prevChats) => {
          const updatedChats = prevChats.map((chat) => {
            const otherParticipant = chat.participants?.[0] || chat;
            if (otherParticipant._id === selectedUser._id) {
              return {
                ...chat,
                lastMessage: newMessage,
                updatedAt: new Date().toISOString(),
              };
            }
            return chat;
          });

          return updatedChats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        });
      }

      if (isSoundEnabled && typeof Audio !== 'undefined') {
        const notificationSound = new Audio('/sounds/notification.mp3');
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log('Audio play failed:', e));
      }

      if (document.hidden || !document.hasFocus()) {
        const senderName = selectedUser?.isAdmin ? 'Support' : (selectedUser?.firstName || selectedUser?.email || 'Unknown');
        const messageText = newMessage.text || (newMessage.image ? 'Sent an image' : 'New message');
        debouncedShowNotification(senderName, messageText, () => {
          window.focus();
          if (selectedUser) setSelectedUser(selectedUser);
        });
      }
    });

    socket.on('messageSent', (sentMessage: Message) => {
      console.log('📤 Received message sent confirmation:', sentMessage);

      if (!sentMessage._id) {
        console.warn('Received messageSent without _id, skipping:', sentMessage);
        return;
      }

      // Check if message is to selected user
      if (!selectedUser || sentMessage.receiverId !== selectedUser._id) {
        console.log('Message sent confirmation not for selected user');
        return;
      }

      const isMessageToSelectedUser = selectedUser && sentMessage.receiverId === selectedUser._id;
      if (isMessageToSelectedUser) {
        setMessages((prevMessages) => {
          const messageExists = prevMessages.some((msg) => msg._id === sentMessage._id);
          if (messageExists) {
            console.warn(`Message with _id ${sentMessage._id} already exists, skipping`, sentMessage);
            return prevMessages;
          }
          return [...prevMessages, sentMessage];
        });

        setChats((prevChats) => {
          const updatedChats = prevChats.map((chat) => {
            const otherParticipant = chat.participants?.[0] || chat;
            if (otherParticipant._id === selectedUser._id) {
              return {
                ...chat,
                lastMessage: sentMessage,
                updatedAt: new Date().toISOString(),
              };
            }
            return chat;
          });

          return updatedChats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        });
      }
    });
  }, [selectedUser, socket, isSoundEnabled, isSocketConnected, debouncedShowNotification, getMessagesByUserId]);

  const unsubscribeFromMessages = useCallback(() => {
    if (!socket) return;
    socket.off('newMessage');
    socket.off('messageSent');
    socket.off('userTyping');
    socket.off('userOnlineStatus');
    console.log('📴 Unsubscribed from socket events');
  }, [socket]);

  // Removed global auto-subscribe to avoid duplicate subscriptions.

  useEffect(() => {
    if (authUser) {
      getAllContacts();
    }
  }, [authUser, getAllContacts]);

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
        initializeTargetUser,
        subscribeToMessages,
        unsubscribeFromMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}