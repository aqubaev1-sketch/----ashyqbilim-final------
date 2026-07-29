'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { 
  GraduationCap, 
  Flame, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  BookOpen, 
  CheckSquare 
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { user, progress, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const navLinks = [
    { name: 'Басты бет', href: '/', icon: GraduationCap },
    { name: 'Курстар', href: '/courses', icon: BookOpen },
    { name: 'Практикум', href: '/practice', icon: CheckSquare },
    // { name: 'Поддержка', href: '/support', icon: User },
  ];

  return (
    <header id="app-header" className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <GraduationCap className="w-6 h-6 transition-transform group-hover:scale-110" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                ASHYQ BILIM
              </span>
              
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const LinkIcon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            
            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/admin')
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-rose-600 hover:bg-rose-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Админка</span>
              </Link>
            )}
          </nav>

          {/* User Section (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="inline-flex items-center gap-1 border border-slate-200 bg-white rounded-full px-2.5 h-9">
               
                {/* User email */}
                <span className="text-xs font-medium text-slate-700 truncate max-w-[150px]" title={user.email}>
                  {/* {user.email?.split('@')[0]} */}
                  <Link href="/profile" className="p-2 rounded-full text-slate-500 hover:text-indigo-600  transition-colors" title="Личный кабинет">
                  <User className="w-5 h-5" />
                  </Link>
                </span>
                 {/* Разделитель */}
                <div className="w-px h-5 bg-slate-200"></div>

                <button
                  onClick={logout}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                  title="Выйти"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Кіру
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  Тіркелу
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {/* {user && (
              <div className="flex items-center space-x-1 mr-3 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600 animate-pulse" />
                <span>{progress?.streak || 0}</span>
              </div>
            )} */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const LinkIcon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-base font-medium transition-all ${
                  active
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LinkIcon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
              
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-base font-medium transition-all ${
                isActive('/admin')
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Админка</span>
            </Link>
          )}

          <div className="border-t border-slate-100 pt-3 mt-2">
            {user ? (
              <div className="space-y-2">
                {/* Добавляем ссылку на профиль */}
    <Link
      href="/profile"
      onClick={() => setMobileMenuOpen(false)}
      className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
    >
      <User className="w-5 h-5 text-indigo-600" />
      <span>Личный кабинет</span>
    </Link>
                
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center space-x-2 px-4 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Выйти из аккаунта</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center items-center py-2 text-center text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Кіру
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center items-center py-2 text-center text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Тіркелу
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
