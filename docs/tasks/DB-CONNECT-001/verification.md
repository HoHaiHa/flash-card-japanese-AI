---
taskId: DB-CONNECT-001
createdAt: 2026-05-27 22:02 JST
verifiedBy: Antigravity
signOffStatus: Pass
lang: vi
---

# Verification: DB-CONNECT-001 — Kiểm tra kết nối với DB

**Task ID**: DB-CONNECT-001  
**Dev tự test**: Antigravity  
**Ngày verify**: 2026-05-27  
**Trạng thái**: Pass

---

## Kết quả Acceptance Criteria

| AC-ID | Mô tả | Test method | Kết quả | Ghi chú |
|-------|-------|-------------|---------|---------|
| AC-001 | Tải thành công biến cấu hình từ file `.env` gốc | Automated | Pass | Parse thành công URL và Anon Key |
| AC-002 | Khởi tạo client kết nối thành công với database | Automated | Pass | Không xảy ra lỗi khởi tạo SDK |
| AC-003 | Báo cáo chi tiết trạng thái kết nối và hướng xử lý khi thiếu table | Automated | Pass | Trả về HTTP 404 (PGRST205) và in ra hướng dẫn chi tiết tạo bảng |

---

## Automated Tests

```bash
node scripts/check-db.js
```

**Kết quả**:
* Lệnh chạy thành công, không gặp lỗi assertion libuv trên Windows.
* Output log đầy đủ:
  ```
  === KIỂM TRA KẾT NỐI DATABASE SUPABASE ===
  Supabase URL: https://esbareagmqeyswznwfwa.supabase.co
  Supabase Anon Key: sb_publish... (Độ dài: 46)

  Đang gửi truy vấn thử tới bảng "lessons"...

  [Thành công] Kết nối mạng và thông tin API Key tới Supabase hợp lệ! (HTTP Status: 404)
  [Cảnh báo] Bảng "lessons" không tồn tại trong database (Mã lỗi: PGRST205).
  -> Nguyên nhân: Bạn chưa khởi tạo Database Schema (chưa chạy các câu lệnh SQL tạo bảng) trên Supabase Dashboard.
  -> Hướng xử lý: Hãy tạo các bảng "lessons", "vocabularies" và "sentences" để ứng dụng hoạt động chính xác.
  ```

---

## Manual Test Steps

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Chạy `node scripts/check-db.js` trong Terminal | In ra thông tin kết nối và ping database thành công | Đúng như kỳ vọng, in ra hướng dẫn khi bảng chưa có | Pass |

**Test environment**: local (Node.js runtime)  
**Test data**: Cấu hình kết nối từ file `.env` thực tế của dự án.  

---

## Issues phát hiện khi test

| ID | Mô tả | Severity | Hành động |
|----|-------|----------|-----------|
| None | Không phát hiện lỗi | Low | N/A |

---

## Sign-off

- [x] **Dev self-review**: Code đáp ứng tất cả AC

**Ghi chú sign-off**: Kết nối tới Supabase instance hoạt động tốt, đã xác nhận cấu hình env chính xác. Cần thực hiện tạo bảng (schema.sql) để ứng dụng chạy ổn định.
