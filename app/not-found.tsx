'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-grow flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl font-black text-indigo-600">404</div>
          <h1 className="text-2xl font-bold text-slate-900">Бет табылмады</h1>
          <p className="text-slate-500 text-sm">
            Кешіріңіз, сіз сұраған бет жоқ немесе басқа жаққа жылжытылған.
          </p>
          <Link
            href="/"
            className="inline-block py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-indigo-100"
          >
            Басты бетке
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
