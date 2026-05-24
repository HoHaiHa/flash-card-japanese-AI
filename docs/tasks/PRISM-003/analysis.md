# Analysis: PRISM-003

## Risk Classification — PRISM-003

**Input type**: `change-request`  
**Risk checklist**: R-09 ✅ (Không có test coverage hiện tại cho vùng thay đổi)  
**Lane**: `normal`  
**Lý do**: Thay đổi cử chỉ vuốt chuyển hướng (swipe) và nhấn (click) trên giao diện thẻ học Flashcard.

---

## Phương án đã chọn: Phương án B: Swiper lồng nhau (Nested Swipers)
**Lý do**: Người dùng lựa chọn Phương án B để tận dụng hiệu ứng Cube 3D có sẵn của Swiper cho việc lật thẻ, đồng thời đẩy nhanh tốc độ triển khai.

## Files sẽ thay đổi
| File | Loại thay đổi | Ghi chú |
|------|--------------|---------|
| [FlashcardStudy.jsx](file:///c:/project-ai/flash-card-japanese-AI/src/components/FlashcardStudy.jsx) | MODIFY | Tách biệt thành Swiper ngoài (chuyển từ vựng) và các Swiper trong (lật mặt thẻ, tắt vuốt bằng `allowTouchMove={false}`). |

## Những phương án đã cân nhắc và lý do không chọn
- **Phương án A:** Tái cấu trúc Swiper bao ngoài, sử dụng CSS 3D prism nội bộ. Lý do không chọn: Người dùng muốn ưu tiên tốc độ triển khai và tận dụng tối đa hiệu ứng Cube 3D của Swiper.

## Câu hỏi mở còn lại
- Không có.
