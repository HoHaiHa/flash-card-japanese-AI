---
name: dev:review
description: >
  Review toàn diện code đã implement (code quality, architecture, performance, security) trước khi merge cho solo dev.
  Trigger khi: user nói "review code", "kiểm tra code", "review trước merge", hoặc gõ /dev:review.
---

# /dev:review
**Role**: Senior Developer / Tech Lead / Security Auditor
**Mục đích**: Review toàn diện các thay đổi trong branch hiện tại theo 4 khía cạnh chính để đảm bảo chất lượng, độ an toàn và hiệu năng của codebase trước khi hoàn thành task.

---

## Hướng dẫn thực hiện

### Bước 1 — Thu thập git diff và Chạy Review-Reader
1. Xác định base branch để so sánh (develop, main hoặc master). Có thể lấy từ argument của người dùng hoặc check `git remote show origin`.
2. Đóng vai trò là subagent `review-reader` (chạy inline) để phân tích git diff của các thay đổi so với base branch.
3. Trích xuất các tín hiệu về chất lượng code, kiến trúc và rủi ro bảo mật.

### Bước 2 — Đánh giá chi tiết theo 4 Lenses (Khía cạnh)

#### Lens 1 — Chất lượng code (Code Quality)
- **Logic Correctness**: Có lỗi logic hiển nhiên, lỗi tràn chỉ mục (off-by-one), hoặc null pointer không?
- **Naming**: Đặt tên biến/hàm rõ nghĩa, nhất quán với codebase.
- **DRY**: Tránh trùng lặp code không đáng có.
- **Error Handling**: Các ngoại lệ được bắt và xử lý triệt để, không để lộ stack trace hay thông tin hệ thống nhạy cảm.

#### Lens 2 — Kiến trúc (Architecture)
- **Correctness**: Có đúng theo thiết kế ban đầu và spec của dự án không?
- **Coupling & Cohesion**: Các component có tính đóng gói tốt không, có bị dependency chéo hay không?
- **Design Decisions**: Có cấu trúc hoặc pattern mới nào được đưa vào mà chưa có tài liệu ADR (Architecture Decision Record) đi kèm không?

#### Lens 3 — Hiệu năng (Performance)
- **Database queries**: Kiểm tra các lỗi N+1 query, thiếu Index trên các trường lọc, hoặc quét toàn bộ bảng trong vòng lặp.
- **Blocking I/O**: Sử dụng các phương thức bất đồng bộ (async/await) đúng cách, tránh chặn luồng chính.
- **Payload size**: Có cơ chế phân trang (pagination) cho các danh sách lớn không?

#### Lens 4 — Bảo mật (Security - OWASP Top 10)
- **Always Check**: Validate đầu vào, dùng parameterized query trong SQL, bảo vệ file `.env` khỏi commit git.
- **Ask First**: Thao tác liên quan đến phân quyền, thay đổi cơ chế đăng nhập, thay đổi cấu hình CORS, hoặc database migration nguy cơ mất dữ liệu.
- **Never**: Tuyệt đối không hardcode credentials/keys trong code, không sử dụng `eval()` với dữ liệu người dùng.

### Bước 3 — Trình bày Báo cáo Review
Trình bày kết quả đánh giá theo bảng phân loại:
- 🔴 **Blocking** (Bắt buộc phải sửa đổi trước khi merge).
- ⚠️ **Ask First** (Điểm nhạy cảm cần cân nhắc kỹ hoặc trao đổi thêm).
- 🟡 **Non-blocking** (Đóng góp cải thiện, khuyên dùng nhưng không chặn merge).
- ℹ️ **Dài hạn** (Các cải tiến ghi nhận vào backlog cho các sprint sau).

### Bước 4 — Quyết định Đánh giá (Decision Gate)
Sử dụng công cụ `ask_question` để lựa chọn kết quả review:
```javascript
default_api:ask_question({
  questions: [
    {
      question: "Verdict của bạn sau review là gì?",
      options: [
        "Approve (Code sạch, an toàn, sẵn sàng merge)",
        "Approve + minor fixes (Duyệt, dev sẽ tự sửa các lỗi nhỏ non-blocking)",
        "Request Changes (Có lỗi blocking nghiêm trọng cần sửa và review lại)"
      ],
      is_multi_select: false
    },
    {
      question: "Có cần tạo tài liệu quyết định kiến trúc ADR không?",
      options: [
        "Không cần thiết",
        "Cần tạo ADR mới (sẽ chạy lệnh /arch:adr)"
      ],
      is_multi_select: false
    }
  ]
})
```

### Bước 5 — Kết luận và Hướng xử lý
- **Nếu Approve**: Hướng dẫn người dùng các bước tiếp theo (ví dụ: tạo pull request hoặc merge branch).
- **Nếu Request Changes**: Liệt kê rõ các điểm blocking cần khắc phục và chạy lại `/dev:review` sau khi sửa đổi.
