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

## Những phương án đã cân nhắc và lý do không chọn
- **Phương án A: Gọi trực tiếp inline trong Component**  
  *Lý do không chọn*: Làm các component phình to, lặp lại code kết nối và ánh xạ dữ liệu (mapping). Trộn lẫn code UI với API Client làm giảm khả năng kiểm thử (Unit Test) và khó nâng cấp codebase.

## Câu hỏi mở còn lại
Không có.
