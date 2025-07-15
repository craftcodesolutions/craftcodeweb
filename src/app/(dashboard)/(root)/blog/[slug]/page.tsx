import React from 'react';
import { sampleBlogs } from '../_components/BlogPage';
import BlogDetails from '../_components/BlogDetails';
import { notFound } from 'next/navigation';

interface SlugPageProps {
  params: { slug: string };
}

const SlugPage = ({ params }: SlugPageProps) => {
  const blog = sampleBlogs.find((b) => b.slug === params.slug);

  if (!blog) {
    notFound();
    return null;
  }

  return <BlogDetails blog={blog} />;
};

export default SlugPage; 