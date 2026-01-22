/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

// Define Section interface
interface Section {
  id: number;
  type: "text" | "image";
  content: string;
  publicId?: string | null;
}

// Blog interface with author object
interface Blog {
  _id: string;
  slug: string;
  title: string;
  content: Section[] | string; // Support Section[] or legacy string
  image?: string | null;
  publicId?: string | null; // Added for banner image
  author: {
    userId: string;
    name: string;
    avatar?: string | null;
    bio?: string | null; // Added for consistency
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
  bio?: string | null;
}

// Raw blog type to ensure author is a string from API
interface RawBlog {
  _id: string;
  slug: string;
  title: string;
  content: Section[] | string; // Updated to support Section[]
  image?: string | null;
  publicId?: string | null; // Added
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

  // Extract preview from content (first text section, truncated)
  const getContentPreview = (content: Section[] | string) => {
    if (typeof content === "string") {
      return content.length > 100 ? `${content.slice(0, 100)}...` : content;
    }
    const textSection = content.find((section) => section.type === "text");
    if (!textSection) return "No content available";
    return textSection.content.length > 100
      ? `${textSection.content.slice(0, 100)}...`
      : textSection.content;
  };

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
        <div className="bg-white/70 dark:bg-[#0B1C2D] rounded-2xl border border-[#DCEEEE] dark:border-[#1E3A4A] shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
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
              <div className="w-full h-full bg-gradient-to-r from-[#EEF7F6] to-[#DCEEEE] dark:from-[#102A3A] dark:to-[#0B1C2D] flex items-center justify-center text-5xl text-[#7B8A9A] dark:text-[#6B8299]">
                📄
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col justify-between h-full space-y-4">
            {/* Author & Tag */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-sm bg-gradient-to-br from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] flex items-center justify-center overflow-hidden">
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
                  <h3 className="text-[#0F172A] dark:text-[#E6F1F5] font-semibold text-base sm:text-lg">
                    {blog.author?.name || "Unknown Author"}
                  </h3>
                  <p className="text-[#7B8A9A] dark:text-[#6B8299] text-xs sm:text-sm">
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

              <span className="bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] text-white text-xs sm:text-sm font-semibold px-3 py-1 rounded-full transition-transform duration-300 group-hover:scale-105">
                {tag}
              </span>
            </div>

