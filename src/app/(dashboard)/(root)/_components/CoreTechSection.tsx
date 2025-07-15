"use client"

import { useState, useRef, useEffect } from 'react';

export default function CoreTechSection() {
  // State to manage the active filter
  const [filter, setFilter] = useState('All');

  // Data for the technologies with categories
  const technologies = [
    {
      title: 'React',
      description: 'A powerful library for building dynamic, interactive user interfaces with reusable components.',
      category: 'Frontend',
      icon: (
        <svg
          className="w-10 h-10 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 4v16h16M12 4v16M4 12h16"
          ></path>
        </svg>
      ),
    },
    {
      title: 'Tailwind CSS',
      description: 'A utility-first CSS framework for creating responsive and customizable designs quickly.',
      category: 'Frontend',
      icon: (
        <svg
          className="w-10 h-10 text-teal-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12h18M3 6h18M3 18h18"
          ></path>
        </svg>
      ),
    },
    {
      title: 'Headless UI',
      description: 'Accessible, unstyled UI components built to work seamlessly with Tailwind CSS.',
      category: 'UI',
      icon: (
        <svg
          className="w-10 h-10 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          ></path>
        </svg>
      ),
    },
    {
      title: 'Vite',
      description: 'A fast build tool offering an optimized development and build experience for modern web projects.',
      category: 'Frontend',
      icon: (
        <svg
          className="w-10 h-10 text-yellow-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          ></path>
        </svg>
      ),
    },
    {
      title: 'React Router',
      description: 'A flexible solution for managing routing and navigation in React applications.',
      category: 'Frontend',
      icon: (
        <svg
          className="w-10 h-10 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
      ),
    },
    {
      title: 'Tanstack Table',
      description: 'A feature-rich library for creating performant and customizable data tables in React.',
      category: 'Backend',
      icon: (
        <svg
          className="w-10 h-10 text-orange-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 4h18v16H3z"
          ></path>
        </svg>
      ),
    },
    {
      title: 'React Hook Forms',
      description: 'A lightweight library for building flexible and high-performance form handling in React.',
      category: 'Frontend',
      icon: (
        <svg
          className="w-10 h-10 text-pink-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4v16m8-8H4"
          ></path>
        </svg>
      ),
    },
    {
      title: 'Yup',
      description: 'A schema validation library for easily validating and transforming object shapes.',
      category: 'Backend',
      icon: (
        <svg
          className="w-10 h-10 text-purple-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      ),
    },
    {
      title: 'Node.js',
      description: 'A JavaScript runtime built on Chrome’s V8 engine for building scalable server-side applications.',
      category: 'Backend',
      icon: (
        <svg
          className="w-10 h-10 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 12h14M12 5v14"
          ></path>
        </svg>
      ),
    },
    {
      title: 'Express',
      description: 'A fast, minimalist framework for Node.js to build robust APIs and web applications.',
      category: 'Backend',
      icon: (
        <svg
          className="w-10 h-10 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 12h8M12 8v8"
          ></path>
        </svg>
      ),
    },
    {
      title: 'Figma',
      description: 'A collaborative design tool for creating user interfaces and prototypes with ease.',
      category: 'UX',
      icon: (
        <svg
          className="w-10 h-10 text-pink-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 2v20M2 12h20"
          ></path>
        </svg>
      ),
    },
    {
      title: 'Next.js',
      description: 'A React framework for building server-rendered, static, and SEO-friendly web applications.',
      category: 'Frontend',
      icon: (
        <svg
          className="w-10 h-10 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          ></path>
        </svg>
      ),
    },
    {
      title: 'Chakra UI',
      description: 'A simple, modular, and accessible component library for building React applications.',
      category: 'UI',
      icon: (
        <svg
          className="w-10 h-10 text-teal-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 12h14M12 5v14"
          ></path>
        </svg>
      ),
    },
  ];

  // Filter technologies based on the selected category
  const filteredTechnologies =
    filter === 'All' ? technologies : technologies.filter((tech) => tech.category === filter);

  // For keyboard navigation
  const filterRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // For animating cards on mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Count technologies per category
  const categoryCounts = technologies.reduce((acc, tech) => {
    acc[tech.category] = (acc[tech.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  categoryCounts['All'] = technologies.length;

  return (
    <section className="bg-transparent py-12 px-2 sm:px-4 md:px-6 lg:px-8">
      {/* Section Title */}
      <div
        className="relative mx-auto mb-12 max-w-[620px] pt-6 text-center md:mb-20 lg:pt-16"
        data-wow-delay=".2s"
      >
        <span
          className="absolute top-0 left-1/2 -translate-x-1/2 text-[40px] sm:text-[60px] lg:text-[95px] font-extrabold leading-none opacity-20 dark:opacity-80"
          style={{
            background: 'linear-gradient(180deg, rgba(74, 108, 247, 0.4) 0%, rgba(74, 108, 247, 0) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            ...(typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? { WebkitTextFillColor: '#f3f4f6', color: '#f3f4f6', background: 'none' } : {})
          }}
        >
          CORE_TECH
        </span>

        <h2 className="font-heading text-dark mb-5 text-3xl font-semibold sm:text-4xl md:text-[50px] md:leading-[60px] dark:text-gray-100">
        The Technology That Powers Us
        </h2>
        <p className="text-dark-text text-base">
          Built on a foundation of modern tools and scalable architecture, our core technologies ensure
    speed, security, and seamless user experiences. From backend to frontend, we craft with precision
    to deliver reliable and future-ready solutions.
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-10" role="tablist" aria-label="Technology categories">
        {["All", "Frontend", "Backend", "UI", "UX"].map((category, idx) => (
          <button
            key={category}
            ref={el => { filterRefs.current[idx] = el; }}
            onClick={() => setFilter(category)}
            onKeyDown={e => {
              if (e.key === 'ArrowRight') {
                filterRefs.current[(idx + 1) % 5]?.focus();
              } else if (e.key === 'ArrowLeft') {
                filterRefs.current[(idx + 4) % 5]?.focus();
              }
            }}
            aria-selected={filter === category}
            aria-label={`Show ${category} technologies (${categoryCounts[category]})`}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-500 ease-out outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 ${filter === category
                ? "bg-blue-600 text-white shadow-lg transform scale-105"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105 hover:shadow-md"
              }`}
            role="tab"
            tabIndex={0}
          >
            {category} <span className="ml-1 text-xs bg-gray-900 px-2 py-0.5 rounded-full">{categoryCounts[category]}</span>
          </button>
        ))}
      </div>

      {/* Technology Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredTechnologies.map((tech, index) => (
          <div
            key={index}
            className={`relative bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col items-center text-center shadow-lg transition-all duration-700 ease-out transform hover:scale-105 hover:shadow-2xl hover:border-gray-600 group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} animate-fade-in`}
            style={{ 
              transitionDelay: `${index * 100}ms`,
              transitionProperty: 'all',
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            tabIndex={0}
            aria-label={tech.title}
          >
            <div className="mb-4 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-3">{tech.icon}</div>
            <h3 className="text-lg font-semibold text-white transition-colors duration-300 ease-out group-hover:text-blue-300">{tech.title}</h3>
            <p
              className="text-sm text-gray-400 mt-2 truncate max-w-[180px] group-hover:whitespace-normal group-hover:max-w-none relative transition-all duration-500 ease-out group-hover:text-gray-300 overflow-hidden"
              style={{ 
                cursor: tech.description.length > 60 ? 'pointer' : 'default',
                maxHeight: '1.5rem',
                transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                if (tech.description.length > 60) {
                  e.currentTarget.style.maxHeight = 'none';
                  e.currentTarget.style.overflow = 'visible';
                }
              }}
              onMouseLeave={(e) => {
                if (tech.description.length > 60) {
                  e.currentTarget.style.maxHeight = '1.5rem';
                  e.currentTarget.style.overflow = 'hidden';
                }
              }}
              title={tech.description}
            >
              {tech.description}
            </p>
          </div>
        ))}
      </div>
      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          0% { 
            opacity: 0; 
            transform: translateY(32px) scale(0.95); 
          }
          50% { 
            opacity: 0.7; 
            transform: translateY(16px) scale(0.98); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes slide-in {
          from { 
            opacity: 0; 
            transform: translateX(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        
        .group:hover {
          transform: translateY(-4px) scale(1.02);
        }
        
        .group:active {
          transform: translateY(-2px) scale(1.01);
          transition-duration: 150ms;
        }
        
        @media (max-width: 640px) {
          .group:hover span,
          .group:focus span {
            display: none !important;
          }
        }
        
        /* Smooth transitions for all interactive elements */
        * {
          transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </section>
  );
}