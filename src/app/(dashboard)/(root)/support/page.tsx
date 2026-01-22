'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Search,
  Book,
  Video,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Zap
} from 'lucide-react';

const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      availability: 'Available 24/7',
      color: 'from-[#2FD1C5] to-[#1E5AA8]',
      action: 'Start Chat',
      popular: true
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us a detailed message about your issue',
      availability: 'Response within 4 hours',
      color: 'from-[#6EE7D8] to-[#2FD1C5]',
      action: 'Send Email'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our technical experts',
      availability: 'Mon-Fri, 9AM-6PM PST',
      color: 'from-[#1E5AA8] to-[#0B1C2D]',
      action: 'Call Now'
    },
    {
      icon: Video,
      title: 'Screen Share',
      description: 'Let us help you with a guided session',
      availability: 'By appointment',
      color: 'from-[#6EE7D8] to-[#1E5AA8]',
      action: 'Schedule'
    }
  ];

  const faqCategories = [
    { id: 'all', name: 'All Topics', count: 24 },
    { id: 'getting-started', name: 'Getting Started', count: 8 },
    { id: 'meetings', name: 'Meetings', count: 6 },
    { id: 'billing', name: 'Billing', count: 4 },
    { id: 'technical', name: 'Technical', count: 6 }
  ];

  const faqs = [
    {
      category: 'getting-started',
      question: 'How do I create my first meeting?',
      answer: 'Navigate to the Conference page and click "Schedule Meeting". Fill in the meeting details and invite participants.',
      popular: true
    },
    {
      category: 'meetings',
      question: 'Can I record my meetings?',
      answer: 'Yes, meeting recording is available for Pro and Enterprise plans. Click the record button during your meeting.',
      popular: true
    },
    {
      category: 'technical',
      question: 'What browsers are supported?',
      answer: 'We support Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using the latest version of Chrome.',
      popular: false
    },
    {
      category: 'billing',
      question: 'How do I upgrade my plan?',
      answer: 'Go to Settings > Billing and select your desired plan. Changes take effect immediately.',
      popular: true
    },
    {
      category: 'meetings',
      question: 'How many participants can join a meeting?',
      answer: 'Free plans support up to 10 participants, Pro plans up to 100, and Enterprise plans up to 1000.',
      popular: false
    },
    {
      category: 'technical',
      question: 'Why is my video not working?',
      answer: 'Check your camera permissions, ensure no other apps are using your camera, and try refreshing the page.',
      popular: true
    }
  ];

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const resources = [
    {
      icon: Book,
      title: 'Documentation',
      description: 'Comprehensive guides and API references',
      link: '/docs',
      color: 'from-[#1E5AA8] to-[#2FD1C5]'
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for all features',
      link: '/tutorials',
      color: 'from-[#2FD1C5] to-[#1E5AA8]'
    },
    {
      icon: Users,
      title: 'Community Forum',
      description: 'Connect with other users and share tips',
      link: '/community',
      color: 'from-[#6EE7D8] to-[#2FD1C5]'
    },
    {
      icon: Zap,
      title: 'Status Page',
      description: 'Check system status and maintenance updates',
      link: '/status',
      color: 'from-[#6EE7D8] to-[#1E5AA8]'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D]/80 dark:to-[#050B14]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#2FD1C5]/30">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#0F172A] via-[#1E5AA8] to-[#2FD1C5] dark:from-[#E6F1F5] dark:via-[#9FB3C8] dark:to-[#6EE7D8] bg-clip-text text-transparent">
                Support Center
              </h1>
              <p className="text-[#1E5AA8] dark:text-[#6EE7D8] font-medium">We&apos;re Here to Help</p>
            </div>
          </div>
          
          <p className="text-xl text-[#475569] dark:text-[#9FB3C8] max-w-3xl mx-auto leading-relaxed">
            Get the help you need, when you need it. Our support team is available 24/7 to assist you 
            with any questions or issues you may have.
          </p>
        </motion.div>

        {/* Support Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-[#0F172A] dark:text-[#E6F1F5] text-center mb-12">
            Get Support
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <div key={index} className="relative bg-white/80 dark:bg-[#0B1C2D]/60 backdrop-blur-xl border border-[#DCEEEE]/70 dark:border-[#102A3A] rounded-2xl p-6 hover:scale-105 transition-all duration-300 group">
                  {option.popular && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#6EE7D8] to-[#1E5AA8] text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                      Popular
                    </div>
                  )}
                  
                  <div className={`w-12 h-12 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#0F172A] dark:text-[#E6F1F5] mb-2">{option.title}</h3>
                  <p className="text-[#475569] dark:text-[#9FB3C8] text-sm mb-4 leading-relaxed">
                    {option.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-[#7B8A9A] dark:text-[#9FB3C8] mb-4">
                    <Clock className="h-3 w-3" />
                    {option.availability}
                  </div>
                  
                  <button className={`w-full px-4 py-2 bg-gradient-to-r ${option.color} hover:opacity-90 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2`}>
                    {option.action}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-[#0F172A] dark:text-[#E6F1F5] text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          {/* Search and Filter */}
          <div className="bg-white/80 dark:bg-[#0B1C2D]/60 backdrop-blur-xl border border-[#DCEEEE]/70 dark:border-[#102A3A] rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#7B8A9A]" />
                <input
                  type="text"
                  placeholder="Search frequently asked questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#EEF7F6] dark:bg-[#0B1C2D] border border-[#DCEEEE] dark:border-[#102A3A] rounded-xl text-[#0F172A] dark:text-[#E6F1F5] placeholder:text-[#7B8A9A] focus:outline-none focus:ring-2 focus:ring-[#2FD1C5]/40"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto">
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] text-white'
                        : 'bg-[#EEF7F6] dark:bg-[#0B1C2D] text-[#475569] dark:text-[#9FB3C8] hover:bg-[#DCEEEE] dark:hover:bg-[#102A3A]'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div key={index} className="bg-white/80 dark:bg-[#0B1C2D]/60 backdrop-blur-xl border border-[#DCEEEE]/70 dark:border-[#102A3A] rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  {faq.popular && (
                    <div className="w-6 h-6 bg-gradient-to-r from-[#6EE7D8] to-[#1E5AA8] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-[#475569] dark:text-[#9FB3C8] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-[#0F172A] dark:text-[#E6F1F5] text-center mb-12">
            Additional Resources
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <a
                  key={index}
                  href={resource.link}
                  className="bg-white/80 dark:bg-[#0B1C2D]/60 backdrop-blur-xl border border-[#DCEEEE]/70 dark:border-[#102A3A] rounded-2xl p-6 hover:scale-105 transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${resource.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-2 flex items-center gap-2">
                    {resource.title}
                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </h3>
                  <p className="text-[#475569] dark:text-[#9FB3C8] text-sm leading-relaxed">
                    {resource.description}
                  </p>
                </a>
              );
            })}
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-r from-[#6EE7D8]/15 via-[#2FD1C5]/10 to-[#1E5AA8]/10 backdrop-blur-sm border border-[#DCEEEE]/70 dark:border-[#102A3A] rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-[#E6F1F5] mb-4">Still Need Help?</h3>
          <p className="text-[#475569] dark:text-[#9FB3C8] mb-6 max-w-2xl mx-auto">
            Can&apos;t find what you&apos;re looking for? Our support team is standing by to help you resolve any issues 
            and answer your questions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] hover:from-[#1E5AA8] hover:to-[#0B1C2D] text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Start Live Chat
            </button>
            <button className="px-6 py-3 bg-white/80 dark:bg-[#0B1C2D] hover:bg-[#EEF7F6] dark:hover:bg-[#102A3A] text-[#0F172A] dark:text-[#E6F1F5] font-semibold rounded-xl border border-[#DCEEEE]/70 dark:border-[#102A3A] transition-all duration-200 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Send Email
            </button>
          </div>
          
          <div className="mt-6 text-sm text-[#7B8A9A] dark:text-[#9FB3C8]">
            <p>Email: support@craftcode.com | Phone: +1 (555) 123-4567</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SupportPage;
