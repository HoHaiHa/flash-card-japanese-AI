---
sessionId: UI-ENHANCE-002-20260530-1520
createdAt: 2026-05-30 15:20 JST
updatedAt: 2026-05-30 15:20 JST
commitSha: draft
roundCount: 0
lang: vi
---

# Cải tiến layout nút lọc, tái cấu trúc mẫu câu và tách âm On/Kun Kanji

**Task ID**: UI-ENHANCE-002  
**Ngày tạo**: 2026-05-30  
**BA**: Antigravity  
**Trạng thái**: Draft  
**Lane**: high-risk — _(xem `docs/risk-classifier.md`)_

---

## 1. Bối cảnh & Vấn đề

Từ các phản hồi kiểm nghiệm UI từ phía người dùng, ba vấn đề sau được xác định cần xử lý để nâng cấp trải nghiệm học tập:
1. **Nút lọc nhanh bị tràn dòng**: Màn hình Flashcard Study chứa 3 nút lọc nhanh: "Chưa thuộc", "Ngẫu nhiên", "Yêu thích". Khi kích hoạt đồng thời, do tổng độ rộng lớn nên chúng bị ngắt dòng xuống dưới, gây lệch layout UI.
2. **Hành vi nút "Ngẫu nhiên" chưa đúng**: Hiện tại nút "Ngẫu nhiên" hoạt động như một nút kích hoạt (trigger button) xáo trộn bài học một lần. Yêu cầu đúng là chuyển thành một tuỳ chọn bật/tắt (toggle state option) giống hai nút còn lại. Khi bật, danh sách thẻ được xáo trộn; khi tắt, danh sách thẻ quay về thứ tự mặc định của bài học.
3. **Cấu trúc thẻ Mẫu câu chưa tối ưu**: Thẻ mẫu câu (Sentence Card) hiện hiển thị câu ví dụ ở mặt 1. Yêu cầu mới là:
   - Mặt 1: Hiển thị cấu trúc ngữ pháp (`card.details`).
   - Mặt 2: Hiển thị câu ví dụ tiếng Nhật (`card.kanji` / `card.kana`) và ý nghĩa tiếng Việt (`card.definition`).
   - Mặt 3: Hiển thị phân tích các trợ từ và thành phần câu (`card.components`).
4. **Tách biệt âm On và âm Kun trong thẻ Kanji**: Hiện tại, thẻ chữ Hán hiển thị chung `On/Kun: {card.kana}`. Cần tách thành 2 trường riêng biệt: "Âm On (On'yomi)" và "Âm Kun (Kun'yomi)" để người học dễ phân biệt. Đồng thời phần giải thích ý nghĩa bộ thủ và cách kết hợp tạo nghĩa của chữ cần được viết chi tiết hơn, có chiều sâu hơn.

## 2. Mục tiêu

- Tùy chỉnh CSS để 3 nút lọc nhanh tự động co giãn kích thước, giảm padding hoặc hiển thị co giãn trên 1 hàng ngang, tuyệt đối không bị tràn dòng.
- Chuyển đổi "Ngẫu nhiên" thành một trạng thái toggle trong state của React, đồng bộ với hai bộ lọc còn lại.
- Tái cấu trúc cấu slide hiển thị của thẻ mẫu câu (Sentence card) thành 3 mặt theo đúng thứ tự: Cấu trúc ngữ pháp → Câu ví dụ & Ý nghĩa → Phân tích trợ từ.
- Bổ sung 2 cột `onyomi` và `kunyomi` vào bảng `vocabularies`.
- Viết lại câu chuyện mnemonics giải thích bộ thủ và logic chữ dài hơn, sâu sắc hơn cho các thẻ chữ Hán.

## 2b. Ràng buộc thiết kế & triển khai

| Loại | Ràng buộc | Lý do |
|------|-----------|-------|
| Kỹ thuật | Phải thực hiện migration thêm cột `onyomi`, `kunyomi` vào bảng `vocabularies` trên Supabase. | Yêu cầu nghiệp vụ phân tách rõ hai cách đọc Hán tự. |
| Giao diện | Không được dùng Tailwind, toàn bộ UI điều chỉnh qua CSS trong [App.css](file:///c:/project-ai/flash-card-japanese-AI/src/App.css). | Quy chuẩn công nghệ của dự án. |

## 3. Phạm vi

### Trong phạm vi (In scope)
- Thay đổi cấu trúc bảng database `vocabularies` trên Supabase (thêm cột `onyomi`, `kunyomi`).
- Thay đổi code ánh xạ dữ liệu trong [db.js](file:///c:/project-ai/flash-card-japanese-AI/src/services/db.js).
- Sửa đổi component [FlashcardStudy.jsx](file:///c:/project-ai/flash-card-japanese-AI/src/components/FlashcardStudy.jsx) (nút Ngẫu nhiên toggle, layout Slide Sentence Card, layout Slide Kanji Card với On/Kun tách biệt).
- Cập nhật styling trong [App.css](file:///c:/project-ai/flash-card-japanese-AI/src/App.css).

### Ngoài phạm vi (Out of scope)
- Thay đổi các bảng database khác không liên quan.

## 8. Acceptance Criteria

- [ ] AC-001: 3 nút lọc nhanh trên màn hình Flashcard hiển thị thẳng hàng trên một hàng ngang, không bị xuống dòng trên màn hình mobile (max-width 480px).
- [ ] AC-002: Nút "Ngẫu nhiên" hoạt động như một nút Toggle (đổi trạng thái active/inactive). Khi bật, xáo trộn thẻ học; khi tắt, trả thẻ về thứ tự ban đầu.
- [ ] AC-003: Thẻ mẫu câu hiển thị chính xác: Mặt 1 (Cấu trúc ngữ pháp) → Mặt 2 (Câu ví dụ & Ý nghĩa) → Mặt 3 (Phân tích trợ từ).
- [ ] AC-004: Thẻ chữ Hán hiển thị phân biệt rõ ràng hai dòng "Âm On (On'yomi)" và "Âm Kun (Kun'yomi)" ở mặt trước.
- [ ] AC-005: Dữ liệu phân tích bộ thủ và liên tưởng chữ Hán có độ dài phân tích đầy đủ chi tiết, giải nghĩa rõ rệt các bộ thành phần.

## 9. Non-functional Requirements

| NFR-ID | Loại | Tiêu chí | Độ ưu tiên |
|--------|------|----------|------------|
| NFR-001 | Performance | Khi tắt/bật xáo trộn ngẫu nhiên, card index reset về 0 và chuyển đổi tức thì không gây giật màn hình. | Must Have |
| NFR-002 | Compatibility | CSS co giãn tự động tốt trên màn hình hẹp (320px - 480px). | Must Have |
