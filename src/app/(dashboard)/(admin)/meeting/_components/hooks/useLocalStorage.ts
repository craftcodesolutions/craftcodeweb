'use client';

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T) => T);

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: SetValue<T>) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

// Specialized hooks for common use cases
export const useUserPreferences = () => {
  return useLocalStorage('meetingUserPreferences', {
    theme: 'dark',
    soundEnabled: true,
    notificationsEnabled: true,
    autoJoinAudio: true,
    autoJoinVideo: false,
    preferredLayout: 'grid' as 'grid' | 'speaker',
    language: 'en'
  });
};

export const useMeetingSettings = () => {
  return useLocalStorage('meetingSettings', {
    defaultMeetingDuration: 60,
    reminderTime: 15,
    autoRecord: false,
    allowScreenShare: true,
    muteOnJoin: false,
    cameraOnJoin: true
  });
};

export const useRecentMeetings = () => {
  return useLocalStorage<Array<{
    id: string;
    title: string;
    timestamp: number;
    duration?: number;
    participants?: number;
  }>>('recentMeetings', []);
};

export const useFavoriteMeetings = () => {
  return useLocalStorage<string[]>('favoriteMeetings', []);
};

export const useMeetingDrafts = () => {
  return useLocalStorage<Array<{
    id: string;
    title: string;
    description: string;
    scheduledTime?: string;
    participants?: string[];
    createdAt: number;
  }>>('meetingDrafts', []);
};

export default useLocalStorage;
