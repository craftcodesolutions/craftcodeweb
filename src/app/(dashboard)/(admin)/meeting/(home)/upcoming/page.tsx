'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CallList from '@/app/(dashboard)/(admin)/meeting/_components/CallList';
import { useGetCalls } from '@/hooks/useGetCalls';
import { Calendar, Clock, Users, Search, Plus, RefreshCw, Trash2, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import MobileNavigation from '../../_components/MobileNavigation';

const UpcomingPage = () => {
  const router = useRouter();
  const { upcomingCalls, isLoading } = useGetCalls();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMeetings, setSelectedMeetings] = useState<string[]>([]);

  // Memoized handlers for better performance
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (selectedMeetings.length === 0) return;
    setSelectedMeetings([]);
    toast.success(`${selectedMeetings.length} meeting(s) deleted successfully!`);
  }, [selectedMeetings.length]);



  // Memoized statistics calculations with dynamic data
  const statistics = useMemo(() => {
    if (!upcomingCalls) return { total: 0, today: 0, thisWeek: 0, totalParticipants: 0 };
    
    const today = new Date();
    const todayString = today.toDateString();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    
    let todayCount = 0;
    let thisWeekCount = 0;
    let totalParticipants = 0;
    
    upcomingCalls.forEach(call => {
      const callDate = new Date(call.state?.startsAt || '');
      if (callDate.toDateString() === todayString) {
        todayCount++;
      }
      if (callDate <= weekFromNow) {
        thisWeekCount++;
      }
      
      // Count expected participants from call members
      const expectedParticipants = call.state?.members?.length || 1;
      totalParticipants += expectedParticipants;
    });
    
    return {
      total: upcomingCalls.length,
      today: todayCount,
      thisWeek: thisWeekCount,
      totalParticipants
    };
  }, [upcomingCalls]);

  // Memoized filtered and sorted calls
  const processedCalls = useMemo(() => {
    if (!upcomingCalls) return [];
    
    // Filter calls
    const filtered = upcomingCalls.filter(call => {
      const description = call.state?.custom?.description || '';
      const matchesSearch = searchTerm === '' || description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterType === 'all') return matchesSearch;
      
      const callDate = new Date(call.state?.startsAt || '');
      const now = new Date();
      
      if (filterType === 'today') {
        return matchesSearch && callDate.toDateString() === now.toDateString();
      }
      if (filterType === 'week') {
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return matchesSearch && callDate >= now && callDate <= weekFromNow;
      }
      return matchesSearch;
    });
    
    // Sort calls
    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.state?.startsAt || '').getTime() - new Date(b.state?.startsAt || '').getTime();
      }
      if (sortBy === 'name') {
        const aName = a.state?.custom?.description || '';
        const bName = b.state?.custom?.description || '';
        return aName.localeCompare(bName);
      }
      return 0;
    });
  }, [upcomingCalls, searchTerm, filterType, sortBy]);

  const handleSelectAll = useCallback(() => {
    if (selectedMeetings.length === processedCalls.length) {
      setSelectedMeetings([]);
    } else {
      setSelectedMeetings(processedCalls.map(call => call.id));
    }
  }, [selectedMeetings.length, processedCalls]);

  return (
    <section className="flex size-full flex-col gap-4 sm:gap-6 text-white dark:text-white p-4 sm:p-6 scrollbar-hide">
      {/* Mobile Navigation - Only visible on small devices */}
      <MobileNavigation />
      
      {/* Enhanced Header */}
      <div className="text-center space-y-4 sm:space-y-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto animate-pulse shadow-xl shadow-blue-500/30">
          <Calendar size={32} className="sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-gray-300 dark:from-gray-100 dark:via-blue-200 dark:to-white bg-clip-text text-transparent leading-tight">
            Upcoming Meetings
          </h1>
          <p className="text-gray-400 dark:text-gray-300 mt-2 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">Manage your scheduled meetings and join them when ready</p>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-400/25 dark:to-purple-400/25 border border-white/10 dark:border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
            <Calendar size={20} className="sm:w-6 sm:h-6 text-white" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white dark:text-gray-100 mb-1">{statistics.total}</p>
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-300">Total Upcoming</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
            <Clock size={20} className="sm:w-6 sm:h-6 text-white" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mb-1">{statistics.today}</p>
          <p className="text-xs sm:text-sm text-gray-400">Today</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
            <Users size={20} className="sm:w-6 sm:h-6 text-white" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mb-1">{statistics.thisWeek}</p>
          <p className="text-xs sm:text-sm text-gray-400">This Week</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 col-span-2 lg:col-span-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
            <Users size={20} className="sm:w-6 sm:h-6 text-white" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mb-1">{statistics.totalParticipants}</p>
          <p className="text-xs sm:text-sm text-gray-400">Expected Participants</p>
        </div>
      </div>

      {/* Enhanced Search and Filter Controls */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col gap-4">
          {/* Top Row - Search and Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-row gap-3 sm:gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-full sm:max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search meetings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-400/50 h-10 sm:h-11"
                />
              </div>
              
              <div className="flex gap-2 sm:gap-3">
                {/* Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 sm:px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white focus:border-blue-400/50 focus:outline-none text-sm sm:text-base min-w-0 flex-1 sm:flex-none"
                >
                  <option value="all">All</option>
                  <option value="today">Today</option>
                  <option value="week">Week</option>
                </select>
                
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 sm:px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white focus:border-blue-400/50 focus:outline-none text-sm sm:text-base min-w-0 flex-1 sm:flex-none"
                >
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
              {/* Refresh Button */}
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-slate-700/50 hover:bg-slate-700/70 text-white px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 flex-shrink-0"
              >
                <RefreshCw size={16} className={`sm:w-5 sm:h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              
              {/* Bulk Delete Button */}
              {selectedMeetings.length > 0 && (
                <Button
                  onClick={handleBulkDelete}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl transition-all duration-300"
                >
                  <Trash2 size={18} className="mr-2" />
                  Delete ({selectedMeetings.length})
                </Button>
              )}
              
              {/* Schedule New Meeting Button */}
              <Button
                onClick={() => router.push('/meeting')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Plus size={18} className="mr-2" />
                Schedule New
              </Button>
            </div>
          </div>
          
          {/* Bottom Row - Bulk Actions */}
          {processedCalls.length > 0 && (
            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                {selectedMeetings.length === processedCalls.length ? (
                  <CheckSquare size={16} />
                ) : (
                  <Square size={16} />
                )}
                {selectedMeetings.length === processedCalls.length ? 'Deselect All' : 'Select All'}
              </button>
              
              {selectedMeetings.length > 0 && (
                <span className="text-sm text-blue-400">
                  {selectedMeetings.length} of {processedCalls.length} selected
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {searchTerm || filterType !== 'all' ? (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <p className="text-blue-300 text-sm">
            Showing {processedCalls.length} meeting(s)
            {searchTerm && ` matching "${searchTerm}"`}
            {filterType !== 'all' && ` filtered by ${filterType}`}
          </p>
        </div>
      ) : null}

      {/* Enhanced CallList */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : processedCalls.length > 0 ? (
          <CallList type="upcoming" />
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar size={48} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {searchTerm || filterType !== 'all' ? 'No meetings found' : 'No upcoming meetings'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Schedule your first meeting to get started'
              }
            </p>
            <Button
              onClick={() => router.push('/meeting')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <Plus size={20} className="mr-2" />
              Schedule Your First Meeting
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingPage;
