/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
    name: string;
    avatar?: string | null;
  };
  date: string;
  tags?: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
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
  image?: string | null;
  author: string;
  date: string;
  tags?: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

const Card = ({ blog }: { blog: Blog }) => {
  const [coverImageError, setCoverImageError] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);
  const tag = blog.tags?.length ? blog.tags[0] : blog.category || "General";

  const isValidAvatar =
    blog.author?.avatar &&
    typeof blog.author.avatar === "string" &&
    blog.author.avatar.trim() !== "";

  const authorInitials = blog.author?.name
    ? blog.author.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AU";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full sm:w-[320px] md:w-[370px]"
    >
      <Link
        href={`/blog/${blog.slug}`}
        className="group block"
        aria-label={`Read ${blog.title}`}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          {/* Cover Image */}
          <div className="relative w-full h-32 sm:h-40 lg:h-46 overflow-hidden">
            {blog.image && !coverImageError ? (
              <Image
                src={blog.image}
                alt={`${blog.title} cover`}
                width={350}
                height={225}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                style={{ aspectRatio: "16/9" }}
                onError={() => setCoverImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-5xl">
                📄
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col justify-between h-full space-y-4">
            {/* Author & Tag */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-sm bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                  {isValidAvatar && !avatarImageError ? (
                    <Image
                      src={blog.author.avatar!}
                      alt={blog.author.name}
                      width={48}
                      height={48}
                      className="object-cover w-12 h-12"
                      onError={() => setAvatarImageError(true)}
                    />
                  ) : (
                    <div className="text-white font-semibold text-sm">
                      {authorInitials}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-gray-900 dark:text-white font-semibold text-base sm:text-lg">
                    {blog.author?.name || "Unknown Author"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                    {blog.date
                      ? new Date(blog.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Unknown Date"}
                  </p>
                </div>
              </div>

              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs sm:text-sm font-semibold px-3 py-1 rounded-full transition-transform duration-300 group-hover:scale-105">
                {tag}
              </span>
            </div>

            {/* Title & Excerpt */}
            <div className="flex-1 flex flex-col justify-between space-y-2">
              <h2 className="text-gray-900 dark:text-white text-lg sm:text-xl font-bold line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {blog.title || "Untitled"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base line-clamp-3">
                {blog.content || "No content available"}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3">
              <div></div> {/* Empty div to maintain layout */}
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold py-2 px-4 rounded-xl transition-transform duration-300 transform hover:scale-105">
                Read More
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const BlogPage = () => {
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
          date: blog.date || new Date().toISOString(),
          author: {
            userId: blog.author || "unknown",
            name: authorCache[blog.author]?.firstName ? `${authorCache[blog.author].firstName} ${authorCache[blog.author].lastName}`.trim() : "Unknown Author",
            avatar: authorCache[blog.author]?.avatar || null,
          },
        }));

        setBlogs(mappedBlogs);
        setFilteredBlogs(mappedBlogs);
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
      setFilteredBlogs(blogs.filter(blog => blog.category === selectedCategory));
    } else {
      setFilteredBlogs(blogs);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white py-8 sm:py-10 lg:py-12 px-6 sm:px-8 lg:px-10 flex flex-col lg:flex-row items-center justify-between rounded-2xl mb-10 sm:mb-12 lg:mb-16 shadow-xl dark:shadow-2xl"
        >
          <div className="relative z-10 transform transition-transform duration-300 hover:scale-[1.01] max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400">
              Discover Expert Insights <br /> Start Your Journey Today!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg">
              Explore our collection of tutorials and insights from industry experts. Stay updated with the latest trends and best practices in technology.
            </p>
          </div>
          <button className="relative z-10 mt-4 lg:mt-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white font-semibold py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-purple-500/25">
            <span className="flex items-center gap-2 text-sm sm:text-base">
              Start Exploring
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-blue-500/10 dark:from-purple-500/20 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-tr from-purple-500/10 dark:from-blue-500/20 to-transparent rounded-full blur-xl" />
        </motion.div>

        {/* Blog Section Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 mb-3 sm:mb-4">
            Latest Articles
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg max-w-xl sm:max-w-2xl mx-auto">
            Stay informed with our latest insights, tutorials, and industry updates from our expert team.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900/80 rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden h-[400px] shadow-sm"
              >
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-lg skeleton-pulse" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-24 rounded skeleton-pulse" />
                        <Skeleton className="h-4 w-32 rounded skeleton-pulse" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20 rounded-lg skeleton-pulse" />
                  </div>
                  <Skeleton className="w-full h-32 rounded-lg skeleton-pulse" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4 rounded skeleton-pulse" />
                    <Skeleton className="h-4 w-full rounded skeleton-pulse" />
                    <Skeleton className="h-4 w-2/3 rounded skeleton-pulse" />
                    <Skeleton className="h-4 w-16 rounded skeleton-pulse" />
                  </div>
                  <Skeleton className="h-10 w-24 rounded-lg skeleton-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-600 dark:text-gray-400 px-4">
            <div className="w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-purple-500/20 dark:to-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-10 sm:w-12 h-10 sm:h-12 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">Error</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-600 dark:text-gray-400 px-4">
            <div className="w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-purple-500/20 dark:to-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-10 sm:w-12 h-10 sm:h-12 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">No articles found</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Check back later for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {filteredBlogs.map((blog: Blog) => (
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
              <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <svg className="w-4 sm:w-5 h-4 sm:h-5 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-10 sm:mt-12 lg:mt-16">
          <div className="relative bg-white dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl p-6 sm:p-8 lg:p-10 overflow-hidden shadow-xl dark:shadow-2xl">
            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-blue-500/10 dark:from-purple-500/20 to-transparent rounded-full blur-xl" />
            <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-tr from-purple-500/10 dark:from-blue-500/20 to-transparent rounded-full blur-xl" />
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 lg:mb-6">
                Stay Updated with Our Newsletter
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 lg:mb-8 max-w-xl sm:max-w-2xl mx-auto text-sm sm:text-base lg:text-lg">
                Get the latest insights, tutorials, and industry updates delivered directly to your inbox. Never miss out on important developments in technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
                />
                <button className="inline-flex items-center justify-center px-4 sm:px-5 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105">
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