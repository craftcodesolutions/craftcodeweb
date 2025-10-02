'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Crown, X, Users } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-toastify';

interface User {
  _id: string;
  name: string;
  email: string;
  picture?: string;
  role?: string;
}

interface ParticipantSelectorProps {
  selectedParticipants: string[];
  onParticipantsChange: (participants: string[]) => void;
  className?: string;
}

const ParticipantSelector = ({ 
  selectedParticipants, 
  onParticipantsChange, 
  className = '' 
}: ParticipantSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users?limit=100');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserSelect = (userId: string) => {
    if (selectedParticipants.includes(userId)) {
      // Remove user
      onParticipantsChange(selectedParticipants.filter(id => id !== userId));
    } else {
      // Add user
      onParticipantsChange([...selectedParticipants, userId]);
    }
  };

  const removeParticipant = (userId: string) => {
    onParticipantsChange(selectedParticipants.filter(id => id !== userId));
  };

  const selectedUsers = users.filter(user => selectedParticipants.includes(user._id));
  const availableUsers = users.filter(user => !selectedParticipants.includes(user._id));

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Dropdown Button */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 bg-slate-800/50 border border-white/10 rounded-xl text-white hover:border-white/20 transition-all duration-300"
        >
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-400" />
            <span className="text-sm">
              {selectedParticipants.length > 0 
                ? `${selectedParticipants.length} participant${selectedParticipants.length > 1 ? 's' : ''} selected`
                : 'Select meeting participants'
              }
            </span>
          </div>
          <ChevronDown 
            size={18} 
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto mb-2"></div>
                Loading users...
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {users.length === 0 ? 'No users available' : 'All users selected'}
              </div>
            ) : (
              <div className="p-2">
                {availableUsers.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => handleUserSelect(user._id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-700/50 rounded-lg transition-all duration-200 text-left"
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {user.picture ? (
                          <Image 
                            src={user.picture} 
                            alt={user.name} 
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      {user.role === 'admin' && (
                        <Crown size={12} className="absolute -top-1 -right-1 text-yellow-400" />
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium truncate">
                          {user.name}
                        </span>
                        {user.role === 'admin' && (
                          <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400 text-xs truncate">
                        {user.email}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Participants Display */}
      {selectedUsers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">Selected Participants</span>
            <span className="text-xs text-gray-400">
              {selectedUsers.length} of {users.length} users
            </span>
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {selectedUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {user.picture ? (
                      <Image 
                        src={user.picture} 
                        alt={user.name} 
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {user.role === 'admin' && (
                    <Crown size={10} className="absolute -top-1 -right-1 text-yellow-400" />
                  )}
                </div>
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium truncate">
                      {user.name}
                    </span>
                    {user.role === 'admin' && (
                      <Crown size={12} className="text-yellow-400" />
                    )}
                  </div>
                  <span className="text-gray-400 text-xs truncate">
                    {user.email}
                  </span>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeParticipant(user._id)}
                  className="p-1 hover:bg-red-500/20 rounded-full transition-colors duration-200 group"
                >
                  <X size={14} className="text-gray-400 group-hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantSelector;
