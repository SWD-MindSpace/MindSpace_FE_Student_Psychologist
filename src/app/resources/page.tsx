'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import { FaBook, FaClipboardList } from 'react-icons/fa';
import Link from 'next/link';

export default function ResourcesPage() {
  const [view, setView] = useState<'blogs' | 'articles'>('blogs');

  const toggleView = () => {
    setView((prevView) => (prevView === 'blogs' ? 'articles' : 'blogs'));
  };

  const blogPosts = [
    {
      id: 1,
      title: 'Understanding Anxiety',
      introduction: 'A comprehensive guide on anxiety, its causes, and coping mechanisms.',
      slug: 'understanding-anxiety',
    },
    {
      id: 2,
      title: 'Managing Stress in the Workplace',
      introduction: 'Effective strategies to cope with stress in professional environments.',
      slug: 'managing-stress-in-the-workplace',
    },
    {
      id: 3,
      title: 'The Importance of Mental Health',
      introduction: 'Why mental health is crucial and how to maintain it.',
      slug: 'importance-of-mental-health',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Resources Page</h1>

      <div className="mb-6">
        <Button
          onPress={toggleView}
          startContent={view === 'blogs' ? <FaClipboardList /> : <FaBook />}
          color="primary"
        >
          {view === 'blogs' ? 'Go to Articles' : 'Go to Blogs'}
        </Button>
      </div>

      <div className="w-full max-w-md">
        {view === 'blogs' ? (
          <div className="grid grid-cols-1 gap-4">
            {blogPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card>
                  <CardBody>
                    <h3 className="text-xl font-semibold">{post.title}</h3>
                    <p>{post.introduction}</p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardBody>
              <h3 className="text-xl font-semibold">Articles</h3>
              <p>Here are some insightful articles on mental health and wellness.</p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
