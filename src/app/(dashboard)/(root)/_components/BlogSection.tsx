"use client";

import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

// Static mock data for blogs
interface Blog {
  _id: string;
  slug: string;
  title: string;
  content: string;
  coverImage?: string;
  author: string;
  createdAt: number;
  tags?: string[];
  published: boolean;
}

const staticBlogs: Blog[] = [
  {
    _id: "1",
    slug: "modern-react-patterns",
    title: "Modern React Patterns",
    content: "Explore the latest React patterns and best practices for building scalable applications.",
    coverImage: "/public/blog/image-1.jpg",
    author: "Jane Doe",
    createdAt: 1717000000000,
    tags: ["React", "Frontend"],
    published: true,
  },
  {
    _id: "2",
    slug: "nextjs-optimization",
    title: "Next.js Performance Optimization",
    content: "Tips and tricks to optimize your Next.js applications for speed and efficiency.",
    coverImage: "/public/blog/image-2.jpg",
    author: "John Smith",
    createdAt: 1716000000000,
    tags: ["Next.js", "Performance"],
    published: true,
  },
  {
    _id: "3",
    slug: "ui-ux-trends-2024",
    title: "UI/UX Trends in 2024",
    content: "Stay ahead with the latest UI/UX trends that will shape digital products in 2024.",
    coverImage: "/public/blog/image-3.jpg",
    author: "Emily Clark",
    createdAt: 1715000000000,
    tags: ["UI/UX", "Design"],
    published: true,
  },
];

const Card = ({ blog }: { blog: Blog }) => {
  const tag = blog.tags && blog.tags.length > 0 ? blog.tags[0] : "General";
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.025, boxShadow: "0 6px 32px 0 rgba(0,0,0,0.10)" }}
      className="group"
    >
      <Link href={`/blog/${blog.slug}`} className="relative block" aria-label={`Read ${blog.title}`}>
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden h-[420px] shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 flex flex-col">
          <div className="p-6 flex-1 flex flex-col space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-200 font-bold text-lg shadow-sm">
                  {blog.author[0]}
                </div>
                <div className="space-y-1">
                  <h3 className="text-gray-900 dark:text-white text-base font-semibold">
                    {blog.author}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(blog.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                {tag}
              </span>
            </div>

            {blog.coverImage && !imageError ? (
              <div className="relative w-full h-36 rounded-lg overflow-hidden shadow-sm group-hover:scale-[1.03] transition-transform duration-300">
                <Image
                  src={blog.coverImage}
                  alt={`${blog.title} cover`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  priority={false}
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="w-full h-36 bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors duration-300" />
            )}

            <div className="space-y-1 flex-1">
              <h2 className="text-gray-900 dark:text-white text-xl font-bold line-clamp-1 transition-colors duration-300">
                {blog.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-base line-clamp-2">
                {blog.content}
              </p>
            </div>

            <button className="mt-4 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-transparent hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-gray-900 text-sm font-semibold py-2 px-5 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-sm flex items-center gap-2 self-start">
              Read More
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L21 12m0 0l-3.75 5.25M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const BlogSection: NextPage = () => {
  // Only show published blogs
  const publishedBlogs = staticBlogs.filter((blog) => blog.published);

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-16">
        <div
          className="relative mx-auto mb-12 max-w-[620px] pt-6 text-center md:mb-20 lg:pt-16"
          data-wow-delay=".2s"
        >
          <span
            className="absolute top-0 left-1/2 -translate-x-1/2 text-[40px] sm:text-[60px] lg:text-[95px] font-extrabold leading-none opacity-10 select-none pointer-events-none"
            style={{ color: '#d1d5db' }}
          >
            BLOGS
          </span>

          <h2 className="font-heading text-gray-900 dark:text-gray-100 mb-5 text-3xl font-extrabold sm:text-4xl md:text-[44px] md:leading-[54px]">
            Discover Expert Insights <br /> Start Your Journey Today!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Explore our collection of tutorials and insights from industry experts.
          </p>
        </div>

        {publishedBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-600 dark:text-gray-400">
            <p className="text-lg font-medium">No blogs found</p>
            <p className="text-sm">Check back later for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {publishedBlogs.map((blog) => (
              <Card key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogSection;
