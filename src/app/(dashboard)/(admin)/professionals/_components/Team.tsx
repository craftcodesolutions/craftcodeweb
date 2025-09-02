/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { Search, Edit, Trash2, Plus, ChevronLeft, Image as Photo, ChevronRight, X, Pencil, User, Briefcase, GraduationCap, Languages, Award, Link, BookOpen, Globe } from 'lucide-react';
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
    email?: string;
    bio?: string;
    profileImage?: string | null;
    publicIdProfile?: string | null;
    isAdmin?: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading?: boolean;
    updateProfile: (updateData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

interface PreviousJob {
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
}

interface ProjectLink {
    title: string;
    url: string;
    description: string;
}

interface Education {
    degree: string;
    institution: string;
    startYear: number;
    endYear: number;
    description: string;
}

interface Certification {
    title: string;
    issuer: string;
    year: number;
}

interface Language {
    name: string;
    proficiency: string;
}

interface Award {
    title: string;
    issuer: string;
    year: number;
    description: string;
}

interface Reference {
    name: string;
    designation: string;
    contact: string;
}

interface TeamMember extends User {
    _id: string;
    userId: string; // Link to user
    slug: string;
    banner: string | null;
    publicIdBanner: string | null;
    skills: string[];
    previousJobs: PreviousJob[];
    projectLinks: ProjectLink[];
    education: Education[];
    certifications: Certification[];
    languages: Language[];
    hobbies: string[];
    awards: Award[];
    references: Reference[];
    supportiveEmail: string;
    designation: string;
    blogs: any[];
    projects: any[];
}

interface TeamMemberForm {
    _id?: string;
    userId: string;
    banner: string | null;
    publicIdBanner: string | null;
    slug: string;
    skills: string[];
    previousJobs: PreviousJob[];
    projectLinks: ProjectLink[];
    education: Education[];
    certifications: Certification[];
    languages: Language[];
    hobbies: string[];
    awards: Award[];
    references: Reference[];
    supportiveEmail: string;
    designation: string;
    skillsString?: string;
    hobbiesString?: string;
}

const Team: React.FC = () => {
    const { user, isAuthenticated, isLoading: authLoading, updateProfile } = useAuth() as AuthContextType;
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMemberForm | null>(null);
    const [teamMemberToDelete, setTeamMemberToDelete] = useState<string | null>(null);
    const [supportiveEmail, setSupportiveEmail] = useState('');
    const [updateSupportiveEmail, setUpdateSupportiveEmail] = useState('');
    const [newSlug, setNewSlug] = useState(''); // State for add modal slug input
    const [updateSlug, setUpdateSlug] = useState(''); // State for update modal slug input
    const [newTeamMember, setNewTeamMember] = useState<TeamMemberForm>({
        banner: null,
        userId: '',
        publicIdBanner: null,
        slug: '',
        skills: [],
        previousJobs: [],
        projectLinks: [],
        education: [],
        certifications: [],
        languages: [],
        hobbies: [],
        awards: [],
        references: [],
        supportiveEmail: '',
        designation: '',
        skillsString: undefined, // Add this line
        hobbiesString: undefined, // Add this line
    });
    const [newProfileImagePreview, setNewProfileImagePreview] = useState<string | null>(null);
    const [newBannerPreview, setNewBannerPreview] = useState<string | null>(null);
    const [updateProfileImagePreview, setUpdateProfileImagePreview] = useState<string | null>(null);
    const [updateBannerPreview, setUpdateBannerPreview] = useState<string | null>(null);
    const [isDraggingProfile, setIsDraggingProfile] = useState(false);
    const [isDraggingBanner, setIsDraggingBanner] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const proficiencyOptions = ['Native', 'Fluent', 'Intermediate', 'Basic'];
    const itemsPerPage = 6;
    const [hasTeamData, setHasTeamData] = useState(false);


    // User fields for form
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [publicIdProfile, setPublicIdProfile] = useState<string | null>(null);

    // For update
    const [updateFirstName, setUpdateFirstName] = useState('');
    const [updateLastName, setUpdateLastName] = useState('');
    const [updateBio, setUpdateBio] = useState('');
    const [updateProfileImage, setUpdateProfileImage] = useState<string | null>(null);
    const [updatePublicIdProfile, setUpdatePublicIdProfile] = useState<string | null>(null);


    const generateSlug = (firstName: string, lastName: string): string => {
        const baseSlug = `${firstName || ''} ${lastName || ''}`
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
        return baseSlug || 'user'; // Fallback if both names are empty
    };
    // Auto-generate slug for add modal
    useEffect(() => {
        const generatedSlug = generateSlug(firstName, lastName);
        setNewSlug(generatedSlug);
        setNewTeamMember((prev) => ({ ...prev, slug: generatedSlug }));
    }, [firstName, lastName]);

    // Auto-generate slug for update modal
    useEffect(() => {
        if (selectedTeamMember) {
            const generatedSlug = generateSlug(updateFirstName, updateLastName);
            setUpdateSlug(generatedSlug);
            setSelectedTeamMember((prev) => prev ? { ...prev, slug: generatedSlug } : prev);
        }
    }, [updateFirstName, updateLastName]);
    const fetchTeamMembers = async () => {
        setIsFetching(true);
        try {
            const response = await fetch(
                `/api/teams?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                const teams = data.teams || [];
                setTotalPages(data.totalPages || 1);

                // Fetch user data for each team member
                const userPromises = teams.map((team: TeamMember) =>
                    fetch(`/api/users/${team.userId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }).then(async (res) => {
                        if (res.ok) {
                            const userData = await res.json();
                            console.log(`User data for userId ${team.userId}:`, userData); // Debug log
                            return {
                                userId: team.userId,
                                firstName: userData.firstName || 'Unknown',
                                lastName: userData.lastName || '',
                                email: userData.email || 'N/A',
                                bio: userData.bio || 'No bio available',
                                profileImage: userData.avatar || null,
                                publicIdProfile: userData.publicIdProfile || null,
                            };
                        } else {
                            const errorData = await res.json();
                            console.error(`Failed to fetch user data for userId ${team.userId}:`, errorData?.error || 'Unknown error');
                            return {
                                userId: team.userId,
                                firstName: 'Unknown',
                                lastName: '',
                                email: 'N/A',
                                bio: 'No bio available',
                                profileImage: null,
                                publicIdProfile: null,
                            };
                        }
                    }).catch((error) => {
                        console.error(`Error fetching user data for userId ${team.userId}:`, error);
                        return {
                            userId: team.userId,
                            firstName: 'Unknown',
                            lastName: '',
                            email: 'N/A',
                            bio: 'No bio available',
                            profileImage: null,
                            publicIdProfile: null,
                        };
                    })
                );

                const users = await Promise.all(userPromises);
                console.log('Fetched users:', users); // Debug log

                // Combine team and user data
                const enrichedTeams = teams.map((team: TeamMember, i: number) => ({
                    ...team,
                    firstName: users[i].firstName || 'Unknown',
                    lastName: users[i].lastName || '',
                    email: users[i].email || 'N/A',
                    bio: users[i].bio || 'No bio available',
                    profileImage: users[i].profileImage || null,
                    publicIdProfile: users[i].publicIdProfile || null,
                }));

                console.log('Enriched teams:', enrichedTeams); // Debug log
                setTeamMembers(enrichedTeams);
            } else {
                const errorData = await response.json();
                toast.error(errorData?.error || 'Failed to fetch team members');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch team members');
            console.error('Fetch team members error:', error);
        } finally {
            setIsFetching(false);
        }
    };

    const checkTeamData = async () => {
        if (isAuthenticated && user?.userId) {
            try {
                const response = await fetch(`/api/teams?userId=${user.userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setHasTeamData(data.teams.length > 0);
                }
            } catch (error: any) {
                console.error('Check team data error:', error);
            }
        }
    };

    useEffect(() => {
        fetchTeamMembers();
    }, [currentPage, searchTerm]);

    useEffect(() => {
        checkTeamData();
    }, [isAuthenticated, user]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleUpdateTeamMember = async (memberId: string) => {
        const teamMember = teamMembers.find((m) => m._id === memberId);
        if (teamMember && isAuthenticated && teamMember.userId === user?.userId) {
            try {
                const userResponse = await fetch(`/api/users/${user.userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!userResponse.ok) {
                    const errorData = await userResponse.json();
                    toast.error(errorData?.error || 'Failed to fetch user data');
                    return;
                }

                const userData = await userResponse.json();
                const profileImageToUse = userData.profileImage || user?.profileImage || null;
                const publicIdProfileToUse = userData.publicIdProfile || user?.publicIdProfile || null;

                // Set team-specific fields including slug
                setSelectedTeamMember({
                    _id: teamMember._id,
                    userId: teamMember.userId,
                    banner: teamMember.banner || null,
                    publicIdBanner: teamMember.publicIdBanner || null,
                    slug: teamMember.slug || generateSlug(userData.firstName || user?.firstName || '', userData.lastName || user?.lastName || ''), // Initialize slug
                    skills: teamMember.skills || [],
                    previousJobs: teamMember.previousJobs || [],
                    projectLinks: teamMember.projectLinks || [],
                    education: teamMember.education.map(edu => ({
                        ...edu,
                        startYear: Number(edu.startYear) || 2015,
                        endYear: Number(edu.endYear) || 2019,
                    })) || [],
                    certifications: teamMember.certifications.map(cert => ({
                        ...cert,
                        year: Number(cert.year) || 2020,
                    })) || [],
                    languages: teamMember.languages || [],
                    hobbies: teamMember.hobbies || [],
                    awards: teamMember.awards.map(award => ({
                        ...award,
                        year: Number(award.year) || 2021,
                    })) || [],
                    references: teamMember.references || [],
                    supportiveEmail: teamMember.supportiveEmail || '',
                    designation: teamMember.designation || '',
                });

                // Set user-specific fields
                setUpdateFirstName(userData.firstName || user?.firstName || '');
                setUpdateLastName(userData.lastName || user?.lastName || '');
                setUpdateBio(userData.bio || user?.bio || '');
                setUpdateProfileImage(profileImageToUse);
                setUpdatePublicIdProfile(publicIdProfileToUse);
                setUpdateProfileImagePreview(profileImageToUse);
                setUpdateBannerPreview(teamMember.banner || null);
                setUpdateSupportiveEmail(teamMember.supportiveEmail || '');
                setUpdateSlug(teamMember.slug || generateSlug(userData.firstName || user?.firstName || '', userData.lastName || user?.lastName || '')); // Set updateSlug
                setIsUpdateModalOpen(true);
            } catch (error: any) {
                toast.error(error.message || 'Failed to fetch user data');
                console.error('Fetch user data error:', error);
            }
        } else {
            toast.error('You are not authorized to edit this team member.');
        }
    };

    const handleDeleteTeamMember = (memberId: string) => {
        const teamMember = teamMembers.find((m) => m._id === memberId);
        if (teamMember && isAuthenticated && teamMember.userId === user?.userId) {
            setTeamMemberToDelete(memberId);
            setIsDeleteModalOpen(true);
        } else {
            toast.error('You are not authorized to delete this team member.');
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, type: 'profile' | 'banner') => {
        e.preventDefault();
        if (type === 'profile') setIsDraggingProfile(true);
        else setIsDraggingBanner(true);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, type: 'profile' | 'banner') => {
        e.preventDefault();
        if (type === 'profile') setIsDraggingProfile(true);
        else setIsDraggingBanner(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, type: 'profile' | 'banner') => {
        e.preventDefault();
        if (type === 'profile') setIsDraggingProfile(false);
        else setIsDraggingBanner(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, isUpdate: boolean, type: 'profile' | 'banner') => {
        e.preventDefault();
        if (type === 'profile') setIsDraggingProfile(false);
        else setIsDraggingBanner(false);
        const files = Array.from(e.dataTransfer.files);
        await handleImageUpload(files, isUpdate, type);
    };

    const handleFileInputChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
        isUpdate: boolean,
        type: 'profile' | 'banner'
    ) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        await handleImageUpload(files, isUpdate, type);
    };

    const handleImageUpload = async (files: File[], isUpdate: boolean, type: 'profile' | 'banner') => {
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

            const endpoint = type === 'profile' ? '/api/auth/cloudinary_profile_image' : '/api/auth/cloudinary_banner_image';
            const response = await fetch(endpoint, {
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
                if (isUpdate && selectedTeamMember) {
                    if (type === 'profile') {
                        setUpdateProfileImage(data.imageUrl);
                        setUpdatePublicIdProfile(data.publicId);
                        setUpdateProfileImagePreview(previewUrl);
                    } else {
                        setSelectedTeamMember({
                            ...selectedTeamMember,
                            banner: data.imageUrl,
                            publicIdBanner: data.publicId,
                        });
                        setUpdateBannerPreview(previewUrl);
                    }
                } else {
                    if (type === 'profile') {
                        setProfileImage(data.imageUrl);
                        setPublicIdProfile(data.publicId);
                        setNewProfileImagePreview(previewUrl);
                    } else {
                        setNewTeamMember({
                            ...newTeamMember,
                            banner: data.imageUrl,
                            publicIdBanner: data.publicId,
                        });
                        setNewBannerPreview(previewUrl);
                    }
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

    const handleRemoveImage = async (isUpdate: boolean, type: 'profile' | 'banner') => {
        const publicId = isUpdate ? (type === 'profile' ? updatePublicIdProfile : selectedTeamMember?.publicIdBanner) : (type === 'profile' ? publicIdProfile : newTeamMember.publicIdBanner);
        if (publicId) {
            try {
                const endpoint = type === 'profile' ? `/api/auth/cloudinary_profile_image?publicId=${encodeURIComponent(publicId)}` : `/api/auth/cloudinary_banner_image?publicId=${encodeURIComponent(publicId)}`;
                const response = await fetch(endpoint, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete image');
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to remove image');
                console.error('Remove image error:', error);
            }
        }
        if (isUpdate && selectedTeamMember) {
            if (type === 'profile') {
                setUpdateProfileImage(null);
                setUpdatePublicIdProfile(null);
                setUpdateProfileImagePreview(null);
            } else {
                setSelectedTeamMember({ ...selectedTeamMember, banner: null, publicIdBanner: null });
                setUpdateBannerPreview(null);
            }
        } else {
            if (type === 'profile') {
                setProfileImage(null);
                setPublicIdProfile(null);
                setNewProfileImagePreview(null);
            } else {
                setNewTeamMember({ ...newTeamMember, banner: null, publicIdBanner: null });
                setNewBannerPreview(null);
            }
        }
        toast.success('Image removed successfully!');
    };

    const triggerFileInput = (isUpdate: boolean, type: 'profile' | 'banner') => {
        const inputId = isUpdate ? (type === 'profile' ? 'updateProfileImage' : 'updateBanner') : (type === 'profile' ? 'newProfileImage' : 'newBanner');
        const input = document.getElementById(inputId) as HTMLInputElement;
        if (input) {
            input.click();
        }
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName || !lastName || !bio) {
            toast.error('Please fill in all required fields.');
            return;
        }

        try {
            // Update user profile in users collection
            /* const updateData: Partial<User> = {
                firstName,
                lastName,
                bio,
                profileImage,
                publicIdProfile,
            };
            const updateResult = await updateProfile(updateData);
            if (!updateResult.success) {
                toast.error(updateResult.error || 'Failed to update user profile');
                return;
            } */

            // Create team data in teams collection
            const teamData: TeamMemberForm = {
                userId: user!.userId,  // Fixed here with non-null assertion
                banner: newTeamMember.banner,
                publicIdBanner: newTeamMember.publicIdBanner,
                slug: newSlug,
                skills: newTeamMember.skills,
                previousJobs: newTeamMember.previousJobs,
                projectLinks: newTeamMember.projectLinks,
                education: newTeamMember.education,
                certifications: newTeamMember.certifications,
                languages: newTeamMember.languages,
                hobbies: newTeamMember.hobbies,
                awards: newTeamMember.awards,
                references: newTeamMember.references,
                supportiveEmail,
                designation: newTeamMember.designation,
                // Do not include skillsString or hobbiesString
            };

            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...teamData }),  // Fixed here with non-null assertion
            });

            if (response.ok) {
                setIsAddModalOpen(false);
                setNewProfileImagePreview(null);
                setNewBannerPreview(null);
                setNewSlug('');
                setNewTeamMember({
                    userId: user!.userId,  // Fixed here with non-null assertion
                    banner: null,
                    publicIdBanner: null,
                    slug: '',
                    skills: [],
                    previousJobs: [],
                    projectLinks: [],
                    education: [],
                    certifications: [],
                    languages: [],
                    hobbies: [],
                    awards: [],
                    references: [],
                    supportiveEmail: '',
                    designation: '',
                    skillsString: undefined, // Reset skillsString
                    hobbiesString: undefined, // Reset hobbiesString
                });
                setFirstName('');
                setLastName('');
                setBio('');
                setProfileImage(null);
                setPublicIdProfile(null);
                await fetchTeamMembers();
                await checkTeamData();
                toast.success('Team member added successfully!');
            } else {
                const errorData = await response.json();
                toast.error(errorData?.error || 'Failed to add team member');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to add team member');
            console.error('Add team member error:', error);
        }
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeamMember) {
            toast.error('No team member selected for update.');
            return;
        }

        if (!updateFirstName || !updateLastName || !updateBio) {
            toast.error('Please fill in all required fields.');
            return;
        }

        try {
            // Update user profile in users collection
            const updateData: Partial<User> = {
                userId: user?.userId,  // Fixed here with non-null assertion
                firstName: updateFirstName,
                lastName: updateLastName,
                bio: updateBio,
                profileImage: updateProfileImage,
                publicIdProfile: updatePublicIdProfile,
            };
            const updateResult = await updateProfile(updateData);
            if (!updateResult.success) {
                toast.error(updateResult.error || 'Failed to update user profile');
                return;
            }

            // Update team data in teams collection
            const teamData: TeamMemberForm = {
                userId: user!.userId,  // Fixed here with non-null assertion
                _id: selectedTeamMember._id,
                banner: selectedTeamMember.banner,
                publicIdBanner: selectedTeamMember.publicIdBanner,
                slug: updateSlug, // Include slug
                skills: selectedTeamMember.skills,
                previousJobs: selectedTeamMember.previousJobs,
                projectLinks: selectedTeamMember.projectLinks,
                education: selectedTeamMember.education,
                certifications: selectedTeamMember.certifications,
                languages: selectedTeamMember.languages,
                hobbies: selectedTeamMember.hobbies,
                awards: selectedTeamMember.awards,
                references: selectedTeamMember.references,
                supportiveEmail: updateSupportiveEmail,
                designation: selectedTeamMember.designation,
            };

            const response = await fetch(`/api/teams/${selectedTeamMember._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...teamData }),  // Fixed here with non-null assertion
            });

            if (response.ok) {
                setIsUpdateModalOpen(false);
                setUpdateProfileImagePreview(null);
                setUpdateBannerPreview(null);
                setUpdateSlug(''); // Reset slug
                setSelectedTeamMember(null);
                setUpdateSupportiveEmail('');
                await fetchTeamMembers();
                toast.success('Team member updated successfully!');
            } else {
                const errorData = await response.json();
                toast.error(errorData?.error || 'Failed to update team member');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update team member');
            console.error('Update team member error:', error);
        }
    };
    const handleDeleteConfirm = async () => {
        if (teamMemberToDelete) {
            try {
                const response = await fetch(`/api/teams/${teamMemberToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    setIsDeleteModalOpen(false);
                    setTeamMemberToDelete(null);
                    await fetchTeamMembers();
                    await checkTeamData();
                    toast.success('Team member deleted successfully!');
                } else {
                    const errorData = await response.json();
                    toast.error(errorData?.error || 'Failed to delete team member');
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete team member');
                console.error('Delete team member error:', error);
            }
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6 md:p-10 font-sans">
                {/* Header Skeleton */}
                <Skeleton className="h-12 w-3/4 mx-auto rounded-lg skeleton-pulse mb-10" />
                <div className="max-w-7xl mx-auto rounded-3xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 shadow-lg overflow-hidden">
                    {/* Header Section */}
                    <div className="px-6 py-5 md:px-10 md:py-6 flex items-center justify-between">
                        <Skeleton className="h-8 w-1/3 rounded-lg skeleton-pulse" />
                        <Skeleton className="h-10 w-40 rounded-full skeleton-pulse" />
                    </div>
                    <div className="border-t border-gray-600 dark:border-gray-700 p-6 md:p-10">
                        {/* Search Section */}
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
                            <Skeleton className="h-9 w-1/2 rounded-lg skeleton-pulse" />
                            <Skeleton className="h-10 w-full md:w-80 rounded-full skeleton-pulse" />
                        </div>
                        {/* Grid Skeleton */}
                        <div className="max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 p-6 shadow-sm transition-all duration-300"
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
                        </div>
                        {/* Pagination Skeleton */}
                        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-10 w-28 rounded-full skeleton-pulse" />
                                <div className="hidden sm:flex items-center gap-2">
                                    <Skeleton className="h-10 w-10 rounded-lg skeleton-pulse" />
                                    <Skeleton className="h-10 w-10 rounded-lg skeleton-pulse" />
                                    <Skeleton className="h-10 w-10 rounded-lg skeleton-pulse" />
                                </div>
                                <Skeleton className="h-10 w-28 rounded-full skeleton-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6 md:p-10 font-sans">
            {/* Styles */}
            <style jsx global>{`
                .skeleton-pulse {
                    animation: pulse 1.5s ease-in-out infinite;
                    background-color: #e5e7eb;
                }
                .dark .skeleton-pulse {
                    background-color: #374151;
                }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>

            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-10 tracking-tight text-center">
                Discover Our Team
            </h1>
            <div className="max-w-7xl mx-auto rounded-3xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 shadow-lg overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 md:px-10 md:py-6 flex items-center justify-between">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                        Team Members
                    </h3>
                    {isAuthenticated && (
                        <button
                            onClick={() => {
                                const myTeam = teamMembers.find((m) => m.userId === user?.userId);

                                if (myTeam) {
                                    handleUpdateTeamMember(myTeam._id);
                                } else {
                                    setFirstName(user?.firstName || '');
                                    setLastName(user?.lastName || '');
                                    setBio(user?.bio || '');
                                    setProfileImage(user?.profileImage || null);
                                    setPublicIdProfile(user?.publicIdProfile || null);
                                    setNewProfileImagePreview(user?.profileImage || null);
                                    setIsAddModalOpen(true);
                                }
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                        >
                            <Plus className="h-5 w-5" />
                            <span>
                                {teamMembers.some((m) => m.userId === user?.userId) ? 'Update Profile' : 'Add Profile'}
                            </span>
                        </button>
                    )}

                </div>
                <div className="border-t border-gray-600 dark:border-gray-700 p-6 md:p-10">
                    {/* Search */}
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            All Team Members
                        </h3>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute top-1/2 -translate-y-1/2 left-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search team members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 py-3 pl-12 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-300 shadow-sm hover:shadow-md cursor-text"
                                aria-label="Search team members"
                            />
                        </div>
                    </div>
                    {/* Grid */}
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
                        ) : teamMembers.length === 0 ? (
                            <div className="text-center p-8">
                                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                                    No team members found
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {teamMembers.map((member) => (
                                    <div
                                        key={member._id}
                                        className="group rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 p-6 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                                    >
                                        {member.profileImage ? (
                                            <div className="relative w-full h-52 rounded-2xl overflow-hidden mb-4 group-hover:shadow-lg">
                                                <Image
                                                    src={member.profileImage}
                                                    alt={`${member.firstName} ${member.lastName || ''}`}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                                    onError={(e) => {
                                                        console.error(`Failed to load image for ${member.firstName} (${member.userId}): ${member.profileImage}`); // Debug log
                                                        e.currentTarget.src = '/default-profile.png'; // Fallback image
                                                    }}
                                                    onLoadingComplete={() => console.log(`Image loaded for ${member.firstName}: ${member.profileImage}`)} // Debug log
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </div>
                                        ) : (
                                            <div className="relative w-full h-52 rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                <Image
                                                    src="/default-profile.png"
                                                    alt="Default Profile"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <p className="absolute text-gray-500 dark:text-gray-400">No Profile Image</p>
                                            </div>
                                        )}
                                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white truncate tracking-tight" title={`${member.firstName} ${member.lastName || ''}`}>
                                            {member.firstName} {member.lastName || ''}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                            {member.designation || ''}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                            {member.email || 'Email not available'}
                                        </p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500">
                                            {(member.languages || []).map(l => `${l.name} (${l.proficiency})`).join(', ') || 'No languages listed'}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2" title={member.bio}>
                                            {member.bio || 'No bio available'}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {(member.skills || []).map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs rounded-full px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 font-medium shadow-sm hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-all duration-200 cursor-pointer"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                        {!authLoading && isAuthenticated && member.userId === user?.userId && (
                                            <div className="flex items-center justify-end gap-3 mt-4">
                                                <button
                                                    onClick={() => handleUpdateTeamMember(member._id)}
                                                    className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-all duration-200 cursor-pointer"
                                                    title="Edit Team Member"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTeamMember(member._id)}
                                                    className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-all duration-200 cursor-pointer"
                                                    title="Delete Team Member"
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
                    {/* Pagination */}
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

            {/* Add New Team Member Modal */}

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
                        <div className="fixed inset-0 bg-gray-900/70 dark:bg-gray-900/95 backdrop-blur-md" />
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
                                <Dialog.Panel className="w-full max-w-4xl transform rounded-2xl bg-white dark:bg-gray-800 p-6 text-left shadow-xl transition-all overflow-y-auto max-h-[95vh]">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                        <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Add Profile
                                        </Dialog.Title>
                                        <button
                                            onClick={() => setIsAddModalOpen(false)}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleAddSubmit} className="space-y-6">
                                        {/* Image Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Profile Image */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Profile Image
                                                </label>
                                                <div
                                                    className={`relative h-48 rounded-xl border-2 border-dashed transition-all duration-200 ${isDraggingProfile
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                                        } flex flex-col items-center justify-center cursor-pointer overflow-hidden group`}
                                                    onDragOver={(e) => handleDragOver(e, 'profile')}
                                                    onDragEnter={(e) => handleDragEnter(e, 'profile')}
                                                    onDragLeave={(e) => handleDragLeave(e, 'profile')}
                                                    onDrop={(e) => handleDrop(e, false, 'profile')}
                                                    onClick={() => triggerFileInput(false, 'profile')}
                                                >
                                                    {newProfileImagePreview ? (
                                                        <div className="relative w-full h-full">
                                                            <Image
                                                                src={newProfileImagePreview}
                                                                alt="Profile Preview"
                                                                fill
                                                                className="object-cover"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Pencil className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveImage(false, 'profile');
                                                                }}
                                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center p-4">
                                                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-3">
                                                                <Photo className="h-6 w-6 text-gray-400" />
                                                            </div>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                                Drag & drop or click to upload
                                                            </p>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                                                PNG, JPG up to 5MB
                                                            </p>
                                                        </div>
                                                    )}
                                                    <input
                                                        id="newProfileImage"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileInputChange(e, false, 'profile')}
                                                        className="hidden"
                                                        disabled={isUploadingImage}
                                                    />
                                                </div>
                                            </div>

                                            {/* Banner Image */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Banner Image
                                                </label>
                                                <div
                                                    className={`relative h-32 rounded-xl border-2 border-dashed transition-all duration-200 ${isDraggingBanner
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                                        } flex flex-col items-center justify-center cursor-pointer overflow-hidden group`}
                                                    onDragOver={(e) => handleDragOver(e, 'banner')}
                                                    onDragEnter={(e) => handleDragEnter(e, 'banner')}
                                                    onDragLeave={(e) => handleDragLeave(e, 'banner')}
                                                    onDrop={(e) => handleDrop(e, false, 'banner')}
                                                    onClick={() => triggerFileInput(false, 'banner')}
                                                >
                                                    {newBannerPreview ? (
                                                        <div className="relative w-full h-full">
                                                            <Image
                                                                src={newBannerPreview}
                                                                alt="Banner Preview"
                                                                fill
                                                                className="object-cover"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Pencil className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveImage(false, 'banner');
                                                                }}
                                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center p-4">
                                                            <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 mb-2">
                                                                <Photo className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Drag & drop or click to upload
                                                            </p>
                                                        </div>
                                                    )}
                                                    <input
                                                        id="newBanner"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileInputChange(e, false, 'banner')}
                                                        className="hidden"
                                                        disabled={isUploadingImage}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Basic Information */}
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl">
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                                <User className="h-5 w-5" />
                                                Basic Information
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        First Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={firstName}
                                                        onChange={(e) => setFirstName(e.target.value)}
                                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                        placeholder="Enter first name"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Last Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={lastName}
                                                        onChange={(e) => setLastName(e.target.value)}
                                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                        placeholder="Enter last name"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Designation
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newTeamMember.designation}
                                                        onChange={(e) => setNewTeamMember({ ...newTeamMember, designation: e.target.value })}
                                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                        placeholder="Enter designation (e.g., Software Engineer)"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Slug *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newSlug}
                                                        onChange={(e) => {
                                                            setNewSlug(e.target.value);
                                                            setNewTeamMember({ ...newTeamMember, slug: e.target.value });
                                                        }}
                                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                        placeholder="Enter slug (e.g., john-doe)"
                                                        required
                                                    />
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-generated from first and last name, but you can edit it.</p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Email (read-only)
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={user?.email || ''}
                                                        readOnly
                                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 py-2.5 px-4 text-sm text-gray-900 dark:text-white cursor-not-allowed"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Supportive Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={supportiveEmail}
                                                        onChange={(e) => setSupportiveEmail(e.target.value)}
                                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                        placeholder="Enter supportive email"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Bio *
                                                    </label>
                                                    <textarea
                                                        value={bio}
                                                        onChange={(e) => setBio(e.target.value)}
                                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                        placeholder="Tell us about yourself..."
                                                        rows={3}
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Skills
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newTeamMember.skillsString ?? newTeamMember.skills.join(', ')}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            setNewTeamMember({
                                                                ...newTeamMember,
                                                                skillsString: value, // Store raw input for smooth typing
                                                                skills: value
                                                                    .split(',')
                                                                    .map((item) => item.trim())
                                                                    .filter((item) => item !== ''), // Update array in sync
                                                            });
                                                        }}
                                                        onBlur={(e) => {
                                                            const value = e.target.value;
                                                            setNewTeamMember({
                                                                ...newTeamMember,
                                                                skills: value
                                                                    .split(',')
                                                                    .map((item) => item.trim())
                                                                    .filter((item) => item !== ''), // Clean up array
                                                                skillsString: undefined, // Clear temporary string
                                                            });
                                                        }}
                                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                        placeholder="React, JavaScript, Design"
                                                    />
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate with commas</p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Hobbies
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newTeamMember.hobbiesString ?? newTeamMember.hobbies.join(', ')}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            setNewTeamMember({
                                                                ...newTeamMember,
                                                                hobbiesString: value, // Store raw input for smooth typing
                                                                hobbies: value
                                                                    .split(',')
                                                                    .map((item) => item.trim())
                                                                    .filter((item) => item !== ''), // Update array in sync
                                                            });
                                                        }}
                                                        onBlur={(e) => {
                                                            const value = e.target.value;
                                                            setNewTeamMember({
                                                                ...newTeamMember,
                                                                hobbies: value
                                                                    .split(',')
                                                                    .map((item) => item.trim())
                                                                    .filter((item) => item !== ''), // Clean up array
                                                                hobbiesString: undefined, // Clear temporary string
                                                            });
                                                        }}
                                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                        placeholder="Reading, Travel, Photography"
                                                    />
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate with commas</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Work Experience */}
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                                    <Briefcase className="h-5 w-5" />
                                                    Work Experience
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setNewTeamMember({
                                                        ...newTeamMember,
                                                        previousJobs: [...newTeamMember.previousJobs, { title: '', company: '', startDate: '', endDate: '', description: '' }]
                                                    })}
                                                    className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Add Job
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {newTeamMember.previousJobs.map((job, index) => (
                                                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3 relative bg-white dark:bg-gray-800">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = [...newTeamMember.previousJobs];
                                                                updated.splice(index, 1);
                                                                setNewTeamMember({ ...newTeamMember, previousJobs: updated });
                                                            }}
                                                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Job Title
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={job.title}
                                                                    onChange={(e) => {
                                                                        const updated = [...newTeamMember.previousJobs];
                                                                        updated[index].title = e.target.value;
                                                                        setNewTeamMember({ ...newTeamMember, previousJobs: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="Software Engineer"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Company
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={job.company}
                                                                    onChange={(e) => {
                                                                        const updated = [...newTeamMember.previousJobs];
                                                                        updated[index].company = e.target.value;
                                                                        setNewTeamMember({ ...newTeamMember, previousJobs: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="Company Name"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Start Date
                                                                </label>
                                                                <DatePickerComponent
                                                                    selectedDate={job.startDate}
                                                                    onChange={(date) => {
                                                                        const updated = [...newTeamMember.previousJobs];
                                                                        updated[index].startDate = date ? date.toISOString().split('T')[0] : '';
                                                                        setNewTeamMember({ ...newTeamMember, previousJobs: updated });
                                                                    }}
                                                                    placeholder="Select start date"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    End Date
                                                                </label>
                                                                <DatePickerComponent
                                                                    selectedDate={job.endDate}
                                                                    onChange={(date) => {
                                                                        const updated = [...newTeamMember.previousJobs];
                                                                        updated[index].endDate = date ? date.toISOString().split('T')[0] : '';
                                                                        setNewTeamMember({ ...newTeamMember, previousJobs: updated });
                                                                    }}
                                                                    placeholder="Select end date"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                Description
                                                            </label>
                                                            <textarea
                                                                value={job.description}
                                                                onChange={(e) => {
                                                                    const updated = [...newTeamMember.previousJobs];
                                                                    updated[index].description = e.target.value;
                                                                    setNewTeamMember({ ...newTeamMember, previousJobs: updated });
                                                                }}
                                                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                placeholder="Describe your responsibilities and achievements..."
                                                                rows={2}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Project Links Section */}
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                                    <Link className="h-5 w-5" />
                                                    Project Links
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setNewTeamMember({
                                                        ...newTeamMember,
                                                        projectLinks: [...newTeamMember.projectLinks, { title: '', url: '', description: '' }]
                                                    })}
                                                    className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Add Project
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {newTeamMember.projectLinks.map((link, index) => (
                                                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3 relative bg-white dark:bg-gray-800">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = [...newTeamMember.projectLinks];
                                                                updated.splice(index, 1);
                                                                setNewTeamMember({ ...newTeamMember, projectLinks: updated });
                                                            }}
                                                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Title
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={link.title}
                                                                    onChange={(e) => {
                                                                        const updated = [...newTeamMember.projectLinks];
                                                                        updated[index].title = e.target.value;
                                                                        setNewTeamMember({ ...newTeamMember, projectLinks: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="Project Title"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    URL
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={link.url}
                                                                    onChange={(e) => {
                                                                        const updated = [...newTeamMember.projectLinks];
                                                                        updated[index].url = e.target.value;
                                                                        setNewTeamMember({ ...newTeamMember, projectLinks: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="https://example.com"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                Description
                                                            </label>
                                                            <textarea
                                                                value={link.description}
                                                                onChange={(e) => {
                                                                    const updated = [...newTeamMember.projectLinks];
                                                                    updated[index].description = e.target.value;
                                                                    setNewTeamMember({ ...newTeamMember, projectLinks: updated });
                                                                }}
                                                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                placeholder="Project description..."
                                                                rows={2}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Education Section */}
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                                    <GraduationCap className="h-5 w-5" />
                                                    Education
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setNewTeamMember({
                                                        ...newTeamMember,
                                                        education: [...newTeamMember.education, { degree: '', institution: '', startYear: 0, endYear: 0, description: '' }]
                                                    })}
                                                    className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Add Education
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {newTeamMember.education.map((edu, index) => (
                                                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3 relative bg-white dark:bg-gray-800">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = [...newTeamMember.education];
                                                                updated.splice(index, 1);
                                                                setNewTeamMember({ ...newTeamMember, education: updated });
                                                            }}
                                                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Degree
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={edu.degree}
                                                                    onChange={(e) => {
                                                                        const updated = [...newTeamMember.education];
                                                                        updated[index].degree = e.target.value;
                                                                        setNewTeamMember({ ...newTeamMember, education: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="Bachelor of Science"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Institution
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={edu.institution}
                                                                    onChange={(e) => {
                                                                        const updated = [...newTeamMember.education];
                                                                        updated[index].institution = e.target.value;
                                                                        setNewTeamMember({ ...newTeamMember, education: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="University Name"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Start Year
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={edu.startYear || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...newTeamMember.education];
                                                                        updated[index].startYear = Number(e.target.value);
                                                                        setNewTeamMember({ ...newTeamMember, education: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="2015"
                                                                    min="1900"
                                                                    max="2100"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    End Year
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={edu.endYear || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...newTeamMember.education];
                                                                        updated[index].endYear = Number(e.target.value);
                                                                        setNewTeamMember({ ...newTeamMember, education: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="2019"
                                                                    min="1900"
                                                                    max="2100"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                Description
                                                            </label>
                                                            <textarea
                                                                value={edu.description}
                                                                onChange={(e) => {
                                                                    const updated = [...newTeamMember.education];
                                                                    updated[index].description = e.target.value;
                                                                    setNewTeamMember({ ...newTeamMember, education: updated });
                                                                }}
                                                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                placeholder="Relevant courses, achievements, or activities..."
                                                                rows={2}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Certifications Section */}
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                                    <BookOpen className="h-5 w-5" />
                                                    Certifications
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setNewTeamMember({
                                                        ...newTeamMember,
                                                        certifications: [...newTeamMember.certifications, { title: '', issuer: '', year: 0 }]
                                                    })}
                                                    className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Add Certification
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {newTeamMember.certifications.map((cert, index) => (
                                                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3 relative bg-white dark:bg-gray-800">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = [...newTeamMember.certifications];
                                                                updated.splice(index, 1);
                                                                setNewTeamMember({ ...newTeamMember, certifications: updated });
                                                            }}
                                                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Title
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={cert.title}
                                                                    onChange={(e) => {
                                                                        const updated = [...newTeamMember.certifications];
                                                                        updated[index].title = e.target.value;
                                                                        setNewTeamMember({ ...newTeamMember, certifications: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="Certification Title"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Issuer
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={cert.issuer}
                                                                    onChange={(e) => {
                                                                        const updated = [...newTeamMember.certifications];
                                                                        updated[index].issuer = e.target.value;
                                                                        setNewTeamMember({ ...newTeamMember, certifications: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="Issuing Organization"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                Year
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={cert.year || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...newTeamMember.certifications];
                                                                    updated[index].year = Number(e.target.value);
                                                                    setNewTeamMember({ ...newTeamMember, certifications: updated });
                                                                }}
                                                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                placeholder="2020"
                                                                min="1900"
                                                                max="2100"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Languages Section */}
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                                    <Languages className="h-5 w-5" />
                                                    Languages
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setNewTeamMember({
                                                            ...newTeamMember,
                                                            languages: [...newTeamMember.languages, { name: '', proficiency: '' }],
                                                        })
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Add Language
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {newTeamMember.languages.map((lang, index) => (
                                                    <div
                                                        key={index}
                                                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3 relative bg-white dark:bg-gray-800"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = [...newTeamMember.languages];
                                                                updated.splice(index, 1);
                                                                setNewTeamMember({ ...newTeamMember, languages: updated });
                                                            }}
                                                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {/* Language Input */}
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Language
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={lang.name}
                                                                    onChange={(e) => {
                                                                        const updated = [...newTeamMember.languages];
                                                                        updated[index].name = e.target.value;
                                                                        setNewTeamMember({ ...newTeamMember, languages: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="English, Spanish, etc."
                                                                />
                                                            </div>

                                                            {/* Segmented Proficiency */}
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                                                    Proficiency
                                                                </label>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {proficiencyOptions.map((option) => (
                                                                        <button
                                                                            key={option}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const updated = [...newTeamMember.languages];
                                                                                updated[index].proficiency = option;
                                                                                setNewTeamMember({ ...newTeamMember, languages: updated });
                                                                            }}
                                                                            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${lang.proficiency === option
                                                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                                                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                                                }`}
                                                                        >
                                                                            {option}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>


                                        {/* Awards Section */}
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                                    <Award className="h-5 w-5" />
                                                    Awards
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setNewTeamMember({
                                                        ...newTeamMember,
                                                        awards: [...newTeamMember.awards, { title: '', issuer: '', year: 0, description: '' }]
                                                    })}
                                                    className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Add Award
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {newTeamMember.awards.map((award, index) => (
                                                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3 relative bg-white dark:bg-gray-800">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = [...newTeamMember.awards];
                                                                updated.splice(index, 1);
                                                                setNewTeamMember({ ...newTeamMember, awards: updated });
                                                            }}
                                                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Title
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={award.title}
                                                                    onChange={(e) => {
                                                                        const updated = [...newTeamMember.awards];
                                                                        updated[index].title = e.target.value;
                                                                        setNewTeamMember({ ...newTeamMember, awards: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="Award Title"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Issuer
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={award.issuer}
                                                                    onChange={(e) => {
                                                                        const updated = [...newTeamMember.awards];
                                                                        updated[index].issuer = e.target.value;
                                                                        setNewTeamMember({ ...newTeamMember, awards: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="Issuing Organization"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Year
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={award.year || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...newTeamMember.awards];
                                                                        updated[index].year = Number(e.target.value);
                                                                        setNewTeamMember({ ...newTeamMember, awards: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="2021"
                                                                    min="1900"
                                                                    max="2100"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                Description
                                                            </label>
                                                            <textarea
                                                                value={award.description}
                                                                onChange={(e) => {
                                                                    const updated = [...newTeamMember.awards];
                                                                    updated[index].description = e.target.value;
                                                                    setNewTeamMember({ ...newTeamMember, awards: updated });
                                                                }}
                                                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                placeholder="Description of the award..."
                                                                rows={2}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* References Section */}
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                                    <Globe className="h-5 w-5" />
                                                    References
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setNewTeamMember({
                                                        ...newTeamMember,
                                                        references: [...newTeamMember.references, { name: '', designation: '', contact: '' }]
                                                    })}
                                                    className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Add Reference
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {newTeamMember.references.map((ref, index) => (
                                                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3 relative bg-white dark:bg-gray-800">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = [...newTeamMember.references];
                                                                updated.splice(index, 1);
                                                                setNewTeamMember({ ...newTeamMember, references: updated });
                                                            }}
                                                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Name
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={ref.name}
                                                                    onChange={(e) => {
                                                                        const updated = [...newTeamMember.references];
                                                                        updated[index].name = e.target.value;
                                                                        setNewTeamMember({ ...newTeamMember, references: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="Reference Name"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Designation
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={ref.designation}
                                                                    onChange={(e) => {
                                                                        const updated = [...newTeamMember.references];
                                                                        updated[index].designation = e.target.value;
                                                                        setNewTeamMember({ ...newTeamMember, references: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="Job Title"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                Contact
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={ref.contact}
                                                                onChange={(e) => {
                                                                    const updated = [...newTeamMember.references];
                                                                    updated[index].contact = e.target.value;
                                                                    setNewTeamMember({ ...newTeamMember, references: updated });
                                                                }}
                                                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                placeholder="Email or Phone"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                type="button"
                                                onClick={() => setIsAddModalOpen(false)}
                                                className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-5 py-2.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                                            >
                                                Add Profile
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Update Team Member Modal */}
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
                        <div className="fixed inset-0 bg-gray-900/70 dark:bg-gray-900/95 backdrop-blur-md" />
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
                                <Dialog.Panel className="w-full max-w-4xl transform rounded-2xl bg-white dark:bg-gray-800 p-6 text-left shadow-xl transition-all overflow-y-auto max-h-[95vh]">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                        <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Update Profile
                                        </Dialog.Title>
                                        <button
                                            onClick={() => setIsUpdateModalOpen(false)}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    {selectedTeamMember && (
                                        <form onSubmit={handleUpdateSubmit} className="space-y-6">
                                            {/* Image Section */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Profile Image */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Profile Image
                                                    </label>
                                                    <div
                                                        className={`relative h-48 rounded-xl border-2 border-dashed transition-all duration-200 ${isDraggingProfile
                                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                                            } flex flex-col items-center justify-center cursor-pointer overflow-hidden group`}
                                                        onDragOver={(e) => handleDragOver(e, 'profile')}
                                                        onDragEnter={(e) => handleDragEnter(e, 'profile')}
                                                        onDragLeave={(e) => handleDragLeave(e, 'profile')}
                                                        onDrop={(e) => handleDrop(e, true, 'profile')}
                                                        onClick={() => triggerFileInput(true, 'profile')}
                                                    >
                                                        {updateProfileImagePreview ? (
                                                            <div className="relative w-full h-full">
                                                                <Image
                                                                    src={updateProfileImagePreview}
                                                                    alt="Profile Preview"
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <Pencil className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRemoveImage(true, 'profile');
                                                                    }}
                                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center p-4">
                                                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-3">
                                                                    <Photo className="h-6 w-6 text-gray-400" />
                                                                </div>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                                    Drag & drop or click to upload
                                                                </p>
                                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                                    PNG, JPG up to 5MB
                                                                </p>
                                                            </div>
                                                        )}
                                                        <input
                                                            id="updateProfileImage"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileInputChange(e, true, 'profile')}
                                                            className="hidden"
                                                            disabled={isUploadingImage}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Banner Image */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Banner Image
                                                    </label>
                                                    <div
                                                        className={`relative h-32 rounded-xl border-2 border-dashed transition-all duration-200 ${isDraggingBanner
                                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                                            } flex flex-col items-center justify-center cursor-pointer overflow-hidden group`}
                                                        onDragOver={(e) => handleDragOver(e, 'banner')}
                                                        onDragEnter={(e) => handleDragEnter(e, 'banner')}
                                                        onDragLeave={(e) => handleDragLeave(e, 'banner')}
                                                        onDrop={(e) => handleDrop(e, true, 'banner')}
                                                        onClick={() => triggerFileInput(true, 'banner')}
                                                    >
                                                        {updateBannerPreview ? (
                                                            <div className="relative w-full h-full">
                                                                <Image
                                                                    src={updateBannerPreview}
                                                                    alt="Banner Preview"
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <Pencil className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRemoveImage(true, 'banner');
                                                                    }}
                                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center p-4">
                                                                <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 mb-2">
                                                                    <Photo className="h-5 w-5 text-gray-400" />
                                                                </div>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    Drag & drop or click to upload
                                                                </p>
                                                            </div>
                                                        )}
                                                        <input
                                                            id="updateBanner"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileInputChange(e, true, 'banner')}
                                                            className="hidden"
                                                            disabled={isUploadingImage}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Basic Information */}
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl">
                                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                                    <User className="h-5 w-5" />
                                                    Basic Information
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            First Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={updateFirstName}
                                                            onChange={(e) => setUpdateFirstName(e.target.value)}
                                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                            placeholder="Enter first name"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Last Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={updateLastName}
                                                            onChange={(e) => setUpdateLastName(e.target.value)}
                                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                            placeholder="Enter last name"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Designation
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={selectedTeamMember.designation}
                                                            onChange={(e) => setSelectedTeamMember({ ...selectedTeamMember, designation: e.target.value })}
                                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                            placeholder="Enter designation (e.g., Software Engineer)"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Slug *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={updateSlug}
                                                            onChange={(e) => {
                                                                setUpdateSlug(e.target.value);
                                                                setSelectedTeamMember({ ...selectedTeamMember!, slug: e.target.value });
                                                            }}
                                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                            placeholder="Enter slug (e.g., john-doe)"
                                                            required
                                                        />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-generated from first and last name, but you can edit it.</p>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Email (read-only)
                                                        </label>
                                                        <input
                                                            type="email"
                                                            value={user?.email || ''}
                                                            readOnly
                                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 py-2.5 px-4 text-sm text-gray-900 dark:text-white cursor-not-allowed"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Supportive Email
                                                        </label>
                                                        <input
                                                            type="email"
                                                            value={updateSupportiveEmail}
                                                            onChange={(e) => setUpdateSupportiveEmail(e.target.value)}
                                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                            placeholder="Enter supportive email"
                                                        />
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Bio *
                                                        </label>
                                                        <textarea
                                                            value={updateBio}
                                                            onChange={(e) => setUpdateBio(e.target.value)}
                                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                            placeholder="Tell us about yourself..."
                                                            rows={3}
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Skills
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={selectedTeamMember?.skillsString ?? selectedTeamMember?.skills.join(', ') ?? ''}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (selectedTeamMember) {
                                                                    setSelectedTeamMember({
                                                                        ...selectedTeamMember,
                                                                        skillsString: value, // Store raw input for smooth typing
                                                                        skills: value
                                                                            .split(',')
                                                                            .map((item) => item.trim())
                                                                            .filter((item) => item !== ''), // Update array in sync
                                                                    });
                                                                }
                                                            }}
                                                            onBlur={(e) => {
                                                                const value = e.target.value;
                                                                if (selectedTeamMember) {
                                                                    setSelectedTeamMember({
                                                                        ...selectedTeamMember,
                                                                        skills: value
                                                                            .split(',')
                                                                            .map((item) => item.trim())
                                                                            .filter((item) => item !== ''), // Clean up array
                                                                        skillsString: undefined, // Clear temporary string
                                                                    });
                                                                }
                                                            }}
                                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                            placeholder="React, JavaScript, Design"
                                                        />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate with commas</p>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Hobbies
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={selectedTeamMember?.hobbiesString ?? selectedTeamMember?.hobbies.join(', ') ?? ''}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (selectedTeamMember) {
                                                                    setSelectedTeamMember({
                                                                        ...selectedTeamMember,
                                                                        hobbiesString: value, // Store raw input for smooth typing
                                                                        hobbies: value
                                                                            .split(',')
                                                                            .map((item) => item.trim())
                                                                            .filter((item) => item !== ''), // Update array in sync
                                                                    });
                                                                }
                                                            }}
                                                            onBlur={(e) => {
                                                                const value = e.target.value;
                                                                if (selectedTeamMember) {
                                                                    setSelectedTeamMember({
                                                                        ...selectedTeamMember,
                                                                        hobbies: value
                                                                            .split(',')
                                                                            .map((item) => item.trim())
                                                                            .filter((item) => item !== ''), // Clean up array
                                                                        hobbiesString: undefined, // Clear temporary string
                                                                    });
                                                                }
                                                            }}
                                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2.5 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                            placeholder="Reading, Travel, Photography"
                                                        />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate with commas</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Work Experience */}
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                                        <Briefcase className="h-5 w-5" />
                                                        Work Experience
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedTeamMember({
                                                            ...selectedTeamMember,
                                                            previousJobs: [...selectedTeamMember.previousJobs, { title: '', company: '', startDate: '', endDate: '', description: '' }]
                                                        })}
                                                        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        Add Job
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    {selectedTeamMember.previousJobs.map((job, index) => (
                                                        <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3 relative bg-white dark:bg-gray-800">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = [...selectedTeamMember.previousJobs];
                                                                    updated.splice(index, 1);
                                                                    setSelectedTeamMember({ ...selectedTeamMember, previousJobs: updated });
                                                                }}
                                                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        Job Title
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={job.title}
                                                                        onChange={(e) => {
                                                                            const updated = [...selectedTeamMember.previousJobs];
                                                                            updated[index].title = e.target.value;
                                                                            setSelectedTeamMember({ ...selectedTeamMember, previousJobs: updated });
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                        placeholder="Software Engineer"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        Company
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={job.company}
                                                                        onChange={(e) => {
                                                                            const updated = [...selectedTeamMember.previousJobs];
                                                                            updated[index].company = e.target.value;
                                                                            setSelectedTeamMember({ ...selectedTeamMember, previousJobs: updated });
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                        placeholder="Company Name"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        Start Date
                                                                    </label>
                                                                    <DatePickerComponent
                                                                        selectedDate={job.startDate}
                                                                        onChange={(date) => {
                                                                            const updated = [...selectedTeamMember.previousJobs];
                                                                            updated[index].startDate = date ? date.toISOString().split('T')[0] : '';
                                                                            setSelectedTeamMember({ ...selectedTeamMember, previousJobs: updated });
                                                                        }}
                                                                        placeholder="Select start date"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        End Date
                                                                    </label>
                                                                    <DatePickerComponent
                                                                        selectedDate={job.endDate}
                                                                        onChange={(date) => {
                                                                            const updated = [...selectedTeamMember.previousJobs];
                                                                            updated[index].endDate = date ? date.toISOString().split('T')[0] : '';
                                                                            setSelectedTeamMember({ ...selectedTeamMember, previousJobs: updated });
                                                                        }}
                                                                        placeholder="Select end date"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Description
                                                                </label>
                                                                <textarea
                                                                    value={job.description}
                                                                    onChange={(e) => {
                                                                        const updated = [...selectedTeamMember.previousJobs];
                                                                        updated[index].description = e.target.value;
                                                                        setSelectedTeamMember({ ...selectedTeamMember, previousJobs: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="Describe your responsibilities and achievements..."
                                                                    rows={2}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Project Links Section */}
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                                        <Link className="h-5 w-5" />
                                                        Project Links
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedTeamMember({
                                                            ...selectedTeamMember,
                                                            projectLinks: [...selectedTeamMember.projectLinks, { title: '', url: '', description: '' }]
                                                        })}
                                                        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        Add Project
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    {selectedTeamMember.projectLinks.map((link, index) => (
                                                        <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3 relative bg-white dark:bg-gray-800">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = [...selectedTeamMember.projectLinks];
                                                                    updated.splice(index, 1);
                                                                    setSelectedTeamMember({ ...selectedTeamMember, projectLinks: updated });
                                                                }}
                                                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        Title
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={link.title}
                                                                        onChange={(e) => {
                                                                            const updated = [...selectedTeamMember.projectLinks];
                                                                            updated[index].title = e.target.value;
                                                                            setSelectedTeamMember({ ...selectedTeamMember, projectLinks: updated });
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                        placeholder="Project Title"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        URL
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={link.url}
                                                                        onChange={(e) => {
                                                                            const updated = [...selectedTeamMember.projectLinks];
                                                                            updated[index].url = e.target.value;
                                                                            setSelectedTeamMember({ ...selectedTeamMember, projectLinks: updated });
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                        placeholder="https://example.com"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Description
                                                                </label>
                                                                <textarea
                                                                    value={link.description}
                                                                    onChange={(e) => {
                                                                        const updated = [...selectedTeamMember.projectLinks];
                                                                        updated[index].description = e.target.value;
                                                                        setSelectedTeamMember({ ...selectedTeamMember, projectLinks: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="Project description..."
                                                                    rows={2}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Education Section */}
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                                        <GraduationCap className="h-5 w-5" />
                                                        Education
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedTeamMember({
                                                            ...selectedTeamMember,
                                                            education: [...selectedTeamMember.education, { degree: '', institution: '', startYear: 0, endYear: 0, description: '' }]
                                                        })}
                                                        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        Add Education
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    {selectedTeamMember.education.map((edu, index) => (
                                                        <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3 relative bg-white dark:bg-gray-800">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = [...selectedTeamMember.education];
                                                                    updated.splice(index, 1);
                                                                    setSelectedTeamMember({ ...selectedTeamMember, education: updated });
                                                                }}
                                                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        Degree
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={edu.degree}
                                                                        onChange={(e) => {
                                                                            const updated = [...selectedTeamMember.education];
                                                                            updated[index].degree = e.target.value;
                                                                            setSelectedTeamMember({ ...selectedTeamMember, education: updated });
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                        placeholder="Bachelor of Science"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        Institution
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={edu.institution}
                                                                        onChange={(e) => {
                                                                            const updated = [...selectedTeamMember.education];
                                                                            updated[index].institution = e.target.value;
                                                                            setSelectedTeamMember({ ...selectedTeamMember, education: updated });
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                        placeholder="University Name"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        Start Year
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        value={edu.startYear || ''}
                                                                        onChange={(e) => {
                                                                            const updated = [...selectedTeamMember.education];
                                                                            updated[index].startYear = Number(e.target.value);
                                                                            setSelectedTeamMember({ ...selectedTeamMember, education: updated });
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                        placeholder="2015"
                                                                        min="1900"
                                                                        max="2100"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        End Year
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        value={edu.endYear || ''}
                                                                        onChange={(e) => {
                                                                            const updated = [...selectedTeamMember.education];
                                                                            updated[index].endYear = Number(e.target.value);
                                                                            setSelectedTeamMember({ ...selectedTeamMember, education: updated });
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                        placeholder="2019"
                                                                        min="1900"
                                                                        max="2100"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Description
                                                                </label>
                                                                <textarea
                                                                    value={edu.description}
                                                                    onChange={(e) => {
                                                                        const updated = [...selectedTeamMember.education];
                                                                        updated[index].description = e.target.value;
                                                                        setSelectedTeamMember({ ...selectedTeamMember, education: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="Relevant courses, achievements, or activities..."
                                                                    rows={2}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Certifications Section */}
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                                        <BookOpen className="h-5 w-5" />
                                                        Certifications
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedTeamMember({
                                                            ...selectedTeamMember,
                                                            certifications: [...selectedTeamMember.certifications, { title: '', issuer: '', year: 0 }]
                                                        })}
                                                        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        Add Certification
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    {selectedTeamMember.certifications.map((cert, index) => (
                                                        <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3 relative bg-white dark:bg-gray-800">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = [...selectedTeamMember.certifications];
                                                                    updated.splice(index, 1);
                                                                    setSelectedTeamMember({ ...selectedTeamMember, certifications: updated });
                                                                }}
                                                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        Title
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={cert.title}
                                                                        onChange={(e) => {
                                                                            const updated = [...selectedTeamMember.certifications];
                                                                            updated[index].title = e.target.value;
                                                                            setSelectedTeamMember({ ...selectedTeamMember, certifications: updated });
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                        placeholder="Certification Title"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        Issuer
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={cert.issuer}
                                                                        onChange={(e) => {
                                                                            const updated = [...selectedTeamMember.certifications];
                                                                            updated[index].issuer = e.target.value;
                                                                            setSelectedTeamMember({ ...selectedTeamMember, certifications: updated });
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                        placeholder="Issuing Organization"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Year
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={cert.year || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...selectedTeamMember.certifications];
                                                                        updated[index].year = Number(e.target.value);
                                                                        setSelectedTeamMember({ ...selectedTeamMember, certifications: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="2020"
                                                                    min="1900"
                                                                    max="2100"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Languages Section */}
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                                        <Languages className="h-5 w-5" />
                                                        Languages
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedTeamMember({
                                                            ...selectedTeamMember,
                                                            languages: [...selectedTeamMember.languages, { name: '', proficiency: '' }]
                                                        })}
                                                        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        Add Language
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    {selectedTeamMember.languages.map((lang, index) => (
                                                        <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3 relative bg-white dark:bg-gray-800">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = [...selectedTeamMember.languages];
                                                                    updated.splice(index, 1);
                                                                    setSelectedTeamMember({ ...selectedTeamMember, languages: updated });
                                                                }}
                                                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        Language
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={lang.name}
                                                                        onChange={(e) => {
                                                                            const updated = [...selectedTeamMember.languages];
                                                                            updated[index].name = e.target.value;
                                                                            setSelectedTeamMember({ ...selectedTeamMember, languages: updated });
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                        placeholder="English, Spanish, etc."
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        Proficiency
                                                                    </label>
                                                                    <select
                                                                        value={lang.proficiency}
                                                                        onChange={(e) => {
                                                                            const updated = [...selectedTeamMember.languages];
                                                                            updated[index].proficiency = e.target.value;
                                                                            setSelectedTeamMember({ ...selectedTeamMember, languages: updated });
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    >
                                                                        <option value="">Select Proficiency</option>
                                                                        {proficiencyOptions.map((option) => (
                                                                            <option key={option} value={option}>{option}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Awards Section */}
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                                        <Award className="h-5 w-5" />
                                                        Awards
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedTeamMember({
                                                            ...selectedTeamMember,
                                                            awards: [...selectedTeamMember.awards, { title: '', issuer: '', year: 0, description: '' }]
                                                        })}
                                                        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        Add Award
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    {selectedTeamMember.awards.map((award, index) => (
                                                        <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3 relative bg-white dark:bg-gray-800">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = [...selectedTeamMember.awards];
                                                                    updated.splice(index, 1);
                                                                    setSelectedTeamMember({ ...selectedTeamMember, awards: updated });
                                                                }}
                                                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        Title
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={award.title}
                                                                        onChange={(e) => {
                                                                            const updated = [...selectedTeamMember.awards];
                                                                            updated[index].title = e.target.value;
                                                                            setSelectedTeamMember({ ...selectedTeamMember, awards: updated });
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                        placeholder="Award Title"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        Issuer
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={award.issuer}
                                                                        onChange={(e) => {
                                                                            const updated = [...selectedTeamMember.awards];
                                                                            updated[index].issuer = e.target.value;
                                                                            setSelectedTeamMember({ ...selectedTeamMember, awards: updated });
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                        placeholder="Issuing Organization"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        Year
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        value={award.year || ''}
                                                                        onChange={(e) => {
                                                                            const updated = [...selectedTeamMember.awards];
                                                                            updated[index].year = Number(e.target.value);
                                                                            setSelectedTeamMember({ ...selectedTeamMember, awards: updated });
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                        placeholder="2021"
                                                                        min="1900"
                                                                        max="2100"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Description
                                                                </label>
                                                                <textarea
                                                                    value={award.description}
                                                                    onChange={(e) => {
                                                                        const updated = [...selectedTeamMember.awards];
                                                                        updated[index].description = e.target.value;
                                                                        setSelectedTeamMember({ ...selectedTeamMember, awards: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="Description of the award..."
                                                                    rows={2}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* References Section */}
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                                        <Globe className="h-5 w-5" />
                                                        References
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedTeamMember({
                                                            ...selectedTeamMember,
                                                            references: [...selectedTeamMember.references, { name: '', designation: '', contact: '' }]
                                                        })}
                                                        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        Add Reference
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    {selectedTeamMember.references.map((ref, index) => (
                                                        <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3 relative bg-white dark:bg-gray-800">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = [...selectedTeamMember.references];
                                                                    updated.splice(index, 1);
                                                                    setSelectedTeamMember({ ...selectedTeamMember, references: updated });
                                                                }}
                                                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        Name
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={ref.name}
                                                                        onChange={(e) => {
                                                                            const updated = [...selectedTeamMember.references];
                                                                            updated[index].name = e.target.value;
                                                                            setSelectedTeamMember({ ...selectedTeamMember, references: updated });
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                        placeholder="Reference Name"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                        Designation
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={ref.designation}
                                                                        onChange={(e) => {
                                                                            const updated = [...selectedTeamMember.references];
                                                                            updated[index].designation = e.target.value;
                                                                            setSelectedTeamMember({ ...selectedTeamMember, references: updated });
                                                                        }}
                                                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                        placeholder="Job Title"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                    Contact
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={ref.contact}
                                                                    onChange={(e) => {
                                                                        const updated = [...selectedTeamMember.references];
                                                                        updated[index].contact = e.target.value;
                                                                        setSelectedTeamMember({ ...selectedTeamMember, references: updated });
                                                                    }}
                                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent py-2 px-3 text-sm"
                                                                    placeholder="Email or Phone"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsUpdateModalOpen(false)}
                                                    className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-5 py-2.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                                                >
                                                    Update Profile
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
                                        Delete Team Member
                                    </Dialog.Title>
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                            Are you sure you want to delete this team member? This action cannot be undone.
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
                                            Delete Team Member
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

export default Team;