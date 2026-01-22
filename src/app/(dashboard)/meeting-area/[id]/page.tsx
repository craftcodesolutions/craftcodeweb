'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import { useGetCallById } from '@/hooks/useGetCallById';
import MeetingSetup from '@/app/(dashboard)/(admin)/meeting/_components/MeetingSetup';
import MeetingRoom from '@/app/(dashboard)/(admin)/meeting/_components/MeetingRoom';
import EnhancedLoader from '@/app/(dashboard)/(admin)/meeting/_components/EnhancedLoader';
import { isValidMeetingId } from '@/app/(dashboard)/(admin)/meeting/_components/utils/meetingUtils';

const MeetingPage = () => {
  const params = useParams();
  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : undefined;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Handle navigation to appropriate dashboard based on user role
  const handleDashboardNavigation = () => {
    if (user?.isAdmin) {
      router.push('/meeting');
    } else {
      router.push('/');
    }
  };
  const { call, isCallLoading, callError } = useGetCallById(id as string);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // Validate meeting ID on mount
  useEffect(() => {
    if (id && !isValidMeetingId(id as string)) {
      toast.error('Invalid meeting ID format');
      if (user?.isAdmin) {
        router.push('/meeting');
      } else {
        router.push('/');
      }
      return;
    }
  }, [id, router, user?.isAdmin]);

  if (!isAuthenticated || isCallLoading) {
    return (
      <EnhancedLoader 
        message="Loading meeting..."
        submessage="Please wait while we connect you to your meeting"
        type="meeting"
        size="lg"
      />
    );
  }

  if (!call) return (
    <div className="flex-center h-screen w-full bg-gradient-to-br from-[#050B14] via-[#0B1C2D] to-[#050B14]">
      <div className="text-center space-y-6 max-w-md mx-auto p-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-[#102A3A]/70 backdrop-blur-sm rounded-full p-8 border border-[#1E3A4A]/70 shadow-xl">
            <svg className="w-20 h-20 text-red-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#E6F1F5] to-[#9FB3C8] bg-clip-text text-transparent">
            Meeting Not Found
          </h1>
          <p className="text-[#9FB3C8] text-base leading-relaxed">
            {callError || "The meeting you're looking for doesn't exist or has been removed. Please check the meeting ID and try again."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] hover:from-[#2FD1C5] hover:to-[#1E5AA8] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
            >
              Go Back
            </button>
            <button
              onClick={handleDashboardNavigation}
              className="px-6 py-3 bg-[#0B1C2D] hover:bg-[#102A3A] text-[#E6F1F5] font-semibold rounded-xl transition-all duration-300 hover:scale-105 border border-[#1E3A4A]"
            >
              {user?.isAdmin ? 'Meeting Dashboard' : 'Home'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Check if user is allowed to join the meeting
  const notAllowed = call.type === 'invited' && (!user || !call.state.members.find((m) => m.user.id === user.userId));

  if (notAllowed) return (
    <div className="flex-center h-screen w-full bg-gradient-to-br from-[#050B14] via-[#0B1C2D] to-[#050B14]">
      <div className="text-center space-y-6 max-w-md mx-auto p-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-[#102A3A]/70 backdrop-blur-sm rounded-full p-8 border border-[#1E3A4A]/70 shadow-xl">
            <svg className="w-20 h-20 text-red-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#E6F1F5] to-[#9FB3C8] bg-clip-text text-transparent">
            Access Denied
          </h1>
          <p className="text-[#9FB3C8] text-base leading-relaxed">
            You are not authorized to join this meeting. Please contact the meeting organizer for access.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] hover:from-[#2FD1C5] hover:to-[#1E5AA8] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
            >
              Go Back
            </button>
            <button
              onClick={handleDashboardNavigation}
              className="px-6 py-3 bg-[#0B1C2D] hover:bg-[#102A3A] text-[#E6F1F5] font-semibold rounded-xl transition-all duration-300 hover:scale-105 border border-[#1E3A4A]"
            >
              {user?.isAdmin ? 'Meeting Dashboard' : 'Home'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="h-screen w-full bg-gradient-to-br from-[#050B14] via-[#0B1C2D] to-[#050B14]">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default MeetingPage;
