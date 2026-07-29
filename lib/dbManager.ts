import { supabase } from './supabase';

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  rating: number;
  lessonsCount: number;
  icon: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  video_url?: string;
  image_url?: string;
  images?: string[];
  order_index: number;
}

// Lightweight lesson shape used for sidebar/navigation lists — deliberately
// excludes `content`, `video_url` and `images`, which can be large (esp. if
// a lesson embeds images). Fetching only this for the lesson list avoids
// downloading every lesson's full content just to render a sidebar.
export interface LessonSummary {
  id: string;
  module_id: string;
  title: string;
  order_index: number;
}

export interface Question {
  id: string;
  course_id: string;
  text: string;
  options: string[];
  correct_option: number;
  explanation: string;
}

// Итоговое тестирование по модулю (module final test) — концептуально
// отдельно от "Практикума" (Question/questions), который привязан к курсу
// целиком. Здесь тест привязан к конкретному модулю (module_id) и проверяет
// усвоение материала именно этого модуля после его завершения.
export interface ModuleQuestion {
  id: string;
  module_id: string;
  text: string;
  options: string[];
  correct_option: number;
  explanation: string;
}

export interface UserProgress {
  user_id: string;
  completed_lessons: string[];
  quiz_scores: Record<string, number>;
  module_test_scores: Record<string, number>;
  streak: number;
  last_active: string;
}

// Pre-populated default educational content (Russian)
export const DEFAULT_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Frontend Разработчик (HTML, CSS, JS, React)',
    description: 'Изучите основы верстки сайтов, интерактивное программирование на JavaScript и создание мощных интерфейсов на библиотеке React с нуля.',
    level: 'Начальный',
    duration: '18 часов',
    rating: 4.9,
    lessonsCount: 5,
    icon: 'Layout',
  },
  {
    id: 'course-2',
    title: 'Backend на Node.js и PostgreSQL',
    description: 'Освойте разработку масштабируемых серверных приложений, архитектуру REST API, интеграцию реляционных баз данных и работу с Supabase.',
    level: 'Средний',
    duration: '24 часа',
    rating: 4.8,
    lessonsCount: 4,
    icon: 'Database',
  },
  {
    id: 'course-3',
    title: 'Современный JavaScript & TypeScript',
    description: 'Глубокое погружение в стандарты ES6+, асинхронное программирование, работу с замыканиями и строгое типизирование в TypeScript.',
    level: 'Все уровни',
    duration: '15 часов',
    rating: 4.7,
    lessonsCount: 4,
    icon: 'Code',
  },
];

export const DEFAULT_MODULES: Module[] = [
  // Course 1 Modules
  { id: 'module-1-1', course_id: 'course-1', title: 'Основы HTML5 & CSS3', order_index: 1 },
  { id: 'module-1-2', course_id: 'course-1', title: 'Программирование на JavaScript', order_index: 2 },
  { id: 'module-1-3', course_id: 'course-1', title: 'Разработка на React', order_index: 3 },
  
  // Course 2 Modules
  { id: 'module-2-1', course_id: 'course-2', title: 'Введение в Node.js', order_index: 1 },
  { id: 'module-2-2', course_id: 'course-2', title: 'Реляционные базы данных & SQL', order_index: 2 },

  // Course 3 Modules
  { id: 'module-3-1', course_id: 'course-3', title: 'Продвинутый JavaScript', order_index: 1 },
  { id: 'module-3-2', course_id: 'course-3', title: 'Основы TypeScript', order_index: 2 },
];

