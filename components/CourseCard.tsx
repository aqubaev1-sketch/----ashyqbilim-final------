'use client';

import React from 'react';
import Link from 'next/link';
import { Layout, Database, Code, Star, Clock, BookOpen, ChevronRight } from 'lucide-react';
import { Course } from '@/lib/dbManager';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  // Map icon name to lucide icon component
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layout':
        return <Layout className="w-5 h-5" />;
      case 'Database':
        return <Database className="w-5 h-5" />;
      case 'Code':
        return <Code className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Бастапқы':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Орта деңгей':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Жоғары деңгей':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div 
      id={`course-card-${course.id}`} 
      className="bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-50/40 transition-all duration-300 group"
    >
      <div>
        {/* Category Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            {getIcon(course.icon)}
          </div>
          <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getLevelColor(course.level)}`}>
            {course.level}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-slate-500 text-sm line-clamp-3 mb-5">
          {course.description}
        </p>
      </div>

      {/* Footer info */}
      <div className="border-t border-slate-50 pt-4 space-y-4">
        <div className="flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>{course.lessonsCount} {course.lessonsCount === 1 ? 'сабақ' : course.lessonsCount < 5 ? 'сабақ' : 'сабақ'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-slate-700">{course.rating.toFixed(1)}</span>
          </div>
        </div>

        <Link 
          href={`/courses?id=${course.id}`}
          className="flex items-center justify-center space-x-1 w-full py-2.5 px-4 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl text-sm font-medium text-indigo-600 transition-all group-hover:bg-indigo-50"
        >
          <span>Оқуды бастау</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
