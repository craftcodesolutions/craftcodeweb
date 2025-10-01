"use client";

import { MessageCircle, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useGlobalChat } from "@/context/GlobalChatContext";

function FloatingChatButton() {
  const { isAuthenticated } = useAuth();
  const { isOpen, toggleChatBox } = useGlobalChat();

  // Only show for authenticated users
  if (!isAuthenticated) return null;

  // Count unread messages (messages from the target user that are newer than last seen)
  const unreadCount = 0; // You can implement unread logic later if needed

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={toggleChatBox}
          className={`relative group transition-all duration-300 ${
            isOpen ? 'scale-95 opacity-75' : 'scale-100 opacity-100 hover:scale-110'
          }`}
        >
          {/* Outer glow ring */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          
          {/* Main button circle */}
          <div className="relative w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-2xl flex items-center justify-center border-2 border-green-400/30 group-hover:border-green-400/50 transition-all duration-300">
            {/* Background pattern */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent"></div>
            
            {/* Icon container */}
            <div className="relative bg-white/90 rounded-lg p-2.5 shadow-lg group-hover:bg-white transition-colors duration-300">
              <div className="flex items-center justify-center">
                {/* Chat icon with users */}
                <div className="relative">
                  <MessageCircle className="w-5 h-5 text-green-600 fill-green-100" />
                  <Users className="w-3 h-3 text-green-600 absolute -top-0.5 -right-0.5" />
                </div>
              </div>
            </div>

            {/* Unread badge */}
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                <span className="text-white text-xs font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </div>
            )}

            {/* Pulse animation when closed */}
            {!isOpen && (
              <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-20"></div>
            )}
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-slate-800 text-white text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
              {isOpen ? 'Close Chat' : 'Open Support Chat'}
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
            </div>
          </div>
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={toggleChatBox}
        />
      )}
    </>
  );
}

export default FloatingChatButton;
