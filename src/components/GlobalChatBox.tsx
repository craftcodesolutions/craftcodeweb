/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import { X, Minimize2, VolumeOff, Volume2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useGlobalChat } from "@/context/GlobalChatContext";
import GlobalMessageInput from "@/components/GlobalMessageInput";
import Image from "next/image";

function GlobalChatBox() {
  const {
    isOpen,
    messages,
    targetUser,
    isMessagesLoading,
    isSoundEnabled,
    closeChatBox,
    toggleSound,
  } = useGlobalChat();
  const { user: authUser } = useAuth();
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!isOpen) return null;

  const displayName = targetUser?.firstName 
    ? `${targetUser.firstName} ${targetUser.lastName || ''}`.trim()
    : targetUser?.email || 'Support';

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-md border border-slate-700/30 rounded-xl shadow-2xl shadow-black/50 z-50 flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-700/30 flex items-center justify-between bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400/30 shadow-lg">
              <Image
                src={targetUser?.profileImage || "/avatar.png"}
                alt={displayName}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full shadow-lg">
              <div className="w-full h-full rounded-full bg-green-400 animate-pulse"></div>
            </div>
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold text-sm">{displayName}</h3>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-green-400 text-xs font-medium">Online</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 rounded-lg group cursor-pointer"
            title={isSoundEnabled ? "Mute notifications" : "Enable notifications"}
          >
            {isSoundEnabled ? (
              <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            ) : (
              <VolumeOff className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
          </button>
          
          {/* Minimize */}
          <button
            onClick={closeChatBox}
            className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all duration-200 rounded-lg group cursor-pointer"
            title="Minimize chat"
          >
            <Minimize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
          
          {/* Close */}
          <button
            onClick={closeChatBox}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 rounded-lg group cursor-pointer"
            title="Close chat"
          >
            <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 bg-gradient-to-b from-transparent to-slate-900/20">
        {isMessagesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full shadow-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg w-3/4 shadow-sm"></div>
                    <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg w-1/2 shadow-sm"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isMyMessage = msg.senderId?.toString() === authUser?.userId?.toString();
              const uniqueKey = msg.isOptimistic ? `optimistic-${msg._id}` : `${msg._id}-${index}`;
              
              return (
                <div
                  key={uniqueKey}
                  className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative max-w-[80%] ${
                      msg.isOptimistic ? "animate-pulse" : ""
                    }`}
                  >
                    {/* Message bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-xl backdrop-blur-sm border ${
                        isMyMessage
                          ? "bg-gradient-to-br from-cyan-600 via-cyan-500 to-blue-600 text-white rounded-br-md border-cyan-400/20 shadow-cyan-500/25"
                          : "bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 text-slate-100 rounded-bl-md border-slate-500/20 shadow-slate-500/25"
                      }`}
                    >
                      {/* Message tail */}
                      <div
                        className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                          isMyMessage
                            ? "-right-1 bg-gradient-to-br from-cyan-500 to-blue-600"
                            : "-left-1 bg-gradient-to-br from-slate-600 to-slate-700"
                        }`}
                      />
                      {/* Image */}
                      {msg.image && (
                        <div className="mb-3 group/image relative">
                          <img 
                            src={msg.image} 
                            alt="Shared" 
                            className="rounded-xl max-w-full max-h-32 w-auto h-auto object-cover shadow-lg border border-white/10 group-hover/image:scale-105 transition-transform duration-200 cursor-pointer" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover/image:opacity-100 transition-opacity duration-200" />
                        </div>
                      )}
                      
                      {/* Message text */}
                      {msg.text && (
                        <p className="text-sm leading-relaxed break-words font-medium">
                          {msg.text}
                        </p>
                      )}
                      
                      {/* Timestamp */}
                      <div className={`flex items-center justify-end mt-2 ${
                        isMyMessage ? "text-cyan-100/70" : "text-slate-400/70"
                      }`}>
                        <span className="text-xs font-medium">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('en-US', {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          }) : 'Sending...'}
                        </span>
                        {isMyMessage && (
                          <div className="ml-2">
                            {msg.isOptimistic ? (
                              <div className="w-3 h-3 border-2 border-current rounded-full animate-spin border-t-transparent" />
                            ) : (
                              <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-current rounded-full opacity-60" />
                                <div className="w-1.5 h-1.5 bg-current rounded-full" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex items-center justify-center shadow-2xl border-2 border-slate-600/50">
                <Image
                  src={targetUser?.profileImage || "/avatar.png"}
                  alt={displayName}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-slate-900 rounded-full shadow-lg">
                <div className="w-full h-full rounded-full bg-green-400 animate-pulse"></div>
              </div>
            </div>
            <h3 className="text-slate-100 font-semibold text-lg mb-2">Start a conversation</h3>
            <p className="text-slate-400 text-sm px-4">
              Send a message to <span className="text-cyan-400 font-medium">{displayName}</span>
            </p>
            <div className="mt-4 px-6 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full cursor-default">
              <p className="text-cyan-400 text-xs font-medium">Type a message below to get started</p>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-slate-700/30 bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-sm">
        <GlobalMessageInput />
      </div>
    </div>
  );
}

export default GlobalChatBox;