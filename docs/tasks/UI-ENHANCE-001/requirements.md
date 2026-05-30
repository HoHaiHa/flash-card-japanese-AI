---
sessionId: UI-ENHANCE-001-20260530-1510
createdAt: 2026-05-30 15:10 JST
updatedAt: 2026-05-30 15:10 JST
commitSha: draft
roundCount: 0
lang: vi
---

# Tích hợp cải tiến UI và phân tích bộ thủ Kanji

**Task ID**: UI-ENHANCE-001  
**Ngày tạo**: 2026-05-30  
**BA**: Antigravity  
**Trạng thái**: Draft  
**Lane**: normal — _(xem `docs/risk-classifier.md`)_

---

## 1. Bối cảnh & Vấn đề

Qua quá trình sử dụng thực tế của người dùng, một số điểm yếu về giao diện và trải nghiệm (UI/UX) đã được phát hiện cần được khắc phục:
1. **Dropdown hướng dịch**: Ô chọn hướng dịch sử dụng thẻ `<select>` mặc định của trình duyệt nên giao diện danh sách tuỳ chọn (options) bị góc cạnh, cứng nhắc, không đồng đều với phong cách thiết kế mượt mà của ứng dụng.
2. **Lọc từ yêu thích trong danh sách từ vựng**: Màn hình danh sách từ vựng của bài học thiếu tuỳ chọn chỉ xem những từ đã đánh dấu yêu thích (favorite), gây khó khăn cho việc ôn tập tập trung các từ quan trọng.
3. **Layout thẻ Kanji trong Flashcard**:
   - Từ Hán tự (Kanji chính) hiển thị quá sát với phần phiên âm cách đọc On/Kun của nó.
   - Thẻ hiển thị bộ thủ chỉ đơn thuần liệt kê các bộ cấu thành mà thiếu đi phần phân tích chi tiết về ý nghĩa của từng bộ thủ, và cách mà ý nghĩa các bộ thủ đó kết hợp lại tạo thành nghĩa của từ Hán tự đó. Điều này cản trở việc học theo phương pháp ghi nhớ liên tưởng (mnemonics).

## 2. Mục tiêu

