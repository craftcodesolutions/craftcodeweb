import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { StreamCallWithCustomState, StreamCallCustomData } from '@/types/StreamCall';

export const useGetCalls = () => {
  const { user } = useAuth();
  const client = useStreamVideoClient();
  const [calls, setCalls] = useState<StreamCallWithCustomState[]>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCalls = async () => {
      if (!client || !user?.userId) return;
      
      setIsLoading(true);

      try {
        // Fetch meetings from our database API - already filtered for authenticated user
        const response = await fetch('/api/meetings?type=all');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch meetings: ${response.status}`);
        }

        const data = await response.json();
        const dbMeetings = data.meetings || [];
        
        console.log(`Fetched ${dbMeetings.length} meetings for user ${user.userId}`);

        // Convert database meetings to Stream Call format for compatibility
        const streamCalls: StreamCallWithCustomState[] = [];
        
        for (const meeting of dbMeetings) {
          try {
            // Get the actual Stream call for each database meeting
            const call = client.call('default', meeting.streamCallId || meeting.id);
            await call.get(); // This fetches the call state from Stream
            
            // Store database data in a way that can be accessed later
            // We'll use a property that won't conflict with Stream's readonly properties
            (call as StreamCallWithCustomState)._dbData = {
              description: meeting.description,
              participants: meeting.participants,
              createdBy: meeting.createdBy,
              meetingType: meeting.meetingType,
              title: meeting.title,
            };
            
            streamCalls.push(call);
          } catch (callError) {
            console.warn(`Failed to fetch Stream call for meeting ${meeting.id}:`, callError);
            
            // Create a mock call object if Stream call doesn't exist
            const mockCall = {
              id: meeting.id,
              state: {
                startsAt: meeting.startsAt,
                endedAt: null,
                createdBy: { id: meeting.createdBy },
                members: [],
                custom: {
                  description: meeting.description,
                  participants: meeting.participants,
                  createdBy: meeting.createdBy,
                  meetingType: meeting.meetingType,
                  title: meeting.title,
                },
              },
              // Add minimal required Call properties
              type: 'default',
              cid: `default:${meeting.id}`,
            } as unknown as Call;
            
            streamCalls.push(mockCall);
          }
        }

        setCalls(streamCalls);
      } catch (error) {
        console.error('Error loading meetings from database:', error);
        
        // Fallback to Stream SDK only if database fetch fails
        try {
          const { calls: streamCalls } = await client.queryCalls({
            sort: [{ field: 'starts_at', direction: -1 }],
            filter_conditions: {
              starts_at: { $exists: true },
              $or: [
                { created_by_user_id: user.userId },
                { members: { $in: [user.userId] } },
                { 'custom.participants': { $in: [user.userId] } },
                { 'custom.createdBy': user.userId },
              ],
            },
          });

          // Filter calls to only include those where user is actually a participant
          const filteredCalls = streamCalls.filter(call => {
            const customData: StreamCallCustomData = call.state?.custom || {};
            const participants = customData.participants || [];
            const createdBy = customData.createdBy;
            
            const isParticipant = (
              call.state.createdBy?.id === user.userId ||
              createdBy === user.userId ||
              participants.includes(user.userId) ||
              call.state.members.some((member: { user_id: string }) => member.user_id === user.userId)
            );
            
            if (isParticipant) {
              console.log(`User ${user.userId} is participant in meeting ${call.id}`);
            }
            
            return isParticipant;
          });

          setCalls(filteredCalls);
        } catch (streamError) {
          console.error('Fallback Stream query also failed:', streamError);
          setCalls([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCalls();
  }, [client, user?.userId]);

  // Memoize the filtered calls to prevent infinite re-renders
  const endedCalls = useMemo(() => {
    if (!calls) return undefined;
    const now = new Date();
    return calls.filter(({ state: { startsAt, endedAt } }) => {
      return (startsAt && new Date(startsAt) < now) || !!endedAt;
    });
  }, [calls]);

  const upcomingCalls = useMemo(() => {
    if (!calls) return undefined;
    const now = new Date();
    return calls.filter(({ state: { startsAt } }) => {
      return startsAt && new Date(startsAt) > now;
    });
  }, [calls]);

  return { endedCalls, upcomingCalls, isLoading };
};
