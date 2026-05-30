# Analysis: SUPABASE-002

## Risk Classification — SUPABASE-002

**Input type**: spec-slice
**Risk checklist**: R-08 ✅ (Thay đổi nhiều màn hình), R-09 ✅ (Chưa có test coverage cho area bị ảnh hưởng)
**Lane**: normal
**Lý do**: Thay đổi cấu trúc và logic lưu trữ cấu hình, kết quả của nhiều màn hình (Config và Flashcard) và bổ sung bảng cơ sở dữ liệu mới trên Supabase. Chưa có test coverage sẵn có cho db.js.

---

## Phương án đã chọn: Phương án A (Settings: LocalStorage, History: Supabase)

**Lý do chọn**: 
1. **Tránh ghi đè cấu hình**: Hệ thống hoạt động ở chế độ Single-user / Shared database (không có Auth). Nếu lưu cấu hình học tập của người dùng lên Supabase, thay đổi cấu hình của một người dùng sẽ làm thay đổi cấu hình của toàn bộ những người dùng khác truy cập ứng dụng. Lưu cấu hình học tập ở LocalStorage đảm bảo tính cá nhân hóa cho từng thiết bị.
2. **Lưu trữ lịch sử học tập dài hạn**: Lưu tổng quát lịch sử học tập (số từ thuộc, chưa thuộc, thời gian học) lên bảng `study_sessions` của Supabase giúp người học theo dõi tiến độ tổng thể mà không bị giới hạn bởi bộ nhớ đệm của trình duyệt.
3. **Hiệu suất & Độc lập**: LocalStorage hoạt động đồng thì và có thời gian phản hồi cực nhanh (< 5ms), giúp giao diện mượt mà hơn khi khởi động ứng dụng.

---

## Database Schema Design cho bảng mới

### Bảng `study_sessions` (Lịch sử học tập)
*   `id`: `BIGINT` (Primary Key, Identity) - Mã phiên học.
*   `total_cards`: `INTEGER` (Not Null) - Tổng số thẻ có trong phiên.
*   `learned_count`: `INTEGER` (Not Null) - Số thẻ đánh giá "Đã thuộc".
*   `forgot_count`: `INTEGER` (Not Null) - Số thẻ đánh giá "Chưa thuộc".
*   `created_at`: `TIMESTAMPTZ` (Default `now()`, Not Null) - Thời gian lưu lịch sử.

### RLS Policy:
```sql
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for study_sessions" ON study_sessions
    FOR ALL USING (true);
```

---

## Files sẽ thay đổi

| File | Loại thay đổi | Ghi chú |
|------|--------------|---------|
| [docs/tasks/SUPABASE-002/schema.sql](file:///c:/project-ai/flash-card-japanese-AI/docs/tasks/SUPABASE-002/schema.sql) | [NEW] | Bản script SQL thiết lập bảng `study_sessions` và RLS policy để chạy DDL trên Supabase. |
| [src/services/db.js](file:///c:/project-ai/flash-card-japanese-AI/src/services/db.js) | [MODIFY] | Thêm các hàm `getStudySettings()`, `saveStudySettings()`, `saveSessionResult(sessionData)`. |
| [src/components/LearningConfig.jsx](file:///c:/project-ai/flash-card-japanese-AI/src/components/LearningConfig.jsx) | [MODIFY] | Load cấu hình cũ từ local storage khi khởi tạo và lưu cấu hình khi bấm bắt đầu. |
| [src/components/FlashcardStudy.jsx](file:///c:/project-ai/flash-card-japanese-AI/src/components/FlashcardStudy.jsx) | [MODIFY] | Gọi hàm `saveSessionResult()` lưu tiến độ tự động khi hoàn thành toàn bộ các thẻ. |
| [docs/api/lessons/list.md](file:///c:/project-ai/flash-card-japanese-AI/docs/api/lessons/list.md) | [NEW] | Đặc tả API tải danh sách bài học. |
| [docs/api/vocab/list.md](file:///c:/project-ai/flash-card-japanese-AI/docs/api/vocab/list.md) | [NEW] | Đặc tả API tải danh sách từ vựng của bài học. |
| [docs/api/vocab/favorite.md](file:///c:/project-ai/flash-card-japanese-AI/docs/api/vocab/favorite.md) | [NEW] | Đặc tả API toggle yêu thích. |
| [docs/api/vocab/master.md](file:///c:/project-ai/flash-card-japanese-AI/docs/api/vocab/master.md) | [NEW] | Đặc tả API toggle trạng thái thuộc bài. |
| [docs/api/user/settings.md](file:///c:/project-ai/flash-card-japanese-AI/docs/api/user/settings.md) | [NEW] | Đặc tả cấu trúc lưu trữ và đọc settings. |
| [docs/api/session/start.md](file:///c:/project-ai/flash-card-japanese-AI/docs/api/session/start.md) | [NEW] | Đặc tả API khởi tạo phiên học (nạp thẻ của nhiều bài học). |
| [docs/api/session/history.md](file:///c:/project-ai/flash-card-japanese-AI/docs/api/session/history.md) | [NEW] | Đặc tả API lưu lịch sử phiên học. |

---

## Những phương án khác đã cân nhắc và lý do không chọn

- **Phương án B: Lưu tất cả trên Supabase (Settings & History)**
  - *Lý do không chọn*: Do hệ thống không sử dụng đăng nhập (Auth), việc ghi cấu hình học tập chung lên Supabase sẽ dẫn đến tình trạng conflict nghiêm trọng: người dùng này đổi cài đặt (ví dụ: chuyển từ học từ vựng sang chỉ học hán tự) sẽ vô tình thay đổi giao diện của toàn bộ những người dùng khác khi họ mở app.
- **Phương án C: Chỉ lưu LocalState không lưu DB**
  - *Lý do không chọn*: Lịch sử học tập cần được lưu giữ dài hạn để vẽ biểu đồ và phân tích về sau. Nếu chỉ lưu ở React State hoặc LocalStorage thì khi người học clear cache trình duyệt sẽ mất toàn bộ tiến trình lịch sử học tập.

---

## Kế hoạch kiểm thử (Test Plan)

### Automated Tests
- Viết Unit Tests ( Vitest / Jest ) kiểm thử độc lập file `db.js`.
- Mock API Supabase client để kiểm tra các hàm:
  - `getLessons()` trả về đúng định dạng bài học.
  - `getCardsForLesson(lessonId)` trả về đúng các thẻ mapped.
  - `updateCardFavorite()` và `updateCardStatus()` gửi đúng tham số cập nhật.
  - `saveSessionResult()` thực hiện insert bản ghi thành công.
  - `getStudySettings()` và `saveStudySettings()` đọc ghi đúng LocalStorage.

### Manual Verification
1. Mở màn hình Cấu hình, chọn Hướng dịch là "Việt -> Nhật", chọn "Từ vựng" + "Hán tự", chọn "Bài 1", click "Bắt đầu học ngay". F5 tải lại trang -> Các lựa chọn cấu hình trên phải được tự động điền sẵn.
2. Hoàn thành một phiên học flashcard ngắn (đánh dấu thuộc/chưa thuộc cho tất cả các thẻ). Khi màn hình chúc mừng hiện ra, kiểm tra trên Supabase Dashboard xem bảng `study_sessions` có nhận được bản ghi lưu số lượng từ đã chọn chính xác hay không.
