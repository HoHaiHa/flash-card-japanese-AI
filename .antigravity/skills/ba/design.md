---
name: ba:design
description: >
  Phân tích hình ảnh thiết kế giao diện (UI Mockup, screenshot) thành tài liệu đặc tả cấu trúc màn hình.
  Trigger khi: gõ /ba:design hoặc nói "phân tích thiết kế", "đọc giao diện", "phân tích mockup", "đọc design".
---

# /ba:design
**Role**: Business Analyst / UI-UX Engineer  
**Mục đích**: Nhận diện hình ảnh design/mockup và tự động sinh ra mô tả màn hình chi tiết theo template `templates/baseline-screen.md` để làm tài liệu thiết kế (Screen Specification) cho Developer.

---

## Hướng dẫn thực hiện

### Bước 1 — Gate: Tiếp nhận ảnh thiết kế

```javascript
question({
  questions: [{
    question: "Bạn đã lưu ảnh thiết kế vào thư mục dự án chưa?",
    header: "Ảnh thiết kế",
    options: [
      { label: "Đã lưu", description: "Đã lưu ảnh và có đường dẫn cụ thể" },
      { label: "Chưa lưu", description: "Cần hướng dẫn lưu ảnh trước" }
    ]
  }]
})
```

*Nếu người dùng chọn "Chưa lưu"*: Hướng dẫn người dùng chụp ảnh màn hình thiết kế hoặc export từ Figma, lưu vào thư mục dự án (khuyến nghị: `docs/screens/assets/`) và cung cấp đường dẫn.

Nếu đã lưu, yêu cầu người dùng cung cấp **Đường dẫn tuyệt đối hoặc tương đối** đến file ảnh (ví dụ: `docs/screens/assets/login_page.png`).

---

### Bước 2 — Đọc và Phân tích Thiết kế (Vision analysis)

Sử dụng công cụ `view_file` để mở và đọc trực tiếp nội dung hình ảnh thiết kế. Tiến hành phân tích giao diện qua các khía cạnh:
- **Layout & Layout Structure**: Cách bố trí giao diện (Header, Sidebar, Main Content, Footer, lưới Grid, Flexbox).
- **UI Components**: Danh sách các nút bấm, icon, danh sách, bảng dữ liệu, tab điều hướng.
- **Form Fields (nếu có)**: Các ô nhập liệu, kiểu dữ liệu, các ràng buộc validation hiển thị trực tiếp (ví dụ: dấu sao đỏ yêu cầu nhập).
- **States**: Các trạng thái UI được thể hiện trên thiết kế (trạng thái Hover, Active, Disabled, Loading).
- **API Endpoints dự kiến**: Các endpoint cần kết nối dựa trên dữ liệu hiển thị trên màn hình.

Hiển thị báo cáo phân tích chi tiết cho người dùng xem trước.

---

### Bước 3 — Gate: Xác nhận thông tin phân tích

```javascript
question({
  questions: [{
    question: "Thông tin phân tích thiết kế ban đầu đã đúng chưa?",
    header: "Xác nhận",
    options: [
      { label: "Đã đúng", description: "Tiến hành sinh tài liệu đặc tả màn hình" },
      { label: "Cần chỉnh sửa", description: "Tôi muốn điều chỉnh lại thông tin phân tích" }
    ]
  }]
})
```

*Nếu chọn "Cần chỉnh sửa"*: Nhận phản hồi hiệu chỉnh từ người dùng và cập nhật lại thông tin phân tích ở Bước 2.

---

### Bước 4 — Soạn thảo tài liệu mô tả màn hình (Screen Spec)

Tải và điền thông tin chi tiết vào template `templates/baseline-screen.md` để tạo file mô tả màn hình mới tại:
`docs/screens/[tên-feature]/[tên-màn-hình].md`

Các thông tin cần điền:
- Route/URL dự kiến.
- Layout chi tiết & danh sách component.
- Business rules rút ra từ giao diện.
- Trạng thái UI (Loading, Empty, Success, Error).
- API calls dự kiến.

---

### Bước 5 — Gate: Hoàn thành

```javascript
question({
  questions: [{
    question: "Xác nhận tài liệu màn hình đã hoàn tất?",
    header: "Hoàn tất",
    options: [
      { label: "Hoàn tất", description: "Hoàn thành nhiệm vụ phân tích thiết kế" }
    ]
  }]
})
```
