
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

function ChatContainer() {
  const {
    selectedUser,
    messages,
    isMessagesLoading,
    getMessagesByUserId,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChat();
  const { user: authUser, socket } = useAuth();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load messages when user is first selected
  useEffect(() => {
    if (selectedUser?._id) {
      getMessagesByUserId(selectedUser._id);
    }
  }, [selectedUser?._id, getMessagesByUserId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (selectedUser?._id) {
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [selectedUser?._id, subscribeToMessages, unsubscribeFromMessages]);

  // Listen for typing indicators
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === selectedUser._id) {
        setIsUserTyping(data.isTyping);
        
        // Clear existing timeout
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }
        
        // If user is typing, set a timeout to hide the indicator
        if (data.isTyping) {
          const timeout = setTimeout(() => {
            setIsUserTyping(false);
          }, 3000); // Hide after 3 seconds of no typing
          setTypingTimeout(timeout);
        }
      }
    };

    socket.on('userTyping', handleUserTyping);

    return () => {
      socket.off('userTyping', handleUserTyping);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [socket, selectedUser, typingTimeout]);

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
      <div className="flex-1 px-2 sm:px-4 md:px-6 overflow-y-auto scrollbar-hide py-4 md:py-8">
        {isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : messages.length > 0 ? (
          <div className="w-full max-w-4xl mx-auto space-y-4 p-4 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-800/5 to-transparent pointer-events-none" />
            
            {messages.map((msg, index) => {
              const isMyMessage = msg.senderId?.toString() === authUser?.userId?.toString();
              const isFirstInGroup = index === 0 || messages[index - 1]?.senderId !== msg.senderId;
              const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.senderId !== msg.senderId;
              const uniqueKey = msg.isOptimistic ? `optimistic-${msg._id}` : `${msg._id}-${index}`;
              
              return (
                <div
                  key={uniqueKey}
                  className={`flex ${isMyMessage ? "justify-end" : "justify-start"} group relative`}
                >
                  <div
                    className={`relative max-w-[75%] md:max-w-[65%] ${
                      isMyMessage ? "ml-12" : "mr-12"
                    } transform transition-all duration-200 hover:scale-[1.02] ${
                      msg.isOptimistic ? "animate-pulse" : ""
                    }`}
                  >
                    <div
                      className={`absolute inset-0 rounded-2xl blur-sm opacity-20 ${
                        isMyMessage
                          ? "bg-gradient-to-r from-cyan-400 to-blue-500"
                          : "bg-gradient-to-r from-slate-400 to-slate-600"
                      }`}
                    />
                    <div
                      className={`relative rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm border ${
                        isMyMessage
                          ? "bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 text-white border-cyan-400/20 rounded-br-md shadow-cyan-500/25"
                          : "bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-slate-100 border-slate-500/20 rounded-bl-md shadow-slate-500/25"
                      } ${isFirstInGroup ? "mt-3" : ""} ${isLastInGroup ? "mb-2" : ""}`}
                    >
                      <div
                        className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                          isMyMessage
                            ? "-right-1 bg-gradient-to-br from-cyan-500 to-blue-600"
                            : "-left-1 bg-gradient-to-br from-slate-600 to-slate-700"
                        }`}
                      />
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
                      {msg.text && (
                        <p className="text-sm md:text-base leading-relaxed break-words font-medium">
                          {msg.text}
                        </p>
                      )}
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
                  <div className={`absolute z-50 ${
                    isMyMessage 
                      ? "right-0 -translate-x-full -mr-3" 
                      : "left-0 translate-x-full ml-3"
                  } top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform group-hover:scale-100 scale-95`}>
                    <div className="relative">
                      <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 ${
                        isMyMessage ? "-right-1" : "-left-1"
                      }`} />
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
            {isUserTyping && (
              <div className="flex justify-start group relative animate-fade-in">
                <div className="relative max-w-[75%] md:max-w-[65%] mr-12 transform transition-all duration-200">
                  <div className="absolute inset-0 rounded-2xl blur-sm opacity-20 bg-gradient-to-r from-slate-400 to-slate-600" />
                  <div className="relative rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm border bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-slate-100 border-slate-500/20 rounded-bl-md shadow-slate-500/25">
                    <div className="absolute top-4 w-3 h-3 transform rotate-45 -left-1 bg-gradient-to-br from-slate-600 to-slate-700" />
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-slate-300">
                        {selectedUser.firstName || selectedUser.email.split('@')[0]} is typing
                      </span>
                      <div className="flex space-x-1 ml-2">
                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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