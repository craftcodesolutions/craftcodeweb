// pages/blogs/[slug].tsx
import BlogDetailsPage from './_components/BlogDetailsPage';

// Define the props interface for the page component
interface BlogDetailsProps {
  params: Promise<{ slug: string }>; // ✅ Type params as a Promise
}

// Rename to BlogDetails (fix typo) and add params prop
const BlogDetails = ({ params }: BlogDetailsProps) => {
  return <BlogDetailsPage params={params} />;
};

export default BlogDetails;