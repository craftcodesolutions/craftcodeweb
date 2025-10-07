'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/lib/notificationService';

interface NotificationPermissionProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export default function NotificationPermission({
  onPermissionGranted,
  onPermissionDenied,
}: NotificationPermissionProps) {
  const { isAuthenticated } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (notificationService.isSupported() && isAuthenticated) {
      setPermissionStatus(Notification.permission);
      setShowPrompt(Notification.permission === 'default');
    }
  }, [isAuthenticated]);

  const requestPermission = async () => {
    setIsRequesting(true);
    try {
      const permission = await notificationService.requestPermissionWithInteraction();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        setShowPrompt(false);
        onPermissionGranted?.();
        await notificationService.showMessageNotification(
          'Notifications Enabled',
          'You will now receive message notifications when away from the app.'
        );
      } else {
        setShowPrompt(false);
        onPermissionDenied?.();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      onPermissionDenied?.();
    } finally {
      setIsRequesting(false);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    onPermissionDenied?.();
  };

  if (!notificationService.isSupported() || !isAuthenticated || permissionStatus !== 'default' || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2L3 7v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7l-7-5zM10 4.83L15 8.43V17H5V8.43L10 4.83z"/>
              <path d="M8 10h4v2H8v-2zm0 3h4v2H8v-2z"/>
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Enable Message Notifications
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Get notified when you receive new messages while away from the app.
          </p>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={requestPermission}
              disabled={isRequesting}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
            >
              {isRequesting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Requesting...
                </>
              ) : (
                'Enable'
              )}
            </button>
            <button
              onClick={dismissPrompt}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
        <button
          onClick={dismissPrompt}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}