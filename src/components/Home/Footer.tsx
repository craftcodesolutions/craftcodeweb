'use client';

import { 
  Blocks, 
  Heart, 
  Github, 
  Twitter, 
  Linkedin, 
  ArrowUp,
  Sparkles,
  Code2,
  Shield,
  Rocket,
  MessageCircle,
  FileText
} from "lucide-react";
import Link from "next/link";

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.2),transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
      </div>

      <div className="relative z-10">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Compact Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Blocks className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-2 w-2 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  CraftCode
                </h2>
                <p className="text-purple-300 font-medium text-sm">Building Tomorrow&apos;s Solutions</p>
              </div>
            </div>

            <p className="text-lg text-gray-300 max-w-xl mx-auto mb-6 leading-relaxed">
              Experience the future of meetings with 
              <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold"> AI-powered insights</span> and 
              <span className="text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text font-semibold"> seamless collaboration</span>.
            </p>
          </div>

          {/* Essential Links Only */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {/* Conference */}
            <div className="text-center">
              <Link
                href="/conferance"
                className="block p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Code2 className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm">Conference</h3>
              </Link>
            </div>

            {/* Support */}
            <div className="text-center">
              <Link
                href="/support"
                className="block p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Rocket className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm">Support</h3>
              </Link>
            </div>

            {/* Privacy Policy */}
            <div className="text-center">
              <Link
                href="/privacy-policy"
                className="block p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm">Privacy Policy</h3>
              </Link>
            </div>

            {/* Terms */}
            <div className="text-center">
              <Link
                href="/terms"
                className="block p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm">Terms</h3>
              </Link>
            </div>

            {/* Security */}
            <div className="text-center">
              <Link
                href="/security"
                className="block p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm">Security</h3>
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Left Side */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex items-center gap-2 text-gray-400">
                  <span>© {currentYear} CraftCode Solutions.</span>
                  <span className="flex items-center gap-1">
                    Built with <Heart className="h-3 w-3 text-red-500 animate-pulse" fill="currentColor" /> for developers
                  </span>
                </div>
                
                {/* Social Links */}
                <div className="flex items-center gap-3">
                  {[
                    { icon: Github, href: "https://github.com", label: "GitHub", color: "hover:text-gray-300" },
                    { icon: Twitter, href: "https://twitter.com", label: "Twitter", color: "hover:text-blue-400" },
                    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", color: "hover:text-blue-500" },
                    { icon: MessageCircle, href: "/discord", label: "Discord", color: "hover:text-indigo-400" },
                  ].map(({ icon: Icon, href, label, color }) => (
                    <Link
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-lg bg-white/5 text-gray-400 ${color} transition-all duration-200 hover:scale-110 hover:bg-white/10`}
                      aria-label={label}
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>All systems operational</span>
                </div>
                
                <button
                  onClick={scrollToTop}
                  className="group p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-white/10 rounded-xl text-white transition-all duration-200 hover:scale-110"
                  aria-label="Scroll to top"
                >
                  <ArrowUp className="h-4 w-4 group-hover:-translate-y-1 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
