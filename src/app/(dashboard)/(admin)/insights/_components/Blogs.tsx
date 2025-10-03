/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { Search, Edit, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import DatePickerComponent from './DatePickerComponent';

// Interfaces for type safety
interface User {
    userId: string;
    firstName?: string;
    lastName?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading?: boolean;
}

interface Section {
    id: number;
    type: "text" | "image";
    content: string;
    publicId?: string | null;
}

interface Blog {
    _id: string;
    title: string;
    author: string; // userId
    date: string;
    content: string | Section[];
    tags: string[];
    category: string;
    slug: string;
    image: string | null;
    publicId: string | null;
    createdAt: string;
    updatedAt: string;
}

interface BlogForm {
    _id?: string;
    title: string;
    author: string; // userId
    date: string;
    content: Section[];
    tags: string[];
    tagsString?: string;
    category: string;
    slug: string;
    image: string | null;
    publicId: string | null;
}

const Blogs: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth() as AuthContextType;
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState<BlogForm | null>(null);
    const [blogToDelete, setBlogToDelete] = useState<string | null>(null);
    const [newBlog, setNewBlog] = useState<BlogForm>({
        title: '',
        author: '',
        date: '',
        content: [],
        tags: [],
        tagsString: undefined,
        category: '',
        slug: '',
        image: null,
        publicId: null,
    });
    const [newBlogImagePreview, setNewBlogImagePreview] = useState<string | null>(null);
    const [updateBlogImagePreview, setUpdateBlogImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const categories = ['Technology', 'Design', 'Development', 'UI/UX', 'Other'];
    const itemsPerPage = 6;

    // Slug generation function
    const generateSlug = (title: string): string => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    useEffect(() => {
        if (isAuthenticated && user?.userId) {
            setNewBlog((prev) => ({
                ...prev,
                author: user.userId,
            }));
        }
    }, [user, isAuthenticated]);

    useEffect(() => {
        const fetchBlogs = async () => {
            setIsFetching(true);
            try {
                const response = await fetch(
                    `/api/blogs?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    setBlogs(data.blogs || []);
                    setTotalPages(data.totalPages || 1);
                } else {
                    const errorData = await response.json();
                    toast.error(errorData?.error || 'Failed to fetch blogs');
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to fetch blogs');
                console.error('Fetch blogs error:', error);
            } finally {
                setIsFetching(false);
            }
        };
        fetchBlogs();
    }, [currentPage, searchTerm]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleUpdateBlog = (blogId: string) => {
        const blog = blogs.find((b) => b._id === blogId);
        if (blog && isAuthenticated && user?.userId === blog.author) {
            let contentSections: Section[];
            if (typeof blog.content === 'string') {
                contentSections = [{ id: Date.now(), type: 'text', content: blog.content }];
            } else {
                contentSections = blog.content;
            }
            setSelectedBlog({
                ...blog,
                content: contentSections,
                author: blog.author,
                image: blog.image,
                publicId: blog.publicId,
                slug: blog.slug,
                tagsString: undefined,
            });
            setUpdateBlogImagePreview(blog.image);
            setIsUpdateModalOpen(true);
        } else {
            toast.error('You are not authorized to edit this blog.');
        }
    };

    const handleDeleteBlog = (blogId: string) => {
        const blog = blogs.find((b) => b._id === blogId);
        if (blog && isAuthenticated && user?.userId === blog.author) {
            setBlogToDelete(blogId);
            setIsDeleteModalOpen(true);
        } else {
            toast.error('You are not authorized to delete this blog.');
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, isUpdate: boolean) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        await handleImageUpload(files, isUpdate);
    };

    const handleFileInputChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
        isUpdate: boolean
    ) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        await handleImageUpload(files, isUpdate);
    };

    const handleImageUpload = async (files: File[], isUpdate: boolean) => {
        if (files.length === 0) {
            toast.error('No files selected');
            return;
        }
        if (files.length > 1) {
            toast.error('Only one image is allowed');
            return;
        }

        const file = files[0];
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image file (e.g., PNG, JPEG)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setIsUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/auth/cloudinary_blog_image', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload image');
            }

            const previewUrl = URL.createObjectURL(file);
            if (isUpdate && selectedBlog) {
                setSelectedBlog({
                    ...selectedBlog,
                    image: data.imageUrl,
                    publicId: data.publicId,
                });
                setUpdateBlogImagePreview(previewUrl);
            } else {
                setNewBlog({
                    ...newBlog,
                    image: data.imageUrl,
                    publicId: data.publicId,
                });
                setNewBlogImagePreview(previewUrl);
            }
            toast.success('Image uploaded successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload image');
            console.error('Image upload error:', error);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleRemoveImage = async (isUpdate: boolean) => {
        if (isUpdate && selectedBlog?.publicId) {
            try {
                const response = await fetch(`/api/cloudinary_blog_image?publicId=${encodeURIComponent(selectedBlog.publicId)}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete image');
                }
                setSelectedBlog({ ...selectedBlog, image: null, publicId: null });
                setUpdateBlogImagePreview(null);
                toast.success('Image removed successfully!');
            } catch (error: any) {
                toast.error(error.message || 'Failed to remove image');
                console.error('Remove image error:', error);
            }
        } else {
            setNewBlog({ ...newBlog, image: null, publicId: null });
            setNewBlogImagePreview(null);
            toast.success('Image removed successfully!');
        }
    };

    const triggerFileInput = (isUpdate: boolean) => {
        const inputId = isUpdate ? 'updateBlogImage' : 'newBlogImage';
        const input = document.getElementById(inputId) as HTMLInputElement;
        if (input) {
            input.click();
        }
    };

    const addSection = (type: "text" | "image", isUpdate: boolean) => {
        const newSection: Section = {
            id: Date.now(),
            type,
            content: "",
            publicId: null,
        };
        if (isUpdate) {
            if (selectedBlog) {
                setSelectedBlog({ ...selectedBlog, content: [...selectedBlog.content, newSection] });
            }
        } else {
            setNewBlog({ ...newBlog, content: [...newBlog.content, newSection] });
        }
    };

    const removeSection = async (id: number, isUpdate: boolean) => {
        let sectionToDelete: Section | undefined;
        if (isUpdate) {
            if (selectedBlog) {
                sectionToDelete = selectedBlog.content.find(s => s.id === id);
                const updated = selectedBlog.content.filter(s => s.id !== id);
                setSelectedBlog({ ...selectedBlog, content: updated });
            }
        } else {
            sectionToDelete = newBlog.content.find(s => s.id === id);
            const updated = newBlog.content.filter(s => s.id !== id);
            setNewBlog({ ...newBlog, content: updated });
        }

        if (sectionToDelete?.type === "image" && sectionToDelete.publicId) {
            try {
                await fetch(`/api/cloudinary_blog_image?publicId=${encodeURIComponent(sectionToDelete.publicId)}`, {
                    method: 'DELETE',
                });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                console.error('Failed to delete section image from Cloudinary');
            }
        }
    };

    const handleSectionTextChange = (id: number, value: string, isUpdate: boolean) => {
        const updateFunc = (sections: Section[]) => sections.map(s => (s.id === id ? { ...s, content: value } : s));
        if (isUpdate) {
            if (selectedBlog) {
                setSelectedBlog({ ...selectedBlog, content: updateFunc(selectedBlog.content) });
            }
        } else {
            setNewBlog({ ...newBlog, content: updateFunc(newBlog.content) });
        }
    };

    const handleSectionImageUpload = async (id: number, file: File, isUpdate: boolean) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setIsUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await fetch('/api/auth/cloudinary_blog_image', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload image');
            }

            // Delete old image if exists
            let oldPublicId: string | null = null;
            if (isUpdate && selectedBlog) {
                const section = selectedBlog.content.find(s => s.id === id);
                oldPublicId = section?.publicId || null;
            } else {
                const section = newBlog.content.find(s => s.id === id);
                oldPublicId = section?.publicId || null;
            }
            if (oldPublicId) {
                await fetch(`/api/cloudinary_blog_image?publicId=${encodeURIComponent(oldPublicId)}`, {
                    method: 'DELETE',
                });
            }

            const updateFunc = (sections: Section[]) =>
                sections.map(s => (s.id === id ? { ...s, content: data.imageUrl, publicId: data.publicId } : s));

            if (isUpdate) {
                if (selectedBlog) {
                    setSelectedBlog({ ...selectedBlog, content: updateFunc(selectedBlog.content) });
                }
            } else {
                setNewBlog({ ...newBlog, content: updateFunc(newBlog.content) });
            }
            toast.success('Section image uploaded successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload section image');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleRemoveSectionImage = async (id: number, isUpdate: boolean) => {
        let publicId: string | null = null;
        if (isUpdate && selectedBlog) {
            const section = selectedBlog.content.find(s => s.id === id);
            publicId = section?.publicId || null;
        } else {
            const section = newBlog.content.find(s => s.id === id);
            publicId = section?.publicId || null;
        }

        if (publicId) {
            try {
                const response = await fetch(`/api/cloudinary_blog_image?publicId=${encodeURIComponent(publicId)}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Failed to delete image');
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to remove section image');
            }
        }

        const updateFunc = (sections: Section[]) =>
            sections.map(s => (s.id === id ? { ...s, content: '', publicId: null } : s));

        if (isUpdate) {
            if (selectedBlog) {
                setSelectedBlog({ ...selectedBlog, content: updateFunc(selectedBlog.content) });
            }
        } else {
            setNewBlog({ ...newBlog, content: updateFunc(newBlog.content) });
        }
        toast.success('Section image removed successfully!');
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBlog.title || !newBlog.author || !newBlog.date || newBlog.content.length === 0 || !newBlog.category) {
            toast.error('Please fill in all required fields.');
            return;
        }

        const blogWithSlug = {
            ...newBlog,
            slug: generateSlug(newBlog.title),
        };

        try {
            const response = await fetch('/api/blogs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(blogWithSlug),
            });
            if (response.ok) {
                const data = await response.json();
                setBlogs((prev) => [...prev, data]);
                setIsAddModalOpen(false);
                setNewBlogImagePreview(null);
                setNewBlog({
                    title: '',
                    author: user?.userId || '',
                    date: '',
                    content: [],
                    tags: [],
                    tagsString: undefined,
                    category: '',
                    slug: '',
                    image: null,
                    publicId: null,
                });
                toast.success('Blog added successfully!');
            } else {
                const errorData = await response.json();
                toast.error(errorData?.error || 'Failed to add blog');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to add blog');
            console.error('Add blog error:', error);
        }
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBlog) return;

        if (!selectedBlog.title || !selectedBlog.author || !selectedBlog.date || selectedBlog.content.length === 0 || !selectedBlog.category) {
            toast.error('Please fill in all required fields.');
            return;
        }

        try {
            const blogWithSlug = {
                ...selectedBlog,
                slug: generateSlug(selectedBlog.title),
            };

            const response = await fetch(`/api/blogs/${selectedBlog._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.userId || '',
                },
                body: JSON.stringify(blogWithSlug),
            });

            if (response.ok) {
                const data = await response.json();
                setBlogs((prev) => prev.map((b) => (b._id === selectedBlog._id ? data : b)));
                setIsUpdateModalOpen(false);
                setUpdateBlogImagePreview(null);
                setSelectedBlog(null);
                toast.success('Blog updated successfully!');
            } else {
                const errorData = await response.json();
                toast.error(errorData?.error || 'Failed to update blog');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update blog');
            console.error('Update blog error:', error);
        }
    };

    const handleDeleteConfirm = async () => {
        if (blogToDelete) {
            try {
                const response = await fetch(`/api/blogs/${blogToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': user?.userId ?? '',
                    },
                });

                if (response.ok) {
                    setBlogs((prev) => prev.filter((b) => b._id !== blogToDelete));
                    setIsDeleteModalOpen(false);
                    setBlogToDelete(null);
                    toast.success('Blog deleted successfully!');
                } else {
                    const errorData = await response.json();
                    toast.error(errorData?.error || 'Failed to delete blog');
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete blog');
                console.error('Delete blog error:', error);
            }
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6 md:p-10 font-sans">
            <style jsx global>{`
        .custom-select__control {
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          background-color: rgba(255, 255, 255, 0.8);
          padding: 0.5rem;
          font-size: 0.875rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
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
        }
        .dark .custom-select__menu {
          border-color: #374151;
          background-color: #1f2937;
        }
        .custom-select__option {
          padding: 0.75rem 1rem;
          color: #111827;
        }
        .dark .custom-select__option {
          color: #ffffff;
        }
        .custom-select__option--is-focused {
          background-color: #e5e7eb;
        }
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
                Discover Our Blogs
            </h1>
            <div className="max-w-7xl mx-auto rounded-3xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 shadow-lg overflow-hidden">
                <div className="px-6 py-5 md:px-10 md:py-6 flex items-center justify-between">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                        Blog Posts
                    </h3>
                    {isAuthenticated && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Add New Blog</span>
                        </button>
                    )}
                </div>
                <div className="border-t border-gray-600 dark:border-gray-700 p-6 md:p-10">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            All Blogs
                        </h3>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute top-1/2 -translate-y-1/2 left-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search blogs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 pl-12 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm hover:shadow-md cursor-text"
                                aria-label="Search blogs"
                            />
                        </div>
                    </div>
                    <div className="max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-8">
                        {isFetching ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: itemsPerPage }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 p-6 shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        <Skeleton className="w-full h-52 rounded-2xl skeleton-pulse" />
                                        <div className="mt-4 space-y-3">
                                            <Skeleton className="h-6 w-3/4 rounded-lg skeleton-pulse" />
                                            <Skeleton className="h-4 w-1/2 rounded-lg skeleton-pulse" />
                                            <Skeleton className="h-4 w-1/3 rounded-lg skeleton-pulse" />
                                            <div className="flex gap-2">
                                                <Skeleton className="h-5 w-20 rounded-full skeleton-pulse" />
                                                <Skeleton className="h-5 w-20 rounded-full skeleton-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : blogs.length === 0 ? (
                            <div className="text-center p-8">
                                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                                    No blogs found
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {blogs.map((blog) => {
                                    let previewText = '';
                                    let fullContent = '';
                                    if (typeof blog.content === 'string') {
                                        previewText = blog.content.slice(0, 150) + '...';
                                        fullContent = blog.content;
                                    } else {
                                        previewText = blog.content.filter(s => s.type === 'text').map(s => s.content).join(' ').slice(0, 150) + '...';
                                        fullContent = blog.content.map(s => s.type === 'text' ? s.content : '[Image]').join('\n');
                                    }
                                    return (
                                        <div
                                            key={blog._id}
                                            className="group rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 p-6 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                                        >
                                            {blog.image && (
                                                <div className="relative w-full h-52 rounded-2xl overflow-hidden mb-4 group-hover:shadow-lg">
                                                    <Image
                                                        src={blog.image}
                                                        alt={blog.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </div>
                                            )}
                                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white truncate tracking-tight" title={blog.title}>
                                                {blog.title}
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                {user?.firstName} {user?.lastName}
                                            </p>
                                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                                {new Date(blog.date).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2" title={fullContent}>
                                                {previewText}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <span className="text-xs rounded-full px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 font-medium shadow-sm hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-all duration-200 cursor-pointer">
                                                    {blog.category}
                                                </span>
                                                {blog.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="text-xs rounded-full px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 font-medium shadow-sm hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-all duration-200 cursor-pointer"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            {!isLoading && isAuthenticated && user?.userId && blog.author && user.userId === blog.author && (
                                                <div className="flex items-center justify-end gap-3 mt-4">
                                                    <button
                                                        onClick={() => handleUpdateBlog(blog._id)}
                                                        className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-all duration-200 cursor-pointer"
                                                        title="Edit Blog"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBlog(blog._id)}
                                                        className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-all duration-200 cursor-pointer"
                                                        title="Delete Blog"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
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
                                                        ? 'bg-[#2b2720] text-[#aca08e]'
                                                        : 'text-[#362e23] bg-white hover:bg-[#dbc59c]/10'
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

            {/* Add New Blog Modal */}
            <Transition appear show={isAddModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsAddModalOpen(false)}>
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
                                <Dialog.Panel className="w-full max-w-2xl transform rounded-3xl bg-white/95 dark:bg-gray-800/95 p-8 text-left shadow-2xl transition-all">
                                    <Dialog.Title as="h3" className="text-3xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                                        Create New Blog
                                    </Dialog.Title>
                                    <form onSubmit={handleAddSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={newBlog.title}
                                                onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value, slug: generateSlug(e.target.value) })}
                                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                placeholder="Enter blog title"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Author
                                            </label>
                                            <input
                                                type="text"
                                                value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                                                disabled
                                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100/80 dark:bg-gray-700/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 shadow-sm cursor-not-allowed"
                                                placeholder="Author name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Date
                                            </label>
                                            <DatePickerComponent
                                                selectedDate={newBlog.date}
                                                onChange={(date: Date | null) => {
                                                    setNewBlog({
                                                        ...newBlog,
                                                        date: date ? date.toISOString().split('T')[0] : '',
                                                    });
                                                }}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Category
                                            </label>
                                            <select
                                                value={newBlog.category}
                                                onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                                                className="custom-select__control w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-pointer"
                                                required
                                            >
                                                <option value="" disabled className="text-gray-400 dark:text-gray-500">Select a category</option>
                                                {categories.map((category) => (
                                                    <option
                                                        key={category}
                                                        value={category}
                                                        className="custom-select__option"
                                                    >
                                                        {category}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Content Sections
                                            </label>
                                            {newBlog.content.map((section) => (
                                                <div key={section.id} className="mb-4 border border-gray-200 dark:border-gray-700 p-4 rounded relative">
                                                    {section.type === "text" ? (
                                                        <textarea
                                                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                            placeholder="Write section content..."
                                                            value={section.content}
                                                            onChange={(e) => handleSectionTextChange(section.id, e.target.value, false)}
                                                            rows={6}
                                                        />
                                                    ) : (
                                                        <div>
                                                            {section.content ? (
                                                                <div className="relative w-full h-48">
                                                                    <Image
                                                                        src={section.content}
                                                                        alt="Section Image Preview"
                                                                        fill
                                                                        className="object-cover rounded-lg"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveSectionImage(section.id, false)}
                                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-200 cursor-pointer"
                                                                        aria-label="Remove section image"
                                                                    >
                                                                        <svg
                                                                            className="h-4 w-4"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={2}
                                                                                d="M6 18L18 6M6 6l12 12"
                                                                            />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className={`relative flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 ${isDragging
                                                                            ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/50'
                                                                            : 'border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80'
                                                                        } transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer`}
                                                                    onDragOver={handleDragOver}
                                                                    onDragEnter={handleDragEnter}
                                                                    onDragLeave={handleDragLeave}
                                                                    onDrop={(e) => {
                                                                        e.preventDefault();
                                                                        setIsDragging(false);
                                                                        const files = Array.from(e.dataTransfer.files);
                                                                        if (files.length > 0) handleSectionImageUpload(section.id, files[0], false);
                                                                    }}
                                                                >
                                                                    {isUploadingImage ? (
                                                                        <div className="flex items-center justify-center">
                                                                            <svg
                                                                                className="animate-spin h-6 w-6 text-indigo-500 dark:text-indigo-400"
                                                                                viewBox="0 0 24 24"
                                                                                fill="none"
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                            >
                                                                                <circle
                                                                                    className="opacity-25"
                                                                                    cx="12"
                                                                                    cy="12"
                                                                                    r="10"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="4"
                                                                                ></circle>
                                                                                <path
                                                                                    className="opacity-75"
                                                                                    fill="currentColor"
                                                                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                                                ></path>
                                                                            </svg>
                                                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                                                                                Uploading...
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-center">
                                                                            <svg
                                                                                className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                aria-hidden="true"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={2}
                                                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                                />
                                                                            </svg>
                                                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                                                Drag and drop an image here, or
                                                                            </p>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const input = document.getElementById(`sectionImage-${section.id}`) as HTMLInputElement;
                                                                                    if (input) input.click();
                                                                                }}
                                                                                className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 cursor-pointer"
                                                                            >
                                                                                Browse Files
                                                                            </button>
                                                                            <input
                                                                                id={`sectionImage-${section.id}`}
                                                                                type="file"
                                                                                accept="image/*"
                                                                                onChange={(e) => e.target.files && handleSectionImageUpload(section.id, e.target.files[0], false)}
                                                                                className="hidden"
                                                                                aria-label="Upload section image"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                                Upload an image (max 5MB, PNG/JPEG)
                                                            </p>
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSection(section.id, false)}
                                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-all duration-200"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <div className="flex gap-4 mt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => addSection("text", false)}
                                                    className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-medium text-white hover:bg-blue-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                                >
                                                    <Plus className="h-5 w-5" />
                                                    Add Text Section
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => addSection("image", false)}
                                                    className="inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-medium text-white hover:bg-green-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                                >
                                                    <Plus className="h-5 w-5" />
                                                    Add Image Section
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Tags
                                            </label>
                                            <input
                                                type="text"
                                                value={newBlog.tagsString ?? newBlog.tags.join(', ')}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setNewBlog({
                                                        ...newBlog,
                                                        tagsString: value, // Store raw input for smooth typing
                                                        tags: value
                                                            .split(',')
                                                            .map((item) => item.trim())
                                                            .filter((item) => item !== ''), // Update array in sync
                                                    });
                                                }}
                                                onBlur={(e) => {
                                                    const value = e.target.value;
                                                    setNewBlog({
                                                        ...newBlog,
                                                        tags: value
                                                            .split(',')
                                                            .map((item) => item.trim())
                                                            .filter((item) => item !== ''), // Clean up array
                                                        tagsString: undefined, // Clear temporary string
                                                    });
                                                }}
                                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                placeholder="Enter tags (comma-separated)"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Slug
                                            </label>
                                            <input
                                                type="text"
                                                value={newBlog.slug}
                                                disabled
                                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100/80 dark:bg-gray-700/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 shadow-sm cursor-not-allowed"
                                                placeholder="Generated slug"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Banner Image
                                            </label>
                                            <div
                                                className={`relative flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 ${isDragging
                                                    ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/50'
                                                    : 'border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80'
                                                    } transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer`}
                                                onDragOver={handleDragOver}
                                                onDragEnter={handleDragEnter}
                                                onDragLeave={handleDragLeave}
                                                onDrop={(e) => handleDrop(e, false)}
                                            >
                                                {isUploadingImage ? (
                                                    <div className="flex items-center justify-center">
                                                        <svg
                                                            className="animate-spin h-6 w-6 text-indigo-500 dark:text-indigo-400"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                            ></path>
                                                        </svg>
                                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                                                            Uploading...
                                                        </span>
                                                    </div>
                                                ) : newBlogImagePreview ? (
                                                    <div className="relative w-full h-full">
                                                        <Image
                                                            src={newBlogImagePreview}
                                                            alt="Blog Image Preview"
                                                            fill
                                                            className="object-cover rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(false)}
                                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-200 cursor-pointer"
                                                            aria-label="Remove image"
                                                        >
                                                            <svg
                                                                className="h-4 w-4"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M6 18L18 6M6 6l12 12"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <svg
                                                            className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                            />
                                                        </svg>
                                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                            Drag and drop an image here, or
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={() => triggerFileInput(false)}
                                                            className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 cursor-pointer"
                                                        >
                                                            Browse Files
                                                        </button>
                                                        <input
                                                            id="newBlogImage"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileInputChange(e, false)}
                                                            className="hidden"
                                                            aria-label="Upload blog image"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                Upload an image (max 5MB, PNG/JPEG)
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row justify-end gap-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsAddModalOpen(false);
                                                    setNewBlogImagePreview(null);
                                                }}
                                                className="inline-flex justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className={`inline-flex justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:focus:ring-indigo-400 transition-all duration-300 transform hover:scale-105 cursor-pointer ${isUploadingImage ? 'opacity-70 cursor-not-allowed' : ''
                                                    }`}
                                                disabled={isUploadingImage}
                                            >
                                                {isUploadingImage ? (
                                                    <>
                                                        <svg
                                                            className="animate-spin h-5 w-5 text-white mr-2"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                            ></path>
                                                        </svg>
                                                        <span className="text-sm">Uploading...</span>
                                                    </>
                                                ) : (
                                                    'Create Blog'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Update Blog Modal */}
            <Transition appear show={isUpdateModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsUpdateModalOpen(false)}>
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
                                <Dialog.Panel className="w-full max-w-2xl transform rounded-3xl bg-white/95 dark:bg-gray-800/95 p-8 text-left shadow-2xl transition-all">
                                    <Dialog.Title as="h3" className="text-3xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                                        Update Blog
                                    </Dialog.Title>
                                    {selectedBlog && (
                                        <form onSubmit={handleUpdateSubmit} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Title
                                                </label>
                                                <input
                                                    type="text"
                                                    value={selectedBlog.title}
                                                    onChange={(e) =>
                                                        setSelectedBlog({
                                                            ...selectedBlog,
                                                            title: e.target.value,
                                                            slug: generateSlug(e.target.value),
                                                        })
                                                    }
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                    placeholder="Enter blog title"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Author
                                                </label>
                                                <input
                                                    type="text"
                                                    value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                                                    disabled
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100/80 dark:bg-gray-700/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 shadow-sm cursor-not-allowed"
                                                    placeholder="Author name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Date
                                                </label>
                                                <DatePickerComponent
                                                    selectedDate={selectedBlog.date}
                                                    onChange={(date: Date | null) =>
                                                        setSelectedBlog({
                                                            ...selectedBlog,
                                                            date: date ? date.toISOString().split('T')[0] : '',
                                                        })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Category
                                                </label>
                                                <select
                                                    value={selectedBlog.category}
                                                    onChange={(e) =>
                                                        setSelectedBlog({ ...selectedBlog, category: e.target.value })
                                                    }
                                                    className="custom-select__control w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-pointer"
                                                    required
                                                >
                                                    <option value="" disabled className="text-gray-400 dark:text-gray-500">Select a category</option>
                                                    {categories.map((category) => (
                                                        <option
                                                            key={category}
                                                            value={category}
                                                            className="custom-select__option"
                                                        >
                                                            {category}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Content Sections
                                                </label>
                                                {selectedBlog.content.map((section) => (
                                                    <div key={section.id} className="mb-4 border border-gray-200 dark:border-gray-700 p-4 rounded relative">
                                                        {section.type === "text" ? (
                                                            <textarea
                                                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                                placeholder="Write section content..."
                                                                value={section.content}
                                                                onChange={(e) => handleSectionTextChange(section.id, e.target.value, true)}
                                                                rows={6}
                                                            />
                                                        ) : (
                                                            <div>
                                                                {section.content ? (
                                                                    <div className="relative w-full h-48">
                                                                        <Image
                                                                            src={section.content}
                                                                            alt="Section Image Preview"
                                                                            fill
                                                                            className="object-cover rounded-lg"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveSectionImage(section.id, true)}
                                                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-200 cursor-pointer"
                                                                            aria-label="Remove section image"
                                                                        >
                                                                            <svg
                                                                                className="h-4 w-4"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={2}
                                                                                    d="M6 18L18 6M6 6l12 12"
                                                                                />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div
                                                                        className={`relative flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 ${isDragging
                                                                            ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/50'
                                                                            : 'border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80'
                                                                            } transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer`}
                                                                        onDragOver={handleDragOver}
                                                                        onDragEnter={handleDragEnter}
                                                                        onDragLeave={handleDragLeave}
                                                                        onDrop={(e) => {
                                                                            e.preventDefault();
                                                                            setIsDragging(false);
                                                                            const files = Array.from(e.dataTransfer.files);
                                                                            if (files.length > 0) handleSectionImageUpload(section.id, files[0], true);
                                                                        }}
                                                                    >
                                                                        {isUploadingImage ? (
                                                                            <div className="flex items-center justify-center">
                                                                                <svg
                                                                                    className="animate-spin h-6 w-6 text-indigo-500 dark:text-indigo-400"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                >
                                                                                    <circle
                                                                                        className="opacity-25"
                                                                                        cx="12"
                                                                                        cy="12"
                                                                                        r="10"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth="4"
                                                                                    ></circle>
                                                                                    <path
                                                                                        className="opacity-75"
                                                                                        fill="currentColor"
                                                                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                                                    ></path>
                                                                                </svg>
                                                                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                                                                                    Uploading...
                                                                                </span>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-center">
                                                                                <svg
                                                                                    className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    viewBox="0 0 24 24"
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    aria-hidden="true"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth={2}
                                                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                                    />
                                                                                </svg>
                                                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                                                    Drag and drop an image here, or
                                                                                </p>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        const input = document.getElementById(`sectionImage-${section.id}`) as HTMLInputElement;
                                                                                        if (input) input.click();
                                                                                    }}
                                                                                    className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 cursor-pointer"
                                                                                >
                                                                                    Browse Files
                                                                                </button>
                                                                                <input
                                                                                    id={`sectionImage-${section.id}`}
                                                                                    type="file"
                                                                                    accept="image/*"
                                                                                    onChange={(e) => e.target.files && handleSectionImageUpload(section.id, e.target.files[0], true)}
                                                                                    className="hidden"
                                                                                    aria-label="Upload section image"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                                    Upload an image (max 5MB, PNG/JPEG)
                                                                </p>
                                                            </div>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSection(section.id, true)}
                                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-all duration-200"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <div className="flex gap-4 mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => addSection("text", true)}
                                                        className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-medium text-white hover:bg-blue-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                                    >
                                                        <Plus className="h-5 w-5" />
                                                        Add Text Section
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => addSection("image", true)}
                                                        className="inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-medium text-white hover:bg-green-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                                    >
                                                        <Plus className="h-5 w-5" />
                                                        Add Image Section
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Tags
                                                </label>
                                                <input
                                                    type="text"
                                                    value={selectedBlog.tagsString ?? selectedBlog.tags.join(', ')}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setSelectedBlog({
                                                            ...selectedBlog,
                                                            tagsString: value, // Store raw input for smooth typing
                                                            tags: value
                                                                .split(',')
                                                                .map((item) => item.trim())
                                                                .filter((item) => item !== ''), // Update array in sync
                                                        });
                                                    }}
                                                    onBlur={(e) => {
                                                        const value = e.target.value;
                                                        setSelectedBlog({
                                                            ...selectedBlog,
                                                            tags: value
                                                                .split(',')
                                                                .map((item) => item.trim())
                                                                .filter((item) => item !== ''), // Clean up array
                                                            tagsString: undefined, // Clear temporary string
                                                        });
                                                    }}
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                    placeholder="Enter tags (comma-separated)"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Slug
                                                </label>
                                                <input
                                                    type="text"
                                                    value={selectedBlog.slug}
                                                    disabled
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100/80 dark:bg-gray-700/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 shadow-sm cursor-not-allowed"
                                                    placeholder="Generated slug"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Banner Image
                                                </label>
                                                <div
                                                    className={`relative flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 ${isDragging
                                                        ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/50'
                                                        : 'border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80'
                                                        } transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer`}
                                                    onDragOver={handleDragOver}
                                                    onDragEnter={handleDragEnter}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={(e) => handleDrop(e, true)}
                                                >
                                                    {isUploadingImage ? (
                                                        <div className="flex items-center justify-center">
                                                            <svg
                                                                className="animate-spin h-6 w-6 text-indigo-500 dark:text-indigo-400"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <circle
                                                                    className="opacity-25"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                ></circle>
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                                ></path>
                                                            </svg>
                                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                                                                Uploading...
                                                            </span>
                                                        </div>
                                                    ) : updateBlogImagePreview ? (
                                                        <div className="relative w-full h-full">
                                                            <Image
                                                                src={updateBlogImagePreview}
                                                                alt="Blog Image Preview"
                                                                fill
                                                                className="object-cover rounded-lg"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveImage(true)}
                                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-200 cursor-pointer"
                                                                aria-label="Remove image"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M6 18L18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center">
                                                            <svg
                                                                className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                aria-hidden="true"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                                Drag and drop an image here, or
                                                            </p>
                                                            <button
                                                                type="button"
                                                                onClick={() => triggerFileInput(true)}
                                                                className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 cursor-pointer"
                                                            >
                                                                Browse Files
                                                            </button>
                                                            <input
                                                                id="updateBlogImage"
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleFileInputChange(e, true)}
                                                                className="hidden"
                                                                aria-label="Upload blog image"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                    Upload an image (max 5MB, PNG/JPEG)
                                                </p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row justify-end gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsUpdateModalOpen(false);
                                                        setUpdateBlogImagePreview(null);
                                                    }}
                                                    className="inline-flex justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className={`inline-flex justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:focus:ring-indigo-400 transition-all duration-300 transform hover:scale-105 cursor-pointer ${isUploadingImage ? 'opacity-70 cursor-not-allowed' : ''
                                                        }`}
                                                    disabled={isUploadingImage}
                                                >
                                                    {isUploadingImage ? (
                                                        <>
                                                            <svg
                                                                className="animate-spin h-5 w-5 text-white mr-2"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <circle
                                                                    className="opacity-25"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                ></circle>
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                                ></path>
                                                            </svg>
                                                            <span className="text-sm">Uploading...</span>
                                                        </>
                                                    ) : (
                                                        'Update Blog'
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Delete Confirmation Modal */}
            <Transition appear show={isDeleteModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsDeleteModalOpen(false)}>
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
                                        Delete Blog
                                    </Dialog.Title>
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                            Are you sure you want to delete this blog? This action cannot be undone.
                                        </p>
                                    </div>
                                    <div className="mt-6 flex justify-end gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsDeleteModalOpen(false)}
                                            className="inline-flex justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDeleteConfirm}
                                            className="inline-flex justify-center rounded-lg border border-transparent bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 text-sm font-semibold text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                                        >
                                            Delete Blog
                                        </button>
                                    </div>
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

export default Blogs;