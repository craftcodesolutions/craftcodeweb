/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { insertGuestUser, getGuestUserById, insertGuestMessage, cleanupExpiredGuests } from '@/controllers/guestUserService';

// ===== CONFIGURATION =====
const JWT_SECRET: string = process.env.JWT_SECRET || 'b7Kq9rL8x2N5fG4vD1sZ3uP6wT0yH8mX';
const BASE_PORT = parseInt(process.env.SOCKET_PORT || '3001');
const MAX_PORT_RETRIES = 5;

// ===== GLOBAL STATE =====
let io: SocketIOServer | null = null;
let httpServer: ReturnType<typeof createServer> | null = null;
let isServerListening = false;
let lastError: string | null = null;

// Function to get socket instance
export function getSocketInstance(): SocketIOServer | null {
  return io;
}

// Connection tracking
const userConnections = new Map<string, Set<string>>();
const socketUsers = new Map<string, string>();

// ===== UTILITY FUNCTIONS =====
function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  
  header.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name) cookies[name] = rest.join('=');
  });
  
  return cookies;
}

function logWithTimestamp(message: string, ...args: any[]) {
  console.log(`[${new Date().toISOString()}] ${message}`, ...args);
}

// ===== HTTP SERVER SETUP =====
function createHttpServer() {
  return createServer((req, res) => {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Socket.IO client server');
  });
}

// ===== SOCKET.IO AUTHENTICATION =====
function setupAuthentication(io: SocketIOServer) {
  io.use(async (socket: Socket, next) => {
    // Guest support: allow unauthenticated users with guestId
    const guestToken = socket.handshake.auth?.guestToken;
    const guestId = socket.handshake.auth?.guestId;
    // If guestToken is provided, verify it
    if (guestToken) {
      try {
        const decoded = jwt.verify(guestToken, JWT_SECRET) as { guestId: string };
        const guestUser = await getGuestUserById(decoded.guestId);
        if (!guestUser || new Date(guestUser.expiresAt) < new Date()) {
          return next(new Error('Guest expired or not found'));
        }
        socket.data.guestId = guestUser.guestId;
        socket.data.guestName = guestUser.dummyName;
        socket.data.guestEmail = guestUser.dummyEmail;
        socket.join(`guest_${guestUser.guestId}`);
        logWithTimestamp(`✅ Guest socket ${socket.id} authenticated: ${guestUser.dummyName} (${guestUser.guestId})`);
        return next();
      } catch (err) {
        logWithTimestamp(`❌ Guest JWT error for socket ${socket.id}:`, err);
        return next(new Error('Guest authentication error'));
      }
    }
    // If guestId is provided, create guest user and issue JWT
    if (guestId) {
      const dummyName = socket.handshake.auth?.dummyName || `Guest-${guestId.substring(0, 6)}`;
      const dummyEmail = socket.handshake.auth?.dummyEmail || `${guestId.substring(0, 6)}@guest.local`;
      try {
        // Create guest user in DB if not exists
        let guestUser = await getGuestUserById(guestId);
        if (!guestUser) {
          await insertGuestUser({ guestId, dummyName, dummyEmail });
          guestUser = await getGuestUserById(guestId);
        }
        
        if (!guestUser) {
          return next(new Error('Failed to create guest user'));
        }
        
        // Issue JWT for guest
        const token = jwt.sign({ guestId }, JWT_SECRET, { expiresIn: '24h' });
        socket.emit('guestTokenIssued', { token });
        socket.data.guestId = guestUser.guestId;
        socket.data.guestName = guestUser.dummyName;
        socket.data.guestEmail = guestUser.dummyEmail;
        socket.join(`guest_${guestId}`);
        logWithTimestamp(`✅ Guest socket ${socket.id} connected: ${guestUser.dummyName} (${guestId})`);
        return next();
      } catch (err) {
        logWithTimestamp(`❌ Guest DB error for socket ${socket.id}:`, err);
        return next(new Error('Guest DB error'));
      }
    }

    // Authenticated user logic (original)
    try {
      // Get authentication token
      let token = socket.handshake.auth?.token;
      if (!token) {
        const cookies = parseCookies(socket.handshake.headers.cookie);
        token = cookies['authToken'];
      }

      if (!token) {
        logWithTimestamp(`🚫 Unauthenticated connection rejected for socket ${socket.id}`);
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      
      if (!decoded.userId || !decoded.email) {
        return next(new Error('Authentication error: Invalid token data'));
      }

      socket.data.userId = decoded.userId;
      socket.data.userEmail = decoded.email;
      socket.join(`user_${decoded.userId}`);
      
      logWithTimestamp(`✅ Socket ${socket.id} authenticated for user ${decoded.email} (${decoded.userId})`);
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logWithTimestamp(`❌ Token expired for socket ${socket.id}`);
        return next(new Error('Authentication error: Token expired'));
      }
      if (error instanceof jwt.JsonWebTokenError) {
        logWithTimestamp(`❌ Invalid token signature for socket ${socket.id}`);
        return next(new Error('Authentication error: Invalid token signature'));
      }
      
      logWithTimestamp(`❌ Socket authentication error for ${socket.id}:`, error);
      return next(new Error('Authentication error: Invalid token'));
    }
  });
}

