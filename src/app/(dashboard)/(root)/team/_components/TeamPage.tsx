/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Grid3X3, List, Sparkles, Star, Mail, Linkedin, Github, Twitter, ChevronRight, TrendingUp, Rocket, Heart, Eye, MessageCircle, Share2, Award, Zap, Target } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Custom scrollbar styles - hidden scrollbars
const customScrollbarStyles = `
  .custom-scrollbar {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* Internet Explorer 10+ */
  }
  .custom-scrollbar::-webkit-scrollbar {
    display: none; /* WebKit */
    width: 0;
    height: 0;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    display: none;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    display: none;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    display: none;
  }
  
  /* Hide scrollbars globally but keep functionality */
  .hide-scrollbar {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* Internet Explorer 10+ */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none; /* WebKit */
  }
`;

interface DisplayTeamMember {
  name: string;
  role: string;
  description: string;
  image: string;
  userId: string;
  designation: string;
  email: string;
  bio: string;
}

interface DisplayProgrammer {
  id: string;
  name: string;
  email: string;
  designation: string;
  bio: string;
  image: string;
  skills?: string[];
  experience?: string;
  github?: string;
  linkedin?: string;
}

interface PreviousJob {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface TeamMember {
  _id: string;
  userId: string;
  slug: string;
  banner: string | null;
  publicIdBanner: string | null;
  skills: string[];
  previousJobs: PreviousJob[];
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  profileImage?: string | null;
  publicIdProfile?: string | null;
  designation: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.4,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1, 
    transition: { 
      duration: 1,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<DisplayTeamMember[]>([]);
  const [programmers, setProgrammers] = useState<DisplayProgrammer[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isFetchingProgrammers, setIsFetchingProgrammers] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const response = await fetch('/api/teams?limit=100', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        const teams: TeamMember[] = data.teams || [];

        // Show loading toast for large teams
        if (teams.length > 20) {
          // You can add a toast notification here
          console.log(`Loading details for ${teams.length} team members...`);
        }

        const userPromises = teams.map((team: TeamMember) =>
          fetch(`/api/users/${team.userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }).then(async (res) => {
            if (res.ok) {
              const userData = await res.json();
              return {
                userId: team.userId,
                firstName: userData.firstName || 'Unknown',
                lastName: userData.lastName || '',
                email: userData.email || 'N/A',
                bio: userData.bio || 'No bio available',
                profileImage: userData.avatar || '/default-profile.png',
                publicIdProfile: userData.publicIdProfile || null,
              };
            } else {
              console.warn(`Failed to fetch user data for ${team.userId}`);
              return {
                userId: team.userId,
                firstName: 'Unknown',
                lastName: '',
                email: 'N/A',
                bio: 'No bio available',
                profileImage: '/default-profile.png',
                publicIdProfile: null,
              };
            }
          }).catch((error) => {
            console.error(`Error fetching user ${team.userId}:`, error);
            return {
              userId: team.userId,
              firstName: 'Unknown',
              lastName: '',
              email: 'N/A',
              bio: 'No bio available',
              profileImage: '/default-profile.png',
              publicIdProfile: null,
            };
          })
        );

        const users = await Promise.all(userPromises);

        const enrichedTeams = teams.map((team: TeamMember, i: number) => ({
          ...team,
          firstName: users[i].firstName,
          lastName: users[i].lastName,
          email: users[i].email,
          bio: users[i].bio,
          profileImage: users[i].profileImage,
          publicIdProfile: users[i].publicIdProfile,
        }));

        const displayMembers: DisplayTeamMember[] = enrichedTeams.map((member) => ({
          name: `${member.firstName} ${member.lastName || ''}`.trim() || 'Unknown',
          role: member.designation
            ? member.designation.charAt(0).toUpperCase() + member.designation.slice(1).toLowerCase()
            : 'Team Member',
          description: member.bio || 'No description available',
          image: member.profileImage || '/default-profile.png',
          userId: member.slug || member.userId,
          designation: member.designation,
          email: member.email || '',
          bio: member.bio || '',
        }));

        setTeamMembers(displayMembers);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData?.error || 'Failed to fetch team members';
        console.error('Failed to fetch team members:', errorMessage);
        setError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'An unexpected error occurred';
      console.error('Fetch team members error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsFetching(false);
    }

    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchTeamMembers(),
        fetchProgrammers()
      ]);
    };
    
    initializeData();
  }, []);

  // Fetch programmers from users API
  const fetchProgrammers = async () => {
    setIsFetchingProgrammers(true);
    try {
      const response = await fetch('/api/users?limit=1000', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const users = data.users || data.data || data || [];

        console.log('Total users fetched:', users.length);

        // Filter users who are developers/programmers
        const developerUsers = users.filter((user: any) => {
          const designations = Array.isArray(user.designations) 
            ? user.designations.map((d: string) => d.toLowerCase()) 
            : [];
          
          const designation = user.designation?.toLowerCase() || '';
          const role = user.role?.toLowerCase() || '';
          const position = user.position?.toLowerCase() || '';
          const jobTitle = user.jobTitle?.toLowerCase() || '';
          const title = user.title?.toLowerCase() || '';

          const developerTerms = [
            'developer', 'programmer', 'coder', 'engineer', 'dev',
            'frontend', 'backend', 'fullstack', 'full-stack', 'software',
            'web developer', 'mobile developer', 'app developer',
            'software engineer', 'software developer'
          ];

          const designationMatch = designations.some((d: string) => 
            developerTerms.some(term => d.includes(term))
          );

          const explicitRoleMatch = developerTerms.some(term => 
            designation.includes(term) || 
            role.includes(term) || 
            position.includes(term) || 
            jobTitle.includes(term) || 
            title.includes(term)
          );

          return designationMatch || explicitRoleMatch;
        });

        console.log('Filtered developers:', developerUsers.length);

        // Transform users to DisplayProgrammer format
        const displayProgrammers: DisplayProgrammer[] = developerUsers.map((user: any) => {
          const userId = user._id?.$oid || user._id || user.id || Math.random().toString();
          
          const primaryDesignation = Array.isArray(user.designations) && user.designations.length > 0
            ? user.designations[0]
            : user.designation || user.role || user.position || user.jobTitle || user.title || 'Developer';

          return {
            id: userId,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Unknown Developer',
            email: user.email || 'No email provided',
            designation: primaryDesignation,
            bio: user.bio || user.description || 'Passionate developer creating amazing solutions',
            image: user.profileImage || user.picture || user.avatar || user.image || '/default-profile.png',
            skills: user.skills || user.technologies || user.designations || [],
            experience: user.experience || user.yearsOfExperience || 'Not specified',
            github: user.github || user.githubUrl || user.social?.github,
            linkedin: user.linkedin || user.linkedinUrl || user.social?.linkedin
          };
        });

        setProgrammers(displayProgrammers);

      } else {
        const errorData = await response.json();
        console.error('Failed to fetch programmers:', errorData?.error);
      }
    } catch (error: any) {
      console.error('Fetch programmers error:', error);
    } finally {
      setIsFetchingProgrammers(false);
    }
  };

  const getDesignationColor = (designation: string) => {
    const colors = {
      developer: 'from-blue-500 to-blue-700',
      designer: 'from-purple-500 to-purple-700',
      manager: 'from-emerald-500 to-emerald-700',
      tester: 'from-orange-500 to-orange-700',
      analyst: 'from-indigo-500 to-indigo-700',
      support: 'from-pink-500 to-pink-700',
      lead: 'from-rose-500 to-rose-700',
      architect: 'from-teal-500 to-teal-700',
      engineer: 'from-cyan-500 to-cyan-700',
      consultant: 'from-amber-500 to-amber-700',
      specialist: 'from-lime-500 to-lime-700',
      director: 'from-violet-500 to-violet-700',
    };

    const key = designation.toLowerCase();
    return colors[key as keyof typeof colors] || 'from-gray-500 to-gray-700';
  };

  const truncateBio = (bio: string, wordLimit: number = 25) => {
    const words = bio.split(' ');
    if (words.length <= wordLimit) return bio;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100 dark:from-blue-900/20 dark:via-slate-800 dark:to-transparent">
      {/* Inject custom scrollbar styles */}
      <style dangerouslySetInnerHTML={{ __html: customScrollbarStyles }} />
      
      <ModernFloatingElements />
      
      {/* Modern Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-200/40 via-transparent to-transparent dark:from-violet-900/20" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16"
        >
          {/* Enhanced Header Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl border border-white/30 dark:border-slate-700/40 shadow-2xl p-8 md:p-12 text-center mb-12 overflow-hidden"
          >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500" />
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-violet-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Enhanced Icon Section */}
            <div className="flex items-center justify-center mb-8 relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative p-6 bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl"
              >
                <Sparkles className="w-10 h-10 text-white relative z-10" />
                
                {/* Pulsing Ring */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-500 rounded-3xl"
                />
                
                {/* Orbiting Elements */}
                {[0, 120, 240].map((rotation, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                    style={{
                      top: '50%',
                      left: '50%',
                      transformOrigin: '0 0',
                    }}
                    animate={{
                      rotate: [rotation, rotation + 360],
                      x: [25, 25],
                      y: [-1.5, -1.5],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.5,
                    }}
                  />
                ))}
              </motion.div>
              
              {/* Floating Icons */}
              <motion.div
                animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 p-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl shadow-lg"
              >
                <Rocket className="w-4 h-4 text-white" />
              </motion.div>
              
              <motion.div
                animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-4 p-2 bg-gradient-to-r from-pink-400 to-rose-500 rounded-xl shadow-lg"
              >
                <Heart className="w-4 h-4 text-white" />
              </motion.div>
              
              <motion.div
                animate={{ y: [-5, 15, -5], rotate: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-0 left-12 p-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl shadow-lg"
              >
                <Target className="w-4 h-4 text-white" />
              </motion.div>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Meet Our
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Dream Team
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
              Talented professionals crafting extraordinary digital experiences with creativity and innovation
            </p>
            
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const teamSection = document.getElementById('team-section');
                  if (teamSection) {
                    teamSection.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }
                }}
                className="group px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex items-center gap-3 relative z-10">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <TrendingUp className="w-5 h-5" />
                  </motion.div>
                  Explore Team
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Modern Control Panel */}
      <section id="team-section" className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Modern Header with View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/30 shadow-xl p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Header Content */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Team Directory
                </h2>
                <p className="text-slate-600 dark:text-slate-300">
                  Discover our talented team members and their expertise
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-700/50 p-2 rounded-xl">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 cursor-pointer rounded-lg flex items-center gap-2 transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-600 shadow-md text-violet-600 dark:text-violet-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600/50'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Grid</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 cursor-pointer rounded-lg flex items-center gap-2 transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-slate-600 shadow-md text-violet-600 dark:text-violet-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600/50'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="text-sm font-medium">List</span>
                </motion.button>
              </div>

              {/* Search and Filter (placeholder for future implementation) */}
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    fetchTeamMembers();
                    // Add a small vibration for haptic feedback if available
                    if (window.navigator.vibrate) {
                      window.navigator.vibrate(50);
                    }
                  }}
                  className="p-3 bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-800/50 rounded-xl transition-all duration-200 group relative"
                  title="Refresh team members"
                >
                  {/* Loading indicator */}
                  {isFetching && (
                    <motion.div
                      className="absolute inset-0 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <svg className="animate-spin h-5 w-5 text-violet-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </motion.div>
                  )}
                  <motion.div
                    animate={{ rotate: isFetching ? 360 : 0 }}
                    transition={{ duration: 1, repeat: isFetching ? Infinity : 0, ease: "linear" }}
                  >
                    <Star className="w-5 h-5 text-violet-600 dark:text-violet-400 transform transition-transform duration-500 group-hover:scale-110" />
                  </motion.div>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Message Display */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-800/30 rounded-lg">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                  <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-800/30 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modern Team Display */}
        <div className="mb-12">
          <AnimatePresence mode="wait">
            {isFetching ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
                }
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/30 shadow-xl p-6"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </motion.div>
            ) : teamMembers.length > 0 ? (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Results Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Team Members
                    </h3>
                    <span className="px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-800 dark:text-violet-200 rounded-full text-sm font-semibold">
                      {teamMembers.length} members
                    </span>
                  </div>
                </div>

                {/* Team Grid/List */}
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }>
                  {teamMembers.map((member, index) => (
                    <motion.div
                      key={member.userId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="group"
                    >
                      <Link href={`/team/${member.userId}`}>
                        <div className={`
                          bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/30 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden
                          ${viewMode === 'list' ? 'flex items-center p-6' : 'p-6'}
                        `}>
                          {viewMode === 'grid' ? (
                            <>
                              {/* Grid Layout */}
                              <div className="text-center mb-6 relative">
                                <div className="relative inline-block group/avatar">
                                  <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border-4 border-white/50 dark:border-slate-700/50 shadow-lg group-hover:border-violet-400 transition-all duration-300 relative">
                                    <Image
                                      src={member.image}
                                      alt={member.name}
                                      width={96}
                                      height={96}
                                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                                      style={{ width: '100%', height: 'auto' }}
                                      onError={(e) => {
                                        e.currentTarget.src = '/default-profile.png';
                                      }}
                                    />
                                    
                                    {/* Hover Overlay */}
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      whileHover={{ opacity: 1 }}
                                      className="absolute inset-0 bg-gradient-to-t from-violet-600/80 via-purple-600/40 to-transparent flex items-end justify-center pb-2"
                                    >
                                      <motion.div
                                        initial={{ y: 10, opacity: 0 }}
                                        whileHover={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="flex gap-1"
                                      >
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          className="p-1 bg-white/20 rounded-full backdrop-blur-sm"
                                        >
                                          <Eye className="w-3 h-3 text-white" />
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          className="p-1 bg-white/20 rounded-full backdrop-blur-sm"
                                        >
                                          <MessageCircle className="w-3 h-3 text-white" />
                                        </motion.button>
                                      </motion.div>
                                    </motion.div>
                                  </div>
                                  
                                  {/* Status Indicators */}
                                  <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                                    <motion.div
                                      animate={{ scale: [1, 1.1, 1] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                      className="w-6 h-6 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                                    >
                                      <Star className="w-3 h-3 text-white" />
                                    </motion.div>
                                    
                                    {/* Online Status */}
                                    <motion.div
                                      animate={{ opacity: [0.5, 1, 0.5] }}
                                      transition={{ duration: 3, repeat: Infinity }}
                                      className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full border-2 border-white shadow-sm"
                                    />
                                  </div>
                                  
                                  {/* Skill Tags Preview */}
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileHover={{ opacity: 1, y: 0 }}
                                    className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 z-10"
                                  >
                                    {['React', 'TypeScript', 'Design'].slice(0, 2).map((skill, skillIndex) => (
                                      <span
                                        key={skill}
                                        className="px-2 py-1 text-xs font-medium bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-violet-600 dark:text-violet-400 rounded-full shadow-sm border border-violet-200 dark:border-violet-700"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </motion.div>
                                </div>
                              </div>
                              
                              <div className="text-center space-y-3">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors">
                                  {member.name}
                                </h3>
                                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${getDesignationColor(member.designation)} text-white shadow-lg`}>
                                  {member.role}
                                </span>
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-3">
                                  {truncateBio(member.description, 15)}
                                </p>
                              </div>
                              
                              <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                                {/* Social Media Links */}
                                <div className="flex items-center justify-center gap-3 mb-4">
                                  {[
                                    { icon: Mail, color: "from-blue-500 to-blue-600", label: "Email" },
                                    { icon: Linkedin, color: "from-blue-600 to-blue-700", label: "LinkedIn" },
                                    { icon: Github, color: "from-gray-700 to-gray-800", label: "GitHub" },
                                    { icon: Twitter, color: "from-sky-400 to-sky-500", label: "Twitter" }
                                  ].map((social, socialIndex) => (
                                    <motion.button
                                      key={social.label}
                                      whileHover={{ scale: 1.1, y: -2 }}
                                      whileTap={{ scale: 0.9 }}
                                      className={`p-2 rounded-xl bg-gradient-to-r ${social.color} text-white shadow-sm hover:shadow-md transition-all duration-200 opacity-80 hover:opacity-100`}
                                      title={social.label}
                                    >
                                      <social.icon className="w-3 h-3" />
                                    </motion.button>
                                  ))}
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex items-center justify-between">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-700 dark:text-violet-300 rounded-xl text-xs font-medium hover:shadow-sm transition-all duration-200"
                                  >
                                    <Eye className="w-3 h-3" />
                                    View Profile
                                  </motion.button>
                                  
                                  <div className="flex items-center gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                      <Heart className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                      <Share2 className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                                    </motion.button>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Modern List Layout */}
                              <div className="flex items-center gap-6 flex-1">
                                <div className="relative">
                                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white/50 dark:border-slate-700/50 shadow-lg group-hover:border-violet-400 transition-all duration-300">
                                    <Image
                                      src={member.image}
                                      alt={member.name}
                                      width={80}
                                      height={80}
                                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                                      style={{ width: '100%', height: 'auto' }}
                                      onError={(e) => {
                                        e.currentTarget.src = '/default-profile.png';
                                      }}
                                    />
                                    {/* Hover Overlay */}
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      whileHover={{ opacity: 1 }}
                                      className="absolute inset-0 bg-gradient-to-r from-violet-600/80 to-purple-600/80 flex items-center justify-center"
                                    >
                                      <Eye className="w-5 h-5 text-white" />
                                    </motion.div>
                                  </div>
                                  <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                                  >
                                    <Star className="w-3 h-3 text-white" />
                                  </motion.div>
                                </div>
                                
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors">
                                      {member.name}
                                    </h3>
                                    <motion.span 
                                      whileHover={{ scale: 1.05 }}
                                      className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getDesignationColor(member.designation)} text-white shadow-sm`}
                                    >
                                      {member.role}
                                    </motion.span>
                                  </div>
                                  
                                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                    {truncateBio(member.description, 25)}
                                  </p>
                                  
                                  {/* Skills Tags */}
                                  <div className="flex flex-wrap gap-2">
                                    {['TypeScript', 'React', 'Design'].map((skill, idx) => (
                                      <motion.span
                                        key={skill}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="px-2 py-1 text-xs font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-300 rounded-lg border border-violet-100 dark:border-violet-800"
                                      >
                                        {skill}
                                      </motion.span>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-800/50 transition-colors group/btn"
                                  >
                                    <Mail className="w-4 h-4 text-violet-600 dark:text-violet-400 group-hover/btn:scale-110 transition-transform" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-800/50 transition-colors group/btn"
                                  >
                                    <MessageCircle className="w-4 h-4 text-violet-600 dark:text-violet-400 group-hover/btn:scale-110 transition-transform" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors group/btn"
                                  >
                                    <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover/btn:scale-110 transition-transform" />
                                  </motion.button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-20"
              >
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/30 shadow-xl p-12 max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                    <Users className="w-10 h-10 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    No Team Members Found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">
                    Our team is growing! Check back soon.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Programmers Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg mr-4"
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </motion.div>
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Our <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Developers</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Meet the coding wizards behind our digital solutions
              </p>
            </div>
            
            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchProgrammers}
              className="ml-4 p-3 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 rounded-xl transition-all duration-200"
              title="Refresh Developers"
            >
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.button>
          </div>
        </motion.div>

        {isFetchingProgrammers ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-700/30">
                <Skeleton className="w-20 h-20 rounded-2xl mx-auto mb-4" />
                <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-3 w-1/2 mx-auto mb-4" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : programmers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-3xl flex items-center justify-center">
              <svg className="w-12 h-12 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Developers Found</h3>
            <p className="text-slate-600 dark:text-slate-400">
              We couldn't find any developers in the system at the moment.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {programmers.map((programmer, index) => (
              <motion.div
                key={programmer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-700/30 shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden border-4 border-white/50 dark:border-slate-700/50 shadow-lg group-hover:border-emerald-400 transition-all duration-300">
                      <Image
                        src={programmer.image}
                        alt={programmer.name}
                        width={80}
                        height={80}
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        style={{ width: '100%', height: 'auto' }}
                        onError={(e) => {
                          e.currentTarget.src = '/default-profile.png';
                        }}
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    {programmer.name}
                  </h3>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
                    {programmer.designation}
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-3">
                    {programmer.bio}
                  </p>
                  
                  {programmer.skills && programmer.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center mt-3">
                      {programmer.skills.slice(0, 3).map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {programmer.skills.length > 3 && (
                        <span className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                          +{programmer.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {programmer.github && (
                        <motion.a
                          href={programmer.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          <Github className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </motion.a>
                      )}
                      {programmer.linkedin && (
                        <motion.a
                          href={programmer.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                        >
                          <Linkedin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </motion.a>
                      )}
                      <motion.a
                        href={`mailto:${programmer.email}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
                      >
                        <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </motion.a>
                    </div>
                    
                    {programmer.experience && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {programmer.experience}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

const ModernFloatingElements = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    {/* Geometric Shapes */}
    <motion.div
      animate={{
        rotate: [0, 360],
        scale: [1, 1.2, 1],
        opacity: [0.1, 0.3, 0.1],
      }}
      transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[15%] left-[10%] w-32 h-32 bg-gradient-to-br from-violet-400/20 to-purple-400/20 dark:from-violet-600/10 dark:to-purple-600/10 rounded-3xl blur-xl"
    />
    
    <motion.div
      animate={{
        x: [0, 100, 0],
        y: [0, -50, 0],
        rotate: [0, 180, 360],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[30%] right-[15%] w-24 h-24 bg-gradient-to-br from-indigo-400/25 to-blue-400/25 dark:from-indigo-600/15 dark:to-blue-600/15 rounded-full blur-lg"
    />
    
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        rotate: [0, -180, 0],
        opacity: [0.15, 0.35, 0.15],
      }}
      transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-[20%] left-[20%] w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-600/10 dark:to-teal-600/10 rounded-2xl blur-2xl"
    />
    
    <motion.div
      animate={{
        x: [0, -80, 0],
        y: [0, 60, 0],
        scale: [1, 1.1, 1],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-[35%] right-[25%] w-28 h-28 bg-gradient-to-br from-pink-400/25 to-rose-400/25 dark:from-pink-600/15 dark:to-rose-600/15 rounded-full blur-xl"
    />
    
    {/* Floating Particles */}
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        animate={{
          y: [0, -30, 0],
          x: [0, Math.sin(i) * 20, 0],
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4 + i * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.3,
        }}
        className={`absolute w-2 h-2 bg-gradient-to-r from-violet-400 to-purple-400 dark:from-violet-500 dark:to-purple-500 rounded-full blur-sm`}
        style={{
          top: `${20 + (i * 8)}%`,
          left: `${15 + (i * 10)}%`,
        }}
      />
    ))}
    
    {/* Gradient Orbs */}
    <motion.div
      animate={{
        scale: [1, 1.4, 1],
        opacity: [0.1, 0.25, 0.1],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[5%] right-[5%] w-96 h-96 bg-gradient-radial from-violet-300/10 via-purple-300/5 to-transparent dark:from-violet-600/5 dark:via-purple-600/2 rounded-full blur-3xl"
    />
    
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.15, 0.3, 0.15],
      }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      className="absolute bottom-[10%] left-[5%] w-80 h-80 bg-gradient-radial from-indigo-300/10 via-blue-300/5 to-transparent dark:from-indigo-600/5 dark:via-blue-600/2 rounded-full blur-3xl"
    />
  </div>
);