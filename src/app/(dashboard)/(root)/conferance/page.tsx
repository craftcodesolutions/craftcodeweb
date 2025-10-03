'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetCalls } from '@/hooks/useGetCalls';
import { StreamCallWithCustomState } from '@/types/StreamCall';
import { useAuth } from '@/context/AuthContext';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getMeetingRoomUrl, extractMeetingId } from '@/app/(dashboard)/(admin)/meeting/_components/utils/meetingUtils';
import DatePickerComponent from '@/app/(dashboard)/(admin)/meeting/_components/DatePickerComponent';

import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Link, 
  Settings,
  History,
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
  BarChart3,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSelect from './_components/AdminSelect';
import UserMeetingsList from '@/components/UserMeetingsList';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-500/30 dark:to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 dark:from-purple-500/30 dark:to-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 dark:from-cyan-500/10 dark:to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
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
                {/* Floating badges */}
                <div className="absolute -top-4 -left-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  🔥 TRENDING
                </div>
                <div className="absolute -bottom-4 -right-8 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-bounce">
                  ⚡ INSTANT
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">+</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Join 50,000+ professionals</span>
                </div>
                
                <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-100 dark:to-purple-200 bg-clip-text text-transparent leading-tight">
                  Meet Smarter,
                  <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
                    Connect Better
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  Transform your meetings from boring to brilliant with 
                  <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text font-semibold"> AI-powered insights</span>, 
                  <span className="text-transparent bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text font-semibold"> crystal-clear HD video</span>, 
                  and collaboration tools that actually work.
                </p>
                
                {/* Social Proof */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                  <div className="flex items-center gap-2 bg-gray-800/10 dark:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200/20 dark:border-white/10">
                    <div className="flex text-yellow-500 dark:text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-gray-900 dark:text-white font-semibold">4.9/5</span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">(2,847 reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-800/10 dark:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200/20 dark:border-white/10">
                    <TrendingUp size={16} className="text-green-500 dark:text-green-400" />
                    <span className="text-gray-900 dark:text-white font-semibold">98% satisfaction</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-800/10 dark:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200/20 dark:border-white/10">
                    <Users size={16} className="text-blue-500 dark:text-blue-400" />
                    <span className="text-gray-900 dark:text-white font-semibold">1M+ meetings hosted</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Feature Cards with Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {[
                {
                  icon: Link,
                  title: "Zero-Friction Joining",
                  description: "Join any meeting in under 3 seconds. No downloads, no hassle.",
                  benefit: "Save 5 minutes per meeting",
                  gradient: "from-blue-500 to-cyan-500",
                  delay: "0s",
                  badge: "INSTANT"
                },
                {
                  icon: Calendar,
                  title: "AI Smart Scheduling",
                  description: "Automatically finds the perfect time for everyone across timezones",
                  benefit: "Reduce scheduling back-and-forth by 90%",
                  gradient: "from-purple-500 to-pink-500",
                  delay: "0.2s",
                  badge: "AI-POWERED"
                },
                {
                  icon: TrendingUp,
                  title: "Real-Time Insights",
                  description: "See engagement levels, participation rates, and meeting effectiveness live",
                  benefit: "Increase meeting productivity by 40%",
                  gradient: "from-green-500 to-emerald-500",
                  delay: "0.4s",
                  badge: "ANALYTICS"
                },
                {
                  icon: Activity,
                  title: "Smart Transcription",
                  description: "AI-powered meeting notes, action items, and searchable transcripts",
                  benefit: "Never miss important details again",
                  gradient: "from-yellow-500 to-orange-500",
                  delay: "0.6s",
                  badge: "AI-NOTES"
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-3xl p-8 hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/20"
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100/50 to-transparent dark:from-white/5 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Feature Badge */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                    {feature.badge}
                  </div>
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <feature.icon size={32} className="text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-700 dark:group-hover:from-white dark:group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300 mb-4">
                      {feature.description}
                    </p>
                    
                    {/* Benefit Highlight */}
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-300">
                        <CheckCircle size={16} />
                        <span className="text-sm font-semibold">{feature.benefit}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                      <Sparkles size={16} />
                      <span className="text-sm font-medium">Available in Pro Plan</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonials Section */}
            <div className="mb-16">
              <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
                Loved by <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">50,000+</span> Teams Worldwide
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    quote: "This platform transformed our remote meetings. The AI insights helped us identify and fix communication gaps we didn't even know existed.",
                    author: "Sarah Chen",
                    role: "VP of Engineering",
                    company: "Shopify",
                    avatar: "from-blue-500 to-purple-500",
                    rating: 5
                  },
                  {
                    quote: "We've saved 15 hours per week on meeting coordination alone. The smart scheduling is a game-changer for our global team.",
                    author: "Marcus Rodriguez",
                    role: "Operations Director",
                    company: "Atlassian",
                    avatar: "from-green-500 to-emerald-500",
                    rating: 5
                  },
                  {
                    quote: "The transcription quality is incredible. I can focus on the conversation instead of taking notes. It's like having a personal assistant.",
                    author: "Emily Watson",
                    role: "Product Manager",
                    company: "Notion",
                    avatar: "from-pink-500 to-red-500",
                    rating: 5
                  }
                ].map((testimonial, index) => (
                  <div key={index} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105">
                    <div className="flex text-yellow-500 dark:text-yellow-400 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" />
                      ))}
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                      &quot;{testimonial.quote}&quot;
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.avatar} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-semibold">{testimonial.author}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{testimonial.role} at {testimonial.company}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {[
                { number: "50K+", label: "Active Users", icon: Users },
                { number: "1M+", label: "Meetings Hosted", icon: Video },
                { number: "99.9%", label: "Uptime", icon: Activity },
                { number: "4.9/5", label: "User Rating", icon: Star }
              ].map((stat, index) => (
                <div key={index} className="text-center bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300">
                  <stat.icon size={32} className="text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.number}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Enhanced CTA Section with Urgency */}
            <div className="text-center">
              <div className="relative max-w-5xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
                
                <div className="relative bg-white/90 dark:bg-white/5 backdrop-blur-2xl border border-gray-200/50 dark:border-white/20 rounded-3xl p-12">
                  {/* Limited Time Offer Banner */}
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-2xl mb-8 inline-block animate-pulse">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                      <span className="font-bold text-sm">🔥 LIMITED TIME: 50% OFF PRO PLAN - ENDS IN 48 HOURS!</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center animate-bounce shadow-2xl shadow-purple-500/50">
                      <Zap size={40} className="text-white" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Don&apos;t Let Another</h2>
                      <p className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent font-bold">Bad Meeting Happen</p>
                    </div>
                  </div>
                  
                  <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                    <span className="text-red-600 dark:text-red-400 font-semibold">Stop wasting 37% of your time</span> in unproductive meetings. 
                    Join <span className="text-green-600 dark:text-green-400 font-semibold">50,000+ professionals</span> who&apos;ve already transformed their meeting culture.
                  </p>

                  {/* Value Proposition */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">$2,400</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">Average saved per employee per year</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">15 Hours</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">Saved per week on coordination</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">40%</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">Increase in meeting productivity</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
                    <Button
                      onClick={() => router.push('/sign-up')}
                      className="group relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold px-12 py-5 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-green-500/50 text-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <span className="relative flex items-center gap-3">
                        <Sparkles size={24} />
                        Start FREE Trial Now
                        <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
                      </span>
                    </Button>
                    
                    <Button
                      onClick={() => router.push('/sign-in')}
                      className="group bg-white/10 hover:bg-white/20 text-white font-semibold px-10 py-5 rounded-2xl border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 backdrop-blur-xl text-lg"
                    >
                      <span className="flex items-center gap-3">
                        <Play size={20} />
                        Watch Demo
                        <Globe size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                      </span>
                    </Button>
                  </div>

                  {/* Enhanced Trust Signals */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                      <CheckCircle size={20} className="text-green-400" />
                      <span className="text-white font-semibold">14-Day FREE Trial</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                      <CheckCircle size={20} className="text-green-400" />
                      <span className="text-white font-semibold">No Credit Card Required</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                      <CheckCircle size={20} className="text-green-400" />
                      <span className="text-white font-semibold">Cancel Anytime</span>
                    </div>
                  </div>

                  {/* Urgency Counter */}
                  <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-center gap-4 text-orange-300">
                      <Clock size={20} className="animate-pulse" />
                      <span className="font-semibold">⏰ Limited Time Offer Expires Soon!</span>
                      <Clock size={20} className="animate-pulse" />
                    </div>
                  </div>

                  {/* Risk Reversal */}
                  <div className="text-center">
                    <p className="text-lg text-gray-300 mb-4">
                      <span className="text-green-400 font-semibold">100% Money-Back Guarantee</span> - 
                      If you don&apos;t save at least 5 hours per week, we&apos;ll refund every penny.
                    </p>
                    <p className="text-sm text-gray-400">
                      Join the meeting revolution. Your future self will thank you. 🚀
                    </p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-blue-900/10 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
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
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-100 dark:to-purple-200 bg-clip-text text-transparent leading-tight">
              Conference Hub
            </h1>
            <div className="flex items-center justify-center gap-3 text-xl text-gray-700 dark:text-gray-300">
              <Globe size={24} className="text-blue-600 dark:text-blue-400" />
              <span>Welcome back, </span>
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                {user?.firstName || user?.email?.split('@')[0] || 'User'}
              </span>
              <Sparkles size={20} className="text-yellow-500 dark:text-yellow-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 dark:bg-white/5 backdrop-blur-2xl border border-gray-200/50 dark:border-white/20 rounded-3xl p-3">
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
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/10 hover:scale-105'
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
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200/20 via-transparent to-gray-200/20 dark:from-slate-800/20 dark:via-transparent dark:to-slate-800/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-3xl p-8 min-h-[600px]">
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
    const todayMeetings = upcomingCalls?.filter((call: StreamCallWithCustomState) => {
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
    participants: [] as string[],
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

    // Validate future date
    if (formData.dateTime.getTime() <= Date.now()) {
      toast.error('Please select a future date and time');
      return;
    }

    setIsScheduling(true);
    try {
      const meetingType = 'scheduled';
      const title = formData.description || 'Conference Meeting';
      
      // Create meeting via API
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: formData.description,
          startsAt: formData.dateTime.toISOString(),
          participants: formData.participants,
          meetingType,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create meeting');
      }
      
      const { meeting, meetingUrl } = await response.json();
      
      setScheduledMeetingLink(meetingUrl);
      setMeetingScheduled(true);
      
      const participantCount = meeting.participants.length;
      toast.success(
        `Conference meeting scheduled successfully${participantCount > 1 ? ` with ${participantCount} admin participants` : ''}!`
      );
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to schedule meeting';
      toast.error(errorMessage);
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
      participants: [],
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
                <Crown size={16} className="text-yellow-400" />
                <div>
                  <p className="font-medium">Admin Participants</p>
                  <p className="text-sm text-gray-400">
                    {formData.participants.length > 0 
                      ? `${formData.participants.length + 1} admin participant${formData.participants.length > 0 ? 's' : ''} will be notified`
                      : 'Conference meeting for you only'
                    }
                  </p>
                </div>
              </div>
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

          {/* Admin Participants */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-base font-medium text-white">
              <Crown size={18} className="text-yellow-400" />
              Admin Participants
            </label>
            <div className="bg-slate-700/30 border border-white/10 rounded-xl p-4">
              <AdminSelect
                selectedAdmins={formData.participants}
                onAdminsChange={(participants) => setFormData({ ...formData, participants })}
                placeholder="Select admin participants for conference"
                allowSearch={true}
                multiple={true}
                showSelectedCount={true}
                size="md"
                className=""
              />
            </div>
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
                <Crown size={16} className="text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-white">Admin Participants</p>
                  <p className="text-xs text-gray-400">
                    {formData.participants.length > 0 
                      ? `${formData.participants.length + 1} participant${formData.participants.length > 0 ? 's' : ''} (Including you)`
                      : 'You only'
                    }
                  </p>
                </div>
              </div>
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
  const { upcomingCalls } = useGetCalls();

  const statistics = useMemo(() => {
    if (!upcomingCalls) return { total: 0, today: 0, thisWeek: 0, totalParticipants: 0 };
    
    const today = new Date();
    const todayString = today.toDateString();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    
    let todayCount = 0;
    let thisWeekCount = 0;
    let totalParticipants = 0;
    
    upcomingCalls.forEach((call: StreamCallWithCustomState) => {
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
        
        <UserMeetingsList type="upcoming" />
      </div>
    </div>
  );
};

// Previous Meetings Section Component
const PreviousMeetingsSection = ({ setActiveSection }: { 
  setActiveSection: React.Dispatch<React.SetStateAction<'overview' | 'join' | 'schedule' | 'upcoming' | 'previous'>> 
}) => {
  const { endedCalls } = useGetCalls();

  const statistics = useMemo(() => {
    if (!endedCalls) return { totalMeetings: 0, totalDuration: 0, avgDuration: 0, totalParticipants: 0 };
    
    let totalDuration = 0;
    let totalParticipants = 0;
    
    endedCalls.forEach((call: StreamCallWithCustomState) => {
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

      {/* Navigation Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setActiveSection('overview')}
          className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
        >
          <ArrowRight size={16} className="mr-2" />
          Back to Overview
        </Button>
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
        
        <UserMeetingsList type="ended" />
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