'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardBody, Spinner, Breadcrumbs, BreadcrumbItem, Image } from '@heroui/react';
import { FaBook, FaClipboardList } from 'react-icons/fa';
import Link from 'next/link';

interface BlogPost {
  id: number;
  title: string;
  introduction: string;
  thumbnailUrl: string;
}

interface Article {
  id: number;
  title: string;
  introduction: string;
  articleUrl: string;
  thumbnailUrl: string;
}

export default function ResourcesPage() {
  const [view, setView] = useState<'blogs' | 'articles'>('blogs');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [blogsResponse, articlesResponse] = await Promise.all([
          fetch('https://localhost:7096/api/v1/resources/blogs?pageIndex=1&pageSize=5', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch('https://localhost:7096/api/v1/resources/articles?pageIndex=1&pageSize=5', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        if (!blogsResponse.ok || !articlesResponse.ok) throw new Error('Failed to fetch resources');

        const blogsData = await blogsResponse.json();
        const articlesData = await articlesResponse.json();

        setBlogPosts(blogsData.data);
        setArticles(articlesData.data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-16 px-6 text-center">
        <h1 className="text-4xl font-extrabold">MindSpace</h1>
        <p className="text-lg mt-2">
          Khám phá các blog và bài viết mới nhất về sức khỏe tâm thần.
        </p>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex justify-center my-6">
        <Breadcrumbs itemClasses={{ separator: 'px-2' }} separator="/">
          <BreadcrumbItem isCurrent={view === 'blogs'} onPress={() => setView('blogs')} className="text-2xl font-semibold cursor-pointer">
            <FaClipboardList className="mr-2" /> Bài Blogs
          </BreadcrumbItem>
          <BreadcrumbItem isCurrent={view === 'articles'} onPress={() => setView('articles')} className="text-2xl font-semibold cursor-pointer">
            <FaBook className="mr-2" /> Bài viết, báo
          </BreadcrumbItem>
        </Breadcrumbs>
      </div>

      {/* Content Section */}
      <div className="w-full px-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" color="primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {(view === 'blogs' ? blogPosts : articles).map((item) => (
              <Link key={item.id} href={view === 'blogs' ? `/blog/${item.id}` : item.thumbnailUrl} className="h-full" target={view === 'articles' ? '_blank' : undefined} rel={view === 'articles' ? 'noopener noreferrer' : undefined}>
                <Card className="hover:shadow-xl transition-shadow border border-gray-200 rounded-lg flex flex-col h-full">
                  {/* Thumbnail Image */}
                  <Image src={item.thumbnailUrl} alt={item.title} className="w-full h-40 object-cover rounded-t-lg" />

                  {/* Card Body */}
                  <CardBody className="flex flex-col flex-grow p-4">
                    <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
                    <p className="text-gray-600 mt-2 line-clamp-3">{item.introduction}</p>
                    <div className="mt-auto">
                      <button className="text-blue-600 hover:underline">Read More →</button>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}