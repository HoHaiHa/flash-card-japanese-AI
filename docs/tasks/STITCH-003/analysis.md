# Analysis: STITCH-003

## Risk Classification — STITCH-003

**Input type**: spec-slice
**Risk checklist**: R-09 ✅ (Task không có test coverage hiện tại cho area bị ảnh hưởng)
**Lane**: normal
**Lý do**: Triển khai logic xoay thẻ 3D nâng cao và bộ đếm tiến trình học tập chưa có sẵn test coverage.

---

## Phương án đã chọn: Phương án A (CSS 3D Prism Rotation)
**Lý do**: Đáp ứng hoàn hảo các yêu cầu về thẩm mỹ "WOW" của Seishun Learning. Xoay lăng trụ 3D là tính năng cốt lõi tạo nên sự khác biệt cho ứng dụng. Việc có mã nguồn mẫu HTML/CSS trong `code.html` giúp giảm đáng kể công sức nghiên cứu và đảm bảo tính khả thi cao khi thực hiện.

## Files sẽ thay đổi

| File | Loại thay đổi | Ghi chú |
|------|--------------|---------|
| `src/components/FlashcardStudy.jsx` | [MODIFY] | Triển khai giao diện học tập hoàn thiện, bao gồm: tiến trình học, hàng nút thao tác nhanh (Chưa thuộc/Ngẫu nhiên/Yêu thích), cấu trúc card 3D lăng trụ, state machine lật thẻ qua click, hiệu ứng nháy màu nền body, và màn hình tổng kết phiên học. |
| `src/App.css` | [MODIFY] | Bổ sung các class CSS 3D Transforms (`.perspective-1000`, `.preserve-3d`, `.backface-hidden`, `.face-1`, `.face-2`, `.face-3`, `.state-1`, `.state-2`, `.state-3`) và style cho hàng nút điều khiển nhanh, nút response, màn hình chúc mừng. |

## Những phương án đã cân nhắc và lý do không chọn

- **Phương án B (Slide/Fade Transition):** Không chọn vì không đạt được tính thẩm mỹ và cảm giác "premium" của giao diện thiết kế, làm giảm trải nghiệm học tập độc đáo so với mong đợi ban đầu.

## Câu hỏi mở còn lại

- [ ] Q-01: Bộ từ vựng cho phiên học (Bài 1, Bài 2) trước mắt sẽ được mock dữ liệu tĩnh như thế nào? (Sẽ thiết lập bộ mock data phong phú đầy đủ Kanji, âm Hán, nghĩa, ví dụ tiếng Nhật và ví dụ tiếng Việt tương ứng cho cả hai bài để chạy thực tế).
