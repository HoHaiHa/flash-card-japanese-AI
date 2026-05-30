---
taskId: SUPABASE-001
createdAt: 2026-05-28 23:05 JST
verifiedBy: Antigravity
signOffStatus: Pass
lang: vi
---

# Verification: SUPABASE-001 — Tích hợp Supabase làm Cơ sở dữ liệu cho Dự án

**Task ID**: SUPABASE-001  
**Dev tự test**: Antigravity  
**Ngày verify**: 2026-05-28  
**Trạng thái**: Pass  

---

## Kết quả Acceptance Criteria

| AC-ID | Mô tả | Test method | Kết quả | Ghi chú |
|-------|-------|-------------|---------|---------|
| AC-001 | Khởi tạo database schema thành công trên Supabase với 3 bảng `lessons`, `vocabularies`, `sentences`. | Automated | Pass | Khởi tạo thành công qua script [setup-db.js](file:///c:/project-ai/flash-card-japanese-AI/scripts/setup-db.js). |
| AC-002 | Thiết lập kết nối client Supabase thông qua biến môi trường thành công, không hardcode API Keys. | Automated | Pass | Xác thực qua script [check-db.js](file:///c:/project-ai/flash-card-japanese-AI/scripts/check-db.js) trả về HTTP Status 200. |
| AC-003 | Danh sách bài học và từ vựng/mẫu câu trên giao diện được lấy động hoàn toàn từ Supabase. | Manual | Pass | Đã thay thế Mock Data tĩnh thành công ở các màn hình Cấu hình, Danh sách học tập và Học Flashcard. |
| AC-004 | Các thao tác yêu thích và đánh giá thuộc/chưa thuộc được ghi nhận thành công và đồng bộ thời gian thực xuống database. | Manual | Pass | Đã cập nhật thông tin qua helper functions trong [db.js](file:///c:/project-ai/flash-card-japanese-AI/src/services/db.js). |

---

## Automated Tests

```bash
node scripts/check-db.js
```

**Kết quả**:
```
=== KIỂM TRA KẾT NỐI DATABASE SUPABASE ===
Supabase URL: https://esbareagmqeyswznwfwa.supabase.co
Supabase Anon Key: sb_publish... (Độ dài: 46)

Đang gửi truy vấn thử tới bảng "lessons"...

[Thành công] Kết nối tới database Supabase hoàn tất! (HTTP Status: 200)
Dữ liệu bài học lấy được:
┌─────────┬────┬────────────┬───────┐
│ (index) │ id │ name       │ level │
├─────────┼────┼────────────┼───────┤
│ 0       │ 1  │ 'Lesson 1' │ 'N5'  │
│ 1       │ 2  │ 'Lesson 2' │ 'N5'  │
└─────────┴────┴────────────┴───────┘
```

---

## Manual Test Steps

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| T-01 | Chạy script kiểm tra kết nối: `node scripts/check-db.js` | Trạng thái báo kết nối mạng và API Key thành công (HTTP 200). | Kết nối thành công, hiển thị bảng dữ liệu Lesson 1 & Lesson 2 từ DB. | Pass |
| T-02 | Khởi chạy dev server (`npm run dev`), truy cập màn hình Cấu hình học tập | Spinner tải tắt, danh sách bài học (Lesson 1, Lesson 2) được hiển thị động. | Tải động chính xác danh sách bài học và cho phép tick chọn. | Pass |
| T-03 | Truy cập Danh sách học tập (click vào một bài học), nhập từ khóa tìm kiếm | Các thẻ từ của bài học được hiển thị. Tìm kiếm realtime tự động lọc sau 300ms. | Hiển thị đầy đủ danh sách, tìm kiếm realtime nhạy và không lag. | Pass |
| T-04 | Nhấn toggle icon Yêu thích (Star) hoặc Đã thuộc (Checkmark) trên thẻ từ vựng | Trạng thái hiển thị cập nhật ngay lập tức. Tải lại trang (F5) vẫn giữ nguyên trạng thái vừa đổi. | Lưu thành công xuống bảng `vocabularies`/`sentences` trên Supabase. | Pass |
| T-05 | Chọn cấu hình học tập, bấm "Bắt đầu học ngay", click xoay thẻ và chọn "Đã thuộc"/"Chưa thuộc" | Thẻ xoay 3 mặt 3D mượt mà. Đánh giá chớp màn hình xanh/đỏ, chuyển thẻ và reset thẻ mới về mặt 1. Trạng thái được đồng bộ xuống DB. Kết thúc hiện màn hình Congrats. | Xoay 3 mặt 3D đúng chuẩn, chớp màu phản hồi thị giác tốt, lưu trạng thái DB thời gian thực. | Pass |

**Test environment**: local / dev  
**Test data**: Bộ dữ liệu test 3 mặt được chèn tự động qua script [schema.sql](file:///c:/project-ai/flash-card-japanese-AI/docs/tasks/SUPABASE-001/schema.sql) gồm 2 bài học, 5 từ vựng/hán tự và 2 mẫu câu.  
**Test account**: public / anonymous (Single-user shared mode)  

---

## Issues phát hiện khi test

Không phát hiện issue nào.

---

## Sign-off

- [x] **Dev self-review**: Code đáp ứng tất cả AC
- [ ] **QA review** (nếu có): [Name] — [YYYY-MM-DD]
- [ ] **BA acceptance** (nếu cần): [Name] — [YYYY-MM-DD]

**Ghi chú sign-off**: Không có exception hay lỗi tồn đọng.

---
<!-- Tạo bởi /dev:implement. Sau khi pass, chạy /dev:pr để tạo PR. -->
