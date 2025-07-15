"use client";

import { useState } from 'react';
import ProjectCard from './ProjectCard';

interface Project {
  id: string;
  name: string;
  url: string;
  coverImage?: string;
  description?: string;
  technologies?: string[];
  status?: 'active' | 'completed' | 'in-progress';
  featured?: boolean;
}

const sampleProjects: Project[] = [
  {
    id: '1',
    name: 'E-Commerce Platform',
    url: 'https://example-ecommerce.com',
    coverImage: '/images/portfolio/image-1.jpg',
    description: 'A modern e-commerce platform built with Next.js and Stripe integration for seamless online shopping experience.',
    technologies: ['Next.js', 'TypeScript', 'Stripe', 'Tailwind CSS'],
    status: 'active',
    featured: true,
  },
  {
    id: '2',
    name: 'Task Management App',
    url: 'https://taskmanager-app.com',
    coverImage: '/images/portfolio/image-2.jpg',
    description: 'Collaborative task management application with real-time updates and team collaboration features.',
    technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB'],
    status: 'completed',
    featured: true,
  },
  {
    id: '3',
    name: 'AI Chat Assistant',
    url: 'https://ai-chat-assistant.com',
    coverImage: '/images/portfolio/image-3.jpg',
    description: 'Intelligent chatbot powered by machine learning for customer support and automated responses.',
    technologies: ['Python', 'TensorFlow', 'FastAPI', 'PostgreSQL'],
    status: 'in-progress',
    featured: true,
  },
  {
    id: '4',
    name: 'Portfolio Website',
    url: 'https://portfolio-showcase.com',
    coverImage: '/images/portfolio/image-4.jpg',
    description: 'Personal portfolio website showcasing creative work and professional experience.',
    technologies: ['React', 'Framer Motion', 'GSAP', 'Vercel'],
    status: 'completed',
  },
  {
    id: '5',
    name: 'Weather Dashboard',
    url: 'https://weather-dashboard.com',
    description: 'Real-time weather monitoring dashboard with interactive maps and detailed forecasts.',
    technologies: ['Vue.js', 'D3.js', 'OpenWeather API', 'Chart.js'],
    status: 'active',
  },
  {
    id: '6',
    name: 'Social Media Analytics',
    url: 'https://social-analytics.com',
    coverImage: '/images/portfolio/image (6).jpg',
    description: 'Comprehensive analytics platform for social media performance tracking and insights.',
    technologies: ['Angular', 'Python', 'Redis', 'AWS'],
    status: 'in-progress',
  },
  {
    id: '7',
    name: 'Fitness Tracking App',
    url: 'https://fitness-tracker.com',
    coverImage: '/images/portfolio/image (9).jpg',
    description: 'Mobile fitness application with workout tracking, nutrition planning, and progress analytics.',
    technologies: ['React Native', 'Firebase', 'Redux', 'Expo'],
    status: 'active',
  },
  {
    id: '8',
    name: 'Real Estate Platform',
    url: 'https://real-estate-platform.com',
    coverImage: '/images/portfolio/image (10).jpg',
    description: 'Comprehensive real estate platform with property listings, virtual tours, and agent management.',
    technologies: ['Next.js', 'Prisma', 'PostgreSQL', 'Mapbox'],
    status: 'completed',
  },
];

const ProjectsPage = () => {
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  const filteredProjects = filter === 'all' ? sampleProjects : sampleProjects.filter(project => project.featured);

  return (
    <div className="min-h-screen relative">

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Banner */}
        <div className="relative bg-white dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-12 px-6 md:px-10 lg:px-20 flex flex-col md:flex-row items-start md:items-center justify-between rounded-2xl mb-12 shadow-xl dark:shadow-2xl">
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400">
              Looking for a collaboration? <br className="hidden sm:block" /> Get Started Today!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-4 text-sm sm:text-base max-w-2xl">
              Join us for exciting opportunities and collaborations that can grow your business. Let&apos;s innovate together!
            </p>
          </div>
          <button className="relative z-10 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white font-semibold py-4 px-8 rounded-xl self-start md:self-auto mt-6 md:mt-0 transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-purple-500/25">
            <span className="flex items-center gap-2">
              Get Started Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 dark:from-purple-500/20 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 dark:from-blue-500/20 to-transparent rounded-full blur-xl" />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            className={`py-3 px-8 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              filter === 'all' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 dark:shadow-purple-500/25' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
            }`}
            onClick={() => setFilter('all')}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              All Projects ({sampleProjects.length})
            </span>
          </button>
          <button
            className={`py-3 px-8 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              filter === 'featured' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 dark:shadow-purple-500/25' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
            }`}
            onClick={() => setFilter('featured')}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Featured Projects ({sampleProjects.filter(p => p.featured).length})
            </span>
          </button>
        </div>

        {/* Projects Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 mb-4">
              Our Projects
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Explore our diverse portfolio of innovative projects that showcase our expertise in modern web development and cutting-edge technologies.
            </p>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-purple-500/20 dark:to-blue-500/20 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No projects found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or check back later for new projects.</p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <div className="relative bg-white dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl p-12 overflow-hidden shadow-xl dark:shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 dark:from-purple-500/20 to-transparent rounded-full blur-xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 dark:from-blue-500/20 to-transparent rounded-full blur-xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Ready to Start Your Project?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
                Let&apos;s collaborate to bring your ideas to life with cutting-edge technology and modern design. Our team is ready to turn your vision into reality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-purple-500/25">
                  <span className="flex items-center gap-3">
                    Start Your Project
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </button>
                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
                  <span className="flex items-center gap-3">
                    View Our Process
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
