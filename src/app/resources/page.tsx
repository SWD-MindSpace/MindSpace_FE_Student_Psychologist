'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardBody, Spinner, Breadcrumbs, BreadcrumbItem, Image, Pagination } from '@heroui/react';
import { FaBook, FaClipboardList } from 'react-icons/fa';
import Link from 'next/link';
import MotionHeading from '@/components/MotionHeading';

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
  thumbnailUrl: string;
}

export default function ResourcesPage() {
  const [view, setView] = useState<'blogs' | 'articles'>('blogs');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [blogPageIndex, setBlogPageIndex] = useState(1);
  const [articlePageIndex, setArticlePageIndex] = useState(1);
  const [blogTotalPages, setBlogTotalPages] = useState(1);
  const [articleTotalPages, setArticleTotalPages] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const blogsResponse = await fetch(
          `https://localhost:7096/api/v1/resources/blogs?pageIndex=${blogPageIndex}&pageSize=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken || ''}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const articlesResponse = await fetch(
          `https://localhost:7096/api/v1/resources/articles?pageIndex=${articlePageIndex}&pageSize=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken || ''}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!blogsResponse.ok || !articlesResponse.ok) {
          throw new Error('Failed to fetch resources');
        }

        const blogsData = await blogsResponse.json();
        const articlesData = await articlesResponse.json();

        setBlogPosts(blogsData.data);
        setArticles(articlesData.data);
        setBlogTotalPages(Math.ceil(blogsData.count / pageSize));
        setArticleTotalPages(Math.ceil(articlesData.count / pageSize));
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [blogPageIndex, articlePageIndex]);

  return (
    <div className="min-h-screen flex flex-col w-full">
      <div
        className="relative bg-cover bg-center text-white py-16 px-6 text-left"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/ddewgbug1/image/upload/v1741981097/olbcqunkuzkziwnajtqg.webp')`,
        }}
      >
        <MotionHeading className="text-5xl text-black text-center">
          MindSpace
        </MotionHeading>
        <MotionHeading className="text-xl text-black font-noto-sans mt-5 text-center" delay={0.5}>
          Khám phá các blog và bài viết mới nhất về sức khỏe tâm thần.
        </MotionHeading>
      </div>

      <div className="flex justify-center my-6">
        <Breadcrumbs itemClasses={{ separator: 'px-2' }} separator="/">
          <BreadcrumbItem
            isCurrent={view === 'blogs'}
            onPress={() => setView('blogs')}
            className="text-2xl font-semibold cursor-pointer"
          >
            <FaClipboardList className="mr-2" /> Bài Blogs
          </BreadcrumbItem>
          <BreadcrumbItem
            isCurrent={view === 'articles'}
            onPress={() => setView('articles')}
            className="text-2xl font-semibold cursor-pointer"
          >
            <FaBook className="mr-2" /> Bài viết, báo
          </BreadcrumbItem>
        </Breadcrumbs>
      </div>

      <div className="w-full px-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" color="primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {(view === 'blogs' ? blogPosts : articles).map((item) => (
                <Link
                  key={item.id}
                  href={view === 'blogs' ? `/blog/${item.id}` : `/articles/${item.id}`}
                  className="h-full"
                >
                  <Card className="hover:shadow-xl transition-transform hover:scale-105 border border-gray-200 rounded-lg flex flex-col h-full">
                    <Image src={item.thumbnailUrl} alt={item.title} className="w-full h-40 object-cover rounded-t-lg" />
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

            <div className="flex justify-center mt-6 py-4">
              <Pagination
                page={view === 'blogs' ? blogPageIndex : articlePageIndex}
                total={view === 'blogs' ? blogTotalPages : articleTotalPages}
                onChange={(newPage: number) =>
                  view === 'blogs' ? setBlogPageIndex(newPage) : setArticlePageIndex(newPage)
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}