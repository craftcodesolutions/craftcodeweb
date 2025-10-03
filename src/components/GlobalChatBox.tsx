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
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-2xl z-50 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/50 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src={targetUser?.profileImage || "/avatar.png"}
              alt={displayName}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
          </div>
          <div>
            <h3 className="text-slate-200 font-medium text-sm">{displayName}</h3>
            <p className="text-slate-400 text-xs">Online</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded"
          >
            {isSoundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeOff className="w-4 h-4" />
            )}
          </button>
          
          {/* Minimize */}
          <button
            onClick={closeChatBox}
            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          
          {/* Close */}
          <button
            onClick={closeChatBox}
            className="p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {isMessagesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMyMessage = msg.senderId?.toString() === authUser?.userId?.toString();
              
              return (
                <div
                  key={msg._id}
                  className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative max-w-[80%] ${
                      msg.isOptimistic ? "animate-pulse" : ""
                    }`}
                  >
                    {/* Message bubble */}
                    <div
                      className={`rounded-2xl px-3 py-2 shadow-lg ${
                        isMyMessage
                          ? "bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 text-white rounded-br-md"
                          : "bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-slate-100 rounded-bl-md"
                      }`}
                    >
                      {/* Image */}
                      {msg.image && (
                        <div className="mb-2">
                          <img 
                            src={msg.image} 
                            alt="Shared" 
                            className="rounded-lg max-w-full max-h-32 w-auto h-auto object-cover" 
                          />
                        </div>
                      )}
                      
                      {/* Message text */}
                      {msg.text && (
                        <p className="text-sm leading-relaxed break-words">
                          {msg.text}
                        </p>
                      )}
                      
                      {/* Timestamp */}
                      <div className={`flex items-center justify-end mt-1 ${
                        isMyMessage ? "text-cyan-100/80" : "text-slate-400/80"
                      }`}>
                        <span className="text-xs">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('en-US', {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          }) : 'Sending...'}
                        </span>
                        {isMyMessage && (
                          <div className="ml-1">
                            {msg.isOptimistic ? (
                              <div className="w-2 h-2 border border-current rounded-full animate-spin border-t-transparent" />
                            ) : (
                              <div className="flex space-x-0.5">
                                <div className="w-1 h-1 bg-current rounded-full opacity-60" />
                                <div className="w-1 h-1 bg-current rounded-full" />
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
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
              <Image
                src={targetUser?.profileImage || "/avatar.png"}
                alt={displayName}
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <h3 className="text-slate-200 font-medium mb-2">Start a conversation</h3>
            <p className="text-slate-400 text-sm">
              Send a message to {displayName}
            </p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <GlobalMessageInput />
    </div>
  );
}

export default GlobalChatBox;
