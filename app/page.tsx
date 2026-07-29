'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { useAuth } from '@/lib/AuthContext';
import { DBManager, Course } from '@/lib/dbManager';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  CheckCircle, 
  ArrowRight, 
  Flame, 
  Sparkles, 
  HelpCircle,
  Database,
  Users,
  Code
} from 'lucide-react';

export default function Home() {
  const { user, progress, loading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await DBManager.getCourses();
        setCourses(data);
      } catch (e) {
        console.error(e);
      } finally {
        setCoursesLoading(false);
      }
    }
    loadCourses();
  }, []);

  // Calculate stats for the user
  const completedLessonsCount = progress?.completed_lessons?.length || 0;
  const averageQuizScore = progress?.quiz_scores 
    ? Math.round(
        Object.values(progress.quiz_scores).reduce((sum, score) => sum + score, 0) / 
        (Object.keys(progress.quiz_scores).length || 1)
      ) 
    : 0;
  const quizzesCompletedCount = progress?.quiz_scores ? Object.keys(progress.quiz_scores).length : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section id="hero-section" className="relative py-20 md:py-28 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center space-y-6 max-w-4xl mx-auto">
              
              {/* Animated Badge */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 rounded-full py-1.5 px-4 text-indigo-700 text-xs font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 fill-indigo-500 text-indigo-600" />
                <span>Цифрлық білім беру платформасы</span>
              </motion.div>

              {/* Headline */}
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight"
              >
                Ғылыми зерттеулерге арналған ашық {' '}
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                 цифрлық білім беру ресурсы
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed"
              >
                Цифрлық білім беру материалдарын жариялауға, сақтауға және зерделеуге арналған заманауи білім беру платформасы
              </motion.p>

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
              >
                <Link
                  href="/courses"
                  className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all flex items-center justify-center space-x-2 group"
                >
                  <span>Оқуды бастау</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                
                <Link
                  href="/practice"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center space-x-2"
                >
                  <Award className="w-5 h-5 text-indigo-500" />
                  <span>Практикумға өту</span>
                </Link>
              </motion.div>

            </div>
          </div>
        </section>

        {/* User Progress Panel (if logged in) */}
        {/* {user && !loading && ( */}
          {/* <section id="user-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8 relative z-10">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center space-x-2">
                    <span>Добро пожаловать назад!</span>
                    <span className="text-xl animate-bounce">👋</span>
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Ваш учебный профиль: <span className="font-semibold text-indigo-600">{user.email}</span>
                  </p>
                </div>
                
                <div className="flex items-center space-x-4"> */}
                  {/* Streak widget */}
                  {/* <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl text-amber-800">
                    <Flame className="w-5 h-5 text-amber-600 fill-amber-500 animate-pulse" />
                    <div>
                      <div className="text-xs text-amber-600 font-medium leading-none">Активность</div>
                      <div className="text-lg font-bold leading-none mt-0.5">{progress?.streak || 0} {progress?.streak === 1 ? 'день' : progress?.streak && progress.streak < 5 ? 'дня' : 'дней'}</div>
                    </div>
                  </div>
                </div>
              </div> */}

              {/* Dashboard stats cards */}
              {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Изучено уроков</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">
                      {completedLessonsCount}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Решено тестов</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">
                      {quizzesCompletedCount}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                    {averageQuizScore}%
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Средний балл</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">
                      {averageQuizScore ? `${averageQuizScore}%` : '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section> */}
        {/* )} */}

        {/* Global Platform Statistics */}
        <section id="platform-stats" className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4">
                <div className="text-3xl md:text-4xl font-extrabold text-indigo-600">3+</div>
                <div className="text-sm text-slate-500 mt-1 font-medium">Кәсіби бағыттар</div>
              </div>
              <div className="p-4">
                <div className="text-3xl md:text-4xl font-extrabold text-violet-600">10+</div>
                <div className="text-sm text-slate-500 mt-1 font-medium">Теориялық модульдер</div>
              </div>
              <div className="p-4">
                <div className="text-3xl md:text-4xl font-extrabold text-emerald-600">100%</div>
                <div className="text-sm text-slate-500 mt-1 font-medium">Интерактивті практикум</div>
              </div>
              <div className="p-4">
                <div className="text-3xl md:text-4xl font-extrabold text-slate-800">100%</div>
                <div className="text-sm text-slate-500 mt-1 font-medium">Тексерілген білім</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Courses Catalog Section */}
        <section id="featured-courses" className="py-16 md:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Қолжетімді оқыту бағыттары
                </h2>
                <p className="text-slate-500 mt-2 max-w-2xl">
                  Мамандықты таңдап, кезең-кезеңімен оқуды бастаңыз. Әрбір курста теория, код мысалдары және тесттер бар.
                </p>
              </div>
              <Link 
                href="/courses" 
                className="inline-flex items-center space-x-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <span>Платформаның барлық курстары</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Courses grid */}
            {coursesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 animate-pulse">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                    <div className="h-5 bg-slate-100 rounded w-2/3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-100 rounded"></div>
                      <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                    </div>
                    <div className="pt-4 border-t border-slate-50 flex justify-between">
                      <div className="w-1/4 h-3 bg-slate-100 rounded"></div>
                      <div className="w-1/4 h-3 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}

          </div>
        </section>
        

        {/* Benefits Section */}
        <section id="features-bento" className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Неге ASHYQ BILIM-де оқу тиімді?
              </h2>
              <p className="text-slate-500 mt-2">
                Біз білімді бекіту үшін құрылымдық теория мен жылдам тесттерді біріктірдік.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-indigo-100 hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                  <Code className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Өзекті білім</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                 Курс бағдарламалары веб-разработканың заманауи стандарттарына бағытталған: HTML5, Flexbox, Grid, ES6+ асинхронды JS, TypeScript және React кітапханасы.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-violet-100 hover:bg-gradient-to-br hover:from-white hover:to-violet-50/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-6">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Интерактивті практикум</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                 Әрбір тақырып бойынша толыққанды тесттердің көмегімен өткен материалды бекітіңіз. Жүйе лезде кері байланыс және дұрыс нұсқаларды талдауды береді.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-emerald-100 hover:bg-gradient-to-br hover:from-white hover:to-emerald-50/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Сенімді деректер базасы</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Барлық оқу тарихы, жиналған ұпайлар тіпті белсенділік стригі (streak) Supabase деректер базасымен нақты уақыт режимінде сенімді түрде синхрондалады.
                </p>
              </div>
            </div>
          </div>
        </section>
        

        {/* Call to Action Practice */}
        <section id="cta-practice" className="py-12 bg-indigo-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-950/40"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 max-w-xl">
                <h2 className="text-xl md:text-3xl font-extrabold tracking-tight">
                  Дағдыларыңызды тексеруге дайынсыз ба?
                </h2>
                <p className="text-indigo-200 text-sm md:text-base">
                  Қазірдің өзінде жылдам тесттен өтіңіз! Барлық модульдер бойынша әр түрлі күрделіліктегі сұрақтар қолжетімді.
                </p>
              </div>
              <Link
                href="/practice"
                className="w-full md:w-auto px-8 py-4 bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-2xl shadow-lg shadow-indigo-950/20 text-center transition-all whitespace-nowrap"
              >
                Практикумнан өту
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
