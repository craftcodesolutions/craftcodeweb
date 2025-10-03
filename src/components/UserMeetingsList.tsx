'use client';

import React from 'react';
import { useUserMeetings } from '@/hooks/useUserMeetings';
import { useAuth } from '@/context/AuthContext';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Video,
  Link,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import ParticipantDisplay from '@/app/(dashboard)/(admin)/meeting/_components/ParticipantDisplay';
import type { Meeting } from '@/hooks/useUserMeetings';

interface UserMeetingsListProps {
  type: 'upcoming' | 'ended' | 'all';
  className?: string;
}

const UserMeetingsList: React.FC<UserMeetingsListProps> = ({ type, className = '' }) => {
  const { user } = useAuth();
  const { meetings, upcomingMeetings, endedMeetings, isLoading, error, refetch } = useUserMeetings();

  const displayMeetings = React.useMemo(() => {
    switch (type) {
      case 'upcoming':
        return upcomingMeetings;
      case 'ended':
        return endedMeetings;
      case 'all':
      default:
        return meetings;
    }
  }, [type, meetings, upcomingMeetings, endedMeetings]);

  const handleCopyLink = (meetingId: string) => {
    const link = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting-area/${meetingId}`;
    navigator.clipboard.writeText(link);
    toast.success('Meeting link copied to clipboard!');
  };

  const handleJoinMeeting = (meetingId: string) => {
    window.open(`/meeting-area/${meetingId}`, '_blank');
  };

  const getMeetingStatus = (startsAt: string, isEnded: boolean = false) => {
    if (isEnded) return { status: 'Completed', color: 'text-gray-400 bg-gray-500/20' };
    
    const startTime = new Date(startsAt);
    const now = new Date();
    const diffInMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);
    
    if (diffInMinutes <= 0) return { status: 'Ready to Join', color: 'text-green-400 bg-green-500/20' };
    if (diffInMinutes <= 15) return { status: 'Starting Soon', color: 'text-yellow-400 bg-yellow-500/20' };
    return { status: 'Scheduled', color: 'text-blue-400 bg-blue-500/20' };
  };

  const getUserRole = (meeting: Meeting) => {
    if (!user?.userId) return 'Unknown';
    
    const isCreator = meeting.createdBy === user.userId;
    const isParticipant = meeting.participants.includes(user.userId);
    
    if (isCreator) return 'Creator';
    if (isParticipant) return 'Participant';
    return 'Member';
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center space-y-4">
          <Loader2 size={32} className="mx-auto animate-spin text-blue-400" />
          <p className="text-gray-400">Loading your meetings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="space-y-4">
          <AlertCircle size={48} className="mx-auto text-red-400" />
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Meetings</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button
              onClick={refetch}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (displayMeetings.length === 0) {
    const emptyMessage = {
      upcoming: 'No upcoming meetings',
      ended: 'No previous meetings',
      all: 'No meetings found'
    }[type];

    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="space-y-4">
          <Calendar size={48} className="mx-auto text-gray-400" />
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">{emptyMessage}</h3>
            <p className="text-gray-400">
              {type === 'upcoming' 
                ? 'Schedule a meeting to get started' 
                : 'Your meeting history will appear here'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary */}
      <div className="bg-slate-800/30 border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-blue-400" />
            <span className="text-white font-medium">
              Showing {displayMeetings.length} meeting{displayMeetings.length !== 1 ? 's' : ''} where you are involved
            </span>
          </div>
          <Button
            onClick={refetch}
            size="sm"
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Meetings List */}
      <div className="grid gap-4">
        {displayMeetings.map((meeting) => {
          const meetingDate = new Date(meeting.startsAt);
          const status = getMeetingStatus(meeting.startsAt, type === 'ended');
          const userRole = getUserRole(meeting);
          const isUpcoming = type === 'upcoming';

          return (
            <div
              key={meeting._id}
              className="bg-slate-800/50 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {meeting.title || meeting.description || 'Untitled Meeting'}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {meetingDate.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {meetingDate.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      Your role: <span className="text-white font-medium">{userRole}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {isUpcoming && status.status === 'Ready to Join' && (
                    <Button
                      onClick={() => handleJoinMeeting(meeting.id)}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Video size={16} className="mr-1" />
                      Join
                    </Button>
                  )}
                  <Button
                    onClick={() => handleCopyLink(meeting.id)}
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-gray-300 hover:text-white"
                  >
                    <Link size={16} className="mr-1" />
                    Copy Link
                  </Button>
                </div>
              </div>

              {/* Meeting Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Description */}
                {meeting.description && (
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-300 mb-1">Description</h4>
                    <p className="text-sm text-white line-clamp-2">{meeting.description}</p>
                  </div>
                )}

                {/* Participants */}
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Participants</h4>
                  {meeting.participants.length > 0 ? (
                    <ParticipantDisplay 
                      participantIds={meeting.participants}
                      maxDisplay={4}
                      size="sm"
                      showNames={false}
                    />
                  ) : (
                    <div className="text-sm text-gray-400">No participants</div>
                  )}
                </div>
              </div>

              {/* Meeting Type & Creator Info */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <CheckCircle size={12} />
                      Type: {meeting.meetingType === 'scheduled' ? 'Scheduled' : 'Instant'}
                    </span>
                    <span>
                      Meeting ID: <code className="bg-slate-700/50 px-1 rounded">{meeting.id}</code>
                    </span>
                  </div>
                  <span>
                    Created: {new Date(meeting.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserMeetingsList;
