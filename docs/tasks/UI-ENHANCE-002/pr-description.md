---
templateId: pr-description
version: "1.0"
lang: vi
---
<!-- lang: vi -->

## UI-ENHANCE-002 Cải tiến layout nút lọc, tái cấu trúc mẫu câu và tách âm On/Kun Kanji

### Type of change

- [ ] Bug fix (non-breaking change — fixes an issue)
- [x] New feature (non-breaking change — adds functionality)
- [x] Breaking change (fix or feature causing existing functionality to change)
- [ ] Refactor (code change with no functional effect)
- [ ] Documentation update
- [ ] Tech debt / dependency update

### Summary

- Tùy chỉnh CSS thanh lọc nhanh gồm 3 nút "Chưa thuộc", "Ngẫu nhiên" và "Yêu thích" hiển thị co giãn trên 1 hàng ngang, tuyệt đối không bị tràn dòng.
- Chuyển nút "Ngẫu nhiên" thành dạng Toggle State ổn định (Stable Rank Shuffle) lưu trọng số trong `useRef`. Mỗi khi bật sẽ sinh ngẫu nhiên thứ tự mới, khi tắt trả về thứ tự mặc định và không bị nhảy vị trí khi người dùng đánh giá thẻ.
- Tái cấu trúc thẻ Mẫu câu (Sentence Card) từ 3 slide thành 2 slide để gộp ví dụ tiếng Nhật, dịch nghĩa tiếng Việt và phân tích trợ từ chi tiết cùng hiển thị ở mặt sau để người học tiện theo dõi.
- Bổ sung cột `onyomi` và `kunyomi` vào bảng `vocabularies` trên database Supabase, thực hiện mapping trong `db.js`, cập nhật unit test và tạo các badge hiển thị riêng biệt ở mặt trước thẻ Kanji.
- Cập nhật chi tiết câu chuyện Mnemonics phân tích bộ thủ và liên tưởng chữ Hán cho các thẻ Kanji.
- Bổ sung nhãn nhận diện loại thẻ ("Từ vựng", "Mẫu câu", "Hán tự") ở mặt trước của các thẻ học và căn chỉnh lại margin-top để không bị đè đính chữ.

### Links

- Closes #UI-ENHANCE-002
- Spec: `docs/tasks/UI-ENHANCE-002/requirements.md`
- Analysis: `docs/tasks/UI-ENHANCE-002/analysis.md`

### Acceptance Criteria

- [x] AC-001: 3 nút lọc nhanh trên màn hình Flashcard hiển thị thẳng hàng trên một hàng ngang, không bị xuống dòng trên màn hình mobile (max-width 480px) — verified by manual test.
- [x] AC-002: Nút "Ngẫu nhiên" hoạt động như một nút Toggle (đổi trạng thái active/inactive). Khi bật, xáo trộn thẻ học; khi tắt, trả thẻ về thứ tự ban đầu — verified by manual test.
- [x] AC-003: Thẻ mẫu câu hiển thị chính xác: Mặt 1 (Cấu trúc ngữ pháp công thức) → Mặt 2 (Ví dụ, dịch nghĩa & phân tích trợ từ) — verified by manual test.
- [x] AC-004: Thẻ chữ Hán hiển thị phân biệt rõ ràng hai dòng "Âm On (On'yomi)" và "Âm Kun (Kun'yomi)" ở mặt trước — verified by manual test.
- [x] AC-005: Dữ liệu phân tích bộ thủ và liên tưởng chữ Hán có độ dài phân tích đầy đủ chi tiết, giải nghĩa rõ rệt các bộ thành phần — verified by database check.

### Changes

| File | Type | Description |
|------|------|-------------|
| `src/App.css` | Modified | Chỉnh sửa flexbox và white-space cho thanh lọc nhanh; định nghĩa style cho các badge âm On/Kun. |
| `src/components/FlashcardStudy.jsx` | Modified | Sắp xếp lại Swiper của Mẫu câu (2 slide), tách badge On/Kun ở Kanji, cập nhật logic xáo trộn ngẫu nhiên, tích hợp nhãn loại thẻ và căn chỉnh spacing. |
| `src/components/StudyList.jsx` | Modified | Thêm bộ lọc từ "Yêu thích" vào chip lọc danh sách từ vựng. |
| `src/services/db.js` | Modified | Ánh xạ thêm các trường `radicalAnalysis`, `characterLogic`, `onyomi`, `kunyomi`. |
| `src/services/db.test.js` | Modified | Cập nhật bộ unit test khẳng định tính đúng đắn của mapping dữ liệu. |
| `docs/tasks/UI-ENHANCE-002/schema.sql` | Added | Bản ghi di trú SQL thêm onyomi/kunyomi và cập nhật seed data. |

### How to Test

**Automated**:
- [x] Unit tests pass: `npm run test`

**Manual verification**:
1. Chạy ứng dụng local và cấu hình chọn học thẻ Mẫu câu hoặc Kanji.
2. Kiểm tra thanh 3 nút lọc nhanh trên màn hình mobile không bị tràn dòng.
3. Nhấp bật/tắt nút "Ngẫu nhiên" kiểm tra thứ tự xáo trộn có ổn định suốt phiên học.
4. Lật thẻ Mẫu câu kiểm tra cấu trúc 2 slide (Mặt 1: Công thức, Mặt 2: Ví dụ + Phân tích trợ từ).
5. Lật thẻ Kanji kiểm tra hiển thị On/Kun badge ở mặt trước.
6. Kiểm tra nhãn nhận diện loại thẻ hiển thị ở góc trên bên trái mặt trước và khoảng cách lùi xuống của nội dung thẻ không bị đính chữ.

### Breaking Changes

- Thay đổi số lượng mặt của thẻ Mẫu câu từ 3 mặt thành 2 mặt (gộp đáp án và phân tích).

### Database Changes

- Thêm cột `onyomi` và `kunyomi` vào bảng `vocabularies` trên Supabase (chạy file migration [schema.sql](file:///c:/project-ai/flash-card-japanese-AI/docs/tasks/UI-ENHANCE-002/schema.sql)).

### Notes for Reviewer

- Đã dùng `useRef` lưu trọng số ngẫu nhiên giúp cho thứ tự xáo trộn luôn ổn định trong phiên học.
- Đã thêm scrollable container cho mặt sau của Mẫu câu phòng trường hợp nhiều từ phân tích dài.

### Release Notes Summary

- Cải tiến giao diện thẻ học Flashcard mẫu câu và Kanji: hiển thị cấu trúc công thức ở mặt trước, gộp ví dụ và phân tích trợ từ mẫu câu vào một mặt thẻ; hiển thị tách biệt âm On/Kun Kanji dạng badge; bổ sung bộ lọc yêu thích và tối ưu hóa nút xáo trộn ngẫu nhiên.

### Docs to Update After Merge

- [ ] `docs/screens/study/flashcard-study.md` — Cập nhật cấu trúc hiển thị 2 slide cho Mẫu câu và badge On/Kun cho Kanji.
