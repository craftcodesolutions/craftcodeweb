"use client";

import { useEffect, useState } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import Image from "next/image";
import { Contact } from "@/lib/contacts";
import { Search, Crown, Users } from "lucide-react";

function AllContactsList() {
  const { getAllContacts, allContacts, setSelectedUser, getMessagesByUserId, isUsersLoading, chats } = useChat();
  const { onlineUsers } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  // Also load chats to determine existing conversations
  useEffect(() => {
    if (chats.length === 0) {
      // Chats might not be loaded yet, this is handled by the parent component
    }
  }, [chats]);

  // Filter contacts based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredContacts(allContacts);
    } else {
      const filtered = allContacts.filter((contact) => {
        const displayName = contact.firstName
          ? `${contact.firstName} ${contact.lastName || ""}`.trim()
          : contact.email;
        return (
          displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredContacts(filtered);
    }
  }, [allContacts, searchTerm]);

  const handleContactSelect = async (contact: Contact) => {
    setSelectedUser(contact);
    // Load messages for this contact
    await getMessagesByUserId(contact._id);
  };

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Contacts Count */}
      <div className="px-4 py-2 border-b border-slate-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users className="w-3 h-3" />
            <span>{filteredContacts.length} contacts available</span>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-slate-400 mb-2">
              {searchTerm ? "No contacts found" : "No contacts available"}
            </div>
            {searchTerm && (
              <p className="text-xs text-slate-500">
                Try adjusting your search terms
              </p>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredContacts.map((contact) => {
              const displayName = contact.firstName
                ? `${contact.firstName} ${contact.lastName || ""}`.trim()
                : contact.email;
              const isOnline = onlineUsers?.includes(contact._id) || false;
              
              // Check if this contact has an existing chat
              const hasExistingChat = chats?.some(chat => 
                chat.participants?.some(participant => participant._id === contact._id)
              ) || false;

              return (
                <div
                  key={contact._id}
                  className="group bg-slate-800/30 hover:bg-cyan-500/10 p-3 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-cyan-500/20"
                  onClick={() => handleContactSelect(contact)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="size-10 rounded-full overflow-hidden border-2 border-slate-600">
                        <Image
                          src={contact.profileImage || "/avatar.png"}
                          alt={displayName}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      </div>
                      {/* Online status indicator */}
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800 transition-all duration-300 ${
                          isOnline
                            ? "bg-green-500 shadow-green-500/50 shadow-sm"
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
                        <h4 className="text-slate-200 font-medium truncate text-sm">
                          {displayName}
                        </h4>
                        {contact.isAdmin && (
                          <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                        )}
                        {isOnline && (
                          <span className="text-xs text-green-400 font-medium">Online</span>
                        )}
                        {hasExistingChat && (
                          <span className="text-xs text-cyan-400 font-medium">Active Chat</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{contact.email}</p>
                    </div>

                    {/* Start Chat Button */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContactSelect(contact);
                        }}
                        className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 transition-colors"
                      >
                        {hasExistingChat ? "Open" : "Chat"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllContactsList;
