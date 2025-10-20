'use client';
import { useState, useEffect } from 'react';
import {
  CallingState,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  LayoutList, 
  Settings, 
  Maximize2, 
  Minimize2, 
  UserX, 
  Camera, 
  CameraOff,
  Mic,
  MicOff,
  Monitor,
  Grid3X3,
  Volume2,
  PhoneOff,
  ScreenShare,
  ScreenShareOff
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';
import Loader from './Loader';
import EnhancedParticipantGrid from './EnhancedParticipantGrid';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams?.get('personal');
  const router = useRouter();
  const { user } = useAuth();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [cameraTransitioning, setCameraTransitioning] = useState(false);
  const { 
    useCallCallingState, 
    useParticipantCount,
    useCameraState,
    useMicrophoneState,
    useScreenShareState
  } = useCallStateHooks();
  useCall();

  // Get calling state and participant count
  const callingState = useCallCallingState();
  const totalParticipants = useParticipantCount();
  
  // Get device states from Stream SDK
  const { camera, isMute: isCameraMuted } = useCameraState();
  const { microphone, isMute: isMicMuted } = useMicrophoneState();
  const { screenShare, isMute: isScreenShareMuted } = useScreenShareState();

  useEffect(() => {
    setParticipantCount(totalParticipants || 0);
  }, [totalParticipants]);

  // Enhanced camera toggle function with smooth transitions
  const toggleCamera = async () => {
    try {
      setCameraTransitioning(true);
      
      if (isCameraMuted) {
        await camera.enable();
      } else {
        await camera.disable();
      }
      
      // Add a small delay for smooth transition
      setTimeout(() => {
        setCameraTransitioning(false);
      }, 700);
    } catch (error) {
      console.error('Error toggling camera:', error);
      setCameraTransitioning(false);
    }
  };

  // Microphone toggle function
  const toggleMicrophone = async () => {
    try {
      if (isMicMuted) {
        await microphone.enable();
      } else {
        await microphone.disable();
      }
    } catch (error) {
      console.error('Error toggling microphone:', error);
    }
  };

  // Screen share toggle function
  const toggleScreenShare = async () => {
    try {
      if (isScreenShareMuted) {
        await screenShare.enable();
      } else {
        await screenShare.disable();
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  // Handle hang up with proper redirection based on user role
  const handleHangUp = () => {
    if (user?.isAdmin) {
      router.push('/meeting');
    } else {
      router.push('/');
    }
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    // Use enhanced grid for better camera-off display and transitions

    // Always use enhanced grid for better camera transitions and user alignment
    return (
      <div className={cn(
        "relative w-full h-full transition-all duration-700 ease-in-out",
        cameraTransitioning && "opacity-90 scale-[0.98]"
      )}>
        <EnhancedParticipantGrid 
          layout={layout === 'grid' ? 'grid' : 'speaker'} 
          className="transition-all duration-700 ease-in-out"
        />
        
        {/* Enhanced Camera Transition Overlay */}
        {cameraTransitioning && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-lg rounded-2xl flex items-center justify-center z-20">
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
              <div className="flex flex-col items-center gap-6 text-white">
                {/* Enhanced animated icon */}
                <div className="relative">
                  {/* Outer glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-40 animate-pulse scale-150"></div>
                  {/* Spinning ring */}
                  <div className="absolute inset-0 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
                  {/* Icon container */}
                  <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Camera size={28} className="text-white drop-shadow-lg" />
                  </div>
                </div>
                
                {/* Enhanced text */}
                <div className="text-center space-y-2">
                  <p className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Adjusting Camera
                  </p>
                  <p className="text-sm text-gray-400">Please wait while we optimize your video</p>
                  
                  {/* Loading dots */}
                  <div className="flex items-center justify-center gap-1 mt-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Local Video Preview (Picture-in-Picture) - Responsive */}
        {!isCameraMuted && !cameraTransitioning && (
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-32 h-24 sm:w-48 sm:h-36 bg-slate-900 rounded-lg sm:rounded-xl border-2 border-white/20 overflow-hidden shadow-2xl z-30">
            <div className="relative w-full h-full">
              {/* This would show the local video preview */}
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center text-gray-300">
                  <Camera size={24} className="mx-auto mb-2 text-blue-400" />
                  <p className="text-xs">Your Camera</p>
                </div>
              </div>
              
              {/* Local Video Controls */}
              <div className="absolute top-2 right-2">
                <button 
                  onClick={toggleCamera}
                  className="p-1.5 bg-slate-900/80 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-slate-800 transition-colors"
                >
                  <Camera size={12} className="text-white" />
                </button>
              </div>
              
              {/* Local Video Label */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg px-2 py-1">
                  <p className="text-xs font-medium text-white text-center">You</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );

    // Fallback to Stream components if needed (keeping for reference)
    /*
    switch (layout) {
      case 'grid':
        return (
          <div className="relative w-full h-full">
            <PaginatedGridLayout />
          </div>
        );
      case 'speaker-right':
        return (
          <div className="relative w-full h-full">
            <SpeakerLayout participantsBarPosition="left" />
          </div>
        );
      default:
        return (
          <div className="relative w-full h-full">
            <SpeakerLayout participantsBarPosition="right" />
          </div>
        );
    }
    */
  };

  return (
    <section className={cn(
      "relative h-screen w-full overflow-hidden text-white transition-all duration-500",
      isFullscreen 
        ? "bg-black" 
        : "bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"
    )}>
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900 to-black"></div>
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
      
      {/* Enhanced Main Content Area with responsive layout */}
      <div className="relative flex size-full p-2 sm:p-4 items-center">
        {/* Main Video Area - Full width on mobile, flexible on desktop */}
        <div className={cn(
          "flex items-center justify-center",
          // On mobile: always full width, on desktop: flexible with margin when participants shown
          "w-full sm:flex-1",
          !showParticipants ? "sm:mr-0" : "sm:mr-4"
        )}>
          <div className={cn(
            "w-full rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 relative",
            isFullscreen 
              ? "bg-black/50" 
              : "bg-slate-800/30 backdrop-blur-xl border border-white/10 shadow-2xl",
            "h-[calc(100vh-100px)] sm:h-[calc(100vh-140px)]"
          )}>
            {/* Video Layout Container */}
            <div className="relative w-full h-full">
              <CallLayout />
            </div>
          </div>
        </div>
        
        {/* Enhanced Participants Panel - Hidden on small devices */}
        <div
          className={cn(
            'transition-all duration-500 transform flex-shrink-0 hidden sm:block',
            showParticipants 
              ? 'translate-x-0 opacity-100 w-80' 
              : 'translate-x-full opacity-0 w-0 overflow-hidden'
          )}
        >
          <div className={cn(
            "w-full rounded-2xl overflow-hidden transition-all duration-500 relative",
            isFullscreen 
              ? "bg-black/50" 
              : "bg-slate-800/95 backdrop-blur-xl border border-white/20 shadow-2xl",
            "h-[calc(100vh-140px)]"
          )}>
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Users size={18} className="text-blue-400" />
                  Participants ({participantCount})
                </h3>
                <button 
                  onClick={() => setShowParticipants(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <Minimize2 size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
            <div className="h-[calc(100%-80px)] overflow-y-auto p-4">
              {/* Custom Compact Participants List */}
              <div className="space-y-2 mb-4">
                {/* This would be populated with actual participants from Stream */}
                <div className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    A
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">Atik Mahbub (You)</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500/20 rounded-full flex items-center justify-center">
                          <Camera size={8} className="text-green-400" />
                        </div>
                        <div className="w-3 h-3 bg-red-500/20 rounded-full flex items-center justify-center">
                          <MicOff size={8} className="text-red-400" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-400">Host</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-slate-600/50 rounded-lg transition-colors">
                    <Maximize2 size={12} className="text-gray-400" />
                  </button>
                </div>
              </div>
              
              {/* Additional Meeting Controls in Sidebar */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Actions</h4>
                
                <button 
                  onClick={() => {
                    const meetingLink = `${window.location.origin}${window.location.pathname}`;
                    navigator.clipboard.writeText(meetingLink);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700/70 rounded-xl transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Users size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Invite Others</p>
                    <p className="text-xs text-gray-400">Copy meeting link</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700/70 rounded-xl transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Settings size={16} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Meeting Settings</p>
                    <p className="text-xs text-gray-400">Audio & video options</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => setLayout(layout === 'grid' ? 'speaker-left' : 'grid')}
                  className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700/70 rounded-xl transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Grid3X3 size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Switch Layout</p>
                    <p className="text-xs text-gray-400">{layout === 'grid' ? 'Speaker view' : 'Grid view'}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Redesigned Compact Navigation Bar - Responsive */}
      <div className={cn(
        "fixed left-1/2 -translate-x-1/2 transition-all duration-500 z-50",
        isFullscreen ? "bottom-2 sm:bottom-3" : "bottom-3 sm:bottom-5"
      )}>
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/98 backdrop-blur-2xl rounded-full px-2 sm:px-4 py-2 sm:py-3 border border-white/10 shadow-2xl h-10 sm:h-12 max-w-[95vw] overflow-x-auto scrollbar-hide">
          {/* Enhanced Camera Toggle with Transition Feedback */}
          <button 
            onClick={toggleCamera}
            disabled={cameraTransitioning}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-110 relative",
              cameraTransitioning && "cursor-not-allowed opacity-70",
              !isCameraMuted 
                ? "bg-blue-500/30 text-blue-300 shadow-blue-500/20" 
                : "bg-red-500/30 text-red-300 shadow-red-500/20"
            )}
          >
            {cameraTransitioning ? (
              <div className="animate-spin">
                <Camera size={16} className="sm:w-[18px] sm:h-[18px] transition-colors duration-300" />
              </div>
            ) : (
              <>
                {!isCameraMuted ? (
                  <Camera size={16} className="sm:w-[18px] sm:h-[18px] transition-colors duration-300" />
                ) : (
                  <CameraOff size={16} className="sm:w-[18px] sm:h-[18px] transition-colors duration-300" />
                )}
              </>
            )}
            
            {/* Status Indicator */}
            <div className={cn(
              "absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-slate-900 sm:border-2 transition-colors duration-300",
              !isCameraMuted ? "bg-green-500" : "bg-red-500"
            )}></div>
          </button>

          {/* Microphone Toggle - Functional - Responsive */}
          <button 
            onClick={toggleMicrophone}
            className={cn(
              "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 hover:scale-110 flex-shrink-0",
              !isMicMuted 
                ? "bg-green-500/30 text-green-300" 
                : "bg-red-500/30 text-red-300"
            )}
          >
            {!isMicMuted ? (
              <Mic size={16} className="sm:w-[18px] sm:h-[18px] transition-colors duration-300" />
            ) : (
              <MicOff size={16} className="sm:w-[18px] sm:h-[18px] transition-colors duration-300" />
            )}
          </button>

          {/* Screen Share Toggle - Functional - Responsive */}
          <button 
            onClick={toggleScreenShare}
            className={cn(
              "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 hover:scale-110 flex-shrink-0",
              !isScreenShareMuted 
                ? "bg-purple-500/30 text-purple-300" 
                : "bg-slate-800/40 hover:bg-purple-500/20 text-white hover:text-purple-300"
            )}
          >
            {!isScreenShareMuted ? (
              <ScreenShare size={16} className="sm:w-[18px] sm:h-[18px] transition-colors duration-300" />
            ) : (
              <ScreenShareOff size={16} className="sm:w-[18px] sm:h-[18px] transition-colors duration-300" />
            )}
          </button>
          
          {/* Divider */}
          <div className="h-6 sm:h-8 w-px bg-white/10 flex-shrink-0"></div>
          
          {/* Layout Selector - Responsive */}
          <DropdownMenu>
            <DropdownMenuTrigger className="group relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-800/40 hover:bg-blue-500/20 transition-all duration-300 hover:scale-110 border border-white/5 flex-shrink-0">
              <LayoutList size={16} className="sm:w-[18px] sm:h-[18px] text-white group-hover:text-blue-400 transition-colors duration-300" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-slate-700/50 bg-slate-900/98 backdrop-blur-2xl text-white rounded-2xl p-2 shadow-2xl min-w-[160px] mb-2">
              {[
                { name: 'Grid', icon: Grid3X3, value: 'grid' },
                { name: 'Speaker Left', icon: Monitor, value: 'speaker-left' },
                { name: 'Speaker Right', icon: Monitor, value: 'speaker-right' }
              ].map((item, index) => (
                <div key={index}>
                  <DropdownMenuItem
                    onClick={() => setLayout(item.value as CallLayoutType)}
                    className={cn(
                      "rounded-xl hover:bg-blue-500/20 transition-all duration-200 cursor-pointer p-2 text-sm",
                      layout === item.value && "bg-blue-500/20 text-blue-400"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon size={14} />
                      <span className="font-medium">{item.name}</span>
                      {layout === item.value && (
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-auto"></div>
                      )}
                    </div>
                  </DropdownMenuItem>
                  {index < 2 && <DropdownMenuSeparator className="border-slate-700/30 my-0.5" />}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Fullscreen Toggle - Responsive */}
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={cn(
              "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 hover:scale-110 flex-shrink-0",
              isFullscreen 
                ? "bg-orange-500/30 text-orange-300" 
                : "bg-slate-800/40 hover:bg-orange-500/20 text-white hover:text-orange-300"
            )}
          >
            {isFullscreen ? (
              <Minimize2 size={16} className="sm:w-[18px] sm:h-[18px] transition-colors duration-300" />
            ) : (
              <Maximize2 size={16} className="sm:w-[18px] sm:h-[18px] transition-colors duration-300" />
            )}
          </button>
          
          {/* Divider */}
          <div className="h-6 sm:h-8 w-px bg-white/10 flex-shrink-0"></div>
          
          {/* Participants Toggle - Hidden on small devices */}
          <button 
            onClick={() => setShowParticipants((prev) => !prev)}
            className={cn(
              "hidden sm:flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 hover:scale-110 relative flex-shrink-0",
              showParticipants 
                ? "bg-purple-500/30 text-purple-300" 
                : "bg-slate-800/40 hover:bg-purple-500/20 text-white hover:text-purple-300"
            )}
          >
            <Users size={16} className="sm:w-[18px] sm:h-[18px] transition-colors duration-300" />
            {participantCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-purple-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold">
                {participantCount > 9 ? '9+' : participantCount}
              </span>
            )}
          </button>
          
          {/* Settings - Responsive */}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "hidden sm:flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-300 hover:scale-110 flex-shrink-0",
              showSettings 
                ? "bg-green-500/30 text-green-300" 
                : "bg-slate-800/40 hover:bg-green-500/20 text-white hover:text-green-300"
            )}
          >
            <Settings size={16} className="sm:w-[18px] sm:h-[18px] transition-colors duration-300" />
          </button>
          
          {/* End Call Button (Icon Only) - Responsive */}
          {!isPersonalRoom && (
            <>
              <div className="h-6 sm:h-8 w-px bg-white/10 flex-shrink-0"></div>
              <button 
                onClick={handleHangUp}
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-500/30 hover:bg-red-500/50 text-red-300 hover:text-red-200 transition-all duration-300 hover:scale-110 flex-shrink-0"
              >
                <PhoneOff size={16} className="sm:w-[18px] sm:h-[18px] transition-colors duration-300" />
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Enhanced Meeting Info Overlay - Responsive */}
      <div className={cn(
        "absolute top-3 left-3 sm:top-6 sm:left-6 transition-all duration-500 z-20",
        isFullscreen ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        <div className="bg-slate-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 border border-white/20 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-30"></div>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                Meeting Live
                <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                  {participantCount}
                </span>
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                {isPersonalRoom ? (
                  <>
                    <UserX size={12} />
                    Personal Room
                  </>
                ) : (
                  <>
                    <Users size={12} />
                    Group Meeting
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Status Indicators */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="relative w-full h-full">
            {/* Enhanced Status Indicators - Responsive */}
          <div className={cn(
            "absolute top-3 sm:top-6 space-y-2 sm:space-y-3 transition-all duration-500",
            showParticipants ? "right-3 sm:right-[340px]" : "right-3 sm:right-6"
          )}>
            {/* Camera Status Indicator */}
            {isCameraMuted && (
              <div className={cn(
                "bg-slate-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20 shadow-xl transition-all duration-500",
                cameraTransitioning && "animate-pulse"
              )}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <CameraOff size={18} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-white">
                      {cameraTransitioning ? "Adjusting Camera..." : "Camera Off"}
                    </p>
                    <p className="text-xs text-gray-400">Click camera button to enable</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Microphone Status Indicator */}
            {isMicMuted && (
              <div className="bg-slate-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <MicOff size={18} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-white">Microphone Off</p>
                    <p className="text-xs text-gray-400">You are muted</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact Settings Panel - Responsive */}
      {showSettings && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-slate-900/98 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20 shadow-2xl w-56 sm:w-64 z-20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white flex items-center gap-2 text-sm">
                <Settings size={14} className="text-green-400" />
                Settings
              </h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Minimize2 size={12} className="text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Camera size={14} className="text-blue-400" />
                  <span className="text-xs text-white">Camera</span>
                </div>
                <button className="p-1 bg-blue-500/20 text-blue-400 rounded-md">
                  <Camera size={12} />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mic size={14} className="text-green-400" />
                  <span className="text-xs text-white">Microphone</span>
                </div>
                <button className="p-1 bg-green-500/20 text-green-400 rounded-md">
                  <Mic size={12} />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Volume2 size={14} className="text-purple-400" />
                  <span className="text-xs text-white">Audio</span>
                </div>
                <button className="p-1 bg-purple-500/20 text-purple-400 rounded-md">
                  <Volume2 size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MeetingRoom;
