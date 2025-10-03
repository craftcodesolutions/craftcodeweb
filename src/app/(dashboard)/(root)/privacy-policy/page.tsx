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
      color: 'from-blue-500 to-cyan-500',
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
      color: 'from-green-500 to-emerald-500',
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
      color: 'from-purple-500 to-pink-500',
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
      color: 'from-orange-500 to-red-500',
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
      color: 'from-indigo-500 to-purple-500',
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
      color: 'from-teal-500 to-cyan-500',
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
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/25">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 dark:from-white dark:via-green-100 dark:to-emerald-200 bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              <p className="text-green-600 dark:text-green-400 font-medium">Your Privacy Matters</p>
            </div>
          </div>
          
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We are committed to protecting your privacy and being transparent about how we collect, 
            use, and share your information. This policy explains our privacy practices in detail.
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

        {/* Data Retention */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Data Retention Periods
          </h2>
          
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-8">
            <div className="space-y-6">
              {dataRetention.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.type}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
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
          className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Questions About Your Privacy?</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            If you have any questions about this Privacy Policy or how we handle your personal information, 
            our privacy team is here to help.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Privacy Team
            </button>
            <button className="px-6 py-3 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200/50 dark:border-white/20 transition-all duration-200 flex items-center gap-2">
              Manage Privacy Settings
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-500">
            <p>Email: privacy@craftcode.com | Data Protection Officer: dpo@craftcode.com</p>
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

export default PrivacyPolicyPage;
