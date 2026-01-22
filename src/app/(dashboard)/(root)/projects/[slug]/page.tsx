/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Github, DollarSign, Users, Mail, Sparkles, Target, BarChart3, ArrowRight, Cpu, Palette, ExternalLink, Clock, CheckCircle, XCircle, Share2, Heart, Eye, Download, TrendingUp, Zap, Star, MapPin, Building2, Code2, Rocket, Shield, Workflow } from "lucide-react";
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

// Enhanced status and priority mapping with more vibrant colors
const statusMap: Record<string, { label: string; color: string; darkColor: string; icon: React.ElementType }> = {
  planning: { label: "Planning", color: "bg-gradient-to-r from-[#7B8A9A] to-[#475569]", darkColor: "bg-gradient-to-r from-[#475569] to-[#1E3A4A]", icon: MapPin },
  "in-progress": { label: "In Progress", color: "bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8]", darkColor: "bg-gradient-to-r from-[#1E5AA8] to-[#0B1C2D]", icon: Workflow },
  completed: { label: "Completed", color: "bg-gradient-to-r from-[#6EE7D8] to-[#EEF7F6]/0", darkColor: "bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8]", icon: CheckCircle },
  onHold: { label: "On Hold", color: "bg-gradient-to-r from-[#6EE7D8] to-[#2FD1C5]", darkColor: "bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8]", icon: Clock },
  cancelled: { label: "Cancelled", color: "bg-gradient-to-r from-red-500 to-rose-500", darkColor: "bg-gradient-to-r from-red-600 to-rose-600", icon: XCircle },
};

const priorityMap: Record<string, { label: string; color: string; darkColor: string; icon: React.ElementType }> = {
  low: { label: "Low", color: "bg-gradient-to-r from-[#6EE7D8] to-[#EEF7F6]/0", darkColor: "bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8]", icon: TrendingUp },
  medium: { label: "Medium", color: "bg-gradient-to-r from-[#6EE7D8] to-[#2FD1C5]", darkColor: "bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8]", icon: BarChart3 },
  high: { label: "High", color: "bg-gradient-to-r from-[#2FD1C5] to-red-500", darkColor: "bg-gradient-to-r from-[#1E5AA8] to-red-600", icon: Zap },
  critical: { label: "Critical", color: "bg-gradient-to-r from-red-500 to-rose-500", darkColor: "bg-gradient-to-r from-red-600 to-rose-600", icon: Shield },
};

