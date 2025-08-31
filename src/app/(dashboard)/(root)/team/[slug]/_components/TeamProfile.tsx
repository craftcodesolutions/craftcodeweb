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

// Define interfaces (unchanged)
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
    location?: string;
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

// Reusable components
const ProfileImage: React.FC<{ src: string, alt: string }> = ({ src, alt }) => (
    <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl ring-4 ring-blue-100/30 dark:ring-blue-900/20">
        <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 192px"
            className="object-cover"
            priority
            onError={(e) => { e.currentTarget.src = '/default-profile.png'; }}
        />
    </div>
);

const SectionHeader: React.FC<{ icon: React.ReactNode, title: string }> = ({ icon, title }) => (
    <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
        <span className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md">
            {icon}
        </span>
        {title}
    </h2>
);

const TimelineItem: React.FC<{ icon: React.ReactNode, children: React.ReactNode, index: number }> = ({ icon, children, index }) => (
    <motion.div
        variants={cardVariants}
        className="relative pl-12 group"
        role="listitem"
        aria-label={`Timeline item ${index + 1}`}
    >
        <div className="absolute left-0 top-2 w-9 h-9 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg border-2 border-blue-200 dark:border-blue-700 group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30">
            {icon}
        </div>
        <div className="p-5 bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-sm border border-gray-100/30 dark:border-gray-700/30 backdrop-blur-sm group-hover:shadow-md group-hover:border-blue-100/50 dark:group-hover:border-blue-900/30 transition-all duration-300">
            {children}
        </div>
    </motion.div>
);

const SkillBadge: React.FC<{ skill: string }> = ({ skill }) => (
    <motion.li
        whileHover={{ scale: 1.05 }}
        className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 text-blue-700 dark:text-blue-200 rounded-full text-sm font-medium shadow-sm hover:shadow transition-all duration-300 border border-blue-200/50 dark:border-blue-700/30"
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
            className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/30 text-purple-700 dark:text-purple-200 rounded-full text-sm font-medium shadow-sm hover:shadow transition-all duration-300 flex items-center gap-1.5 border border-purple-200/50 dark:border-purple-700/30"
            role="listitem"
        >
            {getHobbyIcon(hobby)}
            {hobby}
        </motion.li>
    );
};

