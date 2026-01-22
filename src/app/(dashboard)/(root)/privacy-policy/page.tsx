'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Eye, 
  Lock, 
  Database, 
  Users,
  Settings,
  Mail,
  ExternalLink,
  Clock
} from 'lucide-react';

const PrivacyPolicyPage = () => {
  const sections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: Database,
      color: 'from-[#2FD1C5] to-[#1E5AA8]',
      content: [
        'Personal Information: Name, email address, phone number, and profile information you provide when creating an account.',
        'Usage Data: Information about how you use our service, including meeting participation, feature usage, and interaction patterns.',
        'Device Information: Browser type, operating system, IP address, and device identifiers.',
        'Communication Data: Messages, recordings, and other content you share through our platform (with your consent).'
      ]
    },
    {
      id: 'how-we-use',
      title: 'How We Use Your Information',
      icon: Settings,
      color: 'from-[#6EE7D8] to-[#2FD1C5]',
      content: [
        'Provide and maintain our video conferencing and collaboration services.',
        'Process transactions and send related information including confirmations and invoices.',
        'Send technical notices, updates, security alerts, and support messages.',
        'Respond to comments, questions, and provide customer service.',
        'Improve our services through analytics and user feedback.',
        'Comply with legal obligations and protect against fraudulent or illegal activity.'
      ]
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing',
      icon: Users,
      color: 'from-[#1E5AA8] to-[#0B1C2D]',
      content: [
        'We do not sell, trade, or rent your personal information to third parties.',
        'Service Providers: We may share information with trusted third-party service providers who assist in operating our platform.',
        'Legal Requirements: We may disclose information when required by law or to protect our rights and safety.',
        'Business Transfers: Information may be transferred in connection with mergers, acquisitions, or asset sales.',
        'With Your Consent: We may share information for other purposes with your explicit consent.'
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: Lock,
      color: 'from-[#6EE7D8] to-[#1E5AA8]',
      content: [
        'We implement industry-standard security measures to protect your personal information.',
        'All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.',
        'Access to personal information is restricted to authorized personnel only.',
        'We regularly conduct security audits and vulnerability assessments.',
        'In the event of a data breach, we will notify affected users within 72 hours.'
      ]
    },
    {
      id: 'your-rights',
      title: 'Your Privacy Rights',
      icon: Shield,
      color: 'from-[#1E5AA8] to-[#2FD1C5]',
      content: [
        'Access: Request a copy of the personal information we hold about you.',
        'Rectification: Request correction of inaccurate or incomplete information.',
        'Erasure: Request deletion of your personal information under certain conditions.',
        'Portability: Request your data in a structured, machine-readable format.',
        'Restriction: Request limitation of processing in specific circumstances.',
        'Objection: Object to processing for direct marketing or legitimate interests.'
      ]
    },
    {
      id: 'cookies-tracking',
      title: 'Cookies and Tracking',
      icon: Eye,
      color: 'from-[#6EE7D8] to-[#2FD1C5]',
      content: [
        'We use cookies and similar technologies to enhance your experience and analyze usage.',
        'Essential cookies are necessary for the platform to function properly.',
        'Analytics cookies help us understand how users interact with our service.',
        'You can control cookie preferences through your browser settings or our cookie management tool.',
        'For detailed information, please refer to our Cookie Policy.'
      ]
    }
  ];

  const dataRetention = [
    {
      type: 'Account Information',
      period: 'Until account deletion',
      description: 'Personal profile and account settings'
    },
    {
      type: 'Meeting Data',
      period: '30 days after meeting',
      description: 'Meeting metadata and participant information'
    },
    {
      type: 'Recordings',
      period: 'As specified by user',
      description: 'Meeting recordings (user-controlled retention)'
    },
    {
      type: 'Analytics Data',
      period: '24 months',
      description: 'Aggregated usage statistics and performance data'
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
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#0F172A] via-[#1E5AA8] to-[#2FD1C5] dark:from-[#E6F1F5] dark:via-[#9FB3C8] dark:to-[#6EE7D8] bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              <p className="text-[#1E5AA8] dark:text-[#6EE7D8] font-medium">Your Privacy Matters</p>
            </div>
          </div>
          
          <p className="text-xl text-[#475569] dark:text-[#9FB3C8] max-w-3xl mx-auto leading-relaxed">
            We are committed to protecting your privacy and being transparent about how we collect, 
            use, and share your information. This policy explains our privacy practices in detail.
          </p>
          
          <div className="mt-6 text-sm text-[#7B8A9A] dark:text-[#9FB3C8]">
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
                className="flex items-center gap-2 px-3 py-2 bg-[#EEF7F6] dark:bg-[#0B1C2D] hover:bg-[#DCEEEE] dark:hover:bg-[#102A3A] rounded-lg transition-colors text-sm text-[#475569] dark:text-[#9FB3C8] hover:text-[#0F172A] dark:hover:text-[#E6F1F5]"
              >
                <section.icon className="h-4 w-4" />
                {section.title}
              </a>
            ))}
          </div>
        </motion.div>

        {/* Privacy Sections */}
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

        {/* Data Retention */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-[#0F172A] dark:text-[#E6F1F5] text-center mb-8">
            Data Retention Periods
          </h2>
          
          <div className="bg-white/80 dark:bg-[#0B1C2D]/60 backdrop-blur-xl border border-[#DCEEEE]/70 dark:border-[#102A3A] rounded-2xl p-8">
            <div className="space-y-6">
              {dataRetention.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-[#F7FBFC]/70 dark:bg-[#0B1C2D]/50 rounded-xl border border-[#DCEEEE]/70 dark:border-[#102A3A]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#2FD1C5] to-[#1E5AA8] rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5]">{item.type}</h3>
                      <p className="text-sm text-[#475569] dark:text-[#9FB3C8]">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="px-3 py-1 bg-[#E6F7F6] dark:bg-[#102A3A] text-[#1E5AA8] dark:text-[#6EE7D8] rounded-full text-sm font-medium">
                      {item.period}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-gradient-to-r from-[#6EE7D8]/15 via-[#2FD1C5]/10 to-[#1E5AA8]/10 backdrop-blur-sm border border-[#DCEEEE]/70 dark:border-[#102A3A] rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-[#E6F1F5] mb-4">Questions About Your Privacy?</h3>
          <p className="text-[#475569] dark:text-[#9FB3C8] mb-6 max-w-2xl mx-auto">
            If you have any questions about this Privacy Policy or how we handle your personal information, 
            our privacy team is here to help.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] hover:from-[#1E5AA8] hover:to-[#0B1C2D] text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Privacy Team
            </button>
            <button className="px-6 py-3 bg-white/80 dark:bg-[#0B1C2D] hover:bg-[#EEF7F6] dark:hover:bg-[#102A3A] text-[#0F172A] dark:text-[#E6F1F5] font-semibold rounded-xl border border-[#DCEEEE]/70 dark:border-[#102A3A] transition-all duration-200 flex items-center gap-2">
              Manage Privacy Settings
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
          
          <div className="mt-6 text-sm text-[#7B8A9A] dark:text-[#9FB3C8]">
            <p>Email: privacy@craftcode.com | Data Protection Officer: dpo@craftcode.com</p>
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

export default PrivacyPolicyPage;
