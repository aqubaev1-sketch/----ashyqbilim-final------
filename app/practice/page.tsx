'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/AuthContext';
import { DBManager, Course, Question } from '@/lib/dbManager';
import { 
  Award, 
  ArrowLeft, 
  Check, 
  X, 
  ChevronRight, 
  HelpCircle, 
  Trophy, 
  RefreshCcw, 
  BookOpen, 
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function PracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, progress, refreshProgress } = useAuth();

  const courseIdParam = searchParams.get('courseId');

  const [courses, setCourses] = useState<Course[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Test session state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [scorePercent, setScorePercent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingScore, setSubmittingScore] = useState(false);

  // Load basic courses
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const loadedCourses = await DBManager.getCourses();
        setCourses(loadedCourses);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Load questions when course changes
  useEffect(() => {
    async function loadQuestionsForCourse() {
      if (!courseIdParam) {
        setSelectedCourse(null);
        setQuestions([]);
        return;
      }

      const course = courses.find(c => c.id === courseIdParam) || null;
      setSelectedCourse(course);

      try {
        const loadedQuestions = await DBManager.getQuestions(courseIdParam);
        setQuestions(loadedQuestions);
        // Reset states
        setCurrentIdx(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setCorrectAnswersCount(0);
        setScorePercent(null);
      } catch (err) {
        console.error(err);
      }
    }

    if (courses.length > 0) {
      loadQuestionsForCourse();
    }
  }, [courseIdParam, courses]);

  const selectCourse = (courseId: string) => {
    router.push(`/practice?courseId=${courseId}`);
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
      // End of quiz, compute percentage
      const finalCount = selectedOption === questions[currentIdx].correct_option 
        ? correctAnswersCount + 1 
        : correctAnswersCount;
        
      const percentage = Math.round((finalCount / questions.length) * 100);
      setScorePercent(percentage);

      // Save to Database/Local if logged in
      if (user && courseIdParam) {
        setSubmittingScore(true);
        try {
          await DBManager.saveQuizScore(user.id, courseIdParam, percentage);
          await refreshProgress();
        } catch (err) {
          console.error(err);
        } finally {
          setSubmittingScore(false);
        }
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectAnswersCount(0);
    setScorePercent(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-medium text-sm">Практикум дайындалуда...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // --- SELECTION SCREEN ---
  if (!selectedCourse) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-grow py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="max-w-3xl mb-12 text-center md:text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Білімді тексеру</span>
              <h1 className="text-3xl font-black text-slate-900 mt-3 tracking-tight">Интерактивті практикум</h1>
              <p className="text-slate-600 mt-2">
                Тестіден өту үшін бағытты таңдаңыз. Әрбір тест жауап нұсқалары бар сұрақтардан, толық түсіндірмелерден және лезде бағалаудан тұрады.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {courses.map((course) => {
                const highscore = progress?.quiz_scores[course.id];
                return (
                  <div 
                    key={course.id} 
                    className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        {highscore !== undefined && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center space-x-1">
                            <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            <span>Рекорд: {highscore}%</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors break-words">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-3 mb-5">
                        Тест тапсырмалары бағдарламаның барлық негізгі бөлімдерін қамтиды: теория, код жазу стандарттары және түсіну..
                      </p>
                    </div>

                    <button
                      onClick={() => selectCourse(course.id)}
                      className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-2xl text-sm font-bold text-indigo-600 transition-all duration-200"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Тестілеуді бастау</span>
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- SCORE REPORT SCREEN ---
  if (scorePercent !== null) {
    const isPassing = scorePercent >= 60;
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-grow py-12 flex items-center">
          <div className="max-w-2xl mx-auto px-4 w-full">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 text-center shadow-xl relative overflow-hidden">
              {/* Confetti decoration */}
              {isPassing && (
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500"></div>
              )}
              
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 mb-6">
                <Trophy className={`w-10 h-10 ${isPassing ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`} />
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {isPassing ? 'Өтуіңізбен құттықтаймыз!' : 'Тест аяқталды'}
              </h2>
              
              <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
                Сіз келесі бағыт бойынша қорытынды тестілеуден өттіңіз:: <span className="font-semibold text-slate-800">{selectedCourse.title}</span>
              </p>

              {/* Score breakdown */}
              <div className="my-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 max-w-sm mx-auto">
                <div className="text-6xl font-black text-indigo-600">
                  {scorePercent}%
                </div>
                <div className="text-sm font-semibold text-slate-500 mt-2">
                  Дұрыс: {correctAnswersCount} - {questions.length}
                </div>
              </div>

              {/* Progress feedback message */}
              <div className="text-sm text-slate-600 max-w-md mx-auto mb-8">
                {scorePercent === 100 ? (
                  <span className="font-bold text-emerald-600">Керемет нәтиже! Сіз курс материалын толығымен меңгердіңіз. ⭐</span>
                ) : isPassing ? (
                  <span>Жақсы нәтиже! Негізгі тұжырымдамалардың көпшілігі сәтті меңгерілді.</span>
                ) : (
                  <span>Курстың теориялық дәріс материалын қайта оқып шығуды және тағы бір рет көруді ұсынамыз.</span>
                )}
              </div>

              {!user && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-medium">
                  Тест нәтижелері мен рекордыңыз деректер базаңызда сақталуы үшін жеке кабинетке кіріңіз!
                </div>
              )}

              {/* Controls */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                  onClick={handleRestartQuiz}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span>Қайтадан өту</span>
                </button>
                
                <button
                  onClick={() => router.push('/practice')}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Тесттер тізіміне көшу</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- QUIZ ACTIVE SESSION ---
  if (questions.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-grow py-12 flex items-center justify-center">
          <div className="text-center p-6 space-y-4">
            <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Бұл тестілеуде әзірге сұрақтар жоқ</h3>
            <button 
              onClick={() => router.push('/practice')}
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

  const activeQuestion = questions[currentIdx];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-3xl mx-auto px-4">
          
          {/* Header Progress navigation */}
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => router.push('/practice')}
              className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-900 uppercase transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ТЕСТТІ АЯҚТАУ</span>
            </button>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Сұрақ {currentIdx + 1} - {questions.length}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-8">
            <div 
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
            
            {/* Question Text */}
            <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-snug mb-8">
              {activeQuestion.text}
            </h2>

            {/* Answer Options list */}
            <div className="space-y-3.5 mb-8">
              {activeQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                
                // Styling based on checked status
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
                      {/* Letter badge */}
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

                    {/* End indicators */}
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

            {/* Answer Explanation Box */}
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

            {/* Verification / Progress Controls */}
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

export default function Practice() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-medium text-sm">Практикум дайындалуда...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <PracticeContent />
    </Suspense>
  );
}
