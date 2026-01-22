/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import { Skeleton } from "@/components/ui/skeleton";

interface AuthorData {
  userId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  email?: string | null;
  bio: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Project {
  _id: string;
  title: string;
  author: Author;
  coAuthors?: string[];
  coAuthorDetails?: AuthorData[]; // Enriched co-author data
  client: Client;
  startDate?: string;
  deadline?: string;
  deliveryDate?: string;
  description: string;
  techStack?: string[];
  tools?: string[];
  category: string;
  status: string;
  priority: string;
  slug: string;
  imageUrl?: string;
  publicId?: string;
  projectUrl: string;
  repoUrl: string;
  deployment: string;
  budget?: number;
  currency: string;
  contractType: string;
  paymentStatus: string;
  featured: boolean;
  caseStudy: string;
  createdAt: string;
  updatedAt: string;
  date: string; // ✅ always string now
}

interface RawProject {
  _id: string;
  title: string;
  author: string;
  coAuthors?: string[];
  client: string;
  startDate?: string;
  deadline?: string;
  deliveryDate?: string;
  description: string;
  techStack?: string[];
  tools?: string[];
  category: string;
  status: string;
  priority: string;
  slug: string;
  imageUrl?: string;
  publicId?: string;
  projectUrl: string;
  repoUrl: string;
  deployment: string;
  budget?: number;
  currency: string;
  contractType: string;
  paymentStatus: string;
  featured: boolean;
  caseStudy: string;
  createdAt: string;
  updatedAt: string;
}

interface Author {
  userId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  profileImage?: string | null;
  email?: string | null;
  bio: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Client {
  userId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  profileImage?: string | null;
  email?: string | null;
  bio: string;
  createdAt?: string;
  updatedAt?: string;
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectsAndUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/projects?page=1&limit=100');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch projects (status: ${response.status})`);
        }
        const data = await response.json();
        const rawProjects: RawProject[] = Array.isArray(data.projects) ? data.projects : [];

        // Cache for authors
        const authorCache: { [key: string]: Author } = {};
        const uniqueAuthorIds = [...new Set(rawProjects.map(project => project.author).filter(Boolean))] as string[];

        for (const userId of uniqueAuthorIds) {
          try {
            const userResponse = await fetch(`/api/users/${userId}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              authorCache[userId] = {
                userId,
                name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown Author',
                avatar: userData.avatar && typeof userData.avatar === 'string' && userData.avatar.trim() !== '' ? userData.avatar : null,
                bio: userData.bio || 'No bio available',
              };
            } else {
              authorCache[userId] = { userId, name: 'Unknown Author', avatar: null, bio: 'No bio available' };
            }
          } catch {
            authorCache[userId] = { userId, name: 'Unknown Author', avatar: null, bio: 'No bio available' };
          }
        }

        // Cache for clients
        const clientCache: { [key: string]: Client } = {};
        const uniqueClientIds = [...new Set(rawProjects.map(project => project.client).filter(Boolean))] as string[];

        for (const userId of uniqueClientIds) {
          try {
            const clientResponse = await fetch(`/api/users/${userId}`);
            if (clientResponse.ok) {
              const clientData = await clientResponse.json();
              console.log(clientData)
              clientCache[userId] = {
                userId,
                firstName: clientData.firstName || '',
                lastName: clientData.lastName || '',
                name: `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim() || 'Unknown Client',
                avatar: clientData.avatar || clientData.profileImage || null,
                profileImage: clientData.profileImage || clientData.avatar || null,
                email: clientData.email || null,
                bio: clientData.bio || 'No bio available',
                createdAt: clientData.createdAt,
                updatedAt: clientData.updatedAt,
              };
            } else {
              clientCache[userId] = { userId, name: 'Unknown Client', avatar: null, bio: 'No bio available' };
            }
          } catch {
            clientCache[userId] = { userId, name: 'Unknown Client', avatar: null, bio: 'No bio available' };
          }
        }

        const statusMap: { [key: string]: string } = {
          ongoing: 'in-progress',
        };

        // Fetch co-author details for projects that have co-authors
        const projectsWithCoAuthors = await Promise.all(
          rawProjects.map(async (project) => {
            let coAuthorDetails: AuthorData[] = [];
            
            if (project.coAuthors && project.coAuthors.length > 0) {
              coAuthorDetails = await Promise.all(
                project.coAuthors.map(async (coAuthorId) => {
                  if (authorCache[coAuthorId]) {
                    return authorCache[coAuthorId];
                  }
                  
                  try {
                    const coAuthorResponse = await fetch(`/api/users/${coAuthorId}`);
                    if (coAuthorResponse.ok) {
                      const coAuthorData = await coAuthorResponse.json();
                      return {
                        userId: coAuthorId,
                        firstName: coAuthorData.firstName || '',
                        lastName: coAuthorData.lastName || '',
                        name: `${coAuthorData.firstName || ''} ${coAuthorData.lastName || ''}`.trim() || 'Unknown Co-Author',
                        avatar: coAuthorData.avatar || coAuthorData.profileImage || null,
                        email: coAuthorData.email || null,
                        bio: coAuthorData.bio || 'No bio available',
                        createdAt: coAuthorData.createdAt,
                        updatedAt: coAuthorData.updatedAt,
                      };
                    }
                  } catch (error) {
                    console.error(`Failed to fetch co-author ${coAuthorId}:`, error);
                  }
                  
                  return {
                    userId: coAuthorId,
                    name: 'Unknown Co-Author',
                    avatar: null,
                    email: null,
                    bio: 'No bio available',
                  };
                })
              );
            }
            
            return {
              ...project,
              coAuthorDetails,
            };
          })
        );

