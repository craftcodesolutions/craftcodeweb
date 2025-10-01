"use client";

import { useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import Image from "next/image";

function ContactList() {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } = useChat();
  const { onlineUsers } = useAuth();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => {
        const displayName = contact.firstName 
          ? `${contact.firstName} ${contact.lastName || ''}`.trim()
          : contact.email;
        const isOnline = onlineUsers.includes(contact._id);

        return (
          <div
            key={contact._id}
            className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
            onClick={() => setSelectedUser(contact)}
          >
            <div className="flex items-center gap-3">
              <div className={`avatar ${isOnline ? "online" : "offline"}`}>
                <div className="size-12 rounded-full">
                  <Image 
                    src={contact.profileImage || "/avatar.png"} 
                    alt={displayName}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                </div>
              </div>
              <h4 className="text-slate-200 font-medium">{displayName}</h4>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default ContactList;
