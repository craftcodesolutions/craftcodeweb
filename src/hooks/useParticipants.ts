import { useState, useEffect, useMemo } from 'react';

interface User {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  picture?: string;
  isAdmin?: boolean;
}

export const useParticipants = (participantIds: string[]) => {
  const [participants, setParticipants] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the joined participant IDs
  const participantIdsString = useMemo(() => participantIds.join(','), [participantIds]);

  useEffect(() => {
    const fetchParticipants = async () => {
      const currentIds = participantIdsString.split(',').filter(Boolean);
      
      if (!currentIds.length) {
        setParticipants([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Create a query string with participant IDs
        const idsQuery = currentIds.map(id => `ids=${encodeURIComponent(id)}`).join('&');
        const response = await fetch(`/api/users/by-ids?${idsQuery}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch participants: ${response.status}`);
        }

        const data = await response.json();
        setParticipants(data.users || []);
      } catch (err) {
        console.error('Error fetching participants:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch participants');
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [participantIdsString]); // Use memoized string as dependency

  // Helper function to get display name
  const getDisplayName = (user: User): string => {
    if (user.name) return user.name;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return user.email || 'Unknown User';
  };

  // Helper function to get participant names as string
  const getParticipantNames = (): string => {
    return participants.map(getDisplayName).join(', ');
  };

  return {
    participants,
    loading,
    error,
    getDisplayName,
    getParticipantNames,
    count: participants.length,
  };
};