            {/* Title & Excerpt */}
            <div className="flex-1 flex flex-col justify-between space-y-2">
              <h2 className="text-[#0F172A] dark:text-[#E6F1F5] text-lg sm:text-xl font-bold line-clamp-2 group-hover:text-[#1E5AA8] dark:group-hover:text-[#6EE7D8] transition-colors duration-300">
                {blog.title || "Untitled"}
              </h2>
              <p className="text-[#475569] dark:text-[#9FB3C8] text-sm sm:text-base line-clamp-3">
                {getContentPreview(blog.content)}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3">
              <div></div> {/* Empty div to maintain layout */}
              <button className="bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] hover:from-[#2FD1C5] hover:via-[#1FA2FF] hover:to-[#1E5AA8] text-white text-xs sm:text-sm font-semibold py-2 px-4 rounded-xl transition-transform duration-300 transform hover:scale-105">
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
                bio: userData.bio || "No bio available.",
              };
            } else {
              console.warn(`User ${userId} not found or unauthorized, status: ${userResponse.status}`);
              authorCache[userId] = {
                userId,
                firstName: "Unknown",
                lastName: "User",
                avatar: null,
                bio: "No bio available.",
              };
            }
          } catch (userError: unknown) {
            console.error(`Failed to fetch user ${userId}:`, userError instanceof Error ? userError.message : "Unknown error");
            authorCache[userId] = {
              userId,
              firstName: "Unknown",
              lastName: "User",
              avatar: null,
              bio: "No bio available.",
            };
          }
        }

        // Map blogs with author details
        const mappedBlogs: Blog[] = rawBlogs.map(blog => ({
          ...blog,
          title: blog.title || "Untitled",
          content: blog.content || [],
          category: blog.category || "General",
          tags: blog.tags || [],
          date: blog.date || new Date().toISOString(),
          publicId: blog.publicId || null, // Added
          author: {
            userId: blog.author || "unknown",
            name: authorCache[blog.author]?.firstName ? `${authorCache[blog.author].firstName} ${authorCache[blog.author].lastName}`.trim() : "Unknown Author",
            avatar: authorCache[blog.author]?.avatar || null,
            bio: authorCache[blog.author]?.bio || "No bio available.",
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
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(110,231,216,0.35),transparent_55%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_85%,rgba(30,90,168,0.25),transparent_55%)]"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2FD1C5]/60 to-transparent"></div>
      </div>
      <style jsx global>{`
        .skeleton-pulse {
          background: linear-gradient(
            90deg,
            rgba(238, 247, 246, 0.9) 0%,
            rgba(220, 238, 238, 0.95) 50%,
            rgba(238, 247, 246, 0.9) 100%
          );
          background-size: 200% 100%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .dark .skeleton-pulse {
          background: linear-gradient(
            90deg,
            rgba(11, 28, 45, 0.8) 0%,
            rgba(16, 42, 58, 0.95) 50%,
            rgba(11, 28, 45, 0.8) 100%
          );
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
          className="relative bg-white/70 dark:bg-[#0B1C2D]/70 backdrop-blur-xl border border-[#DCEEEE] dark:border-[#1E3A4A] text-[#0F172A] dark:text-[#E6F1F5] py-8 sm:py-10 lg:py-12 px-6 sm:px-8 lg:px-10 flex flex-col lg:flex-row items-center justify-between rounded-2xl mb-10 sm:mb-12 lg:mb-16 shadow-xl dark:shadow-2xl"
        >
          <div className="relative z-10 transform transition-transform duration-300 hover:scale-[1.01] max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] dark:from-[#0FD9C3] dark:via-[#0B8ED8] dark:to-[#0A2A66]">
              Discover Expert Insights <br /> Start Your Journey Today!
            </h1>
            <p className="text-[#475569] dark:text-[#9FB3C8] mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg">
              Explore our collection of tutorials and insights from industry experts. Stay updated with the latest trends and best practices in technology.
            </p>
          </div>
          <button className="relative z-10 mt-4 lg:mt-0 bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] hover:from-[#2FD1C5] hover:via-[#1FA2FF] hover:to-[#1E5AA8] text-white font-semibold py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-[#2FD1C5]/25 dark:hover:shadow-[#0FD9C3]/25">
            <span className="flex items-center gap-2 text-sm sm:text-base">
              Start Exploring
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-[#6EE7D8]/20 dark:from-[#0FD9C3]/20 to-transparent rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-tr from-[#1E5AA8]/20 dark:from-[#0B8ED8]/20 to-transparent rounded-full blur-xl" />
        </motion.div>

        {/* Blog Section Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] dark:from-[#0FD9C3] dark:via-[#0B8ED8] dark:to-[#0A2A66] mb-3 sm:mb-4">
            Latest Articles
          </h2>
          <p className="text-[#475569] dark:text-[#9FB3C8] text-sm sm:text-base lg:text-lg max-w-xl sm:max-w-2xl mx-auto">
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
                  ? "bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] text-white"
                  : "bg-[#EEF7F6] dark:bg-[#102A3A] text-[#0F172A] dark:text-[#9FB3C8] hover:bg-[#DCEEEE] dark:hover:bg-[#1E3A4A] hover:text-[#1E5AA8] dark:hover:text-[#6EE7D8]"
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
                className="bg-white/70 dark:bg-[#0B1C2D] rounded-xl border border-[#DCEEEE] dark:border-[#1E3A4A] overflow-hidden h-[400px] shadow-sm"
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
          <div className="flex flex-col items-center justify-center h-64 text-[#475569] dark:text-[#9FB3C8] px-4">
            <div className="w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-[#6EE7D8]/20 to-[#1E5AA8]/20 dark:from-[#0FD9C3]/20 dark:to-[#0B8ED8]/20 rounded-full flex items-center justify-center">
              <svg className="w-10 sm:w-12 h-10 sm:h-12 text-[#475569] dark:text-[#9FB3C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-2">Error</h3>
            <p className="text-sm sm:text-base text-[#475569] dark:text-[#9FB3C8]">{error}</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[#475569] dark:text-[#9FB3C8] px-4">
            <div className="w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-[#6EE7D8]/20 to-[#1E5AA8]/20 dark:from-[#0FD9C3]/20 dark:to-[#0B8ED8]/20 rounded-full flex items-center justify-center">
              <svg className="w-10 sm:w-12 h-10 sm:h-12 text-[#475569] dark:text-[#9FB3C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-2">No articles found</h3>
            <p className="text-sm sm:text-base text-[#475569] dark:text-[#9FB3C8]">Check back later for new content!</p>
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
              className="inline-flex items-center px-3 sm:px-4 lg:px-5 py-2 text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#E6F1F5] bg-[#EEF7F6] dark:bg-[#102A3A] border border-[#DCEEEE] dark:border-[#1E3A4A] rounded-lg hover:bg-[#DCEEEE] dark:hover:bg-[#1E3A4A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <span className="text-[#475569] dark:text-[#9FB3C8] text-xs sm:text-sm lg:text-base">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center px-3 sm:px-4 lg:px-5 py-2 text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#E6F1F5] bg-[#EEF7F6] dark:bg-[#102A3A] border border-[#DCEEEE] dark:border-[#1E3A4A] rounded-lg hover:bg-[#DCEEEE] dark:hover:bg-[#1E3A4A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
          <div className="relative bg-white/70 dark:bg-[#0B1C2D]/70 backdrop-blur-xl border border-[#DCEEEE] dark:border-[#1E3A4A] rounded-3xl p-6 sm:p-8 lg:p-10 overflow-hidden shadow-xl dark:shadow-2xl">
            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-[#6EE7D8]/20 dark:from-[#0FD9C3]/20 to-transparent rounded-full blur-xl" />
            <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-tr from-[#1E5AA8]/20 dark:from-[#0B8ED8]/20 to-transparent rounded-full blur-xl" />
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F172A] dark:text-[#E6F1F5] mb-3 sm:mb-4 lg:mb-6">
                Stay Updated with Our Newsletter
              </h2>
              <p className="text-[#475569] dark:text-[#9FB3C8] mb-4 sm:mb-6 lg:mb-8 max-w-xl sm:max-w-2xl mx-auto text-sm sm:text-base lg:text-lg">
                Get the latest insights, tutorials, and industry updates delivered directly to your inbox. Never miss out on important developments in technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-[#0F172A] dark:text-[#E6F1F5] bg-[#EEF7F6] dark:bg-[#102A3A] border border-[#DCEEEE] dark:border-[#1E3A4A] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2FD1C5]/50 dark:focus:ring-[#6EE7D8]/50"
                />
                <button className="inline-flex items-center justify-center px-4 sm:px-5 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] rounded-xl hover:from-[#2FD1C5] hover:via-[#1FA2FF] hover:to-[#1E5AA8] transition-all duration-300 transform hover:scale-105">
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
