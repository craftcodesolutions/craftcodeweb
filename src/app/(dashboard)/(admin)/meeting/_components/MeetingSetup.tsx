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
        setIsCameraLoading(true);
        if (isCameraEnabled) {
          await call.camera.disable();
        } else {
          await call.camera.enable();
        }
        setIsCameraEnabled(!isCameraEnabled);
        setIsCameraLoading(false);
      }
    } catch (error) {
      console.error('Error toggling camera:', error);
      setIsCameraLoading(false);
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
        title={`Your Meeting has not started yet. It is scheduled for ${callStartsAt.toLocaleString()}` }
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
              // Camera Loading State
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="relative">
                    {/* Animated Camera Icon */}
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                      <Camera size={32} className="text-white" />
                    </div>
                    {/* Loading Ring */}
                    <div className="absolute inset-0 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-white mb-2">
                      Initializing Camera...
                    </p>
                    <p className="text-sm text-gray-400">
                      Please allow camera access when prompted
                    </p>
                  </div>
                  {/* Loading Dots */}
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            ) : isCameraEnabled && devicePermissions.camera ? (
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
            ) : (
              // Camera Off Display
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                      <Users size={32} className="text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-4 border-slate-900">
                      <CameraOff size={16} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-white">
                      {devicePermissions.camera ? 'Camera is off' : 'Camera access needed'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {devicePermissions.camera ? 'Click to enable your camera' : 'Please allow camera access'}
                    </p>
                  </div>
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
            disabled={isJoining || isCameraLoading || isMicLoading || !initializationComplete}
            className="relative overflow-hidden bg-gradient-to-r from-green-500 via-green-600 to-green-500 hover:from-green-600 hover:via-green-700 hover:to-green-600 text-white font-bold py-6 px-12 rounded-3xl transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-green-500/40 text-xl min-w-[280px] border border-green-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            onClick={handleJoinMeeting}
          >
            <div className="flex items-center justify-center gap-4">
              {isJoining ? (
                <>
                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Joining...</span>
                </>
              ) : (isCameraLoading || isMicLoading || !initializationComplete) ? (
                <>
                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Setting up devices...</span>
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
            {(isCameraLoading || isMicLoading || !initializationComplete) ? 'Setting up your devices...' : 'Ready to join? Your current settings:'}
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
