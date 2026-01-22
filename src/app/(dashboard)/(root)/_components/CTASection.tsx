/* eslint-disable react/no-unescaped-entities */
import React from 'react';

const CTASection = () => {
  return (
    <section id="cta" className="py-16 sm:py-24 lg:py-32 transition-all duration-500 ease-in-out">
      <div className="px-4 xl:container mx-auto">
        <div className="relative bg-gradient-to-br from-[#FFFFFF] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#0B1C2D] dark:via-[#102A3A] dark:to-[#0B1C2D] rounded-xl px-6 py-12 sm:px-16 sm:py-16 shadow-md border border-[#DCEEEE]/70 dark:border-[#1E3A4A]/70 transition-all duration-300">
          {/* Content */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="lg:w-2/3 text-center lg:text-left animate-in fade-in slide-in-from-left duration-700">
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] dark:text-[#E6F1F5] mb-4 leading-tight tracking-tight">
                Ready to Collaborate? Start Now!
              </h2>
              <p className="text-[#475569] dark:text-[#9FB3C8] text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Join us to create something extraordinary. Let's bring your ideas to life with seamless collaboration.
              </p>
            </div>
            <div className="lg:w-1/3 text-center lg:text-right">
              <a
                href="#"
                className="inline-flex items-center px-8 py-4 border-2 border-[#2FD1C5] dark:border-[#0FD9C3] text-[#1E5AA8] dark:text-[#6EE7D8] font-heading text-lg font-semibold rounded-lg hover:bg-gradient-to-r hover:from-[#6EE7D8] hover:via-[#2FD1C5] hover:to-[#1E5AA8] hover:text-white dark:hover:text-[#050B14] focus:ring-4 focus:ring-[#2FD1C5]/30 dark:focus:ring-[#0FD9C3]/30 transition-all duration-300 transform hover:-translate-y-1 shadow-sm"
                aria-label="Get started with collaboration"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
