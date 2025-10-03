"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowUp, ArrowDown } from "lucide-react";

interface MetricsData {
  totalUsers: number;
  totalProjects: number;
  userGrowth: number;
  projectGrowth: number;
}

export const EcommerceMetrics = () => {
  const [metrics, setMetrics] = useState<MetricsData>({
    totalUsers: 0,
    totalProjects: 0,
    userGrowth: 0,
    projectGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        
        // Fetch projects data
        const projectsResponse = await fetch('/api/projects?limit=1000');
        
        // Fetch users data
        const usersResponse = await fetch('/api/users?limit=1000');

        if (!projectsResponse.ok || !usersResponse.ok) {
          throw new Error('Failed to fetch metrics data');
        }

        const projectsData = await projectsResponse.json();
        const usersData = await usersResponse.json();

        const totalProjects = projectsData.projects?.length || 0;
        const totalUsers = usersData.users?.length || 0;
        
        // Calculate growth based on recent data
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Calculate user growth
        const recentUsers = usersData.users?.filter((user: { createdAt: string }) => 
          new Date(user.createdAt) >= lastMonth
        ).length || 0;
        const previousUsers = totalUsers - recentUsers;
        const userGrowth = previousUsers > 0 ? ((recentUsers / previousUsers) * 100) : 0;
        
        // Calculate project growth
        const recentProjects = projectsData.projects?.filter((project: { createdAt: string }) => 
          new Date(project.createdAt) >= currentMonth
        ).length || 0;
        const previousProjects = totalProjects - recentProjects;
        const projectGrowth = previousProjects > 0 ? ((recentProjects / previousProjects) * 100) : 0;

        setMetrics({
          totalUsers,
          totalProjects,
          userGrowth: Math.round(userGrowth * 100) / 100,
          projectGrowth: Math.round(projectGrowth * 100) / 100,
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load metrics';
        setError(errorMessage);
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        <div className="rounded-sm border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-950/90 p-5 shadow-xl transition-all duration-300 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-50/50 dark:bg-gray-900/50 rounded-sm">
            <Users className="w-6 h-6 text-gray-900 dark:text-white" aria-hidden="true" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Customers
              </span>
              <h4 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                Loading...
              </h4>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-950/90 p-5 shadow-xl transition-all duration-300 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-50/50 dark:bg-gray-900/50 rounded-sm">
            <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Projects
              </span>
              <h4 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                Loading...
              </h4>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        <div className="rounded-sm border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-950/90 p-5 shadow-xl transition-all duration-300 md:p-6">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Metric Item - Customers */}
      <div className="rounded-sm border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-950/90 p-5 shadow-xl transition-all duration-300 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-50/50 dark:bg-gray-900/50 rounded-sm">
          <Users className="w-6 h-6 text-gray-900 dark:text-white" aria-hidden="true" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Customers
            </span>
            <h4 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
              {metrics.totalUsers.toLocaleString()}
            </h4>
          </div>
          <Badge 
            className={metrics.userGrowth >= 0 
              ? "bg-amber-200/80 text-amber-800 dark:bg-amber-800/60 dark:text-amber-200" 
              : "bg-red-100/30 text-red-600 dark:bg-red-900/30 dark:text-red-400"}
            aria-label={`${Math.abs(metrics.userGrowth)}% ${metrics.userGrowth >= 0 ? 'increase' : 'decrease'}`}
          >
            {metrics.userGrowth >= 0 ? (
              <ArrowUp className="w-4 h-4 mr-1" aria-hidden="true" />
            ) : (
              <ArrowDown className="w-4 h-4 mr-1" aria-hidden="true" />
            )}
            {Math.abs(metrics.userGrowth)}%
          </Badge>
        </div>
      </div>

      {/* Metric Item - Projects */}
      <div className="rounded-sm border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-950/90 p-5 shadow-xl transition-all duration-300 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-50/50 dark:bg-gray-900/50 rounded-sm">
          <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Projects
            </span>
            <h4 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
              {metrics.totalProjects.toLocaleString()}
            </h4>
          </div>
          <Badge 
            className={metrics.projectGrowth >= 0 
              ? "bg-amber-200/80 text-amber-800 dark:bg-amber-800/60 dark:text-amber-200" 
              : "bg-red-100/30 text-red-600 dark:bg-red-900/30 dark:text-red-400"}
            aria-label={`${Math.abs(metrics.projectGrowth)}% ${metrics.projectGrowth >= 0 ? 'increase' : 'decrease'}`}
          >
            {metrics.projectGrowth >= 0 ? (
              <ArrowUp className="w-4 h-4 mr-1" aria-hidden="true" />
            ) : (
              <ArrowDown className="w-4 h-4 mr-1" aria-hidden="true" />
            )}
            {Math.abs(metrics.projectGrowth)}%
          </Badge>
        </div>
      </div>
    </div>
  );
};