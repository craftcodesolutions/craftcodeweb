import { Blocks } from "lucide-react";
import Link from "next/link";

function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 ring-1 ring-white/10">
            <Blocks className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Built with ❤️ for developers
          </p>
        </div>

        {/* Right Section - Links */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {[
            { href: "/support", label: "Support" },
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
