---
name: dev:analyze
description: >
  Phân tích task/issue, quét codebase tìm file liên quan và đề xuất các phương án implement kèm trade-off cho solo dev.
  Trigger khi: user nói "analyze task", "phân tích issue", "xem có cách nào làm", "đề xuất phương án", hoặc gõ /dev:analyze.
---

# /dev:analyze
**Role**: Solo Developer / Solutions Architect
**Mục đích**: Phân tích yêu cầu, quét mã nguồn để xác định các vùng ảnh hưởng, và đề xuất phương án kỹ thuật tối ưu.

---

## Brain Dump Pattern (Input)
Trước khi chạy, hãy thu thập các thông tin sau để tăng độ chính xác:
- **Tech stack**: Ngôn ngữ, framework, database, infrastructure.
- **Relevant files**: Các file đã biết có liên quan trực tiếp.
- **Constraints**: Ràng buộc về hiệu năng, bảo mật, tương thích ngược, deadline.
- **Gotchas**: Các vấn đề hoặc lỗi thường gặp trong codebase liên quan đến mảng này.

---

## Hướng dẫn thực hiện

### Bước 0 — Phân loại Rủi ro (Risk Classification)
Đọc tài liệu `docs/risk-classifier.md` và phân loại mức độ rủi ro của task:
```
## Risk Classification — [TASK-ID]
- Input type: [new-spec | spec-slice | change-request | maintenance | new-initiative]
- Risk checklist: [Các item thỏa mãn trong risk checklist, ví dụ: R-03 ✅ (New integrations)]
- Lane: [tiny | normal | high-risk]
- Lý do: [Lý do ngắn gọn]
```
- **Tiny lane**: Skip toàn bộ phân tích này, thực hiện patch trực tiếp.
- **High-risk lane**: Dừng lại, cảnh báo về rủi ro bảo mật/kiến trúc nhạy cảm và tham khảo tài liệu `assets/ask-first-gates.md`.
- **Normal lane**: Tiếp tục thực hiện các bước dưới đây.

### Bước 1 — Phân tích yêu cầu (Inline Task-Reader)
Đọc file `docs/tasks/[TASK-ID]/requirements.md`. Đóng vai trò là subagent `task-reader` để:
- Trích xuất mục tiêu nghiệp vụ (business goal) và các Acceptance Criteria (AC).
- Xác định các câu hỏi còn bỏ ngỏ (unknowns).

Sử dụng `ask_question` để làm rõ nếu có bất kỳ điểm nào chưa rõ ràng:
```javascript
default_api:ask_question({
  questions: [
    {
      question: "Tôi hiểu đúng mục tiêu task chưa?",
      options: [
        "Đúng rồi, hãy quét codebase tìm file",
        "Chưa đúng, tôi sẽ cung cấp thêm thông tin",
        "Có thêm ràng buộc/constraints mới cần lưu ý"
      ],
      is_multi_select: false
    }
  ]
})
```

### Bước 2 — Quét codebase tìm file liên quan (Inline Code-Scout)
Sử dụng các công cụ `grep_search` và `list_dir` để:
- Định vị các file/class/components cần thay đổi hoặc tham khảo.
- Ghi lại các đường dẫn file và mô tả lý do liên quan.
- Xác định các pattern hoặc convention hiện tại của codebase cần tuân thủ.

### Bước 3 — Đề xuất phương án thiết kế (Inline Planner)
Tổng hợp thông tin yêu cầu và code map để đưa ra **2-3 phương án thi công** với các thông tin:
- **Mô tả giải pháp**: Cách tiếp cận kỹ thuật.
- **Các file sẽ thay đổi**: Danh sách file kèm hành động (MODIFY, NEW, DELETE).
- **Ưu và Nhược điểm**: Đánh giá chi tiết về trade-off (Tốc độ, Khả năng bảo trì, Hiệu năng).
- **Risk**: Các rủi ro tiềm ẩn.
- **Estimate**: Thời gian ước tính hoàn thành.

Trình bày so sánh cho người dùng và sử dụng `ask_question` để chọn phương án:
```javascript
default_api:ask_question({
  questions: [
    {
      question: "Bạn muốn ưu tiên tiêu chí nào cho giải pháp?",
      options: [
        "Speed (Tốc độ hoàn thành nhanh)",
        "Maintainability & Clean Code (Dễ bảo trì và mở rộng)",
        "Cân bằng cả hai"
      ],
      is_multi_select: false
    },
    {
      question: "Bạn lựa chọn phương án implement nào?",
      options: [
        "Phương án A (Giải pháp tối giản/Nhanh)",
        "Phương án B (Giải pháp hướng cấu trúc/Sạch)",
        "Phương án C (Giải pháp thay thế/Nếu có)"
      ],
      is_multi_select: false
    }
  ]
})
```

### Bước 4 — Tạo HTML Companion và Lưu tài liệu Phân tích
1. Tạo file HTML so sánh `docs/tasks/[TASK-ID]/analysis-compare.html` sử dụng template `templates/html-artifact.html` để trực quan hóa việc so sánh các phương án (one-shot review, không commit).
2. Tạo file markdown phân tích chính thức `docs/tasks/[TASK-ID]/analysis.md` ghi nhận:
   - Phương án đã chọn và lý do chọn.
   - Danh sách các file sẽ thay đổi chi tiết.
   - Các phương án khác đã cân nhắc nhưng không chọn.
   - Kế hoạch kiểm thử sơ bộ.

*Dừng lại ở đây. Chờ người dùng gọi lệnh `/dev:implement` để bắt đầu viết code.*
