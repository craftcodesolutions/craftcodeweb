"use client";

import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StatsData {
  totalOrders: number;
  totalUsers: number;
  pendingOrders: number;
  completedOrders: number;
}

interface OrderData {
  order_status: string;
}

export default function DemographicCard() {
  const [stats, setStats] = useState<StatsData>({
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
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
          throw new Error('Failed to fetch data');
        }

        const ordersData = await ordersResponse.json();
        const usersData = await usersResponse.json();

        const totalOrders = ordersData.total || 0;
        const totalUsers = usersData.users?.length || 0;
        
        // Calculate pending and completed orders
        const pendingOrders = ordersData.orders?.filter((order: OrderData) => 
          order.order_status === 'pending' || order.order_status === 'processing'
        ).length || 0;
        
        const completedOrders = ordersData.orders?.filter((order: OrderData) => 
          order.order_status === 'delivered'
        ).length || 0;

        setStats({
          totalOrders,
          totalUsers,
          pendingOrders,
          completedOrders,
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load statistics';
        setError(errorMessage);
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="rounded-sm border border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-950/90 p-5 shadow-xl transition-all duration-300 sm:p-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Business Statistics
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
              Business Statistics
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
            Business Statistics
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Overview of orders and customers
          </p>
        </div>
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
              onClick={() => {}} // Add view more logic here
            >
              View More
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex w-full font-normal text-left text-gray-700 dark:text-gray-200 rounded-sm hover:bg-amber-100/50 dark:hover:bg-amber-900/30 px-2 py-1.5 cursor-pointer focus:outline-none"
              onClick={() => {}} // Add delete logic here
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                Total Orders
              </p>
              <span className="block text-xs text-gray-600 dark:text-gray-300">
                {stats.totalOrders} Orders
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
                Pending Orders
              </p>
              <span className="block text-xs text-gray-600 dark:text-gray-300">
                {stats.pendingOrders} Orders
              </span>
            </div>
          </div>
          <div className="flex w-full max-w-[140px] items-center gap-3">
            <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200/50 dark:bg-gray-700/50">
              <div 
                className="absolute left-0 top-0 h-full rounded-sm bg-amber-500 dark:bg-amber-400"
                style={{ width: `${stats.totalOrders > 0 ? (stats.pendingOrders / stats.totalOrders) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.totalOrders > 0 ? Math.round((stats.pendingOrders / stats.totalOrders) * 100) : 0}%
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
                Completed Orders
              </p>
              <span className="block text-xs text-gray-600 dark:text-gray-300">
                {stats.completedOrders} Orders
              </span>
            </div>
          </div>
          <div className="flex w-full max-w-[140px] items-center gap-3">
            <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200/50 dark:bg-gray-700/50">
              <div 
                className="absolute left-0 top-0 h-full rounded-sm bg-amber-500 dark:bg-amber-400"
                style={{ width: `${stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}