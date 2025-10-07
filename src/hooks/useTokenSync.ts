import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

interface TokenSyncOptions {
  token?: string;
  onTokenUpdate?: (newToken: string) => void;
  onStatusChange?: (status: boolean) => void;
  onDisconnect?: () => void;
}

export const useTokenSync = ({
  token,
  onTokenUpdate,
  onStatusChange,
  onDisconnect,
}: TokenSyncOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectSocket = useCallback(() => {
    if (!token) return;

    // Clean up existing connection
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Create new socket connection
    socketRef.current = io(process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_APP_URL || ''
      : 'http://localhost:3000', {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    const socket = socketRef.current;

    // Handle connection
    socket.on('connect', () => {
      console.log('Socket connected for token sync');
      
      // Authenticate with current token
      socket.emit('authenticate', { token });
    });

    // Handle authentication success
    socket.on('authenticated', (data) => {
      console.log('Socket authenticated for user:', data.userId);
      toast.success('Real-time sync enabled', { 
        position: 'bottom-right',
        autoClose: 2000 
      });
    });

    // Handle authentication error
    socket.on('authError', (error) => {
      console.error('Socket authentication error:', error);
      toast.error('Failed to enable real-time sync', { 
        position: 'bottom-right',
        autoClose: 3000 
      });
    });

    // Handle token updates
    socket.on('tokenUpdated', (data) => {
      console.log('Token update received:', data);
      
      if (onTokenUpdate && data.newToken) {
        onTokenUpdate(data.newToken);
        
        // Acknowledge token update
        socket.emit('tokenUpdateReceived', {
          timestamp: data.timestamp,
          reason: data.reason,
        });

        toast.info('Account updated - staying logged in', { 
          position: 'bottom-right',
          autoClose: 4000 
        });
      }
    });

    // Handle user status changes
    socket.on('userStatusChanged', (data) => {
      console.log('User status changed:', data);
      
      if (onStatusChange) {
        onStatusChange(data.status);
      }

      if (!data.status) {
        toast.warning('Your account has been deactivated', { 
          position: 'top-center',
          autoClose: 5000 
        });
        
        // Optionally trigger logout
        if (onDisconnect) {
          setTimeout(() => onDisconnect(), 2000);
        }
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      
      // Attempt to reconnect after a delay
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect
        return;
      }
      
      // Client-side disconnect, attempt reconnection
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect socket...');
        connectSocket();
      }, 5000);
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

  }, [token, onTokenUpdate, onStatusChange, onDisconnect]);

  // Initialize socket connection
  useEffect(() => {
    if (token) {
      connectSocket();
    }

    return () => {
      // Cleanup on unmount
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connectSocket, token]);

  // Update authentication when token changes
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && token) {
      socketRef.current.emit('authenticate', { token });
    }
  }, [token]);

  // Return socket instance and connection status
  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    disconnect: () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    },
    reconnect: connectSocket,
  };
};
