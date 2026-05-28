---
name: sec:review
description: >
  Security review trước khi merge cho solo dev. Phân loại theo 3 tier: Always/Ask First/Never + OWASP Top 10 checklist.
  Trigger khi: user nói "security review", "review bảo mật", "check security trước merge", hoặc gõ /sec:review.
---

# /sec:review
**Role**: Solo Developer / Security Reviewer
**Mục đích**: Rà soát bảo mật mã nguồn trước khi merge. Đảm bảo tuân thủ các quy tắc bảo mật và hạn chế tối đa rò rỉ dữ liệu hoặc lỗ hổng nghiêm trọng.

---

## Ba Tier Quyết định Bảo mật

### ✅ ALWAYS DO (Luôn thực hiện)
- Mã hóa mật khẩu bằng thuật toán mạnh (bcrypt/argon2).
- Validate và sanitize mọi input đầu vào từ người dùng.
- Dùng Parameterized Queries (tránh SQL Injection).
- Dùng HTTPS cho tất cả external API calls.
- Không ghi log dữ liệu nhạy cảm (mật khẩu, tokens, PII).

### ⚠️ ASK FIRST (Rà soát kỹ lưỡng các thay đổi nhạy cảm)
- Thay đổi logic Authentication / Authorization.
- Thay đổi phân quyền hoặc kiểm tra roles.
- Thay đổi API công khai (Breaking changes).
- Database migration có nguy cơ mất mát hoặc ảnh hưởng đến bảo mật dữ liệu.
- Thay đổi cấu hình CORS, HTTPS, Cryptography.
- Tích hợp thêm các API bên ngoài mới.

### ❌ NEVER DO (Tuyệt đối tránh)
- Hardcode mật khẩu, API keys, secrets trong mã nguồn.
- Tắt SSL verification.
- Dùng hàm `eval()` với dữ liệu chưa được sanitize.
- Expose stack trace lỗi hệ thống chi tiết cho người dùng cuối.

---

## Hướng dẫn thực hiện

### Bước 1 — Quét mã nguồn và Phát hiện rủi ro
1. Quét git diff của các thay đổi mới.
2. Tìm kiếm các mẫu code liên quan đến:
   - Các cổng API, route mới tạo (kiểm tra phân quyền).
   - Câu lệnh truy vấn DB (kiểm tra SQL injection).
   - Cách lưu trữ và mã hóa credentials/secrets.

### Bước 2 — Phân loại findings và Trình bày báo cáo
Trình bày kết quả rà soát:
- 🔴 **Issues cần fix ngay**: Lỗ hổng bảo mật nghiêm trọng (như rò rỉ API key, SQL injection).
- ⚠️ **Ask First**: Thay đổi nhạy cảm cần cân nhắc kỹ hoặc kiểm chứng kỹ hơn.
- 🟡 **Improvements**: Các điểm nên cải tiến (như thêm rate limiting, tối ưu hóa CORS).
- Bảng check trạng thái các đầu mục OWASP Top 10 (SQL Injection, Broken Auth, SSRF, Logging...).

### Bước 3 — Gate cuối
Sử dụng công cụ `ask_question` để đưa ra Verdict:
```javascript
default_api:ask_question({
  questions: [
    {
      question: "Kết quả đánh giá bảo mật của bạn thế nào?",
      options: [
        "Sạch hoàn toàn (Không phát hiện vấn đề bảo mật nào)",
        "Có điểm cần confirm (Có Ask First items cần lưu ý)",
        "Có lỗi cần fix gấp (Request Changes để vá bảo mật)"
      ],
      is_multi_select: false
    }
  ]
})
```
*Sửa các lỗi bảo mật nghiêm trọng trước khi merge.*
