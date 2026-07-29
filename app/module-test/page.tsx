'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/AuthContext';
import { DBManager, Course, Module, ModuleQuestion } from '@/lib/dbManager';
import {
  Award,
  ArrowLeft,
  Check,
  X,
  ChevronRight,
  ClipboardCheck,
  Trophy,
  RefreshCcw,
  BookOpen,
  Info,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function ModuleTestContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, progress, refreshProgress } = useAuth();

  const courseIdParam = searchParams.get('courseId');
  const moduleIdParam = searchParams.get('moduleId');

  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [questions, setQuestions] = useState<ModuleQuestion[]>([]);

  // Test session state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [scorePercent, setScorePercent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingScore, setSubmittingScore] = useState(false);

  // Load courses + modules
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const loadedCourses = await DBManager.getCourses();
        setCourses(loadedCourses);
        const loadedModules = await DBManager.getModules();
        setModules(loadedModules);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Resolve selected course / module directly from URL params (derived, not synced via effect)
  const selectedCourse = courseIdParam ? (courses.find(c => c.id === courseIdParam) || null) : null;
  const selectedModule = moduleIdParam ? (modules.find(m => m.id === moduleIdParam) || null) : null;

  // Load questions when module changes
  useEffect(() => {
    async function loadQuestionsForModule() {
      if (!moduleIdParam) {
        setQuestions([]);
        return;
      }
      try {
        const loadedQuestions = await DBManager.getModuleQuestions(moduleIdParam);
        setQuestions(loadedQuestions);
        // Reset session state
        setCurrentIdx(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setCorrectAnswersCount(0);
        setScorePercent(null);
      } catch (err) {
        console.error(err);
      }
    }
    loadQuestionsForModule();
  }, [moduleIdParam]);

  const selectCourse = (courseId: string) => {
    router.push(`/module-test?courseId=${courseId}`);
  };

  const selectModule = (moduleId: string) => {
    router.push(`/module-test?courseId=${courseIdParam}&moduleId=${moduleId}`);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    setIsAnswered(true);

    const activeQuestion = questions[currentIdx];
    if (selectedOption === activeQuestion.correct_option) {
      setCorrectAnswersCount(prev => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // End of test, compute percentage
      const finalCount = selectedOption === questions[currentIdx].correct_option
        ? correctAnswersCount + 1
        : correctAnswersCount;

      const percentage = Math.round((finalCount / questions.length) * 100);
      setScorePercent(percentage);

      // Save to Database/Local if logged in — kept separate from course quiz_scores
      if (user && moduleIdParam) {
        setSubmittingScore(true);
        try {
          await DBManager.saveModuleTestScore(user.id, moduleIdParam, percentage);
          await refreshProgress();
        } catch (err) {
          console.error(err);
        } finally {
          setSubmittingScore(false);
        }
      }
    }
  };

  const handleRestartTest = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectAnswersCount(0);
    setScorePercent(null);
  };

  const handleBackToModule = async () => {
    if (!selectedCourse || !selectedModule) return;
    try {
      const moduleLessons = await DBManager.getLessons(selectedModule.id);
      const firstLesson = [...moduleLessons].sort((a, b) => a.order_index - b.order_index)[0];
      if (firstLesson) {
        router.push(`/courses?id=${selectedCourse.id}&lesson=${firstLesson.id}`);
      } else {
        router.push(`/courses?id=${selectedCourse.id}`);
      }
    } catch (err) {
      console.error(err);
      router.push(`/courses?id=${selectedCourse.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-medium text-sm">Тест дайындалуда...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // --- STEP 1: SELECT COURSE ---
  if (!selectedCourse) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-grow py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="max-w-3xl mb-12 text-center md:text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Модуль бойынша қорытынды тест</span>
              <h1 className="text-3xl font-black text-slate-900 mt-3 tracking-tight">Итоговое тестирование по модулям</h1>
              <p className="text-slate-600 mt-2">
                По завершении каждого модуля предусмотрено итоговое тестирование, позволяющее оценить уровень усвоения изученного материала.
                Это отдельный тест — выберите курс, затем модуль, чтобы начать.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => selectCourse(course.id)}
                  className="text-left bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-4">
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors break-words">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-3 mb-5">
                      Модульдер бойынша қорытынды тесттерін тапсыру үшін курсты таңдаңыз.
                    </p>
                  </div>
                  <div className="flex items-center space-x-1.5 text-indigo-600 font-bold text-sm">
                    <span>Модульдерді көру</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- STEP 2: SELECT MODULE ---
  if (!selectedModule) {
    const courseModules = modules.filter(m => m.course_id === selectedCourse.id).sort((a, b) => a.order_index - b.order_index);

    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-grow py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => router.push('/courses')}
              className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Курстарға оралу</span>
            </button>

            <div className="max-w-3xl mb-10">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{selectedCourse.title}</h1>
              <p className="text-slate-500 mt-2 text-sm">Итоговый тест по модулю — выберите модуль, чтобы начать тестирование.</p>
            </div>

            <div className="space-y-3">
              {courseModules.map((mod) => {
                const highscore = progress?.module_test_scores?.[mod.id];
                return (
                  <button
                    key={mod.id}
                    onClick={() => selectModule(mod.id)}
                    className="w-full text-left bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between hover:border-indigo-200 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{mod.title}</div>
                        <div className="text-xs text-slate-400">Модуль {mod.order_index}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0 ml-3">
                      {highscore !== undefined && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center space-x-1">
                          <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          <span>{highscore}%</span>
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- STEP 3a: RESULTS SCREEN ---
  if (scorePercent !== null) {
    const passed = scorePercent >= 60;
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-grow py-12 flex items-center justify-center">
          <div className="max-w-lg w-full mx-auto px-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-sm">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                <Award className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                {passed ? 'Модуль тесті сәтті тапсырылды!' : 'Тест аяқталды'}
              </h2>
              <p className="text-slate-500 mb-6 text-sm">
                Сіз «{selectedModule.title}» модулі бойынша қорытынды тестті {scorePercent}% дұрыс жауаппен тапсырдыңыз.
                {submittingScore && ' Нәтиже сақталуда...'}
              </p>

              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-8">
                <div
                  className={`h-full transition-all duration-700 ${passed ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${scorePercent}%` }}
                ></div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleBackToModule}
                  className="w-full sm:w-auto flex-1 px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Модульге оралу</span>
                </button>

                <button
                  onClick={handleRestartTest}
                  className="w-full sm:w-auto flex-1 px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span>Қайтадан өту</span>
                </button>

                {/* <button
                  onClick={() => router.push(`/module-test?courseId=${selectedCourse.id}`)}
                  className="w-full sm:w-auto flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Басқа модуль тесті</span>
                  <ChevronRight className="w-4 h-4" />
                </button> */}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- STEP 3b: NO QUESTIONS YET ---
  if (questions.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-grow py-12 flex items-center justify-center">
          <div className="text-center p-6 space-y-4">
            <Lock className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Бұл модульдің қорытынды тесті әзірге дайын емес</h3>
            <button
              onClick={() => router.push(`/courses?id=${selectedCourse.id}`)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Артқа оралу
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- STEP 3c: ACTIVE TEST SESSION ---
  const activeQuestion = questions[currentIdx];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-3xl mx-auto px-4">

          {/* Header Progress navigation */}
          <div className="flex justify-between items-center mb-2">
            <button
              // onClick={() => router.push(`/courses?id=${selectedCourse.id}`)}
              onClick={handleBackToModule}
              className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-900 uppercase transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Модульге оралу</span>
            </button>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Сұрақ {currentIdx + 1} - {questions.length}
            </div>
          </div>
          <div className="text-sm font-bold text-slate-800 mb-6">{selectedModule.title}</div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-8">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">

            <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-snug mb-8">
              {activeQuestion.text}
            </h2>

            <div className="space-y-3.5 mb-8">
              {activeQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;

                let optionStyle = 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-slate-100/50';
                if (isSelected) {
                  optionStyle = 'border-indigo-600 bg-indigo-50/60 text-indigo-900 ring-1 ring-indigo-500';
                }

                if (isAnswered) {
                  if (idx === activeQuestion.correct_option) {
                    optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900';
                  } else if (isSelected && selectedOption !== activeQuestion.correct_option) {
                    optionStyle = 'border-rose-500 bg-rose-50 text-rose-900';
                  } else {
                    optionStyle = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4.5 rounded-2xl border text-sm font-semibold transition-all duration-200 flex items-center justify-between ${optionStyle}`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                        isSelected && !isAnswered
                          ? 'bg-indigo-600 text-white'
                          : isAnswered && idx === activeQuestion.correct_option
                          ? 'bg-emerald-600 text-white'
                          : isAnswered && isSelected
                          ? 'bg-rose-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-500'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isAnswered && idx === activeQuestion.correct_option && (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    {isAnswered && isSelected && selectedOption !== activeQuestion.correct_option && (
                      <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                        <X className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {isAnswered && activeQuestion.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 mb-8 flex items-start space-x-3 text-xs text-slate-600 leading-relaxed"
                >
                  <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-800 mb-1">Тапсырманы талдау:</div>
                    <div>{activeQuestion.explanation}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end">
              {!isAnswered ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={selectedOption === null}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-sm transition-all shadow-md shadow-indigo-100 flex items-center space-x-1"
                >
                  <span>Жауапты тексеру</span>
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-sm transition-all flex items-center space-x-1"
                >
                  <span>{currentIdx + 1 === questions.length ? 'Тесті аяқтау' : 'Келесі сұрақ'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ModuleTest() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-medium text-sm">Тест дайындалуда...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <ModuleTestContent />
    </Suspense>
  );
}
