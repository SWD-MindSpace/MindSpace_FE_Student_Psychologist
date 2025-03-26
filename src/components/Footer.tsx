'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary-blue text-white py-6 relative bottom-0 w-full">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-4 text-center md:text-left">
          <div className='mr-10'>
            <h2 className="text-2xl font-bold font-bevnpro">MindSpace</h2>
            <p className="mt-2 text-sm">Nền tảng chăm sóc sức khỏe tinh thần đáng tin cậy.</p>
            <p className="mt-2 text-sm">Trang web tinh thần đáng tin cậy được chứng nhận.</p>
          </div>

          <div>
            <h2 className="text-xl font-bevnpro">Link nhanh</h2>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:underline">Trang chủ</Link>
              </li>
              <li>
                <Link href="/supporting-programs" className="hover:underline">Chương trình hỗ trợ</Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:underline">Về chúng tôi</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bevnpro">Tài nguyên</h2>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/resources" className="hover:underline">Blogs</Link>
              </li>
              <li>
                <Link href="/resources" className="hover:underline">Articles</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bevnpro">Các bài test</h2>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/alltests" className="hover:underline">Psychology test</Link>
              </li>
              <li>
                <Link href="/alltests" className="hover:underline">Periodic test</Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-6 text-center text-sm border-t border-gray-300 pt-4">
          <p>© {new Date().getFullYear()} MindSpace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
