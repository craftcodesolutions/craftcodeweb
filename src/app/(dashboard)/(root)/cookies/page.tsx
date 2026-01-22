'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Cookie, 
  Shield, 
  Settings, 
  Info, 
  CheckCircle, 
  Eye,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';

const CookiePolicyPage = () => {
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false,
  });

  const handleCookieToggle = (type: keyof typeof cookiePreferences) => {
    if (type === 'essential') return; // Essential cookies can't be disabled
    
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const cookieTypes = [
    {
      id: 'essential',
      name: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function and cannot be switched off.',
      icon: Shield,
      color: 'from-[#6EE7D8] to-[#2FD1C5]',
      required: true,
      examples: ['Authentication', 'Security', 'Load balancing']
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website by collecting information anonymously.',
      icon: BarChart3,
      color: 'from-[#2FD1C5] to-[#1E5AA8]',
      required: false,
      examples: ['Google Analytics', 'Page views', 'User behavior']
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      description: 'Used to track visitors across websites to display relevant advertisements.',
      icon: Target,
      color: 'from-[#1E5AA8] to-[#0B1C2D]',
      required: false,
      examples: ['Ad targeting', 'Social media', 'Retargeting']
    },
    {
      id: 'preferences',
      name: 'Preference Cookies',
      description: 'Remember your preferences and settings to provide a personalized experience.',
      icon: Settings,
      color: 'from-[#6EE7D8] to-[#1E5AA8]',
      required: false,
      examples: ['Theme settings', 'Language', 'Layout preferences']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D]/80 dark:to-[#050B14]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#2FD1C5]/30">
              <Cookie className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#0F172A] via-[#1E5AA8] to-[#2FD1C5] dark:from-[#E6F1F5] dark:via-[#9FB3C8] dark:to-[#6EE7D8] bg-clip-text text-transparent">
                Cookie Policy
              </h1>
              <p className="text-[#1E5AA8] dark:text-[#6EE7D8] font-medium">Transparency in Data Collection</p>
            </div>
          </div>
          
          <p className="text-xl text-[#475569] dark:text-[#9FB3C8] max-w-3xl mx-auto leading-relaxed">
            We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
            Learn about the different types of cookies we use and manage your preferences.
          </p>
        </motion.div>

        {/* Cookie Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 dark:bg-[#0B1C2D]/60 backdrop-blur-xl border border-[#DCEEEE]/70 dark:border-[#102A3A] rounded-3xl p-8 mb-12"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2FD1C5] to-[#1E5AA8] rounded-xl flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] dark:text-[#E6F1F5]">Cookie Preferences</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cookieTypes.map((cookie) => {
              const Icon = cookie.icon;
              const isEnabled = cookiePreferences[cookie.id as keyof typeof cookiePreferences];
              
              return (
                <div key={cookie.id} className="bg-[#F7FBFC]/70 dark:bg-[#0B1C2D]/50 rounded-2xl p-6 border border-[#DCEEEE]/70 dark:border-[#102A3A]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${cookie.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5]">{cookie.name}</h3>
                        {cookie.required && (
                          <span className="text-xs bg-[#E6F7F6] dark:bg-[#102A3A] text-[#1E5AA8] dark:text-[#6EE7D8] px-2 py-1 rounded-full font-medium">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleCookieToggle(cookie.id as keyof typeof cookiePreferences)}
                      disabled={cookie.required}
                      className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                        isEnabled 
                          ? 'bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8]' 
                          : 'bg-[#DCEEEE] dark:bg-[#102A3A]'
                      } ${cookie.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        isEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  
                  <p className="text-[#475569] dark:text-[#9FB3C8] text-sm mb-4 leading-relaxed">
                    {cookie.description}
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[#7B8A9A] dark:text-[#9FB3C8] uppercase tracking-wide">Examples:</p>
                    <div className="flex flex-wrap gap-2">
                      {cookie.examples.map((example, index) => (
                        <span key={index} className="text-xs bg-[#EEF7F6] dark:bg-[#102A3A] text-[#475569] dark:text-[#9FB3C8] px-2 py-1 rounded-full">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-[#DCEEEE]/70 dark:border-[#102A3A]">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] hover:from-[#1E5AA8] hover:to-[#0B1C2D] text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105">
                Save Preferences
              </button>
              <button className="px-6 py-3 bg-[#EEF7F6] dark:bg-[#0B1C2D] hover:bg-[#DCEEEE] dark:hover:bg-[#102A3A] text-[#0F172A] dark:text-[#E6F1F5] font-semibold rounded-xl transition-all duration-200">
                Accept All
              </button>
            </div>
          </div>
        </motion.div>

        {/* Detailed Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          {/* What are Cookies */}
          <div className="bg-white/80 dark:bg-[#0B1C2D]/60 backdrop-blur-xl border border-[#DCEEEE]/70 dark:border-[#102A3A] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2FD1C5] to-[#1E5AA8] rounded-xl flex items-center justify-center">
                <Info className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] dark:text-[#E6F1F5]">What are Cookies?</h3>
            </div>
            
            <div className="space-y-4 text-[#475569] dark:text-[#9FB3C8]">
              <p>
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                understanding how you use our site.
              </p>
              <p>
                We use both session cookies (which expire when you close your browser) and persistent 
                cookies (which remain on your device for a set period or until you delete them).
              </p>
            </div>
          </div>

          {/* How We Use Cookies */}
          <div className="bg-white/80 dark:bg-[#0B1C2D]/60 backdrop-blur-xl border border-[#DCEEEE]/70 dark:border-[#102A3A] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1E5AA8] to-[#2FD1C5] rounded-xl flex items-center justify-center">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] dark:text-[#E6F1F5]">How We Use Cookies</h3>
            </div>
            
            <div className="space-y-4">
              {[
                { icon: CheckCircle, text: "Authenticate users and prevent fraud", color: "text-[#2FD1C5]" },
                { icon: CheckCircle, text: "Remember your preferences and settings", color: "text-[#1E5AA8]" },
                { icon: CheckCircle, text: "Analyze site traffic and usage patterns", color: "text-[#6EE7D8]" },
                { icon: CheckCircle, text: "Provide personalized content and ads", color: "text-[#0B1C2D] dark:text-[#9FB3C8]" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className="text-[#475569] dark:text-[#9FB3C8]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Third-Party Cookies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white/80 dark:bg-[#0B1C2D]/60 backdrop-blur-xl border border-[#DCEEEE]/70 dark:border-[#102A3A] rounded-2xl p-8 mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6EE7D8] to-[#1E5AA8] rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#0F172A] dark:text-[#E6F1F5]">Third-Party Services</h3>
          </div>
          
          <p className="text-[#475569] dark:text-[#9FB3C8] mb-6">
            We work with trusted third-party services that may also set cookies on your device. These include:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Google Analytics", purpose: "Website analytics and performance monitoring", type: "Analytics" },
              { name: "Stripe", purpose: "Payment processing and fraud prevention", type: "Essential" },
              { name: "Intercom", purpose: "Customer support and communication", type: "Functional" }
            ].map((service, index) => (
              <div key={index} className="bg-[#F7FBFC]/70 dark:bg-[#0B1C2D]/50 rounded-xl p-4 border border-[#DCEEEE]/70 dark:border-[#102A3A]">
                <h4 className="font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-2">{service.name}</h4>
                <p className="text-sm text-[#475569] dark:text-[#9FB3C8] mb-3">{service.purpose}</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  service.type === 'Essential' ? 'bg-[#E6F7F6] dark:bg-[#102A3A] text-[#1E5AA8] dark:text-[#6EE7D8]' :
                  service.type === 'Analytics' ? 'bg-[#E6F1F5] dark:bg-[#102A3A] text-[#1E5AA8] dark:text-[#9FB3C8]' :
                  'bg-[#EEF7F6] dark:bg-[#102A3A] text-[#2FD1C5] dark:text-[#6EE7D8]'
                }`}>
                  {service.type}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-r from-[#6EE7D8]/15 via-[#2FD1C5]/10 to-[#1E5AA8]/10 backdrop-blur-sm border border-[#DCEEEE]/70 dark:border-[#102A3A] rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-[#E6F1F5] mb-4">Questions About Our Cookie Policy?</h3>
          <p className="text-[#475569] dark:text-[#9FB3C8] mb-6 max-w-2xl mx-auto">
            If you have any questions about how we use cookies or want to exercise your rights regarding your data, 
            please don&apos;t hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] hover:from-[#1E5AA8] hover:to-[#0B1C2D] text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105">
              Contact Support
            </button>
            <button className="px-6 py-3 bg-white/80 dark:bg-[#0B1C2D] hover:bg-[#EEF7F6] dark:hover:bg-[#102A3A] text-[#0F172A] dark:text-[#E6F1F5] font-semibold rounded-xl border border-[#DCEEEE]/70 dark:border-[#102A3A] transition-all duration-200">
              Privacy Policy
            </button>
          </div>
        </motion.div>

        {/* Last Updated */}
        <div className="text-center mt-8 text-sm text-[#7B8A9A] dark:text-[#9FB3C8]">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
