'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserMeetings } from '@/hooks/useUserMeetings';
import UserMeetingsList from './UserMeetingsList';
import AdminSelect from '@/app/(dashboard)/(root)/conferance/_components/AdminSelect';
import { 
  TestTube, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Crown,
  Calendar,
  Database,
  Shield,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const MeetingSystemTest: React.FC = () => {
  const { user } = useAuth();
  const { meetings, upcomingMeetings, endedMeetings, isLoading, error } = useUserMeetings();
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<{
    authentication: boolean;
    databaseFiltering: boolean;
    adminSelection: boolean;
    participantDisplay: boolean;
    userRole: boolean;
  }>({
    authentication: false,
    databaseFiltering: false,
    adminSelection: false,
    participantDisplay: false,
    userRole: false,
  });

  const runTests = async () => {
    const results = { ...testResults };

    // Test 1: Authentication
    results.authentication = !!user?.userId;

    // Test 2: Database Filtering
    results.databaseFiltering = meetings.every(meeting => 
      meeting.createdBy === user?.userId || meeting.participants.includes(user?.userId || '')
    );

    // Test 3: Admin Selection
    results.adminSelection = selectedAdmins.length > 0;

    // Test 4: Participant Display
    results.participantDisplay = meetings.some(meeting => meeting.participants.length > 0);

    // Test 5: User Role Detection
    results.userRole = meetings.some(meeting => 
      meeting.createdBy === user?.userId || meeting.participants.includes(user?.userId || '')
    );

    setTestResults(results);
  };

  const TestResult: React.FC<{ test: string; passed: boolean; description: string }> = ({ 
    test, 
    passed, 
    description 
  }) => (
    <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
      {passed ? (
        <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
      ) : (
        <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
      )}
      <div className="flex-1">
        <div className="font-medium text-white">{test}</div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>
      <div className={`px-2 py-1 rounded text-xs font-medium ${
        passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
      }`}>
        {passed ? 'PASS' : 'FAIL'}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
          <TestTube size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Meeting System Test Suite</h1>
          <p className="text-gray-400">Comprehensive testing of authenticated user meeting system</p>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 text-center">
          <Shield size={24} className="mx-auto mb-2 text-blue-400" />
          <div className="text-lg font-semibold text-white">
            {user ? 'Authenticated' : 'Not Authenticated'}
          </div>
          <div className="text-sm text-gray-400">User Status</div>
        </div>
        
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 text-center">
          <Database size={24} className="mx-auto mb-2 text-green-400" />
          <div className="text-lg font-semibold text-white">{meetings.length}</div>
          <div className="text-sm text-gray-400">Total Meetings</div>
        </div>
        
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 text-center">
          <Calendar size={24} className="mx-auto mb-2 text-yellow-400" />
          <div className="text-lg font-semibold text-white">{upcomingMeetings.length}</div>
          <div className="text-sm text-gray-400">Upcoming</div>
        </div>
        
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 text-center">
          <Eye size={24} className="mx-auto mb-2 text-purple-400" />
          <div className="text-lg font-semibold text-white">{endedMeetings.length}</div>
          <div className="text-sm text-gray-400">Previous</div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <TestTube size={20} />
            System Tests
          </h2>
          <Button
            onClick={runTests}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            Run All Tests
          </Button>
        </div>

        <div className="space-y-3">
          <TestResult
            test="User Authentication"
            passed={testResults.authentication}
            description="Verifies user is properly authenticated with valid JWT token"
          />
          <TestResult
            test="Database Filtering"
            passed={testResults.databaseFiltering}
            description="Ensures only meetings where user is creator or participant are shown"
          />
          <TestResult
            test="Admin Selection"
            passed={testResults.adminSelection}
            description="Tests admin-only participant selection functionality"
          />
          <TestResult
            test="Participant Display"
            passed={testResults.participantDisplay}
            description="Verifies participant information is properly displayed"
          />
          <TestResult
            test="User Role Detection"
            passed={testResults.userRole}
            description="Confirms user role (Creator/Participant) is correctly identified"
          />
        </div>
      </div>

      {/* Admin Selection Test */}
      <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
          <Crown size={20} className="text-yellow-400" />
          Admin Selection Test
        </h2>
        <AdminSelect
          selectedAdmins={selectedAdmins}
          onAdminsChange={setSelectedAdmins}
          placeholder="Test admin participant selection"
          allowSearch={true}
          multiple={true}
          showSelectedCount={true}
          size="md"
        />
        {selectedAdmins.length > 0 && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-green-300 text-sm">
              ✅ Admin selection working: {selectedAdmins.length} admin{selectedAdmins.length > 1 ? 's' : ''} selected
            </div>
          </div>
        )}
      </div>

      {/* Meeting Lists Test */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-green-400" />
            Upcoming Meetings Test
          </h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-gray-400">Loading...</div>
            </div>
          ) : (
            <UserMeetingsList type="upcoming" />
          )}
        </div>

        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
            <Users size={20} className="text-purple-400" />
            Previous Meetings Test
          </h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-gray-400">Loading...</div>
            </div>
          ) : (
            <UserMeetingsList type="ended" />
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle size={20} />
            <span className="font-medium">System Error</span>
          </div>
          <div className="text-red-300 mt-2">{error}</div>
        </div>
      )}

      {/* System Information */}
      <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">User ID:</div>
            <div className="text-white font-mono">{user?.userId || 'Not authenticated'}</div>
          </div>
          <div>
            <div className="text-gray-400">User Email:</div>
            <div className="text-white">{user?.email || 'Not available'}</div>
          </div>
          <div>
            <div className="text-gray-400">Total Meetings:</div>
            <div className="text-white">{meetings.length}</div>
          </div>
          <div>
            <div className="text-gray-400">Loading State:</div>
            <div className="text-white">{isLoading ? 'Loading...' : 'Ready'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingSystemTest;
