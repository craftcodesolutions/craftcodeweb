"use client";

import { XIcon } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import Image from "next/image";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChat();
  const { onlineUsers } = useAuth();

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);
  const displayName = selectedUser.firstName 
    ? `${selectedUser.firstName} ${selectedUser.lastName || ''}`.trim()
    : selectedUser.email;

  return (
    <div
      className="flex justify-between items-center bg-slate-800/50 border-b
   border-slate-700/50 max-h-[84px] px-6 flex-1"
    >
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => setSelectedUser(null)} 
          className="md:hidden mr-2 p-2 hover:bg-slate-700/50 rounded-full cursor-pointer"
        >
          <XIcon className="w-6 h-6" />
        </button>
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-12 rounded-full">
            <Image 
              src={selectedUser.profileImage || "/avatar.png"} 
              alt={displayName}
              width={48}
              height={48}
              className="rounded-full"
            />
          </div>
        </div>

        <div>
          <h3 className="text-slate-200 font-medium">{displayName}</h3>
          <p className="text-slate-400 text-sm">{isOnline ? "Online" : "Offline"}</p>
        </div>
      </div>

      <button onClick={() => setSelectedUser(null)}>
        <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
      </button>
    </div>
  );
}

export default ChatHeader;
