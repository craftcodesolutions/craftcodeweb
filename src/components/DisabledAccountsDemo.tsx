'use client';

import React, { useState } from 'react';
import { useDisabledAccounts } from '@/context/DisabledAccountsContext';
import { useAuth } from '@/context/AuthContext';

const DisabledAccountsDemo: React.FC = () => {
  const { disabledAccounts, isAccountDisabled, enableAccount, refreshDisabledAccounts } = useDisabledAccounts();
  const { user } = useAuth();
  const [testEmail, setTestEmail] = useState('');
  const [testUserId, setTestUserId] = useState('');

  const handleEnableAccount = async (userId: string) => {
    const result = await enableAccount(userId);
    if (result.success) {
      alert('Account enabled successfully!');
      await refreshDisabledAccounts();
    } else {
      alert('Failed to enable account: ' + result.error);
    }
  };

  const handleTestCheck = () => {
    if (!testEmail || !testUserId) {
      alert('Please enter both email and user ID to test');
      return;
    }
    
    const isDisabled = isAccountDisabled(testUserId, testEmail);
    alert(`Account ${testEmail} is ${isDisabled ? 'DISABLED' : 'ACTIVE'}`);
  };

  if (!user?.isAdmin) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Admin Access Required
        </h3>
        <p className="text-red-600 dark:text-red-300">
          Only administrators can view and manage disabled accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Disabled Accounts Management
        </h2>
        
        {/* Test Account Status */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">
            Test Account Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="email"
              placeholder="Enter email to test"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Enter user ID to test"
              value={testUserId}
              onChange={(e) => setTestUserId(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={handleTestCheck}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            Check Account Status
          </button>
        </div>

        {/* Disabled Accounts List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Disabled Accounts ({disabledAccounts.length})
            </h3>
            <button
              onClick={refreshDisabledAccounts}
              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md transition-colors"
            >
              Refresh
            </button>
          </div>

          {disabledAccounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No disabled accounts found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {disabledAccounts.map((account) => (
                <div
                  key={account.userId}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {account.email}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      User ID: {account.userId}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Disabled: {new Date(account.disabledAt).toLocaleString()}
                    </div>
                    {account.reason && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Reason: {account.reason}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleEnableAccount(account.userId)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors"
                  >
                    Enable Account
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Current User Info */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
          Your Account Status
        </h3>
        <p className="text-green-600 dark:text-green-300">
          <strong>Email:</strong> {user.email}<br />
          <strong>User ID:</strong> {user.userId}<br />
          <strong>Status:</strong> {isAccountDisabled(user.userId, user.email) ? 
            <span className="text-red-600 dark:text-red-400">DISABLED</span> : 
            <span className="text-green-600 dark:text-green-400">ACTIVE</span>
          }
        </p>
      </div>
    </div>
  );
};

export default DisabledAccountsDemo;
