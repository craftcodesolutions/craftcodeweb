'use client';

import { useState } from 'react';
import { 
  Video, 
  Calendar, 
  Users, 
  Settings, 
  Share2, 
  Clock,
  Zap,
  Star,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { getMeetingRoomUrl, getPersonalRoomShareLink } from './utils/meetingUtils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  disabled?: boolean;
  badge?: string;
}

interface QuickActionsProps {
  className?: string;
  layout?: 'grid' | 'list' | 'compact';
  showLabels?: boolean;
}

const QuickActions = ({ 
  className, 
  layout = 'grid', 
  showLabels = true 
}: QuickActionsProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAction = async (actionId: string, action: () => void) => {
    setIsLoading(actionId);
    try {
      await action();
    } finally {
      setTimeout(() => setIsLoading(null), 500);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'instant-meeting',
      label: 'Start Meeting',
      icon: <Video size={20} />,
      description: 'Start an instant meeting now',
      onClick: () => router.push('/meeting?instant=true'),
      variant: 'primary'
    },
    {
      id: 'schedule-meeting',
      label: 'Schedule',
      icon: <Calendar size={20} />,
      description: 'Schedule a meeting for later',
      onClick: () => router.push('/meeting?schedule=true'),
      variant: 'secondary'
    },
    {
      id: 'join-meeting',
      label: 'Join Meeting',
      icon: <Users size={20} />,
      description: 'Join an existing meeting',
      onClick: () => {
        const meetingId = prompt('Enter Meeting ID:');
        if (meetingId) {
          router.push(getMeetingRoomUrl(meetingId));
        }
      },
      variant: 'success'
    },
    {
      id: 'personal-room',
      label: 'Personal Room',
      icon: <Star size={20} />,
      description: 'Go to your personal meeting room',
      onClick: () => router.push('/meeting/personal-room'),
      variant: 'warning'
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      icon: <Clock size={20} />,
      description: 'View upcoming meetings',
      onClick: () => router.push('/meeting/upcoming'),
      badge: '3'
    },
    {
      id: 'history',
      label: 'History',
      icon: <History size={20} />,
      description: 'View meeting history',
      onClick: () => router.push('/meeting/previous')
    },
    {
      id: 'share-room',
      label: 'Share Room',
      icon: <Share2 size={20} />,
      description: 'Share your personal room link',
      onClick: () => {
        if (!user?.userId) {
          toast.error('Please log in to share your personal room');
          return;
        }
        const link = getPersonalRoomShareLink(user.userId);
        navigator.clipboard.writeText(link);
        toast.success('Personal room link copied to clipboard!');
      }
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={20} />,
      description: 'Meeting preferences and settings',
      onClick: () => router.push('/meeting/settings')
    }
  ];

  const getVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25';
      case 'secondary':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25';
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg shadow-yellow-500/25';
      default:
        return 'bg-gradient-to-r from-dark-3/60 to-dark-4/60 hover:from-dark-3/80 hover:to-dark-4/80 text-white border border-white/10 hover:border-white/20';
    }
  };

  const renderGridLayout = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {quickActions.map((action) => (
        <Button
          key={action.id}
          onClick={() => handleAction(action.id, action.onClick)}
          disabled={action.disabled || isLoading === action.id}
          className={cn(
            'relative flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-[1.02] group h-auto min-h-[80px] sm:min-h-[100px]',
            getVariantClasses(action.variant),
            action.disabled && 'opacity-50 cursor-not-allowed hover:scale-100'
          )}
        >
          {/* Enhanced Loading spinner */}
          {isLoading === action.id && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl sm:rounded-2xl">
              <div className="relative">
                {/* Outer glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-40 animate-pulse scale-150"></div>
                {/* Spinner */}
                <div className="relative w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin shadow-lg" style={{ animationDuration: '1s' }}></div>
              </div>
            </div>
          )}

          {/* Badge */}
          {action.badge && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {action.badge}
            </div>
          )}

          {/* Icon */}
          <div className="transition-transform duration-300 group-hover:scale-110">
            {action.icon}
          </div>

          {/* Label */}
          {showLabels && (
            <span className="text-xs sm:text-sm font-medium text-center leading-tight">
              {action.label}
            </span>
          )}

          {/* Hover effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-xl sm:rounded-2xl" />
        </Button>
      ))}
    </div>
  );

  const renderListLayout = () => (
    <div className="space-y-2">
      {quickActions.map((action) => (
        <Button
          key={action.id}
          onClick={() => handleAction(action.id, action.onClick)}
          disabled={action.disabled || isLoading === action.id}
          className={cn(
            'relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.01] group w-full justify-start',
            getVariantClasses(action.variant),
            action.disabled && 'opacity-50 cursor-not-allowed hover:scale-100'
          )}
        >
          {/* Loading spinner */}
          {isLoading === action.id && (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}

          {/* Icon */}
          <div className="flex-shrink-0">
            {action.icon}
          </div>

          {/* Content */}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium">{action.label}</span>
              {action.badge && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  {action.badge}
                </span>
              )}
            </div>
            {showLabels && (
              <p className="text-xs opacity-70 mt-1">{action.description}</p>
            )}
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
            <Zap size={16} />
          </div>
        </Button>
      ))}
    </div>
  );

  const renderCompactLayout = () => (
    <div className="flex flex-wrap gap-2">
      {quickActions.slice(0, 6).map((action) => (
        <Button
          key={action.id}
          onClick={() => handleAction(action.id, action.onClick)}
          disabled={action.disabled || isLoading === action.id}
          className={cn(
            'relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-sm',
            getVariantClasses(action.variant),
            action.disabled && 'opacity-50 cursor-not-allowed hover:scale-100'
          )}
        >
          {isLoading === action.id ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="w-4 h-4">{action.icon}</div>
          )}
          {showLabels && action.label}
          {action.badge && (
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </Button>
      ))}
    </div>
  );

  return (
    <div className={cn('w-full', className)}>
      {layout === 'grid' && renderGridLayout()}
      {layout === 'list' && renderListLayout()}
      {layout === 'compact' && renderCompactLayout()}
    </div>
  );
};

export default QuickActions;
