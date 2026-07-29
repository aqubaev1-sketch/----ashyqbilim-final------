'use client';

import React, { useEffect, useState, Suspense } from 'react';
import useSWR from 'swr';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { useAuth } from '@/lib/AuthContext';
import { 
  DBManager, 
  Course, 
  Module, 
  Lesson,
  LessonSummary
} from '@/lib/dbManager';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  CheckCircle, 
  Lock, 
  ArrowLeft, 
  Award, 
  Play, 
  Clock, 
  BookOpenCheck,
  Code,
  ExternalLink,
  ImageIcon,
  Maximize2,
  X
} from 'lucide-react';

function CoursesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, progress, refreshProgress } = useAuth();
  
  const courseIdParam = searchParams.get('id');
  const lessonIdParam = searchParams.get('lesson');

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  // Collapsible modules state
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [isMobileContentOpen, setIsMobileContentOpen] = useState(false);

  const toggleModule = (moduleId: string, currentExpanded: boolean) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !currentExpanded
    }));
  };

  // Course catalog — cached by SWR under the key 'courses', so navigating
  // away and back doesn't re-fetch it from Supabase every time.
  const { data: courses = [], isLoading: coursesLoading } = useSWR<Course[]>(
    'courses',
    () => DBManager.getCourses()
  );

  // Modules + a LIGHTWEIGHT lesson list (id/title only, no content) for the
  // sidebar — cached per course id.
  const { data: courseContent } = useSWR(
    courseIdParam ? ['course-content', courseIdParam] : null,
    () => DBManager.getCourseContent(courseIdParam as string)
  );
  const modules: Module[] = courseContent?.modules ?? [];
  const lessons: LessonSummary[] = courseContent?.lessons ?? [];

  const selectedCourse = courseIdParam ? (courses.find(c => c.id === courseIdParam) || null) : null;

  // The lesson that should be open: whichever is in the URL, or the first
  // lesson of the course if none is specified yet.
  const activeLessonId = lessonIdParam || lessons[0]?.id || null;

  // Full lesson content (body text, images, video) — fetched ONLY for the
  // lesson that's actually open right now, cached per lesson id. This is
  // what previously made opening a course slow: all lessons' full content
  // used to be downloaded upfront just to show the sidebar.
  const { data: selectedLesson, isLoading: lessonContentLoading } = useSWR(
    activeLessonId ? ['lesson', activeLessonId] : null,
    () => DBManager.getLessonById(activeLessonId as string)
  );

  const loading = coursesLoading;

  const selectLesson = (lessonId: string) => {
    router.push(`/courses?id=${courseIdParam}&lesson=${lessonId}`);
  };

  const handleCompleteLesson = async () => {
    if (!user || !selectedLesson) return;
    setCompleting(true);
    try {
      await DBManager.completeLesson(user.id, selectedLesson.id);
      await refreshProgress();
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  // Helper to render inline code, bold, and regular text
  const renderTextWithFormatting = (text: string, key: string) => {
    const parts: React.ReactNode[] = [];
    let currentText = text;
    
    // Split by backticks first for inline code
    const codeSplit = currentText.split(/(`[^`]+`)/g);
    let partIdx = 0;
    
    for (const segment of codeSplit) {
      if (segment.startsWith('`') && segment.endsWith('`')) {
        const codeText = segment.slice(1, -1);
        parts.push(
          <code key={`${key}-code-${partIdx}`} className="bg-indigo-50/80 text-indigo-600 px-1.5 py-0.5 rounded font-mono text-xs border border-indigo-100/40">
            {codeText}
          </code>
        );
      } else {
        // Now split this segment by bold **
        const boldSplit = segment.split(/(\*\*[^*]+\*\*)/g);
        let boldIdx = 0;
        for (const boldSegment of boldSplit) {
          if (boldSegment.startsWith('**') && boldSegment.endsWith('**')) {
            const boldText = boldSegment.slice(2, -2);
            parts.push(
              <strong key={`${key}-bold-${partIdx}-${boldIdx}`} className="font-bold text-slate-900">
                {boldText}
              </strong>
            );
          } else {
            parts.push(<span key={`${key}-span-${partIdx}-${boldIdx}`}>{boldSegment}</span>);
          }
          boldIdx++;
        }
      }
      partIdx++;
    }
    
    return <>{parts}</>;
  };

  // Helper to parse and render Markdown style inline images ![alt](url) and links [text](url)
  const parseInlineContent = (text: string, keyPrefix: string | number) => {
    // Matches (!?) (Group 1: is it an image?), [alt/text] (Group 2), (url) (Group 3)
    // Allows whitespace before/after brackets and parentheses, and spaces inside the URL
    const regex = /(!?)\[([^\]]*?)\]\s*\(\s*([^)]+)\s*\)/g;
    let match;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let count = 0;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        elements.push(
          <span key={`${keyPrefix}-txt-${count}`}>
            {renderTextWithFormatting(text.substring(lastIndex, matchIndex), `${keyPrefix}-fmt-pre-${count}`)}
          </span>
        );
      }
      
      const isImage = match[1] === '!';
      const label = match[2];
      const url = match[3].trim();
      
      if (isImage) {
        let displayUrl = url;
        if (selectedLesson) {
          const lessonImgs = selectedLesson.images && selectedLesson.images.length > 0
            ? selectedLesson.images
            : (selectedLesson.image_url ? [selectedLesson.image_url] : []);
          
          const matchPhoto = url.match(/^(?:photo-|img:|photo:)?(\d+)$/i);
          if (matchPhoto) {
            const pIdx = parseInt(matchPhoto[1], 10) - 1;
            if (pIdx >= 0 && pIdx < lessonImgs.length) {
              displayUrl = lessonImgs[pIdx];
            }
          }
        }

        elements.push(
          <div key={`${keyPrefix}-img-${count}`} className="my-6">
            <div 
              onClick={() => setPreviewImage(displayUrl)}
              className="relative block rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-[500px] flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <img
                src={displayUrl}
                alt={label}
                className="max-h-[460px] object-contain w-full block group-hover:scale-[1.01] transition-transform"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback to a clean coding/illustrations placeholder if the user provided link is broken or offline
                  if (!e.currentTarget.dataset.fallback) {
                    e.currentTarget.dataset.fallback = 'true';
                    e.currentTarget.src = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800";
                  }
                }}
              />
              {label && (
                <div className="w-full text-center py-2.5 px-4 bg-slate-100/80 border-t border-slate-100 text-xs font-semibold text-slate-500">
                  {label}
                </div>
              )}
            </div>
          </div>
        );
      } else {
        // Render as styled external link
        elements.push(
          <a
            key={`${keyPrefix}-link-${count}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-bold underline decoration-indigo-300 decoration-2 underline-offset-2 transition-colors mx-1"
          >
            <span>{label}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        );
      }

      lastIndex = regex.lastIndex;
      count++;
    }

    if (lastIndex < text.length) {
      elements.push(
        <span key={`${keyPrefix}-txt-${count}`}>
          {renderTextWithFormatting(text.substring(lastIndex), `${keyPrefix}-fmt-post-${count}`)}
        </span>
      );
    }

    if (elements.length === 0) {
      return renderTextWithFormatting(text, `${keyPrefix}-fmt-none`);
    }
    return <>{elements}</>;
  };

  // Helper to render customized pseudo-markdown for lesson text
  const renderLessonContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-2xl font-bold text-slate-900 mt-8 mb-4 border-b border-slate-100 pb-2">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-bold text-slate-800 mt-6 mb-3">{line.replace('### ', '')}</h3>;
      }
      // Code blocks start or end
      if (line.trim().startsWith('```')) {
        return null; // Handle within block state if we want complex, but for simplicity let's hide the raw ticks
      }
      // Code lines
      if (line.startsWith('  ') || line.startsWith('const ') || line.startsWith('let ') || line.startsWith('function ') || line.startsWith('import ') || line.startsWith('export ') || line.startsWith('fetch(') || line.startsWith('server.listen') || line.startsWith('CREATE TABLE') || line.startsWith('ALTER TABLE') || line.startsWith('CREATE POLICY')) {
        return (
          <pre key={idx} className="bg-slate-900 text-indigo-200 p-4 rounded-xl font-mono text-sm overflow-x-auto my-3 border border-slate-800 shadow-inner">
            <code>{line}</code>
          </pre>
        );
      }
      // List items
      if (line.startsWith('- ') || line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
        const cleanLine = line.replace(/^[-*] |\d+\. /, '');
        return (
          <li key={idx} className="text-slate-600 ml-6 list-disc mb-1.5 leading-relaxed">
            {parseInlineContent(cleanLine, idx)}
          </li>
        );
      }
      // Normal lines
      if (line.trim() === '') return <div key={idx} className="h-3"></div>;
      
      return (
        <div key={idx} className="text-slate-600 mb-4 leading-relaxed break-words">
          {parseInlineContent(line, idx)}
        </div>
      );
    });
  };
  const getYouTubeEmbedUrl = (url: string) => {
  try {
    const u = new URL(url);

    // https://youtu.be/VIDEO_ID
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${u.pathname}`;
    }

    // https://www.youtube.com/watch?v=VIDEO_ID
    const id = u.searchParams.get("v");
    if (id) {
      return `https://www.youtube.com/embed/${id}`;
    }

    return url;
  } catch {
    return "";
  }
};
  

  // Check completion status
  const isLessonCompleted = (lessonId: string) => {
    return progress?.completed_lessons?.includes(lessonId) || false;
  };

  // Calculate course completeness percentage
  const getCourseCompleteness = (courseId: string) => {
    const courseLessons = lessons.map(l => l.id);
    if (courseLessons.length === 0) return 0;
    const completed = courseLessons.filter(id => progress?.completed_lessons?.includes(id));
    return Math.round((completed.length / courseLessons.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-medium text-sm">Материалдар жүктелуде...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // --- CATALOG VIEW ---
  if (!selectedCourse) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-grow py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Оқу жоспары</span>
              <h1 className="text-3xl font-black text-slate-900 mt-3 tracking-tight">Курстар каталогы</h1>
              <p className="text-slate-600 mt-2">
                Өзіңізге ұнайтын технологияларды таңдап, біздің құрылымдалған бағдарламамыз бойынша веб-әзірлеу дағдыларын дамытыңыз.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- LESSON VIEW ---
  const currentCompleteness = getCourseCompleteness(selectedCourse.id);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Bar Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-200">
            <button 
              onClick={() => router.push('/courses')}
              className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Каталогқа оралу</span>
            </button>

            {/* Course Progress Widget */}
            <div className="flex items-center space-x-3 bg-white p-2.5 px-4 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto">
              <div className="text-xs">
                <div className="text-slate-500 font-medium">Курстың прогресі</div>
                <div className="text-slate-800 font-extrabold mt-0.5">{currentCompleteness}% өтілді</div>
              </div>
              <div className="w-24 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${currentCompleteness}%` }}></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Modules and Lessons Navigation */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm sticky top-24">
                {/* Header bar - clickable on mobile to toggle whole menu */}
                <button 
                  type="button"
                  onClick={() => setIsMobileContentOpen(prev => !prev)}
                  className="w-full text-left p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between cursor-pointer lg:cursor-default"
                >
                  <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Курстың мазмұны</span>
                  </h3>
                  <div className="flex items-center space-x-2 lg:hidden">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {isMobileContentOpen ? 'Жасыру' : 'Көрсету'}
                    </span>
                    {isMobileContentOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Modules & lessons list - hidden by default on mobile unless toggled open */}
                <div className={`p-2 space-y-3 max-h-[60vh] overflow-y-auto ${isMobileContentOpen ? 'block' : 'hidden lg:block'}`}>
                  {modules.map((mod) => {
                    const modLessons = lessons.filter(l => l.module_id === mod.id);
                    const isExpanded = expandedModules[mod.id] ?? (selectedLesson?.module_id === mod.id);
                    const isModuleCompleted = modLessons.length > 0 && modLessons.every(l => isLessonCompleted(l.id));
                    const moduleTestScore = progress?.module_test_scores?.[mod.id];

                    return (
                      <div key={mod.id} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                        {/* Module header toggle */}
                        <button
                          type="button"
                          onClick={() => toggleModule(mod.id, isExpanded)}
                          className="w-full text-left px-3 py-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between bg-slate-100/70 hover:bg-slate-200/70 transition-colors"
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span className="truncate">{mod.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal normal-case">
                              ({modLessons.length})
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 ml-1" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 ml-1" />
                          )}
                        </button>

                        {/* Module lessons list */}
                        {isExpanded && (
                          <div className="p-1 space-y-0.5 bg-white border-t border-slate-100">
                            {modLessons.map((l) => {
                              const isSelected = selectedLesson?.id === l.id;
                              const isCompleted = isLessonCompleted(l.id);
                              return (
                                <button
                                  key={l.id}
                                  type="button"
                                  onClick={() => {
                                    selectLesson(l.id);
                                    setIsMobileContentOpen(false);
                                  }}
                                  className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                    isSelected
                                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2 truncate pr-2">
                                    {isCompleted ? (
                                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                                    ) : (
                                      <Play className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                    )}
                                    <span className="truncate">{l.title}</span>
                                  </div>
                                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                                </button>
                              );
                            })}

                            {/* Итоговое тестирование по модулю (Тест) — отдельно от Практикума курса.
                                Открывается после завершения всех уроков модуля. */}
                            <button
                              type="button"
                              disabled={!isModuleCompleted}
                              onClick={() => {
                                if (!isModuleCompleted) return;
                                router.push(`/module-test?courseId=${selectedCourse.id}&moduleId=${mod.id}`);
                                setIsMobileContentOpen(false);
                              }}
                              title={isModuleCompleted ? 'Модуль бойынша қорытынды тест' : 'Алдымен модульдің барлық сабақтарын аяқтаңыз'}
                              className={`w-full mt-1 text-left flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                                isModuleCompleted
                                  ? 'text-indigo-700 bg-indigo-50 border-indigo-100 hover:bg-indigo-100'
                                  : 'text-slate-400 bg-slate-50 border-slate-100 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center space-x-2 truncate pr-2">
                                {isModuleCompleted ? (
                                  <Award className="w-3.5 h-3.5 flex-shrink-0" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                                )}
                                <span className="truncate">
                                  Модуль тесті{moduleTestScore !== undefined ? ` • ${moduleTestScore}%` : ''}
                                </span>
                              </div>
                              {isModuleCompleted && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Direct link to Course Practice Quiz */}
                <div className={`p-3 bg-indigo-50 border-t border-indigo-100 ${isMobileContentOpen ? 'block' : 'hidden lg:block'}`}>
                  <button
                    type="button"
                    onClick={() => router.push(`/practice?courseId=${selectedCourse.id}`)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Award className="w-4 h-4" />
                    <span>Қорытынды тестті тапсыру</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Lesson Reader Content Panel */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-10 shadow-sm min-h-[60vh] flex flex-col justify-between">
                {lessonContentLoading && !selectedLesson ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 text-sm font-medium">Сабақ жүктелуде...</p>
                  </div>
                ) : selectedLesson ? (
                  <div>
                    {/* Badge and completed indicator */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] uppercase tracking-widest font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                        Сабақ {selectedLesson.order_index}
                      </span>
                      {isLessonCompleted(selectedLesson.id) && (
                        <span className="flex items-center space-x-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Өтілді</span>
                        </span>
                      )}
                    </div>

                    {/* Lesson Title */}
                    <h1 className="text-2xl md:text-3.5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                      {selectedLesson.title}
                    </h1>

                    {/* Body text / code representation */}
                    <div className="prose max-w-none text-slate-700">
                      {renderLessonContent(selectedLesson.content)}
                    </div>

                    {/* Photo Materials Gallery / Фотоматериалдар мен иллюстрациялар */}
                    {(() => {
                      const lessonImages: string[] = selectedLesson.images && selectedLesson.images.length > 0
                        ? selectedLesson.images.filter(img => img && img.trim().length > 0)
                        : (selectedLesson.image_url ? [selectedLesson.image_url] : []);

                      if (lessonImages.length === 0) return null;

                      return (
                        <div className="mt-8 pt-6 border-t border-slate-100">
                          <div className="flex items-center space-x-2 mb-4">
                            <ImageIcon className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-extrabold text-slate-900 text-base">
                              Фотоматериалдар мен иллюстрациялар ({lessonImages.length})
                            </h3>
                          </div>

                          <div className={`grid gap-4 ${lessonImages.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                            {lessonImages.map((imgUrl, imgIdx) => (
                              <div
                                key={imgIdx}
                                onClick={() => setPreviewImage(imgUrl)}
                                className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer shadow-xs hover:shadow-md transition-all duration-200 aspect-video flex items-center justify-center"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`${selectedLesson.title} - Фото ${imgIdx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    if (!e.currentTarget.dataset.fallback) {
                                      e.currentTarget.dataset.fallback = 'true';
                                      e.currentTarget.src = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800";
                                    }
                                  }}
                                />
                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-full shadow-md flex items-center space-x-1">
                                    <Maximize2 className="w-3.5 h-3.5" />
                                    <span>Үлкейтіп қарау</span>
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Видео урок */}
                     {selectedLesson.video_url && (
                       <div className="mt-10">
                         <h2 className="text-xl font-bold text-slate-900 mb-4">
                         </h2>
                         

                         <div className="aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                           <iframe
                             className="w-full h-full"
                            src={getYouTubeEmbedUrl(selectedLesson.video_url || "")}
                             title="Видео урок"
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                             allowFullScreen
                           />
                         </div>
                         {/* <div className="mt-4 flex justify-center">
  <a
    href={selectedLesson.video_url}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all"
  >
    ▶ Смотреть видео
  </a>
</div> */}
                         
                       </div>
                     )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <BookOpenCheck className="w-14 h-14 text-indigo-400" />
                    <h3 className="text-lg font-bold text-slate-900">Бұл модульде әзірге сабақтар жоқ</h3>
                    <p className="text-slate-500 max-w-sm text-sm">Сол жақ мәзірден басқа оқу бағытын таңдаңыз.</p>
                  </div>
                )}

                {/* Completion Bottom Bar */}
                {selectedLesson && (
                  <div className="border-t border-slate-100 pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {!user ? (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between w-full gap-4">
                        <div className="text-sm text-slate-600 text-center sm:text-left">
                          <span className="font-semibold text-indigo-600">Прогресті сақтау</span> және белсенділік жинау үшін тіркеліңіз немесе аккаунтқа кіріңіз.
                        </div>
                        <button
                          onClick={() => router.push('/auth/login')}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors whitespace-nowrap shadow-md shadow-indigo-100"
                        >
                          Сақтау үшін кіру
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-slate-500">
                          {isLessonCompleted(selectedLesson.id) 
                            ? 'Бұл сабақты сәтті аяқтадыңыз!' 
                            : 'Теорияны оқып шықтыңыз ба? Прогресті белгілеңіз:'}
                        </div>
                        
                        {!isLessonCompleted(selectedLesson.id) ? (
                          <button
                            onClick={handleCompleteLesson}
                            disabled={completing}
                            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>{completing ? 'Сақталуда...' : 'Сабақты аяқтау'}</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100">
                            <span>Сабақ аяқталды!</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />

      {/* Full-screen Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center p-3 border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-full transition-colors shadow-lg border border-slate-700 flex items-center justify-center"
              title="Жабу"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Толық өлшемдегі фотоматериал"
              className="max-h-[82vh] max-w-full object-contain rounded-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Courses() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-medium text-sm">Материалдар жүктелуде...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <CoursesContent />
    </Suspense>
  );
}