export const DEFAULT_LESSONS: Lesson[] = [
  // Course 1, Module 1-1
  {
    id: 'lesson-1-1-1',
    module_id: 'module-1-1',
    title: 'Структура HTML5 и Семантические теги',
    content: `## Семантика в HTML5

Семантическая верстка — это подход к созданию веб-страниц с использованием тегов, которые описывают смысловую роль контента. Вместо универсального тега \`<div>\` используются специализированные элементы:

- \`<header>\` — вводная часть страницы или раздела.
- \`<nav>\` — навигационное меню.
- \`<main>\` — уникальное основное содержимое страницы.
- \`<article>\` — независимый, самодостаточный блок контента (статья, пост).
- \`<section>\` — тематический раздел.
- \`<aside>\` — второстепенный контент (боковая панель).
- \`<footer>\` — подвал страницы или раздела.

### Преимущества семантической верстки:
1. **Доступность (Accessibility):** Программы чтения экрана (скринридеры) лучше понимают структуру сайта для незрячих пользователей.
2. **SEO (Поисковая оптимизация):** Поисковые роботы точнее индексируют контент.
3. **Читаемость кода:** Код становится структурированным и легким для понимания разработчиками.`,
    order_index: 1,
  },
  {
    id: 'lesson-1-1-2',
    module_id: 'module-1-1',
    title: 'Современные макеты: Flexbox и CSS Grid',
    content: `## Верстка макетов: Flexbox против CSS Grid

Для создания гибких и адаптивных сеток в CSS используются две технологии:

### 1. Flexbox (Flexible Box Layout)
Предназначен для **одноразмерных** раскладок — по строкам или по колонкам. Отлично подходит для элементов интерфейса, таких как навигационные панели, списки или выравнивание элементов внутри карточек.

**Ключевые свойства:**
- \`display: flex;\` — превращает элемент во flex-контейнер.
- \`flex-direction: row | column;\` — направление главных осей.
- \`justify-content: center | space-between | space-around;\` — выравнивание по главной оси.
- \`align-items: center | stretch;\` — выравнивание по поперечной оси.

### 2. CSS Grid Layout
Предназначен для **двумерных** раскладок — одновременно по строкам и столбцам. Используется для общей структуры страницы, сложных галерей или сеток товаров.

**Пример использования:**
\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
\`\`\``,
    order_index: 2,
  },
  // Course 1, Module 1-2
  {
    id: 'lesson-1-2-1',
    module_id: 'module-1-2',
    title: 'Переменные, Область видимости и Типы данных',
    content: `## Основы JavaScript: Работа с данными

В современном JavaScript для объявления переменных используются ключевые слова \`let\` и \`const\`. Устаревшее слово \`var\` больше не рекомендуется использовать из-за отсутствия блочной области видимости.

### Области видимости
- **const:** Создает константу с блочной областью видимости. Значение нельзя переназначить.
- **let:** Создает переменную с блочной областью видимости. Значение можно менять.

\`\`\`javascript
const pi = 3.14159; // нельзя перезаписать
let score = 10;
score = 15; // разрешено
\`\`\`

### Типы данных в JS:
1. **Primitive (Примитивные):** Number, String, Boolean, Null, Undefined, Symbol, BigInt.
2. **Object (Объекты):** Массивы, функции, обычные объекты.`,
    order_index: 1,
  },
  {
    id: 'lesson-1-2-2',
    module_id: 'module-1-2',
    title: 'Работа с асинхронностью: Promises и Async/Await',
    content: `## Асинхронный JavaScript

JavaScript является однопоточным языком, но может выполнять асинхронные задачи (запросы к серверу, таймеры) с помощью механизмов Web APIs и цикла событий (Event Loop).

### 1. Промисы (Promises)
Промис представляет собой объект, который содержит будущее состояние асинхронной операции (Ожидание, Выполнено, Отклонено).

\`\`\`javascript
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
\`\`\`

### 2. Асинхронные функции (Async / Await)
Синтаксический сахар над промисами, который делает код визуально похожим на синхронный.

\`\`\`javascript
async function loadData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Ошибка загрузки:', error);
  }
}
\`\`\``,
    order_index: 2,
  },
  // Course 1, Module 1-3
  {
    id: 'lesson-1-3-1',
    module_id: 'module-1-3',
    title: 'Компоненты, Пропсы и Состояние React',
    content: `## Введение в React

React — это библиотека для создания интерактивных интерфейсов с использованием компонентного подхода.

### Компоненты и JSX
Компонент в React — это функция, возвращающая разметку JSX (JavaScript XML), которая описывает внешний вид элемента.

\`\`\`jsx
function WelcomeCard({ name }) { // name — это пропс (входной параметр)
  return (
    <div className="p-4 bg-slate-100 rounded-lg shadow">
      <h2 className="text-xl font-bold">Привет, {name}!</h2>
    </div>
  );
}
\`\`\`

### Состояние (useState)
Пропсы доступны только для чтения и приходят от родительских компонентов. Для хранения локальных изменяющихся данных внутри компонента используется хук \`useState\`:

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Кликов: {count}
    </button>
  );
}
\`\`\``,
    order_index: 1,
  },

  // Course 2, Module 2-1
  {
    id: 'lesson-2-1-1',
    module_id: 'module-2-1',
    title: 'Архитектура Node.js и создание HTTP-сервера',
    content: `## Как работает Node.js

Node.js — это программная платформа, основанная на движке V8 (транслирующем JavaScript в машинный код), превращающая JavaScript из узкоспециализированного клиентского языка в язык общего назначения.

### Неблокирующий ввод-вывод
Архитектура Node.js основывается на **асинхронных событиях (Event Loop)**, что позволяет обрабатывать тысячи одновременных подключений без создания дополнительных потоков для каждого запроса.

### Простой сервер на встроенном модуле HTTP:
\`\`\`javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Привет от сервера Node.js!');
});

server.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});
\`\`\``,
    order_index: 1,
  },

  // Course 3, Module 3-1
  {
    id: 'lesson-3-1-1',
    module_id: 'module-3-1',
    title: 'Замыкания и Лексическое окружение',
    content: `## Замыкания (Closures) в JavaScript

Замыкание — это комбинация функции и лексического окружения, в котором эта функция была определена. Другими словами, функция «помнит» свои внешние переменные и может получать к ним доступ даже после того, как внешняя функция завершила свое выполнение.

### Пример создания счетчика через замыкание:
\`\`\`javascript
function createCounter() {
  let count = 0; // Внутреннее состояние

  return function() {
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
\`\`\`
Здесь функция, возвращаемая из \`createCounter\`, сохраняет ссылку на переменную \`count\`, находящуюся в ее внешней области видимости. Это позволяет реализовать инкапсуляцию данных без использования классов.`,
    order_index: 1,
  }
];

