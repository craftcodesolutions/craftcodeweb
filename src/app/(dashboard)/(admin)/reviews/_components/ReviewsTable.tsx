
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter, ChevronDown, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Skeleton } from '@/components/ui/skeleton';
import debounce from 'lodash/debounce';
import sanitizeHtml from 'sanitize-html';
import Image from 'next/image';

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
    image: string | null;
}

const ReviewsTable: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);
    const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterRating, setFilterRating] = useState<number[]>([1, 5]);
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [sortField, setSortField] = useState<keyof Review>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const itemsPerPage = 6;

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'true', label: 'Approved' },
        { value: 'false', label: 'Unapproved' },
    ];

    const ratingOptions = [
        { value: [1, 5], label: 'All Ratings' },
        { value: [1, 1], label: '1 Star' },
        { value: [2, 2], label: '2 Stars' },
        { value: [3, 3], label: '3 Stars' },
        { value: [4, 4], label: '4 Stars' },
        { value: [5, 5], label: '5 Stars' },
        { value: [1, 3], label: '1-3 Stars' },
        { value: [4, 5], label: '4-5 Stars' },
    ];

    const fetchReviews = useCallback(
        debounce(async (page: number, search: string, status: string, rating: number[], dateFrom: string, dateTo: string, sort: string, order: string) => {
            setLoading(true);
            let retries = 3;
            while (retries > 0) {
                try {
                    const queryParams = new URLSearchParams({
                        page: page.toString(),
                        limit: itemsPerPage.toString(),
                        search: encodeURIComponent(sanitizeHtml(search)),
                        sort,
                        order,
                    });
                    if (status) queryParams.append('status', status);
                    if (rating[0] !== 1 || rating[1] !== 5) {
                        queryParams.append('ratingMin', rating[0].toString());
                        queryParams.append('ratingMax', rating[1].toString());
                    }
                    if (dateFrom) queryParams.append('dateFrom', dateFrom);
                    if (dateTo) queryParams.append('dateTo', dateTo);

                    const response = await fetch(`/api/reviews?${queryParams.toString()}`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    });

                    if (response.ok) {
                        const { reviews: fetchedReviews, totalPages: pages } = await response.json();
                        if (!Array.isArray(fetchedReviews)) {
                            throw new Error('Invalid reviews data: expected an array');
                        }
                        const formattedReviews: Review[] = fetchedReviews.map((review: any) => ({
                            _id: review._id || '',
                            name: review.name || 'Unknown',
                            email: review.email || '',
                            phone: review.phone || '',
                            subject: review.subject || '',
                            message: review.message || '',
                            rating: Number(review.rating) || 0,
                            createdAt: review.createdAt || new Date().toISOString(),
                            status: review.status ?? false,
                            image: review.image || null,
                        }));
                        setReviews(formattedReviews);
                        setTotalPages(Number.isInteger(pages) && pages > 0 ? pages : 1);
                        setCheckedItems(
                            formattedReviews.reduce((acc: { [key: string]: boolean }, review: Review) => ({
                                ...acc,
                                [review._id]: false,
                                [`${review._id}-status`]: review.status,
                            }), {})
                        );
                        return;
                    } else {
                        const data = await response.json();
                        throw new Error(data?.error || 'Failed to fetch reviews');
                    }
                } catch (error: any) {
                    retries--;
                    if (retries === 0) {
                        toast.error(error.message || 'Failed to fetch reviews');
                        setReviews([]);
                        setTotalPages(1);
                    }
                } finally {
                    setLoading(false);
                }
            }
        }, 300),
        []
    );

    useEffect(() => {
        fetchReviews(currentPage, searchTerm, filterStatus, filterRating, filterDateFrom, filterDateTo, sortField, sortOrder);
        return () => fetchReviews.cancel();
    }, [fetchReviews, currentPage, searchTerm, filterStatus, filterRating, filterDateFrom, filterDateTo, sortField, sortOrder]);

    const handleCheckboxChange = async (reviewId: string, field: 'status') => {
        if (field !== 'status' || !reviewId) {
            toast.error('Invalid review ID or field');
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
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers.get('content-type'));
            const text = await response.text();
            console.log('Response body:', text);
            if (!response.ok) {
                throw new Error((await JSON.parse(text)).error || 'Failed to update status');
            }
            toast.success('Status updated successfully');
        } catch (error: any) {
            console.error('Error:', error);
            setReviews(originalReviews);
            setCheckedItems(originalCheckedItems);
            toast.error(error.message || 'Failed to update status');
        }
    };

    const handleSort = (field: keyof Review) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.info('Filters applied', { autoClose: 2000 });
        setIsFilterModalOpen(false);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setFilterStatus('');
        setFilterRating([1, 5]);
        setFilterDateFrom('');
        setFilterDateTo('');
        setCurrentPage(1);
        toast.info('Filters cleared', { autoClose: 2000 });
    };

    const handleExport = () => {
        const csvContent = [
            ['ID', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Rating', 'Created At', 'Status', 'Image'],
            ...reviews.map((r) => [
                r._id,
                `"${r.name.replace(/"/g, '""')}"`,
                r.email,
                r.phone || '',
                `"${r.subject.replace(/"/g, '""')}"`,
                `"${r.message.replace(/"/g, '""')}"`,
                r.rating,
                new Date(r.createdAt).toISOString(),
                r.status ? 'Approved' : 'Unapproved',
                r.image || '',
            ]),
        ]
            .map((row) => row.join(','))
            .join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `reviews_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Reviews exported as CSV');
    };

    const memoizedReviews = useMemo(() => reviews, [reviews]);

    return (
        <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 md:p-8 font-sans">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
                Manage Reviews
            </h1>
            <div className="max-w-7xl mx-auto rounded-xl bg-white dark:bg-gray-800 shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-4 sm:px-6 sm:py-5">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                        Review Management
                    </h3>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:p-8">
                    <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            All Reviews
                        </h3>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full md:w-auto">
                            <div className="relative w-full sm:w-64 md:w-80">
                                <Search className="absolute top-1/2 -translate-y-1/2 left-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search reviews..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 cursor-text"
                                    aria-label="Search reviews by name, email, subject, or message"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    id="filter-button"
                                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:focus:ring-indigo-400 transition-all duration-200 cursor-pointer"
                                    onClick={() => setIsFilterModalOpen(true)}
                                    aria-haspopup="dialog"
                                    aria-expanded={isFilterModalOpen}
                                >
                                    <Filter className="h-4 w-4" />
                                    <span>Filter</span>
                                </button>
                                <button
                                    onClick={handleExport}
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none dark:focus:ring-green-400 transition-all duration-200 cursor-pointer"
                                    aria-label="Export reviews as CSV"
                                >
                                    Export CSV
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="w-full overflow-x-auto scrollbar-hidden">
                        <style jsx>{`
              .scrollbar-hidden::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-hidden {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
                        {loading ? (
                            <div className="space-y-2">
                                <div className="flex gap-3 px-4 py-3">
                                    <Skeleton className="h-5 w-12 rounded" />
                                    <Skeleton className="h-5 w-16 rounded" />
                                    <Skeleton className="h-5 w-48 rounded" />
                                    <Skeleton className="h-5 w-64 rounded" />
                                    <Skeleton className="h-5 w-32 rounded" />
                                    <Skeleton className="h-5 w-48 rounded" />
                                    <Skeleton className="h-5 min-w-64 rounded" />
                                    <Skeleton className="h-5 w-32 rounded" />
                                    <Skeleton className="h-5 w-32 rounded" />
                                    <Skeleton className="h-5 w-16 rounded" />
                                </div>
                                {Array.from({ length: itemsPerPage }).map((_, index) => (
                                    <div key={index} className="flex gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                                        <Skeleton className="h-5 w-12 rounded" />
                                        <Skeleton className="h-12 w-12 rounded" />
                                        <Skeleton className="h-5 w-48 rounded" />
                                        <Skeleton className="h-5 w-64 rounded" />
                                        <Skeleton className="h-5 w-32 rounded" />
                                        <Skeleton className="h-5 w-48 rounded" />
                                        <Skeleton className="h-5 min-w-64 rounded" />
                                        <Skeleton className="h-5 w-32 rounded" />
                                        <Skeleton className="h-5 w-32 rounded" />
                                        <Skeleton className="h-5 w-16 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : memoizedReviews.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                                    No reviews found
                                </p>
                            </div>
                        ) : (
                            // Wrapper with hidden scrollbar
                            <div className="overflow-x-scroll scrollbar-hide rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <table className="min-w-[1200px] table-fixed bg-white dark:bg-gray-800 text-sm">
                                    {/* Table Head */}
                                    <thead className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th className="w-12 px-4 py-3 text-left">
                                                <input
                                                    type="checkbox"
                                                    checked={Object.entries(checkedItems)
                                                        .filter(([key]) => !key.includes('-status'))
                                                        .every(([, value]) => value)}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setCheckedItems((prev) => {
                                                            const updated = { ...prev };
                                                            memoizedReviews.forEach((r) => {
                                                                updated[r._id] = checked;
                                                            });
                                                            return updated;
                                                        });
                                                    }}
                                                    className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
                                                    aria-label="Select all reviews"
                                                />
                                            </th>
                                            <th className="w-16 px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Image</th>
                                            {[
                                                { key: 'name', label: 'Name', width: 'w-48' },
                                                { key: 'email', label: 'Email', width: 'w-64' },
                                                { key: 'phone', label: 'Phone', width: 'w-32' },
                                                { key: 'subject', label: 'Subject', width: 'w-48' },
                                                { key: 'message', label: 'Message', width: 'min-w-64' },
                                                { key: 'rating', label: 'Rating', width: 'w-32' },
                                                { key: 'createdAt', label: 'Created At', width: 'w-32' },
                                                { key: 'status', label: 'Status', width: 'w-20' },
                                            ].map((col) => (
                                                <th
                                                    key={col.key}
                                                    className={`${col.width} px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200`}
                                                >
                                                    <button
                                                        onClick={() => handleSort(col.key as keyof Review)}
                                                        className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                        aria-label={`Sort by ${col.label}`}
                                                    >
                                                        {col.label}
                                                        {sortField === col.key && (
                                                            <span>
                                                                {sortOrder === 'asc'
                                                                    ? <ArrowUp className="h-4 w-4" />
                                                                    : <ArrowDown className="h-4 w-4" />}
                                                            </span>
                                                        )}
                                                    </button>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    {/* Table Body */}
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {memoizedReviews.map((review, index) => (
                                            <tr
                                                key={review._id}
                                                className={`${index % 2 === 0
                                                    ? 'bg-white dark:bg-gray-800'
                                                    : 'bg-gray-50 dark:bg-gray-700'
                                                    } hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer`}
                                                onClick={() => {
                                                    setSelectedReview(review);
                                                    setIsDetailModalOpen(true);
                                                }}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        setSelectedReview(review);
                                                        setIsDetailModalOpen(true);
                                                    }
                                                }}
                                            >
                                                {/* Checkbox */}
                                                <td className="w-12 px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={checkedItems[review._id] ?? false}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            setCheckedItems((prev) => ({
                                                                ...prev,
                                                                [review._id]: e.target.checked,
                                                            }));
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
                                                        aria-label={`Select review by ${review.name}`}
                                                    />
                                                </td>

                                                {/* Image */}
                                                <td className="w-16 px-4 py-3">
                                                    {review.image ? (
                                                        <Image
                                                            src={review.image || '/placeholder-image.png'}
                                                            alt={`Review image by ${review.name}`}
                                                            width={48}
                                                            height={48}
                                                            className="object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/placeholder-image.png';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
                                                            No Image
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Data cells */}
                                                <td className="w-48 px-4 py-3 font-medium text-gray-900 dark:text-gray-100 truncate">{review.name}</td>
                                                <td className="w-64 px-4 py-3 text-gray-700 dark:text-gray-300 truncate">{review.email}</td>
                                                <td className="w-32 px-4 py-3 text-gray-700 dark:text-gray-300">{review.phone || '-'}</td>
                                                <td className="w-48 px-4 py-3 text-gray-700 dark:text-gray-300 truncate">{review.subject}</td>

                                                {/* Message with preview + tooltip */}
                                                <td className="min-w-64 px-4 py-3 text-gray-700 dark:text-gray-300 align-middle">
                                                    <div className="max-h-[3.5rem] overflow-hidden text-ellipsis line-clamp-2 relative group">
                                                        {review.message}
                                                        {/* Tooltip */}
                                                        <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-pre-wrap z-10 w-64">
                                                            {review.message}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Rating */}
                                                <td className="w-32 px-4 py-3">
                                                    <div className="flex items-center">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <svg
                                                                key={star}
                                                                className={`w-4 h-4 ${star <= review.rating
                                                                    ? 'fill-yellow-500'
                                                                    : 'fill-gray-300 dark:fill-gray-600'
                                                                    }`}
                                                                viewBox="0 0 24 24"
                                                                aria-hidden="true"
                                                            >
                                                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                </td>

                                                {/* Created At */}
                                                <td className="w-32 px-4 py-3 text-gray-700 dark:text-gray-300">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </td>

                                                {/* Status */}
                                                <td className="w-20 px-4 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={checkedItems[`${review._id}-status`] ?? review.status}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            handleCheckboxChange(review._id, 'status');
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
                                                        aria-label={`Toggle status for review by ${review.name}`}
                                                        role="checkbox"
                                                        aria-checked={checkedItems[`${review._id}-status`] ?? review.status}
                                                        disabled={!review._id}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6 sm:py-5">
                        <div className="flex items-center justify-between">
                            <button
                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                                onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
                                disabled={currentPage === 1}
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Previous</span>
                            </button>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 sm:hidden">
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
                                                    className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${currentPage === page
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'text-gray-600 bg-white hover:bg-indigo-100 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-indigo-900/50'
                                                        }`}
                                                    aria-label={`Go to page ${page}`}
                                                    aria-current={currentPage === page ? 'page' : undefined}
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
                                                <span className="flex h-8 w-8 items-center justify-center text-gray-500 dark:text-gray-400">
                                                    ...
                                                </span>
                                            </li>
                                        );
                                    }
                                    return null;
                                })}
                            </ul>
                            <button
                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                                onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
                                disabled={currentPage === totalPages}
                                aria-label="Next page"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Modal */}
            <Transition appear show={isFilterModalOpen} as="div">
                <Dialog as="div" className="relative z-50" onClose={() => setIsFilterModalOpen(false)}>
                    <Transition.Child
                        as="div"
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
                                as="div"
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-3xl rounded-xl bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-xl border border-gray-200 dark:border-gray-700 relative">
                                    <button
                                        onClick={() => setIsFilterModalOpen(false)}
                                        className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 cursor-pointer"
                                        aria-label="Close filter modal"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>

                                    <Dialog.Title as="h3" className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Filter Reviews
                                    </Dialog.Title>

                                    <form onSubmit={handleFilterSubmit} className="space-y-4 sm:space-y-6">
                                        {/* Review Status */}
                                        <div className="relative">
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
                                                            className="relative w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-sm text-gray-900 dark:text-white text-left focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 cursor-pointer"
                                                            aria-label="Select review status"
                                                        >
                                                            <span className="block truncate">
                                                                {statusOptions.find((opt) => opt.value === filterStatus)?.label || 'All Statuses'}
                                                            </span>
                                                            <ChevronDown
                                                                className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''
                                                                    }`}
                                                            />
                                                        </Listbox.Button>

                                                        <Transition
                                                            as="div"
                                                            leave="transition ease-in duration-200"
                                                            leaveFrom="opacity-100 translate-y-0"
                                                            leaveTo="opacity-0 -translate-y-2"
                                                        >
                                                            <Listbox.Options className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-lg divide-y divide-gray-200 dark:divide-gray-600">
                                                                {statusOptions.map((option) => (
                                                                    <Listbox.Option
                                                                        key={option.value}
                                                                        value={option}
                                                                        className={({ active }) =>
                                                                            `relative cursor-pointer select-none py-2 px-3 text-sm transition-colors duration-150 ${active ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100' : 'text-gray-900 dark:text-white'
                                                                            }`
                                                                        }
                                                                    >
                                                                        {({ selected }) => (
                                                                            <div className="flex items-center justify-start">
                                                                                <span className={selected ? 'font-semibold' : ''}>{option.label}</span>
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

                                        {/* Rating Range */}
                                        <div className="relative">
                                            <label htmlFor="rating-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                                Rating Range
                                            </label>
                                            <Listbox
                                                value={ratingOptions.find(
                                                    (opt) => opt.value[0] === filterRating[0] && opt.value[1] === filterRating[1]
                                                )}
                                                onChange={(selected) => setFilterRating(selected.value)}
                                            >
                                                {({ open }) => (
                                                    <div className="relative">
                                                        <Listbox.Button
                                                            id="rating-filter"
                                                            className="relative w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-sm text-gray-900 dark:text-white text-left focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 cursor-pointer"
                                                            aria-label="Select rating range"
                                                        >
                                                            <span className="block truncate">
                                                                {ratingOptions.find(
                                                                    (opt) => opt.value[0] === filterRating[0] && opt.value[1] === filterRating[1]
                                                                )?.label || 'All Ratings'}
                                                            </span>
                                                            <ChevronDown
                                                                className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''
                                                                    }`}
                                                            />
                                                        </Listbox.Button>

                                                        <Transition
                                                            as="div"
                                                            leave="transition ease-in duration-200"
                                                            leaveFrom="opacity-100 translate-y-0"
                                                            leaveTo="opacity-0 -translate-y-2"
                                                        >
                                                            <Listbox.Options className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-lg divide-y divide-gray-200 dark:divide-gray-600">
                                                                {ratingOptions.map((option) => (
                                                                    <Listbox.Option
                                                                        key={option.label}
                                                                        value={option}
                                                                        className={({ active })=>
                                                                            `relative cursor-pointer select-none py-2 px-3 text-sm transition-colors duration-150 ${active ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100' : 'text-gray-900 dark:text-white'
                                                                            }`
                                                                        }
                                                                    >
                                                                        {({ selected }) => (
                                                                            <div className="flex items-center justify-start">
                                                                                <span className={selected ? 'font-semibold' : ''}>{option.label}</span>
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

                                        {/* Date Filters */}
                                        <div>
                                            <label htmlFor="date-from-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                                Date From
                                            </label>
                                            <input
                                                type="date"
                                                id="date-from-filter"
                                                value={filterDateFrom}
                                                onChange={(e) => setFilterDateFrom(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 cursor-pointer"
                                                aria-label="Filter reviews from date"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="date-to-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                                Date To
                                            </label>
                                            <input
                                                type="date"
                                                id="date-to-filter"
                                                value={filterDateTo}
                                                onChange={(e) => setFilterDateTo(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 cursor-pointer"
                                                aria-label="Filter reviews to date"
                                            />
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={handleClearFilters}
                                                className="inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:outline-none dark:focus:ring-gray-500 transition-all duration-200 cursor-pointer"
                                                aria-label="Clear all filters"
                                            >
                                                Clear Filters
                                            </button>
                                            <button
                                                type="submit"
                                                className="inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:focus:ring-indigo-400 transition-all duration-200 cursor-pointer"
                                                aria-label="Apply filters"
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

            {/* Detail Modal */}
            <Transition appear show={isDetailModalOpen} as="div">
                <Dialog as="div" className="relative z-50" onClose={() => setIsDetailModalOpen(false)}>
                    <Transition.Child
                        as="div"
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
                                as="div"
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-5xl sm:max-w-4xl rounded-xl bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-xl border border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => setIsDetailModalOpen(false)}
                                        className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 cursor-pointer"
                                        aria-label="Close review details modal"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>

                                    <Dialog.Title as="h3" className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Review Details
                                    </Dialog.Title>

                                    {selectedReview ? (
                                        <div className="space-y-6">
                                            {/* Image */}
                                            <div className="flex justify-center">
                                                {selectedReview.image ? (
                                                    <Image
                                                        src={selectedReview.image || '/placeholder-image.png'}
                                                        alt={`Review image by ${selectedReview.name}`}
                                                        width={200}
                                                        height={200}
                                                        className="object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/placeholder-image.png';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="h-48 w-48 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>

                                            {/* Review Details */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
                                                    <p className="mt-1 text-gray-900 dark:text-gray-100">{selectedReview.name}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                                                    <p className="mt-1 text-gray-900 dark:text-gray-100">{selectedReview.email}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Phone</label>
                                                    <p className="mt-1 text-gray-900 dark:text-gray-100">{selectedReview.phone || '-'}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Subject</label>
                                                    <p className="mt-1 text-gray-900 dark:text-gray-100">{selectedReview.subject}</p>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Message</label>
                                                    <p className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{selectedReview.message}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Rating</label>
                                                    <div className="flex items-center mt-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <svg
                                                                key={star}
                                                                className={`w-5 h-5 ${star <= selectedReview.rating ? 'fill-yellow-500' : 'fill-gray-300 dark:fill-gray-600'}`}
                                                                viewBox="0 0 24 24"
                                                                aria-hidden="true"
                                                            >
                                                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Created At</label>
                                                    <p className="mt-1 text-gray-900 dark:text-gray-100">{new Date(selectedReview.createdAt).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Status</label>
                                                    <div className="flex items-center mt-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={checkedItems[`${selectedReview._id}-status`] ?? selectedReview.status}
                                                            onChange={() => handleCheckboxChange(selectedReview._id, 'status')}
                                                            className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
                                                            aria-label={`Toggle status for review by ${selectedReview.name}`}
                                                            role="checkbox"
                                                            aria-checked={checkedItems[`${selectedReview._id}-status`] ?? selectedReview.status}
                                                            disabled={!selectedReview._id}
                                                        />
                                                        <span className="ml-2 text-gray-900 dark:text-gray-100">
                                                            {checkedItems[`${selectedReview._id}-status`] ?? selectedReview.status ? 'Approved' : 'Unapproved'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Close Button */}
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => setIsDetailModalOpen(false)}
                                                    className="inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:focus:ring-indigo-400 transition-all duration-200 cursor-pointer"
                                                    aria-label="Close review details"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">No review selected</p>
                                    )}
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