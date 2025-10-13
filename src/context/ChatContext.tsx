/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import * as React from 'react';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { Message as MessageType } from '@/types/Message';
import {
  showMessageNotification,
  showSentMessageNotification,
} from '@/lib/notificationService';
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
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('isSoundEnabled') || 'false') === true;
    }
    return false;
  });
  const messagesSubscribedRef = useRef(false);

  // ------------------ Notifications ------------------
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

  // ------------------ Socket Handling ------------------
  const subscribeToMessages = useCallback(() => {
    if (!socket || !isSocketConnected || !authUser) return;
    if (messagesSubscribedRef.current) return;
    console.log('📡 Subscribing to messages for user:', authUser.email);
    const handleMessage = (msg: Message) => {
      if (!msg._id || !selectedUser) return;
      const isRelevant = msg.senderId === selectedUser._id || msg.receiverId === selectedUser._id;
      if (!isRelevant) return;
      // Update messages
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      // Update chats
      setChats((prevChats) =>
        prevChats
          .map((chat) => {
            const other = chat.participants?.[0] || chat;
            if (other._id === selectedUser._id) {
              return { ...chat, lastMessage: msg, updatedAt: new Date().toISOString() };
            }
            return chat;
          })
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      );
      // Sound
      if (isSoundEnabled && typeof Audio !== 'undefined') {
        const sound = new Audio('/sounds/notification.mp3');
        sound.play().catch(() => {});
      }
      // Browser notifications
      if (document.hidden || !document.hasFocus()) {
        const name = selectedUser.isAdmin
          ? 'Support'
          : selectedUser.firstName || selectedUser.email;
        const text = msg.text || (msg.image ? 'Sent an image' : 'New message');
        debouncedShowNotification(name, text, () => {
          window.focus();
          setSelectedUser(selectedUser);
        });
      }
    };
    socket.on('newMessage', handleMessage);
    socket.on('messageSent', handleMessage);
    messagesSubscribedRef.current = true;
  }, [socket, isSocketConnected, selectedUser, isSoundEnabled, debouncedShowNotification, authUser]);

  const unsubscribeFromMessages = useCallback(() => {
    if (!socket) return;
    socket.removeAllListeners('newMessage');
    socket.removeAllListeners('messageSent');
    socket.removeAllListeners('userTyping');
    socket.removeAllListeners('userOnlineStatus');
    messagesSubscribedRef.current = false;
    console.log('📴 Unsubscribed from socket events');
  }, [socket]);

  useEffect(() => {
    if (socket && isSocketConnected) {
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [socket, isSocketConnected, subscribeToMessages, unsubscribeFromMessages]);

  // ------------------ Auth & Initialization ------------------
  useEffect(() => {
    console.log('📨 Messenger opened - initializing socket connection...');
    if (authUser && !isSocketConnected) connectSocket();
  }, [authUser, connectSocket, isSocketConnected]);

  useEffect(() => {
    setSelectedUser(null);
    setMessages([]);
  }, [authUser]);

  const initializeTargetUser = useCallback(
    async (email: string): Promise<Contact | null> => {
      console.log('🔍 Initializing target user:', email);
      try {
        const res = await fetch('/api/messages/contacts', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch contacts');
        const contacts: Contact[] = await res.json();
        const targetUser = contacts.find(
          (c) => c.email.toLowerCase() === email.toLowerCase()
        );
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
    },
    [authUser]
  );

  // ------------------ Contacts & Chats ------------------
  const getAllContacts = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const res = await fetch('/api/messages/contacts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch contacts');
      const data: Contact[] = await res.json();
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
      const res = await fetch('/api/messages/chats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch chats');
      const data: Chat[] = await res.json();
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
      const res = await fetch(`/api/messages/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data: MessageType[] = await res.json();
      const uniqueMessages = Array.from(
        new Map(data.map((msg) => [msg._id, msg])).values()
      ) as Message[];
      setMessages(uniqueMessages);
      console.log(`📬 Fetched ${uniqueMessages.length} messages for user ${userId}`);
    } catch (error) {
      console.error('Get messages error:', error);
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  // ------------------ Send Message ------------------
  const sendMessage = async (messageData: { text?: string; image?: string }) => {
    if (!selectedUser || !authUser) {
      console.warn('Cannot send message: Missing selectedUser or authUser');
      return;
    }
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const optimistic: Message = {
      _id: tempId,
      senderId: authUser.userId,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date(),
      isOptimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const res = await fetch(`/api/messages/send/${selectedUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to send message');
      const sent: Message = await res.json();
      setMessages((prev) => prev.filter((m) => m._id !== tempId).concat(sent));
      if (isSoundEnabled && typeof Audio !== 'undefined') {
        const sound = new Audio('/sounds/notification.mp3');
        sound.play().catch(() => {});
      }
      if (document.hidden || !document.hasFocus()) {
        const name = selectedUser.isAdmin
          ? 'Support'
          : selectedUser.firstName || selectedUser.email;
        const text = messageData.text || (messageData.image ? 'Sent an image' : 'Message sent');
        debouncedShowSentNotification(name, text, () => {
          window.focus();
          setSelectedUser(selectedUser);
        });
      }
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      console.error('Send message error:', error);
    }
  };

  // ------------------ Sound Toggle ------------------
  const toggleSound = () => {
    const newState = !isSoundEnabled;
    setIsSoundEnabled(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isSoundEnabled', JSON.stringify(newState));
    }
  };

  // ------------------ Load contacts on auth ------------------
  useEffect(() => {
    if (authUser) getAllContacts();
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