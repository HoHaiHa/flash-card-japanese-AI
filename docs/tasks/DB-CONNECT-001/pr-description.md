---
templateId: pr-description
version: "1.0"
lang: vi
---
<!-- lang: vi -->

## DB-CONNECT-001 Thêm Script Kiểm Tra Kết Nối Database Supabase

### Type of change

- [x] New feature (non-breaking change — adds functionality)
- [ ] Bug fix (non-breaking change — fixes an issue)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Refactor (code change with no functional effect)
- [ ] Documentation update
- [ ] Tech debt / dependency update

### Summary

Xây dựng kịch bản script độc lập `scripts/check-db.js` giúp các lập trình viên dễ dàng kiểm thử kết nối cơ sở dữ liệu Supabase trực tiếp từ dòng lệnh (CLI). Script tự động đọc các tham số cấu hình kết nối từ tệp `.env` gốc của dự án và kiểm tra độ chính xác của API Key cũng như trạng thái mạng, đồng thời đưa ra cảnh báo và hướng xử lý trực quan nếu Schema (bảng) chưa được khởi tạo.

### Links

- Closes #DB-CONNECT-001
- Spec: `docs/tasks/DB-CONNECT-001/requirements.md` (N/A)
- Analysis: `docs/tasks/DB-CONNECT-001/analysis.md`

### Acceptance Criteria

- [x] AC-001: Tải thành công biến cấu hình từ file `.env` gốc — verified by manual run output.
- [x] AC-002: Khởi tạo client kết nối thành công với database — verified by manual run output.
- [x] AC-003: Báo cáo chi tiết trạng thái kết nối và hướng xử lý khi thiếu table — verified by running test connection on clean local environment.

### Changes

| File | Type | Description |
|------|------|-------------|
| `scripts/check-db.js` | Added | Khởi tạo script kiểm tra kết nối với Supabase, tự động load config từ file `.env`, thực hiện ping thử database và hỗ trợ clean exit trên Windows. |

### How to Test

**Automated**:
- [ ] Unit tests pass: N/A
- [ ] Integration tests pass: N/A

**Manual verification**:
1. Đảm bảo file `.env` tồn tại trong thư mục gốc của dự án `flash-card-japanese-AI` chứa các biến `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.
2. Chạy lệnh: `node scripts/check-db.js` trong thư mục `flash-card-japanese-AI`.
3. Kết quả mong đợi: 
   - Nếu kết nối thành công và có bảng `lessons`: In ra dữ liệu dạng bảng.
   - Nếu kết nối thành công nhưng chưa tạo bảng: In ra cảnh báo `PGRST205` kèm theo hướng xử lý tạo bảng trên Supabase Dashboard.
   - Nếu cấu hình sai thông tin URL/Key: Báo lỗi chi tiết thất bại.

### Breaking Changes

None

### Database Changes

None

### Notes for Reviewer

- Script đã được tối ưu hóa cơ chế `cleanExit` sử dụng `setTimeout` 100ms trước khi `process.exit()` để tránh lỗi `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` trên hệ điều hành Windows khi ngắt kết nối async của Node.js.
- Không cần cài thêm bất kỳ dependency nào từ bên ngoài, hoàn toàn sử dụng thư viện lõi của Node.js (`fs`, `path`, `url`).

### Release Notes Summary

Bổ sung công cụ kiểm tra kết nối database Supabase tự động qua dòng lệnh (CLI).

### Docs to Update After Merge

None