// ===== SOCKET EVENT HANDLERS =====
function setupSocketHandlers(socket: Socket) {
  // Guest support
  if (socket.data.guestId) {
    const guestId = socket.data.guestId as string;
    const guestName = socket.data.guestName as string;
    // Track guest connections
    if (!userConnections.has(guestId)) {
      userConnections.set(guestId, new Set());
    }
    userConnections.get(guestId)!.add(socket.id);
    socketUsers.set(socket.id, guestId);
    emitOnlineUsers();
    logWithTimestamp(`🟢 Guest connected: ${socket.id} (${guestName}, ${guestId})`);

    // Guest messaging event
    socket.on('guestSendMessage', async (msg: { text: string; image?: string }) => {
      try {
        // Save to DB
        const messageData = {
          messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          guestId,
          guestName,
          message: msg.text,
          image: msg.image,
          chatId: `chat_${guestId}`,
          type: 'guest_message' as const,
          senderId: guestId
        };
        
        await insertGuestMessage(messageData);
        logWithTimestamp(`📨 Guest message from ${guestName} (${guestId}): ${msg.text}`);
        
        // Create payload with timestamp
        const messagePayload = {
          ...messageData,
          timestamp: new Date().toISOString()
        };

        // Emit to guest's room
        io!.to(`guest_${guestId}`).emit('guestMessage', messagePayload);
        
        // Emit to support team room
        io!.to('support_team').emit('guestMessage', messagePayload);
      } catch (error) {
        logWithTimestamp(`❌ Error saving guest message:`, error);
        socket.emit('messageError', { error: 'Failed to save message' });
      }
    });

    // Optionally, allow support to reply
    socket.on('supportReplyToGuest', async (msg: {
      messageId: string;
      guestId: string;
      message: string;
      image?: string;
      chatId: string;
      type: 'support_reply';
      senderId: string;
    }) => {
      try {
        // Save to DB
        const messageData = {
          messageId: msg.messageId,
          guestId: msg.guestId,
          guestName: 'Support Team',
          message: msg.message,
          image: msg.image,
          chatId: msg.chatId,
          type: 'support_reply' as const,
          senderId: msg.senderId
        };
        
        await insertGuestMessage(messageData);
        
        // Emit to both guest room and support room for real-time updates
        const messagePayload = {
          ...messageData,
          timestamp: new Date().toISOString()
        };

        // Emit to guest's room
        io!.to(`guest_${msg.guestId}`).emit('guestMessage', messagePayload);
        
        // Emit to support team room
        io!.to('support_team').emit('guestMessage', messagePayload);
        
        logWithTimestamp(`📨 Support reply to guest ${msg.guestId}: ${msg.message}`);
      } catch (error) {
        logWithTimestamp(`❌ Error saving support reply:`, error);
        socket.emit('messageError', { error: 'Failed to save message' });
      }
    });

    // Guest disconnect
    socket.on('disconnect', (reason: string) => {
      logWithTimestamp(`🔴 Guest disconnected: ${socket.id} (${guestId}), reason: ${reason}`);
      const guestSockets = userConnections.get(guestId);
      if (guestSockets) {
        guestSockets.delete(socket.id);
        if (guestSockets.size === 0) {
          userConnections.delete(guestId);
        }
      }
      socketUsers.delete(socket.id);
      emitOnlineUsers();
      socket.removeAllListeners();
    });
    return;
  }
  // ...existing code for authenticated users below

  // Declare userId for authenticated users
  const userId = socket.data.userId as string;

  // Admin acknowledgments
  socket.on('tokenUpdateReceived', (data: { timestamp: string; reason: string }) => {
    if (!data?.timestamp || !data?.reason) {
      logWithTimestamp(`⚠️ Invalid tokenUpdateReceived data from ${userId}`);
      return;
    }
    logWithTimestamp(`✅ Token update acknowledged by user ${userId} (Socket: ${socket.id})`);
  });

  socket.on('statusUpdateReceived', (data: { status: boolean; timestamp: string }) => {
    if (typeof data?.status !== 'boolean' || !data?.timestamp) {
      logWithTimestamp(`⚠️ Invalid statusUpdateReceived data from ${userId}`);
      return;
    }
    logWithTimestamp(`✅ Status update acknowledged by user ${userId} (Socket: ${socket.id})`);
  });

  // Typing indicators
  socket.on('typing', (data: { receiverId: string; isTyping: boolean }) => {
    if (!data?.receiverId || typeof data?.isTyping !== 'boolean') {
      logWithTimestamp(`⚠️ Invalid typing event data from ${userId}`);
      return;
    }
    
    sendToUser(data.receiverId, 'userTyping', {
      userId,
      isTyping: data.isTyping,
      timestamp: new Date().toISOString(),
    });
    
    logWithTimestamp(`⌨️ Typing indicator: ${userId} -> ${data.receiverId} (${data.isTyping ? 'typing' : 'stopped'})`);
  });

  // Chat room functionality
  socket.on('joinChatRoom', (data: { chatId: string }) => {
    if (!data?.chatId) {
      logWithTimestamp(`⚠️ Invalid joinChatRoom data from ${userId}`);
      return;
    }
    
    socket.join(`chat_${data.chatId}`);
    logWithTimestamp(`💬 User ${userId} joined chat room: chat_${data.chatId}`);
  });

  socket.on('leaveChatRoom', (data: { chatId: string }) => {
    if (!data?.chatId) {
      logWithTimestamp(`⚠️ Invalid leaveChatRoom data from ${userId}`);
      return;
    }
    
    socket.leave(`chat_${data.chatId}`);
    logWithTimestamp(`👋 User ${userId} left chat room: chat_${data.chatId}`);
  });

  // Message read receipts
  socket.on('messageRead', (data: { messageId: string; senderId: string }) => {
    if (!data?.messageId || !data?.senderId) {
      logWithTimestamp(`⚠️ Invalid messageRead data from ${userId}`);
      return;
    }
    
    sendToUser(data.senderId, 'messageReadReceipt', {
      messageId: data.messageId,
      readBy: userId,
      readAt: new Date().toISOString(),
    });
    
    logWithTimestamp(`✅ Message read receipt: ${data.messageId} read by ${userId}`);
  });

  // Test event
  socket.on('test', (data: Record<string, unknown>) => {
    logWithTimestamp(`🧪 Test event received from user ${userId} (Socket: ${socket.id}):`, data);
    socket.emit('testResponse', {
      message: 'Test successful!',
      userId,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  // Ping/Pong for connection health
  const pingInterval = setInterval(() => {
    if (socket.connected) {
      socket.emit('ping', { timestamp: new Date().toISOString() });
    } else {
      clearInterval(pingInterval);
    }
  }, process.env.NODE_ENV === 'production' ? 25000 : 15000);

  socket.on('pong', () => {
    logWithTimestamp(`🏓 Pong received from user ${userId} (Socket: ${socket.id})`);
  });

  // Error handling
  socket.on('error', (error: Error) => {
    logWithTimestamp(`❌ Socket error for ${socket.id} (User: ${userId}):`, error);
    lastError = error.message;
    
    // Clean up connections on error
    const userSockets = userConnections.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        userConnections.delete(userId);
      }
    }
    socketUsers.delete(socket.id);
    emitOnlineUsers();
  });

  socket.on('connect_timeout', () => {
    logWithTimestamp(`⏰ Socket connection timeout for ${socket.id}`);
  });

  // Handle disconnection
  socket.on('disconnect', (reason: string) => {
    logWithTimestamp(`🔴 User disconnected: ${socket.id} (${userId}), reason: ${reason}`);
    
    const userSockets = userConnections.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        userConnections.delete(userId);
        logWithTimestamp(`🚫 User ${userId} is now offline (no active connections)`);
      } else {
        logWithTimestamp(`📊 User ${userId} still has ${userSockets.size} active connection(s)`);
      }
    }
    
    socketUsers.delete(socket.id);
    emitOnlineUsers();
    clearInterval(pingInterval);
    socket.removeAllListeners();
  });
}

