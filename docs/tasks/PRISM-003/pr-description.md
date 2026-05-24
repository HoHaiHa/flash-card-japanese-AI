---
templateId: pr-description
version: "1.0"
lang: vi
---
<!-- lang: vi -->

## PRISM-003 Nested Swipers for Flashcard study gesture separation

### Type of change

- [ ] Bug fix (non-breaking change — fixes an issue)
- [x] New feature (non-breaking change — adds functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [x] Refactor (code change with no functional effect)
- [ ] Documentation update
- [ ] Tech debt / dependency update

### Summary

Thay đổi thiết kế cấu trúc xoay lật của màn hình học FlashcardStudy sang dạng lồng nhau (Nested Swipers). Swiper ngoài cùng chịu trách nhiệm quản lý danh sách từ vựng và cho phép vuốt ngang đổi từ tự nhiên. Mỗi slide chứa một Swiper con Cube 3D đại diện cho 3 mặt thẻ học (đã tắt vuốt bằng `allowTouchMove={false}`) và chỉ lật mặt thẻ khi click chuột.

### Links

- Closes #PRISM-003
- Spec: `docs/screens/study/flashcard-study.md`
- Analysis: `docs/tasks/PRISM-003/analysis.md`

### Acceptance Criteria

- [x] AC-001: Vuốt ngang để chuyển đổi từ vựng — verified by manual test step T-05
- [x] AC-002: Nhấn (Click/Tap) vào thẻ học để lật mặt xoay 3D — verified by manual test steps T-01, T-02, T-03, T-04

### Changes

| File | Type | Description |
|------|------|-------------|
| `src/components/FlashcardStudy.jsx` | Modified | Lồng Swiper con Cube 3D (allowTouchMove=false) trong Swiper cha điều phối danh sách từ vựng. Lưu trữ các instances swiper trong bằng useRef để điều khiển xoay lật khi click. |

### How to Test

**Automated**:
- [x] Biên dịch Production thành công: `npm run build`

**Manual verification**:
1. Truy cập vào màn hình học Flashcard.
2. Click vào thân thẻ học để xoay lật 3D Cube lần lượt qua 3 mặt: Từ vựng -> Hán tự -> Nghĩa & Ví dụ -> Từ vựng.
3. Thực hiện cử chỉ vuốt ngang trên thẻ: Thẻ sẽ trượt đổi sang từ tiếp theo và hiển thị mặc định ở Mặt 1.
4. Click nút "Đã thuộc" hoặc "Chưa thuộc": Màn hình nháy sáng màu tương ứng, thẻ trượt sang từ kế tiếp.

### Breaking Changes

None

### Database Changes

None

### Notes for Reviewer

- Để ngăn chặn việc vuốt lật mặt thẻ xung đột với vuốt đổi từ, Swiper con được cấu hình `allowTouchMove={false}`. Khi đó các sự kiện drag/swipe ngang sẽ nổi lên Swiper cha xử lý một cách tự nhiên.
- Các Swiper con được đăng ký instance động vào `innerSwipers.current[card.id]` để đảm bảo mỗi khi đổi từ hoặc lọc thẻ, có thể reset chính xác mặt thẻ hiển thị về Mặt 1.

### Release Notes Summary

Tách biệt cử chỉ vuốt ngang chuyển đổi từ vựng và nhấn click lật mặt thẻ 3D trên màn hình học Flashcard.

### Docs to Update After Merge

- [ ] `docs/screens/study/flashcard-study.md` — Cập nhật thiết kế kỹ thuật từ CSS rotateY sang cấu trúc Nested Swipers.
