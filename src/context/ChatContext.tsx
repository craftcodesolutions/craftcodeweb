/* eslint-disable @typescript-eslint/no-unused-vars */
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
  isGuestMessage?: boolean;
  isSupportReply?: boolean;
}

interface GuestMessageResponse {
  messageId: string;
  guestId: string;
  guestName: string;
  message: string;
  image?: string;
  chatId: string;
  timestamp: Date;
  type: 'guest_message' | 'support_reply';
  senderId?: string;
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

  // Ensure user returns to inbox on page refresh/reload
  // const SUPPORT_EMAIL = 'somethinn999awkwardd@gmail.com'; // Removed - not used

  useEffect(() => {
    if (authUser && !isSocketConnected) {
      // Delay socket connection attempt to allow AuthContext to handle it first
      const timer = setTimeout(() => {
        if (!isSocketConnected) {
          console.log('ChatContext: Requesting socket connection from AuthContext');
          connectSocket();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [authUser, connectSocket, isSocketConnected]);
  useEffect(() => {
    // Clear any selected user on component mount (page refresh)
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

  /**
   * Toggle sound notification setting
   */
  const toggleSound = () => {
    const newSoundState = !isSoundEnabled;
    setIsSoundEnabled(newSoundState);
    if (typeof window !== 'undefined') {
      localStorage.setItem("isSoundEnabled", JSON.stringify(newSoundState));
      localStorage.setItem('isSoundEnabled', JSON.stringify(newSoundState));
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
      console.log(`📋 Fetched ${data.length} contacts`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch contacts';
     
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
      console.log('📨 Fetching messages for:', userId);
      // Use the unified endpoint for both guest and real users
      const response = await fetch(`/api/messages/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch messages');
      }

      const data: MessageType[] = await response.json();
      const uniqueMessages = Array.from(
        new Map(data.map((msg) => [msg._id, msg])).values()
      ) as Message[];
      setMessages(uniqueMessages);
      console.log(`📬 Fetched ${uniqueMessages.length} messages for user ${userId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      console.error('Get messages error:', error);
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  /**
   * Send a message with optimistic updates
   */
  const sendMessage = async (messageData: { text?: string; image?: string }) => {
    if (!selectedUser || !authUser) {
      console.warn('Cannot send message: Missing user information');
      return;
    }

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`;

    // Create optimistic message
    const optimisticMessage: Message = {
      _id: tempId,
      senderId: authUser.userId as string,  // Ensure we're using the actual user ID
      receiverId: selectedUser._id,         // Use the actual guest/user ID from the contact list
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date(),
      isOptimistic: true,
    };

    // Immediately update the UI by adding the message
    setMessages((prevMessages) => {
      const filteredMessages = prevMessages.filter((msg) => !msg.isOptimistic || msg._id !== tempId);
      return [...filteredMessages, optimisticMessage];
    });

    try {
      // Use the unified endpoint for sending messages
      const endpoint = `/api/messages/send/${selectedUser._id}`;

      const payload = {
        ...messageData,
        receiverId: selectedUser._id, // Use the ID from the contact list
        senderId: authUser.userId,    // Include the sender ID explicitly
        messageId: tempId,
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const sentMessage: Message = await response.json();

      setMessages((prevMessages) => {
        const filteredMessages = prevMessages.filter((msg) => msg._id !== tempId);
        const messageExists = filteredMessages.some((msg) => msg._id === sentMessage._id);
        if (messageExists) {
          console.log(`✅ Message ${sentMessage._id} already exists (duplicate prevented)`);
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
      // Remove optimistic message on failure
      setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== tempId));
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      console.error('Send message error:', error);
    }
  };

  /**
   * Subscribe to new messages via socket
   */
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

  const handleNewMessage = useCallback((
    newMessage: Message,
    isMessageForCurrentConversation: boolean,
    isGuest: boolean
  ) => {
    if (isMessageForCurrentConversation) {
      setMessages((prevMessages) => {
        const messageExists = prevMessages.some((msg) => msg._id === newMessage._id);
        if (messageExists) {
          console.log(`✅ Message ${newMessage._id} already exists (duplicate prevented)`);
          return prevMessages;
        }
        return [...prevMessages, newMessage];
      });

      setChats((prevChats) => {
        const updatedChats = prevChats.map((chat) => {
          const otherParticipant = chat.participants?.[0] || chat;
          if (otherParticipant._id === selectedUser?._id) {
            return {
              ...chat,
              lastMessage: newMessage,
              updatedAt: new Date().toISOString(),
            };
          }
          return chat;
        });
        return updatedChats;
      });

      // Play notification sound
      if (isSoundEnabled && typeof Audio !== 'undefined') {
        const notificationSound = new Audio('/sounds/notification.mp3');
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log('Audio play failed:', e));
      }

      // Show browser notification if window is not focused
      if (document.hidden || !document.hasFocus()) {
        const senderName = isGuest ? 'Guest User' : selectedUser?.firstName || selectedUser?.email || 'User';
        const messageText = newMessage.text || (newMessage.image ? 'Sent an image' : 'New message');
        debouncedShowNotification(senderName, messageText, () => {
          window.focus();
          setSelectedUser(selectedUser);
        });
      }
    }
  }, [selectedUser, isSoundEnabled, debouncedShowNotification]);

  const subscribeToMessages = useCallback(() => {
    if (!socket || !isSocketConnected) {
      console.log('⚠️ Cannot subscribe to messages:', {
        socket: !!socket,
        isSocketConnected,
        selectedUser: !!selectedUser
      });
      return;
    }

    if (!selectedUser) {
      console.log('⚠️ No selected user for message subscription');
      return;
    }

    // Handle regular messages
    // Handle regular messages
    socket.on('newMessage', (newMessage: Message) => {
      console.log('📨 Received regular message:', newMessage);

      if (!newMessage._id) {
        console.log('⚠️ Received message without _id, skipping');
        return;
      }

      const isMessageForCurrentConversation = selectedUser && 
        (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id);
        
      handleNewMessage(newMessage, isMessageForCurrentConversation, false);
    });

    // Handle guest messages
    socket.on('guestMessage', (guestMessage: GuestMessageResponse) => {
      console.log('📨 Received guest message:', guestMessage);

      if (!guestMessage.messageId) {
        console.log('⚠️ Received guest message without messageId, skipping');
        return;
      }

      // Convert guest message to regular message format
      const newMessage: Message = {
        _id: guestMessage.messageId,
        senderId: guestMessage.type === 'guest_message' ? guestMessage.guestId : (guestMessage.senderId as string),
        receiverId: guestMessage.type === 'guest_message' ? (authUser?.userId as string) : guestMessage.guestId,
        text: guestMessage.message,
        image: guestMessage.image,
        createdAt: new Date(guestMessage.timestamp),
        isGuestMessage: guestMessage.type === 'guest_message',
        isSupportReply: guestMessage.type === 'support_reply'
      };

      const isMessageForCurrentConversation = selectedUser && 
        (selectedUser.isGuest || selectedUser._id === guestMessage.guestId);

      if (!isMessageForCurrentConversation) {
        console.log('Message not for current conversation:', {
          senderId: newMessage.senderId,
          receiverId: newMessage.receiverId,
          selectedUserId: selectedUser._id
        });
        return;
      }

      if (isMessageForCurrentConversation) {
        setMessages((prevMessages) => {
          const messageExists = prevMessages.some((msg) => msg._id === newMessage._id);
          if (messageExists) {
            console.log(`✅ Message ${newMessage._id} already exists (duplicate prevented)`);
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
        console.log('⚠️ Received messageSent without _id, skipping');
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
            console.log(`✅ Message ${sentMessage._id} already exists (duplicate prevented)`);
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

  }, [selectedUser, socket, isSoundEnabled, isSocketConnected, debouncedShowNotification]);

  /**
   * Unsubscribe from message events
   */
  const unsubscribeFromMessages = useCallback(() => {
    if (!socket) return;
    socket.off('newMessage');
    socket.off('messageSent');
    socket.off('userTyping');
    socket.off('userOnlineStatus');
    console.log('📴 Unsubscribed from socket events');
  }, [socket]);

  // Subscribe to messages when selectedUser changes
  useEffect(() => {
    if (selectedUser && socket && isSocketConnected) {
      subscribeToMessages();
    }

    return () => {
      unsubscribeFromMessages();
    };
  }, [socket, isSocketConnected, selectedUser]);

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