// ===== MAIN INITIALIZATION =====
export const initializeSocketIO = (): SocketIOServer => {
  try {
    if (io && isServerListening) {
      logWithTimestamp('✅ Socket.IO server already initialized and listening');
      return io;
    }

    // Clean up existing non-listening server
    if (httpServer && !isServerListening) {
      logWithTimestamp('🔄 Cleaning up existing non-listening server...');
      httpServer.close();
      httpServer = null;
    }

    // Create HTTP server
    if (!httpServer) {
      httpServer = createHttpServer();
    }

    // Create Socket.IO server
    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? process.env.NEXT_PUBLIC_APP_URL
          : ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true,
      pingTimeout: process.env.NODE_ENV === 'production' ? 20000 : 10000,
      pingInterval: process.env.NODE_ENV === 'production' ? 25000 : 15000,
      connectTimeout: process.env.NODE_ENV === 'production' ? 30000 : 20000,
    });

    // Setup authentication and event handlers
    setupAuthentication(io);
    
    io.on('connection', (socket: Socket) => {
      setupSocketHandlers(socket);
    });

    // Error tracking
    io.on('connect_error', (error: Error) => {
      lastError = error.message;
      logWithTimestamp('❌ Socket.IO connection error:', error.message);
    });

    // Start server with port retry logic
    if (!isServerListening) {
      startServer();
    }

    logWithTimestamp('✅ Socket.IO server initialized successfully');
    
    // Start cleanup interval for expired guests (every hour)
    setInterval(async () => {
      try {
        const deletedCount = await cleanupExpiredGuests();
        if (deletedCount > 0) {
          logWithTimestamp(`🧹 Cleaned up ${deletedCount} expired guest users`);
        }
      } catch (error) {
        logWithTimestamp('❌ Error cleaning up expired guests:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
    
    return io;
  } catch (error: unknown) {
    const err = error as Error;
    lastError = err.message;
    logWithTimestamp('❌ Failed to initialize Socket.IO server:', {
      message: err.message,
      stack: err.stack,
      env: process.env.NODE_ENV,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    });
    throw error;
  }
};

function startServer() {
  let port = BASE_PORT;
  
  const tryListen = (attempt: number = 0) => {
    if (isServerListening) {
      logWithTimestamp('✅ Server already listening, skipping attempt');
      return;
    }

    if (!httpServer) {
      logWithTimestamp('❌ HTTP server is null, cannot listen');
      return;
    }

    httpServer.listen(port, () => {
      isServerListening = true;
      lastError = null; // Clear error on successful connection
      logWithTimestamp(`🚀 Socket.IO HTTP server running on port ${port}`);
    }).on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE' && attempt < MAX_PORT_RETRIES) {
        logWithTimestamp(`⚠️ Port ${port} in use, trying port ${port + 1}`);
        port += 1;
        setTimeout(() => tryListen(attempt + 1), 100);
      } else {
        lastError = error.message;
        logWithTimestamp('❌ Failed to start Socket.IO server:', {
          message: error.message,
          stack: error.stack,
        });
        isServerListening = false;
        throw error;
      }
    });
  };
  
  tryListen();
}

