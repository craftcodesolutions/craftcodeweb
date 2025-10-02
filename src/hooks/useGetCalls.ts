import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';

export const useGetCalls = () => {
  const { user } = useAuth();
  const client = useStreamVideoClient();
  const [calls, setCalls] = useState<Call[]>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCalls = async () => {
      if (!client || !user?.userId) return;
      
      setIsLoading(true);

      try {
        // https://getstream.io/video/docs/react/guides/querying-calls/#filters
        const { calls } = await client.queryCalls({
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

        setCalls(calls);
      } catch (error) {
        console.error(error);
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
    return calls.filter(({ state: { startsAt, endedAt } }: Call) => {
      return (startsAt && new Date(startsAt) < now) || !!endedAt;
    });
  }, [calls]);

  const upcomingCalls = useMemo(() => {
    if (!calls) return undefined;
    const now = new Date();
    return calls.filter(({ state: { startsAt } }: Call) => {
      return startsAt && new Date(startsAt) > now;
    });
  }, [calls]);

  return { endedCalls, upcomingCalls, isLoading };
};
