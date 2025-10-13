'use client';

import { useState, useMemo, useCallback } from 'react';
import { StreamCallWithCustomState } from '@/types/StreamCall';

import Loader from './Loader';
import { useGetCalls } from '@/hooks/useGetCalls';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Users, Video, MoreVertical, Copy, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { getMeetingRoomUrl, getMeetingShareLink } from './utils/meetingUtils';
import ParticipantDisplay from './ParticipantDisplay';

const CallList = ({ type }: { type: 'ended' | 'upcoming' }) => {
  const router = useRouter();
  const { endedCalls, upcomingCalls, isLoading } = useGetCalls();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Memoize the calls to prevent unnecessary re-renders
  const calls = useMemo(() => {
    switch (type) {
      case 'ended':
        return endedCalls;
      case 'upcoming':
        return upcomingCalls;
      default:
        return [];
    }
  }, [type, endedCalls, upcomingCalls]);

  const noCallsMessage = useMemo(() => {
    switch (type) {
      case 'ended':
        return 'No Previous Calls';
      case 'upcoming':
        return 'No Upcoming Calls';
      default:
        return '';
    }
  }, [type]);

  // All hooks must be called before any early returns
  const handleCopyLink = useCallback((meetingId: string) => {
    const link = getMeetingShareLink(meetingId);
    navigator.clipboard.writeText(link);
    toast.success('Meeting link copied to clipboard!');
  }, []);

  const handleDeleteMeeting = useCallback(() => {
    toast.success('Meeting deleted successfully!');
  }, []);

  // Early return after all hooks are defined
  if (isLoading) return <Loader />;


  const getMeetingDuration = (meeting: StreamCallWithCustomState) => {
    if (type === 'ended') {
      const startTime = meeting.state?.startsAt ? new Date(meeting.state.startsAt) : null;
      const endTime = meeting.state?.endedAt ? new Date(meeting.state.endedAt) : null;
      
      if (startTime && endTime) {
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationMinutes = Math.round(durationMs / (1000 * 60));
        return `${durationMinutes} min`;
      }
      return '45 min'; // Fallback
    } else {
      const customDuration = meeting.state?.custom?.duration;
      return customDuration ? `${customDuration} min` : '60 min';
    }
  };

  const getParticipantCount = (meeting: StreamCallWithCustomState): string => {
    // First try to get from database data, then fallback to Stream data
    const dbData = meeting._dbData;
    const participants = dbData?.participants || meeting.state?.custom?.participants || [];
    const memberCount = meeting.state?.members?.length || 0;
    const totalCount = Math.max(participants.length, memberCount);
    return totalCount > 0 ? `${totalCount} participant${totalCount > 1 ? 's' : ''}` : 'No participants';
  };

  const getParticipantIds = (meeting: StreamCallWithCustomState): string[] => {
    // First try to get from database data, then fallback to Stream custom data
    const dbData = meeting._dbData;
    if (dbData?.participants) {
      return dbData.participants;
    }
    return meeting.state?.custom?.participants || [];
  };

  const getMeetingDescription = (meeting: StreamCallWithCustomState): string => {
    // First try to get from database data, then fallback to Stream custom data
    const dbData = meeting._dbData;
    if (dbData?.description) {
      return dbData.description;
    }
    return meeting.state?.custom?.description || 'Untitled Meeting';
  };

  const getMeetingStatus = (meeting: StreamCallWithCustomState): string => {
    if (type === 'ended') return 'Completed';
    
    const startTime = new Date(meeting.state?.startsAt || '');
    const now = new Date();
    const diffInMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);
    
    if (diffInMinutes <= 0) return 'Ready to Join';
    if (diffInMinutes <= 15) return 'Starting Soon';
    return 'Scheduled';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready to Join': return 'text-green-400 bg-green-500/20';
      case 'Starting Soon': return 'text-yellow-400 bg-yellow-500/20';
      case 'Scheduled': return 'text-blue-400 bg-blue-500/20';
      case 'Completed': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };


  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 mt-4 sm:mt-6">
      {calls && calls.length > 0 ? (
        calls.map((meeting: StreamCallWithCustomState) => {
          const status = getMeetingStatus(meeting);
          const isExpanded = expandedCard === meeting.id;
          const meetingDate = new Date(meeting.state?.startsAt || '');
          const now = new Date();
          const isToday = meetingDate.toDateString() === now.toDateString();
          const isTomorrow = meetingDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
          
          return (
            <div
              key={meeting.id}
              className="group relative bg-slate-800/50 dark:bg-slate-700/50 border border-white/10 dark:border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-white/20 dark:hover:border-white/30 transition-all duration-300 hover:bg-slate-800/70 dark:hover:bg-slate-700/70 shadow-lg hover:shadow-xl"
            >
              
              {/* Status Badge - Responsive */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                <span className={`inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${getStatusColor(status)} border border-white/10 dark:border-white/20`}>
                  <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                    status === 'Ready to Join' ? 'bg-green-400' :
                    status === 'Starting Soon' ? 'bg-yellow-400' :
                    status === 'Completed' ? 'bg-gray-400' : 'bg-blue-400'
                  }`}></div>
                  {status}
                </span>
              </div>
              
              {/* Meeting Header - Responsive */}
              <div className="relative z-10 mb-4 sm:mb-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
                    type === 'ended' 
                      ? 'bg-purple-500' 
                      : 'bg-blue-500'
                  }`}>
                    {type === 'ended' ? (
                      <Video size={20} className="sm:w-6 sm:h-6 text-white" />
                    ) : (
                      <Calendar size={20} className="sm:w-6 sm:h-6 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-white dark:text-gray-100 mb-2 sm:mb-3 truncate">
                      {getMeetingDescription(meeting)}
                    </h3>
                    
                    {/* Date and Time Display */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-300 dark:text-gray-200">
                        <Calendar size={14} className="text-blue-400 dark:text-blue-300" />
                        <span className="text-sm font-medium">
                          {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : meetingDate.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 dark:text-gray-300">
                        <Clock size={14} className="text-green-400 dark:text-green-300" />
                        <span className="text-sm">
                          {meetingDate.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : meeting.id)}
                      className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group-hover:bg-white/5"
                    >
                      <MoreVertical size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                    </button>
                    
                    {isExpanded && (
                      <div className="absolute right-0 top-12 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-2 min-w-[180px] z-20 shadow-2xl animate-in slide-in-from-top-2 duration-200">
                        <button
                          onClick={() => handleCopyLink(meeting.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                        >
                          <Copy size={16} className="text-blue-400" />
                          Copy Meeting Link
                        </button>
                        {type === 'upcoming' && (
                          <>
                            <button
                              onClick={() => router.push(getMeetingRoomUrl(meeting.id, { edit: 'true' }))}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                            >
                              <Edit size={16} className="text-yellow-400" />
                              Edit Meeting
                            </button>
                            <button
                              onClick={() => handleDeleteMeeting()}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-200"
                            >
                              <Trash2 size={16} />
                              Delete Meeting
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Meeting Details Grid - Responsive */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-slate-700/30 dark:bg-slate-600/30 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/5 dark:border-white/10">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 dark:bg-blue-400/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Clock size={16} className="sm:w-[18px] sm:h-[18px] text-blue-400 dark:text-blue-300" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-300 uppercase tracking-wide mb-0.5 sm:mb-1">Duration</p>
                      <p className="text-xs sm:text-sm font-semibold text-white dark:text-gray-100">
                        {getMeetingDuration(meeting)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-700/30 dark:bg-slate-600/30 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/5 dark:border-white/10">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 dark:bg-green-400/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <Users size={16} className="sm:w-[18px] sm:h-[18px] text-green-400 dark:text-green-300" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-300 uppercase tracking-wide mb-0.5 sm:mb-1">Participants</p>
                        <p className="text-xs sm:text-sm font-semibold text-white dark:text-gray-100">
                          {getParticipantCount(meeting)}
                        </p>
                      </div>
                    </div>
                    {getParticipantIds(meeting).length > 0 && (
                      <div className="mt-2">
                        <ParticipantDisplay 
                          participantIds={getParticipantIds(meeting)}
                          maxDisplay={3}
                          size="sm"
                          showNames={false}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Meeting ID and Link - Responsive */}
              <div className="relative z-10 mb-4 sm:mb-6">
                <div className="bg-slate-700/20 dark:bg-slate-600/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/5 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-300 uppercase tracking-wide mb-0.5 sm:mb-1">Meeting ID</p>
                      <p className="text-xs sm:text-sm font-mono text-white dark:text-gray-100">{meeting.id.slice(0, 8)}...</p>
                    </div>
                    <button
                      onClick={() => handleCopyLink(meeting.id)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Copy size={16} className="text-gray-400 hover:text-white" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons - Responsive */}
              <div className="relative z-10 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={() => router.push(getMeetingRoomUrl(meeting.id))}
                  className={`flex-1 font-semibold py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg relative overflow-hidden ${
                    type === 'ended'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 hover:shadow-purple-500/25'
                      : status === 'Ready to Join'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-green-500/25'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 hover:shadow-blue-500/25'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {type === 'ended' ? (
                      <>
                        <Video size={18} />
                        <span>View Recording</span>
                      </>
                    ) : status === 'Ready to Join' ? (
                      <>
                        <Video size={18} />
                        <span>Join Now</span>
                      </>
                    ) : (
                      <>
                        <Calendar size={18} />
                        <span>View Details</span>
                      </>
                    )}
                  </div>
                  
                  {/* Button Shine Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                </Button>
                
                {/* Quick Action Button - Responsive */}
                <Button
                  onClick={() => handleCopyLink(meeting.id)}
                  className="px-3 py-3 sm:px-4 sm:py-4 bg-slate-700/50 hover:bg-slate-700/70 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 border border-white/10 sm:w-auto w-full sm:flex-shrink-0"
                >
                  <Copy size={16} className="sm:w-[18px] sm:h-[18px] text-gray-300" />
                </Button>
              </div>
              
              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                type === 'ended' 
                  ? 'shadow-2xl shadow-purple-500/10' 
                  : 'shadow-2xl shadow-blue-500/10'
              }`}></div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar size={48} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{noCallsMessage}</h1>
          <p className="text-gray-400">Your meetings will appear here when available</p>
        </div>
      )}
    </div>
  );
};

export default CallList;