// ===== UTILITY EXPORTS =====
export const getSocketIO = (): SocketIOServer | null => {
  if (!io) {
    logWithTimestamp('⚠️ Socket.IO server not initialized');
  }
  return io;
};

export const getServerStatus = () => {
  return {
    isInitialized: !!io,
    isListening: isServerListening,
    hasHttpServer: !!httpServer,
    connectedUsers: userConnections.size,
    totalConnections: Array.from(userConnections.values()).reduce(
      (total, connections) => total + connections.size, 
      0
    ),
    lastError,
  };
};

export const emitOnlineUsers = () => {
  if (io) {
    const onlineUserIds = Array.from(userConnections.keys());
    io.emit('getOnlineUsers', onlineUserIds);
    logWithTimestamp(`📡 Online users list emitted: ${onlineUserIds.length} users online`);
  }
};

export const sendToUser = (userId: string, event: string, data: Record<string, unknown>) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
    logWithTimestamp(`📤 Sent to user ${userId}: ${event}`);
  }
};

export const sendToChatRoom = (chatId: string, event: string, data: Record<string, unknown>) => {
  if (io) {
    io.to(`chat_${chatId}`).emit(event, data);
    logWithTimestamp(`💬 Sent to chat room ${chatId}: ${event}`);
  }
};

