'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronDown,
  X,
  Search,
  Check,
  Crown,
  Sparkles,
  Loader2,
  AlertCircle,
  UserPlus,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-toastify';

interface Admin {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  picture?: string;
  isAdmin: boolean;
  status?: boolean;
  bio?: string;
}

interface AdminSelectProps {
  selectedAdmins: string[];
  onAdminsChange: (adminIds: string[]) => void;
  className?: string;
  placeholder?: string;
  maxSelections?: number;
  showSelectedCount?: boolean;
  allowSearch?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AdminSelect: React.FC<AdminSelectProps> = ({
  selectedAdmins,
  onAdminsChange,
  className = '',
  placeholder = 'Select admin participants',
  maxSelections,
  showSelectedCount = true,
  allowSearch = true,
  multiple = true,
  disabled = false,
  size = 'md',
}) => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const sizeConfig = {
    sm: {
      button: 'px-3 py-2 text-sm',
      dropdown: 'max-h-60',
      avatar: 'w-8 h-8 text-xs',
      selectedAvatar: 'w-6 h-6 text-xs',
      icon: 16,
      selectedIcon: 14
    },
    md: {
      button: 'px-4 py-3 text-base',
      dropdown: 'max-h-72',
      avatar: 'w-10 h-10 text-sm',
      selectedAvatar: 'w-8 h-8 text-sm',
      icon: 18,
      selectedIcon: 16
    },
    lg: {
      button: 'px-6 py-4 text-lg',
      dropdown: 'max-h-80',
      avatar: 'w-12 h-12 text-base',
      selectedAvatar: 'w-10 h-10 text-base',
      icon: 20,
      selectedIcon: 18
    }
  };

  const config = sizeConfig[size];

  // Helper function to get admin display name
  const getAdminDisplayName = (admin: Admin): string => {
    if (admin.name) return admin.name;
    if (admin.firstName && admin.lastName) return `${admin.firstName} ${admin.lastName}`;
    if (admin.firstName) return admin.firstName;
    if (admin.lastName) return admin.lastName;
    return 'Unknown Admin';
  };

  // Fetch admins from API
  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/users?limit=100');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const data = await response.json();
      const allUsers = data.users || [];
      
      // Filter only admin users
      const adminUsers = allUsers.filter((user: Admin) => user.isAdmin === true);
      
