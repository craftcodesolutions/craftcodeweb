"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

interface Blog {
  id: string;
  slug: string;
  title: string;
  content: string;
  coverImage?: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  tags?: string[];
  published: boolean;
  readTime?: string;
}

const sampleBlogs: Blog[] = [
  {
    id: '1',
    slug: 'modern-web-development-trends',
    title: 'Modern Web Development Trends in 2024',
    content: 'Explore the latest trends in web development including AI integration, performance optimization, and modern frameworks that are shaping the future of the web.',
    coverImage: '/images/blog/image-1.jpg',
    author: {
      name: 'Sarah Johnson',
      avatar: '/images/blog/author.png'
    },
    createdAt: '2024-01-15',
    tags: ['Web Development', 'Trends'],
    published: true,
    readTime: '5 min read'
  },
  {
    id: '2',
    slug: 'ai-in-software-development',
    title: 'The Impact of AI on Software Development',
    content: 'Discover how artificial intelligence is revolutionizing software development processes, from code generation to automated testing and deployment.',
    coverImage: '/images/blog/image-2.jpg',
    author: {
      name: 'Michael Chen',
      avatar: '/images/blog/author.png'
    },
    createdAt: '2024-01-12',
    tags: ['AI', 'Software Development'],
    published: true,
    readTime: '8 min read'
  },
  {
    id: '3',
    slug: 'react-performance-optimization',
    title: 'Advanced React Performance Optimization Techniques',
    content: 'Learn advanced techniques for optimizing React applications including code splitting, memoization, and bundle optimization strategies.',
    coverImage: '/images/blog/image-3.jpg',
    author: {
      name: 'Emily Rodriguez',
      avatar: '/images/blog/author.png'
    },
    createdAt: '2024-01-10',
    tags: ['React', 'Performance'],
    published: true,
    readTime: '6 min read'
  },
  {
    id: '4',
    slug: 'cloud-native-architecture',
    title: 'Building Scalable Cloud-Native Applications',
    content: 'Explore best practices for designing and implementing cloud-native applications that can scale efficiently and handle high traffic loads.',
    coverImage: '/images/blog/mi1@2x.png',
    author: {
      name: 'David Kim',
      avatar: '/images/blog/author.png'
    },
    createdAt: '2024-01-08',
    tags: ['Cloud', 'Architecture'],
    published: true,
    readTime: '10 min read'
  },
  {
    id: '5',
    slug: 'cybersecurity-best-practices',
    title: 'Essential Cybersecurity Practices for Developers',
    content: 'Learn about critical security practices that every developer should implement to protect applications and user data from common threats.',
    coverImage: '/images/blog/mi2@2x.png',
    author: {
      name: 'Lisa Wang',
      avatar: '/images/blog/author.png'
    },
    createdAt: '2024-01-05',
    tags: ['Security', 'Best Practices'],
    published: true,
    readTime: '7 min read'
  },
  {
    id: '6',
    slug: 'mobile-app-development-guide',
    title: 'Complete Guide to Modern Mobile App Development',
    content: 'A comprehensive guide covering everything from choosing the right framework to deploying and maintaining mobile applications.',
    coverImage: '/images/blog/blog-details.jpg',
    author: {
      name: 'Alex Thompson',
      avatar: '/images/blog/author.png'
    },
    createdAt: '2024-01-03',
    tags: ['Mobile', 'Development'],
    published: true,
    readTime: '12 min read'
  }
];

export type { Blog };
export { sampleBlogs };


const Card = ({ blog }: { blog: Blog }) => {
  const [imageError, setImageError] = useState(false);
  const tag = blog.tags && blog.tags.length > 0 ? blog.tags[0] : "General";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/blog/${blog.slug}`} className="relative group block" aria-label={`Read ${blog.title}`}>
        <div className="bg-white dark:bg-gray-900/80 rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden h-[400px] transition-all duration-300 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1">
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 transition-transform duration-300 group-hover:scale-105 flex items-center justify-center">
                  {blog.author.avatar ? (
                    <Image
                      src={blog.author.avatar}
                      alt={blog.author.name}
                      width={40}
                      height={40}
                      className="rounded-lg object-cover w-10 h-10"
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {blog.author.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-gray-900 dark:text-white text-lg font-semibold">
                    {blog.author.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {new Date(blog.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold px-3 py-1 rounded-lg transition-transform duration-300 group-hover:scale-105">
                {tag}
              </span>
            </div>

            {blog.coverImage && !imageError ? (
              <div className="relative w-full h-32 rounded-lg overflow-hidden">
                <Image
                  src={blog.coverImage}
                  alt={`${blog.title} cover`}
                  width={400}
                  height={200}
                  className="object-cover w-full h-full"
                  style={{ aspectRatio: '16/9' }}
                  priority={false}
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="w-full h-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg transition-colors duration-300 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 text-2xl">📄</span>
              </div>
            )}

            <div className="space-y-2">
              <h2 className="text-gray-900 dark:text-white text-xl font-bold line-clamp-1 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {blog.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                {blog.content}
              </p>
              {blog.readTime && (
                <p className="text-gray-400 dark:text-gray-500 text-xs">
                  {blog.readTime}
                </p>
              )}
            </div>

            <button className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105">
              Read More
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const BlogPage = () => {

  return (
    <div className="min-h-screen relative">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-12 px-6 sm:px-8 lg:px-12 flex flex-col lg:flex-row items-center justify-between rounded-2xl mb-16 shadow-xl dark:shadow-2xl"
        >
          <div className="relative z-10 transform transition-transform duration-300 hover:scale-[1.01]">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400">
              Discover Expert Insights <br /> Start Your Journey Today!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-4 text-base lg:text-lg max-w-2xl">
              Explore our collection of tutorials and insights from industry experts. Stay updated with the latest trends and best practices in technology.
            </p>
          </div>
          <button className="relative z-10 mt-6 lg:mt-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-purple-500/25">
            <span className="flex items-center gap-2">
              Start Exploring
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 dark:from-purple-500/20 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 dark:from-blue-500/20 to-transparent rounded-full blur-xl" />
        </motion.div>

        {/* Blog Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 mb-4">
            Latest Articles
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Stay informed with our latest insights, tutorials, and industry updates from our expert team.
          </p>
        </div>

        {sampleBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-600 dark:text-gray-400">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-purple-500/20 dark:to-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No articles found</h3>
            <p className="text-gray-600 dark:text-gray-400">Check back later for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleBlogs.map((blog: Blog) => (
              <Card key={blog.id} blog={blog} />
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-20">
          <div className="relative bg-white dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl p-12 overflow-hidden shadow-xl dark:shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 dark:from-purple-500/20 to-transparent rounded-full blur-xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 dark:from-blue-500/20 to-transparent rounded-full blur-xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Stay Updated with Our Newsletter
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
                Get the latest insights, tutorials, and industry updates delivered directly to your inbox. Never miss out on important developments in technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
                />
                <button className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;