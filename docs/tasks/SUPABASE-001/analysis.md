# Analysis: SUPABASE-001

## Risk Classification — SUPABASE-001

**Input type**: new-spec
**Risk checklist**: R-03 ✅ (Tích hợp external provider mới - Supabase), R-06 ✅ (Cấu hình shared config/env), R-08 ✅ (Thay đổi nhiều màn hình), R-09 ✅ (Chưa có test coverage)
**Lane**: high-risk
**Lý do**: Tích hợp với dịch vụ cơ sở dữ liệu cloud bên ngoài (Supabase) và thay đổi toàn bộ cơ chế lưu trữ dữ liệu mock sang dữ liệu động.

---

## Phương án đã chọn: Phương án B: Tách lớp DB Service (db.js)
**Lý do**: Ưu tiên tính dễ bảo trì (Maintainability) và phân tách rõ ràng trách nhiệm giữa giao diện hiển thị (UI) và nghiệp vụ kết nối dữ liệu (DB Service). Cho phép tái sử dụng code mapping và dễ dàng mock khi viết Unit Test.

## Files sẽ thay đổi

| File | Loại thay đổi | Ghi chú |
|------|--------------|---------|
| [package.json](file:///c:/project-ai/flash-card-japanese-AI/package.json) | [MODIFY] | Thêm thư viện `@supabase/supabase-js` vào dependencies. |
| [schema.sql](file:///c:/project-ai/flash-card-japanese-AI/docs/tasks/SUPABASE-001/schema.sql) | [NEW] | Chứa câu lệnh SQL khởi tạo bảng, thiết lập RLS policy công khai và seed data. (Đã tạo) |
| [.env.example](file:///c:/project-ai/flash-card-japanese-AI/.env.example) | [NEW] | Mẫu cấu hình biến môi trường kết nối Supabase. (Đã tạo) |
| [.env](file:///c:/project-ai/flash-card-japanese-AI/.env) | [NEW] | File chứa cấu hình URL và API Key thực tế để chạy local. |
| [src/supabaseClient.js](file:///c:/project-ai/flash-card-japanese-AI/src/supabaseClient.js) | [NEW] | Khởi tạo Supabase client sử dụng biến môi trường. |
| [src/services/db.js](file:///c:/project-ai/flash-card-japanese-AI/src/services/db.js) | [NEW] | Helper functions truy vấn và cập nhật dữ liệu. |
| [src/components/LearningConfig.jsx](file:///c:/project-ai/flash-card-japanese-AI/src/components/LearningConfig.jsx) | [MODIFY] | Nạp động danh sách bài học từ Supabase. |
| [src/components/StudyList.jsx](file:///c:/project-ai/flash-card-japanese-AI/src/components/StudyList.jsx) | [MODIFY] | Truy vấn danh sách từ vựng/mẫu câu/chữ hán từ DB và đồng bộ trạng thái học tập thời gian thực. |
| [src/components/FlashcardStudy.jsx](file:///c:/project-ai/flash-card-japanese-AI/src/components/FlashcardStudy.jsx) | [MODIFY] | Truy vấn danh sách thẻ học theo cấu hình đã chọn và đồng bộ trạng thái học tập từ phiên học. |

## Database Schema Design

Sau khi phân tích các màn hình học tập, cấu trúc thực thể (Entity) được thiết lập thành 3 bảng riêng biệt trên Supabase để khớp hoàn toàn với code [db.js](file:///c:/project-ai/flash-card-japanese-AI/src/services/db.js) hiện tại:

### 1. Bảng `lessons` (Bài học)
* Lưu trữ danh sách bài học và cấp độ JLPT mặc định của bài học.
* Các trường:
  * `id`: `BIGINT` (Primary Key, Identity) - Mã bài học.
  * `name`: `TEXT` (Not Null) - Tên bài học (ví dụ: "Lesson 1").
  * `level`: `TEXT` (Not Null) - Cấp độ mặc định (ví dụ: "N5").
  * `created_at`: `TIMESTAMPTZ` (Default `now()`) - Thời gian tạo.

### 2. Bảng `vocabularies` (Từ vựng & Chữ Hán)
* Lưu trữ các từ vựng (type = `'vocab'`) hoặc chữ Hán (type = `'kanji'`) liên quan đến bài học.
* Các trường:
  * `id`: `TEXT` (Primary Key) - Lưu mã định danh dạng chuỗi (e.g., `'v1'`, `'k1'`) để giữ đồng bộ dữ liệu cũ.
  * `lesson_id`: `BIGINT` (Foreign Key -> `lessons.id` ON DELETE CASCADE) - ID bài học liên kết.
  * `level`: `TEXT` - Cấp độ (N5, N4, N3, v.v.).
  * `kana`: `TEXT` (Not Null) - Phiên âm Furigana/Kana.
  * `kanji`: `TEXT` (Not Null) - Chữ Kanji hoặc chữ Hiragana gốc.
  * `sino_vietnamese`: `TEXT` - Âm Hán Việt (ví dụ: 'CỐ GẮNG / NỖ LỰC').
  * `details`: `TEXT` - Tiêu đề chi tiết/âm Hán bổ sung (ví dụ: 'Chữ Hán: MIỄN').
  * `components`: `JSONB` (Default `'[]'`) - Mảng các bộ thủ cấu thành (ví dụ: `[{"char": "力", "meaning": "Bộ Lực"}]`).
  * `definition`: `TEXT` (Not Null) - Nghĩa tiếng Việt.
  * `example_jp`: `TEXT` - Ví dụ câu tiếng Nhật.
  * `example_vi`: `TEXT` - Dịch ví dụ tiếng Việt.
  * `type`: `TEXT` (CHECK `type IN ('vocab', 'kanji')`) - Loại thẻ.
  * `favorite`: `BOOLEAN` (Default `false`) - Trạng thái yêu thích.
  * `status`: `TEXT` (Default `'forgot'`, CHECK `status IN ('learned', 'forgot')`) - Trạng thái thuộc bài.

### 3. Bảng `sentences` (Mẫu câu)
* Lưu trữ các mẫu câu luyện tập (type = `'sentence'`).
* Các trường tương tự bảng `vocabularies`, ngoại trừ:
  * `type`: `TEXT` (CHECK `type = 'sentence'`).
  * `example_jp`: `TEXT` (Not Null) - Câu tiếng Nhật mẫu (bắt buộc).
  * `example_vi`: `TEXT` (Not Null) - Dịch tiếng Việt mẫu (bắt buộc).

### Chính sách bảo mật & phân quyền (RLS)
* Hệ thống cấu hình **Single-user / Shared mode**, do đó toàn bộ 3 bảng đều được bật RLS và gán policy cho phép mọi người dùng đọc/ghi tự do (`USING (true)`).

---

## Những phương án đã cân nhắc và lý do không chọn
- **Phương án A: Gọi trực tiếp inline trong Component**  
  *Lý do không chọn*: Làm các component phình to, lặp lại code kết nối và ánh xạ dữ liệu (mapping). Trộn lẫn code UI với API Client làm giảm khả năng kiểm thử (Unit Test) và khó nâng cấp codebase.
- **Phương án Gộp bảng (Combined Cards table)**  
  *Lý do không chọn*: Gộp chung cả từ vựng, hán tự, mẫu câu vào 1 bảng duy nhất giúp giảm số lượng bảng nhưng sẽ khiến nhiều trường bị null (như mẫu câu không cần `sino_vietnamese`, `components`), đồng thời đòi hỏi phải refactor lại toàn bộ logic query và map data của file [db.js](file:///c:/project-ai/flash-card-japanese-AI/src/services/db.js).

## Câu hỏi mở còn lại
Không có.

