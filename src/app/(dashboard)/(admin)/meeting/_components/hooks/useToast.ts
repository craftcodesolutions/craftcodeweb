'use client';

import { useState, useCallback } from 'react';
import { ToastType } from '../Toast';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastOptions {
  title: string;
  message?: string;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addToast = useCallback((type: ToastType, options: ToastOptions) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      type,
      ...options,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((options: ToastOptions) => {
    return addToast('success', options);
  }, [addToast]);

  const error = useCallback((options: ToastOptions) => {
    return addToast('error', { duration: 7000, ...options });
  }, [addToast]);

  const warning = useCallback((options: ToastOptions) => {
    return addToast('warning', { duration: 6000, ...options });
  }, [addToast]);

  const info = useCallback((options: ToastOptions) => {
    return addToast('info', options);
  }, [addToast]);

  // Quick toast methods with just title
  const quickSuccess = useCallback((title: string, message?: string) => {
    return success({ title, message });
  }, [success]);

  const quickError = useCallback((title: string, message?: string) => {
    return error({ title, message });
  }, [error]);

  const quickWarning = useCallback((title: string, message?: string) => {
    return warning({ title, message });
  }, [warning]);

  const quickInfo = useCallback((title: string, message?: string) => {
    return info({ title, message });
  }, [info]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    quickSuccess,
    quickError,
    quickWarning,
    quickInfo,
  };
};

export default useToast;
