'use client'

import React from "react";
import Link from "next/link";
import Image from "next/image";
import RightSidebar from "./Sidebar";
import ModeToggle from "@/components/ModeToggle";
import { useState, useRef } from "react";
import { LogOut, User } from "lucide-react";

function Header() {
  // Mock authentication state (replace with real logic later)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className="fixed top-0 left-0 w-screen z-40 backdrop-blur-xl bg-white text-black dark:bg-black dark:text-white border-b border-neutral-200 dark:border-neutral-800 shadow-lg transition-all duration-300">
      <div className="w-full md:max-w-7xl md:mx-auto px-4 md:px-6 py-2 md:py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/" className="flex items-center gap-1.5 group relative" aria-label="CraftCode Solutions homepage">
            <div className="relative w-8 h-8 md:w-10 md:h-10 p-0.5 bg-white dark:bg-black rounded-xl ring-1 ring-neutral-200 dark:ring-neutral-800 transition-all duration-200 ease-in-out">
              <Image
                src="/logo.png"
                alt="CraftCode Solutions Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base md:text-lg font-bold transition-all duration-200 font-[cursive]">
                CraftCode 
              </span>
              <span className="text-xs md:text-sm font-normal text-neutral-500 dark:text-neutral-400 -mt-1 font-[cursive]">
              Solutions
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links and Controls */}
        <nav className="flex items-center gap-1 sm:gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-2 md:gap-4 text-xs md:text-sm font-semibold">
            {[
              { href: "/", label: "Home" },
              { href: "/team", label: "Team" },
              { href: "/projects", label: "Projects" },
              { href: "/blog", label: "Blog" },
              { href: "/faqs", label: "FAQs" },
              { href: "/contact", label: "Contacts" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="relative px-2 py-1 rounded transition group focus-visible:outline-none"
              >
                <span className="transition-colors duration-200 group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
                  {label}
                </span>
              </Link>
            ))}
          </div>
          {/* Controls: ModeToggle, Login/Sidebar for mobile */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <ModeToggle />
            {/* Conditional Login/UserButton */}
            {/* Desktop (md+) */}
            <div className="hidden md:flex items-center">
              {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500 border border-amber-400 dark:border-amber-600 shadow-md transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-400/40"
                    onClick={() => setDropdownOpen((open) => !open)}
                    aria-label="User menu"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setDropdownOpen(open => !open); }}
                  >
                    <span className="font-bold text-lg text-white select-none">J</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-48 rounded-xl shadow-2xl border border-amber-400 dark:border-amber-600 bg-white dark:bg-neutral-900 z-50 animate-fade-in-up">
                      <div className="absolute -top-2 right-6 w-4 h-4 bg-white dark:bg-neutral-900 rotate-45 border-t border-l border-amber-400 dark:border-amber-600" style={{ zIndex: 1 }} />
                      <div className="px-4 py-3 border-b border-amber-100 dark:border-amber-700 flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-white font-bold text-lg border border-amber-400 dark:border-amber-600">J</span>
                        <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">John Doe</span>
                      </div>
                      <button
                        className="flex items-center gap-2 px-4 py-2 w-full text-sm text-neutral-700 dark:text-neutral-200 hover:bg-amber-100 dark:hover:bg-amber-800 transition-colors rounded-t-none rounded-b-none focus:bg-amber-200 dark:focus:bg-amber-700"
                        onClick={() => { setDropdownOpen(false); }}
                        tabIndex={0}
                        aria-label="Profile"
                      >
                        <User className="w-4 h-4" /> Profile
                      </button>
                      <div className="border-t border-amber-100 dark:border-amber-700 my-1" />
                      <button
                        className="flex items-center gap-2 px-4 py-2 w-full text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors rounded-b-xl focus:bg-red-200 dark:focus:bg-red-800/40"
                        onClick={() => { setDropdownOpen(false); setIsLoggedIn(false); }}
                        tabIndex={0}
                        aria-label="Logout"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="group relative flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-base bg-amber-500 text-white border border-amber-400 dark:border-amber-600 shadow-md transition hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-400/40"
                  style={{ minWidth: '90px' }}
                  aria-label="Login"
                >
                  Login
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><line x1="5" y1="9" x2="13" y2="9"/><polyline points="9 5 13 9 9 13"/></svg>
                  </span>
                </Link>
              )}
            </div>
            {/* Mobile (sm) - place Login/UserButton above sidebar trigger */}
            <div className="flex md:hidden items-center gap-2">
              {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500 border border-amber-400 dark:border-amber-600 shadow-md transition focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                    onClick={() => setDropdownOpen((open) => !open)}
                    aria-label="User menu"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setDropdownOpen(open => !open); }}
                  >
                    <span className="font-bold text-base text-white select-none">J</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 rounded-lg shadow-xl border border-amber-400 dark:border-amber-600 bg-white dark:bg-neutral-900 z-50 animate-fade-in-up">
                      <div className="px-3 py-2 border-b border-amber-100 dark:border-amber-700 flex items-center gap-2">
                        <span className="flex items-center justify-center w-7 h-7 rounded bg-amber-500 text-white font-bold text-base border border-amber-400 dark:border-amber-600">J</span>
                        <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">John Doe</span>
                      </div>
                      <button
                        className="flex items-center gap-2 px-3 py-2 w-full text-xs text-neutral-700 dark:text-neutral-200 hover:bg-amber-100 dark:hover:bg-amber-800 transition-colors focus:bg-amber-200 dark:focus:bg-amber-700"
                        onClick={() => { setDropdownOpen(false); }}
                        tabIndex={0}
                        aria-label="Profile"
                      >
                        <User className="w-4 h-4" /> Profile
                      </button>
                      <div className="border-t border-amber-100 dark:border-amber-700 my-1" />
                      <button
                        className="flex items-center gap-2 px-3 py-2 w-full text-xs text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors focus:bg-red-200 dark:focus:bg-red-800/40"
                        onClick={() => { setDropdownOpen(false); setIsLoggedIn(false); }}
                        tabIndex={0}
                        aria-label="Logout"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-sm bg-amber-500 text-white border border-amber-400 dark:border-amber-600 shadow-md transition focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                  aria-label="Login"
                >
                  Login
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><line x1="4" y1="8" x2="12" y2="8"/><polyline points="8 4 12 8 8 12"/></svg>
                </Link>
              )}
              {/* Sidebar trigger */}
              <RightSidebar />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
