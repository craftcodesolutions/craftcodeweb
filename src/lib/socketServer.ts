import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

let io: SocketIOServer | null = null;

const userConnections = new Map<string, Set<string>>();
const socketUsers = new Map<string, string>();

function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  header.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name) cookies[name] = rest.join('=');
  });
  return cookies;
}

export const initializeSocketIO = (): SocketIOServer => {
  try {
    if (io) {
      console.log('✅ Socket.IO server already initialized');
      return io;
    }

    const httpServer = createServer((req, res) => {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Socket.IO server');
    });

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
    });

    io.use((socket: Socket, next) => {
      try {
        const cookies = parseCookies(socket.handshake.headers.cookie);
        const token = cookies['authToken'];

        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
        const userId = decoded.userId;
        const userEmail = decoded.email;

        if (!userId) {
          return next(new Error('Authentication error: Invalid token'));
        }

        socket.data.userId = userId;
        socket.data.userEmail = userEmail;
        socket.join(`user_${userId}`);

        next();
      } catch (error) {
        console.error(`❌ Socket authentication error for ${socket.id}:`, error);
        return next(new Error('Authentication error: Invalid token'));
      }
    });

    io.on('connection', (socket: Socket) => {
      const userId = socket.data.userId;
      const userEmail = socket.data.userEmail;
      console.log(`Socket connected: ${socket.id} for user ${userEmail} (${userId})`);

      if (!userConnections.has(userId)) {
        userConnections.set(userId, new Set());
      }
      userConnections.get(userId)!.add(socket.id);
      socketUsers.set(socket.id, userId);

      emitOnlineUsers();

      const userConnectionCount = userConnections.get(userId)?.size || 0;
      console.log(`📊 User ${userId} now has ${userConnectionCount} active connection(s)`);

      socket.on('tokenUpdateReceived', (data: { timestamp: string; reason: string }) => {
        console.log(`Token update acknowledged by user ${userId} (Socket: ${socket.id}):`, data);
      });

      socket.on('statusUpdateReceived', (data: { status: boolean; timestamp: string }) => {
        console.log(`Status update acknowledged by user ${userId} (Socket: ${socket.id}):`, data);
      });

      socket.on('typing', (data: { receiverId: string; isTyping: boolean }) => {
        if (userId && data.receiverId) {
          sendToUser(data.receiverId, 'userTyping', {
            userId: userId,
            isTyping: data.isTyping,
            timestamp: new Date().toISOString(),
          });
          console.log(`⌨️ Typing indicator: ${userId} -> ${data.receiverId} (${data.isTyping ? 'typing' : 'stopped'})`);
        }
      });

      socket.on('joinChatRoom', (data: { chatId: string }) => {
        if (userId && data.chatId) {
          socket.join(`chat_${data.chatId}`);
          console.log(`💬 User ${userId} joined chat room: chat_${data.chatId}`);
        }
      });

      socket.on('leaveChatRoom', (data: { chatId: string }) => {
        if (userId && data.chatId) {
          socket.leave(`chat_${data.chatId}`);
          console.log(`👋 User ${userId} left chat room: chat_${data.chatId}`);
        }
      });

      socket.on('messageRead', (data: { messageId: string; senderId: string }) => {
        if (userId && data.senderId) {
          sendToUser(data.senderId, 'messageReadReceipt', {
            messageId: data.messageId,
            readBy: userId,
            readAt: new Date().toISOString(),
          });
          console.log(`✅ Message read receipt: ${data.messageId} read by ${userId}`);
        }
      });

      socket.on('disconnect', (reason: string) => {
        console.log(`🔌 Socket disconnected: ${socket.id}, reason: ${reason}`);
        
        if (userId) {
          const userSockets = userConnections.get(userId);
          if (userSockets) {
            userSockets.delete(socket.id);
            if (userSockets.size === 0) {
              userConnections.delete(userId);
              console.log(`🚫 User ${userId} is now offline (no active connections)`);
            } else {
              console.log(`📊 User ${userId} still has ${userSockets.size} active connection(s)`);
            }
          }
          socketUsers.delete(socket.id);
          emitOnlineUsers();
          console.log(`ℹ️ User ${userId} disconnected from socket ${socket.id}`);
        } else {
          console.log(`ℹ️ Unauthenticated socket ${socket.id} disconnected`);
        }
        
        socket.removeAllListeners();
      });

      socket.on('test', (data: Record<string, unknown>) => {
        console.log(`🧪 Test event received from user ${userId} (Socket: ${socket.id}):`, data);
        socket.emit('testResponse', { 
          message: 'Test successful!', 
          userId, 
          socketId: socket.id,
          timestamp: new Date().toISOString() 
        });
      });

      socket.on('error', (error: Error) => {
        console.error(`❌ Socket error for ${socket.id} (User: ${userId || 'unauthenticated'}):`, error);
        
        if (userId) {
          const userSockets = userConnections.get(userId);
          if (userSockets) {
            userSockets.delete(socket.id);
            if (userSockets.size === 0) {
              userConnections.delete(userId);
            }
          }
          socketUsers.delete(socket.id);
          emitOnlineUsers();
        }
      });

      socket.on('connect_timeout', () => {
        console.warn(`⏰ Socket connection timeout for ${socket.id}`);
      });

      const pingInterval = setInterval(() => {
        if (socket.connected) {
          socket.emit('ping', { timestamp: new Date().toISOString() });
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);

      socket.on('pong', () => {
        if (userId) {
          console.log(`🏓 Pong received from user ${userId} (Socket: ${socket.id})`);
        }
      });

      socket.on('disconnect', () => {
        clearInterval(pingInterval);
      });
    });

    const basePort = parseInt(process.env.SOCKET_PORT || '3001');
    let port = basePort;
    const maxPortRetries = 5;

    const tryListen = (attempt: number = 0) => {
      httpServer.listen(port, () => {
        console.log(`✅ Socket.IO HTTP server running on port ${port}`);
      }).on('error', (error: Error & { code?: string }) => {
        if (error.code === 'EADDRINUSE' && attempt < maxPortRetries) {
          console.warn(`⚠️ Port ${port} in use, trying port ${port + 1}`);
          port += 1;
          tryListen(attempt + 1);
        } else {
          console.error('❌ Failed to start Socket.IO server:', {
            message: error.message,
            stack: error.stack,
          });
          throw error;
        }
      });
    };

    tryListen();

    console.log('✅ Socket.IO server initialized successfully');
    return io;
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Failed to initialize Socket.IO server:', {
      message: err.message,
      stack: err.stack,
      env: process.env.NODE_ENV,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    });
    throw error;
  }
};

