"use client";

import { useState, useRef } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import Image from "next/image";

const mouseClickSound = typeof Audio !== 'undefined' ? new Audio("/sounds/mouse-click.mp3") : null;

function ProfileHeader() {
  const { logout, user: authUser, updateProfile } = useAuth();
  const { isSoundEnabled, toggleSound } = useChat();
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      setSelectedImg(base64Image);
      await updateProfile({ profileImage: base64Image });
    };
  };

  if (!authUser) return null;

  const displayName = authUser.firstName 
    ? `${authUser.firstName} ${authUser.lastName || ''}`.trim()
    : authUser.email;

  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div className="avatar online">
            <button
              className="size-14 rounded-full overflow-hidden relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image
                src={selectedImg || authUser.profileImage || "/avatar.png"}
                alt="User image"
                width={56}
                height={56}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs">Change</span>
              </div>
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* USERNAME & ONLINE TEXT */}
          <div>
            <h3 className="text-slate-200 font-medium text-base max-w-[180px] truncate">
              {displayName}
            </h3>
            <p className="text-slate-400 text-xs">Online</p>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 items-center">
          {/* LOGOUT BTN */}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            onClick={logout}
          >
            <LogOutIcon className="size-5" />
          </button>

          {/* SOUND TOGGLE BTN */}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            onClick={() => {
              if (mouseClickSound) {
                // play click sound before toggling
                mouseClickSound.currentTime = 0; // reset to start
                mouseClickSound.play().catch((error) => console.log("Audio play failed:", error));
              }
              toggleSound();
            }}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
