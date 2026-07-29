// Диагностика: находит уроки с самым "тяжёлым" содержимым в базе Supabase.
// Помогает понять, откуда берутся мегабайтные ответы lessons?select=*.
//
// Запуск:
//   node scripts/find-heavy-lessons.mjs
//
// Нужны переменные окружения (можно взять из .env / .env.local):
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_ANON_KEY   (или NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('❌ Задайте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в окружении.');
  process.exit(1);
}

const supabase = createClient(url, key);

function byteSize(str) {
  return Buffer.byteLength(str || '', 'utf8');
}

function containsBase64Image(str) {
  return typeof str === 'string' && str.includes('data:image');
}

const { data: lessons, error } = await supabase.from('lessons').select('*');

if (error) {
  console.error('❌ Ошибка запроса к Supabase:', error.message);
  process.exit(1);
}

const report = lessons.map((lesson) => {
  const contentSize = byteSize(lesson.content);
  const imagesSize = byteSize(JSON.stringify(lesson.images || []));
  const imageUrlSize = byteSize(lesson.image_url);
  const totalSize = contentSize + imagesSize + imageUrlSize;
  const hasBase64 =
    containsBase64Image(lesson.content) ||
    containsBase64Image(lesson.image_url) ||
    (Array.isArray(lesson.images) && lesson.images.some(containsBase64Image));

  return {
    id: lesson.id,
    title: lesson.title,
    module_id: lesson.module_id,
    totalKB: (totalSize / 1024).toFixed(1),
    hasBase64,
  };
});

report.sort((a, b) => parseFloat(b.totalKB) - parseFloat(a.totalKB));

console.log('\n📊 Уроки, отсортированные по размеру (самые тяжёлые сверху):\n');
console.log('Размер (KB) | base64 картинки? | Модуль          | Заголовок');
console.log('------------|-------------------|-----------------|----------');
for (const row of report.slice(0, 30)) {
  console.log(
    `${row.totalKB.padStart(10)} | ${(row.hasBase64 ? 'ДА ⚠️' : 'нет').padEnd(17)} | ${row.module_id.padEnd(15)} | ${row.title}`
  );
}

const totalKB = report.reduce((sum, r) => sum + parseFloat(r.totalKB), 0);
const withBase64 = report.filter((r) => r.hasBase64).length;

console.log(`\nВсего уроков: ${report.length}`);
console.log(`Суммарный размер всех уроков: ${(totalKB / 1024).toFixed(2)} MB`);
console.log(`Уроков с base64-картинками внутри контента: ${withBase64}`);
if (withBase64 > 0) {
  console.log(
    '\n👉 Рекомендация: перенесите эти картинки в Supabase Storage (или любой хостинг файлов)\n' +
    '   и замените base64 в content/images на обычные https-ссылки. Это резко уменьшит вес\n' +
    '   каждого запроса lessons и ускорит открытие курсов.'
  );
}