      setAdmins(adminUsers);
      setFilteredAdmins(adminUsers);
    } catch (error) {
      console.error('Error fetching admins:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load admin users';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdminSelect = useCallback((adminId: string) => {
    if (disabled) return;

    if (multiple) {
      if (selectedAdmins.includes(adminId)) {
        // Remove admin
        onAdminsChange(selectedAdmins.filter(id => id !== adminId));
      } else {
        // Add admin (check max selections)
        if (maxSelections && selectedAdmins.length >= maxSelections) {
          toast.warning(`Maximum ${maxSelections} admin${maxSelections > 1 ? 's' : ''} allowed`);
          return;
        }
        onAdminsChange([...selectedAdmins, adminId]);
      }
    } else {
      // Single selection
      onAdminsChange(selectedAdmins.includes(adminId) ? [] : [adminId]);
      setIsOpen(false);
      setSearchTerm('');
    }
  }, [disabled, multiple, selectedAdmins, maxSelections, onAdminsChange]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);


  // Filter admins based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAdmins(admins);
    } else {
      const filtered = admins.filter(admin => {
        const name = getAdminDisplayName(admin);
        const email = admin.email || '';
        const bio = admin.bio || '';
        
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               bio.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredAdmins(filtered);
    }
    setFocusedIndex(-1);
  }, [searchTerm, admins]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => 
            prev < filteredAdmins.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : filteredAdmins.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < filteredAdmins.length) {
            handleAdminSelect(filteredAdmins[focusedIndex]._id);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, filteredAdmins, handleAdminSelect]);



  const removeAdmin = (adminId: string) => {
    if (disabled) return;
    onAdminsChange(selectedAdmins.filter(id => id !== adminId));
  };

  const clearAll = () => {
    if (disabled) return;
    onAdminsChange([]);
  };

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen && allowSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const selectedAdminObjects = admins.filter(admin => selectedAdmins.includes(admin._id));
  const availableAdmins = filteredAdmins.filter(admin => !selectedAdmins.includes(admin._id));

  const getButtonText = () => {
    if (selectedAdmins.length === 0) return placeholder;
    if (selectedAdmins.length === 1) {
      const admin = selectedAdminObjects[0];
      return admin ? getAdminDisplayName(admin) : '1 admin selected';
    }
    if (selectedAdmins.length <= 3) {
      const names = selectedAdminObjects.map(admin => getAdminDisplayName(admin)).join(', ');
      return names;
    }
    return `${selectedAdmins.length} admins selected`;
  };

  const getSelectedAdminNames = () => {
    return selectedAdminObjects.map(admin => getAdminDisplayName(admin)).join(', ');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(110,231,216,0.35),transparent_55%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_85%,rgba(30,90,168,0.25),transparent_55%)]"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2FD1C5]/60 to-transparent"></div>
      </div>
      <div className="relative z-10">
      {/* Main Select Button */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <button
            type="button"
            onClick={toggleDropdown}
            disabled={disabled}
            className={`
              w-full flex items-center justify-between ${config.button}
              bg-gradient-to-r from-[#0B1C2D]/90 to-[#102A3A]/90 
              border border-[#1E3A4A] rounded-xl text-white 
              hover:border-[#2FD1C5]/40 hover:from-[#0B1C2D]/80 hover:to-[#102A3A]/80
              focus:outline-none focus:ring-2 focus:ring-[#2FD1C5]/50 focus:border-[#2FD1C5]/50
              transition-all duration-300 backdrop-blur-sm
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${isOpen ? 'ring-2 ring-[#2FD1C5]/50 border-[#2FD1C5]/50' : ''}
              group
            `}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative">
                <Crown 
                  size={config.icon} 
                  className={`
                    text-yellow-400 transition-all duration-300
                    ${isOpen ? 'text-yellow-300 scale-110' : ''}
                    ${selectedAdmins.length > 0 ? 'text-yellow-300' : ''}
                  `} 
                />
                {selectedAdmins.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                    <Sparkles size={8} className="text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-left">
                <span className={`
                  block truncate font-medium
                  ${selectedAdmins.length > 0 ? 'text-white' : 'text-[#9FB3C8]'}
                `}>
                  {getButtonText()}
                </span>
                {showSelectedCount && selectedAdmins.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs text-[#7B8A9A]">
                      {multiple ? `${selectedAdmins.length} of ${admins.length} selected` : 'Selected'}
                    </span>
                    {selectedAdmins.length > 3 && (
                      <div className="text-xs text-[#6EE7D8] truncate" title={getSelectedAdminNames()}>
                        {getSelectedAdminNames().length > 40 
                          ? `${getSelectedAdminNames().substring(0, 40)}...` 
                          : getSelectedAdminNames()}
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
                  text-[#7B8A9A] transition-all duration-300
                  ${isOpen ? 'rotate-180 text-[#6EE7D8]' : 'group-hover:text-[#E6F1F5]'}
                `} 
              />
            </div>
          </button>
          
          {/* Clear All Button - Outside main button to avoid nesting */}
          {selectedAdmins.length > 0 && multiple && (
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
            <X size={config.selectedIcon} className="text-[#7B8A9A] group-hover/clear:text-red-400" />
          </button>
        )}
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className={`
            absolute top-full left-0 right-0 mt-2 
            bg-[#0B1C2D]/95 backdrop-blur-xl border border-[#1E3A4A] 
            rounded-xl shadow-2xl z-50 ${config.dropdown} overflow-hidden
            animate-in slide-in-from-top-2 duration-200
          `}>
            {/* Search Input */}
            {allowSearch && (
              <div className="p-4 border-b border-[#1E3A4A]">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8A9A]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search admin users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#102A3A]/60 border border-[#1E3A4A] rounded-lg text-white placeholder-[#6B8299] focus:outline-none focus:ring-2 focus:ring-[#2FD1C5]/50 focus:border-[#2FD1C5]/50 transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Admin List */}
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <Loader2 size={24} className="mx-auto mb-2 animate-spin text-[#6EE7D8]" />
                  <span className="text-sm text-[#7B8A9A]">Loading admin users...</span>
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-400">
                  <AlertCircle size={24} className="mx-auto mb-2" />
                  <span className="text-sm">{error}</span>
                  <button
                    onClick={fetchAdmins}
                    className="block mx-auto mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs transition-colors duration-200"
                  >
                    Retry
                  </button>
                </div>
              ) : availableAdmins.length === 0 ? (
                <div className="p-6 text-center text-[#7B8A9A]">
                  <UserPlus size={24} className="mx-auto mb-2" />
                  <span className="text-sm">
                    {searchTerm ? 'No admin users found matching your search' : 'No admin users available'}
                  </span>
                </div>
              ) : (
                <div className="p-2">
                  {availableAdmins.map((admin, index) => (
                    <button
                      key={admin._id}
                      type="button"
                      onClick={() => handleAdminSelect(admin._id)}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                        hover:bg-white/10 focus:outline-none focus:bg-white/10
                        ${focusedIndex === index ? 'bg-white/10' : ''}
                        ${!admin.status ? 'opacity-60' : ''}
                      `}>
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className={`
                          ${config.avatar} bg-gradient-to-br from-yellow-500 to-orange-500 
                          rounded-full flex items-center justify-center text-white font-semibold
                          ring-2 ring-yellow-400/20
                        `}>
                          {admin.picture ? (
                            <Image 
                              src={admin.picture} 
                              alt={getAdminDisplayName(admin)} 
                              width={32}
                              height={32}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            getAdminDisplayName(admin).charAt(0)?.toUpperCase() || '?'
                          )}
                        </div>
                        <Crown size={12} className="absolute -top-1 -right-1 text-yellow-400 drop-shadow-sm" />
                        {!admin.status && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-[#0B1C2D]" />
                        )}
                      </div>

                      {/* Admin Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium truncate">
                            {getAdminDisplayName(admin)}
                          </span>
                          <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-medium">
                            Admin
                          </span>
                          {!admin.status && (
                            <span className="text-xs bg-red-400/20 text-red-400 px-2 py-0.5 rounded-full font-medium">
                              Inactive
                            </span>
                          )}
                        </div>
                        <span className="text-[#7B8A9A] text-xs truncate block">
                          {admin.email || 'No email'}
                        </span>
                        {admin.bio && (
                          <span className="text-[#6B8299] text-xs truncate block mt-1">
                            {admin.bio}
                          </span>
                        )}
                      </div>

                      {/* Selection Indicator */}
                      <div className="flex-shrink-0">
                      <div className="w-5 h-5 rounded-full border-2 border-[#2FD1C5]/60 flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#2FD1C5] rounded-full opacity-0 scale-0 transition-all duration-200" />
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

      {/* Selected Admins Display */}
      {selectedAdminObjects.length > 0 && multiple && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white flex items-center gap-2">
              <Check size={16} className="text-green-400" />
              Selected Admin Participants
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7B8A9A]">
                {selectedAdminObjects.length} of {admins.length}
              </span>
              {maxSelections && (
                <span className="text-xs text-yellow-400">
                  (max {maxSelections})
                </span>
              )}
            </div>
          </div>
          
          {/* Names Summary */}
          <div className="bg-[#0B1C2D]/50 border border-[#1E3A4A] rounded-lg p-3">
            <div className="text-xs font-medium text-[#9FB3C8] mb-1">Selected Admin Names:</div>
            <div className="text-sm text-white leading-relaxed">
              {getSelectedAdminNames()}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
            {selectedAdminObjects.map((admin) => (
              <div
                key={admin._id}
                className="flex items-center gap-3 p-2 bg-gradient-to-r from-[#0B1C2D]/60 to-[#102A3A]/60 rounded-lg border border-[#1E3A4A] hover:border-[#2FD1C5]/40 transition-all duration-200"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`
                    ${config.selectedAvatar} bg-gradient-to-br from-yellow-500 to-orange-500 
                    rounded-full flex items-center justify-center text-white font-semibold
                  `}>
                    {admin.picture ? (
                      <Image 
                        src={admin.picture} 
                        alt={getAdminDisplayName(admin)} 
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      getAdminDisplayName(admin).charAt(0)?.toUpperCase() || '?'
                    )}
                  </div>
                  <Crown size={10} className="absolute -top-1 -right-1 text-yellow-400" />
                </div>

                {/* Admin Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium truncate">
                      {getAdminDisplayName(admin)}
                    </span>
                    <Crown size={12} className="text-yellow-400" />
                  </div>
                  <span className="text-[#7B8A9A] text-xs truncate">
                    {admin.email || 'No email'}
                  </span>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeAdmin(admin._id)}
                  disabled={disabled}
                  className="p-1 hover:bg-red-500/20 rounded-full transition-colors duration-200 group/remove flex-shrink-0"
                >
                  <X size={config.selectedIcon} className="text-[#7B8A9A] group-hover/remove:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminSelect;
