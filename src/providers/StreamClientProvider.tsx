'use client';

import { ReactNode, useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { useAuth } from '@/context/AuthContext';
import { Video } from 'lucide-react';

import { tokenProvider } from '@/actions/stream.actions';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;
    if (!API_KEY) throw new Error('Stream API key is missing');

    const client = new StreamVideoClient({
      apiKey: API_KEY,
      user: {
        id: user.userId,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || user.userId,
        image: user.profileImage || '',
      },
      tokenProvider,
    });

    setVideoClient(client);
  }, [user, isAuthenticated, isLoading]);

  // Enhanced loading state for Stream Video initialization
  if (!videoClient) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <div className="flex flex-col items-center justify-center text-center space-y-8 p-8">
          {/* Multi-layer animated icon */}
          <div className="relative">
            {/* Outer glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full blur-2xl opacity-40 animate-pulse scale-150"></div>
            
            {/* Middle rotating ring */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-60 animate-spin scale-125" style={{ animationDuration: '3s' }}></div>
            
            {/* Inner container */}
            <div className="relative w-24 h-24 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
              <div className="relative">
                <Video size={36} className="text-white drop-shadow-lg animate-pulse" />
                {/* Fallback spinner */}
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin opacity-50" style={{ animationDuration: '2s' }}></div>
              </div>
            </div>
          </div>
          
          {/* Enhanced text section */}
          <div className="space-y-4 max-w-sm">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
              Initializing Video
            </h3>
            <p className="text-sm text-gray-400 font-medium">
              Setting up your video meeting experience...
            </p>
            
            {/* Enhanced loading dots */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div 
                className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-bounce shadow-lg"
                style={{ animationDelay: '0s', animationDuration: '1.4s' }}
              ></div>
              <div 
                className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full animate-bounce shadow-lg"
                style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}
              ></div>
              <div 
                className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-bounce shadow-lg"
                style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}
              ></div>
            </div>
            
            {/* Progress indicator */}
            <div className="w-48 h-1 bg-gray-700/50 rounded-full overflow-hidden mt-6">
              <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Background overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm -z-10"></div>
      </div>
    );
  }

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;
