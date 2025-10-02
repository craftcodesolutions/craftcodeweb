'use client';
import { useState, useEffect } from 'react';
import { CameraOff, Mic, MicOff, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface CameraOffDisplayProps {
  participantName?: string;
  isCurrentUser?: boolean;
  isMuted?: boolean;
  avatar?: string;
  className?: string;
  isConnected?: boolean;
  isSpeaking?: boolean;
}

const CameraOffDisplay = ({ 
  participantName = "Unknown User", 
  isCurrentUser = false,
  isMuted = false,
  avatar,
  className,
  isConnected = true,
  isSpeaking = false
}: CameraOffDisplayProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTransition, setShowTransition] = useState(true);

  useEffect(() => {
    // Initial transition animation
    const initialTimer = setTimeout(() => {
      setShowTransition(false);
    }, 500);

    // Periodic subtle animation
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 4000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate a consistent color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-500 to-blue-700',
      'from-purple-500 to-purple-700', 
      'from-green-500 to-green-700',
      'from-orange-500 to-orange-700',
      'from-pink-500 to-pink-700',
      'from-indigo-500 to-indigo-700',
      'from-teal-500 to-teal-700',
      'from-emerald-500 to-emerald-700',
      'from-cyan-500 to-cyan-700',
      'from-violet-500 to-violet-700'
    ];
    
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={cn(
      "relative flex flex-col items-center justify-center bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-xl rounded-2xl border shadow-2xl transition-all duration-700 ease-in-out transform",
      isCurrentUser && "ring-2 ring-blue-400/60 shadow-blue-500/20",
      isSpeaking && "ring-2 ring-green-400/60 shadow-green-500/20",
      !isConnected && "ring-2 ring-red-400/60 shadow-red-500/20",
      showTransition ? "scale-95 opacity-0" : "scale-100 opacity-100",
      "border-white/20 hover:border-white/30",
      className
    )}>
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 to-slate-900/60 rounded-2xl"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/8 via-transparent to-transparent rounded-2xl"></div>
      
      {/* Speaking Animation Background */}
      {isSpeaking && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-2xl animate-pulse"></div>
      )}
      
      {/* Connection Status Background */}
      {!isConnected && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/5 rounded-2xl"></div>
      )}
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center p-6 space-y-4">
        {/* Enhanced Avatar */}
        <div className={cn(
          "relative transition-all duration-700 ease-in-out",
          isAnimating && "scale-110 rotate-1",
          isSpeaking && "scale-105"
        )}>
          {avatar ? (
            <div className="relative">
              <Image 
                src={avatar} 
                alt={participantName}
                width={112}
                height={112}
                className={cn(
                  "w-28 h-28 rounded-full object-cover border-4 shadow-xl transition-all duration-500",
                  isCurrentUser ? "border-blue-400/60" : "border-white/30",
                  isSpeaking && "border-green-400/60",
                  !isConnected && "border-red-400/60 grayscale"
                )}
              />
              {/* Avatar Glow Effect */}
              <div className={cn(
                "absolute inset-0 rounded-full transition-all duration-500",
                isSpeaking ? "shadow-lg shadow-green-400/30" : "shadow-lg shadow-blue-400/20"
              )}></div>
            </div>
          ) : (
            <div className={cn(
              "w-28 h-28 rounded-full flex items-center justify-center text-white font-bold text-2xl bg-gradient-to-br border-4 shadow-xl transition-all duration-500",
              getAvatarColor(participantName),
              isCurrentUser ? "border-blue-400/60" : "border-white/30",
              isSpeaking && "border-green-400/60 shadow-green-400/30",
              !isConnected && "border-red-400/60 grayscale"
            )}>
              {getInitials(participantName)}
            </div>
          )}
          
          {/* Enhanced Camera Off Indicator */}
          <div className="absolute -bottom-3 -right-3 bg-gradient-to-br from-red-500 to-red-600 rounded-full p-2.5 border-4 border-slate-900 shadow-xl transition-all duration-300 hover:scale-110">
            <CameraOff size={18} className="text-white" />
          </div>
          
          {/* Enhanced Microphone Status */}
          <div className={cn(
            "absolute -top-3 -left-3 rounded-full p-2.5 border-4 border-slate-900 shadow-xl transition-all duration-300 hover:scale-110",
            isMuted ? "bg-gradient-to-br from-red-500 to-red-600" : "bg-gradient-to-br from-green-500 to-green-600",
            isSpeaking && !isMuted && "animate-pulse scale-110"
          )}>
            {isMuted ? (
              <MicOff size={18} className="text-white" />
            ) : (
              <Mic size={18} className="text-white" />
            )}
          </div>
          
          {/* Connection Status Indicator */}
          <div className={cn(
            "absolute -top-3 -right-3 rounded-full p-2 border-4 border-slate-900 shadow-xl transition-all duration-300",
            isConnected ? "bg-gradient-to-br from-blue-500 to-blue-600" : "bg-gradient-to-br from-red-500 to-red-600"
          )}>
            {isConnected ? (
              <Wifi size={14} className="text-white" />
            ) : (
              <WifiOff size={14} className="text-white" />
            )}
          </div>
        </div>
        
        {/* Enhanced User Info */}
        <div className="text-center space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-white text-lg flex items-center gap-2 justify-center">
              <span className="truncate max-w-[200px]">{participantName}</span>
              {isCurrentUser && (
                <span className="px-2 py-1 bg-gradient-to-r from-blue-500/30 to-blue-600/30 text-blue-300 text-xs rounded-full font-medium border border-blue-400/30">
                  YOU
                </span>
              )}
            </h3>
            
            {/* Enhanced Status Messages */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-300 justify-center">
                <CameraOff size={14} className="text-red-400" />
                <span>Camera is off</span>
              </div>
              
              {isSpeaking && (
                <div className="flex items-center gap-2 text-sm text-green-400 justify-center animate-pulse">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Speaking...</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced Connection Status */}
          <div className="flex items-center gap-2 justify-center">
            <div className={cn(
              "w-2 h-2 rounded-full transition-colors duration-300",
              isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            )}></div>
            <span className={cn(
              "text-xs transition-colors duration-300",
              isConnected ? "text-green-400" : "text-red-400"
            )}>
              {isConnected ? "Connected" : "Reconnecting..."}
            </span>
          </div>
        </div>
      </div>
      
      {/* Enhanced Hover Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/8 to-blue-500/0 opacity-0 hover:opacity-100 transition-all duration-500 rounded-2xl pointer-events-none"></div>
      
      {/* Enhanced Speaking Animation */}
      {isSpeaking && !isMuted && (
        <div className="absolute inset-0 rounded-2xl border-2 border-green-400/60 animate-pulse transition-all duration-300"></div>
      )}
      
      {/* Camera Transition Effect */}
      {showTransition && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700/50 to-slate-900/50 rounded-2xl flex items-center justify-center">
          <div className="text-center text-gray-400">
            <CameraOff size={32} className="mx-auto mb-2 animate-pulse" />
            <p className="text-sm">Camera turning off...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraOffDisplay;
