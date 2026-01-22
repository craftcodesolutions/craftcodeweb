/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Briefcase, GraduationCap, Languages, Award, Link as LinkIcon, BookOpen, UserCircle, Mail, Star, Calendar, ChevronRight, ExternalLink, Heart, Code, Palette, Music, Camera, Globe, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@/context/AuthContext';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

// Define interfaces
interface User {
    userId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    bio?: string;
    profileImage?: string | null;
    publicIdProfile?: string | null;
    isAdmin?: boolean;
    location?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
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

interface AwardItem {
    title: string;
    issuer: string;
    year: number;
    description: string;
}

interface Blog {
    slug: string;
    _id: string;
    title: string;
    content: string;
    date: string;
}

interface AdditionalProject {
    _id: string;
    name: string;
    description: string;
    url?: string;
}

interface TeamMember extends User {
    _id: string;
    userId: string;
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
    awards: AwardItem[];
    supportiveEmail: string;
    blogs: Blog[];
    projects: AdditionalProject[];
    designation: string;
}

// Animation variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.6,
            staggerChildren: 0.1,
            ease: "easeOut"
        },
    },
};

const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        },
    },
};

// Utility function to extract string from object
const extractString = (value: any, fallback: string): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value?.content) return value.content;
    return fallback;
};

// Reusable components
const ProfileImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
    <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white dark:border-[#102A3A] shadow-2xl ring-4 ring-[#E6F7F6]/30 dark:ring-[#050B14]/20">
        <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 192px"
            className="object-cover"
            priority
            onError={(e) => { e.currentTarget.src = '/avatar.png'; }}
        />
    </div>
);

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3 text-[#0F172A] dark:text-white">
        <span className="p-2.5 rounded-xl bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] text-white shadow-md">
            {icon}
        </span>
        {title}
    </h2>
);

const TimelineItem: React.FC<{ icon: React.ReactNode; children: React.ReactNode; index: number }> = ({ icon, children, index }) => (
    <motion.div
        variants={cardVariants}
        className="relative pl-12 group"
        role="listitem"
        aria-label={`Timeline item ${index + 1}`}
    >
        <div className="absolute left-0 top-2 w-9 h-9 rounded-full bg-white dark:bg-[#102A3A] flex items-center justify-center shadow-lg border-2 border-[#DCEEEE] dark:border-[#0B1C2D] group-hover:scale-110 transition-transform duration-300 group-hover:bg-[#F7FBFC] dark:group-hover:bg-[#050B14]/30">
            {icon}
        </div>
        <div className="p-5 bg-white/70 dark:bg-[#102A3A]/70 rounded-xl shadow-sm border border-[#E6F7F6]/30 dark:border-[#0B1C2D]/30 backdrop-blur-sm group-hover:shadow-md group-hover:border-[#E6F7F6]/50 dark:group-hover:border-[#050B14]/30 transition-all duration-300">
            {children}
        </div>
    </motion.div>
);

const SkillBadge: React.FC<{ skill: string }> = ({ skill }) => (
    <motion.li
        whileHover={{ scale: 1.05 }}
        className="px-3 py-1.5 bg-gradient-to-r from-[#E6F7F6] to-[#F7FBFC] dark:from-[#050B14]/40 dark:to-[#102A3A]/30 text-[#0B1C2D] dark:text-[#DCEEEE] rounded-full text-sm font-medium shadow-sm hover:shadow transition-all duration-300 border border-[#DCEEEE]/50 dark:border-[#0B1C2D]/30"
        role="listitem"
    >
        {skill}
    </motion.li>
);

const HobbyBadge: React.FC<{ hobby: string }> = ({ hobby }) => {
    const getHobbyIcon = (hobby: string) => {
        const hobbyLower = hobby.toLowerCase();
        if (hobbyLower.includes('code') || hobbyLower.includes('program')) return <Code className="h-3 w-3" />;
        if (hobbyLower.includes('art') || hobbyLower.includes('design')) return <Palette className="h-3 w-3" />;
        if (hobbyLower.includes('music')) return <Music className="h-3 w-3" />;
        if (hobbyLower.includes('photo')) return <Camera className="h-3 w-3" />;
        if (hobbyLower.includes('travel')) return <Globe className="h-3 w-3" />;
        return <Heart className="h-3 w-3" />;
    };

    return (
        <motion.li
            whileHover={{ scale: 1.05 }}
            className="px-3 py-1.5 bg-gradient-to-r from-[#E6F7F6] to-[#F7FBFC] dark:from-[#050B14]/40 dark:to-[#102A3A]/30 text-[#0B1C2D] dark:text-[#DCEEEE] rounded-full text-sm font-medium shadow-sm hover:shadow transition-all duration-300 flex items-center gap-1.5 border border-[#DCEEEE]/50 dark:border-[#0B1C2D]/30"
            role="listitem"
        >
            {getHobbyIcon(hobby)}
            {hobby}
        </motion.li>
    );
};

