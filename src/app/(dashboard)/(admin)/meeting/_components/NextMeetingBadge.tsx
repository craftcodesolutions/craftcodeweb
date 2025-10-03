'use client';

import { useGetCalls } from '@/hooks/useGetCalls';

const NextMeetingBadge = () => {
  const { upcomingCalls, isLoading } = useGetCalls();

  // Get the next upcoming meeting
  const nextMeeting = upcomingCalls?.[0];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeUntilMeeting = (meetingTime: Date) => {
    const now = new Date();
    const diff = meetingTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Starting now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    } else {
      return `in ${minutes}m`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-start">
        <div className="glassmorphism max-w-[320px] rounded-xl sm:rounded-2xl py-3 px-4 sm:px-6 text-center border border-white/30 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-3">
            {/* Enhanced loading indicator */}
            <div className="relative">
              {/* Outer glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-sm opacity-40 animate-pulse scale-150"></div>
              {/* Spinning ring */}
              <div className="relative w-3 h-3 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <span className="text-sm sm:text-base font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
              Loading meetings...
            </span>
            
            {/* Loading dots */}
            <div className="flex items-center gap-1 ml-2">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!nextMeeting) {
    return (
      <div className="flex justify-start">
        <div className="glassmorphism max-w-[320px] rounded-xl sm:rounded-2xl py-3 px-4 sm:px-6 text-center border border-white/30 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-2 h-2 bg-blue-500 rounded-full animate-ping opacity-30"></div>
            </div>
            <span className="text-sm sm:text-base font-semibold text-white">
              No upcoming meetings
            </span>
          </div>
        </div>
      </div>
    );
  }

  const meetingTime = new Date(nextMeeting.state.startsAt!);
  const timeUntil = getTimeUntilMeeting(meetingTime);

  return (
    <div className="flex justify-start">
      <div className="glassmorphism max-w-[320px] rounded-xl sm:rounded-2xl py-3 px-4 sm:px-6 text-center border border-white/30 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-30"></div>
          </div>
          <span className="text-sm sm:text-base font-semibold text-white">
            Next Meeting: {formatTime(meetingTime)}
          </span>
          <div className="hidden sm:block w-1 h-1 bg-white/50 rounded-full"></div>
          <span className="hidden sm:inline text-xs text-white/80">
            {timeUntil}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NextMeetingBadge;
