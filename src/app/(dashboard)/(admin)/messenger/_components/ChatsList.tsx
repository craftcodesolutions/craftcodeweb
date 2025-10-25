"use client";

import { useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import Image from "next/image";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, getAllContacts } = useChat();
  const { onlineUsers } = useAuth();

  useEffect(() => {
    // Get both regular chats and guest chats
    getMyChatPartners();
    getAllContacts();
  }, [getMyChatPartners, getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => {
        // Get the other participant from the chat
        const otherParticipant = chat.participants?.[0] || chat;
        
        // Handle guest users differently
        const isGuestUser = otherParticipant.isGuest || otherParticipant._id.startsWith('guest_');
        
        const displayName = isGuestUser
          ? `Guest ${otherParticipant.firstName || otherParticipant.email || otherParticipant._id.substring(6, 12)}`
          : otherParticipant.firstName 
            ? `${otherParticipant.firstName} ${otherParticipant.lastName || ''}`.trim()
            : (otherParticipant.email || otherParticipant._id);

        const isOnline = onlineUsers?.includes(otherParticipant._id) || false;

        const handleChatSelect = () => {
          setSelectedUser({
            ...otherParticipant,
            isGuest: isGuestUser
          });
        };

        return (
          <div
            key={chat._id}
            className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
            onClick={handleChatSelect}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`size-12 rounded-full overflow-hidden border-2 ${
                  isGuestUser ? 'border-purple-500' : 'border-slate-600'
                }`}>
                  <Image 
                    src={isGuestUser ? "/icons/guest-avatar.png" : (otherParticipant.profileImage || "/avatar.png")}
                    alt={displayName}
                    width={48}
                    height={48}
                    className={`rounded-full object-cover ${isGuestUser ? 'bg-purple-500/20' : ''}`}
                  />
                </div>
                {/* Online status indicator */}
                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-slate-800 transition-all duration-300 ${
                  isOnline 
                    ? "bg-green-500 shadow-green-500/50 shadow-lg" 
                    : "bg-slate-500"
                }`}>
                  {isOnline && (
                    <div className="w-full h-full rounded-full bg-green-400 animate-pulse" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-slate-200 font-medium truncate">{displayName}</h4>
                  {isOnline && (
                    <span className="text-xs text-green-400 font-medium">Online</span>
                  )}
                </div>
                {chat.lastMessage && (
                  <div className="flex items-center gap-1">
                    {isGuestUser && chat.lastMessage.isGuestMessage && (
                      <span className="text-xs bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">Guest</span>
                    )}
                    <p className="text-slate-400 text-sm truncate">
                      {chat.lastMessage.text || (chat.lastMessage.image ? "📷 Image" : "Message")}
                    </p>
                  </div>
                )}
                {chat.lastMessage && chat.lastMessage.createdAt && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      {new Date(chat.lastMessage.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {isGuestUser && (
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">Guest Chat</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default ChatsList;
