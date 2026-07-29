'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/AuthContext';
import { 
  DBManager, 
  Course, 
  Module, 
  Lesson, 
  Question,
  ModuleQuestion,
  SUPABASE_SQL_SETUP 
} from '@/lib/dbManager';
import { 
  ShieldCheck, 
  Lock, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  BookOpen, 
  Database, 
  HelpCircle, 
  ArrowRight,
  Sparkles,
  Edit,
  Play,
  ImageIcon,
  Upload,
  X,
  ClipboardCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'sql' | 'courses' | 'modules' | 'questions' | 'moduleTests'>('sql');

  // Loaded data lists
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [moduleQuestions, setModuleQuestions] = useState<ModuleQuestion[]>([]);
  const [copiedSql, setCopiedSql] = useState(false);

  // Forms state
  const [courseForm, setCourseForm] = useState<Partial<Course>>({
    id: '',
    title: '',
    description: '',
    level: 'Бастапқы',
    duration: '10 часов',
    rating: 5.0,
    icon: 'Layout',
  });

  const [moduleForm, setModuleForm] = useState<Partial<Module>>({
    id: '',
    course_id: '',
    title: '',
    order_index: 1,
  });

  const [lessonForm, setLessonForm] = useState<Partial<Lesson>>({
    id: '',
    module_id: '',
    title: '',
    content: '',
    video_url: '',
    image_url: '',
    images: [''],
    order_index: 1,
  });

  // --- Photo Materials Helpers ---
  const handleImageChange = (index: number, val: string) => {
    const currentImages = [...(lessonForm.images || [''])];
    currentImages[index] = val;
    setLessonForm({ ...lessonForm, images: currentImages, image_url: currentImages[0] || '' });
  };

  const handleAddImageField = () => {
    const currentImages = [...(lessonForm.images || [''])];
    currentImages.push('');
    setLessonForm({ ...lessonForm, images: currentImages });
  };

  const handleRemoveImageField = (index: number) => {
    const currentImages = [...(lessonForm.images || [''])];
    currentImages.splice(index, 1);
    const updated = currentImages.length > 0 ? currentImages : [''];
    setLessonForm({ ...lessonForm, images: updated, image_url: updated[0] || '' });
  };

  const handleFileUpload = (index: number, file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Файлдың көлемі 5MB-тан аспауы тиіс / Размер файла не должен превышать 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        handleImageChange(index, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const insertImageIntoContent = (url: string, defaultTitle: string = 'Сурет', targetIndex?: number) => {
    if (!url) return;
    let photoNum = typeof targetIndex === 'number' ? targetIndex + 1 : 1;
    if (typeof targetIndex !== 'number' && lessonForm.images) {
      const idx = lessonForm.images.findIndex(img => img === url);
      if (idx !== -1) photoNum = idx + 1;
    }
    const shortTag = `\n![${defaultTitle} ${photoNum}](photo-${photoNum})\n`;
    setLessonForm(prev => ({
      ...prev,
      content: (prev.content || '') + shortTag
    }));
  };

  const [questionForm, setQuestionForm] = useState<Partial<Question>>({
    id: '',
    course_id: '',
    text: '',
    options: ['', '', '', ''],
    correct_option: 0,
    explanation: '',
  });

  // Итоговое тестирование по модулю ("Тест") — отдельно от Практикума
  const [moduleQuestionForm, setModuleQuestionForm] = useState<Partial<ModuleQuestion>>({
    id: '',
    module_id: '',
    text: '',
    options: ['', '', '', ''],
    correct_option: 0,
    explanation: '',
  });

  // Load lists
  const reloadData = async () => {
    try {
      const loadedCourses = await DBManager.getCourses();
      setCourses(loadedCourses);
      
      const loadedModules = await DBManager.getModules();
      setModules(loadedModules);

      const loadedLessons = await DBManager.getLessons();
      setLessons(loadedLessons);

      const loadedQuestions = await DBManager.getQuestions();
      setQuestions(loadedQuestions);

      const loadedModuleQuestions = await DBManager.getModuleQuestions();
      setModuleQuestions(loadedModuleQuestions);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const loadAdminData = async () => {
      if (user && isAdmin) {
        try {
          const loadedCourses = await DBManager.getCourses();
          setCourses(loadedCourses);
          
          const loadedModules = await DBManager.getModules();
          setModules(loadedModules);

          const loadedLessons = await DBManager.getLessons();
          setLessons(loadedLessons);

          const loadedQuestions = await DBManager.getQuestions();
          setQuestions(loadedQuestions);

          const loadedModuleQuestions = await DBManager.getModuleQuestions();
          setModuleQuestions(loadedModuleQuestions);
        } catch (e) {
          console.error(e);
        }
      }
    };
    loadAdminData();
  }, [user, isAdmin]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // --- SUBMISSIONS ---
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.id || !courseForm.title) return alert('Пожалуйста, заполните ID и название курса');
    
    const item: Course = {
      id: courseForm.id,
      title: courseForm.title,
      description: courseForm.description || '',
      level: courseForm.level || 'Начальный',
      duration: courseForm.duration || '10 часов',
      rating: Number(courseForm.rating) || 5.0,
      lessonsCount: Number(courseForm.lessonsCount) || 0,
      icon: courseForm.icon || 'Layout',
    };

    try {
      await DBManager.saveCourse(item);
      alert('Курс успешно сохранен!');
      reloadData();
      setCourseForm({ id: '', title: '', description: '', level: 'Начальный', duration: '10 часов', rating: 5.0, icon: 'Layout' });
    } catch (err: any) {
      alert(`Не удалось сохранить курс в Supabase: ${err?.message || err}`);
    }
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleForm.id || !moduleForm.course_id || !moduleForm.title) {
      return alert('Пожалуйста, заполните ID, Курс и Название модуля');
    }

    const item: Module = {
      id: moduleForm.id,
      course_id: moduleForm.course_id,
      title: moduleForm.title,
      order_index: Number(moduleForm.order_index) || 1,
    };

    try {
      await DBManager.saveModule(item);
      alert('Модуль успешно сохранен!');
      reloadData();
      setModuleForm({ id: '', course_id: '', title: '', order_index: 1 });
    } catch (err: any) {
      alert(`Не удалось сохранить модуль в Supabase: ${err?.message || err}`);
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.id || !lessonForm.module_id || !lessonForm.title || !lessonForm.content) {
      return alert('Пожалуйста, заполните все обязательные поля урока');
    }

    const filteredImages = (lessonForm.images || [])
      .map(img => img.trim())
      .filter(img => img.length > 0);

    const primaryImage = lessonForm.image_url || (filteredImages.length > 0 ? filteredImages[0] : '');

    const item: Lesson = {
      id: lessonForm.id,
      module_id: lessonForm.module_id,
      title: lessonForm.title,
      content: lessonForm.content,
      video_url: lessonForm.video_url || '',
      image_url: primaryImage,
      images: filteredImages.length > 0 ? filteredImages : (primaryImage ? [primaryImage] : []),
      order_index: Number(lessonForm.order_index) || 1,
    };

    try {
      const isNewLesson = await DBManager.saveLesson(item);
      alert('Урок и фотоматериалы успешно сохранены!');

      // Only bump the parent course's lessons count for a brand-new lesson,
      // not when editing an existing one (otherwise the count drifts upward on every edit).
      if (isNewLesson) {
        const matchedMod = modules.find(m => m.id === lessonForm.module_id);
        if (matchedMod) {
          const parentCourse = courses.find(c => c.id === matchedMod.course_id);
          if (parentCourse) {
            await DBManager.saveCourse({ ...parentCourse, lessonsCount: parentCourse.lessonsCount + 1 });
          }
        }
      }

      reloadData();
      setLessonForm({ id: '', module_id: '', title: '', content: '', video_url: '', image_url: '', images: [''], order_index: 1 });
    } catch (err: any) {
      alert(`Не удалось сохранить урок в Supabase: ${err?.message || err}`);
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (confirm('Удалить этот модуль? Все уроки внутри него тоже будут удалены безвозвратно.')) {
      try {
        await DBManager.deleteModule(id);
        reloadData();
      } catch (err: any) {
        alert(`Не удалось удалить модуль в Supabase: ${err?.message || err}`);
      }
    }
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (confirm(`Удалить урок "${lesson.title}"?`)) {
      try {
        await DBManager.deleteLesson(lesson.id);

        // Keep the parent course's lessonsCount in sync
        const matchedMod = modules.find(m => m.id === lesson.module_id);
        if (matchedMod) {
          const parentCourse = courses.find(c => c.id === matchedMod.course_id);
          if (parentCourse && parentCourse.lessonsCount > 0) {
            await DBManager.saveCourse({ ...parentCourse, lessonsCount: parentCourse.lessonsCount - 1 });
          }
        }

        reloadData();
      } catch (err: any) {
        alert(`Не удалось удалить урок в Supabase: ${err?.message || err}`);
      }
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (confirm('Удалить этот тестовый вопрос?')) {
      try {
        await DBManager.deleteQuestion(id);
        reloadData();
      } catch (err: any) {
        alert(`Не удалось удалить вопрос в Supabase: ${err?.message || err}`);
      }
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.id || !questionForm.course_id || !questionForm.text) {
      return alert('Заполните ID, Курс и Текст вопроса');
    }

    const item: Question = {
      id: questionForm.id,
      course_id: questionForm.course_id,
      text: questionForm.text,
      options: questionForm.options as string[],
      correct_option: Number(questionForm.correct_option),
      explanation: questionForm.explanation || '',
    };

    try {
      await DBManager.saveQuestion(item);
      alert('Тестовый вопрос сохранен!');
      setQuestionForm({ id: '', course_id: '', text: '', options: ['', '', '', ''], correct_option: 0, explanation: '' });
    } catch (err: any) {
      alert(`Не удалось сохранить вопрос в Supabase: ${err?.message || err}`);
    }
  };

  const handleDeleteModuleQuestion = async (id: string) => {
    if (confirm('Удалить этот вопрос итогового теста модуля?')) {
      try {
        await DBManager.deleteModuleQuestion(id);
        reloadData();
      } catch (err: any) {
        alert(`Не удалось удалить вопрос в Supabase: ${err?.message || err}`);
      }
    }
  };

  const handleSaveModuleQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleQuestionForm.id || !moduleQuestionForm.module_id || !moduleQuestionForm.text) {
      return alert('Заполните ID, Модуль и Текст вопроса');
    }

    const item: ModuleQuestion = {
      id: moduleQuestionForm.id,
      module_id: moduleQuestionForm.module_id,
      text: moduleQuestionForm.text,
      options: moduleQuestionForm.options as string[],
      correct_option: Number(moduleQuestionForm.correct_option),
      explanation: moduleQuestionForm.explanation || '',
    };

    try {
      await DBManager.saveModuleQuestion(item);
      alert('Вопрос итогового теста модуля сохранен!');
      setModuleQuestionForm({ id: '', module_id: '', text: '', options: ['', '', '', ''], correct_option: 0, explanation: '' });
      reloadData();
    } catch (err: any) {
      alert(`Не удалось сохранить вопрос в Supabase: ${err?.message || err}`);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот курс? Все связанные модули, уроки и тестовые вопросы будут удалены безвозвратно (каскадно).')) {
      try {
        await DBManager.deleteCourse(id);
        reloadData();
      } catch (err: any) {
        alert(`Не удалось удалить курс в Supabase: ${err?.message || err}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // Check Permissions - ACCESS CONTROL
  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="max-w-md w-full px-4 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Доступ заблокирован</h1>
              <p className="text-slate-500 text-sm">
                Эта страница доступна только для авторизованных администраторов. Пожалуйста, войдите в систему под учетной записью администратора.
              </p>
            </div>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-indigo-100"
            >
              Перейти к входу
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />

      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Админ-Панель</h1>
                <p className="text-slate-500 text-sm mt-0.5">Курстарды, теорияны және дерекқорды тестілеуді басқару</p>
              </div>
            </div>

            {/* Tab Controllers */}
            <div className="flex p-1 bg-slate-200/60 rounded-xl border border-slate-200/30 overflow-x-auto self-start">
              {/* <button
                onClick={() => setActiveTab('sql')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'sql' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-3.5 h-3.5 inline mr-1" />
                Настройка БД (SQL)
              </button> */}
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'courses' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Курстар
              </button>
              <button
                onClick={() => setActiveTab('modules')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'modules' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Модульдер мен Сабақтар
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'questions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Практикум тесттері
              </button>
              <button
                onClick={() => setActiveTab('moduleTests')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'moduleTests' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5 inline mr-1" />
                Тест
              </button>
            </div>
          </div>

          {/* --- TAB CONTENT: SQL GUIDE --- */}
          {/* {activeTab === 'sql' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
              <div className="max-w-2xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Инструкция по настройке</span>
                <h2 className="text-xl font-bold text-slate-900 mt-3">Инициализация таблиц Supabase</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Для полной синхронизации платформы с вашей базой данных Supabase, скопируйте SQL-скрипт ниже и выполните его в панели управления Supabase в разделе <span className="font-semibold text-slate-700">SQL Editor</span>.
                </p>
              </div>

              <div className="relative rounded-2xl bg-slate-900 text-indigo-200 border border-slate-800 p-5 font-mono text-xs overflow-hidden shadow-inner max-h-[400px] overflow-y-auto">
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={handleCopySql}
                    className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white transition-all flex items-center space-x-1"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Скопировано!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Копировать</span>
                      </>
                    )}
                  </button>
                </div>
                <pre><code>{SUPABASE_SQL_SETUP}</code></pre>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start space-x-3 text-xs text-emerald-800">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center flex-shrink-0">i</div>
                <div>
                  <span className="font-bold block mb-0.5">Важно:</span>
                  Все изменения (курсы, уроки, модули и тесты) сохраняются напрямую в <span className="font-bold">Supabase</span>. Убедитесь, что таблицы настроены (см. SQL-скрипт ниже) — без них изменения сохраняться не будут.
                </div>
              </div>
            </div>
          )} */}

          {/* --- TAB CONTENT: COURSES --- */}
          {activeTab === 'courses' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form card */}
              <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  <span>Курсты қосу / Өзгерту</span>
                </h3>
                
                <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ID Курса (уникальный латинский код)</label>
                    <input
                      type="text"
                      required
                      placeholder="course-node-js"
                      value={courseForm.id}
                      onChange={(e) => setCourseForm({ ...courseForm, id: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Курс атауы</label>
                    <input
                      type="text"
                      required
                      placeholder="Backend разработка на Express"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Қиындық деңгейі</label>
                    <select
                      value={courseForm.level}
                      onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value="Бастапқы">Бастапқы</option>
                      <option value="Орта деңгей">Орта деңгей</option>
                      <option value="Жоғары деңгей">Жоғары деңгей</option>
                      <option value="Все уровни">Барлық деңгей</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Ұзақтығы</label>
                      <input
                        type="text"
                        placeholder="12 часов"
                        value={courseForm.duration}
                        onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Иконка (Lucide)</label>
                      <select
                        value={courseForm.icon}
                        onChange={(e) => setCourseForm({ ...courseForm, icon: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      >
                        <option value="Layout">Layout (Фронтенд)</option>
                        <option value="Database">Database (Бэкенд)</option>
                        <option value="Code">Code (Код)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Курстың қысқаша сипаттамасы</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Студенттер бұл курста не үйренетінін сипаттаңыз..."
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg mt-2 shadow-sm transition-colors"
                  >
                    Курсты сақтау
                  </button>
                </form>
              </div>

              {/* List card */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-base mb-4">Бар курстар тізімі</h3>
                
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {courses.map((course) => (
                    <div 
                      key={course.id} 
                      className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-900">{course.title}</div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">
                          ID: <span className="text-slate-800">{course.id}</span> • {course.level} • {course.duration}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCourseForm(course)}
                          className="p-2 bg-white hover:bg-indigo-50 text-indigo-600 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors"
                          title="Редактировать"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-xl border border-slate-200 hover:border-rose-200 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- TAB CONTENT: MODULES & LESSONS --- */}
          {activeTab === 'modules' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Module Form card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  <span>Модуль құру</span>
                </h3>
                
                <form onSubmit={handleSaveModule} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Модуль қай курсқа тиесілі?</label>
                    <select
                      required
                      value={moduleForm.course_id}
                      onChange={(e) => setModuleForm({ ...moduleForm, course_id: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value="">-- Выберите курс --</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Модульдің бірегей ID-і</label>
                      <input
                        type="text"
                        required
                        placeholder="mod-html-basics"
                        value={moduleForm.id}
                        onChange={(e) => setModuleForm({ ...moduleForm, id: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Реттік индексі</label>
                      <input
                        type="number"
                        placeholder="1"
                        value={moduleForm.order_index}
                        onChange={(e) => setModuleForm({ ...moduleForm, order_index: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Модуль атауы</label>
                    <input
                      type="text"
                      required
                      placeholder="Веб-технологиялар негіздері (HTML5, CSS3)"
                      value={moduleForm.title}
                      onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-colors"
                  >
                    {moduleForm.id && modules.some(m => m.id === moduleForm.id) ? 'Өзгерістерді сақтау' : 'Модуль құру'}
                  </button>
                  {moduleForm.id && modules.some(m => m.id === moduleForm.id) && (
                    <button
                      type="button"
                      onClick={() => setModuleForm({ id: '', course_id: '', title: '', order_index: 1 })}
                      className="w-full py-2 text-slate-500 hover:text-slate-700 font-semibold text-[11px]"
                    >
                      Өзгертуді болдырмау
                    </button>
                  )}
                </form>

                {/* Existing modules list */}
                <div className="pt-4 border-t border-slate-100 space-y-2 max-h-[300px] overflow-y-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">БАР МОДУЛЬДЕР</span>
                  {modules.map((m) => (
                    <div key={m.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{m.title}</div>
                        <div className="text-[10px] text-slate-500 truncate">
                          ID: {m.id} • Курс: {courses.find(c => c.id === m.course_id)?.title || m.course_id}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => setModuleForm(m)}
                          className="p-1.5 bg-white hover:bg-indigo-50 text-indigo-600 rounded-lg border border-slate-200"
                          title="Редактировать"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteModule(m.id)}
                          className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-slate-200"
                          title="Удалить"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lesson Form card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <span>Сабақ құру (теория)</span>
                </h3>

                <form onSubmit={handleSaveLesson} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Сабақ қай модульге тиесілі?</label>
                    <select
                      required
                      value={lessonForm.module_id}
                      onChange={(e) => setLessonForm({ ...lessonForm, module_id: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value="">-- Модульді таңдаңыз --</option>
                      {modules.map(m => (
                        <option key={m.id} value={m.id}>
                          {courses.find(c => c.id === m.course_id)?.title.substring(0, 15)}... - {m.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Сабақтың бірегей ID-і</label>
                      <input
                        type="text"
                        required
                        placeholder="lesson-html-semantics"
                        value={lessonForm.id}
                        onChange={(e) => setLessonForm({ ...lessonForm, id: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Реттік индексі</label>
                      <input
                        type="number"
                        placeholder="1"
                        value={lessonForm.order_index}
                        onChange={(e) => setLessonForm({ ...lessonForm, order_index: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Сабақ атауы</label>
                    <input
                      type="text"
                      required
                      placeholder="Структура страницы и семантические теги"
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                      <Play className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Видео сілтемесі (міндетті емес)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={lessonForm.video_url || ''}
                      onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      YouTube, Vimeo сілтемелері немесе тікелей .mp4 сілтемелері қолдау табады. Видео сабақтың басында көрсетіледі.
                    </p>
                  </div>

                  {/* Фотоматериалдар мен иллюстрациялар (Бірнеше фото) */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-800 flex items-center space-x-1.5">
                        <ImageIcon className="w-4 h-4 text-indigo-600" />
                        <span>Сабақтың фотоматериалдары мен иллюстрациялары (Бірнеше фото)</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddImageField}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center space-x-1 transition-colors shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Тағы фото қосу</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-normal">
                      Cілтеме енгізіңіз немесе құрылғыңыздан сурет файлын жүктеңіз. «Текстке қосу» түймесі арқылы фотоны сабақ мәтініне орналастыруға болады.
                    </p>

                    <div className="space-y-3">
                      {(lessonForm.images || ['']).map((imgUrl, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-extrabold text-xs w-5 text-center">{idx + 1}.</span>
                            
                            <input
                              type="text"
                              placeholder="https://... немесе сурет файлын таңдаңыз"
                              value={imgUrl}
                              onChange={(e) => handleImageChange(idx, e.target.value)}
                              className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                            />

                            <label className="px-2.5 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 cursor-pointer flex items-center space-x-1 flex-shrink-0 transition-colors" title="Файл жүктеу">
                              <Upload className="w-3.5 h-3.5 text-indigo-600" />
                              <span className="hidden sm:inline">Файл</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(idx, file);
                                }}
                              />
                            </label>

                            {imgUrl.trim().length > 0 && (
                              <button
                                type="button"
                                onClick={() => insertImageIntoContent(imgUrl, 'Сурет', idx)}
                                className="px-2.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 flex-shrink-0 transition-colors"
                                title="Сабақ мәтініне кірістіру"
                              >
                                Текстке қосу
                              </button>
                            )}

                            {(lessonForm.images && lessonForm.images.length > 1) && (
                              <button
                                type="button"
                                onClick={() => handleRemoveImageField(idx)}
                                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-slate-200 flex-shrink-0"
                                title="Өшіру"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {imgUrl.trim().length > 0 && (
                            <div className="relative w-full h-28 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex justify-center items-center">
                              <img
                                src={imgUrl}
                                alt={`Фото ${idx + 1}`}
                                className="max-h-full object-contain"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Сабақ мәтіні (псевдо-Markdown қолдайды)</label>
                    <textarea
                      required
                      rows={6}
                      placeholder="Теорияны жазыңыз. Тақырыптар үшін ##, тізімдер үшін - таңбаларын қолданыңыз және кодты немесе суреттер үшін  форматын енгізіңіз."
                      value={lessonForm.content}
                      onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-colors"
                  >
                    {lessonForm.id && lessons.some(l => l.id === lessonForm.id) ? 'Өзгертуді сақтау' : 'Сабақ құру'}
                  </button>
                  {lessonForm.id && lessons.some(l => l.id === lessonForm.id) && (
                    <button
                      type="button"
                      onClick={() => setLessonForm({ id: '', module_id: '', title: '', content: '', video_url: '', image_url: '', images: [''], order_index: 1 })}
                      className="w-full py-2 text-slate-500 hover:text-slate-700 font-semibold text-[11px]"
                    >
                      Өзгертуді өшіру
                    </button>
                  )}
                </form>

                {/* Existing lessons list */}
                <div className="pt-4 border-t border-slate-100 space-y-2 max-h-[300px] overflow-y-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">БАР САБАҚТАР</span>
                  {lessons.map((l) => (
                    <div key={l.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                          {l.video_url && <Play className="w-3 h-3 text-indigo-500 flex-shrink-0" />}
                          {((l.images && l.images.length > 0) || l.image_url) && (
                            <span title={`${(l.images?.length || 1)} фото`}>
                              <ImageIcon className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                            </span>
                          )}
                          <span className="truncate">{l.title}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          ID: {l.id} • Модуль: {modules.find(m => m.id === l.module_id)?.title || l.module_id}
                          {l.images && l.images.length > 0 && ` • ${l.images.length} фото`}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => setLessonForm({
                            ...l,
                            images: l.images && l.images.length > 0 ? l.images : (l.image_url ? [l.image_url] : [''])
                          })}
                          className="p-1.5 bg-white hover:bg-indigo-50 text-indigo-600 rounded-lg border border-slate-200"
                          title="Редактировать"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLesson(l)}
                          className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-slate-200"
                          title="Удалить"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* --- TAB CONTENT: QUESTIONS --- */}
          {activeTab === 'questions' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm max-w-4xl mx-auto space-y-6">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2 pb-2 border-b border-slate-100">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <span>Тест тапсырмасын қосу (Практикум)</span>
              </h3>

              <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Тест қай курсқа жатады?</label>
                    <select
                      required
                      value={questionForm.course_id}
                      onChange={(e) => setQuestionForm({ ...questionForm, course_id: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value="">-- Курсты таңдаңыз --</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Сұрақтың бірегей ID-і</label>
                    <input
                      type="text"
                      required
                      placeholder="q-html-tag"
                      value={questionForm.id}
                      onChange={(e) => setQuestionForm({ ...questionForm, id: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Сұрақ мәтіні</label>
                  <input
                    type="text"
                    required
                    placeholder="HTML5-те қай тег құжаттың жоғарғы бөлігін (шапкасын) сипаттайды?"
                    value={questionForm.text}
                    onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                {/* Option inputs */}
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700">Жауап нұсқалары</label>
                  
                  {questionForm.options?.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded bg-slate-100 text-[10px] font-bold text-slate-500 flex items-center justify-center border border-slate-200">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder={`Вариант ${String.fromCharCode(65 + oIdx)}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...(questionForm.options as string[])];
                          updated[oIdx] = e.target.value;
                          setQuestionForm({ ...questionForm, options: updated });
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ДҰРЫС жауап индексі (0-3)</label>
                    <select
                      value={questionForm.correct_option}
                      onChange={(e) => setQuestionForm({ ...questionForm, correct_option: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value={0}>A (Индекс 0)</option>
                      <option value={1}>B (Индекс 1)</option>
                      <option value={2}>C (Индекс 2)</option>
                      <option value={3}>D (Индекс 3)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Толық түсініктеме (жауап берілгеннен кейін көрсетіледі)</label>
                  <textarea
                    rows={3}
                    placeholder="Студент білімін бекіту үшін бұл нұсқаның неліктен дұрыс екенін түсіндіріңіз..."
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-colors mt-2"
                >
                  {questionForm.id && questions.some(q => q.id === questionForm.id) ? 'Өзгерісті сақтау' : 'Тест сұрағын сақтау'}
                </button>
                {questionForm.id && questions.some(q => q.id === questionForm.id) && (
                  <button
                    type="button"
                    onClick={() => setQuestionForm({ id: '', course_id: '', text: '', options: ['', '', '', ''], correct_option: 0, explanation: '' })}
                    className="w-full py-2 text-slate-500 hover:text-slate-700 font-semibold text-[11px]"
                  >
                    Өзгерісті өшіру
                  </button>
                )}
              </form>

              {/* Existing questions list */}
              <div className="pt-4 border-t border-slate-100 space-y-2 max-h-[400px] overflow-y-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">БАР СҰРАҚТАР</span>
                {questions.map((q) => (
                  <div key={q.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{q.text}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        ID: {q.id} • Курс: {courses.find(c => c.id === q.course_id)?.title || q.course_id}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => setQuestionForm(q)}
                        className="p-1.5 bg-white hover:bg-indigo-50 text-indigo-600 rounded-lg border border-slate-200"
                        title="Редактировать"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-slate-200"
                        title="Удалить"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- TAB CONTENT: MODULE FINAL TEST ("Тест") --- */}
          {activeTab === 'moduleTests' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm max-w-4xl mx-auto space-y-6">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2 pb-2 border-b border-slate-100">
                <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                <span>Модуль бойынша қорытынды тестілеу (Тест)</span>
              </h3>
              <p className="text-slate-500 text-xs -mt-2">
                Әр модуль аяқталған соң, өтілген материалдың меңгерілу деңгейін бағалауға мүмкіндік беретін қорытынды тестілеу қарастырылған. Бұл тестің жеке түрі — ол нақты модульге бекітілген және Практикуммен (бүкіл курс бойынша тест сұрақтарымен) байланысты емес.
              </p>

              <form onSubmit={handleSaveModuleQuestion} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Тест қай модульге жатады?</label>
                    <select
                      required
                      value={moduleQuestionForm.module_id}
                      onChange={(e) => setModuleQuestionForm({ ...moduleQuestionForm, module_id: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value="">-- Модульді таңдаңыз --</option>
                      {modules.map(m => (
                        <option key={m.id} value={m.id}>
                          {courses.find(c => c.id === m.course_id)?.title.substring(0, 15)}... - {m.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Сұрақтың бірегей ID-і</label>
                    <input
                      type="text"
                      required
                      placeholder="mq-html-tag"
                      value={moduleQuestionForm.id}
                      onChange={(e) => setModuleQuestionForm({ ...moduleQuestionForm, id: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Сұрақ мәтіні</label>
                  <input
                    type="text"
                    required
                    placeholder="HTML5-те қай тег құжаттың жоғарғы бөлігін (шапкасын) сипаттайды?"
                    value={moduleQuestionForm.text}
                    onChange={(e) => setModuleQuestionForm({ ...moduleQuestionForm, text: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                {/* Option inputs */}
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700">Жауап нұсқалары</label>

                  {moduleQuestionForm.options?.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded bg-slate-100 text-[10px] font-bold text-slate-500 flex items-center justify-center border border-slate-200">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder={`Вариант ${String.fromCharCode(65 + oIdx)}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...(moduleQuestionForm.options as string[])];
                          updated[oIdx] = e.target.value;
                          setModuleQuestionForm({ ...moduleQuestionForm, options: updated });
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ДҰРЫС жауап индексі (0-3)</label>
                    <select
                      value={moduleQuestionForm.correct_option}
                      onChange={(e) => setModuleQuestionForm({ ...moduleQuestionForm, correct_option: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value={0}>A (Индекс 0)</option>
                      <option value={1}>B (Индекс 1)</option>
                      <option value={2}>C (Индекс 2)</option>
                      <option value={3}>D (Индекс 3)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Толық түсініктеме (жауап берілгеннен кейін көрсетіледі)</label>
                  <textarea
                    rows={3}
                    placeholder="Студент білімін бекіту үшін бұл нұсқаның неліктен дұрыс екенін түсіндіріңіз..."
                    value={moduleQuestionForm.explanation}
                    onChange={(e) => setModuleQuestionForm({ ...moduleQuestionForm, explanation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-colors mt-2"
                >
                  {moduleQuestionForm.id && moduleQuestions.some(q => q.id === moduleQuestionForm.id) ? 'Өзгерісті сақтау' : 'Тест сұрағын сақтау'}
                </button>
                {moduleQuestionForm.id && moduleQuestions.some(q => q.id === moduleQuestionForm.id) && (
                  <button
                    type="button"
                    onClick={() => setModuleQuestionForm({ id: '', module_id: '', text: '', options: ['', '', '', ''], correct_option: 0, explanation: '' })}
                    className="w-full py-2 text-slate-500 hover:text-slate-700 font-semibold text-[11px]"
                  >
                    Өзгерісті өшіру
                  </button>
                )}
              </form>

              {/* Existing module test questions list */}
              <div className="pt-4 border-t border-slate-100 space-y-2 max-h-[400px] overflow-y-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">МОДУЛЬ ТЕСТІНІҢ БАР СҰРАҚТАРЫ</span>
                {moduleQuestions.map((q) => (
                  <div key={q.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{q.text}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        ID: {q.id} • Модуль: {modules.find(m => m.id === q.module_id)?.title || q.module_id}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => setModuleQuestionForm(q)}
                        className="p-1.5 bg-white hover:bg-indigo-50 text-indigo-600 rounded-lg border border-slate-200"
                        title="Редактировать"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteModuleQuestion(q.id)}
                        className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-slate-200"
                        title="Удалить"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}