"use client";

import { useAuth } from "@/context/AuthContext";
import { WifiIcon, WifiOffIcon, UsersIcon, MessageCircleIcon } from "lucide-react";
import { useState, useEffect } from "react";

function ConnectionStatus() {
  const { isSocketConnected, socket, onlineUsers } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [connectionTime, setConnectionTime] = useState<Date | null>(null);

  useEffect(() => {
    if (isSocketConnected && !connectionTime) {
      setConnectionTime(new Date());
    } else if (!isSocketConnected) {
      setConnectionTime(null);
    }
  }, [isSocketConnected, connectionTime]);

  if (!socket) return null;

  const getConnectionDuration = () => {
    if (!connectionTime) return "";
    const now = new Date();
    const diff = now.getTime() - connectionTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`transition-all duration-300 cursor-pointer ${
          isExpanded ? "w-64" : "w-auto"
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 backdrop-blur-sm ${
            isSocketConnected
              ? "bg-green-500/20 text-green-400 border border-green-500/30 shadow-green-500/10"
              : "bg-red-500/20 text-red-400 border border-red-500/30 shadow-red-500/10"
          } shadow-lg hover:scale-105`}
        >
          {isSocketConnected ? (
            <>
              <WifiIcon className="w-4 h-4 animate-pulse" />
              <span>Connected</span>
              {isExpanded && (
                <div className="flex items-center gap-1 ml-2 text-xs">
                  <span>•</span>
                  <span>{getConnectionDuration()}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <WifiOffIcon className="w-4 h-4" />
              <span>Connecting...</span>
            </>
          )}
        </div>
        
        {/* Expanded details */}
        {isExpanded && isSocketConnected && (
          <div className="mt-2 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 text-xs space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-300">
              <span>Socket ID:</span>
              <span className="font-mono text-slate-400">{socket.id?.substring(0, 8)}...</span>
            </div>
            
            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-1">
                <UsersIcon className="w-3 h-3" />
                <span>Online Users:</span>
              </div>
              <span className="text-green-400 font-medium">{onlineUsers.length}</span>
            </div>
            
            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-1">
                <MessageCircleIcon className="w-3 h-3" />
                <span>Real-time:</span>
              </div>
              <span className="text-green-400 font-medium">Active</span>
            </div>
            
            {connectionTime && (
              <div className="flex items-center justify-between text-slate-300">
                <span>Connected at:</span>
                <span className="text-slate-400">
                  {connectionTime.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConnectionStatus;
