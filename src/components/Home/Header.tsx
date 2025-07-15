import React from "react";
import Link from "next/link";
import Image from "next/image";
import RightSidebar from "./Sidebar";
import ModeToggle from "@/components/ModeToggle";

function Header() {
  return (
    <header className="fixed top-0 left-0 w-screen z-40 backdrop-blur-xl bg-white text-black dark:bg-black dark:text-white border-b border-neutral-200 dark:border-neutral-800 shadow-lg transition-all duration-300">
      <div className="w-full md:max-w-7xl md:mx-auto px-4 md:px-6 py-2 md:py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/" className="flex items-center gap-1.5 group relative" aria-label="CodeCraft homepage">
            <div className="relative w-8 h-8 md:w-10 md:h-10 p-0.5 bg-white dark:bg-black rounded-xl ring-1 ring-neutral-200 dark:ring-neutral-800 transition-all duration-200 ease-in-out">
              <Image
                src="/logo.png"
                alt="CraftCode Logo"
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
                solutions
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
            <span className="text-xs md:hidden">Login</span>
            <div className="md:hidden">
              <RightSidebar />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
