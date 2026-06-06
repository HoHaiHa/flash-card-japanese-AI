import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
const jsonPath = path.resolve(__dirname, 'temp-lesson-data.json');

// Helper to parse environmental variables from .env
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`[Error] File .env không tồn tại tại: ${filePath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  content.split('\n').forEach(line => {
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

// Clean exit wrapper to prevent libuv assertion failure on Windows
function cleanExit(code) {
  setTimeout(() => {
    process.exit(code);
  }, 100);
}

async function main() {
  console.log('=== TIẾN HÀNH ĐỒNG BỘ DỮ LIỆU BÀI HỌC VÀO SUPABASE ===');

  // Load Env Configuration
  const env = loadEnv(envPath);
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Lỗi] Thiếu cấu hình VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong file .env');
    cleanExit(1);
    return;
  }

  // Check if temp data JSON file exists
  if (!fs.existsSync(jsonPath)) {
    console.error(`[Lỗi] File dữ liệu tạm không tồn tại tại: ${jsonPath}`);
    console.log('-> Vui lòng chạy skill cào dữ liệu trước để sinh ra file này.');
    cleanExit(1);
    return;
  }

  let rawData;
  try {
    rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch (err) {
    console.error('[Lỗi] Không thể parse nội dung file JSON tạm:', err.message);
    cleanExit(1);
    return;
  }

  const { lessonName, level, vocabularies = [], kanjis = [], sentences = [] } = rawData;

  if (!lessonName || !level) {
    console.error('[Lỗi] File dữ liệu thiếu thông tin bắt buộc "lessonName" hoặc "level".');
    cleanExit(1);
    return;
  }

  console.log(`\nBài học: ${lessonName}`);
  console.log(`Trình độ: ${level}`);
  console.log(`Số từ vựng: ${vocabularies.length}`);
  console.log(`Số chữ Hán: ${kanjis.length}`);
  console.log(`Số mẫu câu: ${sentences.length}`);

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. Check or Create Lesson
    console.log('\n[1/3] Kiểm tra/Khởi tạo bài học trong DB...');
    const { data: existingLessons, error: findLessonErr } = await supabase
      .from('lessons')
      .select('id')
      .eq('name', lessonName)
      .limit(1);

    if (findLessonErr) {
      console.error('Lỗi khi truy vấn bài học:', findLessonErr);
      cleanExit(1);
      return;
    }

    let lessonId;
    if (existingLessons && existingLessons.length > 0) {
      lessonId = existingLessons[0].id;
      console.log(`-> Bài học đã tồn tại. Sử dụng ID: ${lessonId}`);
    } else {
      console.log(`-> Bài học chưa tồn tại. Đang tạo mới bài học "${lessonName}"...`);
      const { data: newLesson, error: createLessonErr } = await supabase
        .from('lessons')
        .insert([{ name: lessonName, level: level }])
        .select('id')
        .single();

      if (createLessonErr) {
        console.error('Lỗi khi tạo mới bài học:', createLessonErr);
        cleanExit(1);
        return;
      }
      lessonId = newLesson.id;
      console.log(`-> Tạo bài học thành công! ID sinh ra: ${lessonId}`);
    }

    // 2. Import Vocabularies and Kanjis (into vocabularies table)
    console.log('\n[2/3] Đồng bộ từ vựng và chữ Hán (bảng "vocabularies")...');
    
    // Combine vocabs and kanjis
    const allVocabRecords = [];

    // Map vocabularies
    vocabularies.forEach((v, index) => {
      // If no ID is provided, generate a structured ID
      const recordId = v.id || `v_${lessonId}_${index + 1}`;
      allVocabRecords.push({
        id: recordId,
        lesson_id: lessonId,
        level: v.level || level,
        kana: v.kana,
        kanji: v.kanji || '',
        sino_vietnamese: v.sino_vietnamese || '',
        details: v.details || '',
        components: typeof v.components === 'string' ? JSON.parse(v.components) : (v.components || []),
        definition: v.definition,
        example_jp: v.example_jp || '',
        example_vi: v.example_vi || '',
        type: 'vocab',
        favorite: !!v.favorite,
        status: v.status || 'forgot'
      });
    });

    // Map kanjis
    kanjis.forEach((k, index) => {
      const recordId = k.id || `k_${lessonId}_${index + 1}`;
      allVocabRecords.push({
        id: recordId,
        lesson_id: lessonId,
        level: k.level || level,
        kana: k.kana,
        kanji: k.kanji,
        sino_vietnamese: k.sino_vietnamese || '',
        details: k.details || '',
        components: typeof k.components === 'string' ? JSON.parse(k.components) : (k.components || []),
        definition: k.definition,
        example_jp: k.example_jp || '',
        example_vi: k.example_vi || '',
        type: 'kanji',
        favorite: !!k.favorite,
        status: k.status || 'forgot'
      });
    });

    if (allVocabRecords.length > 0) {
      const { error: vocabUpsertErr } = await supabase
        .from('vocabularies')
        .upsert(allVocabRecords, { onConflict: 'id' });

      if (vocabUpsertErr) {
        console.error('Lỗi khi upsert từ vựng & chữ Hán:', vocabUpsertErr);
        cleanExit(1);
        return;
      }
      console.log(`-> Đã đồng bộ thành công ${allVocabRecords.length} bản ghi (từ vựng + chữ Hán).`);
    } else {
      console.log('-> Không có dữ liệu từ vựng hoặc chữ Hán để đồng bộ.');
    }

    // 3. Import Sentences (into sentences table)
    console.log('\n[3/3] Đồng bộ mẫu câu ngữ pháp (bảng "sentences")...');
    const allSentenceRecords = sentences.map((s, index) => {
      const recordId = s.id || `s_${lessonId}_${index + 1}`;
      return {
        id: recordId,
        lesson_id: lessonId,
        level: s.level || level,
        kana: s.kana,
        kanji: s.kanji || '',
        sino_vietnamese: s.sino_vietnamese || '',
        details: s.details || '',
        components: typeof s.components === 'string' ? JSON.parse(s.components) : (s.components || []),
        definition: s.definition,
        example_jp: s.example_jp || '',
        example_vi: s.example_vi || '',
        type: 'sentence',
        favorite: !!s.favorite,
        status: s.status || 'forgot'
      };
    });

    if (allSentenceRecords.length > 0) {
      const { error: sentenceUpsertErr } = await supabase
        .from('sentences')
        .upsert(allSentenceRecords, { onConflict: 'id' });

      if (sentenceUpsertErr) {
        console.error('Lỗi khi upsert mẫu câu:', sentenceUpsertErr);
        cleanExit(1);
        return;
      }
      console.log(`-> Đã đồng bộ thành công ${allSentenceRecords.length} bản ghi mẫu câu.`);
    } else {
      console.log('-> Không có dữ liệu mẫu câu để đồng bộ.');
    }

    console.log('\n=== [HOÀN THÀNH] QUÁ TRÌNH NHẬP DỮ LIỆU ĐÃ KẾT THÚC THÀNH CÔNG ===');
    cleanExit(0);

  } catch (err) {
    console.error('\n[Lỗi ngoại lệ] Đã xảy ra lỗi hệ thống trong quá trình chạy script:');
    console.error(err);
    cleanExit(1);
  }
}

main();
