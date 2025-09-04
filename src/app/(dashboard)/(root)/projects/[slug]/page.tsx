/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Github, Globe, DollarSign, Users, Mail, Sparkles, Target, BarChart3, ArrowRight, FolderGit2, Cpu, Palette, ExternalLink, Clock, CheckCircle, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";

// Define interfaces matching the API response and ProjectsPage
interface Milestone {
  name: string;
  completed: boolean;
  date: string;
}

interface User {
  userId: string;
  name: string;
  avatar?: string | null;
  email?: string | null;
  bio: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Project {
  _id: string;
  title: string;
  author: string;
  coAuthors: string[];
  client: string;
  startDate?: string | null;
  deadline?: string | null;
  deliveryDate?: string | null;
  description: string;
  techStack: string[];
  tools: string[];
  category: string;
  status: string;
  priority: string;
  slug: string;
  imageUrl?: string | null;
  publicId?: string | null;
  projectUrl: string;
  repoUrl: string;
  deployment: string;
  budget?: number | null;
  currency: string;
  contractType: string;
  paymentStatus: string;
  featured: boolean;
  caseStudy: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

// Status and Priority mapping for better UI representation
const statusMap: Record<string, { label: string; color: string; darkColor: string }> = {
  planning: { label: "Planning", color: "bg-gray-500", darkColor: "bg-gray-600" },
  "in-progress": { label: "In Progress", color: "bg-blue-500", darkColor: "bg-blue-600" },
  completed: { label: "Completed", color: "bg-green-500", darkColor: "bg-green-600" },
  onHold: { label: "On Hold", color: "bg-yellow-500", darkColor: "bg-yellow-600" },
  cancelled: { label: "Cancelled", color: "bg-red-500", darkColor: "bg-red-600" },
};

const priorityMap: Record<string, { label: string; color: string; darkColor: string }> = {
  low: { label: "Low", color: "bg-green-500", darkColor: "bg-green-600" },
  medium: { label: "Medium", color: "bg-yellow-500", darkColor: "bg-yellow-600" },
  high: { label: "High", color: "bg-orange-500", darkColor: "bg-orange-600" },
  critical: { label: "Critical", color: "bg-red-500", darkColor: "bg-red-600" },
};

export default function DemoProjectPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [authorDetails, setAuthorDetails] = useState<User | null>(null);
  const [coAuthorDetails, setCoAuthorDetails] = useState<User[]>([]);
  const [clientDetails, setClientDetails] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const slug = params.slug as string;

  // Function to validate image URL
  const isValidImageUrl = useCallback((url: string | null | undefined): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Format date for display
  const formatDate = useCallback((dateString: string | null | undefined): string => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Calculate progress
  const calculateProgress = useCallback((startDate?: string | null, deadline?: string | null) => {
    if (!startDate || !deadline) return 0;
    const start = new Date(startDate);
    const end = new Date(deadline);
    const now = new Date();
    
    // Handle cases where dates might be invalid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    // Prevent negative progress or progress over 100%
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  }, []);

  // Fetch project and all user details
  useEffect(() => {
    const fetchProjectAndUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch project data
        const projectResponse = await fetch(`/api/projects/slug/${slug}`);
        if (!projectResponse.ok) {
          const errorData = await projectResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch project (status: ${projectResponse.status})`);
        }
        const projectData: Project = await projectResponse.json();
        setProject(projectData);

        // Collect all unique user IDs (author, co-authors, client)
        const uniqueUserIds = [...new Set([projectData.author, ...projectData.coAuthors, projectData.client])].filter(id => id);

        // Fetch all users in parallel
        const userPromises = uniqueUserIds.map(async (userId) => {
          try {
            const userResponse = await fetch(`/api/users/${userId}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              return {
                userId,
                name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown User',
                avatar: userData.avatar && typeof userData.avatar === 'string' && userData.avatar.trim() !== '' ? userData.avatar : null,
                email: userData.email && typeof userData.email === 'string' ? userData.email : null,
                bio: userData.bio || 'No bio available',
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt,
              };
            } else {
              console.warn(`User ${userId} not found or unauthorized, status: ${userResponse.status}`);
              return {
                userId,
                name: 'Unknown User',
                avatar: null,
                email: null,
                bio: 'No bio available',
                createdAt: undefined,
                updatedAt: undefined,
              };
            }
          } catch (userError) {
            console.error(`Failed to fetch user ${userId}:`, userError instanceof Error ? userError.message : 'Unknown error');
            return {
              userId,
              name: 'Unknown User',
              avatar: null,
              email: null,
              bio: 'No bio available',
              createdAt: undefined,
              updatedAt: undefined,
            };
          }
        });

        const userData = await Promise.all(userPromises);

        // Create a mapping of userId to user data
        const userMap = userData.reduce((acc, user) => {
          acc[user.userId] = user;
          return acc;
        }, {} as Record<string, User>);

        // Set user details
        setAuthorDetails(userMap[projectData.author] || {
          userId: projectData.author,
          name: 'Unknown Author',
          avatar: null,
          email: null,
          bio: 'No bio available',
        });
        
        setCoAuthorDetails(projectData.coAuthors.map(id => userMap[id] || {
          userId: id,
          name: 'Unknown Co-Author',
          avatar: null,
          email: null,
          bio: 'No bio available',
        }));
        
        setClientDetails(userMap[projectData.client] || {
          userId: projectData.client,
          name: 'Unknown Client',
          avatar: null,
          email: null,
          bio: 'No bio available',
        });

      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProjectAndUsers();
    } else {
      setError("Project slug is missing");
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return <ProjectPageSkeleton />;
  }

  if (error || !project || !authorDetails || !clientDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg max-w-md mx-auto">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Error Loading Project</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">{error || "Project or user data not found"}</p>
          <Button asChild>
            <Link href="/projects">Back to Projects</Link>
          </Button>
        </div>
      </div>
    );
  }

