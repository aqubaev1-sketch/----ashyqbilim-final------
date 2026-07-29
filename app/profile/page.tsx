'use client';

import Link from 'next/link';
import {
  BookOpen,
  CheckCircle,
  Flame,
  Trophy,
  User,
  Settings,
  LogOut,
  ArrowRight,
} from 'lucide-react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/AuthContext';
import { useEffect, useState } from "react";
import { DBManager, Course } from '@/lib/dbManager';

export default function ProfilePage() {
  const { user, progress, loading, logout } = useAuth();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Ойлануда...
      </div>
    );
  }

  const completedLessons = progress?.completed_lessons?.length || 0;

  const quizzesCompleted = progress?.quiz_scores
    ? Object.keys(progress.quiz_scores).length
    : 0;

  const averageScore = progress?.quiz_scores
    ? Math.round(
        Object.values(progress.quiz_scores).reduce(
          (sum, score) => sum + score,
          0
        ) /
          (Object.keys(progress.quiz_scores).length || 1)
      )
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      <Header />

      <main className="flex-1 py-10">

        <div className="max-w-7xl mx-auto px-4">

          {/* Profile Card */}

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 mb-8">

            <div className="flex flex-col md:flex-row justify-between gap-6">

              <div className="flex items-center gap-5">

                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="w-10 h-10 text-indigo-600" />
                </div>

                <div>

                  <h1 className="text-3xl font-bold">
                    Қош келдіңіз!
                  </h1>

                  <p className="text-slate-500 mt-2">
                    {user?.email}
                  </p>

                </div>

              </div>

              <div className="flex items-center">

                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 flex items-center gap-3">

                  <Flame className="text-amber-500 fill-amber-500 w-6 h-6" />

                  <div>

                    <p className="text-xs text-amber-700">
                      Белсенділік
                    </p>

                    <p className="font-bold text-xl">
                      {progress?.streak || 0} күн
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* Statistics */}

          <div className="grid md:grid-cols-4 gap-6 mb-8">

            <div className="bg-white rounded-2xl p-6 shadow">

              <BookOpen className="w-8 h-8 text-indigo-600 mb-3" />

              <p className="text-slate-500 text-sm">
                Оқылған сабақтар
              </p>

              <h2 className="text-3xl font-bold">
                {completedLessons}
              </h2>

            </div>

            <div className="bg-white rounded-2xl p-6 shadow">

              <CheckCircle className="w-8 h-8 text-green-600 mb-3" />

              <p className="text-slate-500 text-sm">
                Өтілген тесттер
              </p>

              <h2 className="text-3xl font-bold">
                {quizzesCompleted}
              </h2>

            </div>

            <div className="bg-white rounded-2xl p-6 shadow">

              <Trophy className="w-8 h-8 text-yellow-500 mb-3" />

              <p className="text-slate-500 text-sm">
                Орташа балл
              </p>

              <h2 className="text-3xl font-bold">
                {averageScore}%
              </h2>

            </div>

            <div className="bg-white rounded-2xl p-6 shadow">

              <Flame className="w-8 h-8 text-red-500 mb-3" />

              <p className="text-slate-500 text-sm">
                Серия
              </p>

              <h2 className="text-3xl font-bold">
                {progress?.streak || 0}
              </h2>

            </div>

          </div>

          {/* Quick Actions */}

          <div className="grid md:grid-cols-2 gap-6">

            <Link
              href="/courses"
              className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition"
            >
              <div className="flex justify-between items-center">

                <div>

                  <h3 className="font-bold text-xl">
                    Менің курстарым
                  </h3>

                  <p className="text-slate-500 mt-2">
                    Оқуды жалғастыру
                  </p>

                </div>

                <ArrowRight />

              </div>

            </Link>

           

          </div>

          {/* Settings */}

          <div className="bg-white rounded-2xl shadow p-6 mt-8">

            

            <div className="flex flex-col gap-3">

              

              <button
                onClick={logout}
                className="flex items-center gap-3 text-red-600 hover:text-red-700"
              >

                <LogOut className="w-5 h-5" />

                Шығу

              </button>

            </div>

          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
}