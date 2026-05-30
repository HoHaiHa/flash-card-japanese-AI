---
sessionId: UI-FLOW-001-20260530-0925
createdAt: 2026-05-30 09:25 JST
updatedAt: 2026-05-30 09:25 JST
commitSha: draft
roundCount: 0
lang: vi
---

# Điều chỉnh luồng hiển thị Thẻ Flashcard 3D theo phân loại và hướng dịch

**Task ID**: UI-FLOW-001  
**Ngày tạo**: 2026-05-30  
**BA**: Antigravity  
**Trạng thái**: Draft  
**Lane**: normal  

---

## 1. Bối cảnh & Vấn đề

Màn hình học Flashcard hiện tại (`FlashcardStudy.jsx`) đang hiển thị cấu trúc 3 mặt thẻ giống nhau cho tất cả các loại thẻ (Từ vựng, Mẫu câu, Hán tự) và không thay đổi theo cấu hình Hướng dịch (Nhật $\rightarrow$ Việt hay Việt $\rightarrow$ Nhật). Điều này không đáp ứng đúng nghiệp vụ học tập:
*   Từ vựng cần thay đổi mặt hiển thị trước/sau dựa trên hướng dịch được chọn.
*   Mẫu câu và Hán tự là các loại thẻ đặc thù, có cấu trúc nội dung 3 mặt riêng biệt không bị ảnh hưởng bởi hướng dịch.

Cần cấu trúc lại logic render 3 mặt thẻ trong `FlashcardStudy.jsx` để tự động chuyển đổi hiển thị dựa theo loại thẻ (`card.type`) và hướng dịch (`config.translationDirection`).

---

## 2. Mục tiêu

- Cấu trúc lại giao diện hiển thị 3 mặt của thẻ trong `FlashcardStudy.jsx` để hỗ trợ 3 layout thẻ học riêng biệt:
  - **Loại 1: Từ vựng (vocab)**: 3 mặt thay đổi theo hướng dịch.
  - **Loại 2: Cấu trúc mẫu câu (sentence)**: 3 mặt cố định (không ảnh hưởng bởi hướng dịch).
  - **Loại 3: Hán tự (kanji)**: 3 mặt cố định (không ảnh hưởng bởi hướng dịch).
- Đảm bảo các hiệu ứng xoay lật 3D hoạt động mượt mà với cấu trúc giao diện mới.

---

## 2b. Ràng buộc thiết kế & triển khai

| Loại | Ràng buộc | Lý do |
|------|-----------|-------|
| Kỹ thuật | Phải giữ nguyên cấu trúc Swiper lồng nhau (`Swiper` ngoài chuyển thẻ, `Swiper` trong hiệu ứng cube xoay 3D) để không làm mất animation 3D hiện tại. | Đảm bảo tính nhất quán của UX. |
| Dữ liệu | Phải sử dụng đúng các trường dữ liệu hiện có trong database Supabase của mỗi loại thẻ để map lên các mặt. | Tránh sửa đổi schema cơ sở dữ liệu đã ổn định. |

---

## 3. Phạm vi

### Trong phạm vi (In scope)
- Sửa đổi file `FlashcardStudy.jsx` để phân tách logic render 3 mặt của thẻ thành 3 cụm component tương ứng với 3 loại thẻ học.
- Tích hợp điều kiện hướng dịch `translationDirection` cho thẻ Loại 1 (Từ vựng).

### Ngoài phạm vi (Out of scope)
- Thay đổi cấu trúc các bảng trên database.
- Thay đổi logic lưu kết quả hay tương tác API.

---

## 4. Actors & Use Cases

| Actor | Use Case | Mô tả |
|-------|----------|-------|
| User (Người học) | Lật thẻ học flashcard | Xem thông tin 3 mặt của thẻ thay đổi thông minh theo đúng phân loại từ và hướng dịch đã cài đặt. |

---

## 5. Business Rules