export const DEFAULT_QUESTIONS: Question[] = [
  // Course 1 Questions
  {
    id: 'q-1-1',
    course_id: 'course-1',
    text: 'Какое свойство CSS используется для выравнивания flex-элементов по ГЛАВНОЙ оси в контейнере?',
    options: [
      'align-items',
      'justify-content',
      'flex-direction',
      'align-content'
    ],
    correct_option: 1,
    explanation: 'Свойство justify-content выравнивает flex-элементы вдоль главной оси контейнера. Свойство align-items выравнивает их по поперечной оси.'
  },
  {
    id: 'q-1-2',
    course_id: 'course-1',
    text: 'Какое ключевое слово создает переменную с блочной областью видимости, значение которой НЕЛЬЗЯ переназначить?',
    options: [
      'let',
      'var',
      'const',
      'static'
    ],
    correct_option: 2,
    explanation: 'const объявляет константу с блочной областью видимости. Попытка переназначить значение приведет к TypeError.'
  },
  {
    id: 'q-1-3',
    course_id: 'course-1',
    text: 'Какой хук используется в функциональных компонентах React для хранения и обновления внутреннего состояния?',
    options: [
      'useEffect',
      'useContext',
      'useRef',
      'useState'
    ],
    correct_option: 3,
    explanation: 'Хук useState возвращает переменную состояния и функцию для ее обновления.'
  },
  {
    id: 'q-1-4',
    course_id: 'course-1',
    text: 'Что делает метод Promise.all()?',
    options: [
      'Выполняет промисы по очереди',
      'Ждет завершения всех переданных промисов или отклонения любого из них',
      'Отменяет все промисы, если один выполняется слишком долго',
      'Возвращает только первый выполненный промис'
    ],
    correct_option: 1,
    explanation: 'Promise.all() принимает массив промисов и ждет завершения всех из них. Если хотя бы один отклонится, весь Promise.all() мгновенно отклоняется.'
  },
  {
    id: 'q-1-5',
    course_id: 'course-1',
    text: 'Какой тег в HTML5 является семантическим элементом для размещения независимого, самодостаточного контента вроде блог-поста?',
    options: [
      '<section>',
      '<div>',
      '<article>',
      '<aside>'
    ],
    correct_option: 2,
    explanation: 'Тег <article> представляет собой законченный, независимый раздел документа или сайта, предназначенный для автономного распространения.'
  },

  // Course 2 Questions
  {
    id: 'q-2-1',
    course_id: 'course-2',
    text: 'Какой паттерн асинхронности является основным в ядре Node.js для неблокирующего ввода-вывода?',
    options: [
      'Потоковая изоляция (Thread pooling)',
      'Слушатели событий и обратные вызовы (Event Loop & Callbacks)',
      'Синхронный запуск очередей',
      'Многозадачность с вытеснением'
    ],
    correct_option: 1,
    explanation: 'Node.js использует однопоточный Event Loop с неблокирующими системными вызовами и коллбэками для эффективной работы под высокой нагрузкой ввода-вывода.'
  },
  {
    id: 'q-2-2',
    course_id: 'course-2',
    text: 'Какая SQL команда используется для добавления новых записей в таблицу базы данных?',
    options: [
      'ADD ROW',
      'CREATE VALUE',
      'INSERT INTO',
      'UPDATE VALUE'
    ],
    correct_option: 2,
    explanation: 'Команда INSERT INTO используется для вставки новых строк в существующую таблицу.'
  },
  
  // Course 3 Questions
  {
    id: 'q-3-1',
    course_id: 'course-3',
    text: 'Какое значение выведет console.log(typeof null) в JavaScript?',
    options: [
      '"null"',
      '"undefined"',
      '"object"',
      '"boolean"'
    ],
    correct_option: 2,
    explanation: 'typeof null возвращает "object". Это известная историческая ошибка в JavaScript, которая сохраняется для обратной совместимости.'
  },
  {
    id: 'q-3-2',
    course_id: 'course-3',
    text: 'Что такое замыкание в JavaScript?',
    options: [
      'Функция, которая останавливает поток выполнения',
      'Ограничение доступа к коду из других файлов',
      'Комбинация функции и лексического окружения, из которого она была создана',
      'Внутренний системный сбой памяти'
    ],
    correct_option: 2,
    explanation: 'Замыкание дает функции доступ к ее внешней области видимости (scope) даже после завершения выполнения внешней функции.'
  }
];

