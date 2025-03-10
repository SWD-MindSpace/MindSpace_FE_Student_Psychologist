'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Divider, Image, Spinner, Card, CardBody } from '@heroui/react';
import { HiAcademicCap, HiUser, HiOutlineDocumentText } from 'react-icons/hi';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

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
  const router = useRouter();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);

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

  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      try {
        const response = await fetch('https://localhost:7096/api/v1/resources/blogs?pageIndex=1&pageSize=6', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch related blogs');

        const data = await response.json();
        setRelatedBlogs(data.data);
      } catch (error) {
        console.error('Error fetching related blogs:', error);
      }
    };

    fetchRelatedBlogs();
  }, []);

  if (loading) return <Spinner size="lg" color="primary" className="flex justify-center mt-6" />;
  if (!blog) return <p className="text-center text-red-500">Blog not found</p>;

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="flex flex-col items-center justify-center gap-5 mb-4">
        <h1 className="flex items-center text-4xl font-extrabold text-transparent bg-clip-text 
                 bg-gradient-to-r from-secondary-blue to-primary-blue 
                 font-bevnpro leading-tight gap-2">
          <HiOutlineDocumentText className="text-5xl text-secondary-blue" />
          {blog.title}
        </h1>
        <div className="flex items-center py-2 gap-4 font-bevnpro cursor-pointer"
          onClick={() => router.push('/resources')}
        >
          <span className="text-xl text-black font-semibold">MindSpace</span>
          <Divider orientation="vertical" className="h-8 w-1 bg-primary-blue" />
          <span className="text-xl text-black font-semibold">Blog</span>
        </div>
      </div>

      <div className="mb-6">
        <Image src={blog.thumbnailUrl} alt={blog.title} className="w-full max-h-[500px] object-cover rounded-lg shadow-md" />
      </div>

      <div className='flex flex-col md:flex-row justify-between mb-10 py-6 px-4 bg-blue-50 rounded-lg shadow-md border border-gray-200'>
        <p className="flex items-center text-xl text-gray-700 font-noto-sans gap-2">
          <HiAcademicCap className="text-black text-2xl" />
          <span className='font-bevnpro font-semibold'>Specialization:</span> {blog.specializationName}
        </p>
        <p className="flex items-center text-xl text-gray-700 font-noto-sans gap-2">
          <HiUser className="text-black text-2xl" />
          <span className='font-bevnpro font-semibold'>School Manager:</span> {blog.schoolManagerName}
        </p>
      </div>

      <div className="text-2xl text-black mb-10 font-noto-sans leading-relaxed">
        <div className='font-bevnpro font-bold text-secondary-blue text-3xl py-4'>Introduction</div>
        <div>{blog.introduction} </div>
      </div>

      <Divider className='h-1 w-1/2 mx-auto bg-sky-700 rounded-md' />

      {blog.sections.map((section, index) => (
        <div key={index} className="mt-8">
          <h2 className="text-3xl font-semibold mb-2 font-bevnpro text-secondary-blue">{section.heading}</h2>
          <div dangerouslySetInnerHTML={{ __html: section.htmlContent }} className="text-lg text-gray-800 leading-relaxed font-noto-sans"></div>
        </div>
      ))}

      <Divider className='h-1 mt-10 bg-sky-700 rounded-md'/> 

      <div className="mt-12">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">More to Explore</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedBlogs.length > 0 ? (
            relatedBlogs.map((relatedBlog) => (
              <Link key={relatedBlog.id} href={`/blog/${relatedBlog.id}`} className="h-full">
                <Card className="hover:shadow-xl transition-transform hover:scale-105 border border-gray-200 rounded-lg flex flex-col h-full">
                  <Image src={relatedBlog.thumbnailUrl} alt={relatedBlog.title} className="w-full h-40 object-cover rounded-t-lg" />
                  <CardBody className="flex flex-col flex-grow p-4">
                    <h3 className="text-xl font-semibold text-gray-800 min-h-[60px]">{relatedBlog.title}</h3>
                    <p className="text-gray-600 mt-2 line-clamp-3">{relatedBlog.introduction}</p>
                    <div className="mt-auto">
                      <button className="flex items-center gap-2 text-blue-600 hover:underline">
                        Read More
                        <FaArrowRight className="text-sm" />
                      </button>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-600">No related blogs found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
