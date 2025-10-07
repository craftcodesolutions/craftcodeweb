"use client";

import { useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import Image from "next/image";
import { Contact } from "@/lib/contacts";

function ContactList() {
  const { getMyChatPartners, chats, setSelectedUser, isUsersLoading } = useChat();
  const { onlineUsers } = useAuth();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {chats.map((chat) => {
        // Assuming each chat has a single other participant (the contact)
        const contact: Contact = chat.participants.find(
          (participant) => participant._id !== chat._id
        ) || chat.participants[0];
        const displayName = contact.firstName
          ? `${contact.firstName} ${contact.lastName || ""}`.trim()
          : contact.email;
        const isOnline = onlineUsers?.includes(contact._id) || false;

        return (
          <div
            key={contact._id}
            className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
            onClick={() => setSelectedUser(contact)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="size-12 rounded-full overflow-hidden border-2 border-slate-600">
                  <Image
                    src={contact.profileImage || "/avatar.png"}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                </div>
                {/* Online status indicator */}
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-slate-800 transition-all duration-300 ${
                    isOnline
                      ? "bg-green-500 shadow-green-500/50 shadow-lg"
                      : "bg-slate-500"
                  }`}
                >
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
                <p className="text-xs text-slate-400 truncate">{contact.email}</p>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default ContactList;