  const completedMilestones = project.milestones.filter((m) => m.completed).length;
  const totalMilestones = project.milestones.length;
  const progressPercentage = calculateProgress(project.startDate, project.deadline);
  
  // Check if project is completed
  const isCompleted = project.status === "completed";
  const isOverdue = !isCompleted && progressPercentage >= 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex justify-center gap-2 mb-4">
            <Badge className={`${statusMap[project.status]?.color || 'bg-gray-500'} text-white border-0 font-medium px-3 py-1`}>
              {statusMap[project.status]?.label || project.status}
            </Badge>
            <Badge className={`${priorityMap[project.priority]?.color || 'bg-gray-500'} text-white border-0 font-medium px-3 py-1`}>
              {priorityMap[project.priority]?.label || project.priority}
            </Badge>
            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 border-none font-medium px-3 py-1">
              {project.category}
            </Badge>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            {project.title}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Main grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Project details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project image with elegant overlay */}
            <div className="relative group overflow-hidden rounded-2xl shadow-2xl dark:shadow-slate-900/30 transition-all duration-700 hover:shadow-3xl dark:hover:shadow-slate-900/50">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={project.imageUrl || "https://source.unsplash.com/1000x500/?technology"}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = "https://source.unsplash.com/1000x500/?technology"; }}
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                
                {/* Project links positioned on image */}
                {(project.projectUrl || project.repoUrl) && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    {project.projectUrl && (
                      <a 
                        href={project.projectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-md"
                        aria-label="View live demo"
                      >
                        <ExternalLink className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                      </a>
                    )}
                    {project.repoUrl && (
                      <a 
                        href={project.repoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-md"
                        aria-label="View repository"
                      >
                        <Github className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Project info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-slate-900/30">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                      <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    Timeline
                  </h2>
                  <div className="space-y-4">
                    {project.startDate && (
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <span className="text-slate-600 dark:text-slate-300">Start Date</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {formatDate(project.startDate)}
                        </span>
                      </div>
                    )}
                    {project.deadline && (
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <span className="text-slate-600 dark:text-slate-300">Deadline</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {formatDate(project.deadline)}
                        </span>
                      </div>
                    )}
                    {project.deliveryDate && (
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <span className="text-slate-600 dark:text-slate-300">Delivery Date</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {formatDate(project.deliveryDate)}
                        </span>
                      </div>
                    )}
                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600 dark:text-slate-300">Progress</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                      <Progress
                        value={progressPercentage}
                        className={`h-2 ${isOverdue ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                      />
                      {isOverdue && (
                        <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Project is overdue
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-slate-900/30">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    Budget & Payment
                  </h2>
                  <div className="space-y-4">
                    {project.budget && (
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <span className="text-slate-600 dark:text-slate-300">Budget</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {project.budget.toLocaleString()} {project.currency}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <span className="text-slate-600 dark:text-slate-300">Contract Type</span>
                      <span className="font-medium text-slate-900 dark:text-white capitalize">{project.contractType}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <span className="text-slate-600 dark:text-slate-300">Payment Status</span>
                      <Badge 
                        className={`${
                          project.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' 
                            : project.paymentStatus === 'partial'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                        } border-none capitalize`}
                      >
                        {project.paymentStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <span className="text-slate-600 dark:text-slate-300">Deployment</span>
                      <span className="font-medium text-slate-900 dark:text-white capitalize">{project.deployment}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Case Study */}
            {project.caseStudy && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50/50 dark:from-indigo-900/30 dark:to-blue-900/20 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    Case Study
                  </h2>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                    {project.caseStudy}
                  </p>
                  <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 rounded-full px-6 py-2 font-medium">
                    Read Full Case Study
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Milestones */}
            {project.milestones && project.milestones.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                      <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    Project Milestones
                  </h2>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-600 dark:text-slate-300">
                        Completed {completedMilestones} of {totalMilestones} milestones
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0}%
                      </span>
                    </div>
                    <Progress
                      value={totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0}
                      className="h-2 mb-8 bg-slate-200 dark:bg-slate-700"
                    />
                    <div className="space-y-6">
                      {project.milestones.map((milestone, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-5 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors"
                        >
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${milestone.completed
                              ? "bg-green-100 dark:bg-green-900/40"
                              : "bg-slate-100 dark:bg-slate-700"
                              } transition-colors`}
                          >
                            {milestone.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <Clock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3
                              className={`font-medium text-lg ${milestone.completed ? "text-green-700 dark:text-green-400" : "text-slate-900 dark:text-white"
                                }`}
                            >
                              {milestone.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Due: {formatDate(milestone.date)}</p>
                          </div>
                          {milestone.completed ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60 border-none py-1 px-3">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-500 dark:text-slate-400 dark:border-slate-600">
                              Upcoming
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column - People and tech info */}
          <div className="space-y-8">
            {/* Project links */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-5">Project Links</h2>
                <div className="space-y-4">
                  {project.projectUrl && (
                    <Button
                      className="w-full justify-between py-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white hover:text-slate-900 dark:hover:text-white shadow-sm transition-colors"
                      asChild
                    >
                      <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span>Live Demo</span>
                        </div>
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                  {project.repoUrl && (
                    <Button
                      className="w-full justify-between py-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white hover:text-slate-900 dark:hover:text-white shadow-sm transition-colors"
                      asChild
                    >
                      <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                            <Github className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                          </div>
                          <span>Repository</span>
                        </div>
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Author info */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-300" />
                  Project Lead
                </h2>
                <div className="flex items-start gap-4">
                  <Image
                    src={
                      isValidImageUrl(authorDetails?.avatar || "")
                        ? (authorDetails?.avatar as string)
                        : "https://source.unsplash.com/100x100/?portrait"
                    }
                    alt={authorDetails?.name || "Author"}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-white/20"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{authorDetails.name}</h3>
                    <p className="text-indigo-200 text-sm mt-1 line-clamp-3">{authorDetails.bio}</p>
                    <div className="flex flex-col gap-2 mt-4">
                      {authorDetails.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Mail className="h-4 w-4" />
                          {authorDetails.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team members */}
            {coAuthorDetails.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Team Members ({coAuthorDetails.length})
                  </h2>
                  <div className="space-y-5">
                    {coAuthorDetails.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Image
                          src={
                            isValidImageUrl(member?.avatar || "")
                              ? (member?.avatar as string)
                              : "https://source.unsplash.com/100x100/?portrait"
                          }
                          alt={member?.name || "Team member"}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900 dark:text-white">{member.name}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{member.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Client info */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <div className="p-1 bg-emerald-100 dark:bg-emerald-900/40 rounded">
                    <FolderGit2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Client
                </h2>
                <div className="flex items-start gap-4">
                  <Image
                    src={
                      isValidImageUrl(clientDetails?.avatar || "")
                        ? (clientDetails?.avatar as string)
                        : "https://source.unsplash.com/100x100/?logo"
                    }
                    alt={clientDetails?.name || "Client"}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-white">{clientDetails.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-3">{clientDetails.bio}</p>
                    <div className="flex flex-col gap-2 mt-4">
                      {clientDetails.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Mail className="h-4 w-4" />
                          {clientDetails.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tech stack */}
            {project.techStack.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                    <div className="p-1 bg-indigo-100 dark:bg-indigo-900/40 rounded">
                      <Cpu className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    Tech Stack ({project.techStack.length})
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech, index) => (
                      <Badge
                        key={index}
                        className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 border-none py-1.5 px-3 font-medium rounded-lg transition-colors"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tools */}
            {project.tools.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                    <div className="p-1 bg-rose-100 dark:bg-rose-900/40 rounded">
                      <Palette className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </div>
                    Tools ({project.tools.length})
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {project.tools.map((tool, index) => (
                      <Badge
                        key={index}
                        className="bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/60 border-none py-1.5 px-3 font-medium rounded-lg transition-colors"
                      >
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}

// Skeleton component for loading state
function ProjectPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-2 mb-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-10 w-3/4 mx-auto rounded-lg" />
          <Skeleton className="h-6 w-1/2 mx-auto rounded-lg" />
        </div>

        {/* Main grid layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="aspect-video rounded-2xl shadow-2xl h-[360px]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-1/3 rounded-lg" />
                  <Skeleton className="h-4 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4 rounded-lg" />
                  <Skeleton className="h-2 w-full rounded-lg" />
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-1/3 rounded-lg" />
                  <Skeleton className="h-4 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-1/2 rounded-lg" />
                </CardContent>
              </Card>
            </div>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50/50 dark:from-indigo-900/30 dark:to-blue-900/20 rounded-2xl">
              <CardContent className="p-8 space-y-4">
                <Skeleton className="h-8 w-1/3 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-5/6 rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-10 w-1/4 rounded-full" />
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 rounded-2xl">
              <CardContent className="p-8 space-y-6">
                <Skeleton className="h-8 w-1/3 rounded-lg" />
                <Skeleton className="h-2 w-full rounded-lg" />
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex items-center gap-5">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/2 rounded-lg" />
                        <Skeleton className="h-4 w-1/4 rounded-lg" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-lg" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Right column Skeleton */}
          <div className="space-y-8">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-1/3 rounded-lg" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-1/3 rounded-lg" />
                <div className="flex items-start gap-4">
                  <Skeleton className="w-14 h-14 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/2 rounded-lg" />
                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-1/3 rounded-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-1/3 rounded-lg" />
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/2 rounded-lg" />
                      <Skeleton className="h-4 w-3/4 rounded-lg" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-1/3 rounded-lg" />
                <div className="flex items-start gap-4">
                  <Skeleton className="w-14 h-14 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/2 rounded-lg" />
                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-1/3 rounded-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-1/3 rounded-lg" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} className="h-6 w-20 rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-1/3 rounded-lg" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-6 w-20 rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}