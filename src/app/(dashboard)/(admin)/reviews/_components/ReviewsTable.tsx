/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter, Check, ChevronDown } from 'lucide-react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Skeleton } from '@/components/ui/skeleton';
import debounce from 'lodash/debounce';

interface Review {
    _id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    rating: number;
    createdAt: string;
    status: boolean;
}

const ReviewsTable: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);
    const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const itemsPerPage = 6;

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'true', label: 'Approved' },
        { value: 'false', label: 'Unapproved' },
    ];

    // Debounced fetch function
    const fetchReviews = useCallback(
        debounce(async (page: number, search: string, status: string) => {
            console.log('Fetching reviews with:', { page, search, status });
            setLoading(true);
            try {
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    limit: itemsPerPage.toString(),
                    search: encodeURIComponent(search),
                });

                if (status) {
                    queryParams.append('status', status);
                }

                const response = await fetch(`/api/reviews?${queryParams.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const { reviews: fetchedReviews, totalPages: pages } = await response.json();
                    if (!Array.isArray(fetchedReviews)) {
                        throw new Error('Invalid reviews data: expected an array');
                    }
                    const formattedReviews: Review[] = fetchedReviews.map((review: any) => ({
                        _id: review._id,
                        name: review.name,
                        email: review.email,
                        phone: review.phone,
                        subject: review.subject,
                        message: review.message,
                        rating: Number(review.rating),
                        createdAt: review.createdAt,
                        status: review.status ?? false,
                    }));
                    setReviews(formattedReviews);
                    setTotalPages(Number.isInteger(pages) && pages > 0 ? pages : 1);
                    setCheckedItems(
                        formattedReviews.reduce((acc: { [key: string]: boolean }, review: Review) => ({
                            ...acc,
                            [`${review._id}-status`]: review.status,
                        }), {})
                    );
                } else {
                    const data = await response.json();
                    toast.error(data?.error || 'Failed to fetch reviews');
                    setReviews([]);
                    setTotalPages(1);
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to fetch reviews');
                console.error('Fetch reviews error:', error);
                setReviews([]);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    // Fetch reviews when dependencies change
    useEffect(() => {
        fetchReviews(currentPage, searchTerm, filterStatus);
        return () => fetchReviews.cancel(); // Cancel debounce on unmount
    }, [fetchReviews, currentPage, searchTerm, filterStatus]);

    // Client-side filtering for additional safety
    const filteredReviews = Array.isArray(reviews) ? reviews.filter((review) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            review.name.toLowerCase().includes(searchLower) ||
            review.email.toLowerCase().includes(searchLower) ||
            review.subject.toLowerCase().includes(searchLower) ||
            review.message.toLowerCase().includes(searchLower);
        const matchesStatus = filterStatus
            ? filterStatus === 'true'
                ? review.status
                : !review.status
            : true;
        return matchesSearch && matchesStatus;
    }) : [];

    const handleCheckboxChange = async (reviewId: string, field: 'status') => {
        if (field !== 'status') {
            return;
        }

        if (!reviewId) {
            toast.error('Invalid review ID');
            return;
        }

        const originalReviews = [...reviews];
        const originalCheckedItems = { ...checkedItems };

        const newValue = !checkedItems[`${reviewId}-status`];

        setReviews((prev) =>
            prev.map((r) => (r._id === reviewId ? { ...r, status: newValue } : r))
        );
        setCheckedItems((prev) => ({
            ...prev,
            [`${reviewId}-status`]: newValue,
        }));

        try {
            const response = await fetch(`/api/reviews/${reviewId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ field, value: newValue }),
            });

            if (response.ok) {
                const updatedReview = await response.json();
                setReviews((prev) =>
                    prev.map((r) =>
                        r._id === reviewId ? { ...r, status: updatedReview.status } : r
                    )
                );
                toast.success(`Status updated for review`);
            } else {
                setReviews(originalReviews);
                setCheckedItems(originalCheckedItems);
                const { error } = await response.json();
                toast.error(error || 'Failed to update status');
            }
        } catch (error) {
            setReviews(originalReviews);
            setCheckedItems(originalCheckedItems);
            toast.error('Failed to update status');
            console.error('Checkbox update error:', error);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.info(`Filters applied: Status=${filterStatus || 'All'}`, { autoClose: 2000 });
        setIsFilterModalOpen(false);
        setCurrentPage(1); // Reset page on filter apply
    };

    const handleClearFilters = () => {
        setFilterStatus('');
        setCurrentPage(1); // Reset page on filter clear
        toast.info('Filters cleared', { autoClose: 2000 });
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6 md:p-10 font-sans">
            <style jsx global>{`
        .custom-select__control {
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          background-color: rgba(255, 255, 255, 0.95);
          padding: 0.75rem 2.75rem 0.75rem 1rem;
          font-size: 0.9rem;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          position: relative;
        }
        .dark .custom-select__control {
          border-color: #374151;
          background-color: rgba(31, 41, 55, 0.95);
          color: #f3f4f6;
        }
        .custom-select__control:hover {
          border-color: #6366f1;
          box-shadow: 0 2px 6px rgba(99, 102, 241, 0.15);
        }
        .custom-select__control--is-focused {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
        }
        .dark .custom-select__control--is-focused {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.3);
        }
        .custom-select__menu {
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          background-color: #ffffff;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          margin-top: 0.5rem;
          position: absolute;
          width: 100%;
          z-index: 1000;
          animation: slideDown 0.2s ease-out;
        }
        .dark .custom-select__menu {
          border-color: #374151;
          background-color: #1f2937;
        }
        .custom-select__option {
          padding: 0.75rem 1.25rem;
          color: #111827;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .dark .custom-select__option {
          color: #f3f4f6;
        }
        .custom-select__option:hover,
        .custom-select__option--is-focused {
          background-color: #f3f4f6;
        }
        .dark .custom-select__option:hover,
        .dark .custom-select__option--is-focused {
          background-color: #374151;
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
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
                Manage Reviews
            </h1>
            <div className="max-w-7xl mx-auto rounded-3xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 shadow-lg overflow-hidden">
                <div className="px-6 py-5 md:px-10 md:py-6">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                        Review Management
                    </h3>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 md:p-10">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            All Reviews
                        </h3>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center w-full md:w-auto">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute top-1/2 -translate-y-1/2 left-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search reviews..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 pl-12 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm hover:shadow-md cursor-text"
                                    aria-label="Search reviews"
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
                                    <Skeleton className="h-5 w-48 skeleton-pulse" />
                                    <Skeleton className="h-5 w-64 skeleton-pulse" />
                                    <Skeleton className="h-5 w-32 skeleton-pulse" />
                                    <Skeleton className="h-5 w-48 skeleton-pulse" />
                                    <Skeleton className="h-5 min-w-64 skeleton-pulse" />
                                    <Skeleton className="h-5 w-32 skeleton-pulse" />
                                    <Skeleton className="h-5 w-32 skeleton-pulse" />
                                    <Skeleton className="h-5 w-16 skeleton-pulse" />
                                </div>
                                {Array.from({ length: itemsPerPage }).map((_, index) => (
                                    <div key={index} className="flex gap-4 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                                        <Skeleton className="h-5 w-40 mt-1.5 skeleton-pulse" />
                                        <Skeleton className="h-5 w-56 mt-1.5 skeleton-pulse" />
                                        <Skeleton className="h-5 w-28 mt-1.5 skeleton-pulse" />
                                        <Skeleton className="h-5 w-40 mt-1.5 skeleton-pulse" />
                                        <Skeleton className="h-5 min-w-56 mt-1.5 skeleton-pulse" />
                                        <Skeleton className="h-5 w-28 mt-1.5 skeleton-pulse" />
                                        <Skeleton className="h-5 w-28 mt-1.5 skeleton-pulse" />
                                        <Skeleton className="h-5 w-4 mt-1.5 skeleton-pulse" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredReviews.length === 0 ? (
                            <div className="text-center p-8">
                                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                                    No reviews found
                                </p>
                            </div>
                        ) : (
                            <table className="min-w-full table-fixed bg-white/90 dark:bg-gray-800/90">
                                <thead className="border-y border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="w-48 px-6 py-3 whitespace-nowrap text-left">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Name</span>
                                        </th>
                                        <th className="w-64 px-6 py-3 whitespace-nowrap text-left">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Email</span>
                                        </th>
                                        <th className="w-32 px-6 py-3 whitespace-nowrap text-left">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Phone</span>
                                        </th>
                                        <th className="w-48 px-6 py-3 whitespace-nowrap text-left">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Subject</span>
                                        </th>
                                        <th className="min-w-64 px-6 py-3 text-left">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Message</span>
                                        </th>
                                        <th className="w-32 px-6 py-3 whitespace-nowrap text-left">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Rating</span>
                                        </th>
                                        <th className="w-32 px-6 py-3 whitespace-nowrap text-left">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Created At</span>
                                        </th>
                                        <th className="w-16 px-6 py-3 whitespace-nowrap text-center">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Status</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredReviews.map((review) => (
                                        <tr key={review._id} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-all duration-200">
                                            <td className="w-48 px-6 py-3 whitespace-nowrap text-left">
                                                <span className="text-sm text-gray-900 dark:text-gray-200 font-medium">{review.name}</span>
                                            </td>
                                            <td className="w-64 px-6 py-3 whitespace-nowrap text-left">
                                                <span className="text-sm text-gray-600 dark:text-gray-300">{review.email}</span>
                                            </td>
                                            <td className="w-32 px-6 py-3 whitespace-nowrap text-left">
                                                <span className="text-sm text-gray-600 dark:text-gray-300">{review.phone || '-'}</span>
                                            </td>
                                            <td className="w-48 px-6 py-3 whitespace-nowrap text-left">
                                                <span className="text-sm text-gray-600 dark:text-gray-300">{review.subject}</span>
                                            </td>
                                            <td className="min-w-64 px-6 py-3 text-left">
                                                <span className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{review.message}</span>
                                            </td>
                                            <td className="w-32 px-6 py-3 whitespace-nowrap text-left">
                                                <div className="flex items-center">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <svg
                                                            key={star}
                                                            className={`w-4 h-4 ${star <= review.rating ? 'fill-indigo-600' : 'fill-gray-300 dark:fill-gray-600'}`}
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="w-32 px-6 py-3 whitespace-nowrap text-left">
                                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="w-16 px-6 py-3 whitespace-nowrap text-center align-middle">
                                                <input
                                                    type="checkbox"
                                                    checked={checkedItems[`${review._id}-status`] ?? review.status}
                                                    onChange={() => handleCheckboxChange(review._id, 'status')}
                                                    className="h-5 w-5 rounded border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 cursor-pointer"
                                                    aria-label={`Toggle status for review`}
                                                    role="checkbox"
                                                    aria-checked={checkedItems[`${review._id}-status`] ?? review.status}
                                                    disabled={!review._id}
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
                                                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium shadow-sm transition-all duration-200 cursor-pointer ${currentPage === page
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
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm" aria-hidden="true" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-lg transform rounded-2xl bg-white/95 dark:bg-gray-800/95 p-8 shadow-2xl transition-all border border-gray-200 dark:border-gray-700">
                                    <Dialog.Title as="h3" className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight mb-6">
                                        Filter Reviews
                                    </Dialog.Title>
                                    <form onSubmit={handleFilterSubmit} className="space-y-6">
                                        <div className="mb-4">
                                            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                                Review Status
                                            </label>
                                            <Listbox
                                                value={statusOptions.find((opt) => opt.value === filterStatus)}
                                                onChange={(selected) => setFilterStatus(selected.value)}
                                            >
                                                {({ open }) => (
                                                    <div className="relative">
                                                        <Listbox.Button
                                                            id="status-filter"
                                                            className="custom-select__control w-full"
                                                            aria-label="Select review status"
                                                        >
                                                            <span className="truncate">
                                                                {statusOptions.find((opt) => opt.value === filterStatus)?.label || 'All Statuses'}
                                                            </span>
                                                            <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-200" aria-hidden="true" />
                                                        </Listbox.Button>
                                                        <Transition
                                                            show={open}
                                                            as={Fragment}
                                                            leave="transition ease-in duration-200"
                                                            leaveFrom="opacity-100 translate-y-0"
                                                            leaveTo="opacity-0 -translate-y-2"
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
                                                                                {selected && <Check className="h-5 w-5 text-white" aria-hidden="true" />}
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
                                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={handleClearFilters}
                                                className="inline-flex justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100/90 dark:hover:bg-gray-700/90 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                                            >
                                                Clear Filters
                                            </button>
                                            <button
                                                type="submit"
                                                className="inline-flex justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 shadow-sm hover:shadow-md focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:focus:ring-indigo-400 transition-all duration-200 transform hover:scale-105"
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

export default ReviewsTable;