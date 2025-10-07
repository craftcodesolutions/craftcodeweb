'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

interface SessionInfo {
  _id: string;
  deviceId: string;
  userAgent: string;
  ipAddress: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export default function SessionManagementDemo() {
  const { user, refreshToken, isLoading } = useAuth();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Fetch user sessions
  const fetchSessions = async () => {
    if (!user) return;
    
    setLoadingSessions(true);
    try {
      const response = await fetch(`/api/auth/sessions?userId=${user.userId}&activeOnly=true`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
        toast.success(`Found ${data.sessions.length} active sessions`);
      } else {
        toast.error('Failed to fetch sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Error fetching sessions');
    } finally {
      setLoadingSessions(false);
    }
  };

  // Test token refresh
  const testTokenRefresh = async () => {
    try {
      const result = await refreshToken();
      if (result.success) {
        toast.success('Token refreshed successfully!');
      } else {
        toast.error(result.error || 'Token refresh failed');
      }
    } catch (err) {
      console.error('Token refresh error:', err);
      toast.error('Token refresh error');
    }
  };

  // Logout from specific device
  const logoutFromDevice = async (deviceId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/auth/sessions?userId=${user.userId}&deviceId=${deviceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Logged out from device successfully');
        fetchSessions(); // Refresh sessions list
      } else {
        toast.error('Failed to logout from device');
      }
    } catch (err) {
      console.error('Error logging out from device:', err);
      toast.error('Error logging out from device');
    }
  };

  // Logout from all devices
  const logoutFromAllDevices = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/auth/sessions?userId=${user.userId}&allDevices=true`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Logged out from all devices successfully');
        setSessions([]);
      } else {
        toast.error('Failed to logout from all devices');
      }
    } catch (err) {
      console.error('Error logging out from all devices:', err);
      toast.error('Error logging out from all devices');
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Session Management Demo</h3>
        <p className="text-gray-600">Please log in to view session management features.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-6 text-gray-800">🔐 Advanced Session Management</h3>
      
      {/* User Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Current User</h4>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Admin:</strong> {user.isAdmin ? '✅ Yes' : '❌ No'}</p>
        <p><strong>User ID:</strong> {user.userId}</p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={testTokenRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Refreshing...' : '🔄 Test Token Refresh'}
        </button>

        <button
          onClick={fetchSessions}
          disabled={loadingSessions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loadingSessions ? 'Loading...' : '📱 View Active Sessions'}
        </button>

        <button
          onClick={logoutFromAllDevices}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          🚪 Logout All Devices
        </button>
      </div>

      {/* Sessions List */}
      {sessions.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-4">Active Sessions ({sessions.length})</h4>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session._id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      <strong>Device:</strong> {session.deviceId}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>User Agent:</strong> {session.userAgent.substring(0, 50)}...
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>IP:</strong> {session.ipAddress}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Created:</strong> {new Date(session.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Expires:</strong> {new Date(session.expiresAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => logoutFromDevice(session.deviceId)}
                    className="ml-4 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">✨ Session Management Features</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Multi-Device Support:</strong> Track sessions across all devices</li>
          <li>• <strong>Automatic Token Refresh:</strong> Stay logged in when admin updates your account</li>
          <li>• <strong>Real-time Updates:</strong> Get notified when your permissions change</li>
          <li>• <strong>Session Security:</strong> Monitor and control active sessions</li>
          <li>• <strong>Device Management:</strong> Logout from specific devices remotely</li>
        </ul>
      </div>

      {/* Test Instructions */}
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">🧪 Test Instructions</h4>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. Click &quot;View Active Sessions&quot; to see your current sessions</li>
          <li>2. Have an admin update your admin status from the admin panel</li>
          <li>3. Click &quot;Test Token Refresh&quot; to see updated permissions</li>
          <li>4. Notice you stay logged in throughout the process! 🎉</li>
        </ol>
      </div>
    </div>
  );
}
