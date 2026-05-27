import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to .env file in the project root
const envPath = path.resolve(__dirname, '../.env');

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

console.log('=== KIỂM TRA KẾT NỐI DATABASE SUPABASE ===');

const env = loadEnv(envPath);
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Lỗi] Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong file .env');
  process.exit(1);
}

console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Supabase Anon Key: ${supabaseAnonKey.substring(0, 10)}... (Độ dài: ${supabaseAnonKey.length})`);

// Initialize Supabase Client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Clean exit wrapper to prevent libuv assertion failure on Windows
function cleanExit(code) {
  setTimeout(() => {
    process.exit(code);
  }, 100);
}

async function testConnection() {
  try {
    console.log('\nĐang gửi truy vấn thử tới bảng "lessons"...');
    const { data, error, status } = await supabase
      .from('lessons')
      .select('id, name, level')
      .limit(5);

    if (error) {
      // Trường hợp PGRST205: Bảng không tồn tại trong cache schema
      if (error.code === 'PGRST205' || (error.message && error.message.includes('Could not find the table'))) {
        console.log(`\n[Thành công] Kết nối mạng và thông tin API Key tới Supabase hợp lệ! (HTTP Status: ${status})`);
        console.log(`[Cảnh báo] Bảng "lessons" không tồn tại trong database (Mã lỗi: ${error.code}).`);
        console.log('-> Nguyên nhân: Bạn chưa khởi tạo Database Schema (chưa chạy các câu lệnh SQL tạo bảng) trên Supabase Dashboard.');
        console.log('-> Hướng xử lý: Hãy tạo các bảng "lessons", "vocabularies" và "sentences" để ứng dụng hoạt động chính xác.');
        cleanExit(0);
        return;
      } else {
        console.error(`\n[Lỗi] Truy vấn thất bại (HTTP Status: ${status})`);
        console.error('Chi tiết lỗi:', error);
        cleanExit(1);
        return;
      }
    }

    console.log(`\n[Thành công] Kết nối tới database Supabase hoàn tất! (HTTP Status: ${status})`);
    console.log('Dữ liệu bài học lấy được:');
    if (data && data.length > 0) {
      console.table(data);
    } else {
      console.log('(Bảng "lessons" trống hoặc không có dữ liệu bài học)');
    }
    cleanExit(0);
  } catch (err) {
    console.error('\n[Lỗi ngoại lệ] Có lỗi xảy ra trong quá trình kết nối:');
    console.error(err);
    cleanExit(1);
  }
}

testConnection();
