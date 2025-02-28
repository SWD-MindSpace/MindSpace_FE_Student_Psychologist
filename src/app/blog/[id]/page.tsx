'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Image, Spinner } from '@heroui/react';

interface Section {
  heading: string;
  htmlContent: string;
}

interface BlogPost {
  id: number;
  title: string;
  introduction: string;
  thumbnailUrl: string;
  specializationName: string;
  schoolManagerName: string;
  sections: Section[];
}

export default function BlogDetailPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      try {
        const response = await fetch(`https://localhost:7096/api/v1/resources/blogs/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch blog');

        const data = await response.json();
        setBlog(data);
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) return <Spinner size="lg" color="primary" className="flex justify-center mt-6" />;
  if (!blog) return <p className="text-center text-red-500">Blog not found</p>;

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-center">{blog.title}</h1>
      <p className="text-lg text-gray-600 mb-4 text-center">{blog.introduction}</p>
      
      <div className="mb-6">
        <Image src={blog.thumbnailUrl} alt={blog.title} className="w-full max-h-[500px] object-cover rounded-lg shadow-md" />
      </div>

      <p className="text-lg text-gray-700 mb-6">
        <strong>Specialization:</strong> {blog.specializationName} <br />
        <strong>School Manager:</strong> {blog.schoolManagerName}
      </p>

      {/* Blog Sections */}
      {blog.sections.map((section, index) => (
        <div key={index} className="mt-8">
          <h2 className="text-3xl font-semibold mb-2">{section.heading}</h2>
          <div dangerouslySetInnerHTML={{ __html: section.htmlContent }} className="text-lg text-gray-800 leading-relaxed"></div>
        </div>
      ))}
    </div>
  );
}
