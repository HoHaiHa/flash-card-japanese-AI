---
name: dev:implement
description: >
  Triển khai viết code theo kế hoạch phân tích đã được duyệt, thực hiện file-by-file kèm gate xác nhận cho solo dev.
  Trigger khi: user nói "bắt đầu implement", "code theo plan đã chọn", "viết code cho task", hoặc gõ /dev:implement.
---

# /dev:implement
**Role**: Solo Developer
**Mục đích**: Thực hiện viết code chi tiết cho từng file theo đúng sơ đồ của `analysis.md`, xác minh sau mỗi file và tạo tài liệu kiểm chứng (verification).

---

## Hướng dẫn thực hiện

### Bước 1 — Đọc tài liệu Phân tích
1. Đọc kỹ `docs/tasks/[TASK-ID]/requirements.md` và `docs/tasks/[TASK-ID]/analysis.md`.
2. Tạo file `docs/tasks/[TASK-ID]/task.md` dạng checklist công việc để theo dõi tiến độ (nếu chưa có).

### Bước 2 — Chọn chế độ triển khai (TDD vs Standard)
Sử dụng công cụ `ask_question` để lựa chọn chế độ làm việc:
```javascript
default_api:ask_question({
  questions: [
    {
      question: "Bạn chọn chế độ triển khai nào?",
      options: [
        "Standard (Viết code trước, test sau)",
        "TDD (Viết test/specs trước, code logic sau - Khuyên dùng cho logic phức tạp)"
      ],
      is_multi_select: false
    }
  ]
})
```

- **Nếu chọn TDD**: Viết các test cases kiểm thử tự động trước, chạy test lỗi (failing), sau đó viết code để pass các test cases đó.

### Bước 3 — Vòng lặp viết code từng file (File-by-File)
Với mỗi file trong danh sách cần sửa đổi/tạo mới:
1. Đọc và phân tích file hiện tại (nếu là sửa đổi).
2. Thực hiện sửa đổi bằng các công cụ (`replace_file_content`, `write_to_file`, `multi_replace_file_content`).
3. Ghi chép báo cáo ngắn gọn:
   - Các dòng code/logic đã thay đổi.
   - Trạng thái kiểm thử của file này.
4. Sử dụng `ask_question` để xác nhận trước khi chuyển sang file tiếp theo:
```javascript
default_api:ask_question({
  questions: [
    {
      question: "Hoàn tất file này. Bạn muốn tiếp tục thế nào?",
      options: [
        "Tiếp tục sang file tiếp theo",
        "Dừng lại để điều chỉnh thêm file này",
        "Có sự thay đổi ngoài dự kiến (cần cập nhật kế hoạch)"
      ],
      is_multi_select: false
    }
  ]
})
```

### Bước 4 — Tự kiểm tra sau khi code (Self-Check Checklist)
Sau khi tất cả các file đã được code xong, tự soát lại theo các checklist sau:
- [ ] Không có API key, token hay credentials nào bị hardcode.
- [ ] Các trường hợp lỗi (error handling) và ngoại lệ được bắt và xử lý rõ ràng.
- [ ] Dữ liệu đầu vào từ phía người dùng/API được validate ở boundary.
- [ ] Không ghi log thông tin nhạy cảm (PII, mật khẩu).
- [ ] Đảm bảo code chạy không có lỗi biên dịch (compile error) hay lint.

```javascript
default_api:ask_question({
  questions: [
    {
      question: "Bạn đã tự kiểm tra xong checklist trên chưa?",
      options: [
        "Đã hoàn thành và tất cả đều PASS",
        "Chưa đạt, tôi cần quay lại sửa đổi một số chỗ"
      ],
      is_multi_select: false
    }
  ]
})
```

### Bước 5 — Đánh giá Git Diff và Tạo Test Steps (Inline Diff-Reader)
Chạy lệnh so sánh git diff của branch hiện tại với branch gốc. Đóng vai trò là subagent `diff-reader` để:
- Tóm tắt các thay đổi thực tế và tầm ảnh hưởng (impact summary).
- Liệt kê 3-5 bước kiểm thử thủ công cụ thể (`T-01`, `T-02`...) tương ứng với các thay đổi.

Trình bày danh sách test steps cho người dùng và chờ người dùng chạy thử.

### Bước 6 — Lưu kết quả kiểm chứng (Verification)
Tạo file kết quả kiểm chứng `docs/tasks/[TASK-ID]/verification.md` theo template `templates/verification.md` để ghi nhận:
- Trạng thái nghiệm thu của các tiêu chí Acceptance Criteria (AC).
- Kết quả chạy các bước kiểm thử thủ công và tự động (PASS/FAIL).
- Danh sách lỗi phát hiện (nếu có) và hướng xử lý.

### Bước 7 — Harness Delta Check
Nếu phát hiện bất kỳ khó khăn hay điểm nghẽn (friction) nào trong quá trình code, hãy ghi nhận lại vào `docs/improvement-backlog.md` để cải tiến quy trình sau này.
*Chờ người dùng gọi lệnh `/dev:review` để tiến hành review toàn diện trước khi merge.*
