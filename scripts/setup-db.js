import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to parse env variables
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

// Get connection string from argument or .env
const env = loadEnv(path.resolve(__dirname, '../.env'));
let connectionString = process.argv[2] || env.DIRECT_URL;

if (!connectionString && env.DATABASE_PASSWORD) {
  connectionString = `postgresql://postgres.esbareagmqeyswznwfwa:${env.DATABASE_PASSWORD}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`;
}

if (!connectionString || connectionString.includes('[YOUR-PASSWORD]')) {
  console.error('\n[Lỗi] Không tìm thấy Connection String hoặc DATABASE_PASSWORD trong file .env hoặc đối số.');
  console.log('\nCách 1: Thêm dòng sau vào file .env:');
  console.log('DATABASE_PASSWORD=mat_khau_cua_ban');
  console.log('\nCách 2: Chạy lệnh kèm đối số:');
  console.log('node scripts/setup-db.js "postgresql://postgres.esbareagmqeyswznwfwa:MAT_KHAU_THUC_TE@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"\n');
  process.exit(1);
}

async function run() {
  // Ensure 'pg' is installed
  try {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    require.resolve('pg');
  } catch (e) {
    console.log("Thư viện 'pg' chưa được cài đặt. Đang tự động cài đặt...");
    try {
      execSync('npm install pg', { stdio: 'inherit' });
      console.log("Cài đặt 'pg' thành công.\n");
    } catch (installErr) {
      console.error('Lỗi khi cài đặt thư viện pg:', installErr);
      process.exit(1);
    }
  }

  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  const pg = require('pg');
  const { Client } = pg;

  const clientConfig = {
    ssl: {
      rejectUnauthorized: false
    }
  };

  if (process.argv[2]) {
    clientConfig.connectionString = process.argv[2];
  } else if (env.DIRECT_URL) {
    clientConfig.connectionString = env.DIRECT_URL;
  } else {
    clientConfig.user = 'postgres.esbareagmqeyswznwfwa';
    clientConfig.password = env.DATABASE_PASSWORD;
    clientConfig.host = 'aws-1-ap-northeast-1.pooler.supabase.com';
    clientConfig.port = 5432;
    clientConfig.database = 'postgres';
  }

  const client = new Client(clientConfig);

  try {
    console.log('Đang kết nối trực tiếp tới PostgreSQL trên Supabase...');
    await client.connect();
    console.log('Kết nối thành công!');

    const sqlPath = path.resolve(__dirname, '../docs/tasks/SUPABASE-001/schema.sql');
    console.log(`Đang đọc file: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Đang khởi tạo các bảng, cấu hình RLS và chèn dữ liệu test...');
    await client.query(sql);
    console.log('\n=== [THÀNH CÔNG] KHỞI TẠO VÀ CHÈN DỮ LIỆU TEST LÊN SUPABASE HOÀN TẤT! ===\n');
  } catch (err) {
    console.error('\n[Lỗi] Không thể thiết lập cơ sở dữ liệu:');
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
