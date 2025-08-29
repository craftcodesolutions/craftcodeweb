/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

// Blog interface with author object
interface Blog {
  _id: string;
  slug: string;
  title: string;
  content: string;
  image?: string | null;
  author: {
    userId: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
  createdAt: string;
  tags?: string[];
  category: string;
  published: boolean;
}

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
}

// Raw blog type to ensure author is a string from API
interface RawBlog {
  _id: string;
  slug: string;
  title: string;
  content: string;
  coverImage?: string | null;
  author: string;
  createdAt: string;
  tags?: string[];
  category: string;
  published: boolean;
}

const Card = ({ blog }: { blog: Blog }) => {
  const [imageError, setImageError] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);
  const tag = blog.tags && blog.tags.length > 0 ? blog.tags[0] : blog.category || "General";
  const authorName = `${blog.author.firstName} ${blog.author.lastName}`.trim();
  const authorInitials = authorName
    ? authorName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AU";
  const isValidAvatar =
    blog.author?.avatar &&
    typeof blog.author.avatar === "string" &&
    blog.author.avatar.trim() !== "";

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
                  {isValidAvatar && !avatarImageError ? (
                    <Image
                      src={blog.author.avatar!}
                      alt={authorName}
                      width={40}
                      height={40}
                      className="object-cover w-10 h-10 rounded-lg"
                      onError={() => setAvatarImageError(true)}
                    />
                  ) : (
                    <div>{authorInitials}</div>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-gray-900 dark:text-white text-base font-semibold">
                    {authorName || "Unknown Author"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                {tag}
              </span>
            </div>

            {blog.image && !imageError ? (
              <div className="relative w-full h-36 rounded-lg overflow-hidden shadow-sm group-hover:scale-[1.03] transition-transform duration-300">
                <Image
                  src={blog.image}
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
                {blog.title || "Untitled"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-base line-clamp-2">
                {blog.content || "No content available"}
              </p>
            </div>

            <button className="mt-4 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-transparent hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-gray-900 text-sm font-semibold py-2 px-5 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-sm flex items-center gap-2 self-start">
              Read More
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
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
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchBlogsAndAuthors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch blogs
        const blogResponse = await fetch(`/api/blogs?page=${currentPage}&limit=${itemsPerPage}`);
        
        if (!blogResponse.ok) {
          const errorData = await blogResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch blogs (status: ${blogResponse.status})`);
        }
        const blogData = await blogResponse.json();
        console.log(blogData)
        const rawBlogs: RawBlog[] = Array.isArray(blogData.blogs) ? blogData.blogs : [];

        // Fetch author details for each unique userId
        const authorCache: { [key: string]: User } = {};
        const uniqueAuthorIds = [...new Set(rawBlogs.map(blog => blog.author).filter(id => id))] as string[];

        for (const userId of uniqueAuthorIds) {
          try {
            const userResponse = await fetch(`/api/users/${userId}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              authorCache[userId] = {
                userId,
                firstName: userData.firstName || "Unknown",
                lastName: userData.lastName || "User",
                avatar: userData.avatar && typeof userData.avatar === "string" && userData.avatar.trim() !== "" ? userData.avatar : null,
              };
            } else {
              console.warn(`User ${userId} not found or unauthorized, status: ${userResponse.status}`);
              authorCache[userId] = {
                userId,
                firstName: "Unknown",
                lastName: "User",
                avatar: null,
              };
            }
          } catch (userError: unknown) {
            console.error(`Failed to fetch user ${userId}:`, userError instanceof Error ? userError.message : "Unknown error");
            authorCache[userId] = {
              userId,
              firstName: "Unknown",
              lastName: "User",
              avatar: null,
            };
          }
        }

        // Map blogs with author details
        const mappedBlogs: Blog[] = rawBlogs.map(blog => ({
          ...blog,
          title: blog.title || "Untitled",
          content: blog.content || "",
          category: blog.category || "General",
          tags: blog.tags || [],
          createdAt: blog.createdAt || new Date().toISOString(),
          author: {
            userId: blog.author || "unknown",
            firstName: authorCache[blog.author]?.firstName || "Unknown",
            lastName: authorCache[blog.author]?.lastName || "User",
            avatar: authorCache[blog.author]?.avatar || null,
          },
          published: blog.published ?? true,
        }));

        setBlogs(mappedBlogs);
        setFilteredBlogs(mappedBlogs.filter(blog => blog.published));
        setCategories([...new Set(mappedBlogs.map(blog => blog.category)), "All"]);
        setTotalPages(Number.isInteger(blogData.totalPages) && blogData.totalPages > 0 ? blogData.totalPages : 1);
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch blogs";
        setError(errorMessage);
        console.error("Fetch blogs error:", errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogsAndAuthors();
  }, [currentPage]);

  // Filter blogs by selected category
  useEffect(() => {
    if (selectedCategory && selectedCategory !== "All") {
      setFilteredBlogs(blogs.filter(blog => blog.category === selectedCategory && blog.published));
    } else {
      setFilteredBlogs(blogs.filter(blog => blog.published));
    }
    setCurrentPage(1); // Reset to page 1 when category changes
  }, [selectedCategory, blogs]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <style jsx global>{`
        .skeleton-pulse {
          background: linear-gradient(
            90deg,
            rgba(229, 231, 235, 0.8) 0%,
            rgba(209, 213, 219, 0.9) 50%,
            rgba(229, 231, 235, 0.8) 100%
          );
          background-size: 200% 100%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
      <div className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-16">
        <div
          className="relative mx-auto mb-12 max-w-[620px] pt-6 text-center md:mb-20 lg:pt-16"
          data-wow-delay=".2s"
        >
          <span
            className="absolute top-0 left-1/2 -translate-x-1/2 text-[40px] sm:text-[60px] lg:text-[95px] font-extrabold leading-none opacity-10 select-none pointer-events-none"
            style={{ color: "#d1d5db" }}
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

        {/* Category Filter */}
        <div className="mb-8 cursor-pointer sm:mb-10 lg:mb-12 flex flex-wrap justify-center gap-2 sm:gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 cursor-pointer text-sm sm:text-base font-semibold rounded-full transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "bg-gray-200/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 hover:bg-blue-500/50 dark:hover:bg-blue-600/50 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden h-[420px] shadow-sm"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-lg skeleton-pulse" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24 rounded skeleton-pulse" />
                        <Skeleton className="h-3 w-32 rounded skeleton-pulse" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20 rounded-lg skeleton-pulse" />
                  </div>
                  <Skeleton className="w-full h-36 rounded-lg skeleton-pulse" />
                  <div className="space-y-1">
                    <Skeleton className="h-6 w-3/4 rounded skeleton-pulse" />
                    <Skeleton className="h-4 w-full rounded skeleton-pulse" />
                    <Skeleton className="h-4 w-2/3 rounded skeleton-pulse" />
                  </div>
                  <Skeleton className="h-10 w-32 rounded-lg skeleton-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-600 dark:text-gray-400">
            <div className="w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-purple-500/20 dark:to-blue-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-10 sm:w-12 h-10 sm:h-12 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">Error</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-600 dark:text-gray-400">
            <div className="w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-purple-500/20 dark:to-blue-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-10 sm:w-12 h-10 sm:h-12 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">No articles found</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Check back later for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredBlogs.map((blog) => (
              <Card key={blog._id} blog={blog} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 sm:mt-12 lg:mt-14 flex justify-center items-center gap-3 sm:gap-4 lg:gap-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center px-3 sm:px-4 lg:px-5 py-2 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <svg
                className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm lg:text-base">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center px-3 sm:px-4 lg:px-5 py-2 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Next
              <svg
                className="w-4 sm:w-5 h-4 sm:h-5 ml-1 sm:ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogSection;