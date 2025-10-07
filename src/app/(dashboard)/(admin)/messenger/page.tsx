"use client";

import { useChat } from "@/context/ChatContext";
import BorderAnimatedContainer from "./_components/BorderAnimatedContainer";
import ProfileHeader from "./_components/ProfileHeader";
import ActiveTabSwitch from "./_components/ActiveTabSwitch";
import ChatsList from "./_components/ChatsList";
import AllContactsList from "./_components/AllContactsList";
import ChatContainer from "./_components/ChatContainer";
import NoConversationPlaceholder from "./_components/NoConversationPlaceholder";


function ChatPage() {
  const { activeTab, selectedUser } = useChat();

  return (
    <div className="w-full max-w-6xl h-[75vh] md:h-[70vh] lg:h-[600px] mx-auto p-4">
      <BorderAnimatedContainer>
        {/* LEFT SIDE */}
        <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 bg-slate-800/50 backdrop-blur-sm flex-col`}>
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {activeTab === "chats" && (
              <div className="p-4 space-y-2">
                <ChatsList />
              </div>
            )}
            {activeTab === "contacts" && <AllContactsList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className={`${selectedUser ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-slate-900/50 backdrop-blur-sm`}>
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
      

    </div>
  );
}

export default ChatPage;
