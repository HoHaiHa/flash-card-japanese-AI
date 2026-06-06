import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
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

function cleanExit(code) {
  setTimeout(() => process.exit(code), 100);
}

async function main() {
  console.log('=== XÓA TOÀN BỘ DỮ LIỆU TRÊN SUPABASE ===\n');

  const env = loadEnv(path.resolve(__dirname, '../.env'));
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Lỗi] Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong .env');
    cleanExit(1);
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Delete theo thứ tự để tránh foreign key conflict:
  // sentences và vocabularies trước (child), lessons sau (parent)
  const steps = [
    { table: 'sentences',    filter: { col: 'id', op: 'not.is', val: null } },
    { table: 'vocabularies', filter: { col: 'id', op: 'not.is', val: null } },
    { table: 'lessons',      filter: { col: 'id', op: 'gte',     val: 0    } },
  ];

  for (const step of steps) {
    process.stdout.write(`Đang xóa bảng "${step.table}"... `);

    let query = supabase.from(step.table).delete();

    if (step.filter.op === 'not.is') {
      query = query.not(step.filter.col, 'is', null);
    } else if (step.filter.op === 'gte') {
      query = query.gte(step.filter.col, step.filter.val);
    }

    const { error, count } = await query;

    if (error) {
      console.error(`\n[Lỗi] Không thể xóa bảng "${step.table}":`, error.message);
      cleanExit(1);
      return;
    }

    console.log('✓');
  }

  console.log('\n=== [THÀNH CÔNG] Đã xóa sạch toàn bộ dữ liệu trên Supabase ===');
  console.log('-> Chạy /dev:scrape-lesson rồi /dev:import-lesson để nạp dữ liệu mới.\n');
  cleanExit(0);
}

main();
