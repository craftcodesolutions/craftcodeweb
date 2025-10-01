"use client";

import { useChat } from "@/context/ChatContext";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChat();

  return (
    <div className="p-4 border-b border-slate-700/50">
      <div className="flex bg-slate-800/50 rounded-lg p-1 gap-1">
        <button
          onClick={() => setActiveTab("chats")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
            activeTab === "chats" 
              ? "bg-cyan-500/20 text-cyan-400 shadow-sm" 
              : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/30"
          }`}
        >
          Chats
        </button>

        <button
          onClick={() => setActiveTab("contacts")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
            activeTab === "contacts" 
              ? "bg-cyan-500/20 text-cyan-400 shadow-sm" 
              : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/30"
          }`}
        >
          Contacts
        </button>
      </div>
    </div>
  );
}

export default ActiveTabSwitch;