export const emitTokenUpdate = (userId: string, newToken: string) => {
  if (io) {
    const connectedSockets = userConnections.get(userId);
    
    if (connectedSockets && connectedSockets.size > 0) {
      io.to(`user_${userId}`).emit('tokenUpdated', {
        newToken,
        timestamp: new Date().toISOString(),
        reason: 'User data updated by admin',
      });
      logWithTimestamp(`✅ Token update emitted to user ${userId} (${connectedSockets.size} devices)`);
    } else {
      logWithTimestamp(`⚠️ User ${userId} not connected - token update stored in database only`);
    }
  } else {
    logWithTimestamp('❌ Socket.IO not initialized, cannot emit token update');
  }
};

export const emitUserStatusChange = (userId: string, status: boolean) => {
  if (io) {
    const connectedSockets = userConnections.get(userId);
    
    if (connectedSockets && connectedSockets.size > 0) {
      io.to(`user_${userId}`).emit('userStatusChanged', {
        status,
        timestamp: new Date().toISOString(),
        reason: status ? 'Account activated by admin' : 'Account deactivated by admin',
      });
      logWithTimestamp(`✅ User status change emitted to user ${userId}: ${status} (${connectedSockets.size} devices)`);
    } else {
      logWithTimestamp(`⚠️ User ${userId} not connected - status change will take effect on next login`);
    }
  } else {
    logWithTimestamp('❌ Socket.IO not initialized, cannot emit status change');
  }
};

// ===== CONNECTION MANAGEMENT =====
export const getConnectedUsersCount = (): number => {
  return userConnections.size;
};

export const getUserConnections = (userId: string): number => {
  const connections = userConnections.get(userId);
  return connections ? connections.size : 0;
};

export const getOnlineUsers = (): string[] => {
  return Array.from(userConnections.keys());
};

export const isUserOnline = (userId: string): boolean => {
  return userConnections.has(userId);
};

export const getOnlineUsersStatus = (userIds: string[]): { [userId: string]: boolean } => {
  const status: { [userId: string]: boolean } = {};
  userIds.forEach((userId) => {
    status[userId] = userConnections.has(userId);
  });
  return status;
};

// ===== MESSAGING UTILITIES =====
export const broadcastToAll = (event: string, data: Record<string, unknown>) => {
  if (io) {
    io.emit(event, data);
    logWithTimestamp(`📢 Broadcast sent: ${event} to all connected users`);
  }
};

