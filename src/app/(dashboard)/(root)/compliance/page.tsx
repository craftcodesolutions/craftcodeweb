'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  FileText, 
  Globe, 
  Award, 
  CheckCircle, 
  Eye,
  Lock,
  Users,
  AlertCircle,
  Download,
  ExternalLink,
  Calendar,
  Building
} from 'lucide-react';

const CompliancePage = () => {
  const complianceFrameworks = [
    {
      icon: Globe,
      title: "GDPR Compliance",
      description: "Full compliance with the European General Data Protection Regulation",
      status: "Certified",
      color: "from-[#6EE7D8] to-[#2FD1C5]",
      details: [
        "Data Protection Impact Assessments",
        "Right to be forgotten implementation",
        "Data portability features",
        "Consent management system"
      ],
      lastAudit: "March 2024"
    },
    {
      icon: Building,
      title: "CCPA Compliance",
      description: "California Consumer Privacy Act compliance for US users",
      status: "Verified",
      color: "from-[#2FD1C5] to-[#1E5AA8]",
      details: [
        "Consumer rights portal",
        "Data disclosure practices",
        "Opt-out mechanisms",
        "Third-party data sharing controls"
      ],
      lastAudit: "February 2024"
    },
    {
      icon: Shield,
      title: "SOC 2 Type II",
      description: "Security, availability, and confidentiality controls audit",
      status: "Certified",
      color: "from-[#1E5AA8] to-[#0B8ED8]",
      details: [
        "Security controls assessment",
        "Availability monitoring",
        "Processing integrity verification",
        "Confidentiality measures"
      ],
      lastAudit: "January 2024"
    },
    {
      icon: Award,
      title: "ISO 27001",
      description: "Information Security Management System certification",
      status: "Compliant",
      color: "from-[#0FD9C3] to-[#0B8ED8]",
      details: [
        "Risk management framework",
        "Security policy implementation",
        "Incident response procedures",
        "Continuous improvement process"
      ],
      lastAudit: "December 2023"
    }
  ];

  const dataRights = [
    {
      icon: Eye,
      title: "Right to Access",
      description: "Request a copy of all personal data we hold about you",
      action: "Request Data Export"
    },
    {
      icon: FileText,
      title: "Right to Rectification",
      description: "Correct any inaccurate or incomplete personal data",
      action: "Update Information"
    },
    {
      icon: AlertCircle,
      title: "Right to Erasure",
      description: "Request deletion of your personal data under certain conditions",
      action: "Delete Account"
    },
    {
      icon: Lock,
      title: "Right to Restrict Processing",
      description: "Limit how we process your personal data in specific circumstances",
      action: "Manage Preferences"
    },
    {
      icon: Download,
      title: "Right to Data Portability",
      description: "Receive your data in a structured, machine-readable format",
      action: "Export Data"
    },
    {
      icon: Users,
      title: "Right to Object",
      description: "Object to processing of your data for direct marketing purposes",
      action: "Opt Out"
    }
  ];

  const auditReports = [
    {
      title: "SOC 2 Type II Report",
      date: "January 2024",
      type: "Security Audit",
      status: "Available",
      description: "Comprehensive security controls assessment"
    },
    {
      title: "GDPR Compliance Assessment",
      date: "March 2024",
      type: "Privacy Audit",
      status: "Available",
      description: "Data protection and privacy compliance review"
    },
    {
      title: "Penetration Testing Report",
      date: "February 2024",
      type: "Security Testing",
      status: "Summary Available",
      description: "Third-party security vulnerability assessment"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#102A3A]">
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
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#0F172A] via-[#1E5AA8] to-[#2FD1C5] dark:from-[#E6F1F5] dark:via-[#9FB3C8] dark:to-[#6EE7D8] bg-clip-text text-transparent">
                Compliance Center
              </h1>
              <p className="text-[#1E5AA8] dark:text-[#6EE7D8] font-medium">Regulatory Excellence</p>
            </div>
          </div>
          
          <p className="text-xl text-[#475569] dark:text-[#9FB3C8] max-w-3xl mx-auto leading-relaxed">
            We maintain the highest standards of regulatory compliance to protect your data and ensure 
            transparency in our operations. Explore our certifications, audit reports, and data rights.
          </p>
        </motion.div>

        {/* Compliance Frameworks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-[#0F172A] dark:text-[#E6F1F5] text-center mb-12">
            Compliance Frameworks
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {complianceFrameworks.map((framework, index) => {
              const Icon = framework.icon;
              return (
                <div key={index} className="bg-white/80 dark:bg-[#0B1C2D]/80 backdrop-blur-xl border border-[#DCEEEE]/70 dark:border-[#1E3A4A]/60 rounded-2xl p-8 hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${framework.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#0F172A] dark:text-[#E6F1F5]">{framework.title}</h3>
                        <p className="text-sm text-[#7B8A9A] dark:text-[#6B8299]">Last audit: {framework.lastAudit}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                      <CheckCircle className="h-3 w-3" />
                      {framework.status}
                    </span>
                  </div>
                  
                  <p className="text-[#475569] dark:text-[#9FB3C8] mb-6 leading-relaxed">
                    {framework.description}
                  </p>
                  
                  <div className="space-y-2">
                    {framework.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-[#6EE7D8] to-[#1E5AA8] rounded-full"></div>
                        <span className="text-sm text-[#7B8A9A] dark:text-[#6B8299]">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Data Rights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-[#0F172A] dark:text-[#E6F1F5] text-center mb-12">
            Your Data Rights
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataRights.map((right, index) => {
              const Icon = right.icon;
              return (
                <div key={index} className="bg-white/80 dark:bg-[#0B1C2D]/80 backdrop-blur-xl border border-[#DCEEEE]/70 dark:border-[#1E3A4A]/60 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#E6F1F5] mb-2">{right.title}</h3>
                  <p className="text-sm text-[#7B8A9A] dark:text-[#6B8299] mb-4 leading-relaxed">
                    {right.description}
                  </p>
                  
                  <button className="w-full px-4 py-2 bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] hover:from-[#2FD1C5] hover:via-[#1FA2FF] hover:to-[#1E5AA8] text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 text-sm">
                    {right.action}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Audit Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-[#0F172A] dark:text-[#E6F1F5] text-center mb-12">
            Audit Reports & Certifications
          </h2>
          
          <div className="bg-white/80 dark:bg-[#0B1C2D]/80 backdrop-blur-xl border border-[#DCEEEE]/70 dark:border-[#1E3A4A]/60 rounded-2xl p-8">
            <div className="space-y-6">
              {auditReports.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-6 bg-[#F7FBFC]/80 dark:bg-[#0B1C2D]/60 rounded-xl border border-[#DCEEEE]/70 dark:border-[#1E3A4A]/60">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#6EE7D8] to-[#2FD1C5] rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5]">{report.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-[#7B8A9A] dark:text-[#6B8299]">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {report.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          {report.type}
                        </span>
                      </div>
                      <p className="text-sm text-[#7B8A9A] dark:text-[#6B8299] mt-1">{report.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.status === 'Available' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-[#EEF7F6] dark:bg-[#102A3A] text-[#1E5AA8] dark:text-[#6EE7D8]'
                    }`}>
                      {report.status}
                    </span>
                    <button className="p-2 bg-[#EEF7F6] dark:bg-[#102A3A] text-[#1E5AA8] dark:text-[#6EE7D8] rounded-lg hover:bg-[#DCEEEE] dark:hover:bg-[#1E3A4A] transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-[#DCEEEE]/70 dark:border-[#1E3A4A]/60 text-center">
              <p className="text-sm text-[#7B8A9A] dark:text-[#6B8299] mb-4">
                Need access to additional compliance documentation?
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] hover:from-[#2FD1C5] hover:via-[#1FA2FF] hover:to-[#1E5AA8] text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105">
                Request Documentation
              </button>
            </div>
          </div>
        </motion.div>

        {/* Compliance Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-r from-[#6EE7D8]/10 via-[#2FD1C5]/10 to-[#1E5AA8]/10 backdrop-blur-sm border border-[#DCEEEE]/70 dark:border-[#1E3A4A]/60 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-[#0F172A] dark:text-[#E6F1F5] mb-4">Compliance Questions?</h3>
          <p className="text-[#475569] dark:text-[#9FB3C8] mb-6 max-w-2xl mx-auto">
            Our compliance team is here to help with any questions about our certifications, 
            data handling practices, or regulatory requirements.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] hover:from-[#2FD1C5] hover:via-[#1FA2FF] hover:to-[#1E5AA8] text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105">
              Contact Compliance Team
            </button>
            <button className="px-6 py-3 bg-white/70 dark:bg-[#0B1C2D]/70 hover:bg-[#EEF7F6] dark:hover:bg-[#102A3A] text-[#0F172A] dark:text-[#E6F1F5] font-semibold rounded-xl border border-[#DCEEEE]/70 dark:border-[#1E3A4A]/60 transition-all duration-200 flex items-center gap-2">
              View Privacy Policy
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
          
          <div className="mt-6 text-sm text-[#7B8A9A] dark:text-[#6B8299]">
            <p>Email: compliance@craftcode.com | Response within 48 hours</p>
          </div>
        </motion.div>

        {/* Last Updated */}
        <div className="text-center mt-8 text-sm text-[#7B8A9A] dark:text-[#6B8299]">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
};

export default CompliancePage;
