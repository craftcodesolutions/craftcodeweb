"use client";

import { useAuth } from '@/context/AuthContext';
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';

import { Button } from "@/components/ui/button";
import { toast } from 'react-toastify';
import { User, Calendar, Clock, Link as LinkIcon, Video, Users, Settings, Copy, Play, Shield } from 'lucide-react';
import MobileNavigation from '../../_components/MobileNavigation';
import { getPersonalRoomUrl, getPersonalRoomShareLink, generatePersonalRoomInvitation } from '../../_components/utils/meetingUtils';

const InfoCard = ({
  icon,
  title,
  description,
  copyable = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  copyable?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(description);
    setCopied(true);
    toast.success(`${title} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-800/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/10 dark:border-white/20 rounded-2xl p-6 hover:bg-slate-800/70 dark:hover:bg-slate-700/70 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white dark:text-gray-100 mb-2">{title}</h3>
            <p className="text-gray-300 dark:text-gray-200 text-sm break-all">{description}</p>
          </div>
        </div>
        {copyable && (
          <button
            onClick={handleCopy}
            className="ml-4 p-2 hover:bg-slate-700/50 rounded-lg transition-colors flex-shrink-0"
          >
            {copied ? (
              <div className="w-5 h-5 text-green-400">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <Copy size={20} className="text-gray-400 hover:text-white" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const PersonalRoom = () => {
  const router = useRouter();
  const { user } = useAuth();
  const client = useStreamVideoClient();
  const [isStarting, setIsStarting] = useState(false);
  const [roomStats, setRoomStats] = useState({ totalMeetings: 0, totalDuration: 0 });

  const meetingId = user?.userId;
  // Don't fetch the call initially since personal rooms are created on-demand
  // const { call, callError } = useGetCallById(meetingId!);

  // Simulate room statistics (in real app, fetch from API)
  useEffect(() => {
    const fetchRoomStats = () => {
      // Simulate API call
      setRoomStats({
        totalMeetings: Math.floor(Math.random() * 50) + 10,
        totalDuration: Math.floor(Math.random() * 1000) + 100
      });
    };
    fetchRoomStats();
  }, []);

  const startRoom = async () => {
    if (!client || !user) {
      toast.error('Unable to start meeting. Please try again.');
      return;
    }

    try {
      setIsStarting(true);
      const newCall = client.call("default", meetingId!);

      // Always use getOrCreate for personal rooms to ensure they exist
      await newCall.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
          custom: {
            description: `${user?.firstName || user?.email}'s Personal Room`,
            isPersonalRoom: true
          }
        },
      });

      // Add a small delay to ensure the call is fully created before redirect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      router.push(getPersonalRoomUrl(meetingId!));
    } catch (error) {
      console.error('Error starting personal room:', error);
      toast.error('Failed to start meeting. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const meetingLink = getPersonalRoomShareLink(meetingId!);
  const inviteMessage = generatePersonalRoomInvitation(meetingId!, user?.firstName || user?.email);

  return (
    <section className="flex size-full flex-col gap-6 sm:gap-8 text-white dark:text-white p-4 sm:p-6 scrollbar-hide">
      {/* Mobile Navigation - Only visible on small devices */}
      <MobileNavigation />
      
      {/* Enhanced Header */}
      <div className="text-center space-y-4 sm:space-y-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto animate-pulse shadow-xl shadow-purple-500/30">
          <Shield size={32} className="sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-white via-purple-100 to-gray-300 dark:from-gray-100 dark:via-purple-200 dark:to-white bg-clip-text text-transparent leading-tight">
            Personal Meeting Room
          </h1>
          <p className="text-gray-400 dark:text-gray-300 mt-2 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">Your private space for instant meetings - always ready, always available</p>
        </div>
      </div>

      {/* Enhanced Room Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-400/25 dark:to-purple-400/25 border border-white/10 dark:border-white/20 rounded-2xl p-5 sm:p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Video size={24} className="sm:w-7 sm:h-7 text-white" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white dark:text-gray-100 mb-1">{roomStats.totalMeetings}</p>
          <p className="text-sm text-gray-400 dark:text-gray-300">Total Meetings</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/10 rounded-2xl p-5 sm:p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Clock size={24} className="sm:w-7 sm:h-7 text-white" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{roomStats.totalDuration}h</p>
          <p className="text-sm text-gray-400">Total Duration</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 rounded-2xl p-5 sm:p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Users size={24} className="sm:w-7 sm:h-7 text-white" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mb-1">Always Ready</p>
          <p className="text-sm text-gray-400">24/7 Available</p>
        </div>
      </div>

      {/* Enhanced Room Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto w-full">
        <InfoCard
          icon={<User size={24} className="text-white" />}
          title="Room Owner"
          description={`${user?.firstName || user?.email}'s Personal Room`}
        />
        
        <InfoCard
          icon={<Video size={24} className="text-white" />}
          title="Meeting ID"
          description={meetingId!}
          copyable
        />
        
        <InfoCard
          icon={<LinkIcon size={24} className="text-white" />}
          title="Invite Link"
          description={meetingLink}
          copyable
        />
        
        <InfoCard
          icon={<Calendar size={24} className="text-white" />}
          title="Availability"
          description="Available 24/7 for instant meetings"
        />
      </div>

      {/* Enhanced Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center max-w-lg mx-auto w-full">
        <Button 
          className="relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/40 w-full sm:flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-base sm:text-lg"
          onClick={startRoom}
          disabled={isStarting}
        >
          <div className="flex items-center justify-center gap-3">
            {isStarting ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Starting...</span>
              </>
            ) : (
              <>
                <Play size={20} />
                <span>Start Personal Room</span>
              </>
            )}
          </div>
          <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
        </Button>
        
        <Button
          className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 sm:py-5 px-6 sm:px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 w-full sm:flex-1 text-base sm:text-lg"
          onClick={() => {
            navigator.clipboard.writeText(inviteMessage);
            toast.success("Invitation message copied to clipboard!");
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <Copy size={20} />
            <span>Copy Invitation</span>
          </div>
          <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
        </Button>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 dark:from-slate-700/40 dark:to-slate-600/40 border border-white/10 dark:border-white/20 rounded-2xl p-6 max-w-4xl mx-auto w-full">
        <h3 className="text-lg font-semibold text-white dark:text-gray-100 mb-4 flex items-center gap-2">
          <Settings size={20} className="text-yellow-400 dark:text-yellow-300" />
          Quick Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300 dark:text-gray-200">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Your personal room is always available - no scheduling needed</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Share your room link with anyone to invite them instantly</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Use the same meeting ID every time for consistency</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Perfect for recurring meetings with the same participants</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalRoom;
