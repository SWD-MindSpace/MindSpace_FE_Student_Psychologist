'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Image, Spinner } from '@heroui/react';
import Link from 'next/link';

interface Article {
  id: number;
  title: string;
  introduction: string;
  thumbnailUrl: string;
  articleUrl: string;
  specializationName: string;
  schoolManagerName: string;
}

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchArticle = async () => {
      try {
        const response = await fetch(`https://localhost:7096/api/v1/resources/articles/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch article');

        const data = await response.json();
        setArticle(data);
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) return <Spinner size="lg" color="primary" className="flex justify-center mt-6" />;
  if (!article) return <p className="text-center text-red-500">Article not found</p>;

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-center">{article.title}</h1>
      <p className="text-lg text-gray-600 mb-4 text-center">{article.introduction}</p>

      <div className="mb-6">
        <Image src={article.thumbnailUrl} alt={article.title} className="w-full max-h-[500px] object-cover rounded-lg shadow-md" />
      </div>

      <p className="text-lg text-gray-700 mb-6">
        <strong>Specialization:</strong> {article.specializationName} <br />
        <strong>School Manager:</strong> {article.schoolManagerName}
      </p>

      {/* Read Full Article Button */}
      <div className="text-center">
        <Link href={article.articleUrl} target="_blank" rel="noopener noreferrer" className="text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-lg font-semibold shadow-md">
          Read Full Article ↗
        </Link>
      </div>
    </div>
  );
}
