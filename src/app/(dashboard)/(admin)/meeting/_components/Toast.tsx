'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const Toast = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  position = 'top-right'
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  }, [id, onClose]);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: {
      bg: 'from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/30',
      icon: 'text-green-400',
      shadow: 'shadow-green-500/20'
    },
    error: {
      bg: 'from-red-500/20 to-red-600/20',
      border: 'border-red-500/30',
      icon: 'text-red-400',
      shadow: 'shadow-red-500/20'
    },
    warning: {
      bg: 'from-yellow-500/20 to-orange-500/20',
      border: 'border-yellow-500/30',
      icon: 'text-yellow-400',
      shadow: 'shadow-yellow-500/20'
    },
    info: {
      bg: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/30',
      icon: 'text-blue-400',
      shadow: 'shadow-blue-500/20'
    },
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const Icon = icons[type];
  const colorScheme = colors[type];

  return (
    <div
      className={cn(
        'fixed z-50 max-w-sm w-full transition-all duration-300 ease-out',
        positionClasses[position],
        isVisible && !isExiting ? 'translate-x-0 opacity-100 scale-100' : 
        position.includes('right') ? 'translate-x-full opacity-0 scale-95' : 
        '-translate-x-full opacity-0 scale-95'
      )}
    >
      <div
        className={cn(
          'bg-gradient-to-r backdrop-blur-md border rounded-2xl p-4 shadow-xl',
          colorScheme.bg,
          colorScheme.border,
          colorScheme.shadow,
          'hover:scale-[1.02] transition-transform duration-200'
        )}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn('flex-shrink-0 mt-0.5', colorScheme.icon)}>
            <Icon size={20} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white mb-1">
              {title}
            </h4>
            {message && (
              <p className="text-xs text-gray-300 leading-relaxed">
                {message}
              </p>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors duration-200 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        {duration > 0 && (
          <div className="mt-3 w-full bg-white/10 rounded-full h-1 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all ease-linear',
                type === 'success' && 'bg-green-400',
                type === 'error' && 'bg-red-400',
                type === 'warning' && 'bg-yellow-400',
                type === 'info' && 'bg-blue-400'
              )}
              style={{
                animation: `shrink ${duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
  }>;
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const ToastContainer = ({ 
  toasts, 
  onRemove, 
  position = 'top-right' 
}: ToastContainerProps) => {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onRemove}
          position={position}
        />
      ))}
    </>
  );
};

export default Toast;
