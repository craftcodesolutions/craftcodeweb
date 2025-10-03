"use client";

import { MoreHorizontal, RefreshCw } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StatsData {
  totalProjects: number;
  totalUsers: number;
  ongoingProjects: number;
  completedProjects: number;
  pausedProjects: number;
  cancelledProjects: number;
  totalMilestones: number;
  completedMilestones: number;
  averageProjectProgress: number;
  recentProjectsCount: number;
}

interface Project {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  milestones?: Array<{
    name: string;
    completed: boolean;
    date: string;
  }>;
}


export default function DemographicCard() {
  const [stats, setStats] = useState<StatsData>({
    totalProjects: 0,
    totalUsers: 0,
    ongoingProjects: 0,
    completedProjects: 0,
    pausedProjects: 0,
    cancelledProjects: 0,
    totalMilestones: 0,
    completedMilestones: 0,
    averageProjectProgress: 0,
    recentProjectsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Fetch projects and users data in parallel
      const [projectsResponse, usersResponse] = await Promise.all([
        fetch('/api/projects?limit=1000'),
        fetch('/api/users?limit=1000')
      ]);

      if (!projectsResponse.ok) {
        throw new Error(`Projects API error: ${projectsResponse.status}`);
      }
      if (!usersResponse.ok) {
        throw new Error(`Users API error: ${usersResponse.status}`);
      }

      const [projectsData, usersData] = await Promise.all([
        projectsResponse.json(),
        usersResponse.json()
      ]);

      // Validate data structure
      const projects = Array.isArray(projectsData.projects) ? projectsData.projects : [];
      const users = Array.isArray(usersData.users) ? usersData.users : [];

      const totalProjects = projects.length;
      const totalUsers = users.length;
      
      // Calculate project statistics by status with safe filtering
      const ongoingProjects = projects.filter((project: Project) => 
        project && project.status === 'ongoing'
      ).length;
      
      const pausedProjects = projects.filter((project: Project) => 
        project && project.status === 'paused'
      ).length;
      
      const cancelledProjects = projects.filter((project: Project) => 
        project && project.status === 'cancelled'
      ).length;
      
      const completedProjects = projects.filter((project: Project) => {
        if (!project) return false;
        
        // Check if status is completed
        if (project.status === 'completed') return true;
        
        // Check if all milestones are completed
        if (project.milestones && Array.isArray(project.milestones) && project.milestones.length > 0) {
          return project.milestones.every(milestone => 
            milestone && typeof milestone.completed === 'boolean' && milestone.completed
          );
        }
        
        return false;
      }).length;

      // Calculate milestone statistics and project progress with safe handling
      let totalMilestones = 0;
      let completedMilestones = 0;
      let totalProgress = 0;
      let projectsWithMilestones = 0;
      
      projects.forEach((project: Project) => {
        if (project && project.milestones && Array.isArray(project.milestones) && project.milestones.length > 0) {
          totalMilestones += project.milestones.length;
          
          const projectCompletedMilestones = project.milestones.filter(milestone => 
            milestone && typeof milestone.completed === 'boolean' && milestone.completed
          ).length;
          
          completedMilestones += projectCompletedMilestones;
          
          // Calculate individual project progress
          const projectProgress = (projectCompletedMilestones / project.milestones.length) * 100;
          totalProgress += projectProgress;
          projectsWithMilestones++;
        }
      });
      
      const averageProjectProgress = projectsWithMilestones > 0 ? totalProgress / projectsWithMilestones : 0;
      
      // Calculate recent projects (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentProjectsCount = projects.filter((project: Project) => {
        if (!project || !project.createdAt) return false;
        const projectDate = new Date(project.createdAt);
        return projectDate >= thirtyDaysAgo;
      }).length;

      setStats({
        totalProjects,
        totalUsers,
        ongoingProjects,
        completedProjects,
        pausedProjects,
        cancelledProjects,
        totalMilestones,
        completedMilestones,
        averageProjectProgress: Math.round(averageProjectProgress * 10) / 10,
        recentProjectsCount,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load statistics';
      setError(errorMessage);
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    fetchStats(true);
  };

  if (loading) {
    return (
      <div className="rounded-sm border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-950/90 p-5 shadow-xl transition-all duration-300 sm:p-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Project Statistics
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Loading statistics...
            </p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-950/90 p-5 shadow-xl transition-all duration-300 sm:p-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Project Statistics
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Error loading data
            </p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-950/90 p-5 shadow-xl transition-all duration-300 sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Project Statistics
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Overview of projects, users, and milestones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 transition-colors duration-200"
            aria-label="Refresh statistics"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="More options"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
              >
                <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 p-2 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-sm shadow-xl">
              <DropdownMenuItem
                className="flex w-full font-normal text-left text-gray-700 dark:text-gray-200 rounded-sm hover:bg-amber-100/50 dark:hover:bg-amber-900/30 px-2 py-1.5 cursor-pointer focus:outline-none"
                onClick={handleRefresh}
              >
                Refresh Data
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex w-full font-normal text-left text-gray-700 dark:text-gray-200 rounded-sm hover:bg-amber-100/50 dark:hover:bg-amber-900/30 px-2 py-1.5 cursor-pointer focus:outline-none"
                onClick={() => {}} // Add export logic here
              >
                Export Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="space-y-5 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Total Projects
              </p>
              <span className="block text-xs text-gray-600 dark:text-gray-300">
                {stats.totalProjects} Projects
              </span>
            </div>
          </div>
          <div className="flex w-full max-w-[140px] items-center gap-3">
            <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200/50 dark:bg-gray-700/50">
              <div className="absolute left-0 top-0 h-full w-[100%] rounded-sm bg-amber-500 dark:bg-amber-400"></div>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              100%
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Total Users
              </p>
              <span className="block text-xs text-gray-600 dark:text-gray-300">
                {stats.totalUsers} Customers
              </span>
            </div>
          </div>
          <div className="flex w-full max-w-[140px] items-center gap-3">
            <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200/50 dark:bg-gray-700/50">
              <div className="absolute left-0 top-0 h-full w-[100%] rounded-sm bg-amber-500 dark:bg-amber-400"></div>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              100%
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Ongoing Projects
              </p>
              <span className="block text-xs text-gray-600 dark:text-gray-300">
                {stats.ongoingProjects} Projects
              </span>
            </div>
          </div>
          <div className="flex w-full max-w-[140px] items-center gap-3">
            <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200/50 dark:bg-gray-700/50">
              <div 
                className="absolute left-0 top-0 h-full rounded-sm bg-amber-500 dark:bg-amber-400"
                style={{ width: `${stats.totalProjects > 0 ? Math.min((stats.ongoingProjects / stats.totalProjects) * 100, 100) : 0}%` }}
              ></div>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.totalProjects > 0 ? Math.round((stats.ongoingProjects / stats.totalProjects) * 100) : 0}%
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Completed Projects
              </p>
              <span className="block text-xs text-gray-600 dark:text-gray-300">
                {stats.completedProjects} Projects
              </span>
            </div>
          </div>
          <div className="flex w-full max-w-[140px] items-center gap-3">
            <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200/50 dark:bg-gray-700/50">
              <div 
                className="absolute left-0 top-0 h-full rounded-sm bg-amber-500 dark:bg-amber-400"
                style={{ width: `${stats.totalProjects > 0 ? Math.min((stats.completedProjects / stats.totalProjects) * 100, 100) : 0}%` }}
              ></div>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Paused Projects
              </p>
              <span className="block text-xs text-gray-600 dark:text-gray-300">
                {stats.pausedProjects} Projects
              </span>
            </div>
          </div>
          <div className="flex w-full max-w-[140px] items-center gap-3">
            <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200/50 dark:bg-gray-700/50">
              <div 
                className="absolute left-0 top-0 h-full rounded-sm bg-orange-500 dark:bg-orange-400"
                style={{ width: `${stats.totalProjects > 0 ? Math.min((stats.pausedProjects / stats.totalProjects) * 100, 100) : 0}%` }}
              ></div>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.totalProjects > 0 ? Math.round((stats.pausedProjects / stats.totalProjects) * 100) : 0}%
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Cancelled Projects
              </p>
              <span className="block text-xs text-gray-600 dark:text-gray-300">
                {stats.cancelledProjects} Projects
              </span>
            </div>
          </div>
          <div className="flex w-full max-w-[140px] items-center gap-3">
            <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200/50 dark:bg-gray-700/50">
              <div 
                className="absolute left-0 top-0 h-full rounded-sm bg-red-500 dark:bg-red-400"
                style={{ width: `${stats.totalProjects > 0 ? Math.min((stats.cancelledProjects / stats.totalProjects) * 100, 100) : 0}%` }}
              ></div>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.totalProjects > 0 ? Math.round((stats.cancelledProjects / stats.totalProjects) * 100) : 0}%
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Total Milestones
              </p>
              <span className="block text-xs text-gray-600 dark:text-gray-300">
                {stats.totalMilestones} Milestones
              </span>
            </div>
          </div>
          <div className="flex w-full max-w-[140px] items-center gap-3">
            <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200/50 dark:bg-gray-700/50">
              <div 
                className="absolute left-0 top-0 h-full rounded-sm bg-amber-500 dark:bg-amber-400"
                style={{ width: `${stats.totalMilestones > 0 ? Math.min((stats.completedMilestones / stats.totalMilestones) * 100, 100) : 0}%` }}
              ></div>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.totalMilestones > 0 ? Math.round((stats.completedMilestones / stats.totalMilestones) * 100) : 0}%
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Avg Project Progress
              </p>
              <span className="block text-xs text-gray-600 dark:text-gray-300">
                {stats.averageProjectProgress.toFixed(1)}% Complete
              </span>
            </div>
          </div>
          <div className="flex w-full max-w-[140px] items-center gap-3">
            <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200/50 dark:bg-gray-700/50">
              <div 
                className="absolute left-0 top-0 h-full rounded-sm bg-green-500 dark:bg-green-400"
                style={{ width: `${Math.min(stats.averageProjectProgress, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.averageProjectProgress.toFixed(1)}%
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Recent Projects
              </p>
              <span className="block text-xs text-gray-600 dark:text-gray-300">
                {stats.recentProjectsCount} Last 30 Days
              </span>
            </div>
          </div>
          <div className="flex w-full max-w-[140px] items-center gap-3">
            <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200/50 dark:bg-gray-700/50">
              <div 
                className="absolute left-0 top-0 h-full rounded-sm bg-blue-500 dark:bg-blue-400"
                style={{ width: `${stats.totalProjects > 0 ? Math.min((stats.recentProjectsCount / stats.totalProjects) * 100, 100) : 0}%` }}
              ></div>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.totalProjects > 0 ? Math.round((stats.recentProjectsCount / stats.totalProjects) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}