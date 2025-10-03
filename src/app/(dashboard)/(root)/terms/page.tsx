'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Scale, 
  Shield, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Mail,
  ExternalLink,
  Info,
  Zap
} from 'lucide-react';

const TermsOfServicePage = () => {
  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      content: [
        'By accessing and using CraftCode services, you accept and agree to be bound by the terms and provision of this agreement.',
        'If you do not agree to abide by the above, please do not use this service.',
        'These terms apply to all visitors, users, and others who access or use the service.'
      ]
    },
    {
      id: 'services',
      title: 'Description of Service',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      content: [
        'CraftCode provides video conferencing, meeting management, and collaboration tools.',
        'We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.',
        'Some features may require a paid subscription or additional fees.'
      ]
    },
    {
      id: 'accounts',
      title: 'User Accounts',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      content: [
        'You are responsible for maintaining the confidentiality of your account credentials.',
        'You agree to accept responsibility for all activities that occur under your account.',
        'You must notify us immediately of any unauthorized use of your account.',
        'We reserve the right to terminate accounts that violate these terms.'
      ]
    },
    {
      id: 'conduct',
      title: 'User Conduct',
      icon: Shield,
      color: 'from-orange-500 to-red-500',
      content: [
        'You agree not to use the service for any unlawful purpose or prohibited activity.',
        'You will not transmit any harmful, offensive, or inappropriate content.',
        'Harassment, abuse, or threatening behavior towards other users is strictly prohibited.',
        'You will not attempt to gain unauthorized access to our systems or other user accounts.'
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy and Data',
      icon: Globe,
      color: 'from-indigo-500 to-purple-500',
      content: [
        'Your privacy is important to us. Please review our Privacy Policy for details on data collection.',
        'We implement appropriate security measures to protect your personal information.',
        'You retain ownership of content you create and share through our service.',
        'We may use aggregated, anonymized data to improve our services.'
      ]
    },
    {
      id: 'intellectual',
      title: 'Intellectual Property',
      icon: Scale,
      color: 'from-teal-500 to-cyan-500',
      content: [
        'All content and materials on our service are protected by intellectual property laws.',
        'You may not copy, modify, distribute, or create derivative works without permission.',
        'You grant us a license to use content you submit for the purpose of providing our service.',
        'We respect the intellectual property rights of others and expect users to do the same.'
      ]
    }
  ];

  const importantNotices = [
    {
      icon: AlertTriangle,
      title: 'Limitation of Liability',
      description: 'Our liability is limited to the maximum extent permitted by law. We are not responsible for indirect, incidental, or consequential damages.',
      color: 'text-yellow-500'
    },
    {
      icon: Clock,
      title: 'Service Availability',
      description: 'While we strive for 99.9% uptime, we do not guarantee uninterrupted service and may perform maintenance that temporarily affects availability.',
      color: 'text-blue-500'
    },
    {
      icon: Info,
      title: 'Changes to Terms',
      description: 'We may update these terms from time to time. Continued use of our service constitutes acceptance of any changes.',
      color: 'text-purple-500'
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
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-100 dark:to-indigo-200 bg-clip-text text-transparent">
                Terms of Service
              </h1>
              <p className="text-blue-600 dark:text-blue-400 font-medium">Legal Framework & Guidelines</p>
            </div>
          </div>
          
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            These terms govern your use of CraftCode services. Please read them carefully as they contain 
            important information about your rights and obligations.
          </p>
          
          <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            <p>Effective Date: January 1, 2024 | Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 mb-12"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <section.icon className="h-4 w-4" />
                {section.title}
              </a>
            ))}
          </div>
        </motion.div>

        {/* Terms Sections */}
        <div className="space-y-8 mb-16">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
                </div>
                
                <div className="space-y-4">
                  {section.content.map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Important Notices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Important Notices
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {importantNotices.map((notice, index) => {
              const Icon = notice.icon;
              return (
                <div key={index} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className={`h-6 w-6 ${notice.color}`} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{notice.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {notice.description}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Questions About These Terms?</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            If you have any questions about these Terms of Service or need clarification on any provisions, 
            our legal team is here to help.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Legal Team
            </button>
            <button className="px-6 py-3 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200/50 dark:border-white/20 transition-all duration-200 flex items-center gap-2">
              View Privacy Policy
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-500">
            <p>Email: legal@craftcode.com | Address: 123 Tech Street, San Francisco, CA 94102</p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-500">
          <p>© 2024 CraftCode Solutions. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
