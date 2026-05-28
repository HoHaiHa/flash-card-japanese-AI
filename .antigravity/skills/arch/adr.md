---
name: arch:adr
description: >
  Tạo Architecture Decision Record (ADR) để lưu giữ quyết định kiến trúc quan trọng cho solo dev.
  Trigger khi: user nói "tạo ADR", "viết ADR", "document quyết định kiến trúc", hoặc gõ /arch:adr.
---

# /arch:adr
**Role**: Solo Architect / Technical Lead
**Mục đích**: Ghi lại các quyết định thiết kế kiến trúc quan trọng (ADR) để theo dõi lịch sử phát triển của hệ thống.

---

## Hướng dẫn thực hiện

### Bước 1 — Thu thập bối cảnh quyết định
Sử dụng công cụ `ask_question` để thu thập thông tin cơ bản:
```javascript
default_api:ask_question({
  questions: [
    {
      question: "Bạn đã có sẵn bối cảnh và các phương án cân nhắc chưa?",
      options: [
        "Tôi sẽ cung cấp bối cảnh và các phương án trực tiếp bằng text",
        "Hãy giúp tôi tự phân tích bối cảnh dựa trên codebase hiện tại"
      ],
      is_multi_select: false
    }
  ]
})
```

Nhận thông tin về:
- Vấn đề kỹ thuật cần giải quyết và các ràng buộc.
- Các phương án đã được cân nhắc (ít nhất 2 phương án).
- Quyết định lựa chọn cuối cùng.

### Bước 2 — Tạo tài liệu ADR
1. Xác định số thứ tự tiếp theo cho ADR (ví dụ: `ADR-003`).
2. Tạo file `docs/decisions/ADR-[NNN]-[slug].md` sử dụng template `templates/adr.md` chứa:
   - **Bối cảnh (Context)**: Vấn đề và ràng buộc dẫn đến quyết định.
   - **Quyết định (Decision)**: Lựa chọn kỹ thuật rõ ràng.
   - **Các phương án cân nhắc**: Mô tả ngắn gọn ưu/nhược từng phương án.
   - **Hệ quả (Consequences)**: Cả mặt tích cực lẫn tiêu cực/đánh đổi (trade-offs).
   - **Điều kiện đánh giá lại (Revisit criteria)**: Điều kiện kích hoạt việc xem xét lại quyết định.

### Bước 3 — Xác nhận tài liệu
Trình bày tài liệu ADR đã soạn cho người dùng và hỏi ý kiến xác nhận:
```javascript
default_api:ask_question({
  questions: [
    {
      question: "Tài liệu ADR đã hoàn thành. Bạn muốn làm gì tiếp?",
      options: [
        "Chấp nhận và lưu trạng thái thành Accepted",
        "Cần chỉnh sửa thêm phần trade-offs hoặc hệ quả"
      ],
      is_multi_select: false
    }
  ]
})
```

*Cập nhật trạng thái của ADR thành "Accepted" sau khi người dùng đồng ý.*
