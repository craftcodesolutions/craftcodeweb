import { io, Socket } from 'socket.io-client';
import { UserStatusChangeData } from '../types/socket';

const SOCKET_URL = process.env.SOCKET_URL || 
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3008' : 'https://your-service-name.onrender.com');
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 5000; // 5 seconds

let socket: Socket | null = null;
let reconnectAttempts = 0;

// Initialize and get the Socket.IO client instance
export const getSocketServer = (token: string): Socket => {
  if (!socket) {
    if (!token) {
      console.warn(`⚠️ [${new Date().toISOString()}] No token provided for socket connection`);
      throw new Error('Authentication token required');
    }

    socket = io(SOCKET_URL, {
      path: '/api/socket',
      transports: ['websocket'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: RECONNECT_DELAY,
      extraHeaders: {
        cookie: `authToken=${token}`,
      },
      auth: {
        token, // Send token in auth object
      },
    });

    // Handle connection events
    socket.on('connect', () => {
      reconnectAttempts = 0; // Reset on successful connection
      console.log(`🟢 [${new Date().toISOString()}] Connected to Socket.IO server: ${SOCKET_URL}`);
    });

    socket.on('connect_error', (error) => {
      console.error(`❌ [${new Date().toISOString()}] Connection error: ${error.message}`);
      if (error.message.includes('Authentication error')) {
        console.warn(`⚠️ [${new Date().toISOString()}] Authentication failed, stopping reconnection attempts`);
        socket?.close(); // Stop further reconnection
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔴 [${new Date().toISOString()}] Disconnected from server: ${reason}`);
      if (reason !== 'io client disconnect' && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        console.log(`🔄 [${new Date().toISOString()}] Attempting to reconnect (${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
        reconnectAttempts++;
      } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.warn(`⚠️ [${new Date().toISOString()}] Max reconnection attempts reached, stopping`);
        socket?.close();
      }
    });

    socket.connect();
    console.log(`🔌 [${new Date().toISOString()}] Socket client initialized for ${SOCKET_URL}`);
  }
  return socket;
};

// Listen for online users
export const onOnlineUsers = (callback: (userIds: string[]) => void) => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  socket.on('getOnlineUsers', (userIds: string[]) => {
    console.log(`📡 [${new Date().toISOString()}] Received online users: ${userIds.length} users`);
    callback(userIds);
  });
};

// Listen for chat messages
export const onReceiveMessage = (callback: (data: { user: string; text: string }) => void) => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  socket.on('receive_message', (data: { user: string; text: string }) => {
    console.log(`📩 [${new Date().toISOString()}] Received message from ${data.user}`);
    callback(data);
  });
};

// Listen for typing events
export const onUserTyping = (callback: (data: { user: string; isTyping: boolean }) => void) => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  socket.on('user_typing', (data: { user: string; isTyping: boolean }) => {
    console.log(`⌨️ [${new Date().toISOString()}] ${data.user} is ${data.isTyping ? 'typing' : 'not typing'}`);
    callback(data);
  });
};

// Listen for new user events
export const onNewUser = (callback: (user: string) => void) => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  socket.on('new_user', (user: string) => {
    console.log(`👤 [${new Date().toISOString()}] New user joined: ${user}`);
    callback(user);
  });
};

// Listen for chat room messages
export const onReceiveChatMessage = (
  callback: (data: { userId: string; message: string; timestamp: string }) => void
) => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  socket.on('receiveChatMessage', (data: { userId: string; message: string; timestamp: string }) => {
    console.log(`💬 [${new Date().toISOString()}] Received chat message from ${data.userId}`);
    callback(data);
  });
};

// Listen for token updates
export const onTokenUpdate = (
  callback: (data: { newToken: string; timestamp: string; reason: string }) => void
) => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  socket.on('tokenUpdated', (data: { newToken: string; timestamp: string; reason: string }) => {
    console.log(`✅ [${new Date().toISOString()}] Received token update: ${data.reason}`);
    callback(data);
  });
};

// Listen for user status changes
export const onUserStatusChange = (callback: (data: UserStatusChangeData) => void) => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  socket.on('userStatusChanged', (data: UserStatusChangeData) => {
    console.log(`✅ [${new Date().toISOString()}] Received status change: ${data.status} (${data.reason})`);
    if (data.forcedDisconnect) {
      console.log(`🔴 [${new Date().toISOString()}] Forced disconnection detected: ${data.reason}`);
      disconnectSocketServer();
      callback(data);
    } else {
      callback(data);
    }
    acknowledgeStatusUpdate(data.status, data.timestamp);
  });
};

// Listen for designations updates
export const onDesignationsUpdate = (
  callback: (data: { designations: string[]; timestamp: string; reason: string }) => void
) => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  socket.on('designationsUpdated', (data: { designations: string[]; timestamp: string; reason: string }) => {
    console.log(`✅ [${new Date().toISOString()}] Received designations update: ${data.reason}`);
    callback(data);
    acknowledgeDesignationsUpdate(data.timestamp, data.reason);
  });
};

// Emit a message
export const sendMessage = (user: string, text: string) => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  if (socket.connected) {
    socket.emit('send_message', { user, text });
    console.log(`📩 [${new Date().toISOString()}] Sent message from ${user}`);
  } else {
    console.warn(`⚠️ [${new Date().toISOString()}] Socket not connected, cannot send message`);
  }
};