export const getSocketIO = (): SocketIOServer | null => {
  if (!io) {
    console.warn('⚠️ Socket.IO server not initialized');
  }
  return io;
};

export const emitTokenUpdate = (userId: string, newToken: string) => {
  if (io) {
    const room = `user_${userId}`;
    const connectedSockets = userConnections.get(userId);
    
    if (connectedSockets && connectedSockets.size > 0) {
      io.to(room).emit('tokenUpdated', { 
        newToken,
        timestamp: new Date().toISOString(),
        reason: 'User data updated by admin'
      });
      console.log(`✅ Token update emitted to user ${userId} (${connectedSockets.size} devices)`);
    } else {
      console.log(`⚠️ User ${userId} not connected - token update stored in database only`);
    }
  } else {
    console.warn('❌ Socket.IO not initialized, cannot emit token update');
  }
};

export const emitUserStatusChange = (userId: string, status: boolean) => {
  if (io) {
    const room = `user_${userId}`;
    const connectedSockets = userConnections.get(userId);
    
    if (connectedSockets && connectedSockets.size > 0) {
      io.to(room).emit('userStatusChanged', { 
        status,
        timestamp: new Date().toISOString(),
        reason: status ? 'Account activated by admin' : 'Account deactivated by admin'
      });
      console.log(`✅ User status change emitted to user ${userId}: ${status} (${connectedSockets.size} devices)`);
    } else {
      console.log(`⚠️ User ${userId} not connected - status change will take effect on next login`);
    }
  } else {
    console.warn('❌ Socket.IO not initialized, cannot emit status change');
  }
};