const TeamProfile: React.FC = () => {
    const params = useParams();
    const slug = params && typeof params === 'object' && 'slug' in params
        ? (Array.isArray(params.slug) ? params.slug[0] : params.slug || '')
        : '';
    const { user, isAuthenticated, isLoading: authLoading } = useAuth() as AuthContextType;
    
    // Enhanced slug validation and debugging
    console.log('TeamProfile - Route params:', params);
    console.log('TeamProfile - Extracted slug:', slug);
    console.log('TeamProfile - Slug type:', typeof slug);
    console.log('TeamProfile - Is slug valid:', Boolean(slug && slug.trim()));
    const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [additionalProjects, setAdditionalProjects] = useState<AdditionalProject[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchTeamMember = useCallback(async () => {
        // Enhanced slug validation
        if (!slug || typeof slug !== 'string' || slug.trim() === '') {
            console.error('Invalid slug provided:', { slug, type: typeof slug });
            toast.error('Invalid profile slug provided', { toastId: 'invalid-slug' });
            return;
        }
        
        const trimmedSlug = slug.trim();
        console.log('Fetching team member with slug:', trimmedSlug);
        
        abortControllerRef.current = new AbortController();
        try {
            const apiUrl = `/api/teams/slug/${encodeURIComponent(trimmedSlug)}`;
            console.log('Team API URL:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `HTTP error! Status: ${response.status}` }));
                throw new Error(errorData?.error || `Failed to fetch team member (Status: ${response.status})`);
            }

            const data = await response.json();
            console.log('Team API Response:', JSON.stringify(data, null, 2));
            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            
            const team: any = data.team;
            console.log('Extracted team data:', team);
            console.log('Team slug from response:', team?.slug);
            console.log('Team userId from response:', team?.userId);

            if (!team) {
                console.error('Team member not found in response for slug:', trimmedSlug);
                throw new Error(`Team member with slug '${trimmedSlug}' not found`);
            }
            
            // Validate team data structure
            if (!team.userId) {
                console.error('Team member missing userId:', team);
                throw new Error('Invalid team member data: missing userId');
            }

            // The improved slug API now includes all user data, so no separate user API call is needed
            console.log('Processing team data (user data already included from improved slug API)...');
            console.log('Available user data in team response:', {
                firstName: team.firstName,
                lastName: team.lastName,
                email: team.email,
                bio: team.bio,
                profileImage: team.profileImage
            });
            
            const enrichedTeam: TeamMember = {
                ...team,
                firstName: extractString(team.firstName, 'Unknown'),
                lastName: extractString(team.lastName, ''),
                email: extractString(team.email, 'N/A'),
                bio: extractString(team.bio, 'No bio available'),
                profileImage: extractString(team.profileImage, '/avatar.png'),
                publicIdProfile: extractString(team.publicIdProfile, ''),
                location: extractString(team.location, ''),
                skills: Array.isArray(team.skills)
                    ? team.skills.map((skill: any) => extractString(skill, 'Unknown Skill'))
                    : [],
                hobbies: Array.isArray(team.hobbies)
                    ? team.hobbies.map((hobby: any) => extractString(hobby, 'Unknown Hobby'))
                    : [],
                previousJobs: Array.isArray(team.previousJobs)
                    ? team.previousJobs.map((job: any) => ({
                          title: extractString(job.title, 'Unknown Title'),
                          company: extractString(job.company, 'Unknown Company'),
                          startDate: extractString(job.startDate, 'Unknown Date'),
                          endDate: extractString(job.endDate, 'Present'),
                          description: extractString(job.description, ''),
                      }))
                    : [],
                projectLinks: Array.isArray(team.projectLinks)
                    ? team.projectLinks.map((link: any) => ({
                          title: extractString(link.title, 'Unknown Project'),
                          url: extractString(link.url, '#'),
                          description: extractString(link.description, ''),
                      }))
                    : [],
                education: Array.isArray(team.education)
                    ? team.education.map((edu: any) => ({
                          degree: extractString(edu.degree, 'Unknown Degree'),
                          institution: extractString(edu.institution, 'Unknown Institution'),
                          startYear: typeof edu.startYear === 'number' ? edu.startYear : 0,
                          endYear: typeof edu.endYear === 'number' ? edu.endYear : 0,
                          description: extractString(edu.description, ''),
                      }))
                    : [],
                certifications: Array.isArray(team.certifications)
                    ? team.certifications.map((cert: any) => ({
                          title: extractString(cert.title, 'Unknown Certification'),
                          issuer: extractString(cert.issuer, 'Unknown Issuer'),
                          year: typeof cert.year === 'number' ? cert.year : 0,
                      }))
                    : [],
                languages: Array.isArray(team.languages)
                    ? team.languages.map((lang: any) => ({
                          name: extractString(lang.name, 'Unknown Language'),
                          proficiency: extractString(lang.proficiency, 'Unknown Proficiency'),
                      }))
                    : [],
                awards: Array.isArray(team.awards)
                    ? team.awards.map((award: any) => ({
                          title: extractString(award.title, 'Unknown Award'),
                          issuer: extractString(award.issuer, 'Unknown Issuer'),
                          year: typeof award.year === 'number' ? award.year : 0,
                          description: extractString(award.description, ''),
                      }))
                    : [],
                supportiveEmail: extractString(team.supportiveEmail, ''),
                blogs: [],
                projects: [],
                designation: extractString(team.designation, ''),
                userId: extractString(team.userId, ''),
                _id: extractString(team._id || team.id, ''),
                slug: extractString(team.slug, ''),
                banner: extractString(team.banner, '/banner.jpg'),
                publicIdBanner: extractString(team.publicIdBanner, ''),
            };

            console.log('Final enriched team member:', {
                slug: enrichedTeam.slug,
                userId: enrichedTeam.userId,
                name: `${enrichedTeam.firstName} ${enrichedTeam.lastName}`,
                email: enrichedTeam.email,
                profileImage: enrichedTeam.profileImage,
                designation: enrichedTeam.designation
            });
            
            setTeamMember(enrichedTeam);
            setIsOwner(isAuthenticated && enrichedTeam.userId === user?.userId);
            
            console.log('Team member set successfully using improved slug API (single API call). IsOwner:', isAuthenticated && enrichedTeam.userId === user?.userId);
            console.log('Performance improvement: Eliminated separate user API call');
            return enrichedTeam.userId;
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Fetch team member error:', {
                    message: error.message,
                    stack: error.stack,
                    slug: trimmedSlug,
                    error: error
                });
                
                // More specific error messages based on error type
                let errorMessage = 'Failed to fetch team member profile';
                if (error.message.includes('not found')) {
                    errorMessage = `Team member '${trimmedSlug}' not found. Please check the URL and try again.`;
                } else if (error.message.includes('Network')) {
                    errorMessage = 'Network error. Please check your connection and try again.';
                } else if (error.message.includes('Invalid')) {
                    errorMessage = error.message;
                }
                
                toast.error(errorMessage, { toastId: 'fetch-team-error' });
            }
            return null;
        }
    }, [slug, isAuthenticated, user?.userId]);

    // Add slug change detection
    useEffect(() => {
        console.log('Slug changed detected:', { slug, previousSlug: slug });
        if (slug && slug.trim()) {
            console.log('Valid slug detected, component will fetch data');
        } else {
            console.warn('Invalid or empty slug detected:', slug);
        }
    }, [slug]);

    const fetchBlogs = useCallback(async (userId: string) => {
        if (!userId) return;
        abortControllerRef.current = new AbortController();
        try {
            const response = await fetch(`/api/blogs?userId=${userId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: abortControllerRef.current.signal,
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to fetch blogs' }));
                throw new Error(errorData?.error || 'Failed to fetch blogs');
            }
            const data = await response.json();
            console.log('Blogs API Response:', JSON.stringify(data, null, 2)); // Debug log
            const transformedBlogs = Array.isArray(data.blogs)
                ? data.blogs.map((blog: any) => ({
                      _id: extractString(blog._id || blog.id, ''),
                      slug: extractString(blog.slug, ''),
                      title: extractString(blog.title, 'Untitled'),
                      content: extractString(blog.content, ''),
                      date: extractString(blog.date, new Date().toISOString()),
                  }))
                : [];
            setBlogs(transformedBlogs);
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Fetch blogs error:', error);
                toast.error(error.message || 'Failed to load blogs', { toastId: 'fetch-blogs-error' });
            }
        }
    }, []);

    const fetchAdditionalProjects = useCallback(async (userId: string) => {
        if (!userId) return;
        abortControllerRef.current = new AbortController();
        try {
            const response = await fetch(`/api/projects?userId=${userId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: abortControllerRef.current.signal,
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to fetch projects' }));
                throw new Error(errorData?.error || 'Failed to fetch projects');
            }
            const data = await response.json();
            console.log('Projects API Response:', JSON.stringify(data, null, 2)); // Debug log
            const transformedProjects = Array.isArray(data.projects)
                ? data.projects.map((proj: any) => ({
                      _id: extractString(proj._id || proj.id, ''),
                      name: extractString(proj.name, 'Untitled'),
                      description: extractString(proj.description, ''),
                      url: proj.url ? extractString(proj.url, '') : undefined,
                  }))
                : [];
            setAdditionalProjects(transformedProjects);
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Fetch projects error:', error);
                toast.error(error.message || 'Failed to load projects', { toastId: 'fetch-projects-error' });
            }
        }
    }, []);

    useEffect(() => {
        setIsLoadingData(true);
        const loadData = async () => {
            const userId = await fetchTeamMember();
            if (userId) {
                await Promise.all([fetchBlogs(userId), fetchAdditionalProjects(userId)]);
            }
            setIsLoadingData(false);
        };
        loadData();
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchTeamMember, fetchBlogs, fetchAdditionalProjects]);

    const formatDate = useCallback((dateString: string): string => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } catch {
            return 'Invalid Date';
        }
    }, []);

    const memoizedTeamMember = useMemo(() => teamMember, [teamMember]);

    if (authLoading || isLoadingData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F7FBFC] via-[#F7FBFC]/30 to-[#F7FBFC]/30 dark:from-[#050B14] dark:via-[#050B14]/10 dark:to-[#050B14]/10 p-6 sm:p-8 md:p-10">
                <div className="max-w-4xl mx-auto bg-white/90 dark:bg-[#102A3A]/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 overflow-hidden border border-[#E6F7F6]/40 dark:border-[#0B1C2D]/30">
                    <Skeleton className="h-48 md:h-64 w-full rounded-t-2xl bg-gradient-to-r from-[#E6F7F6]/50 to-[#E6F7F6]/50 dark:from-[#050B14]/30 dark:to-[#050B14]/30" />
                    <div className="p-6 sm:p-8 space-y-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Skeleton className="w-36 h-36 md:w-48 md:h-48 rounded-full shadow-lg bg-white/70 dark:bg-[#0B1C2D]/70 border-4 border-white dark:border-[#102A3A]" />
                            <div className="space-y-4 w-full">
                                <Skeleton className="h-8 w-3/4 bg-white/50 dark:bg-[#0B1C2D]/50" />
                                <Skeleton className="h-4 w-1/2 bg-white/50 dark:bg-[#0B1C2D]/50" />
                                <Skeleton className="h-24 w-full bg-white/50 dark:bg-[#0B1C2D]/50" />
                            </div>
                        </div>
                        <Skeleton className="h-40 w-full bg-white/50 dark:bg-[#0B1C2D]/50" />
                    </div>
                </div>
            </div>
        );
    }

    if (!memoizedTeamMember) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#F7FBFC] via-[#F7FBFC] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14] p-6">
                <div className="max-w-xl w-full bg-white dark:bg-[#050B14] rounded-2xl shadow-lg p-8 md:p-10 border border-[#DCEEEE] dark:border-[#0B1C2D]">
                    <div className="animate-pulse space-y-6">
                        <div className="h-20 w-20 mx-auto rounded-full bg-[#DCEEEE] dark:bg-[#0B1C2D]"></div>
                        <div className="h-6 bg-[#DCEEEE] dark:bg-[#0B1C2D] rounded w-2/3 mx-auto"></div>
                        <div className="h-4 bg-[#DCEEEE] dark:bg-[#0B1C2D] rounded w-1/2 mx-auto"></div>
                        <div className="space-y-3 pt-4">
                            <div className="h-4 bg-[#DCEEEE] dark:bg-[#0B1C2D] rounded w-full"></div>
                            <div className="h-4 bg-[#DCEEEE] dark:bg-[#0B1C2D] rounded w-5/6"></div>
                            <div className="h-4 bg-[#DCEEEE] dark:bg-[#0B1C2D] rounded w-4/6"></div>
                        </div>
                    </div>
                    <div className="hidden animate-fadeIn text-center" id="notFoundMessage">
                        <h1 className="text-2xl font-semibold text-[#0F172A] dark:text-white mb-3">
                            Profile Not Found
                        </h1>
                        <p className="text-[#1E5AA8] dark:text-[#6EE7D8] mb-6">
                            The requested team member profile could not be found. Please check the URL or try again later.
                        </p>
                        <button
                            onClick={() => window.location.href = "/team"}
                            className="px-5 py-2 rounded-xl bg-[#1E5AA8] hover:bg-[#0B1C2D] text-white font-medium transition"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F7FBFC] via-[#F7FBFC]/30 to-[#F7FBFC]/30 dark:from-[#050B14] dark:via-[#050B14]/10 dark:to-[#050B14]/10 p-6 sm:p-8 md:p-12 font-sans relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-[0.02] dark:opacity-[0.04]" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-4xl mx-auto bg-white/90 dark:bg-[#102A3A]/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-[#E6F7F6]/40 dark:border-[#0B1C2D]/30"
            >
                <div className="relative h-48 md:h-64">
                    <Image
                        src={memoizedTeamMember.banner || '/banner.jpg'}
                        alt="Profile Banner"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = '/banner.jpg'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 dark:to-black/60" />
                </div>

                <div className="p-6 sm:p-8 md:p-10 space-y-8">
                    <motion.section
                        variants={sectionVariants}
                        className="p-6 bg-white/80 dark:bg-[#102A3A]/80 rounded-xl shadow-md border border-gradient-to-r from-[#E6F7F6]/40 to-[#E6F7F6]/40 dark:from-[#050B14]/20 dark:to-[#050B14]/20 backdrop-blur-sm"
                    >
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8">
                            <div className="relative flex-shrink-0">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6EE7D8]/20 to-[#6EE7D8]/20 blur-xl opacity-50 animate-pulse" />
                                <ProfileImage
                                    src={memoizedTeamMember.profileImage || '/avatar.png'}
                                    alt={`${memoizedTeamMember.firstName || 'User'} ${memoizedTeamMember.lastName || ''}'s Profile Image`}
                                />
                            </div>
                            <div className="flex-grow space-y-6 text-center sm:text-left">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] dark:text-white tracking-tight mb-3">
                                                {memoizedTeamMember.firstName} {memoizedTeamMember.lastName}
                                            </h1>
                                            <p className="text-[#1E5AA8] dark:text-[#6EE7D8] font-medium text-lg mb-3">
                                                {memoizedTeamMember.designation
                                                    ? memoizedTeamMember.designation.charAt(0).toUpperCase() + memoizedTeamMember.designation.slice(1).toLowerCase()
                                                    : 'Team Member'}
                                            </p>
                                            {memoizedTeamMember.location && memoizedTeamMember.location.trim() !== '' && (
                                                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#1E5AA8] dark:text-[#6EE7D8] text-sm mb-3">
                                                    <MapPin className="h-4 w-4 text-[#2FD1C5] flex-shrink-0" aria-hidden="true" />
                                                    <span>{memoizedTeamMember.location}</span>
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-2 text-[#1E5AA8] dark:text-[#9FB3C8] text-sm md:text-base">
                                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                                    <Mail className="h-4 w-4 text-[#2FD1C5] flex-shrink-0" aria-hidden="true" />
                                                    <span className="truncate" title={memoizedTeamMember.email || 'N/A'}>{memoizedTeamMember.email || 'N/A'}</span>
                                                </div>
                                                {memoizedTeamMember.supportiveEmail && memoizedTeamMember.supportiveEmail.trim() !== '' && (
                                                    <div className="flex items-center justify-center sm:justify-start gap-2">
                                                        <Mail className="h-4 w-4 text-[#2FD1C5] flex-shrink-0" aria-hidden="true" />
                                                        <span className="truncate" title={memoizedTeamMember.supportiveEmail}>{memoizedTeamMember.supportiveEmail}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {isOwner && (
                                            <Link href={`/profile`} className="px-4 py-2 bg-[#1E5AA8] text-white rounded-md text-sm font-medium hover:bg-[#0B1C2D] transition-colors">
                                                Edit Profile
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#0F172A] dark:text-white">
                                            <UserCircle className="h-4 w-4 text-[#2FD1C5]" aria-hidden="true" />
                                            About Me
                                        </h3>
                                        <p className="text-base text-[#1E5AA8] dark:text-[#9FB3C8] leading-relaxed">
                                            {memoizedTeamMember.bio || 'No bio available'}
                                        </p>
                                    </div>
                                    {memoizedTeamMember.skills.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#0F172A] dark:text-white">
                                                <Star className="h-4 w-4 text-[#2FD1C5]" aria-hidden="true" />
                                                Skills
                                            </h3>
                                            <ul className="flex flex-wrap gap-2" role="list">
                                                {memoizedTeamMember.skills.map((skill, idx) => (
                                                    <SkillBadge key={idx} skill={skill} />
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {memoizedTeamMember.hobbies.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#0F172A] dark:text-white">
                                                <UserCircle className="h-4 w-4 text-[#2FD1C5]" aria-hidden="true" />
                                                Hobbies
                                            </h3>
                                            <ul className="flex flex-wrap gap-2" role="list">
                                                {memoizedTeamMember.hobbies.map((hobby, idx) => (
                                                    <HobbyBadge key={idx} hobby={hobby} />
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {memoizedTeamMember.languages.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#0F172A] dark:text-white">
                                                <Languages className="h-4 w-4 text-[#2FD1C5]" aria-hidden="true" />
                                                Languages
                                            </h3>
                                            <ul className="space-y-2 text-[#1E5AA8] dark:text-[#9FB3C8]" role="list">
                                                {memoizedTeamMember.languages.map((lang, idx) => (
                                                    <motion.li
                                                        key={idx}
                                                        whileHover={{ x: 4 }}
                                                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#F7FBFC]/50 dark:bg-[#0B1C2D]/30 hover:bg-white/20 dark:hover:bg-[#0B1C2D]/40 transition-all duration-300"
                                                        role="listitem"
                                                    >
                                                        <span className="font-medium text-sm">{lang.name}</span>
                                                        <span className="px-2.5 py-1 bg-[#E6F7F6]/50 dark:bg-[#050B14]/30 text-[#0B1C2D] dark:text-[#9FB3C8] rounded-full text-xs font-medium">
                                                            {lang.proficiency}
                                                        </span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {memoizedTeamMember.previousJobs.length > 0 && (
                        <motion.section variants={sectionVariants} className="p-6 bg-white/80 dark:bg-[#102A3A]/80 rounded-xl shadow-md border border-[#E6F7F6]/30 dark:border-[#0B1C2D]/30 backdrop-blur-sm">
                            <SectionHeader icon={<Briefcase className="h-5 w-5" />} title="Work Experience" />
                            <div className="relative space-y-6 before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b from-[#DCEEEE]/60 to-transparent dark:from-[#0B1C2D]/60 dark:to-transparent">
                                {memoizedTeamMember.previousJobs.map((job, idx) => (
                                    <TimelineItem key={idx} icon={<Briefcase className="h-4 w-4 text-[#2FD1C5]" aria-hidden="true" />} index={idx}>
                                        <h3 className="text-lg font-semibold text-[#0F172A] dark:text-white mb-1">{job.title}</h3>
                                        <p className="text-[#1E5AA8] dark:text-[#6EE7D8] font-medium text-sm mb-1">{job.company}</p>
                                        <p className="text-sm text-[#2FD1C5] dark:text-[#6EE7D8] mb-2">{job.startDate} - {job.endDate || 'Present'}</p>
                                        <p className="text-[#1E5AA8] dark:text-[#9FB3C8] text-sm">{job.description}</p>
                                    </TimelineItem>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {memoizedTeamMember.education.length > 0 && (
                        <motion.section variants={sectionVariants} className="p-6 bg-white/80 dark:bg-[#102A3A]/80 rounded-xl shadow-md border border-[#E6F7F6]/30 dark:border-[#0B1C2D]/30 backdrop-blur-sm">
                            <SectionHeader icon={<GraduationCap className="h-5 w-5" />} title="Education" />
                            <div className="relative space-y-6 before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b from-[#DCEEEE]/60 to-transparent dark:from-[#0B1C2D]/60 dark:to-transparent">
                                {memoizedTeamMember.education.map((edu, idx) => (
                                    <TimelineItem key={idx} icon={<GraduationCap className="h-4 w-4 text-[#2FD1C5]" aria-hidden="true" />} index={idx}>
                                        <h3 className="text-lg font-semibold text-[#0F172A] dark:text-white mb-1">{edu.degree}</h3>
                                        <p className="text-[#1E5AA8] dark:text-[#6EE7D8] font-medium text-sm mb-1">{edu.institution}</p>
                                        <p className="text-sm text-[#2FD1C5] dark:text-[#6EE7D8] mb-2">{edu.startYear} - {edu.endYear}</p>
                                        <p className="text-[#1E5AA8] dark:text-[#9FB3C8] text-sm">{edu.description}</p>
                                    </TimelineItem>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {memoizedTeamMember.certifications.length > 0 && (
                        <motion.section variants={sectionVariants} className="p-6 bg-white/80 dark:bg-[#102A3A]/80 rounded-xl shadow-md border border-[#E6F7F6]/30 dark:border-[#0B1C2D]/30 backdrop-blur-sm">
                            <SectionHeader icon={<BookOpen className="h-5 w-5" />} title="Certifications" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {memoizedTeamMember.certifications.map((cert, idx) => (
                                    <motion.div
                                        key={idx}
                                        variants={cardVariants}
                                        className="p-4 bg-white/60 dark:bg-[#0B1C2D]/60 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-[#E6F7F6]/20 dark:border-[#1E5AA8]/30 group hover:border-[#DCEEEE]/50 dark:hover:border-[#0B1C2D]/30"
                                        tabIndex={0}
                                        role="article"
                                        aria-label={`Certification: ${cert.title}`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <BookOpen className="h-4 w-4 text-[#2FD1C5] flex-shrink-0" aria-hidden="true" />
                                            <h4 className="text-base font-semibold text-[#0F172A] dark:text-white group-hover:text-[#1E5AA8] dark:group-hover:text-[#6EE7D8] transition-colors">{cert.title}</h4>
                                        </div>
                                        <p className="text-sm text-[#2FD1C5] dark:text-[#6EE7D8]">{cert.issuer} | {cert.year}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {memoizedTeamMember.awards.length > 0 && (
                        <motion.section variants={sectionVariants} className="p-6 bg-white/80 dark:bg-[#102A3A]/80 rounded-xl shadow-md border border-[#E6F7F6]/30 dark:border-[#0B1C2D]/30 backdrop-blur-sm">
                            <SectionHeader icon={<Award className="h-5 w-5" />} title="Awards" />
                            <div className="space-y-4">
                                {memoizedTeamMember.awards.map((award, idx) => (
                                    <motion.div
                                        key={idx}
                                        variants={cardVariants}
                                        className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-[#F7FBFC]/50 to-[#E6F7F6]/30 dark:from-[#050B14]/20 dark:to-[#102A3A]/10 hover:shadow-md transition-all duration-300 border border-[#E6F7F6]/40 dark:border-[#0B1C2D]/30"
                                        tabIndex={0}
                                        role="article"
                                        aria-label={`Award: ${award.title}`}
                                    >
                                        <div className="flex-shrink-0 mt-1 p-1.5 rounded-full bg-[#E6F7F6]/60 dark:bg-[#050B14]/30">
                                            <Award className="h-4 w-4 text-[#2FD1C5]" aria-hidden="true" />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="text-base font-semibold text-[#0F172A] dark:text-white">{award.title}</h4>
                                            <p className="text-sm text-[#1E5AA8] dark:text-[#6EE7D8]">{award.issuer} | {award.year}</p>
                                            <p className="text-[#1E5AA8] dark:text-[#9FB3C8] text-sm mt-1">{award.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {memoizedTeamMember.projectLinks.length > 0 && (
                        <motion.section variants={sectionVariants} className="p-6 bg-white/80 dark:bg-[#102A3A]/80 rounded-xl shadow-md border border-[#E6F7F6]/30 dark:border-[#0B1C2D]/30 backdrop-blur-sm">
                            <SectionHeader icon={<LinkIcon className="h-5 w-5" />} title="Projects" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {memoizedTeamMember.projectLinks.map((proj, idx) => (
                                    <motion.a
                                        key={idx}
                                        href={proj.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variants={cardVariants}
                                        className="group p-4 bg-white/60 dark:bg-[#0B1C2D]/60 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-[#E6F7F6]/20 dark:border-[#1E5AA8]/30 focus:outline-none focus:ring-2 focus:ring-[#2FD1C5] focus:ring-offset-2 hover:border-[#DCEEEE]/50 dark:hover:border-[#0B1C2D]/30"
                                        aria-label={`View project: ${proj.title}`}
                                        tabIndex={0}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold text-[#0F172A] dark:text-white group-hover:text-[#1E5AA8] dark:group-hover:text-[#6EE7D8] transition-colors">{proj.title}</h4>
                                            <ExternalLink className="h-4 w-4 text-[#6EE7D8] group-hover:text-[#2FD1C5] transition-colors" />
                                        </div>
                                        <p className="text-sm text-[#1E5AA8] dark:text-[#9FB3C8] line-clamp-2">{proj.description}</p>
                                    </motion.a>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {blogs.length > 0 && (
                        <motion.section variants={sectionVariants} className="p-6 bg-white/80 dark:bg-[#102A3A]/80 rounded-xl shadow-md border border-[#E6F7F6]/30 dark:border-[#0B1C2D]/30 backdrop-blur-sm">
                            <SectionHeader icon={<BookOpen className="h-5 w-5" />} title="Blogs" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {blogs.map((blog, idx) => (
                                    <motion.div
                                        key={blog._id}
                                        variants={cardVariants}
                                        className="group overflow-hidden rounded-lg bg-white/60 dark:bg-[#0B1C2D]/60 shadow-sm hover:shadow-md transition-all duration-300 border border-[#E6F7F6]/20 dark:border-[#1E5AA8]/30 hover:border-[#DCEEEE]/50 dark:hover:border-[#0B1C2D]/30"
                                        role="article"
                                        aria-label={`Blog: ${blog.title}`}
                                        tabIndex={0}
                                    >
                                        <div className="p-4">
                                            <h3 className="text-base font-semibold text-[#0F172A] dark:text-white mb-2 group-hover:text-[#1E5AA8] dark:group-hover:text-[#6EE7D8] transition-colors line-clamp-2">{blog.title}</h3>
                                            <p className="text-xs text-[#2FD1C5] dark:text-[#6EE7D8] flex items-center gap-2 mb-3">
                                                <Calendar className="h-3 w-3" aria-hidden="true" />
                                                {formatDate(blog.date)}
                                            </p>
                                            <p className="text-sm text-[#1E5AA8] dark:text-[#9FB3C8] line-clamp-2 mb-3">{blog.content}</p>
                                            <Link
                                                href={`/blog/${blog.slug}`}
                                                className="inline-flex items-center gap-1 text-[#1E5AA8] dark:text-[#6EE7D8] text-sm font-medium hover:underline transition-colors focus:outline-none focus:underline"
                                                aria-label={`Read more about ${blog.title}`}
                                            >
                                                Read More
                                                <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {additionalProjects.length > 0 && (
                        <motion.section variants={sectionVariants} className="p-6 bg-white/80 dark:bg-[#102A3A]/80 rounded-xl shadow-md border border-[#E6F7F6]/30 dark:border-[#0B1C2D]/30 backdrop-blur-sm">
                            <SectionHeader icon={<LinkIcon className="h-5 w-5" />} title="Additional Projects" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {additionalProjects.map((proj, idx) => (
                                    <motion.div
                                        key={proj._id}
                                        variants={cardVariants}
                                        className="group overflow-hidden rounded-lg bg-white/60 dark:bg-[#0B1C2D]/60 shadow-sm hover:shadow-md transition-all duration-300 border border-[#E6F7F6]/20 dark:border-[#1E5AA8]/30 hover:border-[#DCEEEE]/50 dark:hover:border-[#0B1C2D]/30"
                                        role="article"
                                        aria-label={`Project: ${proj.name}`}
                                        tabIndex={0}
                                    >
                                        <div className="p-4">
                                            <h3 className="text-base font-semibold text-[#0F172A] dark:text-white mb-2 group-hover:text-[#1E5AA8] dark:group-hover:text-[#6EE7D8] transition-colors line-clamp-2">{proj.name}</h3>
                                            <p className="text-sm text-[#1E5AA8] dark:text-[#9FB3C8] line-clamp-2 mb-3">{proj.description}</p>
                                            {proj.url && (
                                                <a
                                                    href={proj.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[#1E5AA8] dark:text-[#6EE7D8] text-sm font-medium hover:underline transition-colors focus:outline-none focus:underline"
                                                    aria-label={`View project: ${proj.name}`}
                                                >
                                                    View Project
                                                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                                                </a>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </div>
            </motion.div>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </div>
    );
};

export default TeamProfile;
