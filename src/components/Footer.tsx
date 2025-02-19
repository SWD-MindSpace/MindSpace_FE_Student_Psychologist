'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary-blue text-white py-6 relative bottom-0 w-full">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-4 text-center md:text-left">
          <div>
            <h2 className="text-3xl font-bold font-bevnpro">MindSpace</h2>
            <p className="mt-2 text-base">Your trusted mental wellness platform.</p>
            <p className="mt-2 text-base">Certified reliable mental site</p>
            <p className="mt-2 text-lg font-noto-sans">
              <Link href="#" className="hover:underline">Sign in for your help</Link>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bevnpro">Quick Links</h2>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:underline">Home</Link>
              </li>
              <li>
                <Link href="/sp" className="hover:underline">Supporting programs</Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">About Us</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bevnpro">Resources</h2>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:underline">Blogs</Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">Articles</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bevnpro">All tests</h2>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:underline">Psychology test</Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">Periodic test</Link>
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
