"use client";

import { useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import Image from "next/image";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, getMessagesByUserId } = useChat();
  const { onlineUsers } = useAuth();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => {
        // Get the other participant from the chat
        const otherParticipant = chat.participants?.[0] || chat;
        const displayName = otherParticipant.firstName 
          ? `${otherParticipant.firstName} ${otherParticipant.lastName || ''}`.trim()
          : otherParticipant.email;
        const isOnline = onlineUsers?.includes(otherParticipant._id) || false;

        const handleChatSelect = async () => {
          setSelectedUser(otherParticipant);
          // Load messages for this chat
          await getMessagesByUserId(otherParticipant._id);
        };

        return (
          <div
            key={chat._id}
            className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
            onClick={handleChatSelect}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="size-12 rounded-full overflow-hidden border-2 border-slate-600">
                  <Image 
                    src={otherParticipant.profileImage || "/avatar.png"} 
                    alt={displayName}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
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
                  <p className="text-slate-400 text-sm truncate">
                    {chat.lastMessage.text || (chat.lastMessage.image ? "📷 Image" : "Message")}
                  </p>
                )}
                {chat.lastMessage && chat.lastMessage.createdAt && (
                  <p className="text-xs text-slate-500">
                    {new Date(chat.lastMessage.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
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