export const notifyNewMessage = (userId: string, messageData: Record<string, unknown>) => {
  if (io) {
    const connectedSockets = userConnections.get(userId);
    
    if (connectedSockets && connectedSockets.size > 0) {
      io.to(`user_${userId}`).emit('newMessage', {
        ...messageData,
        timestamp: new Date().toISOString(),
        notification: true,
      });
      logWithTimestamp(`📨 New message notification sent to user ${userId}`);
    } else {
      logWithTimestamp(`📱 User ${userId} offline - message will be delivered when online`);
    }
  }
};

export const sendTypingIndicator = (fromUserId: string, toUserId: string, isTyping: boolean) => {
  if (io) {
    sendToUser(toUserId, 'userTyping', {
      userId: fromUserId,
      isTyping,
      timestamp: new Date().toISOString(),
    });
  }
};

export const broadcastOnlineStatus = (userId: string, isOnline: boolean) => {
  if (io) {
    logWithTimestamp(`🟢 User ${userId} is now ${isOnline ? 'online' : 'offline'}`);
    io.emit('userOnlineStatus', {
      userId,
      isOnline,
      timestamp: new Date().toISOString(),
    });
  }
};

// ===== ADMIN FUNCTIONS =====
export const forceDisconnectUser = async (userId: string, reason: string = 'User logged out') => {
  try {
    // Make HTTP request to Socket.IO server's disconnect endpoint
    const SOCKET_SERVER_URL = process.env.SOCKET_URL || 
      (process.env.NODE_ENV === 'development' ? 'http://localhost:3008' : 'https://server-wp4r.onrender.com');
    
    const response = await fetch(`${SOCKET_SERVER_URL}/disconnect-user`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'admin-token'}`
      },
      body: JSON.stringify({ userId, reason })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    logWithTimestamp(`✅ Force disconnect request sent for user ${userId}: ${result.message}`);
    return result;
  } catch (error) {
    logWithTimestamp(`❌ Failed to force disconnect user ${userId}:`, error);
    
    // Fallback to local disconnect if HTTP request fails
    if (io) {
      const userSockets = userConnections.get(userId);
      if (userSockets && userSockets.size > 0) {
        logWithTimestamp(`🚫 Force disconnecting ${userSockets.size} socket(s) for user ${userId} (fallback)`);
        
        io.to(`user_${userId}`).emit('force_logout', {
          reason,
          timestamp: new Date().toISOString(),
        });
        
        userSockets.forEach((socketId) => {
          const socket = io!.sockets.sockets.get(socketId);
          if (socket) {
            socket.disconnect(true);
            logWithTimestamp(`🔌 Disconnected socket ${socketId} for user ${userId}`);
          }
        });
        
        userConnections.delete(userId);
        userSockets.forEach((socketId) => {
          socketUsers.delete(socketId);
        });
        
        emitOnlineUsers();
        logWithTimestamp(`✅ Successfully disconnected all sessions for user ${userId} (fallback)`);
      } else {
        logWithTimestamp(`ℹ️ No active connections found for user ${userId}`);
      }
    }
    
    throw error;
  }
};

// ===== CLEANUP =====
export const cleanupSocketIO = () => {
  logWithTimestamp('🧹 Cleaning up Socket.IO server...');

  if (io) {
    io.emit('server_shutdown', {
      message: 'Server is shutting down',
      timestamp: new Date().toISOString(),
    });

    setTimeout(() => {
      userConnections.clear();
      socketUsers.clear();

      // Close Socket.IO server
      io!.close();
      io = null;

      // Close HTTP server and reset state
      if (httpServer) {
        httpServer.close(() => {
          logWithTimestamp('✅ HTTP server closed');
        });
        httpServer = null;
      }

      isServerListening = false;
      lastError = null;
      logWithTimestamp('✅ Socket.IO cleanup completed');
    }, 1000);
  }
};

export const disconnectSocketServer = () => {
  if (io) {
    logWithTimestamp('🔌 Disconnecting from Socket.IO server...');
    cleanupSocketIO();
  }
};
