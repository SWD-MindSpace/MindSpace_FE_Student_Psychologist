'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, Divider, Image, Spinner } from '@heroui/react';
import Link from 'next/link';
import { HiAcademicCap, HiOutlineDocumentText, HiUser } from 'react-icons/hi';
import { FaArrowRight } from 'react-icons/fa';

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
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchArticle = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resources/articles/${id}`, {
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

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resources/articles?pageIndex=1&pageSize=6`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch related articles');

        const data = await response.json();
        setRelatedArticles(data.data);
      } catch (error) {
        console.error('Error fetching related articles: ', error);
      }
    };

    fetchRelatedArticles();
  }, [])

  if (loading) return <Spinner size="lg" color="primary" className="flex justify-center mt-6" />;
  if (!article) return <p className="text-center text-red-500">Article not found</p>;

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="flex flex-col items-center justify-center gap-5 mb-4">
        <h1 className="flex items-center text-4xl font-extrabold text-transparent bg-clip-text 
                       bg-gradient-to-r from-secondary-blue to-primary-blue 
                       font-bevnpro leading-tight gap-2">
          <HiOutlineDocumentText className="text-5xl text-secondary-blue" />
          {article.title}
        </h1>
        <div className="flex items-center py-2 gap-4 font-bevnpro cursor-pointer"
          onClick={() => router.push('/resources')}
        >
          <span className="text-xl text-black font-semibold">MindSpace</span>
          <Divider orientation="vertical" className="h-8 w-1 bg-primary-blue" />
          <span className="text-xl text-black font-semibold">Article</span>
        </div>
      </div>

      <div className="mb-6">
        <Image src={article.thumbnailUrl} alt={article.title} className="w-full max-h-[500px] object-cover rounded-lg shadow-md" />
      </div>

      <div className='flex flex-col md:flex-row justify-between mb-10 py-6 px-4 bg-blue-50 rounded-lg shadow-md border border-gray-200'>
        <p className="flex items-center text-xl text-gray-700 font-noto-sans gap-2">
          <HiAcademicCap className="text-black text-2xl" />
          <span className='font-bevnpro font-semibold'>Specialization:</span> {article.specializationName}
        </p>
        <p className="flex items-center text-xl text-gray-700 font-noto-sans gap-2">
          <HiUser className="text-black text-2xl" />
          <span className='font-bevnpro font-semibold'>School Manager:</span> {article.schoolManagerName}
        </p>
      </div>

      <div className="text-2xl text-black mb-10 font-noto-sans leading-relaxed">
        <div className='font-bevnpro font-bold text-secondary-blue text-3xl py-4'>Introduction</div>
        <div>{article.introduction} </div>
      </div>

      <Divider className='h-1 w-1/2 mx-auto bg-sky-700 rounded-md mb-10' />
      <div className="text-center">
        <a href="https://res.cloudinary.com/ddewgbug1/image/upload/v1742910220/yg80vkpjvzwgsdpvciou.pdf"
          download
          className="text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-lg font-semibold shadow-md">
          Download PDF ⬇
        </a>
      </div>

      <Divider className='h-1 mt-10 bg-sky-700 rounded-md' />

      <div className='mt-12'>
        <h2 className='text-3xl font-extrabold text-center mb-6'>More to explore</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {relatedArticles.length > 0 ? (
            relatedArticles.map((relatedArticle) => (
              <Link key={relatedArticle.id} href={`/articles/${relatedArticle.id}`} className='h-full'>
                <Card className='hover:shadow-xl transition-transform hover:scale-105 border border-gray-200 rounded-lg'>
                  <Image src={relatedArticle.thumbnailUrl} alt={relatedArticle.title} className='w-full h-40 object-cover rounded-t-lg' />
                  <CardBody className='flex flex-col flex-grow p-4'>
                    <h3 className='text-xl font-semibold min-h-[60px]'>{relatedArticle.title}</h3>
                    <p className='mt-2 line-clamp-3'>{relatedArticle.introduction}</p>
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
            <p className='text-center'>No related article found</p>
          )}
        </div>
      </div>
    </div>
  );
}