- Cải tiến dropdown hướng dịch thành một custom dropdown component đẹp mắt, có bo góc, đổ bóng mượt mà, hỗ trợ hiệu ứng hover và animation đóng/mở.
- Thêm filter chip "Yêu thích" vào màn hình [StudyList](file:///c:/project-ai/flash-card-japanese-AI/src/components/StudyList.jsx) song song với "Tất cả" và "Chưa thuộc".
- Tạo khoảng cách hợp lý giữa chữ Kanji chính và On/Kun readings trên mặt trước của thẻ Kanji trong [FlashcardStudy](file:///c:/project-ai/flash-card-japanese-AI/src/components/FlashcardStudy.jsx).
- Bổ sung nội dung phân tích ý nghĩa bộ thủ (radical meaning) và phân tích ý nghĩa từ Hán tự dựa trên bộ thủ (character logic) tại mặt thứ 3 của thẻ Kanji.

## 2b. Ràng buộc thiết kế & triển khai

| Loại | Ràng buộc | Lý do |
|------|-----------|-------|
| Kỹ thuật | Không được thay đổi cấu trúc bảng cơ sở dữ liệu trên Supabase. | Tránh migration phức tạp và rủi ro ảnh hưởng dữ liệu hiện có. Phải giải quyết phần phân tích bộ thủ bằng cách lập bản đồ từ điển tĩnh hoặc sinh động học trên frontend. |
| Giao diện | Phải dùng Vanilla CSS trong [App.css](file:///c:/project-ai/flash-card-japanese-AI/src/App.css), không dùng Tailwind CSS. | Tuân thủ tiêu chuẩn Web Application Development của dự án. |

## 3. Phạm vi

### Trong phạm vi (In scope)
- Sửa đổi component [LearningConfig](file:///c:/project-ai/flash-card-japanese-AI/src/components/LearningConfig.jsx) để chuyển đổi sang custom dropdown.
- Sửa đổi component [StudyList](file:///c:/project-ai/flash-card-japanese-AI/src/components/StudyList.jsx) để bổ sung bộ lọc "Yêu thích".
- Sửa đổi component [FlashcardStudy](file:///c:/project-ai/flash-card-japanese-AI/src/components/FlashcardStudy.jsx) để fix layout hiển thị Kanji và bổ sung phần phân tích ý nghĩa bộ thủ / giải nghĩa chữ Hán theo bộ thủ ở mặt cấu tạo bộ thủ.
- Cập nhật styling trong [App.css](file:///c:/project-ai/flash-card-japanese-AI/src/App.css).

### Ngoài phạm vi (Out of scope)
- Thay đổi schema của bảng `vocabularies` trên cơ sở dữ liệu.
- Viết lại toàn bộ UI framework.

## 4. Actors & Use Cases

| Actor | Use Case | Mô tả |
|-------|----------|-------|
| Học viên | Cấu hình học tập | Chọn hướng dịch thông qua custom dropdown mượt mà. |
| Học viên | Tra cứu danh sách | Lọc các từ vựng đã được đánh dấu yêu thích trong bài học. |
| Học viên | Học flashcard Kanji | Đọc phân tích chi tiết về bộ thủ của chữ Hán tự để dễ nhớ chữ. |

## 5. Business Rules

| ID | Rule | Ghi chú |
|----|------|---------|
| BR-001 | Hướng dịch mặc định vẫn là "Nhật → Việt" (`ja-vi`). | Giữ nguyên trải nghiệm người dùng cũ. |
| BR-002 | Khi đổi hướng dịch bằng custom dropdown, giá trị mới vẫn phải được lưu vào LocalStorage để reload trang không bị mất. | Tương thích ngược với tính năng của SUPABASE-002. |
| BR-003 | Từ điển phân tích bộ thủ cần hỗ trợ đầy đủ giải nghĩa cho các chữ Kanji mẫu hiện có (`勉`, `行`) và có giải thuật hiển thị dự phòng (fallback) tự động cho các chữ Kanji khác được thêm vào sau này. | Đảm bảo tính mở rộng của hệ thống. |

## 6. Luồng nghiệp vụ chính (Happy Path)

1. Người dùng mở trang cấu hình học tập, click vào dropdown chọn "Hướng dịch", danh sách các hướng dịch hiển thị mềm mại. Chọn hướng dịch mong muốn.
2. Người dùng nhấn vào một bài học để xem danh sách từ vựng. Click vào chip "Yêu thích" để chỉ xem danh sách các từ đã star.
3. Người dùng bắt đầu học thẻ Kanji. Tại mặt 1, chữ Kanji hiển thị rõ ràng, cách xa On/Kun. Tại mặt 3, ngoài danh sách các bộ thủ còn hiển thị chi tiết "Phân tích ý nghĩa bộ thủ" và "Ý nghĩa chữ Hán theo bộ thủ".

## 7. Luồng thay thế & Exception

| Trường hợp | Xử lý |
|-----------|-------|
| Chữ Kanji không có thông tin bộ thủ trong DB | Hiển thị thông báo "Không có thông tin bộ thủ". |
| Chữ Kanji không nằm trong từ điển Mnemonics đặc biệt | Sinh phân tích động bằng cách ghép các mô tả bộ thủ hiện có và nghĩa của chữ Hán đó. |

## 8. Acceptance Criteria

- [ ] AC-001: Custom dropdown thay thế thành công thẻ `<select>` trong `LearningConfig` với hiệu ứng mở/đóng, bo góc mượt mà, bóng đổ đẹp mắt, hover màu nền và tự đóng khi click ra ngoài.
- [ ] AC-002: Chip "Yêu thích" hoạt động chính xác trong màn hình `StudyList`, chỉ lọc những từ có `favorite === true` của Tab hiện tại.
- [ ] AC-003: Khoảng cách giữa chữ Kanji chính diện và dòng cách đọc On/Kun được tách rời thoáng mắt (thay vì bị dính sát nhau).
- [ ] AC-004: Mặt 3 của thẻ Kanji hiển thị phân đoạn "Phân tích ý nghĩa bộ thủ" và "Ý nghĩa chữ Hán từ bộ thủ" với các thẻ Kanji trong bài học mẫu (`勉`, `行`).
- [ ] AC-005: Các thay đổi không làm gãy các tính năng cũ (lưu cài đặt cấu hình, đánh dấu thuộc/chưa thuộc, đồng bộ DB).

## 9. Non-functional Requirements

| NFR-ID | Loại | Tiêu chí | Độ ưu tiên |
|--------|------|----------|------------|
| NFR-001 | Performance | Tránh giật lag khi chuyển đổi animation mở/đóng dropdown và lật thẻ Swiper. | Must Have |
| NFR-002 | Compatibility | Hoạt động tốt trên Chrome và Safari mobile. | Must Have |
| NFR-003 | Maintainability | Tránh trùng lặp code và tuân thủ cấu trúc component hiện tại. | Should Have |

## 10. User Stories

| ID | Tên | Priority | Estimate |
|----|-----|----------|----------|
| US-001 | Cải tiến Dropdown hướng dịch | High | 1 man-hour |
| US-002 | Thêm filter yêu thích trong danh sách từ | High | 0.5 man-hour |
| US-003 | Thiết kế lại layout & Mnemonics Kanji | High | 1.5 man-hours |

## 11. Câu hỏi mở (Open Questions)

Không có.

## 12. Harness Delta

- [x] Không có friction phát hiện trong task này
