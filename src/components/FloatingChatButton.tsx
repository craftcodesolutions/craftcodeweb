"use client";

import { Send, Users } from "lucide-react";
import { useGlobalChat } from "@/context/GlobalChatContext";
import { usePathname } from "next/navigation";

function FloatingChatButton() {
  const { isOpen, toggleChatBox } = useGlobalChat();
  const pathname = usePathname();


  // Don't show on admin routes or meeting area - only show on client routes (root folder)
  if (pathname.includes('/(admin)') || pathname.includes('/admin/') || pathname.includes('/meeting-area/') || pathname.includes('/meeting/')) {
    return null;
  }

  // Count unread messages (messages from the target user that are newer than last seen)
  const unreadCount = 0; // You can implement unread logic later if needed

  return (
    <>
      {/* Floating Chat Button */}
  <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40">
        <button
          onClick={toggleChatBox}
          className={`relative group transition-all duration-300 cursor-pointer ${
            isOpen ? 'scale-95 opacity-75' : 'scale-100 opacity-100 hover:scale-105'
          }`}
        >
          {/* Elegant multi-layer glow */}
          <div className="absolute inset-0 rounded-full pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-green-200/10 to-transparent rounded-full blur-md opacity-20"></div>
          </div>

          {/* Main button circle */}
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 via-emerald-500 to-emerald-700 rounded-md shadow-2xl flex items-center justify-center border-2 border-green-400/40 group-hover:border-green-400/60 transition-all duration-300">
            {/* Glassy background */}
            <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md"></div>

            {/* Icon container - now with message icon */}
            <div className="relative flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                {/* Main chat icon replaced with Send (paper plane) icon */}
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-700 drop-shadow-lg" />
                {/* Users icon for group chat */}
                <Users className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-green-600 absolute -bottom-0.5 -left-0.5" />
              </div>
            </div>

            {/* Unread badge */}
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
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

          {/* Tooltip - Hidden on mobile */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden sm:block">
            <div className="bg-slate-900/90 text-white text-base px-4 py-2 rounded-xl shadow-2xl whitespace-nowrap font-semibold tracking-wide backdrop-blur-md">
              {isOpen ? 'Close Chat' : 'Open Support Chat'}
              <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
            </div>
          </div>
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-30 sm:hidden transition-opacity duration-300"
          onClick={toggleChatBox}
        />
      )}
    </>
  );
}

export default FloatingChatButton;
