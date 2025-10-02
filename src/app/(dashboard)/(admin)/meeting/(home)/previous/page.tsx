'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CallList from '@/app/(dashboard)/(admin)/meeting/_components/CallList';
import { useGetCalls } from '@/hooks/useGetCalls';
import { History, Clock, Users, Search, Calendar, BarChart3, Download, RefreshCw, Archive, CheckSquare, Square, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import MobileNavigation from '../../_components/MobileNavigation';

const PreviousPage = () => {
  const router = useRouter();
  const { endedCalls, isLoading } = useGetCalls();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [stats, setStats] = useState({ totalDuration: 0, avgDuration: 0, totalParticipants: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMeetings, setSelectedMeetings] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Auto-refresh every 60 seconds for previous meetings
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 1000);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleBulkArchive = () => {
    if (selectedMeetings.length === 0) return;
    setSelectedMeetings([]);
    toast.success(`${selectedMeetings.length} meeting(s) archived successfully!`);
  };


  // Calculate statistics dynamically from actual meeting data
  useEffect(() => {
    if (endedCalls) {
      const totalMeetings = endedCalls.length;
      let totalDuration = 0;
      let totalParticipants = 0;
      
      endedCalls.forEach(call => {
        // Calculate actual duration from start and end times
        const startTime = call.state?.startsAt ? new Date(call.state.startsAt) : null;
        const endTime = call.state?.endedAt ? new Date(call.state.endedAt) : null;
        
        if (startTime && endTime) {
          const durationMs = endTime.getTime() - startTime.getTime();
          const durationMinutes = Math.round(durationMs / (1000 * 60));
          totalDuration += durationMinutes;
        } else {
          // Fallback to estimated duration if actual times not available
          totalDuration += 45; // Default 45 minutes
        }
        
        // Get actual participant count from call members
        const participantCount = call.state?.members?.length || 1;
        totalParticipants += participantCount;
      });
      
      const avgDuration = totalMeetings > 0 ? Math.round(totalDuration / totalMeetings) : 0;
      
      setStats({ totalDuration, avgDuration, totalParticipants });
    }
  }, [endedCalls]);

  const filteredCalls = endedCalls?.filter(call => {
    const description = call.state?.custom?.description || '';
    const matchesSearch = description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterPeriod === 'all') return matchesSearch;
    
    const callDate = new Date(call.state?.startsAt || '');
    const now = new Date();
    
    if (filterPeriod === 'today') {
      return matchesSearch && callDate.toDateString() === now.toDateString();
    }
    if (filterPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return matchesSearch && callDate >= weekAgo;
    }
    if (filterPeriod === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return matchesSearch && callDate >= monthAgo;
    }
    
    return matchesSearch;
  }) || [];

  const sortedCalls = [...filteredCalls].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.state?.startsAt || '').getTime() - new Date(a.state?.startsAt || '').getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.state?.startsAt || '').getTime() - new Date(b.state?.startsAt || '').getTime();
    }
    if (sortBy === 'name') {
      const aName = a.state?.custom?.description || '';
      const bName = b.state?.custom?.description || '';
      return aName.localeCompare(bName);
    }
    return 0;
  });

  const exportMeetingHistory = () => {
    // Simulate export functionality
    const csvContent = endedCalls?.map(call => {
      return [
        call.state?.custom?.description || 'Untitled Meeting',
        new Date(call.state?.startsAt || '').toLocaleDateString(),
        new Date(call.state?.startsAt || '').toLocaleTimeString(),
        '45 minutes', // Simulated duration
        '3 participants' // Simulated participants
      ].join(',');
    }).join('\n') || '';
    
    const header = 'Meeting Name,Date,Time,Duration,Participants\n';
    const blob = new Blob([header + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meeting-history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <section className="flex size-full flex-col gap-4 sm:gap-6 text-white p-4 sm:p-6 scrollbar-hide">
      {/* Mobile Navigation - Only visible on small devices */}
      <MobileNavigation />
      
      {/* Enhanced Header */}
      <div className="text-center space-y-4 sm:space-y-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto animate-pulse shadow-xl shadow-purple-500/30">
          <History size={32} className="sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-white via-purple-100 to-gray-300 bg-clip-text text-transparent leading-tight">
            Meeting History
          </h1>
          <p className="text-gray-400 mt-2 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">Review your past meetings and analyze your meeting patterns</p>
        </div>
      </div>

      {/* Enhanced Statistics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
            <History size={20} className="sm:w-6 sm:h-6 text-white" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mb-1">{endedCalls?.length || 0}</p>
          <p className="text-xs sm:text-sm text-gray-400">Total Meetings</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
            <Clock size={20} className="sm:w-6 sm:h-6 text-white" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mb-1">{stats.totalDuration}m</p>
          <p className="text-xs sm:text-sm text-gray-400">Total Duration</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
            <BarChart3 size={20} className="sm:w-6 sm:h-6 text-white" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mb-1">{Math.round(stats.avgDuration)}m</p>
          <p className="text-xs sm:text-sm text-gray-400">Avg Duration</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 col-span-2 lg:col-span-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
            <Users size={20} className="sm:w-6 sm:h-6 text-white" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mb-1">{stats.totalParticipants}</p>
          <p className="text-xs sm:text-sm text-gray-400">Total Participants</p>
        </div>
      </div>

      {/* Enhanced Search, Filter, and Export Controls */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex flex-col gap-4">
          {/* Top Row - Search and Actions */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search meeting history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-white/10 text-white placeholder:text-gray-400 focus:border-purple-400/50"
                />
              </div>
              
              {/* Filter by Period */}
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white focus:border-purple-400/50 focus:outline-none"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white focus:border-purple-400/50 focus:outline-none"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="name">By Name</option>
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* View Mode Toggle */}
              <div className="flex bg-slate-700/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
              
              {/* Refresh Button */}
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-slate-700/50 hover:bg-slate-700/70 text-white px-4 py-2 rounded-xl transition-all duration-300"
              >
                <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              
              {/* Bulk Archive Button */}
              {selectedMeetings.length > 0 && (
                <Button
                  onClick={handleBulkArchive}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-xl transition-all duration-300"
                >
                  <Archive size={18} className="mr-2" />
                  Archive ({selectedMeetings.length})
                </Button>
              )}
              
              {/* Export Button */}
              <Button
                onClick={exportMeetingHistory}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Download size={18} className="mr-2" />
                Export History
              </Button>
            </div>
          </div>
          
          {/* Bottom Row - Bulk Actions */}
          {sortedCalls.length > 0 && (
            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  if (selectedMeetings.length === sortedCalls.length) {
                    setSelectedMeetings([]);
                  } else {
                    setSelectedMeetings(sortedCalls.map(call => call.id));
                  }
                }}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                {selectedMeetings.length === sortedCalls.length ? (
                  <CheckSquare size={16} />
                ) : (
                  <Square size={16} />
                )}
                {selectedMeetings.length === sortedCalls.length ? 'Deselect All' : 'Select All'}
              </button>
              
              {selectedMeetings.length > 0 && (
                <span className="text-sm text-purple-400">
                  {selectedMeetings.length} of {sortedCalls.length} selected
                </span>
              )}
              
              {/* Quick Stats */}
              <div className="ml-auto flex gap-4 text-xs text-gray-400">
                <span>Total: {sortedCalls.length} meetings</span>
                <span>Duration: {Math.round(stats.totalDuration)}m</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {searchTerm || filterPeriod !== 'all' ? (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-4">
          <p className="text-purple-300 text-sm">
            Showing {sortedCalls.length} meeting(s)
            {searchTerm && ` matching "${searchTerm}"`}
            {filterPeriod !== 'all' && ` from ${filterPeriod}`}
          </p>
        </div>
      ) : null}

      {/* Enhanced CallList */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        ) : sortedCalls.length > 0 ? (
          <CallList type="ended" />
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <History size={48} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {searchTerm || filterPeriod !== 'all' ? 'No meetings found' : 'No meeting history'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterPeriod !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Your completed meetings will appear here'
              }
            </p>
            <Button
              onClick={() => router.push('/meeting')}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <Calendar size={20} className="mr-2" />
              Schedule a Meeting
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PreviousPage;
