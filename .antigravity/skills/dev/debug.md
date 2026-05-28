---
name: dev:debug
description: >
  Hệ thống hóa quy trình debug lỗi: Tái lập -> Định vị -> Thu hẹp -> Sửa lỗi -> Phòng ngừa cho solo dev.
  Trigger khi: user nói "debug lỗi", "tìm nguyên nhân bug", "tại sao bị lỗi", "fix bug", hoặc gõ /dev:debug.
---

# /dev:debug
**Role**: Solo Developer
**Mục đích**: Quy trình debug hệ thống giúp tìm chính xác nguyên nhân gốc rễ (root cause) và khắc phục triệt để lỗi, tránh việc chỉnh sửa ngẫu nhiên mà không hiểu rõ.

---

## Hướng dẫn thực hiện

### Bước 1 — Tái lập lỗi (Reproduce)
Thu thập thông tin để tái lập lỗi một cách nhất quán. Sử dụng công cụ `ask_question`:
```javascript
default_api:ask_question({
  questions: [
    {
      question: "Lỗi này xảy ra ở môi trường nào?",
      options: [
        "Local development (Chạy máy cá nhân)",
        "Staging / UAT (Môi trường test chung)",
        "Production (Môi trường chạy thực tế)"
      ],
      is_multi_select: false
    },
    {
      question: "Tính chất xuất hiện của lỗi?",
      options: [
        "Mới xuất hiện sau khi thay đổi code gần đây",
        "Lỗi đã tồn tại từ lâu / Có sẵn",
        "Thỉnh thoảng mới bị (chập chờn, khó tái lập)"
      ],
      is_multi_select: false
    }
  ]
})
```

- Nhận mô tả chi tiết các bước gây lỗi (Steps to reproduce).
- Thu thập thông tin lỗi: error messages, stack trace, API response, logs.
*Cảnh báo (Ask First Gate)*: Nếu lỗi xảy ra trên production ảnh hưởng trực tiếp đến người dùng thật, hãy thông báo ngay trước khi tiến hành chỉnh sửa.

### Bước 2 — Định vị lỗi (Localize)
1. Đóng vai trò là subagent `code-scout` (chạy inline) để quét codebase tìm kiếm các module, file hoặc dòng code chịu trách nhiệm xử lý logic bị lỗi.
2. Liệt kê các vùng code khả nghi (Suspected files & line numbers) kèm lý do nghi ngờ.
3. Đề xuất các giả thuyết (Hypotheses) về nguyên nhân gây lỗi (Ví dụ: Giả thuyết H1: Dữ liệu API trả về Null, Giả thuyết H2: Sai lệch múi giờ).

### Bước 3 — Thu hẹp phạm vi (Reduce)
1. Tạo một đoạn code test hoặc kịch bản chạy thử tối giản nhất có thể kích hoạt lỗi (Minimal Reproduction).
2. Kiểm tra xem lỗi có xảy ra trong kịch bản tối giản này hay không. 
   - Nếu có: nguyên nhân nằm tại chính hàm/logic đó.
   - Nếu không: lỗi xảy ra do sự tương tác phức tạp giữa nhiều module khác nhau.

### Bước 4 — Sửa lỗi (Fix)
Sau khi đã xác định chắc chắn nguyên nhân gốc rễ:
1. Đề xuất giải pháp và sử dụng `ask_question` để lựa chọn hướng khắc phục:
```javascript
default_api:ask_question({
  questions: [
    {
      question: "Bạn chọn phương án sửa lỗi nào?",
      options: [
        "Targeted Fix (Sửa trực tiếp điểm lỗi, an toàn nhất cho các phần khác)",
        "Broader Fix / Refactor (Cải tiến lại cấu trúc xung quanh để tránh lỗi tương tự ở quy mô rộng)"
      ],
      is_multi_select: false
    }
  ]
})
```
2. Thực hiện sửa đổi code. Đảm bảo tuân thủ các quy tắc bảo mật và tránh side effect.

### Bước 5 — Phòng ngừa lỗi (Guard)
Sau khi đã sửa xong và kiểm tra lỗi đã biến mất:
1. Cân nhắc viết thêm Unit Test hoặc Integration Test kiểm thử chính lỗi này để ngăn ngừa lỗi tái xuất hiện sau này (Regression Test).
2. Ghi chép lại lỗi và giải pháp vào lịch sử/tài liệu task nếu cần thiết.
```javascript
default_api:ask_question({
  questions: [
    {
      question: "Bạn muốn làm gì để phòng ngừa lỗi này tái diễn?",
      options: [
        "Viết bổ sung regression unit test",
        "Chỉ cần test thủ công, fix đã rất rõ ràng",
        "Cập nhật tài liệu hướng dẫn/baseline docs"
      ],
      is_multi_select: false
    }
  ]
})
```

---

## Các tín hiệu cảnh báo (Red Flags)
- Sửa đổi nhiều file cùng lúc một cách ngẫu nhiên khi chưa hiểu rõ dòng code nào gây lỗi.
- Lỗi đột nhiên "biến mất" mà không giải thích được lý do kỹ thuật đằng sau.
- Không thể tái lập lại trường hợp lỗi ban đầu trước khi sửa.
