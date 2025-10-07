"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import useKeyboardSound from "./hooks/useKeyboardSound";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";
import Image from "next/image";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { sendMessage, isSoundEnabled, selectedUser } = useChat();
  const { socket, isSocketConnected } = useAuth();

  // Send typing indicator via Socket.IO
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (socket && selectedUser && isSocketConnected) {
      socket.emit('typing', {
        receiverId: selectedUser._id,
        isTyping,
      });
    }
  }, [socket, selectedUser, isSocketConnected]);

  // Handle typing indicator with debounce
  const handleTypingIndicator = useCallback(() => {
    if (!selectedUser) return;

    // Send typing start
    sendTypingIndicator(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to send typing stop
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 2000); // Stop typing indicator after 2 seconds of inactivity
  }, [sendTypingIndicator, selectedUser]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Send typing stop when component unmounts
      if (socket && selectedUser) {
        socket.emit('typing', {
          receiverId: selectedUser._id,
          isTyping: false,
        });
      }
    };
  }, [socket, selectedUser]);

  // Enable audio context on first user interaction
  const enableAudio = () => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      const audioContext = new (window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    sendMessage({
      text: text.trim(),
      image: imagePreview || undefined,
    });
    
    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    // Stop typing indicator when message is sent
    sendTypingIndicator(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
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
    <div className="p-2 sm:p-3 md:p-4 border-t border-slate-700/50">
      {imagePreview && (
        <div className="w-full max-w-3xl mx-auto mb-2 md:mb-3 flex items-center">
          <div className="relative">
            <Image
              src={imagePreview}
              alt="Preview"
              width={80}
              height={80}
              className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-slate-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700 cursor-pointer"
              type="button"
            >
              <XIcon className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="w-full max-w-3xl mx-auto flex space-x-2 md:space-x-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              // Send typing indicator when user types
              handleTypingIndicator();
            }}
            onKeyDown={(e) => {
              // Enable audio on first interaction
              enableAudio();
              
              // Only trigger effects for actual typing keys
              if (e.key !== 'Tab' && e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Meta') {
                // Visual typing effect
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 150);
                
                // Play keyboard sound using the hook
                if (isSoundEnabled) {
                  playRandomKeyStrokeSound();
                }
              }
            }}
            onClick={enableAudio}
            className={`w-full bg-slate-800/50 border rounded-lg py-2 px-4 text-slate-200 placeholder-slate-400 transition-all duration-150 ${
              isTyping 
                ? "border-cyan-400/60 shadow-lg shadow-cyan-500/25 bg-slate-800/70" 
                : "border-slate-700/50 hover:border-slate-600/50"
            }`}
            placeholder="Type your message..."
          />
          
          {/* Typing visual indicator */}
          {isTyping && (
            <div className="absolute inset-0 rounded-lg border-2 border-cyan-400/40 animate-pulse pointer-events-none" />
          )}
          
          {/* Sound wave animation */}
          {isTyping && isSoundEnabled && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 pointer-events-none">
              <div className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
              <div className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            </div>
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
          className="p-2 md:p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors cursor-pointer"
        >
          <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="p-2 md:p-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
