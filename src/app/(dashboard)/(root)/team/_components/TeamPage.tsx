/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface DisplayTeamMember {
  name: string;
  role: string;
  description: string;
  image: string;
  userId: string;
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
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8 } },
};

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<DisplayTeamMember[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const fetchTeamMembers = async () => {
    setIsFetching(true);
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

        const userPromises = teams.map((team: TeamMember) =>
          fetch(`/api/users/${team.userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }).then(async (res) => {
            if (res.ok) {
              const userData = await res.json();
              console.log(userData)
              return {
                userId: team.userId,
                firstName: userData.firstName || 'Unknown',
                lastName: userData.lastName || '',
                email: userData.email || 'N/A',
                bio: userData.bio || 'No bio available',
                profileImage: userData.avatar || '/default-profile.png', // Ensure fallback
                publicIdProfile: userData.publicIdProfile || null,
              };
            } else {
              return {
                userId: team.userId,
                firstName: 'Unknown',
                lastName: '',
                email: 'N/A',
                bio: 'No bio available',
                profileImage: '/default-profile.png', // Ensure fallback
                publicIdProfile: null,
              };
            }
          }).catch(() => ({
            userId: team.userId,
            firstName: 'Unknown',
            lastName: '',
            email: 'N/A',
            bio: 'No bio available',
            profileImage: '/default-profile.png', // Ensure fallback
            publicIdProfile: null,
          }))
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
          role: member.previousJobs[0]?.title || 'Team Member',
          description: member.bio || 'No description available',
          image: member.profileImage || '/default-profile.png', // Ensure fallback
          userId: member.slug || member.userId,
        }));

        setTeamMembers(displayMembers);
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

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12">
      <FloatingBlobs />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/40 to-transparent dark:from-blue-900/20 dark:to-transparent" />
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center"
        >
          <motion.h1
            variants={item}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Our Exceptional Team
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10"
          >
            Meet the brilliant minds who combine innovation with expertise to deliver extraordinary results.
          </motion.p>

          <motion.div variants={item}>
            <a
              href="#team"
              className="inline-flex items-center px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Scroll to team section"
            >
              Discover Our Team
              <motion.svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                whileHover={{ y: 2 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </motion.svg>
            </a>
          </motion.div>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="text-center mb-16"
        >
          <motion.h2
            variants={item}
            className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4"
          >
            The Minds Behind Our Success
          </motion.h2>
          <motion.p
            variants={item}
            className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Our diverse team combines creativity, technical expertise, and strategic vision to deliver outstanding results.
          </motion.p>
        </motion.div>

        <div id="team" className="mb-20">
          <AnimatePresence>
            {isFetching ? (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {Array.from({ length: 8 }).map((_, index) => (
                  <motion.div
                    key={index}
                    variants={item}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shadow-lg transition-all duration-300 h-full flex flex-col"
                  >
                    <Skeleton className="h-48 w-full" />
                    <div className="p-6 pt-4 mt-2 flex-grow space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : teamMembers.length > 0 ? (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {teamMembers.map((member) => (
                  <motion.div
                    key={member.userId}
                    variants={item}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <Link
                      href={`/team/${member.userId}`}
                      aria-label={`View profile of ${member.name}`}
                    >
                      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                        <div className="relative pt-8 px-8">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />
                          <div className="relative mx-auto h-40 w-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-md group-hover:border-blue-400 transition-all duration-300">
                            <Image
                              src={member.image}
                              alt={member.name}
                              width={160}
                              height={160}
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 160px"
                              onError={(e) => {
                                e.currentTarget.src = '/default-profile.png'; // Fallback on error
                              }}
                            />
                          </div>
                        </div>
                        <div className="p-6 pt-4 mt-2 flex-grow">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 mb-1">
                            {member.name}
                          </h3>
                          <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">
                            {member.role}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                            {member.description}
                          </p>
                        </div>
                        <div className="px-6 pb-6 flex justify-between items-center">
                          <span className="inline-block text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                            View Profile →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={fadeIn}
                className="text-center py-16"
              >
                <Users
                  className="mx-auto text-5xl text-gray-400 mb-6"
                  aria-label="Team placeholder icon"
                />
                <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Our Team is Growing
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Check back soon to meet our talented professionals!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

const FloatingBlobs = () => (
  <div className="fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden -z-10">
    <motion.div
      animate={{
        x: [0, 100, 0],
        y: [0, -80, 0],
        scale: [1, 1.1, 1],
        transition: { duration: 25, repeat: Infinity, ease: "easeInOut" },
      }}
      className="absolute top-[15%] -left-1/3 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-[80px]"
    />
    <motion.div
      animate={{
        x: [0, -100, 0],
        y: [0, 80, 0],
        scale: [1, 1.1, 1],
        transition: { duration: 30, repeat: Infinity, ease: "easeInOut" },
      }}
      className="absolute top-[15%] -right-1/3 w-[500px] h-[500px] bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-[80px]"
    />
    <motion.div
      animate={{
        x: [0, 60, 0],
        y: [0, 120, 0],
        scale: [1, 1.2, 1],
        transition: { duration: 35, repeat: Infinity, ease: "easeInOut" },
      }}
      className="absolute bottom-[10%] left-1/4 w-[400px] h-[400px] bg-pink-400/10 dark:bg-pink-600/5 rounded-full blur-[70px]"
    />
  </div>
);