        const mappedProjects: Project[] = projectsWithCoAuthors.map(project => ({
          ...project,
          title: project.title || 'Untitled',
          description: project.description || '',
          category: project.category || 'General',
          techStack: project.techStack || [],
          projectUrl: project.projectUrl || '',
          repoUrl: project.repoUrl || '',
          deployment: project.deployment || '',
          status: statusMap[project.status] || project.status,
          author: authorCache[project.author] || { userId: project.author || 'unknown', name: 'Unknown Author', firstName: '', lastName: '', avatar: null, bio: 'No bio available' },
          client: clientCache[project.client] || { userId: project.client || 'unknown', name: 'Unknown Client', firstName: '', lastName: '', avatar: null, bio: 'No bio available' },
          date: project.startDate || project.createdAt || new Date().toISOString(), // ✅ always a string
        }));

        setProjects(mappedProjects);
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
        setError(errorMessage);
        console.error('Fetch projects error:', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjectsAndUsers();
  }, []);

  useEffect(() => {
    setFilteredProjects(filter === 'all' ? projects : projects.filter(project => project.featured));
  }, [filter, projects]);

  return (
    <div className="relative min-h-screen overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(110,231,216,0.35),transparent_55%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_85%,rgba(30,90,168,0.25),transparent_55%)]"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2FD1C5]/60 to-transparent"></div>
      </div>
      <style jsx global>{`
        .skeleton-pulse {
          background: linear-gradient(
            90deg,
            rgba(230, 247, 246, 0.8) 0%,
            rgba(220, 238, 238, 0.9) 50%,
            rgba(230, 247, 246, 0.8) 100%
          );
          background-size: 200% 100%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .dark .skeleton-pulse {
          background: linear-gradient(
            90deg,
            rgba(16, 42, 58, 0.7) 0%,
            rgba(11, 28, 45, 0.85) 50%,
            rgba(16, 42, 58, 0.7) 100%
          );
          background-size: 200% 100%;
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

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Banner */}
        <div className="relative bg-white/85 dark:bg-[#0B1C2D]/60 backdrop-blur-xl border border-[#DCEEEE] dark:border-[#102A3A] text-[#0F172A] dark:text-[#E6F1F5] py-12 px-6 md:px-10 lg:px-20 flex flex-col md:flex-row items-start md:items-center justify-between rounded-2xl mb-12 shadow-xl dark:shadow-2xl">
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#1E5AA8] via-[#2FD1C5] to-[#6EE7D8] dark:from-[#6EE7D8] dark:via-[#2FD1C5] dark:to-[#1E5AA8]">
              Looking for a collaboration? <br className="hidden sm:block" /> Get Started Today!
            </h1>
            <p className="text-[#475569] dark:text-[#9FB3C8] mt-4 text-sm sm:text-base max-w-2xl">
              Join us for exciting opportunities and collaborations that can grow your business. Let&apos;s innovate together!
            </p>
          </div>
          <button className="relative z-10 bg-gradient-to-r from-[#2FD1C5] via-[#1E5AA8] to-[#0B1C2D] hover:from-[#1E5AA8] hover:via-[#0B1C2D] hover:to-[#050B14] text-white font-semibold py-4 px-8 rounded-xl self-start md:self-auto mt-6 md:mt-0 transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-[#2FD1C5]/25 dark:hover:shadow-[#1E5AA8]/25">
            <span className="flex items-center gap-2">
              Get Started Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2FD1C5]/15 dark:from-[#6EE7D8]/15 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#1E5AA8]/15 dark:from-[#2FD1C5]/15 to-transparent rounded-full blur-xl" />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {isLoading ? (
            <>
              <Skeleton className="py-3 px-8 rounded-xl h-12 w-32" />
              <Skeleton className="py-3 px-8 rounded-xl h-12 w-40" />
            </>
          ) : (
            <>
              <button
                className={`py-3 px-8 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${filter === 'all'
                    ? 'bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] text-white shadow-lg shadow-[#2FD1C5]/25 dark:shadow-[#1E5AA8]/25'
                    : 'bg-[#EEF7F6] dark:bg-[#0B1C2D] text-[#475569] dark:text-[#9FB3C8] hover:bg-[#DCEEEE] dark:hover:bg-[#102A3A] border border-[#DCEEEE] dark:border-[#102A3A]'
                  }`}
                onClick={() => setFilter('all')}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  All Projects ({projects.length})
                </span>
              </button>
              <button
                className={`py-3 px-8 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${filter === 'featured'
                    ? 'bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] text-white shadow-lg shadow-[#2FD1C5]/25 dark:shadow-[#1E5AA8]/25'
                    : 'bg-[#EEF7F6] dark:bg-[#0B1C2D] text-[#475569] dark:text-[#9FB3C8] hover:bg-[#DCEEEE] dark:hover:bg-[#102A3A] border border-[#DCEEEE] dark:border-[#102A3A]'
                  }`}
                onClick={() => setFilter('featured')}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Featured Projects ({projects.filter(p => p.featured).length})
                </span>
              </button>
            </>
          )}
        </div>

        {/* Projects Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1E5AA8] via-[#2FD1C5] to-[#6EE7D8] dark:from-[#6EE7D8] dark:via-[#2FD1C5] dark:to-[#1E5AA8] mb-4">
              Our Projects
            </h2>
            <p className="text-[#475569] dark:text-[#9FB3C8] text-lg max-w-2xl mx-auto">
              Explore our diverse portfolio of innovative projects that showcase our expertise in modern web development and cutting-edge technologies.
            </p>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="relative bg-gradient-to-br from-[#F7FBFC] via-[#FFFFFF] to-[#EEF7F6] dark:from-[#0B1C2D] dark:via-[#102A3A] dark:to-[#0B1C2D] border border-[#DCEEEE] dark:border-[#102A3A] rounded-xl overflow-hidden h-96"
                >
                  <div className="w-full h-48 skeleton-pulse" />
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-sm skeleton-pulse" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-24 rounded skeleton-pulse" />
                          <Skeleton className="h-4 w-32 rounded skeleton-pulse" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full skeleton-pulse" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-3/4 rounded skeleton-pulse" />
                      <Skeleton className="h-4 w-full rounded skeleton-pulse" />
                      <Skeleton className="h-4 w-2/3 rounded skeleton-pulse" />
                    </div>
                    <Skeleton className="h-4 w-48 rounded skeleton-pulse" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-20 rounded-md skeleton-pulse" />
                      <Skeleton className="h-6 w-20 rounded-md skeleton-pulse" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-lg skeleton-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#475569] dark:text-[#9FB3C8] px-4">
              <div className="w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-[#6EE7D8]/20 to-[#1E5AA8]/20 dark:from-[#1E5AA8]/20 dark:to-[#6EE7D8]/20 rounded-full flex items-center justify-center">
                <svg className="w-10 sm:w-12 h-10 sm:h-12 text-[#7B8A9A] dark:text-[#9FB3C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-2">Error</h3>
              <p className="text-sm sm:text-base text-[#475569] dark:text-[#9FB3C8]">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={{
                    ...project,
                    status:
                      project.status === "active" ||
                        project.status === "completed" ||
                        project.status === "in-progress"
                        ? project.status
                        : undefined,
                  }}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-[#6EE7D8]/20 to-[#1E5AA8]/20 dark:from-[#1E5AA8]/20 dark:to-[#6EE7D8]/20 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-[#7B8A9A] dark:text-[#9FB3C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-2">No projects found</h3>
              <p className="text-[#475569] dark:text-[#9FB3C8]">Try adjusting your filters or check back later for new projects.</p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <div className="relative bg-white/85 dark:bg-[#0B1C2D]/60 backdrop-blur-xl border border-[#DCEEEE] dark:border-[#102A3A] rounded-3xl p-12 overflow-hidden shadow-xl dark:shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2FD1C5]/15 dark:from-[#6EE7D8]/15 to-transparent rounded-full blur-xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#1E5AA8]/15 dark:from-[#2FD1C5]/15 to-transparent rounded-full blur-xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] dark:text-[#E6F1F5] mb-6">
                Ready to Start Your Project?
              </h2>
              <p className="text-[#475569] dark:text-[#9FB3C8] mb-8 max-w-2xl mx-auto text-lg">
                Let&apos;s collaborate to bring your ideas to life with cutting-edge technology and modern design. Our team is ready to turn your vision into reality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-[#2FD1C5] via-[#1E5AA8] to-[#0B1C2D] rounded-xl hover:from-[#1E5AA8] hover:via-[#0B1C2D] hover:to-[#050B14] transition-all duration-300 transform hover:scale-105 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-[#2FD1C5]/25 dark:hover:shadow-[#1E5AA8]/25">
                  <span className="flex items-center gap-3">
                    Start Your Project
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </button>
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-[#475569] dark:text-[#9FB3C8] bg-[#EEF7F6] dark:bg-[#0B1C2D] border border-[#DCEEEE] dark:border-[#102A3A] rounded-xl hover:bg-[#DCEEEE] dark:hover:bg-[#102A3A] transition-all duration-300 transform hover:scale-105">
                  <span className="flex items-center gap-3">
                    View Our Process
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
