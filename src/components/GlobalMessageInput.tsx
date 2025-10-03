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
    <div className="p-3 border-t border-slate-700/50 bg-slate-800/30">
      {imagePreview && (
        <div className="mb-2 flex items-center">
          <div className="relative">
            <Image
              src={imagePreview}
              alt="Preview"
              width={60}
              height={60}
              className="w-15 h-15 object-cover rounded-lg border border-slate-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
              type="button"
            >
              <XIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex space-x-2">
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
            className={`w-full bg-slate-800/50 border rounded-lg py-2 px-3 text-slate-200 placeholder-slate-400 text-sm transition-all duration-150 ${
              isTyping 
                ? "border-cyan-400/60 shadow-lg shadow-cyan-500/25 bg-slate-800/70" 
                : "border-slate-700/50 hover:border-slate-600/50"
            }`}
            placeholder="Type your message..."
          />
          
          {isTyping && (
            <div className="absolute inset-0 rounded-lg border border-cyan-400/40 animate-pulse pointer-events-none" />
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
          className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="p-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default GlobalMessageInput;