// Итоговые тестовые вопросы по модулям (отдельно от "Практикума")
export const DEFAULT_MODULE_QUESTIONS: ModuleQuestion[] = [
  // Module 1-1: Основы HTML5 & CSS3
  {
    id: 'mq-1-1-1',
    module_id: 'module-1-1',
    text: 'Какой тег HTML5 предназначен для основного, уникального содержимого страницы?',
    options: ['<section>', '<main>', '<div>', '<aside>'],
    correct_option: 1,
    explanation: 'Тег <main> используется для обозначения основного, уникального содержимого документа, не повторяющегося на других страницах сайта.'
  },
  {
    id: 'mq-1-1-2',
    module_id: 'module-1-1',
    text: 'Какое CSS-свойство превращает элемент в двумерную сетку раскладки?',
    options: ['display: flex;', 'display: grid;', 'position: absolute;', 'float: left;'],
    correct_option: 1,
    explanation: 'display: grid; включает CSS Grid Layout — двумерную систему раскладки по строкам и столбцам одновременно.'
  },
  // Module 1-2: Программирование на JavaScript
  {
    id: 'mq-1-2-1',
    module_id: 'module-1-2',
    text: 'Каким ключевым словом объявляется переменная, значение которой можно менять в дальнейшем?',
    options: ['const', 'let', 'final', 'static'],
    correct_option: 1,
    explanation: 'let объявляет переменную с блочной областью видимости, значение которой можно переназначать в отличие от const.'
  },
  // Module 1-3: Разработка на React
  {
    id: 'mq-1-3-1',
    module_id: 'module-1-3',
    text: 'Что возвращает функциональный компонент React?',
    options: ['Объект состояния', 'Разметку JSX', 'Строку CSS', 'Promise'],
    correct_option: 1,
    explanation: 'Функциональный компонент React — это функция, которая возвращает разметку JSX, описывающую внешний вид элемента интерфейса.'
  },
];

