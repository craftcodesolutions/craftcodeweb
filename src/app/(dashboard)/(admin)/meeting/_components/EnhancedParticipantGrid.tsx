'use client';
import React, { useState, useEffect } from 'react';
import { useCallStateHooks, StreamVideoParticipant, ParticipantView } from '@stream-io/video-react-sdk';
import { Users, Grid3X3, Maximize2, Camera, CameraOff, Mic, MicOff } from 'lucide-react';
import CameraOffDisplay from './CameraOffDisplay';
import { cn } from '@/lib/utils';

interface EnhancedParticipantGridProps {
  layout?: 'grid' | 'speaker';
  className?: string;
}

interface ProcessedParticipant {
  id: string;
  name: string;
  isLocal: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
  avatar?: string;
  participant: StreamVideoParticipant;
}

const EnhancedParticipantGrid = ({ layout = 'grid', className }: EnhancedParticipantGridProps) => {
  const { useParticipants, useLocalParticipant, useCameraState, useMicrophoneState } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const [focusedParticipant, setFocusedParticipant] = useState<string | undefined>(undefined);
  const [cameraTransitions, setCameraTransitions] = useState<Record<string, boolean>>({});
  const { isMute: isCameraMuted } = useCameraState();
  const { isMute: isMicMuted } = useMicrophoneState();

  // Process participants to include local participant with enhanced state tracking
  const processedParticipants = React.useMemo((): ProcessedParticipant[] => {
    // Get real participant data from Stream
    const allParticipants = participants || [];
    const local = localParticipant;
    
    const participantList = [...allParticipants];
    if (local && !participantList.find(p => p.sessionId === local.sessionId)) {
      participantList.unshift(local);
    }
    
    return participantList.map(participant => {
      const isLocal = participant.sessionId === local?.sessionId;
      const hasVideo = isLocal 
        ? !isCameraMuted 
        : participant.publishedTracks.length > 0 && participant.videoStream !== undefined;
      const hasAudio = isLocal 
        ? !isMicMuted 
        : participant.publishedTracks.length > 0 && participant.audioStream !== undefined;
      
      return {
        id: participant.sessionId,
        name: participant.name || participant.userId || 'Unknown User',
        isLocal,
        hasVideo,
        hasAudio,
        avatar: participant.image,
        participant: participant
      };
    });
  }, [participants, localParticipant, isCameraMuted, isMicMuted]);

  // Track camera state changes for smooth transitions
  useEffect(() => {
    processedParticipants.forEach(participant => {
      const prevHasVideo = cameraTransitions[participant.id];
      if (prevHasVideo !== participant.hasVideo) {
        setCameraTransitions(prev => ({
          ...prev,
          [participant.id]: participant.hasVideo
        }));
      }
    });
  }, [processedParticipants, cameraTransitions]);

  const getGridLayout = (count: number) => {
    if (count <= 1) return { cols: 'grid-cols-1', rows: 'grid-rows-1', aspectRatio: 'aspect-video' };
    if (count <= 2) return { cols: 'grid-cols-2', rows: 'grid-rows-1', aspectRatio: 'aspect-video' };
    if (count <= 4) return { cols: 'grid-cols-2', rows: 'grid-rows-2', aspectRatio: 'aspect-video' };
    if (count <= 6) return { cols: 'grid-cols-3', rows: 'grid-rows-2', aspectRatio: 'aspect-video' };
    if (count <= 9) return { cols: 'grid-cols-3', rows: 'grid-rows-3', aspectRatio: 'aspect-video' };
    return { cols: 'grid-cols-4', rows: 'grid-rows-3', aspectRatio: 'aspect-video' };
  };

  const gridLayout = getGridLayout(processedParticipants.length);

  return (
    <div className={cn("relative w-full h-full p-4", className)}>
      {layout === 'grid' ? (
        <div className={cn(
          "grid gap-3 h-full w-full",
          gridLayout.cols,
          gridLayout.rows,
          "place-content-center place-items-stretch"
        )}>
          {processedParticipants.map((participant: ProcessedParticipant) => (
            <div 
              key={participant.id}
              className={cn(
                "relative group cursor-pointer transition-all duration-500 hover:scale-[1.02] w-full",
                gridLayout.aspectRatio,
                focusedParticipant === participant.id && "ring-3 ring-blue-400/70 scale-[1.02] z-10 shadow-2xl shadow-blue-500/20",
                "min-h-[200px] h-full flex flex-col"
              )}
              onClick={() => setFocusedParticipant(
                focusedParticipant === participant.id ? undefined : participant.id
              )}
            >
              <div className={cn(
                "w-full h-full rounded-2xl overflow-hidden transition-all duration-700 ease-in-out",
                participant.hasVideo ? "bg-slate-800 border border-white/20" : ""
              )}>
                {participant.hasVideo ? (
                  // Actual Video Stream using Stream SDK
                  <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-900">
                    <ParticipantView
                      participant={participant.participant}
                      className="w-full h-full object-cover"
                      VideoPlaceholder={() => (
                        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                          <div className="text-center text-gray-300">
                            <div className="relative mb-3">
                              <Camera size={40} className="mx-auto text-blue-400" />
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse"></div>
                            </div>
                            <p className="text-sm font-medium">{participant.name}</p>
                            <p className="text-xs text-blue-400">Loading video...</p>
                          </div>
                        </div>
                      )}
                    />
                    
                    {/* Video Controls Overlay */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full text-xs backdrop-blur-sm",
                        participant.hasAudio ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"
                      )}>
                        {participant.hasAudio ? <Mic size={12} /> : <MicOff size={12} />}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Camera off participant with enhanced transitions
                  <div className="w-full h-full transform transition-all duration-700 ease-in-out">
                    <CameraOffDisplay
                      participantName={participant.name}
                      isCurrentUser={participant.isLocal}
                      isMuted={!participant.hasAudio}
                      avatar={participant.avatar}
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>
              
              {/* Enhanced Participant Controls Overlay */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                <div className="flex items-center gap-2">
                  <button 
                    className="p-2 bg-slate-900/95 backdrop-blur-md rounded-xl border border-white/30 hover:bg-slate-800 hover:border-blue-400/50 transition-all duration-300 hover:scale-110 shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFocusedParticipant(participant.id);
                    }}
                  >
                    <Maximize2 size={14} className="text-white" />
                  </button>
                </div>
              </div>
              
              {/* Enhanced Name Label with Status */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {participant.name}
                      </p>
                      {participant.isLocal && (
                        <span className="px-2 py-0.5 bg-blue-500/30 text-blue-300 text-xs rounded-full font-medium whitespace-nowrap">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full transition-colors duration-300",
                        participant.hasVideo ? "bg-green-500" : "bg-red-500"
                      )}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Enhanced Speaker layout with better alignment and space utilization
        <div className="flex h-full gap-4">
          {/* Main speaker with enhanced design */}
          <div className="flex-1 relative min-w-0">
            <div className={cn(
              "w-full h-full rounded-2xl overflow-hidden transition-all duration-700 ease-in-out",
              processedParticipants[0]?.hasVideo ? "bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20" : ""
            )}>
              {processedParticipants[0]?.hasVideo ? (
                <div className="relative w-full h-full">
                  <ParticipantView
                    participant={processedParticipants[0].participant}
                    className="w-full h-full object-cover rounded-2xl"
                    VideoPlaceholder={() => (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center rounded-2xl">
                        <div className="text-center text-gray-300">
                          <div className="relative mb-4">
                            <Camera size={48} className="mx-auto text-blue-400" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse"></div>
                          </div>
                          <p className="text-lg font-medium">{processedParticipants[0]?.name}</p>
                          <p className="text-sm text-blue-400">Loading video...</p>
                        </div>
                      </div>
                    )}
                  />
                  
                  {/* Speaker Controls */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full backdrop-blur-sm",
                      processedParticipants[0]?.hasAudio ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"
                    )}>
                      {processedParticipants[0]?.hasAudio ? <Mic size={16} /> : <MicOff size={16} />}
                    </div>
                  </div>
                </div>
              ) : (
                <CameraOffDisplay
                  participantName={processedParticipants[0]?.name || 'Speaker'}
                  isCurrentUser={processedParticipants[0]?.isLocal}
                  isMuted={!processedParticipants[0]?.hasAudio}
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
          
          {/* Enhanced Sidebar participants - compact and organized */}
          <div className="w-80 overflow-y-auto bg-slate-900/30 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <Users size={14} className="text-blue-400" />
                Other Participants ({processedParticipants.length - 1})
              </h3>
            </div>
            
            <div className="space-y-2">
              {processedParticipants.slice(1).map((participant: ProcessedParticipant) => (
                <div key={participant.id} className="relative group hover:bg-slate-800/50 rounded-xl p-2 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    {/* Compact Participant Avatar/Video */}
                    <div className="flex-shrink-0">
                      {participant.hasVideo ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                          <ParticipantView
                            participant={participant.participant}
                            className="w-full h-full object-cover"
                            VideoPlaceholder={() => (
                              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                <Camera size={16} className="text-gray-400" />
                              </div>
                            )}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                              {participant.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Participant Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">
                          {participant.name}
                          {participant.isLocal && (
                            <span className="ml-1 text-xs text-blue-400">(You)</span>
                          )}
                        </p>
                        
                        {/* Status Indicators */}
                        <div className="flex items-center gap-1 ml-2">
                          <div className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center",
                            participant.hasVideo ? "bg-green-500/20" : "bg-red-500/20"
                          )}>
                            {participant.hasVideo ? (
                              <Camera size={10} className="text-green-400" />
                            ) : (
                              <CameraOff size={10} className="text-red-400" />
                            )}
                          </div>
                          
                          <div className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center",
                            participant.hasAudio ? "bg-green-500/20" : "bg-red-500/20"
                          )}>
                            {participant.hasAudio ? (
                              <Mic size={10} className="text-green-400" />
                            ) : (
                              <MicOff size={10} className="text-red-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Connection Status */}
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-400">Connected</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Empty state when no other participants */}
            {processedParticipants.length <= 1 && (
              <div className="text-center py-6 text-gray-400">
                <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Users size={24} className="opacity-50" />
                </div>
                <p className="text-sm font-medium">No other participants</p>
                <p className="text-xs mt-1">Share the meeting link to invite others</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Enhanced Grid Info */}
      <div className="absolute top-3 left-3 bg-slate-900/95 backdrop-blur-xl rounded-xl px-3 py-2 border border-white/20 shadow-lg">
        <div className="flex items-center gap-2 text-xs text-white">
          <Grid3X3 size={14} className="text-blue-400" />
          <span className="font-medium">{processedParticipants.length} Participant{processedParticipants.length !== 1 ? 's' : ''}</span>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedParticipantGrid;
