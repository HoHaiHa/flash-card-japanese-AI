---
name: dev:pr
description: >
  Tạo PR description chuẩn từ code changes, verify AC coverage, link task docs cho solo dev.
  Trigger khi: user nói "tạo PR", "viết PR description", "chuẩn bị pull request", hoặc gõ /dev:pr.
---

# /dev:pr
**Role**: Solo Developer
**Mục đích**: Chuẩn bị PR description chi tiết, rà soát lại AC coverage, cập nhật trạng thái test và tài liệu trước khi gửi PR hoặc tiến hành merge.

---

## Hướng dẫn thực hiện

### Bước 0 — Kiểm tra Review & Verification
1. Đọc file `docs/tasks/[TASK-ID]/verification.md`.
2. Kiểm tra xem kết quả test đã PASS hết chưa và đã chạy review `/dev:review` chưa.

Sử dụng công cụ `ask_question` để xác nhận:
```javascript
default_api:ask_question({
  questions: [
    {
      question: "Bạn đã chạy review và verification thành công cho task chưa?",
      options: [
        "Đã chạy và tất cả đều PASS",
        "Chưa chạy, tôi cần hoàn thành test và review trước"
      ],
      is_multi_select: false
    }
  ]
})
```

### Bước 1 — Rà soát mã nguồn (Inline Diff-Reader)
1. Xác định base branch để so sánh (develop/main).
2. Phân tích git diff giữa branch hiện tại và base branch để:
   - Liệt kê các files đã thay đổi và lý do thay đổi.
   - Kiểm tra các tiêu chí Acceptance Criteria (AC) đã được đáp ứng đầy đủ chưa.
   - Nhận diện các rủi ro hoặc breaking changes (nếu có).

### Bước 2 — Tạo PR Description
1. Tạo tài liệu PR description sử dụng template `templates/pr-description.md`.
2. Điền đầy đủ thông tin:
   - **Tóm tắt (Summary)**: 2-3 câu mô tả ngắn gọn thay đổi.
   - **Liên kết (Links)**: Link đến spec và analysis.md của task.
   - **Bảng Acceptance Criteria**: Đánh dấu [x] cho các AC đã hoàn thành kèm cách verify.
   - **Bảng thay đổi**: Các file thay đổi kèm mô tả.
   - **Cách kiểm thử (How to test)**: Hướng dẫn các bước test nhanh.
   - **Breaking Changes & Notes**: Ghi chú quan trọng.

### Bước 3 — Phân tích Review Comments (Re-review cycle - Tùy chọn)
Nếu PR đã tạo và nhận được phản hồi/góp ý từ người khác:
1. Đóng vai trò subagent `pr-resolver` để phân tích các bình luận.
2. Đề xuất phương án sửa lỗi cho từng comment.
3. Hướng dẫn sửa đổi code tương ứng.

### Bước 4 — Gate cuối
Xác nhận với người dùng rằng tài liệu mô tả PR đã hoàn tất. Hướng dẫn người dùng chạy lệnh tạo PR thực tế (ví dụ: `gh pr create`) hoặc thực hiện merge.
```javascript
default_api:ask_question({
  questions: [
    {
      question: "Tài liệu PR đã sẵn sàng. Bạn muốn làm gì tiếp?",
      options: [
        "Đã sẵn sàng, xuất PR description",
        "Cần bổ sung thêm ghi chú cho reviewer"
      ],
      is_multi_select: false
    }
  ]
})
```
*Nhắc nhở: Chạy lệnh `/docs:update` sau khi merge PR để đồng bộ tài liệu dự án.*