// SQL Script template to setup Supabase Tables
export const SUPABASE_SQL_SETUP = `-- Скрипт для настройки таблиц в Supabase SQL Editor
-- Безопасно выполнять повторно (IF NOT EXISTS / DROP ... IF EXISTS)

-- 1. Создание таблицы курсов
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  level TEXT,
  duration TEXT,
  rating NUMERIC DEFAULT 5.0,
  lessons_count INT DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Создание таблицы модулей
CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Создание таблицы уроков (теория + видео + фотоматериалы)
CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  video_url TEXT,
  image_url TEXT,
  images TEXT[],
  order_index INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Если таблица lessons уже существовала без video_url, image_url или images — добавит колонки
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS images TEXT[];

-- 4. Создание таблицы вопросов для тестов
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_option INT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4.1. Создание таблицы ИТОГОВЫХ тестов по МОДУЛЮ
-- Отдельно от "questions" (Практикум по курсу целиком): здесь тест
-- привязан к конкретному модулю и открывается после завершения его уроков.
CREATE TABLE IF NOT EXISTS public.module_questions (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES public.modules(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_option INT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Создание таблицы прогресса пользователей
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_lessons TEXT[] DEFAULT '{}',
  quiz_scores JSONB DEFAULT '{}'::jsonb,
  module_test_scores JSONB DEFAULT '{}'::jsonb,
  streak INT DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Если таблица user_progress уже существовала без module_test_scores — добавит колонку
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS module_test_scores JSONB DEFAULT '{}'::jsonb;

-- 6. Включение Row Level Security (RLS) для защиты данных
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- 7. Создание публичных политик чтения
DROP POLICY IF EXISTS "Разрешить публичное чтение курсов" ON public.courses;
CREATE POLICY "Разрешить публичное чтение курсов" ON public.courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Разрешить публичное чтение модулей" ON public.modules;
CREATE POLICY "Разрешить публичное чтение модулей" ON public.modules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Разрешить публичное чтение уроков" ON public.lessons;
CREATE POLICY "Разрешить публичное чтение уроков" ON public.lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Разрешить публичное чтение вопросов" ON public.questions;
CREATE POLICY "Разрешить публичное чтение вопросов" ON public.questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Разрешить публичное чтение тестов модуля" ON public.module_questions;
CREATE POLICY "Разрешить публичное чтение тестов модуля" ON public.module_questions FOR SELECT USING (true);

-- 8. Политики для авторизованных пользователей по прогрессу
DROP POLICY IF EXISTS "Пользователи могут управлять только своим прогрессом" ON public.user_progress;
CREATE POLICY "Пользователи могут управлять только своим прогрессом" 
  ON public.user_progress 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. Политики администратора (разрешить запись всем авторизованным администраторам)
-- Для упрощения, можно разрешить изменение курсов всем, либо только конкретным UUID.
-- В данном случае делаем политики открытыми для изменений от имени авторизованных пользователей для удобства тестирования:
DROP POLICY IF EXISTS "Администраторы могут управлять курсами" ON public.courses;
CREATE POLICY "Администраторы могут управлять курсами" ON public.courses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Администраторы могут управлять модулями" ON public.modules;
CREATE POLICY "Администраторы могут управлять модулями" ON public.modules FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Администраторы могут управлять уроками" ON public.lessons;
CREATE POLICY "Администраторы могут управлять уроками" ON public.lessons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Администраторы могут управлять вопросами" ON public.questions;
CREATE POLICY "Администраторы могут управлять вопросами" ON public.questions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Администраторы могут управлять тестами модуля" ON public.module_questions;
CREATE POLICY "Администраторы могут управлять тестами модуля" ON public.module_questions FOR ALL USING (true) WITH CHECK (true);

-- 10. Таблица сообщений обратной связи
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Разрешить отправку сообщений" ON public.contact_messages;
CREATE POLICY "Разрешить отправку сообщений" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- 11. Индексы для ускорения выборок
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.modules (course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons (module_id);
CREATE INDEX IF NOT EXISTS idx_questions_course_id ON public.questions (course_id);
CREATE INDEX IF NOT EXISTS idx_module_questions_module_id ON public.module_questions (module_id);
`;

