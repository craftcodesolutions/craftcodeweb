import { useEffect, useState } from 'react';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';

export const useGetCallById = (id: string | string[]) => {
  const [call, setCall] = useState<Call>();
  const [isCallLoading, setIsCallLoading] = useState(true);
  const [callError, setCallError] = useState<string | null>(null);

  const client = useStreamVideoClient();

  useEffect(() => {
    if (!client || !id) {
      setIsCallLoading(false);
      return;
    }
    
    const loadCall = async () => {
      try {
        setIsCallLoading(true);
        setCallError(null);
        
        // Convert array to string if needed
        const callId = Array.isArray(id) ? id[0] : id;
        
        // Validate call ID format
        if (!callId || callId.trim() === '') {
          throw new Error('Invalid call ID provided');
        }
        
        // Get the call directly by ID
        const call = client.call('default', callId);
        
        // Get call details - this will throw if call doesn't exist
        await call.get();
        
        setCall(call);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorCode = (error as { code?: number })?.code;
        
        // Only log non-"call not found" errors to avoid spam
        if (!errorMessage.includes("Can't find call") && errorCode !== 16) {
          console.error('Error loading call:', error);
        }
        
        // Handle specific Stream errors
        if (errorMessage.includes("Can't find call")) {
          setCallError('Call not found. It may have been deleted or the link is invalid.');
        } else if (errorCode === 16) {
          setCallError('Call not found. Please check the meeting link.');
        } else {
          setCallError('Failed to load call. Please try again.');
        }
        
        setCall(undefined);
      } finally {
        setIsCallLoading(false);
      }
    };

    loadCall();
  }, [client, id]);

  return { call, isCallLoading, callError };
};
