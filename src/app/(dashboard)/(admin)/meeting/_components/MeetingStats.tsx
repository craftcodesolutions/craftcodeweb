'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Video,
  BarChart3,
  Activity,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatItem {
  id: string;
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon: React.ReactNode;
  color: {
    bg: string;
    icon: string;
    trend: string;
  };
  description?: string;
}

interface MeetingStatsProps {
  className?: string;
  layout?: 'grid' | 'horizontal' | 'compact';
  showTrends?: boolean;
  animated?: boolean;
}

const MeetingStats = ({ 
  className, 
  layout = 'grid', 
  showTrends = true,
  animated = true 
}: MeetingStatsProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsVisible(true), 200);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [animated]);

  // Mock data - in real app, this would come from API
  const stats: StatItem[] = [
    {
      id: 'total-meetings',
      label: 'Total Meetings',
      value: 247,
      change: {
        value: 12,
        type: 'increase',
        period: 'this month'
      },
      icon: <Video size={24} />,
      color: {
        bg: 'from-blue-500/20 to-cyan-500/20',
        icon: 'text-blue-400',
        trend: 'text-green-400'
      },
      description: 'All meetings hosted and joined'
    },
    {
      id: 'meeting-hours',
      label: 'Meeting Hours',
      value: '1,240h',
      change: {
        value: 8,
        type: 'increase',
        period: 'this month'
      },
      icon: <Clock size={24} />,
      color: {
        bg: 'from-green-500/20 to-emerald-500/20',
        icon: 'text-green-400',
        trend: 'text-green-400'
      },
      description: 'Total time spent in meetings'
    },
    {
      id: 'participants',
      label: 'Total Participants',
      value: '2,847',
      change: {
        value: 15,
        type: 'increase',
        period: 'this month'
      },
      icon: <Users size={24} />,
      color: {
        bg: 'from-purple-500/20 to-pink-500/20',
        icon: 'text-purple-400',
        trend: 'text-green-400'
      },
      description: 'Unique participants across all meetings'
    },
    {
      id: 'avg-duration',
      label: 'Avg Duration',
      value: '45m',
      change: {
        value: 3,
        type: 'decrease',
        period: 'this month'
      },
      icon: <BarChart3 size={24} />,
      color: {
        bg: 'from-yellow-500/20 to-orange-500/20',
        icon: 'text-yellow-400',
        trend: 'text-red-400'
      },
      description: 'Average meeting duration'
    },
    {
      id: 'success-rate',
      label: 'Success Rate',
      value: '98.5%',
      change: {
        value: 2,
        type: 'increase',
        period: 'this month'
      },
      icon: <Target size={24} />,
      color: {
        bg: 'from-emerald-500/20 to-green-500/20',
        icon: 'text-emerald-400',
        trend: 'text-green-400'
      },
      description: 'Meetings completed successfully'
    },
    {
      id: 'engagement',
      label: 'Engagement Score',
      value: '8.7/10',
      change: {
        value: 5,
        type: 'increase',
        period: 'this month'
      },
      icon: <Activity size={24} />,
      color: {
        bg: 'from-indigo-500/20 to-blue-500/20',
        icon: 'text-indigo-400',
        trend: 'text-green-400'
      },
      description: 'Average participant engagement'
    }
  ];

  const renderStatCard = (stat: StatItem, index: number) => (
    <div
      key={stat.id}
      className={cn(
        'bg-gradient-to-br border border-white/10 rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg group relative overflow-hidden',
        stat.color.bg,
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
      style={{ 
        transitionDelay: animated ? `${index * 100}ms` : '0ms' 
      }}
    >
      {/* Background animation */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-3 rounded-xl bg-white/10', stat.color.icon)}>
          {stat.icon}
        </div>
        
        {showTrends && stat.change && (
          <div className={cn('flex items-center gap-1 text-sm font-medium', stat.color.trend)}>
            {stat.change.type === 'increase' ? (
              <TrendingUp size={16} />
            ) : stat.change.type === 'decrease' ? (
              <TrendingDown size={16} />
            ) : (
              <Activity size={16} />
            )}
            <span>{stat.change.value}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          {stat.value}
        </h3>
        <p className="text-sm text-gray-400 font-medium">
          {stat.label}
        </p>
      </div>

      {/* Description and trend */}
      <div className="space-y-2">
        {stat.description && (
          <p className="text-xs text-gray-500">
            {stat.description}
          </p>
        )}
        
        {showTrends && stat.change && (
          <p className="text-xs text-gray-400">
            <span className={stat.color.trend}>
              {stat.change.type === 'increase' ? '+' : stat.change.type === 'decrease' ? '-' : ''}
              {stat.change.value}%
            </span>
            {' '}vs {stat.change.period}
          </p>
        )}
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl" />
    </div>
  );

  const renderGridLayout = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => renderStatCard(stat, index))}
    </div>
  );

  const renderHorizontalLayout = () => (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {stats.map((stat, index) => (
        <div key={stat.id} className="flex-shrink-0 w-64">
          {renderStatCard(stat, index)}
        </div>
      ))}
    </div>
  );

  const renderCompactLayout = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat, index) => (
        <div
          key={stat.id}
          className={cn(
            'bg-gradient-to-br border border-white/10 rounded-xl p-4 text-center transition-all duration-500 hover:scale-[1.02] group',
            stat.color.bg,
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
          style={{ 
            transitionDelay: animated ? `${index * 50}ms` : '0ms' 
          }}
        >
          <div className={cn('mb-2', stat.color.icon)}>
            {stat.icon}
          </div>
          <div className="text-lg font-bold text-white mb-1">
            {stat.value}
          </div>
          <div className="text-xs text-gray-400">
            {stat.label}
          </div>
          {showTrends && stat.change && (
            <div className={cn('flex items-center justify-center gap-1 text-xs mt-1', stat.color.trend)}>
              {stat.change.type === 'increase' ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              <span>{stat.change.value}%</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn('w-full', className)}>
      {layout === 'grid' && renderGridLayout()}
      {layout === 'horizontal' && renderHorizontalLayout()}
      {layout === 'compact' && renderCompactLayout()}
    </div>
  );
};

export default MeetingStats;
