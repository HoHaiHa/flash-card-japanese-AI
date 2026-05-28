---
name: docs:update
description: >
  Cập nhật Baseline Docs (screen + API) sau khi task đã verify và merge. Bước cuối của mọi task.
  Trigger khi: user nói "cập nhật docs", "update baseline", "task done cần update doc", hoặc gõ /docs:update.
---

# /docs:update
**Role**: Solo Developer / Technical Writer
**Mục đích**: Cập nhật Baseline Docs (màn hình hiển thị, APIs) dựa trên thay đổi thực tế của code sau khi task hoàn thành. Đảm bảo tài liệu dự án luôn phản ánh đúng trạng thái thực tế của hệ thống.

---

## Hướng dẫn thực hiện

### Bước 1 — Rà soát thay đổi (Inline Diff-Reader)
1. Kiểm tra git diff của các thay đổi trong thư mục `src/` và `docs/` để xác định các phần tài liệu nào bị ảnh hưởng.
2. Đọc file `docs/tasks/[TASK-ID]/requirements.md` và `docs/tasks/[TASK-ID]/analysis.md`.
3. Xác định danh sách các file Baseline Docs cần cập nhật (ví dụ: `docs/screens/...`, `docs/api/...`).

### Bước 2 — Đề xuất phạm vi cập nhật
Trình bày danh sách các file tài liệu cần cập nhật và sử dụng `ask_question`:
```javascript
default_api:ask_question({
  questions: [
    {
      question: "Xác nhận danh sách Baseline Docs cần cập nhật?",
      options: [
        "Đúng và đầy đủ rồi",
        "Bị thiếu, cần bổ sung thêm tài liệu khác",
        "Không cần cập nhật tài liệu nào cả"
      ],
      is_multi_select: false
    }
  ]
})
```

### Bước 3 — Soạn thảo nội dung cập nhật (Inline Doc-Updater)
Với mỗi file Baseline Doc trong danh sách cần cập nhật, đề xuất các nội dung:
- Thêm mới (New elements, API fields, UI components).
- Sửa đổi (Thay đổi hành vi cũ thành hành vi mới).
- Xóa bỏ (Các tính năng hoặc API đã bị loại bỏ).

Trình bày nội dung đề xuất cho người dùng và xác nhận:
```javascript
default_api:ask_question({
  questions: [
    {
      question: "Nội dung cập nhật tài liệu đã chính xác chưa?",
      options: [
        "Chính xác, hãy ghi đè vào file tài liệu",
        "Chưa chính xác, tôi sẽ chỉ rõ chỗ cần sửa"
      ],
      is_multi_select: false
    }
  ]
})
```

### Bước 4 — Ghi đè tài liệu và Sync metadata
1. Cập nhật nội dung mới vào các file tài liệu tương ứng.
2. Cập nhật phần metadata ở đầu file tài liệu:
   - `**Last updated**: [Thời gian hiện tại]`
   - `**Updated by task**: [TASK-ID]`
   - `**Commit**: [Short SHA - Commit message]`
3. Hoàn tất cập nhật và báo cáo cho người dùng.