const TeamProfile: React.FC = () => {
    const params = useParams();
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug || '';
    const { user, isAuthenticated, isLoading: authLoading } = useAuth() as AuthContextType;
    const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [additionalProjects, setAdditionalProjects] = useState<AdditionalProject[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isFetchingBlogs, setIsFetchingBlogs] = useState(true);
    const [isFetchingProjects, setIsFetchingProjects] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchTeamMember = useCallback(async () => {
        if (!slug) {
            toast.error('No profile slug provided', { toastId: 'no-slug' });
            setIsFetching(false);
            return;
        }
        setIsFetching(true);
        abortControllerRef.current = new AbortController();
        try {
            const response = await fetch(`/api/teams/slug/${encodeURIComponent(slug)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `HTTP error! Status: ${response.status}` }));
                throw new Error(errorData?.error || `Failed to fetch team member (Status: ${response.status})`);
            }

            const data = await response.json();
            const team: TeamMember = data.team;

            if (!team) {
                throw new Error('Team member not found');
            }

            const userResponse = await fetch(`/api/users/${team.userId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: abortControllerRef.current.signal,
            });

            if (!userResponse.ok) {
                const userErrorData = await userResponse.json().catch(() => ({ error: 'Failed to fetch user data' }));
                throw new Error(userErrorData?.error || 'Failed to fetch user data');
            }

            const userData = await userResponse.json();
            const enrichedTeam: TeamMember = {
                ...team,
                firstName: userData.firstName || 'Unknown',
                lastName: userData.lastName || '',
                email: userData.email || 'N/A',
                bio: userData.bio || 'No bio available',
                profileImage: userData.avatar || '/default-profile.png',
                publicIdProfile: userData.publicIdProfile || null,
                blogs: [],
                projects: [],
                location: userData.location || '',
            };

            setTeamMember(enrichedTeam);
            setIsOwner(isAuthenticated && enrichedTeam.userId === user?.userId);
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Fetch team member error:', error);
                toast.error(error.message || 'Failed to fetch team member profile', { toastId: 'fetch-team-error' });
            }
        } finally {
            setIsFetching(false);
        }
    }, [slug, isAuthenticated, user?.userId]);

    const fetchBlogs = useCallback(async (userId: string) => {
        setIsFetchingBlogs(true);
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
            setBlogs(data.blogs || []);
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Fetch blogs error:', error);
                toast.error(error.message || 'Failed to load blogs', { toastId: 'fetch-blogs-error' });
            }
        } finally {
            setIsFetchingBlogs(false);
        }
    }, []);

    const fetchAdditionalProjects = useCallback(async (userId: string) => {
        setIsFetchingProjects(true);
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
            setAdditionalProjects(data.projects || []);
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Fetch projects error:', error);
                toast.error(error.message || 'Failed to load projects', { toastId: 'fetch-projects-error' });
            }
        } finally {
            setIsFetchingProjects(false);
        }
    }, []);

    useEffect(() => {
        fetchTeamMember();
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchTeamMember]);

    useEffect(() => {
        if (teamMember?.userId) {
            fetchBlogs(teamMember.userId);
            fetchAdditionalProjects(teamMember.userId);
        }
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [teamMember?.userId, fetchBlogs, fetchAdditionalProjects]);

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

    if (authLoading || isFetching) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 p-6 sm:p-8 md:p-10">
                <div className="max-w-4xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 overflow-hidden border border-gray-100/40 dark:border-gray-700/30">
                    <Skeleton className="h-48 md:h-64 w-full rounded-t-2xl bg-gradient-to-r from-blue-100/50 to-purple-100/50 dark:from-blue-900/30 dark:to-purple-900/30" />
                    <div className="p-6 sm:p-8 space-y-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Skeleton className="w-36 h-36 md:w-48 md:h-48 rounded-full shadow-lg bg-white/70 dark:bg-gray-700/70 border-4 border-white dark:border-gray-800" />
                            <div className="space-y-4 w-full">
                                <Skeleton className="h-8 w-3/4 bg-white/50 dark:bg-gray-700/50" />
                                <Skeleton className="h-4 w-1/2 bg-white/50 dark:bg-gray-700/50" />
                                <Skeleton className="h-24 w-full bg-white/50 dark:bg-gray-700/50" />
                            </div>
                        </div>
                        <Skeleton className="h-40 w-full bg-white/50 dark:bg-gray-700/50" />
                    </div>
                </div>
            </div>
        );
    }

    if (!memoizedTeamMember) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 p-6 sm:p-8 md:p-10 flex items-center justify-center">
                <div className="max-w-2xl w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 text-center border border-gray-100/40 dark:border-gray-700/30">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Profile Not Found</h1>
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">The requested team member profile could not be found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 p-6 sm:p-8 md:p-12 font-sans relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-[0.02] dark:opacity-[0.04]" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-4xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100/40 dark:border-gray-700/30"
            >
                <div className="relative h-48 md:h-64">
                    <Image
                        src={memoizedTeamMember.banner || '/default-banner.png'}
                        alt="Profile Banner"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        loading="lazy"
                        priority={false}
                        onError={(e) => { e.currentTarget.src = '/default-banner.png'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 dark:to-black/60" />
                </div>

                <div className="p-6 sm:p-8 md:p-10 space-y-8">
                    <motion.section
                        variants={sectionVariants}
                        className="p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md border border-gradient-to-r from-blue-100/40 to-purple-100/40 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm"
                    >
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8">
                            <div className="relative flex-shrink-0">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl opacity-50 animate-pulse" />
                                <ProfileImage
                                    src={memoizedTeamMember.profileImage || '/default-profile.png'}
                                    alt={`${memoizedTeamMember.firstName || 'User'} ${memoizedTeamMember.lastName || ''} Profile Image`}
                                />
                            </div>
                            <div className="flex-grow space-y-6 text-center sm:text-left">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
                                        {memoizedTeamMember.firstName} {memoizedTeamMember.lastName || ''}
                                    </h1>
                                    {memoizedTeamMember.location && (
                                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-gray-600 dark:text-gray-400 text-sm mb-3">
                                            <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" aria-hidden="true" />
                                            <span>{memoizedTeamMember.location}</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-2 text-gray-600 dark:text-gray-300 text-sm md:text-base">
                                        <div className="flex items-center justify-center sm:justify-start gap-2">
                                            <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" aria-hidden="true" />
                                            <span className="truncate" title={memoizedTeamMember.email || 'N/A'}>{memoizedTeamMember.email || 'N/A'}</span>
                                        </div>
                                        {memoizedTeamMember.supportiveEmail && (
                                            <div className="flex items-center justify-center sm:justify-start gap-2">
                                                <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" aria-hidden="true" />
                                                <span className="truncate" title={memoizedTeamMember.supportiveEmail}>{memoizedTeamMember.supportiveEmail}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                                            <UserCircle className="h-4 w-4 text-purple-500" aria-hidden="true" />
                                            About Me
                                        </h3>
                                        <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {memoizedTeamMember.bio || 'No bio available'}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                                            <Star className="h-4 w-4 text-amber-500" aria-hidden="true" />
                                            Skills
                                        </h3>
                                        <ul className="flex flex-wrap gap-2" role="list">
                                            {memoizedTeamMember.skills.map((skill, idx) => (
                                                <SkillBadge key={idx} skill={skill} />
                                            ))}
                                            {memoizedTeamMember.skills.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-sm">No skills listed</p>}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                                            <UserCircle className="h-4 w-4 text-purple-500" aria-hidden="true" />
                                            Hobbies
                                        </h3>
                                        <ul className="flex flex-wrap gap-2" role="list">
                                            {memoizedTeamMember.hobbies.map((hobby, idx) => (
                                                <HobbyBadge key={idx} hobby={hobby} />
                                            ))}
                                            {memoizedTeamMember.hobbies.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-sm">No hobbies listed</p>}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                                            <Languages className="h-4 w-4 text-green-500" aria-hidden="true" />
                                            Languages
                                        </h3>
                                        <ul className="space-y-2 text-gray-600 dark:text-gray-300" role="list">
                                            {memoizedTeamMember.languages.map((lang, idx) => (
                                                <motion.li
                                                    key={idx}
                                                    whileHover={{ x: 4 }}
                                                    className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50/50 dark:bg-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-700/40 transition-all duration-300"
                                                    role="listitem"
                                                >
                                                    <span className="font-medium text-sm">{lang.name}</span>
                                                    <span className="px-2.5 py-1 bg-green-100/50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                                        {lang.proficiency}
                                                    </span>
                                                </motion.li>
                                            ))}
                                            {memoizedTeamMember.languages.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-sm text-center">No languages listed</p>}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    <motion.section
                        variants={sectionVariants}
                        className="p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md border border-gray-100/30 dark:border-gray-700/30 backdrop-blur-sm"
                    >
                        <SectionHeader icon={<Briefcase className="h-5 w-5" />} title="Work Experience" />
                        <div className="relative space-y-6 before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b from-blue-200/60 to-transparent dark:from-blue-700/60 dark:to-transparent">
                            {memoizedTeamMember.previousJobs.map((job, idx) => (
                                <TimelineItem key={idx} icon={<Briefcase className="h-4 w-4 text-blue-500" aria-hidden="true" />} index={idx}>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{job.title}</h3>
                                    <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-1">{job.company}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{job.startDate} - {job.endDate || 'Present'}</p>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">{job.description}</p>
                                </TimelineItem>
                            ))}
                            {memoizedTeamMember.previousJobs.length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-6 text-sm">No work experience listed yet</p>
                            )}
                        </div>
                    </motion.section>

                    <motion.section
                        variants={sectionVariants}
                        className="p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md border border-gray-100/30 dark:border-gray-700/30 backdrop-blur-sm"
                    >
                        <SectionHeader icon={<GraduationCap className="h-5 w-5" />} title="Education" />
                        <div className="relative space-y-6 before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b from-purple-200/60 to-transparent dark:from-purple-700/60 dark:to-transparent">
                            {memoizedTeamMember.education.map((edu, idx) => (
                                <TimelineItem key={idx} icon={<GraduationCap className="h-4 w-4 text-purple-500" aria-hidden="true" />} index={idx}>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{edu.degree}</h3>
                                    <p className="text-purple-600 dark:text-purple-400 font-medium text-sm mb-1">{edu.institution}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{edu.startYear} - {edu.endYear}</p>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">{edu.description}</p>
                                </TimelineItem>
                            ))}
                            {memoizedTeamMember.education.length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-6 text-sm">No education listed yet</p>
                            )}
                        </div>
                    </motion.section>

                    <motion.section
                        variants={sectionVariants}
                        className="p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md border border-gray-100/30 dark:border-gray-700/30 backdrop-blur-sm"
                    >
                        <SectionHeader icon={<BookOpen className="h-5 w-5" />} title="Certifications" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {memoizedTeamMember.certifications.map((cert, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={cardVariants}
                                    className="p-4 bg-white/60 dark:bg-gray-700/60 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/20 dark:border-gray-600/30 group hover:border-green-200/50 dark:hover:border-green-700/30"
                                    tabIndex={0}
                                    role="article"
                                    aria-label={`Certification: ${cert.title}`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookOpen className="h-4 w-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                                        <h4 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{cert.title}</h4>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{cert.issuer} | {cert.year}</p>
                                </motion.div>
                            ))}
                            {memoizedTeamMember.certifications.length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400 col-span-2 text-center py-6 text-sm">No certifications listed yet</p>
                            )}
                        </div>
                    </motion.section>

                    <motion.section
                        variants={sectionVariants}
                        className="p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md border border-gray-100/30 dark:border-gray-700/30 backdrop-blur-sm"
                    >
                        <SectionHeader icon={<Award className="h-5 w-5" />} title="Awards" />
                        <div className="space-y-4">
                            {memoizedTeamMember.awards.map((award, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={cardVariants}
                                    className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-amber-50/50 to-amber-100/30 dark:from-amber-900/20 dark:to-amber-800/10 hover:shadow-md transition-all duration-300 border border-amber-100/40 dark:border-amber-700/30"
                                    tabIndex={0}
                                    role="article"
                                    aria-label={`Award: ${award.title}`}
                                >
                                    <div className="flex-shrink-0 mt-1 p-1.5 rounded-full bg-amber-100/60 dark:bg-amber-900/30">
                                        <Award className="h-4 w-4 text-amber-500" aria-hidden="true" />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">{award.title}</h4>
                                        <p className="text-sm text-amber-600 dark:text-amber-400">{award.issuer} | {award.year}</p>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{award.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {memoizedTeamMember.awards.length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-6 text-sm">No awards listed yet</p>
                            )}
                        </div>
                    </motion.section>

                    <motion.section
                        variants={sectionVariants}
                        className="p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md border border-gray-100/30 dark:border-gray-700/30 backdrop-blur-sm"
                    >
                        <SectionHeader icon={<LinkIcon className="h-5 w-5" />} title="Projects" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {memoizedTeamMember.projectLinks.map((proj, idx) => (
                                <motion.a
                                    key={idx}
                                    href={proj.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variants={cardVariants}
                                    className="group p-4 bg-white/60 dark:bg-gray-700/60 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/20 dark:border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:border-blue-200/50 dark:hover:border-blue-700/30"
                                    aria-label={`View project: ${proj.title}`}
                                    tabIndex={0}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{proj.title}</h4>
                                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{proj.description}</p>
                                </motion.a>
                            ))}
                            {memoizedTeamMember.projectLinks.length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400 col-span-2 text-center py-6 text-sm">No projects listed yet</p>
                            )}
                        </div>
                    </motion.section>

                    <motion.section
                        variants={sectionVariants}
                        className="p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md border border-gray-100/30 dark:border-gray-700/30 backdrop-blur-sm"
                    >
                        <SectionHeader icon={<BookOpen className="h-5 w-5" />} title="Blogs" />
                        {isFetchingBlogs ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Array.from({ length: 3 }).map((_, idx) => (
                                    <Skeleton key={idx} className="h-40 rounded-lg" />
                                ))}
                            </div>
                        ) : blogs.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {blogs.map((blog, idx) => (
                                    <motion.div
                                        key={blog._id}
                                        variants={cardVariants}
                                        className="group overflow-hidden rounded-lg bg-white/60 dark:bg-gray-700/60 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/20 dark:border-gray-600/30 hover:border-purple-200/50 dark:hover:border-purple-700/30"
                                        role="article"
                                        aria-label={`Blog: ${blog.title}`}
                                        tabIndex={0}
                                    >
                                        <div className="p-4">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">{blog.title}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-3">
                                                <Calendar className="h-3 w-3" aria-hidden="true" />
                                                {formatDate(blog.date)}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{blog.content}</p>
                                            <a
                                                href={`/blog/${blog.slug}`}
                                                className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline transition-colors focus:outline-none focus:underline"
                                                aria-label={`Read more about ${blog.title}`}
                                            >
                                                Read More
                                                <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                                            </a>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <BookOpen className="mx-auto h-8 w-8 text-gray-400 mb-3" aria-hidden="true" />
                                <p className="text-gray-500 dark:text-gray-400 text-sm">No blogs published yet</p>
                            </div>
                        )}
                    </motion.section>

                    <motion.section
                        variants={sectionVariants}
                        className="p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md border border-gray-100/30 dark:border-gray-700/30 backdrop-blur-sm"
                    >
                        <SectionHeader icon={<LinkIcon className="h-5 w-5" />} title="Additional Projects" />
                        {isFetchingProjects ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Array.from({ length: 3 }).map((_, idx) => (
                                    <Skeleton key={idx} className="h-40 rounded-lg" />
                                ))}
                            </div>
                        ) : additionalProjects.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {additionalProjects.map((proj, idx) => (
                                    <motion.div
                                        key={proj._id}
                                        variants={cardVariants}
                                        className="group overflow-hidden rounded-lg bg-white/60 dark:bg-gray-700/60 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/20 dark:border-gray-600/30 hover:border-blue-200/50 dark:hover:border-blue-700/30"
                                        role="article"
                                        aria-label={`Project: ${proj.name}`}
                                        tabIndex={0}
                                    >
                                        <div className="p-4">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">{proj.name}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{proj.description}</p>
                                            {proj.url && (
                                                <a
                                                    href={proj.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline transition-colors focus:outline-none focus:underline"
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
                        ) : (
                            <div className="py-8 text-center">
                                <LinkIcon className="mx-auto h-8 w-8 text-gray-400 mb-3" aria-hidden="true" />
                                <p className="text-gray-500 dark:text-gray-400 text-sm">No additional projects available yet</p>
                            </div>
                        )}
                    </motion.section>
                </div>
            </motion.div>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </div>
    );
};

export default TeamProfile;