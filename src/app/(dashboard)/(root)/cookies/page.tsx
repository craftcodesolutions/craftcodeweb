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
      color: 'from-green-500 to-emerald-500',
      required: true,
      examples: ['Authentication', 'Security', 'Load balancing']
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website by collecting information anonymously.',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
      required: false,
      examples: ['Google Analytics', 'Page views', 'User behavior']
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      description: 'Used to track visitors across websites to display relevant advertisements.',
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      required: false,
      examples: ['Ad targeting', 'Social media', 'Retargeting']
    },
    {
      id: 'preferences',
      name: 'Preference Cookies',
      description: 'Remember your preferences and settings to provide a personalized experience.',
      icon: Settings,
      color: 'from-orange-500 to-red-500',
      required: false,
      examples: ['Theme settings', 'Language', 'Layout preferences']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/25">
              <Cookie className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 via-orange-800 to-amber-800 dark:from-white dark:via-orange-100 dark:to-amber-200 bg-clip-text text-transparent">
                Cookie Policy
              </h1>
              <p className="text-orange-600 dark:text-orange-400 font-medium">Transparency in Data Collection</p>
            </div>
          </div>
          
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
            Learn about the different types of cookies we use and manage your preferences.
          </p>
        </motion.div>

        {/* Cookie Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-3xl p-8 mb-12"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cookie Preferences</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cookieTypes.map((cookie) => {
              const Icon = cookie.icon;
              const isEnabled = cookiePreferences[cookie.id as keyof typeof cookiePreferences];
              
              return (
                <div key={cookie.id} className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${cookie.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{cookie.name}</h3>
                        {cookie.required && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">
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
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      } ${cookie.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        isEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                    {cookie.description}
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide">Examples:</p>
                    <div className="flex flex-wrap gap-2">
                      {cookie.examples.map((example, index) => (
                        <span key={index} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105">
                Save Preferences
              </button>
              <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-all duration-200">
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
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Info className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">What are Cookies?</h3>
            </div>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
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
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">How We Use Cookies</h3>
            </div>
            
            <div className="space-y-4">
              {[
                { icon: CheckCircle, text: "Authenticate users and prevent fraud", color: "text-green-500" },
                { icon: CheckCircle, text: "Remember your preferences and settings", color: "text-blue-500" },
                { icon: CheckCircle, text: "Analyze site traffic and usage patterns", color: "text-purple-500" },
                { icon: CheckCircle, text: "Provide personalized content and ads", color: "text-orange-500" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className="text-gray-700 dark:text-gray-300">{item.text}</span>
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
          className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-8 mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Third-Party Services</h3>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            We work with trusted third-party services that may also set cookies on your device. These include:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Google Analytics", purpose: "Website analytics and performance monitoring", type: "Analytics" },
              { name: "Stripe", purpose: "Payment processing and fraud prevention", type: "Essential" },
              { name: "Intercom", purpose: "Customer support and communication", type: "Functional" }
            ].map((service, index) => (
              <div key={index} className="bg-gray-50/50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{service.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{service.purpose}</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  service.type === 'Essential' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  service.type === 'Analytics' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                  'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
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
          className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Questions About Our Cookie Policy?</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            If you have any questions about how we use cookies or want to exercise your rights regarding your data, 
            please don&apos;t hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105">
              Contact Support
            </button>
            <button className="px-6 py-3 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200/50 dark:border-white/20 transition-all duration-200">
              Privacy Policy
            </button>
          </div>
        </motion.div>

        {/* Last Updated */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-500">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
