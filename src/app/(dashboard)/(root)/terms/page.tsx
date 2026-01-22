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
      color: 'from-[#6EE7D8] to-[#2FD1C5]',
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
      color: 'from-[#2FD1C5] to-[#1E5AA8]',
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
      color: 'from-[#1E5AA8] to-[#0B1C2D]',
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
      color: 'from-[#6EE7D8] to-[#1E5AA8]',
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
      color: 'from-[#1E5AA8] to-[#2FD1C5]',
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
      color: 'from-[#6EE7D8] to-[#2FD1C5]',
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
      color: 'text-[#1E5AA8]'
    },
    {
      icon: Clock,
      title: 'Service Availability',
      description: 'While we strive for 99.9% uptime, we do not guarantee uninterrupted service and may perform maintenance that temporarily affects availability.',
      color: 'text-[#2FD1C5]'
    },
    {
      icon: Info,
      title: 'Changes to Terms',
      description: 'We may update these terms from time to time. Continued use of our service constitutes acceptance of any changes.',
      color: 'text-[#6EE7D8]'
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
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#0F172A] via-[#1E5AA8] to-[#2FD1C5] dark:from-[#E6F1F5] dark:via-[#9FB3C8] dark:to-[#6EE7D8] bg-clip-text text-transparent">
                Terms of Service
              </h1>
              <p className="text-[#1E5AA8] dark:text-[#6EE7D8] font-medium">Legal Framework & Guidelines</p>
            </div>
          </div>
          
          <p className="text-xl text-[#475569] dark:text-[#9FB3C8] max-w-3xl mx-auto leading-relaxed">
            These terms govern your use of CraftCode services. Please read them carefully as they contain 
            important information about your rights and obligations.
          </p>
          
          <div className="mt-6 text-sm text-[#475569] dark:text-[#9FB3C8]">
            <p>Effective Date: January 1, 2024 | Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 dark:bg-[#0B1C2D]/60 backdrop-blur-xl border border-[#DCEEEE]/70 dark:border-[#102A3A] rounded-2xl p-6 mb-12"
        >
          <h2 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2 px-3 py-2 bg-[#EEF7F6] dark:bg-[#0B1C2D] hover:bg-[#DCEEEE] dark:hover:bg-[#102A3A] rounded-lg transition-colors text-sm text-[#475569] dark:text-[#9FB3C8] hover:text-[#0F172A] dark:hover:text-white"
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
                className="bg-white/80 dark:bg-[#0B1C2D]/60 backdrop-blur-xl border border-[#DCEEEE]/70 dark:border-[#102A3A] rounded-2xl p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#0F172A] dark:text-[#E6F1F5]">{section.title}</h2>
                </div>
                
                <div className="space-y-4">
                  {section.content.map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex} className="text-[#475569] dark:text-[#9FB3C8] leading-relaxed">
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
          <h2 className="text-3xl font-bold text-[#0F172A] dark:text-[#E6F1F5] text-center mb-8">
            Important Notices
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {importantNotices.map((notice, index) => {
              const Icon = notice.icon;
              return (
                <div key={index} className="bg-white/80 dark:bg-[#0B1C2D]/60 backdrop-blur-xl border border-[#DCEEEE]/70 dark:border-[#102A3A] rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className={`h-6 w-6 ${notice.color}`} />
                    <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5]">{notice.title}</h3>
                  </div>
                  <p className="text-[#475569] dark:text-[#9FB3C8] text-sm leading-relaxed">
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
          className="bg-gradient-to-r from-[#6EE7D8]/15 via-[#2FD1C5]/10 to-[#1E5AA8]/10 backdrop-blur-sm border border-[#DCEEEE]/70 dark:border-[#102A3A] rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-[#E6F1F5] mb-4">Questions About These Terms?</h3>
          <p className="text-[#475569] dark:text-[#9FB3C8] mb-6 max-w-2xl mx-auto">
            If you have any questions about these Terms of Service or need clarification on any provisions, 
            our legal team is here to help.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] hover:from-[#1E5AA8] hover:to-[#0B1C2D] text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Legal Team
            </button>
            <button className="px-6 py-3 bg-white/80 dark:bg-[#0B1C2D] hover:bg-[#EEF7F6] dark:hover:bg-[#102A3A] text-[#0F172A] dark:text-[#E6F1F5] font-semibold rounded-xl border border-[#DCEEEE]/70 dark:border-[#102A3A] transition-all duration-200 flex items-center gap-2">
              View Privacy Policy
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
          
          <div className="mt-6 text-sm text-[#7B8A9A] dark:text-[#9FB3C8]">
            <p>Email: legal@craftcode.com | Address: 123 Tech Street, San Francisco, CA 94102</p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-[#7B8A9A] dark:text-[#9FB3C8]">
          <p>© 2024 CraftCode Solutions. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
