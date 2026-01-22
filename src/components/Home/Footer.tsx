'use client';

import {
  Github,
  Twitter,
  Linkedin,

  Sparkles,
  Code2,
  Shield,
  Rocket,
  MessageCircle,
  FileText
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function Footer() {


  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden">
      {/* Animated Background */}
       <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(110,231,216,0.35),transparent_55%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_85%,rgba(30,90,168,0.25),transparent_55%)]"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2FD1C5]/60 to-transparent"></div>
      </div>

      <div className="relative z-10">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Compact Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] rounded-xl flex items-center justify-center shadow-lg shadow-[#2FD1C5]/30 dark:shadow-[#0FD9C3]/30">
                  <Image
                    src="/logo.PNG"
                    alt="CraftCode Logo"
                    width={48}
                    height={48}
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-[#6EE7D8] to-[#2FD1C5] rounded-full flex items-center justify-center">
                  <Sparkles className="h-2 w-2 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black bg-gradient-to-r from-[#0F172A] via-[#1E5AA8] to-[#2FD1C5] dark:from-[#E6F1F5] dark:via-[#9FB3C8] dark:to-[#6EE7D8] bg-clip-text text-transparent">
                  CraftCode Solutions
                </h2>
                <p className="text-[#1E5AA8] dark:text-[#9FB3C8] font-medium text-sm">Building Tomorrow&apos;s Solutions</p>
              </div>
            </div>

            <p className="text-lg text-[#475569] dark:text-[#9FB3C8] max-w-xl mx-auto mb-6 leading-relaxed">
              Experience the future of meetings with
              <span className="text-transparent bg-gradient-to-r from-[#6EE7D8] to-[#2FD1C5] bg-clip-text font-semibold"> AI-powered insights</span> and
              <span className="text-transparent bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] bg-clip-text font-semibold"> seamless collaboration</span>.
            </p>
          </div>

          {/* Essential Links Only */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {/* Conference */}
            <div className="text-center">
              <Link
                href="/conferance"
                className="block p-4 bg-gradient-to-br from-[#FFFFFF]/90 via-[#EEF7F6]/85 to-[#F7FBFC]/90 dark:from-[#0B1C2D]/80 dark:via-[#102A3A]/80 dark:to-[#0B1C2D]/80 backdrop-blur-sm border border-[#DCEEEE]/80 dark:border-[#1E3A4A]/70 rounded-xl transition-all duration-300 hover:scale-105 hover:border-[#2FD1C5]/60 dark:hover:border-[#0FD9C3]/60 hover:shadow-[0_12px_35px_rgba(47,209,197,0.18)] dark:hover:shadow-[0_16px_40px_rgba(15,217,195,0.18)]"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#E6F8F6] via-[#DDF5F2] to-[#CFEFEB] dark:from-[#0B1C2D] dark:via-[#102A3A] dark:to-[#0B1C2D] rounded-lg flex items-center justify-center mx-auto mb-2 ring-1 ring-[#2FD1C5]/30 dark:ring-[#0FD9C3]/30">
                  <Code2 className="h-4 w-4 text-[#1E5AA8] dark:text-[#6EE7D8]" />
                </div>
                <h3 className="text-[#0F172A] dark:text-[#E6F1F5] font-semibold text-sm">Conference</h3>
              </Link>
            </div>

            {/* Support */}
            <div className="text-center">
              <Link
                href="/support"
                className="block p-4 bg-gradient-to-br from-[#FFFFFF]/90 via-[#EEF7F6]/85 to-[#F7FBFC]/90 dark:from-[#0B1C2D]/80 dark:via-[#102A3A]/80 dark:to-[#0B1C2D]/80 backdrop-blur-sm border border-[#DCEEEE]/80 dark:border-[#1E3A4A]/70 rounded-xl transition-all duration-300 hover:scale-105 hover:border-[#2FD1C5]/60 dark:hover:border-[#0FD9C3]/60 hover:shadow-[0_12px_35px_rgba(47,209,197,0.18)] dark:hover:shadow-[0_16px_40px_rgba(15,217,195,0.18)]"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#E6F8F6] via-[#DDF5F2] to-[#CFEFEB] dark:from-[#0B1C2D] dark:via-[#102A3A] dark:to-[#0B1C2D] rounded-lg flex items-center justify-center mx-auto mb-2 ring-1 ring-[#2FD1C5]/30 dark:ring-[#0FD9C3]/30">
                  <Rocket className="h-4 w-4 text-[#1E5AA8] dark:text-[#6EE7D8]" />
                </div>
                <h3 className="text-[#0F172A] dark:text-[#E6F1F5] font-semibold text-sm">Support</h3>
              </Link>
            </div>

            {/* Privacy Policy */}
            <div className="text-center">
              <Link
                href="/privacy-policy"
                className="block p-4 bg-gradient-to-br from-[#FFFFFF]/90 via-[#EEF7F6]/85 to-[#F7FBFC]/90 dark:from-[#0B1C2D]/80 dark:via-[#102A3A]/80 dark:to-[#0B1C2D]/80 backdrop-blur-sm border border-[#DCEEEE]/80 dark:border-[#1E3A4A]/70 rounded-xl transition-all duration-300 hover:scale-105 hover:border-[#2FD1C5]/60 dark:hover:border-[#0FD9C3]/60 hover:shadow-[0_12px_35px_rgba(47,209,197,0.18)] dark:hover:shadow-[0_16px_40px_rgba(15,217,195,0.18)]"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#E6F8F6] via-[#DDF5F2] to-[#CFEFEB] dark:from-[#0B1C2D] dark:via-[#102A3A] dark:to-[#0B1C2D] rounded-lg flex items-center justify-center mx-auto mb-2 ring-1 ring-[#2FD1C5]/30 dark:ring-[#0FD9C3]/30">
                  <Shield className="h-4 w-4 text-[#1E5AA8] dark:text-[#6EE7D8]" />
                </div>
                <h3 className="text-[#0F172A] dark:text-[#E6F1F5] font-semibold text-sm">Privacy Policy</h3>
              </Link>
            </div>

            {/* Terms */}
            <div className="text-center">
              <Link
                href="/terms"
                className="block p-4 bg-gradient-to-br from-[#FFFFFF]/90 via-[#EEF7F6]/85 to-[#F7FBFC]/90 dark:from-[#0B1C2D]/80 dark:via-[#102A3A]/80 dark:to-[#0B1C2D]/80 backdrop-blur-sm border border-[#DCEEEE]/80 dark:border-[#1E3A4A]/70 rounded-xl transition-all duration-300 hover:scale-105 hover:border-[#2FD1C5]/60 dark:hover:border-[#0FD9C3]/60 hover:shadow-[0_12px_35px_rgba(47,209,197,0.18)] dark:hover:shadow-[0_16px_40px_rgba(15,217,195,0.18)]"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#E6F8F6] via-[#DDF5F2] to-[#CFEFEB] dark:from-[#0B1C2D] dark:via-[#102A3A] dark:to-[#0B1C2D] rounded-lg flex items-center justify-center mx-auto mb-2 ring-1 ring-[#2FD1C5]/30 dark:ring-[#0FD9C3]/30">
                  <FileText className="h-4 w-4 text-[#1E5AA8] dark:text-[#6EE7D8]" />
                </div>
                <h3 className="text-[#0F172A] dark:text-[#E6F1F5] font-semibold text-sm">Terms</h3>
              </Link>
            </div>

            {/* Security */}
            <div className="text-center">
              <Link
                href="/security"
                className="block p-4 bg-gradient-to-br from-[#FFFFFF]/90 via-[#EEF7F6]/85 to-[#F7FBFC]/90 dark:from-[#0B1C2D]/80 dark:via-[#102A3A]/80 dark:to-[#0B1C2D]/80 backdrop-blur-sm border border-[#DCEEEE]/80 dark:border-[#1E3A4A]/70 rounded-xl transition-all duration-300 hover:scale-105 hover:border-[#2FD1C5]/60 dark:hover:border-[#0FD9C3]/60 hover:shadow-[0_12px_35px_rgba(47,209,197,0.18)] dark:hover:shadow-[0_16px_40px_rgba(15,217,195,0.18)]"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#E6F8F6] via-[#DDF5F2] to-[#CFEFEB] dark:from-[#0B1C2D] dark:via-[#102A3A] dark:to-[#0B1C2D] rounded-lg flex items-center justify-center mx-auto mb-2 ring-1 ring-[#2FD1C5]/30 dark:ring-[#0FD9C3]/30">
                  <Shield className="h-4 w-4 text-[#1E5AA8] dark:text-[#6EE7D8]" />
                </div>
                <h3 className="text-[#0F172A] dark:text-[#E6F1F5] font-semibold text-sm">Security</h3>
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#DCEEEE]/70 dark:border-[#1E3A4A]/60 bg-[#F7FBFC]/70 dark:bg-[#050B14]/70 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Left Side */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex flex-col gap-1 text-sm text-[#475569] dark:text-[#9FB3C8] leading-relaxed">
                  <span>© {currentYear} CraftCode Solutions.</span>
                  <span>
                    Startup & SME Investment Studio • 360° Marketing Agency • Your Growth Team
                  </span>
                </div>



                {/* Social Links */}
                <div className="flex items-center gap-3">
                  {[
                    { icon: Github, href: "https://github.com", label: "GitHub", color: "hover:text-[#1E5AA8] dark:hover:text-[#6EE7D8]" },
                    { icon: Twitter, href: "https://twitter.com", label: "Twitter", color: "hover:text-[#2FD1C5] dark:hover:text-[#0FD9C3]" },
                    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", color: "hover:text-[#6EE7D8] dark:hover:text-[#2FD1C5]" },
                    { icon: MessageCircle, href: "/discord", label: "Discord", color: "hover:text-[#0B8ED8] dark:hover:text-[#6EE7D8]" },
                  ].map(({ icon: Icon, href, label, color }) => (
                    <Link
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-lg bg-gradient-to-br from-[#FFFFFF]/90 via-[#EEF7F6]/85 to-[#F7FBFC]/90 dark:from-[#0B1C2D]/80 dark:via-[#102A3A]/80 dark:to-[#0B1C2D]/80 text-[#1E5AA8]/80 dark:text-[#9FB3C8] ${color} border border-[#DCEEEE]/80 dark:border-[#1E3A4A]/70 transition-all duration-200 hover:scale-110 hover:border-[#2FD1C5]/60 dark:hover:border-[#0FD9C3]/60 hover:shadow-[0_8px_20px_rgba(47,209,197,0.18)] dark:hover:shadow-[0_10px_26px_rgba(15,217,195,0.18)]`}
                      aria-label={label}
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs text-[#475569] dark:text-[#9FB3C8]">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>All systems operational</span>
                </div>


              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
