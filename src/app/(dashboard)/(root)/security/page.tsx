'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  Server, 
  AlertTriangle,
  CheckCircle,
  Zap,
  Globe,
  Database,
  UserCheck,
  FileText,
  Clock,
  Award
} from 'lucide-react';

const SecurityPage = () => {
  const securityFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All data is encrypted in transit and at rest using industry-standard AES-256 encryption.",
      color: "from-green-500 to-emerald-500",
      details: ["TLS 1.3 for data in transit", "AES-256 for data at rest", "Zero-knowledge architecture"]
    },
    {
      icon: Key,
      title: "Multi-Factor Authentication",
      description: "Secure your account with multiple layers of authentication including SMS, email, and authenticator apps.",
      color: "from-blue-500 to-cyan-500",
      details: ["TOTP authenticator support", "SMS verification", "Email confirmation", "Backup codes"]
    },
    {
      icon: Server,
      title: "Secure Infrastructure",
      description: "Our infrastructure is hosted on enterprise-grade cloud platforms with 99.9% uptime guarantee.",
      color: "from-purple-500 to-pink-500",
      details: ["AWS/Azure hosting", "Auto-scaling", "Load balancing", "DDoS protection"]
    },
    {
      icon: Eye,
      title: "Privacy by Design",
      description: "We collect only the minimum data necessary and give you full control over your information.",
      color: "from-orange-500 to-red-500",
      details: ["Data minimization", "User consent", "Right to deletion", "Data portability"]
    }
  ];

  const certifications = [
    {
      icon: Award,
      title: "SOC 2 Type II",
      description: "Independently audited for security, availability, and confidentiality.",
      status: "Certified"
    },
    {
      icon: Shield,
      title: "ISO 27001",
      description: "International standard for information security management systems.",
      status: "Compliant"
    },
    {
      icon: Globe,
      title: "GDPR Compliant",
      description: "Full compliance with European data protection regulations.",
      status: "Verified"
    },
    {
      icon: FileText,
      title: "CCPA Compliant",
      description: "California Consumer Privacy Act compliance for US users.",
      status: "Certified"
    }
  ];

  const securityPractices = [
    {
      category: "Access Control",
      icon: UserCheck,
      practices: [
        "Role-based access control (RBAC)",
        "Principle of least privilege",
        "Regular access reviews",
        "Automated deprovisioning"
      ]
    },
    {
      category: "Data Protection",
      icon: Database,
      practices: [
        "Data encryption at rest and in transit",
        "Regular security backups",
        "Data loss prevention (DLP)",
        "Secure data disposal"
      ]
    },
    {
      category: "Monitoring & Response",
      icon: AlertTriangle,
      practices: [
        "24/7 security monitoring",
        "Incident response team",
        "Threat intelligence integration",
        "Automated threat detection"
      ]
    },
    {
      category: "Compliance",
      icon: CheckCircle,
      practices: [
        "Regular security audits",
        "Penetration testing",
        "Vulnerability assessments",
        "Compliance reporting"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
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
                Security Center
              </h1>
              <p className="text-green-600 dark:text-green-400 font-medium">Your Trust, Our Priority</p>
            </div>
          </div>
          
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We implement industry-leading security measures to protect your data and ensure your privacy. 
            Learn about our comprehensive security framework and compliance standards.
          </p>
        </motion.div>

        {/* Security Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Enterprise-Grade Security Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-8 hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Certifications & Compliance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => {
              const Icon = cert.icon;
              return (
                <div key={index} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{cert.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{cert.description}</p>
                  
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                    <CheckCircle className="h-3 w-3" />
                    {cert.status}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Security Practices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Security Practices & Procedures
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {securityPractices.map((practice, index) => {
              const Icon = practice.icon;
              return (
                <div key={index} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{practice.category}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {practice.practices.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Incident Response */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Incident Response</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">24/7 Monitoring</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Continuous monitoring of our systems with automated threat detection and real-time alerts.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Expert Team</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Dedicated security professionals with extensive experience in incident response and forensics.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Rapid Response</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Immediate containment and mitigation procedures with transparent communication to affected users.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Report Security Issues</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            If you discover a security vulnerability, please report it to our security team immediately. 
            We take all reports seriously and will respond within 24 hours.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105">
              Report Vulnerability
            </button>
            <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-all duration-200">
              Security Contact
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-500">
            <p>Email: security@craftcode.com | PGP Key Available</p>
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

export default SecurityPage;
