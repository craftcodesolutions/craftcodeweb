// Socket.IO server initialization utilities
// This file is for server-side use only

let initializationAttempted = false;

export const forceInitializeSocketServer = async () => {
  // Only run on server-side
  if (typeof window !== 'undefined') {
    console.log('📝 Client-side: Socket.IO server initialization is handled server-side');
    return;
  }

  if (initializationAttempted) {
    console.log('✅ Socket.IO initialization already attempted');
    return;
  }

  initializationAttempted = true;
  
  try {
    console.log('🚀 Server-side: Checking Socket.IO server status...');
    
    // Dynamic import to avoid client-side bundling issues
    const { getSocketIO } = await import('./socketServer');
    
    // Check if server is already initialized
    const io = getSocketIO();
    
    if (io) {
      console.log('✅ Socket.IO server is already running');
      return;
    }
    
    console.log('📝 Socket.IO server will initialize automatically when first client connects');
    console.log('📝 This is the normal behavior for Next.js Socket.IO integration');
    
  } catch (error) {
    console.error('❌ Socket.IO initialization check error:', error);
  }
};

// Note: This module should only be imported server-side
// Client-side socket connections are handled by AuthContext with socket.io-client
