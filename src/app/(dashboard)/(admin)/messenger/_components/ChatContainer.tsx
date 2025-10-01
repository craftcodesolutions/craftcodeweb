/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChat();
  const { user: authUser } = useAuth();
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessagesByUserId(selectedUser._id);
      subscribeToMessages();

      // clean up
      return () => unsubscribeFromMessages();
    }
  }, [selectedUser?._id, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!selectedUser) {
    return null;
  }

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-2 sm:px-4 md:px-6 overflow-y-auto py-4 md:py-8">
        {isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : messages.length > 0 ? (
          <div className="w-full max-w-4xl mx-auto space-y-4 p-4 relative">
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-800/5 to-transparent pointer-events-none" />
            
            {messages.map((msg, index) => {
              const isMyMessage = msg.senderId?.toString() === authUser?.userId?.toString();
              const isFirstInGroup = index === 0 || messages[index - 1]?.senderId !== msg.senderId;
              const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.senderId !== msg.senderId;
              
              return (
                <div
                  key={msg._id}
                  className={`flex ${isMyMessage ? "justify-end" : "justify-start"} group relative`}
                >
                  {/* Message bubble with enhanced styling */}
                  <div
                    className={`relative max-w-[75%] md:max-w-[65%] ${
                      isMyMessage ? "ml-12" : "mr-12"
                    } transform transition-all duration-200 hover:scale-[1.02] ${
                      msg.isOptimistic ? "animate-pulse" : ""
                    }`}
                  >
                    {/* Decorative glow effect */}
                    <div
                      className={`absolute inset-0 rounded-2xl blur-sm opacity-20 ${
                        isMyMessage
                          ? "bg-gradient-to-r from-cyan-400 to-blue-500"
                          : "bg-gradient-to-r from-slate-400 to-slate-600"
                      }`}
                    />
                    
                    {/* Main message bubble */}
                    <div
                      className={`relative rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm border ${
                        isMyMessage
                          ? "bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 text-white border-cyan-400/20 rounded-br-md shadow-cyan-500/25"
                          : "bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-slate-100 border-slate-500/20 rounded-bl-md shadow-slate-500/25"
                      } ${isFirstInGroup ? "mt-3" : ""} ${isLastInGroup ? "mb-2" : ""}`}
                    >
                      {/* Message tail */}
                      <div
                        className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                          isMyMessage
                            ? "-right-1 bg-gradient-to-br from-cyan-500 to-blue-600"
                            : "-left-1 bg-gradient-to-br from-slate-600 to-slate-700"
                        }`}
                      />
                      
                      {/* Image with enhanced styling */}
                      {msg.image && (
                        <div className="relative mb-3 group/image">
                          <img 
                            src={msg.image} 
                            alt="Shared" 
                            className="rounded-xl max-w-full max-h-48 md:max-h-64 w-auto h-auto object-cover shadow-lg border border-white/10 transition-transform duration-200 group-hover/image:scale-105" 
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-200" />
                        </div>
                      )}
                      
                      {/* Message text with enhanced typography */}
                      {msg.text && (
                        <p className="text-sm md:text-base leading-relaxed break-words font-medium">
                          {msg.text}
                        </p>
                      )}
                      
                      {/* Enhanced timestamp with icons */}
                      <div className={`flex items-center justify-end mt-2 space-x-1 ${
                        isMyMessage ? "text-cyan-100/80" : "text-slate-400/80"
                      }`}>
                        <span className="text-xs font-medium">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          }) : 'Sending...'}
                        </span>
                        {isMyMessage && (
                          <div className="flex space-x-0.5">
                            {msg.isOptimistic ? (
                              <div className="w-3 h-3 border border-current rounded-full animate-spin border-t-transparent" />
                            ) : (
                              <>
                                <div className="w-1 h-1 bg-current rounded-full opacity-60" />
                                <div className="w-1 h-1 bg-current rounded-full" />
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover timestamp tooltip with fixed positioning */}
                  <div className={`absolute z-50 ${
                    isMyMessage 
                      ? "right-0 -translate-x-full -mr-3" 
                      : "left-0 translate-x-full ml-3"
                  } top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform group-hover:scale-100 scale-95`}>
                    <div className="relative">
                      {/* Tooltip arrow */}
                      <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 ${
                        isMyMessage ? "-right-1" : "-left-1"
                      }`} />
                      
                      {/* Tooltip content */}
                      <div className="bg-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap backdrop-blur-sm">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Sending...'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.firstName || selectedUser.email} />
        )}
      </div>

      <MessageInput />
    </>
  );
}

export default ChatContainer;
