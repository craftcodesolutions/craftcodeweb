/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter, Check, ChevronDown, Eye, EyeOff, CheckCircle, XCircle, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import debounce from 'lodash.debounce';
import sanitizeHtml from 'sanitize-html';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  picture: string;
  isAdmin: boolean;
  bio: string;
  status: boolean;
  designations: string[];
}

const UsersTable: React.FC = () => {
  const { updateUserByAdmin, updateUserDesignations } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filter, setFilter] = useState({ isAdmin: '', status: '' });
  const [sort, setSort] = useState<{ field: 'name' | 'email' | ''; order: 'asc' | 'desc' | '' }>({ field: '', order: '' });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [expandedBios, setExpandedBios] = useState<{ [key: string]: boolean }>({});
  const [notifications, setNotifications] = useState<{ [key: string]: { type: 'success' | 'error' | 'info'; message: string; timestamp: number } }>({});
  const [pageInput, setPageInput] = useState('');
  const itemsPerPage = 10;

  const designationOptions = ['Developer', 'Designer', 'Manager', 'Tester', 'Analyst', 'Support', 'Lead', 'Architect'];

  const adminOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' },
  ];

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

  const showNotification = (id: string, type: 'success' | 'error' | 'info', message: string) => {
    const timestamp = Date.now();
    setNotifications(prev => ({ ...prev, [id]: { type, message, timestamp } }));

    setTimeout(() => {
      setNotifications(prev => {
        const { [id]: removed, ...rest } = prev;
        return rest;
      });
    }, 3000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => {
      const { [id]: removed, ...rest } = prev;
      return rest;
    });
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  // ==========================================
  // ✅ Debounced & Retry-Safe Fetch Function
  // ==========================================
  const fetchUsers = useCallback(
    debounce(async (page: number, search: string) => {
      setLoading(true);
      let retries = 3;

      try {
        while (retries > 0) {
          try {
            // Build query params safely
            const params = new URLSearchParams({
              page: page.toString(),
              limit: itemsPerPage.toString(),
              search: sanitizeHtml(search),
            });

            if (filter.isAdmin) params.append('isAdmin', filter.isAdmin);
            if (filter.status) params.append('status', filter.status);
            if (sort.field) {
              params.append('sortField', sort.field);
              params.append('sortOrder', sort.order);
            }

            const response = await fetch(`/api/users?${params.toString()}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              cache: 'no-store',
            });

            if (response.ok) {
              const responseData = await response.json();
              const {
                users: fetchedUsers,
                totalPages: serverTotalPages,
                totalUsers: serverTotalUsers,
                currentPage: serverPage,
              } = responseData;

              if (!Array.isArray(fetchedUsers)) {
                throw new Error('Invalid users data: expected an array');
              }

              const formattedUsers: User[] = fetchedUsers.map((user: any) => ({
                _id: user.userId || user._id || '',
                firstName: user.firstName || user.name?.split(' ')[0] || '',
                lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
                name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.email || '',
                picture: user.profileImage || user.picture || '',
                isAdmin: user.isAdmin ?? false,
                bio: user.bio || 'No bio available',
                status: user.status ?? true,
                designations: Array.isArray(user.designations) ? user.designations : [],
              }));

              const calculatedTotalPages = Math.max(
                1,
                Math.ceil((serverTotalUsers || fetchedUsers.length) / itemsPerPage)
              );

              setUsers(formattedUsers);
              setTotalUsers(serverTotalUsers || fetchedUsers.length);
              setTotalPages(
                Number.isInteger(serverTotalPages) && serverTotalPages > 0
                  ? serverTotalPages
                  : calculatedTotalPages
              );

              if (
                Number.isInteger(serverPage) &&
                serverPage > 0 &&
                serverPage <= calculatedTotalPages
              ) {
                setCurrentPage(serverPage);
              }

              return; // ✅ Exit after success
            } else {
              const data = await response.json();
              throw new Error(data?.error || 'Failed to fetch users');
            }
          } catch (error: any) {
            retries--;
            if (retries === 0) {

              setUsers([]);
              setTotalPages(1);
              setTotalUsers(0);
            } else {
              // optional small delay between retries
              await new Promise((res) => setTimeout(res, (4 - retries) * 500));
            }
          }
        }
      } finally {
        setLoading(false);
      }
    }, 300),
    [itemsPerPage]
  );

  // ==========================================
  // ✅ Effect Trigger — Handles All Dependencies
  // ==========================================
  useEffect(() => {
    fetchUsers(currentPage, searchTerm);
    return () => fetchUsers.cancel();
  }, [fetchUsers, currentPage, searchTerm]);
  const safeUsers = Array.isArray(users) ? users : [];
  const filteredUsers = safeUsers;

  const toggleBioExpansion = (userId: string) => {
    setExpandedBios(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const truncateBio = (bio: string, wordLimit: number = 15) => {
    const words = bio.split(' ');
    if (words.length <= wordLimit) return bio;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  const handleCheckboxChange = async (userId: string, field: 'isAdmin' | 'status') => {
    if (!['isAdmin', 'status'].includes(field)) {
      return;
    }

    if (!userId) {
      showNotification('invalid-user', 'error', 'Invalid user ID');
      return;
    }

    const originalUsers = [...users];
    const originalCheckedItems = { ...checkedItems };

    const newValue =
      checkedItems.hasOwnProperty(`${userId}-${field}`)
        ? !checkedItems[`${userId}-${field}`]
        : field === 'isAdmin'
          ? !users.find((u) => u._id === userId)?.isAdmin
          : !users.find((u) => u._id === userId)?.status;

    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, [field]: newValue } : u))
    );
    setCheckedItems((prev) => ({
      ...prev,
      [`${userId}-${field}`]: newValue,
    }));

    try {
      const result = await updateUserByAdmin(userId, field, newValue);

      if (result.success && result.updatedUser) {
        const serverUpdatedUser = result.updatedUser as unknown as User;
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId
              ? {
                ...u,
                [field]: field === 'isAdmin' || field === 'status'
                  ? serverUpdatedUser[field] ?? u[field]
                  : u[field],
                firstName: serverUpdatedUser.firstName || u.firstName,
                lastName: serverUpdatedUser.lastName || u.lastName,
                name: `${serverUpdatedUser.firstName || u.firstName} ${serverUpdatedUser.lastName || u.lastName}`.trim(),
                email: serverUpdatedUser.email || u.email,
                picture: serverUpdatedUser.picture ?? u.picture,
                bio: serverUpdatedUser.bio || u.bio,
                status: typeof serverUpdatedUser.status === 'boolean' ? serverUpdatedUser.status : u.status,
                designations: serverUpdatedUser.designations || u.designations,
              }
              : u
          )
        );

        const updatedUser = users.find(u => u._id === userId);
        showNotification(
          `update-${userId}-${field}`,
          'success',
          `${field === 'isAdmin' ? 'Admin status' : 'Status'} updated for ${updatedUser?.name || 'user'}`
        );
      } else {
        setUsers(originalUsers);
        setCheckedItems(originalCheckedItems);
      }
    } catch (error) {
      setUsers(originalUsers);
      setCheckedItems(originalCheckedItems);
    }
  };

  const handleDesignationsChange = async (userId: string, newDesignations: string[]) => {
    if (!userId) {
      showNotification('invalid-user', 'error', 'Invalid user ID');
      return;
    }

    const originalUsers = [...users];

    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, designations: [...newDesignations].sort() } : u))
    );

    try {
      const result = await updateUserDesignations(userId, newDesignations);

      if (result.success && result.updatedUser) {
        const serverUpdatedUser = result.updatedUser as unknown as User;
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId
              ? {
                ...u,
                designations: serverUpdatedUser.designations || u.designations,
              }
              : u
          )
        );
        showNotification(
          `designations-${userId}`,
          'success',
          `Designations updated for ${users.find((u) => u._id === userId)?.name || 'user'}`
        );
      } else {
        setUsers(originalUsers);
      }
    } catch (error) {
      setUsers(originalUsers);
    }
  };

  const handlePageChange = (page: number) => {

    setCurrentPage(page);
    // setPageInput('');
  };



  const handleSort = (field: 'name' | 'email') => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
    // setCurrentPage(1);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFilterModalOpen(false);
    // setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilter({ isAdmin: '', status: '' });
    setSort({ field: '', order: '' });
    setSearchTerm('');
    // setCurrentPage(1);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 p-6 md:p-10 font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-pink-400 to-red-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>
      <style jsx global>{`
        .custom-select__control {
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          background-color: rgba(255, 255, 255, 0.8);
          padding: 0.5rem 2.5rem 0.5rem 1rem;
          font-size: 0.875rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          position: relative;
        }
        .dark .custom-select__control {
          border-color: #374151;
          background-color: rgba(31, 41, 55, 0.8);
          color: #ffffff;
        }
        .custom-select__control--is-focused {
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
        }
        .dark .custom-select__control--is-focused {
          border-color: #818cf8;
          box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.4);
        }
        .custom-select__menu {
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          background-color: #ffffff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-top: 0.25rem;
          position: absolute;
          width: 100%;
          z-index: 10;
        }
        .dark .custom-select__menu {
          border-color: #374151;
          background-color: #1f2937;
        }
        .custom-select__option {
          padding: 0.75rem 1rem;
          color: #111827;
          font-size: 0.875rem;
          cursor: pointer;
        }
        .dark .custom-select__option {
          color: #ffffff;
        }
        .custom-select__option:hover,
        .custom-select__option--is-focused {
          background-color: #e5e7eb;
        }
        .dark .custom-select__option:hover,
        .dark .custom-select__option--is-focused {
          background-color: #4b5563;
        }
        .custom-select__option--is-selected {
          background-color: #6366f1;
          color: #ffffff;
        }
        .dark .custom-select__option--is-selected {
          background-color: #818cf8;
        }
        .skeleton-pulse {
          background: linear-gradient(
            90deg,
            rgba(229, 231, 235, 0.8) 0%,
            rgba(209, 213, 219, 0.9) 50%,
            rgba(229, 231, 235, 0.8) 100%
          );
          background-size: 200% 100%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>

      <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-10 tracking-tight text-center">
        Manage Users
      </h1>
      <div className="max-w-7xl mx-auto rounded-3xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 shadow-lg overflow-hidden">
        <div className="px-6 py-5 md:px-10 md:py-6">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
            User Management
          </h3>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              All Users
            </h3>
            <div className="flex flex-col gap-4 md:flex-row md:items-center w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute top-1/2 -translate-y-1/2 left-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search users..."
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-full rounded-full border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm py-3 pl-12 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-lg hover:shadow-xl cursor-text"
                  aria-label="Search users"
                />
              </div>
              <button
                id="filter-button"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:rotate-1 cursor-pointer"
                onClick={() => setIsFilterModalOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={isFilterModalOpen}
              >
                <Filter className="h-5 w-5" />
                <span>Filter</span>
              </button>
            </div>
          </div>
          <div className="max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {loading ? (
              <div className="space-y-2">
                <div className="flex gap-4 px-6 py-3">
                  <Skeleton className="h-5 w-[5%]" />
                  <Skeleton className="h-5 w-[8%]" />
                  <Skeleton className="h-5 w-[20%]" />
                  <Skeleton className="h-5 w-[25%]" />
                  <Skeleton className="h-5 w-[25%]" />
                  <Skeleton className="h-5 w-[25%]" />
                  <Skeleton className="h-5 w-[8%]" />
                </div>
                {Array.from({ length: itemsPerPage }).map((_, index) => (
                  <div key={index} className="flex gap-4 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                    <Skeleton className="w-[5%] h-8 rounded-full" />
                    <Skeleton className="h-5 w-[8%] mt-1.5" />
                    <Skeleton className="h-5 w-[20%] mt-1.5" />
                    <Skeleton className="h-5 w-[25%] mt-1.5" />
                    <Skeleton className="h-5 w-[25%] mt-1.5" />
                    <Skeleton className="h-5 w-[25%] mt-1.5" />
                    <Skeleton className="h-5 w-[8%] mt-1.5" />
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center p-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-medium mb-2">
                      No users found
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {searchTerm || filter.isAdmin || filter.status || sort.field
                        ? 'Try adjusting your search, filters, or sort'
                        : 'No users available at the moment'}
                    </p>
                  </div>
                  {(searchTerm || filter.isAdmin || filter.status || sort.field) && (
                    <button
                      onClick={handleClearFilters}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200"
                    >
                      Clear all filters and sort
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <table className="min-w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
                <thead className="border-y border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/80 to-indigo-50/80 dark:from-gray-800/80 dark:to-indigo-900/20">
                  <tr>
                    <th className="w-[5%] px-6 py-3 whitespace-nowrap text-left">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Picture</span>
                    </th>
                    <th className="w-[8%] px-6 py-3 whitespace-nowrap text-center">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Status</span>
                    </th>
                    <th className="w-[20%] px-6 py-3 whitespace-nowrap text-left">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        Name
                        {sort.field === 'name' && (
                          sort.order === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
                        )}
                      </button>
                    </th>
                    <th className="w-[25%] px-6 py-3 whitespace-nowrap text-left">
                      <button
                        onClick={() => handleSort('email')}
                        className="flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        Email
                        {sort.field === 'email' && (
                          sort.order === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
                        )}
                      </button>
                    </th>
                    <th className="w-[25%] px-6 py-3 whitespace-nowrap text-left">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Bio</span>
                    </th>
                    <th className="w-[25%] px-6 py-3 whitespace-nowrap text-left">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Designations</span>
                    </th>
                    <th className="w-[8%] px-6 py-3 whitespace-nowrap text-center">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Admin</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gradient-to-r hover:from-indigo-50/80 hover:to-purple-50/80 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all duration-300 group">
                      <td className="w-[5%] px-6 py-3 whitespace-nowrap text-left">
                        {user.picture ? (
                          <Image
                            src={user.picture}
                            alt={`${user.firstName} ${user.lastName}`}
                            width={32}
                            height={32}
                            className="rounded-lg object-cover ring-2 ring-white/50 dark:ring-gray-700/50 group-hover:ring-indigo-200 dark:group-hover:ring-indigo-700 transition-all duration-300"
                          />
                        ) : (
                          <Skeleton className="w-8 h-8 rounded-full" />
                        )}
                      </td>
                      <td className="w-[8%] px-6 py-3 whitespace-nowrap text-center align-middle">
                        <input
                          type="checkbox"
                          checked={checkedItems[`${user._id}-status`] ?? user.status}
                          onChange={() => handleCheckboxChange(user._id, 'status')}
                          className="h-5 w-5 rounded border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 cursor-pointer"
                          aria-label={`Toggle status for ${user.name}`}
                          role="checkbox"
                          aria-checked={checkedItems[`${user._id}-status`] ?? user.status}
                          disabled={!user._id}
                        />
                      </td>
                      <td className="w-[20%] px-6 py-3 whitespace-nowrap text-left">
                        <span className="text-sm text-gray-900 dark:text-gray-200 font-semibold group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors duration-300">{user.name}</span>
                      </td>
                      <td className="w-[25%] px-6 py-3 whitespace-nowrap text-left">
                        <span className="text-sm text-gray-600 dark:text-gray-300 break-all group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">{user.email}</span>
                      </td>
                      <td className="w-[25%] px-6 py-3 text-left">
                        <div className="flex flex-col gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {expandedBios[user._id] ? user.bio : truncateBio(user.bio)}
                          </span>
                          {user.bio.split(' ').length > 15 && (
                            <button
                              onClick={() => toggleBioExpansion(user._id)}
                              className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-all duration-300 w-fit cursor-pointer hover:scale-105"
                            >
                              {expandedBios[user._id] ? (
                                <>
                                  <EyeOff className="h-3 w-3" />
                                  Show less
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3 w-3" />
                                  Show more
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="w-[25%] px-6 py-3 text-left">
                        <Listbox
                          value={user.designations}
                          onChange={(selected) => handleDesignationsChange(user._id, selected)}
                          multiple
                        >
                          {({ open }) => (
                            <div className="relative">
                              <Listbox.Button className="custom-select__control w-full min-h-[42px]">
                                <div className="flex flex-wrap gap-1">
                                  {user.designations.length > 0 ? (
                                    user.designations.map((designation) => (
                                      <span
                                        key={designation}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 dark:from-indigo-900/70 dark:to-purple-900/70 dark:text-indigo-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                                      >
                                        {designation}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-500 dark:text-gray-400">Select designations...</span>
                                  )}
                                </div>
                                <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              </Listbox.Button>
                              <Transition
                                show={open}
                                as={Fragment}
                                leave="transition ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="custom-select__menu max-h-60 overflow-y-auto">
                                  {designationOptions.map((option) => (
                                    <Listbox.Option
                                      key={option}
                                      value={option}
                                      className={({ active, selected }) =>
                                        `custom-select__option ${active ? 'custom-select__option--is-focused' : ''} ${selected ? 'custom-select__option--is-selected' : ''
                                        }`
                                      }
                                    >
                                      {({ selected }) => (
                                        <div className="flex items-center justify-between">
                                          <span>{option}</span>
                                          {selected && <Check className="h-5 w-5 text-white" />}
                                        </div>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          )}
                        </Listbox>
                      </td>
                      <td className="w-[8%] px-6 py-3 whitespace-nowrap text-center align-middle">
                        <input
                          type="checkbox"
                          checked={checkedItems[`${user._id}-isAdmin`] ?? user.isAdmin}
                          onChange={() => handleCheckboxChange(user._id, 'isAdmin')}
                          className="h-5 w-5 rounded border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 cursor-pointer"
                          aria-label={`Toggle admin status for ${user.name}`}
                          role="checkbox"
                          aria-checked={checkedItems[`${user._id}-isAdmin`] ?? user.isAdmin}
                          disabled={!user._id}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="relative z-10 border-t border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center justify-between">
              {/* Previous Button */}
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                style={{ pointerEvents: currentPage === 1 ? 'none' : 'auto' }}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page Indicator (Mobile) */}
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 sm:hidden">
                Page {currentPage} of {totalPages}
              </span>

              {/* Pagination Numbers (Desktop) */}
              <ul className="hidden sm:flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;

                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <li key={page}>
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${currentPage === page
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-600 bg-white hover:bg-indigo-100 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-indigo-900/50'
                            }`}
                          aria-label={`Go to page ${page}`}
                          aria-current={currentPage === page ? 'page' : undefined}
                          style={{ pointerEvents: 'auto' }}
                        >
                          {page}
                        </button>
                      </li>
                    );
                  }

                  if (
                    (page === currentPage - 2 && page > 1) ||
                    (page === currentPage + 2 && page < totalPages)
                  ) {
                    return (
                      <li key={`ellipsis-${page}`}>
                        <span className="flex h-8 w-8 items-center justify-center text-gray-500 dark:text-gray-400 select-none">
                          ...
                        </span>
                      </li>
                    );
                  }

                  return null;
                })}
              </ul>

              {/* Next Button */}
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                onClick={() =>
                  handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)
                }
                disabled={currentPage === totalPages}
                aria-label="Next page"
                style={{ pointerEvents: currentPage === totalPages ? 'none' : 'auto' }}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      <Transition appear show={isFilterModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsFilterModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/90 backdrop-blur-md" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform rounded-3xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-8 text-left shadow-2xl border border-white/20 dark:border-gray-700/50 transition-all">
                  <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Filter Users
                  </Dialog.Title>
                  <form onSubmit={handleFilterSubmit} className="space-y-6 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Admin Status
                      </label>
                      <Listbox
                        value={adminOptions.find((opt) => opt.value === filter.isAdmin)}
                        onChange={(selected) => setFilter((f) => ({ ...f, isAdmin: selected.value }))}
                      >
                        {({ open }) => (
                          <div className="relative">
                            <Listbox.Button className="custom-select__control w-full">
                              <span className="truncate">
                                {adminOptions.find((opt) => opt.value === filter.isAdmin)?.label || 'All'}
                              </span>
                              <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </Listbox.Button>
                            <Transition
                              show={open}
                              as={Fragment}
                              leave="transition ease-in duration-200"
                              leaveFrom="opacity-100"
                              leaveTo="opacity-0"
                            >
                              <Listbox.Options className="custom-select__menu">
                                {adminOptions.map((option) => (
                                  <Listbox.Option
                                    key={option.value}
                                    value={option}
                                    className={({ active, selected }) =>
                                      `custom-select__option ${active ? 'custom-select__option--is-focused' : ''} ${selected ? 'custom-select__option--is-selected' : ''
                                      }`
                                    }
                                  >
                                    {({ selected }) => (
                                      <div className="flex items-center justify-between">
                                        <span>{option.label}</span>
                                        {selected && <Check className="h-5 w-5 text-white" />}
                                      </div>
                                    )}
                                  </Listbox.Option>
                                ))}
                              </Listbox.Options>
                            </Transition>
                          </div>
                        )}
                      </Listbox>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Account Status
                      </label>
                      <Listbox
                        value={statusOptions.find((opt) => opt.value === filter.status)}
                        onChange={(selected) => setFilter((f) => ({ ...f, status: selected.value }))}
                      >
                        {({ open }) => (
                          <div className="relative">
                            <Listbox.Button className="custom-select__control w-full">
                              <span className="truncate">
                                {statusOptions.find((opt) => opt.value === filter.status)?.label || 'All'}
                              </span>
                              <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </Listbox.Button>
                            <Transition
                              show={open}
                              as={Fragment}
                              leave="transition ease-in duration-200"
                              leaveFrom="opacity-100"
                              leaveTo="opacity-0"
                            >
                              <Listbox.Options className="custom-select__menu">
                                {statusOptions.map((option) => (
                                  <Listbox.Option
                                    key={option.value}
                                    value={option}
                                    className={({ active, selected }) =>
                                      `custom-select__option ${active ? 'custom-select__option--is-focused' : ''} ${selected ? 'custom-select__option--is-selected' : ''
                                      }`
                                    }
                                  >
                                    {({ selected }) => (
                                      <div className="flex items-center justify-between">
                                        <span>{option.label}</span>
                                        {selected && <Check className="h-5 w-5 text-white" />}
                                      </div>
                                    )}
                                  </Listbox.Option>
                                ))}
                              </Listbox.Options>
                            </Transition>
                          </div>
                        )}
                      </Listbox>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsFilterModalOpen(false);
                          handleClearFilters();
                        }}
                        className="inline-flex justify-center rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100/90 dark:hover:bg-gray-700/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                      >
                        Clear Filters
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:focus:ring-indigo-400 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <div className="fixed bottom-6 right-6 space-y-3 z-50">
        {Object.entries(notifications).map(([id, notif]) => (
          <div
            key={id}
            onClick={() => removeNotification(id)}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg cursor-pointer transition-all duration-300 ${notif.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/80 dark:text-green-100'
              : notif.type === 'error'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-100'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-100'
              }`}
          >
            {notif.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notif.type === 'error' && <XCircle className="w-5 h-5" />}
            {notif.type === 'info' && <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{notif.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersTable;