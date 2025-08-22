"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Users, Package, ArrowUp, ArrowDown } from "lucide-react";

interface MetricsData {
  totalUsers: number;
  totalOrders: number;
  userGrowth: number;
  orderGrowth: number;
}

export const EcommerceMetrics = () => {
  const [metrics, setMetrics] = useState<MetricsData>({
    totalUsers: 0,
    totalOrders: 0,
    userGrowth: 0,
    orderGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        
        // Fetch orders data
        const ordersResponse = await fetch('/api/orders?limit=1000', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          },
        });
        
        // Fetch users data
        const usersResponse = await fetch('/api/users?limit=1000', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          },
        });

        if (!ordersResponse.ok || !usersResponse.ok) {
          throw new Error('Failed to fetch metrics data');
        }

        const ordersData = await ordersResponse.json();
        const usersData = await usersResponse.json();

        const totalOrders = ordersData.total || 0;
        const totalUsers = usersData.users?.length || 0;
        
        // Placeholder growth percentages
        const userGrowth = 11.01;
        const orderGrowth = -9.05;

        setMetrics({
          totalUsers,
          totalOrders,
          userGrowth,
          orderGrowth,
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
            <Package className="w-6 h-6 text-gray-900 dark:text-white" aria-hidden="true" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Orders
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

      {/* Metric Item - Orders */}
      <div className="rounded-sm border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-950/90 p-5 shadow-xl transition-all duration-300 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-50/50 dark:bg-gray-900/50 rounded-sm">
          <Package className="w-6 h-6 text-gray-900 dark:text-white" aria-hidden="true" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Orders
            </span>
            <h4 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
              {metrics.totalOrders.toLocaleString()}
            </h4>
          </div>
          <Badge 
            className={metrics.orderGrowth >= 0 
              ? "bg-amber-200/80 text-amber-800 dark:bg-amber-800/60 dark:text-amber-200" 
              : "bg-red-100/30 text-red-600 dark:bg-red-900/30 dark:text-red-400"}
            aria-label={`${Math.abs(metrics.orderGrowth)}% ${metrics.orderGrowth >= 0 ? 'increase' : 'decrease'}`}
          >
            {metrics.orderGrowth >= 0 ? (
              <ArrowUp className="w-4 h-4 mr-1" aria-hidden="true" />
            ) : (
              <ArrowDown className="w-4 h-4 mr-1" aria-hidden="true" />
            )}
            {Math.abs(metrics.orderGrowth)}%
          </Badge>
        </div>
      </div>
    </div>
  );
};