"use client";

import { MessageCircle, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useGlobalChat } from "@/context/GlobalChatContext";
import { usePathname } from "next/navigation";

function FloatingChatButton() {
  const { isAuthenticated } = useAuth();
  const { isOpen, toggleChatBox } = useGlobalChat();
  const pathname = usePathname();

  // Only show for authenticated users
  if (!isAuthenticated) return null;

  // Don't show on admin routes or meeting area - only show on client routes (root folder)
  if (pathname.includes('/(admin)') || pathname.includes('/admin/') || pathname.includes('/meeting-area/') || pathname.includes('/meeting/')) {
    return null;
  }

  // Count unread messages (messages from the target user that are newer than last seen)
  const unreadCount = 0; // You can implement unread logic later if needed

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={toggleChatBox}
          className={`relative group transition-all duration-300 ${
            isOpen ? 'scale-95 opacity-75' : 'scale-100 opacity-100 hover:scale-110'
          }`}
        >
          {/* Outer glow ring */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          
          {/* Main button circle */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-2xl flex items-center justify-center border-2 border-green-400/30 group-hover:border-green-400/50 transition-all duration-300">
            {/* Background pattern */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent"></div>
            
            {/* Icon container */}
            <div className="relative bg-white/90 rounded-lg p-2 sm:p-2.5 shadow-lg group-hover:bg-white transition-colors duration-300">
              <div className="flex items-center justify-center">
                {/* Chat icon with users */}
                <div className="relative">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 fill-green-100" />
                  <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600 absolute -top-0.5 -right-0.5" />
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

          {/* Tooltip - Hidden on mobile */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden sm:block">
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
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 sm:hidden transition-opacity duration-300"
          onClick={toggleChatBox}
        />
      )}
    </>
  );
}

export default FloatingChatButton;
