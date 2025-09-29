/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { Search, Edit, Trash2, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog, Listbox, Transition } from '@headlessui/react';
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

interface Client {
    _id: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading?: boolean;
}

interface Milestone {
    name: string;
    completed: boolean;
    date: string;
}

interface Project {
    _id: string;
    title: string;
    author: string; // userId
    coAuthors: string[]; // array of userIds
    client: string; // clientId
    startDate?: string;
    deadline?: string;
    deliveryDate?: string;
    description: string;
    techStack: string[];
    tools: string[];
    category: string;
    status: string;
    priority: string;
    slug: string;
    imageUrl: string | null;
    publicId: string | null;
    projectUrl: string;
    repoUrl: string;
    deployment: string;
    budget?: number;
    currency: string;
    contractType: string;
    paymentStatus: string;
    featured: boolean;
    caseStudy: string;
    milestones: Milestone[];
    createdAt: string;
    updatedAt: string;
}

interface ProjectForm {
    _id?: string;
    title: string;
    author: string; // userId
    coAuthors: string[]; // array of userIds
    client: string; // clientId
    startDate: string;
    deadline: string;
    deliveryDate: string;
    description: string;
    techStack: string[];
    tools: string[];
    category: string;
    status: string;
    priority: string;
    slug: string;
    imageUrl: string | null;
    publicId: string | null;
    projectUrl: string;
    repoUrl: string;
    deployment: string;
    budget: number | null;
    currency: string;
    contractType: string;
    paymentStatus: string;
    featured: boolean;
    caseStudy: string;
    milestones: Milestone[];
}

