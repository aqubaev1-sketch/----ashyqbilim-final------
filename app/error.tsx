'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-grow flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl font-black text-rose-600">Қате</div>
          <h1 className="text-2xl font-bold text-slate-900">Бірдеңе дұрыс болмады</h1>
          <p className="text-slate-500 text-sm text-center">
            Сұрауды өңдеу кезінде күтпеген қате орын алды.
          </p>
          <button
            onClick={() => reset()}
            className="inline-block py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-indigo-100"
          >
            Қайта көру
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
