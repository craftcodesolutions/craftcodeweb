"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function SocketDebugger() {
  const { socket, user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    if (!socket) {
      setConnectionStatus('No Socket');
      addLog('❌ No socket instance');
      return;
    }

    if (socket.connected) {
      setConnectionStatus('Connected');
      addLog('✅ Socket connected');
    } else {
      setConnectionStatus('Disconnected');
      addLog('🔌 Socket disconnected');
    }

    // Listen for connection events
    socket.on('connect', () => {
      setConnectionStatus('Connected');
      addLog('✅ Socket connected: ' + socket.id);
    });

    socket.on('disconnect', () => {
      setConnectionStatus('Disconnected');
      addLog('🔌 Socket disconnected');
    });

    socket.on('authenticated', (data) => {
      addLog('🔐 Socket authenticated: ' + JSON.stringify(data));
    });

    socket.on('authError', (data) => {
      addLog('❌ Auth error: ' + data.message);
    });

    socket.on('newMessage', (data) => {
      addLog('📨 New message received: ' + JSON.stringify(data).substring(0, 100));
    });

    socket.on('messageSent', (data) => {
      addLog('📤 Message sent confirmation: ' + JSON.stringify(data).substring(0, 100));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('authenticated');
      socket.off('authError');
      socket.off('newMessage');
      socket.off('messageSent');
    };
  }, [socket]);

  const testConnection = () => {
    if (socket) {
      addLog('🧪 Testing connection...');
      socket.emit('test', { message: 'Hello from client' });
    }
  };

  const forceReconnect = () => {
    if (socket) {
      addLog('🔄 Force reconnecting...');
      socket.disconnect();
      socket.connect();
    }
  };

  const initializeServer = async () => {
    addLog('🚀 Manually initializing Socket.IO server...');
    try {
      const response = await fetch('/api/init-socket');
      const data = await response.json();
      if (data.success) {
        addLog('✅ Server initialized: ' + data.message);
      } else {
        addLog('❌ Server init failed: ' + data.error);
      }
    } catch (error) {
      addLog('❌ Init error: ' + (error as Error).message);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Socket.IO Debug</h3>
        <div className={`w-3 h-3 rounded-full ${
          connectionStatus === 'Connected' ? 'bg-green-500' : 
          connectionStatus === 'Disconnected' ? 'bg-red-500' : 'bg-yellow-500'
        }`}></div>
      </div>
      
      <div className="text-sm mb-2">
        <div>Status: <span className="font-mono">{connectionStatus}</span></div>
        <div>User: <span className="font-mono">{user?.email || 'None'}</span></div>
        <div>Socket ID: <span className="font-mono">{socket?.id || 'None'}</span></div>
      </div>

      <div className="flex gap-1 mb-2 flex-wrap">
        <button 
          onClick={initializeServer}
          className="px-2 py-1 bg-green-600 rounded text-xs hover:bg-green-700"
        >
          Init Server
        </button>
        <button 
          onClick={testConnection}
          className="px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
        >
          Test
        </button>
        <button 
          onClick={forceReconnect}
          className="px-2 py-1 bg-orange-600 rounded text-xs hover:bg-orange-700"
        >
          Reconnect
        </button>
        <button 
          onClick={() => setLogs([])}
          className="px-2 py-1 bg-gray-600 rounded text-xs hover:bg-gray-700"
        >
          Clear
        </button>
      </div>

      <div className="text-xs font-mono bg-gray-900 p-2 rounded max-h-32 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-gray-400">No logs yet...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))
        )}
      </div>
    </div>
  );
}
