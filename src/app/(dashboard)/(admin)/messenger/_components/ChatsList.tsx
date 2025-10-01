"use client";

import { useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import Image from "next/image";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser } = useChat();
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
        const isOnline = onlineUsers.includes(otherParticipant._id);

        return (
          <div
            key={chat._id}
            className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
            onClick={() => setSelectedUser(otherParticipant)}
          >
            <div className="flex items-center gap-3">
              <div className={`avatar ${isOnline ? "online" : "offline"}`}>
                <div className="size-12 rounded-full">
                  <Image 
                    src={otherParticipant.profileImage || "/avatar.png"} 
                    alt={displayName}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-slate-200 font-medium truncate">{displayName}</h4>
                {chat.lastMessage && (
                  <p className="text-slate-400 text-sm truncate">
                    {chat.lastMessage.text || (chat.lastMessage.image ? "📷 Image" : "Message")}
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
