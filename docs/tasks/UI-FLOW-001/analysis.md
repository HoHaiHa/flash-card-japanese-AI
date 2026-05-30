# Analysis: UI-FLOW-001

## Risk Classification — UI-FLOW-001

**Input type**: spec-slice
**Risk checklist**: R-09 ✅ (Chưa có test coverage cho area bị ảnh hưởng)
**Lane**: normal
**Lý do**: Thay đổi sâu logic render hiển thị và lật thẻ 3 mặt của Flashcard trên màn hình học chính, không có test coverage sẵn có cho component UI.

---

## Phương án đã chọn: Phương án A (Viết hàm renderCardFaces có điều kiện)

**Lý do chọn**:
1.  **Đảm bảo animation hoạt động ổn định**: Swiper.js yêu cầu các thẻ con trực tiếp của Swiper phải là `SwiperSlide`. Nếu tách ra thành các component con, cấu trúc slide có thể bị vỡ hoặc mất hiệu ứng cube 3D.
2.  **Rõ ràng & Dễ kiểm soát**: Hàm `renderCardFaces` tập trung toàn bộ logic biểu diễn dữ liệu của 3 loại thẻ học và hướng dịch ở cùng một chỗ, dễ bảo trì.
3.  **Tách biệt logic**: Tránh làm phình to render block chính của component `FlashcardStudy`.

---

## Files sẽ thay đổi

| File | Loại thay đổi | Ghi chú |
|------|--------------|---------|
| [src/components/FlashcardStudy.jsx](file:///c:/project-ai/flash-card-japanese-AI/src/components/FlashcardStudy.jsx) | [MODIFY] | Triển khai hàm `renderCardFaces` và liên kết với phần render của Swiper. |

---

## Các phương án khác đã cân nhắc và lý do không chọn

- **Phương án B: Tách nhỏ thành 3 component Card con riêng biệt**
  - *Lý do không chọn*: Tiềm ẩn rủi ro hỏng hiệu ứng xoay lật cube 3D của Swiper do cấu trúc slide bị lồng gián tiếp qua các React custom components. Swiper.js yêu cầu `SwiperSlide` phải là direct children của `Swiper`.

---

## Kế hoạch kiểm thử (Test Plan)

### Automated Tests
- Do dự án chưa thiết lập môi trường test UI component (như React Testing Library / Cypress), kiểm thử tự động cho màn hình này sẽ tạm thời nằm ngoài phạm vi.

### Manual Verification
1.  **Kiểm chứng Thẻ Từ vựng (Vocab) - Nhật -> Việt**:
    *   Cấu hình: Chọn "Nhật -> Việt", chọn bài học có từ vựng.
    *   Mặt 1: Từ vựng Kanji/Kana.
    *   Mặt 2: Nghĩa tiếng Việt.
    *   Mặt 3: Câu ví dụ tiếng Nhật và câu dịch nghĩa.
2.  **Kiểm chứng Thẻ Từ vựng (Vocab) - Việt -> Nhật**:
    *   Cấu hình: Chọn "Việt -> Nhật", chọn bài học có từ vựng.
    *   Mặt 1: Nghĩa tiếng Việt.
    *   Mặt 2: Từ vựng Kanji/Kana.
    *   Mặt 3: Câu ví dụ tiếng Nhật và câu dịch nghĩa.
3.  **Kiểm chứng Thẻ Mẫu câu (Sentence)**:
    *   Cấu hình: Chọn học "Mẫu câu".
    *   Xác nhận: Mặt 1 hiển thị câu chính, mặt 2 hiển thị nghĩa và ngữ pháp, mặt 3 hiển thị ví dụ chi tiết. Hướng dịch không làm đổi trật tự 3 mặt này.
4.  **Kiểm chứng Thẻ Hán tự (Kanji)**:
    *   Cấu hình: Chọn học "Hán tự".
    *   Xác nhận: Mặt 1 hiển thị chữ Hán và On/Kun, mặt 2 hiển thị nghĩa Hán Việt, mặt 3 hiển thị bộ thủ. Hướng dịch không làm đổi trật tự 3 mặt này.