// Emit typing status
export const sendTypingStatus = (user: string, isTyping: boolean) => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  if (socket.connected) {
    socket.emit('user_typing', { user, isTyping });
    console.log(`⌨️ [${new Date().toISOString()}] Sent typing status for ${user}: ${isTyping}`);
  } else {
    console.warn(`⚠️ [${new Date().toISOString()}] Socket not connected, cannot send typing status`);
  }
};

// Emit new user
export const sendNewUser = (user: string) => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  if (socket.connected) {
    socket.emit('new_user', { user });
    console.log(`👤 [${new Date().toISOString()}] Sent new user: ${user}`);
  } else {
    console.warn(`⚠️ [${new Date().toISOString()}] Socket not connected, cannot send new user`);
  }
};

// Join a chat room
export const joinChatRoom = (chatId: string) => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  if (socket.connected) {
    socket.emit('joinChatRoom', { chatId });
    console.log(`💬 [${new Date().toISOString()}] Joined chat room: chat_${chatId}`);
  } else {
    console.warn(`⚠️ [${new Date().toISOString()}] Socket not connected, cannot join chat room ${chatId}`);
  }
};

// Leave a chat room
export const leaveChatRoom = (chatId: string) => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  if (socket.connected) {
    socket.emit('leaveChatRoom', { chatId });
    console.log(`👋 [${new Date().toISOString()}] Left chat room: chat_${chatId}`);
  } else {
    console.warn(`⚠️ [${new Date().toISOString()}] Socket not connected, cannot leave chat room ${chatId}`);
  }
};

// Send a chat message
export const sendChatMessage = (chatId: string, message: string) => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  if (socket.connected) {
    socket.emit('sendChatMessage', { chatId, message });
    console.log(`📨 [${new Date().toISOString()}] Sent chat message to room ${chatId}`);
  } else {
    console.warn(`⚠️ [${new Date().toISOString()}] Socket not connected, cannot send chat message to ${chatId}`);
  }
};

// Check if a user is online
export const isUserOnline = async (userId: string): Promise<boolean> => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  if (!socket.connected) {
    console.warn(`⚠️ [${new Date().toISOString()}] Socket not connected, cannot check if user ${userId} is online`);
    return false;
  }

  return new Promise((resolve) => {
    socket.emit('checkUserOnline', { userId }, (response: { isOnline: boolean }) => {
      console.log(`📊 [${new Date().toISOString()}] User ${userId} online status: ${response.isOnline}`);
      resolve(response.isOnline);
    });
  });
};

// Acknowledge token update
export const acknowledgeTokenUpdate = (timestamp: string, reason: string) => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  if (socket.connected) {
    socket.emit('tokenUpdateReceived', { timestamp, reason });
    console.log(`✅ [${new Date().toISOString()}] Acknowledged token update: ${reason}`);
  } else {
    console.warn(`⚠️ [${new Date().toISOString()}] Socket not connected, cannot acknowledge token update`);
  }
};

// Acknowledge status update
export const acknowledgeStatusUpdate = (status: boolean, timestamp: string) => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  if (socket.connected) {
    socket.emit('statusUpdateReceived', { status, timestamp });
    console.log(`✅ [${new Date().toISOString()}] Acknowledged status update: ${status}`);
  } else {
    console.warn(`⚠️ [${new Date().toISOString()}] Socket not connected, cannot acknowledge status update`);
  }
};

// Acknowledge designations update
export const acknowledgeDesignationsUpdate = (timestamp: string, reason: string) => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  if (socket.connected) {
    socket.emit('designationsUpdateReceived', { timestamp, reason });
    console.log(`✅ [${new Date().toISOString()}] Acknowledged designations update: ${reason}`);
  } else {
    console.warn(`⚠️ [${new Date().toISOString()}] Socket not connected, cannot acknowledge designations update`);
  }
};

// Force disconnect a specific user (server-side operation)
export const forceDisconnectUser = async (userId: string, reason: string = 'User logged out') => {
  try {
    const token = localStorage.getItem('authToken') || '';
    if (!token) {
      console.warn(`⚠️ [${new Date().toISOString()}] No token available for disconnect request`);
      throw new Error('Authentication token required for disconnect');
    }
    const response = await fetch(`${SOCKET_URL}/disconnect-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, reason }),
    });

    if (response.ok) {
      console.log(`✅ [${new Date().toISOString()}] Successfully requested disconnection for user ${userId}: ${reason}`);
    } else {
      console.error(`❌ [${new Date().toISOString()}] Failed to disconnect user ${userId}: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Error disconnecting user ${userId}:`, error);
  }
};

// Get Socket.IO server instance (alias for getSocketServer)
export const getSocketIO = () => {
  const token = localStorage.getItem('authToken') || '';
  return getSocketServer(token);
};

// Send message to a specific user via Socket.IO
export const sendToUser = (userId: string, event: string, data: Record<string, unknown>) => {
  const socket = getSocketServer(localStorage.getItem('authToken') || '');
  if (socket && socket.connected) {
    socket.emit('sendToUser', { userId, event, data });
    console.log(`📤 [${new Date().toISOString()}] Sent ${event} to user ${userId}`);
  } else {
    console.warn(`⚠️ [${new Date().toISOString()}] Socket not connected, cannot send ${event} to user ${userId}`);
  }
};

// Disconnect the socket client
export const disconnectSocketServer = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log(`✅ [${new Date().toISOString()}] Socket client disconnected`);
  }
};