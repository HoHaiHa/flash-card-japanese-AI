---
sessionId: STITCH-001-20260524-1610
createdAt: 2026-05-24 16:10 JST
updatedAt: 2026-05-24 16:10 JST
commitSha: [short-sha]
roundCount: 1
lang: vi
---

# Học thẻ tiếng Nhật (3-sided Flashcard)

**Task ID**: STITCH-001  
**Ngày tạo**: 2026-05-24  
**BA**: Antigravity  
**Trạng thái**: Draft  
**Lane**: normal — _(xem `docs/risk-classifier.md`)_

---

## 1. Bối cảnh & Vấn đề

Học từ vựng tiếng Nhật, đặc biệt là chữ Hán (Kanji), đòi hỏi người học phải nhớ cả mặt chữ, cách đọc (Furigana), âm Hán Việt và nghĩa của từ. Hầu hết các ứng dụng flashcard hiện nay chỉ hỗ trợ thẻ 2 mặt (Kanji ở mặt trước, phiên âm và nghĩa ở mặt sau), bỏ qua việc giải thích âm Hán Việt và các bộ thủ cấu thành. Điều này làm giảm hiệu quả ghi nhớ có hệ thống của người học Việt Nam. Do đó, dự án cần xây dựng tính năng học thẻ 3 mặt xoay 3D độc đáo để hỗ trợ học tập toàn diện.

## 2. Mục tiêu

- Giúp người học cấu hình phiên học tập linh hoạt theo nhu cầu (chọn hướng dịch, nội dung học, bài học).
- Cung cấp danh sách từ vựng chi tiết, dễ dàng quản lý trạng thái học tập (thuộc/chưa thuộc, yêu thích).
- Triển khai thành công thẻ Flashcard 3 mặt xoay 3D mượt mà để tăng hiệu quả ghi nhớ từ vựng.

## 2b. Ràng buộc thiết kế & triển khai

