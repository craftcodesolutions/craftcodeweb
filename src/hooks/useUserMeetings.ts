import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface Meeting {
  _id: string;
  id: string;
  title: string;
  description: string;
  startsAt: string;
  participants: string[];
  createdBy: string;
  meetingType: 'instant' | 'scheduled';
  streamCallId: string;
  createdAt: string;
  updatedAt: string;
}

interface UseUserMeetingsReturn {
  meetings: Meeting[];
  upcomingMeetings: Meeting[];
  endedMeetings: Meeting[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserMeetings = (): UseUserMeetingsReturn => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserMeetings = useCallback(async () => {
    if (!user?.userId) {
      setMeetings([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/meetings?type=all');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch meetings: ${response.status}`);
      }

      const data = await response.json();
      const userMeetings = data.meetings || [];
      
      console.log(`Fetched ${userMeetings.length} meetings for authenticated user ${user.userId}`);
      
      // Additional client-side filtering to ensure user is participant
      const filteredMeetings = userMeetings.filter((meeting: Meeting) => {
        const isCreator = meeting.createdBy === user.userId;
        const isParticipant = meeting.participants.includes(user.userId);
        
        if (isCreator || isParticipant) {
          console.log(`User ${user.userId} has access to meeting ${meeting.id} (creator: ${isCreator}, participant: ${isParticipant})`);
          return true;
        }
        
        console.warn(`User ${user.userId} should not have access to meeting ${meeting.id}`);
        return false;
      });

      setMeetings(filteredMeetings);
    } catch (err) {
      console.error('Error fetching user meetings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch meetings';
      setError(errorMessage);
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchUserMeetings();
  }, [user?.userId, fetchUserMeetings]);

  // Separate meetings into upcoming and ended
  const now = new Date();
  const upcomingMeetings = meetings.filter(meeting => 
    new Date(meeting.startsAt) > now
  );
  const endedMeetings = meetings.filter(meeting => 
    new Date(meeting.startsAt) <= now
  );

  return {
    meetings,
    upcomingMeetings,
    endedMeetings,
    isLoading,
    error,
    refetch: fetchUserMeetings,
  };
};
