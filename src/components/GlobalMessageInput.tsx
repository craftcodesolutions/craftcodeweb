"use client";

import { useRef, useState } from "react";
import { useGlobalChat } from "@/context/GlobalChatContext";
import { toast } from "react-toastify";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";
import Image from "next/image";

function GlobalMessageInput() {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, isSoundEnabled } = useGlobalChat();

  // Simple keyboard sound effect
  const playKeySound = () => {
    if (!isSoundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800 + Math.random() * 300, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.08);
    } catch (error) {
      console.log("Audio failed:", error);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    
    if (isSoundEnabled) playKeySound();

    sendMessage({
      text: text.trim(),
      image: imagePreview || undefined,
    });
    
    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-3 sm:p-4">
      {imagePreview && (
        <div className="mb-2 sm:mb-3 flex items-center">
          <div className="relative">
            <Image
              src={imagePreview}
              alt="Preview"
              width={48}
              height={48}
              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-xl border-2 border-cyan-400/30 shadow-lg"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110 cursor-pointer"
              type="button"
            >
              <XIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-end gap-2 sm:gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Tab' && e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Meta') {
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 150);
                playKeySound();
              }
            }}
            className={`w-full bg-slate-800/60 backdrop-blur-sm border rounded-xl py-2.5 px-3 sm:py-3 sm:px-4 text-slate-200 placeholder-slate-400 text-xs sm:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
              isTyping 
                ? "border-cyan-400/60 shadow-lg shadow-cyan-500/20 bg-slate-800/80 scale-[1.02]" 
                : "border-slate-600/40 hover:border-slate-500/60 hover:bg-slate-800/70"
            }`}
            placeholder="Type your message..."
          />
          
          {isTyping && (
            <div className="absolute inset-0 rounded-xl border-2 border-cyan-400/30 animate-pulse pointer-events-none" />
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 sm:p-3 bg-slate-800/60 backdrop-blur-sm border border-slate-600/40 rounded-xl text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-slate-700/60 transition-all duration-200 hover:scale-105 group cursor-pointer"
          title="Attach image"
        >
          <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
        </button>

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="p-2.5 sm:p-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-600 disabled:text-slate-500 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 group cursor-pointer"
          title="Send message"
        >
          <SendIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
        </button>
      </form>
    </div>
  );
}

export default GlobalMessageInput;