| Loại | Ràng buộc | Lý do |
|------|-----------|-------|
| Kỹ thuật | Phải viết bằng HTML5/CSS3 thuần và JavaScript. Không dùng framework UI nặng nếu không cần thiết. | Đảm bảo hiệu suất xoay 3D mượt mà trên thiết bị di động |
| Giao diện | Tuân thủ chính xác hệ thống màu sắc và kiểu chữ trong [DESIGN.md](file:///c:/project-ai/flash-card-japanese-AI/docs/screens/assets/stitch_nihongo_flashcard_master/seishun_learning/DESIGN.md) | Đồng bộ nhận diện thương hiệu Seishun Learning |
| Trải nghiệm | Thời gian xoay thẻ không vượt quá 0.6s; các thao tác click phải phản hồi tức thì | Đảm bảo tính liền mạch trong Cognitive Flow |

## 3. Phạm vi

### Trong phạm vi (In scope)
- Màn hình cấu hình học tập (hướng dịch, chọn nội dung học, bài học).
- Màn hình danh sách học tập (tab từ vựng, mẫu câu, Hán tự; tìm kiếm; lọc; toggle yêu thích/đã thuộc).
- Màn hình học thẻ 3 mặt xoay 3D với 3 trạng thái mặt thẻ và các nút đánh giá thuộc/chưa thuộc.

### Ngoài phạm vi (Out of scope)
- Tải file âm thanh phát âm từ vựng.
- Tự tạo thẻ flashcard tùy chỉnh (Custom Flashcard).
- Tính năng thống kê tiến độ học dạng biểu đồ (Dashboard phân tích chi tiết).

## 4. Actors & Use Cases

| Actor | Use Case | Mô tả |
|-------|----------|-------|
| Học viên | Cấu hình phiên học | Chọn hướng dịch, nội dung, bài học để bắt đầu học |
| Học viên | Xem & tìm kiếm từ vựng | Tra cứu danh sách từ vựng theo cấp độ và trạng thái học |
| Học viên | Luyện tập thẻ 3 mặt | Lật thẻ để xem thông tin Kanji, Âm Hán, Nghĩa và đánh giá mức độ ghi nhớ |

## 5. Business Rules

| ID | Rule | Ghi chú |
|----|------|---------|
| BR-001 | Thẻ flashcard phải hỗ trợ xoay 3 mặt tuần tự bằng cách nhấp chuột/chạm: Mặt 1 (Chữ Hán) -> Mặt 2 (Âm Hán & Bộ thủ) -> Mặt 3 (Nghĩa & Ví dụ) -> Quay lại Mặt 1. | Sử dụng CSS 3D Prism logic |
| BR-002 | Khi người dùng nhấn "Đã thuộc" hoặc "Chưa thuộc", hệ thống lưu kết quả học, chớp màu nền (xanh lá cây cho Đã thuộc, đỏ cho Chưa thuộc), reset thẻ về Mặt 1 và chuyển sang thẻ tiếp theo. | Phản hồi xúc giác/thị giác |
| BR-003 | Hỗ trợ 3 nút lọc nhanh phiên học: "Chưa thuộc" (lọc từ chưa thuộc), "Ngẫu nhiên" (trộn danh sách thẻ), "Yêu thích" (lọc từ yêu thích). | Lọc nhanh realtime |
| BR-004 | Hướng dịch mặc định là "Nhật → Việt". Màn hình danh sách học tập hiển thị tab mặc định là "Từ vựng". | Cài đặt mặc định |

## 6. Luồng nghiệp vụ chính (Happy Path)

1. Người dùng truy cập màn hình Cấu hình học tập (`/study/config`).
2. Chọn hướng dịch, tích chọn nội dung học, chọn các bài học mong muốn và nhấn "Bắt đầu học ngay".
3. Hệ thống khởi tạo phiên học và chuyển hướng đến trang Học thẻ 3 mặt (`/study/flashcard`).
4. Người dùng click vào thẻ để xoay qua các mặt (Kanji -> Âm Hán -> Nghĩa tiếng Việt).
5. Nhấn "Đã thuộc" hoặc "Chưa thuộc" để hoàn thành đánh giá cho từ đó.
6. Hệ thống hiển thị hiệu ứng chớp màu, đổi thẻ mới.
7. Khi hết bộ thẻ, hệ thống hiển thị màn hình chúc mừng kết thúc phiên.

## 7. Luồng thay thế & Exception

| Trường hợp | Xử lý |
|-----------|-------|
| Người dùng chưa chọn nội dung hoặc bài học nào ở cấu hình | Nút "Bắt đầu học ngay" bị vô hiệu hóa và hiển thị thông báo lỗi yêu cầu chọn nội dung học/bài học |
| Bộ lọc "Chưa thuộc" hoặc "Yêu thích" không có dữ liệu | Hiển thị màn hình trống (Empty State) với nội dung "Không có từ vựng nào trong danh mục này" |

## 8. Acceptance Criteria

- [ ] AC-001: Người dùng cấu hình thành công và vào được phiên học thẻ 3 mặt.
- [ ] AC-002: Thẻ flashcard xoay mượt mà qua đúng 3 mặt theo thứ tự mà không bị lệch hình ảnh hay vỡ layout.
- [ ] AC-003: Trạng thái thuộc/chưa thuộc và yêu thích được cập nhật tức thì trên local state/database khi bấm nút tương ứng.
- [ ] AC-004: Giao diện hiển thị đúng chuẩn thiết kế Seishun Learning (phông chữ Inter, màu sắc Primary Blue, Success Green, Error Red).

## 9. Non-functional Requirements

| NFR-ID | Loại | Tiêu chí | Độ ưu tiên |
|--------|------|----------|------------|
| NFR-001 | Performance | Hiệu ứng xoay 3D thẻ đạt mức 60 FPS trên thiết bị di động | Must Have |
| NFR-002 | Security | API lưu tiến độ học tập bắt buộc phải đính kèm JWT Token để xác thực | Must Have |
| NFR-003 | Compatibility | Giao diện hiển thị tốt trên cả màn hình di động (mobile responsive >= 320px) và desktop | Must Have |

## 10. User Stories

| ID | Tên | Priority | Estimate | Link |
|----|-----|----------|----------|------|
| US-001 | Cấu hình phiên học tập | High | 3 SP | [US-001.md](file:///c:/project-ai/flash-card-japanese-AI/docs/tasks/STITCH-001/US-001.md) |
| US-002 | Quản lý và tra cứu danh sách học tập | Medium | 5 SP | [US-002.md](file:///c:/project-ai/flash-card-japanese-AI/docs/tasks/STITCH-001/US-002.md) |
| US-003 | Học từ vựng với thẻ Flashcard 3 mặt xoay 3D | High | 8 SP | [US-003.md](file:///c:/project-ai/flash-card-japanese-AI/docs/tasks/STITCH-001/US-003.md) |

## 11. Câu hỏi mở (Open Questions)

| ID | Câu hỏi | Người trả lời | Deadline | Status |
|----|---------|---------------|----------|--------|
| Q-001 | Tiến độ phiên học có cần đồng bộ realtime lên DB sau mỗi từ, hay chỉ lưu khi người dùng nhấn "Back" hoặc hoàn thành phiên học? | Lead Developer | Sprint Planning | Open |

## 12. Harness Delta

- [ ] Không có friction phát hiện trong task này

## 13. Q&A History

### Round 1 — 2026-05-24 16:10 JST
*(Chờ các phản hồi và quyết định tiếp theo từ user)*
