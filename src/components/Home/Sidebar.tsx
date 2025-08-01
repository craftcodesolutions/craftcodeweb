'use client'

import { useState, useLayoutEffect, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, Archive, MessageSquare } from 'lucide-react';

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

  // Remove all user/db logic, just static links
  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/team', label: 'Team', icon: Users },
    { path: '/blog', label: 'Blog', icon: FileText },
    { path: '/projects', label: 'Projects', icon: Archive },
    { path: '/faqs', label: 'FAQs', icon: MessageSquare },
    { path: '/contact', label: 'Contacts', icon: MessageSquare },
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
    return () => document.addEventListener('click', clickHandler);
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
          bg-amber-500 border border-amber-400 dark:border-amber-600 text-white shadow-md hover:bg-amber-600 dark:hover:bg-amber-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400/50
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
        className={`fixed inset-0 bg-gray-900/40 z-60 transition-opacity duration-300 ease-in-out
          ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
        onClick={toggleSidebar}
      />

      {/* Sidebar Content */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex flex-col fixed z-60 right-0 top-0 h-[100dvh] bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e]
          p-3 transition-all duration-300 ease-in-out overflow-hidden
          ${sidebarOpen ? 'translate-x-0 opacity-100 w-64' : 'translate-x-full opacity-0 w-0'}
          ${variant === 'v2' ? 'border-l border-white/10' : 'rounded-l-xl shadow-lg'}`}
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
            className="text-white bg-amber-500 border border-amber-400 dark:border-amber-600 rounded-lg px-2 py-1 hover:bg-amber-600 dark:hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-colors duration-200"
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

        <div className="space-y-6">
          <ul className="mt-2">
            {navLinks.map((item, index) => (
              <li
                key={item.path}
                className={`pl-3 pr-2 py-1.5 rounded-lg mb-0.5 last:mb-0
                  border border-amber-400 dark:border-amber-600 transition-all duration-200 animate-slide-in
                  ${isActive(item.path)
                    ? 'bg-amber-500 text-white'
                    : 'bg-transparent text-neutral-900 dark:text-white hover:bg-amber-600 dark:hover:bg-amber-700 hover:text-white'}
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link
                  href={item.path}
                  className={`block truncate transition duration-200 w-full h-full
                   ${isActive(item.path)
                     ? 'text-white'
                     : 'text-neutral-900 dark:text-white hover:text-white'}
                 `}
                  aria-label={`Navigate to ${item.label}`}
                >
                  <span className="inline-flex items-center gap-2">
                    <item.icon className={`w-4 h-4 ${isActive(item.path) ? 'text-white' : 'text-amber-500 dark:text-amber-400'}`} />
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default RightSidebar;