export default function DemoProjectPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [authorDetails, setAuthorDetails] = useState<User | null>(null);
  const [coAuthorDetails, setCoAuthorDetails] = useState<User[]>([]);
  const [clientDetails, setClientDetails] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const params = useParams();
  const slug = params?.slug as string;

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

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  }, []);

  // Simulate view count
  useEffect(() => {
    if (project) {
      setViewCount(Math.floor(Math.random() * 1000) + 100);
    }
  }, [project]);

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
                avatar: userData.avatar || userData.profileImage || null,
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
      <div className="relative min-h-screen overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(110,231,216,0.35),transparent_55%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_85%,rgba(30,90,168,0.25),transparent_55%)]"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2FD1C5]/60 to-transparent"></div>
        </div>
        <div className="relative min-h-screen flex items-center justify-center px-4">
          <div className="text-center p-8 bg-white/80 dark:bg-[#0B1C2D]/80 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md mx-auto border border-white/20">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#0F172A] dark:text-[#E6F1F5] mb-2">Error Loading Project</h2>
            <p className="text-[#475569] dark:text-[#9FB3C8] mb-6">{error || "Project or user data not found"}</p>
            <Button asChild className="bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] hover:from-[#1E5AA8] hover:to-[#0B1C2D] rounded-full px-6">
              <Link href="/projects">Back to Projects</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const completedMilestones = project.milestones.filter((m) => m.completed).length;
  const totalMilestones = project.milestones.length;
  const progressPercentage = calculateProgress(project.startDate, project.deadline);

  const isCompleted = project.status === "completed";
  const isOverdue = !isCompleted && progressPercentage >= 100;

  const StatusIcon = statusMap[project.status]?.icon || Sparkles;
  const PriorityIcon = priorityMap[project.priority]?.icon || Zap;

  return (
    <div className="relative min-h-screen overflow-hidden py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(110,231,216,0.35),transparent_55%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_85%,rgba(30,90,168,0.25),transparent_55%)]"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2FD1C5]/60 to-transparent"></div>
      </div>
      <div className="relative max-w-7xl mx-auto space-y-10">
        {/* Enhanced Header with Stats */}
        <div className="w-full space-y-6 animate-fade-in">
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge className={`${statusMap[project.status]?.color || 'bg-[#102A3A]'} text-white border-0 font-medium px-4 py-2 rounded-full flex items-center gap-2 shadow-lg`}>
              <StatusIcon className="h-4 w-4" />
              {statusMap[project.status]?.label || project.status}
            </Badge>
            <Badge className={`${priorityMap[project.priority]?.color || 'bg-[#102A3A]'} text-white border-0 font-medium px-4 py-2 rounded-full flex items-center gap-2 shadow-lg`}>
              <PriorityIcon className="h-4 w-4" />
              {priorityMap[project.priority]?.label || project.priority}
            </Badge>
            <Badge className="bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] text-white hover:from-[#1E5AA8] hover:to-[#0B1C2D] border-0 font-medium px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <Code2 className="h-4 w-4" />
              {project.category}
            </Badge>
            {project.featured && (
              <Badge className="bg-gradient-to-r from-[#6EE7D8] to-[#1E5AA8] text-white border-0 font-medium px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <Star className="h-4 w-4 fill-current" />
                Featured
              </Badge>
            )}
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold  dark:text-[#E6F1F5] tracking-tight bg-gradient-to-br from-[#050B14] to-[#102A3A] dark:from-white dark:to-[#DCEEEE] bg-clip-text text-transparent text-center">
            {project.title}
          </h1>

          <p className="text-xl text-[#475569] dark:text-[#9FB3C8] w-full leading-relaxed font-light text-left">
            {project.description}
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm text-[#7B8A9A] dark:text-[#7B8A9A]">
              <Eye className="h-4 w-4" />
              <span>{viewCount.toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#7B8A9A] dark:text-[#7B8A9A]">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(project.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#7B8A9A] dark:text-[#7B8A9A]">
              <Users className="h-4 w-4" />
              <span>{1 + coAuthorDetails.length} team members</span>
            </div>
          </div>
        </div>


        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            onClick={() => setIsLiked(!isLiked)}
            className={`rounded-full px-6 py-3 font-medium transition-all duration-300 ${isLiked
              ? 'bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] hover:from-[#1E5AA8] hover:to-[#0B1C2D] text-white shadow-lg shadow-[#2FD1C5]/25'
              : 'bg-white dark:bg-[#0B1C2D] text-[#475569] dark:text-[#9FB3C8] hover:bg-[#F7FBFC] dark:hover:bg-[#102A3A] border border-[#DCEEEE] dark:border-[#102A3A]'
              }`}
          >
            <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
            {isLiked ? 'Liked' : 'Like'}
          </Button>
          <Button className="rounded-full px-6 py-3 font-medium bg-white dark:bg-[#0B1C2D] text-[#475569] dark:text-[#9FB3C8] hover:bg-[#F7FBFC] dark:hover:bg-[#102A3A] border border-[#DCEEEE] dark:border-[#102A3A] transition-all duration-300">
            <Share2 className="h-5 w-5 mr-2" />
            Share
          </Button>
          <Button className="rounded-full px-6 py-3 font-medium bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] hover:from-[#1E5AA8] hover:to-[#0B1C2D] text-white shadow-lg shadow-[#2FD1C5]/25 transition-all duration-300">
            <Download className="h-5 w-5 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Main grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Project details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Project image with gradient overlay and floating elements */}
            <div className="relative group overflow-hidden rounded-3xl shadow-2xl dark:shadow-[#050B14]/30 transition-all duration-700 hover:shadow-3xl dark:hover:shadow-[#050B14]/50 hover:scale-[1.01]">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={project.imageUrl || "https://source.unsplash.com/1200x600/?technology,design"}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { e.currentTarget.src = "https://source.unsplash.com/1200x600/?technology,design"; }}
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050B14]/90 via-[#050B14]/30 to-transparent" />

                {/* Floating info cards */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-3">
                  <div className="bg-white/90 dark:bg-[#0B1C2D]/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#6EE7D8] animate-pulse"></div>
                      <span className="text-sm font-medium text-[#0F172A] dark:text-[#E6F1F5]">{statusMap[project.status]?.label}</span>
                    </div>
                  </div>
                  {project.budget && (
                    <div className="bg-white/90 dark:bg-[#0B1C2D]/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-[#1E5AA8] dark:text-[#2FD1C5]" />
                        <span className="text-sm font-medium text-[#0F172A] dark:text-[#E6F1F5]">
                          {project.budget.toLocaleString()} {project.currency}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Project links */}
                {(project.projectUrl || project.repoUrl) && (
                  <div className="absolute top-6 right-6 flex gap-3">
                    {project.projectUrl && (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white/90 dark:bg-[#0B1C2D]/90 backdrop-blur-sm rounded-xl hover:bg-white dark:hover:bg-[#102A3A] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
                        aria-label="View live demo"
                      >
                        <Rocket className="h-5 w-5 text-[#475569] dark:text-[#9FB3C8] group-hover:text-[#1E5AA8] dark:group-hover:text-[#6EE7D8] transition-colors" />
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white/90 dark:bg-[#0B1C2D]/90 backdrop-blur-sm rounded-xl hover:bg-white dark:hover:bg-[#102A3A] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
                        aria-label="View repository"
                      >
                        <Github className="h-5 w-5 text-[#475569] dark:text-[#9FB3C8] group-hover:text-[#0F172A] dark:group-hover:text-white transition-colors" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Project info cards with hover effects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-[#EEF7F6]/50 dark:from-[#0B1C2D] dark:to-[#0B1C2D]/80 backdrop-blur-sm rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] group">
                <CardContent className="p-7 relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#2FD1C5]/10 to-[#1E5AA8]/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                  <h2 className="text-xl font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-5 flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-[#2FD1C5] to-[#1E5AA8] rounded-2xl shadow-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    Timeline & Progress
                  </h2>
                  <div className="space-y-5 relative z-10">
                    {project.startDate && (
                      <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-[#102A3A]/50 rounded-xl border border-white/50 dark:border-[#1E3A4A]/50 backdrop-blur-sm">
                        <span className="text-[#475569] dark:text-[#9FB3C8]">Start Date</span>
                        <span className="font-semibold text-[#0F172A] dark:text-[#E6F1F5]">
                          {formatDate(project.startDate)}
                        </span>
                      </div>
                    )}
                    {project.deadline && (
                      <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-[#102A3A]/50 rounded-xl border border-white/50 dark:border-[#1E3A4A]/50 backdrop-blur-sm">
                        <span className="text-[#475569] dark:text-[#9FB3C8]">Deadline</span>
                        <span className="font-semibold text-[#0F172A] dark:text-[#E6F1F5]">
                          {formatDate(project.deadline)}
                        </span>
                      </div>
                    )}
                    <div className="pt-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-[#475569] dark:text-[#9FB3C8]">Project Progress</span>
                        <span className="text-sm font-bold text-[#0F172A] dark:text-[#E6F1F5]">
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                      <div className="relative">
                        <Progress
                          value={progressPercentage}
                          className={`h-3 rounded-full ${isOverdue ? 'bg-gradient-to-r from-[#1E5AA8] to-[#0B1C2D]' : 'bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8]'} shadow-inner`}
                        />
                        {isOverdue && (
                          <p className="text-[#1E5AA8] dark:text-[#6EE7D8] text-xs mt-2 flex items-center gap-2 font-medium">
                            <Clock className="h-3 w-3" />
                            Project is overdue
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-[#EEF7F6]/50 dark:from-[#0B1C2D] dark:to-[#0B1C2D]/80 backdrop-blur-sm rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] group">
                <CardContent className="p-7 relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#6EE7D8]/10 to-[#2FD1C5]/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                  <h2 className="text-xl font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-5 flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-[#6EE7D8] to-[#2FD1C5] rounded-2xl shadow-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    Budget & Payment
                  </h2>
                  <div className="space-y-5 relative z-10">
                    {project.budget && (
                      <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-[#102A3A]/50 rounded-xl border border-white/50 dark:border-[#1E3A4A]/50 backdrop-blur-sm">
                        <span className="text-[#475569] dark:text-[#9FB3C8]">Budget</span>
                        <span className="font-semibold text-[#0F172A] dark:text-[#E6F1F5]">
                          {project.budget.toLocaleString()} {project.currency}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-[#102A3A]/50 rounded-xl border border-white/50 dark:border-[#1E3A4A]/50 backdrop-blur-sm">
                      <span className="text-[#475569] dark:text-[#9FB3C8]">Contract Type</span>
                      <span className="font-semibold text-[#0F172A] dark:text-[#E6F1F5] capitalize">{project.contractType}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-[#102A3A]/50 rounded-xl border border-white/50 dark:border-[#1E3A4A]/50 backdrop-blur-sm">
                      <span className="text-[#475569] dark:text-[#9FB3C8]">Payment Status</span>
                      <Badge
                        className={`font-semibold border-none capitalize px-3 py-1 rounded-full ${project.paymentStatus === 'paid'
                          ? 'bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] text-white'
                          : project.paymentStatus === 'partial'
                            ? 'bg-gradient-to-r from-[#6EE7D8] to-[#2FD1C5] text-white'
                            : 'bg-gradient-to-r from-[#1E5AA8] to-[#0B1C2D] text-white'
                          }`}
                      >
                        {project.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Case Study */}
            {project.caseStudy && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6]/50 to-[#EEF7F6]/30 dark:from-[#050B14]/20 dark:via-[#0B1C2D]/10 dark:to-[#050B14]/10 backdrop-blur-sm rounded-3xl overflow-hidden group transition-all duration-500 hover:shadow-2xl">
                <CardContent className="p-8 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#F7FBFC]/10 to-[#EEF7F6]/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700"></div>
                  <h2 className="text-2xl font-bold text-[#0F172A] dark:text-[#E6F1F5] mb-6 flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-gradient-to-br from-[#F7FBFC]/0 to-[#EEF7F6]/0 rounded-2xl shadow-lg">
                      <BarChart3 className="h-7 w-7 text-white" />
                    </div>
                    Project Case Study
                  </h2>
                  <p className="text-[#475569] dark:text-[#9FB3C8] leading-relaxed text-lg relative z-10 font-light">
                    {project.caseStudy}
                  </p>
                  <Button className="mt-8 bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] hover:from-[#1E5AA8] hover:to-[#0B1C2D] rounded-full px-8 py-3 font-semibold text-white shadow-lg shadow-[#2FD1C5]/25 transition-all duration-300 hover:shadow-xl hover:scale-105 relative z-10">
                    Read Full Case Study
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Milestones */}
            {project.milestones && project.milestones.length > 0 && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-[#F7FBFC]/50 dark:from-[#0B1C2D] dark:to-[#0B1C2D]/80 backdrop-blur-sm rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl group">
                <CardContent className="p-8 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2FD1C5]/10 to-[#1E5AA8]/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                  <h2 className="text-2xl font-bold text-[#0F172A] dark:text-[#E6F1F5] mb-6 flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-gradient-to-br from-[#2FD1C5] to-[#1E5AA8] rounded-2xl shadow-lg">
                      <Target className="h-7 w-7 text-white" />
                    </div>
                    Project Milestones
                  </h2>
                  <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#475569] dark:text-[#9FB3C8] font-medium">
                        Completed {completedMilestones} of {totalMilestones} milestones
                      </span>
                      <span className="text-lg font-bold text-[#0F172A] dark:text-[#E6F1F5]">
                        {totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0}%
                      </span>
                    </div>
                    <Progress
                      value={totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0}
                      className="h-3 mb-8 bg-[#DCEEEE] dark:bg-[#102A3A] rounded-full shadow-inner"
                    />
                    <div className="space-y-5">
                      {project.milestones.map((milestone, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-5 p-5 rounded-2xl border border-[#DCEEEE]/60 dark:border-[#102A3A]/60 hover:border-[#6EE7D8] dark:hover:border-[#2FD1C5] transition-all duration-300 hover:shadow-lg bg-white/50 dark:bg-[#102A3A]/30 backdrop-blur-sm group/milestone"
                        >
                          <div
                            className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover/milestone:scale-110 ${milestone.completed
                              ? "bg-gradient-to-br from-[#6EE7D8] to-[#EEF7F6]/0"
                              : "bg-gradient-to-br from-[#9FB3C8] to-[#F7FBFC]/0"
                              }`}
                          >
                            {milestone.completed ? (
                              <CheckCircle className="h-6 w-6 text-white" />
                            ) : (
                              <Clock className="h-6 w-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3
                              className={`font-semibold text-lg ${milestone.completed
                                ? "text-[#1E5AA8] dark:text-[#2FD1C5]"
                                : "text-[#0F172A] dark:text-[#E6F1F5]"
                                }`}
                            >
                              {milestone.name}
                            </h3>
                            <p className="text-sm text-[#7B8A9A] dark:text-[#7B8A9A] mt-1">Due: {formatDate(milestone.date)}</p>
                          </div>
                          {milestone.completed ? (
                            <Badge className="bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] text-white hover:from-[#2FD1C5] hover:to-[#1E5AA8] border-none py-2 px-4 rounded-full font-semibold shadow-lg">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[#7B8A9A] dark:text-[#7B8A9A] dark:border-[#1E3A4A] py-2 px-4 rounded-full font-medium">
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
            {/* Enhanced Project links */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-[#F7FBFC]/50 dark:from-[#0B1C2D] dark:to-[#0B1C2D]/80 backdrop-blur-sm rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl group">
              <CardContent className="p-7">
                <h2 className="text-xl font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-6">Project Links</h2>
                <div className="space-y-4">
                  {project.projectUrl && (
                    <Button
                      className="w-full justify-between py-5 rounded-2xl border border-[#DCEEEE]/60 dark:border-[#102A3A]/60 bg-white/80 dark:bg-[#0B1C2D]/80 hover:bg-white dark:hover:bg-[#102A3A] text-[#0F172A] dark:text-[#E6F1F5] hover:text-[#0F172A] dark:hover:text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group/link"
                      asChild
                    >
                      <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-[#2FD1C5] to-[#1E5AA8] rounded-xl shadow-lg">
                            <Rocket className="h-5 w-5 text-white" />
                          </div>
                          <span className="font-semibold">Live Demo</span>
                        </div>
                        <ExternalLink className="h-5 w-5 group-hover/link:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  )}
                  {project.repoUrl && (
                    <Button
                      className="w-full justify-between py-5 rounded-2xl border border-[#DCEEEE]/60 dark:border-[#102A3A]/60 bg-white/80 dark:bg-[#0B1C2D]/80 hover:bg-white dark:hover:bg-[#102A3A] text-[#0F172A] dark:text-[#E6F1F5] hover:text-[#0F172A] dark:hover:text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group/link"
                      asChild
                    >
                      <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-[#102A3A] to-[#0B1C2D] rounded-xl shadow-lg">
                            <Github className="h-5 w-5 text-white" />
                          </div>
                          <span className="font-semibold">Repository</span>
                        </div>
                        <ExternalLink className="h-5 w-5 group-hover/link:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Author info */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-[#050B14] via-[#0B1C2D] to-[#050B14] dark:from-[#0B1C2D] dark:via-[#0B1C2D] dark:to-[#050B14] text-white rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl group">
              <CardContent className="p-7 relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#F7FBFC]/20 to-[#EEF7F6]/20 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700"></div>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-gradient-to-br from-[#F7FBFC]/0 to-[#EEF7F6]/0 rounded-xl shadow-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  Project Lead
                </h2>
                <div className="flex items-start gap-5 relative z-10">
                  <div className="relative flex flex-col items-center">
                    <div className="relative w-14 h-14 rounded-md bg-gradient-to-b from-[#F7FBFC]/0 via-[#1E5AA8] to-[#1E5AA8] p-0.5 shadow-lg shadow-[#050B14]/30">
                      <div className="w-full h-full rounded-md bg-[#050B14]/20 dark:bg-white/10 overflow-hidden flex items-stretch justify-center">
                        <Image
                          src={
                            isValidImageUrl(authorDetails?.avatar || "")
                              ? (authorDetails?.avatar as string)
                              : "https://source.unsplash.com/200x400/?portrait,professional"
                          }
                          alt={authorDetails?.name || "Author"}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-[#050B14]/70 bg-[#6EE7D8] shadow shadow-[#0B1C2D]/40" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{authorDetails.name}</h3>
                    <p className="text-[#9FB3C8] text-sm mt-2 line-clamp-3 font-light">{authorDetails.bio}</p>
                    <div className="flex flex-col gap-3 mt-4">
                      {authorDetails.email && (
                        <div className="flex items-center gap-3 text-sm text-[#9FB3C8]">
                          <Mail className="h-4 w-4" />
                          {authorDetails.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Team members */}
            {coAuthorDetails.length > 0 && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-[#EEF7F6]/30 dark:from-[#0B1C2D] dark:to-[#0B1C2D]/80 backdrop-blur-sm rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl group">
                <CardContent className="p-7 relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#2FD1C5]/10 to-[#1E5AA8]/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                  <h2 className="text-xl font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-6 flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-gradient-to-br from-[#2FD1C5] to-[#1E5AA8] rounded-xl shadow-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    Team Members ({coAuthorDetails.length})
                  </h2>
                  <div className="space-y-5 relative z-10">
                    {coAuthorDetails.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-[#102A3A]/40 backdrop-blur-sm border border-white/50 dark:border-[#1E3A4A]/50 hover:bg-white dark:hover:bg-[#102A3A] transition-all duration-300 hover:shadow-lg group/member"
                      >
                        <Image
                          src={
                            isValidImageUrl(member?.avatar || "")
                              ? (member?.avatar as string)
                              : "https://source.unsplash.com/100x100/?portrait"
                          }
                          alt={member?.name || "Team member"}
                          width={52}
                          height={52}
                          className="w-13 h-13 rounded-2xl object-cover shadow-md group-hover/member:scale-110 transition-transform duration-300"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#0F172A] dark:text-[#E6F1F5]">{member.name}</h3>
                          <p className="text-sm text-[#475569] dark:text-[#9FB3C8] line-clamp-2 font-light mt-1">{member.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Client info */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-[#EEF7F6]/30 dark:from-[#0B1C2D] dark:to-[#0B1C2D]/80 backdrop-blur-sm rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl group">
              <CardContent className="p-7 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#6EE7D8]/10 to-[#2FD1C5]/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                <h2 className="text-xl font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-6 flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-gradient-to-br from-[#6EE7D8] to-[#2FD1C5] rounded-xl shadow-lg">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  Client
                </h2>
                <div className="flex items-start gap-5 relative z-10">
                  <Image
                    src={
                      isValidImageUrl(clientDetails?.avatar || "")
                        ? (clientDetails?.avatar as string)
                        : "https://source.unsplash.com/100x100/?logo,company"
                    }
                    alt={clientDetails?.name || "Client"}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-2xl object-cover border border-[#DCEEEE] dark:border-[#102A3A] shadow-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0F172A] dark:text-[#E6F1F5]">{clientDetails.name}</h3>
                    <p className="text-sm text-[#475569] dark:text-[#9FB3C8] mt-2 line-clamp-3 font-light">{clientDetails.bio}</p>
                    <div className="flex flex-col gap-3 mt-4">
                      {clientDetails.email && (
                        <div className="flex items-center gap-3 text-sm text-[#475569] dark:text-[#9FB3C8]">
                          <Mail className="h-4 w-4" />
                          {clientDetails.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Tech stack */}
            {project.techStack.length > 0 && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-[#EEF7F6]/30 dark:from-[#0B1C2D] dark:to-[#0B1C2D]/80 backdrop-blur-sm rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl group">
                <CardContent className="p-7 relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#F7FBFC]/10 to-[#EEF7F6]/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                  <h2 className="text-xl font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-6 flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-gradient-to-br from-[#F7FBFC]/0 to-[#EEF7F6]/0 rounded-xl shadow-lg">
                      <Cpu className="h-5 w-5 text-white" />
                    </div>
                    Tech Stack ({project.techStack.length})
                  </h2>
                  <div className="flex flex-wrap gap-3 relative z-10">
                    {project.techStack.map((tech, index) => (
                      <Badge
                        key={index}
                        className="bg-gradient-to-br from-[#F7FBFC]/0 to-[#EEF7F6]/0 text-white hover:from-[#1E5AA8] hover:to-[#1E5AA8] border-none py-2 px-4 font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Tools */}
            {project.tools.length > 0 && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-[#EEF7F6]/30 dark:from-[#0B1C2D] dark:to-[#0B1C2D]/80 backdrop-blur-sm rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl group">
                <CardContent className="p-7 relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#6EE7D8]/10 to-[#2FD1C5]/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                  <h2 className="text-xl font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-6 flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-gradient-to-br from-[#2FD1C5] to-[#1E5AA8] rounded-xl shadow-lg">
                      <Palette className="h-5 w-5 text-white" />
                    </div>
                    Tools ({project.tools.length})
                  </h2>
                  <div className="flex flex-wrap gap-3 relative z-10">
                    {project.tools.map((tool, index) => (
                      <Badge
                        key={index}
                        className="bg-gradient-to-br from-[#2FD1C5] to-[#1E5AA8] text-white hover:from-[#1E5AA8] hover:to-[#0B1C2D] border-none py-2 px-4 font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
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

// Enhanced Skeleton component
function ProjectPageSkeleton() {
  return (
    <div className="relative min-h-screen overflow-hidden py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(110,231,216,0.35),transparent_55%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_85%,rgba(30,90,168,0.25),transparent_55%)]"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2FD1C5]/60 to-transparent"></div>
      </div>
      <div className="relative max-w-7xl mx-auto space-y-10">
        {/* Enhanced Header Skeleton */}
        <div className="text-center space-y-6">
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-full" />
          </div>
          <Skeleton className="h-16 w-3/4 mx-auto rounded-2xl" />
          <Skeleton className="h-6 w-1/2 mx-auto rounded-lg" />
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            <Skeleton className="h-4 w-24 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-lg" />
            <Skeleton className="h-4 w-28 rounded-lg" />
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex flex-wrap justify-center gap-4">
          <Skeleton className="h-12 w-32 rounded-full" />
          <Skeleton className="h-12 w-32 rounded-full" />
          <Skeleton className="h-12 w-36 rounded-full" />
        </div>

        {/* Enhanced Main grid layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="aspect-video rounded-3xl shadow-2xl h-[400px]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-[#0B1C2D]/80 backdrop-blur-sm rounded-3xl">
                <CardContent className="p-7 space-y-5">
                  <Skeleton className="h-7 w-2/3 rounded-lg" />
                  <Skeleton className="h-5 w-full rounded-xl" />
                  <Skeleton className="h-5 w-3/4 rounded-xl" />
                  <Skeleton className="h-3 w-full rounded-full" />
                </CardContent>
              </Card>
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-[#0B1C2D]/80 backdrop-blur-sm rounded-3xl">
                <CardContent className="p-7 space-y-5">
                  <Skeleton className="h-7 w-2/3 rounded-lg" />
                  <Skeleton className="h-5 w-full rounded-xl" />
                  <Skeleton className="h-5 w-3/4 rounded-xl" />
                  <Skeleton className="h-5 w-1/2 rounded-xl" />
                </CardContent>
              </Card>
            </div>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-[#F7FBFC] to-[#EEF7F6]/50 dark:from-[#050B14]/30 dark:to-[#0B1C2D]/20 rounded-3xl">
              <CardContent className="p-8 space-y-5">
                <Skeleton className="h-8 w-1/3 rounded-lg" />
                <Skeleton className="h-5 w-full rounded-lg" />
                <Skeleton className="h-5 w-5/6 rounded-lg" />
                <Skeleton className="h-5 w-3/4 rounded-lg" />
                <Skeleton className="h-12 w-1/4 rounded-full" />
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-[#0B1C2D]/80 rounded-3xl">
              <CardContent className="p-8 space-y-6">
                <Skeleton className="h-8 w-1/3 rounded-lg" />
                <Skeleton className="h-3 w-full rounded-full" />
                <div className="space-y-5">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex items-center gap-5">
                      <Skeleton className="w-12 h-12 rounded-2xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-1/2 rounded-lg" />
                        <Skeleton className="h-4 w-1/4 rounded-lg" />
                      </div>
                      <Skeleton className="h-7 w-24 rounded-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Enhanced Right column Skeleton */}
          <div className="space-y-8">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-[#0B1C2D]/80 rounded-3xl">
              <CardContent className="p-7 space-y-4">
                <Skeleton className="h-7 w-1/3 rounded-lg" />
                <Skeleton className="h-14 w-full rounded-2xl" />
                <Skeleton className="h-14 w-full rounded-2xl" />
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-[#050B14] to-[#0B1C2D] dark:from-[#0B1C2D] dark:to-[#050B14] rounded-3xl">
              <CardContent className="p-7 space-y-5">
                <Skeleton className="h-7 w-1/3 rounded-lg" />
                <div className="flex items-start gap-5">
                  <Skeleton className="w-16 h-16 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-1/2 rounded-lg" />
                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-1/3 rounded-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-[#0B1C2D]/80 rounded-3xl">
              <CardContent className="p-7 space-y-5">
                <Skeleton className="h-7 w-1/3 rounded-lg" />
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="w-13 h-13 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-1/2 rounded-lg" />
                      <Skeleton className="h-4 w-3/4 rounded-lg" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-[#0B1C2D]/80 rounded-3xl">
              <CardContent className="p-7 space-y-5">
                <Skeleton className="h-7 w-1/3 rounded-lg" />
                <div className="flex items-start gap-5">
                  <Skeleton className="w-16 h-16 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-1/2 rounded-lg" />
                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-1/3 rounded-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-[#0B1C2D]/80 rounded-3xl">
              <CardContent className="p-7 space-y-5">
                <Skeleton className="h-7 w-1/3 rounded-lg" />
                <div className="flex flex-wrap gap-3">
                  {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} className="h-8 w-24 rounded-xl" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-[#0B1C2D]/80 rounded-3xl">
              <CardContent className="p-7 space-y-5">
                <Skeleton className="h-7 w-1/3 rounded-lg" />
                <div className="flex flex-wrap gap-3">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-8 w-20 rounded-xl" />
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
