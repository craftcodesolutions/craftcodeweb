'use client';

import { ReactNode } from 'react';
import { Calendar, Clock, Video, Search, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  type?: 'meetings' | 'search' | 'error' | 'loading' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const EmptyState = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  type = 'default',
  size = 'md',
  className
}: EmptyStateProps) => {
  const getDefaultIcon = () => {
    switch (type) {
      case 'meetings':
        return <Calendar size={48} className="text-gray-400" />;
      case 'search':
        return <Search size={48} className="text-gray-400" />;
      case 'error':
        return <RefreshCw size={48} className="text-red-400" />;
      case 'loading':
        return <Video size={48} className="text-blue-400 animate-pulse" />;
      default:
        return <Calendar size={48} className="text-gray-400" />;
    }
  };

  const sizeClasses = {
    sm: {
      container: 'py-12',
      iconContainer: 'w-16 h-16 mb-4',
      title: 'text-lg',
      description: 'text-sm',
      maxWidth: 'max-w-sm'
    },
    md: {
      container: 'py-16',
      iconContainer: 'w-20 h-20 mb-6',
      title: 'text-xl',
      description: 'text-base',
      maxWidth: 'max-w-md'
    },
    lg: {
      container: 'py-20',
      iconContainer: 'w-24 h-24 mb-8',
      title: 'text-2xl',
      description: 'text-lg',
      maxWidth: 'max-w-lg'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      classes.container,
      className
    )}>
      <div className={cn(classes.maxWidth, 'mx-auto space-y-4')}>
        {/* Icon */}
        <div className={cn(
          'bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-full flex items-center justify-center mx-auto border border-white/10 backdrop-blur-sm',
          classes.iconContainer
        )}>
          {icon || getDefaultIcon()}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className={cn(
            'font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent',
            classes.title
          )}>
            {title}
          </h3>
          <p className={cn('text-gray-400 leading-relaxed', classes.description)}>
            {description}
          </p>
        </div>

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4">
            {action && (
              <Button
                onClick={action.onClick}
                className={cn(
                  'font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto',
                  action.variant === 'secondary' 
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25'
                )}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            )}
            
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                className="bg-transparent hover:bg-white/5 text-gray-300 hover:text-white border border-white/10 hover:border-white/20 font-medium px-6 py-3 rounded-xl transition-all duration-300 w-full sm:w-auto"
              >
                {secondaryAction.icon && <span className="mr-2">{secondaryAction.icon}</span>}
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}

        {/* Decorative elements */}
        <div className="flex justify-center gap-2 pt-6 opacity-50">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>
    </div>
  );
};

// Predefined empty states for common scenarios
export const NoMeetingsState = ({ onCreateMeeting }: { onCreateMeeting: () => void }) => (
  <EmptyState
    type="meetings"
    title="No meetings found"
    description="You don't have any meetings yet. Create your first meeting to get started."
    action={{
      label: "Create Meeting",
      onClick: onCreateMeeting,
      icon: <Plus size={18} />
    }}
  />
);

export const NoUpcomingMeetingsState = ({ onScheduleMeeting }: { onScheduleMeeting: () => void }) => (
  <EmptyState
    type="meetings"
    icon={<Calendar size={48} className="text-blue-400" />}
    title="No upcoming meetings"
    description="Your schedule is clear! Schedule a new meeting or join an existing one."
    action={{
      label: "Schedule Meeting",
      onClick: onScheduleMeeting,
      icon: <Plus size={18} />
    }}
  />
);

export const NoPreviousMeetingsState = ({ onGoHome }: { onGoHome: () => void }) => (
  <EmptyState
    type="meetings"
    icon={<Clock size={48} className="text-purple-400" />}
    title="No meeting history"
    description="Your completed meetings will appear here once you start hosting or joining meetings."
    action={{
      label: "Go to Dashboard",
      onClick: onGoHome,
      icon: <Calendar size={18} />
    }}
  />
);

export const SearchEmptyState = ({ searchTerm, onClearSearch }: { searchTerm: string; onClearSearch: () => void }) => (
  <EmptyState
    type="search"
    title="No results found"
    description={`No meetings found matching "${searchTerm}". Try adjusting your search criteria.`}
    action={{
      label: "Clear Search",
      onClick: onClearSearch,
      variant: "secondary"
    }}
    size="sm"
  />
);

export const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <EmptyState
    type="error"
    title="Something went wrong"
    description="We couldn't load your meetings. Please try again or refresh the page."
    action={{
      label: "Try Again",
      onClick: onRetry,
      icon: <RefreshCw size={18} />
    }}
  />
);

export default EmptyState;
