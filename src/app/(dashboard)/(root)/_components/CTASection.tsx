/* eslint-disable react/no-unescaped-entities */
import React from 'react';

const CTASection = () => {
  return (
    <section id="cta" className="py-16 sm:py-24 lg:py-32 transition-all duration-500 ease-in-out">
      <div className="px-4 xl:container mx-auto">
        <div className="relative bg-white dark:bg-gray-950 rounded-xl px-6 py-12 sm:px-16 sm:py-16 shadow-md border border-gray-200 dark:border-gray-800 transition-all duration-300">
          {/* Content */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="lg:w-2/3 text-center lg:text-left animate-in fade-in slide-in-from-left duration-700">
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight tracking-tight">
                Ready to Collaborate? Start Now!
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Join us to create something extraordinary. Let's bring your ideas to life with seamless collaboration.
              </p>
            </div>
            <div className="lg:w-1/3 text-center lg:text-right">
              <a
                href="#"
                className="inline-flex items-center px-8 py-4 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-heading text-lg font-semibold rounded-lg hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all duration-300 transform hover:-translate-y-1 shadow-sm"
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