/**
 * import-all-lessons.js
 * Import tuần tự lesson-02.json → lesson-12.json vào Supabase.
 * Chạy: node scripts/import-all-lessons.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`[Error] Không tìm thấy file .env tại: ${filePath}`);
    process.exit(1);
  }
  const env = {};
  fs.readFileSync(filePath, 'utf-8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = val;
    }
  });
  return env;
}

async function importLesson(supabase, rawData) {
  const { lessonName, level, vocabularies = [], kanjis = [], sentences = [] } = rawData;

  if (!lessonName || !level) throw new Error('Thiếu lessonName hoặc level');

  // 1. Upsert lesson
  const { data: existing } = await supabase
    .from('lessons').select('id').eq('name', lessonName).limit(1);

  let lessonId;
  if (existing && existing.length > 0) {
    lessonId = existing[0].id;
    console.log(`  → Bài đã tồn tại (id=${lessonId})`);
  } else {
    const { data: newLesson, error } = await supabase
      .from('lessons').insert([{ name: lessonName, level }]).select('id').single();
    if (error) throw error;
    lessonId = newLesson.id;
    console.log(`  → Tạo bài mới (id=${lessonId})`);
  }

  // 2. Vocabularies + Kanjis → bảng vocabularies
  const vocabRecords = [
    ...vocabularies.map((v, i) => ({
      id: v.id || `v_${lessonId}_${i + 1}`,
      lesson_id: lessonId, level: v.level || level,
      kana: v.kana, kanji: v.kanji || '',
      sino_vietnamese: v.sino_vietnamese || '',
      details: v.details || '',
      components: v.components || [],
      definition: v.definition,
      example_jp: v.example_jp || '', example_vi: v.example_vi || '',
      type: 'vocab', favorite: !!v.favorite, status: v.status || 'forgot',
    })),
    ...kanjis.map((k, i) => ({
      id: k.id || `k_${lessonId}_${i + 1}`,
      lesson_id: lessonId, level: k.level || level,
      kana: k.kana, kanji: k.kanji,
      sino_vietnamese: k.sino_vietnamese || '',
      details: k.details || '',
      components: k.components || [],
      definition: k.definition,
      example_jp: k.example_jp || '', example_vi: k.example_vi || '',
      type: 'kanji', favorite: !!k.favorite, status: k.status || 'forgot',
    })),
  ];

  if (vocabRecords.length > 0) {
    const { error } = await supabase
      .from('vocabularies').upsert(vocabRecords, { onConflict: 'id' });
    if (error) throw error;
    console.log(`  → ${vocabRecords.length} vocab/kanji đã đồng bộ`);
  }

  // 3. Sentences
  const sentenceRecords = sentences.map((s, i) => ({
    id: s.id || `s_${lessonId}_${i + 1}`,
    lesson_id: lessonId, level: s.level || level,
    kana: s.kana, kanji: s.kanji || '',
    sino_vietnamese: s.sino_vietnamese || '',
    details: s.details || '',
    components: s.components || [],
    definition: s.definition,
    example_jp: s.example_jp || '', example_vi: s.example_vi || '',
    type: 'sentence', favorite: !!s.favorite, status: s.status || 'forgot',
  }));

  if (sentenceRecords.length > 0) {
    const { error } = await supabase
      .from('sentences').upsert(sentenceRecords, { onConflict: 'id' });
    if (error) throw error;
    console.log(`  → ${sentenceRecords.length} mẫu câu đã đồng bộ`);
  }

  return { lessonName, vocabCount: vocabRecords.length, sentCount: sentenceRecords.length };
}

async function main() {
  console.log('=== IMPORT HÀNG LOẠT BÀI 2–12 ===\n');

  const env = loadEnv(path.resolve(__dirname, '../.env'));
  const { VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: key } = env;
  if (!url || !key) {
    console.error('[Lỗi] Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong .env');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const lessonFiles = Array.from({ length: 11 }, (_, i) =>
    `lesson-${String(i + 2).padStart(2, '0')}.json`
  );

  let successCount = 0;
  const errors = [];

  for (const filename of lessonFiles) {
    const filePath = path.resolve(__dirname, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`[SKIP] ${filename} không tồn tại`);
      continue;
    }

    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.error(`[ERROR] Parse thất bại: ${filename} — ${e.message}`);
      errors.push(filename);
      continue;
    }

    console.log(`\n📖 ${data.lessonName}`);
    try {
      const result = await importLesson(supabase, data);
      console.log(`  ✓ Xong: ${result.vocabCount} từ vựng/kanji, ${result.sentCount} mẫu câu`);
      successCount++;
    } catch (e) {
      console.error(`  ✗ Lỗi: ${e.message}`);
      errors.push(filename);
    }
  }

  console.log(`\n=== KẾT QUẢ: ${successCount}/${lessonFiles.length} bài thành công ===`);
  if (errors.length > 0) {
    console.log('Lỗi ở:', errors.join(', '));
    setTimeout(() => process.exit(1), 100);
  } else {
    setTimeout(() => process.exit(0), 100);
  }
}

main();
