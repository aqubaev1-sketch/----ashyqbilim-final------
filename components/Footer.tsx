import React from 'react';
import Link from 'next/link';
import { GraduationCap, Code, Database, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="app-footer" className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2 group text-white">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">ASHYQ BILIM</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm">
              Ғылыми жұмыстарды жариялауға, деректермен алмасуға және академиялық зерттеулерді дамытуға арналған ашық цифрлық платформа. Әрбір зерттеуші үшін білімге қолжетімділік.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Навигация</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Басты бет</Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-white transition-colors">Курстар каталогы</Link>
              </li>
              <li>
                <Link href="/practice" className="hover:text-white transition-colors">Интерактивті практикум</Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors">Қолдау және кері байланыс</Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack Column */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">БАЙЛАНЫС</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center space-x-2">
                
                <span>Email: info@qyzpu.edu.kz</span>
              </li>
              <li className="flex items-center space-x-2">
                
                <span>Тел: +7 (727) 237-00-95</span>
              </li>
              <li className="flex items-center space-x-2">
                <Link href="/license" className="hover:text-white transition-colors">Лицензия</Link>
                
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-xs">
          <p>© {new Date().getFullYear()} ASHYQ BILIM. Барлық құқықтар қорғалған.</p>
          <p className="flex items-center space-x-1">
            
          </p>
        </div>
      </div>
    </footer>
  );
}
