import React from 'react';
import Image from 'next/image';
import { Blog } from './BlogPage';

interface BlogDetailsProps {
  blog: Blog;
}

const BlogDetails: React.FC<BlogDetailsProps> = ({ blog }) => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{blog.title}</h1>
      <div className="flex items-center gap-4 mb-6">
        {blog.author.avatar && (
          <Image
            src={blog.author.avatar}
            alt={blog.author.name}
            width={40}
            height={40}
            className="rounded-full object-cover w-10 h-10"
          />
        )}
        <span className="text-gray-700 dark:text-gray-300 font-medium">{blog.author.name}</span>
        <span className="text-gray-500 dark:text-gray-400 text-sm">{new Date(blog.createdAt).toLocaleDateString()}</span>
        {blog.readTime && <span className="text-gray-400 dark:text-gray-500 text-xs ml-2">{blog.readTime}</span>}
      </div>
      {blog.coverImage && (
        <div className="relative w-full max-w-2xl h-64 mb-8 rounded-lg overflow-hidden mx-auto">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            width={800}
            height={400}
            className="object-cover w-full h-full"
            style={{ aspectRatio: '16/9' }}
          />
        </div>
      )}
      <div className="prose dark:prose-invert max-w-none mb-8">
        <p>{blog.content}</p>
      </div>
      {blog.tags && blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {blog.tags.map(tag => (
            <span key={tag} className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogDetails; 