export const emitOnlineUsers = () => {
  if (io) {
    const onlineUserIds = Array.from(userConnections.keys());
    io.emit('getOnlineUsers', onlineUserIds);
    console.log(`📡 Online users list emitted: ${onlineUserIds.length} users online`);
  }
};

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

export const broadcastToAll = (event: string, data: Record<string, unknown>) => {
  if (io) {
    io.emit(event, data);
    console.log(`📢 Broadcast sent: ${event} to all connected users`);
  }
};

export const sendToUser = (userId: string, event: string, data: Record<string, unknown>) => {
  if (io) {
    const room = `user_${userId}`;
    io.to(room).emit(event, data);
    console.log(`📤 Message sent to user ${userId}: ${event}`);
  }
};

export const sendToChatRoom = (chatId: string, event: string, data: Record<string, unknown>) => {
  if (io) {
    const room = `chat_${chatId}`;
    io.to(room).emit(event, data);
    console.log(`💬 Message sent to chat room ${chatId}: ${event}`);
  }
};

export const notifyNewMessage = (userId: string, messageData: Record<string, unknown>) => {
  if (io) {
    const room = `user_${userId}`;
    const connectedSockets = userConnections.get(userId);
    
    if (connectedSockets && connectedSockets.size > 0) {
      io.to(room).emit('newMessage', {
        ...messageData,
        timestamp: new Date().toISOString(),
        notification: true,
      });
      console.log(`📨 New message notification sent to user ${userId}`);
    } else {
      console.log(`📱 User ${userId} offline - message will be delivered when online`);
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
    console.log(`🟢 User ${userId} is now ${isOnline ? 'online' : 'offline'}`);
    io.emit('userOnlineStatus', {
      userId,
      isOnline,
      timestamp: new Date().toISOString(),
    });
  }
};

export const isUserOnline = (userId: string): boolean => {
  return userConnections.has(userId);
};

export const getOnlineUsersStatus = (userIds: string[]): { [userId: string]: boolean } => {
  const status: { [userId: string]: boolean } = {};
  userIds.forEach(userId => {
    status[userId] = userConnections.has(userId);
  });
  return status;
};

export const forceDisconnectUser = (userId: string, reason: string = 'User logged out') => {
  if (io) {
    const userSockets = userConnections.get(userId);
    if (userSockets && userSockets.size > 0) {
      console.log(`🚫 Force disconnecting ${userSockets.size} socket(s) for user ${userId}`);
      
      io.to(`user_${userId}`).emit('force_logout', {
        reason,
        timestamp: new Date().toISOString()
      });
      
      userSockets.forEach(socketId => {
        const socket = io!.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);
          console.log(`🔌 Disconnected socket ${socketId} for user ${userId}`);
        }
      });
      
      userConnections.delete(userId);
      userSockets.forEach(socketId => {
        socketUsers.delete(socketId);
      });
      
      emitOnlineUsers();
      console.log(`✅ Successfully disconnected all sessions for user ${userId}`);
    } else {
      console.log(`ℹ️ No active connections found for user ${userId}`);
    }
  } else {
    console.warn('⚠️ Socket.IO not initialized, cannot force disconnect user');
  }
};

export const cleanupSocketIO = () => {
  if (io) {
    console.log('🔄 Cleaning up Socket.IO connections...');
    
    io.emit('server_shutdown', {
      message: 'Server is shutting down',
      timestamp: new Date().toISOString()
    });
    
    setTimeout(() => {
      userConnections.clear();
      socketUsers.clear();
      io!.close();
      io = null;
      console.log('✅ Socket.IO cleanup completed');
    }, 1000);
  }
};