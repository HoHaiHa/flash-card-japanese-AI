---
templateId: pr-description
version: "1.0"
lang: vi
---
<!-- lang: vi -->

## STITCH-001 Tích hợp màn hình Cấu hình học tập (Learning Configuration)

### Type of change

- [ ] Bug fix (non-breaking change — fixes an issue)
- [x] New feature (non-breaking change — adds functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Refactor (code change with no functional effect)
- [ ] Documentation update
- [ ] Tech debt / dependency update

### Summary

Xây dựng màn hình cấu hình học tập cho phép người học tiếng Nhật tùy chỉnh các tham số (hướng dịch, nội dung học, bài học) trước khi học. Triển khai state-based navigation để quản lý việc chuyển đổi màn hình và truyền cấu hình hợp lệ vào phiên học thử nghiệm.

### Links

- Closes #1
- Spec: `docs/tasks/STITCH-001/requirements.md`
- Analysis: `docs/tasks/STITCH-001/analysis.md`

### Acceptance Criteria

- [x] AC-001: Lựa chọn hướng dịch — verified by manual test steps T-01 & T-04.
- [x] AC-002: Chọn nội dung học — verified by manual test steps T-01 & T-02.
- [x] AC-003: Chọn bài học — verified by manual test steps T-01 & T-03.
- [x] AC-004: Ràng buộc khi nhấn bắt đầu học — verified by manual test steps T-02, T-03 & T-04.

### Changes

| File | Type | Description |
|------|------|-------------|
| `src/index.css` | Modified | Khởi tạo Design System tokens, biến CSS colors/rounded/shadows cho Seishun Learning theme và responsive mobile container frame. |
| `src/App.css` | Modified | Styles chi tiết cho layout header, dropdown hướng dịch, checkbox danh sách nội dung, dashed area bài học, và tactile shadow buttons. |
| `src/components/LearningConfig.jsx` | Added | Tạo mới component cấu hình học tập xử lý các checkbox toggles, dropdown state, và thông báo validation. |
| `src/App.jsx` | Modified | Quản lý state điều phối màn hình (`currentScreen`), state lưu cấu hình học (`learningConfig`), và render màn học thử nghiệm. |

### How to Test

**Automated**:
- [x] Build check compile: `npm run build`

**Manual verification**:
1. Khởi động local dev server và truy cập ứng dụng. Màn hình cấu hình học tập hiển thị với các giá trị mặc định.
2. Bỏ chọn tất cả "Nội dung học" và bấm "Bắt đầu học ngay" $\rightarrow$ Hiển thị lỗi "Vui lòng chọn ít nhất một nội dung học."
3. Chọn nội dung học nhưng bỏ chọn toàn bộ bài học trong khu nét đứt $\rightarrow$ Hiển thị lỗi "Vui lòng chọn ít nhất một bài học để tiếp tục."
4. Thiết lập cấu hình hợp lệ (Việt → Nhật, chọn Từ vựng, chọn Bài 1) và bấm "Bắt đầu học ngay" $\rightarrow$ Chuyển hướng mượt mà sang màn hình học thử nghiệm, hiển thị chính xác các tham số đã cấu hình.

### Breaking Changes

None

### Database Changes

None

### Notes for Reviewer

- Giao diện đã được căn chỉnh tỉ mỉ khớp 100% với hệ màu sắc, kích thước và phông chữ chỉ định trong `DESIGN.md`.
- Trạng thái màn hình học hiện tại là mockup placeholder để kiểm chứng sự kiện chuyển đổi màn hình và truyền dữ liệu. Logic xoay thẻ 3D thực tế sẽ được tích hợp ở task tiếp theo `STITCH-003`.

### Release Notes Summary

Tích hợp màn hình cấu hình học tập cho phép người dùng tùy chỉnh hướng dịch, nội dung học (từ vựng, mẫu câu, Hán tự) và bài học trước khi học thẻ flashcard.

### Docs to Update After Merge

- [x] `docs/screens/study/learning-config.md` — Đã mô tả đặc tả chi tiết giao diện màn hình cấu hình học tập.
