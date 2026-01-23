/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Minimize2, VolumeOff, Volume2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGlobalChat } from '@/context/GlobalChatContext';
import GlobalMessageInput from '@/components/GlobalMessageInput';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Smooth auto-scroll
  useEffect(() => {
    if (!isOpen) return;
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Don't show on admin routes or meeting area - only show on client routes (root folder)
  if (
    !isOpen ||
    pathname.includes('/(admin)') ||
    pathname.includes('/admin/') ||
    pathname.includes('/meeting-area/') ||
    pathname.includes('/meeting/')
  ) {
    return null;
  }

  const displayName = 'CraftCode Solutions';

  const overlayMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.18 },
  } as const;

  const chatMotion = {
    initial: { opacity: 0, y: 16, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 16, scale: 0.985 },
    transition: { type: 'spring', stiffness: 420, damping: 34, mass: 0.75 },
  } as const;

  const renderChat = () => {
    if (!mounted) return null;

    const node = (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop only on mobile (so it feels like a full screen overlay) */}
            <motion.div
              className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm sm:hidden"
              {...overlayMotion}
              aria-hidden="true"
              onClick={closeChatBox}
            />

            <motion.div
              className="
                fixed z-[9999]
                bottom-4 right-4
                w-80 sm:w-96
                h-[450px] sm:h-[500px]
                md:bottom-4 md:right-4
                max-sm:bottom-0 max-sm:right-0 max-sm:left-0
                max-sm:w-full max-sm:h-[100dvh]
                max-sm:rounded-none
                border border-slate-700/30 rounded-xl
                shadow-2xl shadow-black/50
                overflow-hidden
              "
              {...chatMotion}
              role="dialog"
              aria-modal="true"
              aria-label="Global chat"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 to-slate-800/95"></div>

              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(110,231,216,0.35),transparent_55%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_85%,rgba(30,90,168,0.25),transparent_55%)]"></div>
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2FD1C5]/60 to-transparent"></div>
              </div>

              <div className="relative z-10 flex flex-col h-full">
                {/* Chat Header */}
                <div className="p-3 sm:p-4 border-b border-slate-700/30 flex items-center justify-between bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-sm">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-cyan-400/30 shadow-lg">
                        <Image
                          src="/logo.png"
                          alt={displayName}
                          width={32}
                          height={32}
                          className="rounded-full object-cover sm:w-10 sm:h-10"
                        />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-slate-900 rounded-full shadow-lg">
                        <div className="w-full h-full rounded-full bg-green-400 animate-pulse"></div>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-slate-100 font-semibold text-sm truncate">{displayName}</h3>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <p className="text-green-400 text-xs font-medium">Online</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {/* Sound Toggle - Hidden on mobile */}
                    <button
                      onClick={toggleSound}
                      className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 rounded-lg group cursor-pointer hidden sm:block"
                      title={isSoundEnabled ? 'Mute notifications' : 'Enable notifications'}
                      aria-label={isSoundEnabled ? 'Mute notifications' : 'Enable notifications'}
                      type="button"
                    >
                      {isSoundEnabled ? (
                        <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      ) : (
                        <VolumeOff className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      )}
                    </button>

                    {/* Minimize - Hidden on mobile (still closes for now) */}
                    <button
                      onClick={closeChatBox}
                      className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all duration-200 rounded-lg group cursor-pointer hidden sm:block"
                      title="Minimize chat"
                      aria-label="Minimize chat"
                      type="button"
                    >
                      <Minimize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>

                    {/* Close - Always visible */}
                    <button
                      onClick={closeChatBox}
                      className="p-1.5 sm:p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 rounded-lg group cursor-pointer"
                      title="Close chat"
                      aria-label="Close chat"
                      type="button"
                    >
                      <X className="w-5 h-5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-3 sm:p-4 bg-gradient-to-b from-transparent to-slate-900/20">
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
                        const currentUserId = (authUser as any)?.userId;
                        const isMyMessage = msg.senderId?.toString() === currentUserId?.toString();
                        const uniqueKey = msg.isOptimistic ? `optimistic-${msg._id}` : `${msg._id}-${index}`;

                        return (
                          <div key={uniqueKey} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className={`relative max-w-[85%] sm:max-w-[80%] ${msg.isOptimistic ? 'animate-pulse' : ''}`}>
                              <div
                                className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-xl backdrop-blur-sm border ${
                                  isMyMessage
                                    ? 'bg-gradient-to-br from-cyan-600 via-cyan-500 to-blue-600 text-white rounded-br-md border-cyan-400/20 shadow-cyan-500/25'
                                    : 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 text-slate-100 rounded-bl-md border-slate-500/20 shadow-slate-500/25'
                                }`}
                              >
                                {/* Tail */}
                                <div
                                  className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                                    isMyMessage
                                      ? '-right-1 bg-gradient-to-br from-cyan-500 to-blue-600'
                                      : '-left-1 bg-gradient-to-br from-slate-600 to-slate-700'
                                  }`}
                                />

                                {msg.image && (
                                  <div className="mb-2 sm:mb-3 group/image relative">
                                    <img
                                      src={msg.image}
                                      alt="Shared"
                                      className="rounded-xl max-w-full max-h-24 sm:max-h-32 w-auto h-auto object-cover shadow-lg border border-white/10 group-hover/image:scale-105 transition-transform duration-200 cursor-pointer"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover/image:opacity-100 transition-opacity duration-200" />
                                  </div>
                                )}

                                {msg.text && (
                                  <p className="text-xs sm:text-sm leading-relaxed break-words font-medium">{msg.text}</p>
                                )}

                                <div
                                  className={`flex items-center justify-end mt-1 sm:mt-2 ${
                                    isMyMessage ? 'text-cyan-100/70' : 'text-slate-400/70'
                                  }`}
                                >
                                  <span className="text-[10px] sm:text-xs font-medium">
                                    {msg.createdAt
                                      ? new Date(msg.createdAt).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: false,
                                        })
                                      : 'Sending...'}
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
                      <div className="relative mb-4 sm:mb-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex items-center justify-center shadow-2xl border-2 border-slate-600/50">
                          <Image
                            src={targetUser?.profileImage || '/avatar.png'}
                            alt={displayName}
                            width={40}
                            height={40}
                            className="rounded-full object-cover sm:w-12 sm:h-12"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 border-3 border-slate-900 rounded-full shadow-lg">
                          <div className="w-full h-full rounded-full bg-green-400 animate-pulse"></div>
                        </div>
                      </div>

                      <h3 className="text-slate-100 font-semibold text-base sm:text-lg mb-2">Start a conversation</h3>
                      <p className="text-slate-400 text-xs sm:text-sm px-2 sm:px-4">
                        Get in touch with <span className="text-cyan-400 font-medium">{displayName}</span>
                      </p>
                      <div className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full cursor-default">
                        <p className="text-cyan-400 text-[10px] sm:text-xs font-medium">We&apos;re here to help you!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t border-slate-700/30 bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-sm">
                  <GlobalMessageInput />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );

    return createPortal(node, document.body);
  };

  return <>{renderChat()}</>;
}

export default GlobalChatBox;
