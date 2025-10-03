'use client';

import { Crown } from 'lucide-react';
import Image from 'next/image';
import { useParticipants } from '@/hooks/useParticipants';

interface ParticipantDisplayProps {
  participantIds: string[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  showNames?: boolean;
  className?: string;
}

const ParticipantDisplay = ({
  participantIds,
  maxDisplay = 4,
  size = 'md',
  showNames = false,
  className = ''
}: ParticipantDisplayProps) => {
  const { participants, loading, getDisplayName } = useParticipants(participantIds);

  const sizeConfig = {
    sm: {
      avatar: 'w-6 h-6',
      text: 'text-xs',
      overlap: '-ml-2',
      crown: 8
    },
    md: {
      avatar: 'w-8 h-8',
      text: 'text-sm',
      overlap: '-ml-3',
      crown: 10
    },
    lg: {
      avatar: 'w-10 h-10',
      text: 'text-base',
      overlap: '-ml-4',
      crown: 12
    }
  };

  const config = sizeConfig[size];

  if (loading) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="flex">
          {Array.from({ length: Math.min(maxDisplay, 3) }).map((_, index) => (
            <div
              key={index}
              className={`
                ${config.avatar} ${index > 0 ? config.overlap : ''} 
                bg-slate-700 rounded-full border-2 border-slate-800 
                animate-pulse
              `}
            />
          ))}
        </div>
        <span className={`ml-2 text-gray-400 ${config.text}`}>Loading...</span>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className={`flex items-center text-gray-400 ${config.text} ${className}`}>
        No participants
      </div>
    );
  }

  const displayParticipants = participants.slice(0, maxDisplay);
  const remainingCount = participants.length - maxDisplay;

  return (
    <div className={`flex items-center ${className}`}>
      {/* Avatar Stack */}
      <div className="flex items-center">
        {displayParticipants.map((participant, index) => (
          <div
            key={participant._id}
            className={`
              relative ${config.avatar} ${index > 0 ? config.overlap : ''} 
              rounded-full border-2 border-slate-800 bg-gradient-to-br 
              from-blue-500 to-purple-500 flex items-center justify-center
              hover:z-10 transition-all duration-200 hover:scale-110
            `}
            title={getDisplayName(participant)}
          >
            {participant.picture ? (
              <Image
                src={participant.picture}
                alt={getDisplayName(participant)}
                width={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
                height={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
                className="rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-xs">
                {getDisplayName(participant).charAt(0).toUpperCase()}
              </span>
            )}
            
            {/* Admin Crown */}
            {participant.isAdmin && (
              <Crown 
                size={config.crown} 
                className="absolute -top-1 -right-1 text-yellow-400 drop-shadow-sm" 
              />
            )}
          </div>
        ))}

        {/* Overflow Count */}
        {remainingCount > 0 && (
          <div
            className={`
              ${config.avatar} ${config.overlap} rounded-full border-2 border-slate-800 
              bg-slate-700 flex items-center justify-center text-white font-semibold
              hover:bg-slate-600 transition-colors duration-200
            `}
            title={`+${remainingCount} more participant${remainingCount > 1 ? 's' : ''}`}
          >
            <span className={config.text}>+{remainingCount}</span>
          </div>
        )}
      </div>

      {/* Participant Count and Names */}
      <div className="ml-3 min-w-0">
        <div className={`text-white font-medium ${config.text}`}>
          {participants.length} participant{participants.length > 1 ? 's' : ''}
        </div>
        
        {showNames && participants.length > 0 && (
          <div className={`text-gray-400 truncate ${config.text === 'text-xs' ? 'text-xs' : 'text-xs'}`}>
            {participants.length <= 3 
              ? participants.map(getDisplayName).join(', ')
              : `${participants.slice(0, 2).map(getDisplayName).join(', ')} +${participants.length - 2} more`
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantDisplay;
