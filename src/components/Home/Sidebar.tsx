/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useLayoutEffect, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, Archive, MessageSquare, HelpCircle, Phone, Calendar } from 'lucide-react';

// Define props interface
interface RightSidebarProps {
  variant?: 'default' | 'v2' | 'v3';
}

function RightSidebar({ variant = 'default' }: RightSidebarProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(false);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const sidebar = useRef<HTMLDivElement | null>(null);

  // Main navigation links
  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/team', label: 'Team', icon: Users },
    { path: '/projects', label: 'Projects', icon: Archive },
    { path: '/conferance', label: 'Conference', icon: Calendar },
    { path: '/blog', label: 'Blog', icon: FileText },
    { path: '/faqs', label: 'FAQs', icon: HelpCircle },
    { path: '/contact', label: 'Contact', icon: Phone },
    { path: '/support', label: 'Support', icon: MessageSquare },
  ];

  const storedSidebarExpanded = typeof window !== 'undefined' ? localStorage.getItem('right-sidebar-expanded') : null;
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true');

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const isLarge = width >= 1024;
      const isMedium = width >= 768 && width < 1024;
      const isMobile = width < 768;
      setIsLargeScreen(isLarge);
      setIsMobileScreen(isMobile);

      if (typeof window !== 'undefined') {
        try {
          const body = document.querySelector('body');
          if (isMobile || isMedium) {
            localStorage.setItem('right-sidebar-expanded', 'true');
            setSidebarExpanded(true);
            if (body) {
              body.classList.add('right-sidebar-expanded');
            }
          } else if (isLarge) {
            localStorage.removeItem('right-sidebar-expanded');
            setSidebarExpanded(false);
            if (body) {
              body.classList.remove('right-sidebar-expanded');
            }
          }
        } catch (e) {
          console.error('Failed to access localStorage:', e);
        }
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useLayoutEffect(() => {
    if (isLargeScreen) return;

    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target as Node) || trigger.current.contains(target as Node)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [sidebarOpen, isLargeScreen]);

  useLayoutEffect(() => {
    if (isLargeScreen) return;

    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [sidebarOpen, isLargeScreen]);

  useLayoutEffect(() => {
    if (isLargeScreen) return;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('right-sidebar-expanded', sidebarExpanded.toString());
        const body = document.querySelector('body');
        if (body) {
          if (sidebarExpanded) {
            body.classList.add('right-sidebar-expanded');
          } else {
            body.classList.remove('right-sidebar-expanded');
          }
        }
      } catch (e) {
        console.error('Failed to access localStorage:', e);
      }
    }
  }, [sidebarExpanded, isLargeScreen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path: string): boolean => pathname === path;

  if (isLargeScreen) return null;

  return (
    <>
      {/* Menu Button */}
      <button
        ref={trigger}
        role="button"
        tabIndex={0}
        className={`relative group inline-flex items-center justify-center gap-2 px-2 py-2 sm:px-6 sm:py-6 mr-2 aspect-square rounded-lg
          bg-gradient-to-br from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] dark:from-[#0FD9C3] dark:via-[#0B8ED8] dark:to-[#0A2A66]
          border border-[#2FD1C5]/60 dark:border-[#0FD9C3]/50 text-white shadow-md hover:shadow-[0_10px_30px_rgba(47,209,197,0.35)] dark:hover:shadow-[0_12px_32px_rgba(15,217,195,0.3)] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#2FD1C5]/40 dark:focus:ring-[#0FD9C3]/40
          text-base font-semibold transition-all duration-200
          ${isMobileScreen ? 'block' : 'hidden'}`}
        onClick={toggleSidebar}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSidebar();
          }
        }}
        aria-controls="sidebar"
        aria-expanded={sidebarOpen}
        aria-label="Toggle navigation menu"
      >
        <span className="relative z-10 hidden sm:block text-white font-bold">Menu</span>
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 stroke-[2] text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-[#050B14]/55 backdrop-blur-sm z-[60] transition-opacity duration-300 ease-in-out
          ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
        onClick={toggleSidebar}
      />

      {/* Sidebar Content */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex flex-col fixed z-[61] right-0 top-0 h-[100dvh] bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#FFFFFF] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#102A3A]
          p-3 transition-all duration-300 ease-in-out overflow-hidden border-l border-[#DCEEEE]/60 dark:border-[#1E3A4A]/60 shadow-2xl
          ${sidebarOpen ? 'translate-x-0 opacity-100 w-72 sm:w-80' : 'translate-x-full opacity-0 w-0'}`}
      >
        <div className="flex justify-between mb-3 pl-2">
          <Link href="/" className="block">
            <Image
              src="/logo.png"
              alt="CraftCode Logo"
              width={28}
              height={28}
              className="object-contain"
            />
          </Link>
          <button
            className="text-[#1E5AA8] dark:text-[#E6F1F5] bg-[#EEF7F6] dark:bg-[#0B1C2D] border border-[#DCEEEE]/70 dark:border-[#1E3A4A]/70 rounded-lg px-2 py-1 hover:bg-[#DCEEEE]/70 dark:hover:bg-[#102A3A] focus:outline-none focus:ring-2 focus:ring-[#2FD1C5]/40 dark:focus:ring-[#0FD9C3]/40 transition-colors duration-200"
            onClick={toggleSidebar}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
            aria-label="Close navigation menu"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.3 5.3l-1.4 1.4L16.2 11H4v2h12.2l-4.3 4.3 1.4 1.4L20 12z" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#2FD1C5] dark:scrollbar-thumb-[#0FD9C3] scrollbar-track-transparent">
          <nav className="mt-2">
            <ul className="space-y-1">
              {navLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
                      ${isActive(item.path)
                        ? 'bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] text-white shadow-lg border border-[#2FD1C5]/50'
                        : 'text-[#475569] dark:text-[#9FB3C8] hover:bg-[#EEF7F6] dark:hover:bg-[#0B1C2D]/70 hover:text-[#1E5AA8] dark:hover:text-[#6EE7D8]'}
                    `}
                    aria-label={`Navigate to ${item.label}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`w-4 h-4 ${isActive(item.path) ? 'text-white' : 'text-[#1E5AA8] dark:text-[#6EE7D8]'}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

export default RightSidebar;
