'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DisabledAccount {
  userId: string;
  email: string;
  disabledAt: string;
  reason?: string;
}

interface DisabledAccountsContextType {
  disabledAccounts: DisabledAccount[];
  isAccountDisabled: (userId: string, email: string) => boolean;
  disableAccount: (userId: string, email: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  enableAccount: (userId: string) => Promise<{ success: boolean; error?: string }>;
  addDisabledAccount: (userId: string, email: string, reason?: string) => void;
  removeDisabledAccount: (userId: string) => void;
  isLoading: boolean;
  refreshDisabledAccounts: () => Promise<void>;
}

const DisabledAccountsContext = createContext<DisabledAccountsContextType | null>(null);

export const useDisabledAccounts = () => {
  const context = useContext(DisabledAccountsContext);
  if (!context) {
    throw new Error('useDisabledAccounts must be used within a DisabledAccountsProvider');
  }
  return context;
};

interface DisabledAccountsProviderProps {
  children: ReactNode;
}

export const DisabledAccountsProvider: React.FC<DisabledAccountsProviderProps> = ({ children }) => {
  const [disabledAccounts, setDisabledAccounts] = useState<DisabledAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load disabled accounts from localStorage on mount
  useEffect(() => {
    const loadDisabledAccounts = () => {
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('disabledAccounts');
          if (stored) {
            const parsedAccounts = JSON.parse(stored);
            setDisabledAccounts(parsedAccounts);
          }
        }
      } catch (error) {
        console.error('Error loading disabled accounts from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDisabledAccounts();
  }, []);

  // Save to localStorage whenever disabledAccounts changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      try {
        localStorage.setItem('disabledAccounts', JSON.stringify(disabledAccounts));
      } catch (error) {
        console.error('Error saving disabled accounts to localStorage:', error);
      }
    }
  }, [disabledAccounts, isLoading]);

  // Check if an account is disabled by userId or email
  const isAccountDisabled = (userId: string, email: string): boolean => {
    return disabledAccounts.some(
      account => account.userId === userId || account.email.toLowerCase() === email.toLowerCase()
    );
  };

  // Add a disabled account to the context
  const addDisabledAccount = (userId: string, email: string, reason?: string) => {
    const newDisabledAccount: DisabledAccount = {
      userId,
      email: email.toLowerCase(),
      disabledAt: new Date().toISOString(),
      reason: reason || 'Account disabled by user'
    };

    setDisabledAccounts(prev => {
      // Remove existing entry if it exists, then add new one
      const filtered = prev.filter(account => account.userId !== userId && account.email !== email.toLowerCase());
      return [...filtered, newDisabledAccount];
    });

    console.log(`✅ Account disabled: ${email} (${userId})`);
  };

  // Remove a disabled account from the context
  const removeDisabledAccount = (userId: string) => {
    setDisabledAccounts(prev => {
      const filtered = prev.filter(account => account.userId !== userId);
      return filtered;
    });

    console.log(`✅ Account enabled: ${userId}`);
  };

  // API call to disable account on server
  const disableAccount = async (userId: string, email: string, reason?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/disable-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          email,
          reason: reason || 'Account disabled by user'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Add to local context
        addDisabledAccount(userId, email, reason);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to disable account' };
      }
    } catch (error) {
      console.error('Error disabling account:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  // API call to enable account on server
  const enableAccount = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/enable-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Remove from local context
        removeDisabledAccount(userId);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to enable account' };
      }
    } catch (error) {
      console.error('Error enabling account:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  // Refresh disabled accounts from server
  const refreshDisabledAccounts = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/disabled-accounts', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.disabledAccounts)) {
          setDisabledAccounts(data.disabledAccounts);
        }
      }
    } catch (error) {
      console.error('Error refreshing disabled accounts:', error);
    }
  };

  const contextValue: DisabledAccountsContextType = {
    disabledAccounts,
    isAccountDisabled,
    disableAccount,
    enableAccount,
    addDisabledAccount,
    removeDisabledAccount,
    isLoading,
    refreshDisabledAccounts,
  };

  return (
    <DisabledAccountsContext.Provider value={contextValue}>
      {children}
    </DisabledAccountsContext.Provider>
  );
};

export default DisabledAccountsProvider;
