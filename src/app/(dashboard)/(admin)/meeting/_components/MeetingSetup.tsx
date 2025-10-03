'use client';
import { useEffect, useState } from 'react';
import {
  VideoPreview,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';

import Alert from './Alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Camera, CameraOff, Mic, MicOff, Settings, Users, Monitor, Volume2, Check } from 'lucide-react';

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  // https://getstream.io/video/docs/react/guides/call-and-participant-state/#call-state
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();

  if (!call) {
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );
  }

  // Enhanced state management
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [devicePermissions, setDevicePermissions] = useState({ camera: false, microphone: false });
  const [isCameraLoading, setIsCameraLoading] = useState(true);
  const [isMicLoading, setIsMicLoading] = useState(true);
  const [initializationComplete, setInitializationComplete] = useState(false);
  const [isVideoFeedReady, setIsVideoFeedReady] = useState(false);
  const [isCameraEnabling, setIsCameraEnabling] = useState(false);
  const [isVideoInitializing, setIsVideoInitializing] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<{
    cameras: MediaDeviceInfo[];
    microphones: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  }>({ cameras: [], microphones: [], speakers: [] });
  const [selectedDevices, setSelectedDevices] = useState({ camera: '', microphone: '', speaker: '' });
  // Initialize devices and check permissions
  useEffect(() => {
    const initializeDevices = async () => {
      try {
        setIsCameraLoading(true);
        setIsMicLoading(true);
        setInitializationComplete(false);
        
        // Check if mediaDevices is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          console.warn('MediaDevices API not supported');
          setIsCameraLoading(false);
          setIsMicLoading(false);
          setInitializationComplete(true);
          return;
        }

        // Get available devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device: MediaDeviceInfo) => device.kind === 'videoinput');
        const microphones = devices.filter((device: MediaDeviceInfo) => device.kind === 'audioinput');
        const speakers = devices.filter((device: MediaDeviceInfo) => device.kind === 'audiooutput');
        
        setAvailableDevices({ cameras, microphones, speakers });
        
        // Set default selected devices
        if (cameras.length > 0) setSelectedDevices(prev => ({ ...prev, camera: cameras[0].deviceId }));
        if (microphones.length > 0) setSelectedDevices(prev => ({ ...prev, microphone: microphones[0].deviceId }));
        if (speakers.length > 0) setSelectedDevices(prev => ({ ...prev, speaker: speakers[0].deviceId }));

        // Check camera permission
        if (call?.camera) {
          try {
            setIsCameraLoading(true);
            await call.camera.enable();
            setDevicePermissions(prev => ({ ...prev, camera: true }));
            if (!isCameraEnabled) {
              await call.camera.disable();
            }
            setIsCameraLoading(false);
          } catch (error) {
            console.warn('Camera permission denied:', error);
            setIsCameraEnabled(false);
            setIsCameraLoading(false);
          }
        } else {
          setIsCameraLoading(false);
        }

        // Check microphone permission
        if (call?.microphone) {
          try {
            setIsMicLoading(true);
            await call.microphone.enable();
            setDevicePermissions(prev => ({ ...prev, microphone: true }));
            if (!isMicEnabled) {
              await call.microphone.disable();
            }
            setIsMicLoading(false);
          } catch (error) {
            console.warn('Microphone permission denied:', error);
            setIsMicEnabled(false);
            setIsMicLoading(false);
          }
        } else {
          setIsMicLoading(false);
        }
        // Mark initialization as complete
        setTimeout(() => {
          setInitializationComplete(true);
        }, 500); // Small delay to ensure smooth loading experience
      } catch (error) {
        console.error('Error initializing devices:', error);
        setIsCameraLoading(false);
        setIsMicLoading(false);
        setInitializationComplete(true);
      }
    };

    initializeDevices();
  }, [call?.camera, call?.microphone, isCameraEnabled, isMicEnabled]);

  // Handle video feed readiness
  useEffect(() => {
    if (isCameraEnabled && devicePermissions.camera && initializationComplete) {
      // Simulate video feed loading delay
      const videoFeedTimer = setTimeout(() => {
        setIsVideoFeedReady(true);
      }, 1500); // 1.5 second delay for video feed to start

      return () => clearTimeout(videoFeedTimer);
    } else {
      setIsVideoFeedReady(false);
    }
  }, [isCameraEnabled, devicePermissions.camera, initializationComplete]);

  // Handle video initialization after feed is ready
  useEffect(() => {
    if (isVideoFeedReady && isCameraEnabled && devicePermissions.camera) {
      setIsVideoInitializing(true);
      // Continue initializing for 1 second after video feed starts
      const videoInitTimer = setTimeout(() => {
        setIsVideoInitializing(false);
      }, 1000); // 1 second additional loading

      return () => clearTimeout(videoInitTimer);
    } else {
      setIsVideoInitializing(false);
    }
  }, [isVideoFeedReady, isCameraEnabled, devicePermissions.camera]);

  // Handle device selection
  const handleDeviceChange = async (deviceType: 'camera' | 'microphone' | 'speaker', deviceId: string) => {
    try {
      setSelectedDevices(prev => ({ ...prev, [deviceType]: deviceId }));
      
      if (deviceType === 'camera' && call?.camera) {
        // Switch camera device - Stream SDK method
        try {
          // Disable current camera first
          await call.camera.disable();
          // Re-enable with new device (Stream SDK will use the selected device)
          await call.camera.enable();
        } catch (error) {
          console.warn('Error switching camera:', error);
        }
      } else if (deviceType === 'microphone' && call?.microphone) {
        // Switch microphone device - Stream SDK method
        try {
          // Disable current microphone first
          await call.microphone.disable();
          // Re-enable with new device
          await call.microphone.enable();
        } catch (error) {
          console.warn('Error switching microphone:', error);
        }
      }
      // Note: Speaker switching typically requires different approach
      // as it's handled by the browser's audio output selection
    } catch (error) {
      console.error(`Error switching ${deviceType}:`, error);
    }
  };

  // Toggle camera
  const toggleCamera = async () => {
    try {
      if (call?.camera) {
        if (isCameraEnabled) {
          setIsCameraLoading(true);
          await call.camera.disable();
          setIsCameraEnabled(false);
          setIsCameraLoading(false);
        } else {
          // When enabling camera, show enabling state
          setIsCameraEnabling(true);
          setIsCameraLoading(true);
          await call.camera.enable();
          setIsCameraEnabled(true);
          setIsCameraLoading(false);
          // Keep enabling state for a moment to show transition
          setTimeout(() => {
            setIsCameraEnabling(false);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error toggling camera:', error);
      setIsCameraLoading(false);
      setIsCameraEnabling(false);
    }
  };

  // Toggle microphone
  const toggleMicrophone = async () => {
    try {
      if (call?.microphone) {
        setIsMicLoading(true);
        if (isMicEnabled) {
          await call.microphone.disable();
        } else {
          await call.microphone.enable();
        }
        setIsMicEnabled(!isMicEnabled);
        setIsMicLoading(false);
      }
    } catch (error) {
      console.error('Error toggling microphone:', error);
      setIsMicLoading(false);
    }
  };

  // Join meeting with loading state
  const handleJoinMeeting = async () => {
    try {
      setIsJoining(true);
      if (call) {
        await call.join();
        setIsSetupComplete(true);
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
      setIsJoining(false);
    }
  };

  if (callTimeNotArrived)
    return (
      <Alert
        title={`Your Meeting has not started yet. It is scheduled for ${callStartsAt ? new Date(callStartsAt).toLocaleString() : 'soon'}` }
      />
    );

  if (callHasEnded)
    return (
      <Alert
        title="The call has been ended by the host"
        iconUrl="/icons/call-ended.svg"
      />
    );

  return (
    <div className="relative min-h-screen w-full flex flex-col text-white bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-4 overflow-y-auto">
      {/* Enhanced Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900 to-black"></div>
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
      
      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-start gap-4 max-w-6xl mx-auto w-full py-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Meeting Setup
            </h1>
            <div className="w-24 md:w-32 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full mx-auto mt-2 animate-pulse"></div>
          </div>
          <p className="text-gray-300 text-lg md:text-xl font-medium">Test your camera and microphone before joining</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>System ready</span>
          </div>
        </div>

        {/* Enhanced Video Preview Container */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-3xl blur-2xl animate-pulse"></div>
          <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-3xl p-3 border border-white/20 shadow-2xl">
            <div className="relative w-full max-w-[640px] h-[300px] md:h-[400px] lg:h-[480px] rounded-2xl overflow-hidden bg-slate-900">
            {isCameraLoading || !initializationComplete ? (
              // Ultra-Modern Camera Loading State
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl">
                {/* Animated background particles */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
                  <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400/40 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '2.5s' }}></div>
                  <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-cyan-400/25 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
                </div>

                <div className="relative flex flex-col items-center justify-center text-center space-y-10 p-8 max-w-lg">
                  {/* Ultra-sophisticated animated icon */}
                  <div className="relative">
                    {/* Outermost glow ring */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 via-cyan-400 to-blue-500 rounded-full blur-3xl opacity-30 animate-pulse scale-[2.5]" style={{ animationDuration: '4s' }}></div>
                    
                    {/* Secondary rotating ring */}
                    <div className="absolute inset-0 bg-gradient-conic from-blue-400 via-purple-500 via-cyan-400 to-blue-400 rounded-full blur-xl opacity-50 animate-spin scale-[1.8]" style={{ animationDuration: '8s' }}></div>
                    
                    {/* Primary rotating ring */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-70 animate-spin scale-150" style={{ animationDuration: '3s' }}></div>
                    
                    {/* Inner pulsing ring */}
                    <div className="absolute inset-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-md opacity-60 animate-pulse scale-125" style={{ animationDuration: '2s' }}></div>
                    
                    {/* Main container */}
                    <div className="relative w-32 h-32 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center border-2 border-white/30 shadow-2xl">
                      <div className="relative">
                        {/* Camera icon with breathing animation */}
                        <Camera size={48} className="text-white drop-shadow-2xl animate-pulse" style={{ animationDuration: '2.5s' }} />
                        
                        {/* Orbiting dots */}
                        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '6s' }}>
                          <div className="absolute -top-2 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2 shadow-lg"></div>
                          <div className="absolute top-1/2 -right-2 w-1.5 h-1.5 bg-purple-400 rounded-full transform -translate-y-1/2 shadow-lg"></div>
                          <div className="absolute -bottom-2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full transform -translate-x-1/2 shadow-lg"></div>
                          <div className="absolute top-1/2 -left-2 w-1.5 h-1.5 bg-blue-300 rounded-full transform -translate-y-1/2 shadow-lg"></div>
                        </div>
                        
                        {/* Scanning line effect */}
                        <div className="absolute inset-0 overflow-hidden rounded-full">
                          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse opacity-80" style={{ animationDuration: '1.5s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced status section */}
                  <div className="space-y-6 w-full">
                    {/* Main title with typewriter effect */}
                    <div className="space-y-3">
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-pulse bg-[length:200%_100%]">
                        Initializing Camera
                      </h3>
                      <p className="text-base text-gray-300 font-medium leading-relaxed">
                        {!devicePermissions.camera 
                          ? "Please allow camera access when prompted" 
                          : "Setting up your video feed..."
                        }
                      </p>
                    </div>
                    
                    {/* Status indicators */}
                    <div className="flex items-center justify-center gap-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          <div className="absolute inset-0 w-3 h-3 bg-blue-500 rounded-full animate-ping opacity-40"></div>
                        </div>
                        <span className="text-sm text-gray-400 font-medium">Camera</span>
                      </div>
                      <div className="w-px h-4 bg-gray-600"></div>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          <div className="absolute inset-0 w-3 h-3 bg-purple-500 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.5s' }}></div>
                        </div>
                        <span className="text-sm text-gray-400 font-medium">Audio</span>
                      </div>
                      <div className="w-px h-4 bg-gray-600"></div>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                          <div className="absolute inset-0 w-3 h-3 bg-cyan-500 rounded-full animate-ping opacity-40" style={{ animationDelay: '1s' }}></div>
                        </div>
                        <span className="text-sm text-gray-400 font-medium">Stream</span>
                      </div>
                    </div>
                    
                    {/* Enhanced loading dots with labels */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <div 
                          className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-bounce shadow-xl"
                          style={{ animationDelay: '0s', animationDuration: '1.6s' }}
                        ></div>
                        <div 
                          className="w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full animate-bounce shadow-xl"
                          style={{ animationDelay: '0.3s', animationDuration: '1.6s' }}
                        ></div>
                        <div 
                          className="w-4 h-4 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full animate-bounce shadow-xl"
                          style={{ animationDelay: '0.6s', animationDuration: '1.6s' }}
                        ></div>
                      </div>
                      
                      {/* Advanced progress bar */}
                      <div className="w-full max-w-sm mx-auto space-y-2">
                        <div className="flex justify-between text-xs text-gray-400 font-medium">
                          <span>Initializing</span>
                          <span>Please wait...</span>
                        </div>
                        <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden shadow-inner">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 via-cyan-400 to-blue-500 rounded-full animate-pulse bg-[length:200%_100%]" style={{ animationDuration: '3s' }}></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Permission hint */}
                    {!devicePermissions.camera && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <Camera size={16} className="text-blue-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-blue-300">Camera Permission Required</p>
                            <p className="text-xs text-blue-400/80">Click &quot;Allow&quot; when your browser asks for camera access</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Enhanced background overlay with subtle pattern */}
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm -z-10"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)] -z-10"></div>
              </div>
            ) : isCameraEnabled && devicePermissions.camera && !isVideoFeedReady ? (
              // Camera Active but Video Feed Loading
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-900/90 backdrop-blur-lg">
                {/* Status Indicators - Show camera is active */}
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-white">Camera Active</span>
                  </div>
                </div>
                
                <div className="absolute top-4 right-4">
                  <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
                    <span className="text-sm font-medium text-green-400">HD</span>
                  </div>
                </div>

                {/* Video Feed Loading Animation */}
                <div className="flex flex-col items-center justify-center text-center space-y-8 p-8">
                  {/* Sophisticated video loading animation */}
                  <div className="relative">
                    {/* Outer scanning ring */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-green-500 rounded-full blur-2xl opacity-40 animate-pulse scale-[2]" style={{ animationDuration: '3s' }}></div>
                    
                    {/* Middle rotating ring */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur-lg opacity-60 animate-spin scale-150" style={{ animationDuration: '4s' }}></div>
                    
                    {/* Inner container */}
                    <div className="relative w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-green-500/30 shadow-2xl">
                      <div className="relative">
                        {/* Video feed icon with pulse */}
                        <Monitor size={36} className="text-green-400 drop-shadow-xl animate-pulse" style={{ animationDuration: '2s' }} />
                        
                        {/* Scanning lines effect */}
                        <div className="absolute inset-0 overflow-hidden rounded-full">
                          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse opacity-80" style={{ animationDuration: '1.5s' }}></div>
                          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse opacity-60" style={{ animationDelay: '0.75s', animationDuration: '1.5s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Loading status */}
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-green-400 bg-clip-text text-transparent animate-pulse">
                      Starting Video Feed
                    </h4>
                    <p className="text-sm text-gray-300 font-medium">
                      Camera is active, preparing your video...
                    </p>
                    
                    {/* Video loading dots */}
                    <div className="flex items-center justify-center gap-2">
                      <div 
                        className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-400 rounded-full animate-bounce shadow-lg"
                        style={{ animationDelay: '0s', animationDuration: '1.4s' }}
                      ></div>
                      <div 
                        className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-bounce shadow-lg"
                        style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}
                      ></div>
                      <div 
                        className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-400 rounded-full animate-bounce shadow-lg"
                        style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}
                      ></div>
                    </div>
                    
                    {/* Video feed progress */}
                    <div className="w-40 h-1 bg-gray-700/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-green-500 rounded-full animate-pulse bg-[length:200%_100%]" style={{ animationDuration: '2.5s' }}></div>
                    </div>
                  </div>
                </div>
                
                {/* Background overlay */}
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm -z-10"></div>
              </div>
            ) : isCameraEnabled && devicePermissions.camera && isVideoFeedReady && isVideoInitializing ? (
              // New Video Initializing State
              <div className="relative w-full h-full">
                <VideoPreview className="w-full h-full object-cover" />
                
                {/* Video Initializing Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
                  {/* Animated background particles */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400/40 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '2s' }}></div>
                    <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-ping" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}></div>
                    <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-purple-400/30 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center space-y-6 p-8">
                    {/* Sophisticated video initializing animation */}
                    <div className="relative">
                      {/* Outer glow ring */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full blur-2xl opacity-50 animate-pulse scale-[2]" style={{ animationDuration: '2s' }}></div>
                      
                      {/* Rotating ring */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur-lg opacity-70 animate-spin scale-150" style={{ animationDuration: '3s' }}></div>
                      
                      {/* Main container */}
                      <div className="relative w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-cyan-500/30 shadow-2xl">
                        <div className="relative">
                          {/* Video icon with pulse */}
                          <Monitor size={32} className="text-cyan-400 drop-shadow-xl animate-pulse" style={{ animationDuration: '1.5s' }} />
                          
                          {/* Success indicator */}
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                            <Check size={10} className="text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status text */}
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                        Optimizing Video Quality
                      </h4>
                      <p className="text-sm text-white/80 font-medium">
                        Finalizing your video setup...
                      </p>
                      
                      {/* Progress dots */}
                      <div className="flex items-center justify-center gap-2">
                        <div 
                          className="w-2.5 h-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full animate-bounce shadow-lg"
                          style={{ animationDelay: '0s', animationDuration: '1s' }}
                        ></div>
                        <div 
                          className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-bounce shadow-lg"
                          style={{ animationDelay: '0.2s', animationDuration: '1s' }}
                        ></div>
                        <div 
                          className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full animate-bounce shadow-lg"
                          style={{ animationDelay: '0.4s', animationDuration: '1s' }}
                        ></div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-32 h-1 bg-gray-700/50 rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full animate-pulse bg-[length:200%_100%]" style={{ animationDuration: '1.5s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status Indicators - Slightly Dimmed */}
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/30">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-white">Optimizing</span>
                  </div>
                </div>
                
                <div className="absolute top-4 right-4">
                  <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/30">
                    <span className="text-sm font-medium text-cyan-400">HD+</span>
                  </div>
                </div>
              </div>
            ) : isCameraEnabled && devicePermissions.camera && isVideoFeedReady ? (
              <>
                <VideoPreview className="w-full h-full object-cover" />
                {/* Video Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                
                {/* Status Indicators */}
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-white">Camera Active</span>
                  </div>
                </div>
                
                <div className="absolute top-4 right-4">
                  <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
                    <span className="text-sm font-medium text-green-400">HD</span>
                  </div>
                </div>
              </>
            ) : isCameraEnabled && devicePermissions.camera ? (
              // Stage 2.5: Camera Ready but Video Feed Not Started (Your Screenshot Scenario)
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                {/* Subtle ambient loading animation */}
                <div className="absolute inset-0 overflow-hidden">
                  {/* Gentle pulsing overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-slate-900/20 animate-pulse" style={{ animationDuration: '3s' }}></div>
                  
                  {/* Subtle scanning line */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-pulse opacity-40" style={{ animationDuration: '2s' }}></div>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent animate-pulse opacity-30" style={{ animationDelay: '1s', animationDuration: '2s' }}></div>
                </div>

                {/* Minimal center loading indicator */}
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                  {/* Subtle camera icon with gentle animation */}
                  <div className="relative">
                    {/* Gentle glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse scale-150" style={{ animationDuration: '4s' }}></div>
                    
                    {/* Icon container */}
                    <div className="relative w-16 h-16 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
                      <Camera size={24} className="text-white/60 animate-pulse" style={{ animationDuration: '3s' }} />
                    </div>
                  </div>
                  
                  {/* Minimal text */}
                  <div className="space-y-2">
                    <p className="text-sm text-white/70 font-medium">
                      Preparing video feed...
                    </p>
                    
                    {/* Subtle loading dots */}
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.5s' }}></div>
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '1.5s' }}></div>
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '1.5s' }}></div>
                    </div>
                  </div>
                </div>

                {/* Very subtle corner indicators to show system is ready */}
                <div className="absolute bottom-4 right-4">
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <div className="w-1.5 h-1.5 bg-green-500/60 rounded-full animate-pulse"></div>
                    <span>Ready</span>
                  </div>
                </div>
              </div>
            ) : (
              // Enhanced Camera Off Display (Your Screenshot Scenario)
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                {/* Subtle background animation */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-purple-500/3 to-transparent animate-pulse" style={{ animationDuration: '4s' }}></div>
                </div>

                <div className="text-center space-y-6 relative z-10">
                  {/* Enhanced User Avatar with Camera Off Indicator */}
                  <div className="relative mx-auto">
                    {/* Main avatar container */}
                    <div className="relative">
                      {/* Subtle glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse scale-110" style={{ animationDuration: '3s' }}></div>
                      
                      {/* Avatar circle */}
                      <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-2xl border-2 border-white/10">
                        <Users size={32} className="text-white drop-shadow-lg" />
                      </div>
                      
                      {/* Enhanced camera off indicator */}
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-lg">
                        <CameraOff size={16} className="text-white" />
                        {/* Subtle pulsing ring */}
                        <div className="absolute inset-0 bg-red-500/30 rounded-full animate-ping"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced text section */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white">
                      {devicePermissions.camera ? 'Camera is off' : 'Camera access needed'}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
                      {devicePermissions.camera 
                        ? 'Click the camera button below to enable your camera' 
                        : 'Please allow camera access when prompted'
                      }
                    </p>
                  </div>

                  {/* Interactive enable button */}
                  {devicePermissions.camera && (
                    <button
                      onClick={toggleCamera}
                      disabled={isCameraLoading || isCameraEnabling}
                      className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <div className="flex items-center gap-2">
                        {isCameraLoading || isCameraEnabling ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>{isCameraEnabling ? 'Enabling...' : 'Loading...'}</span>
                          </>
                        ) : (
                          <>
                            <Camera size={18} />
                            <span>Enable Camera</span>
                          </>
                        )}
                      </div>
                      
                      {/* Button shine effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                    </button>
                  )}

                  {/* Status indicator */}
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <div className={`w-2 h-2 rounded-full ${devicePermissions.camera ? 'bg-orange-500' : 'bg-red-500'} animate-pulse`}></div>
                    <span>
                      {devicePermissions.camera ? 'Camera disabled' : 'Permission required'}
                    </span>
                  </div>
                </div>


                {/* Helpful tip */}
                {!devicePermissions.camera && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-amber-400">
                        <div className="w-4 h-4 bg-amber-500/20 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                        </div>
                        <span className="text-xs font-medium">Camera permission needed</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {(isCameraEnabling || (isCameraLoading && isCameraEnabled)) && (
              // Camera Enabling Loading State
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                {/* Dynamic background animation */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-green-500/5 animate-pulse" style={{ animationDuration: '2s' }}></div>
                  
                  {/* Scanning effect */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" style={{ animationDuration: '1.5s' }}></div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '1.5s' }}></div>
                </div>

                <div className="text-center space-y-8 relative z-10">
                  {/* Animated camera enabling icon */}
                  <div className="relative mx-auto">
                    {/* Outer rotating ring */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-green-500 to-blue-500 rounded-full blur-2xl opacity-40 animate-spin scale-[2]" style={{ animationDuration: '3s' }}></div>
                    
                    {/* Middle pulsing ring */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur-lg opacity-60 animate-pulse scale-150" style={{ animationDuration: '2s' }}></div>
                    
                    {/* Main container */}
                    <div className="relative w-28 h-28 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-green-500/30 shadow-2xl">
                      <div className="relative">
                        {/* Camera icon with transformation effect */}
                        <Camera size={40} className="text-green-400 drop-shadow-2xl animate-pulse" style={{ animationDuration: '1.5s' }} />
                        
                        {/* Success checkmark overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center animate-ping">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enabling status */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                      Enabling Camera
                    </h3>
                    <p className="text-sm text-gray-300 font-medium">
                      Starting your video feed...
                    </p>
                    
                    {/* Progress dots */}
                    <div className="flex items-center justify-center gap-2">
                      <div 
                        className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-bounce shadow-lg"
                        style={{ animationDelay: '0s', animationDuration: '1.2s' }}
                      ></div>
                      <div 
                        className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-400 rounded-full animate-bounce shadow-lg"
                        style={{ animationDelay: '0.2s', animationDuration: '1.2s' }}
                      ></div>
                      <div 
                        className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-bounce shadow-lg"
                        style={{ animationDelay: '0.4s', animationDuration: '1.2s' }}
                      ></div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-48 h-2 bg-gray-700/50 rounded-full overflow-hidden mx-auto">
                      <div className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-blue-500 rounded-full animate-pulse bg-[length:200%_100%]" style={{ animationDuration: '2s' }}></div>
                    </div>
                  </div>
                  
                  {/* Status message */}
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-6 py-3 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-3 text-green-400">
                      <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                      <span className="text-sm font-medium">Camera activation in progress</span>
                    </div>
                  </div>
                </div>

                {/* Background particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-400/30 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '2s' }}></div>
                  <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-blue-400/40 rounded-full animate-ping" style={{ animationDelay: '0.7s', animationDuration: '2.5s' }}></div>
                  <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-green-300/25 rounded-full animate-ping" style={{ animationDelay: '1.2s', animationDuration: '3s' }}></div>
                </div>
              </div>
            )}
            
            {/* Control Buttons Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/20">
                <button
                  onClick={toggleCamera}
                  disabled={isCameraLoading}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                    isCameraLoading
                      ? "bg-gray-500/30 text-gray-300"
                      : isCameraEnabled 
                      ? "bg-blue-500/30 text-blue-300 hover:bg-blue-500/40" 
                      : "bg-red-500/30 text-red-300 hover:bg-red-500/40"
                  )}
                >
                  {isCameraLoading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : isCameraEnabled ? <Camera size={20} /> : <CameraOff size={20} />}
                </button>
                
                <button
                  onClick={toggleMicrophone}
                  disabled={isMicLoading}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                    isMicLoading
                      ? "bg-gray-500/30 text-gray-300"
                      : isMicEnabled 
                      ? "bg-green-500/30 text-green-300 hover:bg-green-500/40" 
                      : "bg-red-500/30 text-red-300 hover:bg-red-500/40"
                  )}
                >
                  {isMicLoading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
                
                <button
                  onClick={() => setShowDeviceSettings(!showDeviceSettings)}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 hover:scale-110",
                    showDeviceSettings 
                      ? "bg-purple-500/30 text-purple-300 hover:bg-purple-500/40" 
                      : "bg-slate-700/50 text-gray-300 hover:bg-slate-700/70"
                  )}
                >
                  <Settings size={20} />
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="relative flex flex-col items-center gap-4 w-full max-w-4xl">
        {/* Inline Device Settings */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowDeviceSettings(!showDeviceSettings)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105",
              showDeviceSettings 
                ? "bg-purple-500/30 text-purple-300 border border-purple-400/30" 
                : "bg-slate-700/50 text-gray-300 hover:bg-slate-700/70 border border-white/10"
            )}
          >
            <Settings size={18} />
            <span className="font-medium">Device Settings</span>
          </button>
        </div>
        
        {/* Device Settings Panel */}
        {showDeviceSettings && (
          <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Settings size={20} className="text-purple-400" />
                Device Configuration
              </h3>
              <button
                onClick={() => setShowDeviceSettings(false)}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-4 space-y-6">
              {/* Camera Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Camera size={18} className="text-blue-400" />
                  <h4 className="font-medium text-white">Camera</h4>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Select Camera:</label>
                  <select
                    value={selectedDevices.camera}
                    onChange={(e) => handleDeviceChange('camera', e.target.value)}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400/50"
                  >
                    {availableDevices.cameras.map((camera: MediaDeviceInfo) => (
                      <option key={camera.deviceId} value={camera.deviceId}>
                        {camera.label || `Camera ${camera.deviceId.slice(0, 8)}...`}
                      </option>
                    ))}
                    {availableDevices.cameras.length === 0 && (
                      <option value="">No cameras found</option>
                    )}
                  </select>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      devicePermissions.camera ? "bg-green-500" : "bg-red-500"
                    )}></div>
                    <span className="text-gray-400">
                      {devicePermissions.camera ? 'Permission granted' : 'Permission needed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Microphone Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mic size={18} className="text-green-400" />
                  <h4 className="font-medium text-white">Microphone</h4>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Select Microphone:</label>
                  <select
                    value={selectedDevices.microphone}
                    onChange={(e) => handleDeviceChange('microphone', e.target.value)}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-400/50"
                  >
                    {availableDevices.microphones.map((mic: MediaDeviceInfo) => (
                      <option key={mic.deviceId} value={mic.deviceId}>
                        {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}...`}
                      </option>
                    ))}
                    {availableDevices.microphones.length === 0 && (
                      <option value="">No microphones found</option>
                    )}
                  </select>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      devicePermissions.microphone ? "bg-green-500" : "bg-red-500"
                    )}></div>
                    <span className="text-gray-400">
                      {devicePermissions.microphone ? 'Permission granted' : 'Permission needed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Speaker Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Volume2 size={18} className="text-purple-400" />
                  <h4 className="font-medium text-white">Speaker</h4>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Select Speaker:</label>
                  <select
                    value={selectedDevices.speaker}
                    onChange={(e) => handleDeviceChange('speaker', e.target.value)}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400/50"
                  >
                    {availableDevices.speakers.map((speaker: MediaDeviceInfo) => (
                      <option key={speaker.deviceId} value={speaker.deviceId}>
                        {speaker.label || `Speaker ${speaker.deviceId.slice(0, 8)}...`}
                      </option>
                    ))}
                    {availableDevices.speakers.length === 0 && (
                      <option value="">Default Speaker</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Test Controls */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <Monitor size={18} className="text-yellow-400" />
                  Test Your Setup
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={toggleCamera}
                    className={cn(
                      "flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                      isCameraEnabled 
                        ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30" 
                        : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                    )}
                  >
                    {isCameraEnabled ? <Camera size={16} /> : <CameraOff size={16} />}
                    Test Camera
                  </button>
                  
                  <button
                    onClick={toggleMicrophone}
                    className={cn(
                      "flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                      isMicEnabled 
                        ? "bg-green-500/20 text-green-300 hover:bg-green-500/30" 
                        : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                    )}
                  >
                    {isMicEnabled ? <Mic size={16} /> : <MicOff size={16} />}
                    Test Mic
                  </button>
                </div>
              </div>

              {/* Device Info */}
              <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-gray-400">
                <p className="mb-1">📹 Cameras: {availableDevices.cameras.length}</p>
                <p className="mb-1">🎤 Microphones: {availableDevices.microphones.length}</p>
                <p>🔊 Speakers: {availableDevices.speakers.length}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Status Cards */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10 min-w-[200px]">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                isCameraLoading 
                  ? "bg-blue-500/20 text-blue-400" 
                  : isCameraEnabled && devicePermissions.camera 
                  ? "bg-green-500/20 text-green-400" 
                  : "bg-red-500/20 text-red-400"
              )}>
                {isCameraLoading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                ) : isCameraEnabled && devicePermissions.camera ? <Camera size={20} /> : <CameraOff size={20} />}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Camera {isCameraLoading ? 'Initializing...' : isCameraEnabled && devicePermissions.camera ? 'Ready' : 'Disabled'}
                </p>
                <p className="text-xs text-gray-400">
                  {isCameraLoading 
                    ? 'Setting up camera access' 
                    : devicePermissions.camera 
                    ? (isCameraEnabled ? 'Others can see you' : 'Video off') 
                    : 'Permission needed'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10 min-w-[200px]">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                isMicLoading 
                  ? "bg-blue-500/20 text-blue-400" 
                  : isMicEnabled && devicePermissions.microphone 
                  ? "bg-green-500/20 text-green-400" 
                  : "bg-red-500/20 text-red-400"
              )}>
                {isMicLoading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                ) : isMicEnabled && devicePermissions.microphone ? <Mic size={20} /> : <MicOff size={20} />}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Microphone {isMicLoading ? 'Initializing...' : isMicEnabled && devicePermissions.microphone ? 'Ready' : 'Disabled'}
                </p>
                <p className="text-xs text-gray-400">
                  {isMicLoading 
                    ? 'Setting up microphone access' 
                    : devicePermissions.microphone 
                    ? (isMicEnabled ? 'Others can hear you' : 'Audio muted') 
                    : 'Permission needed'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Join Button - Always Visible */}
        <div className="flex flex-col items-center gap-4">
          <Button
            disabled={isJoining || isCameraLoading || isMicLoading || !initializationComplete || isVideoInitializing}
            className="relative overflow-hidden bg-gradient-to-r from-green-500 via-green-600 to-green-500 hover:from-green-600 hover:via-green-700 hover:to-green-600 text-white font-bold py-6 px-12 rounded-3xl transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-green-500/40 text-xl min-w-[280px] border border-green-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            onClick={handleJoinMeeting}
          >
            <div className="flex items-center justify-center gap-4">
              {isJoining ? (
                <>
                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Joining...</span>
                </>
              ) : (isCameraLoading || isMicLoading || !initializationComplete || isVideoInitializing) ? (
                <>
                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>{isVideoInitializing ? 'Optimizing video...' : 'Setting up devices...'}</span>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <span>Join Meeting</span>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </>
              )}
            </div>
            
            {/* Enhanced button effects */}
            <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/20 to-green-400/0 animate-pulse"></div>
          </Button>
          
          {/* Quick Settings Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleCamera}
              disabled={isCameraLoading}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
                isCameraLoading
                  ? "bg-gray-500/20 text-gray-300"
                  : isCameraEnabled 
                  ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30" 
                  : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
              )}
            >
              {isCameraLoading ? (
                <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full"></div>
              ) : isCameraEnabled ? <Camera size={16} /> : <CameraOff size={16} />}
              <span>Camera</span>
            </button>
            
            <button
              onClick={toggleMicrophone}
              disabled={isMicLoading}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
                isMicLoading
                  ? "bg-gray-500/20 text-gray-300"
                  : isMicEnabled 
                  ? "bg-green-500/20 text-green-300 hover:bg-green-500/30" 
                  : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
              )}
            >
              {isMicLoading ? (
                <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full"></div>
              ) : isMicEnabled ? <Mic size={16} /> : <MicOff size={16} />}
              <span>Mic</span>
            </button>
          </div>
        </div>
        
        {/* Meeting Summary */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center max-w-md">
          <p className="text-sm text-gray-300 mb-2">
            {(isCameraLoading || isMicLoading || !initializationComplete || isVideoInitializing) ? (isVideoInitializing ? 'Optimizing video quality...' : 'Setting up your devices...') : 'Ready to join? Your current settings:'}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              {isCameraLoading ? (
                <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
              ) : isCameraEnabled && devicePermissions.camera ? (
                <Check size={16} className="text-green-400" />
              ) : (
                <CameraOff size={16} className="text-red-400" />
              )}
              <span className={cn(
                "font-medium",
                isCameraLoading 
                  ? "text-blue-400" 
                  : isCameraEnabled && devicePermissions.camera 
                  ? "text-green-400" 
                  : "text-red-400"
              )}>
                Camera {isCameraLoading ? 'Loading...' : isCameraEnabled && devicePermissions.camera ? 'On' : 'Off'}
              </span>
            </div>
            <div className="w-px h-4 bg-gray-600"></div>
            <div className="flex items-center gap-2">
              {isMicLoading ? (
                <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
              ) : isMicEnabled && devicePermissions.microphone ? (
                <Check size={16} className="text-green-400" />
              ) : (
                <MicOff size={16} className="text-red-400" />
              )}
              <span className={cn(
                "font-medium",
                isMicLoading 
                  ? "text-blue-400" 
                  : isMicEnabled && devicePermissions.microphone 
                  ? "text-green-400" 
                  : "text-red-400"
              )}>
                Mic {isMicLoading ? 'Loading...' : isMicEnabled && devicePermissions.microphone ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingSetup;
