'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getMeetingRoomUrl, extractMeetingId, getMeetingShareLink } from '@/app/(dashboard)/(admin)/meeting/_components/utils/meetingUtils';
import DatePickerComponent from '@/app/(dashboard)/(admin)/meeting/_components/DatePickerComponent';
import { useGetCalls } from '@/hooks/useGetCalls';
import CallList from '@/app/(dashboard)/(admin)/meeting/_components/CallList';
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Link, 
  Settings,
  History,
  UserCheck,
  Lock,
  FileText,
  Plus,
  Sparkles,
  Zap,
  Globe,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  TrendingUp,
  Activity,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Inner Conference Page Component
const ConferencePageContent = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<'overview' | 'join' | 'schedule' | 'upcoming' | 'previous'>('overview');

  // Handle URL parameters for section navigation
  useEffect(() => {
    const section = searchParams.get('section');
    if (section && ['overview', 'join', 'schedule', 'upcoming', 'previous'].includes(section)) {
      setActiveSection(section as 'overview' | 'join' | 'schedule' | 'upcoming' | 'previous');
    }
  }, [searchParams]);

  // Render unauthenticated view with modern design
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col min-h-screen p-6">
          {/* Modern Hero Section */}
          <div className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full">
            {/* Header with floating elements */}
            <div className="text-center space-y-8 mb-16">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/25 animate-float">
                  <Video size={64} className="text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                    <Sparkles size={16} className="text-white" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
                  Conference
                  <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    Revolution
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Experience the future of virtual meetings with AI-powered features, 
                  <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold"> crystal-clear video</span>, 
                  and seamless collaboration tools.
                </p>
              </div>
            </div>

            {/* Modern Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {[
                {
                  icon: Link,
                  title: "Instant Join",
                  description: "One-click meeting access with smart link recognition",
                  gradient: "from-blue-500 to-cyan-500",
                  delay: "0s"
                },
                {
                  icon: Calendar,
                  title: "Smart Scheduling",
                  description: "AI-powered scheduling with timezone intelligence",
                  gradient: "from-purple-500 to-pink-500",
                  delay: "0.2s"
                },
                {
                  icon: TrendingUp,
                  title: "Live Analytics",
                  description: "Real-time meeting insights and engagement metrics",
                  gradient: "from-green-500 to-emerald-500",
                  delay: "0.4s"
                },
                {
                  icon: Activity,
                  title: "Meeting Intelligence",
                  description: "Advanced recording and transcription capabilities",
                  gradient: "from-yellow-500 to-orange-500",
                  delay: "0.6s"
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon size={32} className="text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {feature.description}
                    </p>
                    
                    <div className="mt-6 flex items-center gap-2 text-orange-400 group-hover:text-orange-300 transition-colors duration-300">
                      <Lock size={16} />
                      <span className="text-sm font-medium">Premium Feature</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced CTA Section */}
            <div className="text-center">
              <div className="relative max-w-4xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
                
                <div className="relative bg-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-12">
                  <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center animate-pulse">
                      <Star size={32} className="text-white" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-3xl font-bold text-white">Ready to Transform</h2>
                      <p className="text-xl text-purple-300">Your Meeting Experience?</p>
                    </div>
                  </div>
                  
                  <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Join thousands of teams already using our platform to conduct more engaging, 
                    productive, and memorable virtual meetings.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Button
                      onClick={() => router.push('/sign-in')}
                      className="group bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold px-10 py-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 text-lg"
                    >
                      <span className="flex items-center gap-3">
                        <Play size={20} />
                        Start Your Journey
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </Button>
                    
                    <Button
                      onClick={() => router.push('/sign-up')}
                      className="group bg-white/10 hover:bg-white/20 text-white font-semibold px-10 py-4 rounded-2xl border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 backdrop-blur-xl text-lg"
                    >
                      <span className="flex items-center gap-3">
                        <UserCheck size={20} />
                        Create Account
                        <Sparkles size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                      </span>
                    </Button>
                  </div>
                  
                  <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" />
                      <span>Free 14-day trial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" />
                      <span>No credit card required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" />
                      <span>Cancel anytime</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // Authenticated user view with modern design
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/10 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Modern Header */}
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="w-28 h-28 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/25 animate-float">
              <Video size={56} className="text-white" />
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                <Zap size={20} className="text-white" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
              Conference Hub
            </h1>
            <div className="flex items-center justify-center gap-3 text-xl text-gray-300">
              <Globe size={24} className="text-blue-400" />
              <span>Welcome back, </span>
              <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {user?.firstName || user?.email?.split('@')[0] || 'User'}
              </span>
              <Sparkles size={20} className="text-yellow-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-3">
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { key: 'overview', label: 'Overview', icon: Settings, gradient: 'from-blue-500 to-cyan-500' },
                  { key: 'join', label: 'Join Meeting', icon: Link, gradient: 'from-green-500 to-emerald-500' },
                  { key: 'schedule', label: 'Schedule', icon: Calendar, gradient: 'from-purple-500 to-pink-500' },
                  { key: 'upcoming', label: 'Upcoming', icon: Clock, gradient: 'from-orange-500 to-red-500' },
                  { key: 'previous', label: 'History', icon: History, gradient: 'from-indigo-500 to-purple-500' }
                ].map(({ key, label, icon: Icon, gradient }) => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key as 'overview' | 'join' | 'schedule' | 'upcoming' | 'previous')}
                    className={`group relative flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${
                      activeSection === key
                        ? `bg-gradient-to-r ${gradient} text-white shadow-2xl shadow-purple-500/25 scale-105`
                        : 'text-gray-400 hover:text-white hover:bg-white/10 hover:scale-105'
                    }`}
                  >
                    <Icon size={20} className={activeSection === key ? 'animate-pulse' : 'group-hover:scale-110 transition-transform duration-300'} />
                    <span className="font-semibold">{label}</span>
                    {activeSection === key && (
                      <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Content Area */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800/20 via-transparent to-slate-800/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 min-h-[600px]">
            {activeSection === 'overview' && <OverviewSection setActiveSection={setActiveSection} />}
            {activeSection === 'join' && <JoinMeetingSection />}
            {activeSection === 'schedule' && <ScheduleMeetingSection />}
            {activeSection === 'upcoming' && <UpcomingMeetingsSection setActiveSection={setActiveSection} />}
            {activeSection === 'previous' && <PreviousMeetingsSection setActiveSection={setActiveSection} />}
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Overview Section Component with Modern Design
const OverviewSection = ({ setActiveSection }: { setActiveSection: (section: 'overview' | 'join' | 'schedule' | 'upcoming' | 'previous') => void }) => {
  const { upcomingCalls, endedCalls } = useGetCalls();
  
  const quickStats = useMemo(() => {
    const totalUpcoming = upcomingCalls?.length || 0;
    const totalCompleted = endedCalls?.length || 0;
    const todayMeetings = upcomingCalls?.filter(call => {
      const callDate = new Date(call.state?.startsAt || '');
      return callDate.toDateString() === new Date().toDateString();
    }).length || 0;
    
    return { totalUpcoming, totalCompleted, todayMeetings };
  }, [upcomingCalls, endedCalls]);

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Your Meeting Dashboard
              </h2>
              <p className="text-gray-400 text-lg">Manage all your conferences in one place</p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center animate-pulse">
                <BarChart3 size={40} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Today's Meetings",
            value: quickStats.todayMeetings,
            icon: Clock,
            gradient: "from-green-500 to-emerald-500",
            bgGradient: "from-green-500/20 to-emerald-500/20"
          },
          {
            title: "Upcoming",
            value: quickStats.totalUpcoming,
            icon: Calendar,
            gradient: "from-blue-500 to-cyan-500",
            bgGradient: "from-blue-500/20 to-cyan-500/20"
          },
          {
            title: "Completed",
            value: quickStats.totalCompleted,
            icon: CheckCircle,
            gradient: "from-purple-500 to-pink-500",
            bgGradient: "from-purple-500/20 to-pink-500/20"
          }
        ].map((stat, index) => (
          <div key={index} className={`relative group bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
              </div>
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={28} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Quick Actions */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <Zap size={28} className="text-yellow-400" />
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              key: 'join',
              title: "Join Meeting",
              description: "Enter meeting ID or link for instant access",
              icon: Link,
              gradient: "from-green-500 to-emerald-500",
              bgGradient: "from-green-500/10 to-emerald-500/10",
              hoverShadow: "hover:shadow-green-500/25"
            },
            {
              key: 'schedule',
              title: "Schedule Meeting",
              description: "Plan your next meeting with smart scheduling",
              icon: Calendar,
              gradient: "from-purple-500 to-pink-500",
              bgGradient: "from-purple-500/10 to-pink-500/10",
              hoverShadow: "hover:shadow-purple-500/25"
            },
            {
              key: 'upcoming',
              title: "View Upcoming",
              description: "Manage your scheduled meetings and events",
              icon: Clock,
              gradient: "from-blue-500 to-cyan-500",
              bgGradient: "from-blue-500/10 to-cyan-500/10",
              hoverShadow: "hover:shadow-blue-500/25"
            }
          ].map((action) => (
            <div 
              key={action.key}
              onClick={() => setActiveSection(action.key as 'overview' | 'join' | 'schedule' | 'upcoming' | 'previous')}
              className={`group relative bg-gradient-to-br ${action.bgGradient} backdrop-blur-xl border border-white/10 rounded-3xl p-8 cursor-pointer hover:scale-105 transition-all duration-500 hover:shadow-2xl ${action.hoverShadow}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 space-y-6">
                <div className={`w-18 h-18 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  <action.icon size={36} className="text-white" />
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                    {action.title}
                  </h4>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-white/70 group-hover:text-white transition-colors duration-300">
                  <span className="text-sm font-medium">Get Started</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Recent Activity */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <Activity size={28} className="text-purple-400" />
          Recent Activity
        </h3>
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800/20 via-transparent to-slate-800/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="space-y-6">
              {(() => {
                // Combine recent ended calls and upcoming calls for activity feed
                const recentEndedCalls = endedCalls?.slice(0, 2) || [];
                const nextUpcomingCall = upcomingCalls?.slice(0, 1) || [];
                const allActivities = [...recentEndedCalls, ...nextUpcomingCall];

                if (allActivities.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Activity size={32} className="text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">No Recent Activity</h4>
                      <p className="text-gray-400">Your meeting activity will appear here</p>
                    </div>
                  );
                }

                return allActivities.map((call) => {
                  const isUpcoming = upcomingCalls?.includes(call);
                  const meetingDate = new Date(call.state?.startsAt || '');
                  const now = new Date();
                  const title = call.state?.custom?.description || 'Untitled Meeting';
                  
                  let timeText = '';
                  let status = '';
                  let statusColor = '';
                  let gradient = '';
                  let IconComponent = Video;
                  
                  if (isUpcoming) {
                    const diffInHours = (meetingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                    if (diffInHours < 1 && diffInHours > 0) {
                      timeText = `Starting in ${Math.round(diffInHours * 60)} minutes`;
                      status = 'Starting Soon';
                      statusColor = 'text-yellow-400';
                    } else if (diffInHours < 24) {
                      timeText = `Starting in ${Math.round(diffInHours)} hours`;
                      status = 'Today';
                      statusColor = 'text-blue-400';
                    } else {
                      timeText = meetingDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      status = 'Upcoming';
                      statusColor = 'text-blue-400';
                    }
                    gradient = 'from-blue-500 to-cyan-500';
                    IconComponent = Calendar;
                  } else {
                    // Ended call
                    const diffInHours = (now.getTime() - meetingDate.getTime()) / (1000 * 60 * 60);
                    if (diffInHours < 1) {
                      timeText = `Completed ${Math.round(diffInHours * 60)} minutes ago`;
                    } else if (diffInHours < 24) {
                      timeText = `Completed ${Math.round(diffInHours)} hours ago`;
                    } else {
                      timeText = `Completed on ${meetingDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric'
                      })}`;
                    }
                    status = 'Completed';
                    statusColor = 'text-green-400';
                    gradient = 'from-green-500 to-emerald-500';
                    IconComponent = Video;
                  }

                  // Calculate duration
                  let duration = '60 minutes'; // Default
                  if (!isUpcoming && call.state?.startsAt && call.state?.endedAt) {
                    const startTime = new Date(call.state.startsAt);
                    const endTime = new Date(call.state.endedAt);
                    const durationMs = endTime.getTime() - startTime.getTime();
                    const durationMinutes = Math.round(durationMs / (1000 * 60));
                    duration = `${durationMinutes} minutes`;
                  }

                  return (
                    <div key={call.id} className="group flex items-center gap-6 p-6 bg-white/5 hover:bg-white/10 rounded-2xl transition-all duration-300 hover:scale-[1.02]">
                      <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <IconComponent size={24} className="text-white" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <h4 className="text-lg font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                          {title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{timeText}</span>
                          <span>•</span>
                          <span>{duration}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusColor} bg-white/10 backdrop-blur-sm`}>
                          <div className={`w-2 h-2 rounded-full ${statusColor.replace('text-', 'bg-')} animate-pulse`}></div>
                          {status}
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Join Meeting Section Component
const JoinMeetingSection = () => {
  const router = useRouter();
  const [meetingLink, setMeetingLink] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinMeeting = async () => {
    if (!meetingLink.trim()) {
      toast.error('Please enter a meeting link or ID');
      return;
    }

    setIsJoining(true);
    try {
      // Extract meeting ID from the link
      const meetingId = extractMeetingId(meetingLink);
      if (meetingId) {
        router.push(getMeetingRoomUrl(meetingId));
      } else {
        toast.error('Invalid meeting link or ID');
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
      toast.error('Failed to join meeting');
    } finally {
      setIsJoining(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.includes('meeting') || text.includes('http')) {
        setMeetingLink(text);
        toast.success('Link pasted from clipboard!');
      } else {
        toast.error('No valid meeting link found in clipboard');
      }
    } catch {
      toast.error('Unable to read clipboard');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <Link size={36} className="text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Join Meeting</h2>
          <p className="text-gray-400">Enter the meeting link or ID to join an existing meeting</p>
        </div>
      </div>

      {/* Join Form */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-8 space-y-6">
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-base font-medium text-white">
            <Link size={18} className="text-blue-400" />
            Meeting Link or ID
          </label>
          <div className="relative">
            <Link size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="https://meeting.example.com/meeting-id or paste meeting ID"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="pl-10 bg-slate-700/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-gray-400 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleJoinMeeting()}
            />
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700/70 border border-white/10 rounded-xl text-sm text-white transition-all duration-300 hover:scale-[1.02]"
            >
              📋 Paste from Clipboard
            </button>
            <button
              type="button"
              onClick={() => setMeetingLink('')}
              className="px-4 py-3 bg-slate-700/50 hover:bg-slate-700/70 border border-white/10 rounded-xl text-sm text-white transition-all duration-300 hover:scale-[1.02]"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Join Button */}
        <Button
          onClick={handleJoinMeeting}
          disabled={isJoining || !meetingLink.trim()}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {isJoining ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              Joining Meeting...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Video size={20} />
              Join Meeting
            </div>
          )}
        </Button>

        {/* Help Text */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="text-sm text-blue-300">
            💡 <strong>Tip:</strong> You can paste the full meeting URL or just the meeting ID. Both formats are supported.
          </div>
        </div>
      </div>

      {/* Recent Meetings */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <History size={20} className="text-purple-400" />
          Recent Meetings
        </h3>
        <RecentMeetingsList setMeetingLink={setMeetingLink} />
      </div>
    </div>
  );
};

// Recent Meetings List Component
const RecentMeetingsList = ({ setMeetingLink }: { setMeetingLink: (link: string) => void }) => {
  const { endedCalls, upcomingCalls } = useGetCalls();
  const recentMeetings = [...(endedCalls?.slice(0, 2) || []), ...(upcomingCalls?.slice(0, 1) || [])];
  
  if (recentMeetings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center mx-auto mb-3">
          <History size={24} className="text-white" />
        </div>
        <p className="text-gray-400 text-sm">No recent meetings found</p>
        <p className="text-gray-500 text-xs mt-1">Your meeting history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentMeetings.map((meeting) => {
        const isUpcoming = upcomingCalls?.includes(meeting);
        const title = meeting.state?.custom?.description || 'Untitled Meeting';
        const meetingId = meeting.id.slice(0, 12);
        
        return (
          <div key={meeting.id} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors cursor-pointer">
            <div className={`w-10 h-10 bg-gradient-to-br ${isUpcoming ? 'from-blue-500 to-cyan-500' : 'from-green-500 to-emerald-500'} rounded-lg flex items-center justify-center`}>
              {isUpcoming ? <Calendar size={16} className="text-white" /> : <Video size={16} className="text-white" />}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">{title}</p>
              <p className="text-gray-400 text-xs">{meetingId}...</p>
            </div>
            <button 
              onClick={() => setMeetingLink(meeting.id)}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Use ID
            </button>
          </div>
        );
      })}
    </div>
  );
};
// Schedule Meeting Section Component
const ScheduleMeetingSection = () => {
  const client = useStreamVideoClient();
  const { user } = useAuth();
  const [isScheduling, setIsScheduling] = useState(false);
  const [meetingScheduled, setMeetingScheduled] = useState(false);
  const [scheduledMeetingLink, setScheduledMeetingLink] = useState('');
  const [formData, setFormData] = useState({
    dateTime: new Date(),
    description: '',
  });

  const handleScheduleMeeting = async () => {
    if (!client || !user) {
      toast.error('Please sign in to schedule meetings');
      return;
    }

    if (!formData.dateTime) {
      toast.error('Please select a date and time');
      return;
    }

    setIsScheduling(true);
    try {
      const id = crypto.randomUUID();
      const call = client.call('default', id);
      
      if (!call) throw new Error('Failed to create meeting');
      
      const startsAt = formData.dateTime.toISOString();
      const description = formData.description || 'Scheduled Meeting';
      
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });

      const meetingLink = getMeetingShareLink(id);
      setScheduledMeetingLink(meetingLink);
      setMeetingScheduled(true);
      toast.success('Meeting scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast.error('Failed to schedule meeting');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(scheduledMeetingLink);
    toast.success('Meeting link copied to clipboard!');
  };

  const resetForm = () => {
    setMeetingScheduled(false);
    setScheduledMeetingLink('');
    setFormData({
      dateTime: new Date(),
      description: '',
    });
  };

  if (meetingScheduled) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Meeting Scheduled Successfully!</h2>
            <p className="text-gray-400">Your meeting has been created and is ready to share</p>
          </div>
        </div>

        {/* Meeting Details */}
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-8 space-y-6">
          <div className="bg-slate-700/30 border border-white/10 rounded-xl p-6 space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">Meeting Details</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar size={16} className="text-blue-400" />
                <span className="font-medium">
                  {formData.dateTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Clock size={16} className="text-green-400" />
                <span className="font-medium">
                  {formData.dateTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </span>
              </div>
              {formData.description && (
                <div className="flex items-start gap-3 text-gray-300">
                  <FileText size={16} className="text-purple-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Description</p>
                    <p className="text-sm text-gray-400">{formData.description}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-300">
                <Link size={16} className="text-yellow-400" />
                <span className="text-sm font-mono bg-slate-800/50 px-3 py-2 rounded-lg truncate flex-1">
                  {scheduledMeetingLink}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleCopyLink}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2">
                <Link size={18} />
                Copy Meeting Link
              </div>
            </Button>
            <Button
              onClick={resetForm}
              className="px-6 bg-slate-700/50 hover:bg-slate-700/70 text-white font-semibold py-3 rounded-xl border border-white/10 transition-all duration-300 hover:scale-[1.02]"
            >
              Schedule Another
            </Button>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="text-sm text-green-300">
              ✅ <strong>Success:</strong> Share this link with participants to join the meeting at the scheduled time.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Calendar size={36} className="text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Schedule Meeting</h2>
          <p className="text-gray-400">Plan and schedule a new meeting with participants</p>
        </div>
      </div>

      {/* Schedule Form */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-8 space-y-6">
        <div className="space-y-6">
          {/* Meeting Description */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-base font-medium text-white">
              <FileText size={18} className="text-purple-400" />
              Meeting Description
            </label>
            <Textarea
              placeholder="Enter meeting description (optional)"
              value={formData.description}
              className="min-h-[80px] bg-slate-700/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-400 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 resize-none"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Date and Time */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-base font-medium text-white">
              <Calendar size={18} className="text-blue-400" />
              Meeting Date & Time
            </label>
            <div className="bg-slate-700/30 border border-white/10 rounded-xl p-4">
              <DatePickerComponent
                selectedDate={formData.dateTime.toISOString()}
                onChange={(date) => {
                  if (date) {
                    setFormData({ ...formData, dateTime: date });
                  }
                }}
                placeholder="Select meeting date and time"
                required
              />
            </div>
          </div>

          {/* Quick Time Presets */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Clock size={16} className="text-green-400" />
              Quick Time Presets
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: 'Now', minutes: 0 },
                { label: '30 min', minutes: 30 },
                { label: '1 hour', minutes: 60 },
                { label: '2 hours', minutes: 120 }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    const newDate = new Date();
                    newDate.setMinutes(newDate.getMinutes() + preset.minutes);
                    setFormData({ ...formData, dateTime: newDate });
                  }}
                  className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700/70 border border-white/10 rounded-lg text-xs text-white transition-all duration-300 hover:scale-105"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Meeting Preview */}
          <div className="bg-gradient-to-r from-slate-700/30 to-slate-600/30 border border-white/10 rounded-xl p-4 space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium text-white">
              <Users size={16} className="text-yellow-400" />
              Meeting Preview
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg">
                <Calendar size={16} className="text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-white">
                    {formData.dateTime.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formData.dateTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </p>
                </div>
              </div>
              {formData.description && (
                <div className="flex items-start gap-3 p-2 bg-slate-800/50 rounded-lg">
                  <FileText size={16} className="text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Description</p>
                    <p className="text-xs text-gray-400 line-clamp-2">{formData.description}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg">
                <Clock size={16} className="text-green-400" />
                <div>
                  <p className="text-sm font-medium text-white">Duration</p>
                  <p className="text-xs text-gray-400">60 minutes (default)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Button */}
        <Button
          onClick={handleScheduleMeeting}
          disabled={isScheduling}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {isScheduling ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              Scheduling Meeting...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Calendar size={20} />
              Schedule Meeting
            </div>
          )}
        </Button>

        {/* Help Text */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <div className="text-sm text-purple-300">
            📅 <strong>Note:</strong> Once scheduled, you&apos;ll receive a meeting link to share with participants.
          </div>
        </div>
      </div>
    </div>
  );
};
// Upcoming Meetings Section Component
const UpcomingMeetingsSection = ({ setActiveSection }: { setActiveSection: (section: 'overview' | 'join' | 'schedule' | 'upcoming' | 'previous') => void }) => {
  const { upcomingCalls, isLoading } = useGetCalls();

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-pulse shadow-xl shadow-green-500/30">
          <Clock size={36} className="text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Upcoming Meetings</h2>
          <p className="text-gray-400">Manage your scheduled meetings and join them when ready</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 rounded-xl p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Calendar size={24} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">{statistics.total}</p>
          <p className="text-sm text-gray-400">Total Upcoming</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/10 rounded-xl p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Clock size={24} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">{statistics.today}</p>
          <p className="text-sm text-gray-400">Today</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 rounded-xl p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Users size={24} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">{statistics.thisWeek}</p>
          <p className="text-sm text-gray-400">This Week</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-white/10 rounded-xl p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Users size={24} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">{statistics.totalParticipants}</p>
          <p className="text-sm text-gray-400">Expected Participants</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center">
        <Button
          onClick={() => setActiveSection('schedule')}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105"
        >
          <Plus size={20} className="mr-2" />
          Schedule New Meeting
        </Button>
      </div>

      {/* Meetings List */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Calendar size={24} className="text-green-400" />
          Your Upcoming Meetings
        </h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"></div>
          </div>
        ) : upcomingCalls && upcomingCalls.length > 0 ? (
          <CallList type="upcoming" />
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar size={48} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No upcoming meetings</h3>
            <p className="text-gray-400 mb-6">Schedule your first meeting to get started</p>
            <Button
              onClick={() => setActiveSection('schedule')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <Plus size={20} className="mr-2" />
              Schedule Your First Meeting
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Previous Meetings Section Component
const PreviousMeetingsSection = ({ setActiveSection }: { setActiveSection: (section: 'overview' | 'join' | 'schedule' | 'upcoming' | 'previous') => void }) => {
  const { endedCalls, isLoading } = useGetCalls();

  const statistics = useMemo(() => {
    if (!endedCalls) return { totalMeetings: 0, totalDuration: 0, avgDuration: 0, totalParticipants: 0 };
    
    let totalDuration = 0;
    let totalParticipants = 0;
    
    endedCalls.forEach(call => {
      const startTime = call.state?.startsAt ? new Date(call.state.startsAt) : null;
      const endTime = call.state?.endedAt ? new Date(call.state.endedAt) : null;
      
      if (startTime && endTime) {
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationMinutes = Math.round(durationMs / (1000 * 60));
        totalDuration += durationMinutes;
      } else {
        totalDuration += 45; // Default 45 minutes
      }
      
      const participantCount = call.state?.members?.length || 1;
      totalParticipants += participantCount;
    });
    
    const avgDuration = endedCalls.length > 0 ? Math.round(totalDuration / endedCalls.length) : 0;
    
    return {
      totalMeetings: endedCalls.length,
      totalDuration,
      avgDuration,
      totalParticipants
    };
  }, [endedCalls]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto animate-pulse shadow-xl shadow-purple-500/30">
          <History size={36} className="text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Meeting History</h2>
          <p className="text-gray-400">Review your past meetings and analyze your meeting patterns</p>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 rounded-xl p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <History size={24} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">{statistics.totalMeetings}</p>
          <p className="text-sm text-gray-400">Total Meetings</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10 rounded-xl p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Clock size={24} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">{statistics.totalDuration}m</p>
          <p className="text-sm text-gray-400">Total Duration</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/10 rounded-xl p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Clock size={24} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">{statistics.avgDuration}m</p>
          <p className="text-sm text-gray-400">Avg Duration</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-white/10 rounded-xl p-6 text-center hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Users size={24} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">{statistics.totalParticipants}</p>
          <p className="text-sm text-gray-400">Total Participants</p>
        </div>
      </div>

      {/* Meetings List */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <History size={24} className="text-purple-400" />
          Your Meeting History
        </h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        ) : endedCalls && endedCalls.length > 0 ? (
          <CallList type="ended" />
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <History size={48} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No meeting history</h3>
            <p className="text-gray-400 mb-6">Your completed meetings will appear here</p>
            <Button
              onClick={() => setActiveSection('schedule')}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <Calendar size={20} className="mr-2" />
              Schedule a Meeting
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrapper component with Suspense
const ConferencePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConferencePageContent />
    </Suspense>
  );
};

export default ConferencePage;