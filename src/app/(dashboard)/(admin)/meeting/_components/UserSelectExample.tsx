'use client';

import { useState } from 'react';
import EnhancedUserSelect from './EnhancedUserSelect';
import { Users, Settings, UserCheck } from 'lucide-react';

const UserSelectExample = () => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [singleUser, setSingleUser] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Enhanced User Select Component</h1>
        <p className="text-gray-400">Modern, feature-rich user selection with advanced functionality</p>
      </div>

      {/* Multi-Select Example */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="text-blue-400" size={24} />
          <h2 className="text-xl font-semibold text-white">Multi-Select with Search</h2>
        </div>
        <p className="text-gray-400 mb-4">Select multiple users with search functionality and visual feedback</p>
        
        <EnhancedUserSelect
          selectedUsers={selectedUsers}
          onUsersChange={setSelectedUsers}
          placeholder="Select team members"
          allowSearch={true}
          multiple={true}
          showSelectedCount={true}
          size="md"
        />
        
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-sm">
              Selected {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''}: {selectedUsers.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Single Select Example */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <UserCheck className="text-green-400" size={24} />
          <h2 className="text-xl font-semibold text-white">Single Select</h2>
        </div>
        <p className="text-gray-400 mb-4">Select a single user for assignment or ownership</p>
        
        <EnhancedUserSelect
          selectedUsers={singleUser}
          onUsersChange={setSingleUser}
          placeholder="Select project owner"
          allowSearch={true}
          multiple={false}
          showSelectedCount={false}
          size="md"
        />
        
        {singleUser.length > 0 && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm">
              Selected user: {singleUser[0]}
            </p>
          </div>
        )}
      </div>

      {/* Limited Selection Example */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="text-purple-400" size={24} />
          <h2 className="text-xl font-semibold text-white">Limited Selection (Max 3)</h2>
        </div>
        <p className="text-gray-400 mb-4">Select up to 3 team members with size variants</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Large Size</label>
            <EnhancedUserSelect
              selectedUsers={teamMembers}
              onUsersChange={setTeamMembers}
              placeholder="Select up to 3 team members"
              allowSearch={true}
              multiple={true}
              maxSelections={3}
              showSelectedCount={true}
              size="lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">Medium Size</label>
            <EnhancedUserSelect
              selectedUsers={teamMembers}
              onUsersChange={setTeamMembers}
              placeholder="Select up to 3 team members"
              allowSearch={true}
              multiple={true}
              maxSelections={3}
              showSelectedCount={true}
              size="md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">Small Size</label>
            <EnhancedUserSelect
              selectedUsers={teamMembers}
              onUsersChange={setTeamMembers}
              placeholder="Select up to 3 team members"
              allowSearch={true}
              multiple={true}
              maxSelections={3}
              showSelectedCount={true}
              size="sm"
            />
          </div>
        </div>
        
        {teamMembers.length > 0 && (
          <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-purple-400 text-sm">
              Team members ({teamMembers.length}/3): {teamMembers.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Disabled State Example */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="text-gray-400" size={24} />
          <h2 className="text-xl font-semibold text-white">Disabled State</h2>
        </div>
        <p className="text-gray-400 mb-4">Component in disabled state</p>
        
        <EnhancedUserSelect
          selectedUsers={['user1', 'user2']}
          onUsersChange={() => {}}
          placeholder="This is disabled"
          disabled={true}
          multiple={true}
          size="md"
        />
      </div>

      {/* Features List */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">✨ Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Dynamic data fetching from /api/users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Real-time search and filtering</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Multi-select and single-select modes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Keyboard navigation support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Maximum selection limits</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Three size variants (sm, md, lg)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Loading states and error handling</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Admin badges and status indicators</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Modern animations and transitions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Responsive design</span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Code Example */}
      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📝 Usage Example</h3>
        <pre className="text-sm text-gray-300 overflow-x-auto">
          <code>{`import EnhancedUserSelect from './EnhancedUserSelect';

const MyComponent = () => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  return (
    <EnhancedUserSelect
      selectedUsers={selectedUsers}
      onUsersChange={setSelectedUsers}
      placeholder="Select users"
      allowSearch={true}
      multiple={true}
      maxSelections={5}
      showSelectedCount={true}
      size="md"
    />
  );
};`}</code>
        </pre>
      </div>
    </div>
  );
};

export default UserSelectExample;
