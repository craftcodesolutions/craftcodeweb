'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronDown, 
  Crown, 
  X, 
  Users, 
  Search, 
  Check, 
  UserPlus,
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-toastify';

interface User {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  picture?: string;
  isAdmin?: boolean;
  status?: boolean;
  bio?: string;
}

interface EnhancedUserSelectProps {
  selectedUsers: string[];
  onUsersChange: (userIds: string[]) => void;
  className?: string;
  placeholder?: string;
  maxSelections?: number;
  showSelectedCount?: boolean;
  allowSearch?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const EnhancedUserSelect = ({ 
  selectedUsers = [],
  onUsersChange,
  className = '',
  placeholder = 'Select users',
  maxSelections,
  showSelectedCount = true,
  allowSearch = true,
  multiple = true,
  disabled = false,
  size = 'md'
}: EnhancedUserSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'p-2 text-sm',
      dropdown: 'max-h-48',
      avatar: 'w-6 h-6 text-xs',
      selectedAvatar: 'w-5 h-5 text-xs',
      icon: 16,
      selectedIcon: 12
    },
    md: {
      button: 'p-3 text-sm',
      dropdown: 'max-h-64',
      avatar: 'w-8 h-8 text-sm',
      selectedAvatar: 'w-6 h-6 text-xs',
      icon: 18,
      selectedIcon: 14
    },
    lg: {
      button: 'p-4 text-base',
      dropdown: 'max-h-80',
      avatar: 'w-10 h-10 text-base',
      selectedAvatar: 'w-8 h-8 text-sm',
      icon: 20,
      selectedIcon: 16
    }
  };

  const config = sizeConfig[size];

  // Helper function to get user display name
  const getUserDisplayName = (user: User): string => {
    if (user.name) return user.name;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return 'Unknown User';
  };

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/users?limit=100');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const data = await response.json();
      const fetchedUsers = data.users || [];
      
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load users';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => {
        const name = getUserDisplayName(user);
        const email = user.email || '';
        const bio = user.bio || '';
        
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               bio.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredUsers(filtered);
    }
    setFocusedIndex(-1);
  }, [searchTerm, users]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserSelect = useCallback((userId: string) => {
    if (disabled) return;

    if (multiple) {
      if (selectedUsers.includes(userId)) {
        // Remove user
        onUsersChange(selectedUsers.filter(id => id !== userId));
      } else {
        // Add user (check max selections)
        if (maxSelections && selectedUsers.length >= maxSelections) {
          toast.warning(`Maximum ${maxSelections} users can be selected`);
          return;
        }
        onUsersChange([...selectedUsers, userId]);
      }
    } else {
      // Single selection
      onUsersChange([userId]);
      setIsOpen(false);
      setSearchTerm('');
    }
  }, [disabled, multiple, selectedUsers, maxSelections, onUsersChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      const availableUsers = filteredUsers.filter(user => !selectedUsers.includes(user._id));

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => 
            prev < availableUsers.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : availableUsers.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < availableUsers.length) {
            handleUserSelect(availableUsers[focusedIndex]._id);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setSearchTerm('');
          setFocusedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredUsers, selectedUsers, focusedIndex, handleUserSelect]);



  const removeUser = (userId: string) => {
    if (disabled) return;
    onUsersChange(selectedUsers.filter(id => id !== userId));
  };

  const clearAll = () => {
    if (disabled) return;
    onUsersChange([]);
  };

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen && allowSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const selectedUserObjects = users.filter(user => selectedUsers.includes(user._id));
  const availableUsers = filteredUsers.filter(user => !selectedUsers.includes(user._id));

  const getButtonText = () => {
    if (selectedUsers.length === 0) return placeholder;
    if (selectedUsers.length === 1) {
      const user = selectedUserObjects[0];
      return user ? getUserDisplayName(user) : '1 user selected';
    }
    if (selectedUsers.length <= 3) {
      const names = selectedUserObjects.map(user => getUserDisplayName(user)).join(', ');
      return names;
    }
    return `${selectedUsers.length} users selected`;
  };

  const getSelectedUserNames = () => {
    return selectedUserObjects.map(user => getUserDisplayName(user)).join(', ');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Select Button */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <button
            type="button"
            onClick={toggleDropdown}
            disabled={disabled}
            className={`
              w-full flex items-center justify-between ${config.button}
              bg-gradient-to-r from-slate-800/80 to-slate-700/80 
              border border-white/10 rounded-xl text-white 
              hover:border-white/20 hover:from-slate-700/80 hover:to-slate-600/80
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50
              transition-all duration-300 backdrop-blur-sm
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${isOpen ? 'ring-2 ring-blue-500/50 border-blue-400/50' : ''}
              group
            `}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative">
                <Users 
                  size={config.icon} 
                  className={`
                    text-blue-400 transition-all duration-300
                    ${isOpen ? 'text-blue-300 scale-110' : ''}
                    ${selectedUsers.length > 0 ? 'text-green-400' : ''}
                  `} 
                />
                {selectedUsers.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                    <Sparkles size={8} className="text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-left">
                <span className={`
                  block truncate font-medium
                  ${selectedUsers.length > 0 ? 'text-white' : 'text-gray-300'}
                `}>
                  {getButtonText()}
                </span>
                {showSelectedCount && selectedUsers.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400">
                      {multiple ? `${selectedUsers.length} of ${users.length} selected` : 'Selected'}
                    </span>
                    {selectedUsers.length > 3 && (
                      <div className="text-xs text-blue-300 truncate" title={getSelectedUserNames()}>
                        {getSelectedUserNames().length > 40 
                          ? `${getSelectedUserNames().substring(0, 40)}...` 
                          : getSelectedUserNames()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ChevronDown 
                size={config.icon} 
                className={`
                  text-gray-400 transition-all duration-300
                  ${isOpen ? 'rotate-180 text-blue-400' : 'group-hover:text-gray-300'}
                `} 
              />
            </div>
          </button>
          
          {/* Clear All Button - Outside main button to avoid nesting */}
          {selectedUsers.length > 0 && multiple && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="absolute right-10 top-1/2 -translate-y-1/2 p-1 hover:bg-red-500/20 rounded-full transition-colors duration-200 group/clear z-10"
              disabled={disabled}
              title="Clear all selections"
            >
              <X size={config.selectedIcon} className="text-gray-400 group-hover/clear:text-red-400" />
            </button>
          )}
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className={`
            absolute top-full left-0 right-0 mt-2 
            bg-slate-800/95 backdrop-blur-xl border border-white/10 
            rounded-xl shadow-2xl z-50 ${config.dropdown} overflow-hidden
            animate-in slide-in-from-top-2 duration-200
          `}>
            {/* Search Input */}
            {allowSearch && (
              <div className="p-3 border-b border-white/10">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto max-h-48">
              {loading ? (
                <div className="p-6 text-center text-gray-400">
                  <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-400" />
                  <span>Loading users...</span>
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-400">
                  <AlertCircle size={24} className="mx-auto mb-2" />
                  <span className="text-sm">{error}</span>
                  <button
                    onClick={fetchUsers}
                    className="block mx-auto mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs transition-colors duration-200"
                  >
                    Retry
                  </button>
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <UserPlus size={24} className="mx-auto mb-2" />
                  <span className="text-sm">
                    {searchTerm ? 'No users found matching your search' : 
                     users.length === 0 ? 'No users available' : 'All users selected'}
                  </span>
                </div>
              ) : (
                <div className="p-2">
                  {availableUsers.map((user, index) => (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => handleUserSelect(user._id)}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left
                        ${index === focusedIndex 
                          ? 'bg-blue-500/20 border border-blue-400/30' 
                          : 'hover:bg-slate-700/50 border border-transparent'
                        }
                      `}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className={`
                          ${config.avatar} bg-gradient-to-br from-blue-500 to-purple-500 
                          rounded-full flex items-center justify-center text-white font-semibold
                          ring-2 ring-white/10
                        `}>
                          {user.picture ? (
                            <Image 
                              src={user.picture} 
                              alt={user.name || 'User'} 
                              width={32}
                              height={32}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            user.name?.charAt(0)?.toUpperCase() || '?'
                          )}
                        </div>
                        {user.isAdmin && (
                          <Crown size={12} className="absolute -top-1 -right-1 text-yellow-400 drop-shadow-sm" />
                        )}
                        {!user.status && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-slate-800" />
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium truncate">
                            {getUserDisplayName(user)}
                          </span>
                          {user.isAdmin && (
                            <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-medium">
                              Admin
                            </span>
                          )}
                          {!user.status && (
                            <span className="text-xs bg-red-400/20 text-red-400 px-2 py-0.5 rounded-full font-medium">
                              Inactive
                            </span>
                          )}
                        </div>
                        <span className="text-gray-400 text-xs truncate block">
                          {user.email || 'No email'}
                        </span>
                        {user.bio && (
                          <span className="text-gray-500 text-xs truncate block mt-1">
                            {user.bio}
                          </span>
                        )}
                      </div>

                      {/* Selection Indicator */}
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full opacity-0 scale-0 transition-all duration-200" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Users Display */}
      {selectedUserObjects.length > 0 && multiple && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white flex items-center gap-2">
              <Check size={16} className="text-green-400" />
              Selected Users
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {selectedUserObjects.length} of {users.length}
              </span>
              {maxSelections && (
                <span className="text-xs text-blue-400">
                  (max {maxSelections})
                </span>
              )}
            </div>
          </div>
          
          {/* Names Summary */}
          <div className="bg-slate-700/20 border border-white/5 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-300 mb-1">Selected Names:</div>
            <div className="text-sm text-white leading-relaxed">
              {getSelectedUserNames()}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
            {selectedUserObjects.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 p-2 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-lg border border-white/5 hover:border-white/10 transition-all duration-200"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`
                    ${config.selectedAvatar} bg-gradient-to-br from-blue-500 to-purple-500 
                    rounded-full flex items-center justify-center text-white font-semibold
                  `}>
                    {user.picture ? (
                      <Image 
                        src={user.picture} 
                        alt={user.name || 'User'} 
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      user.name?.charAt(0)?.toUpperCase() || '?'
                    )}
                  </div>
                  {user.isAdmin && (
                    <Crown size={10} className="absolute -top-1 -right-1 text-yellow-400" />
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium truncate">
                      {getUserDisplayName(user)}
                    </span>
                    {user.isAdmin && (
                      <Crown size={12} className="text-yellow-400" />
                    )}
                  </div>
                  <span className="text-gray-400 text-xs truncate">
                    {user.email || 'No email'}
                  </span>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeUser(user._id)}
                  disabled={disabled}
                  className="p-1 hover:bg-red-500/20 rounded-full transition-colors duration-200 group/remove flex-shrink-0"
                >
                  <X size={config.selectedIcon} className="text-gray-400 group-hover/remove:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedUserSelect;
