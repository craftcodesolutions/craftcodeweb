/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Define the Blog interface
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
    bio?: string | null;
  };
  date: string;
  tags?: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

// Define the props interface for the page
interface BlogDetailsProps {
  params: Promise<{ slug: string }>;
}

const BlogDetailsPage = ({ params }: BlogDetailsProps) => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverImageError, setCoverImageError] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);

  // Resolve the params Promise
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    resolveParams();
  }, [params]);

  // Fetch blog data when slug is available
  useEffect(() => {
    if (!slug) return;

    const fetchBlog = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/blogs/slug/${slug}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to fetch blog (status: ${res.status})`);
        }
        const data: Blog = await res.json();
        const mappedBlog: Blog = {
          ...data,
          author: {
            userId: data.author.userId || "unknown",
            firstName: data.author.firstName || "Unknown",
            lastName: data.author.lastName || "User",
            avatar: data.author.avatar || null,
            bio: data.author.bio || "No bio available.",
          },
        };
        setBlog(mappedBlog);
      } catch (err: any) {
        setError(err instanceof Error ? err.message : "Failed to fetch blog");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (isLoading || !slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
        <Skeleton className="w-full max-w-4xl h-[600px] rounded-3xl bg-gray-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 text-red-500 dark:text-red-400 text-lg font-mono">
        {error}
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 text-gray-600 dark:text-gray-400 text-lg font-mono">
        Blog not found
      </div>
    );
  }

  const authorName = `${blog.author.firstName} ${blog.author.lastName}`.trim();
  const isValidAvatar = blog.author?.avatar && typeof blog.author.avatar === "string" && blog.author.avatar.trim() !== "";
  const authorInitials = authorName ? authorName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "AU";

  // Dynamic Key Takeaways based on content, tags, and category
  const getKeyTakeaways = (content: string, tags: string[] = [], category: string) => {
    const sentences = content.match(/[^.!?]+[.!?]/g) || [];
    const tagContext = tags.length > 0 ? `This article relates to ${tags.join(", ")}.` : "";
    const categoryContext = `Focuses on the ${category} category.`;
    
    const takeaways = [
      {
        title: "Main Theme",
        content: `${sentences[0]?.trim() || "No content available."} ${categoryContext}`,
      },
      {
        title: "Key Insight",
        content: sentences[1]?.trim() || "Explore key concepts in this article.",
      },
      {
        title: "Topic Relevance",
        content: tagContext || `Relevant to ${category} enthusiasts.`,
      },
    ].filter(item => item.content !== "");

    return takeaways.slice(0, 3);
  };

  // Dynamic Related Topics based on tags and category
  const getRelatedTopics = (tags: string[] = [], category: string) => {
    const topics = [category, ...(tags || [])];
    if (tags.length > 0) {
      topics.push(`${category} Trends`, `${tags[0]} Insights` || "Related Insights");
    } else {
      topics.push(`${category} Trends`, "General Insights");
    }
    return [...new Set(topics)].slice(0, 5);
  };

  // Dynamic Social Share Links
  const getSocialShareLinks = (title: string, slug: string, category: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://example.com";
    const blogUrl = `${baseUrl}/blogs/${slug}`;
    const encodedUrl = encodeURIComponent(blogUrl);
    const encodedTitle = encodeURIComponent(`${title} - ${category} Blog`);
    
    return [
      {
        platform: "Twitter",
        url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        icon: "🐦",
      },
      {
        platform: "LinkedIn",
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        icon: "🔗",
      },
      {
        platform: "Facebook",
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        icon: "📘",
      },
    ];
  };

  const keyTakeaways = getKeyTakeaways(blog.content, blog.tags, blog.category);
  const relatedTopics = getRelatedTopics(blog.tags, blog.category);
  const socialShareLinks = getSocialShareLinks(blog.title, blog.slug, blog.category);

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 font-sans tracking-wide py-16 px-4 sm:px-6 lg:px-8">
      {/* Background blur blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300 dark:bg-blue-800 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 dark:bg-purple-800 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-300 dark:bg-cyan-800 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-4xl mx-auto backdrop-filter backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-zinc-700 shadow-lg overflow-hidden"
      >
        {/* Blog Cover Image */}
        <div className="relative w-full h-80 sm:h-96 lg:h-[500px] overflow-hidden border-b border-gray-200 dark:border-zinc-700">
          {blog.image && !coverImageError ? (
            <div className="relative w-full h-full">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover w-full h-full rounded-sm"
                onError={() => setCoverImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/30 dark:to-zinc-950/30" />
            </div>
          ) : (
            <div className="w-full h-full bg-gray-200/30 dark:bg-zinc-800/30 flex items-center justify-center text-8xl text-gray-400 dark:text-zinc-500">
              <span role="img" aria-label="blog icon">
                &#128196;
              </span>
            </div>
          )}
        </div>

        {/* Blog Content */}
        <div className="p-6 sm:p-10 lg:p-12 space-y-10">
          <header className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 dark:text-gray-100">{blog.title}</h1>
            
            {/* Author & Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-200/50 dark:bg-zinc-800/50 backdrop-filter backdrop-blur-sm flex items-center justify-center overflow-hidden rounded-sm ring-1 ring-gray-300 dark:ring-zinc-600">
                  {isValidAvatar && !avatarImageError ? (
                    <Image
                      src={blog.author.avatar!}
                      alt={authorName}
                      width={56}
                      height={56}
                      className="object-cover w-14 h-14 rounded-sm"
                      onError={() => setAvatarImageError(true)}
                    />
                  ) : (
                    <div className="text-gray-900 dark:text-gray-100 font-semibold text-lg">{authorInitials}</div>
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">{authorName}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {new Date(blog.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {blog.tags && blog.tags.length > 0 ? (
                  blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-200/50 dark:bg-zinc-800/50 backdrop-filter backdrop-blur-sm text-gray-900 dark:text-gray-100 text-xs font-medium px-3 py-1.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="bg-gray-200/50 dark:bg-zinc-800/50 backdrop-filter backdrop-blur-sm text-gray-900 dark:text-gray-100 text-xs font-medium px-3 py-1.5 rounded-full">
                    {blog.category}
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Blog Text */}
          <div className="prose prose-xl max-w-none text-gray-800 dark:text-gray-200 leading-relaxed">
            <p>{blog.content}</p>
          </div>

          {/* Key Takeaways Section */}
          <section className="backdrop-filter backdrop-blur-sm border border-gray-200 dark:border-zinc-700 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Takeaways</h2>
            <Accordion type="single" collapsible className="w-full">
              {keyTakeaways.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-t border-gray-200 dark:border-zinc-700 last:border-b-0">
                  <AccordionTrigger className="text-gray-900 dark:text-gray-100 hover:no-underline cursor-pointer">{item.title}</AccordionTrigger>
                  <AccordionContent className="text-gray-700 dark:text-gray-300">
                    {item.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Related Topics Section */}
          <section className="backdrop-filter backdrop-blur-sm border border-gray-200 dark:border-zinc-700 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Related Topics</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTopics.map((topic, index) => (
                <a
                  key={index}
                  href={`/topics/${topic.toLowerCase().replace(/\s+/g, "-")}`}
                  className="bg-gray-200/50 dark:bg-zinc-800/50 backdrop-filter backdrop-blur-sm text-gray-900 dark:text-gray-100 text-sm font-medium px-4 py-2 rounded-full hover:bg-blue-500/50 dark:hover:bg-blue-600/50 hover:text-white transition-all duration-300 cursor-pointer"
                >
                  {topic}
                </a>
              ))}
            </div>
          </section>

          {/* Social Share Section */}
          <section className="backdrop-filter backdrop-blur-sm border border-gray-200 dark:border-zinc-700 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Share This Article</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {socialShareLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gray-200/50 dark:bg-zinc-800/50 backdrop-filter backdrop-blur-sm text-gray-900 dark:text-gray-100 text-sm font-medium px-4 py-2 rounded-full hover:bg-blue-500/50 dark:hover:bg-blue-600/50 hover:text-white transition-all duration-300 cursor-pointer"
                >
                  <span>{link.icon}</span>
                  <span>{link.platform}</span>
                </a>
              ))}
            </div>
          </section>

          {/* Author Bio */}
          <section className="border-t border-gray-200 dark:border-zinc-700 pt-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">About the Author</h2>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-20 h-20 bg-gray-200/50 dark:bg-zinc-800/50 backdrop-filter backdrop-blur-sm flex items-center justify-center overflow-hidden rounded-sm ring-1 ring-gray-300 dark:ring-zinc-600">
                {isValidAvatar && !avatarImageError ? (
                  <Image
                    src={blog.author.avatar!}
                    alt={authorName}
                    width={80}
                    height={80}
                    className="object-cover w-20 h-20 rounded-sm"
                    onError={() => setAvatarImageError(true)}
                  />
                ) : (
                  <div className="text-gray-900 dark:text-gray-100 font-semibold text-xl">{authorInitials}</div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">{authorName}</p>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">{blog.author.bio || "No bio available."}</p>
              </div>
            </div>
          </section>

          {/* Newsletter Signup */}
          <aside className="backdrop-filter backdrop-blur-sm border border-gray-200 dark:border-zinc-700 rounded-3xl p-6 sm:p-8 mt-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Stay Updated</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 max-w-xl mx-auto text-sm sm:text-base">
              Get the latest insights delivered directly to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="email@example.com"
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 dark:text-gray-100 bg-gray-200/50 dark:bg-zinc-800/50 border border-gray-300 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <button className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white bg-blue-600 dark:bg-blue-500 border border-blue-600 dark:border-blue-500 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 cursor-pointer">
                Subscribe
              </button>
            </div>
          </aside>

          {/* Footer Meta */}
          <footer className="border-t border-gray-200 dark:border-zinc-700 pt-6 mt-8">
            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 text-sm">
              <p>Category: <span className="text-gray-900 dark:text-gray-100">{blog.category}</span></p>
              <p>
                Updated:{" "}
                {new Date(blog.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </footer>
        </div>
      </motion.article>
    </div>
  );
};

export default BlogDetailsPage;