### BR-001: Thẻ loại 1 - Từ vựng (vocab)
*   **Hướng dịch Nhật -> Việt**:
    *   Mặt 1: Chữ Kanji + Furigana (ví dụ: `勉強する / べんきょうする`).
    *   Mặt 2: Nghĩa tiếng Việt (ví dụ: `Học tập, nghiên cứu`).
    *   Mặt 3: Mẫu câu ví dụ (ví dụ: `毎日日本語を勉強しています。 / Mỗi ngày tôi đều học tiếng Nhật.`).
*   **Hướng dịch Việt -> Nhật**:
    *   Mặt 1: Nghĩa tiếng Việt.
    *   Mặt 2: Chữ Kanji + Furigana.
    *   Mặt 3: Mẫu câu ví dụ.

### BR-002: Thẻ loại 2 - Cấu trúc mẫu câu (sentence)
*   **Cố định không đổi**:
    *   Mặt 1: Câu ví dụ tiếng Nhật chính hiển thị cỡ lớn kèm Furigana.
    *   Mặt 2: Nghĩa tiếng Việt + phân tích trợ từ / cấu trúc ngữ pháp (ví dụ: `一緒に行きましょう。 / Chúng ta cùng đi nhé.` và phân tích trợ từ).
    *   Mặt 3: Cách sử dụng / câu ví dụ bổ sung (tiếng Nhật/tiếng Việt).

### BR-003: Thẻ loại 3 - Hán tự (kanji)
*   **Cố định không đổi**:
    *   Mặt 1: Chữ Kanji chính hiển thị cỡ rất lớn kèm âm On/Kun.
    *   Mặt 2: Nghĩa tiếng Việt (âm Hán Việt + định nghĩa nghĩa Hán).
    *   Mặt 3: Phân tích các bộ thủ cấu thành chữ Hán đó.

---

## 6. Luồng nghiệp vụ chính (Happy Path)

1. Người học cấu hình hướng dịch và loại nội dung, nhấn "Bắt đầu học ngay".
2. Tại màn hình flashcard, hệ thống tải danh sách các thẻ.
3. Khi người dùng click lật thẻ, Swiper 3D thực hiện xoay lật 3 mặt tuần tự hiển thị đúng thông tin của loại thẻ tương ứng theo cấu hình.

---

## 7. Luồng thay thế & Exception

Không có.

---

## 8. Acceptance Criteria

- [ ] AC-001: Màn hình flashcard nhận biết đúng loại thẻ (`card.type`) và render đúng 3 cấu trúc layout tương ứng.
- [ ] AC-002: Thẻ Từ vựng xoay đổi chính xác mặt 1 và mặt 2 theo cấu hình `translationDirection` (Nhật-Việt hay Việt-Nhật).
- [ ] AC-003: Thẻ Mẫu câu hiển thị đúng Câu gốc ở mặt 1, Nghĩa và cấu trúc ở mặt 2, Cách sử dụng ở mặt 3.
- [ ] AC-004: Thẻ Hán tự hiển thị đúng Chữ Hán ở mặt 1, Hán Việt và nghĩa ở mặt 2, Phân tích bộ thủ ở mặt 3.
- [ ] AC-005: Hiệu ứng xoay lật 3D hoạt động trơn tru cho cả 3 loại thẻ học.

---

## 9. Non-functional Requirements

| NFR-ID | Loại | Tiêu chí | Độ ưu tiên |
|--------|------|----------|------------|
| NFR-001 | Performance | Tốc độ render thẻ mượt mà, giữ FPS ổn định ở mức ~60 FPS. | Must Have |

---

## 10. User Stories

| ID | Tên | Priority | Estimate |
|----|-----|----------|----------|
| US-001 | Cấu trúc lại render layout thẻ 3 mặt theo phân loại và hướng dịch | High | 4h |

---

## 11. Câu hỏi mở (Open Questions)

Không có.

---

## 12. Harness Delta

- [x] Không có friction phát hiện trong task này
