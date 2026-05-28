---
name: pm:breakdown
description: >
  Phân rã Epic/User Stories thành Tasks cụ thể với estimate, tạo file requirements hoặc GitHub/GitLab Issues cho solo dev.
  Trigger khi: user nói "breakdown epic", "tạo tasks từ story", "phân rã feature", "tạo github issues", hoặc gõ /pm:breakdown.
---

# /pm:breakdown
**Role**: Project Manager / Solo Developer
**Mục đích**: Phân rã Epic/User Stories thành các tasks cụ thể, tạo tài liệu requirements và các issues đi kèm.

---

## Hướng dẫn thực hiện

### Bước 1 — Đọc input và Phân loại
1. Nhận yêu cầu: Epic description, User Stories, hoặc yêu cầu trực tiếp từ người dùng.
2. Tìm và đọc file đặc tả nếu có (`docs/tasks/[TASK-ID]/requirements.md`).
3. Xác định mã Task ID (ví dụ: `SUPABASE-002`, `UI-003`).

### Bước 2 — Gate: Clarify trước khi breakdown
Sử dụng công cụ `ask_question` để làm rõ nền tảng quản lý và phạm vi:

```javascript
default_api:ask_question({
  questions: [
    {
      question: "Bạn dùng platform nào để quản lý task/issues?",
      options: [
        "Chỉ generate markdown (Lưu local docs)",
        "GitHub (Dùng gh CLI)",
        "GitLab (Dùng glab CLI)"
      ],
      is_multi_select: false
    },
    {
      question: "Bạn muốn phân rã task này theo độ chi tiết nào?",
      options: [
        "Chi tiết cao (Nhiều task nhỏ, tự chứa)",
        "Vừa phải (Phân theo component chính)",
        "Tối giản (1-2 task lớn)"
      ],
      is_multi_select: false
    }
  ]
})
```

*Chờ phản hồi của người dùng trước khi tiếp tục.*

### Bước 3 — Đề xuất task breakdown
Sử dụng Agent `task-reader` để hỗ trợ parse và cấu trúc yêu cầu (chạy inline):
```javascript
// Act as task-reader:
// Input: Raw requirements
// Output: Structured tasks with estimates
```

Đưa ra kế hoạch breakdown đề xuất:
- Liệt kê danh sách các task cụ thể kèm mã `[TASK-ID]`.
- Với mỗi task: mô tả, Acceptance Criteria (AC), estimate (story points hoặc hours).

Hỏi ý kiến người dùng xem có cần điều chỉnh priority, estimate hoặc thêm bớt task nào không.

### Bước 4 — Tạo cấu trúc tài liệu Task Requirements
Sau khi thống nhất phương án breakdown:
1. Tạo thư mục `docs/tasks/[TASK-ID]/` cho task chính.
2. Tạo file `docs/tasks/[TASK-ID]/requirements.md` sử dụng template `templates/task-doc-requirements.md` chứa:
   - Bối cảnh & Vấn đề.
   - Mục tiêu và Phạm vi (In/Out of scope).
   - Danh sách Acceptance Criteria (`AC-001`, `AC-002`...).
   - Danh sách Task List chi tiết để code.

### Bước 5 — Tạo Issues (Tùy chọn)
- **Nếu chọn GitHub/GitLab**: Hướng dẫn người dùng chạy lệnh CLI (`gh issue create` hoặc `glab issue create`) hoặc tạo trực tiếp bằng các API có sẵn trong session.
- **Nếu chọn Markdown**: Lưu danh sách vào `docs/tasks/sprint-1-issues.md` để theo dõi thủ công.

### Bước 6 — Gate cuối xác nhận
Xác nhận với người dùng rằng tài liệu yêu cầu và cấu trúc thư mục đã sẵn sàng để thực hiện bước phân tích kỹ thuật `/dev:analyze`.