const Projects: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth() as AuthContextType;
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<{ userId: string; name: string }[]>([]);
    console.log(users)
    const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
    console.log(clients)
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectForm | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const [newProject, setNewProject] = useState<ProjectForm>({
        title: '',
        author: '',
        coAuthors: [],
        client: '',
        startDate: '',
        deadline: '',
        deliveryDate: '',
        description: '',
        techStack: [],
        tools: [],
        category: '',
        status: 'ongoing',
        priority: 'medium',
        slug: '',
        imageUrl: null,
        publicId: null,
        projectUrl: '',
        repoUrl: '',
        deployment: '',
        budget: null,
        currency: 'USD',
        contractType: '',
        paymentStatus: 'pending',
        featured: false,
        caseStudy: '',
        milestones: [],
    });
    const [newProjectImagePreview, setNewProjectImagePreview] = useState<string | null>(null);
    const [updateProjectImagePreview, setUpdateProjectImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const categories = ['Web Development', 'Mobile Development', 'Backend', 'Frontend', 'Fullstack', 'Design', 'Other'];
    const statusOptions = ['ongoing', 'completed', 'paused', 'cancelled'];
    const priorityOptions = ['low', 'medium', 'high'];
    const contractTypeOptions = ['fixed-price', 'hourly', 'retainer'];
    const paymentStatusOptions = ['pending', 'paid', 'overdue'];
    const currencyOptions = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'BDT'];
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
            setNewProject((prev) => ({
                ...prev,
                author: user.userId,
            }));
        }
    }, [user, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            const fetchUsers = async () => {
                try {
                    const response = await fetch('/api/users');
                    if (response.ok) {
                        const data = await response.json();
                        console.log(data); // Debug the response
                        if (Array.isArray(data.users)) {
                            setUsers(
                                data.users.map((u: any) => ({
                                    userId: u._id,
                                    name: u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.name || 'Unknown'
                                }))
                            );
                        } else {
                            console.error('Users data is not an array:', data.users);
                            setUsers([]);
                        }
                    } else {
                        console.error('Failed to fetch users:', response.statusText);
                        setUsers([]);
                    }
                } catch (error) {
                    console.error('Fetch users error:', error);
                    setUsers([]);
                }
            };

            /* const fetchClients = async () => {
                try {
                    const response = await fetch('/api/clients');
                    if (response.ok) {
                        const data = await response.json();
                        
                        console.log(data); // Debug the response
                        if (Array.isArray(data.clients)) {
                            setClients(
                                data.clients.map((c: any) => ({
                                    id: c._id,
                                    name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown'
                                }))
                            );
                        } else {
                            console.error('Clients data is not an array:', data.clients);
                            setClients([]);
                        }
                    } else {
                        console.error('Failed to fetch clients:', response.statusText);
                        setClients([]);
                    }
                } catch (error) {
                    console.error('Fetch clients error:', error);
                    setClients([]);
                }
            }; */
            const fetchClients = async () => {
                try {
                    const response = await fetch('/api/clients');
                    if (response.ok) {
                        const data = await response.json();
                        console.log("clients",data); // Debug the response
                        if (Array.isArray(data.clients)) {
                            setClients(
                                data.clients.map((c: any) => ({
                                    id: c._id,
                                    name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown'
                                }))
                            );
                        } else {
                            console.error('Clients data is not an array:', data.clients);
                            setClients([]);
                        }
                    } else {
                        console.error('Failed to fetch clients:', response.statusText);
                        setClients([]);
                    }
                } catch (error) {
                    console.error('Fetch clients error:', error);
                    setClients([]);
                }
            };

            fetchUsers();
            fetchClients();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const fetchProjects = async () => {
            setIsFetching(true);
            try {
                const response = await fetch(
                    `/api/projects?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    setProjects(data.projects || []);
                    setTotalPages(data.totalPages || 1);
                } else {
                    const errorData = await response.json();
                    toast.error(errorData?.error || 'Failed to fetch projects');
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to fetch projects');
                console.error('Fetch projects error:', error);
            } finally {
                setIsFetching(false);
            }
        };
        fetchProjects();
    }, [currentPage, searchTerm]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleUpdateProject = (projectId: string) => {
        const project = projects.find((p) => p._id === projectId);
        if (project && isAuthenticated && user?.userId === project.author) {
            setSelectedProject({
                ...project,
                author: project.author,
                coAuthors: project.coAuthors || [],
                client: project.client,
                startDate: project.startDate || '',
                deadline: project.deadline || '',
                deliveryDate: project.deliveryDate || '',
                imageUrl: project.imageUrl,
                publicId: project.publicId,
                slug: project.slug,
                budget: project.budget || null,
                milestones: project.milestones || [],
            });
            setUpdateProjectImagePreview(project.imageUrl);
            setIsUpdateModalOpen(true);
        } else {
            toast.error('You are not authorized to edit this project.');
        }
    };

    const handleDeleteProject = (projectId: string) => {
        const project = projects.find((p) => p._id === projectId);
        if (project && isAuthenticated && user?.userId === project.author) {
            setProjectToDelete(projectId);
            setIsDeleteModalOpen(true);
        } else {
            toast.error('You are not authorized to delete this project.');
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

            const response = await fetch('/api/auth/cloudinary_project_image', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload image');
            }

            const reader = new FileReader();
            reader.onload = () => {
                const previewUrl = reader.result as string;
                if (isUpdate && selectedProject) {
                    setSelectedProject({
                        ...selectedProject,
                        imageUrl: data.imageUrl,
                        publicId: data.publicId,
                    });
                    setUpdateProjectImagePreview(previewUrl);
                } else {
                    setNewProject({
                        ...newProject,
                        imageUrl: data.imageUrl,
                        publicId: data.publicId,
                    });
                    setNewProjectImagePreview(previewUrl);
                }
                toast.success('Image uploaded successfully!');
            };
            reader.onerror = () => {
                toast.error('Failed to generate image preview');
            };
            reader.readAsDataURL(file);
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload image');
            console.error('Image upload error:', error);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleRemoveImage = async (isUpdate: boolean) => {
        if (isUpdate && selectedProject?.publicId) {
            try {
                const response = await fetch(`/api/cloudinary_project_image?publicId=${encodeURIComponent(selectedProject.publicId)}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete image');
                }
                setSelectedProject({ ...selectedProject, imageUrl: null, publicId: null });
                setUpdateProjectImagePreview(null);
                toast.success('Image removed successfully!');
            } catch (error: any) {
                toast.error(error.message || 'Failed to remove image');
                console.error('Remove image error:', error);
            }
        } else {
            setNewProject({ ...newProject, imageUrl: null, publicId: null });
            setNewProjectImagePreview(null);
            toast.success('Image removed successfully!');
        }
    };

    const triggerFileInput = (isUpdate: boolean) => {
        const inputId = isUpdate ? 'updateProjectImage' : 'newProjectImage';
        const input = document.getElementById(inputId) as HTMLInputElement;
        if (input) {
            input.click();
        }
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProject.title || !newProject.author || !newProject.description || !newProject.client) {
            toast.error('Please fill in all required fields.');
            return;
        }

        const projectWithSlug = {
            ...newProject,
            slug: generateSlug(newProject.title),
        };

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectWithSlug),
            });
            if (response.ok) {
                const data = await response.json();
                setProjects((prev) => [...prev, data]);
                setIsAddModalOpen(false);
                setNewProjectImagePreview(null);
                setNewProject({
                    title: '',
                    author: user?.userId || '',
                    coAuthors: [],
                    client: '',
                    startDate: '',
                    deadline: '',
                    deliveryDate: '',
                    description: '',
                    techStack: [],
                    tools: [],
                    category: '',
                    status: 'ongoing',
                    priority: 'medium',
                    slug: '',
                    imageUrl: null,
                    publicId: null,
                    projectUrl: '',
                    repoUrl: '',
                    deployment: '',
                    budget: null,
                    currency: 'USD',
                    contractType: '',
                    paymentStatus: 'pending',
                    featured: false,
                    caseStudy: '',
                    milestones: [],
                });
                toast.success('Project added successfully!');
            } else {
                const errorData = await response.json();
                toast.error(errorData?.error || 'Failed to add project');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to add project');
            console.error('Add project error:', error);
        }
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProject) return;

        if (!selectedProject.title || !selectedProject.author || !selectedProject.description || !selectedProject.client) {
            toast.error('Please fill in all required fields.');
            return;
        }

        try {
            const projectWithSlug = {
                ...selectedProject,
                slug: generateSlug(selectedProject.title),
            };

            const response = await fetch(`/api/projects/${selectedProject._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.userId || '',
                },
                body: JSON.stringify(projectWithSlug),
            });

            if (response.ok) {
                const data = await response.json();
                setProjects((prev) => prev.map((p) => (p._id === selectedProject._id ? data : p)));
                setIsUpdateModalOpen(false);
                setUpdateProjectImagePreview(null);
                setSelectedProject(null);
                toast.success('Project updated successfully!');
            } else {
                const errorData = await response.json();
                toast.error(errorData?.error || 'Failed to update project');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update project');
            console.error('Update project error:', error);
        }
    };

    const handleDeleteConfirm = async () => {
        if (projectToDelete) {
            try {
                const response = await fetch(`/api/projects/${projectToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': user?.userId ?? '',
                    },
                });

                if (response.ok) {
                    setProjects((prev) => prev.filter((p) => p._id !== projectToDelete));
                    setIsDeleteModalOpen(false);
                    setProjectToDelete(null);
                    toast.success('Project deleted successfully!');
                } else {
                    const errorData = await response.json();
                    toast.error(errorData?.error || 'Failed to delete project');
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete project');
                console.error('Delete project error:', error);
            }
        }
    };

    const getUserName = (userId: string) => {
        const foundUser = users.find((u) => u.userId === userId);
        return foundUser ? foundUser.name : 'Unknown';
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
                Discover Our Projects
            </h1>
            <div className="max-w-7xl mx-auto rounded-3xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 shadow-lg overflow-hidden">
                <div className="px-6 py-5 md:px-10 md:py-6 flex items-center justify-between">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                        Project Posts
                    </h3>
                    {isAuthenticated && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Add New Project</span>
                        </button>
                    )}
                </div>
                <div className="border-t border-gray-600 dark:border-gray-700 p-6 md:p-10">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            All Projects
                        </h3>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute top-1/2 -translate-y-1/2 left-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 pl-12 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm hover:shadow-md cursor-text"
                                aria-label="Search projects"
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
                        ) : projects.length === 0 ? (
                            <div className="text-center p-8">
                                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                                    No projects found
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map((project) => (
                                    <div
                                        key={project._id}
                                        className="group rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 p-6 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                                    >
                                        {project.imageUrl && (
                                            <div className="relative w-full h-52 rounded-2xl overflow-hidden mb-4 group-hover:shadow-lg">
                                                <Image
                                                    src={project.imageUrl}
                                                    alt={project.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </div>
                                        )}
                                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white truncate tracking-tight" title={project.title}>
                                            {project.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">
                                            {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'No start date'}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2" title={project.description}>
                                            {project.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <span className="text-xs rounded-full px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 font-medium shadow-sm hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-all duration-200 cursor-pointer">
                                                {project.category}
                                            </span>
                                            <span className="text-xs rounded-full px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 font-medium shadow-sm hover:bg-green-200 dark:hover:bg-green-800/50 transition-all duration-200 cursor-pointer">
                                                {project.status}
                                            </span>
                                            {project.techStack.map((tech, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs rounded-full px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 font-medium shadow-sm hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-all duration-200 cursor-pointer"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                        {!isLoading && isAuthenticated && user?.userId && project.author && user.userId === project.author && (
                                            <div className="flex items-center justify-end gap-3 mt-4">
                                                <button
                                                    onClick={() => handleUpdateProject(project._id)}
                                                    className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-all duration-200 cursor-pointer"
                                                    title="Edit Project"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProject(project._id)}
                                                    className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-all duration-200 cursor-pointer"
                                                    title="Delete Project"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
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

            {/* Add New Project Modal */}
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
                                        Create New Project
                                    </Dialog.Title>
                                    <form onSubmit={handleAddSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={newProject.title}
                                                onChange={(e) => setNewProject({ ...newProject, title: e.target.value, slug: generateSlug(e.target.value) })}
                                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                placeholder="Enter project title"
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

                                        <div className="space-y-4">
                                            {/* Co-Authors */}
                                            <div className="relative">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Co-Authors
                                                </label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {newProject.coAuthors.map((id) => (
                                                        <span
                                                            key={id}
                                                            className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 px-3 py-1 text-sm font-medium text-indigo-800 dark:text-indigo-200 shadow-sm"
                                                        >
                                                            {getUserName(id)}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setNewProject({
                                                                        ...newProject,
                                                                        coAuthors: newProject.coAuthors.filter((a) => a !== id),
                                                                    })
                                                                }
                                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200 transition-colors"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>

                                                <Listbox
                                                    value=""
                                                    onChange={(value: string) => {
                                                        if (value && !newProject.coAuthors.includes(value)) {
                                                            setNewProject({
                                                                ...newProject,
                                                                coAuthors: [...newProject.coAuthors, value],
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <Listbox.Button className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 cursor-pointer">
                                                        Select to add co-author
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute w-full mt-1 max-h-60 overflow-auto rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                        {users
                                                            .filter((u) => u.userId !== user?.userId && !newProject.coAuthors.includes(u.userId))
                                                            .map((u) => (
                                                                <Listbox.Option
                                                                    key={u.userId}
                                                                    value={u.userId}
                                                                    className={({ active }) =>
                                                                        `cursor-pointer select-none py-2 px-4 text-sm rounded transition-colors ${active
                                                                            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                                                                            : 'text-gray-900 dark:text-white'
                                                                        }`
                                                                    }
                                                                >
                                                                    {u.name}
                                                                </Listbox.Option>
                                                            ))}
                                                    </Listbox.Options>
                                                </Listbox>
                                            </div>

                                            {/* Client */}
                                            <div className="relative">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Client
                                                </label>
                                                <Listbox
                                                    value={newProject.client}
                                                    onChange={(value: string) => setNewProject({ ...newProject, client: value })}
                                                >
                                                    <Listbox.Button className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 cursor-pointer">
                                                        {newProject.client
                                                            ? clients.find((c) => c.id === newProject.client)?.name
                                                            : 'Select a client'}
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute w-full mt-1 max-h-60 overflow-auto rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                        {clients.map((c) => (
                                                            <Listbox.Option
                                                                key={c.id}
                                                                value={c.id}
                                                                className={({ active }) =>
                                                                    `cursor-pointer select-none py-2 px-4 text-sm rounded transition-colors ${active
                                                                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                                                                        : 'text-gray-900 dark:text-white'
                                                                    }`
                                                                }
                                                            >
                                                                {c.name}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Listbox>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Start Date
                                            </label>
                                            <DatePickerComponent
                                                selectedDate={newProject.startDate}
                                                onChange={(date: Date | null) => {
                                                    setNewProject({
                                                        ...newProject,
                                                        deadline: date ? date.toISOString().split('T')[0] : '',
                                                    });
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Deadline
                                            </label>
                                            <DatePickerComponent
                                                selectedDate={newProject.deadline}
                                                onChange={(date: Date | null) => {
                                                    setNewProject({
                                                        ...newProject,
                                                        deadline: date ? date.toISOString().split('T')[0] : '',
                                                    });
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Delivery Date
                                            </label>
                                            <DatePickerComponent
                                                selectedDate={newProject.deliveryDate}
                                                onChange={(date: Date | null) => {
                                                    setNewProject({
                                                        ...newProject,
                                                        deliveryDate: date ? date.toISOString().split('T')[0] : '',
                                                    });
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={newProject.description}
                                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                placeholder="Enter project description"
                                                rows={6}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Tech Stack
                                            </label>
                                            <input
                                                type="text"
                                                value={newProject.techStack.join(', ')}
                                                onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value.split(',').map((item) => item.trim()).filter((item) => item) })}
                                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                placeholder="Enter tech stack (comma-separated)"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Tools
                                            </label>
                                            <input
                                                type="text"
                                                value={newProject.tools.join(', ')}
                                                onChange={(e) => setNewProject({ ...newProject, tools: e.target.value.split(',').map((item) => item.trim()).filter((item) => item) })}
                                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                placeholder="Enter tools (comma-separated)"
                                            />
                                        </div>
                                        <div className="relative">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Category
                                            </label>
                                            <Listbox
                                                value={newProject.category}
                                                onChange={(value: string) => setNewProject({ ...newProject, category: value })}
                                            >
                                                <Listbox.Button className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 cursor-pointer">
                                                    {newProject.category || 'Select a category'}
                                                </Listbox.Button>
                                                <Listbox.Options className="absolute w-full mt-1 max-h-60 overflow-auto rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                    {categories.map((category) => (
                                                        <Listbox.Option
                                                            key={category}
                                                            value={category}
                                                            className={({ active }) =>
                                                                `cursor-pointer select-none py-2 px-4 text-sm rounded transition-colors ${active
                                                                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                                                                    : 'text-gray-900 dark:text-white'
                                                                }`
                                                            }
                                                        >
                                                            {category}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Listbox>
                                        </div>
                                        <div className="relative">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Status
                                            </label>
                                            <Listbox
                                                value={newProject.status}
                                                onChange={(value: string) => setNewProject({ ...newProject, status: value })}
                                            >
                                                <Listbox.Button className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 cursor-pointer">
                                                    {newProject.status ? newProject.status.charAt(0).toUpperCase() + newProject.status.slice(1) : 'Select status'}
                                                </Listbox.Button>
                                                <Listbox.Options className="absolute w-full mt-1 max-h-60 overflow-auto rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                    {statusOptions.map((status) => (
                                                        <Listbox.Option
                                                            key={status}
                                                            value={status}
                                                            className={({ active }) =>
                                                                `cursor-pointer select-none py-2 px-4 text-sm rounded transition-colors ${active
                                                                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                                                                    : 'text-gray-900 dark:text-white'
                                                                }`
                                                            }
                                                        >
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Listbox>
                                        </div>
                                        <div className="relative">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Priority
                                            </label>
                                            <Listbox
                                                value={newProject.priority}
                                                onChange={(value: string) => setNewProject({ ...newProject, priority: value })}
                                            >
                                                <Listbox.Button className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 cursor-pointer">
                                                    {newProject.priority ? newProject.priority.charAt(0).toUpperCase() + newProject.priority.slice(1) : 'Select priority'}
                                                </Listbox.Button>
                                                <Listbox.Options className="absolute w-full mt-1 max-h-60 overflow-auto rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                    {priorityOptions.map((priority) => (
                                                        <Listbox.Option
                                                            key={priority}
                                                            value={priority}
                                                            className={({ active }) =>
                                                                `cursor-pointer select-none py-2 px-4 text-sm rounded transition-colors ${active
                                                                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                                                                    : 'text-gray-900 dark:text-white'
                                                                }`
                                                            }
                                                        >
                                                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Listbox>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Slug
                                            </label>
                                            <input
                                                type="text"
                                                value={newProject.slug}
                                                disabled
                                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100/80 dark:bg-gray-700/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 shadow-sm cursor-not-allowed"
                                                placeholder="Generated slug"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Project URL
                                            </label>
                                            <input
                                                type="text"
                                                value={newProject.projectUrl}
                                                onChange={(e) => setNewProject({ ...newProject, projectUrl: e.target.value })}
                                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                placeholder="Enter project URL"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Repo URL
                                            </label>
                                            <input
                                                type="text"
                                                value={newProject.repoUrl}
                                                onChange={(e) => setNewProject({ ...newProject, repoUrl: e.target.value })}
                                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                placeholder="Enter repo URL"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Deployment
                                            </label>
                                            <input
                                                type="text"
                                                value={newProject.deployment}
                                                onChange={(e) => setNewProject({ ...newProject, deployment: e.target.value })}
                                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                placeholder="Enter deployment platform"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Budget
                                            </label>
                                            <input
                                                type="number"
                                                value={newProject.budget || ''}
                                                onChange={(e) => setNewProject({ ...newProject, budget: parseFloat(e.target.value) || null })}
                                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                placeholder="Enter budget"
                                            />
                                        </div>
                                        <div className="relative">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Currency
                                            </label>
                                            <Listbox
                                                value={newProject.currency}
                                                onChange={(value: string) => setNewProject({ ...newProject, currency: value })}
                                            >
                                                <Listbox.Button className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 cursor-pointer">
                                                    {newProject.currency || 'Select currency'}
                                                </Listbox.Button>
                                                <Listbox.Options className="absolute w-full mt-1 max-h-60 overflow-auto rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                    {currencyOptions.map((currency) => (
                                                        <Listbox.Option
                                                            key={currency}
                                                            value={currency}
                                                            className={({ active }) =>
                                                                `cursor-pointer select-none py-2 px-4 text-sm rounded transition-colors ${active
                                                                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                                                                    : 'text-gray-900 dark:text-white'
                                                                }`
                                                            }
                                                        >
                                                            {currency}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Listbox>
                                        </div>
                                        <div className="relative">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Contract Type
                                            </label>
                                            <Listbox
                                                value={newProject.contractType}
                                                onChange={(value: string) => setNewProject({ ...newProject, contractType: value })}
                                            >
                                                <Listbox.Button className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 cursor-pointer">
                                                    {newProject.contractType ? newProject.contractType.charAt(0).toUpperCase() + newProject.contractType.slice(1) : 'Select contract type'}
                                                </Listbox.Button>
                                                <Listbox.Options className="absolute w-full mt-1 max-h-60 overflow-auto rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                    {contractTypeOptions.map((type) => (
                                                        <Listbox.Option
                                                            key={type}
                                                            value={type}
                                                            className={({ active }) =>
                                                                `cursor-pointer select-none py-2 px-4 text-sm rounded transition-colors ${active
                                                                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                                                                    : 'text-gray-900 dark:text-white'
                                                                }`
                                                            }
                                                        >
                                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Listbox>
                                        </div>
                                        <div className="relative">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Payment Status
                                            </label>
                                            <Listbox
                                                value={newProject.paymentStatus}
                                                onChange={(value: string) => setNewProject({ ...newProject, paymentStatus: value })}
                                            >
                                                <Listbox.Button className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 cursor-pointer">
                                                    {newProject.paymentStatus ? newProject.paymentStatus.charAt(0).toUpperCase() + newProject.paymentStatus.slice(1) : 'Select payment status'}
                                                </Listbox.Button>
                                                <Listbox.Options className="absolute w-full mt-1 max-h-60 overflow-auto rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                    {paymentStatusOptions.map((status) => (
                                                        <Listbox.Option
                                                            key={status}
                                                            value={status}
                                                            className={({ active }) =>
                                                                `cursor-pointer select-none py-2 px-4 text-sm rounded transition-colors ${active
                                                                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                                                                    : 'text-gray-900 dark:text-white'
                                                                }`
                                                            }
                                                        >
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Listbox>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={newProject.featured}
                                                onChange={(e) => setNewProject({ ...newProject, featured: e.target.checked })}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-400"
                                                id="featured"
                                            />
                                            <label htmlFor="featured" className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                                Featured
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Case Study
                                            </label>
                                            <textarea
                                                value={newProject.caseStudy}
                                                onChange={(e) => setNewProject({ ...newProject, caseStudy: e.target.value })}
                                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                placeholder="Enter case study"
                                                rows={6}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                                Milestones
                                            </label>
                                            {newProject.milestones.map((milestone, index) => (
                                                <div
                                                    key={index}
                                                    className="relative rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 p-4 shadow-sm"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <input
                                                            type="text"
                                                            value={milestone.name}
                                                            onChange={(e) => {
                                                                const updatedMilestones = [...newProject.milestones];
                                                                updatedMilestones[index].name = e.target.value;
                                                                setNewProject({ ...newProject, milestones: updatedMilestones });
                                                            }}
                                                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-1.5 px-3 text-base font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300"
                                                            placeholder="Milestone name"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updatedMilestones = [...newProject.milestones];
                                                                updatedMilestones.splice(index, 1);
                                                                setNewProject({ ...newProject, milestones: updatedMilestones });
                                                            }}
                                                            className="ml-4 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 transition-colors duration-200 cursor-pointer"
                                                            aria-label="Delete milestone"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <DatePickerComponent
                                                            selectedDate={milestone.date}
                                                            onChange={(date: Date | null) => {
                                                                const updatedMilestones = [...newProject.milestones];
                                                                updatedMilestones[index].date = date ? date.toISOString().split('T')[0] : '';
                                                                setNewProject({ ...newProject, milestones: updatedMilestones });
                                                            }}
                                                        />
                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={milestone.completed}
                                                                onChange={(e) => {
                                                                    const updatedMilestones = [...newProject.milestones];
                                                                    updatedMilestones[index].completed = e.target.checked;
                                                                    setNewProject({ ...newProject, milestones: updatedMilestones });
                                                                }}
                                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-400 cursor-pointer"
                                                                id={`milestone-completed-${index}`}
                                                            />
                                                            <label
                                                                htmlFor={`milestone-completed-${index}`}
                                                                className="ml-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
                                                            >
                                                                Completed
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setNewProject({
                                                        ...newProject,
                                                        milestones: [...newProject.milestones, { name: '', completed: false, date: '' }],
                                                    });
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all duration-200 cursor-pointer"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add Milestone
                                            </button>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                Project Image
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
                                                ) : newProjectImagePreview ? (
                                                    <div className="relative w-full h-full">
                                                        <Image
                                                            src={newProjectImagePreview}
                                                            alt="Project Image Preview"
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
                                                            id="newProjectImage"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileInputChange(e, false)}
                                                            className="hidden"
                                                            aria-label="Upload project image"
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
                                                    setNewProjectImagePreview(null);
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
                                                    'Create Project'
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

            {/* Update Project Modal */}
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
                                        Update Project
                                    </Dialog.Title>
                                    {selectedProject && (
                                        <form onSubmit={handleUpdateSubmit} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Title
                                                </label>
                                                <input
                                                    type="text"
                                                    value={selectedProject.title}
                                                    onChange={(e) =>
                                                        setSelectedProject({
                                                            ...selectedProject,
                                                            title: e.target.value,
                                                            slug: generateSlug(e.target.value),
                                                        })
                                                    }
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                    placeholder="Enter project title"
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
                                            <div className="relative">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Co-Authors
                                                </label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {selectedProject.coAuthors.map((id) => (
                                                        <span
                                                            key={id}
                                                            className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 px-3 py-1 text-sm font-medium text-indigo-800 dark:text-indigo-200 shadow-sm"
                                                        >
                                                            {getUserName(id)}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setSelectedProject({
                                                                        ...selectedProject,
                                                                        coAuthors: selectedProject.coAuthors.filter((a) => a !== id),
                                                                    })
                                                                }
                                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200 transition-colors"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                                <Listbox
                                                    value=""
                                                    onChange={(value: string) => {
                                                        if (value && !selectedProject.coAuthors.includes(value)) {
                                                            setSelectedProject({
                                                                ...selectedProject,
                                                                coAuthors: [...selectedProject.coAuthors, value],
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <Listbox.Button className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 cursor-pointer">
                                                        Select to add co-author
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute w-full mt-1 max-h-60 overflow-auto rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                        {users
                                                            .filter((u) => u.userId !== user?.userId && !selectedProject.coAuthors.includes(u.userId))
                                                            .map((u) => (
                                                                <Listbox.Option
                                                                    key={u.userId}
                                                                    value={u.userId}
                                                                    className={({ active }) =>
                                                                        `cursor-pointer select-none py-2 px-4 text-sm rounded transition-colors ${active
                                                                            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                                                                            : 'text-gray-900 dark:text-white'
                                                                        }`
                                                                    }
                                                                >
                                                                    {u.name}
                                                                </Listbox.Option>
                                                            ))}
                                                    </Listbox.Options>
                                                </Listbox>
                                            </div>
                                            <div className="relative">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Client
                                                </label>
                                                <Listbox
                                                    value={selectedProject.client}
                                                    onChange={(value: string) => setSelectedProject({ ...selectedProject, client: value })}
                                                >
                                                    <Listbox.Button className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 cursor-pointer">
                                                        {selectedProject.client
                                                            ? clients.find((c) => c.id === selectedProject.client)?.name
                                                            : 'Select a client'}
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute w-full mt-1 max-h-60 overflow-auto rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                        {clients.map((c) => (
                                                            <Listbox.Option
                                                                key={c.id}
                                                                value={c.id}
                                                                className={({ active }) =>
                                                                    `cursor-pointer select-none py-2 px-4 text-sm rounded transition-colors ${active
                                                                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                                                                        : 'text-gray-900 dark:text-white'
                                                                    }`
                                                                }
                                                            >
                                                                {c.name}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Listbox>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Start Date
                                                </label>
                                                <DatePickerComponent
                                                    selectedDate={selectedProject.startDate}
                                                    onChange={(date: Date | null) =>
                                                        setSelectedProject({
                                                            ...selectedProject,
                                                            startDate: date ? date.toISOString().split('T')[0] : '',
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Deadline
                                                </label>
                                                <DatePickerComponent
                                                    selectedDate={selectedProject.deadline}
                                                    onChange={(date: Date | null) =>
                                                        setSelectedProject({
                                                            ...selectedProject,
                                                            deadline: date ? date.toISOString().split('T')[0] : '',
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Delivery Date
                                                </label>
                                                <DatePickerComponent
                                                    selectedDate={selectedProject.deliveryDate}
                                                    onChange={(date: Date | null) =>
                                                        setSelectedProject({
                                                            ...selectedProject,
                                                            deliveryDate: date ? date.toISOString().split('T')[0] : '',
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={selectedProject.description}
                                                    onChange={(e) =>
                                                        setSelectedProject({ ...selectedProject, description: e.target.value })
                                                    }
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                    placeholder="Enter project description"
                                                    rows={6}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Tech Stack
                                                </label>
                                                <input
                                                    type="text"
                                                    value={selectedProject.techStack.join(', ')}
                                                    onChange={(e) =>
                                                        setSelectedProject({
                                                            ...selectedProject,
                                                            techStack: e.target.value.split(',').map((item) => item.trim()).filter((item) => item),
                                                        })
                                                    }
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                    placeholder="Enter tech stack (comma-separated)"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Tools
                                                </label>
                                                <input
                                                    type="text"
                                                    value={selectedProject.tools.join(', ')}
                                                    onChange={(e) =>
                                                        setSelectedProject({
                                                            ...selectedProject,
                                                            tools: e.target.value.split(',').map((item) => item.trim()).filter((item) => item),
                                                        })
                                                    }
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                    placeholder="Enter tools (comma-separated)"
                                                />
                                            </div>
                                            <div className="relative">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Category
                                                </label>
                                                <Listbox
                                                    value={selectedProject.category}
                                                    onChange={(value: string) => setSelectedProject({ ...selectedProject, category: value })}
                                                >
                                                    <Listbox.Button className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 cursor-pointer">
                                                        {selectedProject.category || 'Select a category'}
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute w-full mt-1 max-h-60 overflow-auto rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                        {categories.map((category) => (
                                                            <Listbox.Option
                                                                key={category}
                                                                value={category}
                                                                className={({ active }) =>
                                                                    `cursor-pointer select-none py-2 px-4 text-sm rounded transition-colors ${active
                                                                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                                                                        : 'text-gray-900 dark:text-white'
                                                                    }`
                                                                }
                                                            >
                                                                {category}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Listbox>
                                            </div>
                                            <div className="relative">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Status
                                                </label>
                                                <Listbox
                                                    value={selectedProject.status}
                                                    onChange={(value: string) => setSelectedProject({ ...selectedProject, status: value })}
                                                >
                                                    <Listbox.Button className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 cursor-pointer">
                                                        {selectedProject.status
                                                            ? selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)
                                                            : 'Select status'}
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute w-full mt-1 max-h-60 overflow-auto rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                        {statusOptions.map((status) => (
                                                            <Listbox.Option
                                                                key={status}
                                                                value={status}
                                                                className={({ active }) =>
                                                                    `cursor-pointer select-none py-2 px-4 text-sm rounded transition-colors ${active
                                                                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                                                                        : 'text-gray-900 dark:text-white'
                                                                    }`
                                                                }
                                                            >
                                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Listbox>
                                            </div>
                                            <div className="relative">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Priority
                                                </label>
                                                <Listbox
                                                    value={selectedProject.priority}
                                                    onChange={(value: string) => setSelectedProject({ ...selectedProject, priority: value })}
                                                >
                                                    <Listbox.Button className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 cursor-pointer">
                                                        {selectedProject.priority
                                                            ? selectedProject.priority.charAt(0).toUpperCase() + selectedProject.priority.slice(1)
                                                            : 'Select priority'}
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute w-full mt-1 max-h-60 overflow-auto rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                        {priorityOptions.map((priority) => (
                                                            <Listbox.Option
                                                                key={priority}
                                                                value={priority}
                                                                className={({ active }) =>
                                                                    `cursor-pointer select-none py-2 px-4 text-sm rounded transition-colors ${active
                                                                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                                                                        : 'text-gray-900 dark:text-white'
                                                                    }`
                                                                }
                                                            >
                                                                {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Listbox>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Slug
                                                </label>
                                                <input
                                                    type="text"
                                                    value={selectedProject.slug}
                                                    disabled
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100/80 dark:bg-gray-700/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 shadow-sm cursor-not-allowed"
                                                    placeholder="Generated slug"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Project URL
                                                </label>
                                                <input
                                                    type="text"
                                                    value={selectedProject.projectUrl}
                                                    onChange={(e) =>
                                                        setSelectedProject({ ...selectedProject, projectUrl: e.target.value })
                                                    }
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                    placeholder="Enter project URL"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Repo URL
                                                </label>
                                                <input
                                                    type="text"
                                                    value={selectedProject.repoUrl}
                                                    onChange={(e) =>
                                                        setSelectedProject({ ...selectedProject, repoUrl: e.target.value })
                                                    }
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                    placeholder="Enter repo URL"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Deployment
                                                </label>
                                                <input
                                                    type="text"
                                                    value={selectedProject.deployment}
                                                    onChange={(e) =>
                                                        setSelectedProject({ ...selectedProject, deployment: e.target.value })
                                                    }
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                    placeholder="Enter deployment platform"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Budget
                                                </label>
                                                <input
                                                    type="number"
                                                    value={selectedProject.budget || ''}
                                                    onChange={(e) =>
                                                        setSelectedProject({ ...selectedProject, budget: parseFloat(e.target.value) || null })
                                                    }
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                    placeholder="Enter budget"
                                                />
                                            </div>
                                            <div className="relative">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Currency
                                                </label>
                                                <Listbox
                                                    value={selectedProject.currency}
                                                    onChange={(value: string) => setSelectedProject({ ...selectedProject, currency: value })}
                                                >
                                                    <Listbox.Button className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 cursor-pointer">
                                                        {selectedProject.currency || 'Select currency'}
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute w-full mt-1 max-h-60 overflow-auto rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                        {currencyOptions.map((currency) => (
                                                            <Listbox.Option
                                                                key={currency}
                                                                value={currency}
                                                                className={({ active }) =>
                                                                    `cursor-pointer select-none py-2 px-4 text-sm rounded transition-colors ${active
                                                                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                                                                        : 'text-gray-900 dark:text-white'
                                                                    }`
                                                                }
                                                            >
                                                                {currency}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Listbox>
                                            </div>
                                            <div className="relative">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Contract Type
                                                </label>
                                                <Listbox
                                                    value={selectedProject.contractType}
                                                    onChange={(value: string) => setSelectedProject({ ...selectedProject, contractType: value })}
                                                >
                                                    <Listbox.Button className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 cursor-pointer">
                                                        {selectedProject.contractType
                                                            ? selectedProject.contractType.charAt(0).toUpperCase() + selectedProject.contractType.slice(1)
                                                            : 'Select contract type'}
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute w-full mt-1 max-h-60 overflow-auto rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                        {contractTypeOptions.map((type) => (
                                                            <Listbox.Option
                                                                key={type}
                                                                value={type}
                                                                className={({ active }) =>
                                                                    `cursor-pointer select-none py-2 px-4 text-sm rounded transition-colors ${active
                                                                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                                                                        : 'text-gray-900 dark:text-white'
                                                                    }`
                                                                }
                                                            >
                                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Listbox>
                                            </div>
                                            <div className="relative">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Payment Status
                                                </label>
                                                <Listbox
                                                    value={selectedProject.paymentStatus}
                                                    onChange={(value: string) => setSelectedProject({ ...selectedProject, paymentStatus: value })}
                                                >
                                                    <Listbox.Button className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 cursor-pointer">
                                                        {selectedProject.paymentStatus
                                                            ? selectedProject.paymentStatus.charAt(0).toUpperCase() + selectedProject.paymentStatus.slice(1)
                                                            : 'Select payment status'}
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute w-full mt-1 max-h-60 overflow-auto rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                        {paymentStatusOptions.map((status) => (
                                                            <Listbox.Option
                                                                key={status}
                                                                value={status}
                                                                className={({ active }) =>
                                                                    `cursor-pointer select-none py-2 px-4 text-sm rounded transition-colors ${active
                                                                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                                                                        : 'text-gray-900 dark:text-white'
                                                                    }`
                                                                }
                                                            >
                                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Listbox>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProject.featured}
                                                    onChange={(e) => setSelectedProject({ ...selectedProject, featured: e.target.checked })}
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-400"
                                                    id="featured-update"
                                                />
                                                <label htmlFor="featured-update" className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                                    Featured
                                                </label>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Case Study
                                                </label>
                                                <textarea
                                                    value={selectedProject.caseStudy}
                                                    onChange={(e) =>
                                                        setSelectedProject({ ...selectedProject, caseStudy: e.target.value })
                                                    }
                                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm cursor-text"
                                                    placeholder="Enter case study"
                                                    rows={6}
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                                    Milestones
                                                </label>
                                                {selectedProject.milestones.map((milestone, index) => (
                                                    <div
                                                        key={index}
                                                        className="relative rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 p-4 shadow-sm"
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <input
                                                                type="text"
                                                                value={milestone.name}
                                                                onChange={(e) => {
                                                                    const updatedMilestones = [...selectedProject.milestones];
                                                                    updatedMilestones[index].name = e.target.value;
                                                                    setSelectedProject({ ...selectedProject, milestones: updatedMilestones });
                                                                }}
                                                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-1.5 px-3 text-base font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300"
                                                                placeholder="Milestone name"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updatedMilestones = [...selectedProject.milestones];
                                                                    updatedMilestones.splice(index, 1);
                                                                    setSelectedProject({ ...selectedProject, milestones: updatedMilestones });
                                                                }}
                                                                className="ml-4 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 transition-colors duration-200 cursor-pointer"
                                                                aria-label="Delete milestone"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <DatePickerComponent
                                                                selectedDate={milestone.date}
                                                                onChange={(date: Date | null) => {
                                                                    const updatedMilestones = [...selectedProject.milestones];
                                                                    updatedMilestones[index].date = date ? date.toISOString().split('T')[0] : '';
                                                                    setSelectedProject({ ...selectedProject, milestones: updatedMilestones });
                                                                }}
                                                            />
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={milestone.completed}
                                                                    onChange={(e) => {
                                                                        const updatedMilestones = [...selectedProject.milestones];
                                                                        updatedMilestones[index].completed = e.target.checked;
                                                                        setSelectedProject({ ...selectedProject, milestones: updatedMilestones });
                                                                    }}
                                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-400 cursor-pointer"
                                                                    id={`milestone-completed-${index}`}
                                                                />
                                                                <label
                                                                    htmlFor={`milestone-completed-${index}`}
                                                                    className="ml-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
                                                                >
                                                                    Completed
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedProject({
                                                            ...selectedProject,
                                                            milestones: [...selectedProject.milestones, { name: '', completed: false, date: '' }],
                                                        });
                                                    }}
                                                    className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all duration-200 cursor-pointer"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Add Milestone
                                                </button>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                    Project Image
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
                                                    ) : updateProjectImagePreview ? (
                                                        <div className="relative w-full h-full">
                                                            <Image
                                                                src={updateProjectImagePreview}
                                                                alt="Project Image Preview"
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
                                                                id="updateProjectImage"
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleFileInputChange(e, true)}
                                                                className="hidden"
                                                                aria-label="Upload project image"
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
                                                        setUpdateProjectImagePreview(null);
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
                                                        'Update Project'
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
                                        Delete Project
                                    </Dialog.Title>
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                            Are you sure you want to delete this project? This action cannot be undone.
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
                                            Delete Project
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

export default Projects;