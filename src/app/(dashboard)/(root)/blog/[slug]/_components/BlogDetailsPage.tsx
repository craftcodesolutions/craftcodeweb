/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { use } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar, User, Tag, Share2, Mail, Clock, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Define interfaces
interface Section {
  id: number;
  type: "text" | "image";
  content: string;
  publicId?: string | null;
}

interface Blog {
  _id: string;
  slug: string;
  title: string;
  content: Section[];
  image?: string | null;
  publicId?: string | null;
  author: string;
  date: string;
  tags?: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
  excerpt?: string;
  readTime?: number;
}

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  bio?: string | null;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

interface BlogDetailsProps {
  params: Promise<{ slug: string }>;
}

const BlogDetailsPage = ({ params }: BlogDetailsProps) => {
  const { slug } = use(params);
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverImageError, setCoverImageError] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);
  const [sectionImageErrors, setSectionImageErrors] = useState<Record<number, boolean>>({});
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  // Memoized data processing functions
  const getKeyTakeaways = useCallback((content: Section[], tags: string[] = [], category: string, excerpt?: string) => {
    const textContent = content
      .filter((section) => section.type === "text")
      .map((section) => section.content)
      .join(" ");
    
    const sentences = textContent.match(/[^.!?]+[.!?]/g) || [];
    const tagContext = tags.length > 0 ? `This article relates to ${tags.join(", ")}.` : "";
    const categoryContext = `Focuses on the ${category} category.`;

    const takeaways = [
      {
        title: "Main Theme",
        content: excerpt || sentences[0]?.trim() || "No content available.",
      },
      {
        title: "Key Insight",
        content: sentences[1]?.trim() || "Explore key concepts in this article.",
      },
      {
        title: "Topic Relevance",
        content: tagContext || `Relevant to ${category} enthusiasts.`,
      },
    ].filter((item) => item.content !== "");

    return takeaways.slice(0, 3);
  }, []);

  const getRelatedTopics = useCallback((tags: string[] = [], category: string) => {
    const topics = [category, ...(tags || [])];
    if (tags.length > 0) {
      topics.push(`${category} Trends`, `${tags[0]} Insights`);
    } else {
      topics.push(`${category} Trends`, "General Insights");
    }
    return [...new Set(topics)].slice(0, 5);
  }, []);

  const getSocialShareLinks = useCallback((title: string, slug: string, category: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const blogUrl = `${baseUrl}/blogs/${slug}`;
    const encodedUrl = encodeURIComponent(blogUrl);
    const encodedTitle = encodeURIComponent(`${title} - ${category} Blog`);

    return [
      {
        platform: "Twitter",
        url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        icon: "🐦",
        color: "hover:bg-blue-400/20",
      },
      {
        platform: "LinkedIn",
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        icon: "🔗",
        color: "hover:bg-blue-500/20",
      },
      {
        platform: "Facebook",
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        icon: "📘",
        color: "hover:bg-blue-600/20",
      },
    ];
  }, []);

  const calculateReadTime = useCallback((content: Section[]): number => {
    const wordsPerMinute = 200;
    const textContent = content
      .filter(section => section.type === "text")
      .map(section => section.content)
      .join(" ");
    
    const wordCount = textContent.split(/\s+/).length;
    return Math.max(1, Math.round(wordCount / wordsPerMinute));
  }, []);

  // Fetch blog and user data
  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch blog data
        const blogRes = await fetch(`/api/blogs/slug/${encodeURIComponent(slug)}`);
        if (!blogRes.ok) {
          const errData = await blogRes.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to fetch blog (status: ${blogRes.status})`);
        }
        const blogData: Blog = await blogRes.json();

        if (!blogData) {
          throw new Error("Blog not found");
        }

        // Normalize content
        const normalizedContent: Section[] = Array.isArray(blogData.content)
          ? blogData.content
          : [
              {
                id: 1,
                type: "text",
                content: typeof blogData.content === "string" ? blogData.content : "",
              },
            ];

        // Calculate read time if not provided
        const readTime = blogData.readTime || calculateReadTime(normalizedContent);

        // Fetch user details
        const userRes = await fetch(`/api/users/${blogData.author}`);
        if (!userRes.ok) {
          throw new Error("Failed to fetch author details");
        }
        const userData: User = await userRes.json();

        setBlog({ 
          ...blogData, 
          content: normalizedContent,
          readTime 
        });
        setUser(userData);
      } catch (err: any) {
        setError(err instanceof Error ? err.message : "Failed to fetch blog");
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug, calculateReadTime]);

  const handleSubscribe = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      // In a real app, you would call your API here
      console.log("Subscribing email:", email);
      setIsSubscribed(true);
      setEmail("");
      
      // Show success message
      setTimeout(() => setIsSubscribed(false), 3000);
    } catch (err) {
      console.error("Subscription error:", err);
    }
  }, [email]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="w-full h-64 rounded-2xl bg-gray-200 dark:bg-zinc-800" />
          <div className="space-y-4 px-2">
            <Skeleton className="h-10 w-3/4 bg-gray-200 dark:bg-zinc-800 mx-auto" />
            <Skeleton className="h-6 w-1/2 bg-gray-200 dark:bg-zinc-800 mx-auto" />
            <div className="flex gap-4 pt-4 justify-center">
              <Skeleton className="w-12 h-12 rounded-full bg-gray-200 dark:bg-zinc-800" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-zinc-800" />
                <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-zinc-800" />
              </div>
            </div>
          </div>
          <div className="space-y-4 pt-8 px-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-4 w-full bg-gray-200 dark:bg-zinc-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
        <div className="text-red-500 dark:text-red-400 text-lg font-medium mb-4 text-center">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!blog || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 text-gray-600 dark:text-gray-400 text-lg px-4 text-center">
        Blog or author not found
      </div>
    );
  }

  const authorName = `${user.firstName} ${user.lastName}`.trim();
  const isValidAvatar = user.avatar && typeof user.avatar === "string" && user.avatar.trim() !== "";
  const authorInitials = authorName
    ? authorName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AU";

  const keyTakeaways = getKeyTakeaways(blog.content, blog.tags, blog.category, blog.excerpt);
  const relatedTopics = getRelatedTopics(blog.tags, blog.category);
  const socialShareLinks = getSocialShareLinks(blog.title, blog.slug, blog.category);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 font-sans tracking-wide py-4 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      {/* Back button */}
      <div className="max-w-4xl mx-auto mb-4 px-2 sm:px-0">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
      </div>

      {/* Background blur blobs - positioned correctly for all screens */}
      <div className="fixed -left-48 -top-48 w-96 h-96 bg-blue-300 dark:bg-blue-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob -z-10"></div>
      <div className="fixed -right-48 top-1/4 w-96 h-96 bg-purple-300 dark:bg-purple-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000 -z-10"></div>
      <div className="fixed left-1/4 -bottom-48 w-96 h-96 bg-cyan-300 dark:bg-cyan-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000 -z-10"></div>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-4xl mx-auto bg-white/70 dark:bg-zinc-900/70 backdrop-filter backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-zinc-700 shadow-lg overflow-hidden"
      >
        {/* Blog Cover Image */}
        <div className="relative w-full h-56 sm:h-64 md:h-80 lg:h-96 overflow-hidden">
          {blog.image && !coverImageError ? (
            <div className="relative w-full h-full">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                priority
                className="object-cover w-full h-full"
                onError={() => setCoverImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/30 dark:from-zinc-900/30 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center text-5xl sm:text-6xl text-gray-400 dark:text-zinc-500">
              <span role="img" aria-label="blog icon">
                &#128221;
              </span>
            </div>
          )}
        </div>

        {/* Blog Content */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          <header className="space-y-4 text-center sm:text-left">
            <div>
              <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full mb-4">
                {blog.category}
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {blog.title}
              </h1>
            </div>

            {/* Author & Meta */}
            <div className="flex flex-col items-center sm:items-start sm:flex-row sm:justify-between gap-4 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden rounded-sm ring-2 ring-white dark:ring-zinc-700">
                  {isValidAvatar && !avatarImageError ? (
                    <Image
                      src={user.avatar!}
                      alt={authorName}
                      width={48}
                      height={48}
                      className="object-cover w-10 h-10 sm:w-12 sm:h-12"
                      onError={() => setAvatarImageError(true)}
                    />
                  ) : (
                    <div className="text-gray-600 dark:text-gray-300 font-medium text-xs sm:text-sm">
                      {authorInitials}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="text-gray-900 dark:text-gray-100 font-medium text-sm sm:text-base">{authorName}</p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>
                        {new Date(blog.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {blog.tags && blog.tags.length > 0 && (
                  <>
                    <Tag size={14} className="text-gray-400 mt-1 hidden sm:block" />
                    {blog.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {blog.tags.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        +{blog.tags.length - 3} more
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Blog Content Sections */}
          <div className="prose prose-sm sm:prose-base max-w-none text-gray-800 dark:text-gray-200 leading-relaxed space-y-4">
            {blog.content.map((section) => (
              <div key={section.id} className="w-full">
                {section.type === "text" ? (
                  <p className="whitespace-pre-line">{section.content}</p>
                ) : (
                  <figure className="my-4">
                    <div className="relative w-full h-48 sm:h-64 md:h-80">
                      {section.content && !sectionImageErrors[section.id] ? (
                        <Image
                          src={section.content}
                          alt={`Section ${section.id}`}
                          fill
                          className="object-cover w-full h-full rounded-lg"
                          onError={() =>
                            setSectionImageErrors((prev) => ({ ...prev, [section.id]: true }))
                          }
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-2xl text-gray-400 dark:text-zinc-500 rounded-lg">
                          <span role="img" aria-label="image placeholder">
                            &#128247;
                          </span>
                        </div>
                      )}
                    </div>
                    {section.publicId && (
                      <figcaption className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {section.publicId}
                      </figcaption>
                    )}
                  </figure>
                )}
              </div>
            ))}
          </div>

          {/* Key Takeaways Section */}
          {keyTakeaways.length > 0 && (
            <section className="bg-blue-50/50 dark:bg-blue-900/20 p-4 sm:p-6 rounded-2xl">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 flex items-center gap-2 justify-center sm:justify-start">
                <span className="bg-blue-100 dark:bg-blue-900/30 p-1 sm:p-2 rounded-lg">
                  💡
                </span>
                Key Takeaways
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {keyTakeaways.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-blue-100 dark:border-blue-900/20">
                    <AccordionTrigger className="hover:no-underline text-blue-800 dark:text-blue-200 font-medium text-sm sm:text-base">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-blue-700 dark:text-blue-300 text-sm sm:text-base">
                      {item.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          )}

          {/* Related Topics */}
          {relatedTopics.length > 0 && (
            <section className="bg-gray-50/50 dark:bg-zinc-800/20 p-4 sm:p-6 rounded-2xl">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 flex items-center gap-2 justify-center sm:justify-start">
                <span className="bg-gray-100 dark:bg-zinc-800/30 p-1 sm:p-2 rounded-lg">
                  🔍
                </span>
                Explore More
              </h2>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {relatedTopics.map((topic, index) => (
                  <a
                    key={index}
                    href={`/topics/${topic.toLowerCase().replace(/\s+/g, "-")}`}
                    className="bg-white dark:bg-zinc-800/50 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all text-xs font-medium"
                  >
                    #{topic}
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Social Share */}
          <section className="bg-gray-50/50 dark:bg-zinc-800/20 p-4 sm:p-6 rounded-2xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 flex items-center gap-2 justify-center sm:justify-start">
              <Share2 size={20} />
              Share This Article
            </h2>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {socialShareLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 bg-white dark:bg-zinc-800/50 px-3 py-1.5 rounded-full ${link.color} transition-all text-xs font-medium`}
                >
                  <span>{link.icon}</span>
                  <span>{link.platform}</span>
                </a>
              ))}
            </div>
          </section>

          {/* Author Bio */}
          <section className="bg-gray-50/50 dark:bg-zinc-800/20 p-4 sm:p-6 rounded-2xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-center sm:text-left">About the Author</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
              <div className="w-14 h-14 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden rounded-sm ring-2 ring-white dark:ring-zinc-700 flex-shrink-0">
                {isValidAvatar && !avatarImageError ? (
                  <Image
                    src={user.avatar!}
                    alt={authorName}
                    width={56}
                    height={56}
                    className="object-cover w-14 h-14"
                    onError={() => setAvatarImageError(true)}
                  />
                ) : (
                  <div className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                    {authorInitials}
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-semibold text-lg">{authorName}</p>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">{user.bio || "No bio available."}</p>
                
                {user.socialLinks && (
                  <div className="flex gap-3 mt-3 justify-center sm:justify-start">
                    {user.socialLinks.twitter && (
                      <a 
                        href={user.socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 transition-colors text-sm"
                      >
                        Twitter
                      </a>
                    )}
                    {user.socialLinks.linkedin && (
                      <a 
                        href={user.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 transition-colors text-sm"
                      >
                        LinkedIn
                      </a>
                    )}
                    {user.socialLinks.website && (
                      <a 
                        href={user.socialLinks.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 transition-colors text-sm"
                      >
                        Website
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Newsletter Signup */}
          <aside className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-4 sm:p-6 text-center">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <Mail size={20} />
              Stay Updated
            </h2>
            <p className="mb-3 sm:mb-4 max-w-xl mx-auto text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Get the latest insights delivered directly to your inbox.
            </p>
            
            {isSubscribed ? (
              <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 py-2 px-3 rounded-lg text-sm">
                Thanks for subscribing! Check your email to confirm.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-full border border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm bg-white dark:bg-zinc-800"
                  required
                />
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-2 rounded-full font-medium hover:bg-blue-700 transition-all text-xs sm:text-sm whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            )}
          </aside>
        </div>
      </motion.article>
    </div>
  );
};

export default BlogDetailsPage;