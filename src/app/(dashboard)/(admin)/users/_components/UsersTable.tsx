/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter, Check, ChevronDown } from 'lucide-react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Skeleton } from '@/components/ui/skeleton';

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
}

const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({ isAdmin: '', status: '' });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const itemsPerPage = 6;

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

  // Reset page on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter.isAdmin, filter.status]);

  // Fetch users when page changes
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/users?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const { users: fetchedUsers, totalPages: pages } = await response.json();
          if (!Array.isArray(fetchedUsers)) {
            throw new Error('Invalid users data: expected an array');
          }
          // Map API response to match User interface
          const formattedUsers: User[] = fetchedUsers.map((user: any) => ({
            _id: user.userId || user._id,
            firstName: user.firstName || user.name?.split(' ')[0] || '',
            lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            email: user.email,
            picture: user.profileImage || user.picture || '',
            isAdmin: user.isAdmin,
            bio: user.bio || 'No bio available',
            status: user.status ?? true,
          }));
          setUsers(formattedUsers);
          setTotalPages(Number.isInteger(pages) && pages > 0 ? pages : 1);
          setCheckedItems(
            formattedUsers.reduce((acc: { [key: string]: boolean }, user: User) => ({
              ...acc,
              [`${user._id}-isAdmin`]: user.isAdmin,
              [`${user._id}-status`]: user.status,
            }), {})
          );
        } else {
          const data = await response.json();
          toast.error(data?.error || 'Failed to fetch users');
          setUsers([]);
          setTotalPages(1);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch users');
        console.error('Fetch users error:', error);
        setUsers([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage, searchTerm]);

  // Client-side filtering
  const safeUsers = Array.isArray(users) ? users : [];
  const filteredUsers = safeUsers.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(searchLower) ||
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.bio.toLowerCase().includes(searchLower);
    const matchesAdmin = filter.isAdmin
      ? filter.isAdmin === 'true'
        ? user.isAdmin
        : !user.isAdmin
      : true;
    const matchesStatus = filter.status
      ? filter.status === 'true'
        ? user.status
        : !user.status
      : true;
    return matchesSearch && matchesAdmin && matchesStatus;
  });

  const handleCheckboxChange = async (userId: string, field: 'isAdmin' | 'status') => {
    if (!['isAdmin', 'status'].includes(field)) {
      return;
    }

    if (!userId) {
      toast.error('Invalid user ID');
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
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value: newValue }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId
              ? {
                  ...u,
                  [field]: updatedUser[field],
                  firstName: updatedUser.firstName || u.firstName,
                  lastName: updatedUser.lastName || u.lastName,
                  name: updatedUser.name || `${updatedUser.firstName || u.firstName} ${updatedUser.lastName || u.lastName}`.trim(),
                  email: updatedUser.email || u.email,
                  picture: updatedUser.profileImage || updatedUser.picture || u.picture,
                  bio: updatedUser.bio || u.bio,
                  status: updatedUser.status ?? u.status,
                }
              : u
          )
        );
        toast.success(
          `${field === 'isAdmin' ? 'Admin status' : 'Status'} updated for ${updatedUser.name || 'user'}`
        );
      } else {
        setUsers(originalUsers);
        setCheckedItems(originalCheckedItems);
        const { error } = await response.json();
        toast.error(error || `Failed to update ${field}`);
      }
    } catch (error) {
      setUsers(originalUsers);
      setCheckedItems(originalCheckedItems);
      toast.error(`Failed to update ${field}`);
      console.error(`Checkbox update error for ${field}:`, error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setFilter({ isAdmin: '', status: '' });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6 md:p-10 font-sans">
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 pl-12 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm hover:shadow-md cursor-text"
                  aria-label="Search users"
                />
              </div>
              <button
                id="filter-button"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
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
                  <Skeleton className="h-5 w-12 skeleton-pulse" />
                  <Skeleton className="h-5 w-16 skeleton-pulse" />
                  <Skeleton className="h-5 w-48 skeleton-pulse" />
                  <Skeleton className="h-5 w-64 skeleton-pulse" />
                  <Skeleton className="h-5 w-64 skeleton-pulse" />
                  <Skeleton className="h-5 w-16 skeleton-pulse" />
                </div>
                {Array.from({ length: itemsPerPage }).map((_, index) => (
                  <div key={index} className="flex gap-4 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                    <Skeleton className="w-8 h-8 rounded-full skeleton-pulse" />
                    <Skeleton className="h-5 w-4 mt-1.5 skeleton-pulse" />
                    <Skeleton className="h-5 w-40 mt-1.5 skeleton-pulse" />
                    <Skeleton className="h-5 w-56 mt-1.5 skeleton-pulse" />
                    <Skeleton className="h-5 w-56 mt-1.5 skeleton-pulse" />
                    <Skeleton className="h-5 w-4 mt-1.5 skeleton-pulse" />
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                  No users found
                </p>
              </div>
            ) : (
              <table className="min-w-full table-fixed bg-white/90 dark:bg-gray-800/90">
                <thead className="border-y border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="w-12 px-6 py-3 whitespace-nowrap text-left">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Picture</span>
                    </th>
                    <th className="w-16 px-6 py-3 whitespace-nowrap text-center">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Status</span>
                    </th>
                    <th className="w-48 px-6 py-3 whitespace-nowrap text-left">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Name</span>
                    </th>
                    <th className="w-64 px-6 py-3 whitespace-nowrap text-left">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Email</span>
                    </th>
                    <th className="w-64 px-6 py-3 whitespace-nowrap text-left">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Bio</span>
                    </th>
                    <th className="w-16 px-6 py-3 whitespace-nowrap text-center">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Admin</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-all duration-200">
                      <td className="w-12 px-6 py-3 whitespace-nowrap text-left">
                        {user.picture ? (
                          <Image
                            src={user.picture}
                            alt={`${user.firstName} ${user.lastName}`}
                            width={32}
                            height={32}
                            className="rounded-sm object-cover"
                          />
                        ) : (
                          <Skeleton className="w-8 h-8 rounded-full skeleton-pulse" />
                        )}
                      </td>
                      <td className="w-16 px-6 py-3 whitespace-nowrap text-center align-middle">
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
                      <td className="w-48 px-6 py-3 whitespace-nowrap text-left">
                        <span className="text-sm text-gray-900 dark:text-gray-200 font-medium">{user.name}</span>
                      </td>
                      <td className="w-64 px-6 py-3 whitespace-nowrap text-left">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{user.email}</span>
                      </td>
                      <td className="w-64 px-6 py-3 whitespace-nowrap text-left">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{user.bio}</span>
                      </td>
                      <td className="w-16 px-6 py-3 whitespace-nowrap text-center align-middle">
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
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-5">
            <div className="flex items-center justify-between">
              <button
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <span className="block text-sm font-medium text-gray-600 dark:text-gray-300 sm:hidden">
                Page {currentPage} of {totalPages}
              </span>
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
                          className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium shadow-sm transition-all duration-200 cursor-pointer ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                              : 'text-gray-600 bg-white hover:bg-indigo-100 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-indigo-900/50'
                          }`}
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
                      <li key={page}>
                        <span className="flex h-10 w-10 items-center justify-center text-gray-500 dark:text-gray-400">
                          ...
                        </span>
                      </li>
                    );
                  }
                  return null;
                })}
              </ul>
              <button
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
                disabled={currentPage === totalPages}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
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
                <Dialog.Panel className="w-full max-w-md transform rounded-3xl bg-white/95 dark:bg-gray-800/95 p-8 text-left shadow-2xl transition-all">
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
                                      `custom-select__option ${active ? 'custom-select__option--is-focused' : ''} ${
                                        selected ? 'custom-select__option--is-selected' : ''
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
                                      `custom-select__option ${active ? 'custom-select__option--is-focused' : ''} ${
                                        selected ? 'custom-select__option--is-selected' : ''
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
                        className="inline-flex justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                      >
                        Clear Filters
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:focus:ring-indigo-400 transition-all duration-300 transform hover:scale-105 cursor-pointer"
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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default UsersTable;