// Helper functions for reading/writing — Supabase is the single source of truth.
// If a Supabase call fails (network issue, table not set up, etc.), we return the
// built-in DEFAULT_* content as an in-memory fallback so the UI doesn't crash —
// but nothing is ever read from or written to localStorage.
export class DBManager {
  // --- Courses ---
  static async getCourses(): Promise<Course[]> {
    try {
      const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: true });
      if (error || !data || data.length === 0) {
        return DEFAULT_COURSES;
      }
      // Map supabase response to our Course type
      return data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        level: item.level || 'Начальный',
        duration: item.duration || '',
        rating: Number(item.rating) || 5.0,
        lessonsCount: item.lessons_count || 0,
        icon: item.icon || 'Layout',
      }));
    } catch {
      return DEFAULT_COURSES;
    }
  }

  static async saveCourse(course: Course): Promise<void> {
    await supabase.from('courses').upsert({
      id: course.id,
      title: course.title,
      description: course.description,
      level: course.level,
      duration: course.duration,
      rating: course.rating,
      lessons_count: course.lessonsCount,
      icon: course.icon,
    });
  }

  static async deleteCourse(courseId: string): Promise<void> {
    await supabase.from('courses').delete().eq('id', courseId);
  }

  // --- Modules ---
  static async getModules(courseId?: string): Promise<Module[]> {
    try {
      let query = supabase.from('modules').select('*').order('order_index', { ascending: true });
      if (courseId) {
        query = query.eq('course_id', courseId);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return courseId ? DEFAULT_MODULES.filter(m => m.course_id === courseId) : DEFAULT_MODULES;
      }
      return data.map(item => ({
        id: item.id,
        course_id: item.course_id,
        title: item.title,
        order_index: item.order_index,
      }));
    } catch {
      return courseId ? DEFAULT_MODULES.filter(m => m.course_id === courseId) : DEFAULT_MODULES;
    }
  }

  static async saveModule(moduleItem: Module): Promise<void> {
    await supabase.from('modules').upsert({
      id: moduleItem.id,
      course_id: moduleItem.course_id,
      title: moduleItem.title,
      order_index: moduleItem.order_index,
    });
  }

  static async deleteModule(moduleId: string): Promise<void> {
    // Lessons cascade automatically via FK in Supabase
    await supabase.from('modules').delete().eq('id', moduleId);
  }

  // Fetch a course's modules AND a LIGHTWEIGHT summary of their lessons
  // (id/title/order_index only — no content/images/video) in ONE network
  // round-trip. This is what the sidebar/navigation needs; the full lesson
  // (with content) is fetched separately, on demand, via getLessonById().
  // This avoids downloading every lesson's full content just to show a list.
  static async getCourseContent(courseId: string): Promise<{ modules: Module[]; lessons: LessonSummary[] }> {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*, lessons(id, module_id, title, order_index)')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })
        .order('order_index', { ascending: true, foreignTable: 'lessons' });

      if (error || !data || data.length === 0) {
        throw error || new Error('empty');
      }

      const modules: Module[] = data.map((item: any) => ({
        id: item.id,
        course_id: item.course_id,
        title: item.title,
        order_index: item.order_index,
      }));

      const lessons: LessonSummary[] = data.flatMap((mod: any) =>
        (mod.lessons || []).map((item: any) => ({
          id: item.id,
          module_id: item.module_id,
          title: item.title,
          order_index: item.order_index,
        }))
      );

      return { modules, lessons };
    } catch {
      // Fallback: two separate requests (still correct, just slightly slower)
      const modules = await this.getModules(courseId);
      const fullLessons = modules.length > 0 ? await this.getLessons(modules.map(m => m.id)) : [];
      const lessons: LessonSummary[] = fullLessons.map(l => ({
        id: l.id,
        module_id: l.module_id,
        title: l.title,
        order_index: l.order_index,
      }));
      return { modules, lessons };
    }
  }

  // Fetch ONE lesson with its full content/images/video — called only when
  // the user actually opens that lesson, instead of upfront for the whole course.
  static async getLessonById(lessonId: string): Promise<Lesson | null> {
    try {
      const { data, error } = await supabase.from('lessons').select('*').eq('id', lessonId).single();
      if (error || !data) {
        throw error || new Error('not found');
      }
      const itemImages: string[] = Array.isArray(data.images) && data.images.length > 0
        ? data.images
        : (data.image_url ? [data.image_url] : []);
      return {
        id: data.id,
        module_id: data.module_id,
        title: data.title,
        content: data.content,
        video_url: data.video_url || "",
        image_url: data.image_url || (itemImages[0] || ""),
        images: itemImages,
        order_index: data.order_index,
      };
    } catch {
      // Fallback to built-in default content if Supabase is unreachable
      return DEFAULT_LESSONS.find(l => l.id === lessonId) || null;
    }
  }

  // --- Lessons ---
  // moduleId can be a single module id, an array of module ids (e.g. all modules of a course),
  // or omitted to fetch every lesson. Passing an array does ONE query instead of one-per-module.
  static async getLessons(moduleId?: string | string[]): Promise<Lesson[]> {
    const moduleIds = Array.isArray(moduleId) ? moduleId : (moduleId ? [moduleId] : null);

    const filterDefaults = (allLessons: Lesson[]) =>
      moduleIds ? allLessons.filter(l => moduleIds.includes(l.module_id)) : allLessons;

    try {
      let query = supabase.from('lessons').select('*').order('order_index', { ascending: true });
      if (moduleIds) {
        query = moduleIds.length === 1 ? query.eq('module_id', moduleIds[0]) : query.in('module_id', moduleIds);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return filterDefaults(DEFAULT_LESSONS);
      }
      return data.map(item => {
        const itemImages: string[] = Array.isArray(item.images) && item.images.length > 0 
          ? item.images 
          : (item.image_url ? [item.image_url] : []);
        return {
          id: item.id,
          module_id: item.module_id,
          title: item.title,
          content: item.content,
          video_url: item.video_url || "",
          image_url: item.image_url || (itemImages[0] || ""),
          images: itemImages,
          order_index: item.order_index,
        };
      });
    } catch {
      return filterDefaults(DEFAULT_LESSONS);
    }
  }

  // Returns true if this created a brand-new lesson, false if it updated an existing one.
  // (Used by the admin panel to decide whether to bump the parent course's lessonsCount.)
  static async saveLesson(lesson: Lesson): Promise<boolean> {
    const existing = await supabase.from('lessons').select('id').eq('id', lesson.id).single();
    const isNew = !existing.data;

    const finalImages = lesson.images && lesson.images.length > 0
      ? lesson.images.filter(img => img && img.trim().length > 0)
      : (lesson.image_url ? [lesson.image_url] : []);
    const primaryImageUrl = lesson.image_url || (finalImages.length > 0 ? finalImages[0] : null);

    await supabase.from('lessons').upsert({
      id: lesson.id,
      module_id: lesson.module_id,
      title: lesson.title,
      content: lesson.content,
      video_url: lesson.video_url || null,
      image_url: primaryImageUrl,
      images: finalImages,
      order_index: lesson.order_index,
    });

    return isNew;
  }

  static async deleteLesson(lessonId: string): Promise<void> {
    await supabase.from('lessons').delete().eq('id', lessonId);
  }

  // --- Questions ---
  static async getQuestions(courseId?: string): Promise<Question[]> {
    try {
      let query = supabase.from('questions').select('*');
      if (courseId) {
        query = query.eq('course_id', courseId);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return courseId ? DEFAULT_QUESTIONS.filter(q => q.course_id === courseId) : DEFAULT_QUESTIONS;
      }
      return data.map(item => ({
        id: item.id,
        course_id: item.course_id,
        text: item.text,
        options: item.options,
        correct_option: item.correct_option,
        explanation: item.explanation || '',
      }));
    } catch {
      return courseId ? DEFAULT_QUESTIONS.filter(q => q.course_id === courseId) : DEFAULT_QUESTIONS;
    }
  }

  static async saveQuestion(question: Question): Promise<void> {
    await supabase.from('questions').upsert({
      id: question.id,
      course_id: question.course_id,
      text: question.text,
      options: question.options,
      correct_option: question.correct_option,
      explanation: question.explanation,
    });
  }

  static async deleteQuestion(questionId: string): Promise<void> {
    await supabase.from('questions').delete().eq('id', questionId);
  }

  // --- Module Final Tests ("Тест") ---
  // Итоговое тестирование по завершении КОНКРЕТНОГО МОДУЛЯ.
  // Концептуально отдельно от "Практикума" (Question / getQuestions), который
  // проверяет знания по курсу целиком.
  static async getModuleQuestions(moduleId?: string): Promise<ModuleQuestion[]> {
    try {
      let query = supabase.from('module_questions').select('*');
      if (moduleId) {
        query = query.eq('module_id', moduleId);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return moduleId ? DEFAULT_MODULE_QUESTIONS.filter(q => q.module_id === moduleId) : DEFAULT_MODULE_QUESTIONS;
      }
      return data.map(item => ({
        id: item.id,
        module_id: item.module_id,
        text: item.text,
        options: item.options,
        correct_option: item.correct_option,
        explanation: item.explanation || '',
      }));
    } catch {
      return moduleId ? DEFAULT_MODULE_QUESTIONS.filter(q => q.module_id === moduleId) : DEFAULT_MODULE_QUESTIONS;
    }
  }

  static async saveModuleQuestion(question: ModuleQuestion): Promise<void> {
    await supabase.from('module_questions').upsert({
      id: question.id,
      module_id: question.module_id,
      text: question.text,
      options: question.options,
      correct_option: question.correct_option,
      explanation: question.explanation,
    });
  }

  static async deleteModuleQuestion(questionId: string): Promise<void> {
    await supabase.from('module_questions').delete().eq('id', questionId);
  }

  // --- User Progress ---
  static async getUserProgress(userId: string): Promise<UserProgress> {
    const defaultProgress: UserProgress = {
      user_id: userId,
      completed_lessons: [],
      quiz_scores: {},
      module_test_scores: {},
      streak: 0,
      last_active: new Date().toISOString().split('T')[0],
    };

    try {
      const { data, error } = await supabase.from('user_progress').select('*').eq('user_id', userId).single();
      if (error || !data) {
        return defaultProgress;
      }
      return {
        user_id: data.user_id,
        completed_lessons: data.completed_lessons || [],
        quiz_scores: data.quiz_scores || {},
        module_test_scores: data.module_test_scores || {},
        streak: data.streak || 0,
        last_active: data.last_active || '',
      };
    } catch {
      return defaultProgress;
    }
  }

  static async saveUserProgress(progress: UserProgress): Promise<void> {
    await supabase.from('user_progress').upsert({
      user_id: progress.user_id,
      completed_lessons: progress.completed_lessons,
      quiz_scores: progress.quiz_scores,
      module_test_scores: progress.module_test_scores,
      streak: progress.streak,
      last_active: progress.last_active,
    });
  }

  // Complete a lesson and potentially update streak
  static async completeLesson(userId: string, lessonId: string): Promise<UserProgress> {
    const progress = await this.getUserProgress(userId);
    if (!progress.completed_lessons.includes(lessonId)) {
      progress.completed_lessons.push(lessonId);
      
      // Update streak
      const today = new Date().toISOString().split('T')[0];
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (progress.last_active === yesterdayStr) {
        progress.streak += 1;
      } else if (progress.last_active !== today) {
        progress.streak = 1;
      }
      
      progress.last_active = today;
      await this.saveUserProgress(progress);
    }
    return progress;
  }

  // Save quiz score
  static async saveQuizScore(userId: string, courseId: string, scorePercent: number): Promise<UserProgress> {
    const progress = await this.getUserProgress(userId);
    const existing = progress.quiz_scores[courseId] || 0;
    if (scorePercent > existing) {
      progress.quiz_scores[courseId] = scorePercent;
    }
    
    // Update active streak
    const today = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (progress.last_active === yesterdayStr) {
      progress.streak += 1;
    } else if (progress.last_active !== today) {
      progress.streak = 1;
    }
    
    progress.last_active = today;
    await this.saveUserProgress(progress);
    return progress;
  }

  // Save module final-test ("Тест") score — separate from course-wide quiz_scores
  static async saveModuleTestScore(userId: string, moduleId: string, scorePercent: number): Promise<UserProgress> {
    const progress = await this.getUserProgress(userId);
    if (!progress.module_test_scores) progress.module_test_scores = {};
    const existing = progress.module_test_scores[moduleId] || 0;
    if (scorePercent > existing) {
      progress.module_test_scores[moduleId] = scorePercent;
    }

    // Update active streak
    const today = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (progress.last_active === yesterdayStr) {
      progress.streak += 1;
    } else if (progress.last_active !== today) {
      progress.streak = 1;
    }

    progress.last_active = today;
    await this.saveUserProgress(progress);
    return progress;
  }
}